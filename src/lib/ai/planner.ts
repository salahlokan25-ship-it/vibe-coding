/**
 * Planner Agent (Software Architect)
 * Designs folder structure, file names, and component breakdown.
 */
import { PLANNER_PROMPT } from './prompts'
import { callLLM, AgentRunnerOptions } from './runner'

export interface FileArchitecture {
    path: string
    purpose: string
    exports: string[]
    imports: string[]
}

export interface PlannerOutput {
    architecture: FileArchitecture[]
    dependencies: {
        production: string[]
        devDependencies: string[]
    }
    design_tokens: {
        primary_color: string
        font: string
        style: string
    }
}

export async function runPlanner(
    plan: any, // from orchestrator
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<PlannerOutput> {
    const input = `
Project Plan:
${JSON.stringify(plan, null, 2)}

User's Original Request:
"${userPrompt}"
`.trim()

    const raw = await callLLM(PLANNER_PROMPT, input, opts)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Planner returned invalid JSON')

    return JSON.parse(jsonMatch[0]) as PlannerOutput
}
