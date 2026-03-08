'use client'

import Link from 'next/link'
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="relative pt-24 pb-12 border-t border-white/[0.06] bg-[#0B0F19]">
            {/* Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.4)]">
                                <Zap size={18} className="text-white fill-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">
                                Build<span className="text-orange-500">AI</span>
                            </span>
                        </Link>
                        <p className="text-sm text-white/30 leading-relaxed font-medium">
                            The world's first multi-agent coding engine for founders and engineers.
                            Design, build, and ship in seconds.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-orange-500/10 hover:border-orange-500/20 transition-all duration-300">
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/10 mb-6 font-sans">Platforms</h4>
                        <ul className="space-y-4">
                            {['Next.js', 'React Native', 'Vite SPA', 'Astro'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-white/30 hover:text-orange-400 font-bold tracking-tight transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/10 mb-6 font-sans">Company</h4>
                        <ul className="space-y-4">
                            {['About', 'Privacy', 'Terms', 'Docs'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-white/30 hover:text-orange-400 font-bold tracking-tight transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/10 mb-6 font-sans">Contact</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="mailto:hello@buildai.app" className="flex items-center gap-3 text-sm text-white/30 hover:text-orange-400 font-bold tracking-tight transition-colors">
                                    <Mail size={16} /> hello@buildai.app
                                </Link>
                            </li>
                            <li>
                                <span className="text-sm text-white/30 font-bold tracking-tight">San Francisco, CA</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/10">
                        © 2026 BuildAI Systems. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Core Nodes Optimized</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">v2.5.0-STITCH</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
