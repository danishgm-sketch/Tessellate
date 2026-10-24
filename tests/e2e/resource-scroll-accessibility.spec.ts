import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const accessibilityEvidenceDirectory = path.resolve(
  process.cwd(),
  'quality/evidence/step-14/accessibility',
);

test('scrollable Gold resource content is keyboard reachable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const scrollableContent = [
    {
      slug: 'error-state',
      selector: '[aria-label="Error code sample"]',
    },
    {
      slug: 'feature-matrix',
      selector: '[aria-label="Example capability matrix comparison table"]',
    },
    {
      slug: 'three-pane-app-shell',
      selector: '[aria-label="Workspace canvas"]',
    },
  ];

  for (const { slug, selector } of scrollableContent) {
    await page.goto(`/preview-content/?resource=${slug}&variant=expressive&theme=dark`);
    const region = page.locator(selector);

    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute('tabindex', '0');
    await region.focus();
    await expect(region).toBeFocused();
  }
});

test('three-pane app shell exposes every pane without horizontal clipping on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/preview-content/?resource=three-pane-app-shell&variant=expressive&theme=dark');

  const canvas = page.getByRole('region', { name: 'Workspace canvas' });
  const shell = canvas.locator('..');
  const layout = await shell.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return {
      direction: getComputedStyle(element).flexDirection,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      panes: Array.from(element.children).map((pane) => {
        const paneBounds = pane.getBoundingClientRect();
        return {
          left: paneBounds.left - bounds.left,
          right: paneBounds.right - bounds.left,
          width: paneBounds.width,
        };
      }),
    };
  });

  expect(layout.direction).toBe('column');
  expect(layout.panes).toHaveLength(3);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.panes.every((pane) => pane.width > 0 && pane.left >= 0 && pane.right <= layout.clientWidth + 1)).toBe(
    true,
  );
  mkdirSync(accessibilityEvidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(accessibilityEvidenceDirectory, 'three-pane-shell-mobile-390-after.png'),
    fullPage: true,
  });
});

test('three-pane app shell retains its three-column workspace on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/preview-content/?resource=three-pane-app-shell&variant=expressive&theme=dark');

  const canvas = page.getByRole('region', { name: 'Workspace canvas' });
  const shell = canvas.locator('..');
  const layout = await shell.evaluate((element) => ({
    direction: getComputedStyle(element).flexDirection,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    panes: Array.from(element.children).map((pane) => {
      const bounds = pane.getBoundingClientRect();
      return { width: bounds.width };
    }),
  }));

  expect(layout.direction).toBe('row');
  expect(layout.panes).toHaveLength(3);
  expect(layout.panes.every((pane) => pane.width > 0)).toBe(true);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  mkdirSync(accessibilityEvidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(accessibilityEvidenceDirectory, 'three-pane-shell-desktop-1440-after.png'),
    fullPage: true,
  });
});
