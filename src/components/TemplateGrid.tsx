'use client'

import { motion } from 'framer-motion'
import { FileText, Layout, ShoppingBag, Music, BarChart3, Globe, ArrowRight, Sparkles } from 'lucide-react'

const templates = [
    {
        id: '1',
        name: 'Saas Landing',
        description: 'Conversion-ready marketing site',
        icon: Layout,
        color: 'from-orange-500/20 to-orange-600/5',
        img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
        prompt: 'Build a premium SaaS landing page with dark mode, bento features grid, editorial pricing section, and animated floating graphics'
    },
    {
        id: '2',
        name: 'Analytics Hub',
        description: 'Data-driven business control',
        icon: BarChart3,
        color: 'from-blue-500/20 to-blue-600/5',
        img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
        prompt: 'Build a complex analytics dashboard with interactive charts, real-time stats cards, dark theme, and glassmorphism sidebar'
    },
    {
        id: '3',
        name: 'Portfolio V2',
        description: 'For modern creative directors',
        icon: Globe,
        color: 'from-purple-500/20 to-purple-600/5',
        img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&q=80',
        prompt: 'Build a stunning creative portfolio with vertical text effects, project masonry grid, smooth framer motion transitions, and contact modal'
    },
    {
        id: '4',
        name: 'Commerce Engine',
        description: 'Next-gen shopping experience',
        icon: ShoppingBag,
        color: 'from-emerald-500/20 to-emerald-600/5',
        img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
        prompt: 'Build a modern e-commerce product page with high-res galleries, animated cart drawers, variant pickers, and social proof sections'
    },
    {
        id: '5',
        name: 'Audio Interface',
        description: 'Immersive sound experience',
        icon: Music,
        color: 'from-rose-500/20 to-rose-600/5',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
        prompt: 'Build a professional music streaming UI with interactive player, waveform visualizers, glassmorphism playlists, and artist profiles'
    },
    {
        id: '6',
        name: 'Blog Platform',
        description: 'Modern editorial engine',
        icon: FileText,
        color: 'from-cyan-500/20 to-cyan-600/5',
        img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
        prompt: 'Build a premium editorial blog platform with reading progress bars, sticky table of contents, newsletter popups, and dark serif typography'
    },
]

interface TemplateGridProps {
    onSelectTemplate: (prompt: string) => void
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0 }
}

export default function TemplateGrid({ onSelectTemplate }: TemplateGridProps) {
    return (
        <div className="space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles size={18} className="text-orange-400" />
                        Quick Start
                    </h2>
                    <p className="text-sm text-white/30 font-medium">Standard templates for professional scale apps.</p>
                </div>
                <button className="text-xs font-bold text-orange-400/60 hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                    View All <ArrowRight size={14} />
                </button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {templates.map((template) => (
                    <motion.button
                        key={template.id}
                        variants={item}
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectTemplate(template.prompt)}
                        className="glass-card group relative p-0 overflow-hidden text-left border-white/[0.06] hover:border-orange-500/30 transition-all duration-500 bg-white/[0.02]"
                        id={`template-${template.id}`}
                    >
                        {/* Shimmer line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-20" />

                        {/* Image Preview */}
                        <div className="relative h-40 w-full overflow-hidden">
                            <img
                                src={template.img}
                                alt={template.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/60 to-transparent" />
                            <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-40`} />

                            <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shrink-0">
                                    <template.icon size={20} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{template.name}</h3>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest truncate">{template.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content / Footer */}
                        <div className="p-5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover:text-orange-400/60 transition-colors">Start Building</span>
                            <ArrowRight size={14} className="text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    )
}
