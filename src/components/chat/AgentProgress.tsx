'use client'
import { Brain, Cpu, Code2, Wand2, Bug, Eye, CheckCircle2, Loader2, ChevronDown, ChevronRight, X, Terminal, Activity, Zap } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type AgentPhase = {
    agent: 'orchestrator' | 'planner' | 'coder' | 'refactor' | 'preview' | 'debug'
    label: string
    done?: boolean
    file?: string
    index?: number
    total?: number
    thought?: string
}

export type AgentStatus = 'idle' | 'running' | 'done' | 'error'

interface AgentProgressProps {
    phases: AgentPhase[]
    currentPhase: AgentPhase | null
    generatedFiles: string[]
    status: AgentStatus
    plan?: { project_type: string; features: string[]; file_plan: string[] } | null
    onClose?: () => void
    thoughts?: Array<{ agent: string, message: string, timestamp: number }>
    error?: string | null
    selectedModel?: string
}

const AGENT_META: Record<string, { icon: React.ReactNode; color: string; name: string }> = {
    orchestrator: { icon: <Brain size={14} />, color: 'text-violet-400', name: 'Orchestrator' },
    planner: { icon: <Cpu size={14} />, color: 'text-blue-400', name: 'Planner' },
    coder: { icon: <Code2 size={14} />, color: 'text-cyan-400', name: 'Synthesizer' },
    refactor: { icon: <Wand2 size={14} />, color: 'text-amber-400', name: 'Refactor Agent' },
    preview: { icon: <Eye size={14} />, color: 'text-emerald-400', name: 'Preview Generator' },
    debug: { icon: <Bug size={14} />, color: 'text-red-400', name: 'Debug Agent' },
    intent_analyst: { icon: <Activity size={12} />, color: 'text-orange-400', name: 'Intent Analyst' },
    design_system: { icon: <Activity size={12} />, color: 'text-pink-400', name: 'Design System' },
    copywriter: { icon: <Activity size={12} />, color: 'text-yellow-400', name: 'Copywriter' },
    seo_strategist: { icon: <Activity size={12} />, color: 'text-emerald-400', name: 'SEO Strategist' },
    accessibility: { icon: <Activity size={12} />, color: 'text-blue-400', name: 'A11y Auditor' },
    performance: { icon: <Activity size={12} />, color: 'text-indigo-400', name: 'Perf Optimizer' },
    component_lib: { icon: <Activity size={12} />, color: 'text-cyan-400', name: 'Component Lab' },
    animation: { icon: <Activity size={12} />, color: 'text-purple-400', name: 'Motion Director' },
}

export default function AgentProgress({
    phases,
    currentPhase,
    generatedFiles,
    status,
    plan,
    onClose,
    thoughts = [],
    error,
    selectedModel
}: AgentProgressProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const logRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight
        }
    }, [thoughts, currentPhase])

    if (status === 'idle') return null

    const completedPhases = phases.filter(p => p.done)
    const progress = currentPhase?.total
        ? (currentPhase.index || 0) / currentPhase.total
        : completedPhases.length > 0 ? 0.9 : 0.1

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl mx-auto border border-white/10 rounded-[2rem] bg-[#0B0F19]/90 backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden relative group pointer-events-auto"
        >
            {/* Top Shine */}
            <div className={`absolute top-0 left-0 right-0 h-px transition-all z-10 ${status === 'error' ? 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-orange-500/50 to-transparent'}`} />

            {/* Subtle Gradient Orbs */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header Area */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${status === 'running' ? 'bg-orange-500/10 text-orange-400 animate-pulse' :
                        status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                        {status === 'running' ? <Activity size={16} /> : status === 'error' ? <X size={16} /> : <CheckCircle2 size={16} />}
                    </div>
                    <div className="space-y-0.5">
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${status === 'error' ? 'text-red-400/50' : 'text-white/40'}`}>Multi-Agent Core</h3>
                        <p className="text-xs font-bold text-white tracking-tight">
                            {status === 'running' ? 'Active Synthesis...' : status === 'error' ? `Synthesis Failed (${selectedModel || 'AI'})` : 'Build Finalized'}
                        </p>
                        {status === 'error' && error && (
                            <p className="text-[11px] text-red-500 font-bold leading-tight max-w-[260px] animate-in fade-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all"
                    >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {/* THE THOUGHT LOG (Terminal Style) */}
                        <div className="px-6 py-4 bg-black/40 font-mono relative">
                            <div className="absolute top-2 right-4 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                            </div>

                            <div ref={logRef} className="h-40 overflow-y-auto space-y-2 no-scrollbar text-[10px] leading-relaxed">
                                {thoughts.length === 0 && (
                                    <div className="text-white/20 animate-pulse">Initializing neural context...</div>
                                )}
                                {thoughts.map((t, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-3"
                                    >
                                        <span className={`uppercase font-black tracking-widest shrink-0 ${AGENT_META[t.agent]?.color || 'text-white/40'}`}>
                                            [{AGENT_META[t.agent]?.name.split(' ')[0]}]
                                        </span>
                                        <span className="text-white/60 tracking-tight">{t.message}</span>
                                    </motion.div>
                                ))}
                                {currentPhase && status === 'running' && (
                                    <div className="flex gap-3 text-white">
                                        <span className="animate-pulse">_</span>
                                        <span className="text-orange-400/80 italic">{currentPhase.label}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar Area */}
                        <div className="px-6 py-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-white/10">
                                    <span>Sync Progress</span>
                                    <span>{Math.round(progress * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-pink-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <motion.div
                                        className="absolute top-0 bottom-0 w-20 bg-white/20 blur-xl"
                                        animate={{ x: [-100, 500] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                            </div>

                            {/* Plan & Stats */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-white/30">
                                        <Terminal size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{plan?.project_type || 'Custom App'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white/30 border-l border-white/10 pl-4">
                                        <Zap size={11} className="text-orange-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{generatedFiles.length} nodes</span>
                                    </div>
                                </div>

                                <div className="flex -space-x-2">
                                    {Array.from(new Set(thoughts.map(t => t.agent))).map((agent) => (
                                        <motion.div
                                            initial={{ scale: 0, x: 10 }}
                                            animate={{ scale: 1, x: 0 }}
                                            key={agent}
                                            className={`w-6 h-6 rounded-full border border-[#0B0F19] bg-white/[0.03] flex items-center justify-center ${AGENT_META[agent]?.color || 'text-white/40'} bg-black/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10`}
                                            title={AGENT_META[agent]?.name}
                                        >
                                            {AGENT_META[agent]?.icon || <Brain size={12} />}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
