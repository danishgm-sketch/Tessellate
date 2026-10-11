import {
  ProjectManifestSchema,
  migrateProjectManifest,
  type ProjectManifest,
} from '@tessellate/schemas';

export interface ImportResult {
  success: boolean;
  manifest?: ProjectManifest;
  error?: string;
  warnings?: string[];
}

/**
 * Serializes a validated ProjectManifest to a clean, formatted .tess.json string.
 */
export function exportProjectManifestToJson(manifest: ProjectManifest): string {
  // Ensure manifest complies with schema
  const validated = ProjectManifestSchema.parse(manifest);
  return JSON.stringify(validated, null, 2);
}

/**
 * Parses and validates an imported .tess.json string into a canonical ProjectManifest.
 * Automatically runs deterministic migrations if the file was created with an earlier schema version.
 */
export function importProjectManifestFromJson(jsonStr: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonStr);
  } catch (err) {
    return {
      success: false,
      error: `Malformed JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Attempt direct parse
  const directResult = ProjectManifestSchema.safeParse(raw);
  if (directResult.success) {
    return {
      success: true,
      manifest: directResult.data,
      warnings: [],
    };
  }

  // Attempt migration if direct parse had schema mismatches
  try {
    const migrated = migrateProjectManifest(raw);
    return {
      success: true,
      manifest: migrated,
      warnings: ['Project manifest was migrated from an earlier schema version.'],
    };
  } catch (migErr) {
    const issues = directResult.error.issues
      .map((i) => `[${i.path.join('.')}]: ${i.message}`)
      .join('; ');
    return {
      success: false,
      error: `Validation failed: ${issues}. (${migErr instanceof Error ? migErr.message : ''})`,
    };
  }
}
