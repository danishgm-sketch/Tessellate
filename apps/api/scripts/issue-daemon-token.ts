/**
 * Issues a per-device token for the host daemon (D-033).
 *
 *   pnpm --filter @tessellate/api daemon:token <device-name> [--remote]
 *
 * Prints the token ONCE (put it in the daemon's TESSELLATE_DAEMON_TOKEN) and inserts only its
 * SHA-256 hash into D1 via wrangler. Use --remote for the deployed database.
 */
import { execFileSync } from 'node:child_process';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import * as path from 'node:path';

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--'));
const remote = args.includes('--remote');

if (!name || !/^[\w .-]{1,64}$/.test(name)) {
  console.error('Usage: daemon:token <device-name> [--remote]   (name: letters, digits, space, . _ -; max 64)');
  process.exit(1);
}

const token = randomBytes(32).toString('base64url');
const tokenHash = createHash('sha256').update(token).digest('hex');
const id = `dev_${randomUUID()}`;
const sql = `INSERT INTO daemon_devices (id, name, tokenHash, createdAt) VALUES ('${id}', '${name.replace(/'/g, "''")}', '${tokenHash}', '${new Date().toISOString()}');`;

// Run wrangler's JS entry with this Node binary: no shell, so arguments are passed verbatim on every OS.
const wranglerPkg = createRequire(import.meta.url).resolve('wrangler/package.json');
const wranglerBin = path.join(path.dirname(wranglerPkg), 'bin', 'wrangler.js');
execFileSync(process.execPath, [wranglerBin, 'd1', 'execute', 'tessellate-db', remote ? '--remote' : '--local', '--command', sql], {
  stdio: 'inherit',
});

console.log(`\nDevice "${name}" registered (${id}).`);
console.log('Daemon token (shown once; store it in the daemon config as TESSELLATE_DAEMON_TOKEN):\n');
console.log(`  ${token}\n`);
console.log(`Revoke with: wrangler d1 execute tessellate-db ${remote ? '--remote' : '--local'} --command "UPDATE daemon_devices SET revokedAt='${new Date().toISOString()}' WHERE id='${id}';"`);
