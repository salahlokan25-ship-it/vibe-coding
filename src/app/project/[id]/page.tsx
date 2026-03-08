'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import ChatPanel from '@/components/chat/ChatPanel'
import CodeViewer from '@/components/editor/CodeViewer'
import CodePreview from '@/components/preview/CodePreview'
import WorkspaceToolbar from '@/components/preview/WorkspaceToolbar'
import AgentProgress, { type AgentPhase, type AgentStatus } from '@/components/chat/AgentProgress'
import type { ChatMessage } from '@/types'
import { mergeFiles, isRefactorRequest } from '@/lib/agent'
import { ProjectDatabase, type Project } from '@/lib/db'
import { Zap } from 'lucide-react'
import { downloadProjectZip } from '@/lib/export'

function WorkspaceContent() {
    const params = useParams()
    const projectId = params.id as string
    const searchParams = useSearchParams()
    const initialPrompt = searchParams.get('prompt') || ''
    const useStitch = searchParams.get('stitch') === 'true'
    const useKimi = searchParams.get('kimi') === 'true'

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [generatedCode, setGeneratedCode] = useState('')
    const [projectFiles, setProjectFiles] = useState<Record<string, string>>({})
    const [projectName, setProjectName] = useState('Untitled Project')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isRefactoring, setIsRefactoring] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [splitRatio, setSplitRatio] = useState(55)
    const [chatWidth] = useState(420)
    const [hasLoadedState, setHasLoadedState] = useState(false)
    const [showAgentProgress, setShowAgentProgress] = useState(false)
    const [isResizing, setIsResizing] = useState(false)

    // Agent progress state
    const [agentPhases, setAgentPhases] = useState<AgentPhase[]>([])
    const [currentPhase, setCurrentPhase] = useState<AgentPhase | null>(null)
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle')
    const [agentPlan, setAgentPlan] = useState<any>(null)
    const [agentFiles, setAgentFiles] = useState<string[]>([])
    const [thoughts, setThoughts] = useState<Array<{ agent: string, message: string, timestamp: number }>>([])

    // Ref to always have latest projectFiles in callbacks without stale closure
    const projectFilesRef = useRef<Record<string, string>>({})
    projectFilesRef.current = projectFiles

    // ─── Load Per-Project State on Mount ─────────────────────────
    useEffect(() => {
        const loadState = async () => {
            // Load saved project from DB
            const savedProject = await ProjectDatabase.getProject(projectId)

            if (savedProject) {
                setProjectName(savedProject.name || 'Untitled Project')
                if (savedProject.files && Object.keys(savedProject.files).length > 0) {
                    setProjectFiles(savedProject.files)

                    // Rebuild raw code string from files
                    const rawCode = Object.entries(savedProject.files)
                        .map(([p, c]) => `<file path="${p}">\n${c}\n</file>`)
                        .join('\n\n')
                    setGeneratedCode(rawCode)
                }
            }

            // Load saved messages
            const savedMessages = await ProjectDatabase.getMessages(projectId)
            if (savedMessages.length > 0) {
                setMessages(savedMessages.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.timestamp),
                    status: 'done' as const,
                })))
            }

            setHasLoadedState(true)
        }

        loadState()
    }, [projectId])

    // ─── Save project to DB whenever files change ─────────────────
    const saveProjectToDb = useCallback(async (
        files: Record<string, string>,
        prompt: string,
        rawCode: string,
        name?: string
    ) => {
        const now = new Date().toISOString()
        const project: Project = {
            id: projectId,
            name: name || projectName,
            user_id: '', // Supabase uses the authenticated user context automatically
            created_at: (await ProjectDatabase.getProject(projectId))?.created_at || now,
            updated_at: now,
            files,
            prompt,
            file_count: Object.keys(files).length,
            preview_html: files['public/preview.html'] || '',
            status: 'ready'
        }
        await ProjectDatabase.saveProject(project)
    }, [projectId, projectName])

    // ─── Main Generation / Refactor Function ─────────────────────
    const generateCode = useCallback(
        async (prompt: string, forceNew = false) => {
            setIsGenerating(true)
            setError(null)
            setAgentPhases([])
            setCurrentPhase(null)
            setAgentStatus('running')
            setAgentFiles([])
            setAgentPlan(null)
            setShowAgentProgress(true)

            const provider = useKimi ? 'kimi' : useStitch ? 'bytez' : 'gemini'

            // Use the REF to get the latest files (avoids stale closure in callbacks)
            const currentFiles = projectFilesRef.current
            const hasExistingProject = Object.keys(currentFiles).length > 0
            const willRefactor = !forceNew && isRefactorRequest(prompt, hasExistingProject)

            const userMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: prompt,
                timestamp: new Date(),
                status: 'done',
            }
            setMessages(prev => {
                const updated = [...prev, userMsg]
                // Save messages to DB (only user/assistant roles)
                const saveable = updated.filter(m => m.role === 'user' || m.role === 'assistant')
                ProjectDatabase.saveMessages(projectId, saveable.map(m => ({
                    id: m.id,
                    project_id: projectId,
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                    timestamp: m.timestamp.toISOString(),
                })))
                return updated
            })

            const thinkingId = crypto.randomUUID()
            // NOTE: we no longer add a 'thinking' chat bubble — the live feed in ChatPanel handles this

            try {
                const res = await fetch('/api/agents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        history: messages.map(m => ({ role: m.role, content: m.content })),
                        existingFiles: currentFiles,  // Always pass current files
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
                            let event = null
                            try {
                                event = JSON.parse(line.slice(5))
                            } catch (parseErr) {
                                continue // skip malformed JSON
                            }

                            const { type, payload } = event

                            if (type === 'phase') {
                                const phase = payload as AgentPhase
                                setCurrentPhase(phase)
                                if (phase.done) {
                                    setAgentPhases(prev => [...prev, phase])
                                }
                            }

                            if (type === 'thought') {
                                setThoughts(prev => [...prev, { ...payload, timestamp: Date.now() }])
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

                                // ✅ Auto-show preview as soon as public/preview.html arrives
                                if (payload.path === 'public/preview.html') {
                                    setGeneratedCode(partialRaw)  // force re-render for CodePreview
                                }
                            }

                            if (type === 'complete') {
                                const { files, rawCode, fileCount, modifiedCount, mode } = payload
                                const merged = mode === 'refactor'
                                    ? mergeFiles(currentFiles, files)
                                    : files

                                setProjectFiles(merged)
                                setGeneratedCode(rawCode)
                                setAgentStatus('done')
                                setIsRefactoring(mode === 'refactor')

                                // Trigger Celebration!
                                try {
                                    const confetti = (await import('canvas-confetti')).default
                                    confetti({
                                        particleCount: 150,
                                        spread: 70,
                                        origin: { y: 0.6 },
                                        colors: ['#FF5C00', '#FF8F00', '#FFD600', '#FFFFFF']
                                    })
                                } catch (e) {
                                    console.warn('Confetti failed', e)
                                }

                                // Generate a project name from the prompt if not already set
                                const newName = projectName === 'Untitled Project'
                                    ? prompt.split(' ').slice(0, 5).join(' ').slice(0, 40)
                                    : projectName

                                if (projectName === 'Untitled Project') {
                                    setProjectName(newName)
                                }

                                // ✅ SAVE TO DASHBOARD — persist project and state
                                await saveProjectToDb(merged, prompt, rawCode, newName)

                                const completionMsg: ChatMessage = {
                                    id: crypto.randomUUID(),
                                    role: 'assistant' as const,
                                    content: mode === 'refactor'
                                        ? `✅ Edit applied — updated ${modifiedCount} file(s). Project has ${fileCount} files total.`
                                        : `✅ Project built with ${fileCount} files. Preview is live!`,
                                    timestamp: new Date(),
                                    status: 'done' as const,
                                }

                                setMessages(prev => {
                                    const updated = [...prev, completionMsg]
                                    // Save updated messages (only user/assistant)
                                    const saveable = updated.filter(m => m.role === 'user' || m.role === 'assistant')
                                    ProjectDatabase.saveMessages(projectId, saveable.map(m => ({
                                        id: m.id,
                                        project_id: projectId,
                                        role: m.role as 'user' | 'assistant',
                                        content: m.content,
                                        timestamp: m.timestamp.toISOString(),
                                    })))
                                    return updated
                                })
                            }

                            if (type === 'error') {
                                console.error('Agent error for', payload.file, ':', payload.message)
                            }

                            if (type === 'fatal') {
                                throw new Error(payload.message)
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
        [messages, useStitch, useKimi, projectId, projectName, saveProjectToDb]
        // NOTE: We deliberately do NOT include projectFiles here to avoid stale closure
        // We use projectFilesRef instead
    )

    const handleNewProject = useCallback(() => {
        setMessages([])
        setGeneratedCode('')
        setProjectFiles({})
        setProjectName('Untitled Project')
        setError(null)
    }, [])

    // Auto-trigger if prompt is in URL (only after state has loaded)
    useEffect(() => {
        if (hasLoadedState && initialPrompt && messages.length === 0 && !generatedCode) {
            generateCode(decodeURIComponent(initialPrompt))
        }
    }, [hasLoadedState, initialPrompt]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleRenameProject = useCallback(async (newName: string) => {
        setProjectName(newName)
        await saveProjectToDb(projectFilesRef.current, initialPrompt, generatedCode, newName)
    }, [saveProjectToDb, initialPrompt, generatedCode])

    const handleSendMessage = (content: string) => {
        generateCode(content)
    }

    const handleRefresh = useCallback(() => {
        if (generatedCode) {
            setGeneratedCode(prev => prev + ' ')
            setTimeout(() => setGeneratedCode(prev => prev.trimEnd()), 50)
        }
    }, [generatedCode])

    // Listen for custom refresh events
    useEffect(() => {
        const handler = () => handleRefresh()
        window.addEventListener('vibe-refresh-preview', handler)
        return () => window.removeEventListener('vibe-refresh-preview', handler)
    }, [handleRefresh])

    const handleMouseDown = useCallback(() => {
        setIsResizing(true)
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return

            // Calculate split ratio based on mouse position
            // The workspace area is everything to the right of the chat panel (which is chatWidth wide)
            const availableWidth = window.innerWidth - chatWidth
            const mouseXInWorkspace = e.clientX - chatWidth
            const newRatio = (mouseXInWorkspace / availableWidth) * 100

            // Constrain between 10% and 90%
            if (newRatio >= 10 && newRatio <= 90) {
                setSplitRatio(newRatio)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, chatWidth])

    const previewWidth = activeDevice === 'tablet' ? 'max-w-[768px]' : activeDevice === 'mobile' ? 'max-w-[375px]' : 'w-full'

    return (
        <div className={`flex h-screen bg-[#0B0F19] overflow-hidden relative ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-orange-600/5 blur-[100px] rounded-full pointer-events-none" />
            {/* ── AGENT PROGRESS OVERLAY (Top Center) ────────────────────── */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-xl px-4">
                {showAgentProgress && (
                    <AgentProgress
                        phases={agentPhases}
                        currentPhase={currentPhase}
                        generatedFiles={agentFiles}
                        status={agentStatus}
                        plan={agentPlan}
                        thoughts={thoughts}
                        onClose={() => setShowAgentProgress(false)}
                    />
                )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <WorkspaceToolbar
                    projectName={projectName}
                    previewUrl={`https://preview.buildai.app/${projectId}`}
                    onRefresh={handleRefresh}
                    activeDevice={activeDevice}
                    onDeviceChange={setActiveDevice}
                    onExport={() => downloadProjectZip(projectName, projectFilesRef.current)}
                    onRename={handleRenameProject}
                    isStitch={useStitch}
                    isKimi={useKimi}
                />

                <div className="flex-1 flex overflow-hidden relative">
                    {/* LEFT PARTIE: Monaco Editor (Flex basis: splitRatio) */}
                    <div
                        className="flex flex-col border-r border-vibe-border-subtle overflow-hidden"
                        style={{ flexBasis: `${splitRatio}%` }}
                    >
                        <div className="h-10 flex items-center px-4 bg-white/[0.02] border-b border-white/[0.06] backdrop-blur-md">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 flex items-center gap-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                Code Explorer
                            </span>
                        </div>
                        {generatedCode ? (
                            <CodeViewer code={generatedCode} isGenerating={isGenerating} />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-[#0B0F19]/50">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-2xl group">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-blue-400 transition-colors">
                                        <polyline points="16 18 22 12 16 6" />
                                        <polyline points="8 6 2 12 8 18" />
                                    </svg>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xs font-bold text-white uppercase tracking-[0.2em]">Source Repository</p>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-loose">Automated code generation<br />will populate this explorer.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RESIZE HANDLE */}
                    <div
                        className={`w-px cursor-col-resize bg-white/[0.06] hover:bg-orange-500/50 transition-all z-[40] relative flex items-center justify-center group active:bg-orange-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="w-6 h-12 rounded-full border border-white/10 bg-[#0B0F19] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all absolute shadow-2xl backdrop-blur-3xl group-active:scale-110">
                            <div className="flex gap-0.5">
                                <div className="w-0.5 h-3 bg-white/20 rounded-full" />
                                <div className="w-0.5 h-3 bg-white/20 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PARTIE: Live Preview (Flex basis: 100 - splitRatio) */}
                    <div
                        className="flex flex-col overflow-hidden"
                        style={{ flexBasis: `${100 - splitRatio}%` }}
                    >
                        <div className="h-10 flex items-center px-4 bg-white/[0.02] border-b border-white/[0.06] backdrop-blur-md">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 flex items-center gap-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,92,0,0.8)]" />
                                Live Canvas
                            </span>
                        </div>
                        <div className="flex-1 bg-vibe-bg-tertiary flex items-center justify-center overflow-hidden p-4 relative">
                            <div className={`${previewWidth} h-full rounded-lg overflow-hidden border border-vibe-border-subtle shadow-card transition-all duration-300`}>
                                {generatedCode && (!isGenerating || isRefactoring || generatedCode.includes('path="public/preview.html"')) ? (
                                    <CodePreview code={generatedCode} />
                                ) : isGenerating ? (
                                    <div className="w-full h-full bg-[#0B0F19] flex flex-col items-center justify-center gap-8 relative overflow-hidden">
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.03] rounded-full animate-spin-slow" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="relative w-24 h-24 mb-6">
                                                <div className="absolute inset-0 border-2 border-orange-500/20 rounded-[2.5rem] animate-[spin_4s_linear_infinite]" />
                                                <div className="absolute inset-[-4px] border border-orange-500/10 rounded-[2.8rem] animate-[spin_6s_linear_infinite_reverse]" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                                                    <Zap size={32} className="text-orange-500 fill-orange-500/20 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center space-y-4 relative z-10 animate-slide-up">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                                                Synthesizing
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-none">Architecting Vision</h3>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.25em] max-w-[240px] leading-loose">
                                                Designing system primitives <br />
                                                & compiling user interface...
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-vibe-bg-primary flex flex-col items-center justify-center gap-4 border border-vibe-border-subtle/50 rounded-lg">
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

                    {/* ── FLOATING BUILD BAR (Bottom Center) ──────────────────── */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-3xl px-6">
                        <div className="bg-[#0b1120]/80 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] rounded-[2rem] p-1.5 transition-all duration-500 group overflow-hidden">
                            <ChatPanel
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                isGenerating={isGenerating}
                                generatingFiles={agentFiles}
                                currentPhaseLabel={currentPhase?.label || ''}
                            />
                        </div>
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
