import type { ResourceManifest } from '@tessellate/schemas';

/**
 * Canonical section roles (Phase 29). Each role names what a section of a screen must do, and lists exactly
 * which catalogue resources can do it — by slug, or by an exact resource role word. There is no substring
 * matching, category bypass or "any resource" fallback: a role with no accepted resource stays an explicit
 * gap that the user fills in the Workbench, instead of being filled with something unrelated.
 */
export interface CanonicalRole {
  /** Plain-language name shown on gap cards and in the Workbench. */
  label: string;
  /** Resource slugs that fulfil this role. */
  slugs?: readonly string[];
  /** Exact resource role words that fulfil this role. */
  resourceRoles?: readonly string[];
}

const TABLES = ['advanced-data-table', 'compact-data-table', 'expandable-data-table', 'grouped-data-table'] as const;
const METRICS = ['dashboard-kpi-grid', 'dashboard-kpi-strip', 'kpi-delta-card', 'executive-summary-panel'] as const;

export const CANONICAL_ROLES: Record<string, CanonicalRole> = {
  // Shell
  navigation: {
    label: 'Site navigation',
    slugs: ['marketing-nav-cta', 'centered-top-nav', 'minimal-top-nav', 'transparent-solid-nav', 'floating-nav', 'mega-nav'],
  },
  'app-navigation': {
    label: 'App navigation',
    slugs: ['app-sidebar-expanded', 'app-sidebar-compact', 'collapsible-sidebar', 'dual-rail-nav', 'icon-rail', 'tab-workspace-nav', 'command-first-nav'],
  },
  footer: { label: 'Footer', resourceRoles: ['footer'] },

  // Marketing
  hero: { label: 'Hero', resourceRoles: ['hero'] },
  'value-proposition': { label: 'Value proposition', resourceRoles: ['features'] },
  'feature-grid': { label: 'Features', resourceRoles: ['features'] },
  'trust-proof': { label: 'Social proof', resourceRoles: ['trust'] },
  'product-demo': { label: 'Product demo', slugs: ['feature-with-live-demo', 'how-it-works-interactive', 'how-it-works-steps', 'process-diagram'] },
  'pricing-table': { label: 'Pricing', resourceRoles: ['pricing'] },
  'conversion-cta': { label: 'Call to action', resourceRoles: ['cta'] },
  'faq-accordion': { label: 'FAQ', resourceRoles: ['faq'] },

  // Authentication and onboarding
  'auth-card': { label: 'Sign-in form' },
  'brand-panel': { label: 'Brand panel', slugs: ['editorial-display-stack', 'soft-mesh-gradient'] },
  'wizard-content': { label: 'Onboarding steps', slugs: ['onboarding-wizard', 'onboarding-checklist', 'onboarding-role-select'] },

  // Application
  'page-header': { label: 'Page header', slugs: ['breadcrumb-header'] },
  'metric-cards': { label: 'Key numbers', slugs: METRICS },
  'activity-feed': { label: 'Recent activity', slugs: ['activity-feed', 'notification-centre', 'recent-items'] },
  'quick-action-bar': { label: 'Quick actions', slugs: ['quick-actions-panel'] },
  'data-table': { label: 'Records table', slugs: [...TABLES, 'entity-list'] },
  'filter-bar': { label: 'Filters', slugs: ['filter-builder', 'saved-views', 'entity-search'] },
  pagination: { label: 'Pagination', slugs: ['pagination'] },
  'empty-state': { label: 'Empty state', slugs: ['empty-collection-state', 'empty-search-state', 'empty-dashboard-state'] },
  'entity-header': { label: 'Record header', slugs: ['entity-profile-header'] },
  'detail-tabs': { label: 'Record tabs', slugs: ['tabs'] },
  'main-content-pane': { label: 'Record details', slugs: ['entity-overview', 'document-detail', 'task-detail'] },
  'metadata-sidebar': { label: 'Record metadata', slugs: ['metadata-panel', 'relationship-panel'] },
  'activity-timeline': { label: 'History', slugs: ['timeline', 'version-history', 'audit-log'] },
  'search-header': { label: 'Search', slugs: ['entity-search', 'search-first-header'] },
  'results-grid': { label: 'Search results', slugs: ['faceted-search-results', 'global-search-results'] },
  'editor-surface': { label: 'Editor' },
  'inspector-panel': { label: 'Inspector', slugs: ['metadata-panel', 'context-rail'] },
  'version-history': { label: 'Version history', slugs: ['version-history'] },
  'summary-kpis': { label: 'Summary numbers', slugs: METRICS },
  'chart-canvas': { label: 'Chart', resourceRoles: ['chart'] },
  'cohort-table': { label: 'Cohort table', slugs: ['cohort-matrix'] },
  'channels-rail': { label: 'Conversations', slugs: ['conversation-list'] },
  'message-thread': { label: 'Message thread', slugs: ['messaging-thread'] },
  'calendar-view': { label: 'Calendar', slugs: ['calendar-week', 'calendar-month', 'schedule-agenda'] },
  'upcoming-list': { label: 'Upcoming', slugs: ['schedule-agenda', 'entity-list'] },
  'booking-slot-picker': { label: 'Time-slot picker' },
  'booking-details-form': { label: 'Booking details form' },
  'confirmation-state': { label: 'Confirmation', slugs: ['success-state'] },
  'board-view': { label: 'Board', slugs: ['kanban-board'] },
  'map-view': { label: 'Map', slugs: ['geographic-map'] },
  'results-list': { label: 'Results list', slugs: ['entity-list', 'compact-data-table'] },
  'entity-form': { label: 'Record form' },

  // Settings, billing and admin
  'settings-nav': { label: 'Settings navigation', slugs: ['settings-navigation'] },
  'settings-form': { label: 'Settings form', slugs: ['profile-settings', 'organization-settings'] },
  'team-settings': { label: 'Team settings', slugs: ['team-management', 'role-permissions'] },
  'current-plan-card': { label: 'Current plan', slugs: ['billing-overview'] },
  'usage-meter': { label: 'Usage', slugs: ['usage-overview'] },
  'invoices-table': { label: 'Invoices', slugs: TABLES },
  'order-summary': { label: 'Order summary' },
  'payment-form': { label: 'Payment form' },
  'security-trust-badges': { label: 'Trust badges', slugs: ['trust-badges-strip'] },
  'tenant-switcher': { label: 'Workspace switcher', slugs: ['workspace-switcher', 'project-switcher'] },
  'audit-log-stream': { label: 'Audit log', slugs: ['audit-log'] },
  'admin-table': { label: 'Admin records', slugs: TABLES },

  // Documentation and support
  'docs-sidebar': { label: 'Docs navigation' },
  'prose-article': { label: 'Article' },
  'contact-form': { label: 'Contact form' },
  'system-status-indicator': { label: 'System status', slugs: ['status-overview'] },
};

export function getCanonicalRole(role: string): CanonicalRole | undefined {
  return CANONICAL_ROLES[role];
}

/** True when the resource is listed as able to fulfil the role. Unknown roles accept nothing. */
export function resourceFulfilsRole(role: string, resource: Pick<ResourceManifest, 'slug' | 'roles'>): boolean {
  const def = CANONICAL_ROLES[role];
  if (!def) return false;
  if (def.slugs?.includes(resource.slug)) return true;
  return (resource.roles ?? []).some((r) => def.resourceRoles?.includes(r));
}

export function roleLabel(role: string): string {
  return CANONICAL_ROLES[role]?.label ?? role.replace(/-/g, ' ');
}
