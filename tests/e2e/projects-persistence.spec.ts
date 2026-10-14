import { test, expect, type Page } from '@playwright/test';
import { composeBrief } from './support/compose';

/**
 * Phase 25 gate: composing several briefs creates distinct projects (the audit saw a second compose
 * overwrite the first), edits/renames/checkpoints survive reload, and a corrupted record opens in
 * safe mode instead of being discarded.
 */

const BRIEFS = [
  'A booking platform for independent physiotherapy clinics with patient deposits and treatment notes.',
  'A luxury travel marketplace connecting boutique hotels with discerning travellers.',
  'An internal inventory tool for a regional chain of hardware stores.',
];

async function composeAndOpen(page: Page, brief: string): Promise<string> {
  await composeBrief(page, brief);
  await page.getByRole('button', { name: /Open in Workbench/i }).first().click();
  await page.waitForURL(/\/workbench\?project=/);
  await expect(page.getByTestId('save-indicator')).toContainText(/Saved locally/, { timeout: 15000 });
  return new URL(page.url()).searchParams.get('project')!;
}

test.describe('Projects and local persistence', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop editor flow');

  test('three composes create three distinct, persistent projects', async ({ page }) => {
    test.setTimeout(120000);
    const ids: string[] = [];
    for (const brief of BRIEFS) ids.push(await composeAndOpen(page, brief));
    expect(new Set(ids).size).toBe(3);

    // Rename the last project and confirm it saved.
    await page.getByTitle('Click to rename project').click();
    const nameInput = page.getByRole('textbox', { name: 'Project name' });
    await nameInput.fill('Hardware Chain — Client Demo');
    await nameInput.press('Enter');
    // The indicator flips to 'Saving…' as soon as there are unsaved edits, then back to saved.
    await expect(page.getByTestId('save-indicator')).toContainText(/Saving/);
    await expect(page.getByTestId('save-indicator')).toContainText(/Saved locally/);

    // Create a named checkpoint through the store and confirm it persists across reload.
    await page.evaluate(() => {
      (window as Window & { __tessellate_workbench_store__?: { getState: () => { createCheckpoint: (n: string) => void } } })
        .__tessellate_workbench_store__!.getState()
        .createCheckpoint('Before client review');
    });
    await expect(page.getByTestId('save-indicator')).toContainText(/Saved locally/);
    await page.reload();
    await expect(page.getByTitle('Click to rename project')).toHaveText('Hardware Chain — Client Demo');
    const checkpointNames = await page.evaluate(() =>
      (window as Window & { __tessellate_workbench_store__?: { getState: () => { checkpoints: Array<{ name: string }> } } })
        .__tessellate_workbench_store__!.getState()
        .checkpoints.map((c) => c.name),
    );
    expect(checkpointNames).toContain('Before client review');

    // Dashboard lists all three.
    await page.goto('/workbench');
    await expect(page.getByTestId('projects-dashboard')).toBeVisible();
    await expect(page.getByTestId('project-row')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Hardware Chain — Client Demo' })).toBeVisible();
  });

  test('dashboard supports search, client folders, duplicate and delete with undo', async ({ page }) => {
    test.setTimeout(90000);
    await composeAndOpen(page, BRIEFS[0]!);
    await page.goto('/workbench');

    const row = page.getByTestId('project-row').first();
    await row.getByRole('button', { name: /Move .* to a client folder/ }).click();
    const folderInput = page.getByRole('combobox', { name: /Client folder for/ });
    await folderInput.fill('Acme Physio');
    await folderInput.press('Enter');
    await expect(row).toContainText('Acme Physio');

    await row.getByRole('button', { name: /^Duplicate/ }).click();
    await expect(page.getByTestId('project-row')).toHaveCount(2);

    await page.getByRole('button', { name: /^Delete/ }).first().click();
    await expect(page.getByTestId('project-row')).toHaveCount(1);
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByTestId('project-row')).toHaveCount(2);

    await page.getByRole('searchbox', { name: 'Search projects' }).fill('no-such-project');
    await expect(page.getByText('No projects match your search.')).toBeVisible();
  });

  test('a corrupted stored project opens in safe mode and is never discarded', async ({ page }) => {
    await page.goto('/workbench');
    await expect(page.getByTestId('projects-dashboard')).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve, reject) => {
          const req = indexedDB.open('tessellate-local-db', 2);
          req.onsuccess = () => {
            const tx = req.result.transaction('projects', 'readwrite');
            tx.objectStore('projects').put({ id: 'proj-corrupt', name: 42, screens: 'not-an-array' });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          };
          req.onerror = () => reject(req.error);
        }),
    );
    await page.goto('/workbench?project=proj-corrupt');
    await expect(page.getByTestId('project-recovery')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download raw record' })).toBeVisible();

    await page.goto('/workbench?project=proj-does-not-exist');
    await expect(page.getByTestId('project-not-found')).toBeVisible();
  });
});
