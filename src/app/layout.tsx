import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'BuildAI – The Elite AI Vibe Coding Platform',
    description: 'Create production-grade apps and high-fidelity websites by chatting with AI. The professional environment for the next generation of software creators.',
    keywords: 'BuildAI, AI coding, vibe coding, software generation, AI architect',
    openGraph: {
        title: 'BuildAI – The Elite AI Vibe Coding Platform',
        description: 'Elite code generation for modern software.',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased bg-vibe-bg-primary text-vibe-text-primary min-h-screen">
                {children}
            </body>
        </html>
    )
}
