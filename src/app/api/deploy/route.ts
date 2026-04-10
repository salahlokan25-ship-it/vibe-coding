import { NextRequest, NextResponse } from 'next/server'

/**
 * /api/deploy — One-Click Deploy to Netlify
 * Accepts project files, creates a ZIP, and deploys via Netlify Drop API
 */
export async function POST(req: NextRequest) {
    const { files, projectName = 'buildai-project' } = await req.json()

    if (!files || Object.keys(files).length === 0) {
        return NextResponse.json({ error: 'No files to deploy' }, { status: 400 })
    }

    const netlifyToken = process.env.NETLIFY_ACCESS_TOKEN

    // ── STRATEGY 1: Netlify Deploy API (live URL) ──────────────────────────
    if (netlifyToken) {
        try {
            const deployUrl = await deployToNetlify(files, projectName, netlifyToken)
            return NextResponse.json({
                success: true,
                deployUrl,
                provider: 'netlify',
                message: '🚀 Live on Netlify!',
            })
        } catch (err: any) {
            console.error('[Deploy] Netlify failed:', err.message)
            // Fallback to ZIP download instructions
        }
    }

    // ── STRATEGY 2: Render Deployment (alternative) ───────────────────────
    // Could add Render or Vercel here

    // ── STRATEGY 3: ZIP Download Manifest (always available) ─────────────
    const manifest = {
        projectName,
        fileCount: Object.keys(files).length,
        files: Object.keys(files),
        deployUrl: null,
        status: 'ready_for_download',
        provider: 'zip',
        instructions: [
            '1. Click "Download ZIP" to get your project files',
            '2. Unzip and open in your terminal',
            '3. Run: npm install',
            '4. Run: npm run dev',
            '5. Open: http://localhost:3000',
        ],
    }

    return NextResponse.json({ success: true, manifest })
}

async function deployToNetlify(
    files: Record<string, string>,
    projectName: string,
    token: string
): Promise<string> {
    // Step 1: Create a new site
    const siteRes = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` }),
    })

    if (!siteRes.ok) {
        const err = await siteRes.text()
        throw new Error(`Failed to create Netlify site: ${err}`)
    }

    const site = await siteRes.json()
    const siteId = site.id

    // Step 2: Create file digest for deploy
    const fileDigests: Record<string, string> = {}
    const encoder = new TextEncoder()

    for (const [path, content] of Object.entries(files)) {
        const data = encoder.encode(content)
        const hashBuffer = await crypto.subtle.digest('SHA-1', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        const deployPath = path.startsWith('/') ? path : `/${path}`
        fileDigests[deployPath] = hashHex
    }

    // Step 3: Create a deploy
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: fileDigests }),
    })

    if (!deployRes.ok) throw new Error('Failed to create Netlify deploy')
    const deploy = await deployRes.json()
    const deployId = deploy.id

    // Step 4: Upload required files
    const requiredFiles = deploy.required || []

    for (const sha of requiredFiles) {
        // Find the file with this sha
        const matchPath = Object.keys(fileDigests).find(p => fileDigests[p] === sha)
        if (!matchPath) continue

        const filePath = matchPath.startsWith('/') ? matchPath.slice(1) : matchPath
        const content = files[filePath] || files[matchPath]
        if (!content) continue

        await fetch(
            `https://api.netlify.com/api/v1/deploys/${deployId}/files${matchPath}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/octet-stream',
                },
                body: content,
            }
        )
    }

    return `https://${site.subdomain}.netlify.app`
}
