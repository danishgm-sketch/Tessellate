import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { migrateProjectManifest, type ProjectManifest } from '@tessellate/schemas';
import { z } from 'zod';
import * as schema from '../db/schema.js';
import { optionalAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';
import { enforceApiRateLimit, publicClientRateLimitKey } from '../rate-limit.js';
import { MAX_PROJECT_NAME_LENGTH, MAX_PROJECTS_PER_USER } from '../cloud-limits.js';
import { parseStoredProfile } from '../profile-contract.js';

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
const MAX_PUBLISHED_MANIFEST_CHARS = 1_500_000;
const MAX_PUBLISHED_SLUG_LENGTH = MAX_PROJECT_NAME_LENGTH + 5;
const publishedRowSchema = z.object({
  slug: z.string().min(3).max(MAX_PUBLISHED_SLUG_LENGTH).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  projectId: z.string().min(1).max(200),
  userId: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(MAX_PROJECT_NAME_LENGTH),
  description: z.string().max(2000).nullable(),
  manifestJson: z.string().max(MAX_PUBLISHED_MANIFEST_CHARS),
  publishedAt: z.string().datetime(),
}).strict();

function parsePublishedRow(value: unknown): InMemPublished | null {
  const parsed = publishedRowSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parsePublishedManifest(manifestJson: string, projectId: string): ProjectManifest | null {
  if (manifestJson.length > MAX_PUBLISHED_MANIFEST_CHARS) return null;
  try {
    const manifest = migrateProjectManifest(JSON.parse(manifestJson));
    return manifest.id === projectId ? manifest : null;
  } catch {
    return null;
  }
}

function createRemixManifest(source: ProjectManifest, projectId: string, name: string, now: string): ProjectManifest {
  return {
    ...source,
    id: projectId,
    name,
    createdAt: now,
    updatedAt: now,
    historyMeta: { totalOperations: 0, headRevision: 0 },
  };
}

const unavailablePublishedProject = {
  error: 'Service Unavailable',
  message: 'Published project data cannot be validated right now.',
} as const;
const unavailableCreatorProfile = {
  error: 'Service Unavailable',
  message: 'Published creator data cannot be validated right now.',
} as const;

// Helper for test fixtures
export function setMemoryPublished(slug: string, data: InMemPublished) {
  memoryPublished.set(slug, data);
}

export function isMemoryPublishedSlugAvailable(slug: string, projectId: string): boolean {
  const existing = memoryPublished.get(slug);
  return !existing || existing.projectId === projectId;
}

// GET /api/published/:slug — Public read-only project page
publishedRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (!slug) {
    return c.json({ error: 'Validation Error', message: 'slug is required' }, 400);
  }

  let storedRow: unknown;
  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    storedRow = await db.select().from(schema.publishedProjects).where(eq(schema.publishedProjects.slug, slug)).get();
  } else {
    storedRow = memoryPublished.get(slug);
  }
  if (!storedRow) {
    return c.json({ error: 'Not Found', message: 'Published project not found' }, 404);
  }
  const row = parsePublishedRow(storedRow);
  if (!row || row.slug !== slug) return c.json(unavailablePublishedProject, 503);

  const manifest = parsePublishedManifest(row.manifestJson, row.projectId);
  if (!manifest) return c.json(unavailablePublishedProject, 503);

  let creator: { username: string; avatarUrl: string | null; bio: string | null } | null;
  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const creatorProfile = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, row.userId)).get();
    const parsedCreatorProfile = creatorProfile ? parseStoredProfile(creatorProfile) : null;
    if (creatorProfile && !parsedCreatorProfile) return c.json(unavailableCreatorProfile, 503);
    creator = parsedCreatorProfile
      ? { username: parsedCreatorProfile.username, avatarUrl: parsedCreatorProfile.avatarUrl, bio: parsedCreatorProfile.bio }
      : null;
  } else {
    creator = { username: 'tessellate-creator', avatarUrl: null, bio: 'Tessellate Community Member' };
  }

  return c.json({
    project: {
      slug: row.slug,
      name: row.name,
      description: row.description,
      manifest,
      publishedAt: row.publishedAt,
      creator,
    },
  });
});

// POST /api/published/:slug/remix — Remix published project into an independent copy
publishedRoute.post('/:slug/remix', optionalAuth, async (c) => {
  const auth = c.get('auth');
  const rateLimitResponse = await enforceApiRateLimit(
    c.env,
    'API_PUBLIC_WRITE_LIMITER',
    auth ? `user:${auth.user.id}` : publicClientRateLimitKey(c.env, c.req.raw)
  );
  if (rateLimitResponse) return rateLimitResponse;

  const slug = c.req.param('slug');
  if (!slug) {
    return c.json({ error: 'Validation Error', message: 'slug is required' }, 400);
  }
  let storedRow: unknown;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    storedRow = await db.select().from(schema.publishedProjects).where(eq(schema.publishedProjects.slug, slug)).get();
  } else {
    storedRow = memoryPublished.get(slug);
  }

  if (!storedRow) {
    return c.json({ error: 'Not Found', message: 'Published project not found to remix' }, 404);
  }
  const row = parsePublishedRow(storedRow);
  if (!row || row.slug !== slug) return c.json(unavailablePublishedProject, 503);

  const parsedManifest = parsePublishedManifest(row.manifestJson, row.projectId);
  if (!parsedManifest) return c.json(unavailablePublishedProject, 503);

  const remixSuffix = ' (Remix)';
  const remixedName = `${(row.name || parsedManifest.name).slice(0, MAX_PROJECT_NAME_LENGTH - remixSuffix.length)}${remixSuffix}`;

  // If user is logged in, create an independent project under their cloud account
  if (auth) {
    const newProjectId = `proj_remix_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const remixManifest = createRemixManifest(parsedManifest, newProjectId, remixedName, now);
    const canonicalManifestJson = JSON.stringify(remixManifest);

    const newProject = {
      id: newProjectId,
      userId: auth.user.id,
      name: remixedName,
      description: row.description,
      currentRevision: 1,
      manifestJson: canonicalManifestJson,
      isPublished: 0,
      publishedSlug: null,
      remixFromProjectId: row.projectId,
      createdAt: now,
      updatedAt: now,
    };

    if (c.env?.DB) {
      const results = await c.env.DB.batch([
        c.env.DB.prepare(`
          INSERT INTO projects (id, userId, name, description, currentRevision, manifestJson, isPublished, publishedSlug, remixFromProjectId, createdAt, updatedAt)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          WHERE (SELECT COUNT(*) FROM projects WHERE userId = ?) < ?
        `).bind(
          newProject.id, newProject.userId, newProject.name, newProject.description,
          newProject.currentRevision, newProject.manifestJson, newProject.isPublished,
          newProject.publishedSlug, newProject.remixFromProjectId, newProject.createdAt,
          newProject.updatedAt, auth.user.id, MAX_PROJECTS_PER_USER
        ),
        c.env.DB.prepare(`
          INSERT INTO project_revisions (id, projectId, revisionNumber, summary, manifestJson, createdAt)
          SELECT ?, ?, ?, ?, ?, ?
          WHERE EXISTS (
            SELECT 1 FROM projects WHERE id = ? AND userId = ? AND currentRevision = 1 AND manifestJson = ?
          )
        `).bind(
          `rev_${newProjectId}_1`, newProjectId, 1, `Remixed from ${row.name}`,
          canonicalManifestJson, now, newProjectId, auth.user.id, canonicalManifestJson
        ),
      ]);
      if (results[0]?.meta.changes !== 1) {
        return c.json({ error: 'ProjectLimitReached', message: `You can save at most ${MAX_PROJECTS_PER_USER} cloud projects.` }, 409);
      }
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
      manifest: remixManifest,
    }, 201);
  }

  // Guest remixes also receive a new manifest identity so a local save cannot overwrite its source.
  const guestProjectId = `proj_remix_${crypto.randomUUID()}`;
  const guestManifest = createRemixManifest(parsedManifest, guestProjectId, remixedName, new Date().toISOString());

  return c.json({
    success: true,
    guestRemix: true,
    remixType: 'local-guest',
    name: remixedName,
    manifest: guestManifest,
    message: 'Guest remix returned for local IndexedDB store.',
  });
});
