import { describe, it, expect } from 'vitest';
import {
  SCHEMA_VERSION,
  createId,
  DesignDNASchema,
  ResourceManifestSchema,
  ProjectManifestSchema,
  ProjectMutationSchema,
  AuditResultSchema,
  migrateProjectManifest,
  migrateResourceManifest,
  getResourceManifestJsonSchema,
  getProjectManifestJsonSchema,
} from '../index.js';
import { validResourceFixture } from '../fixtures/valid-resource.js';
import { validProjectFixture } from '../fixtures/valid-project.js';
import {
  invalidDnaOutOfRange,
  invalidResourceMissingFiles,
  invalidMutationPayload,
  invalidAuditResultScores,
} from '../fixtures/invalid-fixtures.js';

describe('Tessellate Canonical Schemas', () => {
  describe('ID & Version helpers', () => {
    it('generates prefixed opaque IDs', () => {
      const id1 = createId('res');
      const id2 = createId('node');
      expect(id1).toMatch(/^res_[a-f0-9]{16}$/);
      expect(id2).toMatch(/^node_[a-f0-9]{16}$/);
      expect(id1).not.toBe(id2);
    });

    it('exports stable SCHEMA_VERSION', () => {
      expect(SCHEMA_VERSION).toBe('1.0.0');
    });
  });

  describe('DesignDNA Schema', () => {
    it('validates a complete valid DesignDNA object', () => {
      const parsed = DesignDNASchema.safeParse(validProjectFixture.designDNA);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.professionalism).toBe(95);
        expect(parsed.data.visualMode).toBe('dark');
        expect(parsed.data.primaryStack).toBe('react-tailwind');
      }
    });

    it('rejects out-of-range numeric dimensions', () => {
      const parsed = DesignDNASchema.safeParse(invalidDnaOutOfRange);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('ResourceManifest Schema', () => {
    it('validates a complete ResourceManifest fixture', () => {
      const parsed = ResourceManifestSchema.safeParse(validResourceFixture);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.slug).toBe('editorial-button');
        expect(parsed.data.status).toBe('verified');
      }
    });

    it('rejects resource missing required files', () => {
      const parsed = ResourceManifestSchema.safeParse(invalidResourceMissingFiles);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.some((i) => i.path.includes('files'))).toBe(true);
      }
    });

    it('round-trips JSON serialization faithfully', () => {
      const jsonString = JSON.stringify(validResourceFixture);
      const parsedJson = JSON.parse(jsonString);
      const parsed = ResourceManifestSchema.parse(parsedJson);
      expect(parsed).toEqual(validResourceFixture);
    });
  });

  describe('ProjectManifest Schema', () => {
    it('validates a complete ProjectManifest fixture', () => {
      const parsed = ProjectManifestSchema.safeParse(validProjectFixture);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBe('proj_fin_intel_01');
        expect(parsed.data.screens.length).toBe(1);
      }
    });

    it('round-trips JSON serialization faithfully', () => {
      const jsonString = JSON.stringify(validProjectFixture);
      const parsedJson = JSON.parse(jsonString);
      const parsed = ProjectManifestSchema.parse(parsedJson);
      expect(parsed).toEqual(validProjectFixture);
    });
  });

  describe('Discriminated ProjectMutation Schemas', () => {
    it('validates a typed SET_DESIGN_TOKEN mutation', () => {
      const mutation = {
        id: createId('mut'),
        type: 'SET_DESIGN_TOKEN',
        targetId: 'node_01',
        payload: { key: '--radius-md', value: '14px' },
        actor: 'user',
        timestamp: new Date().toISOString(),
        preconditionRevision: 1,
      };
      const parsed = ProjectMutationSchema.safeParse(mutation);
      expect(parsed.success).toBe(true);
    });

    it('validates a typed LOCK_NODE mutation', () => {
      const mutation = {
        id: createId('mut'),
        type: 'LOCK_NODE',
        targetId: 'node_01',
        payload: { targetNodeId: 'node_01', lockTypes: ['structure', 'dna'] },
        actor: 'deterministic-engine',
        timestamp: new Date().toISOString(),
        preconditionRevision: 2,
      };
      const parsed = ProjectMutationSchema.safeParse(mutation);
      expect(parsed.success).toBe(true);
    });

    it('rejects mutation with invalid payload for its discriminator type', () => {
      const parsed = ProjectMutationSchema.safeParse(invalidMutationPayload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('AuditResult Schema', () => {
    it('validates 100-point audit result', () => {
      const result = {
        total: 92,
        scores: {
          cohesion: 18,
          accessibility: 20,
          performance: 14,
          responsive: 13,
          hierarchy: 9,
          densityConsistency: 5,
          motionConsistency: 4,
          designSystemCompliance: 5,
          interactionConsistency: 4,
        },
        issues: [
          {
            id: 'iss_01',
            category: 'responsive',
            severity: 'warning',
            message: 'Chart element should stack below 640px',
            nodeIds: ['node_chart_01'],
          },
        ],
      };
      const parsed = AuditResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it('rejects scores exceeding category maximums', () => {
      const parsed = AuditResultSchema.safeParse(invalidAuditResultScores);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Migration Framework', () => {
    it('migrates and parses valid project manifest', () => {
      const migrated = migrateProjectManifest(validProjectFixture);
      expect(migrated.id).toBe(validProjectFixture.id);
      expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('throws actionable error on invalid manifest migration', () => {
      expect(() => migrateProjectManifest({ id: 'incomplete' })).toThrow(
        /Invalid ProjectManifest schema/
      );
    });

    it('migrates and parses valid resource manifest', () => {
      const migrated = migrateResourceManifest(validResourceFixture);
      expect(migrated.slug).toBe(validResourceFixture.slug);
    });
  });

  describe('JSON Schema Generation', () => {
    it('exports valid JSON Schema for ResourceManifest', () => {
      const schema = getResourceManifestJsonSchema();
      expect(schema).toBeDefined();
      expect(typeof schema).toBe('object');
      expect((schema as Record<string, unknown>).$schema).toBeDefined();
    });

    it('exports valid JSON Schema for ProjectManifest', () => {
      const schema = getProjectManifestJsonSchema();
      expect(schema).toBeDefined();
      expect(typeof schema).toBe('object');
      expect((schema as Record<string, unknown>).$schema).toBeDefined();
    });
  });
});
