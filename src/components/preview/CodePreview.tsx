'use client'

import { useRef, useEffect, useState } from 'react'

interface CodePreviewProps {
    code: string
}

function parseFiles(code: string) {
    const files: { path: string; content: string }[] = []
    const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g
    let match
    while ((match = regex.exec(code)) !== null) {
        files.push({ path: match[1], content: match[2].trim() })
    }
    return files
}

export default function CodePreview({ code }: CodePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [srcDoc, setSrcDoc] = useState('')

    useEffect(() => {
        if (!code) {
            setSrcDoc(`
                <!DOCTYPE html>
                <html style="background: #020617; color: #f1f5f9; font-family: 'Inter', system-ui, sans-serif; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center;">
                <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="m-0 bg-[#020617] text-white overflow-hidden">
                    <div class="space-y-6">
                        <div class="relative w-20 h-20 mx-auto">
                            <div class="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
                            <div class="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-xl">
                                <span class="text-3xl">🏗️</span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <h2 class="text-2xl font-bold tracking-tight">BuildAI Crafting Engine</h2>
                            <p class="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                                Our AI is building your high-quality architecture. 
                                <br/>The preview will initialize once the design files are ready.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
             `)
            return
        }

        const files = parseFiles(code)
        let htmlContent = ''

        // Strategy 1: Prioritize dedicated preview.html (new architecture), then index.html fallbacks
        const entryPoints = [
            'public/preview.html',  // NEW: dedicated preview file
            'preview.html',
            'public/index.html',    // Legacy fallback
            'index.html',
            '/index.html',
            'src/index.html'
        ]

        let htmlFile = files.find(f => entryPoints.includes(f.path.toLowerCase()))

        // Strategy 2: Look for ANY html file if entry points missing
        if (!htmlFile) {
            htmlFile = files.find(f => f.path.endsWith('.html'))
        }

        if (htmlFile) {
            htmlContent = htmlFile.content

            // Inject a small script to handle internal links or message parent if needed
            if (!htmlContent.includes('<script')) {
                htmlContent = htmlContent.replace('</body>', `
                    <script>
                        console.log('VibeCoder Preview Active');
                    </script>
                </body>`)
            }
        } else if (files.length > 0) {
            // Strategy 3: Multi-file project but no entry HTML. Show a high-end dashboard.
            htmlContent = `
            <!DOCTYPE html>
            <html class="dark">
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { background-color: #020617; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
                    .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
                </style>
            </head>
            <body class="flex items-center justify-center min-h-screen p-8 text-center">
                <div class="glass-card max-w-md w-full rounded-3xl p-10 shadow-2xl">
                    <div class="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"/></svg>
                    </div>
                    <h2 class="text-2xl font-bold mb-3 tracking-tight text-white">Fullstack Build Complete</h2>
                    <p class="text-slate-400 mb-8 leading-relaxed text-[15px]">
                        The BuildAI agent has finished generating your multi-file architecture. 
                        You can explore the source code in the <strong>Code</strong> tab.
                    </p>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                            <p class="text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Files</p>
                            <p class="text-lg font-mono text-orange-400">${files.length}</p>
                        </div>
                        <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                            <p class="text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Status</p>
                            <p class="text-lg text-emerald-400">Deployed</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        } else {
            // Strategy 4: Raw text fallback
            const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            htmlContent = `
                <!DOCTYPE html>
                <html style="background: #0a0a0f; color: #f1f5f9; font-family: 'JetBrains Mono', monospace; padding: 24px; font-size: 14px; line-height: 1.5;">
                <body><pre style="white-space: pre-wrap; word-wrap: break-word; color: #94a3b8;">${escapedCode}</pre></body>
                </html>
            `
        }

        setSrcDoc(htmlContent)
    }, [code])

    return (
        <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            className="w-full h-full border-0 bg-white"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            id="live-preview-iframe"
        />
    )
}
