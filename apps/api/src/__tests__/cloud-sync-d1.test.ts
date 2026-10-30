import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { validProjectFixture } from '@tessellate/schemas';
import { createHmac, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import app from '../index.js';
import type { Env } from '../types.js';
import { testAuthBearer, testAuthEnv } from './test-auth-fixture.js';

function createProjectManifest(id: string, name: string, description = 'D1 cloud project test fixture') {
  return { ...structuredClone(validProjectFixture), id, name, description };
}

describe('D1 cloud project ownership and optimistic concurrency', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'tessellate-cloud-sync-'));
  const config = {
    modules: true,
    script: 'export default { fetch() { return new Response("D1 test binding"); } }',
    d1Databases: { DB: 'tessellate-cloud-test' },
    d1Persist: directory,
    compatibilityDate: '2026-05-15',
  };
  const alice = 'test-user-cloud-alice';
  const bob = 'test-user-cloud-bob';
  let miniflare: Miniflare;
  let env: Env;
  const request = (url: string, init?: RequestInit) => app.request(url, init, env);

  async function signedSessionCookie(token: string, secret: string): Promise<string> {
    const signature = createHmac('sha256', secret).update(token).digest('base64');
    return `__Secure-better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`;
  }

  beforeAll(async () => {
    miniflare = new Miniflare(config);
    env = { DB: await miniflare.getD1Database('DB'), ...testAuthEnv };
    const migration = readFileSync(
      new URL('../../migrations/0001_initial.sql', import.meta.url),
      'utf8'
    );
    const statements = migration
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);
    await env.DB!.batch(statements.map((statement) => env.DB!.prepare(statement)));

    const now = Math.floor(Date.now() / 1000);
    await env.DB!.batch(
      [alice, bob].map((id) =>
        env
          .DB!.prepare(
            'INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
          )
          .bind(id, id, `${id}@tessellate.test`, 0, now, now)
      )
    );
  }, 30_000);

  afterAll(async () => {
    await miniflare?.dispose();
    const expectedPrefix = path.join(tmpdir(), 'tessellate-cloud-sync-');
    if (!directory.startsWith(expectedPrefix)) throw new Error('Unexpected D1 test directory');
    rmSync(directory, { recursive: true, force: true });
  });

  it('rejects profile specialty tags that violate their stored string-array contract', async () => {
    const response = await request('/api/me', {
      method: 'PUT',
      headers: { Authorization: testAuthBearer(alice), 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialtyTags: ['design systems', { label: 'unsafe value' }] }),
    });

    expect(response.status).toBe(400);
  });

  it('rejects malformed cloud project update JSON as invalid input', async () => {
    const response = await request('/api/projects/malformed-json-project', {
      method: 'PUT',
      headers: {
        Authorization: testAuthBearer(alice),
        'Content-Type': 'application/json',
      },
      body: '{"expectedRevision":1,,}',
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'Validation Error' });
  });

  it('rejects invalid revision summaries before saving and keeps the project history readable', async () => {
    const projectId = `proj_revision_summary_${randomUUID()}`;
    const name = 'Revision summary validation fixture';
    const manifest = createProjectManifest(projectId, name);
    const now = new Date().toISOString();
    const auth = { Authorization: testAuthBearer(alice) };

    await env.DB!.prepare(
      'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(projectId, alice, name, null, 1, JSON.stringify(manifest), 0, now, now).run();
    await env.DB!.prepare(
      'INSERT INTO project_revisions (id, projectId, revisionNumber, summary, manifestJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(`rev_${projectId}_1`, projectId, 1, 'Initial project creation', JSON.stringify(manifest), now).run();

    for (const summary of ['   ', 'x'.repeat(134)]) {
      const response = await request(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedRevision: 1, summary }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'Validation Error' });
    }

    const projectResponse = await request(`/api/projects/${projectId}`, { headers: auth });
    expect(projectResponse.status).toBe(200);
    expect(await projectResponse.json()).toMatchObject({ project: { currentRevision: 1 } });
    const historyResponse = await request(`/api/projects/${projectId}/revisions`, { headers: auth });
    expect(historyResponse.status).toBe(200);
    expect(await historyResponse.json()).toMatchObject({
      revisions: [{ revisionNumber: 1, summary: 'Initial project creation' }],
    });

    await env.DB!.batch([
      env.DB!.prepare('DELETE FROM project_revisions WHERE projectId = ?').bind(projectId),
      env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(projectId),
    ]);
  });

  it('rejects oversized descriptions inherited from a project manifest on creation', async () => {
    const projectId = `proj_inherited_create_description_${randomUUID()}`;
    const name = 'Inherited create description fixture';
    const manifest = createProjectManifest(projectId, name, 'x'.repeat(2001));
    const auth = { Authorization: testAuthBearer(alice), 'Content-Type': 'application/json' };

    try {
      const response = await request('/api/projects', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ id: projectId, name, manifest }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'Validation Error' });
    } finally {
      await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });
    }
  }, 30000);

  it('rejects metadata inherited from an oversized project manifest before saving an update', async () => {
    const projectId = `proj_inherited_metadata_${randomUUID()}`;
    const name = 'Inherited metadata validation fixture';
    const manifest = createProjectManifest(projectId, name);
    const auth = { Authorization: testAuthBearer(alice), 'Content-Type': 'application/json' };
    const create = await request('/api/projects', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ id: projectId, name, manifest }),
    });
    expect(create.status).toBe(201);

    try {
      const oversizedManifests = [
        { ...manifest, name: 'x'.repeat(121) },
        { ...manifest, description: 'x'.repeat(2001) },
      ];
      for (const invalidManifest of oversizedManifests) {
        const response = await request(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: auth,
          body: JSON.stringify({ expectedRevision: 1, manifest: invalidManifest }),
        });
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: 'InvalidProjectManifest' });
      }

      const current = await request(`/api/projects/${projectId}`, { headers: auth });
      expect(current.status).toBe(200);
      expect(await current.json()).toMatchObject({
        project: { name, currentRevision: 1, description: 'D1 cloud project test fixture' },
      });
      const revisions = await request(`/api/projects/${projectId}/revisions`, { headers: auth });
      expect(revisions.status).toBe(200);
      expect(await revisions.json()).toMatchObject({ revisions: [{ revisionNumber: 1 }] });
    } finally {
      await request(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: auth,
      });
    }
  }, 30000);

  it('rejects malformed JSON consistently across D1-backed mutation routes', async () => {
    const malformedJson = '{"broken":';
    const authorization = testAuthBearer(alice);
    const routes = [
      { method: 'POST', path: '/api/projects', authenticated: true },
      { method: 'PUT', path: '/api/projects/malformed-json-project', authenticated: true },
      { method: 'POST', path: '/api/projects/malformed-json-project/revisions', authenticated: true },
      { method: 'POST', path: '/api/projects/malformed-json-project/publish', authenticated: true },
      { method: 'PUT', path: '/api/me', authenticated: true },
      { method: 'POST', path: '/api/favorites', authenticated: true },
      { method: 'POST', path: '/api/collections', authenticated: true },
      { method: 'POST', path: '/api/collections/malformed-json-collection/items', authenticated: true },
      { method: 'POST', path: '/api/creator-links', authenticated: true },
      { method: 'POST', path: '/api/reports', authenticated: false },
    ] as const;

    for (const route of routes) {
      const response = await request(route.path, {
        method: route.method,
        headers: {
          'Content-Type': 'application/json',
          ...(route.authenticated ? { Authorization: authorization } : {}),
        },
        body: malformedJson,
      });

      expect(response.status, `${route.method} ${route.path}`).toBe(400);
      expect(await response.json(), `${route.method} ${route.path}`).toMatchObject({ error: 'Validation Error' });
    }
  });

  it('requires a valid account session on every private D1 API route', async () => {
    const routes = [
      { method: 'GET', path: '/api/projects' },
      { method: 'POST', path: '/api/projects' },
      { method: 'GET', path: '/api/projects/private-project' },
      { method: 'PUT', path: '/api/projects/private-project' },
      { method: 'DELETE', path: '/api/projects/private-project' },
      { method: 'GET', path: '/api/projects/private-project/revisions' },
      { method: 'POST', path: '/api/projects/private-project/revisions' },
      { method: 'POST', path: '/api/projects/private-project/publish' },
      { method: 'PUT', path: '/api/me' },
      { method: 'GET', path: '/api/favorites' },
      { method: 'POST', path: '/api/favorites' },
      { method: 'DELETE', path: '/api/favorites/button' },
      { method: 'GET', path: '/api/collections' },
      { method: 'POST', path: '/api/collections' },
      { method: 'POST', path: '/api/collections/private-collection/items' },
      { method: 'DELETE', path: '/api/collections/private-collection/items/button' },
      { method: 'DELETE', path: '/api/collections/private-collection' },
      { method: 'POST', path: '/api/creator-links' },
      { method: 'DELETE', path: '/api/creator-links/private-link' },
    ] as const;

    for (const route of routes) {
      const response = await request(route.path, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
        body: ['POST', 'PUT'].includes(route.method) ? '{}' : undefined,
      });

      expect(response.status, `${route.method} ${route.path}`).toBe(401);
      expect(await response.json(), `${route.method} ${route.path}`).toMatchObject({ error: 'Unauthorized' });
    }
  });

  it('serves concurrent public D1 reads without 5xx responses or oversized payloads', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice), 'Content-Type': 'application/json' };
    let collectionId: string | undefined;
    let linkId: string | undefined;

    try {
      const createdProject = await request('/api/projects', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({
          id: projectId,
          name: 'Public GET load fixture',
          manifest: createProjectManifest(projectId, 'Public GET load fixture'),
        }),
      });
      expect(createdProject.status).toBe(201);

      const publishedResponse = await request(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: auth,
      });
      expect(publishedResponse.status).toBe(200);
      const published = await publishedResponse.json() as { slug: string };

      const collectionResponse = await request('/api/collections', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ name: 'Public GET load fixture', isPublic: true }),
      });
      expect(collectionResponse.status).toBe(201);
      collectionId = ((await collectionResponse.json()) as { collection: { id: string } }).collection.id;

      const linkResponse = await request('/api/creator-links', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ title: 'Load fixture', url: 'https://example.test/fixture' }),
      });
      expect(linkResponse.status).toBe(201);
      linkId = ((await linkResponse.json()) as { link: { id: string } }).link.id;

      const publicRoutes = [
        `/api/published/${published.slug}`,
        `/api/collections/${collectionId}`,
        `/api/creator-links/${alice}`,
      ];
      const responses = await Promise.all(
        Array.from({ length: 60 }, (_, index) => request(publicRoutes[index % publicRoutes.length]!))
      );
      const payloads = await Promise.all(responses.map((response) => response.text()));

      expect(responses.map((response) => response.status)).toEqual(Array(60).fill(200));
      expect(Math.max(...payloads.map((payload) => new TextEncoder().encode(payload).byteLength))).toBeLessThan(2 * 1024 * 1024);
    } finally {
      if (linkId) await request(`/api/creator-links/${linkId}`, { method: 'DELETE', headers: auth });
      if (collectionId) await request(`/api/collections/${collectionId}`, { method: 'DELETE', headers: auth });
      await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });
    }
  }, 30000);

  it('returns a controlled error when stored profile tags cannot be decoded', async () => {
    const now = new Date().toISOString();
    await env.DB!.prepare(
      'INSERT INTO profiles (userId, username, specialtyTags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(userId) DO UPDATE SET specialtyTags = excluded.specialtyTags'
    ).bind(alice, 'alice-profile-corruption', '{not-json', now, now).run();

    const response = await request('/api/me', { headers: { Authorization: testAuthBearer(alice) } });
    await env.DB!.prepare('DELETE FROM profiles WHERE userId = ?').bind(alice).run();

    expect(response.status).toBe(503);
  });

  it('does not return unsafe stored profile URLs through account or published-project reads', async () => {
    const auth = { Authorization: testAuthBearer(alice) };
    const projectId = `proj_${randomUUID()}`;
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: 'Profile safety fixture', manifest: createProjectManifest(projectId, 'Profile safety fixture') }),
    });
    expect(create.status).toBe(201);
    const publish = await request(`/api/projects/${projectId}/publish`, { method: 'POST', headers: auth });
    expect(publish.status).toBe(200);
    const published = await publish.json() as { slug: string };
    const now = new Date().toISOString();
    await env.DB!.prepare(`
      INSERT INTO profiles (userId, username, bio, avatarUrl, specialtyTags, githubHandle, isAvailableForWork, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET avatarUrl = excluded.avatarUrl, specialtyTags = excluded.specialtyTags
    `).bind(alice, 'alice', 'Profile safety fixture', 'javascript:alert(1)', '[]', null, 0, now, now).run();

    const accountRead = await request('/api/me', { headers: auth });
    const publishedRead = await request(`/api/published/${published.slug}`);
    await env.DB!.prepare('DELETE FROM profiles WHERE userId = ?').bind(alice).run();
    await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect(accountRead.status).toBe(503);
    expect(publishedRead.status).toBe(503);
    expect(await publishedRead.json()).toMatchObject({ error: 'Service Unavailable' });
  }, 30000);

  it('fails closed when published-project metadata has non-text stored fields', async () => {
    const auth = { Authorization: testAuthBearer(alice) };
    const projectId = `proj_${randomUUID()}`;
    const name = 'Published metadata safety fixture';
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name, manifest: createProjectManifest(projectId, name) }),
    });
    expect(create.status).toBe(201);
    const publish = await request(`/api/projects/${projectId}/publish`, { method: 'POST', headers: auth });
    expect(publish.status).toBe(200);
    const published = await publish.json() as { slug: string };
    await env.DB!.prepare("UPDATE published_projects SET name = CAST('Corrupt name' AS BLOB) WHERE slug = ?")
      .bind(published.slug).run();

    const publicRead = await request(`/api/published/${published.slug}`);
    const guestRemix = await request(`/api/published/${published.slug}/remix`, { method: 'POST' });
    await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect(publicRead.status).toBe(503);
    expect(guestRemix.status).toBe(503);
    expect(await publicRead.json()).toMatchObject({ error: 'Service Unavailable' });
  }, 30000);

  it('does not expose a private collection when its stored visibility flag is corrupt', async () => {
    const id = `col_${randomUUID()}`;
    const now = new Date().toISOString();
    await env.DB!.prepare(
      'INSERT INTO collections (id, userId, name, isPublic, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, alice, 'Private collection', 2, now, now).run();

    const guestRead = await request(`/api/collections/${id}`);
    const ownerList = await request('/api/collections', { headers: { Authorization: testAuthBearer(alice) } });
    await env.DB!.prepare('DELETE FROM collections WHERE id = ?').bind(id).run();

    expect(guestRead.status).toBe(503);
    expect(ownerList.status).toBe(503);
  });

  it('bounds anonymous reads of public collections with oversized item lists', async () => {
    const id = `col_${randomUUID()}`;
    const now = new Date().toISOString();
    await env.DB!.prepare(
      'INSERT INTO collections (id, userId, name, isPublic, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, alice, 'Large public collection', 1, now, now).run();

    for (let offset = 0; offset < 501; offset += 100) {
      const items = Array.from({ length: Math.min(100, 501 - offset) }, (_, index) => {
        const resourceSlug = `resource-${String(offset + index).padStart(3, '0')}`;
        return env.DB!.prepare(
          'INSERT INTO collection_items (id, collectionId, resourceSlug, createdAt) VALUES (?, ?, ?, ?)'
        ).bind(`ci_${id}_${resourceSlug}`, id, resourceSlug, now);
      });
      await env.DB!.batch(items);
    }

    const cappedWrite = await request(`/api/collections/${id}/items`, {
      method: 'POST',
      headers: { Authorization: testAuthBearer(alice), 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: 'another-item' }),
    });
    const response = await request(`/api/collections/${id}`);
    await env.DB!.prepare('DELETE FROM collections WHERE id = ?').bind(id).run();

    expect(cappedWrite.status).toBe(409);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'CollectionTooLarge' });
  }, 30_000);

  it('bounds anonymous creator-link listing when stored data exceeds its response limit', async () => {
    const now = new Date().toISOString();
    await env.DB!.batch(Array.from({ length: 21 }, (_, index) => env.DB!.prepare(
      'INSERT INTO creator_links (id, userId, title, url, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).bind(`cl_${alice}_${index}`, alice, `Link ${index}`, `https://example.com/${index}`, now)));

    const cappedWrite = await request('/api/creator-links', {
      method: 'POST',
      headers: { Authorization: testAuthBearer(alice), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Another link', url: 'https://example.com/another' }),
    });
    const response = await request(`/api/creator-links/${alice}`);
    await env.DB!.prepare('DELETE FROM creator_links WHERE userId = ?').bind(alice).run();

    expect(cappedWrite.status).toBe(409);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'CreatorLinksTooLarge' });
  });

  it('fails closed when a public creator-link record contains an unsafe URL', async () => {
    const id = `cl_${randomUUID()}`;
    const now = new Date().toISOString();
    await env.DB!.prepare('INSERT INTO creator_links (id, userId, title, url, createdAt) VALUES (?, ?, ?, ?, ?)')
      .bind(id, alice, 'Unsafe legacy link', 'javascript:alert(1)', now).run();
    const response = await request(`/api/creator-links/${alice}`);
    await env.DB!.prepare('DELETE FROM creator_links WHERE id = ?').bind(id).run();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'CreatorLinksDataUnavailable' });
  });

  it('fails closed when a public creator-link record has non-text stored fields', async () => {
    const id = `cl_${randomUUID()}`;
    const now = new Date().toISOString();
    await env.DB!.prepare(`
      INSERT INTO creator_links (id, userId, title, url, createdAt)
      VALUES (?, ?, CAST('Corrupt title' AS BLOB), ?, ?)
    `).bind(id, alice, 'https://example.com', now).run();

    const response = await request(`/api/creator-links/${alice}`);
    await env.DB!.prepare('DELETE FROM creator_links WHERE id = ?').bind(id).run();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'CreatorLinksDataUnavailable' });
  });

  it('does not let another account delete a public creator link', async () => {
    const id = `cl_${randomUUID()}`;
    const now = new Date().toISOString();
    await env.DB!.prepare('INSERT INTO creator_links (id, userId, title, url, createdAt) VALUES (?, ?, ?, ?, ?)')
      .bind(id, alice, 'Public portfolio', 'https://example.com/portfolio', now).run();

    const deniedDelete = await request(`/api/creator-links/${id}`, {
      method: 'DELETE',
      headers: { Authorization: testAuthBearer(bob) },
    });
    const remainsOwned = await env.DB!.prepare('SELECT id FROM creator_links WHERE id = ? AND userId = ?')
      .bind(id, alice).first();
    const ownerDelete = await request(`/api/creator-links/${id}`, {
      method: 'DELETE',
      headers: { Authorization: testAuthBearer(alice) },
    });

    expect(deniedDelete.status).toBe(404);
    expect(remainsOwned).not.toBeNull();
    expect(ownerDelete.status).toBe(200);
  });

  it('bounds authenticated favorite lists and rejects writes after the account ceiling', async () => {
    const now = new Date().toISOString();
    for (let offset = 0; offset < 501; offset += 100) {
      const favorites = Array.from({ length: Math.min(100, 501 - offset) }, (_, index) => {
        const resourceSlug = `resource-${String(offset + index).padStart(3, '0')}`;
        return env.DB!.prepare(
          'INSERT INTO favorites (id, userId, resourceSlug, createdAt) VALUES (?, ?, ?, ?)'
        ).bind(`fav_${alice}_${resourceSlug}`, alice, resourceSlug, now);
      });
      await env.DB!.batch(favorites);
    }

    const response = await request('/api/favorites', { headers: { Authorization: testAuthBearer(alice) } });
    const cappedWrite = await request('/api/favorites', {
      method: 'POST',
      headers: { Authorization: testAuthBearer(alice), 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: 'another-resource' }),
    });
    await env.DB!.prepare('DELETE FROM favorites WHERE userId = ?').bind(alice).run();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'FavoritesTooLarge' });
    expect(cappedWrite.status).toBe(409);
  }, 30_000);

  it('fails closed when saved favorites or public collections contain invalid resource slugs', async () => {
    const auth = { Authorization: testAuthBearer(alice) };
    const now = new Date().toISOString();
    const create = await request('/api/collections', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Corrupted resource references', isPublic: true }),
    });
    const created = await create.json() as { collection: { id: string } };
    const invalidSlug = '../private-resource';
    await env.DB!.batch([
      env.DB!.prepare('INSERT INTO collection_items (id, collectionId, resourceSlug, createdAt) VALUES (?, ?, ?, ?)')
        .bind(`ci_${created.collection.id}_invalid`, created.collection.id, invalidSlug, now),
      env.DB!.prepare('INSERT INTO favorites (id, userId, resourceSlug, createdAt) VALUES (?, ?, ?, ?)')
        .bind(`fav_${alice}_invalid`, alice, invalidSlug, now),
    ]);

    const collection = await request(`/api/collections/${created.collection.id}`);
    const favorites = await request('/api/favorites', { headers: auth });
    await env.DB!.batch([
      env.DB!.prepare('DELETE FROM collections WHERE id = ?').bind(created.collection.id),
      env.DB!.prepare('DELETE FROM favorites WHERE userId = ? AND resourceSlug = ?').bind(alice, invalidSlug),
    ]);

    expect(create.status).toBe(201);
    expect(collection.status).toBe(503);
    expect(await collection.json()).toMatchObject({ error: 'CollectionDataUnavailable' });
    expect(favorites.status).toBe(503);
    expect(await favorites.json()).toMatchObject({ error: 'FavoritesDataUnavailable' });
  }, 30000);

  it('fails closed when collection metadata contains non-text D1 values', async () => {
    const auth = { Authorization: testAuthBearer(alice) };
    const createdIds: string[] = [];
    for (const name of ['Corrupt collection name', 'Corrupt collection description']) {
      const response = await request('/api/collections', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isPublic: true }),
      });
      expect(response.status).toBe(201);
      createdIds.push(((await response.json()) as { collection: { id: string } }).collection.id);
    }

    await env.DB!.batch([
      env.DB!.prepare("UPDATE collections SET name = X'0102' WHERE id = ?").bind(createdIds[0]),
      env.DB!.prepare("UPDATE collections SET description = X'0304' WHERE id = ?").bind(createdIds[1]),
    ]);

    const list = await request('/api/collections', { headers: auth });
    const nameDetail = await request(`/api/collections/${createdIds[0]}`, { headers: auth });
    const descriptionDetail = await request(`/api/collections/${createdIds[1]}`, { headers: auth });
    await env.DB!.batch(createdIds.map((id) => env.DB!.prepare('DELETE FROM collections WHERE id = ?').bind(id)));

    expect(list.status).toBe(503);
    expect(await list.json()).toMatchObject({ error: 'CollectionDataUnavailable' });
    expect(nameDetail.status).toBe(503);
    expect(await nameDetail.json()).toMatchObject({ error: 'CollectionDataUnavailable' });
    expect(descriptionDetail.status).toBe(503);
    expect(await descriptionDetail.json()).toMatchObject({ error: 'CollectionDataUnavailable' });
  }, 30000);

  it('keeps cloud storage ceilings under simultaneous writes', async () => {
    const runId = randomUUID();
    const owner = `test-user-concurrent-${runId}`;
    const now = new Date().toISOString();
    const auth = { Authorization: testAuthBearer(owner) };
    const epoch = Math.floor(Date.now() / 1000);
    await env.DB!.prepare(
      'INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(owner, owner, `${owner}@tessellate.test`, 0, epoch, epoch).run();
    const collectionPrefix = `Concurrency ${runId}`;
    const seededCollectionIds = Array.from({ length: 98 }, (_, index) => `col_${runId}_${index}`);
    await env.DB!.batch(seededCollectionIds.map((id, index) => env.DB!.prepare(
      'INSERT INTO collections (id, userId, name, isPublic, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, owner, `${collectionPrefix} seeded ${index}`, 0, now, now)));

    const itemCollectionId = `col_items_${runId}`;
    await env.DB!.prepare(
      'INSERT INTO collections (id, userId, name, isPublic, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(itemCollectionId, owner, `${collectionPrefix} items`, 0, now, now).run();
    await env.DB!.batch(Array.from({ length: 499 }, (_, index) => {
      const slug = `concurrency-resource-${String(index).padStart(3, '0')}`;
      return env.DB!.prepare(
        'INSERT INTO collection_items (id, collectionId, resourceSlug, createdAt) VALUES (?, ?, ?, ?)'
      ).bind(`ci_${itemCollectionId}_${slug}`, itemCollectionId, slug, now);
    }));

    const seededFavoriteSlugs = Array.from({ length: 499 }, (_, index) => `concurrency-favorite-${String(index).padStart(3, '0')}`);
    await env.DB!.batch(seededFavoriteSlugs.map((slug) => {
      return env.DB!.prepare(
        'INSERT INTO favorites (id, userId, resourceSlug, createdAt) VALUES (?, ?, ?, ?)'
      ).bind(`fav_${owner}_${slug}`, owner, slug, now);
    }));
    const seededCreatorLinkIds = Array.from({ length: 19 }, (_, index) => `cl_${runId}_${index}`);
    await env.DB!.batch(seededCreatorLinkIds.map((id, index) => env.DB!.prepare(
      'INSERT INTO creator_links (id, userId, title, url, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, owner, `${collectionPrefix} link ${index}`, `https://example.com/${index}`, now)));

    const collectionWrites = await Promise.all(Array.from({ length: 8 }, (_, index) => request('/api/collections', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${collectionPrefix} new ${index}`, isPublic: false }),
    })));
    const itemWrites = await Promise.all(Array.from({ length: 8 }, (_, index) => request(`/api/collections/${itemCollectionId}/items`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: `concurrency-new-item-${index}` }),
    })));
    const favoriteWrites = await Promise.all(Array.from({ length: 8 }, (_, index) => request('/api/favorites', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: `concurrency-new-favorite-${index}` }),
    })));
    const creatorLinkWrites = await Promise.all(Array.from({ length: 8 }, (_, index) => request('/api/creator-links', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `${collectionPrefix} concurrent ${index}`, url: `https://example.com/concurrent-${index}` }),
    })));
    const createdCollectionIds = await Promise.all(collectionWrites.map(async (response) => {
      if (response.status !== 201) return null;
      const body = await response.json() as { collection: { id: string } };
      return body.collection.id;
    }));
    const createdCreatorLinkIds = await Promise.all(creatorLinkWrites.map(async (response) => {
      if (response.status !== 201) return null;
      const body = await response.json() as { link: { id: string } };
      return body.link.id;
    }));
    await env.DB!.batch([...seededCollectionIds, itemCollectionId, ...createdCollectionIds.filter((id): id is string => id !== null)]
      .map((id) => env.DB!.prepare('DELETE FROM collections WHERE id = ?').bind(id)));
    const favoriteSlugsToDelete = [...seededFavoriteSlugs, ...favoriteWrites.flatMap((response, index) => response.status === 201 ? [`concurrency-new-favorite-${index}`] : [])];
    await env.DB!.batch(favoriteSlugsToDelete.map((slug) => env.DB!.prepare(
      'DELETE FROM favorites WHERE userId = ? AND resourceSlug = ?'
    ).bind(owner, slug)));
    await env.DB!.batch([...seededCreatorLinkIds, ...createdCreatorLinkIds.filter((id): id is string => id !== null)]
      .map((id) => env.DB!.prepare('DELETE FROM creator_links WHERE id = ?').bind(id)));

    expect(collectionWrites.filter((response) => response.status === 201)).toHaveLength(1);
    expect(collectionWrites.filter((response) => response.status === 409)).toHaveLength(7);
    expect(createdCollectionIds.filter((id): id is string => id !== null)).toHaveLength(1);
    expect(itemWrites.filter((response) => response.status === 200)).toHaveLength(1);
    expect(itemWrites.filter((response) => response.status === 409)).toHaveLength(7);
    expect(favoriteWrites.filter((response) => response.status === 201)).toHaveLength(1);
    expect(favoriteWrites.filter((response) => response.status === 409)).toHaveLength(7);
    expect(creatorLinkWrites.filter((response) => response.status === 201)).toHaveLength(1);
    expect(creatorLinkWrites.filter((response) => response.status === 409)).toHaveLength(7);
  }, 30000);

  it('rejects project and revision lists that exceed their response ceilings', async () => {
    const now = new Date().toISOString();
    const auth = { Authorization: testAuthBearer(alice) };
    const projectIds: string[] = [];
    for (let offset = 0; offset < 101; offset += 100) {
      const projects = Array.from({ length: Math.min(100, 101 - offset) }, (_, index) => {
        const id = `proj_list_${randomUUID()}`;
        projectIds.push(id);
        return env.DB!.prepare(
          'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, alice, `List overflow fixture ${offset + index}`, null, 1, JSON.stringify(createProjectManifest(id, `List overflow fixture ${offset + index}`)), 0, now, now);
      });
      await env.DB!.batch(projects);
    }
    const projectList = await request('/api/projects', { headers: auth });
    const additionalProjectId = `proj_limit_${randomUUID()}`;
    const cappedCreate = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: additionalProjectId, name: 'At project limit', manifest: createProjectManifest(additionalProjectId, 'At project limit') }),
    });
    await env.DB!.batch(projectIds.map((id) => env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(id)));

    expect(projectList.status).toBe(503);
    expect(await projectList.json()).toMatchObject({ error: 'ProjectListTooLarge' });
    expect(cappedCreate.status).toBe(409);

    const projectId = `proj_${randomUUID()}`;
    await env.DB!.prepare(
      'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(projectId, alice, 'Large history fixture', null, 1, JSON.stringify(createProjectManifest(projectId, 'Large history fixture')), 0, now, now).run();

    for (let offset = 0; offset < 501; offset += 100) {
      const revisions = Array.from({ length: Math.min(100, 501 - offset) }, (_, index) => {
        const revisionNumber = offset + index + 1;
        return env.DB!.prepare(
          'INSERT INTO project_revisions (id, projectId, revisionNumber, summary, manifestJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(`rev_${projectId}_${revisionNumber}`, projectId, revisionNumber, `Revision ${revisionNumber}`, JSON.stringify(createProjectManifest(projectId, 'Large history fixture')), now);
      });
      await env.DB!.batch(revisions);
    }

    const response = await request(`/api/projects/${projectId}/revisions`, { headers: auth });
    const cappedCheckpoint = await request(`/api/projects/${projectId}/revisions`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: 'At history limit' }),
    });
    await env.DB!.prepare('UPDATE projects SET currentRevision = 500 WHERE id = ?').bind(projectId).run();
    const cappedSave = await request(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision: 500, name: 'At history limit' }),
    });
    await env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'ProjectHistoryTooLarge' });
    expect(cappedCheckpoint.status).toBe(409);
    expect(await cappedCheckpoint.json()).toMatchObject({ error: 'RevisionLimitReached' });
    expect(cappedSave.status).toBe(409);
    expect(await cappedSave.json()).toMatchObject({ error: 'RevisionLimitReached' });
  }, 30000);

  it('bounds aggregate project and revision response sizes', async () => {
    const now = new Date().toISOString();
    const auth = { Authorization: testAuthBearer(alice) };
    const projectIds: string[] = [];
    const largeManifest = (id: string, name: string, repeatedPayload = 'x', payloadLength = 1_000_000) => {
      const manifest = createProjectManifest(id, name);
      const screen = manifest.screens[0];
      if (!screen) throw new Error('The project fixture must contain a screen');
      screen.rootNode.props.auditPayload = repeatedPayload.repeat(payloadLength);
      return JSON.stringify(manifest);
    };

    const projects = Array.from({ length: 9 }, (_, index) => {
      const id = `proj_aggregate_${randomUUID()}`;
      projectIds.push(id);
      const name = `Aggregate response fixture ${index}`;
      return env.DB!.prepare(
        'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, alice, name, null, 1, largeManifest(id, name), 0, now, now);
    });
    await env.DB!.batch(projects);
    const projectResponse = await request('/api/projects', { headers: auth });
    await env.DB!.batch(projectIds.map((id) => env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(id)));

    const escapedProjectIds: string[] = [];
    const escapedProjects = Array.from({ length: 5 }, (_, index) => {
      const id = `proj_escaped_aggregate_${randomUUID()}`;
      escapedProjectIds.push(id);
      const name = `Escaped project response fixture ${index}`;
      return env.DB!.prepare(
        'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, alice, name, null, 1, largeManifest(id, name, '"', 600_000), 0, now, now);
    });
    await env.DB!.batch(escapedProjects);
    const escapedProjectBytes = await env.DB!.prepare(
      'SELECT SUM(length(CAST(manifestJson AS BLOB))) AS totalBytes FROM projects WHERE userId = ?'
    ).bind(alice).first<{ totalBytes: number }>();
    const escapedProjectResponse = await request('/api/projects', { headers: auth });
    await env.DB!.batch(escapedProjectIds.map((id) => env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(id)));

    const projectId = `proj_revision_aggregate_${randomUUID()}`;
    const revisionStatements = Array.from({ length: 9 }, (_, index) => {
      const revisionNumber = index + 1;
      return env.DB!.prepare(
        'INSERT INTO project_revisions (id, projectId, revisionNumber, summary, manifestJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(`rev_${projectId}_${revisionNumber}`, projectId, revisionNumber, `Large revision ${revisionNumber}`, largeManifest(projectId, `Large revision fixture ${revisionNumber}`), now);
    });
    await env.DB!.prepare(
      'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(projectId, alice, 'Revision aggregate fixture', null, 9, largeManifest(projectId, 'Revision aggregate fixture'), 0, now, now).run();
    await env.DB!.batch(revisionStatements);
    const revisionResponse = await request(`/api/projects/${projectId}/revisions`, { headers: auth });
    await env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run();

    const escapedProjectId = `proj_revision_escaped_aggregate_${randomUUID()}`;
    const escapedRevisionRows = Array.from({ length: 5 }, (_, index) => {
      const revisionNumber = index + 1;
      return env.DB!.prepare(
        'INSERT INTO project_revisions (id, projectId, revisionNumber, summary, manifestJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(`rev_${escapedProjectId}_${revisionNumber}`, escapedProjectId, revisionNumber, `Escaped revision ${revisionNumber}`, largeManifest(escapedProjectId, `Escaped revision fixture ${revisionNumber}`, '"', 600_000), now);
    });
    await env.DB!.prepare(
      'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(escapedProjectId, alice, 'Escaped revision fixture', null, 5, JSON.stringify(createProjectManifest(escapedProjectId, 'Escaped revision fixture')), 0, now, now).run();
    await env.DB!.batch(escapedRevisionRows);
    const escapedRevisionBytes = await env.DB!.prepare(
      'SELECT SUM(length(CAST(manifestJson AS BLOB))) AS totalBytes FROM project_revisions WHERE projectId = ?'
    ).bind(escapedProjectId).first<{ totalBytes: number }>();
    const escapedRevisionResponse = await request(`/api/projects/${escapedProjectId}/revisions`, { headers: auth });
    await env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(escapedProjectId).run();

    expect(projectResponse.status).toBe(503);
    expect(await projectResponse.json()).toMatchObject({ error: 'ProjectListTooLarge' });
    expect(escapedProjectBytes?.totalBytes).toBeLessThan(8 * 1024 * 1024);
    expect(escapedProjectResponse.status).toBe(503);
    expect(await escapedProjectResponse.json()).toMatchObject({ error: 'ProjectListTooLarge' });
    expect(revisionResponse.status).toBe(503);
    expect(await revisionResponse.json()).toMatchObject({ error: 'ProjectHistoryTooLarge' });
    expect(escapedRevisionBytes?.totalBytes).toBeLessThan(8 * 1024 * 1024);
    expect(escapedRevisionResponse.status).toBe(503);
    expect(await escapedRevisionResponse.json()).toMatchObject({ error: 'ProjectHistoryTooLarge' });
  }, 30000);

  it('does not let authenticated remixes bypass the cloud project ceiling', async () => {
    const aliceAuth = { Authorization: testAuthBearer(alice) };
    const bobAuth = { Authorization: testAuthBearer(bob) };
    const sourceId = `proj_remix_quota_${randomUUID()}`;
    const sourceName = 'P'.repeat(120);
    const sourceCreated = await request('/api/projects', {
      method: 'POST',
      headers: { ...bobAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sourceId, name: sourceName, manifest: createProjectManifest(sourceId, sourceName) }),
    });
    expect(sourceCreated.status).toBe(201);
    const sourcePublished = await request(`/api/projects/${sourceId}/publish`, { method: 'POST', headers: bobAuth });
    expect(sourcePublished.status).toBe(200);
    const slug = (await sourcePublished.json() as { slug: string }).slug;

    const now = new Date().toISOString();
    const projectIds: string[] = [];
    const rows = Array.from({ length: 100 }, (_, index) => {
      const id = `proj_remix_quota_existing_${randomUUID()}`;
      projectIds.push(id);
      const name = `Existing Alice project ${index}`;
      return env.DB!.prepare(
        'INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, alice, name, null, 1, JSON.stringify(createProjectManifest(id, name)), 0, now, now);
    });
    await env.DB!.batch(rows);

    const remix = await request(`/api/published/${slug}/remix`, { method: 'POST', headers: aliceAuth });
    const aliceProjects = await env.DB!.prepare('SELECT COUNT(*) AS count FROM projects WHERE userId = ?').bind(alice).first<{ count: number }>();
    const aliceRevisions = await env.DB!.prepare(
      'SELECT COUNT(*) AS count FROM project_revisions WHERE projectId IN (SELECT id FROM projects WHERE userId = ?)'
    ).bind(alice).first<{ count: number }>();

    expect(remix.status).toBe(409);
    expect(await remix.json()).toMatchObject({ error: 'ProjectLimitReached' });
    expect(aliceProjects?.count).toBe(100);
    expect(aliceRevisions?.count).toBe(0);

    await env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(projectIds[0]).run();
    const allowedRemix = await request(`/api/published/${slug}/remix`, { method: 'POST', headers: aliceAuth });
    const remixBody = await allowedRemix.json() as { projectId: string; manifest: { name: string } };
    expect(allowedRemix.status).toBe(201);
    expect(remixBody.manifest.name).toHaveLength(120);
    const savedRemix = await request(`/api/projects/${remixBody.projectId}`, { headers: aliceAuth });
    const savedRemixHistory = await request(`/api/projects/${remixBody.projectId}/revisions`, { headers: aliceAuth });
    expect(savedRemix.status).toBe(200);
    expect(savedRemixHistory.status).toBe(200);
    expect(await savedRemixHistory.json()).toMatchObject({ revisions: [{ revisionNumber: 1 }] });

    await env.DB!.batch(projectIds.map((id) => env.DB!.prepare('DELETE FROM projects WHERE id = ?').bind(id)));
    await request(`/api/projects/${remixBody.projectId}`, { method: 'DELETE', headers: aliceAuth });
    await request(`/api/projects/${sourceId}`, { method: 'DELETE', headers: bobAuth });
  }, 30000);

  it('rejects null checkpoint and invalid custom publish slug payloads', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice) };
    const created = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: 'Input boundary fixture', manifest: createProjectManifest(projectId, 'Input boundary fixture') }),
    });
    expect(created.status).toBe(201);

    const checkpoint = await request(`/api/projects/${projectId}/revisions`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(null),
    });
    const publish = await request(`/api/projects/${projectId}/publish`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customSlug: '../private-project' }),
    });
    await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect(checkpoint.status).toBe(400);
    expect(publish.status).toBe(400);
  });

  it('does not let another account overwrite an existing published project slug', async () => {
    const aliceProjectId = `proj_${randomUUID()}`;
    const bobProjectId = `proj_${randomUUID()}`;
    const aliceAuth = { Authorization: testAuthBearer(alice) };
    const bobAuth = { Authorization: testAuthBearer(bob) };
    const slug = `shared-review-${randomUUID().slice(0, 8)}`;
    for (const [projectId, name, auth] of [
      [aliceProjectId, 'Alice publication', aliceAuth],
      [bobProjectId, 'Bob publication', bobAuth],
    ] as const) {
      const created = await request('/api/projects', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, name, manifest: createProjectManifest(projectId, name) }),
      });
      expect(created.status).toBe(201);
    }

    const firstPublish = await request(`/api/projects/${aliceProjectId}/publish`, {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customSlug: slug }),
    });
    const conflictingPublish = await request(`/api/projects/${bobProjectId}/publish`, {
      method: 'POST',
      headers: { ...bobAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customSlug: slug }),
    });
    const publicRead = await request(`/api/published/${slug}`);
    await request(`/api/projects/${aliceProjectId}`, { method: 'DELETE', headers: aliceAuth });
    await request(`/api/projects/${bobProjectId}`, { method: 'DELETE', headers: bobAuth });

    expect(firstPublish.status).toBe(200);
    expect(conflictingPublish.status).toBe(409);
    expect(await conflictingPublish.json()).toMatchObject({ error: 'SlugUnavailable' });
    expect(await publicRead.json()).toMatchObject({ project: { name: 'Alice publication' } });
  });

  it('prevents cross-account reads and preserves the winning concurrent update', async () => {
    const projectId = `proj_${randomUUID()}`;
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer(alice) },
      body: JSON.stringify({
        id: projectId,
        name: 'D1 concurrency fixture',
        manifest: createProjectManifest(projectId, 'D1 concurrency fixture'),
      }),
    });
    expect(create.status).toBe(201);

    const privateRead = await request(`/api/projects/${projectId}`, {
      headers: { Authorization: testAuthBearer(bob) },
    });
    expect(privateRead.status).toBe(403);

    const privateUpdate = await request(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer(bob) },
      body: JSON.stringify({ expectedRevision: 1, name: 'Unauthorized overwrite' }),
    });
    expect(privateUpdate.status).toBe(403);

    const privateDelete = await request(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: testAuthBearer(bob) },
    });
    expect(privateDelete.status).toBe(403);

    const privateRevisionRead = await request(`/api/projects/${projectId}/revisions`, {
      headers: { Authorization: testAuthBearer(bob) },
    });
    const privateCheckpoint = await request(`/api/projects/${projectId}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer(bob) },
      body: JSON.stringify({ summary: 'Unauthorized checkpoint' }),
    });
    const privatePublish = await request(`/api/projects/${projectId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer(bob) },
      body: JSON.stringify({ customSlug: 'unauthorized-publication' }),
    });
    expect(privateRevisionRead.status).toBe(403);
    expect(privateCheckpoint.status).toBe(403);
    expect(privatePublish.status).toBe(403);

    const guestRead = await request(`/api/projects/${projectId}`);
    expect(guestRead.status).toBe(401);

    const updates = await Promise.all(
      ['Offline copy A', 'Offline copy B'].map((name) =>
        request(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer(alice) },
          body: JSON.stringify({ expectedRevision: 1, name }),
        })
      )
    );
    expect(updates.map((response) => response.status).sort()).toEqual([200, 409]);

    const current = await request(`/api/projects/${projectId}`, {
      headers: { Authorization: testAuthBearer(alice) },
    });
    const currentBody = (await current.json()) as {
      project: { currentRevision: number; name: string };
    };
    expect(currentBody.project.currentRevision).toBe(2);
    expect(['Offline copy A', 'Offline copy B']).toContain(currentBody.project.name);

    const revisions = await request(`/api/projects/${projectId}/revisions`, {
      headers: { Authorization: testAuthBearer(alice) },
    });
    const revisionBody = (await revisions.json()) as {
      revisions: Array<{ revisionNumber: number }>;
    };
    expect(revisionBody.revisions.map(({ revisionNumber }) => revisionNumber).sort()).toEqual([
      1, 2,
    ]);

    const cleanup = await request(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: testAuthBearer(alice) },
    });
    expect(cleanup.status).toBe(200);
  }, 30000);

  it('does not commit a project update if its revision checkpoint cannot be stored', async () => {
    const projectId = `proj_${randomUUID()}`;
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer(alice) },
      body: JSON.stringify({
        id: projectId,
        name: 'Atomic save fixture',
        manifest: createProjectManifest(projectId, 'Atomic save fixture'),
      }),
    });
    expect(create.status).toBe(201);

    await env
      .DB!.prepare(
        `
      CREATE TRIGGER reject_project_revision
      BEFORE INSERT ON project_revisions
      BEGIN
        SELECT RAISE(ABORT, 'checkpoint storage unavailable');
      END
    `
      )
      .run();

    let save: Response;
    try {
      save = await request(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer(alice) },
        body: JSON.stringify({ expectedRevision: 1, name: 'Should not be saved' }),
      });
    } finally {
      await env.DB!.prepare('DROP TRIGGER IF EXISTS reject_project_revision').run();
    }

    expect(save!.status).toBe(503);
    expect(await save!.json()).toMatchObject({ error: 'PersistenceUnavailable' });
    const current = await request(`/api/projects/${projectId}`, {
      headers: { Authorization: testAuthBearer(alice) },
    });
    const currentBody = (await current.json()) as {
      project: { currentRevision: number; name: string };
    };
    expect(currentBody.project).toMatchObject({ currentRevision: 1, name: 'Atomic save fixture' });

    const cleanup = await request(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: testAuthBearer(alice) },
    });
    expect(cleanup.status).toBe(200);
  }, 30000);

  it('rolls back a manual checkpoint when the revision snapshot cannot be stored', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice) };
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: projectId,
        name: 'Atomic manual checkpoint fixture',
        manifest: createProjectManifest(projectId, 'Atomic manual checkpoint fixture'),
      }),
    });
    expect(create.status).toBe(201);

    await env.DB!.prepare(`
      CREATE TRIGGER reject_manual_project_revision
      BEFORE INSERT ON project_revisions
      WHEN NEW.projectId = '${projectId}'
      BEGIN
        SELECT RAISE(ABORT, 'checkpoint storage unavailable');
      END
    `).run();

    let checkpoint: Response;
    try {
      checkpoint = await request(`/api/projects/${projectId}/revisions`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: 'Must roll back cleanly' }),
      });
    } finally {
      await env.DB!.prepare('DROP TRIGGER IF EXISTS reject_manual_project_revision').run();
    }

    const project = await env.DB!.prepare('SELECT currentRevision FROM projects WHERE id = ?')
      .bind(projectId).first<{ currentRevision: number }>();
    const revisions = await env.DB!.prepare('SELECT revisionNumber FROM project_revisions WHERE projectId = ? ORDER BY revisionNumber')
      .bind(projectId).all<{ revisionNumber: number }>();
    await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect(checkpoint!.status).toBe(503);
    expect(await checkpoint!.json()).toMatchObject({ error: 'PersistenceUnavailable' });
    expect(project?.currentRevision).toBe(1);
    expect(revisions.results.map(({ revisionNumber }) => revisionNumber)).toEqual([1]);
  }, 30000);

  it('serializes concurrent manual checkpoints without returning an internal error', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice) };
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: projectId,
        name: 'Concurrent manual checkpoint fixture',
        manifest: createProjectManifest(projectId, 'Concurrent manual checkpoint fixture'),
      }),
    });
    expect(create.status).toBe(201);

    const responses = await Promise.all(['Checkpoint A', 'Checkpoint B'].map((summary) =>
      request(`/api/projects/${projectId}/revisions`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      })
    ));
    const statuses = responses.map(({ status }) => status).sort();
    const project = await env.DB!.prepare('SELECT currentRevision FROM projects WHERE id = ?')
      .bind(projectId).first<{ currentRevision: number }>();
    const revisions = await env.DB!.prepare('SELECT revisionNumber FROM project_revisions WHERE projectId = ? ORDER BY revisionNumber')
      .bind(projectId).all<{ revisionNumber: number }>();
    await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect(statuses).toEqual([201, 409]);
    expect(project?.currentRevision).toBe(2);
    expect(revisions.results.map(({ revisionNumber }) => revisionNumber)).toEqual([1, 2]);
  }, 30000);

  it('fails closed instead of serving, checkpointing, or publishing a corrupted project manifest', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice) };
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: 'Corrupted project', manifest: createProjectManifest(projectId, 'Corrupted project') }),
    });
    expect(create.status).toBe(201);
    await env.DB!.prepare('UPDATE projects SET manifestJson = ? WHERE id = ?').bind('{not-json', projectId).run();

    const projectRead = await request(`/api/projects/${projectId}`, { headers: auth });
    const projectList = await request('/api/projects', { headers: auth });
    const revisionsRead = await request(`/api/projects/${projectId}/revisions`, { headers: auth });
    const checkpoint = await request(`/api/projects/${projectId}/revisions`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: 'Must not checkpoint corrupt data' }),
    });
    const publish = await request(`/api/projects/${projectId}/publish`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customSlug: 'corrupted-project-must-not-publish' }),
    });

    const storedProject = await env.DB!.prepare('SELECT currentRevision FROM projects WHERE id = ?').bind(projectId).first<{ currentRevision: number }>();
    const storedRevisionCount = await env.DB!.prepare('SELECT COUNT(*) AS count FROM project_revisions WHERE projectId = ?').bind(projectId).first<{ count: number }>();
    const storedPublicationCount = await env.DB!.prepare('SELECT COUNT(*) AS count FROM published_projects WHERE projectId = ?').bind(projectId).first<{ count: number }>();
    const cleanup = await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect([projectRead.status, projectList.status, revisionsRead.status, checkpoint.status, publish.status]).toEqual([503, 503, 200, 503, 503]);
    expect(storedProject?.currentRevision).toBe(1);
    expect(storedRevisionCount?.count).toBe(1);
    expect(storedPublicationCount?.count).toBe(0);
    expect(cleanup.status).toBe(200);
  }, 30000);

  it('fails closed on non-canonical stored project metadata without blocking owner cleanup', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice) };
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: 'Corrupt project metadata', manifest: createProjectManifest(projectId, 'Corrupt project metadata') }),
    });
    expect(create.status).toBe(201);
    await env.DB!.prepare("UPDATE projects SET currentRevision = X'0102', isPublished = 2 WHERE id = ?")
      .bind(projectId).run();

    const list = await request('/api/projects', { headers: auth });
    const detail = await request(`/api/projects/${projectId}`, { headers: auth });
    const update = await request(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision: 1 }),
    });
    const publish = await request(`/api/projects/${projectId}/publish`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customSlug: 'corrupt-metadata-must-not-publish' }),
    });
    const publicationCount = await env.DB!.prepare('SELECT COUNT(*) AS count FROM published_projects WHERE projectId = ?')
      .bind(projectId).first<{ count: number }>();
    const cleanup = await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect([list.status, detail.status, update.status, publish.status]).toEqual([503, 503, 503, 503]);
    expect(publicationCount?.count).toBe(0);
    expect(cleanup.status).toBe(200);
  }, 30000);

  it('does not return corrupt stored revision snapshots', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice) };
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: 'Corrupted revision', manifest: createProjectManifest(projectId, 'Corrupted revision') }),
    });
    expect(create.status).toBe(201);
    await env.DB!.prepare('UPDATE project_revisions SET manifestJson = ? WHERE projectId = ?').bind('{not-json', projectId).run();

    const revisions = await request(`/api/projects/${projectId}/revisions`, { headers: auth });
    const cleanup = await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect(revisions.status).toBe(503);
    expect(cleanup.status).toBe(200);
  });

  it('fails closed when stored revision metadata is not text or a canonical number', async () => {
    const projectId = `proj_${randomUUID()}`;
    const auth = { Authorization: testAuthBearer(alice) };
    const create = await request('/api/projects', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: 'Corrupt revision metadata', manifest: createProjectManifest(projectId, 'Corrupt revision metadata') }),
    });
    expect(create.status).toBe(201);
    await env.DB!.prepare("UPDATE project_revisions SET summary = X'0102', revisionNumber = X'0304' WHERE projectId = ?")
      .bind(projectId).run();

    const revisions = await request(`/api/projects/${projectId}/revisions`, { headers: auth });
    const cleanup = await request(`/api/projects/${projectId}`, { method: 'DELETE', headers: auth });

    expect(revisions.status).toBe(503);
    expect(await revisions.json()).toMatchObject({ error: 'Service Unavailable' });
    expect(cleanup.status).toBe(200);
  }, 30000);

  it('persists favourites and collections privately, then exposes only published project snapshots', async () => {
    const aliceAuth = { Authorization: testAuthBearer(alice) };
    const bobAuth = { Authorization: testAuthBearer(bob) };

    const unauthenticatedProfileUpdate = await request('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'guest-should-not-write' }),
    });
    expect(unauthenticatedProfileUpdate.status).toBe(401);
    const profileUpdate = await request('/api/me', {
      method: 'PUT',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'alice-team',
        bio: 'Building tools for design teams',
        specialtyTags: ['systems', 'accessibility'],
        isAvailableForWork: true,
      }),
    });
    expect(profileUpdate.status).toBe(200);
    const aliceProfile = await request('/api/me', { headers: aliceAuth });
    expect(await aliceProfile.json()).toMatchObject({
      profile: {
        username: 'alice-team',
        bio: 'Building tools for design teams',
        specialtyTags: ['systems', 'accessibility'],
        isAvailableForWork: true,
      },
    });

    const partialProfileUpdate = await request('/api/me', {
      method: 'PUT',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialtyTags: ['accessibility'] }),
    });
    expect(partialProfileUpdate.status).toBe(200);
    const persistedProfile = await request('/api/me', { headers: aliceAuth });
    expect(await persistedProfile.json()).toMatchObject({
      profile: {
        username: 'alice-team',
        bio: 'Building tools for design teams',
        specialtyTags: ['accessibility'],
        isAvailableForWork: true,
      },
    });

    const favoriteAdd = await request('/api/favorites', {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: 'button-primary' }),
    });
    expect(favoriteAdd.status).toBe(201);
    const duplicateFavorite = await request('/api/favorites', {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: 'button-primary' }),
    });
    expect(duplicateFavorite.status).toBe(201);
    const aliceFavorites = await request('/api/favorites', { headers: aliceAuth });
    expect(await aliceFavorites.json()).toMatchObject({ favorites: ['button-primary'] });
    const bobFavorites = await request('/api/favorites', { headers: bobAuth });
    expect(await bobFavorites.json()).toMatchObject({ favorites: [] });

    const collectionCreate = await request('/api/collections', {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Private review collection', isPublic: false }),
    });
    expect(collectionCreate.status).toBe(201);
    const { collection } = (await collectionCreate.json()) as { collection: { id: string } };
    const guestCollection = await request(`/api/collections/${collection.id}`);
    expect(guestCollection.status).toBe(403);
    const bobCollection = await request(`/api/collections/${collection.id}`, { headers: bobAuth });
    expect(bobCollection.status).toBe(403);

    const itemAdd = await request(`/api/collections/${collection.id}/items`, {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: 'hero-editorial-bold' }),
    });
    expect(itemAdd.status).toBe(200);
    const unauthorizedItemAdd = await request(`/api/collections/${collection.id}/items`, {
      method: 'POST',
      headers: { ...bobAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceSlug: 'button-primary' }),
    });
    expect(unauthorizedItemAdd.status).toBe(403);
    const unauthorizedItemDelete = await request(`/api/collections/${collection.id}/items/hero-editorial-bold`, {
      method: 'DELETE',
      headers: bobAuth,
    });
    const unauthorizedCollectionDelete = await request(`/api/collections/${collection.id}`, {
      method: 'DELETE',
      headers: bobAuth,
    });
    expect(unauthorizedItemDelete.status).toBe(403);
    expect(unauthorizedCollectionDelete.status).toBe(403);
    const collectionRead = await request(`/api/collections/${collection.id}`, {
      headers: aliceAuth,
    });
    expect(await collectionRead.json()).toMatchObject({
      collection: { items: ['hero-editorial-bold'] },
    });

    const publicCollectionCreate = await request('/api/collections', {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Public collection', isPublic: true }),
    });
    const { collection: publicCollection } = (await publicCollectionCreate.json()) as {
      collection: { id: string };
    };
    expect((await request(`/api/collections/${publicCollection.id}`)).status).toBe(200);

    const projectId = `proj_${randomUUID()}`;
    const projectCreate = await request('/api/projects', {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: projectId,
        name: 'D1 published project',
        manifest: createProjectManifest(projectId, 'D1 published project'),
      }),
    });
    expect(projectCreate.status).toBe(201);
    const publish = await request(`/api/projects/${projectId}/publish`, {
      method: 'POST',
      headers: { ...aliceAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customSlug: 'd1-public-review-project' }),
    });
    expect(publish.status).toBe(200);
    const published = await request('/api/published/d1-public-review-project');
    expect(await published.json()).toMatchObject({
      project: {
        slug: 'd1-public-review-project',
        name: 'D1 published project',
        manifest: { name: 'D1 published project' },
      },
    });

    const remix = await request('/api/published/d1-public-review-project/remix', {
      method: 'POST',
      headers: bobAuth,
    });
    expect(remix.status).toBe(201);
    const remixBody = (await remix.json()) as { cloudProject: { id: string; userId: string }; manifest: { id: string; name: string } };
    expect(remixBody.cloudProject.userId).toBe(bob);
    expect(remixBody.manifest).toMatchObject({ id: remixBody.cloudProject.id, name: expect.stringContaining('(Remix)') });
    const bobRemix = await request(`/api/projects/${remixBody.cloudProject.id}`, {
      headers: bobAuth,
    });
    expect(bobRemix.status).toBe(200);
    const bobRemixBody = (await bobRemix.json()) as { project: { id: string; manifestJson: string } };
    expect(JSON.parse(bobRemixBody.project.manifestJson)).toMatchObject({ id: bobRemixBody.project.id });

    await env.DB!.prepare('UPDATE published_projects SET manifestJson = ? WHERE slug = ?')
      .bind('{not-json', 'd1-public-review-project')
      .run();
    const corruptedPublishedRead = await request('/api/published/d1-public-review-project');
    expect(corruptedPublishedRead.status).toBe(503);
    const corruptedPublishedRemix = await request('/api/published/d1-public-review-project/remix', {
      method: 'POST',
      headers: bobAuth,
    });
    expect(corruptedPublishedRemix.status).toBe(503);

    await env.DB!.prepare('UPDATE published_projects SET manifestJson = ? WHERE slug = ?')
      .bind(JSON.stringify(createProjectManifest('proj_mismatched_published_manifest', 'Wrong project')), 'd1-public-review-project')
      .run();
    const mismatchedPublishedRead = await request('/api/published/d1-public-review-project');
    expect(mismatchedPublishedRead.status).toBe(503);
    const mismatchedPublishedRemix = await request('/api/published/d1-public-review-project/remix', {
      method: 'POST',
      headers: bobAuth,
    });
    expect(mismatchedPublishedRemix.status).toBe(503);

    const cleanup = await request(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: aliceAuth,
    });
    expect(cleanup.status).toBe(200);
    const removedPublish = await request('/api/published/d1-public-review-project');
    expect(removedPublish.status).toBe(404);
  }, 30000);

  it('reads, expires, refreshes and revokes real Better Auth D1 sessions without returning their token', async () => {
    const authSecret = randomUUID() + randomUUID();
    const authEnv: Env = {
      ...env,
      BETTER_AUTH_SECRET: authSecret,
      BETTER_AUTH_URL: 'https://tessellate.test',
      GITHUB_CLIENT_ID: 'test-github-client',
      GITHUB_CLIENT_SECRET: 'test-github-secret',
    };
    const now = Math.floor(Date.now() / 1000);
    const sessionToken = randomUUID() + randomUUID();
    const cookie = await signedSessionCookie(sessionToken, authSecret);
    await env
      .DB!.prepare(
        'INSERT INTO session (id, token, expiresAt, createdAt, updatedAt, userId) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind('session-valid', sessionToken, now + 7 * 24 * 60 * 60, now, now, alice)
      .run();

    const profile = await app.request('/api/me', { headers: { Cookie: cookie } }, authEnv);
    expect(profile.status).toBe(200);
    const profileText = await profile.text();
    expect(profileText).toContain('test-user-cloud-alice');
    expect(profileText).not.toContain(sessionToken);
    expect(profileText).not.toMatch(/"token"\s*:/i);

    const signOut = await app.request(
      '/api/auth/sign-out',
      {
        method: 'POST',
        headers: { Cookie: cookie },
      },
      authEnv
    );
    expect(signOut.status).toBe(200);
    const revokedSession = await env
      .DB!.prepare('SELECT id FROM session WHERE id = ?')
      .bind('session-valid')
      .first();
    expect(revokedSession).toBeNull();
    const afterSignOut = await app.request('/api/me', { headers: { Cookie: cookie } }, authEnv);
    expect(await afterSignOut.json()).toMatchObject({ authenticated: false, user: null });

    const expiredToken = randomUUID() + randomUUID();
    const expiredCookie = await signedSessionCookie(expiredToken, authSecret);
    await env
      .DB!.prepare(
        'INSERT INTO session (id, token, expiresAt, createdAt, updatedAt, userId) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind('session-expired', expiredToken, now - 1, now - 100000, now - 100000, alice)
      .run();
    const expired = await app.request('/api/me', { headers: { Cookie: expiredCookie } }, authEnv);
    expect(await expired.json()).toMatchObject({ authenticated: false, user: null });
    const expiredSession = await env
      .DB!.prepare('SELECT id FROM session WHERE id = ?')
      .bind('session-expired')
      .first();
    expect(expiredSession).toBeNull();

    const oauthStart = await app.request(
      '/api/auth/sign-in/social',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'github',
          callbackURL: 'https://tessellate.test/after-auth',
          errorCallbackURL: 'https://tessellate.test/sign-in',
        }),
      },
      authEnv
    );
    expect(oauthStart.status).toBe(200);
    const oauthStartBody = (await oauthStart.json()) as { url: string };
    const oauthState = new URL(oauthStartBody.url).searchParams.get('state');
    expect(oauthState).toBeTruthy();
    const setCookie = oauthStart.headers.get('set-cookie') ?? '';
    const oauthStateCookie = /(?:^|,\s*)([^=;,]*state[^=;,]*)=([^;,]*)/i.exec(setCookie);
    expect(oauthStateCookie).toBeTruthy();
    const failedOAuth = await app.request(
      `/api/auth/callback/github?error=access_denied&error_description=User+denied&state=${encodeURIComponent(oauthState!)}`,
      { headers: { Cookie: `${oauthStateCookie![1]}=${oauthStateCookie![2]}` } },
      authEnv
    );
    expect(failedOAuth.status).toBe(302);
    expect(failedOAuth.headers.get('location')).toContain(
      'https://tessellate.test/sign-in?error=access_denied'
    );
    expect(failedOAuth.headers.get('set-cookie') ?? '').not.toMatch(
      /better-auth\.session_token=[^;]+/i
    );

    const duplicateOAuthStart = await app.request(
      '/api/auth/sign-in/social',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'github',
          callbackURL: 'https://tessellate.test/after-auth',
          errorCallbackURL: 'https://tessellate.test/sign-in',
        }),
      },
      authEnv
    );
    const duplicateOAuthBody = (await duplicateOAuthStart.json()) as { url: string };
    const duplicateState = new URL(duplicateOAuthBody.url).searchParams.get('state');
    const duplicateStateCookie = /(?:^|,\s*)([^=;,]*state[^=;,]*)=([^;,]*)/i.exec(
      duplicateOAuthStart.headers.get('set-cookie') ?? ''
    );
    expect(duplicateState).toBeTruthy();
    expect(duplicateStateCookie).toBeTruthy();

    const originalFetch = globalThis.fetch;
    const oauthEmail = 'oauth-account-linking@tessellate.test';
    let githubAccountId = 92001;
    globalThis.fetch = (async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      if (url.hostname === 'github.com' && url.pathname === '/login/oauth/access_token') {
        return new Response(
          JSON.stringify({
            access_token: 'fixture-access-token',
            token_type: 'bearer',
            scope: 'read:user,user:email',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      if (url.hostname === 'api.github.com' && url.pathname === '/user') {
        return new Response(
          JSON.stringify({
            id: githubAccountId,
            login: 'oauth-fixture',
            name: 'OAuth Fixture',
            avatar_url: 'https://avatars.github.test/oauth-fixture.png',
            email: oauthEmail,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (url.hostname === 'api.github.com' && url.pathname === '/user/emails') {
        return new Response(
          JSON.stringify([
            {
              email: oauthEmail,
              primary: true,
              verified: true,
              visibility: 'private',
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return originalFetch(input, init);
    }) as typeof fetch;
    let firstOAuth: Response;
    try {
      firstOAuth = await app.request(
        `/api/auth/callback/github?code=fixture-code&state=${encodeURIComponent(duplicateState!)}`,
        { headers: { Cookie: `${duplicateStateCookie![1]}=${duplicateStateCookie![2]}` } },
        authEnv
      );

      expect(firstOAuth.status).toBe(302);
      expect(firstOAuth.headers.get('location')).toBe('https://tessellate.test/after-auth');
      const firstSessionCookie = /(?:^|,\s*)([^=;,]*session_token)=([^;,]+)/i.exec(
        firstOAuth.headers.get('set-cookie') ?? ''
      );
      expect(firstSessionCookie).toBeTruthy();
      const firstSession = await app.request(
        '/api/me',
        {
          headers: { Cookie: `${firstSessionCookie![1]}=${firstSessionCookie![2]}` },
        },
        authEnv
      );
      const firstSessionBody = (await firstSession.json()) as {
        authenticated: boolean;
        user: { email: string };
      };
      expect(firstSessionBody).toMatchObject({ authenticated: true, user: { email: oauthEmail } });

      const duplicateIdentityStart = await app.request(
        '/api/auth/sign-in/social',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'github',
            callbackURL: 'https://tessellate.test/after-auth',
            errorCallbackURL: 'https://tessellate.test/sign-in',
          }),
        },
        authEnv
      );
      const duplicateIdentityBody = (await duplicateIdentityStart.json()) as { url: string };
      const duplicateIdentityState = new URL(duplicateIdentityBody.url).searchParams.get('state');
      const duplicateIdentityCookie = /(?:^|,\s*)([^=;,]*state[^=;,]*)=([^;,]*)/i.exec(
        duplicateIdentityStart.headers.get('set-cookie') ?? ''
      );
      expect(duplicateIdentityState).toBeTruthy();
      expect(duplicateIdentityCookie).toBeTruthy();
      githubAccountId = 92002;
      const duplicateOAuth = await app.request(
        `/api/auth/callback/github?code=fixture-code&state=${encodeURIComponent(duplicateIdentityState!)}`,
        { headers: { Cookie: `${duplicateIdentityCookie![1]}=${duplicateIdentityCookie![2]}` } },
        authEnv
      );
      expect(duplicateOAuth.status).toBe(302);
      expect(duplicateOAuth.headers.get('location')).toContain('account_not_linked');
      expect(duplicateOAuth.headers.get('set-cookie') ?? '').not.toMatch(
        /better-auth\.session_token=[^;]{10,}/i
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
    const duplicateUsers = await env
      .DB!.prepare('SELECT id FROM user WHERE email = ?')
      .bind(oauthEmail)
      .all();
    expect(duplicateUsers.results).toHaveLength(1);

    const staleToken = randomUUID() + randomUUID();
    const staleCookie = await signedSessionCookie(staleToken, authSecret);
    const oldUpdate = now - 2 * 24 * 60 * 60;
    const oldExpiry = now + 5 * 24 * 60 * 60;
    await env
      .DB!.prepare(
        'INSERT INTO session (id, token, expiresAt, createdAt, updatedAt, userId) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind('session-refresh', staleToken, oldExpiry, oldUpdate, oldUpdate, alice)
      .run();
    const refreshed = await app.request('/api/me', { headers: { Cookie: staleCookie } }, authEnv);
    expect(refreshed.status).toBe(200);
    const refreshedSession = await env
      .DB!.prepare('SELECT expiresAt, updatedAt FROM session WHERE id = ?')
      .bind('session-refresh')
      .first<{ expiresAt: number; updatedAt: number }>();
    expect(refreshedSession?.updatedAt).toBeGreaterThan(oldUpdate);
    expect(refreshedSession?.expiresAt).toBeGreaterThan(oldExpiry);
  }, 30000);
});
