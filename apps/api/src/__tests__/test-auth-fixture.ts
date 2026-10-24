import { createHmac, randomBytes } from 'node:crypto';

export const testAuthSecret = randomBytes(32).toString('base64url');
export const testAuthEnv = { RUNTIME_ENVIRONMENT: 'test' as const, TEST_AUTH_SECRET: testAuthSecret };

export function testAuthBearer(userId: string, expiresAt = Date.now() + 60 * 60 * 1000): string {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString('base64url');
  const signature = createHmac('sha256', testAuthSecret).update(payload).digest('base64url');
  return `Bearer tessellate-test.${payload}.${signature}`;
}
