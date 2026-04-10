'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap, Brain, Sparkles, ChevronDown } from 'lucide-react'

export type AIModel = 'auto' | 'gemini' | 'groq' | 'bytez' | 'kimi'

interface ModelSelectorProps {
    selectedModel: AIModel
    onModelChange: (model: AIModel) => void
    className?: string
}

const MODELS = [
    { id: 'auto', name: 'Auto', icon: Sparkles, color: 'text-orange-400', desc: 'Expert Orchestration' },
    { id: 'gemini', name: 'Gemini 1.5', icon: Brain, color: 'text-emerald-400', desc: 'Deep Reasoning' },
    { id: 'groq', name: 'Groq Llama', icon: Zap, color: 'text-orange-500', desc: 'Ultra-Fast Synthesis' },
    { id: 'bytez', name: 'DeepSeek V3', icon: Cpu, color: 'text-blue-400', desc: 'Elite Architecture' },
    { id: 'kimi', name: 'Kimi K2.5', icon: Brain, color: 'text-purple-400', desc: 'High-RPM Precision' },
]

export default function ModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

    return (
        <div className={`relative ${className}`}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
            >
                <currentModel.icon size={14} className={currentModel.color} />
                <span className="hidden sm:inline">{currentModel.name}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-3 right-0 w-64 bg-[#0b1120]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-3xl z-50 overflow-hidden"
                        >
                            <div className="p-2 space-y-1">
                                {MODELS.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            onModelChange(model.id as AIModel)
                                            setIsOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedModel === model.id
                                                ? 'bg-orange-500/10 border border-orange-500/20'
                                                : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${selectedModel === model.id ? 'bg-orange-500/20' : ''}`}>
                                            <model.icon size={16} className={model.color} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedModel === model.id ? 'text-white' : 'text-white/60'}`}>
                                                {model.name}
                                            </p>
                                            <p className="text-[9px] text-white/20 font-medium uppercase tracking-wider">{model.desc}</p>
                                        </div>
                                        {selectedModel === model.id && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(255,92,0,0.8)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
