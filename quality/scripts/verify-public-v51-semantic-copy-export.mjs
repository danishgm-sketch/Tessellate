/* global document, window */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const baseExport = 'C:/Users/ismay/AppData/Local/Temp/tessellate-aud-175-v51';
const evidenceDir = path.resolve('quality/evidence/step-45/public-v51-recheck-2026-10-28/high-findings');
const fixturePath = path.join(os.tmpdir(), 'tessellate-aud-165-user-copy.tess.json');
const specialCopy = {
  header: `People's "Today" < overview`,
  metricTitle: `People's "headcount"`,
  actionLabel: `Invite "a colleague"`,
  statusText: 'New hires < starting this week & ready',
};
const manifest = JSON.parse(await fs.readFile(path.join(baseExport, 'project.tess.json'), 'utf8'));
manifest.screens[0].rootNode.children.unshift(
  {
    id: 'audit-user-authored-header',
    nodeType: 'component',
    semanticRole: 'navigation-header',
    props: { title: specialCopy.header },
    slots: {},
    children: [],
  },
  {
    id: 'audit-user-authored-metric',
    nodeType: 'component',
    semanticRole: 'metric-kpi',
    props: { title: specialCopy.metricTitle, value: '500 employees', change: '+8% this month' },
    slots: {},
    children: [],
  },
  {
    id: 'audit-user-authored-action',
    nodeType: 'component',
    semanticRole: 'action-button',
    props: { label: specialCopy.actionLabel },
    slots: {},
    children: [],
  },
  {
    id: 'audit-user-authored-status',
    nodeType: 'component',
    semanticRole: 'status-indicator',
    props: { className: 'sample-status', children: specialCopy.statusText },
    slots: {},
    children: [],
  },
);
await fs.writeFile(fixturePath, `${JSON.stringify(manifest, null, 2)}\n`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
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

let previewProcess;
try {
  await page.goto(`${site}/workbench`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('heading', { name: /Workbench: Example employee workspace/i }).waitFor({ timeout: 30000 });

  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Open Tessellate Manifest/i }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(fixturePath);
  await page.getByText(specialCopy.header, { exact: true }).waitFor({ timeout: 30000 });
  const workbenchVisibleCopy = await page.locator('main').innerText();
  for (const value of Object.values(specialCopy)) {
    if (!workbenchVisibleCopy.includes(value)) throw new Error(`Imported Workbench did not render authored value: ${value}`);
  }
  await page.screenshot({ path: path.join(evidenceDir, 'aud-165-public-workbench-authored-copy-1440.png'), fullPage: true });

  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download Standalone React Project/i }).click();
  const download = await downloadPromise;
  const zipPath = path.join(os.tmpdir(), `tessellate-aud-165-${Date.now()}.zip`);
  await download.saveAs(zipPath);

  const exportedDir = fs.mkdtemp(path.join(os.tmpdir(), 'tessellate-aud-165-clean-'));
  const resolvedExportDir = await exportedDir;
  execSync(`python -c "import zipfile; z=zipfile.ZipFile(r'${zipPath}'); names=z.namelist(); assert all(not n.startswith(('\\\\','/')) and '..' not in n.replace('\\\\','/').split('/') for n in names); z.extractall(r'${resolvedExportDir}')"`, { stdio: 'pipe' });
  const packageJson = JSON.parse(await fs.readFile(path.join(resolvedExportDir, 'package.json'), 'utf8'));
  const runtimeDependencies = Object.keys(packageJson.dependencies ?? {});
  if (runtimeDependencies.some(name => name.startsWith('@tessellate/'))) throw new Error('Standalone package has a Tessellate runtime dependency');

  execSync('pnpm install --no-frozen-lockfile --ignore-scripts', { cwd: resolvedExportDir, stdio: 'pipe', timeout: 180000 });
  execSync('pnpm build', { cwd: resolvedExportDir, stdio: 'pipe', timeout: 180000 });
  previewProcess = spawn('cmd.exe', ['/d', '/s', '/c', 'pnpm exec vite preview --host 127.0.0.1 --port 4176'], {
    cwd: resolvedExportDir,
    windowsHide: true,
    stdio: 'ignore',
  });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await globalThis.fetch('http://127.0.0.1:4176/');
      if (response.ok) { ready = true; break; }
    } catch { /* Vite is still starting. */ }
    await delay(500);
  }
  if (!ready) throw new Error('Standalone preview server did not become ready');

  const standalone = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  standalone.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(`standalone: ${message.text()}`);
  });
  standalone.on('pageerror', error => pageErrors.push(`standalone: ${error.message}`));
  standalone.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
  standalone.on('response', response => {
    if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
  });
  await standalone.goto('http://127.0.0.1:4176/', { waitUntil: 'networkidle' });
  const desktopText = await standalone.locator('body').innerText();
  for (const value of Object.values(specialCopy)) {
    if (!desktopText.includes(value)) throw new Error(`Standalone app did not preserve authored value: ${value}`);
  }
  await standalone.screenshot({ path: path.join(evidenceDir, 'aud-165-standalone-desktop-authored-copy-1440.png'), fullPage: true });
  const desktopGeometry = await standalone.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));

  await standalone.setViewportSize({ width: 390, height: 844 });
  await standalone.reload({ waitUntil: 'networkidle' });
  const mobileText = await standalone.locator('body').innerText();
  for (const value of Object.values(specialCopy)) {
    if (!mobileText.includes(value)) throw new Error(`Mobile standalone app did not preserve authored value: ${value}`);
  }
  await standalone.screenshot({ path: path.join(evidenceDir, 'aud-165-standalone-mobile-authored-copy-390.png'), fullPage: true });
  const mobileGeometry = await standalone.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));

  const report = {
    source: 'Public v51 Workbench UI import and standalone export; clean extraction outside repository dependencies.',
    site: `${site}/workbench`,
    projectId: manifest.id,
    fixture: path.basename(fixturePath),
    valuesVerified: specialCopy,
    cleanInstall: 'passed',
    build: 'passed',
    runtime: 'passed',
    runtimeDependencies,
    desktopGeometry,
    mobileGeometry,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    screenshots: [
      'aud-165-public-workbench-authored-copy-1440.png',
      'aud-165-standalone-desktop-authored-copy-1440.png',
      'aud-165-standalone-mobile-authored-copy-390.png',
    ],
  };
  await fs.writeFile(path.join(evidenceDir, 'aud-165-public-runtime.json'), `${JSON.stringify(report, null, 2)}\n`);
  if (desktopGeometry.width > desktopGeometry.viewport || mobileGeometry.width > mobileGeometry.viewport) throw new Error('Standalone app overflowed a target viewport');
  if (consoleErrors.length || pageErrors.length || failedRequests.length || badResponses.length) throw new Error('Browser runtime errors or failed requests detected');
  globalThis.console.log(JSON.stringify(report, null, 2));
} finally {
  if (previewProcess && !previewProcess.killed) previewProcess.kill();
  await browser.close();
}
