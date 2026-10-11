import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { requireAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';

export const creatorLinksRoute = new Hono<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>();

interface InMemCreatorLink {
  id: string;
  userId: string;
  title: string;
  url: string;
  createdAt: string;
}

const memoryCreatorLinks = new Map<string, InMemCreatorLink>();

// GET /api/creator-links/:userId — public link listing for a creator
creatorLinksRoute.get('/:userId', async (c) => {
  const userId = c.req.param('userId');
  if (!userId) {
    return c.json({ error: 'Validation Error', message: 'userId is required' }, 400);
  }

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const rows = await db
      .select()
      .from(schema.creatorLinks)
      .where(eq(schema.creatorLinks.userId, userId))
      .all();
    return c.json({ links: rows });
  }

  const links = Array.from(memoryCreatorLinks.values()).filter((l) => l.userId === userId);
  return c.json({ links });
});

// POST /api/creator-links — add a link for the authenticated creator
creatorLinksRoute.post('/', requireAuth, async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);

  if (!body || !body.title || !body.url) {
    return c.json({ error: 'Validation Error', message: 'title and url are required' }, 400);
  }

  try {
    new URL(body.url);
  } catch {
    return c.json({ error: 'Validation Error', message: 'Invalid URL format' }, 400);
  }

  const id = `cl_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.creatorLinks).values({
      id,
      userId: auth.user.id,
      title: String(body.title).trim(),
      url: String(body.url).trim(),
      createdAt: now,
    });
  } else {
    memoryCreatorLinks.set(id, {
      id,
      userId: auth.user.id,
      title: String(body.title).trim(),
      url: String(body.url).trim(),
      createdAt: now,
    });
  }

  return c.json({
    link: {
      id,
      userId: auth.user.id,
      title: body.title,
      url: body.url,
      createdAt: now,
    },
  }, 201);
});

// DELETE /api/creator-links/:id — remove a link owned by the creator
creatorLinksRoute.delete('/:id', requireAuth, async (c) => {
  const auth = c.get('auth');
  const linkId = c.req.param('id');
  if (!linkId) {
    return c.json({ error: 'Validation Error', message: 'id is required' }, 400);
  }

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const link = await db
      .select()
      .from(schema.creatorLinks)
      .where(and(eq(schema.creatorLinks.id, linkId), eq(schema.creatorLinks.userId, auth.user.id)))
      .get();

    if (!link) {
      return c.json({ error: 'Not Found', message: 'Link not found or access denied' }, 404);
    }

    await db.delete(schema.creatorLinks).where(eq(schema.creatorLinks.id, linkId));
  } else {
    const existing = memoryCreatorLinks.get(linkId);
    if (!existing || existing.userId !== auth.user.id) {
      return c.json({ error: 'Not Found', message: 'Link not found or access denied' }, 404);
    }
    memoryCreatorLinks.delete(linkId);
  }

  return c.json({ success: true, deletedId: linkId });
});
