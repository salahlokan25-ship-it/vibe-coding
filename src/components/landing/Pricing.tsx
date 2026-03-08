'use client'

import { motion } from 'framer-motion'
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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const item = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export default function Pricing() {
    return (
        <section id="pricing" className="relative py-32 overflow-hidden">
            {/* Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

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
                        <Rocket size={12} /> Simple Pricing
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
                        Start free,{' '}
                        <span className="text-orange-500">
                            scale as you grow
                        </span>
                    </h2>
                    <p className="text-lg text-white/50 max-w-xl mx-auto">
                        No hidden fees. No credit card required to start.
                    </p>
                </motion.div>

                {/* Pricing Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                >
                    {tiers.map((tier) => (
                        <motion.div
                            key={tier.name}
                            variants={item}
                            className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500
                                ${tier.highlight
                                    ? 'border-2 border-orange-500/60 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_0_60px_rgba(255,92,0,0.2)] hover:shadow-[0_0_80px_rgba(255,92,0,0.3)]'
                                    : 'border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]'
                                } backdrop-blur-xl hover:-translate-y-1`}
                        >
                            {/* Shimmer edge */}
                            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${tier.highlight ? 'via-orange-500/80' : 'via-white/10'} to-transparent`} />

                            {tier.highlight && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_16px_rgba(255,92,0,0.5)]">
                                    <Zap size={10} /> Most Popular
                                </div>
                            )}

                            <div className="p-8 flex-1">
                                <h3 className="text-white font-bold text-xl mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className={`text-5xl font-bold ${tier.highlight ? 'text-orange-500' : 'text-white'}`}>
                                        ${tier.price}
                                    </span>
                                    <span className="text-white/30 text-sm">/month</span>
                                </div>
                                <p className="text-white/40 text-sm leading-relaxed mb-8">{tier.description}</p>

                                <ul className="space-y-3">
                                    {tier.features.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${tier.highlight ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/40'}`}>
                                                <Check size={11} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 pt-0">
                                <a
                                    href={tier.href}
                                    className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300
                                        ${tier.highlight
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-pink-500 shadow-[0_0_20px_rgba(255,92,0,0.4)] hover:shadow-[0_0_30px_rgba(255,92,0,0.6)]'
                                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                                        }`}
                                >
                                    {tier.cta} <ArrowRight size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
