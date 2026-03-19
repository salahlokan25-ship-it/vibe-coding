import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// The Stitch Design Agent
// Inspired by Google Stitch — a dedicated design-thinking pass that produces a
// full DesignBlueprint before any code is written.
//
// This runs SILENTLY in the background. The user sees only the loading spinner.
// Once the blueprint is ready, it is injected into every code-generation prompt,
// ensuring every generated file follows the same visual language.
// ─────────────────────────────────────────────────────────────────────────────

const STITCH_DESIGN_PROMPT = `You are BuildAI's Design Intelligence Core — an AI agent that thinks exactly like a world-class product designer at Google, Stripe, or Linear.

Your job is to produce a complete DESIGN BLUEPRINT from a user's idea. This blueprint is then used by code-generation agents to build the entire website. Every detail you define will be strictly followed.

Think deeply about:
1. What kind of product this is and who uses it
2. What emotional response the design should trigger (trust, excitement, curiosity, etc.)
3. What visual language best suits this product (dark luxury, clean minimal, bold startup, etc.)
4. How the page flow should guide the user from landing to conversion

OUTPUT FORMAT — respond with ONLY this JSON (no markdown, no explanation):
{
  "product": {
    "name": "Concise product name",
    "tagline": "One-line value proposition (compelling, specific)",
    "category": "saas | ecommerce | portfolio | dashboard | agency | health | finance | education | other",
    "audience": "Description of the target user in 1 sentence",
    "emotion": "The feeling the design should evoke (e.g. 'confidence and edge', 'calm and focus')"
  },
  "visual_language": {
    "style": "One of: dark-luxury | clean-minimal | bold-startup | warm-organic | futuristic-glass | editorial-magazine",
    "personality": "3 adjective words describing the brand (e.g. 'bold, modern, trustworthy')",
    "inspiration": "Real product references (e.g. 'Stripe + Linear + Vercel')"
  },
  "color_system": {
    "background": "#hex — deep page background",
    "surface": "#hex — card/panel background",
    "border": "rgba for subtle borders e.g. rgba(255,255,255,0.07)",
    "primary": "#hex — main brand/CTA color",
    "primary_glow": "rgba for glow shadows e.g. rgba(99,102,241,0.4)",
    "secondary": "#hex — accent or highlight color",
    "text_headline": "#hex — headline text (often white or near-white)",
    "text_body": "rgba for body text e.g. rgba(255,255,255,0.65)",
    "gradient_hero": "CSS gradient for hero headline e.g. linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)"
  },
  "typography": {
    "display_font": "Google Font name for headlines (e.g. 'Inter', 'Syne', 'Plus Jakarta Sans', 'DM Sans')",
    "body_font": "Google Font for body (usually 'Inter')",
    "headline_weight": "800 or 900",
    "headline_size_hero": "Tailwind class e.g. text-7xl",
    "headline_size_section": "Tailwind class e.g. text-4xl",
    "body_size": "text-base or text-lg",
    "tracking": "tracking-tight or tracking-tighter"
  },
  "layout": {
    "hero_pattern": "One of: asymmetric-2col | full-bleed-center | split-diagonal | floating-ui-cards | video-background",
    "hero_description": "Detailed description of the hero section layout, elements, and visual hierarchy",
    "sections": [
      {
        "id": "hero",
        "name": "Hero",
        "pattern": "Layout pattern name",
        "content": "What content goes here and how it's structured",
        "visual_element": "Key image or 3D element to use",
        "animation": "Entry animation type"
      }
    ],
    "max_sections": 7
  },
  "components": {
    "navbar": "Description of navbar style (e.g. 'glass blur navbar with logo left, links center, CTA button right in primary color')",
    "cta_button": "Primary CTA button style in Tailwind classes",
    "cards": "Card style description for feature/product cards",
    "footer": "Footer layout and content description"
  },
  "imagery": {
    "hero_image_url": "Best Unsplash URL for this project's hero (from the list below)",
    "feature_image_urls": ["up to 3 relevant Unsplash URLs"],
    "avatar_urls": [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=85",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=85",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=85"
    ],
    "image_treatment": "How images should be styled (e.g. 'glow-wrapped with gradient overlay', 'full-bleed with dark gradient mask')"
  },
  "animations": {
    "entry": "Description of scroll/load animations (e.g. 'staggered fade-up with 0.12s delay between items')",
    "hover": "Hover effects (e.g. 'scale(1.02), translateY(-4px), glow shadow increase')",
    "cta_pulse": "CTA animation (e.g. 'subtle pulse glow every 2s')",
    "special": "Any unique animation idea for this project type"
  },
  "copy_examples": {
    "hero_headline": "Example compelling headline for this product",
    "hero_subheadline": "Example subheadline (supporting the headline, 1-2 sentences)",
    "cta_text": "CTA button text",
    "stats": [
      { "value": "10K+", "label": "Example stat label" }
    ]
  }
}

UNSPLASH IMAGE LIBRARY (pick the most relevant URLs):
- Tech/AI: https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=90
- Dashboard/Analytics: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=90
- Coding/Dev: https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=90
- Abstract 3D: https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1400&q=90
- Office/Team: https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=90
- Finance: https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=90
- Health/Wellness: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=90
- Yoga/Fitness: https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=90
- E-commerce/Product: https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=90
- Food/Restaurant: https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=90
- Real Estate: https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=90
- Education: https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=90
- Travel: https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=90
- Dark Server: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=90
- City Night: https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=90

SPLINE 3D SCENE LIBRARY (Pick the most relevant if the user requests 3D/animations):
- Abstract / Tech / SaaS (Purple loops): https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode
- Finance / Crypto (Coins): https://prod.spline.design/kZmWg5cBBvQIfHkY/scene.splinecode
- UI / Dashboard / App (Card stacks): https://prod.spline.design/J39OWeGE3k3rN4R4/scene.splinecode
- Gaming / Controller: https://prod.spline.design/yvxvQv-V0ZcT6Q4k/scene.splinecode
- Creative / Abstract Shapes: https://prod.spline.design/E63FqOBy2-l6rQ0o/scene.splinecode
- E-commerce / Product Box: https://prod.spline.design/n2Mlc0K-f7u25k18/scene.splinecode
- Security / Lock: https://prod.spline.design/i9D39K8FqIfw1D1z/scene.splinecode
- AI / Neural / Matrix: https://prod.spline.design/kZmWg5cBBvQIfHkY/scene.splinecode

21ST.DEV ANIMATION STANDARDS:
If the user's prompt explicitly requests complex animations, "21st.dev" inspired features, interactive components, hover effects, etc:
- Incorporate these terms into your animation descriptions: "Magnetic tracker buttons", "Spotlight hover cards", "Staggered text reveals", "Holographic reflections".

PREMIUM DESIGN ARCHETYPES (Enforce these rules for all outputs):
1. Layout Archetypes: Do not default to simple stacked sections. If there are 4-8 features, use a "Bento Grid" pattern. For "How it Works", use side-by-side sticky-scroll. Use asymmetric split layouts (e.g. text left, image right) in the hero section for a premium Linear/Stripe feel.
2. Premium Variables: Force the use of fluid typography using clamp() in the size descriptions, e.g. "text-[clamp(2.5rem,5vw,5rem)]".
3. High-Fidelity Details: Ensure borders are subtle \`rgba(255,255,255,0.07)\`, background gradients use multiple overlay points, and buttons use inset shadows or multi-layered box-shadows.
`

async function callGeminiForDesign(apiKey: string, userPrompt: string): Promise<string> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: STITCH_DESIGN_PROMPT,
    })
    const result = await model.generateContent(`Design brief: "${userPrompt}"`)
    return result.response.text()
}

async function callOpenAICompatibleForDesign(
    baseUrl: string,
    model: string,
    apiKey: string,
    userPrompt: string
): Promise<string> {
    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: STITCH_DESIGN_PROMPT },
                { role: 'user', content: `Design brief: "${userPrompt}"` },
            ],
            stream: false,
            temperature: 0.2,
            max_tokens: 4096,
        }),
    })
    if (!res.ok) throw new Error(`${model} failed: ${res.statusText}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
}

export async function POST(req: NextRequest) {
    const { prompt } = await req.json()

    if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim()
    const kimiKey = process.env.KIMI_API_KEY?.trim()
    const bytezKey = process.env.BYTEZ_API_KEY?.trim()

    let raw = ''

    // Try Kimi first (fastest), then Gemini, then ByteZ
    try {
        if (kimiKey) {
            raw = await callOpenAICompatibleForDesign(
                'https://integrate.api.nvidia.com/v1',
                'moonshotai/kimi-k2-instruct',
                kimiKey,
                prompt
            )
        } else if (geminiKey) {
            raw = await callGeminiForDesign(geminiKey, prompt)
        } else if (bytezKey) {
            raw = await callOpenAICompatibleForDesign(
                'https://api.bytez.com/v1',
                'deepseek-ai/DeepSeek-V3',
                bytezKey,
                prompt
            )
        } else {
            throw new Error('No AI provider configured')
        }
    } catch (err: any) {
        console.error('[Stitch Agent] Error:', err.message)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }

    // Extract JSON from response
    const cleanRaw = raw.replace(/```json\n?|```\n?/gi, '').trim()
    const jsonMatch = cleanRaw.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
        console.error('[Stitch Agent] Invalid response:', raw.substring(0, 300))
        return NextResponse.json({ error: 'Invalid design blueprint from AI' }, { status: 500 })
    }

    try {
        const blueprint = JSON.parse(jsonMatch[0])
        return NextResponse.json({ blueprint })
    } catch {
        return NextResponse.json({ error: 'Failed to parse design blueprint JSON' }, { status: 500 })
    }
}
