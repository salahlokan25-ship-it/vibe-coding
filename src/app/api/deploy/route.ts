import { NextRequest, NextResponse } from 'next/server'

/**
 * /api/deploy — Deployment endpoint
 * MVP: Returns a downloadable ZIP of the project files
 * Future: Push to Vercel, Netlify, or custom hosting
 */
export async function POST(req: NextRequest) {
    const { files, projectName = 'vibecoder-project' } = await req.json()

    if (!files || Object.keys(files).length === 0) {
        return NextResponse.json({ error: 'No files to deploy' }, { status: 400 })
    }

    // MVP: Return file manifest for client-side ZIP generation
    // In production, this would push to Vercel/Netlify via their APIs
    const manifest = {
        projectName,
        fileCount: Object.keys(files).length,
        files: Object.keys(files),
        deployUrl: null, // Will be set when cloud deploy is implemented
        status: 'ready',
        instructions: [
            '1. Download the project files',
            '2. Run: npm install',
            '3. Run: npm run dev',
            '4. Open: http://localhost:3000',
        ],
    }

    return NextResponse.json({ success: true, manifest })
}
