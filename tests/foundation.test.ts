import { describe, it, expect } from 'vitest';
import { SCHEMA_VERSION } from '@tessellate/schemas';
import { UI_VERSION } from '@tessellate/ui';
import { CATALOG_VERSION } from '@tessellate/catalog';
import { DNA_VERSION } from '@tessellate/dna';
import { COMPOSER_VERSION } from '@tessellate/composer';
import { COMPATIBILITY_VERSION } from '@tessellate/compatibility';
import { RENDERER_VERSION } from '@tessellate/renderer';
import { WORKBENCH_VERSION } from '@tessellate/workbench';
import { EXPORTER_VERSION } from '@tessellate/exporter';
import { REGISTRY_VERSION } from '@tessellate/registry';
import { MCP_VERSION } from '@tessellate/mcp';

describe('Tessellate Monorepo Foundation', () => {
  it('exports canonical package versions across all packages', () => {
    expect(SCHEMA_VERSION).toBe('1.0.0');
    expect(UI_VERSION).toBe('0.1.0');
    expect(CATALOG_VERSION).toBe('0.1.0');
    expect(DNA_VERSION).toBe('0.1.0');
    expect(COMPOSER_VERSION).toBe('0.1.0');
    expect(COMPATIBILITY_VERSION).toBe('0.1.0');
    expect(RENDERER_VERSION).toBe('0.1.0');
    expect(WORKBENCH_VERSION).toBe('0.1.0');
    expect(EXPORTER_VERSION).toBe('0.1.0');
    expect(REGISTRY_VERSION).toBe('0.1.0');
    expect(MCP_VERSION).toBe('0.1.0');
  });
});
