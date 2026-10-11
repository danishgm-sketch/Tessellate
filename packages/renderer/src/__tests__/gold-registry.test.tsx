import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ProjectManifest, ProjectNode } from '@tessellate/schemas';
import { GOLD_40_SLUGS } from '@tessellate/catalog';
import { ManifestRenderer, NodeRenderer } from '../index.js';

describe('Requirement 4: Runtime Resource Registry for Gold 40', () => {
  it.each(GOLD_40_SLUGS.map((slug) => [slug]))('renders Gold resource slug "%s" without missing-resource-recovery fallback', (slug) => {
    const node: ProjectNode = {
      id: `node_test_${slug}`,
      nodeType: 'component',
      semanticRole: 'section',
      resourceRef: {
        id: `res_gold_${slug}`,
        slug,
        version: '1.0.0',
      },
      props: {},
      slots: {},
      children: [],
    };

    const manifest: ProjectManifest = {
      schemaVersion: '1.0.0',
      id: `proj_test_${slug}`,
      name: `Test ${slug}`,
      designDNA: {
        visualAmbition: 50,
        structuralCreativity: 50,
      } as unknown as ProjectManifest['designDNA'],
      navigation: {
        model: 'sidebar',
        primaryItems: [{ label: 'Main', targetScreenId: 'screen_1' }],
      } as unknown as ProjectManifest['navigation'],
      screens: [
        {
          id: 'screen_1',
          screenNodeId: 'root_1',
          name: 'Screen 1',
          slug: 'screen-1',
          rootNode: {
            id: 'root_1',
            nodeType: 'layout',
            semanticRole: 'container',
            props: {},
            slots: {},
            children: [node],
          },
        },
      ],
    } as unknown as ProjectManifest;

    // 1. Render directly through NodeRenderer
    const nodeHtml = renderToString(<NodeRenderer node={node} />);
    expect(nodeHtml).not.toContain('missing-resource-recovery');
    expect(nodeHtml).not.toContain('Unresolved resource');
    expect(nodeHtml).toContain(`data-node-id="node_test_${slug}"`);

    // 2. Render through ManifestRenderer
    const manifestHtml = renderToString(<ManifestRenderer manifest={manifest} activeScreenId="screen_1" />);
    expect(manifestHtml).not.toContain('missing-resource-recovery');
    expect(manifestHtml).not.toContain('Unresolved resource');
    expect(manifestHtml).toContain(`data-node-id="node_test_${slug}"`);
  });
});
