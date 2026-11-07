const PRIVATE_VERSO_PREFIX = 'verso-';

export function isPrivateVersoResource(slug: string): boolean {
  return slug.startsWith(PRIVATE_VERSO_PREFIX);
}

export function resolvePrivatePreviewOrigin(
  configuredOrigin: string | undefined,
  applicationOrigin: string | undefined,
  production: boolean,
): string | null {
  if (!configuredOrigin?.trim() || !applicationOrigin) return null;

  let previewUrl: URL;
  try {
    previewUrl = new URL(configuredOrigin);
  } catch {
    return null;
  }

  if (
    (previewUrl.protocol !== 'http:' && previewUrl.protocol !== 'https:') ||
    previewUrl.username ||
    previewUrl.password ||
    previewUrl.pathname !== '/' ||
    previewUrl.search ||
    previewUrl.hash ||
    (production && previewUrl.protocol !== 'https:') ||
    previewUrl.origin === applicationOrigin
  ) {
    return null;
  }

  return previewUrl.origin;
}

export function buildPrivatePreviewUrl(
  origin: string,
  slug: string,
  parameters: Record<string, string | undefined> = {},
): string {
  const url = new URL('/', origin);
  url.searchParams.set('resource', slug);
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  return url.toString();
}
