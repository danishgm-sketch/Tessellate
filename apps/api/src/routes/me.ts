import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { requireAuth, optionalAuth } from '../auth.js';
import type { Env, AuthenticatedContext } from '../types.js';
import { enforceApiRateLimit, userWriteRateLimitKey } from '../rate-limit.js';
import { parseStoredProfile, profileUpdateSchema, type Profile } from '../profile-contract.js';

export const meRoute = new Hono<{ Bindings: Env; Variables: { auth?: AuthenticatedContext } }>();

// In-memory fallback profile store for tests/local mock
const memoryProfiles = new Map<string, Profile>();

function defaultProfile(auth: AuthenticatedContext, now: string): Profile {
  return {
    userId: auth.user.id,
    username: auth.user.email.split('@')[0] ?? auth.user.id,
    bio: null,
    avatarUrl: auth.user.image ?? null,
    specialtyTags: [],
    githubHandle: null,
    isAvailableForWork: false,
    createdAt: now,
    updatedAt: now,
  };
}

// GET /api/me — Returns current session and profile
meRoute.get('/', optionalAuth, async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json({
      authenticated: false,
      user: null,
      profile: null,
    });
  }

  let profile: Profile | null = null;

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const row = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, auth.user.id)).get();
    if (row) {
      profile = parseStoredProfile(row);
      if (!profile) {
        return c.json({ error: 'Service Unavailable', message: 'Profile data cannot be validated right now.' }, 503);
      }
    }
  } else {
    profile = memoryProfiles.get(auth.user.id) ?? null;
  }

  // If no profile exists yet, return default profile based on user
  if (!profile) {
    profile = defaultProfile(auth, new Date().toISOString());
  }

  return c.json({
    authenticated: true,
    user: auth.user,
    session: auth.session,
    profile,
  });
});

// PUT /api/me — Updates profile metadata for authenticated user
meRoute.put('/', requireAuth, async (c) => {
  const auth = c.get('auth') as AuthenticatedContext;
  const rateLimitResponse = await enforceApiRateLimit(c.env, 'API_USER_WRITE_LIMITER', userWriteRateLimitKey(auth.user.id));
  if (rateLimitResponse) return rateLimitResponse;
  const body = await c.req.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation Error', message: 'Profile availability must be a JSON boolean' }, 400);
  }
  const input = parsed.data;

  const now = new Date().toISOString();
  let currentProfile = defaultProfile(auth, now);

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const row = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, auth.user.id)).get();
    if (row) {
      const parsedProfile = parseStoredProfile(row);
      if (!parsedProfile) {
        return c.json({ error: 'Service Unavailable', message: 'Profile data cannot be validated right now.' }, 503);
      }
      currentProfile = parsedProfile;
    }
  } else {
    currentProfile = memoryProfiles.get(auth.user.id) ?? currentProfile;
  }

  const updatedProfile: Profile = {
    ...currentProfile,
    ...(input.username !== undefined ? { username: input.username } : {}),
    ...(input.bio !== undefined ? { bio: input.bio } : {}),
    ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    ...(input.githubHandle !== undefined ? { githubHandle: input.githubHandle } : {}),
    ...(input.specialtyTags !== undefined ? { specialtyTags: input.specialtyTags } : {}),
    ...(input.isAvailableForWork !== undefined ? { isAvailableForWork: input.isAvailableForWork } : {}),
    updatedAt: now,
  };

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .insert(schema.profiles)
      .values({
        ...updatedProfile,
        specialtyTags: JSON.stringify(updatedProfile.specialtyTags),
        isAvailableForWork: updatedProfile.isAvailableForWork ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: schema.profiles.userId,
        set: {
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatarUrl: updatedProfile.avatarUrl,
          specialtyTags: JSON.stringify(updatedProfile.specialtyTags),
          githubHandle: updatedProfile.githubHandle,
          isAvailableForWork: updatedProfile.isAvailableForWork ? 1 : 0,
          updatedAt: now,
        },
      });
  } else {
    memoryProfiles.set(auth.user.id, updatedProfile);
  }

  return c.json({
    success: true,
    profile: updatedProfile,
  });
});
