import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../db/schema.js';
import { requireAuth, optionalAuth } from '../auth.js';
import { isCanonicalResourceSlug, resourceSlugSchema } from '../resource-slug.js';
import type { Env, AuthenticatedContext } from '../types.js';
import { enforceApiRateLimit, userWriteRateLimitKey } from '../rate-limit.js';

export const collectionsRoute = new Hono<{ Bindings: Env; Variables: { auth?: AuthenticatedContext } }>();

interface InMemCollection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items: string[];
}

const memoryCollections = new Map<string, InMemCollection>();
const createCollectionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  isPublic: z.boolean().optional(),
}).strict();
const collectionItemSchema = z.object({ resourceSlug: resourceSlugSchema }).strict();
const MAX_COLLECTIONS_PER_USER = 100;
const MAX_ITEMS_PER_COLLECTION = 500;
const oversizedCollection = {
  error: 'CollectionTooLarge',
  message: 'This collection exceeds the supported item limit and cannot be returned safely.',
} as const;
const invalidStoredCollectionItems = {
  error: 'CollectionDataUnavailable',
  message: 'Saved resource references cannot be validated right now.',
} as const;
const invalidStoredCollectionRecord = {
  error: 'CollectionDataUnavailable',
  message: 'Saved collection metadata cannot be validated right now.',
} as const;

const storedCollectionSchema = z.object({
  id: z.string().min(1).max(256),
  userId: z.string().min(1).max(256),
  name: z.string().min(1).max(120).refine((value) => value.trim().length > 0),
  description: z.string().max(2000).nullable(),
  isPublic: z.union([z.literal(0), z.literal(1)]),
  createdAt: z.string().min(1).max(64),
  updatedAt: z.string().min(1).max(64),
}).strict();

// GET /api/collections — List authenticated user's collections
collectionsRoute.get('/', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const rows = await db.select().from(schema.collections)
      .where(eq(schema.collections.userId, auth.user.id))
      .limit(MAX_COLLECTIONS_PER_USER + 1)
      .all();
    if (rows.length > MAX_COLLECTIONS_PER_USER) {
      return c.json({ error: 'CollectionLimitExceeded', message: 'Your saved collection list is larger than the supported limit.' }, 503);
    }
    const collections = [];
    for (const row of rows) {
      const collection = storedCollectionSchema.safeParse(row);
      if (!collection.success) return c.json(invalidStoredCollectionRecord, 503);
      collections.push(collection.data);
    }
    return c.json({
      collections: collections.map((collection) => ({ ...collection, isPublic: Boolean(collection.isPublic) })),
    });
  }

  const userCols = Array.from(memoryCollections.values()).filter((col) => col.userId === auth.user.id);
  if (userCols.length > MAX_COLLECTIONS_PER_USER) {
    return c.json({ error: 'CollectionLimitExceeded', message: 'Your saved collection list is larger than the supported limit.' }, 503);
  }
  return c.json({ collections: userCols });
});

// POST /api/collections — Create collection
collectionsRoute.post('/', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const body = await c.req.json().catch(() => null);
  const parsed = createCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation Error', message: 'Collection fields are invalid or exceed their limits' }, 400);
  }
  const input = parsed.data;

  if (!c.env?.DB && Array.from(memoryCollections.values()).filter((col) => col.userId === auth.user.id).length >= MAX_COLLECTIONS_PER_USER) {
    return c.json({ error: 'CollectionLimitReached', message: 'You have reached the 100-collection account limit.' }, 409);
  }

  const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newCol = {
    id,
    userId: auth.user.id,
    name: input.name,
    description: input.description || null,
    isPublic: input.isPublic === true ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  };

  if (c.env?.DB) {
    const insert = await c.env.DB.prepare(`
      INSERT INTO collections (id, userId, name, description, isPublic, createdAt, updatedAt)
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM collections WHERE userId = ?) < ?
    `).bind(
      newCol.id, newCol.userId, newCol.name, newCol.description, newCol.isPublic,
      newCol.createdAt, newCol.updatedAt, auth.user.id, MAX_COLLECTIONS_PER_USER
    ).run();
    if (insert.meta.changes === 0) {
      return c.json({ error: 'CollectionLimitReached', message: 'You have reached the 100-collection account limit.' }, 409);
    }
  } else {
    memoryCollections.set(id, { ...newCol, isPublic: Boolean(newCol.isPublic), items: [] });
  }

  return c.json({
    success: true,
    collection: { ...newCol, isPublic: Boolean(newCol.isPublic) },
  }, 201);
});

// GET /api/collections/:id — Get collection by ID with items
collectionsRoute.get('/:id', optionalAuth, async (c) => {
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Validation Error', message: 'id is required' }, 400);
  const auth = c.get('auth');

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const col = await db.select().from(schema.collections).where(eq(schema.collections.id, id)).get();

    if (!col) {
      return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
    }

    const storedCollection = storedCollectionSchema.safeParse(col);
    if (!storedCollection.success) return c.json(invalidStoredCollectionRecord, 503);
    const validCollection = storedCollection.data;
    const isPublic = Boolean(validCollection.isPublic);

    // If private, only owner can view
    if (!isPublic && (!auth || auth.user.id !== validCollection.userId)) {
      return c.json({ error: 'Forbidden', message: 'Collection is private' }, 403);
    }

    const items = await db.select().from(schema.collectionItems)
      .where(eq(schema.collectionItems.collectionId, id))
      .limit(MAX_ITEMS_PER_COLLECTION + 1)
      .all();
    if (items.length > MAX_ITEMS_PER_COLLECTION) return c.json(oversizedCollection, 503);
    if (items.some((item) => !isCanonicalResourceSlug(item.resourceSlug))) {
      return c.json(invalidStoredCollectionItems, 503);
    }
    return c.json({
      collection: {
        ...validCollection,
        isPublic,
        items: items.map((i) => i.resourceSlug),
      },
    });
  }

  const col = memoryCollections.get(id);
  if (!col) {
    return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
  }

  if (!col.isPublic && (!auth || auth.user.id !== col.userId)) {
    return c.json({ error: 'Forbidden', message: 'Collection is private' }, 403);
  }
  if (col.items.length > MAX_ITEMS_PER_COLLECTION) return c.json(oversizedCollection, 503);

  return c.json({ collection: col });
});

// POST /api/collections/:id/items — Add item to collection
collectionsRoute.post('/:id/items', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Validation Error', message: 'id is required' }, 400);
  const body = await c.req.json().catch(() => null);
  const parsed = collectionItemSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation Error', message: 'resourceSlug must use 1–120 lowercase letters, digits, and hyphens.' }, 400);

  const slug = parsed.data.resourceSlug;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const col = await db.select().from(schema.collections).where(eq(schema.collections.id, id)).get();

    if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
    if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

    const existing = await c.env.DB!.prepare('SELECT id FROM collection_items WHERE collectionId = ? AND resourceSlug = ?')
      .bind(id, slug).first<{ id: string }>();
    if (existing) return c.json({ success: true, added: slug });
    const insert = await c.env.DB!.prepare(`
      INSERT INTO collection_items (id, collectionId, resourceSlug, createdAt)
      SELECT ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM collection_items WHERE collectionId = ?) < ?
      ON CONFLICT(id) DO NOTHING
    `).bind(`ci_${id}_${slug}`, id, slug, now, id, MAX_ITEMS_PER_COLLECTION).run();
    if (insert.meta.changes === 0) {
      const existingAfterInsert = await c.env.DB!.prepare('SELECT id FROM collection_items WHERE collectionId = ? AND resourceSlug = ?')
        .bind(id, slug).first<{ id: string }>();
      if (existingAfterInsert) return c.json({ success: true, added: slug });
      return c.json({ error: 'CollectionItemLimitReached', message: 'A collection can contain at most 500 resources.' }, 409);
    }

    return c.json({ success: true, added: slug });
  }

  const col = memoryCollections.get(id);
  if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
  if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

  if (!col.items.includes(slug) && col.items.length >= MAX_ITEMS_PER_COLLECTION) {
    return c.json({ error: 'CollectionItemLimitReached', message: 'A collection can contain at most 500 resources.' }, 409);
  }
  if (!col.items.includes(slug)) {
    col.items.push(slug);
  }

  return c.json({ success: true, added: slug });
});

// DELETE /api/collections/:id/items/:slug — Remove item from collection
collectionsRoute.delete('/:id/items/:slug', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const id = c.req.param('id');
  const parsedSlug = resourceSlugSchema.safeParse(c.req.param('slug'));
  if (!id || !parsedSlug.success) return c.json({ error: 'Validation Error', message: 'A collection ID and a resource slug using 1–120 lowercase letters, digits, and hyphens are required.' }, 400);
  const slug = parsedSlug.data;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const col = await db.select().from(schema.collections).where(eq(schema.collections.id, id)).get();

    if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
    if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

    await db
      .delete(schema.collectionItems)
      .where(and(eq(schema.collectionItems.collectionId, id), eq(schema.collectionItems.resourceSlug, slug)));

    return c.json({ success: true, removed: slug });
  }

  const col = memoryCollections.get(id);
  if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
  if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

  col.items = col.items.filter((item) => item !== slug);
  return c.json({ success: true, removed: slug });
});

// DELETE /api/collections/:id — Delete collection
collectionsRoute.delete('/:id', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Validation Error', message: 'id is required' }, 400);

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const col = await db.select().from(schema.collections).where(eq(schema.collections.id, id)).get();

    if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
    if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

    await db.delete(schema.collections).where(eq(schema.collections.id, id));
    return c.json({ success: true, deletedId: id });
  }

  const col = memoryCollections.get(id);
  if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
  if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

  memoryCollections.delete(id);
  return c.json({ success: true, deletedId: id });
});
