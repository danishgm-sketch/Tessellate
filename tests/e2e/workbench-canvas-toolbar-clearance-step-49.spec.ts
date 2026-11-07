import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('Workbench canvas controls never cover interactive project content', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name.toLowerCase().includes('mobile'),
    'The mobile Workbench uses its own canvas and navigation controls.',
  );

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  const networkResponses: Array<{ url: string; status: number }> = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.method() + ' ' + request.url()));
  page.on('response', (response) => {
    networkResponses.push({ url: response.url(), status: response.status() });
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  const manifest = await readFile(
    new URL('../fixtures/aud-418-persisted-workbench-project.json', import.meta.url),
    'utf8',
  );
  const fixture = JSON.parse(manifest) as { id: string };
  await page.addInitScript((projectManifest: string) => {
    const project = JSON.parse(projectManifest) as { id: string };
    localStorage.setItem('tessellate_project_' + project.id, projectManifest);
    localStorage.setItem('tessellate_active_project', projectManifest);
  }, manifest);
  await page.goto(`/workbench?project=${encodeURIComponent(fixture.id)}#screen-marketing-home`);
  const canvas = page.getByTestId('workbench-canvas');
  const toolbar = page.getByTestId('canvas-toolbar');
  await expect(canvas).toBeVisible();
  await expect(toolbar).toBeVisible();
  const teamLink = canvas.getByRole('link', { name: 'Meet your team', exact: true }).first();
  await expect(teamLink).toBeVisible();

  const layout = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLElement>('[data-testid="workbench-canvas"]');
    const scrollArea = canvas?.querySelector<HTMLElement>('[data-testid="workbench-canvas-scroll-area"]');
    const toolbar = canvas?.querySelector<HTMLElement>('[data-testid="canvas-toolbar"]');
    if (!canvas || !scrollArea || !toolbar) throw new Error('Expected the desktop Workbench canvas, scroll area, and toolbar.');

    const bar = toolbar.getBoundingClientRect();
    const scroll = scrollArea.getBoundingClientRect();
    const overlaps = [...canvas.querySelectorAll<HTMLElement>('a[href], button, input, [role="button"]')]
      .filter((element) => !toolbar.contains(element) && element.getClientRects().length > 0)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const visibleRect = {
          left: Math.max(rect.left, scroll.left),
          right: Math.min(rect.right, scroll.right),
          top: Math.max(rect.top, scroll.top),
          bottom: Math.min(rect.bottom, scroll.bottom),
        };
        return {
          label: (element.innerText || element.getAttribute('aria-label') || '').trim().slice(0, 100),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          overlap: {
            width: Math.max(0, Math.min(visibleRect.right, bar.right) - Math.max(visibleRect.left, bar.left)),
            height: Math.max(0, Math.min(visibleRect.bottom, bar.bottom) - Math.max(visibleRect.top, bar.top)),
          },
        };
      })
      .filter((item) => item.overlap.width > 1 && item.overlap.height > 1);

    return {
      viewport: { width: innerWidth, height: innerHeight },
      canvas: (() => {
        const rect = canvas.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })(),
      toolbar: { x: bar.x, y: bar.y, width: bar.width, height: bar.height },
      scrollArea: { x: scroll.x, y: scroll.y, width: scroll.width, height: scroll.height },
      overlappingTargets: overlaps,
    };
  });

  await teamLink.scrollIntoViewIfNeeded();
  const reachableTarget = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLElement>('[data-testid="workbench-canvas"]');
    const scrollArea = canvas?.querySelector<HTMLElement>('[data-testid="workbench-canvas-scroll-area"]');
    const toolbar = canvas?.querySelector<HTMLElement>('[data-testid="canvas-toolbar"]');
    const target = [...(canvas?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])]
      .find((element) => element.innerText.trim() === 'Meet your team');
    if (!scrollArea || !toolbar || !target) throw new Error('Expected the employee project CTA after scrolling.');
    const link = target.getBoundingClientRect();
    const scroll = scrollArea.getBoundingClientRect();
    const bar = toolbar.getBoundingClientRect();
    const visible = {
      left: Math.max(link.left, scroll.left),
      right: Math.min(link.right, scroll.right),
      top: Math.max(link.top, scroll.top),
      bottom: Math.min(link.bottom, scroll.bottom),
    };
    const overlapWidth = Math.max(0, Math.min(visible.right, bar.right) - Math.max(visible.left, bar.left));
    const overlapHeight = Math.max(0, Math.min(visible.bottom, bar.bottom) - Math.max(visible.top, bar.top));
    return {
      link: { x: link.x, y: link.y, width: link.width, height: link.height },
      scrollArea: { top: scroll.top, bottom: scroll.bottom },
      toolbar: { top: bar.top, bottom: bar.bottom },
      fullyVisible: link.top >= scroll.top && link.bottom <= scroll.bottom,
      overlapsToolbar: overlapWidth > 1 && overlapHeight > 1,
    };
  });

  const evidenceDir = process.env.TESS_AUDIT_EVIDENCE_DIR;
  const evidenceLabel = process.env.TESS_AUDIT_EVIDENCE_LABEL ?? testInfo.project.name;
  if (evidenceDir) {
    await mkdir(evidenceDir, { recursive: true });
    await page.screenshot({ path: path.join(evidenceDir, evidenceLabel + '-1440-cta-visible.png'), fullPage: false });
  }

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(canvas).toBeVisible();
  await expect(toolbar).toBeVisible();
  await teamLink.scrollIntoViewIfNeeded();
  const mediumViewport = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLElement>('[data-testid="workbench-canvas"]');
    const scrollArea = canvas?.querySelector<HTMLElement>('[data-testid="workbench-canvas-scroll-area"]');
    const toolbar = canvas?.querySelector<HTMLElement>('[data-testid="canvas-toolbar"]');
    const target = [...(canvas?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])]
      .find((element) => element.innerText.trim() === 'Meet your team');
    if (!canvas || !scrollArea || !toolbar || !target) throw new Error('Expected the employee CTA at the 1024px desktop layout.');
    const root = canvas.getBoundingClientRect();
    const scroll = scrollArea.getBoundingClientRect();
    const bar = toolbar.getBoundingClientRect();
    const link = target.getBoundingClientRect();
    const visible = {
      left: Math.max(link.left, scroll.left),
      right: Math.min(link.right, scroll.right),
      top: Math.max(link.top, scroll.top),
      bottom: Math.min(link.bottom, scroll.bottom),
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      canvas: { left: root.left, right: root.right, width: root.width },
      scrollArea: { top: scroll.top, bottom: scroll.bottom },
      toolbar: { left: bar.left, right: bar.right, top: bar.top, bottom: bar.bottom, width: bar.width },
      target: { left: link.left, right: link.right, top: link.top, bottom: link.bottom },
      fullyVisible: link.top >= scroll.top && link.bottom <= scroll.bottom,
      overlapsToolbar: Math.max(0, Math.min(visible.right, bar.right) - Math.max(visible.left, bar.left)) > 1
        && Math.max(0, Math.min(visible.bottom, bar.bottom) - Math.max(visible.top, bar.top)) > 1,
      toolbarWithinCanvas: bar.left >= root.left && bar.right <= root.right,
      documentOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });

  if (evidenceDir) {
    await page.screenshot({ path: path.join(evidenceDir, evidenceLabel + '-1024-cta-visible.png'), fullPage: false });
    await writeFile(
      path.join(evidenceDir, evidenceLabel + '.json'),
      JSON.stringify({
        id: 'AUD-418',
        route: new URL(page.url()).pathname + new URL(page.url()).hash,
        url: page.url(),
        viewport: layout.viewport,
        consoleErrors,
        consoleWarnings,
        pageErrors,
        failedRequests,
        httpErrors,
        networkResponses,
        initialLayout: layout,
        reachableTarget,
        mediumViewport,
      }, null, 2) + '\n',
      'utf8',
    );
  }

  expect(layout.overlappingTargets, JSON.stringify(layout, null, 2)).toEqual([]);
  expect(reachableTarget.fullyVisible, JSON.stringify(reachableTarget, null, 2)).toBe(true);
  expect(reachableTarget.overlapsToolbar, JSON.stringify(reachableTarget, null, 2)).toBe(false);
  expect(mediumViewport.viewport).toEqual({ width: 1024, height: 768 });
  expect(mediumViewport.documentOverflow).toBe(false);
  expect(mediumViewport.toolbarWithinCanvas).toBe(true);
  expect(mediumViewport.fullyVisible).toBe(true);
  expect(mediumViewport.overlapsToolbar).toBe(false);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
