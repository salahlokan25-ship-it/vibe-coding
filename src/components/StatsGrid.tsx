'use client'

import { motion } from 'framer-motion'
import { Zap, Eye, Activity, Timer, Plus, ArrowUpRight, Sparkles } from 'lucide-react'

const stats = [
    {
        label: 'TOTAL PROJECTS',
        value: '14',
        trend: '+2 new',
        icon: Zap,
        accent: 'from-orange-500/20 to-orange-600/5',
        iconColor: 'text-orange-400',
    },
    {
        label: 'PROJECT VIEWS',
        value: '2.4k',
        trend: '+12%',
        icon: Eye,
        accent: 'from-blue-500/20 to-blue-600/5',
        iconColor: 'text-blue-400',
    },
    {
        label: 'ACTIVE USERS',
        value: '842',
        trend: '+54',
        icon: Activity,
        accent: 'from-purple-500/20 to-purple-600/5',
        iconColor: 'text-purple-400',
    },
    {
        label: 'AVG. UPTIME',
        value: '99.9%',
        trend: 'Stable',
        icon: Timer,
        accent: 'from-emerald-500/20 to-emerald-600/5',
        iconColor: 'text-emerald-400',
    },
]

interface StatsGridProps {
    onCreateProject: () => void
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function StatsGrid({ onCreateProject }: StatsGridProps) {
    return (
        <div className="space-y-12">
            {/* Premium Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={10} /> Developer Workspace
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
                        Welcome back, <span className="text-orange-500">Builder.</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-xl font-medium">
                        You have <span className="text-white">12 active projects</span> currently live.
                        Your last project was edited <span className="text-orange-400/80">2 hours ago</span>.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,92,0,0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreateProject}
                    className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 overflow-hidden"
                    id="create-project-btn"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Plus size={18} className="relative" />
                    <span className="relative">Create New</span>
                </motion.button>
            </div>

            {/* Elite Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        variants={item}
                        className="relative glass-card p-6 overflow-hidden group hover:border-white/20 transition-all duration-500 cursor-default bg-white/[0.02] backdrop-blur-xl"
                    >
                        {/* Accent Glow */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.accent} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="relative space-y-6">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-white/20`}>
                                    <stat.icon size={24} className={`${stat.iconColor} transition-transform duration-500 group-hover:rotate-12`} />
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                                    <ArrowUpRight size={10} />
                                    {stat.trend}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 group-hover:text-white/50 transition-colors">{stat.label}</p>
                                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}
