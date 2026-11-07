import { describe, expect, it } from 'vitest';
import { isPreviewToParentMessage, resolvePreviewNavigationDestination } from '../preview-protocol.js';

describe('preview navigation protocol', () => {
  it('accepts bounded navigation requests from the isolated renderer', () => {
    expect(
      isPreviewToParentMessage({
        type: 'TESSELLATE_PREVIEW_NAVIGATION_REQUEST',
        resourceId: 'cta-product-preview',
        href: 'https://tessellate.example/compose',
      }),
    ).toBe(true);
    expect(
      isPreviewToParentMessage({
        type: 'TESSELLATE_PREVIEW_NAVIGATION_REQUEST',
        resourceId: '',
        href: 'https://tessellate.example/compose',
      }),
    ).toBe(false);
    expect(
      isPreviewToParentMessage({
        type: 'TESSELLATE_PREVIEW_NAVIGATION_REQUEST',
        resourceId: 'cta-product-preview',
        href: 'x'.repeat(2049),
      }),
    ).toBe(false);
  });

  it('resolves same-origin paths for the host confirmation action', () => {
    expect(
      resolvePreviewNavigationDestination('/compose?brief=employee#form', 'https://tessellate.example'),
    ).toEqual({
      href: '/compose?brief=employee#form',
      label: '/compose?brief=employee#form',
      external: false,
    });
  });

  it('keeps external links explicit and rejects non-web schemes or credentials', () => {
    expect(
      resolvePreviewNavigationDestination('https://docs.example/path', 'https://tessellate.example'),
    ).toEqual({ href: 'https://docs.example/path', label: 'docs.example', external: true });
    expect(resolvePreviewNavigationDestination('javascript:alert(1)', 'https://tessellate.example')).toBeNull();
    expect(
      resolvePreviewNavigationDestination('https://user:secret@docs.example/path', 'https://tessellate.example'),
    ).toBeNull();
  });
});
