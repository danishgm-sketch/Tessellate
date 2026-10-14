import { test, expect } from '@playwright/test';

/**
 * Phase 27 gate (D-033): with no host daemon connected, natural-language edits are queued, the user is
 * told the host is offline, the request is cancelled after a short wait, and the project is unchanged.
 * Browsing and manual editing keep working.
 */
test.describe('Intelligence host offline', () => {
  test.skip(({ isMobile }) => isMobile, 'Command bar flow is desktop');

  test('a command is never guessed when the host is offline', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/workbench');
    await page.getByRole('button', { name: 'Open the sample project' }).click();
    await page.waitForURL(/\/workbench\?project=/);
    await expect(page.getByTestId('save-indicator')).toContainText('Saved locally');

    const before = await page.evaluate(() =>
      JSON.stringify(
        (window as Window & { __tessellate_workbench_store__?: { getState: () => { manifest: unknown } } }).__tessellate_workbench_store__!.getState()
          .manifest,
      ),
    );

    const input = page.getByPlaceholder(/Tell Tessellate what to change/);
    await input.fill('add an appointment booking calendar');
    await input.press('Enter');

    const feedback = page.getByTestId('command-feedback');
    await expect(feedback).toContainText(/offline/i, { timeout: 15000 });
    await expect(feedback).toContainText(/Nothing was changed/, { timeout: 40000 });
    // The prompt is kept so the user can retry later.
    await expect(input).toHaveValue('add an appointment booking calendar');

    const after = await page.evaluate(() =>
      JSON.stringify(
        (window as Window & { __tessellate_workbench_store__?: { getState: () => { manifest: unknown } } }).__tessellate_workbench_store__!.getState()
          .manifest,
      ),
    );
    expect(after).toBe(before);
  });

  test('composing a brief is never faked when the host is offline', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/compose');
    const submit = page.getByRole('button', { name: /Understand my product/ });
    await expect(async () => {
      await page.getByLabel('What are you building?').fill('A booking platform for physiotherapy clinics with patient deposits.');
      await expect(submit).toBeEnabled({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
    await submit.click();
    await expect(page.getByTestId('compose-progress')).toContainText(/offline/i, { timeout: 15000 });
    // After the short offline wait the user gets an explanation and can retry; no review or directions appear.
    await expect(page.getByRole('status')).toContainText(/offline|not reachable|cancel|try again/i, { timeout: 45000 });
    await expect(page.getByTestId('review-step')).toHaveCount(0);
    await expect(page.getByTestId('direction-card-01')).toHaveCount(0);
    await expect(page.getByLabel('What are you building?')).toHaveValue(/physiotherapy/);
  });

  test('the status page reports the host as unavailable while everything else works', async ({ page }) => {
    await page.goto('/status');
    await expect(page.getByRole('heading', { name: 'System status' })).toBeVisible();
    const hostRow = page.getByRole('listitem').filter({ hasText: 'Intelligence host' });
    await expect(hostRow).toContainText('Unavailable', { timeout: 15000 });
    await expect(page.getByRole('listitem').filter({ hasText: 'Accounts and cloud sync' })).toContainText('Operational');
  });
});
