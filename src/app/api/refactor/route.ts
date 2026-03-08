import { NextRequest, NextResponse } from 'next/server'
import { runRefactorAgent, type AgentRunnerOptions } from '@/lib/agents/runner'

export async function POST(req: NextRequest) {
    const { filePath, currentContent, modification, provider = 'gemini' } = await req.json()

    const opts: AgentRunnerOptions = {
        geminiKey: process.env.GEMINI_API_KEY?.trim(),
        bytezKey: process.env.BYTEZ_API_KEY?.trim(),
        kimiKey: process.env.KIMI_API_KEY?.trim(),
        preferredProvider: provider as 'gemini' | 'bytez' | 'kimi',
    }

    try {
        const updatedContent = await runRefactorAgent(filePath, currentContent, modification, opts)
        return NextResponse.json({ success: true, filePath, content: updatedContent })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
