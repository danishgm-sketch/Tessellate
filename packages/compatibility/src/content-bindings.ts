import type { ProductModel, ScreenNode } from '@tessellate/schemas';

/** Deterministic, serialisable content: examples are identified, never customer claims. */
function humanizeWorkflowLabel(value: string): string {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return words ? words[0]!.toUpperCase() + words.slice(1) : 'Workspace activity';
}

export function bindResourceContent(
  product: ProductModel,
  screen: ScreenNode,
  role: string,
  screens: ScreenNode[],
  resourceSlug: string,
  briefDescription = ''
): Record<string, unknown> {
  const employee = product.entities.some((entity) => entity.name === 'Employee');
  const primaryArchetype = product.productArchetypes[0]?.tag ?? '';
  const isCommunity = /community|neighborhood/i.test(
    `${product.primaryAudience} ${product.primaryObjective}`
  );
  const isCommunityActivity = isCommunity && screen.name === 'Activity Stream';
  const isNotificationScreen = /notifications?|inbox|alerts/i.test(screen.name);
  const isTradingTerminal =
    primaryArchetype === 'fintech' &&
    /market depth|equity trade|trading terminal|order book/i.test(
      `${product.primaryObjective} ${briefDescription}`
    );
  const isReturnsPortal =
    primaryArchetype === 'ecommerce' &&
    /\b(?:returns? portal|return approval|refund steps|refund status|return request|previous purchase)\b/i.test(
      `${briefDescription} ${product.primaryObjective}`
    );
  const brand =
    role === 'channels-rail'
      ? 'Example channels'
      : employee
        ? 'People & Teams'
        : isCommunity
          ? 'Example Community'
          : isTradingTerminal
            ? 'Market Workspace'
            : `${product.entities[0]?.name ?? 'Team'} Workspace`;
  const brandWords = brand.match(/[A-Za-z0-9]+/g) ?? [];
  const initials = employee
    ? 'PT'
    : brandWords
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .padEnd(2, brandWords[0]?.[1]?.toUpperCase() ?? 'W');
  const links = screens
    .filter((item) => item.navigationVisibility !== 'hidden' && !item.slug.includes(':'))
    .map((item) => ({ label: item.name, href: `#${item.id}` }));
  const ctaCopyByArchetype: Record<string, string> = {
    ai: 'Try the workspace',
    analytics: 'Explore analytics',
    creator: 'Explore creators',
    ecommerce: 'View product details',
    education: 'Explore courses',
    fintech: 'Explore accounts',
    marketplace: 'Explore listings',
    media: 'Read stories',
    productivity: 'Open your workspace',
    'real-estate': 'Search properties',
    recruitment: 'View open roles',
    saas: 'Open your workspace',
    travel: 'Explore destinations',
  };
  const primaryActionLabel = employee
    ? 'Meet your team'
    : isCommunity
      ? 'See community updates'
      : isReturnsPortal
        ? 'Find an order'
        : (ctaCopyByArchetype[primaryArchetype] ?? 'Explore the workspace');
  const targetPatternsByArchetype: Record<string, RegExp> = {
    ecommerce: /product detail/i,
    education: /learning|course|catalog/i,
    marketplace: /listing|marketplace|discover/i,
    media: /article|story|feed|library/i,
    'real-estate': /property|listing|search|map/i,
    recruitment: /candidate|hiring|requisition|jobs/i,
    travel: /destination|trip|travel|search/i,
  };
  const preferredTargetPattern = employee
    ? /onboarding|welcome/i
    : isReturnsPortal
      ? /order lookup/i
      : (targetPatternsByArchetype[primaryArchetype] ?? /overview|dashboard|home|workspace/i);
  const primaryActionScreen =
    screens.find((item) => preferredTargetPattern.test(item.name)) ??
    screens.find((item) => /overview|dashboard|home|workspace/i.test(item.name)) ??
    screens[0];
  const secondaryActionScreen = screens.find((item) => item.id !== primaryActionScreen?.id);
  const primaryActionHref = primaryActionScreen ? `#${primaryActionScreen.id}` : undefined;
  const secondaryActionHref = secondaryActionScreen
    ? `#${secondaryActionScreen.id}`
    : primaryActionHref;
  const headline = employee ? 'A better workday starts with people.' : product.primaryObjective;
  const description = employee
    ? 'Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.'
    : isReturnsPortal
      ? 'Find a previous purchase, choose eligible items, and follow each return and refund step.'
      : `A workspace for ${product.primaryAudience.toLowerCase()}. ${product.primaryObjective}.`;
  const items = employee
    ? [
        {
          title: 'A warm welcome',
          description:
            'Meet your buddy, discover your team and complete onboarding at your own pace.',
          detail: 'Onboarding',
        },
        {
          title: 'People, connected',
          description: 'Find colleagues and understand the teams around you.',
          detail: 'People directory',
        },
        {
          title: 'A voice for everyone',
          description: 'Make space for feedback, recognition and conversations.',
          detail: 'Engagement',
        },
        {
          title: 'Clarity you can trust',
          description: 'Keep organisational policies and account preferences easy to find.',
          detail: 'Settings & policies',
        },
      ]
    : isReturnsPortal
      ? [
          {
            title: 'Find a purchase',
            description: 'Look up an order and review the items included in it.',
            detail: 'Order lookup',
          },
          {
            title: 'Choose eligible items',
            description: 'Select what to return and record a reason for each item.',
            detail: 'Return request',
          },
          {
            title: 'Follow refund progress',
            description: 'See approval, return delivery, and refund status together.',
            detail: 'Refund status',
          },
        ]
      : product.entities.map((entity) => ({
          title: entity.name,
          description: entity.description ?? entity.name,
          detail: 'Example content',
        }));
  const conversationExamples = /freelance|designer|proposal/i.test(briefDescription)
    ? [
        {
          time: 'Example exchange',
          title: 'Project inquiry',
          desc: 'A client shares a brief and asks an independent designer about the work.',
        },
        {
          time: 'Example exchange',
          title: 'Proposal reply',
          desc: 'A designer outlines a possible scope and the next step.',
        },
      ]
    : product.productArchetypes[0]?.tag === 'marketplace'
      ? [
          {
            time: 'Example exchange',
            title: 'Listing question',
            desc: 'A buyer asks the seller about listing details and next steps.',
          },
          {
            time: 'Example exchange',
            title: 'Seller reply',
            desc: 'The seller responds with information relevant to the listing.',
          },
        ]
      : /community|neighborhood|hobby group/i.test(briefDescription)
        ? [
            {
              time: 'Example exchange',
              title: 'Community update',
              desc: 'A member shares a local update with a nearby group.',
            },
            {
              time: 'Example exchange',
              title: 'Neighbor reply',
              desc: 'Another member adds context to the conversation.',
            },
          ]
        : [
            {
              time: 'Example exchange',
              title: 'New conversation',
              desc: 'A team member shares a question about the current work.',
            },
            {
              time: 'Example exchange',
              title: 'Follow-up',
              desc: 'A colleague responds with context and a suggested next step.',
            },
          ];
  const events =
    role === 'message-thread'
      ? conversationExamples
      : employee
        ? [
            {
              time: 'Today',
              title: 'Welcome to the team',
              desc: 'Meet your onboarding buddy and introduce yourself to colleagues.',
            },
            {
              time: 'This week',
              title: 'Team check-in',
              desc: 'Share how your first week is going and ask for support.',
            },
            {
              time: 'Next milestone',
              title: 'Policies and preferences',
              desc: 'Review organisational guidance and choose your notification preferences.',
            },
          ]
        : isReturnsPortal && role === 'activity-feed'
          ? [
              {
                time: 'Example',
                title: 'Return request received',
                desc: 'The request is being reviewed against the original order and selected items.',
              },
              {
                time: 'Example',
                title: 'Refund progress updated',
                desc: 'Approval, return delivery, and refund steps appear in one timeline.',
              },
            ]
          : isCommunityActivity
            ? [
                {
                  time: 'Example',
                  title: 'A neighbour shared a local update',
                  desc: 'A local question or story can start a conversation with nearby group members.',
                },
                {
                  time: 'Example',
                  title: 'A hobby group welcomed new members',
                  desc: 'Shared-interest groups can bring introductions and upcoming events together.',
                },
              ]
            : product.workflows.slice(0, 3).map((workflow) => ({
                time: 'Example',
                title: humanizeWorkflowLabel(workflow.name),
                desc:
                  workflow.steps.map(humanizeWorkflowLabel).join(' → ') ||
                  'Example activity from this workflow.',
              }));
  const count = briefDescription
    .match(/\b([\d,]+)[ -]+(?:person|employee|people)/i)?.[1]
    ?.replaceAll(',', '');
  const titles: Record<string, string> = employee
    ? {
        'metric-cards': 'Your organisation at a glance',
        'summary-kpis': 'Your organisation at a glance',
        'activity-feed': 'People updates',
        'activity-timeline': 'Recent employee activity',
        'data-table': screen.name === 'Teams' ? 'Team directory' : 'People and teams',
        'wizard-content': 'Your onboarding journey',
        'progress-stepper': 'Welcome milestones',
        'value-proposition': 'Made for everyday employee experiences',
      }
    : isReturnsPortal
      ? {
          'metric-cards': 'Return overview',
          'activity-feed': 'Return progress',
          'data-table': 'Orders and returns',
        }
      : {};
  const content: Record<string, unknown> = {
    title:
      role === 'message-thread'
        ? `Example ${screen.name}`
        : role === 'activity-feed'
          ? (titles[role] ??
            (isCommunityActivity
              ? 'Latest community updates'
              : isNotificationScreen
                ? 'Recent notifications'
                : 'Recent activity'))
          : role === 'hero' || role === 'conversion-cta'
            ? headline
            : (titles[role] ?? screen.name),
    brand,
    links,
    eyebrow: 'Example organisation · sample content',
    badge: 'EXAMPLE',
    initials,
    headline,
    subheadline: description,
    description,
    subtitle: screen.purpose,
    panelTitle: employee ? 'Your first weeks, made clearer' : 'Your workspace',
    panels: items.slice(0, 3).map((item, index) => ({
      id: `panel-${index}`,
      label: item.detail,
      text: `${item.title}\n${item.description}`,
    })),
    primaryCta: { label: primaryActionLabel, href: primaryActionHref },
    secondaryCta: {
      label: employee ? 'Explore onboarding' : 'See how it works',
      href: secondaryActionHref,
    },
    note: 'Example interface · replace sample data with your organisation',
    items,
    events,
    cards: employee
      ? [
          {
            label: 'People',
            val: count ?? '—',
            status: count ? 'From your brief' : 'No connected data',
          },
          { label: 'Onboarding', val: '—', status: 'No connected data' },
          { label: 'Team pulse', val: '—', status: 'No connected data' },
        ]
      : product.entities.map((entity) => ({
          label: entity.name,
          val: '—',
          status: isTradingTerminal ? 'Market data not connected' : 'No connected data',
        })),
    rows: employee
      ? [
          {
            id: 1,
            name: 'Example colleague A',
            type: 'Product team',
            quality: 80,
            status: 'Onboarding',
          },
          {
            id: 2,
            name: 'Example colleague B',
            type: 'Engineering team',
            quality: 100,
            status: 'Settled in',
          },
          {
            id: 3,
            name: 'Example colleague C',
            type: 'People team',
            quality: 40,
            status: 'Welcome week',
          },
        ]
      : product.entities.map((entity, index) => ({
          id: index + 1,
          name: `Example ${entity.name}`,
          type: entity.description ?? 'Record',
          quality: 0,
          status: 'Sample',
        })),
    columnLabels: {
      name: employee ? 'Colleague' : 'Record',
      type: employee ? 'Team' : 'Context',
      quality: 'Progress',
      status: 'Status',
    },
    columns: employee
      ? [
          { title: 'Discover', tasks: ['Meet your buddy', 'Find your team'] },
          { title: 'Connect', tasks: ['Introduce yourself', 'Join a team check-in'] },
          {
            title: 'Feel at home',
            tasks: ['Read organisational policies', 'Share your first-week feedback'],
          },
        ]
      : product.workflows.map((workflow) => ({ title: workflow.name, tasks: workflow.steps })),
    label:
      role === 'conversion-cta'
        ? primaryActionLabel
        : role === 'message-composer'
          ? 'Write a message'
          : role === 'auth-card'
            ? 'Work email'
            : role === 'settings-form'
              ? isReturnsPortal
                ? 'Return reason'
                : 'Notification preferences'
              : role === 'save-footer'
                ? isReturnsPortal
                  ? 'Submit return request'
                  : 'Save preferences'
                : role === 'auth-footer'
                  ? 'Sign in requires your authentication backend'
                  : 'Continue onboarding',
    placeholder:
      role === 'message-composer'
        ? 'Write a message…'
        : role === 'settings-form' && isReturnsPortal
          ? 'Describe why these items are being returned'
          : undefined,
    helperText:
      role === 'message-composer'
        ? 'Example input. Connect a messaging backend to send messages.'
        : role === 'settings-form' && isReturnsPortal
          ? 'Example field. Connect order data and a returns service in the exported application.'
          : 'Example field. Connect persistence and your backend in the exported application.',
    children:
      role === 'save-footer'
        ? isReturnsPortal
          ? 'Submit return request'
          : 'Save preferences'
        : role === 'auth-footer'
          ? 'Authentication backend required'
          : 'Continue',
    disabled: ['save-footer', 'auth-footer', 'action-controls'].includes(role),
    href: primaryActionHref,
  };
  if (role === 'save-footer' && isReturnsPortal) {
    content.title = 'Connect a returns service before submitting requests.';
  }
  if (role === 'order-summary') {
    const item = product.entities.find((entity) => /product|item|listing/i.test(entity.name));
    content.title = 'Order summary · example';
    content.rows = [
      {
        id: 1,
        name: `Example ${item?.name ?? 'item'}`,
        type: 'Sample cart item',
        quality: 0,
        displayValue: 'Price from your catalogue',
        status: 'Example',
      },
    ];
    content.columnLabels = { name: 'Item', type: 'Details', quality: 'Price', status: 'State' };
  }
  if (role === 'payment-fields') {
    content.label = 'Payment provider';
    content.placeholder = 'Connect a provider to enable checkout';
    content.helperText = 'Preview only. This field does not collect or store payment details.';
    content.disabled = true;
    content.title = 'A payment provider is required before checkout can be enabled.';
  }
  if (role === 'submit-button') {
    content.children = 'Payment provider required';
    content.disabled = true;
    content.title = 'Connect a payment provider before enabling payment submission.';
  }
  if (
    content.disabled &&
    role !== 'payment-fields' &&
    role !== 'submit-button' &&
    !(role === 'save-footer' && isReturnsPortal)
  ) {
    content.title = 'Connect the exported application to your backend to enable this action.';
  }
  const accepted: Record<string, string[]> = {
    'minimal-top-nav': ['brand', 'links', 'orientation'],
    'marketing-nav-cta': ['brand', 'links'],
    'collapsible-sidebar': ['brand', 'links'],
    'editorial-hero': ['eyebrow', 'headline', 'subheadline', 'primaryCta', 'secondaryCta', 'note'],
    'split-product-hero': [
      'badge',
      'headline',
      'description',
      'primaryCta',
      'secondaryCta',
      'panelTitle',
      'panels',
    ],
    'feature-bento': ['title', 'items'],
    'feature-matrix': ['title', 'items'],
    'cta-minimal': ['headline', 'description', 'label', 'href'],
    'footer-product': ['brand', 'description', 'links'],
    'entity-profile-header': ['title', 'subtitle', 'badge', 'initials'],
    'dashboard-kpi-grid': ['title', 'cards'],
    timeline: ['title', 'events'],
    'notification-centre': ['title', 'events'],
    'advanced-data-table': ['title', 'rows', 'columnLabels'],
    'kanban-board': ['title', 'columns'],
    button: ['children', 'disabled', 'title'],
    'magnetic-button': ['label', 'disabled', 'title'],
    input: ['label', 'helperText', 'placeholder', 'disabled', 'title'],
  };
  return Object.fromEntries(
    (accepted[resourceSlug] ?? [])
      .filter((key) => content[key] !== undefined)
      .map((key) => [key, content[key]])
  );
}
