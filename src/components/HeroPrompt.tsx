'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Plus, Paperclip, Zap, Figma, Github, Sparkles, Send, Terminal, Layout, Layers, ShieldCheck } from 'lucide-react'

const SUGGESTIONS = [
    'Build a fintech dashboard with dark theme',
    'Create a landing page for a SaaS startup',
    'Design a portfolio site with animations',
    'Make a music player with visualizer',
    'Build an e-commerce product page',
]

export default function HeroPrompt() {
    const [prompt, setPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [useStitch, setUseStitch] = useState(false)
    const [useKimi, setUseKimi] = useState(false)
    const [activeSuggestion, setActiveSuggestion] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    // Add scroll parallax
    const { scrollY } = useScroll()
    const yHeroText = useTransform(scrollY, [0, 500], [0, 150])
    const yHeroImg = useTransform(scrollY, [0, 500], [0, 50])
    const opacityHero = useTransform(scrollY, [0, 300], [1, 0])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSuggestion((prev) => (prev + 1) % SUGGESTIONS.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const autoResize = () => {
        const ta = textareaRef.current
        if (ta) {
            ta.style.height = 'auto'
            ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
        }
    }

    const handleBuild = async () => {
        if (!prompt.trim() || isLoading) return
        setIsLoading(true)
        const id = crypto.randomUUID()
        const params = new URLSearchParams({ prompt: prompt.trim() })
        if (useStitch) params.set('stitch', 'true')
        if (useKimi) params.set('kimi', 'true')
        router.push(`/project/${id}?${params.toString()}`)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleBuild()
        }
    }

    return (
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 pt-20 pb-10 overflow-hidden">
            {/* Elite Background Atmosphere with 3D Graphic */}
            <div className="absolute inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
                <motion.div style={{ y: yHeroImg, opacity: opacityHero }} className="absolute inset-0 flex items-center justify-center mix-blend-screen opacity-50">
                    <img
                        src="/images/hero-3d.png"
                        alt="Abstract 3D Shape"
                        className="w-[900px] h-[900px] object-cover scale-110"
                    />
                </motion.div>
                <div className="absolute top-[10%] left-[-10%] w-[60%] h-[70%] bg-orange-500/15 blur-[140px] rounded-full opacity-60 animate-pulse mix-blend-screen" />
                <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[60%] bg-blue-600/15 blur-[120px] rounded-full opacity-50 animate-pulse delay-700 mix-blend-screen" />
                {/* Grid utility */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent" />
            </div>

            <motion.div
                style={{ y: yHeroText, opacity: opacityHero }}
                className="relative z-10 max-w-4xl w-full text-center space-y-8"
            >
                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md"
                >
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Revolutionizing Software Creation</span>
                </motion.div>

                {/* Massive Headline (Now Inter) */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]"
                >
                    Build <span className="text-orange-500">anything</span> <br />
                    with one message.
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-medium"
                >
                    The multi-agent AI system that designs, architects, and builds professional software from a simple prompt.
                    <span className="text-white/80 ml-1">The zero-code revolution starts here.</span>
                </motion.p>

                {/* Main Action Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative max-w-3xl mx-auto"
                >
                    <div className="glass-card p-1.5 rounded-[2rem] overflow-hidden group border-white/10 hover:border-orange-500/30 transition-all duration-500 shadow-2xl bg-white/[0.03] backdrop-blur-3xl">
                        <div className="p-5">
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => {
                                    setPrompt(e.target.value)
                                    autoResize()
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={SUGGESTIONS[activeSuggestion]}
                                rows={3}
                                className="w-full bg-transparent resize-none outline-none text-white placeholder-white/20 text-xl font-medium leading-relaxed min-h-[80px]"
                                id="hero-prompt-input"
                                aria-label="Project prompt"
                            />
                        </div>

                        <div className="flex items-center justify-between px-5 pb-5 pt-2">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all duration-300"
                                    aria-label="Add attachment"
                                    id="attachment-btn"
                                >
                                    <Plus size={20} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all duration-300"
                                    aria-label="Upload file"
                                    id="upload-btn"
                                >
                                    <Paperclip size={18} />
                                </motion.button>
                            </div>

                            <div className="flex items-center gap-4">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-white/30"
                                    >
                                        <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">⌘</kbd>
                                        <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">Enter</kbd>
                                        <span>to build</span>
                                    </motion.div>
                                </AnimatePresence>

                                <motion.button
                                    onClick={handleBuild}
                                    disabled={!prompt.trim() || isLoading}
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,92,0,0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center gap-3 overflow-hidden"
                                    id="build-now-btn"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            <span className="relative">Architecting…</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="relative">Generate</span>
                                            <Send size={16} className="relative group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Modern Integration Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 w-full mb-2">Import from your workflow</span>

                    {[
                        { id: 'stitch', icon: Layout, label: 'G-Stitch', color: 'bg-[#4285F4]' },
                        { id: 'kimi', icon: Layers, label: 'Kimi K2.5', color: 'bg-purple-600' },
                        { id: 'figma', icon: Figma, label: 'Figma', color: 'bg-pink-600' },
                        { id: 'github', icon: Github, label: 'GitHub', color: 'bg-[#24292e]' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 group"
                        >
                            <item.icon size={16} className="text-white/40 group-hover:text-white transition-colors" />
                            <span className="text-xs font-bold text-white/40 group-hover:text-white">{item.label}</span>
                        </button>
                    ))}
                </motion.div>
            </motion.div>

            {/* Floating feature indicators (Visual Depth) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[25%] left-[12%] hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md"
                >
                    <Terminal size={14} className="text-orange-400" />
                    <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Live Compilation</span>
                </motion.div>
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[20%] right-[12%] hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md"
                >
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Production Ready</span>
                </motion.div>
            </div>

            {/* Bottom Fade Gradient Reverted */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B0F19] to-transparent pointer-events-none" />
        </section>
    )
}
