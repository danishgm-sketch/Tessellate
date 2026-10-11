export const GOLD_40_SLUGS = [
  // 5 Primitives
  'button',
  'input',
  'select',
  'dialog',
  'badge',

  // 5 Navigation & Shells
  'collapsible-sidebar',
  'three-pane-app-shell',
  'minimal-top-nav',
  'two-pane-master-detail-shell',
  'marketing-nav-cta',

  // 10 Marketing Sections
  'editorial-hero',
  'feature-bento',
  'pricing-three-tier',
  'testimonial-grid',
  'split-product-hero',
  'feature-matrix',
  'cta-minimal',
  'faq-accordion',
  'logo-cloud-minimal',
  'footer-product',

  // 8 Application Blocks
  'advanced-data-table',
  'kanban-board',
  'timeline',
  'dashboard-kpi-grid',
  'entity-profile-header',
  'empty-workspace',
  'filter-builder',
  'notification-centre',

  // 4 Data Visualisations
  'time-series-chart',
  'bar-chart',
  'donut-chart',
  'area-chart',

  // 3 AI Patterns
  'ai-prompt-composer',
  'ai-research-answer',
  'ai-suggested-actions',

  // 3 Motion & Effects
  'magnetic-button',
  'fade-up-reveal',
  'subtle-grid-field',

  // 2 State Patterns
  'dashboard-skeleton',
  'error-state',
] as const;

export type GoldSlug = (typeof GOLD_40_SLUGS)[number];

export function isGoldResource(slug: string): boolean {
  return (GOLD_40_SLUGS as readonly string[]).includes(slug);
}
