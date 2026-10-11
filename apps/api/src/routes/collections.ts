import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { requireAuth, optionalAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';

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

// GET /api/collections — List authenticated user's collections
collectionsRoute.get('/', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const rows = await db.select().from(schema.collections).where(eq(schema.collections.userId, auth.user.id)).all();
    return c.json({
      collections: rows.map((r) => ({ ...r, isPublic: Boolean(r.isPublic) })),
    });
  }

  const userCols = Array.from(memoryCollections.values()).filter((col) => col.userId === auth.user.id);
  return c.json({ collections: userCols });
});

// POST /api/collections — Create collection
collectionsRoute.post('/', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const body = await c.req.json().catch(() => ({}));

  if (!body.name || typeof body.name !== 'string') {
    return c.json({ error: 'Validation Error', message: 'Collection name is required' }, 400);
  }

  const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newCol = {
    id,
    userId: auth.user.id,
    name: body.name.trim(),
    description: typeof body.description === 'string' ? body.description.trim() : null,
    isPublic: body.isPublic ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  };

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.collections).values(newCol);
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

    // If private, only owner can view
    if (!col.isPublic && (!auth || auth.user.id !== col.userId)) {
      return c.json({ error: 'Forbidden', message: 'Collection is private' }, 403);
    }

    const items = await db.select().from(schema.collectionItems).where(eq(schema.collectionItems.collectionId, id)).all();

    return c.json({
      collection: {
        ...col,
        isPublic: Boolean(col.isPublic),
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

  return c.json({ collection: col });
});

// POST /api/collections/:id/items — Add item to collection
collectionsRoute.post('/:id/items', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Validation Error', message: 'id is required' }, 400);
  const body = await c.req.json().catch(() => ({}));

  if (!body.resourceSlug || typeof body.resourceSlug !== 'string') {
    return c.json({ error: 'Validation Error', message: 'resourceSlug is required' }, 400);
  }

  const slug = body.resourceSlug.trim();
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const col = await db.select().from(schema.collections).where(eq(schema.collections.id, id)).get();

    if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
    if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

    await db
      .insert(schema.collectionItems)
      .values({
        id: `ci_${id}_${slug}`,
        collectionId: id,
        resourceSlug: slug,
        createdAt: now,
      })
      .onConflictDoNothing();

    return c.json({ success: true, added: slug });
  }

  const col = memoryCollections.get(id);
  if (!col) return c.json({ error: 'Not Found', message: 'Collection not found' }, 404);
  if (col.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

  if (!col.items.includes(slug)) {
    col.items.push(slug);
  }

  return c.json({ success: true, added: slug });
});

// DELETE /api/collections/:id/items/:slug — Remove item from collection
collectionsRoute.delete('/:id/items/:slug', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const id = c.req.param('id');
  const slug = c.req.param('slug');
  if (!id || !slug) return c.json({ error: 'Validation Error', message: 'id and slug are required' }, 400);

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
