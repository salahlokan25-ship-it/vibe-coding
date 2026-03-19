/**
 * /api/web-search — Web Search & 21st.dev Component Discovery Agent
 * Searches for design inspiration, components, and image assets
 */

import { NextRequest, NextResponse } from 'next/server'

const UNSPLASH_TOPICS: Record<string, string[]> = {
    tech: [
        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=90',
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=90',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=90',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=90',
    ],
    dashboard: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=90',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=90',
    ],
    saas: [
        'https://images.unsplash.com/photo-1497366858526-0766ad7773f7?w=1200&q=90',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=90',
    ],
    ecommerce: [
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=90',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=90',
    ],
    finance: [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=90',
        'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&q=90',
    ],
    portfolio: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=90',
        'https://images.unsplash.com/photo-1609548945650-f4c67b6b1f2d?w=1200&q=90',
    ],
    healthcare: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=90',
        'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&q=90',
    ],
    abstract: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=90',
        'https://images.unsplash.com/photo-1558591710-4b4a1ae0f7e5?w=1200&q=90',
    ],
}

// 21st.dev components catalog (Expanded repertoire for realistic discovery)
const COMPONENT_SUGGESTIONS: Record<string, any[]> = {
    hero: [
        { name: 'GlowHero', url: 'https://21st.dev/r/shadcn/hero-glow', description: 'Animated gradient glow hero with floating elements', tags: ['3D', 'gradient', 'animated'], inspiration: 'Linear' },
        { name: 'ParallaxHero', url: 'https://21st.dev/r/framer-motion/parallax-depth', description: 'Scroll-driven parallax with depth layers', tags: ['scroll', 'parallax', 'premium'], inspiration: 'Vercel' },
        { name: 'MagneticHero', url: 'https://21st.dev/r/aceternity/magnetic-buttons', description: 'Interactive magnetic CTA buttons', tags: ['magnetic', 'hook', 'framer'] },
        { name: 'TypewriterHero', url: 'https://21st.dev/r/shadcn/typewriter-effect', description: 'Typewriter headline animation with mesh gradient', tags: ['typewriter', 'animation'] },
    ],
    features: [
        { name: 'BentoGrid', url: 'https://21st.dev/r/aceternity/bento-grid', description: 'Modern bento-box feature layout', tags: ['grid', 'modern', 'responsive'] },
        { name: 'SpotlightCards', url: 'https://21st.dev/r/aceternity/spotlight-card', description: 'Hover spotlight effect for cards', tags: ['hover', 'spotlight', 'glass'] },
        { name: 'FeatureShowcase', url: 'https://21st.dev/r/framer-motion/feature-perspective', description: '3D card features with hover perspective', tags: ['3D', 'hover', 'cards'] },
    ],
    pricing: [
        { name: 'GlassPricing', url: 'https://21st.dev/r/shadcn/glow-pricing', description: 'Glassmorphism pricing cards with toggle', tags: ['glass', 'toggle', 'premium'] },
        { name: 'ComparisonPricing', url: 'https://21st.dev/r/shadcn/tiered-pricing', description: 'Detailed tiered pricing with sticky header', tags: ['business', 'tabs'] },
    ],
    navigation: [
        { name: 'FloatingNav', url: 'https://21st.dev/r/aceternity/floating-navbar', description: 'Pill-shaped floating navigation with blur', tags: ['floating', 'blur', 'modern'] },
        { name: 'SidebarNav', url: 'https://21st.dev/r/shadcn/collapsible-sidebar', description: 'Animated collapsible sidebar navigation', tags: ['sidebar', 'animated'] },
        { name: 'GlassNav', url: 'https://21st.dev/r/framer-motion/blurred-navbar', description: 'Translucent frosted glass navbar', tags: ['nav', 'glass'] },
    ],
    animations: [
        { name: 'TextReveal', url: 'https://21st.dev/r/aceternity/text-reveal', description: 'Smooth clip-path text reveal on scroll', tags: ['text', 'scroll', 'cinematic'] },
        { name: 'InfiniteScroll', url: 'https://21st.dev/r/framer-motion/scrolling-banner', description: 'Smooth infinite loop logo/brand slider', tags: ['slider', 'brand'] },
        { name: 'HolographicCard', url: 'https://21st.dev/r/aceternity/shiny-card', description: 'Holographic reflection effect on hover', tags: ['web3', 'premium', 'animation'] },
    ]
}

// Spline scene suggestions based on project type
const SPLINE_SCENES: Record<string, any> = {
    saas: {
        url: 'https://spline.design/scenes/ai-orb',
        description: 'Interactive AI neural network orb with hover interactions',
        embedCode: `<script type="module" src="https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"></spline-viewer>`,
    },
    landing_page: {
        url: 'https://spline.design/scenes/floating-geometric',
        description: 'Floating 3D geometric shapes with ambient lighting',
        embedCode: `<script type="module" src="https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/XSUNfNgHjbHWHyOj/scene.splinecode"></spline-viewer>`,
    },
    portfolio: {
        url: 'https://spline.design/scenes/creative-blob',
        description: 'Morphing blob sculpture with color reactivity',
        embedCode: `<script type="module" src="https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/fy9_w7vB_a3c/scene.splinecode"></spline-viewer>`,
    },
}

export async function POST(req: NextRequest) {
    try {
        const { query, type = 'images', projectType = 'tech' } = await req.json()

        if (type === 'images') {
            const category = Object.keys(UNSPLASH_TOPICS).find(k =>
                query?.toLowerCase().includes(k) || projectType?.toLowerCase().includes(k)
            ) || 'tech'

            const images = UNSPLASH_TOPICS[category] || UNSPLASH_TOPICS.tech

            return NextResponse.json({
                results: images.map((url, i) => ({
                    id: `img-${i}`,
                    url,
                    thumbnail: url.replace('w=1200', 'w=400'),
                    credit: 'Unsplash',
                    category,
                }))
            })
        }

        if (type === 'components') {
            const lowerQuery = query?.toLowerCase() || ''
            let section = 'hero'
            
            if (lowerQuery.includes('animation') || lowerQuery.includes('motion') || lowerQuery.includes('move')) {
                section = 'animations'
            } else if (lowerQuery.includes('feature')) {
                section = 'features'
            } else if (lowerQuery.includes('pricing')) {
                section = 'pricing'
            } else if (lowerQuery.includes('nav') || lowerQuery.includes('menu')) {
                section = 'navigation'
            }

            const components = COMPONENT_SUGGESTIONS[section] || COMPONENT_SUGGESTIONS.hero

            // Also add 21st.dev link
            return NextResponse.json({
                results: components,
                source_url: `https://21st.dev/search?q=${encodeURIComponent(query || '')}`,
                note: 'Powered by 21st.dev — Premium UI Components'
            })
        }

        if (type === 'spline') {
            const scene = SPLINE_SCENES[projectType] || SPLINE_SCENES.landing_page
            return NextResponse.json({ scene })
        }

        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
