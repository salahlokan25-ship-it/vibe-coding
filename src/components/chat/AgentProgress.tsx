'use client'

import { Brain, Cpu, Code2, Wand2, Bug, Eye, CheckCircle2, Loader2, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'

export type AgentPhase = {
    agent: 'orchestrator' | 'planner' | 'coder' | 'refactor' | 'preview' | 'debug'
    label: string
    done?: boolean
    file?: string
    index?: number
    total?: number
}

export type AgentStatus = 'idle' | 'running' | 'done' | 'error'

interface AgentProgressProps {
    phases: AgentPhase[]
    currentPhase: AgentPhase | null
    generatedFiles: string[]
    status: AgentStatus
    plan?: { project_type: string; features: string[]; file_plan: string[] } | null
    onClose?: () => void
}

const AGENT_META: Record<string, { icon: React.ReactNode; color: string; name: string }> = {
    orchestrator: {
        icon: <Brain size={14} />,
        color: 'text-violet-400',
        name: 'Orchestrator',
    },
    planner: {
        icon: <Cpu size={14} />,
        color: 'text-blue-400',
        name: 'Planner',
    },
    coder: {
        icon: <Code2 size={14} />,
        color: 'text-cyan-400',
        name: 'Code Generator',
    },
    refactor: {
        icon: <Wand2 size={14} />,
        color: 'text-amber-400',
        name: 'Refactor Agent',
    },
    preview: {
        icon: <Eye size={14} />,
        color: 'text-emerald-400',
        name: 'Preview Generator',
    },
    debug: {
        icon: <Bug size={14} />,
        color: 'text-red-400',
        name: 'Debug Agent',
    },
}

export default function AgentProgress({
    phases,
    currentPhase,
    generatedFiles,
    status,
    plan,
    onClose,
}: AgentProgressProps) {
    const [filesExpanded, setFilesExpanded] = useState(false)

    if (status === 'idle') return null

    const completedPhases = phases.filter(p => p.done)
    const progress = currentPhase?.total
        ? (currentPhase.index || 0) / currentPhase.total
        : completedPhases.length > 0 ? 0.9 : 0.1

    return (
        <div className="border border-white/10 glass-card bg-vibe-bg-primary/95 backdrop-blur-3xl px-4 py-3 space-y-3 shadow-2xl relative pointer-events-auto overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {status === 'running' ? (
                        <Loader2 size={14} className="text-violet-400 animate-spin" />
                    ) : (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                        {status === 'running' ? 'Multi-Agent System Running' : 'Generation Complete'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {generatedFiles.length > 0 && (
                        <button
                            onClick={() => setFilesExpanded(!filesExpanded)}
                            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
                        >
                            {generatedFiles.length} files
                            {filesExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-white/5 text-white/20 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-vibe-accent-orange to-vibe-accent-orange-light rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
            </div>

            {/* Current Phase */}
            {currentPhase && (
                <div className={`flex items-center gap-2 ${AGENT_META[currentPhase.agent]?.color || 'text-white/60'}`}>
                    {AGENT_META[currentPhase.agent]?.icon}
                    <span className="text-[11px] font-medium truncate max-w-[280px]">
                        {currentPhase.label}
                    </span>
                    {currentPhase.index && currentPhase.total && (
                        <span className="text-[10px] text-white/30 ml-auto shrink-0">
                            {currentPhase.index}/{currentPhase.total}
                        </span>
                    )}
                </div>
            )}

            {/* Plan preview (from orchestrator) */}
            {plan && (
                <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 uppercase tracking-wider font-bold">
                        {plan.project_type}
                    </span>
                    {plan.features.slice(0, 3).map(f => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                            {f}
                        </span>
                    ))}
                </div>
            )}

            {/* Completed phases */}
            {completedPhases.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {completedPhases.map((p, i) => {
                        const meta = AGENT_META[p.agent]
                        return (
                            <div key={i} className={`flex items-center gap-1 text-[10px] ${meta?.color || 'text-white/40'} opacity-60`}>
                                <CheckCircle2 size={9} />
                                <span>{meta?.name}</span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Generated files list */}
            {filesExpanded && generatedFiles.length > 0 && (
                <div className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                    {generatedFiles.map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-[10px] text-white/30">
                            <Code2 size={8} className="text-cyan-500/50 shrink-0" />
                            <span className="font-mono truncate">{f}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
