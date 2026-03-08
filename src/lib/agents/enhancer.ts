/**
 * Prompt Enhancement Engine
 * Transforms simple user ideas into high-fidelity startup blueprints.
 */

export interface EnhancedPrompt {
    original: string
    premium: string
    sections: string[]
    style: string
}

export class PromptEnhancer {
    static async enhance(prompt: string): Promise<string> {
        // This acts as the 'Prompt Enhancer' + 'Layout Blueprint Injector' + 'Design System Injector'
        // In a real scenario, this could be another LLM call, but we can also use structured template injection.

        const isLandingPage = prompt.toLowerCase().includes('landing') ||
            prompt.toLowerCase().includes('page') ||
            prompt.toLowerCase().includes('website') ||
            prompt.toLowerCase().includes('app')

        if (isLandingPage) {
            return `Build a premium, venture-backed-grade ${prompt} with Stripe-level aesthetics. 
            
            LAYOUT BLUEPRINT:
            1. Hero: High-conversion 2-column layout. Left: Bold Title/CTA. Right: Premium tech visual/mockup.
            2. Features: 3-column interactive grid with Lucide icons.
            3. Benefits: Alternating image/text sections for visual rhythm.
            4. Social Proof: Modern testimonial grid.
            5. Pricing: Premium multi-tier comparison cards.
            6. Support: FAQ accordion grid.
            7. Final CTA: Bold, high-contrast conversion section.
            8. Footer: Comprehensive professional footer.

            DESIGN SYSTEM:
            - Typography: Inter font exclusively (H1: text-5xl font-extrabold).
            - Spacing: Strict adherence to py-24 section padding.
            - Containers: Max-w-6xl centered layouts.
            - Style: rounded-2xl cards, shadow-xl depth, vibrant orange (#FF5C00) accents.
            - Animation: Subtle hover:scale-105, duration-300 transitions, and elegant section fade-ins.
            - Visuals: Use realistic marketing copy and high-res visuals (Unsplash technology/startup).`.replace(/\s+/g, ' ').trim()
        }

        return `Build a modern, high-quality, professional ${prompt}. 
        Use the Zero-Code Premium Design System: Inter font, max-w-6xl containers, py-24 spacing, rounded-2xl components, and subtle animations.`.replace(/\s+/g, ' ').trim()
    }
}
