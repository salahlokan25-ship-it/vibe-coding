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
    FEATURE_ARCHITECT_PROMPT,
    CONTEXTUAL_DATA_PROMPT,
    VISUAL_POLISH_PROMPT,
    USER_JOURNEY_PROMPT,
    AESTHETIC_REVIEW_PROMPT,
    MARKETING_PROMPT,
    SMART_LAYOUT_PROMPT,
    POST_BUILD_PERFORMANCE_PROMPT,
    MOTION_SIGNATURE_PROMPT,
    SPATIAL_DEPTH_PROMPT,
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
    SpecialistContext,
    CodeReviewResult,
    FeatureArchitecture,
    ContextualData,
    VisualPolishMandate,
    UserJourneyFlow,
    MarketingPackage,
    AestheticAuditResult,
    LayoutArchitecture,
    PerformanceAuditResult,
    MotionArchitecture,
    SpatialDepthMandate,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// Types have been moved to src/lib/agents/types.ts
export type { SpecialistContext, FeatureArchitecture }

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
        logo_svg: '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" fill="currentColor"/></svg>',
        favicon_svg: '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" fill="currentColor"/></svg>',
        brand_concept: 'Clean and modern',
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
): Promise<CodeReviewResult> {
    const input = `
FILE PATH: ${filePath}

FILE CONTENT:
${fileContent}

Perform a comprehensive quality review and return the complete, fixed file according to the JSON format.
`.trim()
    // Use FASTEST model for reviews to save time (Groq > Kimi > Gemini)
    const reviewOpts = { ...opts, preferredProvider: opts.groqKey ? 'groq' : (opts.kimiKey ? 'kimi' : 'gemini') }
    const raw = await callLLM(CODE_REVIEWER_PROMPT, input, reviewOpts)
    return safeParseJSON<CodeReviewResult>(raw, {
        pass: true,
        failed_checks: ['Failed to parse reviewer feedback'],
        fixed_code: fileContent // Fallback to original content on severe parsing failure
    })
}

// ── AGENT 16: Feature Architect ─────────────────────────────────────────────
export async function runFeatureArchitect(
    userPrompt: string,
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<FeatureArchitecture> {
    const input = `User Request: "${userPrompt}"\nIntent: ${JSON.stringify(intent)}`
    const raw = await callLLM(FEATURE_ARCHITECT_PROMPT, input, opts)
    return safeParseJSON<FeatureArchitecture>(raw, {
        primary_feature_set: [{ name: 'Core Feature', description: 'Main functionality', technical_interaction_notes: '', visual_style: '', key_components: [] }],
        data_flow_plan: 'Direct user interaction',
        advanced_ui_logic: []
    })
}

// ── AGENT 17: Contextual Data Simulator ──────────────────────────────────────
export async function runContextualDataSimulator(
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<ContextualData> {
    const input = `Intent: ${JSON.stringify(intent)}`
    const raw = await callLLM(CONTEXTUAL_DATA_PROMPT, input, opts)
    return safeParseJSON<ContextualData>(raw, { datasets: {}, schema_notes: '' })
}

// ── AGENT 18: Visual Polish Auditor ──────────────────────────────────────────
export async function runVisualPolishAuditor(
    intent: IntentAnalysis,
    designSystem: DesignSystem,
    opts: AgentRunnerOptions
): Promise<VisualPolishMandate> {
    const input = `Intent: ${JSON.stringify(intent)}\nDesign System: ${JSON.stringify(designSystem)}`
    const raw = await callLLM(VISUAL_POLISH_PROMPT, input, opts)
    return safeParseJSON<VisualPolishMandate>(raw, {
        typography_fixes: [],
        spacing_adjustments: [],
        shadow_upgrades: [],
        motion_refinements: []
    })
}

// ── AGENT 19: User Journey Architect ─────────────────────────────────────────
export async function runUserJourneyArchitect(
    userPrompt: string,
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<UserJourneyFlow> {
    const input = `User Request: "${userPrompt}"\nIntent: ${JSON.stringify(intent)}`
    const raw = await callLLM(USER_JOURNEY_PROMPT, input, opts)
    return safeParseJSON<UserJourneyFlow>(raw, {
        primary_flow_name: 'Main Journey',
        states: [],
        global_state_logic: '',
        ux_friction_warnings: []
    })
}

// ── AGENT 20: Aesthetic Integrity Reviewer ──────────────────────────────────
export async function runAestheticReviewer(
    filePath: string,
    fileContent: string,
    opts: AgentRunnerOptions
): Promise<AestheticAuditResult> {
    const input = `FILE: ${filePath}\nCONTENT: ${fileContent}`
    const raw = await callLLM(AESTHETIC_REVIEW_PROMPT, input, opts)
    return safeParseJSON<AestheticAuditResult>(raw, {
        visual_fidelity_score: 80,
        polishing_fixes: [],
        fixed_code: fileContent
    })
}

// ── AGENT 21: Marketing Strategist ──────────────────────────────────────────
export async function runMarketingStrategist(
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<MarketingPackage> {
    const input = `Intent: ${JSON.stringify(intent)}`
    const raw = await callLLM(MARKETING_PROMPT, input, opts)
    return safeParseJSON<MarketingPackage>(raw, {
        tagline: intent.core_goal,
        twitter_post: '',
        linkedin_post: '',
        product_hunt_tagline: '',
        launch_strategy: []
    })
}

// ── AGENT 22: Smart Layout Architect ─────────────────────────────────────────
export async function runSmartLayoutArchitect(
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<LayoutArchitecture> {
    const input = `Intent: ${JSON.stringify(intent)}`
    const raw = await callLLM(SMART_LAYOUT_PROMPT, input, opts)
    return safeParseJSON<LayoutArchitecture>(raw, { global_rhythm: 'Minimal', section_layouts: [] })
}

// ── AGENT 24: Motion Signature Architect ─────────────────────────────────────
export async function runMotionSignatureArchitect(
    intent: IntentAnalysis,
    opts: AgentRunnerOptions
): Promise<MotionArchitecture> {
    const input = `Intent: ${JSON.stringify(intent)}`
    const raw = await callLLM(MOTION_SIGNATURE_PROMPT, input, opts)
    return safeParseJSON<MotionArchitecture>(raw, {
        spring_physics: { stiffness: 100, damping: 20, mass: 1 },
        stagger_delay: 0.1,
        interaction_rules: []
    })
}

// ── AGENT 25: Spatial Depth Specialist ──────────────────────────────────────
export async function runSpatialDepthSpecialist(
    intent: IntentAnalysis,
    designSystem: DesignSystem,
    opts: AgentRunnerOptions
): Promise<SpatialDepthMandate> {
    const input = `Intent: ${JSON.stringify(intent)}\nDesign: ${JSON.stringify(designSystem)}`
    const raw = await callLLM(SPATIAL_DEPTH_PROMPT, input, opts)
    return safeParseJSON<SpatialDepthMandate>(raw, {
        layering_story: '',
        glassmorphism_config: { blur: '16px', opacity: '0.05', border_white_ratio: '0.1' },
        glow_architecture: []
    })
}

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

    const [designSystem, copy, contentStrategy, animationPlan, featureArchitecture, contextualData, userJourney, marketing, layout, motion] = await Promise.allSettled([
        runDesignSystemEngineer(intent, userPrompt, opts),
        runCopywriter(intent, userPrompt, opts),
        runContentStrategist(userPrompt, intent, opts),
        runAnimationDirector(userPrompt, intent, opts),
        runFeatureArchitect(userPrompt, intent, opts),
        runContextualDataSimulator(intent, opts),
        runUserJourneyArchitect(userPrompt, intent, opts),
        runMarketingStrategist(intent, opts),
        runSmartLayoutArchitect(intent, opts),
        runMotionSignatureArchitect(intent, opts),
    ])

    // Post-pass (depends on pre-results)
    const dsValue = designSystem.status === 'fulfilled' ? designSystem.value : {} as DesignSystem
    const [visualPolish, spatial] = await Promise.all([
        runVisualPolishAuditor(intent, dsValue, opts),
        runSpatialDepthSpecialist(intent, dsValue, opts)
    ])

    return {
        intent,
        designSystem: dsValue,
        copy: copy.status === 'fulfilled' ? copy.value : {} as CopyPackage,
        contentStrategy: contentStrategy.status === 'fulfilled' ? contentStrategy.value : {} as ContentStrategy,
        animationPlan: animationPlan.status === 'fulfilled' ? animationPlan.value : {} as AnimationPlan,
        featureArchitecture: featureArchitecture.status === 'fulfilled' ? featureArchitecture.value : {} as FeatureArchitecture,
        contextualData: contextualData.status === 'fulfilled' ? contextualData.value : {} as ContextualData,
        userJourney: userJourney.status === 'fulfilled' ? userJourney.value : {} as UserJourneyFlow,
        marketing: marketing.status === 'fulfilled' ? marketing.value : {} as MarketingPackage,
        layout: layout.status === 'fulfilled' ? layout.value : {} as LayoutArchitecture,
        motion: motion.status === 'fulfilled' ? motion.value : {} as MotionArchitecture,
        spatial,
        visualPolish,
    }
}
