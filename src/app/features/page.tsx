'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Zap, Code2, Eye, Layers3, GitBranch, Sparkles, Terminal, Globe, ShieldCheck } from 'lucide-react'
import { useRef } from 'react'

const features = [
    {
        icon: Sparkles,
        label: 'AI Generation',
        title: 'Describe → Deploy in seconds',
        description: 'Type your vision in plain English. Our multi-agent AI system architects, designs, and codes your entire project — from database schema to pixel-perfect UI.',
        accent: 'from-orange-500/20 to-pink-500/20',
        border: 'hover:border-orange-500/30'
    },
    {
        icon: Layers3,
        label: 'Multi-Agent',
        title: 'Orchestrator → Planner → Coder',
        description: 'A pipeline of specialized AI agents collaborate: one plans the architecture, another designs the components, one writes every file.',
        accent: 'from-pink-500/20 to-rose-500/20',
        border: 'hover:border-pink-500/30'
    },
    {
        icon: Eye,
        label: 'Live Preview',
        title: 'See it build in real-time',
        description: 'Watch every file stream in as the AI writes it. The live preview updates instantly.',
        accent: 'from-violet-500/20 to-blue-500/20',
        border: 'hover:border-violet-500/30'
    },
    {
        icon: Code2,
        label: 'Code Editor',
        title: 'Edit every line of code',
        description: 'Full access to all generated files. Refactor, tweak, and extend with natural language instructions.',
        accent: 'from-emerald-500/20 to-teal-500/20',
        border: 'hover:border-emerald-500/30'
    },
    {
        icon: Globe,
        label: 'Multi-page',
        title: 'Full websites, not just pages',
        description: 'Build complete multi-page websites with routing, navigation, and consistent design across all pages.',
        accent: 'from-sky-500/20 to-cyan-500/20',
        border: 'hover:border-sky-500/30'
    },
    {
        icon: Terminal,
        label: 'Native Execution',
        title: 'Zero config environments',
        description: 'Every project spins up in a secure sandbox, pre-configured for React, Next.js, or React Native.',
        accent: 'from-amber-500/20 to-orange-500/20',
        border: 'hover:border-amber-500/30'
    }
]

export default function FeaturesPage() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacityImg = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.2])

    return (
        <main className="min-h-screen bg-[#0B0F19] overflow-x-hidden font-sans pt-20" ref={containerRef}>
            <Navbar />

            {/* Hero Section of Features */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 overflow-hidden">
                {/* 3D Graphic Background with Parallax */}
                <motion.div
                    className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none"
                    style={{ y: yImg, opacity: opacityImg }}
                >
                    <div className="relative w-[800px] h-[800px] max-w-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-[#0B0F19] z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-transparent to-[#0B0F19] z-10" />
                        <img
                            src="/images/features-3d.png"
                            alt="3D Holographic Neural Network"
                            className="w-full h-full object-cover mix-blend-screen scale-110"
                        />
                    </div>
                </motion.div>

                {/* Grid utility */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] z-0 pointer-events-none" />

                <div className="relative z-10 max-w-4xl text-center space-y-8 mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md"
                    >
                        <Zap size={14} />
                        <span>Platform Capabilities</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]"
                    >
                        Engineered for <br />
                        <span className="text-orange-500">velocity.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        We built a multi-agent framework that translates natural language directly into production-grade infrastructure.
                    </motion.p>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`relative rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 group transition-all duration-500 ${f.border} shadow-[0_0_0_transparent] hover:shadow-[0_20px_40px_rgba(255,92,0,0.1)]`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition-all duration-500">
                                <f.icon size={20} className="text-white/60 group-hover:text-orange-400 transition-colors duration-500" />
                            </div>

                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block group-hover:text-orange-400/60 transition-colors">
                                    {f.label}
                                </span>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-50 transition-colors">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed font-medium">
                                    {f.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    )
}
