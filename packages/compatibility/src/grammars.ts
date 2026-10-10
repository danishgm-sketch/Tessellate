import type { ResponsiveStrategy } from '@tessellate/schemas';

export type NavigationStyle =
  | 'sidebar'
  | 'top-nav'
  | 'header-minimal'
  | 'rail'
  | 'command-palette'
  | 'bottom-tabs'
  | 'none';

export interface ExclusivityRule {
  roleA: string;
  roleB: string;
}

export interface CompositionGrammar {
  id: string;
  name: string;
  description: string;
  screenClass: string;
  layoutFamily: string;
  defaultNavigationModel: NavigationStyle;
  requiredRoles: string[];
  allowedRoles: string[];
  roleOrdering: string[];
  exclusivityRules?: ExclusivityRule[];
  responsiveStrategies: ResponsiveStrategy[];
  candidateCategories: string[];
  archetypeFit: string[];
}

export const COMPOSITION_GRAMMARS: Record<string, CompositionGrammar> = {
  // 1. Editorial Marketing Narrative
  'editorial-marketing-narrative': {
    id: 'editorial-marketing-narrative',
    name: 'Editorial Marketing Narrative',
    description: 'Long-form typographic storytelling with intentional whitespace, narrative chapter headings, and visual essays.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'narrative-vertical',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['navigation', 'hero', 'narrative-chapter', 'visual-break', 'conversion', 'footer'],
    allowedRoles: ['navigation', 'hero', 'narrative-chapter', 'quote-callout', 'visual-break', 'author-note', 'conversion', 'footer'],
    roleOrdering: ['navigation', 'hero', 'narrative-chapter', 'visual-break', 'quote-callout', 'conversion', 'footer'],
    exclusivityRules: [{ roleA: 'quote-callout', roleB: 'author-note' }],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['section', 'block', 'text', 'card'],
    archetypeFit: ['creative-portfolio', 'content-publishing', 'luxury-showcase'],
  },

  // 2. Product Proof Marketing
  'product-proof-marketing': {
    id: 'product-proof-marketing',
    name: 'Product Proof Marketing',
    description: 'Evidence-first marketing landing demonstrating UI fidelity, interactive product demo frames, and validated feature benchmarks.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'feature-grid',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['navigation', 'hero', 'product-demo', 'feature-breakdown', 'social-proof', 'conversion', 'footer'],
    allowedRoles: ['navigation', 'hero', 'product-demo', 'feature-breakdown', 'interactive-widget', 'social-proof', 'pricing-summary', 'conversion', 'footer'],
    roleOrdering: ['navigation', 'hero', 'product-demo', 'feature-breakdown', 'social-proof', 'conversion', 'footer'],
    responsiveStrategies: ['stack', 'collapse', 'transform'],
    candidateCategories: ['section', 'card', 'button', 'badge'],
    archetypeFit: ['saas', 'developer-tools', 'productivity'],
  },

  // 3. Conversion SaaS Landing
  'conversion-saas-landing': {
    id: 'conversion-saas-landing',
    name: 'Conversion SaaS Landing',
    description: 'High-velocity conversion landing with sticky CTAs, comparison matrix, ROI calculator, and customer success testimonials.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'split-hero-conversion',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['navigation', 'hero-signup', 'social-proof-bar', 'value-prop-cards', 'pricing-tiers', 'faq', 'final-cta', 'footer'],
    allowedRoles: ['navigation', 'hero-signup', 'social-proof-bar', 'value-prop-cards', 'calculator', 'pricing-tiers', 'faq', 'final-cta', 'footer'],
    roleOrdering: ['navigation', 'hero-signup', 'social-proof-bar', 'value-prop-cards', 'pricing-tiers', 'faq', 'final-cta', 'footer'],
    responsiveStrategies: ['stack', 'compress', 'omit-nonessential'],
    candidateCategories: ['section', 'card', 'button', 'input'],
    archetypeFit: ['saas', 'fintech', 'productivity'],
  },

  // 4. Developer Code-First Landing
  'developer-code-first-landing': {
    id: 'developer-code-first-landing',
    name: 'Developer Code-First Landing',
    description: 'Terminal-centric developer launch page with syntax-highlighted code snippets, CLI quickstart, architecture diagram, and docs link.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'terminal-split',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['navigation', 'terminal-hero', 'quickstart-tabs', 'architecture-diagram', 'benchmarks', 'community-cta', 'footer'],
    allowedRoles: ['navigation', 'terminal-hero', 'quickstart-tabs', 'architecture-diagram', 'code-samples', 'benchmarks', 'sdk-badges', 'community-cta', 'footer'],
    roleOrdering: ['navigation', 'terminal-hero', 'quickstart-tabs', 'architecture-diagram', 'benchmarks', 'community-cta', 'footer'],
    responsiveStrategies: ['collapse', 'stack', 'substitute'],
    candidateCategories: ['section', 'block', 'badge', 'button'],
    archetypeFit: ['developer-tools', 'ai', 'data-platform'],
  },

  // 5. Enterprise Trust Landing
  'enterprise-trust-landing': {
    id: 'enterprise-trust-landing',
    name: 'Enterprise Trust Landing',
    description: 'Rigorous enterprise presentation emphasizing SOC2/ISO compliance badges, security whitepapers, scale metrics, and SLA commitments.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'institutional-authority',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['navigation', 'authority-hero', 'compliance-ribbon', 'scale-metrics', 'enterprise-security', 'customer-case-studies', 'contact-sales', 'footer'],
    allowedRoles: ['navigation', 'authority-hero', 'compliance-ribbon', 'scale-metrics', 'enterprise-security', 'deployment-options', 'customer-case-studies', 'contact-sales', 'footer'],
    roleOrdering: ['navigation', 'authority-hero', 'compliance-ribbon', 'scale-metrics', 'enterprise-security', 'customer-case-studies', 'contact-sales', 'footer'],
    responsiveStrategies: ['compress', 'stack'],
    candidateCategories: ['section', 'card', 'badge'],
    archetypeFit: ['fintech', 'healthcare', 'governance'],
  },

  // 6. Luxury Storytelling Landing
  'luxury-storytelling-landing': {
    id: 'luxury-storytelling-landing',
    name: 'Luxury Storytelling Landing',
    description: 'Expansive minimal luxury landing with immersive full-bleed imagery, refined serif typography, and understated callouts.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'full-bleed-story',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['navigation', 'curated-hero', 'craftsmanship-statement', 'collection-carousel', 'heritage-story', 'exclusive-invitation', 'footer'],
    allowedRoles: ['navigation', 'curated-hero', 'craftsmanship-statement', 'collection-carousel', 'material-detail', 'heritage-story', 'exclusive-invitation', 'footer'],
    roleOrdering: ['navigation', 'curated-hero', 'craftsmanship-statement', 'collection-carousel', 'heritage-story', 'exclusive-invitation', 'footer'],
    responsiveStrategies: ['compress', 'stack'],
    candidateCategories: ['section', 'card', 'media'],
    archetypeFit: ['luxury-showcase', 'creative-portfolio'],
  },

  // 7. Commerce Story Landing
  'commerce-story-landing': {
    id: 'commerce-story-landing',
    name: 'Commerce Story Landing',
    description: 'Direct-to-consumer commerce landing blending brand narrative with high-conversion product showcases and bag triggers.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'editorial-shop',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['navigation', 'hero-drop', 'featured-product-grid', 'ingredient-story', 'reviews-carousel', 'conversion-bundle', 'footer'],
    allowedRoles: ['navigation', 'hero-drop', 'announcement-bar', 'featured-product-grid', 'ingredient-story', 'lifestyle-gallery', 'reviews-carousel', 'conversion-bundle', 'footer'],
    roleOrdering: ['navigation', 'hero-drop', 'featured-product-grid', 'ingredient-story', 'reviews-carousel', 'conversion-bundle', 'footer'],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['section', 'card', 'button'],
    archetypeFit: ['ecommerce', 'luxury-showcase'],
  },

  // 8. Marketplace Supply-Demand Landing
  'marketplace-supply-demand-landing': {
    id: 'marketplace-supply-demand-landing',
    name: 'Marketplace Supply-Demand Landing',
    description: 'Two-sided discovery landing with dual hero actions (Find / Offer), location/category search bar, and curated listings carousel.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'dual-sided-hero',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['navigation', 'search-hero', 'category-tiles', 'trending-listings', 'how-it-works-steps', 'trust-safety', 'supply-cta', 'footer'],
    allowedRoles: ['navigation', 'search-hero', 'category-tiles', 'trending-listings', 'verified-hosts', 'how-it-works-steps', 'trust-safety', 'supply-cta', 'footer'],
    roleOrdering: ['navigation', 'search-hero', 'category-tiles', 'trending-listings', 'how-it-works-steps', 'trust-safety', 'supply-cta', 'footer'],
    responsiveStrategies: ['stack', 'collapse'],
    candidateCategories: ['section', 'input', 'card'],
    archetypeFit: ['marketplace', 'social-community'],
  },

  // 9. AI Prompt-First Landing
  'ai-prompt-first-landing': {
    id: 'ai-prompt-first-landing',
    name: 'AI Prompt-First Landing',
    description: 'Generative AI landing featuring a prominent conversational prompt hero with suggestion pills and immediate live output streaming.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'interactive-prompt-hero',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['navigation', 'prompt-input-hero', 'prompt-suggestions', 'output-preview-gallery', 'capability-matrix', 'footer'],
    allowedRoles: ['navigation', 'prompt-input-hero', 'prompt-suggestions', 'output-preview-gallery', 'model-selector', 'capability-matrix', 'benchmark-comparison', 'footer'],
    roleOrdering: ['navigation', 'prompt-input-hero', 'prompt-suggestions', 'output-preview-gallery', 'capability-matrix', 'footer'],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['section', 'input', 'card', 'badge'],
    archetypeFit: ['ai', 'developer-tools'],
  },

  // 10. Minimal Statement Landing
  'minimal-statement-landing': {
    id: 'minimal-statement-landing',
    name: 'Minimal Statement Landing',
    description: 'Understated landing page with bold single-sentence statement, monospace details, and direct invite-only waitlist input.',
    screenClass: 'marketing-homepage',
    layoutFamily: 'single-statement',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['navigation', 'statement-hero', 'waitlist-form', 'status-strip', 'footer'],
    allowedRoles: ['navigation', 'statement-hero', 'waitlist-form', 'status-strip', 'manifesto-modal', 'footer'],
    roleOrdering: ['navigation', 'statement-hero', 'waitlist-form', 'status-strip', 'footer'],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['section', 'input', 'button'],
    archetypeFit: ['creative-portfolio', 'developer-tools'],
  },

  // 11. Classic Sidebar Dashboard
  'classic-sidebar-dashboard': {
    id: 'classic-sidebar-dashboard',
    name: 'Classic Sidebar Dashboard',
    description: 'Industry standard application layout with collapsible left sidebar navigation, top header bar, and structured card grid.',
    screenClass: 'analytical-dashboard',
    layoutFamily: 'sidebar-card-grid',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['sidebar-nav', 'header-bar', 'summary-metric-cards', 'primary-chart', 'recent-activity-table'],
    allowedRoles: ['sidebar-nav', 'header-bar', 'summary-metric-cards', 'primary-chart', 'secondary-chart', 'filter-toolbar', 'recent-activity-table', 'quick-actions-card'],
    roleOrdering: ['sidebar-nav', 'header-bar', 'summary-metric-cards', 'primary-chart', 'recent-activity-table'],
    responsiveStrategies: ['collapse', 'stack', 'omit-nonessential'],
    candidateCategories: ['layout', 'card', 'table', 'button'],
    archetypeFit: ['saas', 'fintech', 'productivity'],
  },

  // 12. Dense Analytical Dashboard
  'dense-analytical-dashboard': {
    id: 'dense-analytical-dashboard',
    name: 'Dense Analytical Dashboard',
    description: 'High-density multi-metric dashboard for quantitative analysis, time-series telemetry, and deep slicing controls.',
    screenClass: 'analytical-dashboard',
    layoutFamily: 'multi-metric-grid',
    defaultNavigationModel: 'rail',
    requiredRoles: ['app-rail', 'dashboard-toolbar', 'kpi-stat-strip', 'timeseries-chart', 'split-data-grid', 'status-footer'],
    allowedRoles: ['app-rail', 'dashboard-toolbar', 'kpi-stat-strip', 'timeseries-chart', 'split-data-grid', 'legend-filter', 'export-drawer', 'status-footer'],
    roleOrdering: ['app-rail', 'dashboard-toolbar', 'kpi-stat-strip', 'timeseries-chart', 'split-data-grid', 'status-footer'],
    responsiveStrategies: ['compress', 'stack', 'collapse'],
    candidateCategories: ['layout', 'table', 'card', 'input'],
    archetypeFit: ['data-platform', 'fintech', 'developer-tools'],
  },

  // 13. Executive Overview
  'executive-overview': {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'Curated high-level summary dashboard for leadership with strategic KPI dials, trend variance, and automated anomaly badges.',
    screenClass: 'analytical-dashboard',
    layoutFamily: 'executive-summary',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['header-bar', 'executive-metric-cards', 'quarterly-trends', 'strategic-initiatives-list', 'insights-feed'],
    allowedRoles: ['header-bar', 'executive-metric-cards', 'quarterly-trends', 'drilldown-modal', 'strategic-initiatives-list', 'insights-feed'],
    roleOrdering: ['header-bar', 'executive-metric-cards', 'quarterly-trends', 'strategic-initiatives-list', 'insights-feed'],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['layout', 'card', 'badge'],
    archetypeFit: ['fintech', 'saas', 'governance'],
  },

  // 14. Command Centre
  'command-centre': {
    id: 'command-centre',
    name: 'Command Centre',
    description: 'Mission-critical telemetry command display with dark high-contrast mode, system topology graphs, alert feeds, and quick triage hotkeys.',
    screenClass: 'operational-queue',
    layoutFamily: 'telemetry-grid',
    defaultNavigationModel: 'command-palette',
    requiredRoles: ['command-bar', 'cluster-health-strip', 'active-incident-banner', 'topology-view', 'streaming-events-feed'],
    allowedRoles: ['command-bar', 'cluster-health-strip', 'active-incident-banner', 'topology-view', 'streaming-events-feed', 'runbook-drawer'],
    roleOrdering: ['command-bar', 'cluster-health-strip', 'active-incident-banner', 'topology-view', 'streaming-events-feed'],
    responsiveStrategies: ['compress', 'collapse'],
    candidateCategories: ['layout', 'card', 'badge', 'table'],
    archetypeFit: ['developer-tools', 'data-platform', 'governance'],
  },

  // 15. Research Terminal
  'research-terminal': {
    id: 'research-terminal',
    name: 'Research Terminal',
    description: 'Financial / scientific workstation with docked panes, order book depth or molecular structure viewer, and historical time-series queries.',
    screenClass: 'research-terminal',
    layoutFamily: 'docked-panes',
    defaultNavigationModel: 'command-palette',
    requiredRoles: ['terminal-header', 'docked-left-tree', 'center-data-surface', 'right-inspector-panel', 'command-prompt-footer'],
    allowedRoles: ['terminal-header', 'docked-left-tree', 'center-data-surface', 'right-inspector-panel', 'command-prompt-footer', 'quick-quote-strip'],
    roleOrdering: ['terminal-header', 'docked-left-tree', 'center-data-surface', 'right-inspector-panel', 'command-prompt-footer'],
    responsiveStrategies: ['collapse', 'substitute'],
    candidateCategories: ['layout', 'table', 'input', 'card'],
    archetypeFit: ['fintech', 'data-platform', 'developer-tools'],
  },

  // 16. Three-Pane Intelligence Workspace
  'three-pane-intelligence-workspace': {
    id: 'three-pane-intelligence-workspace',
    name: 'Three-Pane Intelligence Workspace',
    description: 'Sophisticated tri-column layout: context navigation on left, reading/stream canvas in center, and contextual AI copilot on right.',
    screenClass: 'workspace',
    layoutFamily: 'tri-column-intelligence',
    defaultNavigationModel: 'rail',
    requiredRoles: ['nav-rail', 'navigation-tree-pane', 'primary-canvas-pane', 'intelligence-copilot-pane'],
    allowedRoles: ['nav-rail', 'navigation-tree-pane', 'primary-canvas-pane', 'intelligence-copilot-pane', 'floating-action-palette'],
    roleOrdering: ['nav-rail', 'navigation-tree-pane', 'primary-canvas-pane', 'intelligence-copilot-pane'],
    responsiveStrategies: ['collapse', 'transform', 'substitute'],
    candidateCategories: ['layout', 'card', 'input', 'button'],
    archetypeFit: ['ai', 'saas', 'productivity'],
  },

  // 17. Master-Detail Workspace
  'master-detail-workspace': {
    id: 'master-detail-workspace',
    name: 'Master-Detail Workspace',
    description: 'List/detail split screen with virtualized record table on the left and comprehensive detail inspector with tabs on the right.',
    screenClass: 'entity-browser',
    layoutFamily: 'split-master-detail',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['sidebar-nav', 'master-list-header', 'record-data-table', 'detail-tab-inspector'],
    allowedRoles: ['sidebar-nav', 'master-list-header', 'record-data-table', 'detail-tab-inspector', 'bulk-actions-floating-bar'],
    roleOrdering: ['sidebar-nav', 'master-list-header', 'record-data-table', 'detail-tab-inspector'],
    responsiveStrategies: ['collapse', 'transform', 'stack'],
    candidateCategories: ['layout', 'table', 'card', 'tabs'],
    archetypeFit: ['saas', 'ecommerce', 'marketplace'],
  },

  // 18. Canvas Workspace
  'canvas-workspace': {
    id: 'canvas-workspace',
    name: 'Canvas Workspace',
    description: 'Infinite visual drawing or node-graph canvas with floating toolbars, minimap navigator, and properties drawer.',
    screenClass: 'workspace',
    layoutFamily: 'infinite-canvas',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['canvas-viewport', 'floating-tool-palette', 'minimap-widget', 'canvas-properties-drawer'],
    allowedRoles: ['canvas-viewport', 'floating-tool-palette', 'minimap-widget', 'canvas-properties-drawer', 'zoom-controls', 'collaboration-avatars'],
    roleOrdering: ['canvas-viewport', 'floating-tool-palette', 'minimap-widget', 'canvas-properties-drawer'],
    responsiveStrategies: ['collapse', 'omit-nonessential'],
    candidateCategories: ['layout', 'button', 'card'],
    archetypeFit: ['creative-portfolio', 'developer-tools', 'productivity'],
  },

  // 19. Editor Workspace
  'editor-workspace': {
    id: 'editor-workspace',
    name: 'Editor Workspace',
    description: 'Distraction-free document or code authoring screen with outline sidebar, rich editor canvas, and formatting toolbar.',
    screenClass: 'workspace',
    layoutFamily: 'focused-editor',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['document-header', 'document-outline-nav', 'rich-text-editor-surface', 'revision-history-drawer'],
    allowedRoles: ['document-header', 'document-outline-nav', 'rich-text-editor-surface', 'floating-format-bar', 'revision-history-drawer', 'collaborator-cursors'],
    roleOrdering: ['document-header', 'document-outline-nav', 'rich-text-editor-surface', 'revision-history-drawer'],
    responsiveStrategies: ['collapse', 'compress'],
    candidateCategories: ['layout', 'input', 'button'],
    archetypeFit: ['content-publishing', 'productivity'],
  },

  // 20. Search-First Application
  'search-first-application': {
    id: 'search-first-application',
    name: 'Search-First Application',
    description: 'Global discovery interface centered around an omnipresent search input with facet filters, autocomplete chips, and categorized results.',
    screenClass: 'entity-browser',
    layoutFamily: 'search-results-facets',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['header-search-bar', 'facet-filters-rail', 'active-filter-chips', 'search-result-items', 'pagination-controls'],
    allowedRoles: ['header-search-bar', 'facet-filters-rail', 'active-filter-chips', 'search-result-items', 'result-view-toggle', 'pagination-controls', 'empty-search-state'],
    roleOrdering: ['header-search-bar', 'active-filter-chips', 'facet-filters-rail', 'search-result-items', 'pagination-controls'],
    responsiveStrategies: ['collapse', 'stack', 'compress'],
    candidateCategories: ['input', 'card', 'layout', 'badge'],
    archetypeFit: ['marketplace', 'ecommerce', 'content-publishing'],
  },

  // 21. Entity Explorer
  'entity-explorer': {
    id: 'entity-explorer',
    name: 'Entity Explorer',
    description: 'Comprehensive entity directory with advanced filtering rail, sort options, column toggling, and export trigger.',
    screenClass: 'entity-browser',
    layoutFamily: 'filter-rail-table',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['app-sidebar', 'directory-filter-rail', 'directory-action-bar', 'entity-data-grid', 'pagination-bar'],
    allowedRoles: ['app-sidebar', 'directory-filter-rail', 'directory-action-bar', 'entity-data-grid', 'bulk-selection-bar', 'pagination-bar'],
    roleOrdering: ['app-sidebar', 'directory-filter-rail', 'directory-action-bar', 'entity-data-grid', 'pagination-bar'],
    responsiveStrategies: ['collapse', 'stack'],
    candidateCategories: ['layout', 'table', 'card', 'input'],
    archetypeFit: ['saas', 'fintech', 'marketplace'],
  },

  // 22. Entity Intelligence Detail
  'entity-intelligence-detail': {
    id: 'entity-intelligence-detail',
    name: 'Entity Intelligence Detail',
    description: 'Deep-dive entity screen with summary banner, metadata sidebar, relationship graph, and full audit activity log.',
    screenClass: 'entity-detail',
    layoutFamily: 'hero-banner-tabbed-detail',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['entity-header-banner', 'metadata-sidebar', 'primary-tabbed-content', 'related-entities-carousel', 'audit-activity-timeline'],
    allowedRoles: ['entity-header-banner', 'metadata-sidebar', 'primary-tabbed-content', 'related-entities-carousel', 'audit-activity-timeline', 'quick-edit-modal'],
    roleOrdering: ['entity-header-banner', 'metadata-sidebar', 'primary-tabbed-content', 'related-entities-carousel', 'audit-activity-timeline'],
    responsiveStrategies: ['stack', 'compress', 'collapse'],
    candidateCategories: ['card', 'layout', 'tabs', 'badge'],
    archetypeFit: ['saas', 'fintech', 'governance'],
  },

  // 23. Analytics Drilldown
  'analytics-drilldown': {
    id: 'analytics-drilldown',
    name: 'Analytics Drilldown',
    description: 'Interactive analytics exploration view with multi-dimensional cohort builder, chart zoom/brush, and row-level raw logs.',
    screenClass: 'analytical-dashboard',
    layoutFamily: 'interactive-drilldown',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['date-cohort-toolbar', 'drilldown-chart-surface', 'breakdown-table', 'dimension-slicer-drawer'],
    allowedRoles: ['date-cohort-toolbar', 'drilldown-chart-surface', 'breakdown-table', 'dimension-slicer-drawer', 'export-csv-button'],
    roleOrdering: ['date-cohort-toolbar', 'drilldown-chart-surface', 'breakdown-table', 'dimension-slicer-drawer'],
    responsiveStrategies: ['compress', 'stack'],
    candidateCategories: ['layout', 'table', 'card', 'button'],
    archetypeFit: ['data-platform', 'developer-tools'],
  },

  // 24. Report Builder
  'report-builder': {
    id: 'report-builder',
    name: 'Report Builder',
    description: 'WYSIWYG reporting environment for arranging charts, tables, annotations, and scheduling recurring PDF/email exports.',
    screenClass: 'workspace',
    layoutFamily: 'canvas-blocks',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['report-toolbar', 'available-widgets-sidebar', 'report-canvas-page', 'widget-config-panel'],
    allowedRoles: ['report-toolbar', 'available-widgets-sidebar', 'report-canvas-page', 'widget-config-panel', 'schedule-dialog'],
    roleOrdering: ['report-toolbar', 'available-widgets-sidebar', 'report-canvas-page', 'widget-config-panel'],
    responsiveStrategies: ['collapse', 'omit-nonessential'],
    candidateCategories: ['layout', 'card', 'button'],
    archetypeFit: ['saas', 'fintech', 'governance'],
  },

  // 25. Report Reader
  'report-reader': {
    id: 'report-reader',
    name: 'Report Reader',
    description: 'Publication view for finalized executive reports, featuring document pagination, interactive footnotes, and print optimization.',
    screenClass: 'entity-detail',
    layoutFamily: 'editorial-reader',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['reader-nav-header', 'report-table-of-contents', 'curated-report-body', 'citation-notes-drawer'],
    allowedRoles: ['reader-nav-header', 'report-table-of-contents', 'curated-report-body', 'citation-notes-drawer', 'print-export-button'],
    roleOrdering: ['reader-nav-header', 'report-table-of-contents', 'curated-report-body', 'citation-notes-drawer'],
    responsiveStrategies: ['stack', 'collapse'],
    candidateCategories: ['layout', 'card', 'text'],
    archetypeFit: ['content-publishing', 'governance'],
  },

  // 26. Monitoring Watchlist
  'monitoring-watchlist': {
    id: 'monitoring-watchlist',
    name: 'Monitoring Watchlist',
    description: 'Configurable watchlist grid of targets, assets, or services with live pulse sparks, threshold alert flags, and drag reordering.',
    screenClass: 'operational-queue',
    layoutFamily: 'watchlist-grid',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['watchlist-header-bar', 'ticker-spark-cards', 'threshold-alert-feed', 'manage-watchlist-modal'],
    allowedRoles: ['watchlist-header-bar', 'ticker-spark-cards', 'threshold-alert-feed', 'manage-watchlist-modal', 'market-depth-preview'],
    roleOrdering: ['watchlist-header-bar', 'ticker-spark-cards', 'threshold-alert-feed', 'manage-watchlist-modal'],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['layout', 'card', 'table'],
    archetypeFit: ['fintech', 'developer-tools'],
  },

  // 27. Notification Triage
  'notification-triage': {
    id: 'notification-triage',
    name: 'Notification Triage',
    description: 'Action-oriented notification center with priority filters, batch mark-as-read, inline replies, and webhook dispatch history.',
    screenClass: 'operational-queue',
    layoutFamily: 'triage-feed',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['triage-filter-tabs', 'notification-item-feed', 'batch-action-bar', 'notification-preferences-link'],
    allowedRoles: ['triage-filter-tabs', 'notification-item-feed', 'batch-action-bar', 'notification-preferences-link', 'mute-channels-dialog'],
    roleOrdering: ['triage-filter-tabs', 'batch-action-bar', 'notification-item-feed', 'notification-preferences-link'],
    responsiveStrategies: ['compress', 'stack'],
    candidateCategories: ['layout', 'card', 'button', 'badge'],
    archetypeFit: ['saas', 'productivity', 'social-community'],
  },

  // 28. Messaging Workspace
  'messaging-workspace': {
    id: 'messaging-workspace',
    name: 'Messaging Workspace',
    description: 'Real-time communication layout with channel/direct conversation list, message thread pane, member list, and input bar.',
    screenClass: 'workspace',
    layoutFamily: 'chat-threads',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['channels-conversations-list', 'active-chat-header', 'message-history-stream', 'rich-chat-input-bar'],
    allowedRoles: ['channels-conversations-list', 'active-chat-header', 'message-history-stream', 'rich-chat-input-bar', 'thread-replies-sidebar', 'pinned-items-drawer'],
    roleOrdering: ['channels-conversations-list', 'active-chat-header', 'message-history-stream', 'rich-chat-input-bar'],
    responsiveStrategies: ['collapse', 'transform'],
    candidateCategories: ['layout', 'input', 'card', 'button'],
    archetypeFit: ['social-community', 'productivity'],
  },

  // 29. Approval Workflow
  'approval-workflow': {
    id: 'approval-workflow',
    name: 'Approval Workflow',
    description: 'Structured request approval view with step progression pipeline, diff viewer, compliance sign-off checklist, and approve/reject actions.',
    screenClass: 'operational-queue',
    layoutFamily: 'approval-pipeline',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['approval-request-summary', 'stage-progression-stepper', 'change-diff-viewer', 'audit-signoff-form', 'approval-action-bar'],
    allowedRoles: ['approval-request-summary', 'stage-progression-stepper', 'change-diff-viewer', 'audit-signoff-form', 'approval-action-bar', 'rejection-reason-dialog'],
    roleOrdering: ['approval-request-summary', 'stage-progression-stepper', 'change-diff-viewer', 'audit-signoff-form', 'approval-action-bar'],
    responsiveStrategies: ['stack', 'collapse'],
    candidateCategories: ['layout', 'card', 'button', 'badge'],
    archetypeFit: ['governance', 'fintech', 'saas'],
  },

  // 30. Settings Console
  'settings-console': {
    id: 'settings-console',
    name: 'Settings Console',
    description: 'Multi-category configuration console with tabbed sections, form controls, confirmation modals, and API credential management.',
    screenClass: 'settings-account',
    layoutFamily: 'vertical-tabs-form',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['settings-category-nav', 'settings-section-header', 'form-field-groups', 'save-cancel-footer-bar'],
    allowedRoles: ['settings-category-nav', 'settings-section-header', 'form-field-groups', 'save-cancel-footer-bar', 'danger-zone-card', 'key-reveal-modal'],
    roleOrdering: ['settings-category-nav', 'settings-section-header', 'form-field-groups', 'save-cancel-footer-bar'],
    responsiveStrategies: ['collapse', 'stack'],
    candidateCategories: ['layout', 'input', 'button', 'card'],
    archetypeFit: ['saas', 'developer-tools', 'fintech'],
  },

  // 31. Admin Operations Console
  'admin-operations-console': {
    id: 'admin-operations-console',
    name: 'Admin Operations Console',
    description: 'Platform tenant administration with user access control, feature flag toggles, rate limit policies, and operational audit trails.',
    screenClass: 'settings-account',
    layoutFamily: 'admin-console',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['admin-sidebar-nav', 'tenant-selector-header', 'admin-data-table', 'feature-flag-matrix'],
    allowedRoles: ['admin-sidebar-nav', 'tenant-selector-header', 'admin-data-table', 'feature-flag-matrix', 'impersonation-banner', 'quota-editor-drawer'],
    roleOrdering: ['admin-sidebar-nav', 'tenant-selector-header', 'admin-data-table', 'feature-flag-matrix'],
    responsiveStrategies: ['collapse', 'stack'],
    candidateCategories: ['layout', 'table', 'card', 'badge'],
    archetypeFit: ['governance', 'saas', 'developer-tools'],
  },

  // 32. Commerce Management Console
  'commerce-management-console': {
    id: 'commerce-management-console',
    name: 'Commerce Management Console',
    description: 'Store operations dashboard for managing inventory catalog, order fulfillment pipelines, shipping manifests, and refunds.',
    screenClass: 'entity-browser',
    layoutFamily: 'commerce-ops',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['commerce-sidebar', 'inventory-status-strip', 'orders-fulfillment-table', 'order-detail-drawer'],
    allowedRoles: ['commerce-sidebar', 'inventory-status-strip', 'orders-fulfillment-table', 'order-detail-drawer', 'tracking-manifest-modal'],
    roleOrdering: ['commerce-sidebar', 'inventory-status-strip', 'orders-fulfillment-table', 'order-detail-drawer'],
    responsiveStrategies: ['collapse', 'stack'],
    candidateCategories: ['layout', 'table', 'card', 'badge'],
    archetypeFit: ['ecommerce', 'marketplace'],
  },

  // 33. Marketplace Management Console
  'marketplace-management-console': {
    id: 'marketplace-management-console',
    name: 'Marketplace Management Console',
    description: 'Two-sided ecosystem operations screen covering seller verification, dispute resolution queues, escrow payouts, and listing moderation.',
    screenClass: 'operational-queue',
    layoutFamily: 'dispute-queue',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['marketplace-ops-nav', 'dispute-metrics-strip', 'pending-moderation-queue', 'settlement-payout-table'],
    allowedRoles: ['marketplace-ops-nav', 'dispute-metrics-strip', 'pending-moderation-queue', 'settlement-payout-table', 'escrow-release-dialog'],
    roleOrdering: ['marketplace-ops-nav', 'dispute-metrics-strip', 'pending-moderation-queue', 'settlement-payout-table'],
    responsiveStrategies: ['collapse', 'stack'],
    candidateCategories: ['layout', 'table', 'card', 'badge'],
    archetypeFit: ['marketplace', 'fintech'],
  },

  // 34. Onboarding Progressive
  'onboarding-progressive': {
    id: 'onboarding-progressive',
    name: 'Onboarding Progressive',
    description: 'Step-by-step account bootstrap flow with animated progress bar, preference selector cards, and instant workspace launch button.',
    screenClass: 'onboarding-flow',
    layoutFamily: 'stepper-card-flow',
    defaultNavigationModel: 'none',
    requiredRoles: ['step-progress-indicator', 'wizard-step-card', 'interactive-choice-grid', 'step-navigation-actions'],
    allowedRoles: ['step-progress-indicator', 'wizard-step-card', 'interactive-choice-grid', 'step-navigation-actions', 'skip-for-now-link'],
    roleOrdering: ['step-progress-indicator', 'wizard-step-card', 'interactive-choice-grid', 'step-navigation-actions'],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['card', 'button', 'badge'],
    archetypeFit: ['saas', 'productivity', 'fintech'],
  },

  // 35. Onboarding Conversational
  'onboarding-conversational': {
    id: 'onboarding-conversational',
    name: 'Onboarding Conversational',
    description: 'Dynamic conversational setup wizard asking clarifying questions and synthesizing project parameters in real-time.',
    screenClass: 'onboarding-flow',
    layoutFamily: 'conversational-dialog',
    defaultNavigationModel: 'none',
    requiredRoles: ['assistant-greeting', 'chat-bubble-stream', 'quick-reply-chips', 'workspace-preview-card', 'launch-workspace-cta'],
    allowedRoles: ['assistant-greeting', 'chat-bubble-stream', 'quick-reply-chips', 'workspace-preview-card', 'launch-workspace-cta'],
    roleOrdering: ['assistant-greeting', 'chat-bubble-stream', 'quick-reply-chips', 'workspace-preview-card', 'launch-workspace-cta'],
    responsiveStrategies: ['compress', 'stack'],
    candidateCategories: ['card', 'input', 'button'],
    archetypeFit: ['ai', 'creative-portfolio'],
  },

  // 36. Documentation Explorer
  'documentation-explorer': {
    id: 'documentation-explorer',
    name: 'Documentation Explorer',
    description: 'Structured technical documentation layout with hierarchical tree nav, markdown article body, and on-this-page anchor rail.',
    screenClass: 'content-detail',
    layoutFamily: 'three-pane-docs',
    defaultNavigationModel: 'header-minimal',
    requiredRoles: ['docs-header-search', 'docs-tree-sidebar', 'markdown-article-body', 'on-this-page-toc-rail', 'article-feedback-footer'],
    allowedRoles: ['docs-header-search', 'docs-tree-sidebar', 'markdown-article-body', 'on-this-page-toc-rail', 'article-feedback-footer', 'code-copy-button'],
    roleOrdering: ['docs-header-search', 'docs-tree-sidebar', 'markdown-article-body', 'on-this-page-toc-rail', 'article-feedback-footer'],
    responsiveStrategies: ['collapse', 'stack'],
    candidateCategories: ['layout', 'text', 'card'],
    archetypeFit: ['developer-tools', 'content-publishing'],
  },

  // 37. Developer API Console
  'developer-api-console': {
    id: 'developer-api-console',
    name: 'Developer API Console',
    description: 'Interactive API sandbox with endpoint route selector, method badges, JSON parameter form, and response inspector with curl snippet.',
    screenClass: 'workspace',
    layoutFamily: 'api-sandbox',
    defaultNavigationModel: 'top-nav',
    requiredRoles: ['endpoints-list-rail', 'request-builder-header', 'parameter-json-editor', 'response-payload-viewer', 'curl-export-bar'],
    allowedRoles: ['endpoints-list-rail', 'request-builder-header', 'parameter-json-editor', 'response-payload-viewer', 'curl-export-bar', 'auth-header-picker'],
    roleOrdering: ['endpoints-list-rail', 'request-builder-header', 'parameter-json-editor', 'response-payload-viewer', 'curl-export-bar'],
    responsiveStrategies: ['collapse', 'stack'],
    candidateCategories: ['layout', 'input', 'card', 'badge'],
    archetypeFit: ['developer-tools', 'data-platform'],
  },

  // 38. Calendar Operations
  'calendar-operations': {
    id: 'calendar-operations',
    name: 'Calendar Operations',
    description: 'Schedule operations view with day/week/month timetable grid, resource booking slots, event drawer, and drag reschedule.',
    screenClass: 'workspace',
    layoutFamily: 'calendar-grid',
    defaultNavigationModel: 'sidebar',
    requiredRoles: ['calendar-view-header', 'mini-month-picker-sidebar', 'timetable-grid-surface', 'event-quick-edit-drawer'],
    allowedRoles: ['calendar-view-header', 'mini-month-picker-sidebar', 'timetable-grid-surface', 'event-quick-edit-drawer', 'filter-attendees-chips'],
    roleOrdering: ['calendar-view-header', 'mini-month-picker-sidebar', 'timetable-grid-surface', 'event-quick-edit-drawer'],
    responsiveStrategies: ['transform', 'collapse', 'stack'],
    candidateCategories: ['layout', 'card', 'button'],
    archetypeFit: ['productivity', 'healthcare'],
  },

  // 39. Mobile App Hub
  'mobile-app-hub': {
    id: 'mobile-app-hub',
    name: 'Mobile App Hub',
    description: 'Ergonomic mobile-first app shell featuring bottom tab navigation, pull-to-refresh feeds, stories carousel, and floating action button.',
    screenClass: 'workspace',
    layoutFamily: 'mobile-tab-hub',
    defaultNavigationModel: 'bottom-tabs',
    requiredRoles: ['mobile-top-header', 'story-avatar-strip', 'card-feed-stream', 'bottom-tab-bar'],
    allowedRoles: ['mobile-top-header', 'story-avatar-strip', 'card-feed-stream', 'floating-action-button', 'bottom-tab-bar'],
    roleOrdering: ['mobile-top-header', 'story-avatar-strip', 'card-feed-stream', 'bottom-tab-bar'],
    responsiveStrategies: ['stack', 'compress'],
    candidateCategories: ['layout', 'card', 'button'],
    archetypeFit: ['social-community', 'ecommerce', 'productivity'],
  },

  // 40. Immersive Presentation
  'immersive-presentation': {
    id: 'immersive-presentation',
    name: 'Immersive Presentation',
    description: 'Full-viewport slide or showcase deck with slide transition gestures, keyboard step presenter mode, and speaker notes drawer.',
    screenClass: 'workspace',
    layoutFamily: 'viewport-deck',
    defaultNavigationModel: 'none',
    requiredRoles: ['fullscreen-stage', 'slide-content-frame', 'slide-counter-progress', 'deck-control-bar'],
    allowedRoles: ['fullscreen-stage', 'slide-content-frame', 'slide-counter-progress', 'deck-control-bar', 'speaker-notes-drawer'],
    roleOrdering: ['fullscreen-stage', 'slide-content-frame', 'slide-counter-progress', 'deck-control-bar'],
    responsiveStrategies: ['compress', 'transform'],
    candidateCategories: ['layout', 'card', 'media'],
    archetypeFit: ['creative-portfolio', 'luxury-showcase'],
  },
};

export function getAllCompositionGrammars(): CompositionGrammar[] {
  return Object.values(COMPOSITION_GRAMMARS);
}

export function getCompositionGrammar(id: string): CompositionGrammar | undefined {
  return COMPOSITION_GRAMMARS[id];
}
