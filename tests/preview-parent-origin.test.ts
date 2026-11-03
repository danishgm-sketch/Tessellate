import { describe, expect, it } from 'vitest';
import { resolvePreviewParentOrigin } from '../apps/preview/src/lib/preview-parent-origin';

describe('preview parent origin', () => {
  const base = {
    parentIsSelf: false,
    referrer: 'http://127.0.0.1:4321/r/example',
    previewDocumentUrl: 'http://127.0.0.1:5173/?resource=example',
  };

  it('accepts only the configured referring application origin', () => {
    expect(resolvePreviewParentOrigin({ ...base, allowedOrigins: 'http://127.0.0.1:4321' })).toBe('http://127.0.0.1:4321');
    expect(resolvePreviewParentOrigin({ ...base, allowedOrigins: 'http://localhost:4321' })).toBeNull();
  });

  it('rejects invalid or path-bearing allowlist entries', () => {
    expect(resolvePreviewParentOrigin({ ...base, allowedOrigins: 'not-an-origin' })).toBeNull();
    expect(resolvePreviewParentOrigin({ ...base, allowedOrigins: 'http://127.0.0.1:4321/unexpected-path' })).toBeNull();
  });

  it('uses the preview document origin only when no referrer is available and no allowlist is configured', () => {
    expect(resolvePreviewParentOrigin({ ...base, referrer: '' })).toBe('http://127.0.0.1:5173');
    expect(resolvePreviewParentOrigin({ ...base, referrer: '', allowedOrigins: 'http://127.0.0.1:4321' })).toBeNull();
  });

  it('does not establish a parent for a top-level preview app', () => {
    expect(resolvePreviewParentOrigin({ ...base, parentIsSelf: true })).toBeNull();
  });
});
