'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Bookmark, BookmarkCheck, Trash2, RotateCcw, Clock, FileCode, X, ChevronRight } from 'lucide-react'
import { VersionHistory, type Checkpoint } from '@/lib/version-history'

interface VersionHistoryPanelProps {
    projectId: string
    isOpen: boolean
    onClose: () => void
    onRestore: (checkpoint: Checkpoint) => void
}

export default function VersionHistoryPanel({
    projectId,
    isOpen,
    onClose,
    onRestore
}: VersionHistoryPanelProps) {
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
    const [restoringId, setRestoringId] = useState<string | null>(null)

    const reload = () => setCheckpoints(VersionHistory.getForProject(projectId))

    useEffect(() => {
        if (isOpen) reload()
    }, [isOpen, projectId])

    const handleRestore = async (cp: Checkpoint) => {
        setRestoringId(cp.id)
        await new Promise(r => setTimeout(r, 400))
        onRestore(cp)
        setRestoringId(null)
        onClose()
    }

    const handleBookmark = (id: string) => {
        VersionHistory.toggleBookmark(id)
        reload()
    }

    const handleDelete = (id: string) => {
        VersionHistory.delete(id)
        reload()
    }

    const bookmarked = checkpoints.filter(c => c.isBookmarked)
    const regular = checkpoints.filter(c => !c.isBookmarked)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-96 z-50 flex flex-col bg-[#0b1120]/98 backdrop-blur-3xl border-l border-white/10 shadow-3xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                    <History size={16} className="text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Version History</h2>
                                    <p className="text-[10px] text-white/30 font-medium">{checkpoints.length} checkpoints saved</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
                            {checkpoints.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                        <Clock size={28} className="text-white/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No History Yet</p>
                                        <p className="text-xs text-white/20">Build your first project to start tracking versions.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Bookmarked */}
                                    {bookmarked.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-400/60 flex items-center gap-2 px-1">
                                                <Bookmark size={10} /> Bookmarked
                                            </p>
                                            {bookmarked.map(cp => (
                                                <CheckpointCard
                                                    key={cp.id}
                                                    cp={cp}
                                                    isRestoring={restoringId === cp.id}
                                                    onRestore={handleRestore}
                                                    onBookmark={handleBookmark}
                                                    onDelete={handleDelete}
                                                    isBookmarked
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* All builds */}
                                    {regular.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20 flex items-center gap-2 px-1">
                                                <Clock size={10} /> All Builds
                                            </p>
                                            {regular.map(cp => (
                                                <CheckpointCard
                                                    key={cp.id}
                                                    cp={cp}
                                                    isRestoring={restoringId === cp.id}
                                                    onRestore={handleRestore}
                                                    onBookmark={handleBookmark}
                                                    onDelete={handleDelete}
                                                    isBookmarked={false}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function CheckpointCard({
    cp, isRestoring, onRestore, onBookmark, onDelete, isBookmarked
}: {
    cp: Checkpoint
    isRestoring: boolean
    onRestore: (cp: Checkpoint) => void
    onBookmark: (id: string) => void
    onDelete: (id: string) => void
    isBookmarked: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/[0.02] border border-white/5 hover:border-orange-500/20 rounded-2xl p-4 transition-all duration-300"
        >
            {isRestoring && (
                <div className="absolute inset-0 bg-orange-500/10 rounded-2xl flex items-center justify-center z-10">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white/80 truncate">{cp.label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{VersionHistory.formatTime(cp.timestamp)}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                        onClick={() => onBookmark(cp.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-white/20 hover:text-amber-400 hover:bg-amber-400/5'}`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                        {isBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                    </button>
                    <button
                        onClick={() => onDelete(cp.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/10 hover:text-red-400 hover:bg-red-400/5 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Prompt snippet */}
            {cp.prompt && (
                <p className="text-[10px] text-white/25 italic truncate mb-3">"{cp.prompt.substring(0, 60)}{cp.prompt.length > 60 ? '...' : ''}"</p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileCode size={10} className="text-white/20" />
                    <span className="text-[10px] text-white/25">{cp.fileCount} files</span>
                </div>
                <button
                    onClick={() => onRestore(cp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/0 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 text-white/30 hover:text-orange-400 transition-all duration-300 text-[10px] font-bold uppercase tracking-widest"
                >
                    <RotateCcw size={10} />
                    <span>Restore</span>
                    <ChevronRight size={10} />
                </button>
            </div>
        </motion.div>
    )
}
