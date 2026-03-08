/**
 * BuildAI Multi-Agent System — System Prompts v3.0 (Visual-First)
 * Used by the fallback /api/generate route.
 */

// Re-export from the canonical agents prompts file
export {
  ORCHESTRATOR_PROMPT,
  PLANNER_PROMPT,
  CODE_GENERATOR_PROMPT,
  REFACTOR_PROMPT,
  DEBUG_PROMPT,
  PREVIEW_GENERATOR_PROMPT,
} from '../agents/prompts'
