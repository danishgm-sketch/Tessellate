import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema.js';
import { requireAuth, optionalAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';

export const meRoute = new Hono<{ Bindings: Env; Variables: { auth?: AuthenticatedContext } }>();

// In-memory fallback profile store for tests/local mock
const memoryProfiles = new Map<string, Record<string, unknown>>();

// GET /api/me — Returns current session and profile
meRoute.get('/', optionalAuth, async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json({
      authenticated: false,
      user: null,
      profile: null,
    });
  }

  let profile: Record<string, unknown> | null = null;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const row = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, auth.user.id)).get();
    if (row) {
      profile = {
        ...row,
        specialtyTags: row.specialtyTags ? JSON.parse(row.specialtyTags) : [],
        isAvailableForWork: Boolean(row.isAvailableForWork),
      };
    }
  } else {
    profile = memoryProfiles.get(auth.user.id) ?? null;
  }

  // If no profile exists yet, return default profile based on user
  if (!profile) {
    profile = {
      userId: auth.user.id,
      username: auth.user.email.split('@')[0],
      bio: null,
      avatarUrl: auth.user.image ?? null,
      specialtyTags: [],
      githubHandle: null,
      isAvailableForWork: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return c.json({
    authenticated: true,
    user: auth.user,
    session: auth.session,
    profile,
  });
});

const ProfileUpdateSchema = z
  .object({
    username: z.string().trim().min(2).max(40).regex(/^[a-z0-9_.-]+$/i, 'letters, digits, . _ - only').optional(),
    bio: z.string().max(500).nullable().optional(),
    avatarUrl: z.string().url().max(500).refine((u) => u.startsWith('https://'), 'must be an https URL').nullable().optional(),
    specialtyTags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
    githubHandle: z.string().trim().max(39).regex(/^[a-z0-9-]*$/i).nullable().optional(),
    isAvailableForWork: z.boolean().optional(),
  });

// PUT /api/me — Updates profile metadata for authenticated user
meRoute.put('/', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const parsed = ProfileUpdateSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    return c.json({ error: 'Validation Error', message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }, 400);
  }
  const body = parsed.data;

  const now = new Date().toISOString();
  const updatedProfile = {
    userId: auth.user.id,
    username: typeof body.username === 'string' ? body.username.trim() : auth.user.email.split('@')[0],
    bio: typeof body.bio === 'string' ? body.bio : null,
    avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : auth.user.image ?? null,
    specialtyTags: Array.isArray(body.specialtyTags) ? body.specialtyTags : [],
    githubHandle: typeof body.githubHandle === 'string' ? body.githubHandle : null,
    isAvailableForWork: Boolean(body.isAvailableForWork),
    createdAt: now,
    updatedAt: now,
  };

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .insert(schema.profiles)
      .values({
        ...updatedProfile,
        specialtyTags: JSON.stringify(updatedProfile.specialtyTags),
        isAvailableForWork: updatedProfile.isAvailableForWork ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: schema.profiles.userId,
        set: {
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatarUrl: updatedProfile.avatarUrl,
          specialtyTags: JSON.stringify(updatedProfile.specialtyTags),
          githubHandle: updatedProfile.githubHandle,
          isAvailableForWork: updatedProfile.isAvailableForWork ? 1 : 0,
          updatedAt: now,
        },
      });
  } else {
    memoryProfiles.set(auth.user.id, updatedProfile);
  }

  return c.json({
    success: true,
    profile: updatedProfile,
  });
});

// GET /api/me/export — GDPR data export: everything Tessellate stores in the cloud for this account.
meRoute.get('/export', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const exportedAt = new Date().toISOString();
  if (!c.env?.DB) {
    return c.json({ exportedAt, user: auth.user, profile: memoryProfiles.get(auth.user.id) ?? null, projects: [], favorites: [], collections: [], published: [], reports: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const uid = auth.user.id;
  const [profile, projects, favorites, collections, published, reports] = await Promise.all([
    db.select().from(schema.profiles).where(eq(schema.profiles.userId, uid)).get(),
    db.select().from(schema.projects).where(eq(schema.projects.userId, uid)).all(),
    db.select().from(schema.favorites).where(eq(schema.favorites.userId, uid)).all(),
    db.select().from(schema.collections).where(eq(schema.collections.userId, uid)).all(),
    db.select().from(schema.publishedProjects).where(eq(schema.publishedProjects.userId, uid)).all(),
    db.select().from(schema.reports).where(eq(schema.reports.reporterUserId, uid)).all(),
  ]);
  c.header('Content-Disposition', `attachment; filename="tessellate-account-export-${exportedAt.slice(0, 10)}.json"`);
  return c.json({ exportedAt, user: auth.user, profile: profile ?? null, projects, favorites, collections, published, reports });
});
