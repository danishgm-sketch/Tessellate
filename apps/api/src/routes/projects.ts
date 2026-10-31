import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { migrateProjectManifest, type ProjectManifest } from '@tessellate/schemas';
import * as schema from '../db/schema.js';
import { requireAuth } from '../auth.js';
import { isMemoryPublishedSlugAvailable, setMemoryPublished } from './published.js';
import type { Env, AuthenticatedContext } from '../types.js';
import { enforceApiRateLimit, userWriteRateLimitKey } from '../rate-limit.js';
import { MAX_PROJECT_NAME_LENGTH, MAX_PROJECT_REVISIONS, MAX_PROJECTS_PER_USER } from '../cloud-limits.js';

export const projectsRoute = new Hono<{
  Bindings: Env;
  Variables: { auth: AuthenticatedContext };
}>();

// All /api/projects endpoints require authentication
projectsRoute.use('*', requireAuth);
projectsRoute.use('*', async (c, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) return next();
  const auth = c.get('auth');
  const rateLimitResponse = await enforceApiRateLimit(
    c.env,
    'API_USER_WRITE_LIMITER',
    userWriteRateLimitKey(auth.user.id)
  );
  if (rateLimitResponse) return rateLimitResponse;
  return next();
});

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

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
const MAX_PROJECT_DESCRIPTION_LENGTH = 2000;
const MAX_PROJECT_MANIFEST_CHARS = 1_500_000;
const MAX_PROJECT_LIST_RESPONSE_BYTES = 8 * 1024 * 1024;
const jsonEncoder = new TextEncoder();
const storedProjectRecordSchema = z.object({
  id: z.string().min(1).max(MAX_PROJECT_MANIFEST_CHARS),
  userId: z.string().min(1).max(256),
  name: z.string().min(1).max(MAX_PROJECT_NAME_LENGTH).refine((value) => value.trim().length > 0),
  description: z.string().max(MAX_PROJECT_DESCRIPTION_LENGTH).nullable(),
  currentRevision: z.number().int().min(1).max(MAX_PROJECT_REVISIONS),
  manifestJson: z.string().min(1).max(MAX_PROJECT_MANIFEST_CHARS),
  isPublished: z.union([z.literal(0), z.literal(1)]).nullable(),
  publishedSlug: z.string().min(1).max(MAX_PROJECT_NAME_LENGTH + 5).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).nullable(),
  remixFromProjectId: z.string().min(1).max(MAX_PROJECT_MANIFEST_CHARS).nullable(),
  createdAt: z.string().min(1).max(64),
  updatedAt: z.string().min(1).max(64),
}).strict();
const storedProjectRevisionSchema = z.object({
  id: z.string().min(1).max(MAX_PROJECT_MANIFEST_CHARS + 16),
  projectId: z.string().min(1).max(MAX_PROJECT_MANIFEST_CHARS),
  revisionNumber: z.number().int().min(1).max(MAX_PROJECT_REVISIONS),
  summary: z.string().min(1).max(MAX_PROJECT_NAME_LENGTH + 13),
  manifestJson: z.string().min(1).max(MAX_PROJECT_MANIFEST_CHARS),
  createdAt: z.string().min(1).max(64),
}).strict();

function createBoundedJsonList(key: 'projects' | 'revisions') {
  const items: unknown[] = [];
  let bytes = jsonEncoder.encode(`{"${key}":[`).byteLength + jsonEncoder.encode(']}').byteLength;
  return {
    items,
    append(item: unknown): boolean {
      const itemBytes = jsonEncoder.encode(JSON.stringify(item)).byteLength + (items.length > 0 ? 1 : 0);
      if (bytes + itemBytes > MAX_PROJECT_LIST_RESPONSE_BYTES) return false;
      bytes += itemBytes;
      items.push(item);
      return true;
    },
  };
}
const checkpointBodySchema = z.object({ summary: z.string().trim().min(1).max(120).optional() }).strict();
const updateRevisionSummarySchema = z.string().trim().min(1).max(MAX_PROJECT_NAME_LENGTH + 13);
const publishBodySchema = z.object({
  customSlug: z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
}).strict();

async function readOptionalJsonBody(c: { req: { text: () => Promise<string> } }): Promise<unknown> {
  const raw = await c.req.text().catch(() => 'invalid-json');
  if (raw.length === 0) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
const unavailableStoredProject = {
  error: 'Service Unavailable',
  message: 'Saved project data cannot be validated; no changes were made.',
} as const;

function readManifestPayload(body: Record<string, unknown>){
  const hasManifest = hasOwn(body, 'manifest');
  const hasManifestJson = hasOwn(body, 'manifestJson');
  if (hasManifest && hasManifestJson) return { valid: false as const, supplied: true };
  if (!hasManifest && !hasManifestJson) return { valid: true as const, supplied: false };
  return { valid: true as const, supplied: true, value: hasManifestJson ? body.manifestJson : body.manifest };
}

function parseProjectManifest(value: unknown): ProjectManifest | null {
  try {
    if (typeof value === 'string' && value.length > MAX_PROJECT_MANIFEST_CHARS) return null;
    const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value;
    return migrateProjectManifest(parsed);
  } catch {
    return null;
  }
}

function canonicalStoredManifestJson(manifestJson: string, projectId: string): string | null {
  const manifest = parseProjectManifest(manifestJson);
  if (!manifest || manifest.id !== projectId) return null;
  return JSON.stringify(manifest);
}

function normalizedStoredProjectManifest(
  project: Pick<InMemProject, 'id' | 'name' | 'description' | 'manifestJson'>
): string | null {
  const manifest = parseProjectManifest(project.manifestJson);
  if (!manifest || manifest.id !== project.id) return null;
  return normalizeProjectManifest(manifest, project.id, project.name, project.description);
}

function normalizeProjectManifest(
  manifest: ProjectManifest,
  projectId: string,
  name: string,
  description: string | null
): string | null {
  if (manifest.id !== projectId) return null;
  const candidate: ProjectManifest = { ...manifest, name };
  if (description === null) delete candidate.description;
  else candidate.description = description;
  try {
    return JSON.stringify(migrateProjectManifest(candidate));
  } catch {
    return null;
  }
}

function resolveUpdateManifest(
  body: Record<string, unknown>,
  projectId: string,
  existingManifestJson: string,
  existingName: string,
  existingDescription: string | null
): { ok: true; name: string; description: string | null; manifestJson: string } | { ok: false; status: 400 | 409; message: string } {
  const payload = readManifestPayload(body);
  if (!payload.valid) return { ok: false, status: 400, message: 'Provide either manifest or manifestJson, not both.' };
  const manifest = parseProjectManifest(payload.supplied ? payload.value : existingManifestJson);
  if (!manifest || manifest.id !== projectId) {
    return {
      ok: false,
      status: payload.supplied ? 400 : 409,
      message: payload.supplied
        ? 'The supplied project manifest is invalid or has a different project ID.'
        : 'The stored project manifest cannot be validated; no changes were made.',
    };
  }

  let name = payload.supplied ? manifest.name : existingName;
  if (hasOwn(body, 'name')) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > MAX_PROJECT_NAME_LENGTH) {
      return { ok: false, status: 400, message: 'Project name is invalid or exceeds its limit.' };
    }
    name = body.name.trim();
  }

  let description = payload.supplied ? manifest.description ?? null : existingDescription;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > MAX_PROJECT_NAME_LENGTH) {
    return { ok: false, status: 400, message: 'Project name is invalid or exceeds its limit.' };
  }
  name = name.trim();
  if (hasOwn(body, 'description')) {
    if (body.description === null) description = null;
    else if (typeof body.description === 'string' && body.description.length <= MAX_PROJECT_DESCRIPTION_LENGTH) {
      description = body.description.trim();
    } else {
      return { ok: false, status: 400, message: 'Project description is invalid or exceeds its limit.' };
    }
  }
  if (description !== null && (typeof description !== 'string' || description.length > MAX_PROJECT_DESCRIPTION_LENGTH)) {
    return { ok: false, status: 400, message: 'Project description is invalid or exceeds its limit.' };
  }

  const manifestJson = normalizeProjectManifest(manifest, projectId, name, description);
  if (!manifestJson) {
    return { ok: false, status: 400, message: 'The project manifest could not be normalized safely.' };
  }
  return { ok: true, name, description, manifestJson };
}

// GET /api/projects — List projects belonging to the authenticated user
projectsRoute.get('/', async (c) => {
  const auth = c.get('auth');

  if (c.env?.DB) {
    const storedBytes = await c.env.DB.prepare(
      'SELECT COALESCE(SUM(length(CAST(manifestJson AS BLOB))), 0) AS totalBytes FROM projects WHERE userId = ?'
    ).bind(auth.user.id).first<{ totalBytes: number }>();
    if ((storedBytes?.totalBytes ?? 0) > MAX_PROJECT_LIST_RESPONSE_BYTES) {
      return c.json({ error: 'ProjectListTooLarge', message: 'The saved project data exceeds the supported response size.' }, 503);
    }
    const db = drizzle(c.env.DB, { schema });
    const rows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.userId, auth.user.id))
      .orderBy(desc(schema.projects.updatedAt))
      .limit(MAX_PROJECTS_PER_USER + 1)
      .all();
    if (rows.length > MAX_PROJECTS_PER_USER) {
      return c.json({ error: 'ProjectListTooLarge', message: 'This account has more saved projects than the supported list limit.' }, 503);
    }

    const result = createBoundedJsonList('projects');
    for (const row of rows) {
      const storedProject = storedProjectRecordSchema.safeParse(row);
      if (!storedProject.success) return c.json(unavailableStoredProject, 503);
      const manifestJson = normalizedStoredProjectManifest(storedProject.data);
      if (!manifestJson) return c.json(unavailableStoredProject, 503);
      if (!result.append({ ...storedProject.data, manifestJson, isPublished: Boolean(storedProject.data.isPublished) })) {
        return c.json({ error: 'ProjectListTooLarge', message: 'The saved project data exceeds the supported response size.' }, 503);
      }
    }
    return c.json({ projects: result.items });
  }

  const userProjects = Array.from(memoryProjects.values()).filter((p) => p.userId === auth.user.id);
  if (userProjects.length > MAX_PROJECTS_PER_USER) {
    return c.json({ error: 'ProjectListTooLarge', message: 'This account has more saved projects than the supported list limit.' }, 503);
  }
  const result = createBoundedJsonList('projects');
  for (const project of userProjects) {
    const manifestJson = normalizedStoredProjectManifest(project);
    if (!manifestJson) return c.json(unavailableStoredProject, 503);
    if (!result.append({ ...project, manifestJson })) {
      return c.json({ error: 'ProjectListTooLarge', message: 'The saved project data exceeds the supported response size.' }, 503);
    }
  }
  return c.json({ projects: result.items });
});

// POST /api/projects — Create a new cloud project
projectsRoute.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json(
      { error: 'Validation Error', message: 'Project creation must be a JSON object.' },
      400
    );
  }

  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > MAX_PROJECT_NAME_LENGTH) {
    return c.json({ error: 'Validation Error', message: 'Project name is invalid or exceeds its limit.' }, 400);
  }

  const payload = readManifestPayload(body);
  if (!payload.valid || !payload.supplied) {
    return c.json({ error: 'Validation Error', message: 'A single valid project manifest is required.' }, 400);
  }
  const manifest = parseProjectManifest(payload.value);
  if (!manifest) {
    return c.json({ error: 'Validation Error', message: 'The project manifest does not match the canonical schema.' }, 400);
  }

  if (body.id !== undefined && typeof body.id !== 'string') {
    return c.json({ error: 'Validation Error', message: 'Project ID is invalid.' }, 400);
  }
  const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : manifest.id;
  if (id !== manifest.id) {
    return c.json({ error: 'Validation Error', message: 'Project ID must match the manifest ID.' }, 400);
  }

  let description = manifest.description ?? null;
  if (body.description !== undefined) {
    if (body.description === null) description = null;
    else if (typeof body.description === 'string' && body.description.length <= MAX_PROJECT_DESCRIPTION_LENGTH) {
      description = body.description.trim();
    } else {
      return c.json({ error: 'Validation Error', message: 'Project description is invalid or exceeds its limit.' }, 400);
    }
  }
  if (description !== null && description.length > MAX_PROJECT_DESCRIPTION_LENGTH) {
    return c.json({ error: 'Validation Error', message: 'Project description is invalid or exceeds its limit.' }, 400);
  }
  const name = body.name.trim();
  const manifestJson = normalizeProjectManifest(manifest, id, name, description);
  if (!manifestJson) {
    return c.json({ error: 'Validation Error', message: 'The project manifest could not be normalized safely.' }, 400);
  }

  const now = new Date().toISOString();

  const newProject = {
    id,
    userId: auth.user.id,
    name,
    description,
    currentRevision: 1,
    manifestJson,
    isPublished: 0,
    publishedSlug: null,
    remixFromProjectId:
      typeof body.remixFromProjectId === 'string' ? body.remixFromProjectId : null,
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
        SELECT ?, ?, ?, ?, ?, ? WHERE changes() = 1
      `).bind(
        initialRevision.id, initialRevision.projectId, initialRevision.revisionNumber,
        initialRevision.summary, initialRevision.manifestJson, initialRevision.createdAt
      ),
    ]).catch(() => null);
    if (!results) return c.json({ error: 'PersistenceUnavailable', message: 'The project could not be saved. Try again.' }, 503);
    if (results[0]!.meta.changes === 0) {
      return c.json({ error: 'ProjectLimitReached', message: `You can save at most ${MAX_PROJECTS_PER_USER} cloud projects.` }, 409);
    }
  } else {
    const userProjectCount = Array.from(memoryProjects.values()).filter((project) => project.userId === auth.user.id).length;
    if (userProjectCount >= MAX_PROJECTS_PER_USER) {
      return c.json({ error: 'ProjectLimitReached', message: `You can save at most ${MAX_PROJECTS_PER_USER} cloud projects.` }, 409);
    }
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
    const row = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .get();

    if (!row) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    // Preserve the ordinary ownership response without trusting any other
    // column from a row whose runtime types may have been corrupted.
    if (typeof row.userId === 'string' && row.userId !== auth.user.id) {
      return c.json(
        { error: 'Forbidden', message: 'You do not have permission to access this project' },
        403
      );
    }
    const storedProject = storedProjectRecordSchema.safeParse(row);
    if (!storedProject.success) return c.json(unavailableStoredProject, 503);
    if (storedProject.data.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'You do not have permission to access this project' }, 403);
    }

    const manifestJson = normalizedStoredProjectManifest(storedProject.data);
    if (!manifestJson) return c.json(unavailableStoredProject, 503);

    return c.json({
      project: {
        ...storedProject.data,
        manifestJson,
        isPublished: Boolean(storedProject.data.isPublished),
      },
    });
  }

  const row = memoryProjects.get(projectId);
  if (!row) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (row.userId !== auth.user.id) {
    return c.json(
      { error: 'Forbidden', message: 'You do not have permission to access this project' },
      403
    );
  }

  const manifestJson = normalizedStoredProjectManifest(row);
  if (!manifestJson) return c.json(unavailableStoredProject, 503);
  return c.json({ project: { ...row, manifestJson } });
});

// PUT /api/projects/:id — Update project manifest & save revision
projectsRoute.put('/:id', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json(
      { error: 'Validation Error', message: 'Project update must be a JSON object.' },
      400
    );
  }

  if (!Number.isSafeInteger(body.expectedRevision) || body.expectedRevision < 1) {
    return c.json(
      {
        error: 'PreconditionRequired',
        message: 'expectedRevision is required to protect newer project edits.',
      },
      428
    );
  }

  const parsedSummary = body.summary === undefined
    ? undefined
    : updateRevisionSummarySchema.safeParse(body.summary);
  if (parsedSummary && !parsedSummary.success) {
    return c.json({
      error: 'Validation Error',
      message: `Project revision summary must contain between 1 and ${MAX_PROJECT_NAME_LENGTH + 13} characters.`,
    }, 400);
  }
  const revisionSummary = parsedSummary?.success
    ? parsedSummary.data
    : `Revision ${body.expectedRevision + 1}`;

  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const existing = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .get();

    if (!existing) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (typeof existing.userId === 'string' && existing.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'You do not own this project' }, 403);
    }
    const storedProject = storedProjectRecordSchema.safeParse(existing);
    if (!storedProject.success) return c.json(unavailableStoredProject, 503);
    if (storedProject.data.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'You do not own this project' }, 403);

    if (storedProject.data.currentRevision !== body.expectedRevision) {
      return c.json(
        {
          error: 'RevisionConflict',
          message:
            'The project changed after this client last loaded it. Reload or reconcile before saving.',
          currentRevision: storedProject.data.currentRevision,
        },
        409
      );
    }
    if (storedProject.data.currentRevision >= MAX_PROJECT_REVISIONS) {
      return c.json({ error: 'RevisionLimitReached', message: `Project history is limited to ${MAX_PROJECT_REVISIONS} revisions.` }, 409);
    }

    const resolvedManifest = resolveUpdateManifest(
      body,
      projectId,
      storedProject.data.manifestJson,
      storedProject.data.name,
      storedProject.data.description
    );
    if (!resolvedManifest.ok) {
      return c.json({ error: 'InvalidProjectManifest', message: resolvedManifest.message }, resolvedManifest.status);
    }
    const nextRevision = body.expectedRevision + 1;
    const { manifestJson, name, description } = resolvedManifest;

    // D1 batches run atomically. Keep the revision snapshot in the same batch
    // as the compare-and-swap update so a failed checkpoint cannot leave the
    // current project ahead of its recoverable history.
    const updateResults = await c.env
      .DB!.batch([
        c.env
          .DB!.prepare(
            `
        UPDATE projects
        SET name = ?, description = ?, currentRevision = ?, manifestJson = ?, updatedAt = ?
        WHERE id = ? AND userId = ? AND currentRevision = ?
      `
          )
        .bind(
            name,
            description,
            nextRevision,
            manifestJson,
            now,
            projectId,
            auth.user.id,
            body.expectedRevision
          ),
        c.env
          .DB!.prepare(
            `
        INSERT INTO project_revisions (id, projectId, revisionNumber, summary, manifestJson, createdAt)
        SELECT ?, ?, ?, ?, ?, ?
        WHERE changes() = 1
      `
          )
          .bind(
            `rev_${projectId}_${nextRevision}`,
            projectId,
            nextRevision,
            revisionSummary,
            manifestJson,
            now
          ),
      ])
      .catch(() => null);

    if (!updateResults) {
      return c.json(
        {
          error: 'PersistenceUnavailable',
          message: 'The project could not be saved. Reload and try again.',
        },
        503
      );
    }

    if (updateResults[0]!.meta.changes === 0) {
      const current = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId))
        .get();
      if (!current) return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
      const storedCurrent = storedProjectRecordSchema.safeParse(current);
      if (!storedCurrent.success) return c.json(unavailableStoredProject, 503);
      return c.json(
        {
          error: 'RevisionConflict',
          message:
            'The project changed after this client last loaded it. Reload or reconcile before saving.',
          currentRevision: storedCurrent.data.currentRevision,
        },
        409
      );
    }

    return c.json({
      success: true,
      project: {
        ...storedProject.data,
        name,
        description,
        currentRevision: nextRevision,
        manifestJson,
        isPublished: Boolean(storedProject.data.isPublished),
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

  if (existing.currentRevision !== body.expectedRevision) {
    return c.json(
      {
        error: 'RevisionConflict',
        message:
          'The project changed after this client last loaded it. Reload or reconcile before saving.',
        currentRevision: existing.currentRevision,
      },
      409
    );
  }
  if (existing.currentRevision >= MAX_PROJECT_REVISIONS) {
    return c.json({ error: 'RevisionLimitReached', message: `Project history is limited to ${MAX_PROJECT_REVISIONS} revisions.` }, 409);
  }

  const resolvedManifest = resolveUpdateManifest(
    body,
    projectId,
    existing.manifestJson,
    existing.name,
    existing.description
  );
  if (!resolvedManifest.ok) {
    return c.json({ error: 'InvalidProjectManifest', message: resolvedManifest.message }, resolvedManifest.status);
  }
  const nextRevision = body.expectedRevision + 1;
  const { manifestJson, name, description } = resolvedManifest;
  const updated: InMemProject = {
    ...existing,
    name,
    description,
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
    summary: revisionSummary,
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
    const existing = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .get();

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
    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .get();

    if (!project) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (project.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
    }

    const storedBytes = await c.env.DB.prepare(
      'SELECT COALESCE(SUM(length(CAST(manifestJson AS BLOB))), 0) AS totalBytes FROM project_revisions WHERE projectId = ?'
    ).bind(projectId).first<{ totalBytes: number }>();
    if ((storedBytes?.totalBytes ?? 0) > MAX_PROJECT_LIST_RESPONSE_BYTES) {
      return c.json({ error: 'ProjectHistoryTooLarge', message: 'The saved project history exceeds the supported response size.' }, 503);
    }

    const revisions = await db
      .select()
      .from(schema.projectRevisions)
      .where(eq(schema.projectRevisions.projectId, projectId))
      .orderBy(desc(schema.projectRevisions.revisionNumber))
      .limit(MAX_PROJECT_REVISIONS + 1)
      .all();
    if (revisions.length > MAX_PROJECT_REVISIONS) {
      return c.json({ error: 'ProjectHistoryTooLarge', message: 'This project has more saved revisions than the supported history limit.' }, 503);
    }

    const validatedRevisions = createBoundedJsonList('revisions');
    for (const revision of revisions) {
      const storedRevision = storedProjectRevisionSchema.safeParse(revision);
      if (!storedRevision.success) return c.json(unavailableStoredProject, 503);
      const manifestJson = canonicalStoredManifestJson(storedRevision.data.manifestJson, projectId);
      if (!manifestJson) return c.json(unavailableStoredProject, 503);
      if (!validatedRevisions.append({ ...storedRevision.data, manifestJson })) {
        return c.json({ error: 'ProjectHistoryTooLarge', message: 'The saved project history exceeds the supported response size.' }, 503);
      }
    }
    return c.json({ revisions: validatedRevisions.items });
  }

  const project = memoryProjects.get(projectId);
  if (!project) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (project.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
  }

  const revisions = memoryRevisions.get(projectId) || [];
  if (revisions.length > MAX_PROJECT_REVISIONS) {
    return c.json({ error: 'ProjectHistoryTooLarge', message: 'This project has more saved revisions than the supported history limit.' }, 503);
  }
  const validatedRevisions = createBoundedJsonList('revisions');
  for (const revision of revisions) {
    const storedRevision = storedProjectRevisionSchema.safeParse(revision);
    if (!storedRevision.success) return c.json(unavailableStoredProject, 503);
    const manifestJson = canonicalStoredManifestJson(storedRevision.data.manifestJson, projectId);
    if (!manifestJson) return c.json(unavailableStoredProject, 503);
    if (!validatedRevisions.append({ ...storedRevision.data, manifestJson })) {
      return c.json({ error: 'ProjectHistoryTooLarge', message: 'The saved project history exceeds the supported response size.' }, 503);
    }
  }
  return c.json({ revisions: validatedRevisions.items });
});

// POST /api/projects/:id/revisions — Create a named checkpoint revision
projectsRoute.post('/:id/revisions', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');
  const body = await readOptionalJsonBody(c);
  const parsedBody = checkpointBodySchema.safeParse(body);
  if (!parsedBody.success) return c.json({ error: 'Validation Error', message: 'Checkpoint data must be an object with an optional summary of at most 120 characters.' }, 400);

  const now = new Date().toISOString();
  const summary = parsedBody.data.summary ?? 'Manual checkpoint';

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .get();

    if (!project) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (typeof project.userId === 'string' && project.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
    }
    const storedProject = storedProjectRecordSchema.safeParse(project);
    if (!storedProject.success) return c.json(unavailableStoredProject, 503);
    if (storedProject.data.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

    const manifestJson = normalizedStoredProjectManifest(storedProject.data);
    if (!manifestJson) return c.json(unavailableStoredProject, 503);
    const revisionCount = await db.select({ value: count() }).from(schema.projectRevisions)
      .where(eq(schema.projectRevisions.projectId, projectId)).get();
    if (storedProject.data.currentRevision >= MAX_PROJECT_REVISIONS || (revisionCount?.value ?? 0) >= MAX_PROJECT_REVISIONS) {
      return c.json({ error: 'RevisionLimitReached', message: `Project history is limited to ${MAX_PROJECT_REVISIONS} revisions.` }, 409);
    }

    const nextRevisionNumber = storedProject.data.currentRevision + 1;
    const revisionId = `rev_${projectId}_${nextRevisionNumber}`;

    // A manual checkpoint is a project revision just like a save. Compare and
    // swap the project first, then write its snapshot in the same atomic D1
    // batch. Concurrent checkpoint requests can therefore produce only one
    // revision number, and a failed snapshot write rolls the project update
    // back with it.
    const checkpointResults = await c.env.DB!.batch([
      c.env.DB!.prepare(`
        UPDATE projects
        SET currentRevision = ?, updatedAt = ?
        WHERE id = ? AND userId = ? AND currentRevision = ? AND currentRevision < ?
          AND (SELECT COUNT(*) FROM project_revisions WHERE projectId = ?) < ?
      `).bind(
        nextRevisionNumber,
        now,
        projectId,
        auth.user.id,
        project.currentRevision,
        MAX_PROJECT_REVISIONS,
        projectId,
        MAX_PROJECT_REVISIONS
      ),
      c.env.DB!.prepare(`
        INSERT INTO project_revisions (id, projectId, revisionNumber, summary, manifestJson, createdAt)
        SELECT ?, ?, ?, ?, ?, ?
        WHERE changes() = 1
      `).bind(revisionId, projectId, nextRevisionNumber, summary, manifestJson, now),
    ]).catch(() => null);

    if (!checkpointResults) {
      return c.json({
        error: 'PersistenceUnavailable',
        message: 'The checkpoint could not be saved. Reload and try again.',
      }, 503);
    }

    if (checkpointResults[0]!.meta.changes === 0) {
      const current = await db.select().from(schema.projects)
        .where(eq(schema.projects.id, projectId)).get();
      if (!current) return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
      const storedCurrent = storedProjectRecordSchema.safeParse(current);
      if (!storedCurrent.success) return c.json(unavailableStoredProject, 503);
      const currentRevisionCount = await db.select({ value: count() }).from(schema.projectRevisions)
        .where(eq(schema.projectRevisions.projectId, projectId)).get();
      if (storedCurrent.data.currentRevision >= MAX_PROJECT_REVISIONS || (currentRevisionCount?.value ?? 0) >= MAX_PROJECT_REVISIONS) {
        return c.json({ error: 'RevisionLimitReached', message: `Project history is limited to ${MAX_PROJECT_REVISIONS} revisions.` }, 409);
      }
      return c.json({
        error: 'RevisionConflict',
        message: 'The project changed while this checkpoint was being created. Reload and try again.',
        currentRevision: storedCurrent.data.currentRevision,
      }, 409);
    }

    return c.json(
      {
        success: true,
        revision: {
          id: revisionId,
          projectId,
          revisionNumber: nextRevisionNumber,
          summary,
          manifestJson,
          createdAt: now,
        },
      },
      201
    );
  }

  const project = memoryProjects.get(projectId);
  if (!project) {
    return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
  }

  if (project.userId !== auth.user.id) {
    return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
  }

  const manifestJson = normalizedStoredProjectManifest(project);
  if (!manifestJson) return c.json(unavailableStoredProject, 503);
  const existingRevisions = memoryRevisions.get(projectId) || [];
  if (project.currentRevision >= MAX_PROJECT_REVISIONS || existingRevisions.length >= MAX_PROJECT_REVISIONS) {
    return c.json({ error: 'RevisionLimitReached', message: `Project history is limited to ${MAX_PROJECT_REVISIONS} revisions.` }, 409);
  }

  const nextRevisionNumber = project.currentRevision + 1;
  const revisionId = `rev_${projectId}_${nextRevisionNumber}`;
  const newRevision: InMemRevision = {
    id: revisionId,
    projectId,
    revisionNumber: nextRevisionNumber,
    summary,
    manifestJson,
    createdAt: now,
  };

  project.currentRevision = nextRevisionNumber;
  project.updatedAt = now;
  memoryProjects.set(projectId, project);

  memoryRevisions.set(projectId, [newRevision, ...existingRevisions]);

  return c.json(
    {
      success: true,
      revision: newRevision,
    },
    201
  );
});

// POST /api/projects/:id/publish — Publish project read-only snapshot
projectsRoute.post('/:id/publish', async (c) => {
  const auth = c.get('auth');
  const projectId = c.req.param('id');
  const body = await readOptionalJsonBody(c);
  const parsedBody = publishBodySchema.safeParse(body);
  if (!parsedBody.success) return c.json({ error: 'Validation Error', message: 'Publish data must be an object with an optional lowercase URL slug.' }, 400);

  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .get();

    if (!project) {
      return c.json({ error: 'Not Found', message: 'Project not found' }, 404);
    }

    if (typeof project.userId === 'string' && project.userId !== auth.user.id) {
      return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);
    }
    const storedProject = storedProjectRecordSchema.safeParse(project);
    if (!storedProject.success) return c.json(unavailableStoredProject, 503);
    if (storedProject.data.userId !== auth.user.id) return c.json({ error: 'Forbidden', message: 'Unauthorized' }, 403);

    const manifestJson = normalizedStoredProjectManifest(storedProject.data);
    if (!manifestJson) return c.json(unavailableStoredProject, 503);

    // Generate clean slug from project name
    const baseSlug = storedProject.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = parsedBody.data.customSlug ?? `${baseSlug || 'project'}-${Math.random().toString(36).substring(2, 6)}`;

    // Save into published_projects
    const publication = await db
      .insert(schema.publishedProjects)
      .values({
        slug,
        projectId,
        userId: auth.user.id,
        name: storedProject.data.name,
        description: storedProject.data.description,
        manifestJson,
        publishedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.publishedProjects.slug,
        set: {
          name: storedProject.data.name,
          description: storedProject.data.description,
          manifestJson,
          publishedAt: now,
        },
        setWhere: eq(schema.publishedProjects.projectId, projectId),
      });
    if (publication.meta.changes === 0) {
      return c.json({ error: 'SlugUnavailable', message: 'That public URL is already used by another project.' }, 409);
    }

    await db
      .update(schema.projects)
      .set({ isPublished: 1, publishedSlug: slug, updatedAt: now })
      .where(eq(schema.projects.id, projectId));

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

  const manifestJson = normalizedStoredProjectManifest(project);
  if (!manifestJson) return c.json(unavailableStoredProject, 503);

  const baseSlug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = parsedBody.data.customSlug ?? `${baseSlug || 'project'}-${Math.random().toString(36).substring(2, 6)}`;

  if (!isMemoryPublishedSlugAvailable(slug, projectId)) {
    return c.json({ error: 'SlugUnavailable', message: 'That public URL is already used by another project.' }, 409);
  }

  project.isPublished = true;
  project.publishedSlug = slug;
  memoryProjects.set(projectId, project);

  setMemoryPublished(slug, {
    slug,
    projectId,
    userId: auth.user.id,
    name: project.name,
    description: project.description,
    manifestJson,
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
