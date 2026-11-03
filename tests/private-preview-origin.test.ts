import { describe, expect, it } from 'vitest';
import { buildPrivatePreviewUrl, isPrivateVersoResource, resolvePrivatePreviewOrigin } from '../apps/site/src/lib/private-preview-origin';

describe('private preview origin', () => {
  it('identifies only local Verso slugs', () => {
    expect(isPrivateVersoResource('verso-depth-aperture')).toBe(true);
    expect(isPrivateVersoResource('depth-aperture')).toBe(false);
  });

  it('requires an explicit, valid origin separate from the application', () => {
    expect(resolvePrivatePreviewOrigin(undefined, 'http://localhost:4321', false)).toBeNull();
    expect(resolvePrivatePreviewOrigin('/preview', 'http://localhost:4321', false)).toBeNull();
    expect(resolvePrivatePreviewOrigin('http://localhost:4321', 'http://localhost:4321', false)).toBeNull();
    expect(resolvePrivatePreviewOrigin('https://user:secret@preview.example', 'https://app.example', true)).toBeNull();
    expect(resolvePrivatePreviewOrigin('http://preview.example', 'https://app.example', true)).toBeNull();
    expect(resolvePrivatePreviewOrigin('https://preview.example/', 'https://app.example', true)).toBe('https://preview.example');
  });

  it('builds a query-safe resource URL for the isolated local preview app', () => {
    expect(buildPrivatePreviewUrl('http://127.0.0.1:5173', 'verso-depth-aperture', { variant: 'quiet', theme: 'dark' }))
      .toBe('http://127.0.0.1:5173/?resource=verso-depth-aperture&variant=quiet&theme=dark');
  });
});
