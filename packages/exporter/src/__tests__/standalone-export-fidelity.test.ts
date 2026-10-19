import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync, spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import type { ProjectManifest } from '@tessellate/schemas';
import { validProjectFixture } from '@tessellate/schemas';
import { appendGoldResourceVariantParityNodes, appendRendererParityNodes } from '@tessellate/testing';
import { generateSourceTree } from '../source-tree.js';
import '../node-disk-resolver.js';



describe('Requirement 8: Standalone Export Fidelity', () => {
  const testProject: ProjectManifest = {
    ...validProjectFixture,
    id: 'proj-export-fidelity',
    name: 'Omni Telemetry Suite',
    description: 'High-fidelity standalone test project with 8 distinct architectural components',
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
            // 8. Resource props and nested ProjectNode children must reach the same output.
            {
              id: 'node-canvas-content',
              nodeType: 'component',
              semanticRole: 'workspace-canvas',
              resourceRef: {
                id: 'res-canvas-content',
                slug: 'canvas-workspace-shell',
                version: '1.0.0',
              },
              variant: 'expressive',
              props: { children: 'Content from resource props' },
              slots: {},
              children: [
                {
                  id: 'node-nested-content',
                  nodeType: 'element',
                  semanticRole: 'content',
                  props: { children: 'Content from nested manifest node' },
                  slots: {},
                  children: [],
                },
              ],
            },
          ],
        },
      },
    ],
  };

  it('resolves actual resource files for all 8 components and preserves variants, slots, and both child sources', () => {
    const sourceTree = generateSourceTree(testProject);

    // 1. Verify component files are resolved from disk and emitted to src/components
    expect(sourceTree['src/components/MinimalTopNav.tsx']).toBeDefined();
    expect(sourceTree['src/components/CinematicMediaHero.tsx']).toBeDefined();
    expect(sourceTree['src/components/AreaChart.tsx']).toBeDefined();
    expect(sourceTree['src/components/CompactDataTable.tsx']).toBeDefined();
    expect(sourceTree['src/components/EmptyDashboardState.tsx']).toBeDefined();
    expect(sourceTree['src/components/InteractiveGlobe.tsx']).toBeDefined();
    expect(sourceTree['src/components/ParticleConstellation.tsx']).toBeDefined();
    expect(sourceTree['src/components/CanvasWorkspaceShell.tsx']).toBeDefined();

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
    expect(screenCode).toContain("import { CanvasWorkspaceShell } from '../components/CanvasWorkspaceShell';");

    // 3. Verify screen renders each component preserving variants and slots
    expect(screenCode).toContain('<MinimalTopNav variant={"nocturne"} brand={"Omni Telemetry"} />');
    expect(screenCode).toContain('<CinematicMediaHero variant={"nocturne"}');
    expect(screenCode).toContain('title={"Real-Time Planetary Infrastructure"}');
    expect(screenCode).toContain('<AreaChart variant={"nocturne"} />');
    expect(screenCode).toContain('<CompactDataTable variant={"nocturne"} />');
    expect(screenCode).toContain('<EmptyDashboardState variant={"nocturne"} />');
    expect(screenCode).toContain('<InteractiveGlobe variant={"nocturne"} />');
    expect(screenCode).toContain('<ParticleConstellation variant={"nocturne"} />');
    expect(screenCode).toContain('Content from resource props');
    expect(screenCode).toContain('Content from nested manifest node');

    const slotProject = JSON.parse(JSON.stringify(testProject)) as ProjectManifest;
    const slotNode = slotProject.screens[0]!.rootNode.children.find((node) => node.id === 'node-canvas-content')!;
    slotNode.props = {};
    slotNode.slots = { children: 'Content from declared resource slot' };
    const slotScreenCode = generateSourceTree(slotProject)['src/screens/Dashboard.tsx'];
    expect(slotScreenCode).toContain('Content from declared resource slot');
    expect(slotScreenCode).toContain('Content from nested manifest node');

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

  it('rejects an unsupported resource variant instead of exporting a component fallback style', () => {
    const invalidVariantProject: ProjectManifest = {
      ...testProject,
      screens: testProject.screens.map((screen) => ({
        ...screen,
        rootNode: {
          ...screen.rootNode,
          children: screen.rootNode.children.map((node) => node.id === 'node-canvas-content'
            ? { ...node, variant: 'unsupported-variant' }
            : node),
        },
      })),
    };

    expect(() => generateSourceTree(invalidVariantProject)).toThrowError(
      /Unsupported variant "unsupported-variant" for resource "canvas-workspace-shell"/
    );
  });

  it('rejects unsupported variants for the built-in Button resolver in Vite and Next exports', () => {
    const invalidButtonProject: ProjectManifest = structuredClone(testProject);
    invalidButtonProject.screens[0]!.rootNode.children.push({
      id: 'node-invalid-button-variant',
      nodeType: 'component',
      semanticRole: 'action-button',
      resourceRef: { id: 'res_primitive_button_01', slug: 'button', version: '1.0.0' },
      variant: 'unsupported-variant',
      props: { children: 'Unsupported variant action' },
      slots: {},
      children: [],
    });

    const expectedError = /Unsupported variant "unsupported-variant" for resource "button"\. Supported variants: quiet, expressive, nocturne\./;
    expect(() => generateSourceTree(invalidButtonProject)).toThrowError(expectedError);
    expect(() => generateSourceTree(invalidButtonProject, { target: 'nextjs' })).toThrowError(expectedError);
  });

  it('generates every Gold resource variant from its canonical manifest without fallback nodes', () => {
    const project = appendGoldResourceVariantParityNodes(testProject);
    const sourceTree = generateSourceTree(project);
    const screenCode = sourceTree['src/screens/Dashboard.tsx'];

    expect(screenCode).toBeDefined();
    for (const node of project.screens[0]!.rootNode.children.filter((item) => item.id.startsWith('gold-parity-'))) {
      expect(screenCode, `${node.resourceRef?.slug}/${node.variant}`).toContain(node.id);
      expect(screenCode, `${node.resourceRef?.slug}/${node.variant}`).toContain(`data-resource-variant={${JSON.stringify(node.variant)}}`);
    }
  });

  it('builds standalone project with real pnpm install and verifies interactive execution in Playwright via vite preview', async () => {
    const parityProject = appendRendererParityNodes(appendGoldResourceVariantParityNodes(testProject));
    const additionalScreens = Array.from({ length: 8 }, (_, index) => {
      const screen = structuredClone(parityProject.screens[0]!);
      const suffix = index + 1;
      screen.id = `screen-workspace-${suffix}`;
      screen.screenNodeId = `root-workspace-${suffix}`;
      screen.name = `Workspace ${suffix}`;
      screen.slug = `workspace-${suffix}`;
      screen.rootNode = { ...screen.rootNode, id: `root-workspace-${suffix}`, children: [] };
      return screen;
    });
    const screenNavigationProject: ProjectManifest = {
      ...parityProject,
      screens: [...parityProject.screens, ...additionalScreens],
      navigation: {
        ...parityProject.navigation,
        primaryItems: [
          ...parityProject.navigation.primaryItems,
          ...additionalScreens.map((screen) => ({ label: screen.name, targetScreenId: screen.id })),
        ],
      },
    };
    screenNavigationProject.screens[0]!.rootNode.children.unshift(
      {
        id: 'export-user-authored-header',
        nodeType: 'component',
        semanticRole: 'navigation-header',
        props: { title: `People's "Today" < overview` },
        slots: {},
        children: [],
      },
      {
        id: 'export-user-authored-metric',
        nodeType: 'component',
        semanticRole: 'metric-kpi',
        props: { title: `People's "headcount"`, value: '500 employees', change: '+8% this month' },
        slots: {},
        children: [],
      },
      {
        id: 'export-user-authored-action',
        nodeType: 'component',
        semanticRole: 'action-button',
        props: { label: `Invite "a colleague"` },
        slots: {},
        children: [],
      },
      {
        id: 'export-user-authored-status',
        nodeType: 'component',
        semanticRole: 'status-indicator',
        props: { className: 'sample-status', children: 'New hires < starting this week & ready' },
        slots: {},
        children: [],
      },
    );
    const sourceTree = generateSourceTree(screenNavigationProject);

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
      try {
        execSync('pnpm build', {
          cwd: tempDir,
          stdio: 'pipe',
        });
      } catch (cause) {
        const error = cause as { stdout?: Buffer | string; stderr?: Buffer | string };
        throw new Error(`Clean standalone build failed:\n${String(error.stdout ?? '')}\n${String(error.stderr ?? '')}`);
      }

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
        await page.setViewportSize({ width: 1440, height: 900 });
        const consoleErrors: string[] = [];
        const failedRequests: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));
        page.on('response', (response) => {
          if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
        });

        await page.goto(`http://localhost:${port}`);
        await page.waitForSelector('#root', { timeout: 10000 });

        // 5. Assert the application renders interactively
        const headline = page.locator('text=Real-Time Planetary Infrastructure').first();
        expect(await headline.isVisible()).toBe(true);

        const navBrand = page.locator('text=Omni Telemetry').first();
        expect(await navBrand.isVisible()).toBe(true);

        expect(await page.getByText('Content from resource props').first().isVisible()).toBe(true);
        expect(await page.getByText('Content from nested manifest node').first().isVisible()).toBe(true);
        expect(await page.getByText(`People's "Today" < overview`, { exact: true }).isVisible()).toBe(true);
        expect(await page.getByText(`People's "headcount"`, { exact: true }).isVisible()).toBe(true);
        expect(await page.getByText('500 employees', { exact: true }).isVisible()).toBe(true);
        expect(await page.getByRole('button', { name: `Invite "a colleague"`, exact: true }).isVisible()).toBe(true);
        expect(await page.getByText('New hires < starting this week & ready', { exact: true }).isVisible()).toBe(true);
        expect(await page.locator('#root script').count()).toBe(0);
        const trackingAction = page.locator('[data-tracking-id="parity-action"]');
        if (await trackingAction.count() === 0) {
          const beforeDataAttributeFix = path.resolve(process.cwd(), 'audit/evidence/step-07/before/export-data-attribute-dropped.png');
          fs.mkdirSync(path.dirname(beforeDataAttributeFix), { recursive: true });
          await page.screenshot({ path: beforeDataAttributeFix, fullPage: true });
        }
        expect(await trackingAction.isVisible()).toBe(true);
        const trackingScreenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/export-data-attribute-preserved.png');
        fs.mkdirSync(path.dirname(trackingScreenshot), { recursive: true });
        await trackingAction.screenshot({ path: trackingScreenshot });

        for (const node of parityProject.screens[0]!.rootNode.children.filter((item) => item.id.startsWith('gold-parity-'))) {
          const rendered = page.locator(`[data-node-id="${node.id}"]`);
          expect(await rendered.count(), `Export ${node.resourceRef?.slug}/${node.variant}`).toBe(1);
          expect(await rendered.getAttribute('data-resource-variant')).toBe(node.variant);
          expect(await rendered.locator('[data-testid="unsupported-resource-variant"]').count()).toBe(0);
        }
        const selfManagedDialog = page.locator('[data-node-id="gold-parity-dialog-quiet"]');
        const dialog = selfManagedDialog.getByRole('dialog');
        expect(await dialog.isVisible()).toBe(true);
        const dialogScreenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/export-dialog-open-1440.png');
        fs.mkdirSync(path.dirname(dialogScreenshot), { recursive: true });
        await dialog.screenshot({ path: dialogScreenshot });
        await page.keyboard.press('Escape');
        expect(await dialog.count()).toBe(0);
        await page.evaluate(() => window.scrollTo(0, 0));
        const authoredCopyScreenshot = path.resolve(process.cwd(), 'quality/evidence/step-23/after/user-authored-semantic-copy-desktop-1440.png');
        fs.mkdirSync(path.dirname(authoredCopyScreenshot), { recursive: true });
        await page.screenshot({ path: authoredCopyScreenshot });

        const hiddenOnMobile = page.locator('[data-node-id="parity-mobile-omit"]');
        const stackedOnMobile = page.locator('[data-node-id="parity-mobile-stack"]');
        const collapsedOnMobile = page.locator('[data-node-id="parity-mobile-collapse"]');
        expect(await hiddenOnMobile.isVisible()).toBe(true);
        const screenshotPath = path.resolve(process.cwd(), 'audit/evidence/step-07/after/standalone-export-gold-children.png');
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await page.locator('[data-node-id="node-canvas-content"]').screenshot({ path: screenshotPath });

        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => window.scrollTo(0, 0));
        const projectScreenNavigation = page.locator('[aria-label="Project screens"]');
        const projectScreenNavigationMetrics = await projectScreenNavigation.evaluate((element) => ({
          flexWrap: getComputedStyle(element).flexWrap,
          height: element.getBoundingClientRect().height,
        }));
        if (projectScreenNavigationMetrics.flexWrap !== 'nowrap' || projectScreenNavigationMetrics.height > 48) {
          const beforeNavigationScreenshot = path.resolve(
            process.cwd(),
            'audit/evidence/step-07/before/export-project-navigation-wraps-390.png'
          );
          fs.mkdirSync(path.dirname(beforeNavigationScreenshot), { recursive: true });
          await page.screenshot({ path: beforeNavigationScreenshot });
        }
        expect(projectScreenNavigationMetrics.flexWrap, 'the exported screen selector must stay on one mobile row').toBe('nowrap');
        expect(projectScreenNavigationMetrics.height, 'the exported screen selector must not consume multiple mobile rows').toBeLessThanOrEqual(48);
        const afterNavigationScreenshot = path.resolve(
          process.cwd(),
          'audit/evidence/step-07/after/export-project-navigation-mobile-390.png'
        );
        fs.mkdirSync(path.dirname(afterNavigationScreenshot), { recursive: true });
        await page.screenshot({ path: afterNavigationScreenshot });

        const hiddenOnMobileIsVisible = await hiddenOnMobile.isVisible();
        if (hiddenOnMobileIsVisible) {
          const beforeResponsiveFix = path.resolve(process.cwd(), 'audit/evidence/step-07/before/export-responsive-override-visible.png');
          fs.mkdirSync(path.dirname(beforeResponsiveFix), { recursive: true });
          await page.screenshot({ path: beforeResponsiveFix, fullPage: true });
        }
        expect(hiddenOnMobileIsVisible).toBe(false);
        expect(await stackedOnMobile.evaluate((element) => getComputedStyle(element).flexDirection)).toBe('column');
        expect(await collapsedOnMobile.evaluate((element) => getComputedStyle(element).overflowY)).toBe('hidden');
        await page.evaluate(() => window.scrollTo(0, 0));
        const authoredCopyMobileScreenshot = path.resolve(process.cwd(), 'quality/evidence/step-23/after/user-authored-semantic-copy-mobile-390.png');
        await page.screenshot({ path: authoredCopyMobileScreenshot });

        const responsiveScreenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/standalone-export-gold-responsive-390.png');
        await page.locator('[data-node-id="parity-mobile-stack"]').screenshot({ path: responsiveScreenshot });

        await page.getByRole('button', { name: 'Workspace 1', exact: true }).click();
        expect(page.url()).toContain('#screen-workspace-1');

        // 6. Assert no console errors
        expect(consoleErrors).toEqual([]);
        expect(failedRequests).toEqual([]);
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
  }, 240000);
});
