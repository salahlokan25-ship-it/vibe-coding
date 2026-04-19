import { NextRequest } from 'next/server'
import {
    runOrchestrator,
    runPlanner,
    runCodeGenerator,
    runPreviewGenerator,
    runRefactorAgent,
    type AgentRunnerOptions,
} from '@/lib/agents/runner'
import {
    runIntentAnalyst,
    runDesignSystemEngineer,
    runCopywriter,
    runSeoStrategist,
} from '@/lib/agents/specialist-runner'
import { specialistContextToPromptString } from '@/lib/agents/prompts'
import { parseFilesFromOutput, isRefactorRequest } from '@/lib/agent'

// Streaming helper: send a structured event to the client
function encodeEvent(type: string, payload: unknown): Uint8Array {
    const line = `data:${JSON.stringify({ type, payload })}\n`
    return new TextEncoder().encode(line)
}

// Timeout wrapper — kills any AI call that takes longer than `ms`
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        promise.then(
            (val) => { clearTimeout(timer); resolve(val) },
            (err) => { clearTimeout(timer); reject(err) }
        )
    })
}

export async function POST(req: NextRequest) {
    const {
        prompt,
        existingFiles = {},
        forceNew = false,
        provider = 'gemini',
        history = [],
        imageContext = null,
    } = await req.json()

    const opts: AgentRunnerOptions = {}

    const hasExistingProject = Object.keys(existingFiles).length > 0
    const isRefactor = !forceNew && isRefactorRequest(prompt, hasExistingProject)

    // ── TIMEOUT & BATCH CONFIG ─────────────────────────────────────
    const AI_TIMEOUT = 120000  // 2 min per AI call (Kimi needs ~60-90s)
    const BATCH_SIZE = 1       // Sequential — prevents rate-limit hammering on free tiers

    const stream = new ReadableStream({
        async start(controller) {
            const send = (type: string, payload: unknown) => {
                try { controller.enqueue(encodeEvent(type, payload)) } catch { }
            }

            try {
                // ── REFACTOR MODE ─────────────────────────────────────────
                if (isRefactor) {
                    send('phase', { agent: 'refactor', label: '🔍 Analyzing what to change...' })

                    const lower = prompt.toLowerCase()
                    const keywordToPattern: Array<{ keywords: string[], patterns: string[] }> = [
                        { keywords: ['hero', 'banner', 'headline', 'title'], patterns: ['Hero', 'hero', 'Banner'] },
                        { keywords: ['nav', 'navbar', 'header', 'menu', 'navigation'], patterns: ['Nav', 'nav', 'Header', 'header'] },
                        { keywords: ['footer'], patterns: ['Footer', 'footer'] },
                        { keywords: ['feature', 'features', 'benefit', 'card'], patterns: ['Feature', 'feature', 'Card', 'card'] },
                        { keywords: ['pricing', 'price', 'plan', 'tier'], patterns: ['Pricing', 'pricing', 'Plan'] },
                        { keywords: ['testimonial', 'review', 'social proof'], patterns: ['Testimonial', 'testimonial', 'Review'] },
                        { keywords: ['cta', 'call to action', 'button', 'sign up'], patterns: ['CTA', 'cta', 'Button', 'button'] },
                        { keywords: ['color', 'colour', 'theme', 'dark', 'light', 'style', 'font', 'design'], patterns: ['globals.css', 'tailwind', 'theme', 'styles'] },
                        { keywords: ['page', 'layout', 'main', 'overall', 'entire', 'all', 'whole'], patterns: ['page.tsx', 'layout.tsx', 'index.tsx'] },
                    ]

                    const matchedPaths = new Set<string>()
                    const allExistingPaths = Object.keys(existingFiles)

                    for (const { keywords, patterns } of keywordToPattern) {
                        if (keywords.some(kw => lower.includes(kw))) {
                            for (const existingPath of allExistingPaths) {
                                if (patterns.some(p => existingPath.includes(p))) {
                                    matchedPaths.add(existingPath)
                                }
                            }
                        }
                    }

                    if (existingFiles['public/preview.html']) matchedPaths.add('public/preview.html')

                    if (matchedPaths.size === 0 || (matchedPaths.size === 1 && matchedPaths.has('public/preview.html'))) {
                        const fallbacks = ['src/app/page.tsx', 'src/app/(tabs)/index.tsx', 'index.html', 'App.tsx']
                        for (const fb of fallbacks) {
                            if (existingFiles[fb]) { matchedPaths.add(fb); break }
                        }
                        if (existingFiles['public/preview.html']) matchedPaths.add('public/preview.html')
                    }

                    const targets = Array.from(matchedPaths)
                    const updatedFiles: Record<string, string> = { ...existingFiles }

                    for (const filePath of targets) {
                        send('phase', { agent: 'refactor', label: `✏️ Editing ${filePath}...`, file: filePath })
                        try {
                            const updated = await withTimeout(
                                runRefactorAgent(filePath, existingFiles[filePath] || '', prompt, opts, history),
                                AI_TIMEOUT,
                                `Refactor ${filePath}`
                            )
                            updatedFiles[filePath] = updated
                            send('file', { path: filePath, content: updated })
                        } catch (err: any) {
                            send('error', { file: filePath, message: err.message })
                        }
                    }

                    send('phase', { agent: 'refactor', label: `✅ Edit complete — updated ${targets.length} file(s)`, done: true })

                    const mergedRaw = Object.entries(updatedFiles)
                        .map(([p, c]) => `<file path="${p}">\n${c}\n</file>`)
                        .join('\n\n')

                    send('complete', { files: updatedFiles, rawCode: mergedRaw, fileCount: Object.keys(updatedFiles).length, modifiedCount: targets.length, mode: 'refactor' })
                    controller.close()
                    return
                }

                // ══ FULL GENERATION MODE ══════════════════════════════════

                // ── STEP 1: FAST SPECIALIST PRE-PASS (3 agents max, 25s timeout each) ──
                send('phase', { agent: 'orchestrator', label: '🧠 Analyzing intent & designing brand...' })

                let specialistBoost = ''
                let globalIntent: any = null

                try {
                    // Agent 6: Intent Analyst
                    const intent = await withTimeout(
                        runIntentAnalyst(prompt, opts),
                        10000,
                        'Intent Analyst'
                    ).catch(err => {
                        console.warn('[Specialist] Intent Analyst skipped:', err.message)
                        return { core_goal: prompt, niche: 'Professional Service', ideal_user: 'General audience', emotional_hook: 'Trust', tone: 'Professional', conversion_goal: 'Contact', key_differentiators: ['Fast', 'Premium'], content_pillars: ['Value'], Suggested_sections: [] } as any
                    })
                    globalIntent = intent

                    // Agent 7: Design System (optional — skip if slow)
                    const designSystem = await withTimeout(
                        runDesignSystemEngineer(intent, prompt, opts),
                        10000,
                        'Design System'
                    ).catch(() => null)

                    // Agent 8: Copywriter (optional — skip if slow)
                    const copy = await withTimeout(
                        runCopywriter(intent, prompt, opts),
                        10000,
                        'Copywriter'
                    ).catch(() => null)

                    // Build a lightweight specialist context
                    const lightCtxTemplate = {
                        intent,
                        designSystem: designSystem || {},
                        copy: copy || {},
                        contentStrategy: {},
                        animationPlan: {},
                        featureArchitecture: {},
                        contextualData: {},
                        userJourney: {},
                        marketing: {},
                        layout: {},
                        motion: {},
                        spatial: {},
                        visualPolish: {},
                    }
                    specialistBoost = specialistContextToPromptString(lightCtxTemplate as any)
                    send('phase', { agent: 'orchestrator', label: '✅ Intelligence package complete', done: true })
                } catch (err: any) {
                    console.warn('[Specialist] Pre-pass critical fail:', err.message)
                    send('phase', { agent: 'orchestrator', label: '⚠️ Intelligence skipped', done: true })
                }

                let enrichedPrompt = prompt
                if (specialistBoost) {
                    // Truncate boost if it's exceptionally large to avoid payload issues
                    const safeBoost = specialistBoost.length > 4000
                        ? specialistBoost.substring(0, 4000) + '... (truncated for context)'
                        : specialistBoost
                    enrichedPrompt = `${prompt}\n\n${safeBoost}`
                }

                // ── STEP 2: ORCHESTRATOR (with timeout) ──────────────────
                send('phase', { agent: 'orchestrator', label: '🧠 Planning project structure...' })

                const orchestratorPlan = await withTimeout(
                    runOrchestrator(enrichedPrompt, opts),
                    AI_TIMEOUT,
                    'Orchestrator'
                )

                send('plan', orchestratorPlan)
                send('phase', {
                    agent: 'orchestrator',
                    label: `✅ Plan: ${orchestratorPlan.project_type} with ${orchestratorPlan.file_plan.length} files`,
                    done: true,
                })

                // ── STEP 3: PLANNER (with timeout) ───────────────────────
                send('phase', { agent: 'planner', label: '📐 Designing architecture...' })

                const plannerOutput = await withTimeout(
                    runPlanner(orchestratorPlan, enrichedPrompt, opts),
                    AI_TIMEOUT,
                    'Planner'
                )

                send('phase', {
                    agent: 'planner',
                    label: `✅ Architecture: ${plannerOutput.architecture.length} files mapped`,
                    done: true,
                })

                // ── STEP 4: CODE GENERATION (batched parallel + preview) ─
                const generatedFiles: Record<string, string> = {}
                let filesToGenerate = plannerOutput.architecture.filter(
                    (f: any) => f.path !== 'public/preview.html'
                )

                // Fallback: If planner returned nothing, use orchestrator's file plan
                if (filesToGenerate.length === 0 && orchestratorPlan.file_plan.length > 0) {
                    filesToGenerate = orchestratorPlan.file_plan
                        .filter(p => p !== 'public/preview.html')
                        .map(path => ({ path, purpose: 'Component' } as any))
                }

                const totalFiles = Math.max(1, filesToGenerate.length)

                send('phase', {
                    agent: 'coder',
                    label: `⚙️ Generating ${totalFiles} files...`,
                    total: totalFiles,
                })

                console.log(`[AI Orchestrator] Starting generation of ${totalFiles} files in batches of ${BATCH_SIZE}`)

                // Start preview generation in background (non-blocking)
                const previewPromise = withTimeout(
                    runPreviewGenerator(plannerOutput, orchestratorPlan, enrichedPrompt, opts),
                    AI_TIMEOUT,
                    'Preview Generator'
                ).catch(() => '')

                // Generate code files in batches
                for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
                    const batch = filesToGenerate.slice(i, i + BATCH_SIZE)
                    const batchPromises = batch.map(async (fileSpec: any, batchIdx: number) => {
                        const fileIndex = i + batchIdx + 1

                        send('phase', {
                            agent: 'coder',
                            label: `Synthesizing ${fileSpec.path.split('/').pop()}...`,
                            file: fileSpec.path,
                            index: fileIndex,
                            total: totalFiles,
                        })

                        try {
                            const fileContent = await withTimeout(
                                runCodeGenerator(fileSpec.path, fileSpec.purpose, plannerOutput, orchestratorPlan, enrichedPrompt, opts, null),
                                AI_TIMEOUT,
                                `Code: ${fileSpec.path}`
                            )

                            generatedFiles[fileSpec.path] = fileContent
                            send('file', { path: fileSpec.path, content: fileContent, index: fileIndex, total: totalFiles })
                        } catch (err: any) {
                            console.error(`[Coder] Failed ${fileSpec.path}:`, err.message)
                            send('error', { file: fileSpec.path, message: err.message })
                            generatedFiles[fileSpec.path] = `// Error: ${err.message}`
                        }
                    })

                    await Promise.all(batchPromises)

                    // Minimal throttle between batches
                    if (i + BATCH_SIZE < totalFiles) {
                        await new Promise(r => setTimeout(r, 200))
                    }
                }

                send('phase', { agent: 'coder', label: `✅ All ${totalFiles} files generated`, done: true })

                // ── STEP 5: RESOLVE PREVIEW ──────────────────────────────
                const previewHtml = await previewPromise

                if (previewHtml) {
                    generatedFiles['public/preview.html'] = previewHtml
                    send('file', { path: 'public/preview.html', content: previewHtml })
                    send('phase', { agent: 'preview', label: '✅ Live preview ready', done: true })
                }

                // ── COMPLETE ─────────────────────────────────────────────
                const mergedRaw = Object.entries(generatedFiles)
                    .map(([p, c]) => `<file path="${p}">\n${c}\n</file>`)
                    .join('\n\n')

                send('complete', {
                    files: generatedFiles,
                    rawCode: mergedRaw,
                    fileCount: Object.keys(generatedFiles).length,
                    plan: orchestratorPlan,
                    mode: 'generate',
                })
                controller.close()

            } catch (err: any) {
                send('fatal', { message: err.message || 'Pipeline failed' })
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
