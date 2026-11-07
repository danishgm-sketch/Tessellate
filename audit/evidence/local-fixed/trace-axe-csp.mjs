import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/* global process, window, document, location, Element, HTMLStyleElement, MutationObserver, console */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const baseURL = (process.env.TESSELLATE_AUDIT_URL ?? 'http://127.0.0.1:4323').replace(/\/$/, '');
const output = path.join(root, 'audit/evidence/local-fixed/axe-csp-trace.json');
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
        directive: event.effectiveDirective,
        blockedURI: event.blockedURI,
        sample: event.sample,
        sourceFile: event.sourceFile,
      });
    });
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto(`${baseURL}/explore`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  const before = {
    consoleErrors: [...consoleErrors],
    violations: await Promise.all(page.frames().map((frame) =>
      frame.evaluate(() => ({ url: location.href, events: window.__tessellateCsp ?? [] }))
        .catch(() => ({ url: frame.url(), events: [] }))
    )),
  };

  const axe = await new AxeBuilder({ page }).analyze();
  await page.waitForTimeout(500);
  const afterFrames = await Promise.all(page.frames().map((frame) =>
    frame.evaluate(() => ({
      url: location.href,
      violations: window.__tessellateCsp ?? [],
      insertedStyles: window.__tessellateInlineStyles ?? [],
      styles: [...document.querySelectorAll('style')].map((style) => style.textContent ?? ''),
    })).catch(() => ({ url: frame.url(), violations: [], insertedStyles: [], styles: [] }))
  ));
  const withHashes = afterFrames.map((frame) => ({
    ...frame,
    insertedStyles: frame.insertedStyles.map((text) => ({
      text,
      hash: `'sha256-${createHash('sha256').update(text).digest('base64')}'`,
    })),
    styles: frame.styles.map((text) => ({
      text,
      hash: `'sha256-${createHash('sha256').update(text).digest('base64')}'`,
    })),
  }));
  const report = {
    baseURL,
    route: '/explore',
    before,
    after: { consoleErrors, frames: withHashes },
    axeViolations: axe.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target),
    })),
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({
    beforeConsole: before.consoleErrors.length,
    afterConsole: consoleErrors.length,
    postAxeCspFrames: withHashes.filter((frame) => frame.violations.length),
    hashes: withHashes.flatMap((frame) => [...frame.styles, ...frame.insertedStyles])
      .filter((style) => style.hash.includes('2iP')),
  }, null, 2));
} finally {
  await browser.close();
}
