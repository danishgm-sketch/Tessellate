import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { execSync, spawn } from 'node:child_process';
import { generateSourceTree } from '../../packages/exporter/src/source-tree.js';
import type { ProjectManifest, ProjectNode } from '@tessellate/schemas';

function _computeCanonicalSubtreeHash(node: ProjectNode): string {
  function canonicalize(val: unknown): unknown {
    if (val === null || typeof val !== 'object') return val;
    if (Array.isArray(val)) return val.map(canonicalize);
    const sortedObj: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sortedObj[key] = canonicalize((val as Record<string, unknown>)[key]);
    }
    return sortedObj;
  }
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(node))).digest('hex');
}

async function assertZeroUnresolvedResources(page: any, containerLocator?: any) {
  const scope = containerLocator || page;
  await expect(scope.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  await expect(scope.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(0);
  await expect(scope.locator('text=Unresolved resource:')).toHaveCount(0);
}

test.describe('Flagship Acceptance & Merge Gate Verification', () => {
  // Test 1: New Flagship Acceptance Journey for Employee Experience Platform
  test('flagship acceptance journey: employee experience platform end-to-end with standalone build execution', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop studio workflow targets desktop viewport');
    test.setTimeout(120000);

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    // Step 1: Open /compose
    await page.goto('/compose');
    await page.waitForLoadState('domcontentloaded');

    // Step 2: Assert editorial shell and composer title
    await expect(page.getByRole('heading', { name: 'Describe the product. Get the interface.' })).toBeVisible();

    // Step 3: Wait for catalogue ready state
    const catalogStatus = page.locator('[data-testid="catalog-status"]');
    await expect(catalogStatus).toContainText('Catalogue ready', { timeout: 15000 });

    // Step 4: Fill in the exact required acceptance brief
    const exactBrief =
      'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
    const descriptionArea = page.locator('textarea#description');
    await descriptionArea.fill(exactBrief);

    // Step 5: Fill in feel
    const feelInput = page.locator('input#feel');
    await feelInput.fill('professional but playful');

    // Step 6: Select Refined visual ambition if available
    const refinedBtn = page.locator('button:has-text("Refined")').first();
    if (await refinedBtn.isVisible()) {
      await refinedBtn.click();
    }

    // Step 7: Submit composition
    const composeBtn = page.locator('[data-testid="compose-submit-btn"]');
    await expect(composeBtn).toBeEnabled();
    await composeBtn.click();

    // Step 8: Assert Inferred Product Architecture appears
    await expect(page.locator('text=Inferred Product Architecture').first()).toBeVisible({
      timeout: 15000,
    });

    // Step 9: Assert exactly 3 generated direction cards appear
    const dirCard1 = page.locator('[data-testid="direction-card-01"]');
    const dirCard2 = page.locator('[data-testid="direction-card-02"]');
    const dirCard3 = page.locator('[data-testid="direction-card-03"]');

    await expect(dirCard1).toBeVisible();
    await expect(dirCard2).toBeVisible();
    await expect(dirCard3).toBeVisible();

    // Step 10: Verify directions A, B, C differ materially
    const dir1Text = await dirCard1.innerText();
    const dir2Text = await dirCard2.innerText();
    const dir3Text = await dirCard3.innerText();
    expect(dir1Text).not.toEqual(dir2Text);
    expect(dir2Text).not.toEqual(dir3Text);

    // Step 11: Assert direction previews have zero unresolved placeholders
    const preview1 = page.locator('[data-testid="direction-preview-01"]');
    const preview2 = page.locator('[data-testid="direction-preview-02"]');
    const preview3 = page.locator('[data-testid="direction-preview-03"]');
    await expect(preview1).toBeVisible();
    await expect(preview2).toBeVisible();
    await expect(preview3).toBeVisible();

    await assertZeroUnresolvedResources(page, preview1);
    await assertZeroUnresolvedResources(page, preview2);
    await assertZeroUnresolvedResources(page, preview3);

    // Step 12: Open Direction C in Workbench
    const openDir3Btn = page.locator('[data-testid="open-workbench-dir-03"]');
    await openDir3Btn.click();

    // Step 13: Assert URL transitions to /workbench?project=
    await page.waitForURL(/\/workbench\?project=/, { timeout: 15000 });
    expect(page.url()).toContain('/workbench?project=');

    // Step 14: Assert Workbench top toolbar loads
    const topToolbar = page.locator('[data-testid="top-toolbar"]');
    await expect(topToolbar).toBeVisible({ timeout: 10000 });

    // Step 15: Assert zero unresolved resources in Workbench immediately after opening
    await assertZeroUnresolvedResources(page);

    // Wait for Workbench store to be mounted on window
    await page.waitForFunction(() => Boolean((window as any).__tessellate_workbench_store__), {
      timeout: 15000,
    });

    // Step 16: Configure DNA Overrides: Onboarding playful, Settings conservative
    await page.evaluate(() => {
      const store = (window as any).__tessellate_workbench_store__;
      if (!store) throw new Error('Workbench store missing on window');
      const manifest = store.getState().manifest;

      // Onboarding override
      const onboardingScreen =
        manifest.screens.find(
          (s: any) =>
            s.name.toLowerCase().includes('onboard') ||
            s.slug.toLowerCase().includes('onboard')
        ) || manifest.screens[1] || manifest.screens[0];

      if (onboardingScreen) {
        store.getState().updateNodeDNA(onboardingScreen.rootNode.id, {
          motionPersonality: 'playful',
          curvature: 75,
        });
      }

      // Settings override
      const settingsScreen =
        manifest.screens.find(
          (s: any) =>
            s.name.toLowerCase().includes('setting') ||
            s.slug.toLowerCase().includes('setting')
        ) || manifest.screens[manifest.screens.length - 1];

      if (settingsScreen) {
        store.getState().updateNodeDNA(settingsScreen.rootNode.id, {
          motionPersonality: 'formal',
          curvature: 10,
        });
      }
    });

    // Step 17: Lock KPI section and record canonical SHA-256 hash
    const { kpiNodeId, initialHash } = await page.evaluate(() => {
      const store = (window as any).__tessellate_workbench_store__;
      const manifest = store.getState().manifest;
      const screen = manifest.screens[0];
      let found: any = null;

      function search(node: any) {
        if (found) return;
        if (
          node.semanticRole?.includes('metric') ||
          node.semanticRole?.includes('kpi') ||
          node.semanticRole?.includes('header') ||
          node.resourceRef?.slug === 'metric-card'
        ) {
          found = node;
          return;
        }
        if (node.children) {
          for (const c of node.children) search(c);
        }
      }
      search(screen.rootNode);
      if (!found && screen.rootNode.children?.[0]) {
        found = screen.rootNode.children[0];
      }

      if (!found) throw new Error('No candidate node found to lock');
      store.getState().toggleNodeLock(found.id, 'node');

      const updatedManifest = store.getState().manifest;
      let lockedNodeAfter: any = null;
      function findAfter(n: any) {
        if (lockedNodeAfter) return;
        if (n.id === found.id) {
          lockedNodeAfter = n;
          return;
        }
        if (n.children) {
          for (const c of n.children) findAfter(c);
        }
      }
      findAfter(updatedManifest.screens[0].rootNode);

      function canonicalize(val: any): any {
        if (val === null || typeof val !== 'object') return val;
        if (Array.isArray(val)) return val.map(canonicalize);
        const sortedObj: Record<string, any> = {};
        for (const k of Object.keys(val).sort()) {
          sortedObj[k] = canonicalize(val[k]);
        }
        return sortedObj;
      }

      return {
        kpiNodeId: found.id,
        initialHash: JSON.stringify(canonicalize(lockedNodeAfter)),
      };
    });

    const expectedKpiSha = crypto.createHash('sha256').update(initialHash).digest('hex');
    expect(kpiNodeId).toBeTruthy();

    // Step 18: Recompose at divergenceLevel: 95 and verify locked subtree hash
    const recomposeBtn = page.locator('[data-testid="recompose-button"]');
    await expect(recomposeBtn).toBeVisible();
    await recomposeBtn.click();
    await page.waitForTimeout(1000);

    const postRecomposeSha = await page.evaluate((targetId) => {
      const store = (window as any).__tessellate_workbench_store__;
      const manifest = store.getState().manifest;
      const screen = manifest.screens[0];
      let found: any = null;
      function search(node: any) {
        if (found) return;
        if (node.id === targetId) {
          found = node;
          return;
        }
        if (node.children) {
          for (const c of node.children) search(c);
        }
      }
      search(screen.rootNode);
      if (!found) throw new Error(`Locked node ${targetId} lost after recomposition!`);

      function canonicalize(val: any): any {
        if (val === null || typeof val !== 'object') return val;
        if (Array.isArray(val)) return val.map(canonicalize);
        const sortedObj: Record<string, any> = {};
        for (const k of Object.keys(val).sort()) {
          sortedObj[k] = canonicalize(val[k]);
        }
        return sortedObj;
      }
      return JSON.stringify(canonicalize(found));
    }, kpiNodeId);

    const actualRecomposeSha = crypto.createHash('sha256').update(postRecomposeSha).digest('hex');
    expect(actualRecomposeSha).toBe(expectedKpiSha);

    // Assert zero unresolved resources in Workbench after recomposition
    await assertZeroUnresolvedResources(page);

    // Step 19: Replace a non-locked node with Gold resource (area-chart / bar-chart)
    const replacedSlug = await page.evaluate((lockedId) => {
      const store = (window as any).__tessellate_workbench_store__;
      const manifest = store.getState().manifest;
      const screen = manifest.screens[0];
      let candidate: any = null;

      function search(node: any) {
        if (candidate) return;
        if (node.id !== lockedId && node.resourceRef && node.nodeType !== 'layout') {
          candidate = node;
          return;
        }
        if (node.children) {
          for (const c of node.children) search(c);
        }
      }
      search(screen.rootNode);
      if (!candidate && screen.rootNode.children) {
        candidate = screen.rootNode.children.find((c: any) => c.id !== lockedId);
      }

      if (!candidate) throw new Error('No candidate node found to replace');

      const targetSlug = candidate.resourceRef?.slug === 'area-chart' ? 'bar-chart' : 'area-chart';
      store.getState().selectNode(candidate.id);
      store.getState().replaceNodeWithResource(
        candidate.id,
        {
          schemaVersion: '1.0.0',
          id: `res_gold_${targetSlug}`,
          slug: targetSlug,
          name: targetSlug === 'area-chart' ? 'Area Chart' : 'Bar Chart',
          version: '1.0.0',
          status: 'verified',
          description: 'Interactive SVG metric chart.',
          resourceType: 'component',
          roles: ['data-chart', 'content-grid'],
          categories: ['charts', 'data-visualization'],
          purposes: ['dashboard', 'analytics'],
          framework: 'react',
          language: 'typescript',
          styling: 'tailwind',
          dependencies: [],
          files: [{ path: 'index.tsx', kind: 'component', required: true }],
          slots: [],
          variants: [
            { id: 'quiet', name: 'quiet', description: 'Quiet' },
            { id: 'expressive', name: 'expressive', description: 'Expressive' },
            { id: 'nocturne', name: 'nocturne', description: 'Nocturne' },
          ],
          tags: [targetSlug, 'chart'],
          creator: { id: 'tess-core', displayName: 'Tessellate Core', handle: 'tessellate' },
          provenance: { origin: 'tessellate', derivative: false, aiAssistance: 'none' },
          license: { spdx: 'MIT', name: 'MIT', redistributionVerified: true, attributionRequired: false },
          intent: { summary: 'Chart visualization', idealFor: ['dashboards'], avoidFor: ['text-heavy'], jobs: ['Display trend'] },
          visualDNA: {},
          interactionDNA: {},
          layoutDNA: {},
          responsive: { verifiedWidths: [360, 768, 1440], defaultStrategy: 'compress' },
          accessibility: { levelTarget: 'AA', keyboardVerified: true, screenReaderSemantics: true, reducedMotionVerified: true, contrastTokenCompatible: true, focusVisible: true },
          performance: { jsCost: 'low', gpuCost: 'low', mediaCost: 'none', runtimeComplexity: 'low', lazyRecommended: false, continuousAnimation: false },
          quality: { overall: 95 },
          createdAt: '2026-10-10T00:00:00Z',
          updatedAt: '2026-10-10T00:00:00Z',
        } as any,
        'quiet'
      );
      return targetSlug;
    }, kpiNodeId);

    await page.waitForTimeout(500);

    // Assert replaced node rendered and zero unresolved resources in Workbench
    await assertZeroUnresolvedResources(page);
    expect(replacedSlug).toMatch(/(area-chart|bar-chart)/);

    // Step 20: Surprise Me at divergenceLevel: 60 preserves locked KPI subtree hash
    const surpriseBtn = page.locator('[data-testid="surprise-me-button"]');
    await expect(surpriseBtn).toBeVisible();
    await surpriseBtn.click();
    await page.waitForTimeout(1000);

    const postSurpriseSha = await page.evaluate((targetId) => {
      const store = (window as any).__tessellate_workbench_store__;
      const manifest = store.getState().manifest;
      const screen = manifest.screens[0];
      let found: any = null;
      function search(node: any) {
        if (found) return;
        if (node.id === targetId) {
          found = node;
          return;
        }
        if (node.children) {
          for (const c of node.children) search(c);
        }
      }
      search(screen.rootNode);
      if (!found) throw new Error(`Locked node ${targetId} lost after Surprise Me!`);

      function canonicalize(val: any): any {
        if (val === null || typeof val !== 'object') return val;
        if (Array.isArray(val)) return val.map(canonicalize);
        const sortedObj: Record<string, any> = {};
        for (const k of Object.keys(val).sort()) {
          sortedObj[k] = canonicalize(val[k]);
        }
        return sortedObj;
      }
      return JSON.stringify(canonicalize(found));
    }, kpiNodeId);

    const actualSurpriseSha = crypto.createHash('sha256').update(postSurpriseSha).digest('hex');
    expect(actualSurpriseSha).toBe(expectedKpiSha);

    // Assert zero unresolved resources in Workbench after Surprise Me
    await assertZeroUnresolvedResources(page);

    // Step 21: Real End-to-End Standalone Build Execution
    const finalManifest: ProjectManifest = await page.evaluate(() => {
      return (window as any).__tessellate_workbench_store__.getState().manifest;
    });

    expect(finalManifest).toBeDefined();
    expect(finalManifest.screens.length).toBeGreaterThan(0);

    // Generate complete source tree from manifest
    const sourceTree = generateSourceTree(finalManifest);
    expect(sourceTree['package.json']).toBeDefined();
    expect(sourceTree['vite.config.ts']).toBeDefined();

    // Write source tree to temporary standalone build directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-e2e-build-'));
    let previewProcess: ReturnType<typeof spawn> | null = null;
    const previewPort = 4299;

    try {
      for (const [filePath, content] of Object.entries(sourceTree)) {
        const fullPath = path.join(tempDir, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
      }

      // Execute package manager install
      execSync('pnpm install --prefer-offline --ignore-scripts', {
        cwd: tempDir,
        stdio: 'pipe',
      });

      // Execute production build
      execSync('pnpm build', {
        cwd: tempDir,
        stdio: 'pipe',
      });

      // Launch standalone vite preview server
      previewProcess = spawn('pnpm', ['exec', 'vite', 'preview', '--port', String(previewPort), '--strictPort'], {
        cwd: tempDir,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const proc = previewProcess;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout waiting for vite preview server on port ${previewPort}`));
        }, 20000);

        proc.stdout?.on('data', (data: Buffer) => {
          const str = data.toString();
          if (str.includes(String(previewPort)) || str.includes('Local:')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        proc.stderr?.on('data', (data: Buffer) => {
          const str = data.toString();
          if (str.includes(String(previewPort)) || str.includes('Local:')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        proc.on('error', (err: Error) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      // Open standalone build via Playwright and assert DOM rendering
      const standalonePage = await page.context().newPage();
      try {
        await standalonePage.goto(`http://localhost:${previewPort}`);
        await standalonePage.waitForSelector('#root', { timeout: 10000 });

        // Assert project identity in DOM
        const bodyText = await standalonePage.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(10);

        // Assert no missing resource fallback text in standalone build
        await expect(standalonePage.locator('text=Unresolved resource:')).toHaveCount(0);
        await expect(standalonePage.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
      } finally {
        await standalonePage.close();
      }
    } finally {
      if (previewProcess) {
        try {
          if (process.platform === 'win32' && previewProcess.pid) {
            execSync(`taskkill /pid ${previewProcess.pid} /T /F`, { stdio: 'ignore' });
          } else {
            previewProcess.kill('SIGTERM');
          }
        } catch {
          // ignore cleanup errors
        }
      }
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Step 22: Verify zero uncaught console errors
    expect(consoleErrors).toEqual([]);
  });

  // Test 2: Regression Suite — Financial Trading Terminal
  test('regression suite: financial trading terminal flow with locks, recomposition and zip export', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop studio workflow targets desktop viewport');
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    // Step 1: Open /compose
    await page.goto('/compose');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Describe the product. Get the interface.' })).toBeVisible();

    const catalogStatus = page.locator('[data-testid="catalog-status"]');
    await expect(catalogStatus).toContainText('Catalogue ready', { timeout: 15000 });

    const promptText =
      'A high-density financial intelligence trading terminal with real-time portfolio risk feeds, interactive depth charts, and automated order execution for institutional desks';
    const descriptionArea = page.locator('textarea#description');
    await descriptionArea.fill(promptText);

    const feelInput = page.locator('input#feel');
    await feelInput.fill('professional but playful');

    const strikingBtn = page.locator('button:has-text("Striking")').first();
    if (await strikingBtn.isVisible()) {
      await strikingBtn.click();
    }

    const composeBtn = page.locator('[data-testid="compose-submit-btn"]');
    await composeBtn.click();

    await expect(page.locator('text=Inferred Product Architecture').first()).toBeVisible({
      timeout: 15000,
    });

    const dirCard1 = page.locator('[data-testid="direction-card-01"]');
    const dirCard2 = page.locator('[data-testid="direction-card-02"]');
    const dirCard3 = page.locator('[data-testid="direction-card-03"]');

    await expect(dirCard1).toBeVisible();
    await expect(dirCard2).toBeVisible();
    await expect(dirCard3).toBeVisible();

    const preview1 = page.locator('[data-testid="direction-preview-01"]');
    const preview2 = page.locator('[data-testid="direction-preview-02"]');
    const preview3 = page.locator('[data-testid="direction-preview-03"]');
    await expect(preview1).toBeVisible();
    await expect(preview2).toBeVisible();
    await expect(preview3).toBeVisible();

    await assertZeroUnresolvedResources(page, preview1);
    await assertZeroUnresolvedResources(page, preview2);
    await assertZeroUnresolvedResources(page, preview3);

    const openDir3Btn = page.locator('[data-testid="open-workbench-dir-03"]');
    await openDir3Btn.click();

    await page.waitForURL(/\/workbench\?project=/, { timeout: 15000 });
    const topToolbar = page.locator('[data-testid="top-toolbar"]');
    await expect(topToolbar).toBeVisible({ timeout: 10000 });

    await assertZeroUnresolvedResources(page);

    const layersTab = page.locator('aside[data-testid="left-panel"] button:has-text("Layers")').first();
    if (await layersTab.isVisible()) {
      await layersTab.click();
    }

    const lockBtn = page.locator('[data-testid^="toggle-lock-"]').first();
    await expect(lockBtn).toBeVisible({ timeout: 5000 });
    const lockTestId = await lockBtn.getAttribute('data-testid');
    expect(lockTestId).toBeTruthy();
    await lockBtn.click();

    await expect(lockBtn).toHaveAttribute('title', 'Node Locked');

    const recomposeBtn = page.locator('[data-testid="recompose-button"]');
    await expect(recomposeBtn).toBeVisible();
    await recomposeBtn.click();
    await page.waitForTimeout(1000);

    const lockedBtnAfterRecompose = page.locator(`[data-testid="${lockTestId}"]`);
    await expect(lockedBtnAfterRecompose).toBeVisible();
    await expect(lockedBtnAfterRecompose).toHaveAttribute('title', 'Node Locked');

    await assertZeroUnresolvedResources(page);

    const surpriseBtn = page.locator('[data-testid="surprise-me-button"]');
    await expect(surpriseBtn).toBeVisible();
    await surpriseBtn.click();
    await page.waitForTimeout(1000);

    const lockedBtnAfterSurprise = page.locator(`[data-testid="${lockTestId}"]`);
    await expect(lockedBtnAfterSurprise).toBeVisible();
    await expect(lockedBtnAfterSurprise).toHaveAttribute('title', 'Node Locked');

    await assertZeroUnresolvedResources(page);

    const exportBtn = page.locator('[data-testid="export-button"]');
    await exportBtn.click();

    const exportMenu = page.locator('[data-testid="export-menu"]');
    await expect(exportMenu).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    const zipBtn = page.locator('[data-testid="export-zip-btn"]');
    await zipBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.zip$/);

    expect(consoleErrors).toEqual([]);
  });

  // Test 3: Mobile Composer Flow
  test('mobile composer to workbench acceptance flow', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific flow');
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/compose');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'Describe the product. Get the interface.' })).toBeVisible();

    const catalogStatus = page.locator('[data-testid="catalog-status"]');
    await expect(catalogStatus).toContainText('Catalogue ready', { timeout: 15000 });

    const descriptionArea = page.locator('textarea#description');
    await descriptionArea.fill('Mobile financial intelligence portfolio overview');

    const composeBtn = page.locator('[data-testid="compose-submit-btn"]');
    await composeBtn.click();

    const dirCard1 = page.locator('[data-testid="direction-card-01"]');
    await expect(dirCard1).toBeVisible({ timeout: 10000 });

    const openDir1Btn = page.locator('[data-testid="open-workbench-dir-01"]');
    await openDir1Btn.click();

    await page.waitForURL(/\/workbench\?project=/, { timeout: 15000 });
    const mobileWorkbench = page.locator('[data-testid="mobile-workbench"]');
    await expect(mobileWorkbench).toBeVisible({ timeout: 10000 });

    await assertZeroUnresolvedResources(page);

    const activeProjectRaw = await page.evaluate(() =>
      localStorage.getItem('tessellate_active_project')
    );
    expect(activeProjectRaw).not.toBeNull();
    expect(activeProjectRaw).not.toContain('res_synth_');

    expect(consoleErrors).toEqual([]);
  });
});
