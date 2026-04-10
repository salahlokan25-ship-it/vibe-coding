'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Download, ExternalLink, Loader2, Check, Copy, ChevronDown, Github, X } from 'lucide-react'

interface DeployButtonProps {
    projectFiles: Record<string, string>
    generatedCode: string
    projectName?: string
    isGenerating: boolean
}

export default function DeployButton({ projectFiles, generatedCode, projectName = 'buildai-project', isGenerating }: DeployButtonProps) {
    const [isDeploying, setIsDeploying] = useState(false)
    const [deployUrl, setDeployUrl] = useState<string | null>(null)
    const [deployError, setDeployError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // GitHub Sync State
    const [showGithubModal, setShowGithubModal] = useState(false)
    const [githubToken, setGithubToken] = useState('')
    const [githubRepo, setGithubRepo] = useState(projectName)
    const [isSyncing, setIsSyncing] = useState(false)
    const [githubError, setGithubError] = useState<string | null>(null)

    const hasFiles = Object.keys(projectFiles).length > 0

    const handleDeploy = async () => {
        if (!hasFiles || isDeploying) return
        setIsDeploying(true)
        setDeployError(null)
        setDeployUrl(null)

        try {
            const res = await fetch('/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: projectFiles,
                    projectName,
                }),
            })
            const data = await res.json()
            if (data.success && data.deployUrl) {
                setDeployUrl(data.deployUrl)
            } else {
                setDeployError(data.manifest?.instructions?.join('\n') || 'Deploy ready — download ZIP below')
            }
        } catch (err: any) {
            setDeployError('Deploy failed. Try downloading the ZIP.')
        } finally {
            setIsDeploying(false)
        }
    }

    const handleDownloadZip = () => {
        if (!hasFiles) return
        // Build a simple text-based export
        const fileContents = Object.entries(projectFiles)
            .map(([path, content]) => `// FILE: ${path}\n${content}`)
            .join('\n\n// ────────────────────────\n\n')

        const blob = new Blob([fileContents], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName.replace(/\s+/g, '-')}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleCopy = () => {
        if (!deployUrl) return
        navigator.clipboard.writeText(deployUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleGithubSync = async () => {
        if (!githubToken.trim() || !githubRepo.trim() || !hasFiles) return
        setIsSyncing(true)
        setGithubError(null)

        try {
            const res = await fetch('/api/github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: projectFiles,
                    repoName: githubRepo.trim(),
                    token: githubToken.trim()
                })
            })
            const data = await res.json()
            if (data.success && data.url) {
                setDeployUrl(data.url)
                setShowGithubModal(false)
            } else {
                setGithubError(data.error || 'Failed to sync to GitHub')
            }
        } catch (err: any) {
            setGithubError(err.message || 'Network error occurred')
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="relative">
            <div className="flex items-center">
                {/* Main deploy button */}
                <motion.button
                    whileHover={hasFiles && !isGenerating ? { scale: 1.02 } : {}}
                    whileTap={hasFiles && !isGenerating ? { scale: 0.98 } : {}}
                    onClick={handleDeploy}
                    disabled={!hasFiles || isDeploying || isGenerating}
                    className={`flex items-center gap-2 px-4 py-2 rounded-l-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${hasFiles && !isGenerating
                        ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-[0_0_20px_rgba(255,92,0,0.3)] hover:shadow-[0_0_30px_rgba(255,92,0,0.5)]'
                        : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                        }`}
                >
                    {isDeploying ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : deployUrl ? (
                        <Check size={12} />
                    ) : (
                        <Rocket size={12} />
                    )}
                    <span>{isDeploying ? 'Deploying...' : deployUrl ? 'Deployed!' : 'Deploy'}</span>
                </motion.button>

                {/* Dropdown arrow */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={!hasFiles || isGenerating}
                    className={`h-full px-2 py-2 rounded-r-xl border-l border-white/10 font-bold transition-all duration-300 ${hasFiles && !isGenerating
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white'
                        : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                        }`}
                >
                    <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute top-full mt-2 right-0 w-52 bg-[#0b1120]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-3xl z-50 overflow-hidden"
                    >
                        <div className="p-1.5 space-y-0.5">
                            <button
                                onClick={() => { setIsOpen(false); handleDeploy() }}
                                disabled={!hasFiles || isDeploying}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                            >
                                <Rocket size={14} className="text-orange-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Deploy Live</p>
                                    <p className="text-[9px] text-white/30">Push to Netlify instantly</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { setIsOpen(false); handleDownloadZip() }}
                                disabled={!hasFiles}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                            >
                                <Download size={14} className="text-blue-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Download Files</p>
                                    <p className="text-[9px] text-white/30">Export project source code</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { setIsOpen(false); setShowGithubModal(true); setDeployUrl(null); }}
                                disabled={!hasFiles}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                            >
                                <Github size={14} className="text-white shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">GitHub Sync</p>
                                    <p className="text-[9px] text-white/30">Commit to a repository</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success URL display */}
            <AnimatePresence>
                {deployUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full mt-3 right-0 w-72 bg-[#0b1120]/98 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl shadow-3xl z-50 overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                    {deployUrl.includes('github.com') ? 'Synced to GitHub!' : 'Live on Netlify!'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
                                <span className="flex-1 text-[10px] text-white/60 truncate font-mono">{deployUrl}</span>
                                <button onClick={handleCopy} className="text-white/30 hover:text-white transition-all shrink-0">
                                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                                <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-orange-400 transition-all shrink-0">
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GitHub Sync Modal */}
            <AnimatePresence>
                {showGithubModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Github size={18} className="text-white" />
                                    <h3 className="font-bold text-white">Sync to GitHub</h3>
                                </div>
                                <button onClick={() => setShowGithubModal(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-white/60 mb-1.5">Repository Name</label>
                                    <input
                                        type="text"
                                        value={githubRepo}
                                        onChange={e => setGithubRepo(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vibe-accent-blue/50"
                                        placeholder="my-awesome-app"
                                    />
                                    <p className="text-[10px] text-white/30 mt-1.5">Will be created as a private repo if it doesn't exist.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-white/60 mb-1.5">Personal Access Token (classic)</label>
                                    <input
                                        type="password"
                                        value={githubToken}
                                        onChange={e => setGithubToken(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vibe-accent-blue/50"
                                        placeholder="ghp_xxxxxxxxxxxx"
                                    />
                                    <p className="text-[10px] text-white/30 mt-1.5">Needs 'repo' scope. Token is never stored on our servers.</p>
                                </div>

                                {githubError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-[11px] text-red-400 font-medium">{githubError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleGithubSync}
                                    disabled={!githubToken || !githubRepo || isSyncing}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                                >
                                    {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    {isSyncing ? 'Syncing to GitHub...' : 'Commit & Push'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
