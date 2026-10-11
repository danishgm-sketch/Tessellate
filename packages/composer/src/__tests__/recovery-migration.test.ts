import { describe, it, expect } from 'vitest';
import { recoverProjectManifest, migrateManifestVersion } from '../recovery.js';
import { ProjectManifestSchema, validProjectFixture } from '@tessellate/schemas';

describe('Project Manifest Recovery & Safe Mode (AGENTS.md Section 12)', () => {
  it('passes directly valid project manifests without alteration', () => {
    const result = recoverProjectManifest(validProjectFixture);
    expect(result.status).toBe('valid');
    expect(result.repairedIssues).toHaveLength(0);
    expect(result.manifest.name).toBe(validProjectFixture.name);
  });

  it('safely repairs manifests with missing schema URL, DNA fields, or missing screens', () => {
    const legacyOrIncomplete = {
      name: 'Legacy Project',
      screens: [{ id: 's1' }],
    };

    const result = recoverProjectManifest(legacyOrIncomplete);
    expect(result.status).toBe('recovered');
    expect(result.repairedIssues.length).toBeGreaterThan(0);
    expect(result.manifest.name).toBe('Legacy Project');
    expect(result.manifest.screens).toHaveLength(1);
    expect(result.manifest.screens[0]!.slug).toBe('screen-1');
    expect(result.manifest.designDNA.accessibilityPriority).toBe(80);

    // Verify recovered manifest parses against canonical schema
    const parseCheck = ProjectManifestSchema.safeParse(result.manifest);
    expect(parseCheck.success).toBe(true);
  });

  it('enters recoverable safe mode when input is completely corrupt JSON while preserving raw data', () => {
    const corruptJson = '{"name": "Broken project", truncated...';

    const result = recoverProjectManifest(corruptJson);
    expect(result.status).toBe('safe_mode');
    expect(result.rawRecord).toBe(corruptJson);
    expect(result.safeModeMessage).toBeDefined();
    expect(result.manifest).toBeDefined();
    expect(result.manifest.screens.length).toBeGreaterThan(0);

    // Guaranteed zero data loss: user raw text is fully preserved
    expect(result.rawRecord).toContain('Broken project');
  });

  it('migrateManifestVersion backfills all 30 DNA dimensions and graph structures consistently', () => {
    const migrated = migrateManifestVersion({
      name: 'Partial DNA',
      designDNA: { professionalism: 99 },
    });

    const dna = migrated.designDNA as Record<string, unknown>;
    expect(dna.professionalism).toBe(99);
    expect(dna.accessibilityPriority).toBe(80);
    expect(migrated.screenGraph).toBeDefined();
    expect(migrated.navigation).toBeDefined();
  });
});
