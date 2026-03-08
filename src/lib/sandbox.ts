/**
 * VibeCoder Project Sandbox
 * Manages virtual file system and dynamic preview rendering
 */

export interface SandboxFile {
    path: string
    content: string
}

export class ProjectSandbox {
    /**
     * Creates a self-contained HTML bundle for the iframe preview
     * Incorporates Tailwind, fonts, and mocks all project files
     */
    static generatePreviewUrl(files: Record<string, string>): string {
        // Find the preview entry point
        const previewContent = files['public/preview.html'] || files['index.html'] || ''

        if (!previewContent) {
            return `data:text/html;base64,${Buffer.from('<h1>No preview available</h1>').toString('base64')}`
        }

        // Return as a data URL for immediate rendering in iframe
        return `data:text/html;charset=utf-8,${encodeURIComponent(previewContent)}`
    }

    /**
     * Prepares the project for export/download
     */
    static prepareProjectFiles(files: Record<string, string>): SandboxFile[] {
        return Object.entries(files).map(([path, content]) => ({
            path,
            content
        }))
    }
}
