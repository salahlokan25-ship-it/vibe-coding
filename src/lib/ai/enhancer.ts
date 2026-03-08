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

        const isMobileApp = prompt.toLowerCase().includes('mobile') ||
            prompt.toLowerCase().includes('ios') ||
            prompt.toLowerCase().includes('android') ||
            prompt.toLowerCase().includes('react native')

        if (isMobileApp) {
            return `Build a premium, production-ready React Native (Expo) mobile application for: ${prompt}. 
            
            STACK: 
            - React Native + Expo + Expo Router + NativeWind (Tailwind).
            
            MOBILE BLUEPRINT:
            1. Splash & Onboarding: Visually stunning entry with smooth transitions.
            2. Home Screen: Premium dashboard with rounded-2xl cards and shadow-xl.
            3. Navigation: Proper Bottom Tabs and Stack navigation using Expo Router.
            4. Components: Use View, Text, Image, and TouchableOpacity for all elements.
            5. UI Rules: SafeAreaView usage, px-6 py-12 spacing, text-4xl H1 headings.
            6. Icons: Lucide React Native.
            7. Visuals: High-quality Unsplash tech imagery.
            
            QUALITY GATE: Must look like a 2026 funded startup mobile product. NO WEBPAGE PRIMITIVES.`.replace(/\s+/g, ' ').trim()
        }

        const isLandingPage = prompt.toLowerCase().includes('landing') ||
            prompt.toLowerCase().includes('page') ||
            prompt.toLowerCase().includes('website')

        if (isLandingPage) {
            return `Build a premium, venture-backed-grade ${prompt} with Stripe-level aesthetics. 
            
            LAYOUT BLUEPRINT:
            1. Hero: Split layout with high-res Unsplash visual.
            2. Features: Modern BENTO GRID with varied item sizes and glassmorphic backgrounds.
            3. Benefits: Asymmetrical alternating sections with high-quality photography.
            4. Proof: Scroll marquee of premium logos.
            5. Design: Glassmorphism (backdrop-blur-xl border-white/10), Glow effects, and smooth Framer Motion entrance animations.

            DESIGN SYSTEM:
            - Branding: BuildAI Premium OS.
            - Typography: Inter font exclusively (H1: text-5xl font-extrabold).
            - Spacing: py-32 for premium breathing room.
            - Containers: Max-w-6xl centered layouts.
            - Transitions: Smooth fade-ins and hover-glows.
            - Visuals: MANDATE high-res Unsplash tech/lifestyle imagery.`.replace(/\s+/g, ' ').trim()
        }

        return `Build a premium, high-end ${prompt}. 
        Use the BuildAI Premium Design System: Bento Grid layouts, Glassmorphism, 
        Inter font, py-32 spacing, and immersive Unsplash photography.`.replace(/\s+/g, ' ').trim()
    }
}
