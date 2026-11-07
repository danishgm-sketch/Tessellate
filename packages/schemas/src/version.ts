import { z } from 'zod';

export const SCHEMA_VERSION = '1.0.0' as const;

/** Exact version accepted by current persisted contracts after migration. */
export const SchemaVersionSchema = z.literal(SCHEMA_VERSION);
