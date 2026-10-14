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
import { adminRoute } from './routes/admin.js';
import { readDevOutbox } from './email.js';
import { ConfigurationError, isNonProduction } from './security.js';
import { allowedOrigins } from './origins.js';
import type { Env } from './types.js';

const app = new Hono<{ Bindings: Env }>();

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
app.route('/api/admin', adminRoute);

// Development/test only: captured transactional email (verification, reset). 404 in production.
app.get('/api/dev/outbox', (c) => {
  if (!isNonProduction(c.env)) return c.json({ error: 'Not Found' }, 404);
  return c.json({ emails: readDevOutbox() });
});

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
      '/api/admin/*',
    ],
  });
});

app.notFound((c) => c.json({ error: 'Not Found', message: `No route for ${c.req.method} ${new URL(c.req.url).pathname}.` }, 404));

app.onError((err, c) => {
  // Better Auth APIError (e.g. from admin plugin calls made inside our routes)
  const status = (err as { statusCode?: number; status?: unknown }).statusCode;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return c.json({ error: err.message || 'Request Error' }, status as 400);
  }
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
