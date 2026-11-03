function originOnly(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function sourceUrlOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function resolvePreviewParentOrigin(options: {
  parentIsSelf: boolean;
  referrer: string;
  previewDocumentUrl: string;
  allowedOrigins?: string;
}): string | null {
  if (options.parentIsSelf) return null;

  const referrerOrigin = options.referrer ? sourceUrlOrigin(options.referrer) : null;
  const documentOrigin = sourceUrlOrigin(options.previewDocumentUrl);
  const hasConfiguredAllowlist = Boolean(options.allowedOrigins?.trim());
  const allowedOrigins = options.allowedOrigins?.trim()
    .split(',')
    .map((value) => originOnly(value.trim()))
    .filter((origin): origin is string => Boolean(origin));

  if (hasConfiguredAllowlist) {
    if (!allowedOrigins?.length) return null;
    return [referrerOrigin, documentOrigin].find((origin) => origin && allowedOrigins.includes(origin)) ?? null;
  }

  return referrerOrigin ?? documentOrigin;
}
