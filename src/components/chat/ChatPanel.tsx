'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Loader2, Zap, History, ChevronUp, Sparkles, Command, Target, X, ImagePlus } from 'lucide-react'
import type { ChatMessage } from '@/types'
import ReactMarkdown from 'react-markdown'

import ModelSelector, { AIModel } from '../ModelSelector'

interface ChatPanelProps {
    messages: ChatMessage[]
    onSendMessage: (message: string, attachedImage?: string) => void
    isGenerating: boolean
    generatingFiles?: string[]
    currentPhaseLabel?: string
    minimal?: boolean
    selectedModel: AIModel
    onModelChange: (model: AIModel) => void
    vibeContext?: { tagName: string, selector: string, text: string } | null
    onClearVibeContext?: () => void
}

export default function ChatPanel({
    messages,
    onSendMessage,
    isGenerating,
    generatingFiles = [],
    currentPhaseLabel = '',
    minimal = true,
    selectedModel,
    onModelChange,
    vibeContext,
    onClearVibeContext,
}: ChatPanelProps) {
    const [input, setInput] = useState('')
    const [attachedImage, setAttachedImage] = useState<string | null>(null)
    const [showHistory, setShowHistory] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [isDragging, setIsDragging] = useState(false) // Added dragging state
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, generatingFiles, currentPhaseLabel, showHistory])

    const handleSend = () => {
        if ((!input.trim() && !attachedImage) || isGenerating) return
        onSendMessage(input.trim(), attachedImage || undefined)
        setInput('')
        setAttachedImage(null)
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.type.indexOf('image') === 0) {
                const file = item.getAsFile()
                if (file) processImage(file)
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processImage(e.target.files[0])
        }
    }

    const processImage = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            setAttachedImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const autoResize = () => {
        const ta = inputRef.current
        if (ta) {
            ta.style.height = 'auto'
            ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
        }
    }

    return (
        <div className="flex flex-col w-full relative">
            <AnimatePresence mode="wait">
                {/* ── MESSAGE HISTORY DRAWER ──────────────────────────────── */}
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        className="absolute bottom-[calc(100%+16px)] left-0 right-0 bg-[#0b1120]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-3xl max-h-[450px] overflow-hidden flex flex-col z-50 origin-bottom"
                    >
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                                <History size={14} className="text-orange-400" />
                                Build Orchestrator
                            </span>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all"
                            >
                                <ChevronUp size={20} className="rotate-180" />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth">
                            {messages.length === 0 && !isGenerating && (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto">
                                        <Bot size={32} className="text-orange-500/40" />
                                    </div>
                                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest leading-loose">
                                        System initialized.<br />Awaiting instruction...
                                    </p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-orange-600/10 border border-orange-500/20 text-white'
                                        : 'bg-white/[0.03] border border-white/5 text-white/80'
                                        }`}>
                                        <div className="space-y-2">
                                            {msg.role === 'user' ? (
                                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                            ) : (
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-code:text-orange-400">
                                                    <ReactMarkdown>{msg.content.replace(/<file path="[^"]+">([\s\S]*?)(?:<\/file>|$)/g, '')}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── LIVE FEED (When Generating) ────────────────────────── */}
                {isGenerating && !showHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-[calc(100%+16px)] left-0 right-0 z-40"
                    >
                        <div className="bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[2px_0_15px_rgba(255,92,0,0.5)]" />
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Loader2 size={16} className="text-orange-400 animate-spin" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{currentPhaseLabel || 'Working...'}</span>
                                </div>
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                                </div>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                                    animate={{
                                        x: [-100, 200],
                                        width: ["20%", "40%", "20%"]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {generatingFiles.slice(-3).map((f, i) => (
                                    <span key={i} className="text-[9px] font-bold text-white/20 lowercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                                        {f.split('/').pop()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {attachedImage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="mx-3 mb-2 relative group w-[100px] h-[75px] rounded-lg overflow-hidden border border-vibe-accent-blue/30 shadow-[0_4px_24px_rgba(59,130,246,0.15)]"
                    >
                        <img src={attachedImage} alt="Attached UI Reference" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => setAttachedImage(null)}
                                className="w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 hover:scale-110 transition-all"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vibe Select Context Pill */}
            <AnimatePresence>
                {vibeContext && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="mx-3 mb-2 flex items-center justify-between bg-[#13111C]/90 border border-orange-500/30 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-[0_4px_24px_rgba(255,92,0,0.15)]"
                    >
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-orange-500" />
                            <div>
                                <span className="text-[11px] font-bold text-orange-400">TARGET: </span>
                                <span className="text-[11px] font-mono text-white/80">{vibeContext.selector}</span>
                                {vibeContext.text && (
                                    <span className="text-[11px] text-white/50 ml-2 italic">"{vibeContext.text}"</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClearVibeContext}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── MAIN INPUT BAR ────────────────────────────────────── */}
            <div className={`flex items-end gap-3 p-1.5 transition-all duration-500 ${isFocused || vibeContext ? 'bg-white/[0.04]' : ''} rounded-[1.5rem]`}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowHistory(!showHistory)}
                    className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 ${showHistory ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/5 text-white/30 hover:text-white hover:bg-white/10 border border-white/5'}`}
                    title="Toggle Build History"
                >
                    <History size={20} />
                </motion.button>

                <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    className="shrink-0"
                />

                <input
                    type="file"
                    accept="image/*"
                    id="image-loader-input"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        console.log('Image upload clicked');
                        fileInputRef.current?.click();
                    }}
                    className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:text-orange-500 hover:bg-white/10 border border-white/5 transition-all duration-300 relative z-30"
                    title="Attach Image (Ctrl+V works too)"
                    id="upload-image-button"
                >
                    <ImagePlus size={20} />
                </motion.button>

                <div className="flex-1 relative flex items-center min-h-[44px]">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => {
                            setInput(e.target.value)
                            autoResize()
                        }}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={isGenerating ? 'Synthesizing build instructions...' : 'Iterate, refactor, or drop an image...'}
                        rows={1}
                        disabled={isGenerating}
                        className="w-full bg-transparent py-3 resize-none outline-none text-white placeholder-white/20 text-sm font-medium leading-relaxed max-h-[150px] disabled:opacity-50"
                    />

                    {!input && !isGenerating && (
                        <div className="absolute right-2 flex items-center gap-1.5 text-white/10 pointer-events-none select-none">
                            <Command size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Enter</span>
                        </div>
                    )}
                </div>

                <motion.button
                    whileHover={input.trim() ? { scale: 1.05 } : {}}
                    whileTap={input.trim() ? { scale: 0.95 } : {}}
                    onClick={handleSend}
                    disabled={!input.trim() || isGenerating}
                    className={`h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 shrink-0 ${input.trim()
                        ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(255,92,0,0.3)]'
                        : 'bg-white/[0.03] text-white/20 border border-white/[0.06]'
                        }`}
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <span>Update</span>}
                    {!isGenerating && <Sparkles size={14} className={input.trim() ? 'fill-white' : 'opacity-0'} />}
                </motion.button>
            </div>
        </div>
    )
}
