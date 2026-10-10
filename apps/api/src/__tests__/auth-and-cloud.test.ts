import { describe, it, expect } from 'vitest';
import app from '../index.js';

describe('Apps/API: Phase 16 Auth and Cloud State Management', () => {
  const userA = 'test-user-alice';
  const userB = 'test-user-bob';
  const tokenA = `Bearer ${userA}`;
  const tokenB = `Bearer ${userB}`;

  describe('/api/me (Auth & Profiles)', () => {
    it('returns unauthenticated state for anonymous visitor', async () => {
      const res = await app.request('/api/me');
      expect(res.status).toBe(200);
      const json = await res.json() as { authenticated: boolean; user: null; profile: null };
      expect(json.authenticated).toBe(false);
      expect(json.user).toBeNull();
      expect(json.profile).toBeNull();
    });

    it('returns user and initial profile for authenticated user', async () => {
      const res = await app.request('/api/me', {
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
        githubUrl: 'https://github.com/alice',
        specialtyTags: ['design-systems', 'motion', 'accessibility'],
        isAvailableForWork: true,
      };

      const res = await app.request('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify(updatePayload),
      });

      expect(res.status).toBe(200);
      const json = await res.json() as { success: boolean; profile: { bio: string; isAvailableForWork: boolean } };
      expect(json.success).toBe(true);
      expect(json.profile.bio).toBe(updatePayload.bio);
      expect(json.profile.isAvailableForWork).toBe(true);
    });
  });

  describe('/api/projects (Project Persistence & Hard Cross-Account Isolation)', () => {
    let createdProjectId: string;
    let publishedSlug: string;

    it('rejects unauthorized project creation with 401 Unauthorized', async () => {
      const res = await app.request('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sneaky Project' }),
      });
      expect(res.status).toBe(401);
    });

    it('creates a new cloud project for authenticated user Alice', async () => {
      const manifest = {
        version: '1.0.0',
        metadata: { name: 'Alice SaaS Portal', description: 'Enterprise dashboard' },
        canvas: { mode: 'full-width' },
        dna: {
          density: 'dense',
          chroma: 'minimal',
          contrast: 'normal',
          radii: 'sharp',
          depth: 'flat',
          motion: 'functional',
          scale: 'minor-third',
          pattern: 'grid',
          glass: 'none',
          colorMode: 'dark',
        },
        nodes: [],
      };

      const res = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          name: 'Alice SaaS Portal',
          description: 'Enterprise dashboard project',
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
      const res = await app.request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenA },
      });
      expect(res.status).toBe(200);
      const json = await res.json() as { project: { id: string; name: string } };
      expect(json.project.id).toBe(createdProjectId);
    });

    it('SECURITY ENFORCEMENT: prevents Bob from reading Alice’s project (403 Forbidden)', async () => {
      const res = await app.request(`/api/projects/${createdProjectId}`, {
        headers: { Authorization: tokenB },
      });
      expect(res.status).toBe(403);
      const json = await res.json() as { error: string };
      expect(json.error).toBe('Forbidden');
    });

    it('SECURITY ENFORCEMENT: prevents Bob from modifying Alice’s project (403 Forbidden)', async () => {
      const res = await app.request(`/api/projects/${createdProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenB,
        },
        body: JSON.stringify({ name: 'Bob Hijacked This' }),
      });
      expect(res.status).toBe(403);
    });

    it('allows owner Alice to update project and records revision increment', async () => {
      const res = await app.request(`/api/projects/${createdProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({
          name: 'Alice SaaS Portal v2',
          description: 'Updated enterprise dashboard',
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json() as { success: boolean; project: { name: string; currentRevision: number } };
      expect(json.success).toBe(true);
      expect(json.project.name).toBe('Alice SaaS Portal v2');
      expect(json.project.currentRevision).toBe(2);
    });

    it('allows owner Alice to create a named checkpoint revision', async () => {
      const res = await app.request(`/api/projects/${createdProjectId}/revisions`, {
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
      const res = await app.request(`/api/projects/${createdProjectId}/revisions`, {
        headers: { Authorization: tokenA },
      });
      expect(res.status).toBe(200);
      const json = await res.json() as { revisions: Array<{ revisionNumber: number }> };
      expect(json.revisions.length).toBeGreaterThanOrEqual(2);
    });

    it('publishes project and generates a public URL slug', async () => {
      const res = await app.request(`/api/projects/${createdProjectId}/publish`, {
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
        const res = await app.request(`/api/published/${publishedSlug}`);
        expect(res.status).toBe(200);
        const json = await res.json() as { project: { slug: string; name: string } };
        expect(json.project.slug).toBe(publishedSlug);
        expect(json.project.name).toBe('Alice SaaS Portal v2');
      });

      it('remixes published project for guest (anonymous) user returning manifest', async () => {
        const res = await app.request(`/api/published/${publishedSlug}/remix`, {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const json = await res.json() as { success: boolean; guestRemix: boolean; manifest: { metadata: { name: string } } };
        expect(json.success).toBe(true);
        expect(json.guestRemix).toBe(true);
        expect(json.manifest.metadata.name).toContain('(Remix)');
      });

      it('remixes published project for authenticated user Bob into cloud project', async () => {
        const res = await app.request(`/api/published/${publishedSlug}/remix`, {
          method: 'POST',
          headers: { Authorization: tokenB },
        });

        expect(res.status).toBe(201);
        const json = await res.json() as { success: boolean; cloudProject: { id: string; userId: string; name: string } };
        expect(json.success).toBe(true);
        expect(json.cloudProject.userId).toBe(userB);
        expect(json.cloudProject.name).toContain('(Remix)');
      });
    });
  });

  describe('/api/favorites', () => {
    it('manages favorite resources for authenticated user', async () => {
      // 1. Initially empty
      const initial = await app.request('/api/favorites', {
        headers: { Authorization: tokenA },
      });
      expect(initial.status).toBe(200);

      // 2. Add favorite
      const addRes = await app.request('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({ resourceSlug: 'button-primary' }),
      });
      expect(addRes.status).toBe(201);

      // 3. Verify in list
      const listRes = await app.request('/api/favorites', {
        headers: { Authorization: tokenA },
      });
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json() as { favorites: string[] };
      expect(listJson.favorites).toContain('button-primary');

      // 4. Remove favorite
      const delRes = await app.request('/api/favorites/button-primary', {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(delRes.status).toBe(200);

      // 5. Verify removed
      const finalRes = await app.request('/api/favorites', {
        headers: { Authorization: tokenA },
      });
      const finalJson = await finalRes.json() as { favorites: string[] };
      expect(finalJson.favorites).not.toContain('button-primary');
    });
  });

  describe('/api/collections', () => {
    let collectionId: string;

    it('creates, populates, and manages a user collection', async () => {
      // 1. Create collection
      const createRes = await app.request('/api/collections', {
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

      // 2. Add item to collection
      const addItemRes = await app.request(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenA,
        },
        body: JSON.stringify({ resourceSlug: 'hero-editorial-bold' }),
      });
      expect(addItemRes.status).toBe(200);

      // 3. Fetch collection with items
      const getRes = await app.request(`/api/collections/${collectionId}`);
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json() as { collection: { items: string[] } };
      expect(getJson.collection.items).toContain('hero-editorial-bold');

      // 4. Remove item from collection
      const remItemRes = await app.request(`/api/collections/${collectionId}/items/hero-editorial-bold`, {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(remItemRes.status).toBe(200);

      // 5. Delete collection
      const delRes = await app.request(`/api/collections/${collectionId}`, {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(delRes.status).toBe(200);
    });
  });

  describe('/api/creator-links', () => {
    let linkId: string;

    it('adds, lists, and removes external links for a creator', async () => {
      // 1. Add link
      const addRes = await app.request('/api/creator-links', {
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
      const listRes = await app.request(`/api/creator-links/${userA}`);
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json() as { links: Array<{ id: string; title: string }> };
      expect(listJson.links.some((l) => l.id === linkId)).toBe(true);

      // 3. Delete link
      const delRes = await app.request(`/api/creator-links/${linkId}`, {
        method: 'DELETE',
        headers: { Authorization: tokenA },
      });
      expect(delRes.status).toBe(200);
    });
  });

  describe('/api/reports', () => {
    it('submits a content report successfully', async () => {
      const res = await app.request('/api/reports', {
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
});
