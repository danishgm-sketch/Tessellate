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
