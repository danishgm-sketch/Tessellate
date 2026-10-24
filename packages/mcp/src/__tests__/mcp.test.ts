import { describe, expect, it } from 'vitest';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMcpServer } from '../index.js';
import { findResourceBySlug, loadMcpCatalogue } from '../catalog-provider.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('MCP server setup', () => {
  it('creates the MCP server used by the real-client transport tests', () => {
    expect(createMcpServer({ cwd: repoRoot })).toBeDefined();
  });

  it('loads the validated catalogue and resolves canonical resource slugs', async () => {
    const catalogue = await loadMcpCatalogue(repoRoot);
    expect(catalogue.resources).toHaveLength(324);

    const button = await findResourceBySlug('@tess/button', repoRoot);
    expect(button).toMatchObject({ slug: 'button', name: 'Button' });
  });
});
