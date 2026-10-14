import { test, expect } from '@playwright/test';

/**
 * Phase 24 gate (D-023): resource previews run on a separate origin inside a sandbox without
 * allow-same-origin, so preview code cannot reach the main site's DOM, cookies or storage.
 */
test.describe('Preview origin isolation', () => {
  test('resource preview iframe is sandboxed on a separate, opaque origin', async ({ page, context }) => {
    await context.addCookies([{ name: 'tess_session_probe', value: 'secret-value', url: 'http://localhost:4321' }]);
    await page.goto('/r/button');

    const frameEl = page.locator('iframe[title$="live preview"]').first();
    await expect(frameEl).toBeVisible({ timeout: 15000 });

    const sandbox = (await frameEl.getAttribute('sandbox')) ?? '';
    expect(sandbox.split(/\s+/)).toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-same-origin');

    const src = (await frameEl.getAttribute('src')) ?? '';
    expect(new URL(src, page.url()).origin).not.toBe(new URL(page.url()).origin);

    const frame = await (await frameEl.elementHandle())!.contentFrame();
    expect(frame).not.toBeNull();
    // The sandboxed preview must still render the resource (its assets are served with CORS).
    await expect.poll(async () => frame!.evaluate(() => document.querySelectorAll('#root button').length), { timeout: 10000 }).toBeGreaterThan(0);
    const probe = await frame!.evaluate(() => {
      let parentDomReadable = true;
      try {
        // Cross-origin access throws a SecurityError.
        void window.parent.document.title;
      } catch {
        parentDomReadable = false;
      }
      let storageAvailable = true;
      try {
        window.localStorage.getItem('x');
      } catch {
        storageAvailable = false;
      }
      let cookie: string | null = null;
      try {
        cookie = document.cookie;
      } catch {
        cookie = null; // opaque origins cannot read cookies at all
      }
      return { origin: window.origin, parentDomReadable, cookie, storageAvailable };
    });

    expect(probe.origin).toBe('null');
    expect(probe.parentDomReadable).toBe(false);
    expect(probe.cookie ?? '').not.toContain('secret-value');
    expect(probe.storageAvailable).toBe(false);
  });

  test('the main site no longer serves a same-origin preview route', async ({ request }) => {
    const res = await request.get('/preview?resource=button');
    expect(res.status()).toBe(404);
  });
});
