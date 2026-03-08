'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ChatPanel from '@/components/chat/ChatPanel'
import CodeViewer from '@/components/editor/CodeViewer'
import CodePreview from '@/components/preview/CodePreview'
import WorkspaceToolbar from '@/components/preview/WorkspaceToolbar'
import AgentProgress, { type AgentPhase, type AgentStatus } from '@/components/chat/AgentProgress'
import type { ChatMessage } from '@/types'
import { mergeFiles, ProjectStateManager } from '@/lib/agent'

function WorkspaceContent() {
    const searchParams = useSearchParams()
    const initialPrompt = searchParams.get('prompt') || ''
    const useStitch = searchParams.get('stitch') === 'true'
    const useKimi = searchParams.get('kimi') === 'true'

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [generatedCode, setGeneratedCode] = useState('')
    const [projectFiles, setProjectFiles] = useState<Record<string, string>>({})
    const [isGenerating, setIsGenerating] = useState(false)
    const [isRefactoring, setIsRefactoring] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [splitRatio] = useState(55)
    const [chatWidth] = useState(420)
    const [activeFilePath, setActiveFilePath] = useState<string | null>(null)


    // Agent progress state
    const [agentPhases, setAgentPhases] = useState<AgentPhase[]>([])
    const [currentPhase, setCurrentPhase] = useState<AgentPhase | null>(null)
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle')
    const [agentPlan, setAgentPlan] = useState<any>(null)
    const [agentFiles, setAgentFiles] = useState<string[]>([])

    // Restore state from localStorage on mount
    useEffect(() => {
        const saved = ProjectStateManager.load()
        if (saved && saved.lastGeneratedCode) {
            setGeneratedCode(saved.lastGeneratedCode)
            setProjectFiles(saved.files || {})
        }
    }, [])

    const generateCode = useCallback(
        async (prompt: string, forceNew = false) => {
            setIsGenerating(true)
            setError(null)
            setAgentPhases([])
            setCurrentPhase(null)
            setAgentStatus('running')
            setAgentFiles([])
            setAgentPlan(null)

            const provider = useKimi ? 'kimi' : useStitch ? 'bytez' : 'gemini'

            const userMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: prompt,
                timestamp: new Date(),
                status: 'done',
            }
            setMessages(prev => [...prev, userMsg])

            const thinkingId = crypto.randomUUID()
            setMessages(prev => [...prev, {
                id: thinkingId,
                role: 'assistant',
                content: '🤖 Multi-agent system starting...',
                timestamp: new Date(),
                status: 'sending',
            }])

            try {
                const res = await fetch('/api/agents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        history: messages.map(m => ({ role: m.role, content: m.content })),
                        existingFiles: projectFiles,
                        forceNew,
                        provider,
                    }),
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Agent pipeline failed')
                }

                const reader = res.body?.getReader()
                const decoder = new TextDecoder()
                const localFiles: Record<string, string> = {}

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        const chunk = decoder.decode(value, { stream: true })
                        const lines = chunk.split('\n').filter(l => l.startsWith('data:'))

                        for (const line of lines) {
                            try {
                                const event = JSON.parse(line.slice(5)) // strip 'data:'
                                const { type, payload } = event

                                if (type === 'phase') {
                                    const phase = payload as AgentPhase
                                    setCurrentPhase(phase)
                                    if (phase.done) {
                                        setAgentPhases(prev => [...prev, phase])
                                    }
                                    // Update thinking message label
                                    setMessages(prev => prev.map(m =>
                                        m.id === thinkingId
                                            ? { ...m, content: phase.label }
                                            : m
                                    ))
                                }

                                if (type === 'plan') {
                                    setAgentPlan(payload)
                                }

                                if (type === 'file') {
                                    localFiles[payload.path] = payload.content
                                    setAgentFiles(prev =>
                                        prev.includes(payload.path) ? prev : [...prev, payload.path]
                                    )
                                    // Stream code progressively
                                    const partialRaw = Object.entries(localFiles)
                                        .map(([p, c]) => `<file path="${p}">
${c}
</file>`)
                                        .join('\n\n')
                                    setGeneratedCode(partialRaw)
                                }

                                if (type === 'complete') {
                                    const { files, rawCode, fileCount, modifiedCount, mode } = payload
                                    const merged = mode === 'refactor'
                                        ? mergeFiles(projectFiles, files)
                                        : files

                                    setProjectFiles(merged)
                                    setGeneratedCode(rawCode)
                                    setAgentStatus('done')
                                    setIsRefactoring(mode === 'refactor')

                                    ProjectStateManager.save({
                                        plan: null,
                                        files: merged,
                                        promptHistory: [
                                            ...(ProjectStateManager.load()?.promptHistory || []),
                                            prompt,
                                        ],
                                        buildErrors: [],
                                        lastGeneratedCode: rawCode,
                                    })

                                    setMessages(prev => {
                                        const without = prev.filter(m => m.id !== thinkingId)
                                        return [...without, {
                                            id: crypto.randomUUID(),
                                            role: 'assistant' as const,
                                            content: mode === 'refactor'
                                                ? `✅ Refactor complete — updated ${modifiedCount} file(s). Project has ${fileCount} files total.`
                                                : `✅ Project built with ${fileCount} files across ${Object.keys(files).length} components. Preview is live!`,
                                            timestamp: new Date(),
                                            status: 'done' as const,
                                        }]
                                    })
                                }

                                if (type === 'error') {
                                    console.error('Agent error for', payload.file, ':', payload.message)
                                }

                                if (type === 'fatal') {
                                    throw new Error(payload.message)
                                }
                            } catch (parseErr) {
                                // skip malformed events
                            }
                        }
                    }
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Something went wrong'
                setError(message)
                setAgentStatus('error')
                setMessages(prev => {
                    const without = prev.filter(m => m.id !== thinkingId)
                    return [...without, {
                        id: crypto.randomUUID(),
                        role: 'assistant' as const,
                        content: `❌ ${message}`,
                        timestamp: new Date(),
                        status: 'error' as const,
                    }]
                })
            } finally {
                setIsGenerating(false)
                setIsRefactoring(false)
            }
        },
        [messages, useStitch, useKimi, projectFiles]
    )

    const handleNewProject = useCallback(() => {
        setMessages([])
        setGeneratedCode('')
        setProjectFiles({})
        setError(null)
        ProjectStateManager.clear()
    }, [])

    useEffect(() => {
        if (initialPrompt && messages.length === 0) {
            generateCode(decodeURIComponent(initialPrompt))
        }
    }, [initialPrompt, messages.length, generateCode])


    const handleSendMessage = (content: string) => {
        generateCode(content)
    }

    const handleRefresh = () => {
        if (generatedCode) {
            // Trigger a refresh by slightly updating a dummy state or forcing a re-render
            setGeneratedCode((prev) => prev + ' ')
            setTimeout(() => setGeneratedCode((prev) => prev.trimEnd()), 50)
        }
    }

    // Automatically refresh preview when generation finishes
    useEffect(() => {
        if (!isGenerating && generatedCode && messages.length > 0) {
            const lastMsg = messages[messages.length - 1]
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.status === 'done') {
                handleRefresh()
            }
        }
    }, [isGenerating, generatedCode, messages])

    // Listen for custom refresh events
    useEffect(() => {
        const handler = () => handleRefresh()
        window.addEventListener('vibe-refresh-preview', handler)
        return () => window.removeEventListener('vibe-refresh-preview', handler)
    }, [handleRefresh])

    const previewWidth = activeDevice === 'tablet' ? 'max-w-[768px]' : activeDevice === 'mobile' ? 'max-w-[375px]' : 'w-full'

    return (
        <div className="flex h-screen bg-vibe-bg-primary overflow-hidden">
            <div
                className="flex flex-col border-r border-vibe-border-subtle bg-vibe-bg-secondary shrink-0"
                style={{ width: chatWidth }}
            >
                <div className="h-14 flex items-center justify-between px-4 border-b border-vibe-border-subtle bg-vibe-bg-primary/50 backdrop-blur-xl">
                    <Link href="/dashboard" className="flex items-center gap-2 group hover:opacity-100 transition-opacity">
                        <img
                            src="/logo.png"
                            alt="VibeCoder"
                            className="w-7 h-7 rounded-lg object-cover shadow-glow-blue transition-all duration-300 group-hover:shadow-glow-indigo filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                        />
                        <span className="font-bold text-[15px] tracking-tight text-vibe-text-primary">
                            vibe<span className="gradient-text">.ai</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        {Object.keys(projectFiles).length > 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-vibe-text-muted bg-vibe-bg-hover border border-vibe-border-subtle px-2 py-1 rounded-full">
                                {Object.keys(projectFiles).length} files
                            </span>
                        )}
                        {isRefactoring && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full animate-pulse">
                                Refactoring
                            </span>
                        )}
                        {Object.keys(projectFiles).length > 0 && (
                            <button
                                onClick={handleNewProject}
                                className="text-[10px] font-bold uppercase tracking-wider text-vibe-accent-blue bg-vibe-accent-blue/5 border border-vibe-accent-blue/20 px-2 py-1 rounded-full hover:bg-vibe-accent-blue/15 transition-colors"
                                title="Start a new project"
                            >
                                + New
                            </button>
                        )}
                    </div>
                </div>
                <AgentProgress
                    phases={agentPhases}
                    currentPhase={currentPhase}
                    generatedFiles={agentFiles}
                    status={agentStatus}
                    plan={agentPlan}
                />
                <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isGenerating={isGenerating}
                    generatingFiles={agentFiles}
                    currentPhaseLabel={currentPhase?.label}
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <WorkspaceToolbar
                    projectName="My Creative Agency"
                    previewUrl="https://preview.vibe.app"
                    onRefresh={handleRefresh}
                    activeDevice={activeDevice}
                    onDeviceChange={setActiveDevice}
                    isStitch={useStitch}
                    isKimi={useKimi}
                />

                <div className="flex-1 flex overflow-hidden">
                    <div
                        className="flex-1 flex flex-col border-r border-vibe-border-subtle overflow-hidden"
                        style={{ flexBasis: `${splitRatio}%` }}
                    >
                        <div className="flex-1 bg-vibe-bg-tertiary flex items-center justify-center overflow-hidden p-4">
                            <div className={`${previewWidth} h-full rounded-lg overflow-hidden border border-vibe-border-subtle shadow-card transition-all duration-300`}>
                                {generatedCode ? (
                                    <CodePreview code={generatedCode} />
                                ) : (
                                    <div className="w-full h-full bg-vibe-bg-primary flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vibe-accent-blue/10 to-vibe-accent-indigo/10 border border-vibe-border-subtle flex items-center justify-center">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-vibe-accent-blue">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <path d="M3 9h18" />
                                                <path d="M9 21V9" />
                                            </svg>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-medium text-vibe-text-secondary">No preview yet</p>
                                            <p className="text-xs text-vibe-text-muted">Send a prompt to generate your app</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex flex-col overflow-hidden"
                        style={{ flexBasis: `${100 - splitRatio}%` }}
                    >
                        {generatedCode ? (
                            <CodeViewer code={generatedCode} isGenerating={isGenerating} />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-vibe-bg-primary">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vibe-accent-indigo/10 to-vibe-accent-purple/10 border border-vibe-border-subtle flex items-center justify-center">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-vibe-accent-indigo">
                                        <polyline points="16 18 22 12 16 6" />
                                        <polyline points="8 6 2 12 8 18" />
                                    </svg>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-medium text-vibe-text-secondary">Code will appear here</p>
                                    <p className="text-xs text-vibe-text-muted">Generated source code with syntax highlighting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function WorkspacePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen bg-vibe-bg-primary items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-vibe-accent-blue/30 border-t-vibe-accent-blue animate-spin" />
                    <p className="text-sm text-vibe-text-muted">Loading workspace...</p>
                </div>
            </div>
        }>
            <WorkspaceContent />
        </Suspense>
    )
}
