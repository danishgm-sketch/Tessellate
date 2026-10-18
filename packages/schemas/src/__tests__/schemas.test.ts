import { describe, it, expect } from 'vitest';
import {
  SCHEMA_VERSION,
  DESIGN_DNA_NUMERIC_KEYS,
  createId,
  DesignDNASchema,
  ProductModelSchema,
  LockSpecSchema,
  HistoryOperationSchema,
  ExportSettingsSchema,
  ResourceManifestSchema,
  ProjectManifestSchema,
  ScreenGraphSchema,
  ProjectMutationSchema,
  IntentCommandSchema,
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

    it('accepts every numeric dimension at both documented boundaries', () => {
      for (const boundary of [0, 100]) {
        const candidate = {
          ...validProjectFixture.designDNA,
          ...Object.fromEntries(DESIGN_DNA_NUMERIC_KEYS.map((key) => [key, boundary])),
        };
        expect(DesignDNASchema.safeParse(candidate).success).toBe(true);
      }
    });

    it('rejects missing dimensions and unknown categorical keys', () => {
      const { professionalism: _professionalism, ...missingDimension } = validProjectFixture.designDNA;
      expect(DesignDNASchema.safeParse(missingDimension).success).toBe(false);
      expect(DesignDNASchema.safeParse({
        ...validProjectFixture.designDNA,
        unrecognizedDimension: 50,
      }).success).toBe(false);
    });

    it('round-trips JSON serialization faithfully', () => {
      expect(DesignDNASchema.parse(JSON.parse(JSON.stringify(validProjectFixture.designDNA))))
        .toEqual(validProjectFixture.designDNA);
    });
  });

  describe('ProductModel Schema', () => {
    it('accepts bounded priors and rejects invalid versions, missing fields, and unknown fields', () => {
      const model = validProjectFixture.productModel;
      expect(ProductModelSchema.safeParse({
        ...model,
        userSophistication: 0,
        trustRequirement: 100,
        informationComplexity: 0,
        dataDensity: 100,
      }).success).toBe(true);

      const { primaryObjective: _primaryObjective, ...missingObjective } = model;
      expect(ProductModelSchema.safeParse(missingObjective).success).toBe(false);
      expect(ProductModelSchema.safeParse({ ...model, schemaVersion: '0.1.0' }).success).toBe(false);
      expect(ProductModelSchema.safeParse({ ...model, schemaVersion: '2.0.0' }).success).toBe(false);
      expect(ProductModelSchema.safeParse({ ...model, futureCapabilityField: true }).success).toBe(false);
      const { schemaVersion: _schemaVersion, ...unversionedModel } = model;
      expect(ProductModelSchema.safeParse(unversionedModel).success).toBe(false);
    });

    it('round-trips JSON serialization faithfully', () => {
      expect(ProductModelSchema.parse(JSON.parse(JSON.stringify(validProjectFixture.productModel))))
        .toEqual(validProjectFixture.productModel);
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

    it('rejects unknown nested creator fields instead of stripping them', () => {
      const candidate = {
        ...validResourceFixture,
        creator: { ...validResourceFixture.creator, verifiedByTessellate: true },
      };

      expect(ResourceManifestSchema.safeParse(candidate).success).toBe(false);
    });

    it('rejects an unsupported resource schema version during migration', () => {
      for (const version of ['0.1.0', '2.0.0', 'next']) {
        expect(() => migrateResourceManifest({ ...validResourceFixture, schemaVersion: version }))
          .toThrow(/Unsupported ResourceManifest schema version/);
      }
    });

    it('rejects a resource with no schema version instead of assuming the current contract', () => {
      const { schemaVersion: _schemaVersion, ...unversionedResource } = validResourceFixture;

      expect(() => migrateResourceManifest(unversionedResource)).toThrow(
        /ResourceManifest schema version is required/
      );
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

    it('rejects a navigation item that points at a missing screen', () => {
      const candidate = {
        ...validProjectFixture,
        navigation: {
          ...validProjectFixture.navigation,
          primaryItems: [{ label: 'Missing', targetScreenId: 'screen-does-not-exist' }],
        },
      };

      expect(ProjectManifestSchema.safeParse(candidate).success).toBe(false);
    });

    it('rejects missing required fields and unknown nested graph properties', () => {
      const { name: _name, ...missingName } = validProjectFixture;
      expect(ProjectManifestSchema.safeParse(missingName).success).toBe(false);
      expect(ProjectManifestSchema.safeParse({
        ...validProjectFixture,
        screenGraph: {
          ...validProjectFixture.screenGraph,
          groups: [{ ...validProjectFixture.screenGraph.groups[0]!, futureGroupField: 'unknown' }],
        },
      }).success).toBe(false);
    });

    it('rejects a lock that points at a missing node', () => {
      const candidate = {
        ...validProjectFixture,
        locks: [{ targetNodeId: 'node-does-not-exist', lockTypes: ['structure'] as const }],
      };

      expect(ProjectManifestSchema.safeParse(candidate).success).toBe(false);
    });

    it('rejects duplicate node IDs across the project tree', () => {
      const candidate = structuredClone(validProjectFixture);
      candidate.screens[0]!.rootNode.children.push({
        ...structuredClone(candidate.screens[0]!.rootNode),
        children: [],
      });

      expect(ProjectManifestSchema.safeParse(candidate).success).toBe(false);
    });
  });

  describe('ScreenGraph Schema', () => {
    it('rejects edges whose endpoints are not in the graph', () => {
      const candidate = {
        ...validProjectFixture.screenGraph,
        edges: [{ id: 'edge_dangling', fromScreenId: 'scr_overview', toScreenId: 'scr_missing' }],
      };

      expect(ScreenGraphSchema.safeParse(candidate).success).toBe(false);
    });

    it('rejects missing graph groups and unknown nested group fields', () => {
      expect(ScreenGraphSchema.safeParse({ ...validProjectFixture.screenGraph, groups: [] }).success).toBe(false);
      expect(ScreenGraphSchema.safeParse({
        ...validProjectFixture.screenGraph,
        groups: [{ ...validProjectFixture.screenGraph.groups[0]!, unexpected: true }],
      }).success).toBe(false);
    });

    it('rejects duplicate routes within a screen graph', () => {
      const graph = structuredClone(validProjectFixture.screenGraph);
      const firstGroup = graph.groups[0]!;
      firstGroup.screens.push({
        ...structuredClone(firstGroup.screens[0]!),
        id: 'screen-duplicate-route',
        name: 'Duplicate route',
      });

      expect(ScreenGraphSchema.safeParse(graph).success).toBe(false);
    });

    it('round-trips JSON serialization faithfully', () => {
      expect(ScreenGraphSchema.parse(JSON.parse(JSON.stringify(validProjectFixture.screenGraph))))
        .toEqual(validProjectFixture.screenGraph);
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

    it('rejects target IDs that disagree with the payload node ID', () => {
      const parsed = ProjectMutationSchema.safeParse({
        id: 'mut_mismatched_target',
        type: 'CHANGE_VARIANT',
        targetId: 'node_unlocked',
        payload: { targetNodeId: 'node_locked', variant: 'nocturne' },
        actor: 'user',
        timestamp: '2026-10-16T12:00:00.000Z',
        preconditionRevision: 0,
      });

      expect(parsed.success).toBe(false);
    });

    it('rejects an ADD_SCREEN whose manifest reference and graph node disagree', () => {
      const parsed = ProjectMutationSchema.safeParse({
        id: 'mut_add_screen_mismatch',
        type: 'ADD_SCREEN',
        targetId: 'project',
        payload: {
          screen: {
            id: 'screen_people',
            screenNodeId: 'graph_people',
            name: 'People',
            slug: '/people',
            rootNode: { id: 'node_people', nodeType: 'layout', semanticRole: 'people', children: [] },
          },
          screenNode: {
            id: 'graph_different',
            name: 'People',
            slug: '/people',
            screenType: 'directory',
            purpose: 'Browse people',
            required: true,
            navigationVisibility: 'primary',
            importance: 80,
          },
        },
        actor: 'user',
        timestamp: '2026-10-16T12:00:00.000Z',
        preconditionRevision: 0,
      });

      expect(parsed.success).toBe(false);
    });

    it('rejects missing required payload fields and unknown payload fields', () => {
      const mutation = {
        id: 'mut_strict_payload',
        type: 'SET_PROP',
        targetId: 'node_01',
        payload: { value: 'label' },
        actor: 'user',
        timestamp: '2026-10-16T12:00:00.000Z',
        preconditionRevision: 0,
      };
      expect(ProjectMutationSchema.safeParse(mutation).success).toBe(false);
      expect(ProjectMutationSchema.safeParse({
        ...mutation,
        payload: { prop: 'label', value: 'Hello', unexpected: true },
      }).success).toBe(false);
    });

    it('round-trips a valid mutation faithfully', () => {
      const mutation = {
        id: 'mut_round_trip',
        type: 'SET_PROP',
        targetId: 'node_01',
        payload: { prop: 'label', value: 'Hello' },
        actor: 'user',
        timestamp: '2026-10-16T12:00:00.000Z',
        preconditionRevision: 0,
      };
      expect(ProjectMutationSchema.parse(JSON.parse(JSON.stringify(mutation)))).toEqual(mutation);
    });
  });

  describe('Lock and History contracts', () => {
    const mutation = {
      id: 'mut_history_fixture',
      type: 'SET_DESIGN_TOKEN' as const,
      targetId: 'project',
      payload: { key: '--radius-md', value: '8px' },
      actor: 'user' as const,
      timestamp: '2026-10-16T12:00:00.000Z',
      preconditionRevision: 0,
    };

    it('validates lock bounds and rejects empty or unknown lock fields', () => {
      const allLocks = ['node', 'structure', 'content', 'style', 'motion', 'media', 'responsive', 'dna'] as const;
      expect(LockSpecSchema.safeParse({ targetNodeId: 'node_01', lockTypes: ['structure'] }).success).toBe(true);
      expect(LockSpecSchema.safeParse({ targetNodeId: 'node_01', lockTypes: allLocks }).success).toBe(true);
      expect(LockSpecSchema.safeParse({ targetNodeId: 'node_01', lockTypes: [] }).success).toBe(false);
      expect(LockSpecSchema.safeParse({ targetNodeId: 'node_01', lockTypes: ['unknown'] }).success).toBe(false);
      expect(LockSpecSchema.safeParse({ targetNodeId: 'node_01', lockTypes: ['style'], extra: true }).success).toBe(false);
      expect(LockSpecSchema.safeParse({ lockTypes: ['style'] }).success).toBe(false);
      const lock = { targetNodeId: 'node_01', lockTypes: ['style'] };
      expect(LockSpecSchema.parse(JSON.parse(JSON.stringify(lock)))).toEqual(lock);
    });

    it('validates history requirements and round-trips mutations', () => {
      const history = {
        id: 'history_01',
        summary: 'Change project radius',
        actor: 'user',
        createdAt: '2026-10-16T12:00:00.000Z',
        mutations: [mutation],
        inverseMutations: [],
        affectedNodeIds: [],
      };
      expect(HistoryOperationSchema.safeParse(history).success).toBe(true);
      expect(HistoryOperationSchema.safeParse({ ...history, id: undefined }).success).toBe(false);
      expect(HistoryOperationSchema.safeParse({ ...history, mutations: [] }).success).toBe(false);
      expect(HistoryOperationSchema.safeParse({ ...history, extra: true }).success).toBe(false);
      expect(HistoryOperationSchema.parse(JSON.parse(JSON.stringify(history)))).toEqual(history);
    });
  });

  describe('ExportSettings Schema', () => {
    it('applies defaults and rejects unsupported targets, stack values, and unknown keys', () => {
      expect(ExportSettingsSchema.parse({})).toEqual({
        framework: 'react',
        styling: 'tailwind',
        includeTypes: true,
        target: 'vite-react-tailwind',
      });
      expect(ExportSettingsSchema.safeParse({ target: 'unsupported-runtime' }).success).toBe(false);
      expect(ExportSettingsSchema.safeParse({ target: 'nextjs' }).success).toBe(true);
      expect(ExportSettingsSchema.safeParse({ target: 'expo' }).success).toBe(true);
      expect(ExportSettingsSchema.safeParse({ target: 'swiftui' }).success).toBe(true);
      expect(ExportSettingsSchema.safeParse({ target: 'tokens' }).success).toBe(true);
      expect(ExportSettingsSchema.safeParse({ framework: 'next' }).success).toBe(false);
      expect(ExportSettingsSchema.safeParse({ extra: true }).success).toBe(false);
      expect(ExportSettingsSchema.parse(JSON.parse(JSON.stringify({ target: 'nextjs' }))))
        .toEqual({ framework: 'react', styling: 'tailwind', includeTypes: true, target: 'nextjs' });
    });
  });

  describe('Version compatibility', () => {
    it('upgrades the explicitly supported 0.1 project shape', () => {
      const oldProject = {
        ...validProjectFixture,
        schemaVersion: '0.1.0',
        productModel: { ...validProjectFixture.productModel, schemaVersion: '0.1.0' },
      };

      const migrated = migrateProjectManifest(oldProject);

      expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
      expect(migrated.productModel.schemaVersion).toBe(SCHEMA_VERSION);
      expect(migrated.screens).toEqual(validProjectFixture.screens);
    });

    it.each(['2.0.0', '0.9.0', 'next'])('rejects unsupported schema version %s', (version) => {
      const candidate = {
        ...validProjectFixture,
        schemaVersion: version,
        productModel: { ...validProjectFixture.productModel, schemaVersion: version },
      };

      expect(() => migrateProjectManifest(candidate)).toThrow(/Unsupported ProjectManifest schema version/);
    });

    it('rejects a missing project schema version instead of guessing a migration source', () => {
      const { schemaVersion: _schemaVersion, ...unversionedProject } = validProjectFixture;

      expect(() => migrateProjectManifest(unversionedProject)).toThrow(
        /ProjectManifest schema version is required/
      );
    });

    it('does not strip an unknown property from a current project manifest', () => {
      const candidate = { ...validProjectFixture, futureContractField: { retained: true } };

      expect(ProjectManifestSchema.safeParse(candidate).success).toBe(false);
      expect(() => migrateProjectManifest(candidate)).toThrow(/Unrecognized key/);
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

    it('accepts both score boundaries and rejects unknown fields', () => {
      const maximum = {
        total: 100,
        scores: {
          cohesion: 20,
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
      const minimum = {
        total: 0,
        scores: Object.fromEntries(Object.keys(maximum.scores).map((key) => [key, 0])),
        issues: [],
      };
      expect(AuditResultSchema.safeParse(maximum).success).toBe(true);
      expect(AuditResultSchema.safeParse(minimum).success).toBe(true);
      expect(AuditResultSchema.safeParse({ ...maximum, extra: true }).success).toBe(false);
      expect(AuditResultSchema.safeParse({ total: 1 }).success).toBe(false);
      expect(AuditResultSchema.parse(JSON.parse(JSON.stringify(maximum)))).toEqual(maximum);
    });
  });

  describe('Other persisted contracts', () => {
    it('rejects DNA deltas outside the documented range', () => {
      expect(IntentCommandSchema.safeParse({
        action: 'adjust-dna',
        summary: 'Increase density',
        dnaDeltas: { density: 101 },
      }).success).toBe(false);
    });

    it('accepts the minimum command and inclusive DNA delta boundaries', () => {
      expect(IntentCommandSchema.safeParse({
        action: 'adjust-dna',
        summary: 'Adjust visual density',
        dnaDeltas: { density: -100, visualAmbition: 100 },
      }).success).toBe(true);
      expect(IntentCommandSchema.safeParse({
        action: 'adjust-dna',
        summary: 'Adjust visual density',
        unrecognized: true,
      }).success).toBe(false);
      expect(IntentCommandSchema.safeParse({ action: 'adjust-dna' }).success).toBe(false);
      const command = { action: 'adjust-dna', summary: 'Reduce motion', dnaDeltas: { motion: -100 } };
      expect(IntentCommandSchema.parse(JSON.parse(JSON.stringify(command)))).toEqual({
        ...command,
        preserveLockedNodes: true,
      });
    });

    it('rejects unknown history operation fields', () => {
      const validMutation = {
        id: 'mut_history_unknown_field',
        type: 'SET_DESIGN_TOKEN',
        targetId: 'project',
        payload: { key: '--radius-md', value: '8px' },
        actor: 'user',
        timestamp: '2026-10-16T12:00:00.000Z',
        preconditionRevision: 0,
      };
      expect(HistoryOperationSchema.safeParse({
        id: 'history_1',
        summary: 'Set a property',
        actor: 'user',
        createdAt: '2026-10-16T12:00:00.000Z',
        mutations: [validMutation],
        unexpected: 'not part of the contract',
      }).success).toBe(false);
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
        /ProjectManifest schema version is required/
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
