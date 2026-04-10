'use client'

import { useRef, useEffect, useState } from 'react'

interface CodePreviewProps {
    code: string
    isSelectionMode?: boolean
}

function parseFiles(code: string) {
    const files: { path: string; content: string }[] = []
    // Handle both literal newlines and escaped \\n in file tags
    const normalized = code.replace(/\\n/g, '\n')
    const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g
    let match
    while ((match = regex.exec(normalized)) !== null) {
        const content = match[2].trim()
        if (content) files.push({ path: match[1], content })
    }
    return files
}

export default function CodePreview({ code, isSelectionMode = false }: CodePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [srcDoc, setSrcDoc] = useState('')

    useEffect(() => {
        if (!code) {
            setSrcDoc(`
                <!DOCTYPE html>
                <html style="background: #020617; color: #f1f5f9; font-family: 'Inter', system-ui, sans-serif; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center;">
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
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

        // Strategy 1: Prioritize dedicated preview.html, then index.html
        const entryPoints = [
            'public/preview.html',
            'preview.html',
            'public/index.html',
            'index.html',
            '/index.html',
            'src/index.html'
        ]

        let htmlFile = files.find(f => {
            const normalized = f.path.toLowerCase().replace(/^\.?\//, '')
            return entryPoints.some(ep => normalized === ep.toLowerCase().replace(/^\.?\//, ''))
        })

        if (!htmlFile) {
            htmlFile = files.find(f => f.path.toLowerCase().endsWith('.html'))
        }

        if (htmlFile) {
            htmlContent = htmlFile.content
            // Inject sentinel and interaction engine
            if (!htmlContent.includes('BUILD_AI_SENTINEL')) {
                htmlContent = htmlContent.replace('</body>', `
                    <script data-id="BUILD_AI_SENTINEL">
                        window.onerror = function(msg, url, line, col, error) {
                            window.parent.postMessage({ type: 'PREVIEW_ERROR', payload: { message: msg } }, '*');
                            return false; 
                        };
                        console.log('BuildAI Sentinel Active');

                        const vibeOverlay = document.createElement('div');
                        vibeOverlay.style.cssText = 'position:fixed; pointer-events:none; z-index:2147483647; border:2px solid #FF5C00; background:rgba(255,92,0,0.15); border-radius:4px; transition:all 0.05s ease-out; opacity:0; box-shadow:0 0 15px rgba(255,92,0,0.4);';
                        document.body.appendChild(vibeOverlay);

                        let vibeActiveEl = null;
                        let isSelectionMode = false;

                        window.addEventListener('message', (e) => {
                            if(e.data?.type === 'TOGGLE_VIBE_SELECT') isSelectionMode = e.data.payload.active;
                            if(!isSelectionMode) vibeOverlay.style.opacity = '0';
                        });

                        document.addEventListener('mousemove', (e) => {
                            if(!isSelectionMode) return;
                            const el = document.elementFromPoint(e.clientX, e.clientY);
                            if(!el || el === document.body || el === document.documentElement) return;
                            if(el !== vibeActiveEl) {
                                vibeActiveEl = el;
                                const rect = el.getBoundingClientRect();
                                vibeOverlay.style.left = rect.left + 'px';
                                vibeOverlay.style.top = rect.top + 'px';
                                vibeOverlay.style.width = rect.width + 'px';
                                vibeOverlay.style.height = rect.height + 'px';
                                vibeOverlay.style.opacity = '1';
                            }
                        });

                        document.addEventListener('click', (e) => {
                            if(!isSelectionMode || !vibeActiveEl) return;
                            e.preventDefault(); e.stopPropagation();
                            window.parent.postMessage({
                                type: 'VIBE_ELEMENT_SELECTED',
                                payload: { tagName: vibeActiveEl.tagName.toLowerCase(), text: vibeActiveEl.innerText }
                            }, '*');
                        }, true);
                    </script>
                </body>`)
            }
        } else if (files.length > 0) {
            // Strategy JSX-Mock: Convert component source to visual mock
            const mainPage = files.find(f => 
                f.path.toLowerCase().includes('page.tsx') || 
                f.path.toLowerCase().includes('app.tsx') || 
                f.path.toLowerCase().includes('index.tsx')
            ) || files[0]

            if (mainPage) {
                let bodyMock = mainPage.content
                    .replace(/^\s*import.*$/gm, '') // Remove imports
                    .replace(/^\s*export.*$/gm, '') // Remove exports
                    .replace(/^.*export\s+default\s+function.*$/gm, '')
                    .replace(/return\s*\(\s*/g, '')
                    .replace(/\s*\);?\s*\}\s*$/gm, '')
                    .replace(/className=/g, 'class=')
                    .replace(/\{(['"])([^'"]+)\1\}/g, '$2')
                    .replace(/\{`([^`]+)`\}/g, '$1')
                    .replace(/\{[^{}]*\}/g, '') // remove JS blocks
                    .replace(/<motion\.[a-z0-9]+/gi, m => m.replace('<motion.', '<'))
                    .replace(/<\/motion\.[a-z0-9]+>/gi, m => m.replace('</motion.', '</'))
                    .replace(/<Link/g, '<a').replace(/<\/Link>/g, '</a>')
                    .replace(/<[A-Z][a-zA-Z0-9]*/g, '<div')
                    .replace(/<\/[A-Z][a-zA-Z0-9]*/g, '</div')
                    .trim()
                
                // Aggressive source cleanup
                if (bodyMock.includes('import ') || bodyMock.includes('export ')) {
                   const firstTag = bodyMock.indexOf('<');
                   if (firstTag !== -1) bodyMock = bodyMock.substring(firstTag);
                }

                htmlContent = `
                <!DOCTYPE html>
                <html class="dark">
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { background-color: #020617; color: #f1f5f9; font-family: 'Inter', sans-serif; }
                        h1, h2, h3, .syne { font-family: 'Syne', sans-serif; }
                        .mock-root { padding: 4rem 2rem; display: flex; flex-direction: column; gap: 2rem; align-items: center; }
                    </style>
                </head>
                <body class="min-h-screen">
                    <div class="fixed top-4 left-4 z-[999] px-3 py-1 bg-[#FF5C00]/20 border border-[#FF5C00]/50 text-[#FF5C00] rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">Virtual High-Fidelity Preview</div>
                    <div class="mock-root">${bodyMock}</div>
                </body>
                </html>`
            }
        } else {
            const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            htmlContent = `<!DOCTYPE html><body style="background:#0a0a0f;color:#94a3b8;font-family:monospace;padding:2rem;"><pre>${escaped}</pre></body></html>`
        }

        setSrcDoc(htmlContent)
    }, [code])

    // Sync isSelectionMode prop by posting message to iframe
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'TOGGLE_VIBE_SELECT', payload: { active: isSelectionMode } },
                '*'
            )
        }
    }, [isSelectionMode])

    return (
        <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            className="w-full h-full border-0 bg-[#020617]"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
    )
}
