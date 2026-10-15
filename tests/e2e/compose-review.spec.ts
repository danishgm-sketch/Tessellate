import { test, expect } from '@playwright/test';
import { composeBrief } from './support/compose';

/**
 * Phase 28 gate: the physiotherapy brief is understood by the host daemon's model, the user reviews and
 * corrects it, and the composed project reflects the review.
 */
test.describe('Compose: review inferred product', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop review flow');

  test('physio brief → healthcare product with booking flow, editable before composing', async ({ page }) => {
    test.setTimeout(90000);
    const physio =
      'A booking platform for independent physiotherapy clinics. Patients book appointments and pay deposits; clinicians manage calendars, treatment notes and invoices. Calm, trustworthy, accessible for older users.';

    await composeBrief(page, physio, async (p) => {
      await expect(p.getByLabel('Product type')).toHaveValue(/healthcare-clinic|booking-scheduling/);
      const entities = p.getByTestId('review-entity');
      for (const name of ['Patient', 'Appointment', 'Clinician', 'Invoice', 'Deposit']) {
        await expect(entities.filter({ hasText: name }).first()).toBeVisible();
      }
      await expect(p.getByLabel('Accessibility level')).toHaveValue('AAA');
      await expect(p.getByLabel('Look and feel')).toHaveValue(/calm/);

      // Corrections: drop Invoice (its screens go with it) and add Voucher.
      await expect(p.getByRole('checkbox', { name: /^Invoices/ })).toBeVisible();
      await p.getByRole('button', { name: 'Remove Invoice' }).click();
      await expect(p.getByRole('checkbox', { name: /^Invoices/ })).toHaveCount(0);
      await p.getByLabel('Add something the product manages').fill('Voucher');
      await p.getByRole('button', { name: 'Add' }).click();
      await expect(entities.filter({ hasText: 'Voucher' })).toBeVisible();
    });

    await page.getByTestId('open-workbench-dir-01').click();
    await page.waitForURL(/\/workbench\?project=/);
    await expect(page.getByTestId('save-indicator')).toContainText(/Saved locally/, { timeout: 15000 });
    const model = await page.evaluate(() => {
      const store = (window as Window & { __tessellate_workbench_store__?: { getState: () => { manifest: { productModel: { entities: Array<{ name: string }>; productArchetypes: Array<{ tag: string }> }; screens: Array<{ name: string }> } } } })
        .__tessellate_workbench_store__!;
      const m = store.getState().manifest;
      return { entities: m.productModel.entities.map((e) => e.name), archetype: m.productModel.productArchetypes[0]?.tag, screens: m.screens.map((s) => s.name) };
    });
    expect(model.entities).toContain('Voucher');
    expect(model.entities).not.toContain('Invoice');
    expect(['healthcare-clinic', 'booking-scheduling']).toContain(model.archetype);
    expect(model.screens.join(' ')).not.toMatch(/Invoice/);
  });

  test('an AAA product composes from AAA-checked resources with the client name throughout', async ({ page }) => {
    test.setTimeout(90000);
    await composeBrief(
      page,
      'A booking platform for independent physiotherapy clinics. Patients book appointments and pay deposits; clinicians manage calendars, treatment notes and invoices. Calm, trustworthy, accessible for older users.',
      async (p) => {
        await expect(p.getByLabel('Accessibility level')).toHaveValue('AAA');
        await p.getByLabel('Product name').fill('Northside Physio');
      },
    );
    await expect(page.getByTestId('direction-gaps-01')).toHaveCount(0);
    await page.getByTestId('open-workbench-dir-01').click();
    await page.waitForURL(/\/workbench\?project=/);
    await expect(page.getByTitle('Click to rename project')).toContainText('Northside Physio');
    await expect(page.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Book care easily and run the clinic smoothly' })).toBeVisible({ timeout: 15000 });
  });
});
