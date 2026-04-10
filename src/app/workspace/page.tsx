'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Database } from 'lucide-react'
import ChatPanel from '@/components/chat/ChatPanel'
import { AIModel } from '@/components/ModelSelector'
import CodeViewer from '@/components/editor/CodeViewer'
import CodePreview from '@/components/preview/CodePreview'
import WorkspaceToolbar from '@/components/preview/WorkspaceToolbar'
import AgentProgress, { type AgentPhase, type AgentStatus } from '@/components/chat/AgentProgress'
import type { ChatMessage } from '@/types'
import { mergeFiles, ProjectStateManager } from '@/lib/agent'
import VersionHistoryPanel from '@/components/VersionHistoryPanel'
import DatabaseModal from '@/components/database/DatabaseModal'
import DeployButton from '@/components/DeployButton'
import PlanMode from '@/components/PlanMode'
import { VersionHistory } from '@/lib/version-history'

function WorkspaceContent() {
    const searchParams = useSearchParams()
    const initialPrompt = searchParams.get('prompt') || ''
    const [selectedModel, setSelectedModel] = useState<AIModel>('groq')

    useEffect(() => {
        const model = searchParams.get('model') as AIModel
        const kimi = searchParams.get('kimi') === 'true'
        const groq = searchParams.get('groq') === 'true'
        const stitch = searchParams.get('stitch') === 'true'

        if (model) setSelectedModel(model)
        else if (kimi) setSelectedModel('kimi')
        else if (groq) setSelectedModel('groq')
        else if (stitch) setSelectedModel('auto')
    }, [searchParams])

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
    const [refreshKey, setRefreshKey] = useState(0)
    const [showVersionHistory, setShowVersionHistory] = useState(false)
    const [showDatabaseModal, setShowDatabaseModal] = useState(false)
    const [projectId] = useState(() => searchParams.get('id') || crypto.randomUUID())

    // Vibe Select & Auto-Heal State
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [vibeContext, setVibeContext] = useState<{ tagName: string, selector: string, text: string, htmlContext: string } | null>(null)
    const [autoHealCount, setAutoHealCount] = useState(0)

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
        async (prompt: string, forceNew = false, attachedImage?: string) => {
            setIsGenerating(true)
            setError(null)
            setAgentPhases([])
            setCurrentPhase(null)
            setAgentStatus('running')
            setAgentFiles([])
            setAgentPlan(null)

            const provider = selectedModel === 'auto' ? 'groq' : selectedModel

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
                        imageContext: attachedImage,
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
                                        .map(([p, c]) => `<file path="${p}">\n${c}\n</file>`)
                                        .join('\n\n')
                                    setGeneratedCode(partialRaw)
                                    // Progressive preview: refresh when preview.html arrives or every 3 files
                                    if (payload.path.endsWith('.html') || Object.keys(localFiles).length % 3 === 0) {
                                        setRefreshKey(prev => prev + 1)
                                    }
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
                                    setRefreshKey(prev => prev + 1)

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

                                    // 🔖 Auto-save a Version History Checkpoint
                                    VersionHistory.save(projectId, {
                                        files: merged,
                                        generatedCode: rawCode,
                                        prompt,
                                        label: mode === 'refactor'
                                            ? `Refactor • ${new Date().toLocaleTimeString()}`
                                            : `Build • ${fileCount} files • ${new Date().toLocaleTimeString()}`,
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

                                    // Instantly force preview reload without delays
                                    setRefreshKey(prev => prev + 1)
                                }

                                if (type === 'error') {
                                    console.error('Agent error for', payload.file, ':', payload.message)
                                }

                                if (type === 'fatal') {
                                    throw new Error(payload.message)
                                }
                            } catch (parseErr: any) {
                                // Only skip JSON parse errors, not fatal errors
                                if (parseErr?.message && !parseErr.message.includes('JSON')) {
                                    throw parseErr
                                }
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
        [messages, selectedModel, projectFiles]
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

    // Listen for Vibe Select and Runtime Errors from the internal iframe
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'VIBE_ELEMENT_SELECTED') {
                setVibeContext(e.data.payload)
                setIsSelectionMode(false)
            }
            if (e.data?.type === 'PREVIEW_ERROR') {
                const { message, line } = e.data.payload;
                // Trigger auto-heal if we aren't already generating, and haven't looped out of control
                if (!isGenerating && autoHealCount < 2) {
                    console.log('🚑 Initiating Auto-Heal for:', message)
                    setAutoHealCount(c => c + 1)
                    setTimeout(() => {
                        generateCode(`[SYS_AUTO_HEAL] 🚑 The preview just crashed in the browser with the following runtime error: "${message}" at approx line ${line}. Please analyze the codebase, identify exactly why this crashed, and provide the fix immediately. Do not break other functionality.`)
                    }, 500)
                }
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [isGenerating, autoHealCount, generateCode])


    const handleSendMessage = (content: string, attachedImage?: string) => {
        setAutoHealCount(0); // Reset auto-heal block on manual user prompt

        let finalPrompt = content;
        if (vibeContext) {
            finalPrompt = `[TARGET ELEMENT: <${vibeContext.tagName} class="${vibeContext.selector}"> context: "${vibeContext.text}"]\nI am targeting this specific element. Apply my changes strategically to this element and its parent component.\n\nUser Request: ${content}`;
            setVibeContext(null);
        }
        generateCode(finalPrompt, false, attachedImage)
    }

    const handleRefresh = () => {
        if (generatedCode) {
            setRefreshKey(prev => prev + 1)
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
                        {/* Database Link Button */}
                        {Object.values(projectFiles).some((f: any) => typeof f === 'string' && (f.includes('CREATE TABLE') || f.includes('create table'))) && (
                            <button
                                onClick={() => setShowDatabaseModal(true)}
                                className="text-[10px] font-bold uppercase tracking-wider text-vibe-accent-purple bg-vibe-accent-purple/10 border border-vibe-accent-purple/30 px-2 py-1 rounded-full hover:bg-vibe-accent-purple/20 transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                title="Run SQL Migration"
                            >
                                <Database size={10} /> Execute DB
                            </button>
                        )}
                        {/* Version History Button */}
                        {Object.keys(projectFiles).length > 0 && (
                            <button
                                onClick={() => setShowVersionHistory(true)}
                                className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
                                title="Version History"
                            >
                                ⏱ History
                            </button>
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
                    error={error}
                    selectedModel={selectedModel}
                />
                <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isGenerating={isGenerating}
                    generatingFiles={agentFiles}
                    currentPhaseLabel={currentPhase?.label}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    vibeContext={vibeContext}
                    onClearVibeContext={() => { setVibeContext(null); setIsSelectionMode(false) }}
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <WorkspaceToolbar
                    projectName="My Creative Agency"
                    previewUrl="https://preview.vibe.app"
                    onRefresh={handleRefresh}
                    activeDevice={activeDevice}
                    onDeviceChange={setActiveDevice}
                    extraActions={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setIsSelectionMode(!isSelectionMode); setVibeContext(null); }}
                                disabled={!generatedCode || isGenerating}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-xl border-r border-white/5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${isSelectionMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(255,92,0,0.2)]' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/5'} ${(!generatedCode || isGenerating) && 'opacity-50 cursor-not-allowed'}`}
                                title="Hover & Click an element in preview to target it"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                {isSelectionMode ? 'Select Element...' : 'Vibe Select'}
                            </button>
                            <DeployButton
                                projectFiles={projectFiles}
                                generatedCode={generatedCode}
                                projectName="buildai-project"
                                isGenerating={isGenerating}
                            />
                        </div>
                    }
                />

                <div className="flex-1 flex overflow-hidden">
                    <div
                        className="flex-1 flex flex-col border-r border-vibe-border-subtle overflow-hidden"
                        style={{ flexBasis: `${splitRatio}%` }}
                    >
                        <div className="flex-1 bg-vibe-bg-tertiary flex items-center justify-center overflow-hidden p-4">
                            <div className={`${previewWidth} h-full rounded-lg overflow-hidden border ${isSelectionMode ? 'border-orange-500 shadow-[0_0_30px_rgba(255,92,0,0.2)]' : 'border-vibe-border-subtle shadow-card'} transition-all duration-300`}>
                                {generatedCode ? (
                                    <CodePreview code={generatedCode} key={refreshKey} isSelectionMode={isSelectionMode} />
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
                            <CodeViewer
                                code={generatedCode}
                                isGenerating={isGenerating}
                                onChange={(newCode, newFiles) => {
                                    setGeneratedCode(newCode)
                                    setProjectFiles(newFiles)
                                    // Not updating refreshKey immediately to avoid stuttering iframe
                                }}
                            />
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

            {/* Version History Panel (Portal) */}
            <VersionHistoryPanel
                projectId={projectId}
                isOpen={showVersionHistory}
                onClose={() => setShowVersionHistory(false)}
                onRestore={(cp) => {
                    setProjectFiles(cp.files)
                    setGeneratedCode(cp.generatedCode)
                    setRefreshKey(prev => prev + 1)
                }}
            />

            {/* Database Runner Modal */}
            <DatabaseModal
                isOpen={showDatabaseModal}
                onClose={() => setShowDatabaseModal(false)}
                projectFiles={projectFiles}
            />
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
