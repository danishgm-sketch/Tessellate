import { Hono } from 'hono';
import { createAuth } from '../auth.js';
import type { Env } from '../types.js';

export const authRoute = new Hono<{ Bindings: Env }>();

// Forward all Better Auth endpoints (/api/auth/*)
authRoute.all('/*', async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});
