import { zodToJsonSchema } from 'zod-to-json-schema';
import { ResourceManifestSchema } from './resource.js';
import { ProjectManifestSchema } from './project.js';

export function getResourceManifestJsonSchema(): Record<string, unknown> {
  return zodToJsonSchema(ResourceManifestSchema, {
    name: 'ResourceManifest',
    $refStrategy: 'relative',
  }) as Record<string, unknown>;
}

export function getProjectManifestJsonSchema(): Record<string, unknown> {
  return zodToJsonSchema(ProjectManifestSchema, {
    name: 'ProjectManifest',
    $refStrategy: 'relative',
  }) as Record<string, unknown>;
}

export function toStandardJsonSchema(schema: Parameters<typeof zodToJsonSchema>[0], name?: string): Record<string, unknown> {
  return zodToJsonSchema(schema, name ? { name, $refStrategy: 'none' } : { $refStrategy: 'none' }) as Record<string, unknown>;
}
