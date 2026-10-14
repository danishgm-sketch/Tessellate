import { expect, type Page } from '@playwright/test';

/**
 * Runs the real composition journey (Phase 28): brief → interpretation by the host daemon through the
 * queue → Review step → three directions. Returns once the direction cards are visible.
 */
export async function composeBrief(page: Page, brief: string, review?: (page: Page) => Promise<void>): Promise<void> {
  await page.goto('/compose');
  const submit = page.getByRole('button', { name: /Understand my product/ });
  // Typing before the island hydrates is discarded by React, so retry until the input sticks.
  await expect(async () => {
    await page.getByLabel('What are you building?').fill(brief);
    await expect(submit).toBeEnabled({ timeout: 1000 });
  }).toPass({ timeout: 15000 });
  await submit.click();
  await expect(page.getByTestId('review-step')).toBeVisible({ timeout: 45000 });
  if (review) await review(page);
  await page.getByRole('button', { name: /Compose three directions/ }).click();
  await expect(page.getByTestId('direction-card-01')).toBeVisible({ timeout: 15000 });
}
