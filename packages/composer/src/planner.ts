import {
  type ProductModel,
  type ScreenGraph,
  type ScreenGroup,
  type ScreenNode,
  type ScreenEdge,
  ScreenGraphSchema,
} from '@tessellate/schemas';
import { SCREEN_CLASS_GRAMMARS } from './screen-grammar.js';

export interface ScreenPlanResult {
  screenGraph: ScreenGraph;
  totalScreens: number;
  requiredScreensCount: number;
  optionalScreensCount: number;
  inferredAssumptions: string[];
}

const GROUP_DETAILS = {
  marketing: { id: 'group-marketing', name: 'Marketing' },
  app: { id: 'group-app', name: 'Application' },
  auth: { id: 'group-auth', name: 'Account access' },
  settings: { id: 'group-settings', name: 'Settings & administration' },
  utility: { id: 'group-utility', name: 'Tasks & support' },
} as const;

const LEGACY_SCREEN_IDS: Record<string, string> = {
  'marketing home': 'screen-marketing-home',
  'storefront catalog': 'screen-marketing-home',
  'front page feed': 'screen-marketing-home',
  'destination showcase': 'screen-marketing-home',
  'overview dashboard': 'screen-overview',
  'documentation and sdks': 'screen-documentation',
  'documentation api': 'screen-documentation',
  'billing and usage': 'screen-billing',
  'billing subscriptions': 'screen-billing',
  'sign in': 'screen-sign-in',
};

const ALL_DEVICE_TARGETS = ['desktop', 'tablet', 'mobile'] as const;

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(',')}}`;
}

function stableScreenGraphId(productModel: ProductModel, archetype: string): string {
  let hash = 0x811c9dc5;
  for (const character of canonicalize(productModel)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 0x01000193);
  }
  return `graph-${archetype}-${(hash >>> 0).toString(36)}`;
}

function normalizeName(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function toSlug(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function requiredRolesForScreen(
  productModel: ProductModel,
  screenName: string,
  screenType: string,
  grammarRoles: string[]
): string[] {
  const communityActivityStream =
    screenType === 'dashboard' &&
    normalizeName(screenName) === 'activity stream' &&
    productModel.productArchetypes.some((archetype) => archetype.tag === 'consumer') &&
    productModel.entities.some((entity) => entity.name === 'Community Update');
  const returnsPortalRequest =
    screenType === 'settings' &&
    normalizeName(screenName) === 'return request' &&
    productModel.productArchetypes.some((archetype) => archetype.tag === 'ecommerce') &&
    /return|refund/i.test(
      `${productModel.primaryObjective} ${JSON.stringify(productModel.workflows)}`
    );

  // A chronological community stream is the primary content, not a KPI
  // dashboard. Requiring metric cards here creates invented summary data.
  return communityActivityStream
    ? grammarRoles.filter((role) => role !== 'metric-cards')
    : returnsPortalRequest
      ? grammarRoles.filter((role) => role !== 'settings-nav')
      : grammarRoles;
}

function pluralizePath(value: string): string {
  const slug = toSlug(value);
  if (slug === 'person') return 'people';
  if (slug === 'child') return 'children';
  if (slug.endsWith('y') && !/[aeiou]y$/.test(slug)) return `${slug.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(slug)) return `${slug}es`;
  return `${slug}s`;
}

function routeForScreen(name: string, screenType: string, productModel: ProductModel): string {
  const normalized = normalizeName(name);
  const slug = toSlug(name) || 'screen';

  if (
    screenType === 'marketing' &&
    /\b(marketing home|storefront catalog|front page feed|destination showcase)\b/.test(normalized)
  ) {
    return '/';
  }
  if (screenType === 'authentication')
    return /\b(sign up|register|create account)\b/.test(normalized) ? '/sign-up' : '/sign-in';
  if (screenType === 'billing-account') return '/billing';
  if (normalized === 'people directory') return '/people';
  if (normalized === 'teams') return '/teams';
  if (normalized === 'onboarding') return '/onboarding';
  if (normalized === 'engagement') return '/engagement';
  if (screenType === 'settings' && /\b(settings|preferences)\b/.test(normalized))
    return '/settings';
  if (screenType === 'dashboard' && /\b(overview|dashboard)\b/.test(normalized)) return '/overview';
  if (screenType === 'documentation') return '/docs';
  if (screenType === 'support' && /\b(order confirmation|confirmation)\b/.test(normalized))
    return '/order-confirmation';

  if (screenType === 'detail-entity') {
    if (normalized === 'employee profile') return '/people/:id';
    const entity = productModel.entities.find((candidate) =>
      normalized.includes(normalizeName(candidate.name))
    );
    const entityPath = entity
      ? pluralizePath(entity.name)
      : pluralizePath(slug.replace(/-(detail|profile|reader)$/, ''));
    return `/${entityPath}/:id`;
  }

  return `/${slug}`;
}

function screenIdForSuggestion(name: string, screenType: string, usedIds: Set<string>): string {
  const normalized = normalizeName(name);
  const legacyId = LEGACY_SCREEN_IDS[normalized];
  if (legacyId && !usedIds.has(legacyId)) return legacyId;

  const stableTypeId: Record<string, string> = {
    dashboard: 'screen-overview',
    'index-list': 'screen-collection-index',
    'workspace-editor': 'screen-workspace',
    settings: 'screen-settings',
    'billing-account': 'screen-billing',
    authentication: 'screen-sign-in',
    documentation: 'screen-documentation',
  };
  const preferred = stableTypeId[screenType];
  if (preferred && !usedIds.has(preferred)) return preferred;

  const base = `screen-${toSlug(name) || toSlug(screenType)}`;
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  return id;
}

function expectedDataForScreen(
  productModel: ProductModel,
  name: string,
  purpose: string,
  screenType: string
): string[] {
  if (screenType === 'marketing' || screenType === 'authentication') return [];

  const semanticText = normalizeName(`${name} ${purpose}`);
  const entityAliases: Record<string, string[]> = {
    employee: ['people', 'person', 'colleague', 'staff'],
    team: ['teams', 'colleagues'],
    policy: ['policies', 'guidance'],
  };
  const matchingEntities = productModel.entities.filter(
    (entity) =>
      semanticText.includes(normalizeName(entity.name)) ||
      (entityAliases[normalizeName(entity.name)] ?? []).some((alias) =>
        semanticText.includes(alias)
      )
  );
  const relevantEntities =
    matchingEntities.length > 0 ? matchingEntities : productModel.entities.slice(0, 1);
  return relevantEntities
    .flatMap((entity) => (entity.fields ?? []).map((field) => `${entity.name}.${field}`))
    .slice(0, 12);
}

function matchesConstraint(screen: ScreenNode, constraint: string): boolean {
  const target = normalizeName(constraint);
  return [screen.id, screen.name, screen.slug, screen.screenType].some((value) => {
    const candidate = normalizeName(value);
    return candidate === target || candidate.includes(target) || target.includes(candidate);
  });
}

function isForbidden(screen: ScreenNode, forbiddenScreens: Set<string>): boolean {
  const fields = [screen.id, screen.name, screen.slug, screen.screenType].map(normalizeName);
  return [...forbiddenScreens].some((constraint) => {
    const target = normalizeName(constraint);
    return fields.some(
      (field) => field === target || field.includes(target) || target.includes(field)
    );
  });
}

function deduplicateRoutes(screens: ScreenNode[]): void {
  const used = new Set<string>();
  for (const screen of screens) {
    const normalized = screen.slug.toLocaleLowerCase().replace(/\/+$/, '') || '/';
    if (!used.has(normalized)) {
      used.add(normalized);
      continue;
    }

    const suffix = toSlug(screen.name) || toSlug(screen.id);
    let candidate = `/${suffix}`;
    let index = 2;
    while (used.has(candidate.toLocaleLowerCase())) candidate = `/${suffix}-${index++}`;
    screen.slug = candidate;
    used.add(candidate.toLocaleLowerCase());
  }
}

function planFallbackScreens(productModel: ProductModel) {
  const entity = productModel.entities[0];
  const entityName = entity?.name ?? 'Workspace';
  return [
    {
      name: 'Overview',
      screenType: 'dashboard',
      purpose: productModel.primaryObjective,
      jobs: productModel.jobsToBeDone.slice(0, 2),
      required: true,
    },
    {
      name: `${entityName} Directory`,
      screenType: 'index-list',
      purpose:
        entity?.description ?? `Browse and manage ${entityName.toLocaleLowerCase()} records.`,
      jobs: productModel.jobsToBeDone.slice(1, 3),
      required: false,
    },
  ];
}

/**
 * Builds a validated, domain-specific graph from the interpreter's screen
 * recommendations. The planner adapts navigation and device relevance without
 * replacing the product's semantic screen architecture with generic pages.
 */
export function planScreenGraph(productModel: ProductModel): ScreenPlanResult {
  const assumptions: string[] = [];
  const primaryArchetypeTag = productModel.productArchetypes[0]?.tag ?? 'saas';
  const constraints = productModel.constraints;
  const forbiddenScreens = new Set(
    (constraints.forbiddenScreens ?? []).map((value) => normalizeName(value))
  );
  const explicitRequiredScreens = constraints.requiredScreens ?? [];
  const targetDevices =
    constraints.targetDevices.length > 0 ? constraints.targetDevices : [...ALL_DEVICE_TARGETS];
  const hasBillingIntent =
    productModel.likelyScreens.some((screen) => screen.screenType === 'billing-account') ||
    [
      ...productModel.jobsToBeDone,
      ...productModel.workflows.map((workflow) => `${workflow.id} ${workflow.name}`),
      productModel.primaryObjective,
    ].some((value) =>
      /\b(billing|subscriptions?|invoices?|paid plans?|pricing|monetiz|monetis|payment plans?|charge customers)\b/i.test(
        value
      )
    );

  if (!hasBillingIntent) {
    assumptions.push(
      'Billing omitted because the product model does not indicate a paid plan or billing workflow.'
    );
  }

  const suggestions =
    productModel.likelyScreens.length > 0
      ? productModel.likelyScreens
      : planFallbackScreens(productModel);
  const usedIds = new Set<string>();
  const screens: ScreenNode[] = [];

  for (const suggestion of suggestions) {
    const grammar = SCREEN_CLASS_GRAMMARS[suggestion.screenType];
    if (!grammar) {
      throw new Error(
        `Cannot plan screen "${suggestion.name}": unsupported screen type "${suggestion.screenType}".`
      );
    }
    if (suggestion.screenType === 'billing-account' && !hasBillingIntent) continue;

    const id = screenIdForSuggestion(suggestion.name, suggestion.screenType, usedIds);
    usedIds.add(id);
    const screen: ScreenNode = {
      id,
      name: suggestion.name,
      slug: routeForScreen(suggestion.name, suggestion.screenType, productModel),
      screenType: suggestion.screenType,
      purpose: suggestion.purpose,
      jobs: suggestion.jobs ?? [],
      required: suggestion.required ?? false,
      navigationVisibility: grammar.defaultVisibility,
      importance: suggestion.required ? 85 : 60,
      expectedData: expectedDataForScreen(
        productModel,
        suggestion.name,
        suggestion.purpose,
        suggestion.screenType
      ),
      requiredRoles: requiredRolesForScreen(
        productModel,
        suggestion.name,
        suggestion.screenType,
        grammar.requiredRoles
      ),
      optionalRoles: grammar.optionalRoles,
      deviceRelevance: [...targetDevices],
    };
    if (!isForbidden(screen, forbiddenScreens)) screens.push(screen);
  }

  for (const constraint of explicitRequiredScreens) {
    const existing = screens.find((screen) => matchesConstraint(screen, constraint));
    if (existing) {
      existing.required = true;
      continue;
    }

    const screenType = Object.keys(SCREEN_CLASS_GRAMMARS).find(
      (candidate) => normalizeName(candidate) === normalizeName(constraint)
    );
    const grammar = screenType ? SCREEN_CLASS_GRAMMARS[screenType] : undefined;
    if (!screenType || !grammar || forbiddenScreens.has(normalizeName(screenType))) {
      throw new Error(
        `Cannot satisfy required screen "${constraint}": no recommended screen or supported screen class matches it.`
      );
    }

    const id = screenIdForSuggestion(constraint, screenType, usedIds);
    usedIds.add(id);
    const addedScreen: ScreenNode = {
      id,
      name: constraint,
      slug: grammar.defaultSlug,
      screenType,
      purpose: `${productModel.primaryObjective} (${constraint})`,
      jobs: productModel.jobsToBeDone.slice(0, 2),
      required: true,
      navigationVisibility: grammar.defaultVisibility,
      importance: 90,
      expectedData: expectedDataForScreen(
        productModel,
        constraint,
        productModel.primaryObjective,
        screenType
      ),
      requiredRoles: requiredRolesForScreen(
        productModel,
        constraint,
        screenType,
        grammar.requiredRoles
      ),
      optionalRoles: grammar.optionalRoles,
      deviceRelevance: [...targetDevices],
    };
    if (isForbidden(addedScreen, forbiddenScreens)) {
      throw new Error(
        `Cannot satisfy required screen "${constraint}": it is also excluded by forbiddenScreens.`
      );
    }
    screens.push(addedScreen);
  }

  deduplicateRoutes(screens);

  // Mobile and deeply nested products should expose a short primary nav. The
  // complete screen set remains available through secondary navigation.
  if (
    targetDevices.includes('mobile') &&
    (productModel.mobileImportance >= 65 || productModel.navigationComplexity >= 70)
  ) {
    const primary = screens.filter((screen) => screen.navigationVisibility === 'primary');
    if (primary.length > 5) {
      const keepPrimary = new Set(
        [...primary]
          .sort(
            (left, right) =>
              Number(right.required) - Number(left.required) || right.importance - left.importance
          )
          .slice(0, 5)
          .map((screen) => screen.id)
      );
      for (const screen of primary) {
        if (!keepPrimary.has(screen.id)) screen.navigationVisibility = 'secondary';
      }
      assumptions.push(
        'Long navigation adapted for mobile: five high-priority destinations remain primary; other screens remain in secondary navigation.'
      );
    }
  }

  const screensByGroup = new Map<keyof typeof GROUP_DETAILS, ScreenNode[]>();
  for (const screen of screens) {
    const group = SCREEN_CLASS_GRAMMARS[screen.screenType]!.defaultGroup;
    const existing = screensByGroup.get(group) ?? [];
    existing.push(screen);
    screensByGroup.set(group, existing);
  }
  const groups: ScreenGroup[] = Object.entries(GROUP_DETAILS)
    .filter(([key]) => (screensByGroup.get(key as keyof typeof GROUP_DETAILS)?.length ?? 0) > 0)
    .map(([key, detail]) => ({
      id: detail.id,
      name: detail.name,
      screens: screensByGroup.get(key as keyof typeof GROUP_DETAILS) ?? [],
    }));

  const visibleScreens = screens.filter((screen) => screen.navigationVisibility !== 'hidden');
  const marketingHome = visibleScreens.find(
    (screen) => screen.screenType === 'marketing' && screen.slug === '/'
  );
  const applicationHome =
    visibleScreens.find(
      (screen) =>
        screen.navigationVisibility === 'primary' &&
        SCREEN_CLASS_GRAMMARS[screen.screenType]!.defaultGroup === 'app'
    ) ??
    visibleScreens.find(
      (screen) => SCREEN_CLASS_GRAMMARS[screen.screenType]!.defaultGroup === 'app'
    );
  const entryScreen = marketingHome ?? applicationHome ?? visibleScreens[0];
  const edges: ScreenEdge[] = [];
  if (marketingHome && applicationHome && marketingHome.id !== applicationHome.id) {
    edges.push({
      id: `edge-${marketingHome.id}-to-${applicationHome.id}`,
      fromScreenId: marketingHome.id,
      toScreenId: applicationHome.id,
      label: 'Open the product',
    });
  }

  for (const screen of visibleScreens) {
    if (
      !entryScreen ||
      screen.id === entryScreen.id ||
      screen.id === applicationHome?.id ||
      screen.id === marketingHome?.id
    )
      continue;
    let source = applicationHome ?? entryScreen;
    if (screen.screenType === 'detail-entity') {
      const routeBase = screen.slug.replace(/\/:\w+$/, '').toLocaleLowerCase();
      const listing = visibleScreens.find(
        (candidate) =>
          ['index-list', 'search-explore'].includes(candidate.screenType) &&
          (routeBase === candidate.slug.toLocaleLowerCase() ||
            routeBase.startsWith(`${candidate.slug.toLocaleLowerCase()}/`))
      );
      if (listing) source = listing;
    }
    if (screen.screenType === 'documentation' && marketingHome) source = marketingHome;
    edges.push({
      id: `edge-${source.id}-to-${screen.id}`,
      fromScreenId: source.id,
      toScreenId: screen.id,
      label: screen.name,
    });
  }

  const authScreen = screens.find((screen) => screen.screenType === 'authentication');
  if (authScreen && entryScreen && authScreen.id !== entryScreen.id) {
    edges.push({
      id: `edge-${entryScreen.id}-to-${authScreen.id}`,
      fromScreenId: entryScreen.id,
      toScreenId: authScreen.id,
      label: 'Sign in',
    });
  }
  if (authScreen && applicationHome && authScreen.id !== applicationHome.id) {
    edges.push({
      id: `edge-${authScreen.id}-to-${applicationHome.id}`,
      fromScreenId: authScreen.id,
      toScreenId: applicationHome.id,
      label: 'Continue after sign in',
    });
  }

  const screenGraph = ScreenGraphSchema.parse({
    id: stableScreenGraphId(productModel, primaryArchetypeTag),
    groups,
    edges,
  });

  const requiredScreensCount = screens.filter((screen) => screen.required).length;
  return {
    screenGraph,
    totalScreens: screens.length,
    requiredScreensCount,
    optionalScreensCount: screens.length - requiredScreensCount,
    inferredAssumptions: assumptions,
  };
}
