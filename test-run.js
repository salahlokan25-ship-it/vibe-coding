const fs = require('fs')

async function testGeneration() {
    const req = {
        prompt: "Build cosmetic website with theme purple and white",
        existingFiles: {},
        forceNew: true,
        provider: 'groq',
        history: []
    }

    try {
        const response = await fetch('http://localhost:3000/api/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        })

        console.log('Status:', response.status)
        if (!response.ok) {
            console.error(await response.text())
            return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { value, done } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)

            const lines = chunk.split('\n')
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.slice(5))
                        if (data.type === 'file') {
                            console.log(`[FILE RECEIVED] ${data.payload.path}`)
                        } else {
                            console.log(`[EVENT] ${data.type} -`, data.payload.label || data.payload)
                        }
                    } catch (e) {
                        console.log('[RAW] ' + line)
                    }
                } else if (line.trim()) {
                    console.log('[DEBUG] ' + line)
                }
            }
        }
        console.log('DONE')
    } catch (e) {
        console.error('FETCH ERROR', e)
    }
}

testGeneration()
