import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema.js';
import { requireAuth } from '../auth.js';
import { isCanonicalResourceSlug, resourceSlugSchema } from '../resource-slug.js';
import type { Env, AuthenticatedContext } from '../types.js';
import { enforceApiRateLimit, userWriteRateLimitKey } from '../rate-limit.js';

export const favoritesRoute = new Hono<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>();

favoritesRoute.use('*', requireAuth);

const memoryFavorites = new Set<string>(); // composite `${userId}:${resourceSlug}`
const favoriteInputSchema = z.object({ resourceSlug: resourceSlugSchema }).strict();
const MAX_FAVORITES_PER_USER = 500;
const oversizedFavorites = {
  error: 'FavoritesTooLarge',
  message: 'This favorite list exceeds the supported resource limit.',
} as const;
const invalidStoredFavorites = {
  error: 'FavoritesDataUnavailable',
  message: 'Saved resource references cannot be validated right now.',
} as const;

// GET /api/favorites — List favorite resource slugs for user
favoritesRoute.get('/', async (c) => {
  const auth = c.get('auth');

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const rows = await db.select().from(schema.favorites)
      .where(eq(schema.favorites.userId, auth.user.id))
      .limit(MAX_FAVORITES_PER_USER + 1)
      .all();
    if (rows.length > MAX_FAVORITES_PER_USER) return c.json(oversizedFavorites, 503);
    if (rows.some((row) => !isCanonicalResourceSlug(row.resourceSlug))) {
      return c.json(invalidStoredFavorites, 503);
    }
    return c.json({ favorites: rows.map((r) => r.resourceSlug) });
  }

  const prefix = `${auth.user.id}:`;
  const userFavs: string[] = [];
  for (const item of memoryFavorites) {
    if (item.startsWith(prefix)) {
      userFavs.push(item.substring(prefix.length));
    }
  }
  if (userFavs.length > MAX_FAVORITES_PER_USER) return c.json(oversizedFavorites, 503);

  return c.json({ favorites: userFavs });
});

// POST /api/favorites — Add resource to favorites
favoritesRoute.post('/', async (c) => {
  const auth = c.get('auth');
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const body = await c.req.json().catch(() => null);
  const parsed = favoriteInputSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation Error', message: 'resourceSlug must use 1–120 lowercase letters, digits, and hyphens.' }, 400);

  const slug = parsed.data.resourceSlug;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const existing = await db.select({ id: schema.favorites.id }).from(schema.favorites)
      .where(and(eq(schema.favorites.userId, auth.user.id), eq(schema.favorites.resourceSlug, slug)))
      .get();
    if (existing) return c.json({ success: true, resourceSlug: slug }, 201);
    const insert = await c.env.DB.prepare(`
      INSERT INTO favorites (id, userId, resourceSlug, createdAt)
      SELECT ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM favorites WHERE userId = ?) < ?
      ON CONFLICT(id) DO NOTHING
    `).bind(`fav_${auth.user.id}_${slug}`, auth.user.id, slug, now, auth.user.id, MAX_FAVORITES_PER_USER).run();
    if (insert.meta.changes === 0) {
      const existingAfterInsert = await db.select({ id: schema.favorites.id }).from(schema.favorites)
        .where(and(eq(schema.favorites.userId, auth.user.id), eq(schema.favorites.resourceSlug, slug)))
        .get();
      if (existingAfterInsert) return c.json({ success: true, resourceSlug: slug }, 201);
      return c.json({ error: 'FavoriteLimitReached', message: 'You can save at most 500 favorite resources.' }, 409);
    }
  } else {
    const prefix = `${auth.user.id}:`;
    const total = Array.from(memoryFavorites).filter((item) => item.startsWith(prefix)).length;
    if (!memoryFavorites.has(`${auth.user.id}:${slug}`) && total >= MAX_FAVORITES_PER_USER) {
      return c.json({ error: 'FavoriteLimitReached', message: 'You can save at most 500 favorite resources.' }, 409);
    }
    memoryFavorites.add(`${auth.user.id}:${slug}`);
  }

  return c.json({ success: true, resourceSlug: slug }, 201);
});

// DELETE /api/favorites/:slug — Remove resource from favorites
favoritesRoute.delete('/:slug', async (c) => {
  const auth = c.get('auth');
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const parsed = resourceSlugSchema.safeParse(c.req.param('slug'));
  if (!parsed.success) return c.json({ error: 'Validation Error', message: 'resourceSlug must use 1–120 lowercase letters, digits, and hyphens.' }, 400);
  const slug = parsed.data;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .delete(schema.favorites)
      .where(and(eq(schema.favorites.userId, auth.user.id), eq(schema.favorites.resourceSlug, slug)));
  } else {
    memoryFavorites.delete(`${auth.user.id}:${slug}`);
  }

  return c.json({ success: true, removed: slug });
});
