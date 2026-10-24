/**
 * A conservative guard for command paths that cannot reliably scope negation.
 * These prompts must be reviewed or rephrased instead of producing a mutation.
 */
const EXPLICIT_NEGATION = /\b(?:not|never|avoid|without|cannot|can[’']t|will[’']t|won[’']t|don[’']t|do\s+not|does\s+not|did\s+not)\b/i;
const INFORMATIONAL_PROMPT = /^\s*(?:what|how|why|when|where|which|explain|describe|tell\s+me|show\s+me)\b/i;
const RETAIN_CURRENT_DESIGN = /\b(?:keep|leave|preserve)\b.{0,48}\b(?:as\s+it\s+is|unchanged|current(?:\s+(?:design|layout|screen))?|the\s+same)\b/i;

export function containsExplicitNegation(prompt: string): boolean {
  return EXPLICIT_NEGATION.test(prompt);
}

/**
 * Returns true when a short deterministic parser cannot safely distinguish a
 * request to change the project from a question, rejection, or request to keep it.
 */
export function isNonActionableIntentPrompt(prompt: string): boolean {
  return (
    containsExplicitNegation(prompt) ||
    prompt.includes('?') ||
    INFORMATIONAL_PROMPT.test(prompt) ||
    RETAIN_CURRENT_DESIGN.test(prompt)
  );
}
