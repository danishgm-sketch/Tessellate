import { test, expect, type Page } from '@playwright/test';

/**
 * Phase 29: natural-language edits go through the host daemon's command model, are previewed before
 * anything changes, and unrelated requests are refused rather than guessed.
 */
type StoreWindow = Window & {
  __tessellate_workbench_store__?: {
    getState: () => {
      manifest: { screens: Array<{ id: string; rootNode: unknown }> };
      activeScreenId: string;
      selectedNodeId: string | null;
      selectNode: (id: string) => void;
    };
  };
};

async function locksOf(page: Page, nodeId: string): Promise<unknown> {
  return page.evaluate((id) => {
    const state = (window as StoreWindow).__tessellate_workbench_store__!.getState();
    const find = (n: { id?: string; locks?: unknown; children?: unknown[] }): unknown =>
      n.id === id ? n.locks ?? null : (n.children ?? []).map((c) => find(c as never)).find((x) => x !== undefined);
    for (const s of state.manifest.screens) {
      const hit = find(s.rootNode as never);
      if (hit !== undefined) return hit;
    }
    return undefined;
  }, nodeId);
}

test.describe('Workbench natural-language commands', () => {
  test.skip(({ isMobile }) => isMobile, 'Command bar flow is desktop');

  test('a command is previewed, can be discarded, and applies only when confirmed', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/workbench');
    await page.getByRole('button', { name: 'Open the sample project' }).click();
    await page.waitForURL(/\/workbench\?project=/);
    await expect(page.getByTestId('save-indicator')).toContainText('Saved locally');

    const section = page.locator('[data-semantic-role][data-node-type="section"]').first();
    await section.click();
    // The click selects the innermost section under the pointer; read the actual selection.
    const nodeId = await page.evaluate(
      () => (window as StoreWindow).__tessellate_workbench_store__!.getState().selectedNodeId as string,
    );
    expect(nodeId).toBeTruthy();
    const before = await locksOf(page, nodeId);

    const input = page.getByPlaceholder(/Tell Tessellate what to change/);
    await input.fill('lock this');
    await input.press('Enter');
    const preview = page.getByTestId('command-preview');
    await expect(preview).toBeVisible({ timeout: 30000 });
    await expect(preview).toContainText(/Lock/);
    await page.getByTestId('command-discard').click();
    await expect(page.getByTestId('command-feedback')).toContainText(/Nothing was changed/);
    expect(await locksOf(page, nodeId)).toEqual(before);

    await input.fill('lock this');
    await input.press('Enter');
    await expect(preview).toBeVisible({ timeout: 30000 });
    await page.getByTestId('command-apply').click();
    await expect(page.getByTestId('command-feedback')).toContainText(/Applied/);
    expect(await locksOf(page, nodeId)).not.toEqual(before);
  });

  test('an unrelated request is refused and nothing changes', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/workbench');
    await page.getByRole('button', { name: 'Open the sample project' }).click();
    await page.waitForURL(/\/workbench\?project=/);
    const input = page.getByPlaceholder(/Tell Tessellate what to change/);
    await input.fill('what is the weather in london');
    await input.press('Enter');
    await expect(page.getByTestId('command-feedback')).toContainText(/could not confidently interpret/, { timeout: 30000 });
    await expect(page.getByTestId('command-preview')).toHaveCount(0);
  });
});
