'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Check, Zap, Rocket, ArrowRight } from 'lucide-react'

const tiers = [
    {
        name: 'Free',
        price: '0',
        description: 'Perfect for exploring ideas and building your first AI-generated projects.',
        features: [
            '5 Projects Per Month',
            'Gemini AI Engine',
            'Live Preview',
            'Code Export',
            'Community Support',
        ],
        cta: 'Start Building Free',
        href: '/',
        highlight: false,
    },
    {
        name: 'Pro',
        price: '29',
        description: 'For power users and professional developers shipping real products.',
        features: [
            'Unlimited Projects',
            'Kimi K2.5 + DeepSeek AI',
            'Private Projects',
            'Custom Domains',
            'Priority AI Queue',
            'Priority 24/7 Support',
            'Advanced Multi-Agent Mode',
        ],
        cta: 'Try Pro Free',
        href: '/auth',
        highlight: true,
    },
    {
        name: 'Team',
        price: '99',
        description: 'Everything in Pro, built for teams collaborating on production software.',
        features: [
            'Everything in Pro',
            'Up to 10 Members',
            'Shared Project Workspace',
            'Team Analytics',
            'SSO & GitHub Integration',
            'Dedicated Support',
        ],
        cta: 'Contact Sales',
        href: '/auth',
        highlight: false,
    },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } }
const item = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[#0B0F19] overflow-x-hidden pt-20 font-sans">
            <Navbar />

            <section className="relative py-32 overflow-hidden min-h-[85vh] flex items-center">
                {/* Immersive 3D Atmosphere */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-500/10 rounded-[100%] blur-[120px] pointer-events-none opacity-60 mix-blend-screen" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                            <Rocket size={14} className="animate-pulse" /> Honest Pricing
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
                            Build without <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                                limits.
                            </span>
                        </h1>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">
                            Scale your ideas to production hardware seamlessly. Upgrade only when you are ready to ship.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto perspective-1000"
                    >
                        {tiers.map((tier) => (
                            <motion.div
                                key={tier.name}
                                variants={item}
                                whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
                                className={`relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500 will-change-transform
                                    ${tier.highlight
                                        ? 'border-2 border-orange-500/60 bg-gradient-to-b from-orange-500/10 to-[#0B0F19] shadow-[0_0_80px_rgba(255,92,0,0.15)] z-10 scale-105 md:scale-110'
                                        : 'border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:mt-6'
                                    } backdrop-blur-2xl`}
                            >
                                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${tier.highlight ? 'via-orange-500' : 'via-white/20'} to-transparent`} />

                                {tier.highlight && (
                                    <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,92,0,0.4)]">
                                        <Zap size={12} className="fill-white" /> Most Popular
                                    </div>
                                )}

                                <div className="p-10 flex-1">
                                    <h3 className="text-white font-bold text-2xl mb-3 tracking-tight">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className={`text-6xl font-black ${tier.highlight ? 'text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-pink-500' : 'text-white'}`}>
                                            ${tier.price}
                                        </span>
                                        <span className="text-white/30 text-sm font-bold uppercase tracking-widest">/mo</span>
                                    </div>
                                    <p className="text-white/40 text-sm leading-relaxed mb-8 font-medium">{tier.description}</p>

                                    <ul className="space-y-4">
                                        {tier.features.map(f => (
                                            <li key={f} className="flex items-center gap-4 text-sm font-medium text-white/70">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${tier.highlight ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/50 border border-white/5'}`}>
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-10 pt-0">
                                    <a
                                        href={tier.href}
                                        className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300
                                            ${tier.highlight
                                                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:shadow-[0_0_40px_rgba(255,92,0,0.6)] hover:scale-[1.02]'
                                                : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-[1.02]'
                                            }`}
                                    >
                                        {tier.cta} <ArrowRight size={16} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
