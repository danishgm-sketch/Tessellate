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
    expect(tools).toHaveProperty('interpret_brief');
    expect(tools).toHaveProperty('compose_product');
    expect(tools).toHaveProperty('validate_project');
    expect(tools).toHaveProperty('audit_project');
    expect(tools).toHaveProperty('get_design_dna');
    expect(tools).toHaveProperty('list_design_directions');
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

  it('executes tool: compose_product composes a reviewed interpretation into a valid manifest', async () => {
    const server = createMcpServer({ cwd: repoRoot });
    const { physioInterpretationFixture, ProjectManifestSchema } = await import('@tessellate/schemas');

    const res = await getTool(server, 'compose_product').handler({ interpretation: physioInterpretationFixture, name: 'Physio' });
    const parsed = JSON.parse(res.content[0]!.text) as { manifest: unknown; alternatives: string[] };
    const manifest = ProjectManifestSchema.parse(parsed.manifest);
    expect(manifest.name).toBe('Physio');
    expect(manifest.screens.length).toBeGreaterThan(3);
    expect(parsed.alternatives).toHaveLength(3);

    const bad = (await getTool(server, 'compose_product').handler({ interpretation: { kind: 'nope' } })) as { isError?: boolean };
    expect(bad.isError).toBe(true);
  });

  it('executes tool: interpret_brief reports an error when the intelligence service is offline (no fallback)', async () => {
    const offline = (() => Promise.reject(new TypeError('fetch failed'))) as unknown as typeof fetch;
    const server = createMcpServer({ cwd: repoRoot, intelligence: { apiBase: 'http://127.0.0.1:9', fetchImpl: offline } });
    const res = (await getTool(server, 'interpret_brief').handler({ brief: 'A booking platform for physiotherapy clinics' })) as {
      isError?: boolean;
      content: Array<{ text: string }>;
    };
    expect(res.isError).toBe(true);
    expect(res.content[0]!.text).toMatch(/could not reach/);
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
