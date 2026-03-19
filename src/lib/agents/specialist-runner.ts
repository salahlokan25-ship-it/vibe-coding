/**
 * BuildAI — Specialist Agent Runner
 * 10 specialist agents that power the elite project-building pipeline.
 * Each agent has a focused responsibility and works alongside the core 5 agents.
 */

import {
    INTENT_ANALYST_PROMPT,
    DESIGN_SYSTEM_PROMPT,
    COPYWRITER_PROMPT,
    SEO_STRATEGIST_PROMPT,
    ACCESSIBILITY_PROMPT,
    PERFORMANCE_OPTIMIZER_PROMPT,
    COMPONENT_LIBRARY_PROMPT,
    CONTENT_STRATEGIST_PROMPT,
    ANIMATION_DIRECTOR_PROMPT,
    CODE_REVIEWER_PROMPT,
} from './specialist-prompts'
import {
    callLLM,
} from './runner'
import {
    AgentRunnerOptions,
    OrchestratorPlan,
    PlannerOutput,
    IntentAnalysis,
    DesignSystem,
    CopyPackage,
    SeoPackage,
    ContentStrategy,
    AnimationPlan,
    SpecialistContext
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// Types have been moved to src/lib/agents/types.ts

// ─────────────────────────────────────────────────────────────────────────────
// Helper: safe JSON parse with fallback
// ─────────────────────────────────────────────────────────────────────────────
function safeParseJSON<T>(raw: string, fallback: T): T {
    try {
        const clean = raw.replace(/```json\n?|```\n?/gi, '').trim()
        const match = clean.match(/\{[\s\S]*\}/)
        if (!match) return fallback
        return JSON.parse(match[0]) as T
    } catch {
        return fallback
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 6: Intent Analyst
// Deeply understands user goals, niche, and ideal customer
// ─────────────────────────────────────────────────────────────────────────────
export async function runIntentAnalyst(
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<IntentAnalysis> {
    const input = `Analyze this project idea deeply:\n\n"${userPrompt}"`
    const raw = await callLLM(INTENT_ANALYST_PROMPT, input, opts)
    return safeParseJSON<IntentAnalysis>(raw, {
        core_goal: userPrompt,
        niche: 'General web app',
        ideal_user: 'End users',
        emotional_hook: 'confidence',
        key_differentiators: ['Modern design', 'Easy to use'],
        conversion_goal: 'signup',
        tone: 'Professional and modern',
        content_pillars: ['Quality', 'Speed', 'Trust'],
        red_flags: [],
        suggested_sections: ['Hero', 'Features', 'Pricing', 'Contact']
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 7: Design System Engineer
// Creates a complete bespoke design token system
// ─────────────────────────────────────────────────────────────────────────────
export async function runDesignSystemEngineer(
    intent: IntentAnalysis,
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<DesignSystem> {
    const input = `
Project Intent:
${JSON.stringify(intent, null, 2)}

Original Prompt: "${userPrompt}"

Create the complete design system / token system for this project.
`.trim()
    const raw = await callLLM(DESIGN_SYSTEM_PROMPT, input, opts)
    return safeParseJSON<DesignSystem>(raw, {
        brand_name: 'Brand',
        palette: { background: '#020617', primary: '#6366f1' },
        gradients: { hero_headline: 'linear-gradient(135deg, #6366f1, #ec4899)' },
        typography: { hero_size: 'clamp(3rem,8vw,6rem)', display_font: 'Inter', body_font: 'Inter', mono_font: 'JetBrains Mono' },
        spacing: { section_padding_y: 'py-24 md:py-32', container: 'max-w-7xl mx-auto px-6' },
        shadows: { card: '0 4px 24px rgba(0,0,0,0.4)' },
        animation: { easing_default: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
        tailwind_extend: '{}',
        css_variables: ':root {}'
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 8: Copywriter
// Generates all marketing copy for the site
// ─────────────────────────────────────────────────────────────────────────────
export async function runCopywriter(
    intent: IntentAnalysis,
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<CopyPackage> {
    const input = `
Product Intent:
${JSON.stringify(intent, null, 2)}

User Request: "${userPrompt}"

Write world-class conversion copy for every section of this website.
`.trim()
    const raw = await callLLM(COPYWRITER_PROMPT, input, opts)
    return safeParseJSON<CopyPackage>(raw, {
        hero: {
            badge: 'Introducing',
            headline: 'Build Something Great',
            sub_headline: 'The fastest way to bring your ideas to life.',
            cta_primary: 'Get Started Free',
            cta_secondary: 'See a Demo',
            social_proof_line: 'Trusted by 1,000+ teams'
        },
        stats: [{ value: '10K+', label: 'Users', description: 'Growing every day' }],
        features: [],
        benefits_section: { overline: 'Benefits', headline: 'Why Choose Us', items: [] },
        testimonials: [],
        pricing: { overline: 'Pricing', headline: 'Simple, transparent pricing', plans: [] },
        cta_section: { headline: 'Ready to get started?', sub: 'Join thousands of happy users.', button: 'Start for Free' },
        footer_tagline: 'Built for the modern web.'
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 9: SEO & Meta Strategist
// Generates all SEO metadata and structured data
// ─────────────────────────────────────────────────────────────────────────────
export async function runSeoStrategist(
    intent: IntentAnalysis,
    orchestratorPlan: OrchestratorPlan,
    opts: AgentRunnerOptions
): Promise<SeoPackage> {
    const input = `
Project Type: ${orchestratorPlan.project_type}
Intent: ${JSON.stringify(intent, null, 2)}
Pages: ${orchestratorPlan.file_plan.filter(f => f.includes('/page.')).join(', ')}

Generate complete SEO metadata for all pages.
`.trim()
    const raw = await callLLM(SEO_STRATEGIST_PROMPT, input, opts)
    return safeParseJSON<SeoPackage>(raw, {
        site_name: intent.core_goal,
        default_locale: 'en_US',
        pages: [{ route: '/', title: intent.core_goal, description: intent.core_goal, keywords: [], og_title: intent.core_goal, og_description: intent.core_goal, og_image_prompt: '', canonical: '/', schema_type: 'WebPage', schema_json: '{}' }],
        robots_txt: 'User-agent: *\nAllow: /',
        sitemap_xml: '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
        next_metadata_code: `export const metadata = { title: '${intent.core_goal}' }`
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 10: Accessibility Auditor
// Reviews code and applies WCAG 2.1 AA fixes
// ─────────────────────────────────────────────────────────────────────────────
export async function runAccessibilityAuditor(
    filePath: string,
    fileContent: string,
    opts: AgentRunnerOptions
): Promise<string> {
    const input = `
FILE PATH: ${filePath}

FILE CONTENT:
${fileContent}

Audit for WCAG 2.1 AA compliance and return the fixed, complete file.
`.trim()
    return callLLM(ACCESSIBILITY_PROMPT, input, opts)
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 11: Performance Optimizer
// Optimizes generated code for Core Web Vitals
// ─────────────────────────────────────────────────────────────────────────────
export async function runPerformanceOptimizer(
    filePath: string,
    fileContent: string,
    opts: AgentRunnerOptions
): Promise<string> {
    const input = `
FILE PATH: ${filePath}

FILE CONTENT:
${fileContent}

Optimize this file for Core Web Vitals (LCP < 2.5s, INP < 100ms, CLS < 0.1) and return the complete optimized file.
`.trim()
    return callLLM(PERFORMANCE_OPTIMIZER_PROMPT, input, opts)
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 12: Component Library Assistant
// Generates reusable UI components on demand
// ─────────────────────────────────────────────────────────────────────────────
export async function runComponentLibraryAssistant(
    componentType: string,
    designSystem: Partial<DesignSystem>,
    opts: AgentRunnerOptions
): Promise<string> {
    const input = `
COMPONENT TO BUILD: ${componentType}

DESIGN SYSTEM:
${JSON.stringify(designSystem, null, 2)}

Generate the complete, reusable TypeScript React component file for: ${componentType}
`.trim()
    return callLLM(COMPONENT_LIBRARY_PROMPT, input, opts)
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 13: Content Strategist
// Plans the full information architecture for the project
// ─────────────────────────────────────────────────────────────────────────────
export async function runContentStrategist(
    userPrompt: string,
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<ContentStrategy> {
    const input = `
User Prompt: "${userPrompt}"
Intent Analysis: ${JSON.stringify(intent, null, 2)}

Plan the complete information architecture and content strategy.
`.trim()
    const raw = await callLLM(CONTENT_STRATEGIST_PROMPT, input, opts)
    return safeParseJSON<ContentStrategy>(raw, {
        site_map: [],
        user_journey: { awareness: '', consideration: '', conversion: '', retention: '' },
        content_hierarchy: { primary_message: '', secondary_message: '', tertiary_message: '' },
        missing_content_warnings: [],
        cta_strategy: { primary_cta: 'Sign Up', secondary_cta: 'Learn More', exit_intent_offer: 'Try for free' }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 14: Animation Director
// Choreographs the full animation sequence for the site
// ─────────────────────────────────────────────────────────────────────────────
export async function runAnimationDirector(
    userPrompt: string,
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<AnimationPlan> {
    const input = `
Project: "${userPrompt}"
Tone: ${intent.tone}
Emotional Hook: ${intent.emotional_hook}

Design the complete animation choreography and motion plan for this website.
`.trim()
    const raw = await callLLM(ANIMATION_DIRECTOR_PROMPT, input, opts)
    return safeParseJSON<AnimationPlan>(raw, {
        page_load_sequence: [],
        scroll_animations: [],
        hover_interactions: {},
        special_effects: [],
        framer_motion_variants: {
            container: '{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }',
            item: '{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }'
        }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 15: Code Quality Reviewer
// Reviews code and fixes common mistakes before delivery
// ─────────────────────────────────────────────────────────────────────────────
export async function runCodeReviewer(
    filePath: string,
    fileContent: string,
    opts: AgentRunnerOptions
): Promise<string> {
    const input = `
FILE PATH: ${filePath}

FILE CONTENT:
${fileContent}

Perform a comprehensive quality review and return the complete, fixed file.
`.trim()
    return callLLM(CODE_REVIEWER_PROMPT, input, opts)
}

// Function moved to src/lib/agents/prompts.ts

// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATED SPECIALIST PIPELINE
// Run all pre-generation specialists in parallel to build rich context
// ─────────────────────────────────────────────────────────────────────────────

export async function runSpecialistPrePassParallel(
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<SpecialistContext> {
    // Run Intent Analyst first (others depend on it)
    const intent = await runIntentAnalyst(userPrompt, opts)

    // Run all parallel specialists simultaneously
    const [designSystem, copy, contentStrategy, animationPlan] = await Promise.allSettled([
        runDesignSystemEngineer(intent, userPrompt, opts),
        runCopywriter(intent, userPrompt, opts),
        runContentStrategist(userPrompt, intent, opts),
        runAnimationDirector(userPrompt, intent, opts),
    ])

    return {
        intent,
        designSystem: designSystem.status === 'fulfilled' ? designSystem.value : {} as DesignSystem,
        copy: copy.status === 'fulfilled' ? copy.value : {} as CopyPackage,
        contentStrategy: contentStrategy.status === 'fulfilled' ? contentStrategy.value : {} as ContentStrategy,
        animationPlan: animationPlan.status === 'fulfilled' ? animationPlan.value : {} as AnimationPlan,
    }
}
