export interface ScreenClassGrammar {
  id: string;
  name: string;
  description: string;
  defaultGroup: 'marketing' | 'app' | 'auth' | 'settings' | 'utility';
  defaultSlug: string;
  defaultVisibility: 'primary' | 'secondary' | 'hidden';
  requiredRoles: string[];
  optionalRoles: string[];
  roleOrdering: string[];
}

export const SCREEN_CLASS_GRAMMARS: Record<string, ScreenClassGrammar> = {
  // 1. Marketing
  marketing: {
    id: 'marketing',
    name: 'Marketing Landing',
    description: 'Public storytelling, brand credibility, feature proof, and conversion funnel.',
    defaultGroup: 'marketing',
    defaultSlug: '/',
    defaultVisibility: 'primary',
    requiredRoles: ['navigation', 'hero', 'value-proposition', 'conversion-cta', 'footer'],
    optionalRoles: ['trust-proof', 'product-demo', 'feature-grid', 'pricing-table', 'faq-accordion'],
    roleOrdering: [
      'navigation',
      'hero',
      'trust-proof',
      'value-proposition',
      'product-demo',
      'feature-grid',
      'pricing-table',
      'conversion-cta',
      'faq-accordion',
      'footer',
    ],
  },

  // 2. Authentication
  authentication: {
    id: 'authentication',
    name: 'Authentication',
    description: 'Sign in, account creation, OAuth provider routing, and recovery.',
    defaultGroup: 'auth',
    defaultSlug: '/sign-in',
    defaultVisibility: 'hidden',
    requiredRoles: ['auth-card', 'auth-footer'],
    optionalRoles: ['social-oauth-buttons', 'passkey-option', 'terms-disclaimer', 'brand-panel'],
    roleOrdering: ['brand-panel', 'auth-card', 'social-oauth-buttons', 'terms-disclaimer', 'auth-footer'],
  },

  // 3. Onboarding
  onboarding: {
    id: 'onboarding',
    name: 'Onboarding Flow',
    description: 'Role-based configuration, workspace creation, and first-run milestones.',
    defaultGroup: 'auth',
    defaultSlug: '/onboarding',
    defaultVisibility: 'hidden',
    requiredRoles: ['progress-stepper', 'wizard-content', 'action-controls'],
    optionalRoles: ['workspace-picker', 'team-invite-slot', 'sample-data-toggle'],
    roleOrdering: ['progress-stepper', 'wizard-content', 'workspace-picker', 'action-controls'],
  },

  // 4. Dashboard
  dashboard: {
    id: 'dashboard',
    name: 'Application Overview Dashboard',
    description: 'Operational health scorecard, real-time KPI metrics, and immediate priority actions.',
    defaultGroup: 'app',
    defaultSlug: '/overview',
    defaultVisibility: 'primary',
    requiredRoles: ['overview-header', 'metric-cards', 'activity-feed'],
    optionalRoles: ['quick-action-bar', 'data-table', 'alert-banner', 'insight-rail'],
    roleOrdering: ['alert-banner', 'overview-header', 'quick-action-bar', 'metric-cards', 'data-table', 'activity-feed', 'insight-rail'],
  },

  // 5. Index / List
  'index-list': {
    id: 'index-list',
    name: 'Entity Index / Collection',
    description: 'Faceted multi-column data table, pagination, search filter rail, and bulk actions.',
    defaultGroup: 'app',
    defaultSlug: '/items',
    defaultVisibility: 'primary',
    requiredRoles: ['index-header', 'filter-bar', 'data-table', 'pagination'],
    optionalRoles: ['bulk-action-bar', 'view-mode-toggle', 'stats-summary'],
    roleOrdering: ['index-header', 'stats-summary', 'filter-bar', 'bulk-action-bar', 'data-table', 'pagination'],
  },

  // 6. Detail / Entity
  'detail-entity': {
    id: 'detail-entity',
    name: 'Entity Detail / Profile',
    description: 'Single record deep view with tabbed history, metadata sidebar, and lifecycle actions.',
    defaultGroup: 'app',
    defaultSlug: '/items/:id',
    defaultVisibility: 'secondary',
    requiredRoles: ['entity-header', 'detail-tabs', 'main-content-pane', 'metadata-sidebar'],
    optionalRoles: ['activity-timeline', 'related-items-carousel', 'danger-zone'],
    roleOrdering: ['entity-header', 'detail-tabs', 'main-content-pane', 'metadata-sidebar', 'activity-timeline', 'danger-zone'],
  },

  // 7. Search / Explore
  'search-explore': {
    id: 'search-explore',
    name: 'Search & Explore',
    description: 'Faceted catalog search, natural language queries, filter rail, and instant results.',
    defaultGroup: 'app',
    defaultSlug: '/explore',
    defaultVisibility: 'primary',
    requiredRoles: ['search-header', 'facet-rail', 'results-grid'],
    optionalRoles: ['recent-searches', 'active-filter-chips', 'empty-state'],
    roleOrdering: ['search-header', 'recent-searches', 'active-filter-chips', 'facet-rail', 'results-grid'],
  },

  // 8. Workspace / Editor
  'workspace-editor': {
    id: 'workspace-editor',
    name: 'Workspace / Editor',
    description: 'Full-viewport authoring canvas, multi-pane controls, timeline, and direct manipulation.',
    defaultGroup: 'app',
    defaultSlug: '/editor',
    defaultVisibility: 'primary',
    requiredRoles: ['editor-toolbar', 'canvas-viewport', 'inspector-panel'],
    optionalRoles: ['layers-tree', 'version-history', 'status-bar'],
    roleOrdering: ['editor-toolbar', 'layers-tree', 'canvas-viewport', 'inspector-panel', 'status-bar'],
  },

  // 9. Analytics / Reporting
  'analytics-reporting': {
    id: 'analytics-reporting',
    name: 'Analytics & Reporting',
    description: 'Interactive time-series charts, cohort retention curves, and pivot tables.',
    defaultGroup: 'app',
    defaultSlug: '/analytics',
    defaultVisibility: 'primary',
    requiredRoles: ['date-range-picker', 'chart-canvas', 'summary-kpis'],
    optionalRoles: ['dimension-slicer', 'cohort-table', 'export-drawer'],
    roleOrdering: ['date-range-picker', 'summary-kpis', 'chart-canvas', 'dimension-slicer', 'cohort-table'],
  },

  // 10. Messages / Collaboration
  'messages-collaboration': {
    id: 'messages-collaboration',
    name: 'Messages & Collaboration',
    description: 'Conversational channels, direct message threads, mention feeds, and presence indicators.',
    defaultGroup: 'app',
    defaultSlug: '/messages',
    defaultVisibility: 'secondary',
    requiredRoles: ['channels-rail', 'message-thread', 'message-composer'],
    optionalRoles: ['thread-details', 'file-attachment-shelf', 'presence-avatars'],
    roleOrdering: ['channels-rail', 'message-thread', 'message-composer', 'thread-details'],
  },

  // 11. Settings
  settings: {
    id: 'settings',
    name: 'Settings & Preferences',
    description: 'User profile, notification preferences, appearance toggles, and security keys.',
    defaultGroup: 'settings',
    defaultSlug: '/settings',
    defaultVisibility: 'secondary',
    requiredRoles: ['settings-nav', 'settings-form', 'save-footer'],
    optionalRoles: ['avatar-uploader', '2fa-toggle', 'danger-zone'],
    roleOrdering: ['settings-nav', 'settings-form', 'save-footer', 'danger-zone'],
  },

  // 12. Billing & Account
  'billing-account': {
    id: 'billing-account',
    name: 'Billing & Usage',
    description: 'Plan tier upgrades, invoice payment history, usage metering, and card management.',
    defaultGroup: 'settings',
    defaultSlug: '/billing',
    defaultVisibility: 'secondary',
    requiredRoles: ['current-plan-card', 'usage-meter', 'invoices-table'],
    optionalRoles: ['payment-method-card', 'seat-manager', 'tax-id-form'],
    roleOrdering: ['current-plan-card', 'usage-meter', 'payment-method-card', 'invoices-table'],
  },

  // 13. Checkout / Transaction
  'checkout-transaction': {
    id: 'checkout-transaction',
    name: 'Checkout & Transaction',
    description: 'Payment collection, address validation, order breakdown, and 2FA verification.',
    defaultGroup: 'utility',
    defaultSlug: '/checkout',
    defaultVisibility: 'hidden',
    requiredRoles: ['order-summary', 'payment-fields', 'submit-button'],
    optionalRoles: ['coupon-input', 'shipping-selector', 'security-trust-badges'],
    roleOrdering: ['order-summary', 'shipping-selector', 'payment-fields', 'coupon-input', 'submit-button'],
  },

  // 14. Admin
  admin: {
    id: 'admin',
    name: 'Admin Operations',
    description: 'System tenants, audit logs, feature flags, and administrative kill-switches.',
    defaultGroup: 'settings',
    defaultSlug: '/admin',
    defaultVisibility: 'hidden',
    requiredRoles: ['tenant-switcher', 'audit-log-stream', 'feature-flags-table'],
    optionalRoles: ['impersonation-bar', 'system-health-telemetry'],
    roleOrdering: ['tenant-switcher', 'system-health-telemetry', 'feature-flags-table', 'audit-log-stream'],
  },

  // 15. Documentation
  documentation: {
    id: 'documentation',
    name: 'Documentation & API Reference',
    description: 'Article guides, interactive endpoint playgrounds, code blocks, and search.',
    defaultGroup: 'marketing',
    defaultSlug: '/docs',
    defaultVisibility: 'primary',
    requiredRoles: ['docs-sidebar', 'prose-article', 'on-this-page-toc'],
    optionalRoles: ['code-playground', 'feedback-widget', 'version-dropdown'],
    roleOrdering: ['docs-sidebar', 'prose-article', 'on-this-page-toc', 'code-playground'],
  },

  // 16. Support
  support: {
    id: 'support',
    name: 'Help & Support',
    description: 'Knowledge base search, ticket submission, status tracker, and contact methods.',
    defaultGroup: 'utility',
    defaultSlug: '/support',
    defaultVisibility: 'secondary',
    requiredRoles: ['faq-accordion', 'contact-form', 'system-status-indicator'],
    optionalRoles: ['chat-bot-island', 'popular-articles-list'],
    roleOrdering: ['system-status-indicator', 'faq-accordion', 'popular-articles-list', 'contact-form'],
  },
};

/**
 * Retrieves the screen class grammar for a screen type.
 */
export function getScreenClassGrammar(screenType: string): ScreenClassGrammar {
  return SCREEN_CLASS_GRAMMARS[screenType] ?? SCREEN_CLASS_GRAMMARS['dashboard']!;
}

/**
 * Retrieves all 16 screen class grammars.
 */
export function getAllScreenClassGrammars(): Record<string, ScreenClassGrammar> {
  return SCREEN_CLASS_GRAMMARS;
}
