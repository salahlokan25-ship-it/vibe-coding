'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, ChevronRight, Check, Palette, Wand2, ArrowRight, Server, Code2, Pipette } from 'lucide-react'

interface QuizOption {
    label?: string
    value: string
    gradient?: string[]
}

interface QuizQuestion {
    id: string
    question: string
    type: 'single' | 'multi' | 'color'
    options: string[] | QuizOption[]
}

interface ColorPalette {
    name: string
    primary: string
    secondary: string
    bg: string
    surface: string
}

interface Analysis {
    enhanced_prompt: string
    project_type: string
    detected_theme: string
    quiz_questions: QuizQuestion[]
    color_palettes: ColorPalette[]
    suggested_features: string[]
    web_search_terms: string[]
    spline_scene_suggestion: string
    animation_21st_dev_instruction?: string
    image_generation_prompt: string
    has_backend?: boolean
    has_auth?: boolean
    has_database?: boolean
    preferred_language?: 'typescript' | 'javascript'
}

interface ProjectQuizProps {
    initialPrompt: string
    onComplete: (enhancedPrompt: string, answers: Record<string, any>, selectedPalette: ColorPalette | null) => void
    onSkip: () => void
}

// 12 universal built-in palettes (always shown)
const BUILTIN_PALETTES: ColorPalette[] = [
    { name: 'Midnight Pro', primary: '#6366f1', secondary: '#8b5cf6', bg: '#020617', surface: '#0f172a' },
    { name: 'Solar Flare', primary: '#f97316', secondary: '#ec4899', bg: '#09090b', surface: '#18181b' },
    { name: 'Arctic Blue', primary: '#0ea5e9', secondary: '#06b6d4', bg: '#020617', surface: '#0c1a2e' },
    { name: 'Emerald Matrix', primary: '#10b981', secondary: '#0d9488', bg: '#020c07', surface: '#0a1f12' },
    { name: 'Rose Gold', primary: '#f43f5e', secondary: '#e11d48', bg: '#0f0507', surface: '#1a0a0d' },
    { name: 'Deep Purple', primary: '#a855f7', secondary: '#7c3aed', bg: '#0a0612', surface: '#13092a' },
    { name: 'Cyber Gold', primary: '#eab308', secondary: '#f59e0b', bg: '#0c0a00', surface: '#1a1500' },
    { name: 'Crimson Night', primary: '#dc2626', secondary: '#b91c1c', bg: '#080205', surface: '#140408' },
    { name: 'Clean White', primary: '#1a1a1a', secondary: '#4b5563', bg: '#ffffff', surface: '#f9fafb' },
    { name: 'Soft Lavender', primary: '#8b5cf6', secondary: '#c026d3', bg: '#faf5ff', surface: '#f3e8ff' },
    { name: 'Ocean Teal', primary: '#0f766e', secondary: '#059669', bg: '#f0fdfa', surface: '#ccfbf1' },
    { name: 'Slate Pro', primary: '#334155', secondary: '#475569', bg: '#f8fafc', surface: '#f1f5f9' },
]



export default function ProjectQuiz({ initialPrompt, onComplete, onSkip }: ProjectQuizProps) {
    const [analysis, setAnalysis] = useState<Analysis | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(true)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(BUILTIN_PALETTES[0])
    const [phase, setPhase] = useState<'analyzing' | 'quiz' | 'complete'>('analyzing')
    const [customColor, setCustomColor] = useState('#6366f1')
    const [useCustomColor, setUseCustomColor] = useState(false)
    const [wantsBackend, setWantsBackend] = useState(false)
    const [preferJS, setPreferJS] = useState(false)

    useEffect(() => {
        analyzePrompt()
    }, [])

    const analyzePrompt = async () => {
        setIsAnalyzing(true)
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: initialPrompt }),
            })
            const data = await res.json()
            if (!data.error) {
                setAnalysis(data)
                // Auto-detect backend/language from analysis
                if (data.has_backend) setWantsBackend(true)
                if (data.preferred_language === 'javascript') setPreferJS(true)
            }
        } catch (e) {
            // Fallback: skip to build if analysis fails
        } finally {
            setIsAnalyzing(false)
            setPhase('quiz')
        }
    }

    const handleAnswer = (questionId: string, value: any, isMulti = false) => {
        setAnswers(prev => {
            if (isMulti) {
                const current: string[] = prev[questionId] || []
                const exists = current.includes(value)
                return { ...prev, [questionId]: exists ? current.filter(v => v !== value) : [...current, value] }
            }
            return { ...prev, [questionId]: value }
        })
    }

    const handleFinish = () => {
        const finalPrompt = buildFinalPrompt()
        onComplete(finalPrompt, { ...answers, wantsBackend, preferJS }, selectedPalette)
    }

    const handleCustomColorApply = () => {
        const custom: ColorPalette = {
            name: 'Custom',
            primary: customColor,
            secondary: customColor + 'cc',
            bg: '#020617',
            surface: '#0f172a',
        }
        setSelectedPalette(custom)
        setUseCustomColor(true)
    }

    const buildFinalPrompt = () => {
        let enhanced = analysis?.enhanced_prompt || initialPrompt

        // Inject all quiz answers
        if (answers.q1) enhanced += ` Industry: ${answers.q1}.`
        if (answers.q2) enhanced += ` Visual style: ${answers.q2}.`
        if (answers.q4 && answers.q4.length > 0) enhanced += ` Include sections: ${answers.q4.join(', ')}.`
        if (answers.q5) enhanced += ` Animation style: ${answers.q5}.`

        // Color palette
        if (selectedPalette) {
            enhanced += ` Use this exact color palette — Primary: ${selectedPalette.primary}, Secondary: ${selectedPalette.secondary}, Background: ${selectedPalette.bg}, Surface: ${selectedPalette.surface}. Palette name: ${selectedPalette.name}.`
        }

        // Backend
        if (wantsBackend) {
            enhanced += ` IMPORTANT: This project requires a backend. Include Next.js API routes in src/app/api/ for data operations. Use in-memory or localStorage as a simple data store (no external DB required). Include authentication flow if relevant.`
        }

        // Language
        if (preferJS) {
            enhanced += ` Generate all files as JavaScript (.jsx, .js) — NOT TypeScript. No type annotations.`
        }

        // 3D Spline Scene
        if (analysis?.spline_scene_suggestion && analysis.spline_scene_suggestion.includes('spline.design')) {
            enhanced += ` MUST USE this specific 3D Spline scene for the hero section: ${analysis.spline_scene_suggestion}`
        }

        // Advanced 21st.dev Animations
        if (analysis?.animation_21st_dev_instruction) {
            enhanced += ` MUST USE ADVANCED ANIMATIONS: ${analysis.animation_21st_dev_instruction}`
        }

        return enhanced
    }

    // Merge AI palettes with builtins
    const allPalettes = analysis?.color_palettes
        ? [...analysis.color_palettes, ...BUILTIN_PALETTES.filter(b => !analysis.color_palettes.find(a => a.name === b.name))]
        : BUILTIN_PALETTES

    const questions = analysis?.quiz_questions || []
    const totalSteps = questions.length
    const progress = totalSteps > 0 ? ((currentQuestion) / totalSteps) * 100 : 0

    if (phase === 'analyzing' || isAnalyzing) {
        return (
            <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] mix-blend-screen opacity-60" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center space-y-8"
                >
                    <div className="relative w-24 h-24 mx-auto">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 rounded-full border-2 border-orange-500/30 border-t-orange-500"
                        />
                        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-[0_0_40px_rgba(255,92,0,0.5)]">
                            <Sparkles size={24} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-3">
                            Analyzing your idea...
                        </h2>
                        <p className="text-white/40 font-medium">Our AI is studying your prompt and preparing smart questions</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                        {['Detecting project type', 'Generating questions', 'Preparing palettes'].map((step, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.7 }}
                                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-bold flex items-center gap-1.5"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                                    className="w-1.5 h-1.5 rounded-full bg-orange-500"
                                />
                                {step}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        )
    }

    if (!analysis || questions.length === 0) {
        return null // Skip quiz
    }

    const currentQ = questions[currentQuestion]
    const isLastQuestion = currentQuestion === questions.length - 1

    return (
        <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col overflow-hidden font-sans">
            {/* Atmospheric background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-50" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] blur-[150px] mix-blend-screen"
                    style={{ background: `radial-gradient(circle, ${selectedPalette?.primary || '#f97316'}22, transparent)` }} />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_16px_rgba(255,92,0,0.4)]">
                        <Wand2 size={16} className="text-white" />
                    </div>
                    <span className="font-black text-white tracking-tight">Design Intelligence</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                        {analysis.project_type}
                    </span>
                </div>
                <button
                    onClick={onSkip}
                    className="text-white/20 hover:text-white/60 text-sm font-bold transition-colors"
                >
                    Skip quiz →
                </button>
            </div>

            {/* Progress bar */}
            <div className="relative z-10 h-0.5 bg-white/5">
                <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            {/* Main quiz area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
                <div className="w-full max-w-2xl">

                    {/* Enhanced prompt preview (only first question) */}
                    {currentQuestion === 0 && analysis.enhanced_prompt && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl relative overflow-hidden"
                        >
                            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={10} /> AI Enhanced
                            </div>
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Your enhanced prompt</p>
                            <p className="text-sm text-white/70 leading-relaxed line-clamp-3">{analysis.enhanced_prompt}</p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Question */}
                            <div className="mb-8">
                                <div className="text-xs font-black text-white/20 uppercase tracking-widest mb-3">
                                    Question {currentQuestion + 1} of {totalSteps}
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">{currentQ.question}</h2>
                            </div>

                            {/* Color palette picker */}
                            {currentQ.type === 'color' && (
                                <div className="space-y-4 mb-8">
                                    <div className="grid grid-cols-3 gap-3">
                                        {allPalettes.map((palette) => (
                                            <motion.button
                                                key={palette.name}
                                                whileHover={{ scale: 1.03, y: -3 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => {
                                                    setSelectedPalette(palette)
                                                    setUseCustomColor(false)
                                                    handleAnswer(currentQ.id, palette.name)
                                                }}
                                                className={`relative group p-3 rounded-2xl border transition-all duration-300 ${
                                                    selectedPalette?.name === palette.name && !useCustomColor
                                                        ? 'border-white/40 bg-white/5 shadow-lg'
                                                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'
                                                }`}
                                            >
                                                {selectedPalette?.name === palette.name && !useCustomColor && (
                                                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                                        <Check size={9} className="text-black" strokeWidth={3} />
                                                    </div>
                                                )}
                                                <div className="flex gap-1.5 mb-2">
                                                    <div className="w-6 h-6 rounded-lg shadow-lg" style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }} />
                                                    <div className="w-6 h-6 rounded-lg" style={{ background: palette.bg }} />
                                                    <div className="w-6 h-6 rounded-lg border border-white/10" style={{ background: palette.surface }} />
                                                </div>
                                                <div className="text-xs font-bold text-white text-left truncate">{palette.name}</div>
                                                <div className="text-[9px] text-white/30 font-mono">{palette.primary}</div>
                                            </motion.button>
                                        ))}
                                    </div>

                                    {/* Custom Color Picker */}
                                    <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                                        useCustomColor ? 'border-white/40 bg-white/5' : 'border-white/[0.06] bg-white/[0.02]'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <Pipette size={16} className="text-white/40" />
                                            <span className="text-sm font-bold text-white/60">Custom Color</span>
                                            <input
                                                type="color"
                                                value={customColor}
                                                onChange={(e) => setCustomColor(e.target.value)}
                                                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                                            />
                                            <input
                                                type="text"
                                                value={customColor}
                                                onChange={(e) => setCustomColor(e.target.value)}
                                                placeholder="#6366f1"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white/60 focus:outline-none focus:border-white/30"
                                            />
                                            <button
                                                onClick={handleCustomColorApply}
                                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {useCustomColor && (
                                            <div className="mt-2 text-xs text-emerald-400 font-bold">✓ Custom color applied</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Single choice */}
                            {currentQ.type === 'single' && (
                                <div className="grid grid-cols-1 gap-3 mb-8">
                                    {(currentQ.options as string[]).map((option) => {
                                        const isSelected = answers[currentQ.id] === option
                                        return (
                                            <motion.button
                                                key={option}
                                                whileHover={{ x: 4 }}
                                                onClick={() => handleAnswer(currentQ.id, option)}
                                                className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition-all duration-200 ${isSelected
                                                        ? 'border-orange-500/50 bg-orange-500/10 text-white'
                                                        : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white'
                                                    }`}
                                            >
                                                <span className="font-bold text-sm">{option}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-white/20'
                                                    }`}>
                                                    {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Multi select */}
                            {currentQ.type === 'multi' && (
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {(currentQ.options as string[]).map((option) => {
                                        const selected: string[] = answers[currentQ.id] || []
                                        const isSelected = selected.includes(option)
                                        return (
                                            <motion.button
                                                key={option}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAnswer(currentQ.id, option, true)}
                                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 ${isSelected
                                                        ? 'border-orange-500/50 bg-orange-500/10 text-white'
                                                        : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-white/20'
                                                    }`}>
                                                    {isSelected && <Check size={9} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <span className="font-bold text-sm">{option}</span>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Feature suggestions */}
                            {currentQuestion === 0 && analysis.suggested_features.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-4 flex flex-wrap gap-2"
                                >
                                    <span className="text-xs text-white/20 font-bold uppercase tracking-widest w-full mb-1">
                                        <Zap size={10} className="inline mr-1" />AI detected features
                                    </span>
                                    {analysis.suggested_features.map(f => (
                                        <span key={f} className="px-3 py-1 rounded-full bg-white/5 border border-white/[0.06] text-white/40 text-xs font-bold">
                                            {f}
                                        </span>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                            disabled={currentQuestion === 0}
                            className="px-5 py-3 rounded-xl border border-white/10 text-white/40 text-sm font-bold disabled:opacity-0 hover:text-white hover:border-white/20 transition-all"
                        >
                            ← Back
                        </button>

                        {isLastQuestion ? (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleFinish}
                                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(255,92,0,0.4)] hover:shadow-[0_0_60px_rgba(255,92,0,0.6)] transition-all flex items-center gap-2"
                            >
                                <Sparkles size={16} />
                                Build My Project
                                <ArrowRight size={16} />
                            </motion.button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(q => Math.min(totalSteps - 1, q + 1))}
                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom: Backend + Language + Palette preview bar */}
            <div className="relative z-10 border-t border-white/5 px-8 py-4 flex items-center gap-6 flex-wrap">
                {/* Backend Toggle */}
                <button
                    onClick={() => setWantsBackend(w => !w)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                        wantsBackend
                            ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                            : 'border-white/10 bg-white/5 text-white/30 hover:text-white/60'
                    }`}
                >
                    <Server size={13} />
                    Backend & API Routes
                    {wantsBackend && <Check size={11} strokeWidth={3} />}
                </button>

                {/* Language Toggle */}
                <button
                    onClick={() => setPreferJS(j => !j)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                        preferJS
                            ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                            : 'border-white/10 bg-white/5 text-white/30 hover:text-white/60'
                    }`}
                >
                    <Code2 size={13} />
                    {preferJS ? 'JavaScript (JS)' : 'TypeScript (TS)'}
                </button>

                {/* Selected Palette Preview */}
                {selectedPalette && (
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-xs text-white/20 font-bold uppercase tracking-widest">Color:</span>
                        <div className="flex gap-1.5 items-center">
                            <div className="w-4 h-4 rounded-full shadow-lg" style={{ background: `linear-gradient(135deg, ${selectedPalette.primary}, ${selectedPalette.secondary})` }} />
                            <div className="w-4 h-4 rounded-full" style={{ background: selectedPalette.bg, border: '1px solid rgba(255,255,255,0.1)' }} />
                            <span className="text-xs font-bold text-white/50">{selectedPalette.name}</span>
                            <span className="text-xs font-mono text-white/30">{selectedPalette.primary}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
