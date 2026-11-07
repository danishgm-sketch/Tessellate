# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: resource-dark-expressive-contrast.spec.ts >> Gold resources keep expressive variants readable on dark product canvases
- Location: tests\e2e\resource-dark-expressive-contrast.spec.ts:16:1

# Error details

```
Error: expect(locator).toBeAttached() failed

Locator: locator('[data-node-id="preview-advanced-data-table"]')
Expected: attached
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeAttached" locator('[data-node-id="preview-advanced-data-table"]') with timeout 5000ms
  - waiting for locator('[data-node-id="preview-advanced-data-table"]')

```

```yaml
- iframe
```

# Test source

```ts
  1  | import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
  2  | import path from 'node:path';
  3  | import { execFileSync } from 'node:child_process';
  4  | import AxeBuilder from '@axe-core/playwright';
  5  | import { expect, test } from '@playwright/test';
  6  | 
  7  | type Catalogue = {
  8  |   resources: Array<{ slug: string; status: string }>;
  9  | };
  10 | 
  11 | const cataloguePath = path.resolve(process.cwd(), 'apps/site/public/data/catalog.json');
  12 | const goldResources = (JSON.parse(readFileSync(cataloguePath, 'utf8')) as Catalogue).resources.filter(
  13 |   (resource) => resource.status === 'verified-gold'
  14 | );
  15 | 
  16 | test('Gold resources keep expressive variants readable on dark product canvases', async ({ page }) => {
  17 |   test.setTimeout(5 * 60 * 1000);
  18 |   const findings: Array<{
  19 |     slug: string;
  20 |     id: string;
  21 |     impact: string | undefined;
  22 |     nodes: Array<{ target: string[]; summary: string; html: string }>;
  23 |   }> = [];
  24 | 
  25 |   for (const resource of goldResources) {
  26 |     await page.goto(`/preview-content/?resource=${resource.slug}&variant=expressive&theme=dark`);
> 27 |     await expect(page.locator(`[data-node-id="preview-${resource.slug}"]`)).toBeAttached();
     |                                                                             ^ Error: expect(locator).toBeAttached() failed
  28 |     await page.waitForLoadState('networkidle');
  29 | 
  30 |     const result = await new AxeBuilder({ page })
  31 |       .options({ preload: false })
  32 |       .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
  33 |       .analyze();
  34 | 
  35 |     for (const violation of result.violations) {
  36 |       findings.push({
  37 |         slug: resource.slug,
  38 |         id: violation.id,
  39 |         impact: violation.impact,
  40 |         nodes: violation.nodes.map((node) => ({
  41 |           target: node.target.map(String),
  42 |           summary: node.failureSummary ?? '',
  43 |           html: node.html,
  44 |         })),
  45 |       });
  46 |     }
  47 |   }
  48 | 
  49 |   const outputPath = path.resolve(process.cwd(), 'test-results/resource-dark-expressive-contrast.json');
  50 |   mkdirSync(path.dirname(outputPath), { recursive: true });
  51 |   writeFileSync(
  52 |     outputPath,
  53 |     `${JSON.stringify(
  54 |       {
  55 |         generatedAt: new Date().toISOString(),
  56 |         sourceSha:
  57 |           process.env.AUDIT_SOURCE_SHA ??
  58 |           execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  59 |         viewport: page.viewportSize(),
  60 |         resourceCount: goldResources.length,
  61 |         findings,
  62 |       },
  63 |       null,
  64 |       2,
  65 |     )}\n`,
  66 |   );
  67 | 
  68 |   expect(goldResources).toHaveLength(40);
  69 |   const failures = findings.map(({ slug, id, impact }) => `${slug}: ${id} (${impact ?? 'unknown'})`);
  70 |   expect(failures, `Gold expressive dark-theme contrast failures:\n${failures.join('\n')}`).toEqual([]);
  71 | });
  72 | 
```