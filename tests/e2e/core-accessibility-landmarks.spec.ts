import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home, Explore, and Workbench preserve heading order and landmark ownership', async ({
  page,
}) => {
  for (const route of ['/', '/explore', '/r/advanced-data-table', '/workbench']) {
    await page.goto(route);
    if (route === '/explore') {
      await expect(page.getByRole('heading', { name: 'Explore Resource Library' })).toBeVisible();
      for (const [resourceName, previewHeading] of [
        ['Animated Disclosure Accordion', 'Animated Disclosure Accordion preview'],
        ['Activity Feed', 'Activity Feed preview'],
        ['Advanced Data Table', 'Advanced Data Table preview'],
      ]) {
        await page.getByRole('link', { name: resourceName, exact: true }).scrollIntoViewIfNeeded();
        await expect(
          page.frameLocator(`iframe[title="${resourceName} actual preview"]`).getByRole('heading', {
            name: previewHeading,
          }),
        ).toBeVisible();
      }
    }
    if (route === '/r/advanced-data-table') {
      await expect(page.getByRole('heading', { name: 'Advanced Data Table' }).first()).toBeVisible();
    }
    if (route === '/workbench') {
      const surface = test.info().project.name.includes('mobile')
        ? page.getByTestId('mobile-workbench')
        : page.getByTestId('workbench-shell');
      await expect(surface).toBeVisible();
    }

    const { violations } = await new AxeBuilder({ page })
      .withRules(['heading-order', 'landmark-unique', 'region'])
      .analyze();
    expect(
      violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
      route,
    ).toEqual([]);
  }
});
