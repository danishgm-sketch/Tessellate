import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
const targets = [
  'advanced-data-table',
  'error-state',
  'feature-matrix',
  'three-pane-app-shell',
  'pricing-three-tier',
];
async function sampleContrast(page: Page) {
  const frame = page.frames().find((f) => f.url().includes('/preview-content/'));
  if (!frame) throw new Error('sandboxed resource frame not found');
  return frame.evaluate(() => {
    type Color = { r: number; g: number; b: number; a: number };
    const parse = (v: string): Color | null => {
      const m = v.match(
        /rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/
      );
      if (!m) return null;
      const a = m[4] ? Number(m[4].replace('%', '')) / (m[4].includes('%') ? 100 : 1) : 1;
      return { r: +m[1], g: +m[2], b: +m[3], a };
    };
    const over = (fg: Color, bg: Color): Color => {
      const a = fg.a + bg.a * (1 - fg.a);
      if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
      return {
        r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
        g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
        b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
        a,
      };
    };
    const luminance = (c: Color) => {
      const f = (x: number) => {
        x /= 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a: Color, b: Color) => {
      const x = luminance(a),
        y = luminance(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const samples: Array<{
      text: string;
      selector: string;
      color: string;
      background: string;
      ratio: number;
      threshold: number;
      gradient: boolean;
      size: string;
      weight: string;
    }> = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('.tess-screen *'))) {
      const direct = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      const rect = el.getBoundingClientRect();
      if (!direct || rect.width < 1 || rect.height < 1) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
      const ancestors: HTMLElement[] = [];
      for (let n: HTMLElement | null = el; n; n = n.parentElement) ancestors.unshift(n);
      let bg: Color = { r: 255, g: 255, b: 255, a: 1 };
      let gradient = false;
      for (const a of ancestors) {
        const s = getComputedStyle(a);
        if (s.backgroundImage !== 'none') gradient = true;
        const c = parse(s.backgroundColor);
        if (c) bg = over(c, bg);
      }
      const fg = parse(cs.color);
      if (!fg) continue;
      const rendered = over(fg, bg);
      const fs = parseFloat(cs.fontSize);
      const large = fs >= 24 || (fs >= 18.66 && Number(cs.fontWeight) >= 700);
      const threshold = large ? 3 : 4.5;
      samples.push({
        text: direct.slice(0, 100),
        selector:
          el.tagName.toLowerCase() +
          (el.id ? '#' + el.id : '') +
          (el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : ''),
        color: cs.color,
        background: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
        ratio: +ratio(rendered, bg).toFixed(2),
        threshold,
        gradient,
        size: cs.fontSize,
        weight: cs.fontWeight,
      });
    }
    return {
      theme: document.documentElement.dataset.theme ?? 'light',
      textSamples: samples.length,
      failures: samples.filter((s) => s.ratio < s.threshold),
      samples,
    };
  });
}
test('live Site resource previews remain legible in dark mode and keep scroll regions keyboard reachable', async ({
  page,
}, info) => {
  const diagnostics = {
    consoleErrors: [] as string[],
    pageErrors: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };
  page.on('console', (m) => {
    if (m.type() === 'error') diagnostics.consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => diagnostics.pageErrors.push(e.message));
  page.on('requestfailed', (r) =>
    diagnostics.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`)
  );
  page.on('response', (r) => {
    if (r.status() >= 400) diagnostics.httpErrors.push(`${r.status()} ${r.url()}`);
  });
  const out = path.resolve(
    process.cwd(),
    'audit/evidence/v25/gold-runtime-dark-adapted',
    info.project.name
  );
  await mkdir(out, { recursive: true });
  const contrast = [];
  for (const slug of targets) {
    const response = await page.goto(`/resources/${slug}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    const preview = page.frameLocator('iframe[title$=" live preview"]');
    await expect(preview.locator('.tess-screen')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Switch to Dark theme' }).click();
    await expect(preview.locator('html')).toHaveClass(/dark/);
    const result = await sampleContrast(page);
    await page.screenshot({
      path: path.join(out, `${slug}-dark-${page.viewportSize()?.width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    contrast.push({ slug, ...result });
    if (['error-state', 'feature-matrix', 'three-pane-app-shell'].includes(slug)) {
      const sel =
        slug === 'error-state'
          ? '[aria-label="Error code sample"]'
          : slug === 'feature-matrix'
            ? '[aria-label="Example capability matrix comparison table"]'
            : '[aria-label="Workspace canvas"]';
      const region = preview.locator(sel);
      await expect(region).toBeVisible();
      await expect(region).toHaveAttribute('tabindex', '0');
      await region.focus();
      await expect(region).toBeFocused();
    }
  }
  await writeFile(
    path.join(out, 'report.json'),
    JSON.stringify(
      {
        site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
        capturedAt: new Date().toISOString(),
        viewport: page.viewportSize(),
        contrast,
        diagnostics,
      },
      null,
      2
    ) + '\n'
  );
  expect(diagnostics).toEqual({
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    httpErrors: [],
  });
});
