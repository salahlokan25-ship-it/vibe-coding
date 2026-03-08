/**
 * Refactor Agent (Code Refactoring Specialist)
 * Updates current files based on user modification requests.
 */
import { REFACTOR_PROMPT } from './prompts'
import { callLLM, AgentRunnerOptions } from './runner'

export interface RefactorInput {
    filePath: string
    currentContent: string
    modification: string
}

export async function runRefactor(
    input: RefactorInput,
    opts: AgentRunnerOptions
): Promise<string> {
    const rawInput = `
FILE PATH: ${input.filePath}

CURRENT FILE CONTENT:
${input.currentContent}

MODIFICATION INSTRUCTION:
"${input.modification}"
`.trim()

    return await callLLM(REFACTOR_PROMPT, rawInput, opts)
}
