import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { createMcpServer } from '../index.js';
import { loadMcpCatalogue, findResourceBySlug } from '../catalog-provider.js';

describe('Phase 17 — @tessellate/mcp Server & Tools Test Suite', () => {
  const repoRoot = path.resolve(__dirname, '../../../..');

  it('initializes McpServer and registers all mandatory tools', () => {
    const server = createMcpServer({ cwd: repoRoot });
    expect(server).toBeDefined();

    // Check that tools are registered on internal map
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
    expect(tools).toBeDefined();
    expect(tools).toHaveProperty('search_resources');
    expect(tools).toHaveProperty('get_resource');
    expect(tools).toHaveProperty('get_resource_code');
    expect(tools).toHaveProperty('get_resource_metadata');
    expect(tools).toHaveProperty('find_alternatives');
    expect(tools).toHaveProperty('recommend_resources');
    expect(tools).toHaveProperty('compose_screen');
    expect(tools).toHaveProperty('compose_product');
    expect(tools).toHaveProperty('validate_project');
    expect(tools).toHaveProperty('audit_project');
    expect(tools).toHaveProperty('get_design_dna');
    expect(tools).toHaveProperty('list_design_directions');
    expect(tools).toHaveProperty('export_project_code');
    expect(tools).toHaveProperty('audit_project_accessibility');
    expect(tools).toHaveProperty('mutate_screen_ast');
  });

  it('catalog provider loads resources correctly', async () => {
    const catalogue = await loadMcpCatalogue(repoRoot);
    expect(catalogue.resources.length).toBeGreaterThanOrEqual(1);

    const button = await findResourceBySlug('button', repoRoot);
    expect(button).not.toBeNull();
    expect(button?.slug).toBe('button');
  });

  function getTool(server: unknown, name: string) {
    const s = server as { _registeredTools: Record<string, { handler: (args: Record<string, unknown>) => Promise<{ content: Array<{ text: string }> }> }> };
    const tool = s._registeredTools[name];
    if (!tool) throw new Error(`Tool ${name} not registered`);
    return tool;
  }

  it('executes tool: search_resources', async () => {
    const server = createMcpServer({ cwd: repoRoot });
    const res = await getTool(server, 'search_resources').handler({ query: 'button' });
    expect(res.content).toBeDefined();
    expect(res.content[0]?.text).toContain('button');
  });

  it('executes tool: get_resource and get_resource_metadata', async () => {
    const server = createMcpServer({ cwd: repoRoot });

    const res = await getTool(server, 'get_resource').handler({ slug: 'button' });
    const parsed = JSON.parse(res.content[0]!.text) as { slug: string; name: string };
    expect(parsed.slug).toBe('button');
    expect(parsed.name).toBe('Button');

    const metaRes = await getTool(server, 'get_resource_metadata').handler({ slug: 'button' });
    const parsedMeta = JSON.parse(metaRes.content[0]!.text) as { slug: string; accessibility: { levelTarget: string } };
    expect(parsedMeta.slug).toBe('button');
    expect(parsedMeta.accessibility.levelTarget).toBeDefined();
  });

  it('executes tool: get_resource_code', async () => {
    const server = createMcpServer({ cwd: repoRoot });
    const res = await getTool(server, 'get_resource_code').handler({ slug: 'button' });
    expect(res.content[0]?.text).toBeDefined();
  });

  it('executes tool: compose_screen and compose_product', async () => {
    const server = createMcpServer({ cwd: repoRoot });

    const screenRes = await getTool(server, 'compose_screen').handler({
      prompt: 'Minimal developer documentation site with search and sidebar navigation',
      name: 'Developer Docs',
    });
    const parsedScreen = JSON.parse(screenRes.content[0]!.text) as {
      name: string;
      schemaVersion: string;
      productModel: unknown;
      screens: Array<{ id: string; rootNode: unknown }>;
    };
    expect(parsedScreen.name).toBe('Developer Docs');
    expect(parsedScreen.schemaVersion).toBe('1.0.0');
    expect(parsedScreen.productModel).toBeDefined();
    expect(parsedScreen.screens.length).toBeGreaterThan(0);
    expect(parsedScreen.screens[0]?.rootNode).toBeDefined();

    const productRes = await getTool(server, 'compose_product').handler({
      description: 'AI customer support ticketing dashboard',
    });
    const parsedProduct = JSON.parse(productRes.content[0]!.text) as { productModel: unknown; screenPlan: { totalScreens: number } };
    expect(parsedProduct.productModel).toBeDefined();
    expect(parsedProduct.screenPlan.totalScreens).toBeGreaterThan(0);
  });

  it('executes tool: validate_project and audit_project', async () => {
    const server = createMcpServer({ cwd: repoRoot });
    const { validProjectFixture } = await import('@tessellate/schemas');

    const valRes = await getTool(server, 'validate_project').handler({ manifest: validProjectFixture });
    const parsedVal = JSON.parse(valRes.content[0]!.text) as { valid: boolean };
    expect(parsedVal.valid).toBe(true);

    const auditRes = await getTool(server, 'audit_project').handler({ manifest: validProjectFixture });
    const parsedAudit = JSON.parse(auditRes.content[0]!.text) as { passed: boolean };
    expect(parsedAudit.passed).toBe(true);
  });

  it('executes tool: export_project_code, audit_project_accessibility, and mutate_screen_ast', async () => {
    const server = createMcpServer({ cwd: repoRoot });
    const { validProjectFixture } = await import('@tessellate/schemas');

    // 1. Export code
    const exportRes = await getTool(server, 'export_project_code').handler({
      manifest: validProjectFixture,
      target: 'vite',
    });
    const parsedExport = JSON.parse(exportRes.content[0]!.text) as {
      target: string;
      fileCount: number;
      files: Record<string, string>;
    };
    expect(parsedExport.target).toBe('vite');
    expect(parsedExport.fileCount).toBeGreaterThan(0);
    expect(parsedExport.files).toHaveProperty('package.json');

    // 2. Audit accessibility
    const a11yRes = await getTool(server, 'audit_project_accessibility').handler({
      manifest: validProjectFixture,
    });
    const parsedA11y = JSON.parse(a11yRes.content[0]!.text) as {
      summary: string;
      levelAchieved: string;
    };
    expect(parsedA11y.summary).toBeDefined();
    expect(['AAA', 'AA']).toContain(parsedA11y.levelAchieved);

    // 3. Mutate AST (lock node)
    const mutateRes = await getTool(server, 'mutate_screen_ast').handler({
      manifest: validProjectFixture,
      action: 'lock_node',
      nodeId: 'node-header-1',
    });
    const parsedMutate = JSON.parse(mutateRes.content[0]!.text) as {
      success: boolean;
      manifest: { locks: Array<{ targetNodeId: string }> };
    };
    expect(parsedMutate.success).toBe(true);
    expect(parsedMutate.manifest.locks.some((l) => l.targetNodeId === 'node-header-1')).toBe(true);
  });

  it('executes tool: get_design_dna and list_design_directions', async () => {
    const server = createMcpServer({ cwd: repoRoot });

    const dnaRes = await getTool(server, 'get_design_dna').handler({});
    const parsedDna = JSON.parse(dnaRes.content[0]!.text) as { dimensions: string[]; presets: string[] };
    expect(parsedDna.dimensions).toContain('density');
    expect(parsedDna.presets).toBeDefined();

    const dirRes = await getTool(server, 'list_design_directions').handler({});
    const parsedDir = JSON.parse(dirRes.content[0]!.text) as { directions: Array<{ id: string; name: string }> };
    expect(parsedDir.directions).toHaveLength(3);
    expect(parsedDir.directions[0]?.name).toBe('Editorial Precision');
    expect(parsedDir.directions[1]?.name).toBe('Kinetic Monolith');
    expect(parsedDir.directions[2]?.name).toBe('Atmospheric Depth');
  });
});
