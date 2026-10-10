import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { aiProxyRoute } from './routes/ai-proxy.js';

const app = new Hono();

app.use('*', cors());

app.route('/api/ai', aiProxyRoute);

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'tessellate-api', timestamp: new Date().toISOString() });
});

app.get('/', (c) => {
  return c.json({
    name: 'Tessellate API',
    description: 'Interface intelligence runtime for humans and agents',
    version: '0.1.0',
    routes: ['/health', '/api/ai/*', '/api/auth/*', '/api/projects/*', '/api/published/*'],
  });
});

export default app;
