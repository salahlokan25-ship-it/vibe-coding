import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function CatchAllPage({ params }: { params: { slug: string[] } }) {
    const pageName = params.slug.join('/').replace(/-/g, ' ')

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center relative overflow-hidden px-4">
            {/* Animated Background Mesh */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none animate-mesh-spin" />
            <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-accent-indigo/10 rounded-full blur-[100px] pointer-events-none animate-float-delayed" />

            <div className="relative z-10 glass-card p-12 max-w-lg w-full text-center space-y-8 animate-fade-in border border-border-subtle/50 shadow-2xl backdrop-blur-3xl animate-float">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-indigo/20 border border-accent-blue/30 flex items-center justify-center animate-pulse-glow">
                    <Sparkles className="text-accent-blue" size={28} />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 capitalize">
                        {pageName}
                    </h1>
                    <p className="text-text-muted text-lg">
                        This feature is currently under active development by our AI agents. Stay tuned for updates!
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/workspace?prompt=Build%20a%20landing%20page" className="btn-primary w-full justify-center group">
                        Start Building with AI
                        <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <Link href="/dashboard" className="flex items-center justify-center gap-2 px-4 py-2 text-text-secondary hover:text-white transition-colors duration-200">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
