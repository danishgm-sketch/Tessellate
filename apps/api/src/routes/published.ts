import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { optionalAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';

export const publishedRoute = new Hono<{ Bindings: Env; Variables: { auth?: AuthenticatedContext } }>();

// In-memory fallback for test environments
interface InMemPublished {
  slug: string;
  projectId: string;
  userId: string;
  name: string;
  description: string | null;
  manifestJson: string;
  publishedAt: string;
}

const memoryPublished = new Map<string, InMemPublished>();

// Helper for test fixtures
export function setMemoryPublished(slug: string, data: InMemPublished) {
  memoryPublished.set(slug, data);
}

// GET /api/published/:slug — Public read-only project page
publishedRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (!slug) {
    return c.json({ error: 'Validation Error', message: 'slug is required' }, 400);
  }

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const row = await db.select().from(schema.publishedProjects).where(eq(schema.publishedProjects.slug, slug)).get();

    if (!row) {
      return c.json({ error: 'Not Found', message: 'Published project not found' }, 404);
    }

    // Also fetch creator profile if available
    const creatorProfile = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, row.userId)).get();

    return c.json({
      project: {
        slug: row.slug,
        name: row.name,
        description: row.description,
        manifest: JSON.parse(row.manifestJson),
        publishedAt: row.publishedAt,
        creator: creatorProfile
          ? {
              username: creatorProfile.username,
              avatarUrl: creatorProfile.avatarUrl,
              bio: creatorProfile.bio,
            }
          : null,
      },
    });
  }

  const row = memoryPublished.get(slug);
  if (!row) {
    return c.json({ error: 'Not Found', message: 'Published project not found' }, 404);
  }

  return c.json({
    project: {
      slug: row.slug,
      name: row.name,
      description: row.description,
      manifest: JSON.parse(row.manifestJson),
      publishedAt: row.publishedAt,
      creator: {
        username: 'tessellate-creator',
        avatarUrl: null,
        bio: 'Tessellate Community Member',
      },
    },
  });
});

// POST /api/published/:slug/remix — Remix published project into an independent copy
publishedRoute.post('/:slug/remix', optionalAuth, async (c) => {
  const slug = c.req.param('slug');
  if (!slug) {
    return c.json({ error: 'Validation Error', message: 'slug is required' }, 400);
  }
  const auth = c.get('auth');

  let row: {
    slug: string;
    projectId: string;
    userId: string;
    name: string;
    description: string | null;
    manifestJson: string;
  } | undefined;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    row = await db.select().from(schema.publishedProjects).where(eq(schema.publishedProjects.slug, slug)).get();
  } else {
    row = memoryPublished.get(slug);
  }

  if (!row) {
    return c.json({ error: 'Not Found', message: 'Published project not found to remix' }, 404);
  }

  const remixedName = `${row.name} (Remix)`;
  const parsedManifest = JSON.parse(row.manifestJson);

  // If user is logged in, create an independent project under their cloud account
  if (auth) {
    const newProjectId = `proj_remix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newProject = {
      id: newProjectId,
      userId: auth.user.id,
      name: remixedName,
      description: row.description,
      currentRevision: 1,
      manifestJson: row.manifestJson,
      isPublished: 0,
      publishedSlug: null,
      remixFromProjectId: row.projectId,
      createdAt: now,
      updatedAt: now,
    };

    if (c.env?.DB) {
      const db = drizzle(c.env.DB, { schema });
      await db.insert(schema.projects).values(newProject);
      await db.insert(schema.projectRevisions).values({
        id: `rev_${newProjectId}_1`,
        projectId: newProjectId,
        revisionNumber: 1,
        summary: `Remixed from ${row.name}`,
        manifestJson: row.manifestJson,
        createdAt: now,
      });
    }

    return c.json({
      success: true,
      remixType: 'cloud',
      cloudProject: {
        id: newProjectId,
        userId: auth.user.id,
        name: remixedName,
      },
      projectId: newProjectId,
      name: remixedName,
      manifest: parsedManifest,
    }, 201);
  }

  // If guest, return manifest for independent local cloning in IndexedDB
  const guestManifest = {
    ...parsedManifest,
    metadata: {
      ...(parsedManifest.metadata ?? {}),
      name: remixedName,
    },
  };

  return c.json({
    success: true,
    guestRemix: true,
    remixType: 'local-guest',
    name: remixedName,
    manifest: guestManifest,
    message: 'Guest remix returned for local IndexedDB store.',
  });
});
