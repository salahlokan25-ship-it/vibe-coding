'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Code2, Eye, Layers3, GitBranch, Sparkles, ArrowRight, Terminal, Globe } from 'lucide-react'

const features = [
    {
        icon: Sparkles,
        label: 'AI Generation',
        title: 'Describe → Deploy in seconds',
        description: 'Type your vision in plain English. Our multi-agent AI system architects, designs, and codes your entire project — from database schema to pixel-perfect UI.',
        accent: 'from-orange-500/20 to-pink-500/20',
        border: 'hover:border-orange-500/30',
        large: true,
        img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=85',
    },
    {
        icon: Eye,
        label: 'Live Preview',
        title: 'See it build in real-time',
        description: 'Watch every file stream in as the AI writes it. The live preview updates instantly.',
        accent: 'from-violet-500/20 to-blue-500/20',
        border: 'hover:border-violet-500/30',
        large: false,
        img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=85',
    },
    {
        icon: Code2,
        label: 'Code Editor',
        title: 'Edit every line of code',
        description: 'Full access to all generated files. Refactor, tweak, and extend with natural language instructions.',
        accent: 'from-emerald-500/20 to-teal-500/20',
        border: 'hover:border-emerald-500/30',
        large: false,
        img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=85',
    },
    {
        icon: Layers3,
        label: 'Multi-Agent',
        title: 'Orchestrator → Planner → Coder',
        description: 'A pipeline of specialized AI agents collaborate: one plans the architecture, another designs the components, one writes every file.',
        accent: 'from-pink-500/20 to-rose-500/20',
        border: 'hover:border-pink-500/30',
        large: false,
        img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=85',
    },
    {
        icon: Globe,
        label: 'Multi-page',
        title: 'Full websites, not just pages',
        description: 'Build complete multi-page websites with routing, navigation, and consistent design across all pages.',
        accent: 'from-sky-500/20 to-cyan-500/20',
        border: 'hover:border-sky-500/30',
        large: false,
        img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=85',
    },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } }

export default function Features() {
    return (
        <section id="features" className="relative py-32 overflow-hidden">
            {/* Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold uppercase tracking-[0.15em] mb-6">
                        <Zap size={12} /> Platform Features
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
                        Everything you need to{' '}
                        <span className="text-orange-500">
                            ship faster
                        </span>
                    </h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        A complete AI-powered development environment. From idea to production in minutes, not months.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {/* Large card */}
                    {features.filter(f => f.large).map((f) => (
                        <motion.div
                            key={f.title}
                            variants={item}
                            className={`md:col-span-2 relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden group transition-all duration-500 ${f.border} hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]`}
                        >
                            {/* Top shimmer */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                <img
                                    src={f.img}
                                    alt={f.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-40`} />
                                <div className="absolute bottom-0 left-0 p-4">
                                    <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">{f.label}</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                                    <f.icon size={20} className="text-orange-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                                <p className="text-white/50 leading-relaxed">{f.description}</p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Small cards */}
                    {features.filter(f => !f.large).map((f) => (
                        <motion.div
                            key={f.title}
                            variants={item}
                            className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden group transition-all duration-500 ${f.border} hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]`}
                        >
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            {/* Image */}
                            <div className="relative h-36 overflow-hidden">
                                <img
                                    src={f.img}
                                    alt={f.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/30 to-transparent" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-30`} />
                            </div>
                            <div className="p-6">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                                    <f.icon size={16} className="text-white/60" />
                                </div>
                                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">{f.label}</div>
                                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-xs text-white/40 leading-relaxed">{f.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
