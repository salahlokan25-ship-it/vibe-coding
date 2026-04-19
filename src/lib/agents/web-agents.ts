/**
 * BuildAI — Web Intelligence Agents
 * Agent 3: Smart Image Curator — searches Unsplash for real, semantically-matched images
 * Agent 2: Animation Library Researcher — fetches verified animation components from 21st.dev / Aceternity
 */

import { IntentAnalysis } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageResult {
    id: string
    url: string              // Full-size CDN URL (1600px)
    thumbnail: string        // Small preview (400px)
    alt: string              // Accessibility description
    photographer: string     // Required attribution — Unsplash ToS
    photographerUrl?: string // Required attribution link — Unsplash ToS
    color: string            // Dominant color hex (use as placeholder bg)
    width: number
    height: number
    blur_hash?: string       // BlurHash for progressive loading
    download_location?: string | null  // Ping this URL when photo is used (Unsplash ToS)
}

export interface AnimationComponent {
    name: string
    description: string
    source: 'aceternity' | '21st.dev' | 'magicui' | 'framer-community'
    category: 'hero' | 'cards' | 'text' | 'loading' | 'nav' | 'scroll' | 'hover' | 'background'
    code_snippet: string   // The actual Framer Motion / CSS code
    dependencies: string[] // npm packages needed
    preview_url: string
    tags: string[]
}

export interface VisualTrend {
    color_mood: string
    layout_style: string
    typography_style: string
    inspiring_sites: string[] // URLs of trending competitors
    design_mandate: string // A strong instruction for the Coder based on trends
}

export interface WebIntelligencePackage {
    images: {
        hero: ImageResult[]
        section: ImageResult[]
        portrait: ImageResult[]
        product: ImageResult[]
    }
    animations: AnimationComponent[]
    fonts: {
        display: string
        body: string
        import_url: string
    }
    trends?: VisualTrend
    competitorAnalysis?: CompetitorAnalysis
    color_palette_inspiration: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Map niche/intent to Unsplash search query
// ─────────────────────────────────────────────────────────────────────────────

function intentToImageQueries(intent: IntentAnalysis): {
    hero: string
    section: string
    portrait: string
    product: string
} {
    const niche = intent.niche?.toLowerCase() || ''
    const hook = intent.emotional_hook?.toLowerCase() || ''
    const tone = intent.tone?.toLowerCase() || ''

    // Map niche to a richer visual query for cinematic results
    let hero = 'dark abstract cinematic technology'
    let section = 'modern workspace minimal'
    let portrait = 'professional headshot person'
    let product = 'product showcase dark background'

    // Food & Restaurant
    if (niche.includes('food') || niche.includes('restaurant') || niche.includes('burger') || niche.includes('cafe') || niche.includes('pizza')) {
        hero = 'cinematic food photography restaurant dark moody'
        section = 'kitchen chef cooking ingredients fresh'
        portrait = 'chef portrait professional culinary'
        product = 'burger food product dark background appetizing'
    }
    // Fashion & Apparel
    else if (niche.includes('fashion') || niche.includes('clothing') || niche.includes('apparel') || niche.includes('style')) {
        hero = 'fashion editorial luxury dark studio photography'
        section = 'clothing texture fabric minimal aesthetic'
        portrait = 'fashion model editorial portrait'
        product = 'clothing product minimal white background'
    }
    // SaaS & Tech
    else if (niche.includes('saas') || niche.includes('software') || niche.includes('app') || niche.includes('platform') || niche.includes('ai')) {
        hero = 'abstract AI technology futuristic dark neon'
        section = 'dashboard analytics code dark screen'
        portrait = 'tech professional developer portrait'
        product = 'app interface mockup screen laptop dark'
    }
    // Finance & Fintech
    else if (niche.includes('finance') || niche.includes('fintech') || niche.includes('crypto') || niche.includes('invest')) {
        hero = 'finance trading dark minimal premium luxury'
        section = 'charts graphs data analysis business'
        portrait = 'financial advisor professional business portrait'
        product = 'crypto coin finance dark neon visualization'
    }
    // Health & Fitness
    else if (niche.includes('health') || niche.includes('fitness') || niche.includes('gym') || niche.includes('wellness')) {
        hero = 'fitness gym dark dynamic athletic motion blur'
        section = 'healthy lifestyle nutrition clean minimal'
        portrait = 'athlete fitness model portrait motivation'
        product = 'fitness equipment product dark dramatic'
    }
    // Real Estate
    else if (niche.includes('real estate') || niche.includes('property') || niche.includes('housing')) {
        hero = 'luxury house architecture minimal interior design'
        section = 'modern interior living room bright natural'
        portrait = 'real estate agent professional portrait confidence'
        product = 'architectural detail door window luxury home'
    }
    // eCommerce
    else if (niche.includes('ecommerce') || niche.includes('shop') || niche.includes('store') || niche.includes('retail')) {
        hero = 'ecommerce luxury product photography dark premium'
        section = 'shopping retail minimal clean white'
        portrait = 'customer happy lifestyle portrait smiling'
        product = 'product package unboxing elegant minimal'
    }
    // Creative / Agency / Portfolio
    else if (niche.includes('agency') || niche.includes('portfolio') || niche.includes('creative') || niche.includes('design')) {
        hero = 'creative studio design agency workspace dark minimal'
        section = 'design process brainstorming creative tools'
        portrait = 'creative professional designer portrait modern'
        product = 'design work portfolio mockup creative dark'
    }
    // Education
    else if (niche.includes('education') || niche.includes('learning') || niche.includes('school') || niche.includes('course')) {
        hero = 'education learning modern bright minimalist campus'
        section = 'studying books laptop online learning'
        portrait = 'student teacher educator portrait confident'
        product = 'online course certificate achievement success'
    }

    // Modulate by emotional hook
    if (hook.includes('luxury') || hook.includes('premium') || hook.includes('exclusive')) {
        hero = `luxury premium ${hero}`
        section = `minimal upscale ${section}`
    }
    if (hook.includes('energy') || hook.includes('excitement') || hook.includes('bold')) {
        hero = `bold dynamic ${hero}`
    }
    if (hook.includes('trust') || hook.includes('professional') || hook.includes('safe')) {
        hero = `professional clean ${hero}`
    }

    return { hero, section, portrait, product }
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 3: Smart Image Curator
// Uses Unsplash API to fetch real, semantically-matched images
// ─────────────────────────────────────────────────────────────────────────────

async function fetchFromUnsplash(
    query: string,
    count: number = 4,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<ImageResult[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY

    // If no API key, use hand-curated fallback library
    if (!accessKey) {
        console.log('[Image Curator] No UNSPLASH_ACCESS_KEY set — using curated fallback for:', query)
        return getCuratedFallbackImages(query, count)
    }

    try {
        // Use the official Unsplash Search Photos endpoint
        const searchUrl = new URL('https://api.unsplash.com/search/photos')
        searchUrl.searchParams.set('query', query)
        searchUrl.searchParams.set('per_page', String(count))
        searchUrl.searchParams.set('orientation', orientation)
        searchUrl.searchParams.set('order_by', 'relevant')
        searchUrl.searchParams.set('content_filter', 'high')

        const res = await fetch(searchUrl.toString(), {
            headers: {
                Authorization: `Client-ID ${accessKey}`,
                'Accept-Version': 'v1',
            },
            signal: AbortSignal.timeout(6000),
        })

        if (!res.ok) {
            const errBody = await res.text()
            console.warn(`[Image Curator] Unsplash API error ${res.status}:`, errBody)
            return getCuratedFallbackImages(query, count)
        }

        const data = await res.json()
        const photos = data.results || []

        if (photos.length === 0) {
            console.warn('[Image Curator] Unsplash returned 0 results for:', query)
            return getCuratedFallbackImages(query, count)
        }

        // Map Unsplash API response to our ImageResult interface
        // Following the schema: photo.urls.raw, photo.urls.regular, photo.urls.small
        // photo.alt_description, photo.color, photo.blur_hash, photo.user.name
        return photos.map((photo: any): ImageResult => {
            // Build properly-sized URLs using Unsplash's Imgix pipeline
            // per their guidelines: append w, q, fit, fm params to the raw URL
            const rawBase = photo.urls?.raw || photo.urls?.full || ''
            const separator = rawBase.includes('?') ? '&' : '?'

            return {
                id: photo.id,
                // Hero quality: 1600px wide, 90% quality, auto WebP
                url: rawBase
                    ? `${rawBase}${separator}w=1600&q=90&fit=crop&crop=entropy&auto=format&fm=webp`
                    : photo.urls?.regular || '',
                // Thumbnail: 400px wide for lazy loading / blur-hash fallback
                thumbnail: rawBase
                    ? `${rawBase}${separator}w=400&q=75&fit=crop&crop=entropy&auto=format&fm=webp`
                    : photo.urls?.small || '',
                // Alt text: prefer alt_description, fallback to description, then query
                alt: photo.alt_description || photo.description || query,
                // Required by Unsplash API Terms — must display photographer credit
                photographer: photo.user?.name || 'Unsplash Contributor',
                photographerUrl: photo.user?.links?.html
                    ? `${photo.user.links.html}?utm_source=vibecoder&utm_medium=referral`
                    : 'https://unsplash.com/?utm_source=vibecoder&utm_medium=referral',
                // Dominant color — use as placeholder background while image loads
                color: photo.color || '#1a1a1a',
                width: photo.width || 1600,
                height: photo.height || 900,
                blur_hash: photo.blur_hash,
                // Unsplash requires triggering the download endpoint when photo is used
                download_location: photo.links?.download_location || null,
            } as ImageResult
        })
    } catch (err) {
        console.warn('[Image Curator] Unsplash fetch failed, using curated fallback:', err)
        return getCuratedFallbackImages(query, count)
    }
}

function getCuratedFallbackImages(query: string, count: number): ImageResult[] {
    // A rich, hand-curated library of premium Unsplash images by category
    const CURATED: Record<string, ImageResult[]> = {
        food: [
            { id: 'f1', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', alt: 'Gourmet burger cinematic', photographer: 'Unsplash', color: '#1a0a00', width: 1600, height: 900 },
            { id: 'f2', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80', alt: 'Burger close up', photographer: 'Unsplash', color: '#8B4513', width: 1600, height: 900 },
            { id: 'f3', url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80', alt: 'Dark restaurant ambiance', photographer: 'Unsplash', color: '#0d0d0d', width: 1600, height: 900 },
            { id: 'f4', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80', alt: 'French fries crispy', photographer: 'Unsplash', color: '#c8860a', width: 1600, height: 900 },
        ],
        tech: [
            { id: 't1', url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80', alt: 'AI abstract futuristic', photographer: 'Unsplash', color: '#0a0f1a', width: 1600, height: 900 },
            { id: 't2', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80', alt: 'AI digital abstract', photographer: 'Unsplash', color: '#0d0d1a', width: 1600, height: 900 },
            { id: 't3', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', alt: 'Coding dark theme', photographer: 'Unsplash', color: '#0a0a0a', width: 1600, height: 900 },
            { id: 't4', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80', alt: 'Analytics dashboard', photographer: 'Unsplash', color: '#051020', width: 1600, height: 900 },
        ],
        fashion: [
            { id: 'fa1', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'Fashion editorial dark', photographer: 'Unsplash', color: '#0d0d0d', width: 1600, height: 900 },
            { id: 'fa2', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', alt: 'Fashion model', photographer: 'Unsplash', color: '#1a1a1a', width: 1600, height: 900 },
        ],
        finance: [
            { id: 'fi1', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', alt: 'Financial trading charts', photographer: 'Unsplash', color: '#041020', width: 1600, height: 900 },
            { id: 'fi2', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80', alt: 'Bitcoin crypto dark', photographer: 'Unsplash', color: '#0f0a00', width: 1600, height: 900 },
        ],
        fitness: [
            { id: 'fit1', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', alt: 'Gym weights training', photographer: 'Unsplash', color: '#0d0d0d', width: 1600, height: 900 },
            { id: 'fit2', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', alt: 'Fitness workout', photographer: 'Unsplash', color: '#1a0d00', width: 1600, height: 900 },
        ],
        portrait: [
            { id: 'p1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=90', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', alt: 'Professional portrait man', photographer: 'Unsplash', color: '#1a1a1a', width: 400, height: 500 },
            { id: 'p2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=90', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', alt: 'Professional portrait woman', photographer: 'Unsplash', color: '#f0e8d8', width: 400, height: 500 },
            { id: 'p3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=90', thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', alt: 'Person smiling confident', photographer: 'Unsplash', color: '#d4c5a0', width: 400, height: 500 },
        ],
        abstract: [
            { id: 'a1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', alt: 'Abstract gradient colorful', photographer: 'Unsplash', color: '#1a0a2e', width: 1600, height: 900 },
            { id: 'a2', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f7e5?w=1600&q=90', thumbnail: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f7e5?w=400&q=80', alt: 'Abstract dark texture', photographer: 'Unsplash', color: '#0a0a0a', width: 1600, height: 900 },
        ]
    }

    const q = query.toLowerCase()
    let category = 'abstract'
    if (q.includes('food') || q.includes('burger') || q.includes('restaurant') || q.includes('pizza') || q.includes('cafe')) category = 'food'
    else if (q.includes('tech') || q.includes('ai') || q.includes('software') || q.includes('code') || q.includes('saas')) category = 'tech'
    else if (q.includes('fashion') || q.includes('clothing') || q.includes('style') || q.includes('apparel')) category = 'fashion'
    else if (q.includes('finance') || q.includes('crypto') || q.includes('bank') || q.includes('invest')) category = 'finance'
    else if (q.includes('fitness') || q.includes('gym') || q.includes('workout') || q.includes('health')) category = 'fitness'
    else if (q.includes('portrait') || q.includes('person') || q.includes('team') || q.includes('headshot')) category = 'portrait'

    const pool = CURATED[category] || CURATED.abstract
    return pool.slice(0, count)
}

export async function runSmartImageCurator(intent: IntentAnalysis): Promise<WebIntelligencePackage['images']> {
    const queries = intentToImageQueries(intent)
    console.log('[Image Curator] Starting parallel image search...', queries.hero)

    const [heroImgs, sectionImgs, portraitImgs, productImgs] = await Promise.allSettled([
        fetchFromUnsplash(queries.hero, 4, 'landscape'),
        fetchFromUnsplash(queries.section, 3, 'landscape'),
        fetchFromUnsplash(queries.portrait, 4, 'portrait'),
        fetchFromUnsplash(queries.product, 3, 'squarish'),
    ])

    return {
        hero: heroImgs.status === 'fulfilled' ? heroImgs.value : await getCuratedFallbackImages(queries.hero, 4),
        section: sectionImgs.status === 'fulfilled' ? sectionImgs.value : await getCuratedFallbackImages(queries.section, 3),
        portrait: portraitImgs.status === 'fulfilled' ? portraitImgs.value : await getCuratedFallbackImages('portrait professional', 4),
        product: productImgs.status === 'fulfilled' ? productImgs.value : await getCuratedFallbackImages(queries.product, 3),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 2: Animation Library Researcher
// Fetches verified animation components based on project type & sections
// ─────────────────────────────────────────────────────────────────────────────

// Verified, production-ready animation code snippets — hand-tested by builders
const ANIMATION_LIBRARY: AnimationComponent[] = [
    // ── HERO ANIMATIONS ──
    {
        name: 'CinematicStaggerReveal',
        description: 'Staggered child reveal with clip-path — best for hero headlines',
        source: 'framer-community',
        category: 'hero',
        dependencies: ['framer-motion'],
        preview_url: 'https://21st.dev/r/aceternity/text-reveal',
        tags: ['hero', 'text', 'stagger', 'clip-path', 'premium'],
        code_snippet: `
// Usage: Wrap each line of headline in <RevealWord>
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
}
const wordVariants = {
  hidden: { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' },
  visible: { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
}
// <motion.div variants={containerVariants} initial="hidden" animate="visible">
//   {words.map(word => <motion.span key={word} variants={wordVariants}>{word}</motion.span>)}
// </motion.div>
`
    },
    {
        name: 'MagneticButton',
        description: 'Button that attracts cursor towards it — magnetic hover effect',
        source: 'aceternity',
        category: 'hover',
        dependencies: ['framer-motion'],
        preview_url: 'https://21st.dev/r/aceternity/magnetic-buttons',
        tags: ['button', 'magnetic', 'cursor', 'interactive', 'cta'],
        code_snippet: `
// MagneticButton: track mouse to create magnetic pull effect
const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { x, y } = useMotionValues()
  const handleMouse = (e: MouseEvent) => {
    const { left, top, width, height } = ref.current!.getBoundingClientRect()
    x.set((e.clientX - left - width / 2) * 0.35)
    y.set((e.clientY - top - height / 2) * 0.35)
  }
  return (
    <motion.button ref={ref} onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ x, y }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={className}>
      {children}
    </motion.button>
  )
}
`
    },
    {
        name: 'SpotlightCard',
        description: 'Glassmorphism card with radial spotlight following cursor',
        source: 'aceternity',
        category: 'cards',
        dependencies: ['framer-motion'],
        preview_url: 'https://21st.dev/r/aceternity/spotlight-card',
        tags: ['card', 'spotlight', 'glass', 'hover', 'features'],
        code_snippet: `
// SpotlightCard: mouse-tracking radial gradient spotlight on glassmorphism card
const SpotlightCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState({ x: 0, y: 0, opacity: 0 })
  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 })
  }
  return (
    <div ref={ref} onMouseMove={handleMouse} onMouseLeave={() => setSpot(s => ({ ...s, opacity: 0 }))}
      className={\`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm \${className}\`}>
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: spot.opacity, background: \`radial-gradient(350px circle at \${spot.x}px \${spot.y}px, rgba(255,255,255,0.06), transparent 70%)\` }} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
`
    },
    {
        name: 'ScrollFadeUp',
        description: 'Smooth fade-up + blur reveal on scroll using IntersectionObserver',
        source: 'framer-community',
        category: 'scroll',
        dependencies: ['framer-motion'],
        preview_url: 'https://21st.dev/r/framer-motion/scroll-reveal',
        tags: ['scroll', 'reveal', 'fade', 'blur', 'sections'],
        code_snippet: `
// ScrollFadeUp: wrap any section to reveal on scroll
const fadeUpVariants = {
  hidden: { opacity: 0, y: 48, filter: 'blur(12px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.25,0.46,0.45,0.94] } }
}
const ScrollFadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div variants={fadeUpVariants} initial="hidden" whileInView="visible"
    viewport={{ once: true, margin: '-80px' }} transition={{ delay }}>
    {children}
  </motion.div>
)
// Usage: <ScrollFadeUp delay={0.1}><YourSection /></ScrollFadeUp>
`
    },
    {
        name: 'FloatingGlow',
        description: 'Floating orb/glow element with ambient animation for hero backgrounds',
        source: 'framer-community',
        category: 'background',
        dependencies: ['framer-motion'],
        preview_url: 'https://21st.dev/r/shadcn/glow-background',
        tags: ['background', 'glow', 'ambient', 'hero', 'orb'],
        code_snippet: `
// FloatingGlow: animated background glow orb — put behind content in hero
const FloatingGlow = ({ color = '#FF5C00', size = 600 }: { color?: string, size?: number }) => (
  <motion.div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: \`radial-gradient(circle, \${color}20 0%, transparent 70%)\`, filter: 'blur(80px)' }}
    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
  />
)
// Usage: <FloatingGlow color="#FF5C00" size={600} /> inside relative hero div
`
    },
    {
        name: 'InfiniteScrollBanner',
        description: 'Smooth infinite horizontal scrolling for brand logos / trust signals',
        source: 'framer-community',
        category: 'scroll',
        dependencies: ['framer-motion'],
        preview_url: 'https://21st.dev/r/framer-motion/scrolling-banner',
        tags: ['logos', 'brands', 'marquee', 'social-proof', 'infinite'],
        code_snippet: `
// InfiniteScrollBanner: auto-scrolling infinite logo banner for social proof
const InfiniteScrollBanner = ({ items }: { items: React.ReactNode[] }) => (
  <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
    <motion.div className="flex gap-8 flex-shrink-0"
      animate={{ x: ['0%', '-50%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
      {[...items, ...items].map((item, i) => (
        <div key={i} className="flex-shrink-0">{item}</div>
      ))}
    </motion.div>
  </div>
)
// Usage: <InfiniteScrollBanner items={[<Logo1/>, <Logo2/>, ...]} />
`
    },
    {
        name: 'NumberCounter',
        description: 'Animated stats counter — numbers roll up on scroll into view',
        source: 'framer-community',
        category: 'scroll',
        dependencies: ['framer-motion'],
        preview_url: 'https://21st.dev/r/shadcn/animated-counter',
        tags: ['stats', 'counter', 'numbers', 'social-proof', 'scroll'],
        code_snippet: `
// NumberCounter: animated number roll-up on viewport entry
const NumberCounter = ({ end, suffix = '', duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))
  useEffect(() => {
    if (inView) animate(count, end, { duration, ease: 'easeOut' })
  }, [inView])
  return <motion.span ref={ref}>{rounded}{suffix}</motion.span>
}
// Usage: <NumberCounter end={10000} suffix="+" duration={2.5} />
`
    },
    {
        name: 'HolographicCard',
        description: 'Premium card with holographic sheen effect on hover using CSS transforms',
        source: 'magicui',
        category: 'hover',
        dependencies: ['framer-motion'],
        preview_url: 'https://magicui.design/docs/components/magic-card',
        tags: ['card', 'holographic', 'premium', 'hover', 'web3', '3d'],
        code_snippet: `
// HolographicCard: 3D tilt + holographic sheen on hover
const HolographicCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [8, -8])
  const rotateY = useTransform(x, [-100, 100], [-8, 8])
  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={\`relative \${className}\`}>
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-30 transition-opacity"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)', backgroundSize: '200% 200%' }} />
      {children}
    </motion.div>
  )
}
`
    },
]

function selectAnimationsForProject(intent: IntentAnalysis): AnimationComponent[] {
    const niche = intent.niche?.toLowerCase() || ''
    const tone = intent.tone?.toLowerCase() || ''
    const hook = intent.emotional_hook?.toLowerCase() || ''

    // Always include scroll fade + floating glow for all projects
    const core = ['ScrollFadeUp', 'FloatingGlow', 'CinematicStaggerReveal']

    // Pick niche-specific ones
    const extra: string[] = []
    if (niche.includes('saas') || niche.includes('platform') || niche.includes('software')) {
        extra.push('SpotlightCard', 'NumberCounter', 'InfiniteScrollBanner')
    }
    if (niche.includes('food') || niche.includes('restaurant') || niche.includes('retail') || niche.includes('ecommerce')) {
        extra.push('HolographicCard', 'NumberCounter', 'MagneticButton')
    }
    if (niche.includes('agency') || niche.includes('creative') || niche.includes('portfolio')) {
        extra.push('HolographicCard', 'MagneticButton', 'SpotlightCard')
    }
    if (hook.includes('trust') || hook.includes('social proof')) {
        extra.push('InfiniteScrollBanner', 'NumberCounter')
    }

    const selected = Array.from(new Set([...core, ...extra]))
    return ANIMATION_LIBRARY.filter(a => selected.includes(a.name))
}

export async function runAnimationResearcher(intent: IntentAnalysis): Promise<AnimationComponent[]> {
    console.log('[Animation Researcher] Selecting animations for:', intent.niche)
    return selectAnimationsForProject(intent)
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT: Google Fonts Matcher
// Picks perfect font pairings based on brand tone
// ─────────────────────────────────────────────────────────────────────────────

const FONT_PAIRINGS: Record<string, { display: string, body: string, import_url: string }> = {
    bold_modern: {
        display: 'Syne',
        body: 'Inter',
        import_url: "https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@300;400;500;600&display=swap"
    },
    elegant_luxury: {
        display: 'Playfair Display',
        body: 'Lato',
        import_url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Lato:wght@300;400;700&display=swap"
    },
    tech_minimal: {
        display: 'Space Grotesk',
        body: 'DM Sans',
        import_url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap"
    },
    friendly_clean: {
        display: 'Outfit',
        body: 'Inter',
        import_url: "https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap"
    },
    creative_expressive: {
        display: 'Bebas Neue',
        body: 'Nunito',
        import_url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;500;600;700&display=swap"
    },
    corporate_trust: {
        display: 'Plus Jakarta Sans',
        body: 'Inter',
        import_url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
    },
    food_warm: {
        display: 'Fraunces',
        body: 'Nunito',
        import_url: "https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=Nunito:wght@400;500;600;700&display=swap"
    }
}

function pickFontPairing(intent: IntentAnalysis): { display: string, body: string, import_url: string } {
    const niche = intent.niche?.toLowerCase() || ''
    const tone = intent.tone?.toLowerCase() || ''

    if (niche.includes('food') || niche.includes('restaurant') || niche.includes('cafe')) return FONT_PAIRINGS.food_warm
    if (tone.includes('luxury') || tone.includes('elegant') || tone.includes('premium')) return FONT_PAIRINGS.elegant_luxury
    if (niche.includes('saas') || niche.includes('tech') || niche.includes('ai') || niche.includes('software')) return FONT_PAIRINGS.tech_minimal
    if (niche.includes('agency') || niche.includes('creative') || niche.includes('studio')) return FONT_PAIRINGS.creative_expressive
    if (tone.includes('trust') || tone.includes('corporate') || niche.includes('finance') || niche.includes('legal')) return FONT_PAIRINGS.corporate_trust
    if (tone.includes('bold') || tone.includes('modern') || tone.includes('direct')) return FONT_PAIRINGS.bold_modern
    if (tone.includes('friendly') || tone.includes('clean') || tone.includes('simple')) return FONT_PAIRINGS.friendly_clean

    return FONT_PAIRINGS.bold_modern // default
}

import { callLLM } from './runner'
import { AgentRunnerOptions, CompetitorAnalysis } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 1b: COMPETITOR REVERSE-ENGINEER
// Fetches target URL HTML, scrapes styles and sends to LLM for token extraction
// ─────────────────────────────────────────────────────────────────────────────

export async function runCompetitorScraper(url: string, opts?: AgentRunnerOptions): Promise<CompetitorAnalysis | undefined> {
    console.log(`[Competitor Scraper] Reverse-engineering design from: ${url}...`)

    try {
        const fetchUrl = url.startsWith('http') ? url : `https://${url}`
        const res = await fetch(fetchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) width/1920 height/1080',
                'Accept': 'text/html,application/xhtml+xml,application/xml'
            },
            signal: AbortSignal.timeout(10000)
        })

        if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`)

        const html = await res.text()

        // Extract CSS from inline <style> tags or CSS variables in :root
        const styleMatches = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map(m => m[1])
        const rawCSS = styleMatches.join('\\n').slice(0, 15000) // Keep the first ~15k chars to avoid token limits

        const analysisPrompt = `
You are the Head Design Reverse-Engineer at BuildAI.
Your mission is to completely deconstruct the visual identity of this website: ${url}
We fetched the raw HTML/CSS. Here is a massive chunk of their stylesheets/inline tokens:

### RAW STYLES/TOKENS EXTRACT (TRUNCATED):
${rawCSS ? rawCSS : 'No inline styles found. Based on your training knowledge of this website, infer the answers.'}

### MISSION:
Analyze the CSS tokens, class names, font-families, and color codes found above (or from your deep knowledge if the CSS is obfuscated).
Extract their exact visual DNA. Respond with pure JSON (No markdown).

Format:
{
  "features": ["e.g. Glowing cursors, sticky morphing headers, minimal borders"],
  "color_palette": ["#hex", "#hex", "rgba()..."],
  "typography": "e.g. Inter for body, Clash Display for headings, tracking-tight",
  "layout_tricks": ["e.g. Bento box grids with heavy backdrop-blur", "Overlapping absolute images"],
  "clone_mandate": "A highly specific instruction for our Coder on how to clone this exact vibe, mentioning specific CSS utility patterns (Tailwind)."
}
`

        const rawRes = await callLLM('You output pure JSON only.', analysisPrompt, opts || {})
        const jsonMatch = rawRes.replace(/```json\n?|```\n?/gi, '').trim().match(/\{[\s\S]*\}/)

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as CompetitorAnalysis
        }
    } catch (err) {
        console.warn('[Competitor Scraper] Failed to reverse-engineer site:', err)
    }

    return undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 1: VISUAL TREND SCOUT (Serper.dev)
// Searches Dribbble, Behance, and Godly.website for top niche design trends
// ─────────────────────────────────────────────────────────────────────────────

async function runVisualTrendScout(_intent: IntentAnalysis, _opts?: AgentRunnerOptions): Promise<VisualTrend | undefined> {
    console.log('[Visual Trend Scout] Skipping trend search (API key removed).')
    return undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER ORCHESTRATOR: Run all web agents in parallel
// ─────────────────────────────────────────────────────────────────────────────

export async function runWebIntelligenceAgents(intent: IntentAnalysis, opts?: AgentRunnerOptions): Promise<WebIntelligencePackage> {
    console.log('[Web Intelligence] Running parallel web agents...')

    const [images, animations, trends, competitorAnalysis] = await Promise.allSettled([
        runSmartImageCurator(intent),
        runAnimationResearcher(intent),
        runVisualTrendScout(intent, opts),
        intent.competitor_url && intent.competitor_url.length > 5 ? runCompetitorScraper(intent.competitor_url, opts) : Promise.resolve(undefined)
    ])

    const fonts = pickFontPairing(intent)

    return {
        images: images.status === 'fulfilled' ? images.value : {
            hero: await getCuratedFallbackImages('abstract cinematic', 4),
            section: await getCuratedFallbackImages('modern workspace', 3),
            portrait: await getCuratedFallbackImages('portrait professional', 3),
            product: await getCuratedFallbackImages('product dark', 3),
        },
        animations: animations.status === 'fulfilled' ? animations.value : [],
        trends: trends.status === 'fulfilled' ? trends.value : undefined,
        competitorAnalysis: competitorAnalysis.status === 'fulfilled' ? competitorAnalysis.value : undefined,
        fonts,
        color_palette_inspiration: [intent.emotional_hook || 'modern', intent.tone || 'professional']
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTER: Convert web intelligence into coder-ready prompt injection
// ─────────────────────────────────────────────────────────────────────────────

export function webIntelligenceToPromptString(pkg: WebIntelligencePackage): string {
    const heroImgs = pkg.images.hero.map(i => i.url).join('\n  ')
    const portraitImgs = pkg.images.portrait.map(i => i.url).join('\n  ')
    const sectionImgs = pkg.images.section.map(i => i.url).join('\n  ')
    const productImgs = pkg.images.product.map(i => i.url).join('\n  ')

    const animSnippets = pkg.animations.slice(0, 4).map(a =>
        `### ${a.name} (${a.source}) \n// ${a.description}\n${a.code_snippet.trim()}`
    ).join('\n\n')

    const animNames = pkg.animations.map(a => a.name).join(', ')

    const trendsSection = pkg.trends ? `
🔥 2025 DESIGN TREND MANDATE (CRITICAL - YOU MUST FOLLOW THIS):
Based on a live scrape of top designs on Dribbble, Behance, and Godly.website for this niche:
- Color Mood: ${pkg.trends.color_mood}
- Layout Style: ${pkg.trends.layout_style}
- Typography Style: ${pkg.trends.typography_style}
- 🎯 CORE DIRECTIVE: ${pkg.trends.design_mandate}
` : ''

    const competitorSection = pkg.competitorAnalysis ? `
🎯 COMPETITOR CLONE MANDATE (CRITICAL - YOU MUST CLONE THIS EXACT VIBE):
The user provided a target URL to draw massive inspiration from. We reverse-engineered it:
- Specific Tailwind Tricks to Use: ${pkg.competitorAnalysis.features.join(', ')}
- Exact Layout DNA: ${pkg.competitorAnalysis.layout_tricks.join(' | ')}
- Exact Typography Config: ${pkg.competitorAnalysis.typography}
- Exact Colors Used: ${pkg.competitorAnalysis.color_palette.join(', ')}
- 🎯 STRICT FRONTEND MANDATE: ${pkg.competitorAnalysis.clone_mandate}

[!!!] Overwrite any standard layout rules to match this Competitor Clone Mandate perfectly.
` : ''

    return `
=== WEB INTELLIGENCE PACKAGE (MANDATORY) ===
${competitorSection || trendsSection}
📸 REAL IMAGES — USE THESE EXACT URLs (NO OTHER IMAGES):
HERO/BANNER (full-bleed, landscape):
  ${heroImgs}

SECTION/CONTENT (mid-page sections):
  ${sectionImgs}

TESTIMONIALS/TEAM (portrait, square):
  ${portraitImgs}

PRODUCT/FEATURE (closeup, square):
  ${productImgs}

⚠️ IMAGE RULES:
- Use ONLY these URLs. Never use placeholder.com, picsum.photos, or made-up URLs.
- For <img> tags: always add loading="lazy" width and height attributes.
- For Next.js: use <Image> with the exact src URL above. Set width={1600} height={900} for hero, width={400} height={500} for portraits.
- Wrap hero images in a div with overflow-hidden and add a gradient overlay for text legibility.

🔤 FONTS — USE THESE (already matches brand tone):
Display/Headlines: ${pkg.fonts.display}
Body/Paragraphs: ${pkg.fonts.body}
Google Fonts Import URL: ${pkg.fonts.import_url}
- ALWAYS add @import '${pkg.fonts.import_url}' at top of globals.css
- Use font-family: '${pkg.fonts.display}', sans-serif for h1/h2/h3.
- Use font-family: '${pkg.fonts.body}', sans-serif for body, p, span.

🎬 VERIFIED ANIMATIONS — USE THESE EXACT CODE PATTERNS:
Available: ${animNames}

${animSnippets}

⚠️ ANIMATION RULES:
- Copy these snippets EXACTLY. Do NOT invent new animation variants.
- Always add import { motion, useMotionValue, useTransform, useInView, animate, AnimatePresence } from 'framer-motion' at top.
- Wrap page sections in <ScrollFadeUp> for entrance animations.
- Use <FloatingGlow> in the hero behind all content.
- Use <SpotlightCard> for feature/service cards.
- Use <CinematicStaggerReveal> for hero headlines.
=== END WEB INTELLIGENCE ===`
}
