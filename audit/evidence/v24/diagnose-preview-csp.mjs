import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/* global process, window, document, location, console, Element, HTMLStyleElement, MutationObserver */
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const baseURL = (process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site').replace(/\/$/, '');
const output = process.env.TESSELLATE_CSP_DIAGNOSTIC_OUTPUT ?? 'audit/evidence/v24/preview-csp-diagnostics-after-investigation.json';
const routes = (process.env.TESSELLATE_CSP_DIAGNOSTIC_ROUTES ?? '/explore,/components,/effects,/motion,/backgrounds,/r/advanced-data-table')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);
const results = [];
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    window.__tessellateCsp = [];
    window.__tessellateInlineStyles = [];
    const recordStyle = (candidate) => {
      const styles = candidate instanceof HTMLStyleElement
        ? [candidate]
        : [...(candidate.querySelectorAll?.('style') ?? [])];
      for (const style of styles) {
        const text = style.textContent ?? '';
        if (text.trim()) window.__tessellateInlineStyles.push(text);
      }
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) recordStyle(node);
        }
        if (mutation.target instanceof Element) {
          const style = mutation.target.closest('style');
          if (style) recordStyle(style);
        }
      }
    });
    observer.observe(document, { subtree: true, childList: true, characterData: true });
    window.addEventListener('securitypolicyviolation', (event) => {
      window.__tessellateCsp.push({
        blockedURI: event.blockedURI,
        effectiveDirective: event.effectiveDirective,
        violatedDirective: event.violatedDirective,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sample: event.sample,
      });
    });
  });
  const page = await context.newPage();
  let current;
  page.on('console', (message) => {
    if (!['error', 'warning'].includes(message.type())) return;
    current?.console.push({ type: message.type(), text: message.text(), location: message.location() });
  });
  page.on('pageerror', (error) => current?.pageErrors.push(error.message));
  page.on('requestfailed', (request) => current?.failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText ?? 'unknown',
    resourceType: request.resourceType(),
  }));
  page.on('response', async (response) => {
    if (!response.url().includes('/preview-content/')) return;
    current?.previewResponses.push({
      url: response.url(),
      status: response.status(),
      csp: response.headers()['content-security-policy'],
    });
  });

  for (const route of routes) {
    current = { route, console: [], pageErrors: [], failedRequests: [], previewResponses: [] };
    await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
    await page.waitForTimeout(250);
    if (route === '/explore' || route === '/motion' || route === '/backgrounds') {
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < height; y += 650) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(1000);
    }
    if (route === '/' || route === '/explore' || route === '/r/advanced-data-table') {
      const screenshotName = route === '/' ? 'home' : route === '/explore' ? 'explore' : 'advanced-data-table';
      const screenshotPath = path.join(root, 'audit/evidence/local-fixed', `${screenshotName}-fullpage-csp.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
      await page.waitForTimeout(400);
    }
    current.frames = await Promise.all(page.frames().map(async (frame) => {
      try {
        return await frame.evaluate(() => ({
          url: location.href,
          title: document.title,
          csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content ?? null,
          violations: window.__tessellateCsp ?? [],
          insertedStyles: window.__tessellateInlineStyles ?? [],
          styles: [...document.querySelectorAll('style')].map((style) => style.textContent ?? ''),
          bodyText: document.body?.innerText?.slice(0, 500) ?? '',
        }));
      } catch (error) {
        return { url: frame.url(), evaluationError: error instanceof Error ? error.message : String(error) };
      }
    }));
    current.frames = current.frames.map((frame) => ({
      ...frame,
      styles: frame.styles?.map((text) => ({
        text,
        hash: `'sha256-${createHash('sha256').update(text).digest('base64')}'`,
      })),
      insertedStyles: frame.insertedStyles?.map((text) => ({
        text,
        hash: `'sha256-${createHash('sha256').update(text).digest('base64')}'`,
      })),
    }));
    results.push(current);
    console.log(`${route}: ${current.console.length} console, ${current.previewResponses.length} preview responses, ${current.frames.length} frames`);
  }
  await writeFile(path.join(root, output), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
