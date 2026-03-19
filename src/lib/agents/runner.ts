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

export async function callLLM(
    systemPrompt: string,
    userMessage: string,
    opts: AgentRunnerOptions
): Promise<string> {
    const providers = []

    // 1. Gemini (Primary - High Reasoning & Multi-modal)
    if (opts.geminiKey) {
        providers.push({
            name: 'gemini',
            call: () => callGemini(opts.geminiKey!, systemPrompt, userMessage)
        })
    }

    // 2. DeepSeek via ByteZ (Elite Intelligence)
    if (opts.bytezKey) {
        providers.push({
            name: 'bytez',
            call: () => callOpenAICompatible(
                'https://api.bytez.com/v1',
                'deepseek-ai/DeepSeek-V3',
                opts.bytezKey!,
                systemPrompt,
                userMessage,
                16384 // DeepSeek handles large files well
            )
        })
    }

    // 3. Groq (Fast & Smart - Llama 3.3 70B)
    if (opts.groqKey) {
        providers.push({
            name: 'groq',
            call: () => callOpenAICompatible(
                'https://api.groq.com/openai/v1',
                'llama-3.3-70b-versatile',
                opts.groqKey!,
                systemPrompt,
                userMessage,
                16384
            )
        })
    }

    // 4. Kimi (Prioritized - High RPM Fallback)
    if (opts.kimiKey) {
        providers.push({
            name: 'kimi',
            call: () => callOpenAICompatible(
                'https://integrate.api.nvidia.com/v1',
                'moonshotai/kimi-k2-instruct',
                opts.kimiKey!,
                systemPrompt,
                userMessage
            )
        })
    }

    if (providers.length === 0) {
        throw new Error('No AI providers configured. Please check your .env.local keys.')
    }

    // Chain of Responsibility: Try each provider until one works
    let lastError = null
    for (const provider of providers) {
        try {
            console.log(`[AI Orchestrator] Using provider: ${provider.name}`)
            const result = await provider.call()

            // Validate that we didn't just get an error string disguised as content
            if (result.toLowerCase().includes('quota exceeded') || result.toLowerCase().includes('too many requests')) {
                throw new Error(`429: ${provider.name} rate limit detected in response text`)
            }

            return result
        } catch (err: any) {
            lastError = err
            const errMsg = err.message?.toLowerCase() || ''
            const isRateLimit = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('limit') || errMsg.includes('too many') || errMsg.includes('401')

            if (isRateLimit) {
                console.warn(`[AI Orchestrator] Provider ${provider.name} rate limited. Falling back...`)
                continue
            }
            // If it's a fatal error (not rate limit), we might want to fail fast or continue
            console.error(`[AI Orchestrator] Provider ${provider.name} failed:`, err.message)
        }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`)
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
    userMessage: string,
    retryCount = 0
): Promise<string> {
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)

        // Use 1.5-flash as it has much higher reasoning for premium code generation
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: systemPrompt,
        })

        const result = await model.generateContent(userMessage)
        return result.response.text()
    } catch (err: any) {
        // Handle Rate Limit (429) specifically
        // Free Tier: 5 RPM (Requests Per Minute). We need to wait for a window reset.
        if (err.message?.includes('429') && retryCount < 5) {
            const waitTime = (retryCount + 1) * 20000 + Math.random() * 5000
            console.log(`[Rate Limit] 429 detected. Quota exhausted. Waiting for window reset (${Math.round(waitTime / 1000)}s)... (Attempt ${retryCount + 1}/5)`)
            await sleep(waitTime)
            return callGemini(apiKey, systemPrompt, userMessage, retryCount + 1)
        }

        throw err
    }
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
        return JSON.parse(jsonMatch[0]) as OrchestratorPlan
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
    return callLLM(systemPrompt, input, opts)
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

    return callLLM(REFACTOR_PROMPT, input, opts)
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

    return callLLM(DEBUG_PROMPT, input, opts)
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

    return callLLM(PREVIEW_GENERATOR_PROMPT, input, opts)
}
