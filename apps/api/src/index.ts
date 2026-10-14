import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { authRoute } from './routes/auth.js';
import { meRoute } from './routes/me.js';
import { projectsRoute } from './routes/projects.js';
import { publishedRoute } from './routes/published.js';
import { favoritesRoute } from './routes/favorites.js';
import { collectionsRoute } from './routes/collections.js';
import { creatorLinksRoute } from './routes/creator-links.js';
import { reportsRoute } from './routes/reports.js';
import { inferenceRoute } from './routes/inference.js';
import { ConfigurationError, isNonProduction } from './security.js';
import type { Env } from './types.js';

const app = new Hono<{ Bindings: Env }>();

export const PRODUCTION_ORIGINS = [
  'https://tessellate.design',
  'https://www.tessellate.design',
  'https://preview.tessellate.design',
];

const DEVELOPMENT_ORIGINS = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/** Allowed browser origins: production hosts, configured extras, and localhost only outside production. */
export function allowedOrigins(env?: Env): string[] {
  const extra = (env?.EXTRA_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...PRODUCTION_ORIGINS, ...extra, ...(isNonProduction(env) ? DEVELOPMENT_ORIGINS : [])];
}

app.use('*', async (c, next) => {
  const origins = allowedOrigins(c.env);
  return cors({
    // Unknown origins receive no CORS headers at all, so browsers block credentialed reads.
    origin: (origin) => (origin && origins.includes(origin) ? origin : null),
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Ticket-Token', 'cf-turnstile-response'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })(c, next);
});

app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  c.header('Cache-Control', c.res.headers.get('Cache-Control') ?? 'no-store');
});

app.route('/api/auth', authRoute);
app.route('/api/me', meRoute);
app.route('/api/projects', projectsRoute);
app.route('/api/published', publishedRoute);
app.route('/api/favorites', favoritesRoute);
app.route('/api/collections', collectionsRoute);
app.route('/api/creator-links', creatorLinksRoute);
app.route('/api/reports', reportsRoute);
app.route('/api/inference', inferenceRoute);

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'tessellate-api', timestamp: new Date().toISOString() });
});

app.get('/', (c) => {
  return c.json({
    name: 'Tessellate API',
    description: 'Interface intelligence runtime for humans and agents',
    version: '0.1.0',
    routes: [
      '/health',
      '/api/auth/*',
      '/api/me',
      '/api/projects/*',
      '/api/published/*',
      '/api/favorites/*',
      '/api/collections/*',
      '/api/creator-links/*',
      '/api/reports/*',
      '/api/inference/*',
    ],
  });
});

app.notFound((c) => c.json({ error: 'Not Found', message: `No route for ${c.req.method} ${new URL(c.req.url).pathname}.` }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message || 'Request Error' }, err.status);
  }
  if (err instanceof ConfigurationError) {
    console.error(`[config] ${err.message}`);
    return c.json({ error: 'Service Unavailable', message: 'This deployment is not fully configured.' }, 503);
  }
  const requestId = crypto.randomUUID();
  console.error(`[error] ${requestId}`, err);
  return c.json({ error: 'Internal Server Error', message: 'Something went wrong.', requestId }, 500);
});

export default app;
