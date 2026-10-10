/**
 * Invalid fixture fragments to verify schema rejection with actionable errors.
 */

export const invalidDnaOutOfRange = {
  professionalism: 150, // Must be <= 100
  playfulness: -10, // Must be >= 0
};

export const invalidResourceMissingFiles = {
  schemaVersion: '1.0.0',
  id: 'res_invalid_01',
  slug: 'invalid-component',
  name: 'Invalid Component',
  version: '1.0.0',
  status: 'verified',
  description: 'Missing required files list',
  resourceType: 'component',
  categories: ['components'],
  roles: ['primary-action'],
  purposes: ['marketing'],
  creator: { id: 'c1', displayName: 'Creator', handle: 'c1' },
  provenance: { origin: 'tessellate', derivative: false },
  license: { spdx: 'MIT', name: 'MIT', redistributionVerified: true, attributionRequired: false },
  framework: 'react',
  language: 'typescript',
  styling: 'tailwind',
  files: [], // Invalid: min(1) required
};

export const invalidMutationPayload = {
  id: 'mut_01',
  type: 'SET_DESIGN_TOKEN',
  targetId: 'node_01',
  // Missing 'key' and 'value', payload is invalid
  payload: { invalidField: true },
  actor: 'user',
  timestamp: '2026-10-10T19:00:00.000Z',
  preconditionRevision: 1,
};

export const invalidAuditResultScores = {
  total: 105, // Must be <= 100
  scores: {
    cohesion: 25, // Max 20
    accessibility: 20,
    performance: 15,
    responsive: 15,
    hierarchy: 10,
    densityConsistency: 5,
    motionConsistency: 5,
    designSystemCompliance: 5,
    interactionConsistency: 5,
  },
  issues: [],
};
