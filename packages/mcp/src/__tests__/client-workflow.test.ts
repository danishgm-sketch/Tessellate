import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { describe, expect, it } from 'vitest';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startMcpSseServer } from '../server-sse.js';
import type { ProjectManifest } from '@tessellate/schemas';
import { composeProjectPipeline } from '@tessellate/compatibility';
import { loadMcpCatalogue } from '../catalog-provider.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const expectedTools = [
  'search_resources',
  'get_resource',
  'get_resource_code',
  'get_resource_metadata',
  'find_alternatives',
  'recommend_resources',
  'compose_screen',
  'compose_product',
  'validate_project',
  'audit_project',
  'get_design_dna',
  'list_design_directions',
  'export_project_code',
  'audit_project_accessibility',
  'mutate_screen_ast',
];

type ResourceNode = {
  resourceRef?: { slug: string };
  children?: ResourceNode[];
};

function getResourceSlugs(manifest: { screens: Array<{ rootNode: ResourceNode }> }): string[] {
  const slugs: string[] = [];
  const visit = (node: ResourceNode) => {
    if (node.resourceRef?.slug) slugs.push(node.resourceRef.slug);
    node.children?.forEach(visit);
  };
  manifest.screens.forEach((screen) => visit(screen.rootNode));
  return [...new Set(slugs)];
}

describe('MCP client workflow', () => {
  it('serves all tools through stdio and completes a compose, mutate, validate, audit, export workflow', async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [
        path.resolve(repoRoot, 'node_modules/tsx/dist/cli.mjs'),
        path.resolve(repoRoot, 'packages/mcp/src/index.ts'),
      ],
      cwd: repoRoot,
      stderr: 'pipe',
    });
    const client = new Client({ name: 'tessellate-mcp-audit', version: '1.0.0' }, { capabilities: {} });
    let serverStderr = '';
    transport.stderr?.on('data', (chunk: Buffer | string) => { serverStderr += chunk.toString(); });

    try {
      await client.connect(transport);
      const listed = await client.listTools();
      expect(listed.tools.map((tool) => tool.name).sort()).toEqual([...expectedTools].sort());
      expect(listed.tools.every((tool) => tool.inputSchema.type === 'object')).toBe(true);
      const recommendationTool = listed.tools.find((tool) => tool.name === 'recommend_resources');
      expect(recommendationTool?.description).toMatch(/lexical token overlap/i);
      expect(recommendationTool?.description).not.toMatch(/best resources/i);

      const call = async (name: string, args: Record<string, unknown> = {}) => await client.callTool({ name, arguments: args }) as {
        content: Array<{ type: string; text?: string }>;
        isError?: boolean;
      };
      const json = async <T>(name: string, args: Record<string, unknown> = {}): Promise<T> => {
        const result = await call(name, args);
        expect(result.isError, `${name} returned an MCP tool error`).not.toBe(true);
        const text = result.content.find((part) => part.type === 'text');
        expect(text?.type).toBe('text');
        return JSON.parse(text?.text ?? '') as T;
      };

      const search = await json<{ resources: Array<{ slug: string }> }>('search_resources', { query: 'button' });
      expect(search.resources.some((resource) => resource.slug === 'button')).toBe(true);
      const emptySearch = await json<{ count: number; resources: Array<{ slug: string }> }>('search_resources', { query: 'no-matching-tessellate-resource-xyz' });
      expect(emptySearch).toEqual({ count: 0, resources: [] });
      await json('search_resources', { query: 'button', limit: 50 });

      const resource = await json<{ slug: string; name: string; resourceType: string }>('get_resource', { slug: 'button' });
      expect(resource).toMatchObject({ slug: 'button', name: 'Button' });
      const missingResource = await call('get_resource', { slug: 'no-such-resource' });
      expect(missingResource.isError).toBe(true);
      const source = await call('get_resource_code', { slug: 'button' });
      expect(source.isError).not.toBe(true);
      expect(source.content.some((part) => part.type === 'text' && part.text?.includes('Button'))).toBe(true);
      const metadata = await json<{ slug: string; accessibility: { levelTarget: string } }>('get_resource_metadata', { slug: 'button' });
      expect(metadata.accessibility.levelTarget).toBeTruthy();
      const alternatives = await json<{ targetSlug: string; criteria: string; alternatives: Array<{ slug: string; resourceType: string; sharedCategories: string[] }> }>('find_alternatives', { slug: 'button', criteria: 'performance' });
      expect(alternatives.targetSlug).toBe('button');
      expect(alternatives.criteria).toBe('performance');
      expect(alternatives.alternatives.length).toBeGreaterThan(0);
      expect(alternatives.alternatives.every((item) => item.resourceType === resource.resourceType && item.sharedCategories.length > 0)).toBe(true);
      const recommendations = await json<{ recommendations: Array<{ slug: string }> }>('recommend_resources', { intent: 'employee onboarding checklist' });
      expect(recommendations.recommendations.length).toBeGreaterThan(0);
      const noRecommendations = await json<{ recommendations: Array<{ slug: string }> }>('recommend_resources', { intent: 'zzunmatchedtoken' });
      expect(noRecommendations.recommendations).toEqual([]);
      const blankIntent = await call('recommend_resources', { intent: '   ' });
      expect(blankIntent.isError).toBe(true);

      const brief = 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
      const designControls = {
        feel: 'professional but playful',
        visualAmbition: 68,
        structuralCreativity: 72,
        targetDevices: ['desktop', 'tablet', 'mobile'] as Array<'desktop' | 'tablet' | 'mobile'>,
      };
      const product = await json<{
        productModel: {
          productArchetypes: Array<{ tag: string }>;
          entities: Array<{ name: string }>;
          likelyScreens: Array<{ name: string }>;
        };
        initialDesignDNA: { playfulness: number; visualAmbition: number; structuralCreativity: number };
        screenPlan: { totalScreens: number };
      }>('compose_product', { description: brief, ...designControls });
      expect(product.productModel.productArchetypes.length).toBeGreaterThan(0);
      expect(product.productModel.entities.map((entity) => entity.name)).toEqual(expect.arrayContaining(['Employee', 'Team', 'Policy']));
      const plannedScreens = product.productModel.likelyScreens.map((screen) => screen.name);
      expect(plannedScreens).toEqual(expect.arrayContaining(['Team Overview', 'People Directory', 'Onboarding', 'Settings & Policies']));
      expect(plannedScreens.join(' ').toLowerCase()).not.toMatch(/trading|portfolio|order book|latency/);
      expect(product.screenPlan.totalScreens).toBeGreaterThan(0);
      expect(product.initialDesignDNA.visualAmbition).toBe(68);
      expect(product.initialDesignDNA.structuralCreativity).toBe(72);
      expect(product.initialDesignDNA.playfulness).toBeGreaterThan(20);

      const compose = (direction: 'A' | 'B' | 'C') => json<ProjectManifest>('compose_screen', {
        prompt: brief,
        name: 'Employee Experience',
        ...designControls,
        seed: 'mcp-employee-parity-01',
        direction,
      });
      const [manifestA, manifestB, manifest] = await Promise.all([compose('A'), compose('B'), compose('C')]);
      expect(new Set([manifestA.navigation.model, manifestB.navigation.model, manifest.navigation.model]).size).toBe(3);
      expect(manifest.screens.length).toBeGreaterThan(0);
      const resourceSlugs = getResourceSlugs(manifest);
      expect(resourceSlugs.length).toBeGreaterThan(0);
      for (const slug of resourceSlugs) {
        const resolved = await json<{ slug: string }>('get_resource', { slug });
        expect(resolved.slug).toBe(slug);
      }

      const catalogue = await loadMcpCatalogue(repoRoot);
      const unresolvedSlugs = [...new Set([manifestA, manifestB, manifest].flatMap(getResourceSlugs))]
        .filter((slug) => !catalogue.resources.some((resource) => resource.slug === slug));
      expect(unresolvedSlugs).toEqual([]);
      const sharedEngineResult = composeProjectPipeline(
        { description: brief, feel: designControls.feel, visualAmbition: designControls.visualAmbition, structuralCreativity: designControls.structuralCreativity, targetDevices: designControls.targetDevices },
        { catalogResources: catalogue.resources, seed: 'mcp-employee-parity-01' },
      );
      const sharedEngine = sharedEngineResult.directionC.manifest;
      expect(manifest.id).toBe(sharedEngine.id);
      expect(product.initialDesignDNA).toEqual(sharedEngineResult.initialDesignDna);
      expect(manifest.productModel).toEqual(sharedEngine.productModel);
      expect(manifest.screenGraph).toEqual(sharedEngine.screenGraph);
      expect(manifest.designDNA).toEqual(sharedEngine.designDNA);
      expect(manifest.navigation).toEqual(sharedEngine.navigation);
      expect(getResourceSlugs(manifest)).toEqual(getResourceSlugs(sharedEngine));
      const nodeId = manifest.screens[0]!.rootNode.id;

      const validation = await json<{ valid: boolean }>('validate_project', { manifest });
      expect(validation.valid).toBe(true);
      const malformedManifest = await call('validate_project', { manifest: {} });
      expect(malformedManifest.isError).toBe(true);
      const audit = await json<{ status: string; notAssessed: string[]; issues: unknown[] }>('audit_project', { manifest });
      expect(audit.status).toBe('heuristics_complete_browser_review_required');
      expect(audit.notAssessed).toContain('Rendered color contrast ratios');
      const directions = await json<{ directions: Array<{ label: string; approach: string }> }>('list_design_directions');
      expect(directions.directions).toHaveLength(3);
      expect(directions.directions.map((direction) => direction.label)).toEqual(['A', 'B', 'C']);
      expect(directions.directions.map((direction) => direction.approach)).toEqual(['conservative', 'expressive', 'structural-alternative']);
      const dna = await json<{ default: Record<string, unknown>; presets: string[]; dimensions: string[] }>('get_design_dna');
      expect(dna.presets.length).toBeGreaterThan(0);
      expect(dna.dimensions).toContain('professionalism');
      expect(dna.dimensions).toContain('density');
      const preset = await json<{ dna: Record<string, unknown> }>('get_design_dna', { preset: 'institutional-intelligence' });
      expect(preset.dna).toBeDefined();

      const locked = await json<{ success: boolean; manifest: typeof manifest }>('mutate_screen_ast', {
        manifest,
        action: 'lock_node',
        nodeId,
      });
      expect(locked.success).toBe(true);
      expect(locked.manifest.locks.some((lock) => lock.targetNodeId === nodeId)).toBe(true);
      const dnaAdjusted = await json<{ success: boolean; manifest: typeof manifest }>('mutate_screen_ast', {
        manifest: locked.manifest,
        action: 'adjust_dna',
        dnaDelta: { playfulness: 84 },
      });
      expect(dnaAdjusted.manifest.designDNA.playfulness).toBe(84);
      expect(dnaAdjusted.manifest.locks.some((lock) => lock.targetNodeId === nodeId)).toBe(true);
      const navigationAdjusted = await json<{ success: boolean; manifest: typeof manifest }>('mutate_screen_ast', {
        manifest: dnaAdjusted.manifest,
        action: 'set_navigation_model',
        navigationModel: 'top-nav',
      });
      expect(navigationAdjusted.manifest.navigation.model).toBe('top-nav');
      const unlocked = await json<{ success: boolean; manifest: typeof manifest }>('mutate_screen_ast', {
        manifest: navigationAdjusted.manifest,
        action: 'unlock_node',
        nodeId,
      });
      expect(unlocked.manifest.locks.some((lock) => lock.targetNodeId === nodeId)).toBe(false);
      const afterMutation = await json<{ valid: boolean }>('validate_project', { manifest: navigationAdjusted.manifest });
      expect(afterMutation.valid).toBe(true);
      const accessibility = await json<{ summary: string; levelAchieved: string; screenCount: number; notAssessed: string[] }>('audit_project_accessibility', { manifest: navigationAdjusted.manifest });
      expect(accessibility.summary).toBeTruthy();
      expect(accessibility.levelAchieved).toBe('not-assessed');
      expect(accessibility.notAssessed).toContain('Keyboard interaction');
      expect(accessibility.screenCount).toBe(navigationAdjusted.manifest.screens.length);

      const exported = await json<{ target: string; fileCount: number; files: Record<string, string> }>('export_project_code', {
        manifest: navigationAdjusted.manifest,
        target: 'vite',
      });
      expect(exported.target).toBe('vite');
      expect(exported.fileCount).toBeGreaterThan(0);
      expect(exported.files['package.json']).toBeDefined();
      const invalidExport = await call('export_project_code', { manifest: {}, target: 'vite' });
      expect(invalidExport.isError).toBe(true);

      const missingMutationArgument = await call('mutate_screen_ast', { manifest, action: 'lock_node' });
      expect(missingMutationArgument.isError).toBe(true);
      const missingNode = await call('mutate_screen_ast', { manifest, action: 'lock_node', nodeId: 'not-in-project' });
      expect(missingNode.isError).toBe(true);
      const invalidDna = await call('mutate_screen_ast', { manifest, action: 'adjust_dna', dnaDelta: { playfulness: 101 } });
      expect(invalidDna.isError).toBe(true);

      const invalidSchemaInput = await call('search_resources', { query: 'button', limit: 51 });
      expect(invalidSchemaInput.isError).toBe(true);
      const oversizedSearch = await call('search_resources', { query: 'x'.repeat(201) });
      expect(oversizedSearch.isError).toBe(true);
      const oversizedBrief = await call('compose_product', { description: 'x'.repeat(10_001) });
      expect(oversizedBrief.isError).toBe(true);
      const oversizedManifest = await call('validate_project', { manifest: { large: 'x'.repeat(1024 * 1024) } });
      expect(oversizedManifest.isError).toBe(true);
      expect(serverStderr.trim()).toBe('');
    } catch (error) {
      const detail = error instanceof Error ? error.stack ?? error.message : String(error);
      throw new Error(`${detail}\nMCP server stderr:\n${serverStderr}`);
    } finally {
      await client.close();
    }
  }, 120_000);

  it('serves two local SSE MCP clients over an ephemeral loopback port without wildcard CORS', async () => {
    const { server, port } = await startMcpSseServer({ port: 0, cwd: repoRoot });
    const client = new Client({ name: 'tessellate-sse-audit', version: '1.0.0' }, { capabilities: {} });
    const secondClient = new Client({ name: 'tessellate-sse-audit-second', version: '1.0.0' }, { capabilities: {} });

    try {
      expect(port).toBeGreaterThan(0);
      const health = await fetch(`http://127.0.0.1:${port}/health`);
      expect(health.status).toBe(200);
      expect((await health.json()).status).toBe('ok');
      const preflight = await fetch(`http://127.0.0.1:${port}/message`, {
        method: 'OPTIONS',
        headers: { Origin: 'https://untrusted.example', 'Access-Control-Request-Method': 'POST' },
      });
      expect(preflight.status).toBe(403);
      expect(preflight.headers.get('Access-Control-Allow-Origin')).toBeNull();

      await Promise.all([
        client.connect(new SSEClientTransport(new URL(`http://127.0.0.1:${port}/sse`))),
        secondClient.connect(new SSEClientTransport(new URL(`http://127.0.0.1:${port}/sse`))),
      ]);
      const [tools, secondTools] = await Promise.all([client.listTools(), secondClient.listTools()]);
      expect(tools.tools.map((tool) => tool.name).sort()).toEqual([...expectedTools].sort());
      expect(secondTools.tools.map((tool) => tool.name).sort()).toEqual([...expectedTools].sort());
      const [result, secondResult] = await Promise.all([
        client.callTool({ name: 'search_resources', arguments: { query: 'button' } }),
        secondClient.callTool({ name: 'get_resource', arguments: { slug: 'button' } }),
      ]);
      expect(result.isError).not.toBe(true);
      expect(JSON.stringify(result)).toContain('button');
      expect(secondResult.isError).not.toBe(true);
      expect(JSON.stringify(secondResult)).toContain('button');
    } finally {
      await client.close();
      await secondClient.close();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);

  it('rejects unauthenticated SSE access from untrusted browser origins', async () => {
    const { server, port } = await startMcpSseServer({ port: 0, cwd: repoRoot });

    try {
      const health = await fetch(`http://127.0.0.1:${port}/health`, {
        headers: { Origin: 'https://untrusted.example' },
      });
      expect(health.status).toBe(403);

      const stream = await fetch(`http://127.0.0.1:${port}/sse`, {
        headers: { Origin: 'https://untrusted.example' },
      });
      expect(stream.status).toBe(403);
      await stream.body?.cancel();
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);

  it('caps concurrent loopback SSE sessions and rejects excess streams explicitly', async () => {
    const { server, port } = await startMcpSseServer({ port: 0, cwd: repoRoot });
    const clients = Array.from({ length: 9 }, (_, index) => new Client(
      { name: `tessellate-sse-limit-${index}`, version: '1.0.0' },
      { capabilities: {} },
    ));

    try {
      const connect = (client: Client) => client.connect(new SSEClientTransport(new URL(`http://127.0.0.1:${port}/sse`)));
      await Promise.all(clients.slice(0, 8).map(connect));
      await expect(connect(clients[8]!)).rejects.toThrow();
    } finally {
      await Promise.all(clients.map((client) => client.close().catch(() => undefined)));
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);

  it('releases SSE session capacity across repeated client disconnects', async () => {
    const { server, port } = await startMcpSseServer({ port: 0, cwd: repoRoot });

    try {
      for (let index = 0; index < 24; index += 1) {
        const client = new Client(
          { name: `tessellate-sse-churn-${index}`, version: '1.0.0' },
          { capabilities: {} },
        );
        await client.connect(new SSEClientTransport(new URL(`http://127.0.0.1:${port}/sse`)));
        const tools = await client.listTools();
        expect(tools.tools.length).toBeGreaterThan(0);
        await client.close();
      }
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);

  it('rejects oversized SSE message bodies at the transport boundary', async () => {
    const { server, port } = await startMcpSseServer({ port: 0, cwd: repoRoot });
    const client = new Client({ name: 'tessellate-sse-size-audit', version: '1.0.0' }, { capabilities: {} });

    try {
      await client.connect(new SSEClientTransport(new URL(`http://127.0.0.1:${port}/sse`)));
      const result = await client.callTool({
        name: 'search_resources',
        arguments: { query: 'x'.repeat(5 * 1024 * 1024) },
      }).then(() => null, (error: unknown) => error);
      expect(result).toBeInstanceOf(Error);
      expect(String(result)).toMatch(/413|too large|body|size/i);
    } finally {
      await client.close();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);

  it('refuses to bind the unauthenticated SSE transport to a network interface', async () => {
    const started = await startMcpSseServer({ host: '0.0.0.0', port: 0, cwd: repoRoot })
      .then((value) => ({ value }), (error: unknown) => ({ error }));
    if ('value' in started) {
      await new Promise<void>((resolve, reject) => started.value.server.close((error) => error ? reject(error) : resolve()));
    }
    expect('error' in started).toBe(true);
    if ('error' in started) expect(String(started.error)).toMatch(/loopback/i);
  }, 30_000);
});
