/* global window */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium, expect } from '@playwright/test';

const baseUrl = process.env.TESSELLATE_EXPORT_PREVIEW_URL ?? 'http://127.0.0.1:4173';
const outputDir = path.resolve(process.env.TESSELLATE_AUDIT_OUTPUT_DIR ?? 'audit/evidence/deployed-v14-flagship');
const exportDir = process.env.TESSELLATE_EXPORT_DIR;
if (!exportDir) throw new Error('TESSELLATE_EXPORT_DIR must point to the clean extracted export.');

const manifest = JSON.parse(await fs.readFile(path.join(exportDir, 'project.tess.json'), 'utf8'));
const packageJson = JSON.parse(await fs.readFile(path.join(exportDir, 'package.json'), 'utf8'));
const errors = { console: [], page: [], failedRequests: [], http: [] };
const browser = await chromium.launch({ headless: true });
const report = {
  previewUrl: baseUrl,
  exportDir,
  projectId: manifest.id,
  projectName: manifest.name,
  screenCount: manifest.screens?.length ?? null,
  packageName: packageJson.name,
  runtimeDependencies: packageJson.dependencies ?? {},
  hasTessellateRuntimeDependency: Object.keys(packageJson.dependencies ?? {}).some((name) => name.startsWith('@tessellate/')),
  viewports: [],
  errors,
};

function instrument(page, viewport) {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      errors.console.push({ level: message.type(), text: message.text(), url: message.location().url, viewport });
    }
  });
  page.on('pageerror', (error) => errors.page.push({ message: error.message, viewport }));
  page.on('requestfailed', (request) => errors.failedRequests.push({ url: request.url(), failure: request.failure()?.errorText, viewport }));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.http.push({ url: response.url(), status: response.status(), viewport });
  });
}

async function auditViewport({ width, height, mobile }) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const label = `${width}x${height}`;
  instrument(page, label);
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const projectScreens = page.getByRole('group', { name: 'Project screens' });
  await expect(projectScreens).toBeVisible();
  const nav = await projectScreens.evaluate((element) => {
    const buttons = [...element.querySelectorAll('button')];
    const tops = buttons.map((button) => Math.round(button.getBoundingClientRect().top));
    const styles = window.getComputedStyle(element);
    return {
      count: buttons.length,
      flexWrap: styles.flexWrap,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      buttonTopPositions: tops,
      singleRow: new Set(tops).size === 1,
    };
  });

  await projectScreens.getByRole('button', { name: 'Team Overview', exact: true }).click();
  await expect(page.locator('[data-screen-id="screen-overview"]')).toBeVisible();
  await expect(page.getByText('Your organisation at a glance', { exact: true })).toBeVisible();
  await projectScreens.getByRole('button', { name: 'Onboarding', exact: true }).click();
  await expect(page.locator('[data-screen-id="screen-onboarding"]')).toBeVisible();
  await expect(page.getByText('Welcome milestones', { exact: true })).toBeVisible();
  await expect(page.getByText('Your onboarding journey', { exact: true })).toBeVisible();
  const activeScreen = await page.locator('main > [data-screen-id]').getAttribute('data-screen-id');
  const renderedText = await page.locator('main').innerText();
  const noUnresolvedResources = !/(unresolved resource:|unknown resource:|missing component)/i.test(renderedText);
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: window.document.documentElement.scrollWidth, body: window.document.body.scrollWidth }));
  const screenshot = `standalone-export-${label}.png`;
  await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true });
  const result = {
    viewport: label,
    status: response?.status() ?? null,
    documentTitle: await page.title(),
    nav,
    activeScreen,
    onboardingContentPresent: true,
    noUnresolvedResources,
    dimensions,
    noHorizontalOverflow: dimensions.document <= width && dimensions.body <= width,
    screenshot,
  };
  report.viewports.push(result);
  await context.close();
  return result;
}

try {
  const desktop = await auditViewport({ width: 1440, height: 900, mobile: false });
  const mobile = await auditViewport({ width: 390, height: 844, mobile: true });
  report.summary = {
    standaloneHasNoTessellateRuntimeDependency: !report.hasTessellateRuntimeDependency,
    nineProjectScreensPresentInNavigation: desktop.nav.count === 9 && mobile.nav.count === 9,
    responsiveNavigationStaysInOneRow: desktop.nav.singleRow && mobile.nav.singleRow && mobile.nav.flexWrap === 'nowrap',
    projectScreensSwitchThroughUI: desktop.activeScreen === 'screen-onboarding' && mobile.activeScreen === 'screen-onboarding',
    noUnresolvedResources: desktop.noUnresolvedResources && mobile.noUnresolvedResources,
    desktopBuildLoads: desktop.status === 200,
    mobileNoHorizontalOverflow: mobile.noHorizontalOverflow,
    noConsoleErrors: errors.console.filter((item) => item.level === 'error').length === 0,
    noUncaughtErrors: errors.page.length === 0,
    noFailedRequests: errors.failedRequests.length === 0,
    noHttpErrors: errors.http.length === 0,
  };
  report.finishedAt = new Date().toISOString();
  await fs.writeFile(path.join(outputDir, 'standalone-runtime-audit.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ summary: report.summary, nav: report.viewports.map((item) => ({ viewport: item.viewport, nav: item.nav, dimensions: item.dimensions, activeScreen: item.activeScreen })), errors, outputDir }, null, 2)}\n`);
  if (Object.values(report.summary).some((value) => value === false)) process.exitCode = 1;
} finally {
  await browser.close();
}
