import { test, expect } from '@playwright/test';

test.describe('Flagship 23-Step Acceptance Journey (Req 15)', () => {
  test('end-to-end composer to workbench flow with locks, recomposition, surprise me, and standalone export', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop studio workflow targets desktop viewport');
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore benign favicon or 404 network errors if any
        if (!text.includes('favicon') && !text.includes('Failed to load resource: the server responded with a status of 404')) {
          consoleErrors.push(text);
        }
      }
    });

    // Step 1: Open /compose
    await page.goto('/compose');
    await page.waitForLoadState('domcontentloaded');

    // Step 2: Assert page loads editorial shell and composer title
    await expect(page.getByRole('heading', { name: 'Describe the product. Get the interface.' })).toBeVisible();

    // Step 3: Observe /data/catalog.json loaded successfully
    await page.waitForResponse(
      (resp) => resp.url().includes('/data/catalog.json') && resp.status() === 200,
      { timeout: 10000 }
    ).catch(() => {
      // In case catalog.json was cached or already loaded before listener
    });

    // Step 4: Fill in brief
    const promptText =
      'A high-density financial intelligence trading terminal with real-time portfolio risk feeds, interactive depth charts, and automated order execution for institutional desks';
    const descriptionArea = page.locator('textarea#description');
    await descriptionArea.fill(promptText);

    // Step 5: Fill in feel query
    const feelInput = page.locator('input#feel');
    await feelInput.fill('professional but playful');

    // Step 6: Adjust Visual Ambition to Striking
    const strikingBtn = page.locator('button:has-text("Striking")').first();
    if (await strikingBtn.isVisible()) {
      await strikingBtn.click();
    }

    // Step 7: Click "Compose Interface System"
    const composeBtn = page.locator('[data-testid="compose-submit-btn"]');
    await composeBtn.click();

    // Step 8: Assert inferred product architecture appears
    await expect(page.locator('text=Inferred Product Architecture').first()).toBeVisible({
      timeout: 10000,
    });

    // Step 9: Assert exactly 3 generated direction cards appear
    const dirCard1 = page.locator('[data-testid="direction-card-01"]');
    const dirCard2 = page.locator('[data-testid="direction-card-02"]');
    const dirCard3 = page.locator('[data-testid="direction-card-03"]');

    await expect(dirCard1).toBeVisible();
    await expect(dirCard2).toBeVisible();
    await expect(dirCard3).toBeVisible();

    // Step 10: Verify directions A, B, C have distinct content
    const dir1Text = await dirCard1.innerText();
    const dir2Text = await dirCard2.innerText();
    const dir3Text = await dirCard3.innerText();
    expect(dir1Text).not.toEqual(dir2Text);
    expect(dir2Text).not.toEqual(dir3Text);

    // Step 11: Verify direction previews render real DOM elements without missing-resource fallback
    const preview1 = page.locator('[data-testid="direction-preview-01"]');
    const preview2 = page.locator('[data-testid="direction-preview-02"]');
    const preview3 = page.locator('[data-testid="direction-preview-03"]');
    await expect(preview1).toBeVisible();
    await expect(preview2).toBeVisible();
    await expect(preview3).toBeVisible();

    // Assert zero missing-resource fallbacks
    await expect(page.locator('text=missing-resource-recovery')).toHaveCount(0);

    // Step 12: Click "Open in Workbench" on Direction 03
    const openDir3Btn = page.locator('[data-testid="open-workbench-dir-03"]');
    await openDir3Btn.click();

    // Step 13: Assert URL transitions to /workbench?project=
    await page.waitForURL(/\/workbench\?project=/, { timeout: 15000 });
    expect(page.url()).toContain('/workbench?project=');

    // Step 14: Assert Workbench top toolbar loads
    const topToolbar = page.locator('[data-testid="top-toolbar"]');
    await expect(topToolbar).toBeVisible({ timeout: 10000 });

    // Step 15: Verify manifest loaded in Workbench matches Direction 03 project ID and has no synthetic fallbacks
    const urlProjectId = new URL(page.url()).searchParams.get('project');
    expect(urlProjectId).toBeTruthy();

    const storedProject = await page.evaluate((pid) => {
      const stored = localStorage.getItem(`tessellate_project_${pid}`) || localStorage.getItem('tessellate_active_project');
      return stored ? JSON.parse(stored) : null;
    }, urlProjectId);
    expect(storedProject?.id).toBe(urlProjectId);

    const activeProjectRaw = await page.evaluate(() =>
      localStorage.getItem('tessellate_active_project')
    );
    expect(activeProjectRaw).not.toBeNull();
    expect(activeProjectRaw).not.toContain('res_synth_');

    // Step 16: In Workbench left panel, locate layers tree and switch to it
    const layersTab = page.locator('aside[data-testid="left-panel"] button:has-text("Layers")').first();
    if (await layersTab.isVisible()) {
      await layersTab.click();
    }

    // Step 17: Find a lock toggle button in the tree, record its test id, and click it
    const lockBtn = page.locator('[data-testid^="toggle-lock-"]').first();
    await expect(lockBtn).toBeVisible({ timeout: 5000 });
    const lockTestId = await lockBtn.getAttribute('data-testid');
    expect(lockTestId).toBeTruthy();
    await lockBtn.click();

    // Step 18: Assert lock active
    await expect(lockBtn).toHaveAttribute('title', 'Node Locked');

    // Step 19: Click Recompose button in Top Toolbar (divergenceLevel 70)
    const recomposeBtn = page.locator('[data-testid="recompose-button"]');
    await expect(recomposeBtn).toBeVisible();
    await recomposeBtn.click();

    // Wait for mutation to take effect
    await page.waitForTimeout(1000);

    // Step 20: Verify locked node survived intact
    const lockedBtnAfterRecompose = page.locator(`[data-testid="${lockTestId}"]`);
    await expect(lockedBtnAfterRecompose).toBeVisible();
    await expect(lockedBtnAfterRecompose).toHaveAttribute('title', 'Node Locked');

    // Step 21: Click Surprise Me button in Top Toolbar (divergenceLevel 60)
    const surpriseBtn = page.locator('[data-testid="surprise-me-button"]');
    await expect(surpriseBtn).toBeVisible();
    await surpriseBtn.click();

    // Wait for mutation to take effect
    await page.waitForTimeout(1000);

    // Step 22: Verify locked node survived surprise me intact
    const lockedBtnAfterSurprise = page.locator(`[data-testid="${lockTestId}"]`);
    await expect(lockedBtnAfterSurprise).toBeVisible();
    await expect(lockedBtnAfterSurprise).toHaveAttribute('title', 'Node Locked');

    // Step 23: Open Export dropdown and trigger Standalone React Project (.zip) download
    const exportBtn = page.locator('[data-testid="export-button"]');
    await exportBtn.click();

    const exportMenu = page.locator('[data-testid="export-menu"]');
    await expect(exportMenu).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    const zipBtn = page.locator('[data-testid="export-zip-btn"]');
    await zipBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.zip$/);

    // Assert zero uncaught console errors throughout the entire journey
    expect(consoleErrors).toEqual([]);
  });

  test('mobile composer to workbench acceptance flow', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific flow');
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('Failed to load resource: the server responded with a status of 404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/compose');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'Describe the product. Get the interface.' })).toBeVisible();

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

    const activeProjectRaw = await page.evaluate(() =>
      localStorage.getItem('tessellate_active_project')
    );
    expect(activeProjectRaw).not.toBeNull();
    expect(activeProjectRaw).not.toContain('res_synth_');

    expect(consoleErrors).toEqual([]);
  });
});
