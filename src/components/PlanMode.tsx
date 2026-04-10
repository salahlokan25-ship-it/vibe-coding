'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap, ChevronRight, Loader2, CheckCircle2, List, X } from 'lucide-react'
import type { AIModel } from './ModelSelector'

interface PlanModeProps {
    isOpen: boolean
    plan: string | null
    isPlanning: boolean
    onAccept: () => void
    onReject: () => void
    onClose: () => void
}

export default function PlanMode({ isOpen, plan, isPlanning, onAccept, onReject, onClose }: PlanModeProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-[10%] md:w-[640px] z-50 bg-[#0a0f1e]/98 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(255,92,0,0.1)] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/20 flex items-center justify-center">
                                        <Brain size={20} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-white uppercase tracking-widest">Build Plan</h2>
                                        <p className="text-[10px] text-white/30 font-medium mt-0.5">Review before the AI starts coding</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Plan content */}
                        <div className="px-8 py-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                            {isPlanning ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                                        <div className="relative w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                            <Loader2 size={20} className="text-orange-400 animate-spin" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-bold text-white uppercase tracking-widest">Architect is Planning...</p>
                                        <p className="text-xs text-white/30">Analyzing your request to create an optimal build strategy</p>
                                    </div>
                                </div>
                            ) : plan ? (
                                <div className="space-y-3">
                                    {parsePlanItems(plan).map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                                        >
                                            <div className="w-5 h-5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-[8px] font-black text-orange-400">{i + 1}</span>
                                            </div>
                                            <p className="text-xs text-white/70 leading-relaxed font-medium">{item}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        {/* Actions */}
                        {!isPlanning && plan && (
                            <div className="px-8 pb-8 pt-4 flex items-center gap-3">
                                <button
                                    onClick={onReject}
                                    className="flex-1 h-12 rounded-2xl border border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/20 transition-all font-bold text-xs uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onAccept}
                                    className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(255,92,0,0.3)] flex items-center justify-center gap-2"
                                >
                                    <Zap size={14} className="fill-white" />
                                    <span>Build This Plan</span>
                                    <ChevronRight size={14} />
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function parsePlanItems(plan: string): string[] {
    // Try to parse numbered list items, bullets, or lines
    const numberedItems = plan.match(/^\d+[\.\)]\s+(.+)$/gm)
    if (numberedItems && numberedItems.length > 2) {
        return numberedItems.map(line => line.replace(/^\d+[\.\)]\s+/, '').trim())
    }
    const bulletItems = plan.match(/^[\-\*\•]\s+(.+)$/gm)
    if (bulletItems && bulletItems.length > 2) {
        return bulletItems.map(line => line.replace(/^[\-\*\•]\s+/, '').trim())
    }
    // Fallback: split by newlines
    return plan.split('\n').filter(l => l.trim().length > 10).slice(0, 12)
}
