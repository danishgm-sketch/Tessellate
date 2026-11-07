import { describe, expect, it } from 'vitest';
import { containsExplicitNegation, isNonActionableIntentPrompt } from '../intent-language.js';

describe('explicit negation detection for mutations', () => {
  it.each([
    'Do not recompose the dashboard',
    "Don't surprise me",
    'Never lock this section',
    'Avoid rounded geometry',
    'Keep this without motion',
    'I can’t change the layout',
    'I won’t replace the table',
  ])('recognizes a negated command: %s', (prompt) => {
    expect(containsExplicitNegation(prompt)).toBe(true);
  });

  it.each([
    'Recompose the dashboard',
    'Surprise me with a new layout',
    'Make onboarding playful',
  ])('allows a positive command: %s', (prompt) => {
    expect(containsExplicitNegation(prompt)).toBe(false);
  });
});

describe('non-actionable prompt detection for mutations', () => {
  it.each([
    'What does the Surprise Me command do?',
    'How can I make the settings page playful?',
    'Maybe make it less rounded? Actually keep the current design',
    'Leave the current layout as it is',
  ])('requires a direct request before mutating: %s', (prompt) => {
    expect(isNonActionableIntentPrompt(prompt)).toBe(true);
  });

  it.each([
    'Recompose the dashboard',
    'Surprise me with a new layout',
    'Make onboarding playful',
  ])('keeps clear action requests available: %s', (prompt) => {
    expect(isNonActionableIntentPrompt(prompt)).toBe(false);
  });
});
