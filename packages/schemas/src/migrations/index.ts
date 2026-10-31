import { SCHEMA_VERSION } from '../version.js';
import { ProjectManifestSchema, type ProjectManifest } from '../project.js';
import { ResourceManifestSchema, type ResourceManifest } from '../resource.js';

export interface Migration<T = unknown> {
  fromVersion: string;
  toVersion: string;
  migrate: (input: T) => T;
}

const projectMigrations: Migration<Record<string, unknown>>[] = [
  {
    fromVersion: '0.1.0',
    toVersion: SCHEMA_VERSION,
    migrate: (input) => {
      const product = input.productModel;
      if (typeof product === 'object' && product !== null && !Array.isArray(product)) {
        const productModel = product as Record<string, unknown>;
        const productVersion = productModel.schemaVersion;
        if (
          productVersion !== undefined &&
          productVersion !== '0.1.0' &&
          productVersion !== SCHEMA_VERSION
        ) {
          throw new Error(
            `Cannot migrate ProductModel schema version ${String(productVersion)} with ProjectManifest 0.1.0.`
          );
        }
        return {
          ...input,
          schemaVersion: SCHEMA_VERSION,
          productModel: { ...productModel, schemaVersion: SCHEMA_VERSION },
        };
      }

      return { ...input, schemaVersion: SCHEMA_VERSION };
    },
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Migrates and validates an unknown input into a canonical ProjectManifest.
 */
export function migrateProjectManifest(input: unknown): ProjectManifest {
  if (!isRecord(input)) {
    throw new Error('Project manifest must be a non-null object');
  }

  const record = { ...input };
  const hasVersion = Object.prototype.hasOwnProperty.call(record, 'schemaVersion');
  if (!hasVersion) {
    throw new Error('ProjectManifest schema version is required.');
  }
  let version = record.schemaVersion;
  if (typeof version !== 'string') {
    throw new Error(`Unsupported ProjectManifest schema version: ${String(version)}.`);
  }
  let migrated: Record<string, unknown> = record;

  for (let attempts = 0; version !== SCHEMA_VERSION && attempts < projectMigrations.length + 1; attempts++) {
    const migration = projectMigrations.find((candidate) => candidate.fromVersion === version);
    if (!migration) {
      throw new Error(`Unsupported ProjectManifest schema version: ${version}.`);
    }
    migrated = migration.migrate(migrated);
    if (migration.toVersion === version) {
      throw new Error(`Invalid ProjectManifest migration cycle at version ${version}.`);
    }
    version = migration.toVersion;
    migrated.schemaVersion = version;
  }

  if (version !== SCHEMA_VERSION) {
    throw new Error(`Unsupported ProjectManifest schema version: ${version}.`);
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
  if (!isRecord(input)) {
    throw new Error('Resource manifest must be a non-null object');
  }

  const record = { ...input };
  const hasVersion = Object.prototype.hasOwnProperty.call(record, 'schemaVersion');
  if (!hasVersion) {
    throw new Error('ResourceManifest schema version is required.');
  } else if (record.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Unsupported ResourceManifest schema version: ${String(record.schemaVersion)}.`);
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
