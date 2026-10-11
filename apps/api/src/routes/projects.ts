import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { requireAuth } from '../auth.js';
import { setMemoryPublished } from './published.js';
import type { Env, AuthenticatedContext } from '../types.js';

export const projectsRoute = new Hono<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>();

// All /api/projects endpoints require authentication
projectsRoute.use('*', requireAuth);

// In-memory fallback stores for test runs when D1 binding is not attached
interface InMemProject {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  currentRevision: number;
  manifestJson: string;
  isPublished: boolean;
  publishedSlug: string | null;
  remixFromProjectId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InMemRevision {
  id: string;
  projectId: string;
  revisionNumber: number;
  summary: string;
  manifestJson: string;
  createdAt: string;
}

const memoryProjects = new Map<string, InMemProject>();
const memoryRevisions = new Map<string, InMemRevision[]>();

// GET /api/projects — List projects belonging to the authenticated user
projectsRoute.get('/', async (c) => {
  const auth = c.get('auth');

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const rows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.userId, auth.user.id))
      .orderBy(desc(schema.projects.updatedAt))
      .all();

    const result = rows.map((r) => ({
      ...r,
      isPublished: Boolean(r.isPublished),
    }));
    return c.json({ projects: result });
  }

  const userProjects = Array.from(memoryProjects.values()).filter((p) => p.userId === auth.user.id);
  return c.json({ projects: userProjects });
});

// POST /api/projects — Create a new cloud project
projectsRoute.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => ({}));

  if (!body.name || typeof body.name !== 'string') {
    return c.json({ error: 'Validation Error', message: 'Project name is required' }, 400);
  }

  const id = body.id && typeof body.id === 'string' ? body.id : `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const manifestJson = typeof body.manifestJson === 'string' ? body.manifestJson : JSON.stringify(body.manifest ?? {});

  const newProject = {
    id,
    userId: auth.user.id,
    name: body.name.trim(),
    description: typeof body.description === 'string' ? body.description.trim() : null,
    currentRevision: 1,
    manifestJson,
    isPublished: 0,
    publishedSlug: null,
    remixFromProjectId: typeof body.remixFromProjectId === 'string' ? body.remixFromProjectId : null,
    createdAt: now,
    updatedAt: now,
  };

  const initialRevision = {
    id: `rev_${id}_1`,
    projectId: id,
    revisionNumber: 1,
    summary: 'Initial project checkpoint',
    manifestJson,
    createdAt: now,
  };

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.projects).values(newProject);
    await db.insert(schema.projectRevisions).values(initialRevision);
  } else {
    memoryProjects.set(id, { ...newProject, isPublished: false });
    memoryRevisions.set(id, [initialRevision]);
  }

  return c.json({ success: true, project: newProject }, 201);
});

// GET /api/projects/:id — Get a single project (strictly owned by user)
projectsRoute.get('/:id', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const row = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).get();

    if (!row) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    // Ownership check: Prevent cross-account access
    if (row.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'You do not have permission to access this project' }, 403);
    }

    return c.json({
      project: {
        ...row,
        isPublished: Boolean(row.isPublished),
      },
    });
  }

  const row = memoryProjects.get(projectId);
  if (!row) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (row.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'You do not have permission to access this project' }, 403);
  }

  return c.json({ project: row });
});

// PUT /api/projects/:id — Update project manifest & save revision
projectsRoute.put('/:id', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const existing = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).get();

    if (!existing) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (existing.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'You do not own this project' }, 403);
    }

    const nextRevision = existing.currentRevision + 1;
    const manifestJson = typeof body.manifestJson === 'string' ? body.manifestJson : JSON.stringify(body.manifest ?? {});
    const name = typeof body.name === 'string' ? body.name.trim() : existing.name;
    const description = typeof body.description === 'string' ? body.description.trim() : existing.description;

    await db
      .update(schema.projects)
      .set({
        name,
        description,
        currentRevision: nextRevision,
        manifestJson,
        updatedAt: now,
      })
      .where(eq(schema.projects.id, projectId));

    // Record checkpoint
    await db.insert(schema.projectRevisions).values({
      id: `rev_${projectId}_${nextRevision}`,
      projectId,
      revisionNumber: nextRevision,
      summary: typeof body.summary === 'string' ? body.summary : `Revision ${nextRevision}`,
      manifestJson,
      createdAt: now,
    });

    return c.json({
      success: true,
      project: {
        ...existing,
        name,
        description,
        currentRevision: nextRevision,
        manifestJson,
        updatedAt: now,
      },
    });
  }

  const existing = memoryProjects.get(projectId);
  if (!existing) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (existing.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'You do not own this project' }, 403);
  }

  const nextRevision = existing.currentRevision + 1;
  const manifestJson = typeof body.manifestJson === 'string' ? body.manifestJson : JSON.stringify(body.manifest ?? {});
  const updated: InMemProject = {
    ...existing,
    name: typeof body.name === 'string' ? body.name.trim() : existing.name,
    description: typeof body.description === 'string' ? body.description.trim() : existing.description,
    currentRevision: nextRevision,
    manifestJson,
    updatedAt: now,
  };

  memoryProjects.set(projectId, updated);

  const revs = memoryRevisions.get(projectId) || [];
  revs.push({
    id: `rev_${projectId}_${nextRevision}`,
    projectId,
    revisionNumber: nextRevision,
    summary: typeof body.summary === 'string' ? body.summary : `Revision ${nextRevision}`,
    manifestJson,
    createdAt: now,
  });
  memoryRevisions.set(projectId, revs);

  return c.json({ success: true, project: updated });
});

// DELETE /api/projects/:id — Delete project (checks ownership)
projectsRoute.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const existing = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).get();

    if (!existing) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (existing.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'You do not own this project' }, 403);
    }

    await db.delete(schema.projects).where(eq(schema.projects.id, projectId));
    return c.json({ success: true, deletedId: projectId });
  }

  const existing = memoryProjects.get(projectId);
  if (!existing) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (existing.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'You do not own this project' }, 403);
  }

  memoryProjects.delete(projectId);
  memoryRevisions.delete(projectId);
  return c.json({ success: true, deletedId: projectId });
});

// GET /api/projects/:id/revisions — Get revision checkpoints
projectsRoute.get('/:id/revisions', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const project = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).get();

    if (!project) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (project.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
    }

    const revisions = await db
      .select()
      .from(schema.projectRevisions)
      .where(eq(schema.projectRevisions.projectId, projectId))
      .orderBy(desc(schema.projectRevisions.revisionNumber))
      .all();

    return c.json({ revisions });
  }

  const project = memoryProjects.get(projectId);
  if (!project) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (project.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
  }

  const revisions = memoryRevisions.get(projectId) || [];
  return c.json({ revisions });
});

// POST /api/projects/:id/revisions — Create a named checkpoint revision
projectsRoute.post('/:id/revisions', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  const now = new Date().toISOString();
  const summary = typeof body.summary === 'string' ? body.summary.trim() : 'Manual checkpoint';

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const project = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).get();

    if (!project) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (project.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
    }

    const nextRevisionNumber = project.currentRevision + 1;
    const revisionId = `rev_${projectId}_${nextRevisionNumber}`;

    await db.insert(schema.projectRevisions).values({
      id: revisionId,
      projectId,
      revisionNumber: nextRevisionNumber,
      summary,
      manifestJson: project.manifestJson,
      createdAt: now,
    });

    await db
      .update(schema.projects)
      .set({
        currentRevision: nextRevisionNumber,
        updatedAt: now,
      })
      .where(eq(schema.projects.id, projectId));

    return c.json({
      success: true,
      revision: {
        id: revisionId,
        projectId,
        revisionNumber: nextRevisionNumber,
        summary,
        manifestJson: project.manifestJson,
        createdAt: now,
      },
    }, 201);
  }

  const project = memoryProjects.get(projectId);
  if (!project) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (project.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
  }

  const nextRevisionNumber = project.currentRevision + 1;
  const revisionId = `rev_${projectId}_${nextRevisionNumber}`;
  const newRevision: InMemRevision = {
    id: revisionId,
    projectId,
    revisionNumber: nextRevisionNumber,
    summary,
    manifestJson: project.manifestJson,
    createdAt: now,
  };

  project.currentRevision = nextRevisionNumber;
  project.updatedAt = now;
  memoryProjects.set(projectId, project);

  const existingRevs = memoryRevisions.get(projectId) || [];
  memoryRevisions.set(projectId, [newRevision, ...existingRevs]);

  return c.json({
    success: true,
    revision: newRevision,
  }, 201);
});

// POST /api/projects/:id/publish — Publish project read-only snapshot
projectsRoute.post('/:id/publish', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const project = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).get();

    if (!project) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (project.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
    }

    // Generate clean slug from project name
    const baseSlug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = body.customSlug && typeof body.customSlug === 'string'
      ? body.customSlug.trim().toLowerCase()
      : `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Update project state
    await db
      .update(schema.projects)
      .set({
        isPublished: 1,
        publishedSlug: slug,
        updatedAt: now,
      })
      .where(eq(schema.projects.id, projectId));

    // Save into published_projects
    await db
      .insert(schema.publishedProjects)
      .values({
        slug,
        projectId,
        userId: auth.user.id,
        name: project.name,
        description: project.description,
        manifestJson: project.manifestJson,
        publishedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.publishedProjects.slug,
        set: {
          name: project.name,
          description: project.description,
          manifestJson: project.manifestJson,
          publishedAt: now,
        },
      });

    return c.json({
      success: true,
      slug,
      publishedSlug: slug,
      url: `/published/${slug}`,
      publicUrl: `/p/${slug}`,
    });
  }

  const project = memoryProjects.get(projectId);
  if (!project) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (project.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
  }

  const baseSlug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  project.isPublished = true;
  project.publishedSlug = slug;
  memoryProjects.set(projectId, project);

  setMemoryPublished(slug, {
    slug,
    projectId,
    userId: auth.user.id,
    name: project.name,
    description: project.description,
    manifestJson: project.manifestJson,
    publishedAt: now,
  });

  return c.json({
    success: true,
    slug,
    publishedSlug: slug,
    url: `/published/${slug}`,
    publicUrl: `/p/${slug}`,
  });
});
