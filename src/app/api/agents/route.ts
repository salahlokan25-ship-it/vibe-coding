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
    runSpecialistPrePassParallel,
    runCodeReviewer,
    runAccessibilityAuditor,
    runSeoStrategist,
} from '@/lib/agents/specialist-runner'
import { specialistContextToPromptString } from '@/lib/agents/prompts'
import { parseFilesFromOutput, isRefactorRequest } from '@/lib/agent'

// ─── Silently fetch the Stitch AI Design Blueprint ───────────────────────────
// This is the "Google Stitch" step: think through design BEFORE writing any code.
// Runs invisibly in background — user only sees the final preview.
async function fetchDesignBlueprint(prompt: string, baseUrl: string): Promise<Record<string, any> | null> {
    try {
        const res = await fetch(`${baseUrl}/api/stitch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        })
        if (!res.ok) return null
        const { blueprint } = await res.json()
        return blueprint || null
    } catch {
        return null  // Never block generation if Stitch fails
    }
}

// ─── Discovery Agent: Search for components & animations ────────────────────
async function fetchDiscoveryInspiration(query: string, type: 'images' | 'components' | 'spline', baseUrl: string): Promise<any> {
    try {
        const res = await fetch(`${baseUrl}/api/web-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, type }),
        })
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}


// Serialize blueprint into a concise context string for injection into prompts
function blueprintToContext(bp: Record<string, any>): string {
    if (!bp) return ''
    return `
=== AI DESIGN BLUEPRINT (FOLLOW STRICTLY) ===
PRODUCT: ${bp.product?.name} — "${bp.product?.tagline}"
AUDIENCE: ${bp.product?.audience}
VISUAL STYLE: ${bp.visual_language?.style} | Personality: ${bp.visual_language?.personality}
INSPIRATION: ${bp.visual_language?.inspiration}

COLOR SYSTEM:
  Background: ${bp.color_system?.background}
  Surface/Card: ${bp.color_system?.surface}
  Border: ${bp.color_system?.border}
  Primary: ${bp.color_system?.primary} | Glow: ${bp.color_system?.primary_glow}
  Secondary: ${bp.color_system?.secondary}
  Hero Gradient: ${bp.color_system?.gradient_hero}

TYPOGRAPHY:
  Display Font: ${bp.typography?.display_font} (${bp.typography?.headline_weight})
  Hero Size: ${bp.typography?.headline_size_hero} | Section Size: ${bp.typography?.headline_size_section}

HERO SECTION:
  Pattern: ${bp.layout?.hero_pattern}
  Description: ${bp.layout?.hero_description}
  Hero Image: ${bp.imagery?.hero_image_url}
  Headline: "${bp.copy_examples?.hero_headline}"
  Subheadline: "${bp.copy_examples?.hero_subheadline}"
  CTA: "${bp.copy_examples?.cta_text}"

KEY IMAGERY:
  Hero: ${bp.imagery?.hero_image_url}
  Features: ${bp.imagery?.feature_image_urls?.join(', ')}
  Avatars: ${bp.imagery?.avatar_urls?.join(', ')}
  Image Treatment: ${bp.imagery?.image_treatment}

ANIMATIONS:
  Entry: ${bp.animations?.entry}
  Hover: ${bp.animations?.hover}
  CTA: ${bp.animations?.cta_pulse}

STATS EXAMPLES: ${JSON.stringify(bp.copy_examples?.stats)}
=== END DESIGN BLUEPRINT ===`
}

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
                                opts,
                                history  // 👈 Pass conversation memory
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

                // ── STITCH: SILENT DESIGN THINKING PHASE ─────────────────
                // Runs entirely in background. User sees "Architecting Vision" spinner.
                // We infer the base URL from the request for internal API routing.
                send('thought', { agent: 'orchestrator', message: 'Activating Design Intelligence Core...' })
                const host = req.headers.get('host') || 'localhost:3000'
                const proto = host.includes('localhost') ? 'http' : 'https'
                const stitchBlueprint = await fetchDesignBlueprint(prompt, `${proto}://${host}`)
                const designContext = stitchBlueprint ? blueprintToContext(stitchBlueprint) : ''

                // Merge design context into the prompt for all downstream agents
                let enrichedPrompt = designContext
                    ? `${prompt}\n\n${designContext}`
                    : prompt

                // ── DISCOVERY: SEARCH FOR 21ST.DEV ANIMATIONS & ASSETS ───────────────────────
                let discoveryContext = ''
                if (prompt.toLowerCase().includes('animation') || prompt.toLowerCase().includes('21st') || prompt.toLowerCase().includes('3d') || prompt.toLowerCase().includes('spline')) {
                    send('phase', { agent: 'orchestrator', label: '🔍 Searching 21st.dev for animation inspiration...' })
                    send('thought', { agent: 'orchestrator', message: 'Discovering premium components and interactive patterns...' })

                    const [animations, spline] = await Promise.all([
                        fetchDiscoveryInspiration(prompt, 'components', `${proto}://${host}`),
                        fetchDiscoveryInspiration(prompt, 'spline', `${proto}://${host}`)
                    ])

                    if (animations?.results?.length > 0) {
                        discoveryContext += `\n\n=== 21ST.DEV ANIMATION INSPIRATION ===\n`
                        animations.results.forEach((comp: any) => {
                            discoveryContext += `- ${comp.name}: ${comp.description} (URL: ${comp.url})\n`
                        })
                    }
                    if (spline?.scene) {
                        discoveryContext += `\n=== SPLINE 3D SCENE RECOMMENDED ===\nURL: ${spline.scene.url}\nDescription: ${spline.scene.description}\n`
                    }
                }

                if (discoveryContext) {
                    enrichedPrompt = `${enrichedPrompt}\n${discoveryContext}`
                }

                // ── SPECIALIST PRE-PASS (Parallel Intelligence Gathering) ─────────
                send('phase', { agent: 'orchestrator', label: '🤖 Activating 10 Specialist Agents...' })
                send('thought', { agent: 'orchestrator', message: 'Running Intent Analysis, Design System Engineering, Copywriting, Animation Direction, and Content Strategy in parallel...' })

                let specialistBoost = ''
                let globalSpecialistCtx: any = null
                try {
                    globalSpecialistCtx = await runSpecialistPrePassParallel(prompt, opts)
                    specialistBoost = specialistContextToPromptString(globalSpecialistCtx)
                    send('thought', { agent: 'orchestrator', message: `✅ Specialist Intelligence Ready: Brand tone "${globalSpecialistCtx.intent.tone}", Niche "${globalSpecialistCtx.intent.niche}", Copy "${globalSpecialistCtx.copy?.hero?.headline}"` })
                    send('phase', { agent: 'orchestrator', label: '✅ Intelligence package ready — 10 specialists briefed', done: true })
                } catch (specErr: any) {
                    // Never block generation if specialists fail
                    send('thought', { agent: 'orchestrator', message: `Specialist pre-pass partial: ${specErr.message}` })
                }

                if (specialistBoost) {
                    enrichedPrompt = `${enrichedPrompt}\n\n${specialistBoost}`
                }

                // ── AGENT 1: ORCHESTRATOR ─────────────────────────────────
                send('phase', { agent: 'orchestrator', label: '🧠 Orchestrator analyzing your request...' })
                send('thought', { agent: 'orchestrator', message: 'Analyzing project scope and selecting optimal design system...' })

                const orchestratorPlan = await runOrchestrator(enrichedPrompt, opts)


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

                const plannerOutput = await runPlanner(orchestratorPlan, enrichedPrompt, opts)

                send('thought', { agent: 'planner', message: `Architecture validated. Design style set to: ${plannerOutput.design_tokens.style}.` })
                send('architecture', plannerOutput)
                send('phase', {
                    agent: 'planner',
                    label: `✅ Architecture ready: ${plannerOutput.architecture.length} files mapped`,
                    done: true,
                })


                // ── AGENT 3: CODE GENERATOR (Parallelized Batches) ────────
                const generatedFiles: Record<string, string> = {}
                const filesToGenerate = plannerOutput.architecture.filter(
                    (f: any) => f.path !== 'public/preview.html'
                )

                const BATCH_SIZE = 3
                const totalFiles = filesToGenerate.length

                send('phase', {
                    agent: 'coder',
                    label: `⚙️ Parallel Synthesis: Architecturing ${totalFiles} nodes...`,
                    total: totalFiles,
                })

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

                        send('thought', {
                            agent: 'coder',
                            message: `Implementing component: ${fileSpec.path.split('/').pop()}. Applying Figma-grade styling...`,
                            file: fileSpec.path
                        })

                        try {
                            const rawFileContent = await runCodeGenerator(
                                fileSpec.path,
                                fileSpec.purpose,
                                plannerOutput,
                                orchestratorPlan,
                                enrichedPrompt,
                                opts,
                                globalSpecialistCtx
                            )

                            // ── MASTERY PASS: SECONDARY QUALITY REVIEW ─────────────
                            send('thought', {
                                agent: 'coder',
                                message: `🛡️ Performing Mastery Review on ${fileSpec.path.split('/').pop()}...`,
                                file: fileSpec.path
                            })

                            let reviewedContent = await runCodeReviewer(
                                fileSpec.path,
                                rawFileContent,
                                opts
                            )

                            // For UI files, also run accessibility auditor
                            if (fileSpec.path.endsWith('.tsx') || fileSpec.path.endsWith('.html')) {
                                send('thought', {
                                    agent: 'accessibility',
                                    message: `♿ Auditing accessibility for ${fileSpec.path.split('/').pop()}...`,
                                    file: fileSpec.path
                                })
                                reviewedContent = await runAccessibilityAuditor(
                                    fileSpec.path,
                                    reviewedContent,
                                    opts
                                )
                            }

                            const fileContent = reviewedContent
                            generatedFiles[fileSpec.path] = fileContent
                            send('file', {
                                path: fileSpec.path,
                                content: fileContent,
                                index: fileIndex,
                                total: totalFiles
                            })
                            return { path: fileSpec.path, success: true }
                        } catch (err: any) {
                            if (err.message?.includes('429')) {
                                throw err // Propagate rate limit to abort/retry logic
                            }
                            send('error', { file: fileSpec.path, message: err.message })
                            generatedFiles[fileSpec.path] = `// Error generating ${fileSpec.path}: ${err.message}`
                            return { path: fileSpec.path, success: false }
                        }
                    })

                    // Run batch in parallel
                    await Promise.all(batchPromises)

                    // Throttling between batches to stay safe for free-tier Gemini (15 RPM)
                    if (i + BATCH_SIZE < totalFiles) {
                        const batchDelay = opts.kimiKey ? 500 : (opts.geminiKey ? 3000 : 1000)
                        await new Promise(r => setTimeout(r, batchDelay))
                    }
                }

                // ── SEO & METADATA PASS ──────────────────────────────────
                send('phase', { agent: 'seo_strategist', label: '🔍 Optimizing for SEO & Social Media...' })
                send('thought', { agent: 'seo_strategist', message: 'Generating meta tags, OG signatures, and technical SEO files...' })

                try {
                    if (globalSpecialistCtx) {
                        const seoPackage = await runSeoStrategist(globalSpecialistCtx.intent, orchestratorPlan, opts)
                        
                        generatedFiles['robots.txt'] = seoPackage.robots_txt
                        generatedFiles['sitemap.xml'] = seoPackage.sitemap_xml
                        
                        send('file', { path: 'robots.txt', content: seoPackage.robots_txt })
                        send('file', { path: 'sitemap.xml', content: seoPackage.sitemap_xml })
                        send('phase', { agent: 'seo_strategist', label: '✅ SEO optimized', done: true })
                    }
                } catch (seoErr) {
                    send('thought', { agent: 'seo_strategist', message: 'SEO optimization skipped (optional pass).' })
                }

                // ── PREVIEW GENERATOR ─────────────────────────────────────
                send('phase', { agent: 'preview', label: '🎨 Generating live preview...' })
                send('thought', { agent: 'preview', message: 'Synthesizing all components into a standalone high-fidelity preview...' })

                try {
                    const previewHtml = await runPreviewGenerator(plannerOutput, orchestratorPlan, enrichedPrompt, opts)
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
