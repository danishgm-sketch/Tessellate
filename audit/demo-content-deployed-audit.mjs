/* global process, console, document */
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase = process.env.AUDIT_PHASE ?? 'deployed-version-5';
const mode = process.env.AUDIT_CONTENT_BEFORE === '1' ? 'before' : 'after';
const before = mode === 'before';
const directory = `audit/evidence/${phase}/demo-content`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const events = { exceptions: [], console: [], network: [] };
page.on('pageerror', error => events.exceptions.push(error.message));
page.on('console', message => {
  if (['error', 'warning'].includes(message.type())) events.console.push({ level: message.type(), text: message.text() });
});
page.on('requestfailed', request => events.network.push({ url: request.url(), error: request.failure()?.errorText }));
const slugs = [
  'case-study-spotlight', 'customer-story-split', 'logo-cloud-minimal', 'executive-summary-panel',
  'status-overview', 'cta-demo-booking', 'upgrade-prompt', 'offline-state',
  'architecture-diagram-section', 'footer-developer', 'cta-download', 'product-screenshot-hero',
  'comparison-table', 'faq-two-column',
  'feature-grid-3x2', 'ai-generation-compare', 'editorial-hero',
];
const observations = [];
const forbidden = {
  'case-study-spotlight': /KRONOS|Kronos|4\.2x|140 disparate components/,
  'customer-story-split': /Helios|robotics dashboard|telemetry interface|under 20ms/,
  'logo-cloud-minimal': /Acme Corp|Starlight Data|Hyperion|Vertex Labs|Nexus AI/,
  'executive-summary-panel': /All telemetry targets exceeded|zero security anomalies|100% uptime sustained/,
  'status-overview': /100% OPERATIONAL|Core Engine API|Authentication OAuth/,
  'cta-demo-booking': /Available Times \(Tomorrow\)|Speak with our core team/,
  'upgrade-prompt': /TEAM PRO|Cloud Team Checkpoints|unlimited teammates/,
  'offline-state': /securely saved|IndexedDB|cloud synchronization will resume/i,
  'architecture-diagram-section': /sub-millisecond routing|Encrypted checkpoints|D1 \+ R2 Registry/,
  'footer-developer': /c4b2a9f|Edge: 100% OK|Latency: 0\.8ms/,
  'cta-download': /1\.0\.0 RELEASE READY|brew install tessellate|npm install @tessellate\/cli/,
  'product-screenshot-hero': /workbench\.tessellate\.design|324 validated resources|Real-time token synchronization/,
  'comparison-table': /Tessellate Pure|Generic Alternative|0\.4 ms|2\.1 ms/,
  'faq-two-column': /IndexedDB persistence|running fully offline|Every resource is immutable/,
  'feature-grid-3x2': /Sub-Millisecond Parsing|Meets WCAG 2\.2 AA|optional GitHub OAuth for cloud sync/,
  'ai-generation-compare': /Latency: 420ms|Latency: 510ms|Cohesion: 92\/100|Cohesion: 98\/100/,
  'editorial-hero': /Announcing Version 2\.0|sub-millisecond execution/,
};
const needsConfiguredAction = new Set(['case-study-spotlight', 'customer-story-split', 'upgrade-prompt', 'cta-download', 'product-screenshot-hero']);
try {
  for (const slug of slugs) {
    for (const width of [1440, 390]) {
      const height = width === 390 ? 844 : 900;
      await page.setViewportSize({ width, height });
      const response = await page.goto(`${base}/preview/?resource=${slug}`);
      await page.locator(`[data-node-id="preview-${slug}"]`).waitFor();
      await page.waitForLoadState('networkidle');
      const beforeText = await page.locator('body').innerText();
      const screenshot = `${directory}/${slug}-${width}.png`;
      await page.screenshot({ path: screenshot });
      const buttonEvidence = [];
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.equal(response.status(), 200, `${slug} HTTP status`);
      assert.ok(scrollWidth <= width, `${slug} horizontal overflow at ${width}px: ${scrollWidth}px`);
      if (!before) {
        assert.doesNotMatch(beforeText, forbidden[slug] ?? /$a/, `${slug} contains an unqualified claim`);
        if (needsConfiguredAction.has(slug) && width === 1440) {
          const action = page.getByRole('button').last();
          await action.waitFor();
          await action.isDisabled().then(disabled => assert.equal(disabled, true, `${slug} must be disabled until configured`));
        }
      }
      if (width === 1440) {
        if (!before && slug === 'cta-demo-booking') {
          const slot = page.getByRole('button', { name: '11:30 AM' });
          await slot.click();
          await expect(slot).toHaveAttribute('aria-pressed', 'true');
          await expect(page.getByRole('button', { name: 'Booking not configured' })).toBeDisabled();
        }
        if (!before && slug === 'ai-generation-compare') {
          const candidate = page.getByRole('button', { name: 'Select A' });
          await candidate.click();
          await expect(page.getByRole('button', { name: '✓ Selected' })).toHaveAttribute('aria-pressed', 'true');
        }
        const buttons = page.getByRole('button');
        const buttonCount = await buttons.count();
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          if (!(await button.isVisible())) continue;
          const label = (await button.innerText()).trim();
          const disabled = await button.isDisabled();
          const urlBefore = page.url();
          if (!disabled) await button.click({ timeout: 2000 });
          buttonEvidence.push({
            label,
            disabled,
            urlBefore,
            urlAfter: page.url(),
            textChanged: (await page.locator('body').innerText()) !== beforeText,
          });
        }
      }
      observations.push({ slug, url: page.url(), httpStatus: response.status(), viewport: `${width}x${height}`, text: beforeText, scrollWidth, buttons: buttonEvidence, screenshot });
      await writeFile(`${directory}/${mode}-results.json`, JSON.stringify({ mode, observations, events }, null, 2));
      console.log(JSON.stringify({ slug, width, status: response.status(), buttons: buttonEvidence.length, screenshot }));
    }
  }
  if (!before) assert.deepEqual(events, { exceptions: [], console: [], network: [] });
} finally {
  await browser.close();
}
