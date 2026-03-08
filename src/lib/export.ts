import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * Zips up the current active project files and triggers a browser download.
 * Adds boilerplate files (package.json, vite config) if they are missing
 * so the result is immediately runnable.
 */
export async function downloadProjectZip(projectName: string, files: Record<string, string>) {
    const zip = new JSZip()

    // Add all user-generated files
    for (const [path, content] of Object.entries(files)) {
        zip.file(path, content)
    }

    // Add minimal package.json if it doesn't exist
    if (!files['package.json']) {
        zip.file('package.json', JSON.stringify({
            name: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            private: true,
            version: '0.0.0',
            type: 'module',
            scripts: {
                dev: 'vite',
                build: 'vite build',
                preview: 'vite preview'
            },
            dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0'
            },
            devDependencies: {
                '@types/react': '^18.2.15',
                '@types/react-dom': '^18.2.7',
                '@vitejs/plugin-react': '^4.0.3',
                vite: '^4.4.5'
            }
        }, null, 2))
    }

    // Add vite.config.js if it doesn't exist
    if (!files['vite.config.js'] && !files['vite.config.ts']) {
        zip.file('vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`.trim())
    }

    // Generate zip blob
    const blob = await zip.generateAsync({ type: 'blob' })

    // Create a temporary link element to trigger the download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}.zip`
    document.body.appendChild(link)
    link.click()

    // Clean up
    setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }, 100)
}
