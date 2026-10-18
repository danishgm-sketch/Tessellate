import type { ArchetypeDefinition } from './archetypes.js';

export function isEmployeeExperienceBrief(text: string): boolean {
  return (
    /\b(employee(?:s| experience)?|human resources|people operations|hr platform|hr management)\b/i.test(
      text
    ) && !/\b(applicant tracking|recruitment pipeline)\b/i.test(text)
  );
}

/** Specialise the existing people-operations archetype without inventing another stack. */
export function specialisePeopleOperations(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  if (base.id !== 'recruitment' || !isEmployeeExperienceBrief(text)) return base;
  return {
    ...base,
    name: 'Employee Experience',
    primaryAudience: 'Employees, team leads and people operations teams',
    primaryObjective:
      'Deliver a connected employee experience where colleagues build team relationships, complete onboarding, share feedback and access organisational policies',
    userSophistication: 55,
    informationComplexity: 55,
    dataDensity: 55,
    transactionCriticality: 30,
    defaultEntities: [
      {
        name: 'Employee',
        description: 'A colleague with a team, role and onboarding progress',
        fields: ['id', 'name', 'team', 'role', 'onboardingStatus'],
      },
      {
        name: 'Team',
        description: 'A group of colleagues with a shared purpose and manager',
        fields: ['id', 'name', 'manager', 'members'],
      },
      {
        name: 'Policy',
        description: 'Organisational guidance with acknowledgement history',
        fields: ['id', 'title', 'version', 'acknowledgedAt'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'onboard-employee',
        name: 'Welcome a colleague and complete onboarding milestones',
        steps: ['meet-buddy', 'read-policies', 'join-team', 'complete-check-in'],
      },
      {
        id: 'employee-engagement',
        name: 'Share a team pulse and recognise a colleague',
        steps: ['share-feedback', 'recognise-colleague', 'review-team-pulse'],
      },
      {
        id: 'manage-policies',
        name: 'Review organisational policies and notification preferences',
        steps: ['read-policy', 'acknowledge-policy', 'save-preferences'],
      },
    ],
    recommendedScreens: [
      {
        name: 'Marketing Home',
        screenType: 'marketing',
        purpose: 'Introduce a warm, connected employee experience',
        jobs: ['discover-platform'],
        required: true,
      },
      {
        name: 'Team Overview',
        screenType: 'dashboard',
        purpose: 'Refined employee summary and upcoming team actions',
        jobs: ['review-team-pulse', 'review-onboarding'],
        required: true,
      },
      {
        name: 'People Directory',
        screenType: 'index-list',
        purpose: 'Find colleagues and their teams',
        jobs: ['find-colleague'],
        required: true,
      },
      {
        name: 'Teams',
        screenType: 'index-list',
        purpose: 'Explore team membership and shared priorities',
        jobs: ['find-team'],
        required: true,
      },
      {
        name: 'Onboarding',
        screenType: 'onboarding',
        purpose: 'Playful welcome journey with clear milestones',
        jobs: ['complete-onboarding'],
        required: true,
      },
      {
        name: 'Engagement',
        screenType: 'dashboard',
        purpose: 'Review employee feedback and recognition',
        jobs: ['share-feedback', 'recognise-colleague'],
        required: true,
      },
      {
        name: 'Settings & Policies',
        screenType: 'settings',
        purpose: 'Conservative policy acknowledgements and account preferences',
        jobs: ['acknowledge-policy', 'save-preferences'],
        required: true,
      },
    ],
    requiredCapabilities: [
      'people-directory',
      'team-membership',
      'onboarding-checklist',
      'policy-acknowledgements',
    ],
  };
}

/** Separate institutional market tooling from the fintech archetype's banking defaults. */
export function specialiseFintechTrading(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  if (
    base.id !== 'fintech' ||
    !/\b(?:trading terminal|brokerage terminal|brokerage|order[- ]book|market depth|equity dealers?)\b/i.test(
      text
    )
  ) {
    return base;
  }

  return {
    ...base,
    name: 'Trading Terminal',
    primaryAudience: 'Professional equity dealers and trading teams',
    primaryObjective:
      'Monitor market depth, assess portfolio exposure, and execute verified trades',
    userSophistication: 92,
    informationComplexity: 95,
    dataDensity: 96,
    transactionCriticality: 100,
    navigationComplexity: 86,
    defaultEntities: [
      {
        name: 'Security',
        description: 'A listed equity with a ticker, venue, market price, and trading status',
        fields: ['id', 'ticker', 'exchange', 'bid', 'ask', 'currency', 'status'],
      },
      {
        name: 'Order',
        description: 'A verified market or limit order with quantity, side, and execution state',
        fields: ['id', 'securityId', 'side', 'quantity', 'orderType', 'limitPrice', 'status'],
      },
      {
        name: 'Position',
        description: 'A trading position with exposure, valuation, and risk limits',
        fields: ['id', 'securityId', 'quantity', 'marketValue', 'exposure', 'riskLimit'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'monitor-market-depth',
        name: 'Review market depth and compare liquidity across listed securities',
        steps: ['select-security', 'review-market-depth', 'compare-liquidity'],
      },
      {
        id: 'execute-verified-trade',
        name: 'Prepare and verify an equity trade within risk limits',
        steps: ['enter-order-terms', 'review-risk-checks', 'confirm-trade'],
      },
      {
        id: 'review-portfolio-risk',
        name: 'Review position exposure and portfolio risk limits',
        steps: ['compare-position-exposure', 'review-risk-limits', 'resolve-risk-alert'],
      },
    ],
    recommendedScreens: [
      {
        name: 'Market Overview',
        screenType: 'dashboard',
        purpose: 'Monitor market breadth, active securities, and high-priority risk changes',
        jobs: ['review-market-depth', 'review-risk-alerts'],
        required: true,
      },
      {
        name: 'Order Book',
        screenType: 'index-list',
        purpose: 'Compare bid and ask depth, liquidity, and order status by security',
        jobs: ['inspect-order-book', 'compare-liquidity'],
        required: true,
      },
      {
        name: 'Positions & Risk',
        screenType: 'dashboard',
        purpose: 'Review portfolio exposure against documented trading risk limits',
        jobs: ['review-position-exposure', 'resolve-risk-alert'],
        required: true,
      },
      {
        name: 'Trade History',
        screenType: 'index-list',
        purpose: 'Inspect verified equity trade executions and their audit trail',
        jobs: ['review-executions', 'inspect-trade-audit'],
        required: true,
      },
    ],
    requiredCapabilities: [
      ...base.requiredCapabilities,
      'market-depth-review',
      'equity-trade-controls',
      'portfolio-risk-limits',
    ],
  };
}

/** Replace broad archetype defaults when a brief names a distinct marketplace transaction. */
export function specialiseMarketplace(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  if (base.id !== 'marketplace') return base;
  const brief = text.toLocaleLowerCase();
  const screens = (exchangeName: string, exchangePurpose: string, exchangeJobs: string[]) =>
    base.recommendedScreens.map((screen) => {
      if (screen.name === 'Explore Listings') {
        return {
          ...screen,
          purpose: 'Search relevant listings, compare options, and contact the other party',
        };
      }
      if (screen.name === 'Listing Detail') {
        return {
          ...screen,
          purpose: 'Review the listing, seller profile, terms, and verified feedback',
        };
      }
      if (screen.name === 'Booking Flow') {
        return {
          ...screen,
          name: exchangeName,
          screenType: 'detail-entity',
          purpose: exchangePurpose,
          jobs: exchangeJobs,
        };
      }
      if (screen.name === 'Messages & Inquiries') {
        return {
          ...screen,
          purpose: 'Discuss the listing and agree the next step with the other party',
        };
      }
      return screen;
    });

  if (
    /\b(freelance|freelancer|independent designer|project proposal|client proposal)\b/.test(brief)
  ) {
    return {
      ...base,
      defaultEntities: [
        {
          name: 'Listing',
          description: 'Designer profile and services available to prospective clients',
          fields: ['id', 'title', 'portfolio', 'specialties', 'sellerId'],
        },
        {
          name: 'Proposal',
          description: 'A project scope and offer prepared for a client',
          fields: ['id', 'listingId', 'clientId', 'scope', 'status'],
        },
        {
          name: 'Review',
          description: 'Verified feedback after a completed client project',
          fields: ['id', 'author', 'rating', 'comment', 'createdAt'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'find-designer',
          name: 'Find designer listings, compare portfolios, and review client proposals',
          steps: [
            'search-designer-listings',
            'compare-portfolios',
            'send-project-brief',
            'review-proposals',
          ],
        },
        {
          id: 'publish-services',
          name: 'Publish a design profile, respond to project inquiries, and gather client reviews',
          steps: [
            'create-profile',
            'describe-services',
            'reply-to-inquiries',
            'request-client-review',
          ],
        },
      ],
      recommendedScreens: screens(
        'Project Proposals',
        'Review project scope, compare proposals, and agree the next step with a designer',
        ['review-proposals', 'compare-scope', 'agree-project']
      ),
      requiredCapabilities: [
        ...base.requiredCapabilities,
        'project-proposals',
        'portfolio-discovery',
      ],
    };
  }

  if (/\b(instrument|outdoor gear|used gear|collection|protected exchange)\b/.test(brief)) {
    const subject = /instrument/.test(brief) ? 'instrument' : 'gear';
    return {
      ...base,
      defaultEntities: [
        {
          name: 'Listing',
          description: `A seller's ${subject} listing with condition and collection details`,
          fields: ['id', 'title', 'condition', 'price', 'sellerId', 'location'],
        },
        {
          name: 'Exchange',
          description: 'Agreed terms and collection status for a protected exchange',
          fields: ['id', 'listingId', 'buyerId', 'sellerId', 'status'],
        },
        {
          name: 'Review',
          description: 'Verified feedback about the listing and exchange',
          fields: ['id', 'author', 'rating', 'comment', 'createdAt'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'arrange-exchange',
          name: `Compare local ${subject} listings, ask the seller, and arrange a protected exchange`,
          steps: [
            'search-local-listings',
            'inspect-condition',
            'message-seller',
            'agree-safe-collection',
          ],
        },
        {
          id: 'publish-item',
          name: `Describe ${subject} condition, set a fair price, and arrange collection`,
          steps: ['add-item-details', 'record-condition', 'set-price', 'publish-listing'],
        },
      ],
      recommendedScreens: screens(
        'Protected Exchange',
        'Review item condition, agree safe collection, and track the protected exchange',
        ['review-condition', 'agree-collection', 'confirm-exchange']
      ),
      requiredCapabilities: [
        ...base.requiredCapabilities,
        'condition-disclosure',
        'protected-exchange',
      ],
    };
  }

  if (/\b(cleaning|parking|tutor|tutoring|lesson|provider|service appointment)\b/.test(brief)) {
    const topic = /cleaning/.test(brief)
      ? 'cleaning service'
      : /parking/.test(brief)
        ? 'parking space'
        : 'tutoring lesson';
    const finderFlow = /cleaning/.test(brief)
      ? {
          id: 'request-cleaning',
          name: 'Compare verified cleaners, request a time, and review completed work',
          steps: [
            'find-cleaners',
            'compare-verified-profiles',
            'request-cleaning-time',
            'review-service',
          ],
        }
      : /parking/.test(brief)
        ? {
            id: 'book-parking',
            name: 'Find a nearby parking space, check availability, and confirm a booking',
            steps: [
              'search-nearby-spaces',
              'compare-location-details',
              'check-availability',
              'confirm-booking',
            ],
          }
        : {
            id: 'arrange-lesson',
            name: 'Compare teaching profiles, inquire about lessons, and agree a schedule',
            steps: [
              'find-tutors',
              'compare-teaching-profiles',
              'send-lesson-inquiry',
              'agree-schedule',
            ],
          };
    return {
      ...base,
      defaultEntities: [
        {
          name: 'Listing',
          description: `Verified ${topic} offer with location, availability, and provider details`,
          fields: ['id', 'title', 'providerId', 'availability', 'location'],
        },
        {
          name: 'Booking',
          description: `A requested or confirmed ${topic} appointment`,
          fields: ['id', 'listingId', 'customerId', 'time', 'status'],
        },
        {
          name: 'Review',
          description: `Verified feedback after a completed ${topic}`,
          fields: ['id', 'author', 'rating', 'comment', 'createdAt'],
        },
      ],
      defaultWorkflows: [
        finderFlow,
        {
          id: 'manage-availability',
          name: `Publish a ${topic} listing, manage availability, and respond to requests`,
          steps: ['describe-offer', 'set-availability', 'reply-to-requests', 'collect-review'],
        },
      ],
      recommendedScreens: screens(
        /cleaning/.test(brief)
          ? 'Cleaning Request'
          : /parking/.test(brief)
            ? 'Space Booking'
            : 'Lesson Inquiry',
        `Review provider details, agree a time, and confirm the ${topic}`,
        ['review-provider', 'choose-time', 'confirm-request']
      ),
      requiredCapabilities: [
        ...base.requiredCapabilities,
        'availability-management',
        'service-inquiries',
      ],
    };
  }

  return base;
}

/** Route explicit returns-portal briefs through returns and refunds, not new purchases. */
export function specialiseEcommerce(base: ArchetypeDefinition, text: string): ArchetypeDefinition {
  if (
    base.id !== 'ecommerce' ||
    !/\b(?:returns? portal|return approval|refund steps|refund status|return request|process returns)\b/i.test(
      text
    )
  ) {
    return base;
  }

  return {
    ...base,
    name: 'Returns Portal',
    primaryAudience: 'Online shoppers returning a purchase and support teams processing refunds',
    primaryObjective:
      'Help customers find a previous order, choose eligible items, and follow return approval and refund progress',
    defaultEntities: [
      {
        name: 'Order',
        description: 'A previous purchase and its items, date, and delivery status',
        fields: ['id', 'orderNumber', 'customerId', 'purchasedAt', 'items', 'deliveryStatus'],
      },
      {
        name: 'Return',
        description: 'Selected eligible items, return reason, and approval status',
        fields: ['id', 'orderId', 'itemIds', 'reason', 'approvalStatus', 'requestedAt'],
      },
      {
        name: 'Refund',
        description: 'The refund amount, destination, and processing status',
        fields: ['id', 'returnId', 'amount', 'method', 'status', 'completedAt'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'request-return',
        name: 'Find a previous order, choose eligible items, and submit a return request',
        steps: ['find-order', 'check-eligible-items', 'choose-return-reason', 'submit-request'],
      },
      {
        id: 'track-refund',
        name: 'Follow return approval and refund progress',
        steps: ['review-approval', 'track-return', 'confirm-refund'],
      },
    ],
    recommendedScreens: [
      {
        name: 'Order Lookup',
        screenType: 'index-list',
        purpose: 'Find a previous purchase by order number or account details',
        jobs: ['find-order', 'review-purchased-items'],
        required: true,
      },
      {
        name: 'Return Request',
        screenType: 'settings',
        purpose: 'Choose eligible items, record a return reason, and submit the request',
        jobs: ['check-eligible-items', 'choose-return-reason', 'submit-request'],
        required: true,
      },
      {
        name: 'Refund Status',
        screenType: 'dashboard',
        purpose: 'Review return approval, shipment progress, and refund status',
        jobs: ['track-return', 'track-refund'],
        required: true,
      },
    ],
    requiredCapabilities: base.requiredCapabilities.filter(
      (capability) =>
        !['responsive-image-gallery', 'persistent-cart-state', 'secure-payment-fields'].includes(
          capability
        )
    ),
  };
}

/** Keep community briefs focused on local groups and updates, not photo-story defaults. */
export function specialiseConsumer(base: ArchetypeDefinition, text: string): ArchetypeDefinition {
  if (
    base.id !== 'consumer' ||
    !/\b(neighborhood social|community app|hobby groups?|shared interests?)\b/i.test(text)
  ) {
    return base;
  }
  return {
    ...base,
    primaryAudience:
      'Everyday consumers, residents, hobby-group members, and nearby community members',
    primaryObjective:
      'Support social discovery through local updates, community events, and conversations around shared interests',
    defaultEntities: [
      {
        name: 'Profile',
        description: 'A community member with nearby places and shared interests',
        fields: ['id', 'name', 'neighborhood', 'interests'],
      },
      {
        name: 'Group',
        description: 'A local or interest-based community with members and conversations',
        fields: ['id', 'name', 'topic', 'memberIds'],
      },
      {
        name: 'Community Update',
        description: 'A local post or question shared with a nearby group',
        fields: ['id', 'author', 'groupId', 'content', 'createdAt'],
      },
      {
        name: 'Notification',
        description: 'A reply, group invitation, or local event update',
        fields: ['id', 'type', 'sender', 'unread'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'share-community-updates',
        name: 'Share a local update with nearby friends and join the conversation',
        steps: ['choose-community', 'write-local-update', 'reply-to-neighbors'],
      },
      {
        id: 'organize-interest-groups',
        name: 'Welcome hobby group members, share events, and keep conversations connected',
        steps: ['welcome-members', 'publish-community-event', 'organize-group-conversation'],
      },
    ],
    recommendedScreens: base.recommendedScreens.map((screen) => {
      if (screen.name === 'Activity Stream') {
        return {
          ...screen,
          purpose: 'Local updates and conversations from nearby people and interest groups',
        };
      }
      if (screen.name === 'User Profile') {
        return { ...screen, purpose: 'Member details, neighborhood, and shared interests' };
      }
      if (screen.name === 'Notifications Feed') {
        return {
          ...screen,
          purpose: 'Group replies, community invitations, and local event updates',
        };
      }
      return screen;
    }),
    requiredCapabilities: [
      ...base.requiredCapabilities,
      'community-groups',
      'local-event-discovery',
    ],
  };
}
