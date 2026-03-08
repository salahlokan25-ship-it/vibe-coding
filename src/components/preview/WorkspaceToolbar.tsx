'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Tablet, Smartphone, RefreshCw, Lock, Sparkles, Download, Edit2, Rocket, ChevronDown, Check, Zap, Globe } from 'lucide-react'

interface WorkspaceToolbarProps {
    projectName: string
    previewUrl?: string
    onRefresh: () => void
    activeDevice: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
    onExport?: () => void
    onRename?: (newName: string) => void
    isStitch?: boolean
    isKimi?: boolean
}

export default function WorkspaceToolbar({
    projectName,
    previewUrl,
    onRefresh,
    activeDevice,
    onDeviceChange,
    onExport,
    onRename,
    isStitch = false,
    isKimi = false,
}: WorkspaceToolbarProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [tempName, setTempName] = useState(projectName)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        setTempName(projectName)
    }, [projectName])

    const handleRename = () => {
        if (tempName.trim() && tempName !== projectName && onRename) {
            onRename(tempName.trim())
        }
        setIsEditing(false)
    }

    const handleExport = async () => {
        if (!onExport) return
        setIsExporting(true)
        onExport()
        setTimeout(() => setIsExporting(false), 2000)
    }

    return (
        <header className="h-14 border-b border-white/[0.06] bg-[#0B0F19]/80 backdrop-blur-2xl flex items-center justify-between px-6 z-50 sticky top-0">
            <div className="flex items-center gap-6">
                {/* Logo Section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.4)] group-hover:scale-110 transition-transform">
                            <Zap size={16} className="text-white fill-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">
                            Build<span className="text-orange-500">AI</span>
                        </span>
                    </div>
                </div>

                <div className="h-4 w-px bg-white/10 mx-2" />

                {/* Project Name Input */}
                <div className="relative group">
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <input
                                    autoFocus
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleRename}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                    className="bg-white/10 border border-orange-500/50 rounded-lg px-3 py-1.5 text-xs font-bold text-white outline-none min-w-[160px] shadow-[0_0_15px_rgba(255,92,0,0.2)]"
                                />
                            </motion.div>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all text-xs font-bold text-white/60 hover:text-white border border-transparent hover:border-white/10 group"
                            >
                                <span className="uppercase tracking-[0.15em]">{projectName}</span>
                                <Edit2 size={12} className="text-white/20 opacity-0 group-hover:opacity-100 transition-all" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* AI Model Badge */}
                <div className="hidden lg:block">
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${isKimi ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                        isStitch ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                        <Sparkles size={12} className="animate-pulse" />
                        <span>{isKimi ? 'Kimi K2.5' : isStitch ? 'Stitch Multi-Agent' : 'Gemini 1.5 Pro'}</span>
                        <ChevronDown size={10} className="ml-1 opacity-40" />
                    </button>
                </div>
            </div>

            {/* Device Selection Center */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-3xl lg:flex md:flex hidden">
                {[
                    { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                ].map(({ key, icon: Icon, label }) => {
                    const isActive = activeDevice === key
                    return (
                        <button
                            key={key}
                            onClick={() => onDeviceChange(key)}
                            className={`px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${isActive ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/60'
                                }`}
                            aria-label={label}
                        >
                            <Icon size={14} />
                            {isActive && <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>}
                        </button>
                    )
                })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* URL Bar (Mini) */}
                <div className="hidden xl:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-white/30 max-w-[280px]">
                    <Globe size={13} className="shrink-0 text-white/20" />
                    <span className="truncate tracking-tight font-bold">{previewUrl?.replace('https://', '') || 'preview.buildai.app/preview'}</span>
                    <button
                        onClick={onRefresh}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all shrink-0"
                        title="Refresh View"
                    >
                        <RefreshCw size={12} />
                    </button>
                </div>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <div className="flex items-center gap-2">
                    {onExport && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExport}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isExporting ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                                }`}
                        >
                            {isExporting ? <Check size={14} /> : <Download size={14} />}
                            <span className="hidden sm:inline">{isExporting ? 'Ready' : 'Export'}</span>
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,92,0,0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-xl transition-all"
                        id="deploy-btn"
                    >
                        <Rocket size={14} className="fill-white" />
                        <span className="hidden sm:inline">Ship App</span>
                    </motion.button>
                </div>
            </div>
        </header>
    )
}
