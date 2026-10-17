import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createRendererParityProject } from '@tessellate/testing';
import { ManifestRenderer } from '../index.js';

describe('renderer semantic parity fixture', () => {
  const manifest = createRendererParityProject();
  const screenId = manifest.screens[0]!.id;

  it('keeps declared props, slots and nested nodes in desktop output', () => {
    const html = renderToString(
      <ManifestRenderer manifest={manifest} activeScreenId={screenId} context={{ viewport: 'desktop' }} />
    );

    expect(html).toContain('Content from resource props');
    expect(html).toContain('Content from declared resource slot');
    expect(html).toContain('Content from nested manifest node');
    expect(html).toContain('data-tracking-id="parity-action"');
    expect(html).toContain('Content omitted on mobile');
    expect(html).toContain('First stacked child');
    expect(html).toContain('Content with a collapsed mobile presentation');
    expect(html).toContain('data-resource-variant="expressive"');
  });

  it('applies Workbench responsive strategies to the mobile render', () => {
    const html = renderToString(
      <ManifestRenderer manifest={manifest} activeScreenId={screenId} context={{ viewport: 'mobile' }} />
    );

    expect(html).not.toContain('Content omitted on mobile');
    expect(html).toContain('Content from declared resource slot');
    expect(html).toContain('flex flex-col gap-4 w-full');
    expect(html).toContain('overflow-hidden max-h-48');
  });
});
