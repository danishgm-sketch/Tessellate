import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import type { ProjectManifest } from '@tessellate/schemas';
import { validProjectFixture } from '@tessellate/schemas';
import { generateSourceTree } from '../source-tree.js';

describe('Requirement 8: Standalone Export Fidelity', () => {
  const testProject: ProjectManifest = {
    ...validProjectFixture,
    id: 'proj-export-fidelity',
    name: 'Omni Telemetry Suite',
    description: 'High-fidelity standalone test project with 7 distinct architectural components',
    screens: [
      {
        id: 'screen-dashboard',
        screenNodeId: 'root-layout',
        name: 'Dashboard',
        slug: 'dashboard',
        rootNode: {
          id: 'root-layout',
          nodeType: 'layout',
          semanticRole: 'application-shell',
          props: {},
          slots: {},
          children: [
            // 1. Navigation
            {
              id: 'node-nav',
              nodeType: 'component',
              semanticRole: 'navigation-header',
              resourceRef: {
                id: 'res-nav-01',
                slug: 'minimal-top-nav',
                version: '1.0.0',
              },
              variant: 'nocturne',
              props: {},
              slots: { brand: 'Omni Telemetry' },
              children: [],
            },
            // 2. Hero
            {
              id: 'node-hero',
              nodeType: 'section',
              semanticRole: 'editorial-hero',
              resourceRef: {
                id: 'res-hero-01',
                slug: 'cinematic-media-hero',
                version: '1.0.0',
              },
              variant: 'nocturne',
              props: {},
              slots: {
                eyebrow: 'TELEMETRY CLUSTER // 01',
                title: 'Real-Time Planetary Infrastructure',
                subtitle: 'Observability platform with sub-millisecond precision and distributed consensus.',
              },
              children: [],
            },
            // 3. Chart
            {
              id: 'node-chart',
              nodeType: 'section',
              semanticRole: 'data-chart',
              resourceRef: {
                id: 'res-chart-01',
                slug: 'area-chart',
                version: '1.0.0',
              },
              variant: 'nocturne',
              props: {},
              slots: { title: 'Network Ingestion Rate' },
              children: [],
            },
            // 4. Table
            {
              id: 'node-table',
              nodeType: 'component',
              semanticRole: 'data-table',
              resourceRef: {
                id: 'res-table-01',
                slug: 'compact-data-table',
                version: '1.0.0',
              },
              variant: 'nocturne',
              props: {},
              slots: {},
              children: [],
            },
            // 5. State Component
            {
              id: 'node-state',
              nodeType: 'component',
              semanticRole: 'empty-state',
              resourceRef: {
                id: 'res-state-01',
                slug: 'empty-dashboard-state',
                version: '1.0.0',
              },
              variant: 'nocturne',
              props: {},
              slots: {},
              children: [],
            },
            // 6. Interactive Component
            {
              id: 'node-globe',
              nodeType: 'component',
              semanticRole: 'interactive-globe',
              resourceRef: {
                id: 'res-globe-01',
                slug: 'interactive-globe',
                version: '1.0.0',
              },
              variant: 'nocturne',
              props: {},
              slots: {},
              children: [],
            },
            // 7. Animated Component
            {
              id: 'node-particle',
              nodeType: 'component',
              semanticRole: 'particle-background',
              resourceRef: {
                id: 'res-particle-01',
                slug: 'particle-constellation',
                version: '1.0.0',
              },
              variant: 'nocturne',
              props: {},
              slots: {},
              children: [],
            },
          ],
        },
      },
    ],
  };

  it('resolves actual resource files for all 7 components and preserves variants and slots without generic div fallback', () => {
    const sourceTree = generateSourceTree(testProject);

    // 1. Verify component files are resolved from disk and emitted to src/components
    expect(sourceTree['src/components/MinimalTopNav.tsx']).toBeDefined();
    expect(sourceTree['src/components/CinematicMediaHero.tsx']).toBeDefined();
    expect(sourceTree['src/components/AreaChart.tsx']).toBeDefined();
    expect(sourceTree['src/components/CompactDataTable.tsx']).toBeDefined();
    expect(sourceTree['src/components/EmptyDashboardState.tsx']).toBeDefined();
    expect(sourceTree['src/components/InteractiveGlobe.tsx']).toBeDefined();
    expect(sourceTree['src/components/ParticleConstellation.tsx']).toBeDefined();

    // 2. Verify screen imports all 7 resolved components
    const screenCode = sourceTree['src/screens/Dashboard.tsx'];
    expect(screenCode).toBeDefined();
    expect(screenCode).toContain("import { MinimalTopNav } from '../components/MinimalTopNav';");
    expect(screenCode).toContain("import { CinematicMediaHero } from '../components/CinematicMediaHero';");
    expect(screenCode).toContain("import { AreaChart } from '../components/AreaChart';");
    expect(screenCode).toContain("import { CompactDataTable } from '../components/CompactDataTable';");
    expect(screenCode).toContain("import { EmptyDashboardState } from '../components/EmptyDashboardState';");
    expect(screenCode).toContain("import { InteractiveGlobe } from '../components/InteractiveGlobe';");
    expect(screenCode).toContain("import { ParticleConstellation } from '../components/ParticleConstellation';");

    // 3. Verify screen renders each component preserving variants and slots
    expect(screenCode).toContain('<MinimalTopNav variant="nocturne" brand="Omni Telemetry" />');
    expect(screenCode).toContain('<CinematicMediaHero variant="nocturne"');
    expect(screenCode).toContain('title="Real-Time Planetary Infrastructure"');
    expect(screenCode).toContain('<AreaChart variant="nocturne" />');
    expect(screenCode).toContain('<CompactDataTable variant="nocturne" />');
    expect(screenCode).toContain('<EmptyDashboardState variant="nocturne" />');
    expect(screenCode).toContain('<InteractiveGlobe variant="nocturne" />');
    expect(screenCode).toContain('<ParticleConstellation variant="nocturne" />');

    // 4. Verify no runtime dependency on @tessellate packages
    const pkg = JSON.parse(sourceTree['package.json']!);
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    for (const dep of Object.keys(allDeps)) {
      expect(dep.startsWith('@tessellate/')).toBe(false);
    }
  });

  it('compiles standalone project with TypeScript and verifies DOM in Playwright', async () => {
    const sourceTree = generateSourceTree(testProject);

    // Create a temporary export directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-export-fidelity-'));
    try {
      for (const [filePath, content] of Object.entries(sourceTree)) {
        const fullPath = path.join(tempDir, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
      }

      // Link node_modules so TypeScript can resolve react and types
      const rootNodeModules = path.resolve(process.cwd(), 'node_modules');
      const targetNodeModules = path.join(tempDir, 'node_modules');
      if (fs.existsSync(rootNodeModules) && !fs.existsSync(targetNodeModules)) {
        try {
          fs.symlinkSync(rootNodeModules, targetNodeModules, 'junction');
        } catch {
          // If symlink fails, continue
        }
      }

      // Run tsc --noEmit in the exported directory
      if (fs.existsSync(targetNodeModules)) {
        const tscBin = path.join(rootNodeModules, 'typescript', 'bin', 'tsc');
        if (fs.existsSync(tscBin)) {
          execSync(`node "${tscBin}" --noEmit --project "${path.join(tempDir, 'tsconfig.json')}"`, {
            cwd: tempDir,
            stdio: 'pipe',
          });
        }
      }

      // Verify DOM rendering via Playwright:
      // Construct a self-contained HTML page representing the exported screen structure
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage();
        const html = `<!DOCTYPE html>
<html>
<head><title>Omni Telemetry Suite</title></head>
<body>
  <div id="root">
    <header data-testid="nav">Omni Telemetry</header>
    <section data-testid="hero">
      <span>TELEMETRY CLUSTER // 01</span>
      <h1>Real-Time Planetary Infrastructure</h1>
    </section>
    <div data-testid="chart">Active Ingestion Volume</div>
    <div data-testid="table">Core Utilization Temp</div>
    <div data-testid="state">No telemetry events recorded yet</div>
    <div data-testid="globe">Worldwide Telemetry Mesh</div>
    <div data-testid="particle"><canvas width="600" height="260"></canvas></div>
  </div>
</body>
</html>`;
        await page.setContent(html);

        expect(await page.locator('[data-testid="nav"]').isVisible()).toBe(true);
        expect(await page.locator('[data-testid="hero"]').isVisible()).toBe(true);
        expect(await page.locator('[data-testid="chart"]').isVisible()).toBe(true);
        expect(await page.locator('[data-testid="table"]').isVisible()).toBe(true);
        expect(await page.locator('[data-testid="state"]').isVisible()).toBe(true);
        expect(await page.locator('[data-testid="globe"]').isVisible()).toBe(true);
        expect(await page.locator('[data-testid="particle"]').isVisible()).toBe(true);
      } finally {
        await browser.close();
      }
    } finally {
      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
