'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import StatsGrid from '@/components/StatsGrid'
import TemplateGrid from '@/components/TemplateGrid'
import PromptBar from '@/components/PromptBar'
import { ProjectDatabase, type Project } from '@/lib/db'
import { Folder, Clock, ChevronRight, Plus, Trash2, Sparkles, LayoutGrid } from 'lucide-react'

export default function DashboardPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadProjects = async () => {
        const all = await ProjectDatabase.getAllProjects()
        setProjects(all)
        setIsLoading(false)
    }

    useEffect(() => {
        loadProjects()
        const onFocus = () => loadProjects()
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
    }, [])

    const handleCreateProject = () => {
        const id = crypto.randomUUID()
        router.push(`/project/${id}`)
    }

    const handlePromptSubmit = (prompt: string) => {
        const id = crypto.randomUUID()
        const encoded = encodeURIComponent(prompt)
        router.push(`/project/${id}?prompt=${encoded}`)
    }

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation()
        if (confirm('Delete this project? This cannot be undone.')) {
            await ProjectDatabase.deleteProject(projectId)
            await loadProjects()
        }
    }

    const formatDate = (iso: string) => {
        try {
            const d = new Date(iso)
            const now = new Date()
            const diffMs = now.getTime() - d.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMins / 60)
            const diffDays = Math.floor(diffHours / 24)

            if (diffMins < 1) return 'Just now'
            if (diffMins < 60) return `${diffMins}m ago`
            if (diffHours < 24) return `${diffHours}h ago`
            if (diffDays < 7) return `${diffDays}d ago`
            return d.toLocaleDateString()
        } catch {
            return 'Recently'
        }
    }

    return (
        <div className="flex h-screen bg-[#0B0F19] overflow-hidden font-sans selection:bg-orange-500/30">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Decorative background effects */}
                <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

                <DashboardHeader onCreateProject={handleCreateProject} />

                <main className="flex-1 overflow-y-auto p-8 pb-32 space-y-16 relative z-10 scroll-smooth no-scrollbar">
                    <StatsGrid onCreateProject={handleCreateProject} />

                    {/* Recent Projects Section */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                    <LayoutGrid size={20} className="text-orange-500" />
                                    Active Projects
                                    {projects.length > 0 && (
                                        <span className="text-xs font-bold text-white/20 ml-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                            {projects.length}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-sm text-white/30 font-medium">Continue where you left off with your AI-generated apps.</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="glass-card h-56 animate-pulse bg-white/[0.02] border-white/5" />
                                ))}
                            </div>
                        ) : projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {projects.map((p) => (
                                        <motion.div
                                            key={p.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            onClick={() => router.push(`/project/${p.id}`)}
                                            className="glass-card group overflow-hidden cursor-pointer transition-all duration-500 hover:border-orange-500/40 relative bg-white/[0.02] border-white/5 flex flex-col h-full"
                                        >
                                            {/* Preview Image / Thumbnail */}
                                            <div className="h-36 bg-white/[0.03] relative overflow-hidden border-b border-white/5">
                                                {p.preview_html ? (
                                                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                                                        <iframe
                                                            srcDoc={p.preview_html}
                                                            className="w-[400%] h-[400%] border-0 origin-top-left scale-[0.25]"
                                                            sandbox="allow-scripts"
                                                            title={`${p.name} preview`}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                                                        <Folder size={40} className="text-white group-hover:scale-110 transition-transform duration-700" />
                                                    </div>
                                                )}

                                                {/* Delete button Over */}
                                                <button
                                                    onClick={(e) => handleDeleteProject(e, p.id)}
                                                    className="absolute top-3 left-3 z-20 w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-300 backdrop-blur-md"
                                                    title="Delete project"
                                                >
                                                    <Trash2 size={14} className="text-red-400" />
                                                </button>

                                                <div className="absolute top-3 right-3 z-10">
                                                    <span className="px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">
                                                        {p.file_count || 1} FILES
                                                    </span>
                                                </div>

                                                {/* Hover Glow */}
                                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div className="space-y-2">
                                                    <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors truncate">
                                                        {p.name || 'Untitled Project'}
                                                    </h3>
                                                    {p.prompt && (
                                                        <p className="text-[11px] text-white/30 font-medium line-clamp-2 leading-relaxed" title={p.prompt}>
                                                            {p.prompt}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between pt-4 mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{formatDate(p.updated_at)}</span>
                                                    </div>
                                                    <ChevronRight size={14} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Start New Project Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCreateProject}
                                    className="glass-card border-dashed border-white/10 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-orange-500/30 hover:bg-white/[0.03] transition-all duration-500 group relative overflow-hidden"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-500/10 group-hover:border-orange-500/40 transition-all duration-500">
                                        <Plus size={24} className="text-white/40 group-hover:text-orange-400" />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Deploy Fresh</span>
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1.5">Start from blank</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                </motion.div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-16 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-white/10 bg-white/[0.01]"
                            >
                                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 text-white/20">
                                    <Folder size={48} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">No deployments detected</h3>
                                    <p className="text-sm text-white/30 font-medium max-w-sm mx-auto leading-relaxed">
                                        Your digital creations will appear here. Start by describing your vision in the prompt bar below.
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreateProject}
                                    className="px-8 py-3 rounded-xl bg-orange-500 text-white font-bold text-xs uppercase tracking-[.25em] shadow-xl shadow-orange-500/20"
                                >
                                    Launch Project
                                </motion.button>
                            </motion.div>
                        )}
                    </section>

                    <TemplateGrid onSelectTemplate={handlePromptSubmit} />
                </main>

                <PromptBar onSubmit={handlePromptSubmit} />
            </div>
        </div>
    )
}
