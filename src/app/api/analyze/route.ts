/**
 * /api/analyze — Smart Prompt Analysis Agent v2
 * - Expanded color palette choices (12+) 
 * - Backend/JS awareness
 * - JavaScript stack detection
 * - Smarter prompt enhancement
 */

import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/agents/runner'

const ANALYZER_SYSTEM_PROMPT = `You are an elite product discovery specialist, senior UI/UX architect, and full-stack engineer at BuildAI.
Analyze the user's idea and return structured JSON intelligence to guide an AI code generation pipeline.

Key responsibilities:
1. Deeply understand what the user wants to build — even if described vaguely
2. Detect if this needs a BACKEND (API routes, auth, database, server logic)
3. Detect if they prefer JavaScript or TypeScript
4. Suggest the perfect color palette matched to the industry/emotion
5. Generate smart, relevant questions — NOT generic ones

BACKEND DETECTION RULES:
- Any mention of: login, signup, user account, auth, authentication → has_backend: true, has_auth: true
- Any mention of: database, store data, save, record, history, dashboard with data → has_backend: true, has_database: true
- Any mention of: API, REST, GraphQL, webhook, endpoint → has_backend: true
- Any mention of: payments, checkout, Stripe → has_backend: true
- Pure landing pages, portfolios, informational sites → has_backend: false

JAVASCRIPT vs TYPESCRIPT:
- If user says "JavaScript" or "JS" → stack: "Next.js + JavaScript + Tailwind CSS"
- Default: TypeScript

Respond with ONLY valid JSON in this exact structure (no markdown):
{
  "enhanced_prompt": "A richly detailed professional expansion (3+ sentences). Include: specific design direction, layout details, color emotion, key features, and any backend requirements detected.",
  "project_type": "saas | landing_page | website | dashboard | ecommerce | portfolio | mobile_app | tool | blog | api",
  "detected_theme": "dark | light | auto",
  "has_backend": false,
  "has_database": false,
  "has_auth": false,
  "preferred_language": "typescript | javascript",
  "quiz_questions": [
    {
      "id": "q1",
      "question": "What industry or niche is this for?",
      "type": "single",
      "options": ["SaaS / Tech", "Finance & Fintech", "Healthcare", "Education & E-learning", "E-commerce & Retail", "Creative Agency", "Legal & Consulting", "Real Estate", "Fitness & Wellness", "Food & Restaurant", "Travel & Hospitality", "Other"]
    },
    {
      "id": "q2",
      "question": "What visual style best represents your brand?",
      "type": "single",
      "options": ["Dark & Futuristic (like Linear, Vercel)", "Clean & Minimal (like Stripe, Notion)", "Bold & Colorful (like Figma, Framer)", "Corporate & Professional (like McKinsey)", "Playful & Creative (like Duolingo)", "Luxury & Premium (like Apple, Bang & Olufsen)", "Warm & Human (like Airbnb, Headspace)"]
    },
    {
      "id": "q3",
      "question": "Choose your primary brand color palette",
      "type": "color",
      "options": []
    },
    {
      "id": "q4",
      "question": "Which pages and sections do you need?",
      "type": "multi",
      "options": ["Hero / Landing", "Features / Benefits", "Pricing Plans", "About / Our Story", "Team Members", "Blog / Articles", "Contact Form", "Testimonials / Reviews", "Portfolio / Gallery", "Dashboard / Analytics", "User Authentication", "FAQ / Help Center", "Integrations / Partners", "Roadmap / Changelog"]
    },
    {
      "id": "q5",
      "question": "What animation style fits best?",
      "type": "single",
      "options": ["Subtle & Professional (fade-ins, smooth transitions)", "Dynamic & Impressive (3D, parallax, morphing)", "Minimal (almost none)", "Playful & Bouncy", "Cinematic (scroll-triggered reveals, video-like)"]
    }
  ],
  "color_palettes": [
    {"name": "Midnight Pro", "primary": "#6366f1", "secondary": "#8b5cf6", "bg": "#020617", "surface": "#0f172a"},
    {"name": "Solar Flare", "primary": "#f97316", "secondary": "#ec4899", "bg": "#09090b", "surface": "#18181b"},
    {"name": "Arctic Blue", "primary": "#0ea5e9", "secondary": "#06b6d4", "bg": "#020617", "surface": "#0c1a2e"},
    {"name": "Emerald Matrix", "primary": "#10b981", "secondary": "#0d9488", "bg": "#020c07", "surface": "#0a1f12"},
    {"name": "Rose Gold", "primary": "#f43f5e", "secondary": "#e11d48", "bg": "#0f0507", "surface": "#1a0a0d"},
    {"name": "Deep Purple", "primary": "#a855f7", "secondary": "#7c3aed", "bg": "#0a0612", "surface": "#13092a"}
  ],
  "suggested_features": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "web_search_terms": ["relevant search 1", "search 2"],
  "spline_scene_suggestion": "URL of the most relevant Spline 3D scene (from the list below), or empty if none fits.",
  "animation_21st_dev_instruction": "Sentence summarizing 21st.dev style advanced interactions to use (e.g. magnetic buttons, glossy hover, text reveal) if requested, or empty",
  "image_generation_prompt": "Detailed prompt for generating a hero image for this project"
}

SPLINE 3D SCENE LIBRARY (Pick the most relevant if the user wants 3D/animations):
- Abstract / Tech / SaaS (Purple loops): https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode
- Finance / Crypto (Coins): https://prod.spline.design/kZmWg5cBBvQIfHkY/scene.splinecode
- UI / Dashboard / App (Card stacks): https://prod.spline.design/J39OWeGE3k3rN4R4/scene.splinecode
- Gaming / Controller: https://prod.spline.design/yvxvQv-V0ZcT6Q4k/scene.splinecode
- Creative / Abstract Shapes: https://prod.spline.design/E63FqOBy2-l6rQ0o/scene.splinecode
- E-commerce / Product Box: https://prod.spline.design/n2Mlc0K-f7u25k18/scene.splinecode
- Security / Lock: https://prod.spline.design/i9D39K8FqIfw1D1z/scene.splinecode
- AI / Neural / Matrix: https://prod.spline.design/kZmWg5cBBvQIfHkY/scene.splinecode
`

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        if (!prompt?.trim()) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        const opts = {
            geminiKey: process.env.GEMINI_API_KEY?.trim(),
            kimiKey: process.env.KIMI_API_KEY?.trim(),
            bytezKey: process.env.BYTEZ_API_KEY?.trim(),
        }

        const raw = await callLLM(
            ANALYZER_SYSTEM_PROMPT,
            `Analyze this project idea in depth: "${prompt}"`,
            opts
        )

        const cleanRaw = raw.replace(/```json\n?|```\n?/gi, '').trim()
        const jsonMatch = cleanRaw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Analysis returned invalid response')

        const analysis = JSON.parse(jsonMatch[0])
        return NextResponse.json(analysis)
    } catch (err: any) {
        console.error('[Analyze API Error]', err.message)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
