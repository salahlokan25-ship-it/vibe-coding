import { NextRequest, NextResponse } from 'next/server'
import { runDebugAgent, type AgentRunnerOptions } from '@/lib/agents/runner'

export async function POST(req: NextRequest) {
    const { filePath, fileContent, errorLog, provider = 'gemini' } = await req.json()

    const opts: AgentRunnerOptions = {
        geminiKey: process.env.GEMINI_API_KEY?.trim(),
        bytezKey: process.env.BYTEZ_API_KEY?.trim(),
        kimiKey: process.env.KIMI_API_KEY?.trim(),
        preferredProvider: provider as 'gemini' | 'bytez' | 'kimi',
    }

    try {
        const fixedContent = await runDebugAgent(filePath, fileContent, errorLog, opts)
        return NextResponse.json({ success: true, filePath, content: fixedContent })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
