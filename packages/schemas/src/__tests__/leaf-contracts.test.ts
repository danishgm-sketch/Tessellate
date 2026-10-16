import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as schemas from '../index.js';
import { validProjectFixture } from '../fixtures/valid-project.js';
import { validResourceFixture } from '../fixtures/valid-resource.js';

type ContractCase = {
  name: string;
  schema: z.ZodTypeAny;
  value: unknown;
  requiredField: string;
  allowMissing?: boolean;
};

const graphScreen = validProjectFixture.screenGraph.groups[0]!.screens[0]!;
const projectScreen = validProjectFixture.screens[0]!;
const auditScores = {
  cohesion: 20,
  accessibility: 20,
  performance: 15,
  responsive: 15,
  hierarchy: 10,
  densityConsistency: 5,
  motionConsistency: 5,
  designSystemCompliance: 5,
  interactionConsistency: 5,
};

const leafContracts: ContractCase[] = [
  { name: 'CreatorRef', schema: schemas.CreatorRefSchema, value: validResourceFixture.creator, requiredField: 'id' },
  { name: 'ResourceRef', schema: schemas.ResourceRefSchema, value: { id: 'res_1', slug: 'button', version: '1.0.0' }, requiredField: 'slug' },
  { name: 'Provenance', schema: schemas.ProvenanceSchema, value: validResourceFixture.provenance, requiredField: 'origin' },
  { name: 'LicenseInfo', schema: schemas.LicenseInfoSchema, value: validResourceFixture.license, requiredField: 'spdx' },
  { name: 'DependencySpec', schema: schemas.DependencySpecSchema, value: { package: 'react', range: '^19', kind: 'peer' }, requiredField: 'package' },
  { name: 'ResourceFileSpec', schema: schemas.ResourceFileSpecSchema, value: validResourceFixture.files[0], requiredField: 'path' },
  { name: 'RegistrySpec', schema: schemas.RegistrySpecSchema, value: validResourceFixture.registry, requiredField: 'name' },
  { name: 'PreviewSpec', schema: schemas.PreviewSpecSchema, value: validResourceFixture.preview, requiredField: 'component' },
  { name: 'SlotSpec', schema: schemas.SlotSpecSchema, value: validResourceFixture.slots[0], requiredField: 'id' },
  { name: 'VariantSpec', schema: schemas.VariantSpecSchema, value: validResourceFixture.variants[0], requiredField: 'id' },
  { name: 'WeightedTag', schema: schemas.WeightedTagSchema, value: validResourceFixture.productArchetypes[0], requiredField: 'tag' },
  { name: 'ResourceIntent', schema: schemas.ResourceIntentSchema, value: validResourceFixture.intent, requiredField: 'summary' },
  { name: 'InteractionDNA', schema: schemas.InteractionDNASchema, value: validResourceFixture.interactionDNA, requiredField: 'interactionDensity' },
  { name: 'LayoutDNA', schema: schemas.LayoutDNASchema, value: validResourceFixture.layoutDNA, requiredField: 'density' },
  { name: 'BreakpointStrategy', schema: schemas.BreakpointStrategySchema, value: { maxWidth: 640, strategy: 'stack' }, requiredField: 'maxWidth' },
  { name: 'ResponsiveSpec', schema: schemas.ResponsiveSpecSchema, value: validResourceFixture.responsive, requiredField: 'verifiedWidths' },
  { name: 'AccessibilitySpec', schema: schemas.AccessibilitySpecSchema, value: validResourceFixture.accessibility, requiredField: 'levelTarget' },
  { name: 'PerformanceSpec', schema: schemas.PerformanceSpecSchema, value: validResourceFixture.performance, requiredField: 'jsCost' },
  { name: 'QualitySpec', schema: schemas.QualitySpecSchema, value: validResourceFixture.quality, requiredField: 'overall' },
  { name: 'ResourceRelationship', schema: schemas.ResourceRelationshipSchema, value: { type: 'WORKS_WITH', target: 'navigation' }, requiredField: 'type' },
  { name: 'CompatibilitySpec', schema: schemas.CompatibilitySpecSchema, value: { requiredContext: ['application'] }, requiredField: 'requiredContext', allowMissing: true },
  { name: 'ProjectConstraints', schema: schemas.ProjectConstraintsSchema, value: validProjectFixture.constraints, requiredField: 'accessibilityFloor', allowMissing: true },
  { name: 'ProductEntity', schema: schemas.ProductEntitySchema, value: validProjectFixture.productModel.entities[0], requiredField: 'name' },
  { name: 'WorkflowModel', schema: schemas.WorkflowModelSchema, value: validProjectFixture.productModel.workflows[0], requiredField: 'id' },
  { name: 'ScreenSuggestion', schema: schemas.ScreenSuggestionSchema, value: validProjectFixture.productModel.likelyScreens[0], requiredField: 'name' },
  { name: 'ScreenNode', schema: schemas.ScreenNodeSchema, value: graphScreen, requiredField: 'id' },
  { name: 'ScreenGroup', schema: schemas.ScreenGroupSchema, value: validProjectFixture.screenGraph.groups[0], requiredField: 'id' },
  { name: 'ScreenEdge', schema: schemas.ScreenEdgeSchema, value: { id: 'edge_1', fromScreenId: 'a', toScreenId: 'b' }, requiredField: 'fromScreenId' },
  { name: 'NodeLocks', schema: schemas.NodeLocksSchema, value: { structure: true }, requiredField: 'structure', allowMissing: true },
  { name: 'ProjectNode', schema: schemas.ProjectNodeSchema, value: projectScreen.rootNode, requiredField: 'id' },
  { name: 'ProjectScreen', schema: schemas.ProjectScreenSchema, value: projectScreen, requiredField: 'screenNodeId' },
  { name: 'NavigationItem', schema: schemas.NavigationItemSchema, value: validProjectFixture.navigation.primaryItems[0], requiredField: 'targetScreenId' },
  { name: 'NavigationModel', schema: schemas.NavigationModelSchema, value: validProjectFixture.navigation, requiredField: 'model' },
  { name: 'BrandDNA', schema: schemas.BrandDNASchema, value: validProjectFixture.brand, requiredField: 'name', allowMissing: true },
  { name: 'ProjectAsset', schema: schemas.ProjectAssetSchema, value: { id: 'asset_1', name: 'Logo', mimeType: 'image/svg+xml', url: '/logo.svg' }, requiredField: 'id' },
  { name: 'LockSpec', schema: schemas.LockSpecSchema, value: validProjectFixture.locks[0], requiredField: 'targetNodeId' },
  { name: 'HistoryMeta', schema: schemas.HistoryMetaSchema, value: validProjectFixture.historyMeta, requiredField: 'headRevision', allowMissing: true },
  {
    name: 'HistoryOperation',
    schema: schemas.HistoryOperationSchema,
    value: {
      id: 'history_1',
      summary: 'Set project radius',
      actor: 'user',
      createdAt: '2026-10-16T12:00:00.000Z',
      mutations: [{
        id: 'mut_history_1',
        type: 'SET_DESIGN_TOKEN',
        targetId: 'project',
        payload: { key: '--radius-md', value: '8px' },
        actor: 'user',
        timestamp: '2026-10-16T12:00:00.000Z',
        preconditionRevision: 0,
      }],
      inverseMutations: [],
      affectedNodeIds: [],
    },
    requiredField: 'summary',
  },
  { name: 'ExportSettings', schema: schemas.ExportSettingsSchema, value: validProjectFixture.exportSettings, requiredField: 'target', allowMissing: true },
  {
    name: 'DesignDirection',
    schema: schemas.DesignDirectionSchema,
    value: {
      id: 'direction_1',
      name: 'Editorial',
      rationale: 'A clear editorial hierarchy.',
      designDNA: validProjectFixture.designDNA,
      screenGraph: validProjectFixture.screenGraph,
      navigationModel: validProjectFixture.navigation,
      layoutGrammarFamily: 'editorial-stack',
      representativeResources: [],
      seed: 'seed_1',
    },
    requiredField: 'rationale',
  },
  { name: 'AuditSuggestedFix', schema: schemas.AuditSuggestedFixSchema, value: { description: 'Add visible focus styles.' }, requiredField: 'description' },
  { name: 'AuditIssue', schema: schemas.AuditIssueSchema, value: { id: 'issue_1', category: 'accessibility', severity: 'warning', message: 'Focus is not visible.' }, requiredField: 'message' },
  { name: 'AuditCategoryScores', schema: schemas.AuditCategoryScoresSchema, value: auditScores, requiredField: 'cohesion' },
  { name: 'AuditResult', schema: schemas.AuditResultSchema, value: { total: 100, scores: auditScores, issues: [] }, requiredField: 'total' },
  { name: 'IntentCommand', schema: schemas.IntentCommandSchema, value: { action: 'adjust-dna', summary: 'Use less motion.' }, requiredField: 'summary' },
  { name: 'CategoricalIntentDNA', schema: schemas.CategoricalIntentDNASchema, value: { geometryFamily: 'sharp' }, requiredField: 'geometryFamily', allowMissing: true },
  { name: 'PartialDesignDNA', schema: schemas.PartialDesignDNASchema, value: { density: 50 }, requiredField: 'density', allowMissing: true },
  { name: 'SetDesignTokenPayload', schema: schemas.SetDesignTokenPayloadSchema, value: { key: '--radius-md', value: '8px' }, requiredField: 'key' },
  { name: 'SetIntentPayload', schema: schemas.SetIntentPayloadSchema, value: { dimensions: { density: 75 } }, requiredField: 'dimensions' },
  { name: 'SetPropPayload', schema: schemas.SetPropPayloadSchema, value: { prop: 'label', value: 'Save' }, requiredField: 'prop' },
  { name: 'SetContentPayload', schema: schemas.SetContentPayloadSchema, value: { slot: 'title', value: 'People' }, requiredField: 'slot' },
  { name: 'InsertNodePayload', schema: schemas.InsertNodePayloadSchema, value: { parentId: 'parent', node: projectScreen.rootNode }, requiredField: 'parentId' },
  { name: 'DeleteNodePayload', schema: schemas.DeleteNodePayloadSchema, value: { nodeId: 'node_1' }, requiredField: 'nodeId' },
  { name: 'MoveNodePayload', schema: schemas.MoveNodePayloadSchema, value: { nodeId: 'node_1', newParentId: 'node_2' }, requiredField: 'newParentId' },
  { name: 'ReplaceNodePayload', schema: schemas.ReplaceNodePayloadSchema, value: { targetNodeId: 'node_1', replacementNode: projectScreen.rootNode }, requiredField: 'targetNodeId' },
  { name: 'ChangeResourcePayload', schema: schemas.ChangeResourcePayloadSchema, value: { targetNodeId: 'node_1', resourceRef: { id: 'res_1', slug: 'button', version: '1.0.0' } }, requiredField: 'resourceRef' },
  { name: 'ChangeVariantPayload', schema: schemas.ChangeVariantPayloadSchema, value: { targetNodeId: 'node_1', variant: 'quiet' }, requiredField: 'variant' },
  { name: 'ChangeLayoutPayload', schema: schemas.ChangeLayoutPayloadSchema, value: { targetNodeId: 'node_1', layout: { columns: 2 } }, requiredField: 'layout' },
  { name: 'LockNodePayload', schema: schemas.LockNodePayloadSchema, value: { targetNodeId: 'node_1', lockTypes: ['structure'] }, requiredField: 'lockTypes' },
  { name: 'UnlockNodePayload', schema: schemas.UnlockNodePayloadSchema, value: { targetNodeId: 'node_1', lockTypes: ['structure'] }, requiredField: 'targetNodeId' },
  { name: 'AddScreenPayload', schema: schemas.AddScreenPayloadSchema, value: { screen: projectScreen, screenNode: graphScreen }, requiredField: 'screenNode' },
  { name: 'DeleteScreenPayload', schema: schemas.DeleteScreenPayloadSchema, value: { screenId: 'screen_1' }, requiredField: 'screenId' },
  { name: 'MoveScreenPayload', schema: schemas.MoveScreenPayloadSchema, value: { screenId: 'screen_1', newIndex: 0 }, requiredField: 'newIndex' },
  { name: 'SetNavigationPayload', schema: schemas.SetNavigationPayloadSchema, value: { navigation: validProjectFixture.navigation }, requiredField: 'navigation' },
  { name: 'SetMotionPayload', schema: schemas.SetMotionPayloadSchema, value: { motionSettings: { reduced: true } }, requiredField: 'motionSettings' },
  { name: 'SetMediaPayload', schema: schemas.SetMediaPayloadSchema, value: { targetNodeId: 'node_1', slot: 'image', media: { src: '/image.svg' } }, requiredField: 'media' },
];

const mutationCases = [
  ['SET_DESIGN_TOKEN', 'project', { key: '--radius-md', value: '8px' }],
  ['SET_INTENT', 'project', { dimensions: { density: 60 } }],
  ['SET_PROP', 'node_1', { prop: 'label', value: 'Save' }],
  ['SET_CONTENT', 'node_1', { slot: 'title', value: 'People' }],
  ['INSERT_NODE', 'node_parent', { parentId: 'node_parent', node: projectScreen.rootNode }],
  ['DELETE_NODE', 'node_1', { nodeId: 'node_1' }],
  ['MOVE_NODE', 'node_1', { nodeId: 'node_1', newParentId: 'node_parent' }],
  ['REPLACE_NODE', 'node_1', { targetNodeId: 'node_1', replacementNode: projectScreen.rootNode }],
  ['CHANGE_RESOURCE', 'node_1', { targetNodeId: 'node_1', resourceRef: { id: 'res_1', slug: 'button', version: '1.0.0' } }],
  ['CHANGE_VARIANT', 'node_1', { targetNodeId: 'node_1', variant: 'quiet' }],
  ['CHANGE_LAYOUT', 'node_1', { targetNodeId: 'node_1', layout: { columns: 2 } }],
  ['LOCK_NODE', 'node_1', { targetNodeId: 'node_1', lockTypes: ['structure'] }],
  ['UNLOCK_NODE', 'node_1', { targetNodeId: 'node_1', lockTypes: ['structure'] }],
  ['ADD_SCREEN', 'project', { screen: projectScreen, screenNode: graphScreen }],
  ['DELETE_SCREEN', 'screen_1', { screenId: 'screen_1' }],
  ['MOVE_SCREEN', 'screen_1', { screenId: 'screen_1', newIndex: 0 }],
  ['SET_NAVIGATION', 'project', { navigation: validProjectFixture.navigation }],
  ['SET_MOTION', 'project', { motionSettings: { reduced: true } }],
  ['SET_MEDIA', 'node_1', { targetNodeId: 'node_1', slot: 'image', media: { src: '/image.svg' } }],
] as const;

describe('Nested schema contracts reject drift and preserve JSON round trips', () => {
  for (const contract of leafContracts) {
    it(`${contract.name} accepts its fixture and rejects missing, malformed, and unknown fields`, () => {
      const valid = JSON.parse(JSON.stringify(contract.value)) as Record<string, unknown>;
      const parsed = contract.schema.parse(valid);
      const restored = contract.schema.parse(JSON.parse(JSON.stringify(contract.value)));
      expect(restored).toEqual(parsed);

      if (!contract.allowMissing) {
        const missing = { ...valid };
        delete missing[contract.requiredField];
        expect(contract.schema.safeParse(missing).success).toBe(false);
      }

      const malformed = { ...valid, [contract.requiredField]: null };
      expect(contract.schema.safeParse(malformed).success).toBe(false);

      expect(contract.schema.safeParse({ ...valid, unexpectedContractField: true }).success).toBe(false);
    });
  }

  it('accepts numeric contract boundaries and rejects values beyond each declared range', () => {
    expect(schemas.WeightedTagSchema.safeParse({ tag: 'saas', weight: 0 }).success).toBe(true);
    expect(schemas.WeightedTagSchema.safeParse({ tag: 'saas', weight: 100 }).success).toBe(true);
    expect(schemas.WeightedTagSchema.safeParse({ tag: 'saas', weight: 101 }).success).toBe(false);

    expect(schemas.InteractionDNASchema.safeParse({
      ...validResourceFixture.interactionDNA,
      interactionDensity: 0,
      motionIntensity: 100,
    }).success).toBe(true);
    expect(schemas.InteractionDNASchema.safeParse({
      ...validResourceFixture.interactionDNA,
      motionIntensity: 101,
    }).success).toBe(false);

    expect(schemas.LayoutDNASchema.safeParse({
      ...validResourceFixture.layoutDNA,
      density: 0,
      whitespace: 100,
      asymmetry: 0,
    }).success).toBe(true);
    expect(schemas.LayoutDNASchema.safeParse({ ...validResourceFixture.layoutDNA, density: -1 }).success).toBe(false);

    expect(schemas.BreakpointStrategySchema.safeParse({ maxWidth: 1, strategy: 'stack' }).success).toBe(true);
    expect(schemas.BreakpointStrategySchema.safeParse({ maxWidth: 0, strategy: 'stack' }).success).toBe(false);
    expect(schemas.BreakpointStrategySchema.safeParse({ maxWidth: 1.5, strategy: 'stack' }).success).toBe(false);

    expect(schemas.ResponsiveSpecSchema.safeParse({
      ...validResourceFixture.responsive,
      verifiedWidths: [1],
    }).success).toBe(true);
    expect(schemas.ResponsiveSpecSchema.safeParse({
      ...validResourceFixture.responsive,
      verifiedWidths: [0],
    }).success).toBe(false);

    expect(schemas.ProjectConstraintsSchema.safeParse({ ...validProjectFixture.constraints, targetDevices: [] }).success).toBe(false);
    expect(schemas.HistoryMetaSchema.safeParse({ totalOperations: 0, headRevision: 0 }).success).toBe(true);
    expect(schemas.HistoryMetaSchema.safeParse({ totalOperations: -1, headRevision: 0 }).success).toBe(false);
    expect(schemas.ProjectAssetSchema.safeParse({ id: 'a', name: 'A', mimeType: 'image/png', url: '/a.png', size: 1 }).success).toBe(true);
    expect(schemas.ProjectAssetSchema.safeParse({ id: 'a', name: 'A', mimeType: 'image/png', url: '/a.png', size: 0 }).success).toBe(false);

    const zeroQuality = Object.fromEntries(Object.keys(validResourceFixture.quality).map((key) => [key, 0]));
    const fullQuality = Object.fromEntries(Object.keys(validResourceFixture.quality).map((key) => [key, 100]));
    expect(schemas.QualitySpecSchema.safeParse(zeroQuality).success).toBe(true);
    expect(schemas.QualitySpecSchema.safeParse(fullQuality).success).toBe(true);
    expect(schemas.QualitySpecSchema.safeParse({ ...fullQuality, overall: 101 }).success).toBe(false);

    expect(schemas.ResourceManifestSchema.safeParse({
      ...validResourceFixture,
      dnaRelevance: { density: 0, trust: 1 },
    }).success).toBe(true);
    expect(schemas.ResourceManifestSchema.safeParse({
      ...validResourceFixture,
      dnaRelevance: { density: 1.1 },
    }).success).toBe(false);
  });

  it('rejects empty collections where the contract requires at least one value', () => {
    expect(schemas.ResourceManifestSchema.safeParse({ ...validResourceFixture, categories: [] }).success).toBe(false);
    expect(schemas.ResourceManifestSchema.safeParse({ ...validResourceFixture, roles: [] }).success).toBe(false);
    expect(schemas.ResourceManifestSchema.safeParse({ ...validResourceFixture, purposes: [] }).success).toBe(false);
    expect(schemas.ResourceManifestSchema.safeParse({ ...validResourceFixture, files: [] }).success).toBe(false);
    expect(schemas.ProductModelSchema.safeParse({ ...validProjectFixture.productModel, productArchetypes: [] }).success).toBe(false);
    expect(schemas.ProductModelSchema.safeParse({ ...validProjectFixture.productModel, jobsToBeDone: [] }).success).toBe(false);
    expect(schemas.WorkflowModelSchema.safeParse({ id: 'wf_1', name: 'Onboard', steps: [] }).success).toBe(false);
    expect(schemas.ScreenGraphSchema.safeParse({ ...validProjectFixture.screenGraph, groups: [] }).success).toBe(false);
    expect(schemas.SetIntentPayloadSchema.safeParse({ dimensions: {} }).success).toBe(false);
  });

  for (const [type, targetId, payload] of mutationCases) {
    it(`${type} mutation validates its typed payload and rejects payload extension`, () => {
      const mutation = {
        id: `mut_${type.toLowerCase()}`,
        type,
        targetId,
        payload,
        actor: 'user',
        timestamp: '2026-10-16T12:00:00.000Z',
        preconditionRevision: 0,
      };
      expect(schemas.ProjectMutationSchema.safeParse(mutation).success).toBe(true);
      expect(schemas.ProjectMutationSchema.parse(JSON.parse(JSON.stringify(mutation))))
        .toEqual(mutation);
      expect(schemas.ProjectMutationSchema.safeParse({
        ...mutation,
        payload: { ...payload, unexpectedContractField: true },
      }).success).toBe(false);
    });
  }
});
