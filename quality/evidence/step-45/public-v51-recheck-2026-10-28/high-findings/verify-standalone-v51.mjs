/* global document, location, window */

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const evidenceDir = path.join(root, 'quality/evidence/step-45/public-v51-recheck-2026-10-28/high-findings');
const exportDir = 'C:/Users/ismay/AppData/Local/Temp/tessellate-aud-175-v51';
const manifest = JSON.parse(await fs.readFile(path.join(exportDir, 'project.tess.json'), 'utf8'));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const badResponses = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', error => pageErrors.push(error.message));
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
page.on('response', response => {
  if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
});

try {
  const response = await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
  if (response?.status() !== 200) throw new Error(`Standalone app returned ${response?.status()}`);
  await page.screenshot({ path: path.join(evidenceDir, 'aud-175-standalone-desktop-1440.png'), fullPage: true });

  const desktop = await page.evaluate(() => {
    const navs = [...document.querySelectorAll('nav')];
    return {
      title: document.title,
      heading: document.querySelector('main h1')?.textContent?.trim() ?? null,
      navigationRegions: navs.length,
      navigationLinks: navs.flatMap(nav => [...nav.querySelectorAll('a')].map(link => ({ label: link.textContent.trim(), href: link.getAttribute('href') }))),
      duplicateNavigationLinks: navs.flatMap(nav => [...nav.querySelectorAll('a')].map(link => link.getAttribute('href')))
        .filter((href, index, all) => all.indexOf(href) !== index),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  const declaredPrimary = manifest.navigation.primaryItems.map(item => ({
    label: item.label,
    href: `#${item.targetScreenId}`,
  }));
  const undeclaredOnboardingLinkInNavigation = await page.locator('nav a[href="#screen-onboarding"]').count();
  const onboardingCta = page.getByRole('link', { name: /Explore onboarding/i }).first();
  await onboardingCta.click();
  await page.waitForFunction(() => location.hash === '#screen-onboarding');
  const onboardingText = await page.locator('main').innerText();
  if (!onboardingText.trim()) throw new Error('Onboarding destination rendered no content');
  await page.screenshot({ path: path.join(evidenceDir, 'aud-175-standalone-onboarding-1440.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
  const mobile = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    navigationRegions: document.querySelectorAll('nav').length,
    heading: document.querySelector('main h1')?.textContent?.trim() ?? null,
  }));
  await page.screenshot({ path: path.join(evidenceDir, 'aud-175-standalone-mobile-390.png'), fullPage: true });

  const report = {
    source: 'Standalone ZIP exported from public Sites v51; extracted outside the repository and clean-installed before build.',
    sourceSite: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
    projectId: manifest.id,
    manifestPrimaryNavigation: declaredPrimary,
    desktop,
    undeclaredOnboardingLinkInNavigation,
    onboardingDestinationHasContent: Boolean(onboardingText.trim()),
    mobile,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    cleanBuild: 'passed (pnpm build)',
    runtime: 'passed (Vite preview at 127.0.0.1:4175)',
    screenshots: [
      'aud-175-standalone-desktop-1440.png',
      'aud-175-standalone-onboarding-1440.png',
      'aud-175-standalone-mobile-390.png',
    ],
  };
  await fs.writeFile(path.join(evidenceDir, 'aud-175-standalone-runtime.json'), `${JSON.stringify(report, null, 2)}\n`);
  if (desktop.duplicateNavigationLinks.length) throw new Error(`Duplicate navigation links: ${JSON.stringify(desktop.duplicateNavigationLinks)}`);
  if (undeclaredOnboardingLinkInNavigation) throw new Error('Undeclared onboarding screen appeared in project navigation');
  if (desktop.documentWidth > desktop.viewportWidth || mobile.documentWidth > mobile.viewportWidth) throw new Error('Exported app overflowed its viewport');
  if (consoleErrors.length || pageErrors.length || failedRequests.length || badResponses.length) throw new Error('Browser runtime errors or failed requests detected');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
