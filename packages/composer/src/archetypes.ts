export interface ArchetypeDefinition {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  primaryAudience: string;
  userSophistication: number; // 0-100
  trustRequirement: number;
  informationComplexity: number;
  dataDensity: number;
  collaborationLevel: number;
  transactionCriticality: number;
  navigationComplexity: number;
  mobileImportance: number;
  primaryObjective: string;
  defaultEntities: Array<{ name: string; description: string; fields: string[] }>;
  defaultWorkflows: Array<{ id: string; name: string; steps: string[] }>;
  recommendedScreens: Array<{
    name: string;
    screenType: string;
    purpose: string;
    jobs: string[];
    required: boolean;
  }>;
  requiredCapabilities: string[];
  forbiddenPatterns: string[];
  defaultNavigationModel: string;
}

export const PRODUCT_ARCHETYPES: Record<string, ArchetypeDefinition> = {
  // 1. SaaS
  saas: {
    id: 'saas',
    name: 'B2B SaaS',
    description: 'Cloud software applications serving business operational workflows and subscriptions.',
    keywords: ['saas', 'b2b', 'software', 'cloud', 'subscription', 'workspace', 'tenant', 'enterprise'],
    primaryAudience: 'Business teams, managers, and operators',
    userSophistication: 65,
    trustRequirement: 85,
    informationComplexity: 65,
    dataDensity: 65,
    collaborationLevel: 70,
    transactionCriticality: 60,
    navigationComplexity: 60,
    mobileImportance: 50,
    primaryObjective: 'Streamline team workflows and manage operational resources',
    defaultEntities: [
      { name: 'Workspace', description: 'Organization boundary and configuration', fields: ['id', 'name', 'plan', 'members'] },
      { name: 'Member', description: 'Team collaborator with role-based permissions', fields: ['id', 'email', 'role', 'status'] },
      { name: 'Project', description: 'Container for deliverables and tasks', fields: ['id', 'title', 'status', 'updatedAt'] },
    ],
    defaultWorkflows: [
      { id: 'onboard-team', name: 'Invite and onboard team members', steps: ['send-invites', 'assign-roles', 'configure-workspace'] },
      { id: 'manage-billing', name: 'Subscription upgrade and payment management', steps: ['select-plan', 'enter-payment', 'view-invoices'] },
    ],
    recommendedScreens: [
      { name: 'Marketing Home', screenType: 'marketing', purpose: 'Product overview and conversion', jobs: ['explain-value', 'start-trial'], required: true },
      { name: 'Overview Dashboard', screenType: 'dashboard', purpose: 'Key metrics and recent activity', jobs: ['monitor-health', 'quick-actions'], required: true },
      { name: 'Projects Index', screenType: 'index-list', purpose: 'Filter and manage projects', jobs: ['browse-projects', 'create-project'], required: true },
      { name: 'Team & Permissions', screenType: 'settings', purpose: 'Manage users and roles', jobs: ['invite-members', 'set-roles'], required: true },
      { name: 'Billing & Usage', screenType: 'billing-account', purpose: 'Subscription and invoices', jobs: ['manage-plan', 'download-receipts'], required: false },
    ],
    requiredCapabilities: ['role-based-access', 'audit-logging', 'team-invitations'],
    forbiddenPatterns: ['unauthenticated-writes', 'unconfirmed-destructive-actions'],
    defaultNavigationModel: 'classic-app-sidebar',
  },

  // 2. AI
  ai: {
    id: 'ai',
    name: 'AI Product',
    description: 'Generative, assistive, or predictive machine intelligence interfaces.',
    keywords: ['ai', 'artificial intelligence', 'llm', 'model', 'prompt', 'inference', 'agent', 'copilot', 'generate'],
    primaryAudience: 'Knowledge workers, creatives, and technical practitioners',
    userSophistication: 75,
    trustRequirement: 80,
    informationComplexity: 70,
    dataDensity: 55,
    collaborationLevel: 60,
    transactionCriticality: 50,
    navigationComplexity: 50,
    mobileImportance: 60,
    primaryObjective: 'Amplify human productivity through generative and predictive assistance',
    defaultEntities: [
      { name: 'Prompt', description: 'User instruction and system framing', fields: ['id', 'text', 'model', 'createdAt'] },
      { name: 'Generation', description: 'Synthesized model output and history', fields: ['id', 'output', 'status', 'tokens'] },
      { name: 'Agent', description: 'Configured automated agent instance', fields: ['id', 'name', 'tools', 'instructions'] },
    ],
    defaultWorkflows: [
      { id: 'run-generation', name: 'Formulate prompt and inspect generation', steps: ['compose-prompt', 'stream-response', 'iterate-output'] },
      { id: 'configure-agent', name: 'Equip agent with tools and memory', steps: ['define-role', 'connect-tools', 'test-run'] },
    ],
    recommendedScreens: [
      { name: 'Prompt Canvas', screenType: 'workspace-editor', purpose: 'Interactive prompt formulation and output stream', jobs: ['prompt-generation', 'compare-variants'], required: true },
      { name: 'History & Generations', screenType: 'index-list', purpose: 'Browse and fork past generations', jobs: ['search-history', 'export-results'], required: true },
      { name: 'Model & API Settings', screenType: 'settings', purpose: 'Configure provider keys and model hyperparameters', jobs: ['set-api-keys', 'tune-parameters'], required: true },
    ],
    requiredCapabilities: ['streaming-output', 'token-usage-telemetry', 'cancelable-requests'],
    forbiddenPatterns: ['blocking-synchronous-waits-without-feedback', 'hidden-hallucination-risks'],
    defaultNavigationModel: 'command-first',
  },

  // 3. Developer Tools
  'developer-tools': {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'CLI companions, SDK documentation, observability dashboards, and code infrastructure.',
    keywords: ['developer', 'dev', 'api', 'sdk', 'cli', 'code', 'git', 'debug', 'infrastructure', 'observability', 'telemetry'],
    primaryAudience: 'Software engineers, DevOps, and systems architects',
    userSophistication: 95,
    trustRequirement: 90,
    informationComplexity: 90,
    dataDensity: 90,
    collaborationLevel: 65,
    transactionCriticality: 70,
    navigationComplexity: 75,
    mobileImportance: 35,
    primaryObjective: 'Provide deep diagnostic control, performance inspection, and rapid coding workflows',
    defaultEntities: [
      { name: 'Service', description: 'Deployable unit or worker', fields: ['id', 'name', 'environment', 'status'] },
      { name: 'LogStream', description: 'Real-time telemetry and error logs', fields: ['id', 'timestamp', 'level', 'message'] },
      { name: 'APIKey', description: 'Authentication credential with scoped tokens', fields: ['id', 'prefix', 'scopes', 'expiresAt'] },
    ],
    defaultWorkflows: [
      { id: 'inspect-logs', name: 'Filter and tail live telemetry logs', steps: ['query-filters', 'tail-stream', 'drilldown-stacktrace'] },
      { id: 'rotate-keys', name: 'Issue and revoke API credentials', steps: ['generate-key', 'copy-secret', 'retire-old-key'] },
    ],
    recommendedScreens: [
      { name: 'Telemetry Dashboard', screenType: 'dashboard', purpose: 'System health, p99 latencies, and error rates', jobs: ['monitor-metrics', 'inspect-spikes'], required: true },
      { name: 'Log Explorer', screenType: 'search-explore', purpose: 'Structured query log stream with instant filtering', jobs: ['search-logs', 'view-traces'], required: true },
      { name: 'API & Webhooks', screenType: 'settings', purpose: 'Keys, endpoints, and event delivery logs', jobs: ['manage-keys', 'test-webhooks'], required: true },
      { name: 'Documentation & SDKs', screenType: 'documentation', purpose: 'Interactive endpoints and code snippets', jobs: ['read-docs', 'copy-curl'], required: false },
    ],
    requiredCapabilities: ['keyboard-shortcuts', 'monospace-formatting', 'stream-pause-resume'],
    forbiddenPatterns: ['low-density-decorative-cards', 'hiding-error-stack-traces'],
    defaultNavigationModel: 'dual-rail',
  },

  // 4. Fintech
  fintech: {
    id: 'fintech',
    name: 'Fintech',
    description: 'Banking, payment gateways, wealth management, and transactional balance ledgers.',
    keywords: [
      'fintech',
      'finance',
      'financial',
      'trading',
      'portfolio',
      'equity',
      'market data',
      'banking',
      'payment',
      'money',
      'transaction',
      'balance',
      'ledger',
      'wallet',
      'transfer',
      'order book',
      'securities',
      'brokerage',
    ],
    primaryAudience: 'Finance managers, compliance teams, and account holders',
    userSophistication: 70,
    trustRequirement: 98,
    informationComplexity: 80,
    dataDensity: 85,
    collaborationLevel: 45,
    transactionCriticality: 98,
    navigationComplexity: 65,
    mobileImportance: 80,
    primaryObjective: 'Guarantee accurate, transparent, compliant money movement and reconciliation',
    defaultEntities: [
      { name: 'Account', description: 'Financial ledger holding settled currency balance', fields: ['id', 'iban', 'balance', 'currency'] },
      { name: 'Transaction', description: 'Audited immutable debit or credit ledger event', fields: ['id', 'amount', 'direction', 'counterparty', 'timestamp'] },
      { name: 'Transfer', description: 'Pending or executed settlement instruction', fields: ['id', 'source', 'destination', 'amount', 'status'] },
    ],
    defaultWorkflows: [
      { id: 'transfer-funds', name: 'Initiate and confirm two-factor balance transfer', steps: ['enter-recipient', 'verify-amount', '2fa-confirm', 'receipt'] },
      { id: 'reconcile-statements', name: 'Export and review verified monthly bank statements', steps: ['select-period', 'filter-categories', 'export-pdf'] },
    ],
    recommendedScreens: [
      { name: 'Account Balances', screenType: 'dashboard', purpose: 'Aggregate liquidity, spend trends, and alerts', jobs: ['check-balance', 'monitor-spend'], required: true },
      { name: 'Transaction History', screenType: 'index-list', purpose: 'Filterable audited chronological ledger', jobs: ['search-transactions', 'download-receipts'], required: true },
      { name: 'Transfer Funds', screenType: 'checkout-transaction', purpose: 'Secure payment routing modal or page', jobs: ['send-money', 'confirm-exchange-rate'], required: true },
      { name: 'Security & 2FA', screenType: 'settings', purpose: 'Hardware keys, passcodes, and device sessions', jobs: ['manage-devices', 'setup-2fa'], required: true },
    ],
    requiredCapabilities: ['two-factor-authentication', 'audit-trail', 'currency-precision-formatting'],
    forbiddenPatterns: ['ambiguous-settlement-states', 'silent-fee-deductions'],
    defaultNavigationModel: 'classic-app-sidebar',
  },

  // 5. Ecommerce
  ecommerce: {
    id: 'ecommerce',
    name: 'Ecommerce',
    description: 'Direct-to-consumer catalogs, cart checkout, inventory, and order fulfillment.',
    keywords: ['ecommerce', 'shop', 'store', 'cart', 'checkout', 'product', 'catalog', 'retail', 'order'],
    primaryAudience: 'Online shoppers, merchandising managers, and fulfillment teams',
    userSophistication: 45,
    trustRequirement: 90,
    informationComplexity: 50,
    dataDensity: 50,
    collaborationLevel: 25,
    transactionCriticality: 90,
    navigationComplexity: 55,
    mobileImportance: 90,
    primaryObjective: 'Drive frictionless product discovery, confident purchase, and order delivery',
    defaultEntities: [
      { name: 'Product', description: 'Merchandise item with variants, media, and price', fields: ['id', 'title', 'price', 'inventory', 'sku'] },
      { name: 'Order', description: 'Customer purchase agreement and payment status', fields: ['id', 'items', 'total', 'shippingAddress', 'status'] },
      { name: 'Customer', description: 'Shopper profile and order history', fields: ['id', 'name', 'email', 'lifetimeSpend'] },
    ],
    defaultWorkflows: [
      { id: 'purchase-item', name: 'Browse, add to cart, and checkout', steps: ['select-variant', 'add-to-cart', 'shipping-info', 'payment-complete'] },
      { id: 'track-order', name: 'Check courier tracking and fulfillment status', steps: ['enter-order-id', 'view-milestones', 'receipt'] },
    ],
    recommendedScreens: [
      { name: 'Product Catalog', screenType: 'search-explore', purpose: 'Search products, compare details, and browse collections', jobs: ['search-products', 'compare-products', 'filter-categories'], required: true },
      { name: 'Product Detail', screenType: 'detail-entity', purpose: 'Gallery, specs, variant selector, and Add to Cart', jobs: ['inspect-photos', 'add-to-cart'], required: true },
      { name: 'Checkout', screenType: 'checkout-transaction', purpose: 'Frictionless payment and address capture', jobs: ['enter-shipping', 'submit-payment'], required: true },
      { name: 'Order Confirmation', screenType: 'detail-entity', purpose: 'Confirmed order details, delivery status, and receipt', jobs: ['view-tracking', 'download-receipt'], required: true },
    ],
    requiredCapabilities: ['responsive-image-gallery', 'persistent-cart-state', 'secure-payment-fields'],
    forbiddenPatterns: ['unclear-shipping-costs-at-final-step', 'broken-mobile-checkout-forms'],
    defaultNavigationModel: 'marketing-mega-nav',
  },

  // 6. Marketplace
  marketplace: {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Multi-sided platforms matching buyers with independent suppliers, listings, and reviews.',
    keywords: ['marketplace', 'listing', 'vendor', 'seller', 'buyer', 'booking', 'two-sided', 'reviews', 'ratings'],
    primaryAudience: 'Both supply-side vendors and demand-side buyers/renters',
    userSophistication: 55,
    trustRequirement: 92,
    informationComplexity: 65,
    dataDensity: 60,
    collaborationLevel: 50,
    transactionCriticality: 85,
    navigationComplexity: 65,
    mobileImportance: 85,
    primaryObjective: 'Facilitate trusted discovery, verification, and transactions between independent parties',
    defaultEntities: [
      { name: 'Listing', description: 'Offer, service, or asset presented by a seller', fields: ['id', 'title', 'price', 'location', 'sellerId', 'rating'] },
      { name: 'Booking', description: 'Confirmed reservation or service agreement', fields: ['id', 'listingId', 'buyerId', 'dates', 'status'] },
      { name: 'Review', description: 'Verified feedback with score and commentary', fields: ['id', 'author', 'rating', 'comment', 'createdAt'] },
    ],
    defaultWorkflows: [
      { id: 'book-listing', name: 'Search, filter, message host, and complete booking', steps: ['search-criteria', 'select-listing', 'choose-dates', 'confirm-payment'] },
      { id: 'publish-listing', name: 'Supply side asset upload and pricing definition', steps: ['upload-photos', 'describe-amenities', 'set-calendar', 'publish'] },
    ],
    recommendedScreens: [
      { name: 'Explore Listings', screenType: 'search-explore', purpose: 'Map and grid view with faceted search', jobs: ['filter-by-location', 'compare-prices'], required: true },
      { name: 'Listing Detail', screenType: 'detail-entity', purpose: 'Host profile, reviews, availability calendar', jobs: ['inspect-amenities', 'reserve-dates'], required: true },
      { name: 'Booking Flow', screenType: 'checkout-transaction', purpose: 'Deposit or full payment breakdown', jobs: ['review-cancellation-policy', 'pay'], required: true },
      { name: 'Messages & Inquiries', screenType: 'messages-collaboration', purpose: 'Direct communication between buyer and seller', jobs: ['message-seller', 'coordinate-arrival'], required: true },
    ],
    requiredCapabilities: ['geo-location-filtering', 'multi-party-chat', 'verified-reviews'],
    forbiddenPatterns: ['unmoderated-anonymous-listings', 'hidden-host-fees'],
    defaultNavigationModel: 'search-first-header',
  },

  // 7. Analytics
  analytics: {
    id: 'analytics',
    name: 'Analytics Platform',
    description: 'Data visualization, cohort metrics, SQL pivots, and KPI performance tracking.',
    keywords: ['analytics', 'metrics', 'chart', 'kpi', 'dashboard', 'insights', 'funnel', 'cohort', 'trends', 'bi'],
    primaryAudience: 'Data analysts, executives, and growth product managers',
    userSophistication: 80,
    trustRequirement: 90,
    informationComplexity: 85,
    dataDensity: 95,
    collaborationLevel: 55,
    transactionCriticality: 40,
    navigationComplexity: 70,
    mobileImportance: 45,
    primaryObjective: 'Transform raw event data into actionable quantitative intelligence and reports',
    defaultEntities: [
      { name: 'Metric', description: 'Time-series quantitative indicator', fields: ['id', 'name', 'value', 'change', 'period'] },
      { name: 'Report', description: 'Collection of charts, pivots, and explanatory notes', fields: ['id', 'title', 'author', 'updatedAt'] },
      { name: 'Cohort', description: 'Segment of entities sharing common behavior', fields: ['id', 'criteria', 'size', 'retentionRate'] },
    ],
    defaultWorkflows: [
      { id: 'build-report', name: 'Construct custom chart visualization with filters', steps: ['select-dataset', 'choose-aggregation', 'apply-date-range', 'save-to-dashboard'] },
      { id: 'drilldown-anomaly', name: 'Inspect unexpected metric dip and isolate segment', steps: ['click-datapoint', 'segment-by-dimension', 'export-findings'] },
    ],
    recommendedScreens: [
      { name: 'Executive Overview', screenType: 'dashboard', purpose: 'High-level KPI scorecard and top drivers', jobs: ['scan-kpis', 'view-growth-rates'], required: true },
      { name: 'Metric Explorer', screenType: 'analytics-reporting', purpose: 'Interactive time-series canvas with drilldowns', jobs: ['slice-by-dimension', 'compare-cohorts'], required: true },
      { name: 'Reports Library', screenType: 'index-list', purpose: 'Scheduled and saved analyst dashboards', jobs: ['browse-reports', 'schedule-email'], required: true },
    ],
    requiredCapabilities: ['time-series-brushing', 'csv-export', 'density-toggle'],
    forbiddenPatterns: ['inaccurate-zero-scaling-on-bar-charts', 'sluggish-canvas-repaints'],
    defaultNavigationModel: 'classic-app-sidebar',
  },

  // 8. Intelligence / Research
  'intelligence-research': {
    id: 'intelligence-research',
    name: 'Research & Intelligence Platform',
    description: 'Deep investigative workspaces, evidence graphs, dossier profiles, and market intelligence.',
    keywords: [
      'intelligence',
      'research',
      'investigation',
      'dossier',
      'entities',
      'graph',
      'evidence',
      'osint',
      'market research',
      'laboratory',
      'scientific',
      'peer-reviewed',
      'chemical',
      'spectral',
      'synthesis',
      'reproducible',
    ],
    primaryAudience: 'Research analysts, investigative journalists, and risk officers',
    userSophistication: 85,
    trustRequirement: 95,
    informationComplexity: 92,
    dataDensity: 88,
    collaborationLevel: 65,
    transactionCriticality: 65,
    navigationComplexity: 80,
    mobileImportance: 30,
    primaryObjective: 'Synthesize heterogeneous source evidence into verified intelligence dossiers',
    defaultEntities: [
      { name: 'Entity', description: 'Investigated company, person, or asset node', fields: ['id', 'name', 'type', 'riskScore', 'relations'] },
      { name: 'Evidence', description: 'Verified document, filing, or signal reference', fields: ['id', 'source', 'confidence', 'extractedDate'] },
      { name: 'Dossier', description: 'Curated dossier binder and synthesis report', fields: ['id', 'title', 'analyst', 'classification'] },
    ],
    defaultWorkflows: [
      { id: 'investigate-entity', name: 'Search entity, map relationship network, and tag evidence', steps: ['global-search', 'expand-relations', 'highlight-findings', 'export-dossier'] },
      { id: 'configure-watchlist', name: 'Set automated monitoring triggers for entity changes', steps: ['define-alert-rules', 'select-entities', 'choose-cadence'] },
    ],
    recommendedScreens: [
      { name: 'Research Terminal', screenType: 'workspace-editor', purpose: 'Three-pane entity investigation workspace', jobs: ['expand-graph', 'annotate-evidence'], required: true },
      { name: 'Entity Index', screenType: 'search-explore', purpose: 'Global search across millions of verified profiles', jobs: ['faceted-lookup', 'filter-by-jurisdiction'], required: true },
      { name: 'Dossier Reader', screenType: 'detail-entity', purpose: 'Published long-form report with linked evidence footnotes', jobs: ['read-synthesis', 'verify-citations'], required: true },
      { name: 'Watchlists & Alerts', screenType: 'index-list', purpose: 'Active signal alerts and entity delta log', jobs: ['triage-alerts', 'mute-notifications'], required: false },
    ],
    requiredCapabilities: ['three-pane-layout', 'evidence-provenance-links', 'high-contrast-readability'],
    forbiddenPatterns: ['unverifiable-ai-summaries-without-citations', 'ephemeral-data-loss'],
    defaultNavigationModel: 'icon-rail-context-panel',
  },

  // 9. CRM
  crm: {
    id: 'crm',
    name: 'CRM & Pipeline',
    description: 'Customer relationship tracking, deal pipelines, contact activity logs, and outreach.',
    keywords: ['crm', 'sales', 'pipeline', 'deals', 'contacts', 'leads', 'outreach', 'customers', 'accounts'],
    primaryAudience: 'Account executives, sales directors, and relationship managers',
    userSophistication: 60,
    trustRequirement: 85,
    informationComplexity: 70,
    dataDensity: 75,
    collaborationLevel: 75,
    transactionCriticality: 80,
    navigationComplexity: 65,
    mobileImportance: 70,
    primaryObjective: 'Accelerate revenue velocity by tracking customer interactions and closing deals',
    defaultEntities: [
      { name: 'Contact', description: 'Individual prospect or customer contact', fields: ['id', 'name', 'email', 'company', 'stage'] },
      { name: 'Deal', description: 'Revenue opportunity progressing through sales stages', fields: ['id', 'title', 'amount', 'stage', 'closeDate'] },
      { name: 'Activity', description: 'Call note, email thread, or scheduled meeting', fields: ['id', 'type', 'notes', 'date', 'owner'] },
    ],
    defaultWorkflows: [
      { id: 'advance-deal', name: 'Drag deal through Kanban stage and log meeting note', steps: ['move-stage', 'log-interaction', 'set-followup-date'] },
      { id: 'import-leads', name: 'Upload CSV list of prospects and assign owners', steps: ['upload-csv', 'map-fields', 'distribute-to-reps'] },
    ],
    recommendedScreens: [
      { name: 'Pipeline Kanban', screenType: 'workspace-editor', purpose: 'Drag-and-drop visual sales stage progression', jobs: ['drag-deals', 'forecast-revenue'], required: true },
      { name: 'Contacts Directory', screenType: 'index-list', purpose: 'Searchable table of customer profiles', jobs: ['filter-leads', 'batch-email'], required: true },
      { name: 'Contact Detail', screenType: 'detail-entity', purpose: 'Chronological timeline of all client touchpoints', jobs: ['log-call', 'view-thread'], required: true },
    ],
    requiredCapabilities: ['kanban-drag-and-drop', 'inline-cell-editing', 'contact-timeline'],
    forbiddenPatterns: ['dropping-meeting-notes-on-tab-close', 'unresponsive-kanban-boards'],
    defaultNavigationModel: 'classic-app-sidebar',
  },

  // 10. ERP / Operations
  'erp-operations': {
    id: 'erp-operations',
    name: 'ERP & Operations',
    description: 'Supply chain management, asset inventory, procurement, and field work orders.',
    keywords: ['erp', 'operations', 'inventory', 'supply chain', 'warehouse', 'procurement', 'logistics', 'work orders'],
    primaryAudience: 'Operations controllers, plant managers, and procurement officers',
    userSophistication: 70,
    trustRequirement: 92,
    informationComplexity: 85,
    dataDensity: 90,
    collaborationLevel: 70,
    transactionCriticality: 85,
    navigationComplexity: 80,
    mobileImportance: 65,
    primaryObjective: 'Ensure operational continuity, track physical assets, and eliminate inventory bottlenecks',
    defaultEntities: [
      { name: 'Item', description: 'Physical inventory SKU with warehouse bin location', fields: ['id', 'sku', 'quantity', 'reorderPoint', 'location'] },
      { name: 'WorkOrder', description: 'Maintenance or assembly instruction dispatch', fields: ['id', 'title', 'technician', 'status', 'priority'] },
      { name: 'PurchaseOrder', description: 'Vendor supplier procurement authorization', fields: ['id', 'vendor', 'total', 'approvalStatus'] },
    ],
    defaultWorkflows: [
      { id: 'dispatch-work-order', name: 'Assign priority repair to field technician', steps: ['create-order', 'attach-specs', 'assign-technician', 'track-status'] },
      { id: 'receive-shipment', name: 'Scan incoming inventory items and update warehouse counts', steps: ['scan-manifest', 'verify-quantities', 'update-bins'] },
    ],
    recommendedScreens: [
      { name: 'Operations Overview', screenType: 'dashboard', purpose: 'Inventory turnover, active dispatches, and supply alerts', jobs: ['monitor-bottlenecks', 'approve-orders'], required: true },
      { name: 'Inventory Catalog', screenType: 'index-list', purpose: 'Multi-warehouse stock counts and reorder triggers', jobs: ['check-stock', 'initiate-reorder'], required: true },
      { name: 'Work Orders', screenType: 'workspace-editor', purpose: 'Gantt schedule and maintenance dispatcher', jobs: ['schedule-teams', 'signoff-completion'], required: true },
    ],
    requiredCapabilities: ['barcode-scanner-support', 'high-density-data-tables', 'offline-draft-mode'],
    forbiddenPatterns: ['slow-table-sorting', 'hidden-inventory-discrepancies'],
    defaultNavigationModel: 'icon-rail-context-panel',
  },

  // 11. Productivity
  productivity: {
    id: 'productivity',
    name: 'Consumer Productivity',
    description: 'Note-taking, task managers, personal knowledge bases, and habit trackers.',
    keywords: ['productivity', 'notes', 'tasks', 'todo', 'calendar', 'habits', 'personal', 'organizer', 'planner'],
    primaryAudience: 'Individuals, creators, and focused self-directed professionals',
    userSophistication: 50,
    trustRequirement: 75,
    informationComplexity: 45,
    dataDensity: 50,
    collaborationLevel: 30,
    transactionCriticality: 20,
    navigationComplexity: 40,
    mobileImportance: 90,
    primaryObjective: 'Minimize friction between thought and capture, keeping daily tasks organized',
    defaultEntities: [
      { name: 'Task', description: 'Actionable item with deadline and priority', fields: ['id', 'title', 'due', 'completed', 'tags'] },
      { name: 'Note', description: 'Rich text thought or document', fields: ['id', 'title', 'body', 'updatedAt'] },
      { name: 'ProjectList', description: 'Grouping container for related tasks and notes', fields: ['id', 'name', 'color', 'icon'] },
    ],
    defaultWorkflows: [
      { id: 'quick-capture', name: 'Press global hotkey, enter thought, and categorize', steps: ['invoke-capture', 'type-text', 'save'] },
      { id: 'plan-day', name: 'Review today agenda and check off morning goals', steps: ['open-today', 'reorder-priorities', 'execute'] },
    ],
    recommendedScreens: [
      { name: 'Today Agenda', screenType: 'dashboard', purpose: 'Focused view of immediate tasks and scheduled events', jobs: ['check-tasks', 'add-quick-note'], required: true },
      { name: 'Notes & Canvas', screenType: 'workspace-editor', purpose: 'Distraction-free Markdown editor', jobs: ['write-thoughts', 'link-notes'], required: true },
      { name: 'Calendar Schedule', screenType: 'workspace-editor', purpose: 'Week and month grid view', jobs: ['schedule-deadlines', 'block-time'], required: false },
    ],
    requiredCapabilities: ['instant-offline-save', 'markdown-shortcuts', 'fluid-keyboard-navigation'],
    forbiddenPatterns: ['sluggish-keystroke-latency', 'overly-cluttered-chrome'],
    defaultNavigationModel: 'workspace-tabs',
  },

  // 12. Education
  education: {
    id: 'education',
    name: 'Education Product',
    description: 'Course platforms, curriculum paths, learning quizzes, and student gradebooks.',
    keywords: ['education', 'learning', 'course', 'curriculum', 'quiz', 'student', 'teacher', 'lesson', 'academy'],
    primaryAudience: 'Learners, instructional designers, and classroom educators',
    userSophistication: 45,
    trustRequirement: 80,
    informationComplexity: 55,
    dataDensity: 50,
    collaborationLevel: 65,
    transactionCriticality: 45,
    navigationComplexity: 50,
    mobileImportance: 80,
    primaryObjective: 'Empower structured learning progression with engaging quizzes and milestone feedback',
    defaultEntities: [
      { name: 'Course', description: 'Instructional module bundle with lessons', fields: ['id', 'title', 'modules', 'progress'] },
      { name: 'Lesson', description: 'Video, reading, or interactive coding exercise', fields: ['id', 'title', 'duration', 'completed'] },
      { name: 'Quiz', description: 'Assessment with questions and graded rubrics', fields: ['id', 'questions', 'passingScore'] },
    ],
    defaultWorkflows: [
      { id: 'complete-lesson', name: 'Watch lesson video and submit check-in quiz', steps: ['view-material', 'answer-quiz', 'claim-xp', 'advance-next'] },
      { id: 'review-grades', name: 'Inspect cohort progress and leave feedback on essays', steps: ['open-gradebook', 'view-submission', 'assign-score'] },
    ],
    recommendedScreens: [
      { name: 'Learning Path', screenType: 'dashboard', purpose: 'Current course progress milestones and recommended next steps', jobs: ['resume-lesson', 'view-streaks'], required: true },
      { name: 'Lesson Classroom', screenType: 'workspace-editor', purpose: 'Split view video player and note-taking prompt', jobs: ['study-lesson', 'submit-quiz'], required: true },
      { name: 'Course Catalog', screenType: 'search-explore', purpose: 'Explore library of certifications and skills', jobs: ['browse-topics', 'enroll-course'], required: false },
    ],
    requiredCapabilities: ['video-bookmarking', 'gamification-streaks', 'quiz-feedback-animations'],
    forbiddenPatterns: ['confusing-progress-indicators', 'loss-of-quiz-state-on-reload'],
    defaultNavigationModel: 'workspace-tabs',
  },

  // 13. Creator
  creator: {
    id: 'creator',
    name: 'Creator Platform',
    description: 'Content authoring, fan memberships, post scheduling, and subscriber analytics.',
    keywords: ['creator', 'patreon', 'newsletter', 'fans', 'membership', 'subscribers', 'content', 'podcast'],
    primaryAudience: 'Independent authors, podcasters, video creators, and creative artists',
    userSophistication: 55,
    trustRequirement: 80,
    informationComplexity: 50,
    dataDensity: 55,
    collaborationLevel: 40,
    transactionCriticality: 70,
    navigationComplexity: 50,
    mobileImportance: 85,
    primaryObjective: 'Build a direct subscriber audience and monetize digital creative work',
    defaultEntities: [
      { name: 'Post', description: 'Published newsletter, video, or audio drop', fields: ['id', 'title', 'body', 'tier', 'publishedAt'] },
      { name: 'Subscriber', description: 'Paying fan or free email reader', fields: ['id', 'email', 'tier', 'joinedDate', 'status'] },
      { name: 'Tier', description: 'Pricing tier with exclusive perks', fields: ['id', 'name', 'price', 'perks'] },
    ],
    defaultWorkflows: [
      { id: 'publish-newsletter', name: 'Draft article, preview paywall cut, and send blast', steps: ['write-post', 'set-tier-gate', 'schedule-send'] },
      { id: 'payout-earnings', name: 'Review monthly membership revenue and request withdrawal', steps: ['view-earnings', 'select-bank', 'transfer'] },
    ],
    recommendedScreens: [
      { name: 'Creator Hub', screenType: 'dashboard', purpose: 'Subscriber growth, recent post engagement, and earnings', jobs: ['view-audience-metrics', 'start-draft'], required: true },
      { name: 'Post Editor', screenType: 'workspace-editor', purpose: 'Clean typography writing canvas with paywall toggles', jobs: ['write-post', 'preview-email'], required: true },
      { name: 'Audience Directory', screenType: 'index-list', purpose: 'List of subscribers and tier breakdown', jobs: ['filter-members', 'manage-complimentary-access'], required: true },
    ],
    requiredCapabilities: ['rich-text-editor', 'paywall-boundary-markers', 'subscriber-analytics-charts'],
    forbiddenPatterns: ['unintended-email-blasts-without-confirmation', 'slow-rich-text-input'],
    defaultNavigationModel: 'collapsible-app-sidebar',
  },

  // 14. Media
  media: {
    id: 'media',
    name: 'Media & Publishing',
    description: 'Newsrooms, digital magazines, video streaming, and high-volume article feeds.',
    keywords: ['media', 'news', 'publishing', 'article', 'editorial', 'magazine', 'journalism', 'stream', 'broadcast'],
    primaryAudience: 'Readers, viewers, editors, and digital journalists',
    userSophistication: 50,
    trustRequirement: 85,
    informationComplexity: 65,
    dataDensity: 60,
    collaborationLevel: 55,
    transactionCriticality: 40,
    navigationComplexity: 60,
    mobileImportance: 90,
    primaryObjective: 'Deliver breaking journalism, compelling editorial reads, and immersive streaming',
    defaultEntities: [
      { name: 'Article', description: 'Published story with byline, hero media, and body', fields: ['id', 'headline', 'author', 'section', 'publishedAt'] },
      { name: 'Section', description: 'Category vertical (e.g. Technology, Opinion)', fields: ['id', 'name', 'slug', 'editor'] },
      { name: 'Edition', description: 'Curated daily or weekly bundle', fields: ['id', 'date', 'featuredArticles'] },
    ],
    defaultWorkflows: [
      { id: 'read-article', name: 'Browse headline feed, open article, and adjust typography', steps: ['scan-feed', 'open-story', 'save-bookmark'] },
      { id: 'curate-frontpage', name: 'Editor adjusts top headline placement and Breaking ticker', steps: ['drag-stories', 'set-breaking-flag', 'publish-edition'] },
    ],
    recommendedScreens: [
      { name: 'Front Page Feed', screenType: 'marketing', purpose: 'Grid of hero top stories and section rivers', jobs: ['scan-breaking-news', 'choose-article'], required: true },
      { name: 'Article Reader', screenType: 'detail-entity', purpose: 'High-readability serif column with photo galleries and pullquotes', jobs: ['read-story', 'share'], required: true },
      { name: 'Section Explorer', screenType: 'index-list', purpose: 'Archive by topic and author bylines', jobs: ['filter-by-topic', 'search-archives'], required: false },
    ],
    requiredCapabilities: ['fast-lcp-typography', 'reading-progress-indicator', 'paywall-metering'],
    forbiddenPatterns: ['aggressive-intrusive-interstitials', 'poor-dark-mode-contrast'],
    defaultNavigationModel: 'minimal-top-bar',
  },

  // 15. Travel
  travel: {
    id: 'travel',
    name: 'Travel & Hospitality',
    description: 'Flight bookings, hotel reservations, destination itineraries, and guest services.',
    keywords: ['travel', 'hotel', 'flight', 'destination', 'itinerary', 'vacation', 'booking', 'hospitality', 'resort'],
    primaryAudience: 'Travelers, tourists, hotel concierges, and travel agents',
    userSophistication: 50,
    trustRequirement: 90,
    informationComplexity: 65,
    dataDensity: 60,
    collaborationLevel: 45,
    transactionCriticality: 90,
    navigationComplexity: 60,
    mobileImportance: 90,
    primaryObjective: 'Inspire destination discovery and provide seamless, transparent booking itineraries',
    defaultEntities: [
      { name: 'Destination', description: 'City or resort with lodging and attractions', fields: ['id', 'name', 'country', 'photos', 'rating'] },
      { name: 'Reservation', description: 'Secured flight, hotel, or excursion booking', fields: ['id', 'dates', 'guests', 'confirmationCode'] },
      { name: 'Itinerary', description: 'Day-by-day travel calendar with tickets and notes', fields: ['id', 'title', 'activities'] },
    ],
    defaultWorkflows: [
      { id: 'search-book-hotel', name: 'Select dates, pick room tier, and complete reservation', steps: ['enter-dates', 'filter-amenities', 'choose-room', 'pay-deposit'] },
      { id: 'view-mobile-pass', name: 'Open check-in barcode at hotel desk or airport gate', steps: ['open-itinerary', 'display-qr-code'] },
    ],
    recommendedScreens: [
      { name: 'Destination Showcase', screenType: 'marketing', purpose: 'Full-bleed photography and curated packages', jobs: ['explore-trips', 'search-dates'], required: true },
      { name: 'Property Detail', screenType: 'detail-entity', purpose: 'Room galleries, reviews, and interactive map', jobs: ['inspect-room', 'select-package'], required: true },
      { name: 'Trip Itinerary', screenType: 'workspace-editor', purpose: 'Chronological timeline of tickets and hotel confirmations', jobs: ['view-schedule', 'offline-access'], required: true },
    ],
    requiredCapabilities: ['interactive-map-clustering', 'offline-pass-storage', 'currency-conversion'],
    forbiddenPatterns: ['surprise-resort-fees-at-checkout', 'missing-cancellation-terms'],
    defaultNavigationModel: 'minimal-top-bar',
  },

  // 16. Real Estate
  'real-estate': {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Property listings, mortgage calculators, interactive floorplans, and agent inquiries.',
    keywords: ['real estate', 'property', 'homes', 'realtor', 'mortgage', 'listing', 'floorplan', 'rent', 'buy'],
    primaryAudience: 'Home buyers, renters, property developers, and real estate brokers',
    userSophistication: 55,
    trustRequirement: 95,
    informationComplexity: 70,
    dataDensity: 65,
    collaborationLevel: 45,
    transactionCriticality: 92,
    navigationComplexity: 65,
    mobileImportance: 85,
    primaryObjective: 'Help buyers and renters evaluate properties with comprehensive spatial and financial data',
    defaultEntities: [
      { name: 'Property', description: 'Residential or commercial real estate listing', fields: ['id', 'address', 'price', 'beds', 'baths', 'sqft'] },
      { name: 'Agent', description: 'Licensed broker representing the property', fields: ['id', 'name', 'phone', 'brokerage'] },
      { name: 'Tour', description: 'Scheduled in-person or virtual walkthrough', fields: ['id', 'date', 'timeSlot', 'status'] },
    ],
    defaultWorkflows: [
      { id: 'search-properties', name: 'Filter by school district, bedrooms, and price range', steps: ['draw-map-polygon', 'apply-filters', 'save-search'] },
      { id: 'schedule-viewing', name: 'Select available open house slot and confirm with agent', steps: ['pick-time', 'enter-contact', 'calendar-invite'] },
    ],
    recommendedScreens: [
      { name: 'Property Search', screenType: 'search-explore', purpose: 'Search property listings, compare key details, and arrange a viewing', jobs: ['filter-listings', 'compare-properties'], required: true },
      { name: 'Property Profile', screenType: 'detail-entity', purpose: 'Virtual 3D tour, tax history, floorplans, and agent card', jobs: ['view-floorplan', 'calculate-mortgage'], required: true },
      { name: 'Saved Homes', screenType: 'index-list', purpose: 'Comparison matrix of favorited properties', jobs: ['compare-sqft-cost', 'share-with-partner'], required: false },
    ],
    requiredCapabilities: ['map-polygon-search', 'virtual-tour-embed', 'mortgage-calculator'],
    forbiddenPatterns: ['outdated-pending-listings-shown-as-active', 'forced-registration-before-first-photo'],
    defaultNavigationModel: 'search-first-header',
  },

  // 17. Recruitment / HR
  recruitment: {
    id: 'recruitment',
    name: 'Recruitment & People Operations',
    description: 'Applicant tracking (ATS), candidate pipelines, interview scorecards, and onboarding.',
    keywords: ['employee experience','employee','human resources','people operations','recruitment', 'hr', 'hiring', 'ats', 'candidates', 'jobs', 'interviews', 'onboarding', 'employees', 'people'],
    primaryAudience: 'Recruiters, hiring managers, candidates, and HR directors',
    userSophistication: 60,
    trustRequirement: 88,
    informationComplexity: 70,
    dataDensity: 75,
    collaborationLevel: 80,
    transactionCriticality: 65,
    navigationComplexity: 65,
    mobileImportance: 60,
    primaryObjective: 'Streamline collaborative hiring decisions and provide warm, respectful candidate experiences',
    defaultEntities: [
      { name: 'Candidate', description: 'Job applicant with resume, portfolio, and stage', fields: ['id', 'name', 'email', 'role', 'stage', 'rating'] },
      { name: 'JobRequisition', description: 'Open headcount role with team requirements', fields: ['id', 'title', 'department', 'location', 'openings'] },
      { name: 'Scorecard', description: 'Structured rubric interview evaluation and notes', fields: ['id', 'interviewer', 'decision', 'strengths', 'concerns'] },
    ],
    defaultWorkflows: [
      { id: 'evaluate-candidate', name: 'Review resume, conduct interview, and submit scorecard', steps: ['view-cv', 'take-interview-notes', 'score-competencies', 'advance-stage'] },
      { id: 'extend-offer', name: 'Generate offer letter, approval flow, and send to candidate', steps: ['input-compensation', 'manager-approval', 'send-docusign'] },
    ],
    recommendedScreens: [
      { name: 'Hiring Pipeline', screenType: 'workspace-editor', purpose: 'Applicant stage Kanban board with quick review filters', jobs: ['move-candidates', 'schedule-rounds'], required: true },
      { name: 'Candidate Profile', screenType: 'detail-entity', purpose: 'Resume preview, interview feedback summary, and email history', jobs: ['read-scorecards', 'leave-comment'], required: true },
      { name: 'Requisitions Index', screenType: 'index-list', purpose: 'Active company job postings and pipeline health', jobs: ['open-new-role', 'check-time-to-hire'], required: true },
    ],
    requiredCapabilities: ['resume-pdf-previewer', 'structured-interview-rubrics', 'collaborative-commenting'],
    forbiddenPatterns: ['unblinded-evaluations-causing-bias', 'accidental-rejection-email-dispatches'],
    defaultNavigationModel: 'classic-app-sidebar',
  },

  // 18. Consumer
  consumer: {
    id: 'consumer',
    name: 'Consumer Applications',
    description: 'Social networking, personal discovery, media sharing, and mobile-first consumer utilities.',
    keywords: ['consumer', 'social', 'mobile app', 'sharing', 'community', 'discovery', 'feed', 'friends', 'profile'],
    primaryAudience: 'Everyday consumers, mobile users, and community members',
    userSophistication: 40,
    trustRequirement: 70,
    informationComplexity: 40,
    dataDensity: 40,
    collaborationLevel: 70,
    transactionCriticality: 30,
    navigationComplexity: 40,
    mobileImportance: 95,
    primaryObjective: 'Provide instant social discovery, effortless expression, and lightweight delights',
    defaultEntities: [
      { name: 'Profile', description: 'User persona with avatar, bio, and activity', fields: ['id', 'handle', 'name', 'avatar', 'followers'] },
      { name: 'Post', description: 'Social update with photos, video, and comments', fields: ['id', 'author', 'content', 'likes', 'createdAt'] },
      { name: 'Notification', description: 'Social ping regarding likes, replies, and mentions', fields: ['id', 'type', 'sender', 'unread'] },
    ],
    defaultWorkflows: [
      { id: 'browse-feed', name: 'Scroll infinite stream, like posts, and leave comments', steps: ['scroll-stream', 'double-tap-like', 'post-reply'] },
      { id: 'create-story', name: 'Snap photo, add stickers, and publish to friends', steps: ['camera-capture', 'add-caption', 'publish-to-feed'] },
    ],
    recommendedScreens: [
      { name: 'Activity Stream', screenType: 'dashboard', purpose: 'Personalized chronological and algorithmic social stream', jobs: ['view-posts', 'like-and-share'], required: true },
      { name: 'User Profile', screenType: 'detail-entity', purpose: 'Grid of published media and user bio', jobs: ['edit-profile', 'view-posts-grid'], required: true },
      { name: 'Notifications Feed', screenType: 'messages-collaboration', purpose: 'Activity triage and direct messages', jobs: ['check-mentions', 'reply-to-dm'], required: true },
    ],
    requiredCapabilities: ['infinite-virtualized-feed', 'haptic-feedback-hooks', 'instant-image-uploader'],
    forbiddenPatterns: ['clunky-desktop-first-modals', 'slow-cold-start-times'],
    defaultNavigationModel: 'mobile-bottom-nav',
  },
};

/**
 * High-information phrases that identify a product domain more reliably than
 * broad words such as "workspace", "stream", or "order". The general keyword
 * lists above remain useful supporting evidence, while these signals anchor
 * primary archetype selection.
 */
const ARCHETYPE_PRIMARY_SIGNALS: Record<string, string[]> = {
  saas: ['saas', 'software as a service', 'b2b software', 'business software', 'subscription software', 'multi-tenant'],
  ai: ['artificial intelligence', 'large language model', 'generative', 'generative audio', 'image generation', 'image-generation', 'autonomous agent', 'ai agent', 'agentic', 'copilot', 'llm', 'prompt'],
  'developer-tools': ['developer tool', 'developer portal', 'software engineer', 'platform engineer', 'devops', 'api', 'sdk', 'cli', 'command-line', 'kubernetes', 'source control', 'source-control', 'pull request', 'continuous integration', 'feature flag', 'feature-flag', 'distributed tracing', 'observability', 'webhook', 'deployment monitor'],
  fintech: ['fintech', 'financial service', 'financial account', 'banking', 'wealth management', 'asset allocation', 'corporate card', 'reimbursement', 'payment processing', 'money transfer', 'ledger', 'portfolio', 'market data'],
  ecommerce: ['e-commerce', 'ecommerce', 'online store', 'online shopping', 'shopping cart', 'product catalog', 'storefront', 'returns portal', 'checkout', 'retail'],
  marketplace: ['marketplace', 'two-sided platform', 'two-sided marketplace', 'buyers and sellers', 'seller marketplace', 'booking marketplace', 'independent suppliers'],
  analytics: ['analytics', 'business intelligence', 'business-intelligence', 'data visualization', 'experiment analysis', 'cohort analysis', 'metrics dashboard', 'kpi', 'warehouse tables', 'saved reports'],
  'intelligence-research': ['research platform', 'scientific research', 'climate science', 'field research', 'literature review', 'evidence dossier', 'intelligence research', 'investigative research', 'investigative newsroom', 'research analyst', 'provenance'],
  crm: ['crm', 'customer relationship', 'customer relationship management', 'sales pipeline', 'sales crm', 'customer success', 'account management', 'renewal management', 'contact management'],
  'erp-operations': ['erp', 'enterprise resource planning', 'supply chain', 'manufacturing', 'facilities management', 'field service', 'work order', 'work-order', 'inventory management', 'procurement', 'warehouse operations', 'maintenance operations', 'production facilities'],
  productivity: ['productivity app', 'task management', 'note-taking', 'notes app', 'personal planner', 'to-do', 'todo app', 'habit journal', 'daily journal', 'personal knowledge base', 'agenda planner'],
  education: ['education platform', 'learning platform', 'learning management system', 'lms', 'online course', 'cohort learning', 'classroom', 'course catalog', 'lesson classroom'],
  creator: ['creator platform', 'creator economy', 'independent creator', 'creator tools', 'newsletter platform', 'subscriber membership', 'digital illustration', 'artist portfolio'],
  media: ['media platform', 'newsroom', 'news publication', 'digital magazine', 'journalism', 'public radio', 'radio service', 'episode archive', 'editorial publication', 'broadcast service'],
  travel: ['travel service', 'travel planning', 'trip planner', 'trip-planning', 'travel itinerary', 'hotel booking', 'flight booking', 'destination guide', 'travelers', 'hospitality'],
  'real-estate': ['real estate', 'real-estate', 'home search', 'home-search', 'property management', 'property listing', 'commercial leasing', 'residential manager', 'mortgage', 'realtor', 'realty'],
  recruitment: ['recruitment', 'recruiting', 'talent acquisition', 'applicant tracking', 'candidate pipeline', 'candidate portal', 'hiring workspace', 'interview panel', 'employee experience', 'human resources', 'people operations', 'hr platform'],
  consumer: ['consumer app', 'consumer application', 'social network', 'social app', 'neighborhood social', 'community app', 'social feed', 'mobile-first consumer'],
};

function matchesKeyword(normalizedText: string, keyword: string): boolean {
  const normalizedKeyword = keyword.toLowerCase().replace(/[-_]+/g, ' ');
  const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(normalizedText);
}

const MIN_SECONDARY_ARCHETYPE_SCORE = 28;
const MIN_SECONDARY_ARCHETYPE_SHARE = 0.45;

/**
 * Detects matching product archetypes from a natural language text brief.
 * Returns array of matched archetypes with weights between 0 and 100.
 */
export function detectProductArchetypes(
  briefText: string,
  explicitOverride?: string
): Array<{ tag: string; weight: number }> {
  if (explicitOverride && PRODUCT_ARCHETYPES[explicitOverride]) {
    return [{ tag: explicitOverride, weight: 100 }];
  }

  const normalized = briefText.toLowerCase().replace(/[-_]+/g, ' ');
  const scores: Record<string, number> = {};

  for (const [key, arch] of Object.entries(PRODUCT_ARCHETYPES)) {
    let score = 0;
    const primarySignals = ARCHETYPE_PRIMARY_SIGNALS[key] ?? [];
    const matchedPrimarySignals = primarySignals.filter((signal) => matchesKeyword(normalized, signal));

    // Specific language is stronger evidence than a collection of generic
    // cues. Multi-word signals receive a small additional weight.
    score += matchedPrimarySignals.reduce((total, signal) => total + (signal.includes(' ') || signal.includes('-') ? 60 : 48), 0);

    for (const kw of arch.keywords) {
      if (!matchedPrimarySignals.includes(kw) && matchesKeyword(normalized, kw)) score += kw.includes(' ') ? 16 : 8;
    }

    if (score > 0) {
      scores[key] = score;
    }
  }

  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0 || !entries[0]) {
    // Default fallback to SaaS
    return [{ tag: 'saas', weight: 80 }];
  }

  const topScore = entries[0][1];
  return entries
    .filter(([, score], index) => index === 0 || (score >= MIN_SECONDARY_ARCHETYPE_SCORE && score >= topScore * MIN_SECONDARY_ARCHETYPE_SHARE))
    .slice(0, 3)
    .map(([tag, score]) => ({
      tag,
      weight: Math.min(100, Math.max(20, Math.round((score / topScore) * 100))),
    }));
}

/**
 * Retrieves archetype definition by id.
 */
export function getProductArchetype(id: string): ArchetypeDefinition | undefined {
  return PRODUCT_ARCHETYPES[id];
}

/**
 * Retrieves all 18 product archetypes.
 */
export function getAllProductArchetypes(): ArchetypeDefinition[] {
  return Object.values(PRODUCT_ARCHETYPES);
}
