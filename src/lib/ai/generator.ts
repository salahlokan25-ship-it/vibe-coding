/**
 * Generator Agent (Senior Engineer)
 * Writes production-ready code one by one for each file in the plan.
 */
import { CODE_GENERATOR_PROMPT } from './prompts'
import { callLLM, AgentRunnerOptions } from './runner'

export interface GeneratorInput {
    filePath: string
    filePurpose: string
    plannerOutput: any
    orchestratorPlan: any
    userPrompt: string
}

export async function runGenerator(
    input: GeneratorInput,
    opts: AgentRunnerOptions
): Promise<string> {
    const rawInput = `
FILE TO GENERATE:
Path: ${input.filePath}
Purpose: ${input.filePurpose}

PROJECT CONTEXT:
${JSON.stringify(input.orchestratorPlan, null, 2)}

DESIGN TOKENS:
${JSON.stringify(input.plannerOutput.design_tokens, null, 2)}

FULL ARCHITECTURE (for import context):
${input.plannerOutput.architecture.map((f: any) => `- ${f.path}: ${f.purpose}`).join('\n')}

USER'S ORIGINAL REQUEST:
"${input.userPrompt}"

Generate ONLY the complete code content for: ${input.filePath}
`.trim()

    return await callLLM(CODE_GENERATOR_PROMPT, rawInput, opts)
}
