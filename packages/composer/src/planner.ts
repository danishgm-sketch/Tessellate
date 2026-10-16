import {
  type ProductModel,
  type ScreenGraph,
  type ScreenGroup,
  type ScreenNode,
  type ScreenEdge,
  ScreenGraphSchema,
} from '@tessellate/schemas';
import { getScreenClassGrammar } from './screen-grammar.js';

export interface ScreenPlanResult {
  screenGraph: ScreenGraph;
  totalScreens: number;
  requiredScreensCount: number;
  optionalScreensCount: number;
  inferredAssumptions: string[];
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(',')}}`;
}

function stableScreenGraphId(productModel: ProductModel, archetype: string): string {
  let hash = 0x811c9dc5;
  for (const character of canonicalize(productModel)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 0x01000193);
  }
  return `graph-${archetype}-${(hash >>> 0).toString(36)}`;
}

/**
 * Deterministically constructs a validated ScreenGraph from a ProductModel.
 * Follows required/optional screen rules, groups screens logically, and connects navigation edges.
 */
export function planScreenGraph(productModel: ProductModel): ScreenPlanResult {
  const assumptions: string[] = [];
  const primaryArchetypeTag = productModel.productArchetypes[0]?.tag ?? 'saas';
  const constraints = productModel.constraints;
  const forbiddenScreens = new Set(
    (constraints.forbiddenScreens ?? []).map((s) => s.toLowerCase().trim())
  );
  const explicitRequiredScreens = new Set(
    (constraints.requiredScreens ?? []).map((s) => s.toLowerCase().trim())
  );

  const isCommerceOrPaidSaaS =
    ['saas', 'ecommerce', 'marketplace', 'fintech'].includes(primaryArchetypeTag) ||
    productModel.jobsToBeDone.some((j) => /bill|pay|subscri|purchas/i.test(j));

  if (!isCommerceOrPaidSaaS) {
    assumptions.push('Billing and payment screens omitted: product intent does not imply commercial transactions.');
  }

  // 1. Marketing Group
  const marketingNodes: ScreenNode[] = [];
  if (!forbiddenScreens.has('marketing') && !forbiddenScreens.has('home')) {
    const grammar = getScreenClassGrammar('marketing');
    marketingNodes.push({
      id: 'screen-marketing-home',
      name: 'Marketing Home',
      slug: '/',
      screenType: 'marketing',
      purpose: 'Product value proposition, interactive preview, and conversion funnel.',
      jobs: ['explain-product-value', 'initiate-signup'],
      required: true,
      navigationVisibility: 'primary',
      importance: 90,
      expectedData: ['headline', 'socialProof', 'pricingSummary'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
  }

  // Optional Docs screen for technical products
  const isTechnicalProduct =
    ['developer-tools', 'ai', 'analytics', 'intelligence-research'].includes(primaryArchetypeTag) ||
    productModel.userSophistication >= 70;

  if (isTechnicalProduct && !forbiddenScreens.has('documentation') && !forbiddenScreens.has('docs')) {
    const grammar = getScreenClassGrammar('documentation');
    marketingNodes.push({
      id: 'screen-documentation',
      name: 'Documentation & API',
      slug: '/docs',
      screenType: 'documentation',
      purpose: 'Technical integration guides, API endpoints, and SDK references.',
      jobs: ['read-api-docs', 'inspect-code-samples'],
      required: false,
      navigationVisibility: 'primary',
      importance: 70,
      expectedData: ['codeSnippets', 'apiSchema', 'endpoints'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
    assumptions.push('Included API documentation screen: technical audience and high developer sophistication detected.');
  }

  // 2. Core Application Group
  const appNodes: ScreenNode[] = [];

  // Overview / Dashboard Screen
  if (!forbiddenScreens.has('dashboard') && !forbiddenScreens.has('overview')) {
    const grammar = getScreenClassGrammar('dashboard');
    appNodes.push({
      id: 'screen-overview',
      name: 'Overview Dashboard',
      slug: '/overview',
      screenType: 'dashboard',
      purpose: 'Central operational telemetry, KPI scorecard, and high-priority action queue.',
      jobs: productModel.jobsToBeDone.slice(0, 2),
      required: true,
      navigationVisibility: 'primary',
      importance: 95,
      expectedData: ['kpiMetrics', 'recentActivity', 'alerts'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
  }

  // Specialized Screen based on primary archetype
  if (['intelligence-research', 'ai', 'crm', 'productivity'].includes(primaryArchetypeTag)) {
    const grammar = getScreenClassGrammar('workspace-editor');
    appNodes.push({
      id: 'screen-workspace',
      name: 'Workspace Canvas',
      slug: '/workspace',
      screenType: 'workspace-editor',
      purpose: 'Direct manipulation authoring canvas, multi-pane exploration, and active items.',
      jobs: ['create-and-edit-items', 'inspect-details'],
      required: true,
      navigationVisibility: 'primary',
      importance: 90,
      expectedData: ['workingCanvasState', 'entityAttributes'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
  }

  // Collection Index Screen
  if (!forbiddenScreens.has('index-list') && !forbiddenScreens.has('entities')) {
    const grammar = getScreenClassGrammar('index-list');
    const entityName = productModel.entities[0]?.name ?? 'Items';
    appNodes.push({
      id: 'screen-collection-index',
      name: `${entityName} Directory`,
      slug: `/${entityName.toLowerCase()}s`,
      screenType: 'index-list',
      purpose: `Searchable, filterable catalog of all ${entityName.toLowerCase()} records.`,
      jobs: ['search-and-filter-records', 'bulk-actions'],
      required: true,
      navigationVisibility: 'primary',
      importance: 85,
      expectedData: ['recordRows', 'filterFacets', 'paginationState'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
  }

  // Single Entity Detail Screen
  if (!forbiddenScreens.has('detail-entity') && !forbiddenScreens.has('detail')) {
    const grammar = getScreenClassGrammar('detail-entity');
    const entityName = productModel.entities[0]?.name ?? 'Item';
    appNodes.push({
      id: 'screen-entity-detail',
      name: `${entityName} Detail`,
      slug: `/${entityName.toLowerCase()}s/:id`,
      screenType: 'detail-entity',
      purpose: `Deep inspection, metadata attributes, timeline, and actions for a single ${entityName.toLowerCase()}.`,
      jobs: ['inspect-attributes', 'edit-record-state'],
      required: false,
      navigationVisibility: 'secondary',
      importance: 75,
      expectedData: ['recordDetails', 'activityHistory', 'linkedRelations'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
  }

  // Analytics Screen (for products with data complexity)
  if (
    (productModel.dataDensity >= 70 || primaryArchetypeTag === 'analytics') &&
    !forbiddenScreens.has('analytics')
  ) {
    const grammar = getScreenClassGrammar('analytics-reporting');
    appNodes.push({
      id: 'screen-analytics',
      name: 'Analytics & Insights',
      slug: '/analytics',
      screenType: 'analytics-reporting',
      purpose: 'Deep time-series breakdown, cohort retention, and reporting exports.',
      jobs: ['analyze-trends', 'export-csv'],
      required: false,
      navigationVisibility: 'primary',
      importance: 75,
      expectedData: ['timeSeriesPoints', 'cohortCurves'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
    assumptions.push('Included Analytics & Insights screen: high data density score (>= 70) detected.');
  }

  // 3. Settings & Administration Group
  const settingsNodes: ScreenNode[] = [];

  // General Settings
  if (!forbiddenScreens.has('settings')) {
    const grammar = getScreenClassGrammar('settings');
    settingsNodes.push({
      id: 'screen-settings',
      name: 'Settings & Preferences',
      slug: '/settings',
      screenType: 'settings',
      purpose: 'User profile, notification triggers, security keys, and display theme.',
      jobs: ['update-profile', 'configure-notifications'],
      required: true,
      navigationVisibility: 'secondary',
      importance: 60,
      expectedData: ['userProfile', 'notificationPreferences'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
  }

  // Billing (Conditional on commercial intent)
  if (isCommerceOrPaidSaaS && !forbiddenScreens.has('billing')) {
    const grammar = getScreenClassGrammar('billing-account');
    settingsNodes.push({
      id: 'screen-billing',
      name: 'Billing & Subscriptions',
      slug: '/billing',
      screenType: 'billing-account',
      purpose: 'Plan upgrades, payment method on file, and download invoices.',
      jobs: ['change-subscription-tier', 'download-invoices'],
      required: false,
      navigationVisibility: 'secondary',
      importance: 65,
      expectedData: ['currentPlan', 'usageMeters', 'invoicesList'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
    assumptions.push('Included Billing & Subscriptions screen: commercial / SaaS monetization intent confirmed.');
  }

  // 4. Authentication Group
  const authNodes: ScreenNode[] = [];
  if (!forbiddenScreens.has('auth') && !forbiddenScreens.has('sign-in')) {
    const grammar = getScreenClassGrammar('authentication');
    authNodes.push({
      id: 'screen-sign-in',
      name: 'Sign In',
      slug: '/sign-in',
      screenType: 'authentication',
      purpose: 'User authentication with GitHub OAuth and session tokens.',
      jobs: ['authenticate-user'],
      required: true,
      navigationVisibility: 'hidden',
      importance: 80,
      expectedData: ['authCredentials'],
      requiredRoles: grammar.requiredRoles,
      optionalRoles: grammar.optionalRoles,
    });
  }

  // Domain-specific screen intents must survive generic planning. A dashboard
  // keyword does not turn an employee platform into an analytics product.
  if (productModel.entities.some(entity=>entity.name==='Employee')) {
    const overview = appNodes.find(screen=>screen.id==='screen-overview');
    if (overview) { overview.name='Team Overview'; overview.purpose='Employee summary, onboarding progress and team pulse'; overview.expectedData=['employeeSummary','onboardingProgress','teamPulse']; }
    const directory = appNodes.find(screen=>screen.id==='screen-collection-index');
    if (directory) {directory.name='People Directory'; directory.slug='/people';}
    const detail = appNodes.find(screen=>screen.id==='screen-entity-detail');
    if (detail) {detail.name='Employee Profile'; detail.slug='/people/:id';}
    const settings = settingsNodes.find(screen=>screen.id==='screen-settings');
    if (settings) {settings.name='Settings & Policies'; settings.purpose='Organisational policies, notifications and account preferences';}
    for (const intended of productModel.likelyScreens.filter(screen=>['Teams','Onboarding','Engagement'].includes(screen.name))) {
      const slug = `/${intended.name.toLowerCase()}`;
      if (forbiddenScreens.has(intended.name.toLowerCase()) || forbiddenScreens.has(intended.screenType)) continue;
      const grammar = getScreenClassGrammar(intended.screenType);
      appNodes.push({id:`screen-${intended.name.toLowerCase()}`,name:intended.name,slug,screenType:intended.screenType,purpose:intended.purpose,jobs:intended.jobs ?? [],required:true,navigationVisibility:'primary',importance:85,expectedData:[],requiredRoles:grammar.requiredRoles,optionalRoles:grammar.optionalRoles});
    }
  }

  // Enforce explicit required screens
  for (const exp of explicitRequiredScreens) {
    const allNodes = [...marketingNodes, ...appNodes, ...settingsNodes, ...authNodes];
    const match = allNodes.find(
      (n) => n.id.includes(exp) || n.slug.includes(exp) || n.name.toLowerCase().includes(exp)
    );
    if (match) {
      match.required = true;
    }
  }

  // Construct groups
  const groups: ScreenGroup[] = [];
  if (marketingNodes.length > 0) {
    groups.push({ id: 'group-marketing', name: 'Marketing', screens: marketingNodes });
  }
  if (appNodes.length > 0) {
    groups.push({ id: 'group-app', name: 'Application', screens: appNodes });
  }
  if (settingsNodes.length > 0) {
    groups.push({ id: 'group-settings', name: 'Settings & Administration', screens: settingsNodes });
  }
  if (authNodes.length > 0) {
    groups.push({ id: 'group-auth', name: 'Authentication', screens: authNodes });
  }

  // Construct navigation edges
  const edges: ScreenEdge[] = [
    { id: 'edge-marketing-to-signin', fromScreenId: 'screen-marketing-home', toScreenId: 'screen-sign-in', label: 'Start building / Sign in' },
    { id: 'edge-signin-to-overview', fromScreenId: 'screen-sign-in', toScreenId: 'screen-overview', label: 'Successful authentication' },
    { id: 'edge-overview-to-collection', fromScreenId: 'screen-overview', toScreenId: 'screen-collection-index', label: 'View all items' },
  ];

  if (appNodes.some((n) => n.id === 'screen-entity-detail')) {
    edges.push({
      id: 'edge-collection-to-detail',
      fromScreenId: 'screen-collection-index',
      toScreenId: 'screen-entity-detail',
      label: 'Select item row',
    });
  }

  const screenGraph = ScreenGraphSchema.parse({
    id: stableScreenGraphId(productModel, primaryArchetypeTag),
    groups,
    edges,
  });

  const allScreens = groups.flatMap((g) => g.screens);
  const requiredCount = allScreens.filter((s) => s.required).length;
  const optionalCount = allScreens.length - requiredCount;

  return {
    screenGraph,
    totalScreens: allScreens.length,
    requiredScreensCount: requiredCount,
    optionalScreensCount: optionalCount,
    inferredAssumptions: assumptions,
  };
}
