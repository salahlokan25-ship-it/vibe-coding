export interface Project {
    id: string
    name: string
    description: string
    status: 'live' | 'draft' | 'building'
    tech: string[]
    views: number
    createdAt: string
    updatedAt: string
    generatedCode?: string
}

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    status?: 'sending' | 'done' | 'error'
}

export interface GenerateRequest {
    prompt: string
    history?: Array<{ role: string; content: string }>
}

export interface GenerateResponse {
    code: string
    explanation?: string
    error?: string
}

export interface StatsData {
    activeProjects: number
    totalViews: string
    aiGenerations: number
    maxGenerations: number
    avgResponse: string
    activeProjectsTrend: string
    totalViewsTrend: string
}

export interface Template {
    id: string
    name: string
    description: string
    category: string
    icon: string
    prompt: string
}
