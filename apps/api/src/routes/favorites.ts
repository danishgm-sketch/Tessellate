import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { requireAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';

export const favoritesRoute = new Hono<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>();

favoritesRoute.use('*', requireAuth);

const memoryFavorites = new Set<string>(); // composite `${userId}:${resourceSlug}`

// GET /api/favorites — List favorite resource slugs for user
favoritesRoute.get('/', async (c) => {
  const auth = c.get('auth');

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const rows = await db.select().from(schema.favorites).where(eq(schema.favorites.userId, auth.user.id)).all();
    return c.json({ favorites: rows.map((r) => r.resourceSlug) });
  }

  const prefix = `${auth.user.id}:`;
  const userFavs: string[] = [];
  for (const item of memoryFavorites) {
    if (item.startsWith(prefix)) {
      userFavs.push(item.substring(prefix.length));
    }
  }

  return c.json({ favorites: userFavs });
});

// POST /api/favorites — Add resource to favorites
favoritesRoute.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => ({}));

  if (!body.resourceSlug || typeof body.resourceSlug !== 'string') {
    return c.json({ error: 'Validation Error', message: 'resourceSlug is required' }, 400);
  }

  const slug = body.resourceSlug.trim();
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .insert(schema.favorites)
      .values({
        id: `fav_${auth.user.id}_${slug}`,
        userId: auth.user.id,
        resourceSlug: slug,
        createdAt: now,
      })
      .onConflictDoNothing();
  } else {
    memoryFavorites.add(`${auth.user.id}:${slug}`);
  }

  return c.json({ success: true, resourceSlug: slug }, 201);
});

// DELETE /api/favorites/:slug — Remove resource from favorites
favoritesRoute.delete('/:slug', async (c) => {
  const auth = c.get('auth');
  const slug = c.req.param('slug');

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
