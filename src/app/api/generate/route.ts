import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `You are an elite Senior Full-Stack Engineer, Art Director, and UI Lead at BuildAI.
You build production-grade applications that RIVAL Stripe, Linear, Vercel, and Figma showcase pages in visual excellence.
Every output must look like it was designed by a senior Figma designer and engineered by a 10x developer.

══════════════════════════════════════════════════════════════════
  ARCHITECTURE — NON-NEGOTIABLE
══════════════════════════════════════════════════════════════════

Generate a PROPERLY STRUCTURED multi-file project. NEVER dump all code in one file.

REQUIRED STRUCTURE:
  src/app/layout.tsx        ← Root layout, Inter/Syne font via next/font/google
  src/app/page.tsx          ← Home page assembler (imports sections)
  src/app/globals.css       ← Global CSS vars, scrollbar styling
  src/app/[route]/page.tsx  ← Additional pages (for Website type)
  src/components/Navbar.tsx ← Glassmorphism sticky nav + mobile drawer
  src/components/Footer.tsx ← Rich footer with grid layout
  src/components/sections/Hero.tsx
  src/components/sections/Features.tsx  ← Bento grid
  src/components/sections/Testimonials.tsx
  src/components/sections/Pricing.tsx
  src/components/sections/CTA.tsx
  src/lib/utils.ts
  tailwind.config.ts
  package.json
  public/preview.html       ← ALWAYS LAST

FILE FORMAT:
<file path="relative/path">
complete file content
</file>

══════════════════════════════════════════════════════════════════
  ⚡ VISUAL EXCELLENCE SYSTEM — MANDATORY COMMANDMENTS
══════════════════════════════════════════════════════════════════

## TYPOGRAPHY
- font-family: 'Inter' (body) and 'Syne' (display headlines)
- Hero headline: text-7xl md:text-8xl font-black leading-[1.0]
- Gradient headline: className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
- Section label: text-xs font-bold uppercase tracking-[0.2em] text-orange-400

## BACKGROUND & ATMOSPHERE
- Root: bg-[#020617] (deep midnight navy — not black)
- Gradient orbs for depth:
  <div className="absolute top-0 -left-64 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />
  <div className="absolute bottom-0 -right-64 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
- Subtle grid overlay: bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]

## GLASSMORPHISM CARD TEMPLATE
<div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-2xl
    p-8 transition-all duration-400 hover:border-orange-500/25 hover:-translate-y-1
    hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,92,0,0.1)] group">
  {/* Shimmer top edge */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
</div>

## HERO SECTION (choose one style)
STYLE A — Asymmetric 2-column:
  <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.3fr] gap-16 items-center">
      {/* Left: copy */}
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold uppercase tracking-[0.15em] mb-8">
          [Badge text]
        </div>
        <h1 className="text-6xl md:text-8xl font-black leading-[1.0] text-white mb-6">
          [Headline] <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">[Gradient word]</span>
        </h1>
        <p className="text-lg text-white/60 max-w-lg mb-10 leading-relaxed">[Subtitle]</p>
        {/* Dual CTA */}
      </div>
      {/* Right: GLOW-WRAPPED IMAGE */}
      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/25 to-violet-600/25 rounded-3xl blur-3xl" />
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img src="[UNSPLASH_URL]" alt="Hero" className="w-full h-[580px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#020617]/50 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  </section>

## BENTO GRID FEATURES (REQUIRED PATTERN)
<div className="grid grid-cols-3 auto-rows-auto gap-4">
  {/* Large featured card */}
  <div className="col-span-2 row-span-2 ...glassmorphism...">
    <div className="relative h-64 -mx-8 -mt-8 mb-6 overflow-hidden rounded-t-2xl">
      <img src="[URL]" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
    </div>
    ...
  </div>
  {/* Smaller cards col-span-1 each */}
</div>

## CTA PRIMARY BUTTON
<motion.button
  whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(255,92,0,0.6)' }}
  whileTap={{ scale: 0.97 }}
  className="relative group px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm overflow-hidden shadow-[0_0_20px_rgba(255,92,0,0.35)]"
>
  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  <span className="relative flex items-center gap-2">[Label] <ArrowRight size={16} /></span>
</motion.button>

## FRAMER MOTION PATTERNS
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const item = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } } }
// Apply: <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>

══════════════════════════════════════════════════════════════════
  📸 UNSPLASH IMAGE LIBRARY — USE REAL IMAGES ALWAYS
══════════════════════════════════════════════════════════════════

TECH / AI / SAAS:
  AI visual:   https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=90
  Dashboard:   https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=90
  Coding:      https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=90
  Abstract AI: https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1400&q=90
  Dark server: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=90
  Workspace:   https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=90

BUSINESS / FINANCE:
  Office:      https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=90
  Meeting:     https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&q=90
  Finance:     https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=90
  Team:        https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=90
  City night:  https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=90

FITNESS / LIFESTYLE:
  Gym:         https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=90
  Running:     https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=90
  Design:      https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1400&q=90

PORTRAITS (avatars, small w=300):
  P1: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=90
  P2: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=90
  P3: https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=90
  P4: https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=90
  P5: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=90

══════════════════════════════════════════════════════════════════
  ROUTING & PREVIEW RULES
══════════════════════════════════════════════════════════════════

- ARCHITECTURE:
  - Landing Page: 1 route (src/app/page.tsx) + components in src/components/sections/
  - Website: Multiple routes in src/app/ AND separate page components
- LIVE PREVIEW: ALWAYS generate public/preview.html as the VERY LAST file.
  - standalone Tailwind CDN file. For Websites: SPA with showPage() JS navigation.
- Output ONLY <file path="..."> blocks. No markdown. No explanations.
- The project must run with: npm install && npm run dev`


// Prioritize stable models for reliability (Updated for Feb 2026)
const MODELS = [
  "gemini-1.5-flash-8b"
]

const STITCH_PROMPT = `You are an elite Senior Full-Stack Engineer, Art Director, and UI Lead powered by DeepSeek-V3 at BuildAI.
You build jaw-dropping, production-grade, perfectly organized applications that rival Stripe, Linear, Vercel, and Figma showcases.
Every output must feel like it was designed in a top-tier design studio and coded by a principal engineer.

══════════════════════════════════════════════════════════════════
  ARCHITECTURE RULES — NON-NEGOTIABLE
══════════════════════════════════════════════════════════════════

NEVER dump everything into one file. You MUST split into:

  src/app/
    layout.tsx       ← Root layout with Syne+Inter fonts, metadata
    page.tsx         ← Home / landing page assembler
    globals.css      ← CSS vars, scrollbar styling, keyframes
    [route]/page.tsx ← Each major page route (for Website type)
    api/*/route.ts   ← All API endpoints

  src/components/
    Navbar.tsx       ← Glassmorphism sticky nav + mobile drawer
    Footer.tsx       ← Rich grid footer
    ui/Button.tsx    ← Reusable primitives (primary, ghost, icon)
    ui/Card.tsx
    ui/Badge.tsx
    sections/Hero.tsx        ← Asymmetric 2-col or full-bleed
    sections/Features.tsx    ← Bento grid with real images
    sections/Pricing.tsx
    sections/CTA.tsx             ← Gradient-bg section
    sections/Testimonials.tsx    ← Quote-wall or masonry

  src/lib/
    utils.ts         ← cn(), formatDate(), etc.
    constants.ts     ← App-wide constants

  tailwind.config.ts
  package.json       ← ALL deps
  public/preview.html ← ALWAYS LAST

══════════════════════════════════════════════════════════════════
  ⚡ VISUAL EXCELLENCE SYSTEM — MANDATORY
══════════════════════════════════════════════════════════════════

## BACKGROUND & ATMOSPHERE
- Root: #020617 (midnight navy, not black)
- Atmospheric depth orbs:
  <div className="absolute top-0 -left-96 w-[700px] h-[700px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none" />
  <div className="absolute bottom-0 -right-96 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none" />

## TYPOGRAPHY
- Display/Hero: font-syne font-black, text-7xl md:text-8xl, leading-[1.0]
- Gradient headline: bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 bg-clip-text text-transparent
- Section label pill: inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold uppercase tracking-[0.15em]

## GLASSMORPHISM CARDS
backdrop-blur-2xl bg-white/[0.025] border border-white/[0.06] rounded-2xl
top shimmer: absolute h-px top-0 inset-x-0 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent
hover: border-orange-500/25 -translate-y-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)]

## HERO (Asymmetric 2-col)
<section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
  atmosphere orbs
  <div className="grid lg:grid-cols-[1fr_1.35fr] gap-16 items-center max-w-7xl mx-auto px-6">
    LEFT: badge + H1 gradient + subtitle + dual CTAs + social proof logos
    RIGHT: glow-wrapped Unsplash image + floating stat mini-card
  </div>
</section>

## BENTO GRID FEATURES
grid grid-cols-3 auto-rows-auto gap-4 — featured card: col-span-2 row-span-2 with large top image

## IMAGES — MANDATORY IN EVERY SECTION
Hero (glow-wrapped):
  <div className="relative">
    <div className="absolute -inset-6 bg-gradient-to-br from-orange-500/20 to-violet-600/20 rounded-3xl blur-3xl" />
    <div className="relative rounded-2xl overflow-hidden border border-white/10">
      <img src="[UNSPLASH_URL]" className="w-full h-[580px] object-cover" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#020617]/50 to-transparent" />
    </div>
  </div>

Bento card image:
  <div className="relative -mx-8 -mt-8 h-52 mb-6 overflow-hidden rounded-t-2xl">
    <img src="[URL]" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
  </div>

Testimonial avatar:
  <img src="[PORTRAIT_URL]" className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/40 ring-offset-2 ring-offset-[#020617]" />

UNSPLASH LIBRARY:
  AI:        https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=90
  Dashboard: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=90
  Coding:    https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=90
  Abstract:  https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1400&q=90
  Office:    https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=90
  Team:      https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=90
  Finance:   https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=90
  City:      https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=90
  Fitness:   https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=90
  Portrait1: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=90
  Portrait2: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=90
  Portrait3: https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=90
  Portrait4: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=90

## FRAMER MOTION
const variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const item = { hidden: { opacity:0, y:40 }, show: { opacity:1, y:0, transition: { duration:0.7, ease:[0.25,0.46,0.45,0.94] } } }
Parallax: useScroll + useTransform for hero image Y offset

## CTA BUTTON
<motion.button whileHover={{ scale:1.03, boxShadow:'0 0 40px rgba(255,92,0,0.6)' }} whileTap={{ scale:0.97 }}
  className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm overflow-hidden shadow-[0_0_20px_rgba(255,92,0,0.35)]">
  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
  <span className="relative flex items-center gap-2">[Label] <ArrowRight size={16} /></span>
</motion.button>

══════════════════════════════════════════════════════════════════
  PREVIEW & ROUTING RULES
══════════════════════════════════════════════════════════════════

- Landing Page: 1 route src/app/page.tsx + section components
- Website: Multiple routes (src/app/page.tsx, src/app/about/page.tsx, etc.)
- LIVE PREVIEW: public/preview.html — ALWAYS LAST. Tailwind CDN. SPA for Websites.
- Output ONLY <file path="..."> blocks. No markdown. No explanations.
- App must run with: npm install && npm run dev`

import { parseIntent, buildPlannerPrompt, isRefactorRequest } from '@/lib/agent'

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      history = [],
      useStitch,
      useKimi,              // Kimi K2.5 mode (NVIDIA NIM)
      existingFiles = {},
      forceNew = false
    } = await req.json()

    const geminiKey = process.env.GEMINI_API_KEY?.trim()
    const bytezKey = process.env.BYTEZ_API_KEY?.trim()
    const kimiKey = process.env.KIMI_API_KEY?.trim()

    // ── AGENT LAYER ──────────────────────────────────────────────────────────
    const hasExistingProject = Object.keys(existingFiles).length > 0
    const isRefactor = !forceNew && isRefactorRequest(prompt, hasExistingProject)
    const intent = parseIntent(prompt)
    const agentPrompt = buildPlannerPrompt(prompt, intent, isRefactor, Object.keys(existingFiles))
    // ─────────────────────────────────────────────────────────────────────────

    // Choose system prompt based on selected model / mode
    const currentSystemPrompt = (useStitch || useKimi) ? STITCH_PROMPT : SYSTEM_PROMPT

    // ── PROVIDER 1: KIMI K2.5 (Moonshot AI via NVIDIA NIM) ───────────────────
    if (useKimi && kimiKey) {
      try {
        console.log('Attempting Kimi K2.5 generation via NVIDIA NIM...')
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${kimiKey}`,
          },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2-instruct',
            messages: [
              { role: 'system', content: currentSystemPrompt },
              ...history.map((h: any) => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content,
              })),
              { role: 'user', content: agentPrompt },
            ],
            stream: true,
            temperature: 0.15,
            max_tokens: 16384,
            top_p: 0.9,
          }),
        })

        if (response.ok && response.body) {
          console.log('Kimi K2.5 stream started successfully.')
          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder()
              try {
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break
                  const chunk = decoder.decode(value, { stream: true })
                  const lines = chunk.split('\n').filter(l => l.trim() !== '')
                  for (const line of lines) {
                    if (line.includes('[DONE]')) continue
                    if (line.startsWith('data: ')) {
                      try {
                        const data = JSON.parse(line.slice(6))
                        const content = data.choices?.[0]?.delta?.content || ''
                        if (content) {
                          controller.enqueue(encoder.encode(content.replace(/```html\n?|```\n?/gi, '')))
                        }
                      } catch (_) { /* skip malformed chunks */ }
                    }
                  }
                }
                controller.close()
              } catch (err: any) {
                console.error('Kimi stream error:', err.message)
                controller.close()
              }
            },
          })

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Transfer-Encoding': 'chunked',
            },
          })
        } else {
          const errData = await response.json().catch(() => ({}))
          console.warn('Kimi K2.5 failed, falling back:', errData.message || response.statusText)
        }
      } catch (err: any) {
        console.error('Kimi connection failed:', err.message)
      }
    }

    // ── PROVIDER 2: DEEPSEEK-V3 via ByteZ (Stitch mode) ─────────────────────
    if (useStitch && bytezKey && bytezKey !== 'your_bytez_key_here') {
      try {
        console.log("Attempting Stitch generation with ByteZ (DeepSeek-V3)...");
        const response = await fetch("https://api.bytez.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${bytezKey}`
          },
          body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V3", // High-end coding model on ByteZ
            messages: [
              { role: "system", content: currentSystemPrompt },
              ...history.map((h: any) => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content
              })),
              { role: "user", content: agentPrompt }
            ],
            stream: true,
            temperature: 0.2
          })
        });

        if (response.ok && response.body) {
          console.log("ByteZ stream started successfully.");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split('\n').filter(line => line.trim() !== '');

                  for (const line of lines) {
                    if (line.includes('[DONE]')) continue;
                    if (line.startsWith('data: ')) {
                      try {
                        const data = JSON.parse(line.slice(6));
                        const content = data.choices[0]?.delta?.content || "";
                        if (content) {
                          const sanitized = content.replace(/```html\n?|```\n?/gi, '');
                          controller.enqueue(encoder.encode(sanitized));
                        }
                      } catch (e) {
                        // Skip partial JSON chunks
                      }
                    }
                  }
                }
                controller.close();
              } catch (err: any) {
                console.error("ByteZ stream read error:", err.message);
                controller.close();
              }
            }
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Transfer-Encoding': 'chunked',
            },
          });
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn("ByteZ failed, falling back to Gemini:", errData.error || response.statusText);
        }
      } catch (err: any) {
        console.error("ByteZ connection failed:", err.message);
      }
    }

    // ── PROVIDER 3: GEMINI (default / fallback) ───────────────────────────────
    if (!geminiKey || geminiKey === 'your_free_api_key_here') {
      return NextResponse.json({ error: 'Gemini API Key Missing' }, { status: 401 })
    }

    const genAI = new GoogleGenerativeAI(geminiKey)
    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: agentPrompt }] },
    ]

    let streamResult = null;
    let successfulModel = "";

    for (const modelName of MODELS) {
      try {
        console.log(`Attempting Gemini generation with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: currentSystemPrompt
        })

        const result = await model.generateContentStream({ contents })
        streamResult = result.stream;
        successfulModel = modelName;
        break;
      } catch (err: any) {
        console.error(`Gemini Model ${modelName} failed:`, err.message);
        continue;
      }
    }

    if (!streamResult) {
      throw new Error("All AI models failed to initialize.");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of streamResult) {
            const chunkText = chunk.text()
            const sanitized = chunkText.replace(/```html\n?|```\n?/gi, '')
            controller.enqueue(encoder.encode(sanitized))
          }
          controller.close()
        } catch (err: any) {
          console.error(`Gemini stream failed:`, err.message);
          controller.close();
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error: any) {
    console.error("Global Generation Error:", error.message);
    const status = error?.message?.includes('429') ? 429 : 500;
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status })
  }
}
