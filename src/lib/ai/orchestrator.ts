/**
 * Orchestrator Agent (Main Brain)
 * Decides project type, features, and execution plan.
 */
import { ORCHESTRATOR_PROMPT } from './prompts'
import { callLLM, AgentRunnerOptions } from './runner'

export interface ExecutionPlan {
    project_type: string
    stack: string
    features: string[]
    has_backend: boolean
    has_database: boolean
    has_auth: boolean
    file_plan: string[]
    description: string
}

export async function runOrchestrator(
    userPrompt: string,
    opts: AgentRunnerOptions
): Promise<ExecutionPlan> {
    const raw = await callLLM(
        ORCHESTRATOR_PROMPT,
        `User request: "${userPrompt}"`,
        opts
    )

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Orchestrator returned invalid JSON format')

    return JSON.parse(jsonMatch[0]) as ExecutionPlan
}
