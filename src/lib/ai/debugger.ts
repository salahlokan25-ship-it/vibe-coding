/**
 * Debugging Agent (Senior Debugging Engineer)
 * Fixes build errors and runtime issues across the project.
 */
import { DEBUG_PROMPT } from './prompts'
import { callLLM, AgentRunnerOptions } from './runner'

export interface DebuggerInput {
    filePath: string
    fileContent: string // the faulty file
    errorLog: string
}

export async function runDebugger(
    input: DebuggerInput,
    opts: AgentRunnerOptions
): Promise<string> {
    const rawInput = `
FILE PATH: ${input.filePath}

ERROR LOG:
${input.errorLog}

FILE CONTENT:
${input.fileContent}
`.trim()

    return await callLLM(DEBUG_PROMPT, rawInput, opts)
}
