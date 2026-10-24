import { describe, expect, it } from 'vitest';
import type { ProjectManifest } from '@tessellate/schemas';
import { tryDeterministicCommandMatch } from './ai-service.js';

describe('deterministic intent matching', () => {
  it('does not turn negated commands into mutations', () => {
    const prompts = [
      'Do not recompose the dashboard',
      "Don't surprise me with a new layout",
      'Never make the settings playful',
      "Keep the screen as it is; don't reduce motion",
      'Avoid rounded geometry',
    ];

    for (const prompt of prompts) {
      expect(tryDeterministicCommandMatch({} as ProjectManifest, 'screen', prompt), prompt).toBeNull();
    }
  });

  it('continues to recognize positive deterministic requests', () => {
    expect(tryDeterministicCommandMatch({} as ProjectManifest, 'screen', 'Recompose the dashboard')?.action).toBe('recompose-screen');
    expect(tryDeterministicCommandMatch({} as ProjectManifest, 'screen', 'Surprise me with a new layout')?.action).toBe('surprise-me');
    expect(tryDeterministicCommandMatch({} as ProjectManifest, 'screen', 'Reduce motion')?.action).toBe('adjust-dna');
  });
});
