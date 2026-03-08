/**
 * VibeCoder Multi-Agent Pipeline
 * Intent Parser → Planner → Code Writer → Refactor Agent
 */

export interface ProjectPlan {
    projectType: string
    stack: string[]
    features: string[]
    folderStructure: string[]
    componentBreakdown: string[]
    hasBackend: boolean
    hasDatabase: boolean
    hasAuth: boolean
}

export interface AgentContext {
    plan: ProjectPlan | null
    files: Record<string, string>
    promptHistory: string[]
    buildErrors: string[]
    lastGeneratedCode: string
}

/** Step 1: Intent Parser - extract project intent from prompt */
export function parseIntent(prompt: string): Partial<ProjectPlan> {
    const lower = prompt.toLowerCase()

    const projectType = lower.includes('dashboard')
        ? 'dashboard'
        : lower.includes('landing')
            ? 'landing'
            : lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store')
                ? 'ecommerce'
                : lower.includes('blog')
                    ? 'blog'
                    : lower.includes('saas')
                        ? 'saas'
                        : lower.includes('portfolio')
                            ? 'portfolio'
                            : lower.includes('chat') || lower.includes('messaging')
                                ? 'chat'
                                : lower.includes('api')
                                    ? 'api'
                                    : 'webapp'

    const hasBackend =
        lower.includes('api') ||
        lower.includes('backend') ||
        lower.includes('auth') ||
        lower.includes('login') ||
        lower.includes('database') ||
        lower.includes('supabase') ||
        lower.includes('prisma')

    const hasDatabase =
        lower.includes('database') ||
        lower.includes('db') ||
        lower.includes('supabase') ||
        lower.includes('prisma') ||
        lower.includes('mongodb') ||
        lower.includes('store data')

    const hasAuth =
        lower.includes('auth') ||
        lower.includes('login') ||
        lower.includes('signup') ||
        lower.includes('user') ||
        lower.includes('account')

    const stack: string[] = ['React', 'Tailwind CSS']
    if (lower.includes('next') || hasBackend) stack.push('Next.js')
    if (lower.includes('typescript') || lower.includes('ts')) stack.push('TypeScript')
    if (hasDatabase && lower.includes('prisma')) stack.push('Prisma')
    if (lower.includes('supabase')) stack.push('Supabase')

    return { projectType, hasBackend, hasDatabase, hasAuth, stack }
}

/** Step 2: Build a planner prompt that supplements the main prompt */
export function buildPlannerPrompt(
    userPrompt: string,
    intent: Partial<ProjectPlan>,
    isRefactor: boolean,
    existingFiles: string[]
): string {
    if (isRefactor && existingFiles.length > 0) {
        return `
You are a senior refactor agent. The user wants to MODIFY an existing project.

EXISTING FILES IN PROJECT:
${existingFiles.map((f) => `- ${f}`).join('\n')}

USER MODIFICATION REQUEST:
"${userPrompt}"

RULES:
- ONLY regenerate the files that need to change.
- For each modified file, output a full <file path="..."> block with the COMPLETE new file content.
- Do NOT modify files unrelated to the request.
- Keep all existing functionality intact unless explicitly asked to change it.
- Output ONLY <file> blocks. No markdown. No explanation.
`.trim()
    }

    return `
You are building a ${intent.projectType || 'web'} application that must look and feel like a Figma showcase or Google Stitch demo — world-class, premium, publication-quality.

DETECTED REQUIREMENTS:
- Stack: ${(intent.stack || ['React', 'Tailwind CSS']).join(', ')}
- Needs Backend: ${intent.hasBackend ? 'YES' : 'NO'}
- Needs Database: ${intent.hasDatabase ? 'YES' : 'NO'}
- Needs Auth: ${intent.hasAuth ? 'YES' : 'NO'}

USER REQUEST:
"${userPrompt}"

══════════════════════════════════════════════════════════
  ARCHITECTURE RULES (CRITICAL)
══════════════════════════════════════════════════════════
1. Generate a COMPLETE multi-file Next.js project. NEVER put all code in one file.
2. Split into: src/app/, src/components/sections/, src/components/ui/, src/lib/, src/hooks/, src/types/
3. Each major section (Hero, Features, Pricing, Testimonials, CTA, Navbar, Footer) MUST be its own file.
4. Include package.json (all deps), tailwind.config.ts, next.config.ts.
5. PREVIEW FILE: ALWAYS generate public/preview.html as a STANDALONE Tailwind CDN file.
   - For Multi-page "Websites": preview.html is a full SPA. Use showPage(pageId) JS function for navigation. NO real href navigation.
   - GENERATION ORDER: public/preview.html is ALWAYS the LAST FILE WRITTEN.

══════════════════════════════════════════════════════════
  VISUAL EXCELLENCE SYSTEM (MANDATORY)
══════════════════════════════════════════════════════════

BACKGROUND:
- bg-[#020617] (midnight navy — not pure black, not gray-950)
- Atmospheric depth orbs: large absolute blurred divs in orange/violet at low opacity

TYPOGRAPHY:
- Heroes: text-7xl to text-8xl, font-black, leading-[1.0]
- Gradient text: bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent
- Section labels: text-xs font-bold uppercase tracking-[0.2em] text-orange-400

GLASSMORPHISM CARDS (on every card element):
- bg-white/[0.025] backdrop-blur-2xl border border-white/[0.06] rounded-2xl
- Hover: border-orange-500/25 -translate-y-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)]
- Top shimmer: absolute h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent

IMAGES (REAL UNSPLASH — MANDATORY IN EVERY SECTION):
- Hero image: glow-wrapped with absolute -inset-6 blur-3xl gradient orb behind it
- Feature cards: real image at top of each bento card, with gradient overlay + hover:scale-105
- Testimonial avatars: real portraits with ring-2 ring-orange-500/40 ring-offset treatment
- NO placeholder images. NO colored boxes. NO emoji icons as images.

SECTIONS TO INCLUDE (build all of these):
1. HERO: Asymmetric 2-col (lg:grid-cols-[1fr_1.3fr]), animated badge, massive headline with gradient, glow-wrapped image, dual CTAs
2. FEATURES: Bento grid (grid-cols-3, featured card col-span-2) — each card has real top image + glassmorphism
3. BENEFITS/HOW IT WORKS: Alternating image+text rows with timeline or step indicators
4. STATS: 4 big-number metrics in a glowing bar
5. TESTIMONIALS: Quote-wall or masonry layout with real avatars
6. PRICING: 3-tier cards, highlight middle tier with gradient border + glow
7. CTA: Full-width section with gradient background + atmospheric orbs
8. NAVBAR: Glassmorphism sticky, logo with glow, nav links, CTA button
9. FOOTER: Multi-column rich grid

FRAMER MOTION (use on every section):
- Entry: variants with staggerChildren:0.12, opacity 0→1, y 40→0, duration 0.7
- Hover effects: scale(1.03), boxShadow glow increase
- CTA buttons: whileHover={scale:1.03, glowShadow} whileTap={scale:0.97}

6. Output ONLY <file path="..."> blocks. No markdown. No explanations.
`.trim()
}

/** Step 3: Detect if this is a refactor request vs a new build.
 * When a project already exists, we default to REFACTOR unless the user
 * explicitly asks to build something completely new / different.
 */
export function isRefactorRequest(prompt: string, hasExistingProject: boolean): boolean {
    if (!hasExistingProject) return false

    // Keywords that explicitly request a FULL REBUILD from scratch
    const fullRebuildKeywords = [
        'start over', 'start fresh', 'start from scratch', 'rebuild',
        'completely new', 'brand new project', 'new project', 'build a new',
        'create a new', 'generate a new', 'make a new', 'new website',
        'different project', 'different app', 'different website',
        'discard', 'reset', 'wipe',
    ]

    const lower = prompt.toLowerCase()

    // If user clearly wants a full rebuild, don't refactor
    if (fullRebuildKeywords.some((kw) => lower.includes(kw))) {
        return false
    }

    // Otherwise, if there's an existing project → ALWAYS refactor/edit
    // This prevents the AI from wiping the entire project on simple edits
    return true
}

/** Step 4: Parse files from AI output into a Record */
export function parseFilesFromOutput(code: string): Record<string, string> {
    const files: Record<string, string> = {}
    const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g
    let match
    while ((match = regex.exec(code)) !== null) {
        files[match[1]] = match[2].trim()
    }
    return files
}

/** Step 5: Merge refactor output into existing project files */
export function mergeFiles(
    existing: Record<string, string>,
    newFiles: Record<string, string>
): Record<string, string> {
    return { ...existing, ...newFiles }
}

/**
 * ProjectStateManager — DEPRECATED
 * Per-project state is now handled by ProjectDatabase in lib/db.ts,
 * keyed by project ID. This stub is kept for backward compatibility.
 * @deprecated Use ProjectDatabase.saveProjectState / loadProjectState instead
 */
export class ProjectStateManager {
    private static KEY = 'vibecoder_project_state'

    static save(context: AgentContext): void {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(context))
        } catch { }
    }

    static load(): AgentContext | null {
        try {
            const raw = localStorage.getItem(this.KEY)
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    }

    static clear(): void {
        try {
            localStorage.removeItem(this.KEY)
        } catch { }
    }

    static updateFiles(files: Record<string, string>): void {
        const ctx = this.load()
        if (ctx) {
            ctx.files = { ...ctx.files, ...files }
            this.save(ctx)
        }
    }
}
