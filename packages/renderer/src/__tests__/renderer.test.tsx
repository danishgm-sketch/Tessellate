import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ProjectNode, ProjectManifest } from '@tessellate/schemas';
import { NodeRenderer, ManifestRenderer } from '../index.js';

describe('Renderer Foundation', () => {
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
    // Expressive variant uses cobalt background
    expect(html).toContain('bg-[#2547E8]');
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
  });

  it('renders a screen with multiple nodes via ManifestRenderer', () => {
    const mockManifest: ProjectManifest = {
      schemaVersion: '1.0.0',
      id: 'proj_test_1',
      name: 'Test Project',
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
      catalogVersion: '1.0.0',
      seed: 'seed_123',
      productModel: {
        schemaVersion: '1.0.0',
        productArchetypes: [{ tag: 'developer-tool', weight: 100 }],
        primaryAudience: 'Engineers',
        userSophistication: 80,
        primaryObjective: 'Ship UI',
        secondaryObjectives: [],
        jobsToBeDone: ['Compose UI'],
        entities: [],
        workflows: [],
        trustRequirement: 80,
        informationComplexity: 70,
        dataDensity: 80,
        collaborationLevel: 50,
        transactionCriticality: 60,
        navigationComplexity: 40,
        mobileImportance: 50,
        likelyScreens: [],
        requiredCapabilities: [],
        forbiddenPatterns: [],
        constraints: {
          accessibilityFloor: 'AA',
          targetDevices: ['desktop'],
        },
      },
      designDNA: {
        professionalism: 80,
        playfulness: 20,
        luxury: 30,
        warmth: 30,
        technicality: 80,
        editorial: 60,
        futurism: 50,
        visualAmbition: 60,
        structuralCreativity: 40,
        density: 70,
        whitespace: 40,
        contrast: 80,
        colourfulness: 40,
        curvature: 40,
        depth: 30,
        motion: 30,
        motionPlayfulness: 20,
        typographicExpression: 50,
        imageryIntensity: 10,
        videoIntensity: 0,
        threeDIntensity: 0,
        dataDensity: 70,
        interactionDensity: 70,
        asymmetry: 10,
        conversionIntensity: 50,
        trust: 90,
        accessibilityPriority: 90,
        performancePriority: 90,
        primaryArchetype: 'developer-tool',
        visualMode: 'light',
        geometryFamily: 'rounded',
        navigationModel: 'sidebar',
        responsivePhilosophy: 'compress',
        contentTone: 'technical',
        primaryStack: 'react-tailwind',
        motionPersonality: 'snappy',
        typographyPersonality: 'technical',
        surfacePersonality: 'flat',
      },
      constraints: {
        accessibilityFloor: 'AA',
        targetDevices: ['desktop'],
      },
      screenGraph: {
        id: 'graph_1',
        groups: [
          {
            id: 'grp_main',
            name: 'Main',
            screens: [
              {
                id: 'scr_main',
                name: 'Main Screen',
                slug: 'main',
                screenType: 'dashboard',
                purpose: 'Overview',
                jobs: ['Inspect'],
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
          id: 'scr_main',
          name: 'Main Screen',
          slug: 'main',
          screenNodeId: 'node_screen_root',
          rootNode: {
            id: 'node_screen_root',
            nodeType: 'layout',
            semanticRole: 'container',
            slots: {},
            props: {},
            children: [
              {
                id: 'node_btn_deploy',
                nodeType: 'component',
                semanticRole: 'action',
                resourceRef: {
                  id: 'res_primitive_button_01',
                  slug: 'button',
                  version: '1.0.0',
                },
                variant: 'quiet',
                props: {
                  children: 'Deploy Project',
                },
                slots: {},
                children: [],
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

    const html = renderToString(<ManifestRenderer manifest={mockManifest} />);

    expect(html).toContain('Deploy Project');
    expect(html).toContain('data-screen-id="scr_main"');
  });
});
