import { z } from 'zod';

export const specialtyTagsSchema = z.array(z.string().trim().min(1).max(64)).max(20);
export const profileUrlSchema = z.string().trim().url().max(2048).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
});
const githubHandleSchema = z.string().trim().max(39)
  .regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/);

export const profileUpdateSchema = z.object({
  username: z.string().trim().min(1).max(80).optional(),
  bio: z.string().max(2000).nullable().optional(),
  avatarUrl: profileUrlSchema.nullable().optional(),
  githubHandle: githubHandleSchema.nullable().optional(),
  specialtyTags: specialtyTagsSchema.optional(),
  isAvailableForWork: z.boolean().optional(),
}).strict();

export interface Profile {
  userId: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  specialtyTags: string[];
  githubHandle: string | null;
  isAvailableForWork: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredProfileRecord {
  userId: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  specialtyTags: string | null;
  githubHandle: string | null;
  isAvailableForWork: number | null;
  createdAt: string;
  updatedAt: string;
}

const storedProfileFieldsSchema = z.object({
  userId: z.string().min(1).max(200),
  username: z.string().trim().min(1).max(80),
  bio: z.string().max(2000).nullable(),
  avatarUrl: profileUrlSchema.nullable(),
  specialtyTags: specialtyTagsSchema,
  githubHandle: githubHandleSchema.nullable(),
  isAvailableForWork: z.union([z.literal(0), z.literal(1)]),
  createdAt: z.string().min(1).max(100),
  updatedAt: z.string().min(1).max(100),
}).strict();

export function parseStoredProfile(row: StoredProfileRecord): Profile | null {
  let specialtyTags: unknown;
  try {
    specialtyTags = row.specialtyTags ? JSON.parse(row.specialtyTags) as unknown : [];
  } catch {
    return null;
  }

  const parsed = storedProfileFieldsSchema.safeParse({
    userId: row.userId,
    username: row.username ?? row.userId,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    specialtyTags,
    githubHandle: row.githubHandle,
    isAvailableForWork: row.isAvailableForWork,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
  if (!parsed.success) return null;
  return { ...parsed.data, isAvailableForWork: parsed.data.isAvailableForWork === 1 };
}
