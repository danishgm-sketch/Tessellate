import { SCHEMA_VERSION } from '../version.js';
import { ProjectManifestSchema, type ProjectManifest } from '../project.js';
import { ResourceManifestSchema, type ResourceManifest } from '../resource.js';

export interface Migration<T = unknown> {
  fromVersion: string;
  toVersion: string;
  migrate: (input: T) => T;
}

const projectMigrations: Migration<Record<string, unknown>>[] = [
  // Future version migrations will be added here
];

/**
 * Migrates and validates an unknown input into a canonical ProjectManifest.
 */
export function migrateProjectManifest(input: unknown): ProjectManifest {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Project manifest must be a non-null object');
  }

  const record = { ...(input as Record<string, unknown>) };
  const currentVersion = typeof record.schemaVersion === 'string' ? record.schemaVersion : '1.0.0';

  let migrated: Record<string, unknown> = record;
  for (const m of projectMigrations) {
    if (m.fromVersion === currentVersion) {
      migrated = m.migrate(migrated);
    }
  }

  // Ensure current target schema version is recorded
  if (!migrated.schemaVersion) {
    migrated.schemaVersion = SCHEMA_VERSION;
  }

  const result = ProjectManifestSchema.safeParse(migrated);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `[${i.path.join('.')}]: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid ProjectManifest schema: ${issues}`);
  }

  return result.data;
}

/**
 * Validates and migrates an unknown input into a canonical ResourceManifest.
 */
export function migrateResourceManifest(input: unknown): ResourceManifest {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Resource manifest must be a non-null object');
  }

  const record = { ...(input as Record<string, unknown>) };
  if (!record.schemaVersion) {
    record.schemaVersion = SCHEMA_VERSION;
  }

  const result = ResourceManifestSchema.safeParse(record);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `[${i.path.join('.')}]: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid ResourceManifest schema: ${issues}`);
  }

  return result.data;
}
