import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Catalogue = {
  resources: Array<{ slug: string; status: string }>;
};

const cataloguePath = path.resolve(process.cwd(), 'apps/site/public/data/catalog.json');
const goldResources = (JSON.parse(readFileSync(cataloguePath, 'utf8')) as Catalogue).resources.filter(
  (resource) => resource.status === 'verified-gold'
);

test('Gold resources keep expressive variants readable on dark product canvases', async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const findings: Array<{
    slug: string;
    id: string;
    impact: string | undefined;
    nodes: Array<{ target: string[]; summary: string; html: string }>;
  }> = [];

  for (const resource of goldResources) {
    await page.goto(`/preview/?resource=${resource.slug}&variant=expressive&theme=dark`);
    await expect(page.locator(`[data-node-id="preview-${resource.slug}"]`)).toBeAttached();
    await page.waitForLoadState('networkidle');

    const result = await new AxeBuilder({ page })
      .options({ preload: false })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    for (const violation of result.violations) {
      findings.push({
        slug: resource.slug,
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          target: node.target.map(String),
          summary: node.failureSummary ?? '',
          html: node.html,
        })),
      });
    }
  }

  const outputPath = path.resolve(process.cwd(), 'test-results/resource-dark-expressive-contrast.json');
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify({ resourceCount: goldResources.length, findings }, null, 2)}\n`);

  expect(goldResources).toHaveLength(40);
  const failures = findings.map(({ slug, id, impact }) => `${slug}: ${id} (${impact ?? 'unknown'})`);
  expect(failures, `Gold expressive dark-theme contrast failures:\n${failures.join('\n')}`).toEqual([]);
});
