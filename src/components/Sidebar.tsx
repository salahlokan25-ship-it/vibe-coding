'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    FolderOpen,
    Sparkles,
    BarChart3,
    Settings,
    HelpCircle,
    Zap,
    ChevronRight
} from 'lucide-react'

const mainNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', href: '/dashboard/projects', icon: FolderOpen },
    { label: 'AI Templates', href: '/dashboard/templates', icon: Sparkles },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

const systemNav = [
    { label: 'Configuration', href: '/dashboard/config', icon: Settings },
    { label: 'Support', href: '/dashboard/support', icon: HelpCircle },
]

interface SidebarProps {
    usage?: { used: number; total: number }
}

export default function Sidebar({ usage = { used: 13, total: 20 } }: SidebarProps) {
    const pathname = usePathname()
    const usagePercent = Math.round((usage.used / usage.total) * 100)

    return (
        <aside className="w-[240px] h-screen flex flex-col bg-[#0B0F19] border-r border-white/[0.06] shrink-0 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-[-50%] w-[150%] h-[20%] bg-orange-500/5 blur-[80px] rounded-full opacity-50" />
            </div>

            <div className="p-6 mb-8 relative z-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.4)] group-hover:shadow-[0_0_25px_rgba(255,92,0,0.6)] transition-all duration-300">
                        <Zap size={18} className="text-white fill-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">
                        Build<span className="text-orange-500">AI</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 relative z-10 overflow-y-auto no-scrollbar">
                {mainNav.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/[0.05] text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'}`}
                            id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-white/[0.05] border border-white/5 rounded-xl"
                                />
                            )}
                            {isActive && (
                                <div className="absolute left-[-16px] w-1 h-6 bg-orange-500 rounded-r-full shadow-[4px_0_12px_rgba(255,92,0,0.8)]" />
                            )}
                            <item.icon size={18} className={`relative transition-colors ${isActive ? 'text-orange-400' : 'group-hover:text-white/60'}`} />
                            <span className="relative text-sm font-bold tracking-tight">{item.label}</span>
                            {isActive && <ChevronRight size={14} className="relative ml-auto opacity-40" />}
                        </Link>
                    )
                })}

                <div className="pt-8 pb-3 px-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                        System
                    </span>
                </div>

                {systemNav.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/5 text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'}`}
                            id={`sidebar-${item.label.toLowerCase()}`}
                        >
                            <item.icon size={17} />
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Usage Card */}
            <div className="p-4 relative z-10">
                <div className="rounded-[1.5rem] bg-white/[0.02] border border-white/5 p-5 space-y-4 backdrop-blur-3xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Storage Used</span>
                        <span className="text-xs font-black text-orange-400">{usagePercent}%</span>
                    </div>

                    <div className="space-y-2">
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${usagePercent}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_0_12px_rgba(255,92,0,0.5)]"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                            <span className="text-white/20">{usage.used} / {usage.total} Projects</span>
                            <button className="text-orange-400/60 hover:text-orange-400 transition-colors uppercase tracking-widest">Upgrade</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* User Profile Area */}
            <div className="p-4 border-t border-white/[0.06] relative z-10 bg-white/[0.02] backdrop-blur-3xl group">
                <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5 active:scale-95 duration-200">
                    <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center relative overflow-hidden">
                        <span className="text-orange-400 font-bold text-xs uppercase tracking-widest">S</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-bold text-white uppercase tracking-widest truncate">Engineer</p>
                        <p className="text-[10px] text-white/30 font-medium truncate">Premium Account</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                </button>
            </div>
        </aside>
    )
}
