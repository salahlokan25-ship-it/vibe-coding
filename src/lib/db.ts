import { supabase } from '@/lib/supabase'

export interface Project {
    id: string
    name: string
    user_id: string
    created_at: string
    updated_at: string
    files: Record<string, string> // We will rebuild this from project_files internally
    prompt: string
    preview_html?: string
    file_count: number
    status: 'building' | 'ready' | 'error'
}

export interface Message {
    id: string
    project_id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

export class ProjectDatabase {
    // ─── Project CRUD ────────────────────────────────────────────

    static async saveProject(project: Project): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            const { error: projectError } = await supabase
                .from('projects')
                .upsert({
                    id: project.id,
                    user_id: user.id,
                    name: project.name,
                    prompt: project.prompt,
                    preview_html: project.preview_html,
                    file_count: project.file_count,
                    status: project.status || 'ready',
                    updated_at: project.updated_at
                })

            if (projectError) throw projectError

            // Rebuild files record into project_files table format
            const fileEntries = Object.entries(project.files).map(([path, content]) => ({
                project_id: project.id,
                file_path: path,
                content: content
            }))

            if (fileEntries.length > 0) {
                // To perform an 'upsert' safely on unique combinations (project_id, file_path),
                // we delete existing ones and reinsert, or rely on ON CONFLICT using supabase.
                // Doing via upsert with unique constraints is better
                const { error: fileError } = await supabase
                    .from('project_files')
                    .upsert(fileEntries, { onConflict: 'project_id, file_path' })
                if (fileError) throw fileError
            }

            return true
        } catch (err) {
            console.error('Save project error:', err)
            return false
        }
    }

    static async getProject(id: string): Promise<Project | null> {
        try {
            const { data: projectRow, error: pErr } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single()

            if (pErr || !projectRow) return null

            const { data: fileRows } = await supabase
                .from('project_files')
                .select('file_path, content')
                .eq('project_id', id)

            const filesRecord: Record<string, string> = {}
            if (fileRows) {
                fileRows.forEach((fr: any) => {
                    filesRecord[fr.file_path] = fr.content
                })
            }

            return {
                id: projectRow.id,
                name: projectRow.name,
                user_id: projectRow.user_id,
                created_at: projectRow.created_at,
                updated_at: projectRow.updated_at,
                prompt: projectRow.prompt,
                preview_html: projectRow.preview_html,
                file_count: projectRow.file_count,
                status: projectRow.status,
                files: filesRecord
            }
        } catch (err) {
            console.error('Get project error:', err)
            return null
        }
    }

    static async getAllProjects(): Promise<Project[]> {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error || !data) return []

            return data.map((d: any) => ({
                id: d.id,
                name: d.name,
                user_id: d.user_id,
                created_at: d.created_at,
                updated_at: d.updated_at,
                prompt: d.prompt,
                preview_html: d.preview_html,
                file_count: d.file_count,
                status: d.status || 'ready',
                files: {} // We generally don't load all files for all projects on a dashboard call
            }))
        } catch (err) {
            console.error('Get all projects error:', err)
            return []
        }
    }

    static async deleteProject(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id)

            // Cascading delete rules in DB handle project_files and messages
            return !error
        } catch (err) {
            console.error('Delete project error:', err)
            return false
        }
    }

    // ─── File saving ─────────────────────────────────────────────

    static async saveFiles(projectId: string, files: Record<string, string>): Promise<void> {
        const project = await this.getProject(projectId)
        if (project) {
            project.files = { ...project.files, ...files }
            project.file_count = Object.keys(project.files).length
            project.updated_at = new Date().toISOString()
            await this.saveProject(project)
        }
    }

    // ─── Messages ────────────────────────────────────────────────

    static async getMessages(projectId: string): Promise<Message[]> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: true })

            if (error || !data) return []

            return data.map((d: any) => ({
                id: d.id,
                project_id: d.project_id,
                role: d.role,
                content: d.content,
                timestamp: d.created_at
            }))
        } catch {
            return []
        }
    }

    static async saveMessages(projectId: string, messages: Message[]): Promise<void> {
        try {
            const dbMessages = messages.map(m => ({
                id: m.id,
                project_id: projectId,
                role: m.role,
                content: m.content,
                created_at: m.timestamp
            }))

            // We upsert all the current history messages
            await supabase
                .from('messages')
                .upsert(dbMessages)
        } catch (err) {
            console.error('Save messages error:', err)
        }
    }
}
