'use client'

import { useState, useMemo, useEffect } from 'react'
import { Copy, Check, FileCode2, ChevronRight, FolderOpen, File } from 'lucide-react'
import Editor from '@monaco-editor/react'

interface CodeViewerProps {
    code: string
    isGenerating?: boolean
}

interface ParsedFile {
    path: string
    content: string
    language: string
}

function getLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || ''
    const map: Record<string, string> = {
        tsx: 'typescript', ts: 'typescript', jsx: 'javascript', js: 'javascript',
        css: 'css', html: 'html', json: 'json', md: 'markdown',
        sql: 'sql', prisma: 'prisma', env: 'shell', yaml: 'yaml', yml: 'yaml',
    }
    return map[ext] || 'plaintext'
}

function parseFiles(raw: string): ParsedFile[] {
    const files: ParsedFile[] = []
    const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g
    let match
    while ((match = regex.exec(raw)) !== null) {
        const path = match[1].trim()
        files.push({
            path,
            content: match[2].trim(),
            language: getLanguage(path),
        })
    }
    return files
}

function buildTree(files: ParsedFile[]): Record<string, ParsedFile[]> {
    const tree: Record<string, ParsedFile[]> = {}
    for (const f of files) {
        const parts = f.path.split('/')
        const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
        if (!tree[dir]) tree[dir] = []
        tree[dir].push(f)
    }
    return tree
}

export default function CodeViewer({ code, isGenerating }: CodeViewerProps) {
    const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const [sidebarExpanded, setSidebarExpanded] = useState(true)

    const files = useMemo(() => parseFiles(code), [code])
    const tree = useMemo(() => buildTree(files), [files])

    // Auto-follow: Select newest file during generation
    useEffect(() => {
        if (isGenerating && files.length > 0) {
            setActiveFilePath(files[files.length - 1].path)
        }
    }, [files.length, isGenerating])

    // Track active file by path, fallback to first file if path not found
    const activeFile = useMemo(() => {
        if (!activeFilePath) return files[0] || null
        return files.find(f => f.path === activeFilePath) || files[0] || null
    }, [files, activeFilePath])

    const handleCopy = async () => {
        if (!activeFile) return
        await navigator.clipboard.writeText(activeFile.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleCopyAll = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!code || files.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0d0d12]">
                <div className="text-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <FileCode2 size={28} className="text-white/20" />
                    </div>
                    <div>
                        <p className="text-white/40 text-sm font-medium">No code generated yet</p>
                        <p className="text-white/20 text-xs mt-1">Send a prompt to get started</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0d0d12] overflow-hidden">
            {/* File Tree Sidebar and Editor Container */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* File Tree Sidebar */}
                <div className={`${sidebarExpanded ? 'w-56' : 'w-0'} border-r border-white/5 bg-[#0a0a10] flex flex-col transition-all duration-200 shrink-0 overflow-hidden`}>
                    <div className="p-2 border-b border-white/5 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">
                            Files ({files.length})
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto py-1">
                        {Object.entries(tree).map(([dir, dirFiles]) => (
                            <div key={dir}>
                                {dir !== '.' && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] text-white/30 font-mono">
                                        <FolderOpen size={10} className="text-vibe-accent-blue/50" />
                                        {dir}
                                    </div>
                                )}
                                {dirFiles.map((f) => {
                                    const idx = files.indexOf(f)
                                    const fileName = f.path.split('/').pop() || f.path
                                    return (
                                        <button
                                            key={f.path}
                                            onClick={() => setActiveFilePath(f.path)}
                                            className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono transition-colors ${activeFile?.path === f.path
                                                ? 'bg-vibe-accent-blue/10 text-vibe-accent-blue border-r-2 border-vibe-accent-blue'
                                                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                                }`}
                                            style={{ paddingLeft: dir !== '.' ? '24px' : '12px' }}
                                        >
                                            <File size={10} className="shrink-0 opacity-50" />
                                            <span className="truncate">{fileName}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] overflow-hidden">
                    {/* Tab Bar */}
                    <div className="h-9 flex items-center justify-between border-b border-white/5 bg-[#13131a] px-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                                className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors shrink-0"
                            >
                                <ChevronRight size={12} className={`transition-transform ${sidebarExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {activeFile && (
                                <span className="text-[11px] font-mono text-white/50 truncate max-w-[200px] sm:max-w-[400px]">
                                    {activeFile.path}
                                </span>
                            )}
                            {isGenerating && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse shrink-0">
                                    generating...
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                                title="Copy file"
                            >
                                {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button
                                onClick={handleCopyAll}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                                title="Copy all files"
                            >
                                <Copy size={10} />
                                All
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 relative">
                        {activeFile ? (
                            <Editor
                                height="100%"
                                language={activeFile.language}
                                theme="vs-dark"
                                value={activeFile.content}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    fontFamily: 'JetBrains Mono, Menlo, monospace',
                                    wordWrap: 'on',
                                    padding: { top: 16, bottom: 16 },
                                    scrollBeyondLastLine: false,
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    formatOnPaste: true,
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/20 text-sm">
                                Select a file to view
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
