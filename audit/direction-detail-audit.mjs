/* global process, console */
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase = process.env.AUDIT_PHASE ?? 'deployed-version-7';
const directory = path.resolve(`audit/evidence/${phase}/directions`);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const events = { exceptions: [], console: [], network: [], http: [] };
page.on('pageerror', error => events.exceptions.push(error.message));
page.on('console', message => { if (['warning', 'error'].includes(message.type())) events.console.push({ level: message.type(), text: message.text() }); });
page.on('requestfailed', request => events.network.push({ url: request.url(), failure: request.failure()?.errorText }));
page.on('response', response => { if (response.status() >= 400) events.http.push({ url: response.url(), status: response.status() }); });
const catalogResponse = await page.request.get(`${base}/data/catalog.json`);
assert.equal(catalogResponse.status(), 200, 'Catalogue must be available.');
const catalog = await catalogResponse.json();
const resources = new Map(catalog.resources.map(resource => [resource.slug, resource]));
const walk = node => node ? [node, ...(node.children ?? []).flatMap(walk), ...Object.values(node.slots ?? {}).flatMap(slot => Array.isArray(slot) ? slot.flatMap(walk) : walk(slot))] : [];
const observations = [];

try {
  await page.goto(`${base}/compose/`);
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.getByLabel('Product Description & Objectives').fill('Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.');
  await page.getByLabel('Desired Feel / Adjectives').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Inventive', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    await expect(card).toBeVisible();
    await card.screenshot({ path: path.join(directory, `direction-${number}-card.png`) });
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Direction preview screen')).toBeVisible();
    const selectedScreen = await dialog.getByLabel('Direction preview screen').inputValue();
    await dialog.locator('summary', { hasText: 'Design DNA and resource references' }).click();
    const json = JSON.parse((await dialog.locator('pre').textContent()) ?? 'null');
    const screens = json.screens ?? [];
    const nodes = screens.flatMap(screen => walk(screen.rootNode));
    const refs = nodes.map(node => node.resourceRef).filter(Boolean);
    const missing = refs.filter(ref => !resources.has(ref.slug));
    const synthetic = refs.filter(ref => /synthetic/i.test(JSON.stringify(ref)) || ref.synthetic === true);
    const unresolved = nodes.filter(node => node.props?.unresolvedRequiredRole);
    const detail = {
      number,
      projectId: json.id,
      dna: json.dna,
      navigation: json.navigation,
      grammar: json.grammar,
      selectedScreen,
      screenCount: screens.length,
      screens: screens.map(screen => ({ id: screen.id, slug: screen.slug, name: screen.name, resourceSlugs: walk(screen.rootNode).map(node => node.resourceRef?.slug).filter(Boolean) })),
      resourceSlugs: [...new Set(refs.map(ref => ref.slug))],
      missing,
      synthetic,
      goldRefCount: refs.filter(ref => resources.get(ref.slug)?.status === 'verified-gold').length,
      unresolvedRequiredRoles: unresolved.map(node => ({ id: node.id, role: node.props.unresolvedRequiredRole })),
      diagnostics: json.diagnostics,
      renderedNodes: await dialog.locator('[data-node-id]').count(),
    };
    assert.equal(missing.length, 0, `Direction ${number} has unresolved resource refs.`);
    assert.equal(synthetic.length, 0, `Direction ${number} has synthetic refs.`);
    assert.equal(unresolved.length, 0, `Direction ${number} has unresolved required roles.`);
    assert(detail.renderedNodes > 0, `Direction ${number} renderer is empty.`);
    await dialog.screenshot({ path: path.join(directory, `direction-${number}-full-preview.png`) });
    observations.push(detail);
    await writeFile(path.join(directory, `direction-${number}.json`), JSON.stringify(detail, null, 2));
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    console.log(JSON.stringify({ number, projectId: detail.projectId, navigation: detail.navigation, grammar: detail.grammar, screens: detail.screenCount, resourceRefs: refs.length, missing: missing.length, synthetic: synthetic.length, unresolved: unresolved.length, renderedNodes: detail.renderedNodes }));
  }
  const signatures = observations.map(direction => JSON.stringify({ navigation: direction.navigation, grammar: direction.grammar, screens: direction.screens.map(screen => ({ slug: screen.slug, resourceSlugs: screen.resourceSlugs })) }));
  assert.equal(new Set(signatures).size, 3, 'All three directions must differ structurally, beyond title or palette.');
  assert.deepEqual(events, { exceptions: [], console: [], network: [], http: [] });
  await writeFile(path.join(directory, 'results.json'), JSON.stringify({ url: page.url(), viewport: '1440x900', phase, observations, signaturesDistinct: new Set(signatures).size, events }, null, 2));
} finally {
  await browser.close();
}
