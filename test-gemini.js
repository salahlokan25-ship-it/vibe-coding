const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

async function checkGemini() {
    try {
        console.log('Testing gemini directly...')
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: 'You are an AI planner.',
        })

        const result = await model.generateContent("Create a huge JSON plan for a cosmetic website")
        console.log('SUCCESS:', result.response.text())
    } catch (err) {
        console.error('GEMINI DIRECT ERROR:', err)
    }
}
checkGemini()
