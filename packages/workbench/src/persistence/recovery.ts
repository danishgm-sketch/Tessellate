import {
  ProjectManifestSchema,
  migrateProjectManifest,
  type ProjectManifest,
} from '@tessellate/schemas';

export interface ValidProjectResult {
  status: 'valid';
  manifest: ProjectManifest;
}

export interface RecoveredProjectResult {
  status: 'recovered';
  manifest: ProjectManifest;
  migrationNotes: string[];
}

export interface CorruptedProjectRecovery {
  status: 'corrupted';
  rawRecord: unknown;
  validationIssues: string[];
  exportRawJson: () => string;
}

export type ProjectLoadResult =
  | ValidProjectResult
  | RecoveredProjectResult
  | CorruptedProjectRecovery;

/**
 * Validates and recovers a project record safely.
 * Never silently resets or deletes corrupted user data.
 */
export function safelyLoadProjectRecord(rawRecord: unknown): ProjectLoadResult {
  if (typeof rawRecord !== 'object' || rawRecord === null) {
    return {
      status: 'corrupted',
      rawRecord,
      validationIssues: ['Record is not a valid JSON object.'],
      exportRawJson: () => JSON.stringify(rawRecord, null, 2),
    };
  }

  // 1. First attempt direct validation
  const directParse = ProjectManifestSchema.safeParse(rawRecord);
  if (directParse.success) {
    return {
      status: 'valid',
      manifest: directParse.data,
    };
  }

  // 2. Attempt deterministic schema migration
  try {
    const migrated = migrateProjectManifest(rawRecord);
    return {
      status: 'recovered',
      manifest: migrated,
      migrationNotes: ['Successfully migrated older schema version to current canonical version.'],
    };
  } catch (err: unknown) {
    const issues: string[] = [];
    if (directParse.error) {
      issues.push(
        ...directParse.error.issues.map((i) => `[${i.path.join('.')}]: ${i.message}`)
      );
    }
    if (err instanceof Error) {
      issues.push(`Migration failure: ${err.message}`);
    }

    // 3. Enter safe recovery mode preserving the raw user record
    return {
      status: 'corrupted',
      rawRecord,
      validationIssues: issues,
      exportRawJson: () => JSON.stringify(rawRecord, null, 2),
    };
  }
}
