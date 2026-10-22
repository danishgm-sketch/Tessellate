import { describe, it, expect } from 'vitest';
import { ProjectManifestSchema, validProjectFixture } from '@tessellate/schemas';
import app from '../index.js';
import { testAuthBearer, testAuthEnv } from './test-auth-fixture.js';

function createProjectManifest(id: string, name: string, description: string) {
  return { ...structuredClone(validProjectFixture), id, name, description };
}

describe('Apps/API: Phase 16 Auth and Cloud State Management', () => {
  const userA = 'test-user-alice';
  const userB = 'test-user-bob';
  const tokenA = testAuthBearer(userA);
  const tokenB = testAuthBearer(userB);
  const request = (input: string, init?: RequestInit) => app.request(input, init, testAuthEnv);

  describe('/api/me (Auth & Profiles)', () => {
    it('returns unauthenticated state for anonymous visitor', async () => {
      const res = await request('/api/me');
      expect(res.status).toBe(200);
      const json = await res.json() as { authenticated: boolean; user: null; profile: null };
      expect(json.authenticated).toBe(false);
      expect(json.user).toBeNull();
      expect(json.profile).toBeNull();
    });

    it('returns user and initial profile for authenticated user', async () => {
      const res = await request('/api/me', {
        headers: { Authorization: tokenA },
      });
      expect(res.status).toBe(200);
      const json = await res.json() as {
        authenticated: boolean;
        user: { id: string; email: string };
        profile: { username: string };
      };
      expect(json.authenticated).toBe(true);
      expect(json.user.id).toBe(userA);
      expect(json.profile.username).toBe(userA);
    });

    it('updates user profile via PUT /api/me', async () => {
      const updatePayload = {
        bio: 'Senior Design Technologist building deterministic UI systems',
        githubHandle: 'alice-dev',
        specialtyTags: ['design-systems', 'motion', 'accessibility'],
        isAvailableForWork: true,
      };

      const res = await request('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify(updatePayload),
      });

      expect(res.status).toBe(200);
      const json = await res.json() as { success: boolean; profile: { bio: string; githubHandle: string; isAvailableForWork: boolean } };
      expect(json.success).toBe(true);
      expect(json.profile.bio).toBe(updatePayload.bio);
      expect(json.profile.githubHandle).toBe(updatePayload.githubHandle);
      expect(json.profile.isAvailableForWork).toBe(true);
    });

    it('preserves omitted fields when applying a partial profile update', async () => {
      const profileToken = testAuthBearer('test-user-partial-profile');
      const update = (body: Record<string, unknown>) => request('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: profileToken },
        body: JSON.stringify(body),
      });

      expect((await update({
        username: 'profile-owner',
        bio: 'Keep this biography',
        githubHandle: 'alice-dev',
        specialtyTags: ['design-systems'],
        isAvailableForWork: true,
      })).status).toBe(200);

      const partial = await update({ specialtyTags: ['accessibility'] });
      const json = await partial.json() as { profile: Record<string, unknown> };

      expect(partial.status).toBe(200);
      expect(json.profile).toMatchObject({
        username: 'profile-owner',
        bio: 'Keep this biography',
        githubHandle: 'alice-dev',
        specialtyTags: ['accessibility'],
        isAvailableForWork: true,
      });
    });

    it('rejects profile fields not present in the API contract', async () => {
      const response = await request('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({ githubUrl: 'https://github.com/alice' }),
      });

      expect(response.status).toBe(400);
    });

    it('rejects string availability flags instead of making a profile publicly available', async () => {
      const response = await request('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({ isAvailableForWork: 'false' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('/api/projects (Project Persistence & Hard Cross-Account Isolation)', () => {
    let createdProjectId: string;
    let publishedSlug: string;

    it('rejects malformed project manifests before creating a cloud record', async () => {
      const response = await request('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({ name: 'Malformed project', manifest: { screens: [] } }),
      });

      expect(response.status).toBe(400);
    });

    it('rejects unauthorized project creation with 401 Unauthorized', async () => {
      const res = await request('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sneaky Project' }),
      });
      expect(res.status).toBe(401);
    });

    it('creates a new cloud project for authenticated user Alice', async () => {
      const projectName = 'Alice SaaS Portal';
      const projectDescription = 'Enterprise dashboard project';
      const id = 'proj_alice_saas_portal';
      const manifest = createProjectManifest(id, projectName, projectDescription);

      const res = await request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          id,
          name: 'Alice SaaS Portal',
          description: projectDescription,
          manifest,
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json() as { success: boolean; project: { id: string; name: string; currentRevision: number } };
      expect(json.success).toBe(true);
      expect(json.project.name).toBe('Alice SaaS Portal');
      expect(json.project.currentRevision).toBe(1);
      createdProjectId = json.project.id;
    });

    it('allows owner Alice to retrieve her project', async () => {
      const res = await request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenA },
      });
      expect(res.status).toBe(200);
      const json = await res.json() as { project: { id: string; name: string } };
      expect(json.project.id).toBe(createdProjectId);
    });

    it('rejects malformed manifest updates without advancing the saved revision', async () => {
      const beforeResponse = await request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenA },
      });
      const before = await beforeResponse.json() as { project: { currentRevision: number; manifestJson: string } };

      const update = await request(`/api/projects/${createdProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({ expectedRevision: before.project.currentRevision, manifest: { screens: [] } }),
      });
      expect(update.status).toBe(400);

      const afterResponse = await request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenA },
      });
      const after = await afterResponse.json() as { project: { currentRevision: number; manifestJson: string } };
      expect(after.project.currentRevision).toBe(before.project.currentRevision);
      expect(after.project.manifestJson).toBe(before.project.manifestJson);
    });

    it('SECURITY ENFORCEMENT: prevents Bob from reading Alice’s project (403 Forbidden)', async () => {
      const res = await request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenB },
      });
      expect(res.status).toBe(403);
      const json = await res.json() as { error: string };
      expect(json.error).toBe('Forbidden');
    });

    it('SECURITY ENFORCEMENT: prevents Bob from modifying Alice’s project (403 Forbidden)', async () => {
      const res = await request(`/api/projects/${createdProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenB,
        },
        body: JSON.stringify({ expectedRevision: 1, name: 'Bob Hijacked This' }),
      });
      expect(res.status).toBe(403);
    });

    it('allows owner Alice to update project and records revision increment', async () => {
      const before = await request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenA },
      });
      const beforeProject = await before.json() as { project: { manifestJson: string } };
      const beforeManifest = JSON.parse(beforeProject.project.manifestJson) as { id: string; screens: unknown[] };
      const res = await request(`/api/projects/${createdProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          expectedRevision: 1,
          name: 'Alice SaaS Portal v2',
          description: 'Updated enterprise dashboard',
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json() as { success: boolean; project: { name: string; currentRevision: number } };
      expect(json.success).toBe(true);
      expect(json.project.name).toBe('Alice SaaS Portal v2');
      expect(json.project.currentRevision).toBe(2);

      const after = await request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenA },
      });
      const afterProject = await after.json() as { project: { manifestJson: string } };
      const afterManifest = JSON.parse(afterProject.project.manifestJson) as { id: string; name: string; screens: unknown[] };
      expect(afterManifest.id).toBe(beforeManifest.id);
      expect(afterManifest.name).toBe('Alice SaaS Portal v2');
      expect(afterManifest.screens).toEqual(beforeManifest.screens);
    });

    it('rejects a stale cloud save without overwriting the latest project or adding a revision', async () => {
      const staleUpdate = await request(`/api/projects/${createdProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          expectedRevision: 1,
          name: 'Stale offline copy',
          description: 'This must not replace Alice’s latest revision',
        }),
      });

      expect(staleUpdate.status).toBe(409);
      expect(await staleUpdate.json()).toMatchObject({ error: 'RevisionConflict', currentRevision: 2 });

      const current = await request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenA },
      });
      expect(current.status).toBe(200);
      expect(await current.json()).toMatchObject({
        project: { name: 'Alice SaaS Portal v2', currentRevision: 2 },
      });
    });

    it('requires a loaded revision number before replacing a cloud project', async () => {
      const response = await request(`/api/projects/${createdProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({ name: 'No concurrency guard' }),
      });

      expect(response.status).toBe(428);
      expect(await response.json()).toMatchObject({ error: 'PreconditionRequired' });
    });

    it('accepts only one concurrent save from the same project revision', async () => {
      const create = await request('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({
          id: 'proj_concurrent_save_fixture',
          name: 'Concurrent save fixture',
          manifest: createProjectManifest('proj_concurrent_save_fixture', 'Concurrent save fixture', 'Concurrency test project'),
        }),
      });
      expect(create.status).toBe(201);
      const created = await create.json() as { project: { id: string } };
      const updates = await Promise.all(['Offline copy A', 'Offline copy B'].map((name) =>
        request(`/api/projects/${created.project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: tokenA },
          body: JSON.stringify({ expectedRevision: 1, name }),
        })
      ));

      expect(updates.map((response) => response.status).sort()).toEqual([200, 409]);
      const latest = await request(`/api/projects/${created.project.id}`, {
        headers: { Authorization: tokenA },
      });
      expect(await latest.json()).toMatchObject({ project: { currentRevision: 2 } });

      const cleanup = await request(`/api/projects/${created.project.id}`, {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(cleanup.status).toBe(200);
    });

    it('allows owner Alice to create a named checkpoint revision', async () => {
      const res = await request(`/api/projects/${createdProjectId}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          summary: 'Pre-launch polish milestone',
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json() as { success: boolean; revision: { revisionNumber: number; summary: string } };
      expect(json.success).toBe(true);
      expect(json.revision.summary).toBe('Pre-launch polish milestone');
    });

    it('allows owner Alice to list all project revisions', async () => {
      const res = await request(`/api/projects/${createdProjectId}/revisions`, {
        headers: { Authorization: tokenA },
      });
      expect(res.status).toBe(200);
      const json = await res.json() as { revisions: Array<{ revisionNumber: number }> };
      expect(json.revisions.length).toBeGreaterThanOrEqual(2);
    });

    it('publishes project and generates a public URL slug', async () => {
      const res = await request(`/api/projects/${createdProjectId}/publish`, {
        method: 'POST',
        headers: { Authorization: tokenA },
      });
      expect(res.status).toBe(200);
      const json = await res.json() as { success: boolean; slug: string; publicUrl: string };
      expect(json.success).toBe(true);
      expect(json.slug).toBeDefined();
      expect(json.publicUrl).toContain(`/p/${json.slug}`);
      publishedSlug = json.slug;
    });

    describe('/api/published (Public Views & Remix Workflow)', () => {
      it('allows anonymous public viewing of published project', async () => {
        const res = await request(`/api/published/${publishedSlug}`);
        expect(res.status).toBe(200);
        const json = await res.json() as { project: { slug: string; name: string } };
        expect(json.project.slug).toBe(publishedSlug);
        expect(json.project.name).toBe('Alice SaaS Portal v2');
      });

      it('remixes published project for guest (anonymous) user returning manifest', async () => {
        const res = await request(`/api/published/${publishedSlug}/remix`, {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const json = await res.json() as {
          success: boolean;
          guestRemix: boolean;
          manifest: { id: string; name: string };
        };
        expect(json.success).toBe(true);
        expect(json.guestRemix).toBe(true);
        expect(ProjectManifestSchema.safeParse(json.manifest).success).toBe(true);
        expect(json.manifest.id).not.toBe(createdProjectId);
        expect(json.manifest.name).toContain('(Remix)');
      });

      it('remixes published project for authenticated user Bob into cloud project', async () => {
        const res = await request(`/api/published/${publishedSlug}/remix`, {
          method: 'POST',
          headers: { Authorization: tokenB },
        });

        expect(res.status).toBe(201);
        const json = await res.json() as {
          success: boolean;
          cloudProject: { id: string; userId: string; name: string };
          manifest: { id: string; name: string };
        };
        expect(json.success).toBe(true);
        expect(json.cloudProject.userId).toBe(userB);
        expect(json.cloudProject.name).toContain('(Remix)');
        expect(ProjectManifestSchema.safeParse(json.manifest).success).toBe(true);
        expect(json.manifest.id).toBe(json.cloudProject.id);
        expect(json.manifest.name).toContain('(Remix)');
      });
    });
  });

  describe('/api/favorites', () => {
    it('rejects empty, oversized, and non-slug resource identifiers', async () => {
      const invalidSlugs = ['   ', 'x'.repeat(121), '../button'];
      const responses = await Promise.all(invalidSlugs.map((resourceSlug) => request('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({ resourceSlug }),
      })));

      expect(responses.map((response) => response.status)).toEqual([400, 400, 400]);
    });

    it('manages favorite resources for authenticated user', async () => {
      // 1. Initially empty
      const initial = await request('/api/favorites', {
        headers: { Authorization: tokenA },
      });
      expect(initial.status).toBe(200);

      // 2. Add favorite
      const addRes = await request('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({ resourceSlug: 'button-primary' }),
      });
      expect(addRes.status).toBe(201);

      // 3. Verify in list
      const listRes = await request('/api/favorites', {
        headers: { Authorization: tokenA },
      });
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json() as { favorites: string[] };
      expect(listJson.favorites).toContain('button-primary');

      // 4. Remove favorite
      const delRes = await request('/api/favorites/button-primary', {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(delRes.status).toBe(200);

      // 5. Verify removed
      const finalRes = await request('/api/favorites', {
        headers: { Authorization: tokenA },
      });
      const finalJson = await finalRes.json() as { favorites: string[] };
      expect(finalJson.favorites).not.toContain('button-primary');
    });
  });

  describe('/api/collections', () => {
    let collectionId: string;

    it('rejects string values that could accidentally publish a private collection', async () => {
      const response = await request('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({ name: 'Keep private', isPublic: 'false' }),
      });

      expect(response.status).toBe(400);
    });

    it('creates, populates, and manages a user collection', async () => {
      // 1. Create collection
      const createRes = await request('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          name: 'Hero Sections 2026',
          description: 'Top minimal and kinetic hero designs',
          isPublic: true,
        }),
      });

      expect(createRes.status).toBe(201);
      const createJson = await createRes.json() as { success: boolean; collection: { id: string; name: string } };
      collectionId = createJson.collection.id;

      const invalidItemSlugs = ['   ', 'x'.repeat(121), '../button'];
      const invalidItemResponses = await Promise.all(invalidItemSlugs.map((resourceSlug) => request(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: tokenA },
        body: JSON.stringify({ resourceSlug }),
      })));
      expect(invalidItemResponses.map((response) => response.status)).toEqual([400, 400, 400]);

      // 2. Add item to collection
      const addItemRes = await request(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({ resourceSlug: 'hero-editorial-bold' }),
      });
      expect(addItemRes.status).toBe(200);

      // 3. Fetch collection with items
      const getRes = await request(`/api/collections/${collectionId}`);
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json() as { collection: { items: string[] } };
      expect(getJson.collection.items).toContain('hero-editorial-bold');

      // 4. Remove item from collection
      const remItemRes = await request(`/api/collections/${collectionId}/items/hero-editorial-bold`, {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(remItemRes.status).toBe(200);

      // 5. Delete collection
      const delRes = await request(`/api/collections/${collectionId}`, {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(delRes.status).toBe(200);
    });
  });

  describe('/api/creator-links', () => {
    let linkId: string;

    it('rejects executable and credential-obscured external URLs', async () => {
      for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'https://trusted.example@evil.example/path']) {
        const response = await request('/api/creator-links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: tokenA,
          },
          body: JSON.stringify({ title: 'External profile', url }),
        });

        expect(response.status).toBe(400);
      }
    });

    it('adds, lists, and removes external links for a creator', async () => {
      // 1. Add link
      const addRes = await request('/api/creator-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          title: 'Design Portfolio',
          url: 'https://alice.design',
        }),
      });

      expect(addRes.status).toBe(201);
      const addJson = await addRes.json() as { link: { id: string; title: string; url: string } };
      linkId = addJson.link.id;

      // 2. Publicly read creator links
      const listRes = await request(`/api/creator-links/${userA}`);
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json() as { links: Array<{ id: string; title: string }> };
      expect(listJson.links.some((l) => l.id === linkId)).toBe(true);

      // 3. Delete link
      const delRes = await request(`/api/creator-links/${linkId}`, {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(delRes.status).toBe(200);
    });
  });

  describe('/api/reports', () => {
    it('rejects non-string and empty report identifiers or reasons', async () => {
      const res = await request('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'project', targetId: {}, reason: ['abuse'] }),
      });

      expect(res.status).toBe(400);
    });

    it('submits a content report successfully', async () => {
      const res = await request('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'project',
          targetId: 'proj_suspicious_123',
          reason: 'Spam or deceptive marketing content',
          details: 'Contains repetitive unrelated outbound links.',
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json() as { report: { id: string; status: string }; message: string };
      expect(json.report.id).toBeDefined();
      expect(json.report.status).toBe('pending');
    });
  });

  describe('/api/reports', () => {
    it('fails closed when production abuse verification is not configured', async () => {
      const response = await app.request('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'project', targetId: 'proj_public', reason: 'Review request' }),
      }, {
        RUNTIME_ENVIRONMENT: 'production',
        API_PUBLIC_WRITE_LIMITER: { limit: async () => ({ success: true }) },
      });

      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ error: 'AbuseCheckUnavailable' });
    });
  });
});
