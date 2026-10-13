/* global process, console, URL, structuredClone */
import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase = process.env.AUDIT_PHASE ?? 'deployed-version-7';
const directory = path.resolve(`audit/evidence/${phase}/showcase-stability`);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const events = { exceptions: [], console: [], network: [], http: [] };
page.on('pageerror', error => events.exceptions.push(error.message));
page.on('console', message => { if (['warning', 'error'].includes(message.type())) events.console.push({ level: message.type(), text: message.text() }); });
page.on('requestfailed', request => events.network.push({ url: request.url(), failure: request.failure()?.errorText }));
page.on('response', response => { if (response.status() >= 400) events.http.push({ url: response.url(), status: response.status() }); });
const route = `${base}/showcase/showcase-playful-hr/`;
async function downloadManifest(name) {
  const downloadPending = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download exact example manifest' }).click();
  const download = await downloadPending;
  const destination = path.join(directory, `${name}.tess.json`);
  await download.saveAs(destination);
  return JSON.parse(await readFile(destination, 'utf8'));
}

try {
  const manifests = [];
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const width = attempt === 1 ? 1440 : 390;
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    const response = await page.goto(route);
    assert.equal(response?.status(), 200);
    await expect(page.getByRole('link', { name: 'Edit a local copy in Workbench' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download exact example manifest' })).toBeVisible();
    await page.screenshot({ path: path.join(directory, `showcase-playful-hr-${width}.png`) });
    manifests.push(await downloadManifest(`attempt-${attempt}`));
  }
  assert.equal(manifests[0].id, manifests[1].id);
  assert.deepEqual(manifests[0].designDNA, manifests[1].designDNA);
  assert.deepEqual(manifests[0].screens, manifests[1].screens);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  const handoff = await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).getAttribute('href');
  assert(handoff);
  assert.equal(new URL(handoff, base).searchParams.get('showcase'), 'showcase-playful-hr');
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await page.screenshot({ path: path.join(directory, 'showcase-workbench-handoff.png') });
  await page.getByTestId('export-button').click();
  const manifestPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const manifestDownload = await manifestPending;
  const workbenchManifestPath = path.join(directory, 'workbench-handoff.tess.json');
  await manifestDownload.saveAs(workbenchManifestPath);
  const workbenchManifest = JSON.parse(await readFile(workbenchManifestPath, 'utf8'));
  assert.notEqual(workbenchManifest.id, manifests[0].id, 'A showcase handoff must become an independent local copy.');
  const stripId = manifest => { const copy = structuredClone(manifest); delete copy.id; return copy; };
  const showcaseContent = stripId(manifests[0]);
  const localContent = stripId(workbenchManifest);
  assert.deepEqual(localContent, showcaseContent, 'Workbench local copy must preserve the downloaded showcase content.');
  assert.deepEqual(workbenchManifest.designDNA, manifests[0].designDNA);
  assert.deepEqual(workbenchManifest.screens, manifests[0].screens);
  const errorCount = events.exceptions.length + events.console.length + events.network.length + events.http.length;
  assert.equal(errorCount, 0);
  const result = {
    route,
    viewport: ['1440x900', '390x844'],
    httpStatus: 200,
    repeatedManifestIdentityStable: manifests[0].id === manifests[1].id,
    repeatedDesignDNAStable: JSON.stringify(manifests[0].designDNA) === JSON.stringify(manifests[1].designDNA),
    repeatedScreensStable: JSON.stringify(manifests[0].screens) === JSON.stringify(manifests[1].screens),
    projectId: manifests[0].id,
    localCopyId: workbenchManifest.id,
    screenCount: manifests[0].screens.length,
    handoff,
    workbenchURL: page.url(),
    handoffManifestContentMatches: JSON.stringify(localContent) === JSON.stringify(showcaseContent),
    events,
  };
  await writeFile(path.join(directory, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
