/* global process, console, fetch, URL */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase = process.env.AUDIT_PHASE ?? 'deployed-version-7';
const directory = path.resolve(`audit/evidence/${phase}`);
await mkdir(directory, { recursive: true });
const response = await fetch(new URL('/data/catalog.json', base));
const payload = await response.json();
const result = {
  url: new URL('/data/catalog.json', base).toString(),
  status: response.status,
  contentType: response.headers.get('content-type'),
  contentLength: Number(response.headers.get('content-length')) || null,
  schemaVersion: payload.schemaVersion,
  catalogVersion: payload.catalogVersion,
  resourceCount: payload.resources.length,
  verifiedGoldCount: payload.resources.filter(resource => resource.status === 'verified-gold').length,
  loadedAt: new Date().toISOString(),
};
assert.equal(result.status, 200);
assert.equal(result.resourceCount, 324);
assert.equal(result.verifiedGoldCount, 40);
await writeFile(path.join(directory, 'catalog-load.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
