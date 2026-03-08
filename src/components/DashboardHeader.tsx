'use client'

import { useEffect, useState } from 'react'
import { Search, Bell, LogOut, Settings, HelpCircle, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface DashboardHeaderProps {
    onCreateProject: () => void
}

export default function DashboardHeader({ onCreateProject }: DashboardHeaderProps) {
    const [email, setEmail] = useState<string>('')
    const [scrolled, setScrolled] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) {
                setEmail(user.email)
            }
        })

        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/auth')
    }

    const initial = email ? email[0].toUpperCase() : 'B'

    return (
        <header className={`sticky top-0 z-50 h-16 transition-all duration-300 ${scrolled ? 'bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl' : 'bg-transparent'} flex items-center justify-between px-8`}>
            {/* Left: Search Area */}
            <div className="flex items-center gap-6 flex-1 max-w-xl">
                <div className="relative group flex-1 max-w-sm">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:bg-white/[0.06] focus:border-orange-500/50 transition-all duration-300"
                        id="dashboard-search"
                    />
                </div>
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button
                    className="relative p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                    aria-label="Notifications"
                    id="notifications-btn"
                >
                    <Bell size={18} className="transition-transform group-hover:rotate-12" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(255,92,0,0.8)] border-2 border-[#0B0F19]" />
                </button>

                {/* Settings Toggle (Visual Only) */}
                <button
                    className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    aria-label="Settings"
                >
                    <Settings size={18} />
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-white/10 mx-2" />

                {/* User Profile Area */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-105 transition-transform">
                            {initial}
                        </div>
                        <div className="hidden lg:block text-left mr-2">
                            <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{email.split('@')[0] || 'Builder'}</p>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Architect</p>
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-3 w-56 glass-card p-2 z-50 bg-[#0b1120]/95 backdrop-blur-3xl shadow-3xl border-white/10"
                                >
                                    <div className="p-3 border-b border-white/5 mb-1">
                                        <p className="text-xs text-white/40 uppercase font-black tracking-widest mb-1">Personal Account</p>
                                        <p className="text-sm font-bold text-white truncate">{email}</p>
                                    </div>
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                                        <User size={16} /> Profile Settings
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                                        <HelpCircle size={16} /> Help & Support
                                    </button>
                                    <div className="my-1 border-t border-white/5" />
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
