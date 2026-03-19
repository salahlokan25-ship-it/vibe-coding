'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, Menu, X, ChevronDown } from 'lucide-react'

const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Showcase', href: '/showcase' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const router = useRouter()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0B0F19]/80 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_16px_rgba(255,92,0,0.5)] group-hover:shadow-[0_0_24px_rgba(255,92,0,0.7)] transition-all duration-300">
                        <Zap size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">
                        Build<span className="text-orange-500">AI</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/auth"
                        className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2"
                        id="signin-link"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/"
                        onClick={(e) => {
                            e.preventDefault()
                            document.getElementById('hero-prompt-input')?.focus()
                        }}
                        className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm overflow-hidden shadow-[0_0_20px_rgba(255,92,0,0.35)] hover:shadow-[0_0_30px_rgba(255,92,0,0.5)] transition-all duration-300"
                        id="get-started-btn"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative">Start Building Free</span>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-white/70"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    id="mobile-menu-btn"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/[0.06] bg-[#020617]/95 backdrop-blur-2xl animate-slide-up">
                    <div className="px-6 py-4 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <hr className="border-white/[0.06] my-2" />
                        <Link href="/auth" className="px-3 py-2 text-white/60 hover:text-white rounded-lg transition-colors text-sm">
                            Sign in
                        </Link>
                        <Link
                            href="/"
                            className="btn-primary text-center text-sm"
                            onClick={() => setMobileOpen(false)}
                        >
                            Start Building Free
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
