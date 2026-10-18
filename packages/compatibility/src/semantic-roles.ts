import type { ResourceManifest } from '@tessellate/schemas';

// Explicit role contracts are intentionally narrower than resource categories.
// A section is not interchangeable with every other section.
export const ROLE_RESOURCES: Record<string, readonly string[]> = {
  navigation: ['minimal-top-nav','marketing-nav-cta','collapsible-sidebar'],
  'sidebar-nav':['collapsible-sidebar'], 'settings-nav':['minimal-top-nav'],
  hero:['editorial-hero','split-product-hero'],
  'value-proposition':['feature-bento','feature-matrix'],
  'conversion-cta':['cta-minimal'], footer:['footer-product'],
  'overview-header':['entity-profile-header'], 'index-header':['entity-profile-header'], 'entity-header':['entity-profile-header'],
  'metric-cards':['dashboard-kpi-grid'], 'summary-kpis':['dashboard-kpi-grid'], 'stats-summary':['dashboard-kpi-grid'],
  'metric-kpi':['dashboard-kpi-grid'], 'activity-feed':['timeline','notification-centre'], 'activity-timeline':['timeline'],
  'data-table':['advanced-data-table'], 'invoices-table':['advanced-data-table'],
  'filter-bar':['filter-builder'], 'date-range-picker':['filter-builder'],
  'chart-canvas':['area-chart','bar-chart','donut-chart','time-series-chart'], 'data-chart':['area-chart','bar-chart','donut-chart','time-series-chart'],
  'progress-stepper':['timeline'], 'wizard-content':['kanban-board'],
  'action-controls':['button','magnetic-button'], 'action-button':['button','magnetic-button'], 'save-footer':['button','magnetic-button'], 'submit-button':['button','magnetic-button'],
  'main-content-pane':['advanced-data-table'], 'detail-tabs':['minimal-top-nav'], 'metadata-sidebar':['entity-profile-header'],
  'auth-card':['input'], 'auth-footer':['button'], 'settings-form':['input'],
  pagination:['button'], 'search-header':['input'], 'facet-rail':['filter-builder'], 'results-grid':['feature-bento'],
  'editor-toolbar':['minimal-top-nav'], 'canvas-viewport':['kanban-board'], 'inspector-panel':['entity-profile-header'],
  'current-plan-card':['pricing-three-tier'], 'usage-meter':['bar-chart'],
  'order-summary':['advanced-data-table'], 'payment-fields':['input'],
  'docs-sidebar':['minimal-top-nav'], 'prose-article':['feature-matrix'], 'on-this-page-toc':['minimal-top-nav'],
};

export function resourceMatchesRole(resource: ResourceManifest, role: string): boolean {
  const allowed = ROLE_RESOURCES[role.toLowerCase()];
  if (allowed) return allowed.includes(resource.slug);
  return resource.roles.some(value=>value.toLowerCase()===role.toLowerCase()) || resource.tags?.some(value=>value.toLowerCase()===role.toLowerCase()) === true;
}

export function runtimeVariant(resource: ResourceManifest, requested?: string): string {
  // Manifest display names are not component variant identifiers.
  const variants = resource.variants.map(v=>v.id || v.name.toLowerCase());
  const normalized = requested?.toLowerCase();
  if (normalized && variants.includes(normalized)) return normalized;
  return variants[0] ?? 'quiet';
}
