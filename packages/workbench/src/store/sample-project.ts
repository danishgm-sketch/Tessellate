import {
  type ProjectManifest,
  ProjectManifestSchema,
} from '@tessellate/schemas';

/**
 * Creates a rich, valid sample project manifest for the Workbench.
 */
export function createSampleProject(): ProjectManifest {
  const manifest: ProjectManifest = {
    schemaVersion: '0.1.0',
    id: 'project-fintech-terminal',
    name: 'Apex Financial Intelligence',
    description:
      'High-density telemetry and portfolio risk terminal for equity analysts and fund managers.',
    createdAt: new Date('2026-03-01T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-03-01T12:00:00Z').toISOString(),
    catalogVersion: '0.1.0',
    seed: 'apex-terminal-seed-2026',

    productModel: {
      schemaVersion: '0.1.0',
      productArchetypes: [
        {
          tag: 'fintech',
          weight: 95,
        },
      ],
      primaryAudience: 'Professional equity analysts, traders, and quantitative risk officers',
      userSophistication: 80,
      primaryObjective: 'Maximize real-time market awareness with zero layout latency',
      secondaryObjectives: ['Streamline trade reconciliations', 'Automate risk limit compliance'],
      jobsToBeDone: [
        'Track daily PnL and sector risk attribution',
        'Receive automated volatility alerts',
        'Export compliant audit reports to compliance officer',
      ],
      entities: [],
      workflows: [],
      trustRequirement: 95,
      informationComplexity: 85,
      dataDensity: 85,
      collaborationLevel: 40,
      transactionCriticality: 90,
      navigationComplexity: 70,
      mobileImportance: 30,
      likelyScreens: [],
      requiredCapabilities: [],
      forbiddenPatterns: ['playful gamification', 'bouncy physics', 'oversized novelty cards'],
      constraints: {
        accessibilityFloor: 'AA',
        performanceCeiling: 'rich',
        targetDevices: ['desktop', 'tablet'],
        requiredScreens: ['overview', 'analytics', 'settings'],
        forbiddenPatterns: ['playful gamification', 'bouncy physics'],
      },
    },

    designDNA: {
      professionalism: 92,
      playfulness: 12,
      luxury: 78,
      warmth: 28,
      technicality: 88,
      editorial: 45,
      futurism: 60,
      visualAmbition: 55,
      structuralCreativity: 40,
      density: 82,
      whitespace: 45,
      contrast: 85,
      colourfulness: 35,
      curvature: 25,
      depth: 25,
      motion: 30,
      motionPlayfulness: 15,
      typographicExpression: 40,
      imageryIntensity: 10,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 85,
      interactionDensity: 75,
      asymmetry: 15,
      conversionIntensity: 20,
      trust: 95,
      accessibilityPriority: 80,
      performancePriority: 90,

      primaryArchetype: 'fintech',
      visualMode: 'light',
      geometryFamily: 'sharp',
      navigationModel: 'top-nav',
      responsivePhilosophy: 'desktop-first',
      contentTone: 'analytical',
      primaryStack: 'react-tailwind',
      motionPersonality: 'precise',
      typographyPersonality: 'technical',
      surfacePersonality: 'flat-bordered',
    },

    constraints: {
      targetDevices: ['desktop', 'tablet'],
      accessibilityFloor: 'AA',
      performanceCeiling: 'rich',
      forbiddenPatterns: ['infinite scroll', 'distracting glow effects'],
    },

    screenGraph: {
      id: 'graph-fintech-terminal',
      groups: [
        {
          id: 'group-core',
          name: 'Core Application',
          screens: [
            {
              id: 'screen-overview',
              name: 'Portfolio Overview',
              slug: '/overview',
              screenType: 'dashboard',
              purpose: 'Real-time telemetry and KPI portfolio overview',
              jobs: ['track-pnl', 'view-telemetry'],
              required: true,
              navigationVisibility: 'primary',
              importance: 100,
              expectedData: ['pnl', 'metrics', 'positions'],
              requiredRoles: ['header', 'kpi-grid', 'chart-panel'],
              optionalRoles: ['action-bar'],
            },
            {
              id: 'screen-analytics',
              name: 'Risk & Analytics',
              slug: '/analytics',
              screenType: 'dashboard',
              purpose: 'Detailed sector exposure and historical risk curves',
              jobs: ['inspect-risk', 'stress-test'],
              required: true,
              navigationVisibility: 'primary',
              importance: 85,
              expectedData: ['historicalVol', 'sectorExposure'],
              requiredRoles: ['header', 'telemetry-grid'],
              optionalRoles: [],
            },
            {
              id: 'screen-settings',
              name: 'Terminal Settings',
              slug: '/settings',
              screenType: 'settings',
              purpose: 'API keys, risk thresholds, and notification rules',
              jobs: ['manage-keys', 'configure-alerts'],
              required: false,
              navigationVisibility: 'secondary',
              importance: 60,
              expectedData: ['userProfile', 'riskLimits'],
              requiredRoles: ['header', 'settings-form'],
              optionalRoles: [],
            },
          ],
        },
      ],
      edges: [
        {
          id: 'edge-overview-analytics',
          fromScreenId: 'screen-overview',
          toScreenId: 'screen-analytics',
          label: 'Analytics',
        },
        {
          id: 'edge-overview-settings',
          fromScreenId: 'screen-overview',
          toScreenId: 'screen-settings',
          label: 'Settings',
        },
      ],
    },

    screens: [
      // 1. Overview Screen
      {
        id: 'screen-overview',
        screenNodeId: 'screen-overview',
        name: 'Portfolio Overview',
        slug: '/overview',
        rootNode: {
          id: 'node-app-shell',
          nodeType: 'layout',
          semanticRole: 'app-shell',
          props: {
            className: 'w-full min-h-screen flex flex-col bg-[var(--tess-canvas,#FAF9F6)] text-[var(--tess-ink,#111217)]',
          },
          slots: {},
          children: [
            // Header
            {
              id: 'node-header',
              nodeType: 'component',
              semanticRole: 'navigation-header',
              resourceRef: {
                id: 'res-app-header-01',
                slug: 'app-header',
                version: '1.0.0',
              },
              props: {
                title: 'Apex Intelligence',
                navItems: [
                  { label: 'Overview', href: '#', active: true },
                  { label: 'Analytics', href: '#' },
                  { label: 'Orders', href: '#' },
                  { label: 'Settings', href: '#' },
                ],
              },
              slots: {},
              children: [],
              locks: {
                structure: true,
              },
            },
            // Main Content
            {
              id: 'node-main',
              nodeType: 'layout',
              semanticRole: 'main-content',
              props: {
                className: 'flex-1 max-w-7xl mx-auto w-full p-6 space-y-6',
              },
              slots: {},
              children: [
                // KPI Metric Cards Section
                {
                  id: 'node-kpi-group',
                  nodeType: 'section',
                  semanticRole: 'kpi-summary-grid',
                  props: {
                    className: 'grid grid-cols-1 md:grid-cols-3 gap-6',
                  },
                  slots: {},
                  children: [
                    {
                      id: 'node-metric-arr',
                      nodeType: 'component',
                      semanticRole: 'metric-kpi',
                      resourceRef: {
                        id: 'res-metric-card-01',
                        slug: 'metric-card',
                        version: '1.0.0',
                      },
                      props: {
                        title: 'Total Portfolio Value',
                        value: '$42,850,200',
                        change: '+14.2% YTD',
                        isPositive: true,
                      },
                      slots: {},
                      children: [],
                    },
                    {
                      id: 'node-metric-accounts',
                      nodeType: 'component',
                      semanticRole: 'metric-kpi',
                      resourceRef: {
                        id: 'res-metric-card-01',
                        slug: 'metric-card',
                        version: '1.0.0',
                      },
                      props: {
                        title: 'Sharpe Ratio (3Y)',
                        value: '2.84',
                        change: '+0.32 vs benchmark',
                        isPositive: true,
                      },
                      slots: {},
                      children: [],
                    },
                    {
                      id: 'node-metric-health',
                      nodeType: 'component',
                      semanticRole: 'metric-kpi',
                      resourceRef: {
                        id: 'res-metric-card-01',
                        slug: 'metric-card',
                        version: '1.0.0',
                      },
                      props: {
                        title: 'Value at Risk (99%)',
                        value: '$1,240,000',
                        change: '-4.8% controlled',
                        isPositive: false,
                      },
                      slots: {},
                      children: [],
                      responsiveOverrides: {
                        strategy: 'omit-nonessential',
                      },
                    },
                  ],
                },
                // Action Buttons Section
                {
                  id: 'node-actions-section',
                  nodeType: 'section',
                  semanticRole: 'action-bar',
                  props: {
                    className: 'flex flex-wrap items-center justify-between p-4 bg-white dark:bg-[#171B21] rounded-xl border border-[#D9D6CF] dark:border-[#272C34] shadow-sm',
                  },
                  slots: {},
                  children: [
                    {
                      id: 'node-action-label',
                      nodeType: 'element',
                      semanticRole: 'status-indicator',
                      props: {
                        children: 'Trading Desk Status: Active Market Hours • Liquidity Normal',
                        className: 'text-xs font-mono text-[#62666F] dark:text-[#A8AFBA]',
                      },
                      slots: {},
                      children: [],
                    },
                    {
                      id: 'node-actions-cluster',
                      nodeType: 'block',
                      semanticRole: 'button-group',
                      props: {
                        className: 'flex items-center gap-3',
                      },
                      slots: {},
                      children: [
                        {
                          id: 'node-btn-rebalance',
                          nodeType: 'component',
                          semanticRole: 'action-button',
                          resourceRef: {
                            id: 'res-button-01',
                            slug: 'button',
                            version: '1.0.0',
                          },
                          props: {
                            label: 'Execute Rebalance',
                            variant: 'primary',
                          },
                          slots: {},
                          children: [],
                        },
                        {
                          id: 'node-btn-export',
                          nodeType: 'component',
                          semanticRole: 'action-button',
                          resourceRef: {
                            id: 'res-button-01',
                            slug: 'button',
                            version: '1.0.0',
                          },
                          props: {
                            label: 'Export Risk Sheets',
                            variant: 'outline',
                          },
                          slots: {},
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },

      // 2. Analytics Screen
      {
        id: 'screen-analytics',
        screenNodeId: 'screen-analytics',
        name: 'Risk & Analytics',
        slug: '/analytics',
        rootNode: {
          id: 'node-analytics-shell',
          nodeType: 'layout',
          semanticRole: 'app-shell',
          props: {
            className: 'w-full min-h-screen flex flex-col bg-[var(--tess-canvas,#FAF9F6)] text-[var(--tess-ink,#111217)]',
          },
          slots: {},
          children: [
            {
              id: 'node-header-analytics',
              nodeType: 'component',
              semanticRole: 'navigation-header',
              resourceRef: {
                id: 'res-app-header-01',
                slug: 'app-header',
                version: '1.0.0',
              },
              props: {
                title: 'Apex Intelligence — Risk Telemetry',
                navItems: [
                  { label: 'Overview', href: '#' },
                  { label: 'Analytics', href: '#', active: true },
                  { label: 'Orders', href: '#' },
                  { label: 'Settings', href: '#' },
                ],
              },
              slots: {},
              children: [],
            },
            {
              id: 'node-main-analytics',
              nodeType: 'layout',
              semanticRole: 'main-content',
              props: {
                className: 'flex-1 max-w-7xl mx-auto w-full p-6 space-y-6',
              },
              slots: {},
              children: [
                {
                  id: 'node-analytics-grid',
                  nodeType: 'section',
                  semanticRole: 'telemetry-grid',
                  props: {
                    className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                  },
                  slots: {},
                  children: [
                    {
                      id: 'node-metric-vol',
                      nodeType: 'component',
                      semanticRole: 'metric-kpi',
                      resourceRef: {
                        id: 'res-metric-card-01',
                        slug: 'metric-card',
                        version: '1.0.0',
                      },
                      props: {
                        title: 'Implied Volatility (VIX Index)',
                        value: '14.85',
                        change: '-1.20 pts',
                        isPositive: true,
                      },
                      slots: {},
                      children: [],
                    },
                    {
                      id: 'node-metric-beta',
                      nodeType: 'component',
                      semanticRole: 'metric-kpi',
                      resourceRef: {
                        id: 'res-metric-card-01',
                        slug: 'metric-card',
                        version: '1.0.0',
                      },
                      props: {
                        title: 'Portfolio Market Beta',
                        value: '0.88',
                        change: 'Low systemic sensitivity',
                        isPositive: true,
                      },
                      slots: {},
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },

      // 3. Settings Screen
      {
        id: 'screen-settings',
        screenNodeId: 'screen-settings',
        name: 'Terminal Settings',
        slug: '/settings',
        rootNode: {
          id: 'node-settings-shell',
          nodeType: 'layout',
          semanticRole: 'app-shell',
          props: {
            className: 'w-full min-h-screen flex flex-col bg-[var(--tess-canvas,#FAF9F6)] text-[var(--tess-ink,#111217)]',
          },
          slots: {},
          children: [
            {
              id: 'node-header-settings',
              nodeType: 'component',
              semanticRole: 'navigation-header',
              resourceRef: {
                id: 'res-app-header-01',
                slug: 'app-header',
                version: '1.0.0',
              },
              props: {
                title: 'Apex Intelligence — System Settings',
                navItems: [
                  { label: 'Overview', href: '#' },
                  { label: 'Analytics', href: '#' },
                  { label: 'Orders', href: '#' },
                  { label: 'Settings', href: '#', active: true },
                ],
              },
              slots: {},
              children: [],
            },
            {
              id: 'node-main-settings',
              nodeType: 'layout',
              semanticRole: 'main-content',
              props: {
                className: 'flex-1 max-w-4xl mx-auto w-full p-6 space-y-6',
              },
              slots: {},
              children: [
                {
                  id: 'node-settings-card',
                  nodeType: 'section',
                  semanticRole: 'settings-panel',
                  props: {
                    className: 'p-6 bg-white dark:bg-[#171B21] rounded-xl border border-[#D9D6CF] dark:border-[#272C34] shadow-sm space-y-4',
                  },
                  slots: {},
                  children: [
                    {
                      id: 'node-settings-title',
                      nodeType: 'element',
                      semanticRole: 'heading',
                      props: {
                        children: 'Risk Governance & Circuit Breakers',
                        className: 'text-lg font-bold text-[#111217] dark:text-[#F5F7FA]',
                      },
                      slots: {},
                      children: [],
                    },
                    {
                      id: 'node-settings-desc',
                      nodeType: 'element',
                      semanticRole: 'paragraph',
                      props: {
                        children: 'Configure drawdown limits, algorithmic stop-losses, and automated regulatory reporting intervals.',
                        className: 'text-sm text-[#62666F] dark:text-[#A8AFBA]',
                      },
                      slots: {},
                      children: [],
                    },
                    {
                      id: 'node-btn-save-settings',
                      nodeType: 'component',
                      semanticRole: 'action-button',
                      resourceRef: {
                        id: 'res-button-01',
                        slug: 'button',
                        version: '1.0.0',
                      },
                      props: {
                        label: 'Save Configuration',
                        variant: 'primary',
                      },
                      slots: {},
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],

    navigation: {
      model: 'top-nav',
      primaryItems: [
        { label: 'Overview', targetScreenId: 'screen-overview' },
        { label: 'Analytics', targetScreenId: 'screen-analytics' },
      ],
      secondaryItems: [
        { label: 'Settings', targetScreenId: 'screen-settings' },
      ],
    },

    assets: [],
    locks: [
      {
        targetNodeId: 'node-header',
        lockTypes: ['structure'],
        reason: 'Header layout model is fixed for consistent desktop shell navigation.',
      },
    ],
    historyMeta: {
      totalOperations: 1,
      headRevision: 1,
    },
    exportSettings: {
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
      target: 'vite-react-tailwind',
    },
  };

  return ProjectManifestSchema.parse(manifest);
}
