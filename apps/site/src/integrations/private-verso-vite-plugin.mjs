/* global process, URL */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const PRIVATE_MODULE_ID = 'virtual:tessellate-private-verso';
const PRIVATE_MODULE_RESOLVED_ID = `\0${PRIVATE_MODULE_ID}`;
const PRIVATE_STYLE_ID = 'virtual:tessellate-private-verso.css';
const PRIVATE_STYLE_RESOLVED_ID = `\0${PRIVATE_STYLE_ID}`;

function sha256(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function isLoopbackHost(host) {
  return host === undefined || host === false || host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
}

function emptyModule() {
  return [
    'export const PRIVATE_VERSO_ENABLED = false;',
    'export const PrivateVersoProvider = null;',
    'export async function loadPrivateVersoResource() { return null; }',
  ].join('\n');
}

function readPrivateProjection(repositoryRoot) {
  const projectionPath = process.env.TESSELLATE_PRIVATE_VERSO_PROJECTION;
  if (!projectionPath || !path.isAbsolute(projectionPath)) {
    throw new Error('Set TESSELLATE_PRIVATE_VERSO_PROJECTION to the absolute path of the local private projection JSON.');
  }
  const projection = JSON.parse(fs.readFileSync(projectionPath, 'utf8'));
  if (projection.license !== 'UNLICENSED') {
    throw new Error(`Private Verso preview requires the exact UNLICENSED source state; found ${String(projection.license)}.`);
  }
  if (!path.isAbsolute(projection.sourceRoot)) throw new Error('Private Verso projection must record its absolute local sourceRoot.');
  const sourceRoot = fs.realpathSync(projection.sourceRoot);
  const canonicalRepositoryRoot = fs.realpathSync(repositoryRoot);
  if (isWithin(canonicalRepositoryRoot, sourceRoot) || isWithin(sourceRoot, canonicalRepositoryRoot)) {
    throw new Error('Private Verso source and Tessellate repository must remain separate on disk.');
  }
  const records = projection.records;
  if (!Array.isArray(records) || records.length !== projection.publicCatalogue?.projectedOverlayCount) {
    throw new Error('Private Verso projection record count does not match its overlay count.');
  }
  const slugs = new Set();
  const expectedFiles = new Map();
  for (const record of records) {
    if (
      record.integration?.status !== 'local-private-adaptation-candidate' ||
      record.integration?.certification !== 'unverified' ||
      record.integration?.redistribution !== 'blocked-unlicensed' ||
      record.manifest?.license?.redistributionVerified !== false
    ) {
      throw new Error(`Private Verso record '${record.source?.id ?? 'unknown'}' has unsafe or inconsistent release flags.`);
    }
    if (slugs.has(record.manifest.slug)) throw new Error(`Duplicate private Verso slug '${record.manifest.slug}'.`);
    slugs.add(record.manifest.slug);
    const sourcePath = path.resolve(sourceRoot, record.source.path);
    const canonicalSource = fs.realpathSync(sourcePath);
    if (!isWithin(sourceRoot, canonicalSource) || !fs.statSync(canonicalSource).isFile()) {
      throw new Error(`Private Verso module escapes the source root: ${record.source.path}`);
    }
    if (!Array.isArray(record.source.sourceFiles) || !record.source.sourceFiles.some((file) => file.path === record.source.path)) {
      throw new Error(`Private Verso source inventory is missing its component module: ${record.source.path}`);
    }
    if (
      !Array.isArray(record.source.props) ||
      record.source.props.some((prop) =>
        typeof prop?.name !== 'string' || !/^[A-Za-z_$][\w$]*$/.test(prop.name) ||
        typeof prop.type !== 'string' || typeof prop.required !== 'boolean'
      ) ||
      new Set(record.source.props.map((prop) => prop.name)).size !== record.source.props.length
    ) {
      throw new Error(`Private Verso component props are missing, malformed, or duplicated: ${record.source.path}`);
    }
    const aggregateHash = sha256(record.source.sourceFiles.map((file) => `${file.path}\0${file.sha256}`).join('\n'));
    if (aggregateHash !== record.source.sha256) throw new Error(`Private Verso source closure hash is inconsistent: ${record.source.path}`);
    for (const sourceFile of record.source.sourceFiles) {
      const absolutePath = path.resolve(sourceRoot, sourceFile.path);
      const canonicalPath = fs.realpathSync(absolutePath);
      if (!isWithin(sourceRoot, canonicalPath) || !fs.statSync(canonicalPath).isFile()) {
        throw new Error(`Private Verso dependency escapes its source root: ${sourceFile.path}`);
      }
      const previousHash = expectedFiles.get(canonicalPath);
      if (previousHash && previousHash !== sourceFile.sha256) throw new Error(`Private Verso inventory contains conflicting hashes for ${sourceFile.path}`);
      expectedFiles.set(canonicalPath, sourceFile.sha256);
    }
    record.__resolvedSourcePath = canonicalSource;
  }
  for (const [absolutePath, expectedHash] of expectedFiles) {
    if (sha256(fs.readFileSync(absolutePath)) !== expectedHash) {
      throw new Error(`Private Verso source changed since inventory generation: ${path.relative(sourceRoot, absolutePath)}`);
    }
  }
  return { sourceRoot, records };
}

function buildRuntimeModule(privateProjection) {
  if (!privateProjection) return emptyModule();
  const { sourceRoot, records } = privateProjection;
  const recordData = records.map((record) => ({
    manifest: record.manifest,
    source: record.source,
  }));
  const loaderEntries = records.map((record) => {
    const moduleUrl = `/@fs/${record.__resolvedSourcePath.replace(/\\/g, '/')}`;
    return `${JSON.stringify(record.manifest.slug)}: () => import(${JSON.stringify(moduleUrl)})`;
  });
  const providerPath = `/@fs/${path.join(sourceRoot, 'src', 'tokens', 'VersoProvider.tsx').replace(/\\/g, '/')}`;
  return [
    `import { VersoProvider as PrivateVersoProvider } from ${JSON.stringify(providerPath)};`,
    `const records = ${JSON.stringify(recordData)};`,
    `const loaders = { ${loaderEntries.join(',\n')} };`,
    'const recordsBySlug = Object.fromEntries(records.map((record) => [record.manifest.slug, record]));',
    'export const PRIVATE_VERSO_ENABLED = true;',
    'export { PrivateVersoProvider };',
    'export async function loadPrivateVersoResource(slug) {',
    '  const record = recordsBySlug[slug];',
    '  const loader = loaders[slug];',
    '  if (!record || !loader) return null;',
    '  const sourceModule = await loader();',
    '  const component = sourceModule[record.source.sourceExport];',
    '  if (!component || (typeof component !== "function" && typeof component !== "object")) {',
    '    throw new Error(`Private resource ${slug} does not export ${record.source.sourceExport}.`);',
    '  }',
    '  return { manifest: record.manifest, component, source: record.source };',
    '}',
  ].join('\n');
}

function privateStylesheet(sourceRoot) {
  const originalPath = path.join(sourceRoot, 'src', 'styles', 'verso.css');
  const original = fs.readFileSync(originalPath, 'utf8');
  const sourceDirective = `@source ${JSON.stringify(path.join(sourceRoot, 'src').replace(/\\/g, '/'))};`;
  let css = original
    .replace(/^\s*@import\s+url\([^\r\n]*\);?\s*$/gim, '')
    .replace(/^\s*@import\s+["']tailwindcss["'];?\s*$/gim, '')
    .replace(/^\s*@source\s+["'][^\r\n]*["'];?\s*$/gim, '');
  css = `${sourceDirective}\n${css}`;
  css = css.replace(
    /--font-display:\s*[^;]+;/,
    '--font-display: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;',
  );
  css = css.replace(
    /--font-sans:\s*[^;]+;/,
    '--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;',
  );
  css = css.replace(
    /--font-mono:\s*[^;]+;/,
    '--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;',
  );
  return css;
}

export function privateVersoVitePlugin(repositoryRoot, {
  serveCatalogOverlay = false,
  requireParentOrigins = false,
  exposeSourceModules = false,
} = {}) {
  const enabled = process.env.TESSELLATE_PRIVATE_VERSO === '1';
  let projection = null;
  if (enabled) {
    projection = readPrivateProjection(repositoryRoot);
    if (requireParentOrigins) {
      const parentOrigins = process.env.VITE_TESSELLATE_PARENT_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];
      const isOriginOnly = (value) => {
        try {
          const url = new URL(value);
          return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash;
        } catch {
          return false;
        }
      };
      if (!parentOrigins.length || parentOrigins.some((origin) => !isOriginOnly(origin))) {
        throw new Error('Private preview mode requires an explicit list of origin-only VITE_TESSELLATE_PARENT_ORIGINS values.');
      }
    }
  }
  return {
    name: 'tessellate-private-verso-local-preview',
    enforce: 'pre',
    config(_config, environment) {
      if (enabled && environment.command !== 'serve') {
        throw new Error('Private Verso source is available only to the local Astro dev server. Production builds and Site deployments are blocked.');
      }
      if (!enabled || !projection) return undefined;
      return {
        server: {
          host: '127.0.0.1',
          fs: { allow: exposeSourceModules ? [repositoryRoot, projection.sourceRoot] : [repositoryRoot] },
        },
      };
    },
    configResolved(resolvedConfig) {
      if (enabled && resolvedConfig.command === 'serve' && !isLoopbackHost(resolvedConfig.server.host)) {
        throw new Error('Private Verso source servers must bind to loopback; LAN and wildcard hosts are not allowed.');
      }
    },
    resolveId(id) {
      if (id === PRIVATE_MODULE_ID) return PRIVATE_MODULE_RESOLVED_ID;
      if (id === PRIVATE_STYLE_ID) return PRIVATE_STYLE_RESOLVED_ID;
      return null;
    },
    load(id) {
      if (id === PRIVATE_MODULE_RESOLVED_ID) return buildRuntimeModule(projection);
      if (id === PRIVATE_STYLE_RESOLVED_ID) return projection ? privateStylesheet(projection.sourceRoot) : '';
      return null;
    },
    configureServer(server) {
      if (!enabled || !projection) return;
      if (!exposeSourceModules) {
        server.middlewares.use((request, response, next) => {
          const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
          if (!pathname.startsWith('/@fs/')) return next();
          let requestedPath;
          try {
            requestedPath = decodeURIComponent(pathname.slice('/@fs/'.length));
          } catch {
            return next();
          }
          if (!path.isAbsolute(requestedPath) || !isWithin(projection.sourceRoot, path.resolve(requestedPath))) return next();
          response.statusCode = 404;
          response.setHeader('Cache-Control', 'no-store');
          response.end('Not found.');
        });
      }
      if (!serveCatalogOverlay) return;
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        if (request.method !== 'GET' || pathname !== '/data/catalog.json') return next();
        try {
          const basePath = path.join(repositoryRoot, 'apps', 'site', 'public', 'data', 'catalog.json');
          const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
          const resources = [...base.resources, ...projection.records.map((record) => record.manifest)];
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          response.end(JSON.stringify({ ...base, count: resources.length, resources }));
        } catch (error) {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ error: 'Private Verso catalogue overlay failed.', detail: error instanceof Error ? error.message : String(error) }));
        }
      });
    },
  };
}
