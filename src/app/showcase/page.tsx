'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Sparkles, ExternalLink } from 'lucide-react'
import { useRef } from 'react'

const projects = [
    {
        name: 'Nexus Fintech App',
        description: 'A complete dark-mode banking dashboard with real-time charts.',
        category: 'Dashboard',
        color: 'from-orange-500 to-red-500'
    },
    {
        name: 'Aether Audio',
        description: 'Multi-track audio visualizer built entirely from natural language.',
        category: 'Media',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        name: 'Vanguard OS',
        description: 'A web-based operating system UI with draggable floating windows.',
        category: 'Experimental',
        color: 'from-purple-500 to-pink-500'
    },
    {
        name: 'Lumina Analytics',
        description: 'Data platform handling complex geographic map renderings.',
        category: 'SaaS',
        color: 'from-emerald-500 to-teal-500'
    }
]

export default function ShowcasePage() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const scaleImg = useTransform(scrollYProgress, [0, 1], [1, 1.2])
    const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0])

    return (
        <main className="min-h-screen bg-[#0B0F19] overflow-x-hidden font-sans pt-20" ref={containerRef}>
            <Navbar />

            <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 overflow-hidden">
                <motion.div
                    className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60"
                    style={{ y: yImg, scale: scaleImg }}
                >
                    <div className="relative w-[1200px] h-[1200px] max-w-[150vw]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-[#0B0F19] z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-transparent to-[#0B0F19] z-10" />
                        <img
                            src="/images/showcase-3d.png"
                            alt="3D Holographic Showcase Display"
                            className="w-full h-full object-cover mix-blend-screen scale-110"
                        />
                    </div>
                </motion.div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] z-0 pointer-events-none" />

                <motion.div style={{ opacity: opacityHero }} className="relative z-10 max-w-4xl text-center space-y-8 mt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(255,92,0,0.2)]"
                    >
                        <Sparkles size={14} className="animate-pulse" />
                        <span>Built with BuildAI</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-[1.1]"
                    >
                        Hall of <span className="text-orange-500">Magic</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        Explore the absolute limits of zero-code architecture. Every project here was built using only natural language.
                    </motion.p>
                </motion.div>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((p, i) => (
                        <motion.div
                            key={p.name}
                            initial={{ opacity: 0, y: 50, rotateX: 10 }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, delay: i * 0.15 }}
                            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, y: -10 }}
                            className="group relative h-96 rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/10 cursor-pointer perspective-1000 will-change-transform shadow-[0_0_0_transparent] hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=85')] bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay" />
                            <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-20 group-hover:opacity-30 transition-opacity duration-700`} />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

                            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                <ExternalLink size={16} className="text-white" />
                            </div>

                            <div className="absolute bottom-0 left-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest backdrop-blur-md mb-4 inline-block">
                                    {p.category}
                                </span>
                                <h3 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all">
                                    {p.name}
                                </h3>
                                <p className="text-white/60 font-medium max-w-sm line-clamp-2 leading-relaxed opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-75">
                                    {p.description}
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
