'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function BottomCTA() {
    const scrollToPrompt = () => {
        document.getElementById('hero-prompt-input')?.focus()
        document.getElementById('hero-prompt-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return (
        <section className="relative py-32 px-6 overflow-hidden">
            {/* Atmosphere */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.04] to-transparent pointer-events-none" />
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold uppercase tracking-[0.15em] mb-8">
                        <Sparkles size={12} /> Get Started Today
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                        Your next app starts{' '}
                        <span className="text-orange-500">
                            right now.
                        </span>
                    </h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Join thousands of builders turning ideas into production-ready software in seconds.
                        No setup. No config. Just describe and build.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.button
                            onClick={scrollToPrompt}
                            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(255,92,0,0.6)' }}
                            whileTap={{ scale: 0.97 }}
                            className="relative group px-10 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm uppercase tracking-wider overflow-hidden shadow-[0_0_25px_rgba(255,92,0,0.4)] flex items-center gap-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-2">
                                Build For Free <ArrowRight size={16} />
                            </span>
                        </motion.button>
                        <motion.a
                            href="/dashboard"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-10 py-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 font-black text-sm uppercase tracking-wider backdrop-blur-sm transition-all duration-300"
                        >
                            View My Projects
                        </motion.a>
                    </div>

                    {/* Social proof */}
                    <p className="mt-10 text-xs text-white/30 uppercase tracking-[0.2em]">
                        No credit card required · Free forever plan available
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
