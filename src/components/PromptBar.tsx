'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sparkles, Send, Command, ImageIcon } from 'lucide-react'
import ModelSelector, { AIModel } from './ModelSelector'

interface PromptBarProps {
    onSubmit: (prompt: string, model: AIModel) => void
}

export default function PromptBar({ onSubmit }: PromptBarProps) {
    const [value, setValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [selectedModel, setSelectedModel] = useState<AIModel>('auto')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = () => {
        if (!value.trim()) return
        onSubmit(value.trim(), selectedModel)
        setValue('')
    }

    return (
        <div className="fixed bottom-0 left-[220px] right-0 z-40 p-6 pointer-events-none">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="max-w-4xl mx-auto flex items-center justify-center pointer-events-auto"
            >
                <div className={`w-full flex items-center gap-4 bg-[#0b1120]/80 backdrop-blur-3xl border transition-all duration-500 rounded-2xl px-4 py-2.5 shadow-2xl ${isFocused ? 'border-orange-500/40 shadow-[0_0_40px_rgba(255,92,0,0.15)] ring-1 ring-orange-500/20' : 'border-white/[0.06]'}`}>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all group shrink-0"
                        title="Upload context image"
                    >
                        <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
                    </button>

                    <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        className="shrink-0"
                    />

                    <div className="flex-1 relative flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Describe your next project... (e.g. 'Build a modern crypto wallet UI')"
                            className="w-full bg-transparent outline-none text-white placeholder-white/20 text-sm font-medium py-2"
                            id="dashboard-prompt-input"
                        />

                        <AnimatePresence>
                            {!value && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="absolute right-0 flex items-center gap-1.5 text-white/10 pointer-events-none"
                                >
                                    <Command size={12} />
                                    <span className="text-[10px] font-bold tracking-widest uppercase">Enter</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-orange-400 hover:bg-orange-400/5 transition-all text-[10px] font-bold uppercase tracking-widest"
                            id="inspire-btn"
                        >
                            <Sparkles size={14} />
                            Inspire me
                        </button>

                        <motion.button
                            onClick={handleSubmit}
                            disabled={!value.trim()}
                            whileHover={value.trim() ? { scale: 1.05 } : {}}
                            whileTap={value.trim() ? { scale: 0.95 } : {}}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${value.trim() ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(255,92,0,0.3)] hover:shadow-[0_0_30px_rgba(255,92,0,0.5)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                            id="generate-btn"
                        >
                            <span>Build</span>
                            <Send size={14} className={value.trim() ? 'translate-x-0' : 'opacity-0'} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
