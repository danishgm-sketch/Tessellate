import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ProjectNode, ProjectManifest } from '@tessellate/schemas';
import {
  NodeRenderer,
  ManifestRenderer,
  normalizeDesignTokens,
  tokensToCssVariables,
} from '../index.js';

describe('Semantic Token Contract & Normalisation', () => {
  it('normalizes Design DNA into complete SemanticTokenContract', () => {
    const tokens = normalizeDesignTokens({
      professionalism: 85,
      curvature: 45,
      depth: 35,
      motionPlayfulness: 20,
    });

    expect(tokens.colors.canvas).toBeTruthy();
    expect(tokens.colors.accent).toBeTruthy();
    expect(tokens.typography.headingFont).toBeTruthy();
    expect(tokens.radius.md).toBe('14px');
    expect(tokens.spacing.baseUnit).toBe(4);
    expect(tokens.surfaceDepth.borderWidth).toBeTruthy();
    expect(tokens.motion.durationNormal).toBeTruthy();
    expect(tokens.focus.ringColor).toBeTruthy();
  });

  it('converts normalized tokens to standard CSS variables', () => {
    const tokens = normalizeDesignTokens();
    const cssVars = tokensToCssVariables(tokens);

    expect(cssVars['--tess-canvas']).toBeTruthy();
    expect(cssVars['--tess-surface']).toBeTruthy();
    expect(cssVars['--tess-ink']).toBeTruthy();
    expect(cssVars['--tess-accent']).toBeTruthy();
    expect(cssVars['--tess-radius-md']).toBe('14px');
    expect(cssVars['--tess-duration-normal']).toBeTruthy();
  });

  it('radius mapping: curvature 0 produces sharp 0px corners, curvature 100 produces hyper-rounded', () => {
    const sharpTokens = normalizeDesignTokens({ curvature: 0 });
    expect(sharpTokens.radius.xs).toBe('0px');
    expect(sharpTokens.radius.sm).toBe('0px');
    expect(sharpTokens.radius.md).toBe('0px');
    expect(sharpTokens.radius.lg).toBe('0px');

    const roundedTokens = normalizeDesignTokens({ curvature: 100 });
    expect(roundedTokens.radius.xs).toBe('8px');
    expect(roundedTokens.radius.sm).toBe('16px');
    expect(roundedTokens.radius.md).toBe('28px');
  });

  it('motion mapping: enforces instant 0ms duration when reduced-motion is requested', () => {
    const normalTokens = normalizeDesignTokens({}, { reducedMotion: false });
    expect(normalTokens.motion.durationNormal).not.toBe('0ms');
    expect(normalTokens.motion.reducedMotion).toBe(false);

    const reducedTokens = normalizeDesignTokens({}, { reducedMotion: true });
    expect(reducedTokens.motion.durationFast).toBe('0ms');
    expect(reducedTokens.motion.durationNormal).toBe('0ms');
    expect(reducedTokens.motion.durationSlow).toBe('0ms');
    expect(reducedTokens.motion.reducedMotion).toBe(true);
  });

  it('accessibility precedence: enforces prominent 3px ring when accessibilityPriority >= 80', () => {
    const normalA11y = normalizeDesignTokens({ accessibilityPriority: 50 });
    expect(normalA11y.focus.ringWidth).toBe('2px');

    const strictA11y = normalizeDesignTokens({ accessibilityPriority: 90 });
    expect(strictA11y.focus.ringWidth).toBe('3px');
  });

  it('keeps each directly rendered numeric DNA dimension observable without changing unrelated token families', () => {
    const base = normalizeDesignTokens();

    const denser = normalizeDesignTokens({ density: 80 });
    expect(denser.spacing.multiplier).not.toBe(base.spacing.multiplier);
    expect(denser.colors).toEqual(base.colors);
    expect(denser.radius).toEqual(base.radius);

    const roomier = normalizeDesignTokens({ whitespace: 90 });
    expect(roomier.spacing.multiplier).not.toBe(base.spacing.multiplier);
    expect(roomier.colors).toEqual(base.colors);
    expect(roomier.radius).toEqual(base.radius);

    const morePlayful = normalizeDesignTokens({ playfulness: 100 });
    expect(morePlayful.radius).not.toEqual(base.radius);
    expect(morePlayful.spacing).toEqual(base.spacing);
    expect(morePlayful.colors).toEqual(base.colors);

    const higherContrast = normalizeDesignTokens({ contrast: 90 });
    expect(higherContrast.surfaceDepth.borderWidth).not.toBe(base.surfaceDepth.borderWidth);
    expect(higherContrast.spacing).toEqual(base.spacing);
    expect(higherContrast.radius).toEqual(base.radius);

    const deeper = normalizeDesignTokens({ depth: 80 });
    expect(deeper.surfaceDepth.shadowMedium).not.toBe(base.surfaceDepth.shadowMedium);
    expect(deeper.colors).toEqual(base.colors);

    const quickerMotion = normalizeDesignTokens({ motion: 90 });
    expect(quickerMotion.motion.durationNormal).not.toBe(base.motion.durationNormal);
    expect(quickerMotion.colors).toEqual(base.colors);

    const strictFocus = normalizeDesignTokens({ accessibilityPriority: 50 });
    expect(strictFocus.focus.ringWidth).not.toBe(base.focus.ringWidth);
    expect(strictFocus.spacing).toEqual(base.spacing);
  });

  it('changes the relevant rendered token family for visual mode and typography personality', () => {
    const light = normalizeDesignTokens({ visualMode: 'light' });
    const dark = normalizeDesignTokens({ visualMode: 'dark' });
    expect(dark.colors.canvas).not.toBe(light.colors.canvas);
    expect(dark.typography).toEqual(light.typography);

    const system = normalizeDesignTokens({ typographyPersonality: 'geist-system' });
    const editorial = normalizeDesignTokens({ typographyPersonality: 'editorial-serif-geist' });
    expect(editorial.typography.headingFont).not.toBe(system.typography.headingFont);
    expect(editorial.colors).toEqual(system.colors);
  });

  it('makes typographic expression, motion playfulness, and surface personality visible in tokens', () => {
    const restrainedType = normalizeDesignTokens({ typographicExpression: 15 });
    const expressiveType = normalizeDesignTokens({ typographicExpression: 90 });
    expect(expressiveType.typography.headingLetterSpacing).not.toBe(
      restrainedType.typography.headingLetterSpacing
    );
    expect(expressiveType.typography.scaleRatio).not.toBe(restrainedType.typography.scaleRatio);
    expect(tokensToCssVariables(expressiveType)['--tess-type-scale-ratio']).toBe(
      String(expressiveType.typography.scaleRatio)
    );

    const preciseMotion = normalizeDesignTokens({ motionPlayfulness: 10 });
    const playfulMotion = normalizeDesignTokens({ motionPlayfulness: 90 });
    expect(playfulMotion.motion.easing).not.toBe(preciseMotion.motion.easing);

    const paperSurface = normalizeDesignTokens({ surfacePersonality: 'paper-flat' });
    const contrastSurface = normalizeDesignTokens({ surfacePersonality: 'subtle-contrast' });
    expect(paperSurface.surfaceDepth.shadowMedium).not.toBe(
      contrastSurface.surfaceDepth.shadowMedium
    );
  });
});

describe('NodeRenderer & Responsive Strategy', () => {
  it('renders a domain-specific table value without exposing the unrelated quality score', () => {
    const orderSummaryNode: ProjectNode = {
      id: 'node_order_summary',
      nodeType: 'component',
      semanticRole: 'order-summary',
      resourceRef: {
        id: 'res_blk_advanced_data_table',
        slug: 'advanced-data-table',
        version: '1.0.0',
      },
      props: {
        title: 'Order summary · example',
        columnLabels: { name: 'Item', type: 'Details', quality: 'Price', status: 'State' },
        rows: [{
          id: 1,
          name: 'Example Product',
          type: 'Sample cart item',
          quality: 0,
          displayValue: 'Price from your catalogue',
          status: 'Example',
        }],
      },
      slots: {},
      children: [],
    };

    const html = renderToString(<NodeRenderer node={orderSummaryNode} />);

    expect(html).toContain('Price from your catalogue');
    expect(html).not.toContain('0/100');
  });

  it('renders a canonical button resource node with variant', () => {
    const buttonNode: ProjectNode = {
      id: 'node_btn_1',
      nodeType: 'component',
      semanticRole: 'action',
      resourceRef: {
        id: 'res_primitive_button_01',
        slug: 'button',
        version: '1.0.0',
      },
      variant: 'expressive',
      props: {
        children: 'Deploy Interface',
      },
      slots: {},
      children: [],
    };

    const html = renderToString(<NodeRenderer node={buttonNode} />);

    expect(html).toContain('Deploy Interface');
    expect(html).toContain('data-node-id="node_btn_1"');
    expect(html).toContain('data-resource-variant="expressive"');
  });

  it('renders a recoverable fallback placeholder when resource is unresolved', () => {
    const missingNode: ProjectNode = {
      id: 'node_unknown_1',
      nodeType: 'component',
      semanticRole: 'widget',
      resourceRef: {
        id: 'res_missing_99',
        slug: 'unknown-quantum-widget',
        version: '1.0.0',
      },
      props: {},
      slots: {},
      children: [],
    };

    const html = renderToString(<NodeRenderer node={missingNode} />);

    expect(html).toContain('Unresolved resource:');
    expect(html).toContain('unknown-quantum-widget');
    expect(html).toContain('node_unknown_1');
    expect(html).toContain('data-testid="missing-resource-recovery"');
  });

  it('omits nonessential nodes when viewport is mobile', () => {
    const nonessentialNode: ProjectNode = {
      id: 'node_decor_1',
      nodeType: 'component',
      semanticRole: 'decoration',
      responsiveOverrides: { strategy: 'omit-nonessential' },
      props: { children: 'Decorative Ambient Badge' },
      slots: {},
      children: [],
    };

    const desktopHtml = renderToString(
      <NodeRenderer node={nonessentialNode} context={{ viewport: 'desktop' }} />
    );
    expect(desktopHtml).toContain('Decorative Ambient Badge');

    const mobileHtml = renderToString(
      <NodeRenderer node={nonessentialNode} context={{ viewport: 'mobile' }} />
    );
    expect(mobileHtml).toBe('');
  });

  it('stacks layout children when responsive strategy is stack on mobile', () => {
    const rowNode: ProjectNode = {
      id: 'node_row_1',
      nodeType: 'layout',
      semanticRole: 'container',
      responsiveOverrides: { strategy: 'stack' },
      props: {},
      slots: {},
      children: [
        {
          id: 'child_1',
          nodeType: 'element',
          semanticRole: 'item',
          props: { children: 'Card A' },
          slots: {},
          children: [],
        },
      ],
    };

    const mobileHtml = renderToString(
      <NodeRenderer node={rowNode} context={{ viewport: 'mobile' }} />
    );
    expect(mobileHtml).toContain('flex-col');
  });
});

describe('Phase 8 Gate — Composed Page from Four Source Families', () => {
  const composedManifest: ProjectManifest = {
    schemaVersion: '1.0.0',
    id: 'proj_composed_gate_1',
    name: 'Unified Composed Operations Platform',
    createdAt: '2026-10-10T12:00:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
    catalogVersion: '1.0.0',
    seed: 'seed_gate_8',
    productModel: {
      schemaVersion: '1.0.0',
      productArchetypes: [{ tag: 'data-platform', weight: 100 }],
      primaryAudience: 'Systems Engineers',
      userSophistication: 85,
      primaryObjective: 'Real-time telemetry and cluster control',
      secondaryObjectives: [],
      jobsToBeDone: ['Monitor health', 'Deploy changes'],
      entities: [],
      workflows: [],
      trustRequirement: 85,
      informationComplexity: 80,
      dataDensity: 80,
      collaborationLevel: 50,
      transactionCriticality: 70,
      navigationComplexity: 40,
      mobileImportance: 60,
      likelyScreens: [],
      requiredCapabilities: [],
      forbiddenPatterns: [],
      constraints: {
        accessibilityFloor: 'AA',
        targetDevices: ['desktop', 'mobile'],
      },
    },
    designDNA: {
      professionalism: 80,
      playfulness: 15,
      luxury: 25,
      warmth: 30,
      technicality: 80,
      editorial: 50,
      futurism: 60,
      visualAmbition: 65,
      structuralCreativity: 40,
      density: 70,
      whitespace: 45,
      contrast: 80,
      colourfulness: 35,
      curvature: 40,
      depth: 35,
      motion: 30,
      motionPlayfulness: 15,
      typographicExpression: 55,
      imageryIntensity: 10,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 75,
      interactionDensity: 70,
      asymmetry: 15,
      conversionIntensity: 45,
      trust: 90,
      accessibilityPriority: 90,
      performancePriority: 85,
      primaryArchetype: 'data-platform',
      visualMode: 'light',
      geometryFamily: 'rounded',
      navigationModel: 'top-nav',
      responsivePhilosophy: 'compress',
      contentTone: 'technical',
      primaryStack: 'react-tailwind',
      motionPersonality: 'snappy-productive',
      typographyPersonality: 'geist-system',
      surfacePersonality: 'flat',
    },
    constraints: {
      accessibilityFloor: 'AA',
      targetDevices: ['desktop', 'mobile'],
    },
    screenGraph: {
      id: 'graph_gate_1',
      groups: [
        {
          id: 'grp_ops',
          name: 'Operations',
          screens: [
            {
              id: 'scr_dashboard',
              name: 'Cluster Overview',
              slug: 'dashboard',
              screenType: 'dashboard',
              purpose: 'Telemetry Overview',
              jobs: ['Inspect telemetry'],
              required: true,
              navigationVisibility: 'primary',
              importance: 100,
              expectedData: [],
              requiredRoles: [],
              optionalRoles: [],
            },
          ],
        },
      ],
      edges: [],
    },
    screens: [
      {
        id: 'scr_dashboard',
        name: 'Cluster Overview',
        slug: 'dashboard',
        screenNodeId: 'root_node',
        rootNode: {
          id: 'root_node',
          nodeType: 'layout',
          semanticRole: 'screen-canvas',
          slots: {},
          props: { className: 'flex flex-col gap-6 p-6' },
          children: [
            // 1. Navigation family: AppHeader
            {
              id: 'node_header',
              nodeType: 'component',
              semanticRole: 'navigation',
              resourceRef: {
                id: 'res_nav_header_01',
                slug: 'app-header',
                version: '1.0.0',
              },
              props: {
                brandName: 'Apex Telemetry Grid',
                ctaLabel: 'System Status: Optimal',
              },
              slots: {},
              children: [],
            },
            // 2. Marketing family: HeroBanner
            {
              id: 'node_hero',
              nodeType: 'section',
              semanticRole: 'hero',
              resourceRef: {
                id: 'res_marketing_hero_01',
                slug: 'hero-banner',
                version: '1.0.0',
              },
              props: {
                headline: 'Real-Time Edge Infrastructure',
                description: 'Unified telemetry across multi-region edge clusters with sub-millisecond propagation.',
                primaryActionLabel: 'Deploy Cluster',
                secondaryActionLabel: 'View Raw Logs',
              },
              slots: {},
              children: [],
            },
            // 3. Analytics family: MetricCard grid
            {
              id: 'node_analytics_grid',
              nodeType: 'layout',
              semanticRole: 'metrics-grid',
              props: { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' },
              slots: {},
              children: [
                {
                  id: 'node_metric_1',
                  nodeType: 'component',
                  semanticRole: 'kpi',
                  resourceRef: {
                    id: 'res_analytics_metric_card_01',
                    slug: 'metric-card',
                    version: '1.0.0',
                  },
                  props: {
                    label: 'P99 Latency',
                    value: '1.42 ms',
                    change: '-12%',
                    changeType: 'positive',
                  },
                  slots: {},
                  children: [],
                },
                {
                  id: 'node_metric_2',
                  nodeType: 'component',
                  semanticRole: 'kpi',
                  resourceRef: {
                    id: 'res_analytics_metric_card_01',
                    slug: 'metric-card',
                    version: '1.0.0',
                  },
                  props: {
                    label: 'Request Volume',
                    value: '1.48M req/s',
                    change: '+8.4%',
                    changeType: 'positive',
                  },
                  slots: {},
                  children: [],
                },
              ],
            },
            // 4. Primitives family: Button
            {
              id: 'node_action_bar',
              nodeType: 'block',
              semanticRole: 'actions',
              props: { className: 'flex items-center gap-3' },
              slots: {},
              children: [
                {
                  id: 'node_btn_action',
                  nodeType: 'component',
                  semanticRole: 'action',
                  resourceRef: {
                    id: 'res_primitive_button_01',
                    slug: 'button',
                    version: '1.0.0',
                  },
                  variant: 'expressive',
                  props: {
                    children: 'Trigger Live Flush',
                  },
                  slots: {},
                  children: [],
                },
              ],
            },
          ],
        },
      },
    ],
    navigation: {
      model: 'single-page',
      primaryItems: [],
    },
    assets: [],
    locks: [],
    historyMeta: {
      totalOperations: 0,
      headRevision: 0,
    },
    exportSettings: {
      target: 'vite-react-tailwind',
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
    },
  };

  it('renders four distinct source families cohesively under single Project DNA', () => {
    const html = renderToString(<ManifestRenderer manifest={composedManifest} />);

    // 1. Navigation family rendered
    expect(html).toContain('Apex Telemetry Grid');
    // 2. Marketing family rendered
    expect(html).toContain('Real-Time Edge Infrastructure');
    // 3. Analytics family rendered
    expect(html).toContain('P99 Latency');
    expect(html).toContain('1.42 ms');
    // 4. Primitives family rendered
    expect(html).toContain('Trigger Live Flush');

    // Semantic tokens injected into style root
    expect(html).toContain('--tess-canvas');
    expect(html).toContain('--tess-hairline');
    expect(html).toContain('--tess-radius-md');
  });

  it('survives mobile viewport checks with intentional responsive handling', () => {
    const htmlMobile = renderToString(
      <ManifestRenderer
        manifest={composedManifest}
        context={{ viewport: 'mobile' }}
      />
    );

    expect(htmlMobile).toContain('data-viewport="mobile"');
    expect(htmlMobile).toContain('Apex Telemetry Grid');
    expect(htmlMobile).toContain('P99 Latency');
    expect(htmlMobile).toContain('Trigger Live Flush');
  });

  it('survives reduced-motion checks with zero animation duration', () => {
    const htmlReduced = renderToString(
      <ManifestRenderer
        manifest={composedManifest}
        context={{ reducedMotion: true }}
      />
    );

    expect(htmlReduced).toContain('data-reduced-motion="true"');
    expect(htmlReduced).toContain('--tess-duration-normal:0ms');
    expect(htmlReduced).toContain('transition-none');
  });
});
