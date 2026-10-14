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
    roleOrdering: ['navigation', 'hero', 'value-proposition', 'conversion-cta', 'footer', 'trust-proof', 'product-demo', 'feature-grid', 'pricing-table', 'faq-accordion'],
  },

  // 2. Authentication
  authentication: {
    id: 'authentication',
    name: 'Authentication',
    description: 'Sign in, account creation, OAuth provider routing, and recovery.',
    defaultGroup: 'auth',
    defaultSlug: '/sign-in',
    defaultVisibility: 'hidden',
    requiredRoles: ['auth-card'],
    optionalRoles: ['brand-panel'],
    roleOrdering: ['auth-card', 'brand-panel'],
  },

  // 3. Onboarding
  onboarding: {
    id: 'onboarding',
    name: 'Onboarding Flow',
    description: 'Role-based configuration, workspace creation, and first-run milestones.',
    defaultGroup: 'auth',
    defaultSlug: '/onboarding',
    defaultVisibility: 'hidden',
    requiredRoles: ['wizard-content'],
    optionalRoles: [],
    roleOrdering: ['wizard-content'],
  },

  // 4. Dashboard
  dashboard: {
    id: 'dashboard',
    name: 'Application Overview Dashboard',
    description: 'Operational health scorecard, real-time KPI metrics, and immediate priority actions.',
    defaultGroup: 'app',
    defaultSlug: '/overview',
    defaultVisibility: 'primary',
    requiredRoles: ['page-header', 'metric-cards', 'activity-feed'],
    optionalRoles: ['quick-action-bar', 'data-table'],
    roleOrdering: ['page-header', 'metric-cards', 'activity-feed', 'quick-action-bar', 'data-table'],
  },

  // 5. Index / List
  'index-list': {
    id: 'index-list',
    name: 'Entity Index / Collection',
    description: 'Faceted multi-column data table, pagination, search filter rail, and bulk actions.',
    defaultGroup: 'app',
    defaultSlug: '/items',
    defaultVisibility: 'primary',
    requiredRoles: ['page-header', 'filter-bar', 'data-table'],
    optionalRoles: ['empty-state'],
    roleOrdering: ['page-header', 'filter-bar', 'data-table', 'empty-state'],
  },

  // 6. Detail / Entity
  'detail-entity': {
    id: 'detail-entity',
    name: 'Entity Detail / Profile',
    description: 'Single record deep view with tabbed history, metadata sidebar, and lifecycle actions.',
    defaultGroup: 'app',
    defaultSlug: '/items/:id',
    defaultVisibility: 'secondary',
    requiredRoles: ['entity-header', 'main-content-pane'],
    optionalRoles: ['metadata-sidebar', 'activity-timeline', 'detail-tabs'],
    roleOrdering: ['entity-header', 'main-content-pane', 'metadata-sidebar', 'activity-timeline', 'detail-tabs'],
  },

  // 7. Search / Explore
  'search-explore': {
    id: 'search-explore',
    name: 'Search & Explore',
    description: 'Faceted catalog search, natural language queries, filter rail, and instant results.',
    defaultGroup: 'app',
    defaultSlug: '/explore',
    defaultVisibility: 'primary',
    requiredRoles: ['search-header', 'results-grid'],
    optionalRoles: ['empty-state'],
    roleOrdering: ['search-header', 'results-grid', 'empty-state'],
  },

  // 8. Workspace / Editor
  'workspace-editor': {
    id: 'workspace-editor',
    name: 'Workspace / Editor',
    description: 'Full-viewport authoring canvas, multi-pane controls, timeline, and direct manipulation.',
    defaultGroup: 'app',
    defaultSlug: '/editor',
    defaultVisibility: 'primary',
    requiredRoles: ['page-header', 'editor-surface'],
    optionalRoles: ['inspector-panel', 'version-history'],
    roleOrdering: ['page-header', 'editor-surface', 'inspector-panel', 'version-history'],
  },

  // 9. Analytics / Reporting
  'analytics-reporting': {
    id: 'analytics-reporting',
    name: 'Analytics & Reporting',
    description: 'Interactive time-series charts, cohort retention curves, and pivot tables.',
    defaultGroup: 'app',
    defaultSlug: '/analytics',
    defaultVisibility: 'primary',
    requiredRoles: ['page-header', 'summary-kpis', 'chart-canvas'],
    optionalRoles: ['cohort-table'],
    roleOrdering: ['page-header', 'summary-kpis', 'chart-canvas', 'cohort-table'],
  },

  // 10. Messages / Collaboration
  'messages-collaboration': {
    id: 'messages-collaboration',
    name: 'Messages & Collaboration',
    description: 'Conversational channels, direct message threads, mention feeds, and presence indicators.',
    defaultGroup: 'app',
    defaultSlug: '/messages',
    defaultVisibility: 'secondary',
    requiredRoles: ['channels-rail', 'message-thread'],
    optionalRoles: [],
    roleOrdering: ['channels-rail', 'message-thread'],
  },

  // 11. Settings
  settings: {
    id: 'settings',
    name: 'Settings & Preferences',
    description: 'User profile, notification preferences, appearance toggles, and security keys.',
    defaultGroup: 'settings',
    defaultSlug: '/settings',
    defaultVisibility: 'secondary',
    requiredRoles: ['settings-nav', 'settings-form'],
    optionalRoles: ['team-settings'],
    roleOrdering: ['settings-nav', 'settings-form', 'team-settings'],
  },

  // 12. Billing & Account
  'billing-account': {
    id: 'billing-account',
    name: 'Billing & Usage',
    description: 'Plan tier upgrades, invoice payment history, usage metering, and card management.',
    defaultGroup: 'settings',
    defaultSlug: '/billing',
    defaultVisibility: 'secondary',
    requiredRoles: ['current-plan-card', 'usage-meter'],
    optionalRoles: ['invoices-table'],
    roleOrdering: ['current-plan-card', 'usage-meter', 'invoices-table'],
  },

  // 13. Checkout / Transaction
  'checkout-transaction': {
    id: 'checkout-transaction',
    name: 'Checkout & Transaction',
    description: 'Payment collection, address validation, order breakdown, and 2FA verification.',
    defaultGroup: 'utility',
    defaultSlug: '/checkout',
    defaultVisibility: 'hidden',
    requiredRoles: ['order-summary', 'payment-form'],
    optionalRoles: ['security-trust-badges'],
    roleOrdering: ['order-summary', 'payment-form', 'security-trust-badges'],
  },

  // 14. Admin
  admin: {
    id: 'admin',
    name: 'Admin Operations',
    description: 'System tenants, audit logs, feature flags, and administrative kill-switches.',
    defaultGroup: 'settings',
    defaultSlug: '/admin',
    defaultVisibility: 'hidden',
    requiredRoles: ['audit-log-stream', 'admin-table'],
    optionalRoles: ['tenant-switcher'],
    roleOrdering: ['audit-log-stream', 'admin-table', 'tenant-switcher'],
  },

  // 15. Documentation
  documentation: {
    id: 'documentation',
    name: 'Documentation & API Reference',
    description: 'Article guides, interactive endpoint playgrounds, code blocks, and search.',
    defaultGroup: 'marketing',
    defaultSlug: '/docs',
    defaultVisibility: 'primary',
    requiredRoles: ['docs-sidebar', 'prose-article'],
    optionalRoles: [],
    roleOrdering: ['docs-sidebar', 'prose-article'],
  },

  // 16. Support
  support: {
    id: 'support',
    name: 'Help & Support',
    description: 'Knowledge base search, ticket submission, status tracker, and contact methods.',
    defaultGroup: 'utility',
    defaultSlug: '/support',
    defaultVisibility: 'secondary',
    requiredRoles: ['faq-accordion', 'contact-form'],
    optionalRoles: ['system-status-indicator'],
    roleOrdering: ['faq-accordion', 'contact-form', 'system-status-indicator'],
  },
  // Phase 29: screen types planned by the brief model (D-034a).
  'calendar-schedule': {
    id: 'calendar-schedule',
    name: 'Calendar / Schedule',
    description: 'Day, week and month views of scheduled items.',
    defaultGroup: 'app',
    defaultSlug: '/calendar',
    defaultVisibility: 'primary',
    requiredRoles: ['page-header', 'calendar-view'],
    optionalRoles: ['upcoming-list'],
    roleOrdering: ['page-header', 'calendar-view', 'upcoming-list'],
  },
  'booking-flow': {
    id: 'booking-flow',
    name: 'Booking Flow',
    description: 'Choose a time, give details and confirm a booking.',
    defaultGroup: 'utility',
    defaultSlug: '/book',
    defaultVisibility: 'primary',
    requiredRoles: ['booking-slot-picker', 'booking-details-form'],
    optionalRoles: ['confirmation-state'],
    roleOrdering: ['booking-slot-picker', 'booking-details-form', 'confirmation-state'],
  },
  'board-kanban': {
    id: 'board-kanban',
    name: 'Board',
    description: 'Move records through stages.',
    defaultGroup: 'app',
    defaultSlug: '/board',
    defaultVisibility: 'primary',
    requiredRoles: ['page-header', 'board-view'],
    optionalRoles: ['filter-bar'],
    roleOrdering: ['page-header', 'filter-bar', 'board-view'],
  },
  'map-explore': {
    id: 'map-explore',
    name: 'Map',
    description: 'Find records by location.',
    defaultGroup: 'app',
    defaultSlug: '/map',
    defaultVisibility: 'primary',
    requiredRoles: ['map-view'],
    optionalRoles: ['results-list'],
    roleOrdering: ['map-view', 'results-list'],
  },
  'form-flow': {
    id: 'form-flow',
    name: 'Form',
    description: 'Create or submit a record with validated fields.',
    defaultGroup: 'app',
    defaultSlug: '/new',
    defaultVisibility: 'secondary',
    requiredRoles: ['entity-form'],
    optionalRoles: [],
    roleOrdering: ['entity-form'],
  },
};

/**
 * Retrieves the screen class grammar for a screen type.
 */
export function getScreenClassGrammar(screenType: string): ScreenClassGrammar {
  return SCREEN_CLASS_GRAMMARS[screenType] ?? SCREEN_CLASS_GRAMMARS['dashboard']!;
}

/**
 * Retrieves every screen class grammar.
 */
export function getAllScreenClassGrammars(): Record<string, ScreenClassGrammar> {
  return SCREEN_CLASS_GRAMMARS;
}
