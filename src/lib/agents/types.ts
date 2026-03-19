// src/lib/agents/types.ts

export interface OrchestratorPlan {
    project_type: string
    stack: string
    features: string[]
    has_backend: boolean
    has_database: boolean
    has_auth: boolean
    pages?: string[]
    file_plan: string[]
    description: string
}

export interface PlannerOutput {
    architecture: Array<{
        path: string
        purpose: string
        exports: string[]
        imports: string[]
    }>
    dependencies: {
        production: string[]
        devDependencies: string[]
    }
    design_tokens: {
        primary_color: string
        background: string
        accent_gradient: string
        style: string
        font?: string
    }
}

export interface AgentRunnerOptions {
    geminiKey?: string
    kimiKey?: string
    groqKey?: string
    bytezKey?: string
    [key: string]: string | undefined
}

export interface IntentAnalysis {
    core_goal: string
    niche: string
    ideal_user: string
    emotional_hook: string
    key_differentiators: string[]
    conversion_goal: string
    tone: string
    content_pillars: string[]
    red_flags: string[]
    suggested_sections: string[]
}

export interface DesignSystem {
    brand_name: string
    palette: Record<string, string>
    gradients: Record<string, string>
    typography: Record<string, string>
    spacing: Record<string, string>
    shadows: Record<string, string>
    animation: Record<string, string>
    tailwind_extend: string
    css_variables: string
}

export interface CopyPackage {
    hero: {
        badge: string
        headline: string
        sub_headline: string
        cta_primary: string
        cta_secondary: string
        social_proof_line: string
    }
    stats: Array<{ value: string; label: string; description: string }>
    features: Array<{ id: string; badge: string; headline: string; body: string }>
    benefits_section: { overline: string; headline: string; items: Array<{ title: string; body: string }> }
    testimonials: Array<{ quote: string; author: string; role: string; company: string }>
    pricing: {
        overline: string; headline: string
        plans: Array<{ name: string; price: string; period: string; description: string; features: string[]; cta: string }>
    }
    cta_section: { headline: string; sub: string; button: string }
    footer_tagline: string
}

export interface SeoPackage {
    site_name: string
    default_locale: string
    pages: Array<{
        route: string
        title: string
        description: string
        keywords: string[]
        og_title: string
        og_description: string
        og_image_prompt: string
        canonical: string
        schema_type: string
        schema_json: string
    }>
    robots_txt: string
    sitemap_xml: string
    next_metadata_code: string
}

export interface ContentStrategy {
    site_map: Array<{
        page: string
        route: string
        purpose: string
        sections: Array<{ name: string; goal: string; content_type: string }>
    }>
    user_journey: { awareness: string; consideration: string; conversion: string; retention: string }
    content_hierarchy: { primary_message: string; secondary_message: string; tertiary_message: string }
    missing_content_warnings: string[]
    cta_strategy: { primary_cta: string; secondary_cta: string; exit_intent_offer: string }
}

export interface AnimationPlan {
    page_load_sequence: Array<{ element: string; animation: string; delay: string; duration: string; easing: string }>
    scroll_animations: Array<{ section: string; pattern: string; stagger_delay?: string; trigger: string }>
    hover_interactions: Record<string, string>
    special_effects: Array<{ name: string; css: string; duration: string; timing?: string }>
    framer_motion_variants: Record<string, string>
}

export interface SpecialistContext {
    intent: IntentAnalysis
    designSystem: DesignSystem
    copy: CopyPackage
    contentStrategy: ContentStrategy
    animationPlan: AnimationPlan
}
