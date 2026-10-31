import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { requireAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';
import { enforceApiRateLimit, userWriteRateLimitKey } from '../rate-limit.js';

export const creatorLinksRoute = new Hono<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>();

interface InMemCreatorLink {
  id: string;
  userId: string;
  title: string;
  url: string;
  createdAt: string;
}

const memoryCreatorLinks = new Map<string, InMemCreatorLink>();
const MAX_CREATOR_LINKS = 20;
const oversizedCreatorLinks = {
  error: 'CreatorLinksTooLarge',
  message: 'This creator profile exceeds the supported public link limit.',
} as const;
const invalidStoredCreatorLinks = {
  error: 'CreatorLinksDataUnavailable',
  message: 'Creator links cannot be validated right now.',
} as const;

function isSafeCreatorLink(value: unknown): value is InMemCreatorLink {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const link = value as Record<string, unknown>;
  if (
    typeof link.id !== 'string' || link.id.length < 1 || link.id.length > 200 ||
    typeof link.userId !== 'string' || link.userId.length < 1 || link.userId.length > 200 ||
    typeof link.title !== 'string' || !link.title.trim() || link.title.trim().length > 120 ||
    typeof link.url !== 'string' || link.url.length > 2048 ||
    typeof link.createdAt !== 'string' || link.createdAt.length < 1 || link.createdAt.length > 100
  ) return false;
  try {
    const url = new URL(link.url);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

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
      .limit(MAX_CREATOR_LINKS + 1)
      .all();
    if (rows.length > MAX_CREATOR_LINKS) return c.json(oversizedCreatorLinks, 503);
    if (rows.some((row) => !isSafeCreatorLink(row))) return c.json(invalidStoredCreatorLinks, 503);
    return c.json({ links: rows });
  }

  const links = Array.from(memoryCreatorLinks.values()).filter((l) => l.userId === userId);
  if (links.length > MAX_CREATOR_LINKS) return c.json(oversizedCreatorLinks, 503);
  if (links.some((link) => !isSafeCreatorLink(link))) return c.json(invalidStoredCreatorLinks, 503);
  return c.json({ links });
});

// POST /api/creator-links — add a link for the authenticated creator
creatorLinksRoute.post('/', requireAuth, async (c) => {
  const auth = c.get('auth');
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const body = await c.req.json().catch(() => null);

  if (
    !body ||
    typeof body.title !== 'string' ||
    typeof body.url !== 'string' ||
    !body.title.trim() ||
    !body.url.trim() ||
    body.title.trim().length > 120 ||
    body.url.trim().length > 2048
  ) {
    return c.json({ error: 'Validation Error', message: 'title and url are required' }, 400);
  }

  if (!c.env?.DB && Array.from(memoryCreatorLinks.values()).filter((link) => link.userId === auth.user.id).length >= MAX_CREATOR_LINKS) {
    return c.json({ error: 'CreatorLinkLimitReached', message: 'A creator profile can contain at most 20 links.' }, 409);
  }

  const title = body.title.trim();
  let safeUrl: URL;
  try {
    safeUrl = new URL(body.url.trim());
  } catch {
    return c.json({ error: 'Validation Error', message: 'Invalid URL format' }, 400);
  }
  if (
    !['https:', 'http:'].includes(safeUrl.protocol) ||
    !safeUrl.hostname ||
    safeUrl.username ||
    safeUrl.password
  ) {
    return c.json({ error: 'Validation Error', message: 'URL must use HTTP or HTTPS and cannot include embedded credentials' }, 400);
  }

  const id = `cl_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const insert = await c.env.DB.prepare(`
      INSERT INTO creator_links (id, userId, title, url, createdAt)
      SELECT ?, ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM creator_links WHERE userId = ?) < ?
    `).bind(id, auth.user.id, title, safeUrl.href, now, auth.user.id, MAX_CREATOR_LINKS).run();
    if (insert.meta.changes === 0) {
      return c.json({ error: 'CreatorLinkLimitReached', message: 'A creator profile can contain at most 20 links.' }, 409);
    }
  } else {
    memoryCreatorLinks.set(id, {
      id,
      userId: auth.user.id,
      title,
      url: safeUrl.href,
      createdAt: now,
    });
  }

  return c.json({
    link: {
      id,
      userId: auth.user.id,
      title,
      url: safeUrl.href,
      createdAt: now,
    },
  }, 201);
});

// DELETE /api/creator-links/:id — remove a link owned by the creator
creatorLinksRoute.delete('/:id', requireAuth, async (c) => {
  const auth = c.get('auth');
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
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
