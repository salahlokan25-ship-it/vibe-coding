/**
 * BuildAI Version History — Checkpoint System
 * Every generation creates a restorable snapshot (like bolt.new)
 * Stored in localStorage for persistence across sessions
 */

export interface Checkpoint {
    id: string
    projectId: string
    label: string
    timestamp: string
    fileCount: number
    files: Record<string, string>
    generatedCode: string
    prompt: string
    isBookmarked: boolean
}

const HISTORY_KEY = 'buildai_version_history'
const MAX_CHECKPOINTS = 25

export const VersionHistory = {
    /** Save a new checkpoint after every generation */
    save(projectId: string, data: {
        files: Record<string, string>
        generatedCode: string
        prompt: string
        label?: string
    }): Checkpoint {
        const checkpoint: Checkpoint = {
            id: crypto.randomUUID(),
            projectId,
            label: data.label || `Build • ${new Date().toLocaleTimeString()}`,
            timestamp: new Date().toISOString(),
            fileCount: Object.keys(data.files).length,
            files: data.files,
            generatedCode: data.generatedCode,
            prompt: data.prompt,
            isBookmarked: false,
        }

        const all = VersionHistory.getAll()
        const projectHistory = [checkpoint, ...all.filter(c => c.projectId === projectId)]
            .slice(0, MAX_CHECKPOINTS)
        const otherHistory = all.filter(c => c.projectId !== projectId)

        localStorage.setItem(HISTORY_KEY, JSON.stringify([...projectHistory, ...otherHistory]))
        return checkpoint
    },

    /** Get all checkpoints for a project */
    getForProject(projectId: string): Checkpoint[] {
        return VersionHistory.getAll()
            .filter(c => c.projectId === projectId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },

    /** Restore a specific checkpoint */
    restore(checkpointId: string): Checkpoint | null {
        return VersionHistory.getAll().find(c => c.id === checkpointId) || null
    },

    /** Toggle bookmark on a checkpoint */
    toggleBookmark(checkpointId: string): void {
        const all = VersionHistory.getAll()
        const updated = all.map(c =>
            c.id === checkpointId ? { ...c, isBookmarked: !c.isBookmarked } : c
        )
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    },

    /** Delete a checkpoint */
    delete(checkpointId: string): void {
        const all = VersionHistory.getAll().filter(c => c.id !== checkpointId)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
    },

    /** Get all checkpoints */
    getAll(): Checkpoint[] {
        try {
            const raw = localStorage.getItem(HISTORY_KEY)
            return raw ? JSON.parse(raw) : []
        } catch {
            return []
        }
    },

    /** Clear all checkpoints for a project */
    clearProject(projectId: string): void {
        const all = VersionHistory.getAll().filter(c => c.projectId !== projectId)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
    },

    /** Format relative time for display */
    formatTime(iso: string): string {
        try {
            const d = new Date(iso)
            const now = new Date()
            const diffMs = now.getTime() - d.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            if (diffMins < 1) return 'Just now'
            if (diffMins < 60) return `${diffMins}m ago`
            const diffHours = Math.floor(diffMins / 60)
            if (diffHours < 24) return `${diffHours}h ago`
            return d.toLocaleDateString()
        } catch {
            return 'Recently'
        }
    }
}
