import { lookup } from 'node:dns/promises';
import * as http from 'node:http';
import * as https from 'node:https';
import { isIP } from 'node:net';

const PRIVATE_REGISTRY_OPT_IN = 'TESS_ALLOW_PRIVATE_REGISTRY';

export class RegistryPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistryPolicyError';
  }
}

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '');
  const family = isIP(normalized);
  if (family === 4) {
    const octets = normalized.split('.').map(Number);
    const [a, b] = octets;
    return a === 0 || a === 10 || a === 127 || a! >= 224 ||
      (a === 100 && b! >= 64 && b! <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b! >= 16 && b! <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19 || b === 51)) ||
      (a === 203 && b === 0);
  }
  if (family === 6) {
    const firstGroup = normalized.split(':')[0] || '0';
    const first = Number.parseInt(firstGroup, 16);
    // Permit only public 2000::/3 unicast addresses, excluding transition,
    // documentation, benchmarking, and ORCHID ranges.
    return first < 0x2000 || first > 0x3fff ||
      normalized.startsWith('2001:db8:') ||
      normalized.startsWith('2001:10:') ||
      normalized.startsWith('2001:20:') ||
      normalized.startsWith('2002:');
  }
  return true;
}

function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  return host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.lan') ||
    host.endsWith('.test') ||
    host.endsWith('.home.arpa') ||
    !host.includes('.');
}

async function resolveRegistryAddress(url: URL, timeoutMs: number): Promise<{ address: string; family: 4 | 6 }> {
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const literalFamily = isIP(host);
  const addresses = literalFamily
    ? [{ address: host, family: literalFamily as 4 | 6 }]
    : await Promise.race([
      lookup(host, { all: true, verbatim: true }),
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => reject(new Error(`Registry DNS lookup timed out after ${timeoutMs} ms.`)), timeoutMs).unref();
      }),
    ]);
  if (!addresses.length) throw new Error('Registry hostname did not resolve.');

  const allowPrivate = process.env[PRIVATE_REGISTRY_OPT_IN] === '1';
  if (!allowPrivate && (isLocalHostname(host) || addresses.some(({ address }) => isPrivateAddress(address)))) {
    throw new RegistryPolicyError('Private or local registry targets are blocked. Set TESS_ALLOW_PRIVATE_REGISTRY=1 only for a trusted local registry.');
  }
  const address = addresses[0]!;
  return { address: address.address, family: address.family as 4 | 6 };
}

export async function fetchRegistryResponse(
  input: string,
  byteLimit: number,
  label: string,
  timeoutMs = 5_000
): Promise<Response> {
  const url = new URL(input);
  const allowPrivate = process.env[PRIVATE_REGISTRY_OPT_IN] === '1';
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new RegistryPolicyError('Registry URLs must use HTTPS; HTTP is allowed only for a trusted local registry.');
  }
  if (url.protocol === 'http:' && !allowPrivate) {
    throw new RegistryPolicyError('Registry URLs must use HTTPS; HTTP is allowed only for a trusted local registry with TESS_ALLOW_PRIVATE_REGISTRY=1.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new RegistryPolicyError('Registry URLs cannot contain credentials, query strings, or fragments.');
  }

  const startedAt = Date.now();
  const pinned = await resolveRegistryAddress(url, timeoutMs);
  const remainingTimeoutMs = Math.max(1, timeoutMs - (Date.now() - startedAt));
  const transport = url.protocol === 'https:' ? https : http;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (url.protocol === 'http:' && (!allowPrivate || (!isLocalHostname(host) && !isPrivateAddress(pinned.address)))) {
    throw new RegistryPolicyError('Registry URLs must use HTTPS; HTTP is allowed only for a trusted local registry with TESS_ALLOW_PRIVATE_REGISTRY=1.');
  }
  const requestOptions: https.RequestOptions = {
    hostname: pinned.address,
    family: pinned.family,
    port: url.port ? Number(url.port) : undefined,
    path: `${url.pathname}${url.search}`,
    method: 'GET',
    headers: { Host: url.host, Accept: 'application/json', 'Accept-Encoding': 'identity' },
    ...(url.protocol === 'https:' && isIP(host) === 0 ? { servername: host } : {}),
  };

  return await new Promise<Response>((resolve, reject) => {
    const request = transport.request(requestOptions, (response) => {
      const chunks: Buffer[] = [];
      let size = 0;
      const announcedLength = Number(response.headers['content-length']);
      if (Number.isFinite(announcedLength) && announcedLength > byteLimit) {
        request.destroy(new Error(`${label} exceeds the ${byteLimit}-byte input limit.`));
        return;
      }
      response.on('data', (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.byteLength;
        if (size > byteLimit) {
          request.destroy(new Error(`${label} exceeds the ${byteLimit}-byte input limit.`));
          return;
        }
        chunks.push(buffer);
      });
      response.on('end', () => {
        const body = Buffer.concat(chunks);
        const headers = new Headers();
        if (response.headers['content-type']) headers.set('content-type', String(response.headers['content-type']));
        if (response.headers['content-length']) headers.set('content-length', String(response.headers['content-length']));
        if (response.headers.location) headers.set('location', String(response.headers.location));
        const responseStatus = response.statusCode ?? 502;
        const status = responseStatus >= 200 && responseStatus <= 599 ? responseStatus : 502;
        const bodyAllowed = status !== 204 && status !== 205 && status !== 304;
        resolve(new Response(bodyAllowed && body.byteLength ? body : null, { status, headers }));
      });
      response.on('error', reject);
    });

    const timer = setTimeout(() => request.destroy(new Error(`${label} request timed out after ${timeoutMs} ms.`)), remainingTimeoutMs);
    request.on('close', () => clearTimeout(timer));
    request.on('error', reject);
    request.end();
  });
}

export async function readBoundedJsonResponse(response: Response, byteLimit: number, label: string): Promise<unknown> {
  const announcedLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(announcedLength) && announcedLength > byteLimit) {
    await response.body?.cancel();
    throw new Error(`${label} exceeds the ${byteLimit}-byte input limit.`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error(`${label} response has no readable body.`);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > byteLimit) {
      await reader.cancel();
      throw new Error(`${label} exceeds the ${byteLimit}-byte input limit.`);
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}
