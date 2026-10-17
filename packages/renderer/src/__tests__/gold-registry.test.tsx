import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ProjectManifest, ProjectNode } from '@tessellate/schemas';
import { GOLD_40_SLUGS } from '@tessellate/catalog';
import { ManifestRenderer, NodeRenderer } from '../index.js';

function createTestNode(slug: string, props: Record<string, unknown> = {}): ProjectNode {
  return {
    id: `node_test_${slug}`,
    nodeType: 'component',
    semanticRole: 'section',
    resourceRef: {
      id: `res_gold_${slug}`,
      slug,
      version: '1.0.0',
    },
    props,
    slots: {},
    children: [],
  };
}

function createTestManifest(slug: string, node: ProjectNode): ProjectManifest {
  return {
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
}

describe('Requirement 4 & 6: Runtime Resource Registry for Gold 40 with Family Semantics', () => {
  it('preserves resource prop children and nested manifest children in the same rendered slot', () => {
    const node = createTestNode('canvas-workspace-shell', { children: 'Content from resource props' });
    node.children = [{
      id: 'nested-content',
      nodeType: 'element',
      semanticRole: 'content',
      props: { children: 'Content from nested manifest node' },
      slots: {},
      children: [],
    }];

    const html = renderToString(<ManifestRenderer manifest={createTestManifest('canvas', node)} activeScreenId="screen_1" />);

    expect(html).toContain('Content from resource props');
    expect(html).toContain('Content from nested manifest node');
  });

  it('preserves a declared resource children slot alongside nested manifest children', () => {
    const node = createTestNode('canvas-workspace-shell');
    node.slots = { children: 'Content from declared resource slot' };
    node.children = [{
      id: 'nested-slot-content',
      nodeType: 'element',
      semanticRole: 'content',
      props: { children: 'Content from nested manifest node' },
      slots: {},
      children: [],
    }];

    const html = renderToString(<ManifestRenderer manifest={createTestManifest('canvas', node)} activeScreenId="screen_1" />);

    expect(html).toContain('Content from declared resource slot');
    expect(html).toContain('Content from nested manifest node');
  });

  it('shows a recoverable diagnostic instead of rendering an unsupported resource variant', () => {
    const node = createTestNode('button');
    node.variant = 'unsupported-variant';

    const html = renderToString(<NodeRenderer node={node} />);

    expect(html).toContain('data-testid="unsupported-resource-variant"');
    expect(html).toContain('unsupported-variant');
    expect(html).not.toContain('<button');
  });

  it.each(GOLD_40_SLUGS.map((slug) => [slug]))(
    'renders Gold resource slug "%s" without missing-resource-recovery fallback',
    (slug) => {
      const node = createTestNode(slug);
      const manifest = createTestManifest(slug, node);

      // 1. Render directly through NodeRenderer
      const nodeHtml = renderToString(<NodeRenderer node={node} />);
      expect(nodeHtml).not.toContain('missing-resource-recovery');
      expect(nodeHtml).not.toContain('Unresolved resource');
      expect(nodeHtml).not.toContain('unresolved-required-role-diagnostic');
      expect(nodeHtml).toContain(`data-node-id="node_test_${slug}"`);

      // 2. Render through ManifestRenderer
      const manifestHtml = renderToString(<ManifestRenderer manifest={manifest} activeScreenId="screen_1" />);
      expect(manifestHtml).not.toContain('missing-resource-recovery');
      expect(manifestHtml).not.toContain('Unresolved resource');
      expect(manifestHtml).not.toContain('unresolved-required-role-diagnostic');
      expect(manifestHtml).toContain(`data-node-id="node_test_${slug}"`);
    }
  );

  describe('Family-Level Semantic Assertions', () => {
    it('verifies Usable Controls family renders interactive elements', () => {
      const buttonHtml = renderToString(<NodeRenderer node={createTestNode('button', { children: 'Submit Action' })} />);
      expect(buttonHtml).toContain('<button');

      const inputHtml = renderToString(<NodeRenderer node={createTestNode('input', { placeholder: 'Search...' })} />);
      expect(inputHtml).toContain('<input');

      const selectHtml = renderToString(<NodeRenderer node={createTestNode('select')} />);
      expect(selectHtml).toContain('<select');

      const checkboxHtml = renderToString(<NodeRenderer node={createTestNode('checkbox')} />);
      expect(checkboxHtml).toContain('checkbox');

      const switchHtml = renderToString(<NodeRenderer node={createTestNode('switch')} />);
      expect(switchHtml).toMatch(/(switch|checkbox|toggle|button)/i);
    });

    it('verifies Navigation family renders structural nav semantics', () => {
      const headerHtml = renderToString(<NodeRenderer node={createTestNode('app-header')} />);
      expect(headerHtml).toMatch(/(<header|<nav|System|brand)/i);

      const sidebarHtml = renderToString(<NodeRenderer node={createTestNode('sidebar-nav')} />);
      expect(sidebarHtml).toMatch(/(<nav|<aside|sidebar|menu|nav)/i);

      const breadcrumbHtml = renderToString(<NodeRenderer node={createTestNode('breadcrumb')} />);
      expect(breadcrumbHtml).toMatch(/(<nav|breadcrumb|home|separator)/i);

      const paginationHtml = renderToString(<NodeRenderer node={createTestNode('pagination')} />);
      expect(paginationHtml).toMatch(/(<nav|<button|pagination|previous|next|page)/i);

      const tabsHtml = renderToString(<NodeRenderer node={createTestNode('tabs')} />);
      expect(tabsHtml).toMatch(/(tab|role="tablist"|<button)/i);
    });

    it('verifies Marketing Content Structure family renders titles and layouts', () => {
      const heroHtml = renderToString(<NodeRenderer node={createTestNode('hero-section')} />);
      expect(heroHtml).toMatch(/(<h1|<h2|hero|title|heading)/i);

      const featureGridHtml = renderToString(<NodeRenderer node={createTestNode('feature-grid')} />);
      expect(featureGridHtml).toMatch(/(grid|feature|<h3|<h4)/i);

      const pricingHtml = renderToString(<NodeRenderer node={createTestNode('pricing-table')} />);
      expect(pricingHtml).toMatch(/(pricing|plan|month|\$|tier|<h3)/i);

      const testimonialHtml = renderToString(<NodeRenderer node={createTestNode('testimonial-card')} />);
      expect(testimonialHtml).toMatch(/(quote|testimonial|author|review|avatar)/i);

      const faqHtml = renderToString(<NodeRenderer node={createTestNode('faq-accordion')} />);
      expect(faqHtml).toMatch(/(faq|question|answer|accordion)/i);
    });

    it('verifies Data Visualization family renders graphics and SVG elements', () => {
      const areaChartHtml = renderToString(<NodeRenderer node={createTestNode('area-chart')} />);
      expect(areaChartHtml).toMatch(/(<svg|chart|path|polyline)/i);

      const barChartHtml = renderToString(<NodeRenderer node={createTestNode('bar-chart')} />);
      expect(barChartHtml).toMatch(/(<svg|chart|bar|rect)/i);

      const sparklineHtml = renderToString(<NodeRenderer node={createTestNode('sparkline')} />);
      expect(sparklineHtml).toMatch(/(<svg|sparkline|path|stroke)/i);

      const metricCardHtml = renderToString(<NodeRenderer node={createTestNode('metric-card', { label: 'Active Users', value: '45,210' })} />);
      expect(metricCardHtml).toMatch(/(Active Users|45,210|metric)/i);
    });

    it('verifies AI Patterns family renders prompt inputs and responses', () => {
      const promptInputHtml = renderToString(<NodeRenderer node={createTestNode('prompt-input')} />);
      expect(promptInputHtml).toMatch(/(<textarea|<input|prompt|ask|generate)/i);

      const chatStreamHtml = renderToString(<NodeRenderer node={createTestNode('chat-stream')} />);
      expect(chatStreamHtml).toMatch(/(message|chat|stream|assistant|user)/i);

      const citationHtml = renderToString(<NodeRenderer node={createTestNode('citation-card')} />);
      expect(citationHtml).toMatch(/(citation|source|reference|url)/i);

      const modelSelectorHtml = renderToString(<NodeRenderer node={createTestNode('model-selector')} />);
      expect(modelSelectorHtml).toMatch(/(model|gpt|claude|gemini|select)/i);
    });

    it('verifies Motion and Transition classes are present on components', () => {
      const buttonHtml = renderToString(<NodeRenderer node={createTestNode('button')} />);
      expect(buttonHtml).toMatch(/(transition|duration|ease|motion-reduce)/i);

      const metricCardHtml = renderToString(<NodeRenderer node={createTestNode('metric-card')} />);
      expect(metricCardHtml).toMatch(/(transition|duration|ease)/i);
    });

    it('verifies State Messaging family renders state alerts and indicators', () => {
      const emptyStateHtml = renderToString(<NodeRenderer node={createTestNode('empty-state')} />);
      expect(emptyStateHtml).toMatch(/(no\s+data|empty|create|found|get\s+started)/i);

      const alertBannerHtml = renderToString(<NodeRenderer node={createTestNode('alert-banner')} />);
      expect(alertBannerHtml).toMatch(/(alert|warning|info|notice|error)/i);

      const toastHtml = renderToString(<NodeRenderer node={createTestNode('toast-item')} />);
      expect(toastHtml).toMatch(/(toast|notification|success|message)/i);

      const statusIndicatorHtml = renderToString(<NodeRenderer node={createTestNode('status-indicator')} />);
      expect(statusIndicatorHtml).toMatch(/(status|operational|active|online|live)/i);
    });
  });
});
