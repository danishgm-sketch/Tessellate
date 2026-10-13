/* global process, console, fetch, URL */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase = process.env.AUDIT_PHASE ?? 'deployed-version-7';
const directory = path.resolve(`audit/evidence/${phase}`);
await mkdir(directory, { recursive: true });
const paths = ['/', '/preview/?resource=button', '/r/button/'];
const observations = [];
for (const route of paths) {
  const response = await fetch(new URL(route, base));
  const headers = Object.fromEntries(['content-security-policy', 'x-content-type-options', 'referrer-policy', 'x-frame-options', 'permissions-policy', 'content-type'].map(name => [name, response.headers.get(name)]));
  const entry = { route, status: response.status, headers };
  assert.equal(response.status, 200);
  assert(headers['content-security-policy']?.length > 0);
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.equal(headers['x-frame-options'], 'SAMEORIGIN');
  observations.push(entry);
}
const result = { url: base, version: 7, observations };
await writeFile(path.join(directory, 'security-headers.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
