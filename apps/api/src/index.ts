import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { aiProxyRoute } from './routes/ai-proxy.js';
import { authRoute } from './routes/auth.js';
import { meRoute } from './routes/me.js';
import { projectsRoute } from './routes/projects.js';
import { publishedRoute } from './routes/published.js';
import { favoritesRoute } from './routes/favorites.js';
import { collectionsRoute } from './routes/collections.js';
import { creatorLinksRoute } from './routes/creator-links.js';
import { reportsRoute } from './routes/reports.js';
import type { Env } from './types.js';

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_ORIGINS = [
  'https://tessellate.design',
  'https://www.tessellate.design',
  'https://preview.tessellate.design',
  'http://localhost:4321',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]!;
    },
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'cf-turnstile-response'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});

app.route('/api/ai', aiProxyRoute);
app.route('/api/auth', authRoute);
app.route('/api/me', meRoute);
app.route('/api/projects', projectsRoute);
app.route('/api/published', publishedRoute);
app.route('/api/favorites', favoritesRoute);
app.route('/api/collections', collectionsRoute);
app.route('/api/creator-links', creatorLinksRoute);
app.route('/api/reports', reportsRoute);

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
      '/api/ai/*',
      '/api/auth/*',
      '/api/me',
      '/api/projects/*',
      '/api/published/*',
      '/api/favorites/*',
      '/api/collections/*',
      '/api/creator-links/*',
      '/api/reports/*',
    ],
  });
});

export default app;
