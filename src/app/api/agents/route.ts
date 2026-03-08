import { NextRequest } from 'next/server'
import {
    runOrchestrator,
    runPlanner,
    runCodeGenerator,
    runPreviewGenerator,
    runRefactorAgent,
    runDebugAgent,
    type AgentRunnerOptions,
} from '@/lib/agents/runner'
import { parseFilesFromOutput, isRefactorRequest } from '@/lib/agent'

// Streaming helper: send a structured event to the client
function encodeEvent(type: string, payload: unknown): Uint8Array {
    const line = `data:${JSON.stringify({ type, payload })}\n`
    return new TextEncoder().encode(line)
}

export async function POST(req: NextRequest) {
    const {
        prompt,
        existingFiles = {},
        forceNew = false,
        provider = 'gemini', // 'gemini' | 'bytez' | 'kimi'
        history = [],
    } = await req.json()

    const opts: AgentRunnerOptions = {
        geminiKey: process.env.GEMINI_API_KEY?.trim(),
        bytezKey: process.env.BYTEZ_API_KEY?.trim(),
        kimiKey: process.env.KIMI_API_KEY?.trim(),
        groqKey: process.env.GROQ_API_KEY?.trim(),
        openaiKey: process.env.OPENAI_API_KEY?.trim(),
        preferredProvider: provider as any,
    }

    const hasExistingProject = Object.keys(existingFiles).length > 0
    const isRefactor = !forceNew && isRefactorRequest(prompt, hasExistingProject)

    const stream = new ReadableStream({
        async start(controller) {
            const send = (type: string, payload: unknown) => {
                controller.enqueue(encodeEvent(type, payload))
            }

            try {
                // ── REFACTOR MODE ─────────────────────────────────────────
                if (isRefactor) {
                    send('phase', { agent: 'refactor', label: '🔍 Analyzing what to change...' })

                    const lower = prompt.toLowerCase()

                    // Smart file selection: keyword → file path patterns
                    const keywordToPattern: Array<{ keywords: string[], patterns: string[] }> = [
                        { keywords: ['hero', 'banner', 'headline', 'title'], patterns: ['Hero', 'hero', 'Banner'] },
                        { keywords: ['nav', 'navbar', 'header', 'menu', 'navigation'], patterns: ['Nav', 'nav', 'Header', 'header'] },
                        { keywords: ['footer'], patterns: ['Footer', 'footer'] },
                        { keywords: ['feature', 'features', 'benefit', 'card'], patterns: ['Feature', 'feature', 'Card', 'card'] },
                        { keywords: ['pricing', 'price', 'plan', 'tier'], patterns: ['Pricing', 'pricing', 'Plan'] },
                        { keywords: ['testimonial', 'review', 'social proof'], patterns: ['Testimonial', 'testimonial', 'Review'] },
                        { keywords: ['cta', 'call to action', 'button', 'sign up'], patterns: ['CTA', 'cta', 'Button', 'button'] },
                        { keywords: ['faq', 'frequently asked', 'accordion'], patterns: ['FAQ', 'faq', 'Accordion'] },
                        { keywords: ['color', 'colour', 'theme', 'dark', 'light', 'style', 'font', 'design'], patterns: ['globals.css', 'tailwind', 'theme', 'styles'] },
                        { keywords: ['page', 'layout', 'main', 'overall', 'entire', 'all', 'whole'], patterns: ['page.tsx', 'layout.tsx', 'index.tsx'] },
                    ]

                    // Find matching file paths
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

                    // Always include the preview HTML for visual updates
                    if (existingFiles['public/preview.html']) {
                        matchedPaths.add('public/preview.html')
                    }

                    // If nothing matched, fall back to the main page and preview
                    if (matchedPaths.size === 0 || (matchedPaths.size === 1 && matchedPaths.has('public/preview.html'))) {
                        const fallbacks = ['src/app/page.tsx', 'src/app/(tabs)/index.tsx', 'index.html', 'App.tsx']
                        for (const fb of fallbacks) {
                            if (existingFiles[fb]) {
                                matchedPaths.add(fb)
                                break
                            }
                        }
                        if (existingFiles['public/preview.html']) matchedPaths.add('public/preview.html')
                    }

                    const targets = Array.from(matchedPaths)
                    const updatedFiles: Record<string, string> = { ...existingFiles }

                    for (const filePath of targets) {
                        send('phase', { agent: 'refactor', label: `✏️ Editing ${filePath}...`, file: filePath })
                        try {
                            const updated = await runRefactorAgent(
                                filePath,
                                existingFiles[filePath] || '',
                                prompt,
                                opts
                            )
                            updatedFiles[filePath] = updated
                            send('file', { path: filePath, content: updated })
                        } catch (err: any) {
                            send('error', { file: filePath, message: err.message })
                        }
                    }

                    send('phase', { agent: 'refactor', label: `✅ Edit complete — updated ${targets.length} file(s)`, done: true })

                    // Rebuild merged raw code
                    const mergedRaw = Object.entries(updatedFiles)
                        .map(([p, c]) => `<file path="${p}">\n${c}\n</file>`)
                        .join('\n\n')

                    send('complete', {
                        files: updatedFiles,
                        rawCode: mergedRaw,
                        fileCount: Object.keys(updatedFiles).length,
                        modifiedCount: targets.length,
                        mode: 'refactor',
                    })
                    controller.close()
                    return
                }

                // ══ FULL GENERATION MODE ══════════════════════════════════

                // ── AGENT 1: ORCHESTRATOR ─────────────────────────────────
                send('phase', { agent: 'orchestrator', label: '🧠 Orchestrator analyzing your request...' })
                send('thought', { agent: 'orchestrator', message: 'Analyzing project scope and selecting optimal design system...' })

                const orchestratorPlan = await runOrchestrator(prompt, opts)

                send('thought', { agent: 'orchestrator', message: `Determined project type: ${orchestratorPlan.project_type}. Planning ${orchestratorPlan.file_plan.length} files.` })
                send('plan', orchestratorPlan)
                send('phase', {
                    agent: 'orchestrator',
                    label: `✅ Plan ready: ${orchestratorPlan.project_type} with ${orchestratorPlan.file_plan.length} files`,
                    done: true,
                })

                // ── AGENT 2: PLANNER ──────────────────────────────────────
                send('phase', { agent: 'planner', label: '📐 Planner designing architecture...' })
                send('thought', { agent: 'planner', message: 'Mapping file dependencies and defining visual design tokens...' })

                const plannerOutput = await runPlanner(orchestratorPlan, prompt, opts)

                send('thought', { agent: 'planner', message: `Architecture validated. Design style set to: ${plannerOutput.design_tokens.style}.` })
                send('architecture', plannerOutput)
                send('phase', {
                    agent: 'planner',
                    label: `✅ Architecture ready: ${plannerOutput.architecture.length} files mapped`,
                    done: true,
                })

                // ── AGENT 3: CODE GENERATOR (file by file) ────────────────
                const generatedFiles: Record<string, string> = {}
                const filesToGenerate = plannerOutput.architecture.filter(
                    f => f.path !== 'public/preview.html'
                )

                send('phase', {
                    agent: 'coder',
                    label: `⚙️ Code Generator writing ${filesToGenerate.length} files...`,
                    total: filesToGenerate.length,
                })

                for (let i = 0; i < filesToGenerate.length; i++) {
                    const fileSpec = filesToGenerate[i]
                    send('phase', {
                        agent: 'coder',
                        label: `Writing ${fileSpec.path}...`,
                        file: fileSpec.path,
                        index: i + 1,
                        total: filesToGenerate.length,
                    })

                    send('thought', {
                        agent: 'coder',
                        message: `Implementing component: ${fileSpec.path.split('/').pop()}. Applying Figma-grade styling...`,
                        file: fileSpec.path
                    })

                    try {
                        // Dynamic throttling: Kimi is fast (1s), Gemini needs safety (7s on free tier)
                        // If it's a refactor, we can be faster
                        const delay = opts.kimiKey ? 800 : (opts.geminiKey ? 7500 : 2000)
                        if (i > 0) {
                            await new Promise(r => setTimeout(r, delay))
                        }

                        const fileContent = await runCodeGenerator(
                            fileSpec.path,
                            fileSpec.purpose,
                            plannerOutput,
                            orchestratorPlan,
                            prompt,
                            opts
                        )
                        generatedFiles[fileSpec.path] = fileContent
                        send('file', { path: fileSpec.path, content: fileContent, index: i + 1, total: filesToGenerate.length })
                    } catch (err: any) {
                        // If it's a persistent rate limit error, we must ABORT the build
                        if (err.message?.includes('429')) {
                            throw new Error(`CRITICAL: AI Quota Exceeded. Please try again in 1 minute.`)
                        }

                        send('error', { file: fileSpec.path, message: err.message })
                        generatedFiles[fileSpec.path] = `// Error generating ${fileSpec.path}: ${err.message}`
                    }
                }

                // ── PREVIEW GENERATOR ─────────────────────────────────────
                send('phase', { agent: 'preview', label: '🎨 Generating live preview...' })
                send('thought', { agent: 'preview', message: 'Synthesizing all components into a standalone high-fidelity preview...' })

                try {
                    const previewHtml = await runPreviewGenerator(plannerOutput, orchestratorPlan, prompt, opts)
                    generatedFiles['public/preview.html'] = previewHtml
                    send('file', { path: 'public/preview.html', content: previewHtml })
                    send('phase', { agent: 'preview', label: '✅ Preview ready', done: true })
                } catch (err: any) {
                    send('error', { file: 'public/preview.html', message: err.message })
                }

                // ── COMPLETE ──────────────────────────────────────────────
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
                send('fatal', { message: err.message || 'Multi-agent pipeline failed' })
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
