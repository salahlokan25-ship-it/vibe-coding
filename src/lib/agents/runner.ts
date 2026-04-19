/**
 * VibeCoder Agent Runner
 * Calls each agent sequentially using any AI model (Gemini, ByteZ, Kimi)
 */

import {
    ORCHESTRATOR_PROMPT,
    PLANNER_PROMPT,
    CODE_GENERATOR_PROMPT,
    REFACTOR_PROMPT,
    DEBUG_PROMPT,
    PREVIEW_GENERATOR_PROMPT,
    specialistContextToPromptString,
} from './prompts'
import fs from 'fs'
import { PromptEnhancer } from './enhancer'
import { IMAGE_INJECTION_PROMPT } from '../imagePromptInjector'
export * from './types'
import {
    AgentRunnerOptions,
    OrchestratorPlan,
    PlannerOutput,
    SpecialistContext
} from './types'

// ─────────────────────────────────────────────────────────────────
//  AI Provider Logic
// ─────────────────────────────────────────────────────────────────
// Types have been moved to src/lib/agents/types.ts

// ─────────────────────────────────────────────────────────────────
//  Core: Call any OpenAI-compatible or Gemini endpoint
// ─────────────────────────────────────────────────────────────────
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Hardcoded Gemini API key
const GEMINI_API_KEY = 'AIzaSyAnAk6aqecsPNjoYrzTjZuWGknLZJDTUbY'

export async function callLLM(
    systemPrompt: string,
    userMessage: string,
    opts?: AgentRunnerOptions
): Promise<string> {
    const geminiKey = opts?.geminiKey?.trim() || GEMINI_API_KEY
    
    try {
        console.log(`[AI] → gemini`)
        fs.appendFileSync('src/lib/agents/ai_debug.log', `[${new Date().toISOString()}] [AI] Calling gemini\n`)
        const result = await callGemini(geminiKey, systemPrompt, userMessage)
        fs.appendFileSync('src/lib/agents/ai_debug.log', `[${new Date().toISOString()}] [AI] gemini ✓ success\n`)
        return result
    } catch (err: any) {
        fs.appendFileSync('src/lib/agents/ai_debug.log', `[${new Date().toISOString()}] [AI ✗] gemini: ${err.message?.slice(0, 120)}\n`)
        console.warn(`[AI ✗] gemini: ${err.message?.slice(0, 80)}`)
        throw new Error(`Gemini API failed: ${err.message?.slice(0, 200)}`)
    }
}

async function callOpenAICompatible(
    baseUrl: string,
    model: string,
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    maxTokens: number = 8192
): Promise<string> {
    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: false,
            temperature: 0.1,
            max_tokens: maxTokens,
        }),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(`${model} failed: ${err.message || res.statusText}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
}

async function callGemini(
    apiKey: string,
    systemPrompt: string,
    userMessage: string
): Promise<string> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)

    // gemini-2.0-flash: faster, higher free quota, better code quality
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
        generationConfig: { maxOutputTokens: 8192, temperature: 0.1 }
    })

    const result = await model.generateContent(userMessage)
    return result.response.text()
}

// ─────────────────────────────────────────────────────────────────
//  AGENT 1: Orchestrator
// ─────────────────────────────────────────────────────────────────
export async function runOrchestrator(
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<OrchestratorPlan> {
    // Upgrade user prompt with Premium Design & Layout Rules
    const enhancedPrompt = await PromptEnhancer.enhance(userPrompt)

    const raw = await callLLM(
        ORCHESTRATOR_PROMPT,
        `User request: "${enhancedPrompt}"`,
        opts
    )

    // Extract JSON from response - more robustly
    const cleanRaw = raw.replace(/```json\n?|```\n?/gi, '').trim()
    const jsonMatch = cleanRaw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        console.error('Orchestrator invalid response:', raw)
        throw new Error('Orchestrator returned invalid JSON format')
    }

    try {
        const plan = JSON.parse(jsonMatch[0]) as OrchestratorPlan
        console.log(`[AI Orchestrator] Plan generated: ${plan.project_type} with ${plan.file_plan?.length} files.`)
        return plan
    } catch {
        throw new Error('Orchestrator JSON parse failed: ' + raw.substring(0, 200))
    }
}

// ─────────────────────────────────────────────────────────────────
//  AGENT 2: Planner
// ─────────────────────────────────────────────────────────────────
export async function runPlanner(
    plan: OrchestratorPlan,
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<PlannerOutput> {
    const input = `
Project Plan:
${JSON.stringify(plan, null, 2)}

User's Original Request:
"${userPrompt}"
`.trim()

    const raw = await callLLM(PLANNER_PROMPT, input, opts)
    const cleanRaw = raw.replace(/```json\n?|```\n?/gi, '').trim()
    const jsonMatch = cleanRaw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Planner returned invalid JSON')

    try {
        return JSON.parse(jsonMatch[0]) as PlannerOutput
    } catch {
        // Return a sensible default if parse fails
        return {
            architecture: plan.file_plan.map(path => ({
                path,
                purpose: `Auto-generated file for ${path}`,
                exports: [],
                imports: [],
            })),
            dependencies: {
                production: ['next', 'react', 'react-dom', 'tailwind-merge', 'clsx', 'lucide-react'],
                devDependencies: ['typescript', 'tailwindcss', '@types/react', '@types/node'],
            },
            design_tokens: {
                primary_color: '#6366f1',
                background: '#020617',
                accent_gradient: 'from-indigo-500 to-purple-500',
                style: 'glassmorphism dark',
                font: 'Inter',
            },
        }
    }
}

function extractCode(raw: string): string {
    const startIdx = raw.indexOf('```')
    if (startIdx === -1) return raw.trim()

    const endIdx = raw.lastIndexOf('```')
    if (endIdx > startIdx) {
        let code = raw.substring(startIdx, endIdx)
        // Remove the language identifier (e.g. ```tsx)
        code = code.replace(/^```[a-zA-Z]*\n?/, '')
        return code.trim()
    }
    return raw.trim()
}

// ─────────────────────────────────────────────────────────────────
//  AGENT 3: Code Generator (streaming, file by file)
// ─────────────────────────────────────────────────────────────────
export async function runCodeGenerator(
    filePath: string,
    filePurpose: string,
    plannerOutput: PlannerOutput,
    orchestratorPlan: OrchestratorPlan,
    userPrompt: string,
    opts: AgentRunnerOptions,
    specialistCtx: SpecialistContext | null = null
): Promise<string> {
    const specialistIntelligence = specialistCtx ? specialistContextToPromptString(specialistCtx) : ''

    const input = `
FILE TO GENERATE:
Path: ${filePath}
Purpose: ${filePurpose}

PROJECT CONTEXT:
${JSON.stringify(orchestratorPlan, null, 2)}

DESIGN TOKENS:
${JSON.stringify(plannerOutput.design_tokens, null, 2)}

FULL ARCHITECTURE (for import context):
${plannerOutput.architecture.map(f => `- ${f.path}: ${f.purpose}`).join('\n')}

USER'S ORIGINAL REQUEST:
"${userPrompt}"

${specialistIntelligence}

Generate ONLY the complete content for: ${filePath}
`.trim()

    const systemPrompt = CODE_GENERATOR_PROMPT + '\n' + IMAGE_INJECTION_PROMPT
    const raw = await callLLM(systemPrompt, input, opts)
    return extractCode(raw)
}

// ─────────────────────────────────────────────────────────────────
//  AGENT 4: Refactor Agent
// ─────────────────────────────────────────────────────────────────
export async function runRefactorAgent(
    filePath: string,
    currentContent: string,
    modification: string,
    opts: AgentRunnerOptions,
    history: Array<{ role: string; content: string }> = []
): Promise<string> {
    // Build a concise chat history context (last 6 messages)
    const recentHistory = history.slice(-6)
    const historyCtx = recentHistory.length > 0
        ? `\n\nCONVERSATION HISTORY (for context — respect previous decisions):\n${recentHistory.map(m => `[${m.role.toUpperCase()}]: ${m.content.slice(0, 300)}`).join('\n')}\n`
        : ''

    const input = `
FILE PATH: ${filePath}

CURRENT FILE CONTENT:
${currentContent}
${historyCtx}
MODIFICATION INSTRUCTION:
"${modification}"
`.trim()

    const raw = await callLLM(REFACTOR_PROMPT, input, opts)
    return extractCode(raw)
}


// ─────────────────────────────────────────────────────────────────
//  AGENT 5: Debug Agent
// ─────────────────────────────────────────────────────────────────
export async function runDebugAgent(
    filePath: string,
    fileContent: string,
    errorLog: string,
    opts: AgentRunnerOptions
): Promise<string> {
    const input = `
FILE PATH: ${filePath}

ERROR LOG:
${errorLog}

FILE CONTENT:
${fileContent}
`.trim()

    const raw = await callLLM(DEBUG_PROMPT, input, opts)
    return extractCode(raw)
}

// ─────────────────────────────────────────────────────────────────
//  Preview Generator
// ─────────────────────────────────────────────────────────────────
export async function runPreviewGenerator(
    plannerOutput: PlannerOutput,
    orchestratorPlan: OrchestratorPlan,
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<string> {
    const input = `
PROJECT DESCRIPTION: "${userPrompt}"
TYPE: ${orchestratorPlan.project_type}
FEATURES: ${orchestratorPlan.features.join(', ')}
DESIGN: ${JSON.stringify(plannerOutput.design_tokens)}
ARCHITECTURE SUMMARY:
${plannerOutput.architecture.slice(0, 15).map(f => `- ${f.path}: ${f.purpose}`).join('\n')}

Generate the complete public/preview.html file.
`.trim()

    const raw = await callLLM(PREVIEW_GENERATOR_PROMPT, input, opts)
    return extractCode(raw)
}
