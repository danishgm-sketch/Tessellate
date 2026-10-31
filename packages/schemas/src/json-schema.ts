import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { ResourceManifestSchema } from './resource.js';
import { ProjectManifestSchema } from './project.js';

type ZodToJsonSchemaInput = Parameters<typeof zodToJsonSchema>[0];

function convertSchema(
  schema: z.ZodType,
  name?: string,
  refStrategy: 'relative' | 'none' = 'none'
): Record<string, unknown> {
  // zod-to-json-schema 3.25.2 declares its input through Zod 3 types, but its
  // peer range and runtime converter support Zod 4. Keep that compatibility
  // boundary local and exercise the generated documents in contract tests.
  const compatibleSchema = schema as unknown as ZodToJsonSchemaInput;
  return zodToJsonSchema(
    compatibleSchema,
    name ? { name, $refStrategy: refStrategy } : { $refStrategy: refStrategy }
  ) as Record<string, unknown>;
}

export function getResourceManifestJsonSchema(): Record<string, unknown> {
  return convertSchema(ResourceManifestSchema, 'ResourceManifest', 'relative');
}

export function getProjectManifestJsonSchema(): Record<string, unknown> {
  return convertSchema(ProjectManifestSchema, 'ProjectManifest', 'relative');
}

export function toStandardJsonSchema(schema: z.ZodType, name?: string): Record<string, unknown> {
  return convertSchema(schema, name);
}
