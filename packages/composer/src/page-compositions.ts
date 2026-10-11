import type { ProjectScreen, ProjectNode } from '@tessellate/schemas';

export interface PageCompositionDefinition {
  id: string;
  title: string;
  slug: string;
  screenType: string;
  category: 'marketing' | 'auth' | 'app' | 'settings' | 'utility';
  description: string;
  requiredRoles: string[];
  recommendedSections: string[];
  archetypeFit: string[];
  createScreen: (options?: { id?: string; name?: string }) => ProjectScreen;
}

function createSectionNode(role: string, resourceSlug: string, id: string): ProjectNode {
  return {
    id,
    nodeType: 'section',
    semanticRole: role,
    resourceRef: {
      id: `res_${resourceSlug.replace(/-/g, '_')}`,
      slug: resourceSlug,
      version: '1.0.0',
    },
    variant: 'quiet',
    children: [],
    slots: {},
    props: {},
  };
}

export const PAGE_COMPOSITIONS: PageCompositionDefinition[] = [
  // 1. Marketing Home
  {
    id: 'marketing-home',
    title: 'Marketing Home',
    slug: '/',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Flagship product landing page with value proposition hero, social proof, interactive proof demo, and conversion CTA.',
    requiredRoles: ['navigation', 'hero', 'value-proposition', 'conversion-cta', 'footer'],
    recommendedSections: ['header-minimal', 'hero-minimal', 'logo-cloud-clean', 'feature-grid-cards', 'cta-minimal', 'footer-minimal'],
    archetypeFit: ['saas', 'developer-tools', 'ai', 'fintech'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-marketing-home',
      screenNodeId: 'node-marketing-home',
      name: opt?.name ?? 'Marketing Home',
      slug: '/',
      rootNode: {
        id: 'root-marketing-home',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('navigation', 'header-minimal', 'sec-nav'),
          createSectionNode('hero', 'hero-minimal', 'sec-hero'),
          createSectionNode('trust-proof', 'logo-cloud-clean', 'sec-proof'),
          createSectionNode('feature-grid', 'feature-grid-cards', 'sec-features'),
          createSectionNode('conversion-cta', 'cta-minimal', 'sec-cta'),
          createSectionNode('footer', 'footer-minimal', 'sec-footer'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 2. Product Overview
  {
    id: 'product-overview',
    title: 'Product Overview',
    slug: '/product',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Detailed platform capability overview showcasing architecture, technical workflows, and engine internals.',
    requiredRoles: ['hero', 'feature-grid', 'technical-specs', 'footer'],
    recommendedSections: ['hero-split', 'feature-tabs', 'stats-row-simple', 'footer-minimal'],
    archetypeFit: ['b2b-saas', 'developer-tools', 'cloud-infrastructure'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-product-overview',
      screenNodeId: 'node-product-overview',
      name: opt?.name ?? 'Product Overview',
      slug: '/product',
      rootNode: {
        id: 'root-product-overview',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('hero', 'hero-split', 'sec-prod-hero'),
          createSectionNode('feature-grid', 'feature-tabs', 'sec-prod-features'),
          createSectionNode('metrics-summary', 'stats-row-simple', 'sec-prod-stats'),
          createSectionNode('footer', 'footer-minimal', 'sec-prod-footer'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 3. Use Case Landing
  {
    id: 'use-case-landing',
    title: 'Use Case Landing',
    slug: '/solutions/automation',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Targeted persona solution page articulating problem-solution dynamics, architecture blueprints, and ROI proof.',
    requiredRoles: ['hero', 'problem-solution', 'workflow-steps', 'conversion-cta'],
    recommendedSections: ['hero-headline-only', 'feature-split-alternating', 'testimonial-single-quote', 'cta-split'],
    archetypeFit: ['enterprise', 'b2b-saas', 'consulting'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-use-case',
      screenNodeId: 'node-use-case',
      name: opt?.name ?? 'Use Case Landing',
      slug: '/solutions/automation',
      rootNode: {
        id: 'root-use-case',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('hero', 'hero-headline-only', 'sec-uc-hero'),
          createSectionNode('workflow-steps', 'feature-split-alternating', 'sec-uc-steps'),
          createSectionNode('social-proof', 'testimonial-single-quote', 'sec-uc-quote'),
          createSectionNode('conversion-cta', 'cta-split', 'sec-uc-cta'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 4. Industry Landing
  {
    id: 'industry-landing',
    title: 'Industry Landing',
    slug: '/industries/financial-services',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Vertical sector landing highlighting regulatory compliance, security audits, and enterprise customer testimonials.',
    requiredRoles: ['hero', 'compliance-badges', 'case-studies', 'conversion-cta'],
    recommendedSections: ['hero-minimal', 'security-trust-badges', 'logo-cloud-clean', 'cta-minimal'],
    archetypeFit: ['fintech', 'healthcare', 'civic'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-industry',
      screenNodeId: 'node-industry',
      name: opt?.name ?? 'Industry Landing',
      slug: '/industries/financial-services',
      rootNode: {
        id: 'root-industry',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('hero', 'hero-minimal', 'sec-ind-hero'),
          createSectionNode('compliance', 'security-trust-badges', 'sec-ind-badges'),
          createSectionNode('enterprise-proof', 'logo-cloud-clean', 'sec-ind-logos'),
          createSectionNode('conversion-cta', 'cta-minimal', 'sec-ind-cta'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 5. Pricing
  {
    id: 'pricing-page',
    title: 'Pricing',
    slug: '/pricing',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Transparent tier comparison with monthly/annual billing toggle, feature matrix, and enterprise contact card.',
    requiredRoles: ['hero', 'pricing-matrix', 'faq-accordion', 'guarantee-callout'],
    recommendedSections: ['pricing-cards-three-tier', 'pricing-comparison-table', 'faq-accordion-simple', 'cta-minimal'],
    archetypeFit: ['saas', 'developer-tools', 'consumer-subscription'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-pricing',
      screenNodeId: 'node-pricing',
      name: opt?.name ?? 'Pricing',
      slug: '/pricing',
      rootNode: {
        id: 'root-pricing',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('pricing-cards', 'pricing-cards-three-tier', 'sec-price-cards'),
          createSectionNode('feature-matrix', 'pricing-comparison-table', 'sec-price-matrix'),
          createSectionNode('faq', 'faq-accordion-simple', 'sec-price-faq'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 6. Security & Trust
  {
    id: 'security-trust',
    title: 'Security & Trust',
    slug: '/security',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Enterprise assurance dossier outlining SOC2 compliance, data encryption boundaries, and incident response SLAs.',
    requiredRoles: ['hero', 'security-certifications', 'compliance-matrix', 'sla-guarantee'],
    recommendedSections: ['hero-minimal', 'security-trust-badges', 'feature-grid-cards', 'footer-minimal'],
    archetypeFit: ['enterprise', 'fintech', 'healthcare'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-security',
      screenNodeId: 'node-security',
      name: opt?.name ?? 'Security & Trust',
      slug: '/security',
      rootNode: {
        id: 'root-security',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('hero', 'hero-minimal', 'sec-sec-hero'),
          createSectionNode('badges', 'security-trust-badges', 'sec-sec-badges'),
          createSectionNode('certifications', 'feature-grid-cards', 'sec-sec-certs'),
          createSectionNode('footer', 'footer-minimal', 'sec-sec-footer'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 7. Developer/API Landing
  {
    id: 'developer-api-landing',
    title: 'Developer/API Landing',
    slug: '/developers',
    screenType: 'documentation',
    category: 'marketing',
    description: 'SDK quickstart guide with multi-language code snippets, interactive curl playground, and CLI installation instructions.',
    requiredRoles: ['hero', 'quickstart-code', 'sdk-matrix', 'api-status'],
    recommendedSections: ['hero-split', 'code-block-interactive', 'feature-grid-cards', 'footer-minimal'],
    archetypeFit: ['developer-tools', 'api', 'cloud-infrastructure'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-developers',
      screenNodeId: 'node-developers',
      name: opt?.name ?? 'Developer/API Landing',
      slug: '/developers',
      rootNode: {
        id: 'root-developers',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('hero', 'hero-split', 'sec-dev-hero'),
          createSectionNode('code-snippet', 'code-block-interactive', 'sec-dev-code'),
          createSectionNode('sdk-features', 'feature-grid-cards', 'sec-dev-features'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 8. Documentation Home
  {
    id: 'documentation-home',
    title: 'Documentation Home',
    slug: '/docs',
    screenType: 'documentation',
    category: 'marketing',
    description: 'Knowledge base index with categorized guide cards, API reference links, and instant fuzzy search.',
    requiredRoles: ['search-hero', 'category-grid', 'popular-articles', 'feedback-footer'],
    recommendedSections: ['header-minimal', 'feature-grid-cards', 'footer-minimal'],
    archetypeFit: ['developer-tools', 'saas', 'open-source'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-docs-home',
      screenNodeId: 'node-docs-home',
      name: opt?.name ?? 'Documentation Home',
      slug: '/docs',
      rootNode: {
        id: 'root-docs-home',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('nav', 'header-minimal', 'sec-docs-nav'),
          createSectionNode('guide-categories', 'feature-grid-cards', 'sec-docs-categories'),
          createSectionNode('footer', 'footer-minimal', 'sec-docs-footer'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 9. Blog/Editorial Index
  {
    slug: '/blog',
    id: 'blog-editorial-index',
    title: 'Blog/Editorial Index',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Curated editorial archive with featured article hero, category filter tabs, and responsive article cards.',
    requiredRoles: ['featured-hero', 'article-grid', 'newsletter-cta'],
    recommendedSections: ['hero-split', 'feature-grid-cards', 'cta-minimal', 'footer-minimal'],
    archetypeFit: ['media', 'saas', 'creative-studio'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-blog',
      screenNodeId: 'node-blog',
      name: opt?.name ?? 'Blog/Editorial Index',
      slug: '/blog',
      rootNode: {
        id: 'root-blog',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('featured-article', 'hero-split', 'sec-blog-hero'),
          createSectionNode('recent-articles', 'feature-grid-cards', 'sec-blog-grid'),
          createSectionNode('newsletter', 'cta-minimal', 'sec-blog-cta'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 10. Case Study
  {
    slug: '/customers/meridian',
    id: 'case-study-page',
    title: 'Case Study',
    screenType: 'marketing',
    category: 'marketing',
    description: 'Customer success narrative highlighting operational challenges, architectural solution, and quantified metrics.',
    requiredRoles: ['hero', 'metrics-callout', 'prose-narrative', 'quote-pullout'],
    recommendedSections: ['hero-headline-only', 'stats-row-simple', 'testimonial-single-quote', 'cta-minimal'],
    archetypeFit: ['b2b-saas', 'enterprise', 'consulting'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-case-study',
      screenNodeId: 'node-case-study',
      name: opt?.name ?? 'Case Study',
      slug: '/customers/meridian',
      rootNode: {
        id: 'root-case-study',
        nodeType: 'layout',
        semanticRole: 'page-canvas',
        children: [
          createSectionNode('hero', 'hero-headline-only', 'sec-cs-hero'),
          createSectionNode('quant-metrics', 'stats-row-simple', 'sec-cs-stats'),
          createSectionNode('testimonial', 'testimonial-single-quote', 'sec-cs-quote'),
          createSectionNode('cta', 'cta-minimal', 'sec-cs-cta'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 11. Sign In
  {
    slug: '/sign-in',
    id: 'sign-in-page',
    title: 'Sign In',
    screenType: 'authentication',
    category: 'auth',
    description: 'Clean authentication screen supporting passwordless email magic link, OAuth provider buttons, and passkeys.',
    requiredRoles: ['brand-header', 'auth-card', 'auth-footer'],
    recommendedSections: ['auth-centered-form', 'footer-minimal'],
    archetypeFit: ['saas', 'consumer', 'fintech'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-sign-in',
      screenNodeId: 'node-sign-in',
      name: opt?.name ?? 'Sign In',
      slug: '/sign-in',
      rootNode: {
        id: 'root-sign-in',
        nodeType: 'layout',
        semanticRole: 'auth-canvas',
        children: [
          createSectionNode('auth-card', 'auth-centered-form', 'sec-auth-card'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 12. Account Recovery
  {
    slug: '/recover',
    id: 'account-recovery',
    title: 'Account Recovery',
    screenType: 'authentication',
    category: 'auth',
    description: 'Secure account password reset and backup recovery key verification flow.',
    requiredRoles: ['recovery-form', 'status-feedback'],
    recommendedSections: ['auth-centered-form'],
    archetypeFit: ['saas', 'fintech', 'security'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-recovery',
      screenNodeId: 'node-recovery',
      name: opt?.name ?? 'Account Recovery',
      slug: '/recover',
      rootNode: {
        id: 'root-recovery',
        nodeType: 'layout',
        semanticRole: 'auth-canvas',
        children: [
          createSectionNode('recovery-form', 'auth-centered-form', 'sec-recov-form'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 13. Role-Based Onboarding
  {
    slug: '/onboarding/role',
    id: 'role-onboarding',
    title: 'Role-Based Onboarding',
    screenType: 'onboarding',
    category: 'auth',
    description: 'Personalized onboarding questionnaire tailoring interface telemetry to developer, designer, or executive persona.',
    requiredRoles: ['stepper', 'persona-selector', 'action-controls'],
    recommendedSections: ['onboarding-step-wizard'],
    archetypeFit: ['saas', 'analytics', 'workspace'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-onboarding',
      screenNodeId: 'node-onboarding',
      name: opt?.name ?? 'Role-Based Onboarding',
      slug: '/onboarding/role',
      rootNode: {
        id: 'root-onboarding',
        nodeType: 'layout',
        semanticRole: 'wizard-canvas',
        children: [
          createSectionNode('step-wizard', 'onboarding-step-wizard', 'sec-onb-wizard'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 14. Workspace Creation
  {
    slug: '/onboarding/workspace',
    id: 'workspace-creation',
    title: 'Workspace Creation',
    screenType: 'onboarding',
    category: 'auth',
    description: 'Organization tenant setup with slug validator, regional data residency selector, and invite teammates input.',
    requiredRoles: ['wizard-content', 'action-controls'],
    recommendedSections: ['onboarding-step-wizard'],
    archetypeFit: ['saas', 'enterprise', 'collaboration'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-workspace-creation',
      screenNodeId: 'node-workspace-creation',
      name: opt?.name ?? 'Workspace Creation',
      slug: '/onboarding/workspace',
      rootNode: {
        id: 'root-workspace-creation',
        nodeType: 'layout',
        semanticRole: 'wizard-canvas',
        children: [
          createSectionNode('workspace-wizard', 'onboarding-step-wizard', 'sec-ws-wizard'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 15. Import Data
  {
    slug: '/onboarding/import',
    id: 'import-data-page',
    title: 'Import Data',
    screenType: 'onboarding',
    category: 'auth',
    description: 'Data ingestion wizard supporting CSV drag-and-drop, SQL connection string test, and field schema mapper.',
    requiredRoles: ['upload-dropzone', 'schema-mapping', 'progress-tracker'],
    recommendedSections: ['onboarding-step-wizard'],
    archetypeFit: ['data-platform', 'crm', 'saas'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-import-data',
      screenNodeId: 'node-import-data',
      name: opt?.name ?? 'Import Data',
      slug: '/onboarding/import',
      rootNode: {
        id: 'root-import-data',
        nodeType: 'layout',
        semanticRole: 'wizard-canvas',
        children: [
          createSectionNode('import-wizard', 'onboarding-step-wizard', 'sec-imp-wizard'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 16. Application Overview Dashboard
  {
    slug: '/overview',
    id: 'app-overview-dashboard',
    title: 'Application Overview Dashboard',
    screenType: 'dashboard',
    category: 'app',
    description: 'Primary operational hub featuring real-time health scorecard, telemetry metric charts, and live event feed.',
    requiredRoles: ['dashboard-header', 'metric-scorecards', 'trend-chart', 'activity-feed'],
    recommendedSections: ['metrics-scorecard', 'activity-timeline', 'time-series-chart'],
    archetypeFit: ['saas', 'fintech', 'infrastructure'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-app-overview',
      screenNodeId: 'node-app-overview',
      name: opt?.name ?? 'Application Overview Dashboard',
      slug: '/overview',
      rootNode: {
        id: 'root-app-overview',
        nodeType: 'layout',
        semanticRole: 'dashboard-canvas',
        children: [
          createSectionNode('kpi-metrics', 'metrics-scorecard', 'sec-dash-metrics'),
          createSectionNode('trend-chart', 'time-series-chart', 'sec-dash-chart'),
          createSectionNode('recent-activity', 'activity-timeline', 'sec-dash-activity'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 17. Global Search
  {
    slug: '/search',
    id: 'global-search-page',
    title: 'Global Search',
    screenType: 'search-explore',
    category: 'app',
    description: 'Faceted omni-search interface with instant client filtering, semantic highlights, and recent query history.',
    requiredRoles: ['search-input', 'facet-rail', 'results-stream'],
    recommendedSections: ['filter-bar', 'data-table'],
    archetypeFit: ['analytics', 'search-engine', 'enterprise'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-global-search',
      screenNodeId: 'node-global-search',
      name: opt?.name ?? 'Global Search',
      slug: '/search',
      rootNode: {
        id: 'root-global-search',
        nodeType: 'layout',
        semanticRole: 'search-canvas',
        children: [
          createSectionNode('filters', 'filter-bar', 'sec-srch-filters'),
          createSectionNode('results', 'data-table', 'sec-srch-results'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 18. Entity Index
  {
    slug: '/entities',
    id: 'entity-index-page',
    title: 'Entity Index',
    screenType: 'index-list',
    category: 'app',
    description: 'Comprehensive tabular collection browser with multi-field sorting, batch selection, and CSV export trigger.',
    requiredRoles: ['index-header', 'filter-bar', 'data-table', 'pagination'],
    recommendedSections: ['filter-bar', 'data-table', 'pagination'],
    archetypeFit: ['crm', 'operations', 'b2b-saas'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-entity-index',
      screenNodeId: 'node-entity-index',
      name: opt?.name ?? 'Entity Index',
      slug: '/entities',
      rootNode: {
        id: 'root-entity-index',
        nodeType: 'layout',
        semanticRole: 'table-canvas',
        children: [
          createSectionNode('filters', 'filter-bar', 'sec-ent-filters'),
          createSectionNode('records-table', 'data-table', 'sec-ent-table'),
          createSectionNode('pagination', 'pagination', 'sec-ent-pag'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 19. Entity Detail
  {
    slug: '/entities/:id',
    id: 'entity-detail-page',
    title: 'Entity Detail',
    screenType: 'detail-entity',
    category: 'app',
    description: 'Single record deep inspector with tabbed revisions, metadata sidebar, and lifecycle state transitions.',
    requiredRoles: ['entity-header', 'detail-tabs', 'main-pane', 'metadata-sidebar'],
    recommendedSections: ['metrics-scorecard', 'activity-timeline', 'version-history'],
    archetypeFit: ['crm', 'fintech', 'healthcare'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-entity-detail',
      screenNodeId: 'node-entity-detail',
      name: opt?.name ?? 'Entity Detail',
      slug: '/entities/:id',
      rootNode: {
        id: 'root-entity-detail',
        nodeType: 'layout',
        semanticRole: 'detail-canvas',
        children: [
          createSectionNode('header-kpis', 'metrics-scorecard', 'sec-det-kpis'),
          createSectionNode('timeline', 'activity-timeline', 'sec-det-timeline'),
          createSectionNode('audit-history', 'version-history', 'sec-det-history'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 20. Analytics Dashboard
  {
    slug: '/analytics',
    id: 'analytics-dashboard-page',
    title: 'Analytics Dashboard',
    screenType: 'analytics-reporting',
    category: 'app',
    description: 'Interactive telemetry intelligence console featuring multi-series timecharts, cohort matrix, and funnel graphs.',
    requiredRoles: ['date-picker', 'kpi-summary', 'chart-canvas', 'cohort-matrix'],
    recommendedSections: ['metrics-scorecard', 'time-series-chart', 'bar-chart', 'cohort-matrix'],
    archetypeFit: ['analytics', 'fintech', 'saas'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-analytics-dashboard',
      screenNodeId: 'node-analytics-dashboard',
      name: opt?.name ?? 'Analytics Dashboard',
      slug: '/analytics',
      rootNode: {
        id: 'root-analytics-dashboard',
        nodeType: 'layout',
        semanticRole: 'analytics-canvas',
        children: [
          createSectionNode('summary-kpis', 'metrics-scorecard', 'sec-an-kpis'),
          createSectionNode('trend-chart', 'time-series-chart', 'sec-an-trend'),
          createSectionNode('distribution', 'bar-chart', 'sec-an-bar'),
          createSectionNode('retention-cohort', 'cohort-matrix', 'sec-an-cohort'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 21. Research Workspace
  {
    slug: '/research',
    id: 'research-workspace',
    title: 'Research Workspace',
    screenType: 'workspace-editor',
    category: 'app',
    description: 'Deep investigative research canvas with multi-source citation sidebar, hypothesis notebook, and AI rewrite tool.',
    requiredRoles: ['workspace-toolbar', 'canvas-pane', 'ai-copilot-rail'],
    recommendedSections: ['ai-copilot-sidebar', 'ai-source-citations', 'inline-ai-rewrite'],
    archetypeFit: ['intelligence-research', 'legaltech', 'scientific'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-research-workspace',
      screenNodeId: 'node-research-workspace',
      name: opt?.name ?? 'Research Workspace',
      slug: '/research',
      rootNode: {
        id: 'root-research-workspace',
        nodeType: 'layout',
        semanticRole: 'editor-canvas',
        children: [
          createSectionNode('copilot', 'ai-copilot-sidebar', 'sec-res-copilot'),
          createSectionNode('citations', 'ai-source-citations', 'sec-res-citations'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 22. Reports Library
  {
    slug: '/reports',
    id: 'reports-library',
    title: 'Reports Library',
    screenType: 'index-list',
    category: 'app',
    description: 'Catalog of generated executive briefing reports, scheduled PDF deliveries, and export archives.',
    requiredRoles: ['filter-bar', 'data-table', 'pagination'],
    recommendedSections: ['filter-bar', 'data-table', 'pagination'],
    archetypeFit: ['enterprise', 'fintech', 'analytics'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-reports-library',
      screenNodeId: 'node-reports-library',
      name: opt?.name ?? 'Reports Library',
      slug: '/reports',
      rootNode: {
        id: 'root-reports-library',
        nodeType: 'layout',
        semanticRole: 'table-canvas',
        children: [
          createSectionNode('filters', 'filter-bar', 'sec-rep-filters'),
          createSectionNode('reports-table', 'data-table', 'sec-rep-table'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 23. Report Detail
  {
    slug: '/reports/:id',
    id: 'report-detail-page',
    title: 'Report Detail',
    screenType: 'detail-entity',
    category: 'app',
    description: 'Executive document layout pairing analytical charts with narrative synthesis and export trigger.',
    requiredRoles: ['report-header', 'kpi-summary', 'chart-canvas', 'footer-signoff'],
    recommendedSections: ['metrics-scorecard', 'time-series-chart', 'stats-row-simple'],
    archetypeFit: ['analytics', 'consulting', 'financial'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-report-detail',
      screenNodeId: 'node-report-detail',
      name: opt?.name ?? 'Report Detail',
      slug: '/reports/:id',
      rootNode: {
        id: 'root-report-detail',
        nodeType: 'layout',
        semanticRole: 'report-canvas',
        children: [
          createSectionNode('scorecard', 'metrics-scorecard', 'sec-repd-scorecard'),
          createSectionNode('chart', 'time-series-chart', 'sec-repd-chart'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 24. Watchlists
  {
    slug: '/watchlists',
    id: 'watchlists-page',
    title: 'Watchlists',
    screenType: 'index-list',
    category: 'app',
    description: 'Real-time telemetry monitoring watchlist with anomaly detection pings and fast entity toggles.',
    requiredRoles: ['watchlist-header', 'filter-bar', 'data-table'],
    recommendedSections: ['filter-bar', 'data-table'],
    archetypeFit: ['fintech', 'security-ops', 'ecommerce'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-watchlists',
      screenNodeId: 'node-watchlists',
      name: opt?.name ?? 'Watchlists',
      slug: '/watchlists',
      rootNode: {
        id: 'root-watchlists',
        nodeType: 'layout',
        semanticRole: 'watchlist-canvas',
        children: [
          createSectionNode('filters', 'filter-bar', 'sec-wl-filters'),
          createSectionNode('table', 'data-table', 'sec-wl-table'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 25. Notifications
  {
    slug: '/notifications',
    id: 'notifications-page',
    title: 'Notifications',
    screenType: 'index-list',
    category: 'app',
    description: 'System event triage center with priority filters, mark-as-read batch action, and direct deep-links.',
    requiredRoles: ['filter-bar', 'activity-feed'],
    recommendedSections: ['filter-bar', 'activity-timeline'],
    archetypeFit: ['saas', 'collaboration', 'operations'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-notifications',
      screenNodeId: 'node-notifications',
      name: opt?.name ?? 'Notifications',
      slug: '/notifications',
      rootNode: {
        id: 'root-notifications',
        nodeType: 'layout',
        semanticRole: 'feed-canvas',
        children: [
          createSectionNode('filters', 'filter-bar', 'sec-notif-filters'),
          createSectionNode('feed', 'activity-timeline', 'sec-notif-feed'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 26. Messages
  {
    slug: '/messages',
    id: 'messages-page',
    title: 'Messages',
    screenType: 'messages-collaboration',
    category: 'app',
    description: 'Real-time conversational workspace with channel list, threaded discussion pane, and context file attachments.',
    requiredRoles: ['channel-rail', 'message-thread', 'composer'],
    recommendedSections: ['ai-chat-panel'],
    archetypeFit: ['collaboration', 'hr', 'marketplace'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-messages',
      screenNodeId: 'node-messages',
      name: opt?.name ?? 'Messages',
      slug: '/messages',
      rootNode: {
        id: 'root-messages',
        nodeType: 'layout',
        semanticRole: 'chat-canvas',
        children: [
          createSectionNode('chat', 'ai-chat-panel', 'sec-msg-chat'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 27. Tasks & Approvals
  {
    slug: '/tasks',
    id: 'tasks-approvals',
    title: 'Tasks & Approvals',
    screenType: 'index-list',
    category: 'app',
    description: 'Multi-party governance queue displaying pending approval requests, diff comparisons, and signoff actions.',
    requiredRoles: ['approval-queue', 'diff-viewer', 'action-controls'],
    recommendedSections: ['ai-approval-request', 'data-table'],
    archetypeFit: ['enterprise', 'fintech', 'hr'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-tasks-approvals',
      screenNodeId: 'node-tasks-approvals',
      name: opt?.name ?? 'Tasks & Approvals',
      slug: '/tasks',
      rootNode: {
        id: 'root-tasks-approvals',
        nodeType: 'layout',
        semanticRole: 'tasks-canvas',
        children: [
          createSectionNode('approval-request', 'ai-approval-request', 'sec-tsk-appr'),
          createSectionNode('queue-table', 'data-table', 'sec-tsk-table'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 28. Calendar/Schedule
  {
    slug: '/schedule',
    id: 'calendar-schedule',
    title: 'Calendar/Schedule',
    screenType: 'workspace-editor',
    category: 'app',
    description: 'Resource allocation schedule with timeline gantt, shift bookings, and availability slot pickers.',
    requiredRoles: ['date-picker', 'calendar-grid', 'sidebar-details'],
    recommendedSections: ['date-range-picker', 'data-table'],
    archetypeFit: ['hr', 'field-operations', 'healthcare'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-schedule',
      screenNodeId: 'node-schedule',
      name: opt?.name ?? 'Calendar/Schedule',
      slug: '/schedule',
      rootNode: {
        id: 'root-schedule',
        nodeType: 'layout',
        semanticRole: 'calendar-canvas',
        children: [
          createSectionNode('date-picker', 'date-range-picker', 'sec-sch-picker'),
          createSectionNode('events-table', 'data-table', 'sec-sch-table'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 29. Team Directory
  {
    slug: '/team',
    id: 'team-directory',
    title: 'Team Directory',
    screenType: 'index-list',
    category: 'app',
    description: 'Organization personnel directory with department filters, reporting hierarchy, and member cards.',
    requiredRoles: ['filter-bar', 'member-grid'],
    recommendedSections: ['filter-bar', 'data-table'],
    archetypeFit: ['hr', 'enterprise', 'saas'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-team-directory',
      screenNodeId: 'node-team-directory',
      name: opt?.name ?? 'Team Directory',
      slug: '/team',
      rootNode: {
        id: 'root-team-directory',
        nodeType: 'layout',
        semanticRole: 'team-canvas',
        children: [
          createSectionNode('filters', 'filter-bar', 'sec-team-filters'),
          createSectionNode('roster-table', 'data-table', 'sec-team-table'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 30. Profile
  {
    slug: '/profile',
    id: 'profile-page',
    title: 'Profile',
    screenType: 'settings',
    category: 'settings',
    description: 'Personal user identity page with avatar uploader, biographical info, public handles, and recent achievements.',
    requiredRoles: ['user-header', 'profile-form', 'save-button'],
    recommendedSections: ['profile-settings-form'],
    archetypeFit: ['saas', 'community', 'creator'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-profile',
      screenNodeId: 'node-profile',
      name: opt?.name ?? 'Profile',
      slug: '/profile',
      rootNode: {
        id: 'root-profile',
        nodeType: 'layout',
        semanticRole: 'profile-canvas',
        children: [
          createSectionNode('form', 'profile-settings-form', 'sec-prof-form'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 31. Organization Settings
  {
    slug: '/settings/organization',
    id: 'organization-settings',
    title: 'Organization Settings',
    screenType: 'settings',
    category: 'settings',
    description: 'Tenant organization console with company branding, domain verification, and SSO SAML config.',
    requiredRoles: ['settings-nav', 'settings-form', 'save-footer'],
    recommendedSections: ['organization-settings-form'],
    archetypeFit: ['b2b-saas', 'enterprise'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-org-settings',
      screenNodeId: 'node-org-settings',
      name: opt?.name ?? 'Organization Settings',
      slug: '/settings/organization',
      rootNode: {
        id: 'root-org-settings',
        nodeType: 'layout',
        semanticRole: 'settings-canvas',
        children: [
          createSectionNode('org-form', 'organization-settings-form', 'sec-org-form'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 32. Team & Permissions
  {
    slug: '/settings/team',
    id: 'team-permissions',
    title: 'Team & Permissions',
    screenType: 'settings',
    category: 'settings',
    description: 'Role-based access control matrix with member invitation drawer, custom role builder, and permission switches.',
    requiredRoles: ['invite-drawer', 'members-table', 'role-matrix'],
    recommendedSections: ['team-management-table'],
    archetypeFit: ['enterprise', 'saas'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-team-permissions',
      screenNodeId: 'node-team-permissions',
      name: opt?.name ?? 'Team & Permissions',
      slug: '/settings/team',
      rootNode: {
        id: 'root-team-permissions',
        nodeType: 'layout',
        semanticRole: 'settings-canvas',
        children: [
          createSectionNode('team-table', 'team-management-table', 'sec-tperm-table'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 33. Billing & Usage
  {
    slug: '/settings/billing',
    id: 'billing-usage-page',
    title: 'Billing & Usage',
    screenType: 'billing-account',
    category: 'settings',
    description: 'Subscription entitlement management with live compute usage meters, payment card editor, and invoice downloads.',
    requiredRoles: ['plan-card', 'usage-meter', 'invoices-table'],
    recommendedSections: ['billing-plan-card', 'invoices-history-table'],
    archetypeFit: ['saas', 'cloud-infrastructure', 'api'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-billing',
      screenNodeId: 'node-billing',
      name: opt?.name ?? 'Billing & Usage',
      slug: '/settings/billing',
      rootNode: {
        id: 'root-billing',
        nodeType: 'layout',
        semanticRole: 'billing-canvas',
        children: [
          createSectionNode('plan', 'billing-plan-card', 'sec-bill-plan'),
          createSectionNode('invoices', 'invoices-history-table', 'sec-bill-invoices'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 34. API & Integrations
  {
    slug: '/settings/integrations',
    id: 'api-integrations',
    title: 'API & Integrations',
    screenType: 'settings',
    category: 'settings',
    description: 'Third-party webhook endpoints, OAuth connection tokens, and secret API key creation controls.',
    requiredRoles: ['keys-table', 'webhooks-list', 'connected-apps-grid'],
    recommendedSections: ['api-keys-manager', 'connected-accounts-list'],
    archetypeFit: ['developer-tools', 'saas', 'automation'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-integrations',
      screenNodeId: 'node-integrations',
      name: opt?.name ?? 'API & Integrations',
      slug: '/settings/integrations',
      rootNode: {
        id: 'root-integrations',
        nodeType: 'layout',
        semanticRole: 'settings-canvas',
        children: [
          createSectionNode('keys', 'api-keys-manager', 'sec-int-keys'),
          createSectionNode('apps', 'connected-accounts-list', 'sec-int-apps'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 35. Admin Console
  {
    slug: '/admin',
    id: 'admin-console-page',
    title: 'Admin Console',
    screenType: 'admin',
    category: 'settings',
    description: 'Superuser management panel with tenant switcher, live audit trail log stream, and feature flag toggles.',
    requiredRoles: ['tenant-switcher', 'audit-stream', 'feature-flags'],
    recommendedSections: ['admin-overview-stats', 'audit-log-stream'],
    archetypeFit: ['enterprise', 'infrastructure'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-admin',
      screenNodeId: 'node-admin',
      name: opt?.name ?? 'Admin Console',
      slug: '/admin',
      rootNode: {
        id: 'root-admin',
        nodeType: 'layout',
        semanticRole: 'admin-canvas',
        children: [
          createSectionNode('stats', 'admin-overview-stats', 'sec-adm-stats'),
          createSectionNode('audit-stream', 'audit-log-stream', 'sec-adm-audit'),
        ],
        slots: {},
        props: {},
      },
    }),
  },

  // 36. Help & Support
  {
    slug: '/support',
    id: 'help-support-page',
    title: 'Help & Support',
    screenType: 'support',
    category: 'utility',
    description: 'Customer assistance portal with service health indicator, searchable FAQ accordions, and support ticket form.',
    requiredRoles: ['service-status', 'faq-accordion', 'ticket-form'],
    recommendedSections: ['faq-accordion-simple', 'contact-split', 'footer-minimal'],
    archetypeFit: ['saas', 'consumer', 'fintech'],
    createScreen: (opt) => ({
      id: opt?.id ?? 'screen-support',
      screenNodeId: 'node-support',
      name: opt?.name ?? 'Help & Support',
      slug: '/support',
      rootNode: {
        id: 'root-support',
        nodeType: 'layout',
        semanticRole: 'support-canvas',
        children: [
          createSectionNode('faq', 'faq-accordion-simple', 'sec-sup-faq'),
          createSectionNode('contact', 'contact-split', 'sec-sup-contact'),
          createSectionNode('footer', 'footer-minimal', 'sec-sup-footer'),
        ],
        slots: {},
        props: {},
      },
    }),
  },
];

export function getPageComposition(id: string): PageCompositionDefinition | undefined {
  return PAGE_COMPOSITIONS.find((p) => p.id === id || p.slug === id);
}

export function getAllPageCompositions(): PageCompositionDefinition[] {
  return PAGE_COMPOSITIONS;
}
