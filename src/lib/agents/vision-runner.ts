import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Executes the Vision Engine pipeline via Gemini 1.5 Pro.
 * Parses a Base64 image and extracts Design System attributes for architectural cloning.
 */
export async function runVisionPlanner(
    prompt: string,
    imageBase64: string,
    apiKey?: string
): Promise<string> {
    if (!apiKey) {
        throw new Error("Gemini API key is required for Vision Engine.")
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        // Always use gemini-1.5-pro for vision tasks
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

        // Extract base64 payload (strip data:image/png;base64, prefix)
        const base64Data = imageBase64.split(',')[1]
        const mimeType = imageBase64.match(/data:(.*?);/)?.[1] || 'image/png'

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            }
        }

        const visionPrompt = `
You are the Chief Design Architect for Build AI. You have been provided a visual reference (screenshot/mockup).
Your task is to analyze this UI perfectly and extract its exact design tokens, structural layout, and component bounds so our downstream Coder Agents can clone it exactly in React and Tailwind CSS.

Extract and return a detailed markdown blueprint containing:
1. OVERALL LAYOUT STRUCTURE (Is it a flex col? Grid? Dashboard sidebar? Landing page?)
2. COLOR PALETTE (Extract exact hex codes for background, cards, text, accents, buttons, and borders)
3. TYPOGRAPHY & SIZING (Estimate font weights, tight tracking, sizes)
4. COMPONENT TREE (List every distinct container/section seen in the image, top to bottom)
5. EXACT COPY/TEXT (Copy any text that is visible exactly word-for-word)

Do not generate code. Only generate the highly specific VISION BLUEPRINT map.
User Request: ${prompt}
`
        const result = await model.generateContent([visionPrompt, imagePart])
        const response = await result.response
        return response.text()
    } catch (e: any) {
        console.error("Vision Clone Engine failed:", e)
        throw new Error("Failed to process the image: " + e.message)
    }
}
