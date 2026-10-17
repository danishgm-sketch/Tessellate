import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync, spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import type { ProjectManifest } from '@tessellate/schemas';
import { validProjectFixture } from '@tessellate/schemas';
import { generateSourceTree } from '../source-tree.js';
import '../node-disk-resolver.js';



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
    expect(screenCode).toContain('<MinimalTopNav variant={"nocturne"} brand={"Omni Telemetry"} />');
    expect(screenCode).toContain('<CinematicMediaHero variant={"nocturne"}');
    expect(screenCode).toContain('title={"Real-Time Planetary Infrastructure"}');
    expect(screenCode).toContain('<AreaChart variant={"nocturne"} />');
    expect(screenCode).toContain('<CompactDataTable variant={"nocturne"} />');
    expect(screenCode).toContain('<EmptyDashboardState variant={"nocturne"} />');
    expect(screenCode).toContain('<InteractiveGlobe variant={"nocturne"} />');
    expect(screenCode).toContain('<ParticleConstellation variant={"nocturne"} />');

    // 4. Verify no runtime dependency on @tessellate packages
    const pkg = JSON.parse(sourceTree['package.json']!);
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    for (const dep of Object.keys(allDeps)) {
      expect(dep.startsWith('@tessellate/')).toBe(false);
    }
  });

  it('fails with a descriptive error when a referenced resource is genuinely unresolved', () => {
    const invalidProject: ProjectManifest = {
      ...testProject,
      screens: [
        {
          ...testProject.screens[0]!,
          rootNode: {
            ...testProject.screens[0]!.rootNode,
            children: [
              {
                id: 'node-bogus',
                nodeType: 'component',
                semanticRole: 'unknown',
                resourceRef: {
                  id: 'res-bogus',
                  slug: 'bogus-nonexistent-resource',
                  version: '1.0.0',
                },
                props: {},
                slots: {},
                children: [],
              },
            ],
          },
        },
      ],
    };

    expect(() => generateSourceTree(invalidProject)).toThrowError(
      /Unresolved resource in export: "bogus-nonexistent-resource"/
    );
  });

  it('builds standalone project with real pnpm install and verifies interactive execution in Playwright via vite preview', async () => {
    const sourceTree = generateSourceTree(testProject);

    // Create a temporary export directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-export-live-'));
    let previewProcess: ReturnType<typeof spawn> | null = null;

    try {
      for (const [filePath, content] of Object.entries(sourceTree)) {
        const fullPath = path.join(tempDir, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
      }

      // 1. Execute real package manager install
      execSync('pnpm install --prefer-offline --ignore-scripts', {
        cwd: tempDir,
        stdio: 'pipe',
      });

      // 2. Execute pnpm build
      execSync('pnpm build', {
        cwd: tempDir,
        stdio: 'pipe',
      });

      // 3. Launch resulting preview server using vite preview
      const port = 4192;
      const viteCli = path.join(tempDir, 'node_modules', 'vite', 'bin', 'vite.js');
      previewProcess = spawn(process.execPath, [viteCli, 'preview', '--port', String(port), '--strictPort'], {
        cwd: tempDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const proc = previewProcess;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for vite preview server to start on port ' + port));
        }, 15000);

        proc.stdout?.on('data', (data: Buffer) => {
          const str = data.toString();
          if (str.includes(String(port)) || str.includes('Local:')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        proc.stderr?.on('data', (data: Buffer) => {
          const str = data.toString();
          if (str.includes(String(port)) || str.includes('Local:')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        proc.on('error', (err: Error) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      // 4. Open with Playwright
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage();
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        await page.goto(`http://localhost:${port}`);
        await page.waitForSelector('#root', { timeout: 10000 });

        // 5. Assert the application renders interactively
        const headline = page.locator('text=Real-Time Planetary Infrastructure').first();
        expect(await headline.isVisible()).toBe(true);

        const navBrand = page.locator('text=Omni Telemetry').first();
        expect(await navBrand.isVisible()).toBe(true);

        // 6. Assert no console errors
        expect(consoleErrors).toEqual([]);
      } finally {
        await browser.close();
      }
    } finally {
      // 7. Shut down cleanly
      if (previewProcess) {
        try {
          if (process.platform === 'win32' && previewProcess.pid) {
            execSync(`taskkill /pid ${previewProcess.pid} /T /F`, { stdio: 'ignore' });
          } else {
            previewProcess.kill('SIGTERM');
          }
        } catch {
          // ignore
        }
      }
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }, 120000);
});
