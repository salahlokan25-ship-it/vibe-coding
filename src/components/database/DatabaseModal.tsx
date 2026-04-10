import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, X, Loader2, Check, AlertCircle } from 'lucide-react'

interface DatabaseModalProps {
    isOpen: boolean
    onClose: () => void
    projectFiles: Record<string, string>
}

export default function DatabaseModal({ isOpen, onClose, projectFiles }: DatabaseModalProps) {
    const [connectionString, setConnectionString] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)

    // Find the first SQL file (usually schema.sql or anything matching CREATE TABLE)
    const sqlFile = useMemo(() => {
        const fileNames = Object.keys(projectFiles)
        let target = fileNames.find(f => f.endsWith('.sql'))
        if (!target) {
            target = fileNames.find(f => projectFiles[f].includes('CREATE TABLE'))
        }
        return target ? { name: target, content: projectFiles[target] } : null
    }, [projectFiles])

    const handleRunMigration = async () => {
        if (!connectionString || !sqlFile) return
        setIsRunning(true)
        setResult(null)

        try {
            const res = await fetch('/api/database/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionString: connectionString.trim(),
                    sql: sqlFile.content
                })
            })

            const data = await res.json()
            if (data.success) {
                setResult({ success: true, message: 'Migration executed successfully!' })
            } else {
                setResult({ success: false, message: data.error || 'Syntax error or connection failure.' })
            }
        } catch (err: any) {
            setResult({ success: false, message: err.message || 'Network error executing SQL' })
        } finally {
            setIsRunning(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="w-full max-w-lg bg-[#0d1117] border border-vibe-accent-purple/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col max-h-[85vh]"
                >
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-vibe-accent-purple/20 flex items-center justify-center border border-vibe-accent-purple/30">
                                <Database size={16} className="text-vibe-accent-purple" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white tracking-tight">Supabase / Postgres Runner</h3>
                                <p className="text-[10px] text-white/50 uppercase tracking-wider">Execute Schema Migrations</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-5 overflow-y-auto min-h-0">
                        {!sqlFile ? (
                            <div className="text-center p-8 border border-white/5 rounded-xl bg-white/[0.02]">
                                <p className="text-sm text-white/50">No database schemas found in the current project.</p>
                                <p className="text-xs text-white/30 mt-1">Ask the AI to generate a "schema.sql" file first.</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-[11px] font-bold text-white/60 mb-2 uppercase tracking-wider">Target SQL File</label>
                                    <div className="bg-[#050505] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                        <Database size={14} className="text-white/30" />
                                        <span className="text-sm font-mono text-emerald-400">{sqlFile.name}</span>
                                    </div>
                                    <div className="mt-2 bg-[#050505] border border-white/10 rounded-xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                                        <pre className="text-[11px] text-white/40 font-mono whitespace-pre-wrap leading-relaxed">
                                            {sqlFile.content.substring(0, 500)}
                                            {sqlFile.content.length > 500 && '\n\n... (truncated for preview)'}
                                        </pre>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-white/60 mb-2 uppercase tracking-wider">Connection URI</label>
                                    <input
                                        type="password"
                                        value={connectionString}
                                        onChange={e => setConnectionString(e.target.value)}
                                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vibe-accent-purple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono transition-all"
                                        placeholder="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
                                    />
                                    <p className="text-[10px] text-white/40 mt-2">Find this setting in Supabase Project Settings -{'>'} Database -{'>'} Connection string.</p>
                                </div>

                                {result && (
                                    <div className={`p-3 border rounded-xl flex items-start gap-2 ${result.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                        {result.success ? <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> : <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                                        <p className={`text-xs ${result.success ? 'text-emerald-400' : 'text-red-400 font-mono'}`}>{result.message}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleRunMigration}
                                    disabled={!connectionString || isRunning}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-vibe-accent-purple to-pink-600 text-white font-bold uppercase tracking-widest text-[11px] rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                                    {isRunning ? 'Executing Schema...' : 'Run Migration'}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div >
        </AnimatePresence >
    )
}
