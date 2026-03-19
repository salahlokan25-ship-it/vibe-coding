'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                window.location.href = '/dashboard'
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password })
                if (error) throw error

                // If email confirmation is required by Supabase, session will be null
                if (data.session) {
                    window.location.href = '/dashboard'
                } else {
                    setError('✅ Success! Please check your email to confirm your account, then sign in.')
                    setIsLogin(true)
                }
            }
        } catch (err: any) {
            let msg = err.message
            if (msg.includes('Invalid login credentials')) {
                msg = 'Invalid email or password. (Wait, did you confirm your email link after signing up?)'
            }
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-vibe-bg-primary text-vibe-text-primary p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-vibe-accent-orange/20 blur-[120px] rounded-full animate-pulse blur-3xl mix-blend-screen" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full animate-pulse delay-700 mix-blend-screen" />
            </div>

            <div className="w-full max-w-md glass-card p-8 relative z-10 border border-vibe-border-subtle/50 backdrop-blur-2xl">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.5)]">
                            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-2xl tracking-tighter text-white">
                            Build<span className="gradient-text">AI</span>
                        </span>
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="text-vibe-text-muted text-sm">
                        {isLogin ? 'Enter your credentials to access your projects' : 'Start building AI-generated apps in seconds'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-vibe-text-secondary uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="input-field bg-[#0a0a0f]"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-vibe-text-secondary uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="input-field bg-[#0a0a0f]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-6 flex justify-center py-4"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-vibe-border-default"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[#111827] text-vibe-text-muted">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full btn-secondary py-3 flex items-center justify-center gap-3 bg-white/5 border-white/10 hover:bg-white/10"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-vibe-text-muted hover:text-white transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    )
}
