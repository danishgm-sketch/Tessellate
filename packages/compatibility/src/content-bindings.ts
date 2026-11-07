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

function workspaceBrand(entityName?: string): string {
  const name = entityName?.trim();
  if (!name || /^workspace$/i.test(name)) return 'Team Workspace';
  return /\bworkspace$/i.test(name) ? name : `${name} Workspace`;
}

export function resolveWorkspaceBrand(product: ProductModel, briefDescription = ''): string {
  const employee = product.entities.some((entity) => entity.name === 'Employee');
  const primaryArchetype = product.productArchetypes[0]?.tag ?? '';
  const community = /community|neighbou?rhood/i.test(
    `${product.primaryAudience} ${product.primaryObjective}`
  );
  const mutualAidCommunity =
    primaryArchetype === 'consumer' &&
    product.entities.some((entity) => entity.name === 'Mutual Aid Request');
  const tradingTerminal =
    primaryArchetype === 'fintech' &&
    /market depth|equity trade|trading terminal|order book/i.test(
      `${product.primaryObjective} ${briefDescription}`
    );
  const offshoreWindOperations =
    primaryArchetype === 'erp-operations' &&
    product.entities.some((entity) => entity.name === 'Turbine') &&
    product.entities.some((entity) => entity.name === 'Permit to Work');
  const municipalWaterOperations =
    primaryArchetype === 'erp-operations' &&
    product.entities.some((entity) => entity.name === 'Water Network Asset') &&
    product.entities.some((entity) => entity.name === 'Water Quality Clearance');

  if (employee) return 'People & Co';
  if (mutualAidCommunity) return 'Neighbourhood Commons';
  if (community) return 'Example Community';
  if (tradingTerminal) return 'Market Workspace';
  if (offshoreWindOperations) return 'Wind Operations';
  if (municipalWaterOperations) return 'Water Network Operations';
  return workspaceBrand(product.entities[0]?.name);
}

function sampleActivityTime(index: number): string {
  return ['Today', 'Yesterday', 'Earlier this week'][Math.min(index, 2)]!;
}

function offshoreWindRecordSet(screenName: string): {
  columnLabels: { name: string; type: string; quality: string; status: string };
  rows: Array<{
    id: number;
    name: string;
    type: string;
    quality: number;
    status: string;
    displayValue: string;
  }>;
} {
  const record = /permit/i.test(screenName)
    ? {
        name: 'permit to work',
        type: 'Work scope and energy isolation',
        quality: 'Verification',
        statusLabel: 'Permit status',
        status: 'Permit service not connected',
        displayValue: 'Approval not connected',
      }
    : /incident/i.test(screenName)
      ? {
          name: 'incident',
          type: 'Crew welfare and response',
          quality: 'Escalation',
          statusLabel: 'Response status',
          status: 'Incident service not connected',
          displayValue: 'Response status not connected',
        }
      : /crew|vessel/i.test(screenName)
        ? {
            name: 'field crew',
            type: 'Competency and vessel assignment',
            quality: 'Crew coverage',
            statusLabel: 'Dispatch status',
            status: 'Dispatch service not connected',
            displayValue: 'Crew and vessel data not connected',
          }
        : /work order/i.test(screenName)
          ? {
              name: 'turbine maintenance work order',
              type: 'Inspection or repair scope',
              quality: 'Crew and schedule',
              statusLabel: 'Work order status',
              status: 'Work order service not connected',
              displayValue: 'Crew and schedule not connected',
            }
          : {
              name: 'turbine',
              type: 'Site and inspection history',
              quality: 'Availability',
              statusLabel: 'Operational status',
              status: 'Telemetry not connected',
              displayValue: 'Availability not connected',
            };

  return {
    columnLabels: {
      name: record.name,
      type: record.type,
      quality: record.quality,
      status: record.statusLabel,
    },
    rows: ['A', 'B', 'C'].map((letter, index) => ({
      id: index + 1,
      name: `Example ${record.name} ${letter}`,
      type: record.type,
      quality: 0,
      status: record.status,
      displayValue: record.displayValue,
    })),
  };
}

function municipalWaterRecordSet(screenName: string): {
  columnLabels: { name: string; type: string; quality: string; status: string };
  rows: Array<{
    id: number;
    name: string;
    type: string;
    quality: number;
    status: string;
    displayValue: string;
  }>;
} {
  const record = /clearance|water quality/i.test(screenName)
    ? {
        name: 'water-quality clearance',
        type: 'Sample location, time, and approved test method',
        quality: 'Review state',
        statusLabel: 'Clearance status',
        status: 'Clearance service not connected',
        displayValue: 'Test results not connected',
      }
    : /resident|notice|update/i.test(screenName)
      ? {
          name: 'resident notice',
          type: 'Affected area, next update, and accessible formats',
          quality: 'Review state',
          statusLabel: 'Notice status',
          status: 'Notice service not connected',
          displayValue: 'Publishing is not connected',
        }
      : /repair|work order/i.test(screenName)
        ? {
            name: 'repair work order',
            type: 'Network asset, qualified crew, and isolation record',
            quality: 'Repair progress',
            statusLabel: 'Work order status',
            status: 'Work order service not connected',
            displayValue: 'Crew and repair data not connected',
          }
        : /outage|incident/i.test(screenName)
          ? {
              name: 'service incident',
              type: 'Verified network asset and affected service area',
              quality: 'Response state',
              statusLabel: 'Incident status',
              status: 'Incident service not connected',
              displayValue: 'Affected area not connected',
            }
          : {
              name: 'water network asset',
              type: 'Asset type, district, and service state',
              quality: 'Inspection state',
              statusLabel: 'Service status',
              status: 'Network data not connected',
              displayValue: 'Asset location not connected',
            };

  return {
    columnLabels: {
      name: record.name,
      type: record.type,
      quality: record.quality,
      status: record.statusLabel,
    },
    rows: ['A', 'B', 'C'].map((letter, index) => ({
      id: index + 1,
      name: `Example ${record.name} ${letter}`,
      type: record.type,
      quality: 0,
      status: record.status,
      displayValue: record.displayValue,
    })),
  };
}

function mutualAidRecordSet(screenName: string): {
  columnLabels: { name: string; type: string; quality: string; status: string };
  rows: Array<{
    id: number;
    name: string;
    type: string;
    quality: number;
    status: string;
    displayValue: string;
  }>;
} {
  const record = /moderation|safety/i.test(screenName)
    ? {
        name: 'moderation report',
        type: 'Reason reviewed by an authorised moderator',
        quality: 'Access scope',
        statusLabel: 'Review state',
        status: 'Moderation service not connected',
        displayValue: 'Example only · no resident details',
      }
    : /help|aid/i.test(screenName)
      ? {
          name: 'help request',
          type: 'Category and approximate area',
          quality: 'Visibility',
          statusLabel: 'Request state',
          status: 'Help service not connected',
          displayValue: 'Contact hidden until mutual consent',
        }
      : /event|skill/i.test(screenName)
        ? {
            name: 'local event or skill swap',
            type: 'Approximate area and time',
            quality: 'Accessibility',
            statusLabel: 'Listing state',
            status: 'Event service not connected',
            displayValue: 'Example details only',
          }
        : /privacy|language/i.test(screenName)
          ? {
              name: 'privacy preference',
              type: 'Neighbourhood and language settings',
              quality: 'Information shared',
              statusLabel: 'Settings state',
              status: 'Account service not connected',
              displayValue: 'No resident profile is connected',
            }
          : {
              name: 'local safety notice',
              type: 'Source and approximate area',
              quality: 'Expiry',
              statusLabel: 'Notice state',
              status: 'Notice service not connected',
              displayValue: 'Example only · verify before acting',
            };

  return {
    columnLabels: {
      name: record.name,
      type: record.type,
      quality: record.quality,
      status: record.statusLabel,
    },
    rows: ['A', 'B', 'C'].map((letter, index) => ({
      id: index + 1,
      name: `Example ${record.name} ${letter}`,
      type: record.type,
      quality: 0,
      status: record.status,
      displayValue: record.displayValue,
    })),
  };
}

export function bindResourceContent(
  product: ProductModel,
  screen: ScreenNode,
  role: string,
  screens: ScreenNode[],
  resourceSlug: string,
  briefDescription = '',
  projectBrand?: string
): Record<string, unknown> {
  const employee = product.entities.some((entity) => entity.name === 'Employee');
  const primaryArchetype = product.productArchetypes[0]?.tag ?? '';
  const isMutualAidCommunity =
    primaryArchetype === 'consumer' &&
    product.entities.some((entity) => entity.name === 'Mutual Aid Request');
  const isOffshoreWindOperations =
    primaryArchetype === 'erp-operations' &&
    product.entities.some((entity) => entity.name === 'Turbine') &&
    product.entities.some((entity) => entity.name === 'Permit to Work');
  const isMunicipalWaterOperations =
    primaryArchetype === 'erp-operations' &&
    product.entities.some((entity) => entity.name === 'Water Network Asset') &&
    product.entities.some((entity) => entity.name === 'Water Quality Clearance') &&
    product.entities.some((entity) => entity.name === 'Resident Notice');
  const isRealEstate = primaryArchetype === 'real-estate';
  const isMarketplaceListings =
    primaryArchetype === 'marketplace' && screen.name === 'Explore Listings';
  const isCommunity = /community|neighbou?rhood/i.test(
    `${product.primaryAudience} ${product.primaryObjective}`
  );
  const isCommunityActivity =
    isCommunity && /^(?:activity stream|neighbourhood updates)$/i.test(screen.name);
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
  const isEcommerceCatalog = primaryArchetype === 'ecommerce' && screen.name === 'Product Catalog';
  const productDetailHref = screens.find((item) => /product detail/i.test(item.name))
    ? `#${screens.find((item) => /product detail/i.test(item.name))!.id}`
    : undefined;
  const isMusicStore =
    primaryArchetype === 'ecommerce' && product.entities.some((entity) => entity.name === 'Album');
  const ecommerceItemLabel = isMusicStore
    ? { name: 'album', type: 'Artist and tracks' }
    : /fresh food|grocery/i.test(product.primaryObjective)
      ? { name: 'grocery item', type: 'Item details' }
      : /home-goods/i.test(product.primaryObjective)
        ? { name: 'home good', type: 'Specifications' }
        : /cosmetic/i.test(product.primaryObjective)
          ? { name: 'cosmetic product', type: 'Ingredients and variations' }
          : { name: 'garment', type: 'Material and sizing' };
  const isStreamingCatalogue = primaryArchetype === 'media' && screen.name === 'Film Catalogue';
  const isFlightDocuments =
    primaryArchetype === 'travel' &&
    screen.name === 'Travel Documents' &&
    product.entities.some((entity) => entity.name === 'Flight');
  const isFlightManagement =
    primaryArchetype === 'travel' && product.entities.some((entity) => entity.name === 'Flight');
  const isFilmStreaming =
    primaryArchetype === 'media' && product.entities.some((entity) => entity.name === 'Film');
  const isMagazineProduct =
    primaryArchetype === 'media' &&
    product.entities.some((entity) => entity.name === 'Magazine Issue');
  const isRadioProduct =
    primaryArchetype === 'media' && product.entities.some((entity) => entity.name === 'Programme');
  const isNewsroom =
    primaryArchetype === 'media' && product.entities.some((entity) => entity.name === 'Story Assignment');
  const isLocalJournalism =
    primaryArchetype === 'media' &&
    !isFilmStreaming &&
    !isMagazineProduct &&
    !isRadioProduct &&
    !isNewsroom;
  const isGroundedSupportAssistant =
    primaryArchetype === 'ai' &&
    product.entities.some((entity) => entity.name === 'Knowledge Source');
  const isHotelBooking =
    primaryArchetype === 'travel' && product.entities.some((entity) => entity.name === 'Room');
  const isDestinationTravel =
    primaryArchetype === 'travel' &&
    product.entities.some((entity) => entity.name === 'Destination');
  const brand =
    role === 'channels-rail'
      ? 'Example channels'
      : projectBrand ?? resolveWorkspaceBrand(product, briefDescription);
  const brandWords = brand.match(/[A-Za-z0-9]+/g) ?? [];
  const initials = brandWords
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
    : isMunicipalWaterOperations
      ? 'Review water service incidents'
    : isOffshoreWindOperations
      ? 'Review turbine operations'
      : isMutualAidCommunity
        ? 'View community help requests'
        : isFlightManagement
          ? 'View upcoming flights'
          : isGroundedSupportAssistant
            ? 'Ask a support question'
            : isRadioProduct
              ? 'Listen to live radio'
              : isMagazineProduct
                ? 'Browse magazine issues'
                : isNewsroom
                  ? 'Open the newsroom plan'
                  : isFilmStreaming
                    ? 'Browse films'
                    : isMusicStore
                      ? screen.name === 'Product Catalog'
                        ? 'View album details'
                        : 'Browse albums'
                      : isDestinationTravel
                        ? 'Explore destinations'
                        : isHotelBooking
                          ? 'Find a stay'
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
    ? /^teams?$/i
    : isMunicipalWaterOperations
      ? /network operations/i
    : isOffshoreWindOperations
      ? /turbine operations/i
      : isMutualAidCommunity
        ? /community help board/i
        : isFlightManagement
          ? /journey overview|flight details/i
          : isFilmStreaming
            ? /film catalogue|film detail|watchlist/i
            : isGroundedSupportAssistant
              ? /support assistant|answer review/i
              : isRadioProduct
                ? /live radio|episode archive/i
                : isMagazineProduct
                  ? /magazine issues|photo essays/i
                  : isNewsroom
                    ? /newsroom planner|story assignments/i
                    : isDestinationTravel
                      ? /destination|neighborhood/i
                      : isHotelBooking
                        ? /find a stay|room details/i
                        : isReturnsPortal
                          ? /order lookup/i
                          : (targetPatternsByArchetype[primaryArchetype] ??
                            /overview|dashboard|home|workspace/i);
  const primaryActionScreen =
    screens.find((item) => preferredTargetPattern.test(item.name)) ??
    screens.find((item) => /overview|dashboard|home|workspace/i.test(item.name)) ??
    screens[0];
  const secondaryActionScreen = isMunicipalWaterOperations
    ? screens.find((item) => /water quality clearance/i.test(item.name)) ??
      screens.find((item) => item.id !== primaryActionScreen?.id)
    : employee
    ? screens.find((item) => /onboarding|welcome/i.test(item.name)) ??
      screens.find((item) => item.id !== primaryActionScreen?.id)
    : screens.find((item) => item.id !== primaryActionScreen?.id);
  const primaryActionHref = primaryActionScreen ? `#${primaryActionScreen.id}` : undefined;
  const secondaryActionHref = secondaryActionScreen
    ? `#${secondaryActionScreen.id}`
    : primaryActionHref;
  const headline = employee ? 'A better workday starts with people.' : product.primaryObjective;
  const isEmployeeTeamsScreen = employee && /^teams$/i.test(screen.name.trim());
  const isEmployeeEngagementScreen = employee && /engagement|feedback|recognition/i.test(screen.name);
  const isEmployeeSettingsScreen = employee && /settings|policy/i.test(screen.name);
  const isMutualAidSettingsScreen =
    isMutualAidCommunity && /privacy|language/i.test(screen.name);
  const description = employee
    ? 'Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.'
    : isReturnsPortal
      ? 'Find a previous purchase, choose eligible items, and follow each return and refund step.'
      : isMunicipalWaterOperations
        ? 'Coordinate example network incidents, repair drafts, clearance review, and resident updates. Utility dispatch, live locations, water tests, and public notices are not connected.'
      : isOffshoreWindOperations
        ? 'Coordinate turbine maintenance, sea conditions, permits to work, verified energy isolation, and incident response. Live operational data appears only when its source is connected.'
      : isMutualAidCommunity
        ? 'Share practical local help, community events, and sourced notices by approximate neighbourhood. Resident details stay out of this preview; live accounts and community services are not connected.'
        : `A workspace for ${product.primaryAudience.toLowerCase()}.`;
  const conversionCtaHeadline = employee
    ? 'Make the next step easier for every colleague.'
    : `Ready to ${primaryActionLabel.toLowerCase()}?`;
  const conversionCtaDescription = employee
    ? 'Help colleagues find their team, support and policies in one clear place.'
    : isMunicipalWaterOperations
      ? 'Review the example response plan. No utility control system, water-quality service, or resident notification channel is connected.'
    : isMutualAidCommunity
      ? 'Find or offer local help, with contact details shared only after both residents consent.'
      : `Continue with ${primaryActionLabel.toLowerCase()} for ${product.primaryAudience.toLowerCase()}.`;
  const footerDescription = employee
    ? 'A people-first home for onboarding, teams and trusted policies.'
    : description;
  const searchCopyByArchetype: Record<
    string,
    { label: string; placeholder: string; helperText: string }
  > = {
    'real-estate': {
      label: 'Search property listings',
      placeholder: 'Search by area or property details',
      helperText: 'Example search only. Connect a listings service to search live properties.',
    },
    marketplace: {
      label: 'Search listings',
      placeholder: 'Search listings',
      helperText: 'Example search only. Connect a listings service to search live results.',
    },
    ecommerce: {
      label: isMusicStore ? 'Search albums' : 'Search products',
      placeholder: isMusicStore ? 'Search albums and artists' : 'Search products and collections',
      helperText: isMusicStore
        ? 'Example search only. Connect a music catalogue to search licensed releases.'
        : 'Example search only. Connect a product catalogue to search live inventory.',
    },
    media: isFilmStreaming
      ? {
          label: 'Search films',
          placeholder: 'Search films and collections',
          helperText: 'Example search only. Connect a film catalogue to search available titles.',
        }
      : isRadioProduct
        ? {
            label: 'Search programmes and episodes',
            placeholder: 'Search the episode archive',
            helperText:
              'Example search only. Connect a broadcast catalogue to search programmes and episodes.',
          }
        : isMagazineProduct
          ? {
              label: 'Search magazine issues',
              placeholder: 'Search issues and photo essays',
              helperText:
                'Example search only. Connect an editorial catalogue to search published issues.',
            }
          : {
              label: 'Search local reporting',
              placeholder: 'Search stories and topics',
              helperText:
                'Example search only. Connect a newsroom catalogue to search published reporting.',
            },
    travel: isFlightManagement
      ? {
          label: 'Search flights',
          placeholder: 'Search by route or flight number',
          helperText:
            'Example search only. Connect a travel service to search live flight details.',
        }
      : isHotelBooking
        ? {
            label: 'Search stays',
            placeholder: 'Search hotels, dates, and amenities',
            helperText:
              'Example search only. Connect a booking service to search live availability.',
          }
        : isDestinationTravel
          ? {
              label: screen.name.toLowerCase().includes('neighborhood')
                ? 'Search neighborhoods'
                : 'Search destinations',
              placeholder: screen.name.toLowerCase().includes('neighborhood')
                ? 'Search neighborhoods and local places'
                : 'Search destinations and saved places',
              helperText:
                'Example search only. Connect a travel service to search live destinations.',
            }
          : {
              label: 'Search resort services',
              placeholder: 'Search on-property services',
              helperText:
                'Example search only. Connect a resort service to search live availability.',
            },
    education: {
      label: 'Search courses',
      placeholder: 'Search courses and topics',
      helperText: 'Example search only. Connect a course catalogue to search live results.',
    },
    'developer-tools': {
      label: /trace/i.test(screen.name) ? 'Search traces and spans' : 'Search developer records',
      placeholder: /trace/i.test(screen.name)
        ? 'Search by trace, service, or error'
        : 'Search requests, releases, or changes',
      helperText: 'Example search only. Connect your service to search live developer records.',
    },
  };
  const searchCopy = isMunicipalWaterOperations
    ? {
        label: 'Search incidents and network assets',
        placeholder: 'Search by incident, asset, or district',
        helperText: 'Example search only. No utility incidents or live locations are connected.',
      }
    : isOffshoreWindOperations
    ? {
        label: 'Search turbines and work orders',
        placeholder: 'Search by turbine, permit, or work order',
        helperText: 'Example search only. Connect your operations service to search live records.',
      }
    : isMutualAidCommunity
      ? {
          label: 'Search local help and notices',
          placeholder: 'Search by category or neighbourhood',
          helperText:
            'Example search only. Resident accounts and community services are not connected.',
        }
      : searchCopyByArchetype[primaryArchetype] ?? {
        label: 'Search records',
        placeholder: 'Search records',
        helperText: 'Example search only. Connect your data source to search live records.',
      };
  const items = isMunicipalWaterOperations
    ? [
        {
          title: 'Outage response',
          description: 'Review example incident reports and confirm their affected service areas.',
          detail: 'Outage & Incident Queue',
        },
        {
          title: 'Field repair',
          description: 'Coordinate repair scope, crew competencies, and isolation records.',
          detail: 'Repair Work Orders',
        },
        {
          title: 'Water-quality review',
          description: 'Route sample evidence for an authorised utility decision.',
          detail: 'Water Quality Clearance',
        },
        {
          title: 'Resident updates',
          description: 'Prepare accessible notices with a verified area and next-update time.',
          detail: 'Resident Updates',
        },
      ]
    : isOffshoreWindOperations
    ? [
        {
          title: 'Fleet status',
          description: 'Review turbine availability, inspection history, and active maintenance.',
          detail: 'Control room',
        },
        {
          title: 'Field dispatch',
          description: 'Coordinate work orders, qualified crews, vessel access, and weather windows.',
          detail: 'Crew & vessel dispatch',
        },
        {
          title: 'Permit to work',
          description: 'Review work scope and record independent lockout/tagout verification.',
          detail: 'Safety controls',
        },
        {
          title: 'Incident response',
          description: 'Account for crew and keep control-room escalation traceable.',
          detail: 'Response',
        },
      ]
    : isMutualAidCommunity
      ? [
          {
            title: 'Community Help Board',
            description:
              'Browse practical requests and volunteer offers by category and approximate area.',
            detail: 'Help requests',
          },
          {
            title: 'Local Events & Skills',
            description:
              'Find neighbourhood events and skill swaps with language and access details.',
            detail: 'Events and skills',
          },
          {
            title: 'Safety & Moderation',
            description:
              'Review authorised reports and keep sourced local notices up to date.',
            detail: 'Safety and moderation',
          },
          {
            title: 'Privacy & Languages',
            description:
              'Choose language and area visibility; share contact details only by mutual consent.',
            detail: 'Privacy settings',
          },
        ]
      : employee
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
  const conversationExamples = isGroundedSupportAssistant
    ? [
        {
          time: 'Example question',
          title: 'Can I change the delivery address on my order?',
          desc: 'A help-center passage is attached so a support specialist can check the policy before replying.',
        },
        {
          time: 'Human review',
          title: 'Address changes after dispatch',
          desc: 'This example response is waiting for a person to confirm the cited guidance and confidence.',
        },
      ]
    : isMutualAidCommunity
      ? [
          {
            time: 'Example request',
            title: 'Grocery collection offered in an example area',
            desc: 'Example only. Contact details stay private unless both residents consent to share them.',
          },
          {
            time: 'Example volunteer offer',
            title: 'A local skill swap is available this week',
            desc: 'Example only. No resident account, location, or message is connected.',
          },
        ]
      : /freelance|designer|proposal/i.test(briefDescription)
      ? [
          {
            time: 'Today',
            title: 'Project inquiry',
            desc: 'A client shares a brief and asks an independent designer about the work.',
          },
          {
            time: 'Yesterday',
            title: 'Proposal reply',
            desc: 'A designer outlines a possible scope and the next step.',
          },
        ]
      : product.productArchetypes[0]?.tag === 'marketplace'
        ? [
            {
              time: 'Today',
              title: 'Listing question',
              desc: 'A buyer asks the seller about listing details and next steps.',
            },
            {
              time: 'Yesterday',
              title: 'Seller reply',
              desc: 'The seller responds with information relevant to the listing.',
            },
          ]
        : /community|neighbou?rhood|hobby group/i.test(briefDescription)
          ? [
              {
                time: 'Today',
                title: 'Community update',
                desc: 'A member shares a local update with a nearby group.',
              },
              {
                time: 'Yesterday',
                title: 'Neighbor reply',
                desc: 'Another member adds context to the conversation.',
              },
            ]
          : [
              {
                time: 'Today',
                title: 'New conversation',
                desc: 'A team member shares a question about the current work.',
              },
              {
                time: 'Yesterday',
                title: 'Follow-up',
                desc: 'A colleague responds with context and a suggested next step.',
              },
            ];
  const waterWorkflowIndexes = /water quality|clearance/i.test(screen.name)
    ? [1]
    : /resident|notice|update/i.test(screen.name)
      ? [2]
      : /outage|incident|repair|work order/i.test(screen.name)
        ? [0]
        : [0, 1, 2];
  const waterWorkflows = product.workflows.filter((_, index) => waterWorkflowIndexes.includes(index));
  const events =
    role === 'message-thread'
      ? conversationExamples
      : employee && isEmployeeEngagementScreen
        ? [
            {
              time: 'This week',
              title: 'Example feedback check-in',
              desc: 'Sample prompt: what would help your team work well together? Responses are not connected.',
            },
            {
              time: 'Today',
              title: 'Example peer recognition',
              desc: 'Sample recognition for a colleague contribution. No employee activity is connected.',
            },
            {
              time: 'Next week',
              title: 'Example team pulse',
              desc: 'Sample engagement check-in. Participation data is not connected.',
            },
          ]
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
                time: sampleActivityTime(0),
                title: 'Return request received',
                desc: 'The request is being reviewed against the original order and selected items.',
              },
              {
                time: sampleActivityTime(1),
                title: 'Refund progress updated',
                desc: 'Approval, return delivery, and refund steps appear in one timeline.',
              },
            ]
          : isCommunityActivity
            ? isMutualAidCommunity
              ? [
                  {
                    time: 'Example notice',
                    title: 'Community garden cleanup · example only',
                    desc: 'Example event in a selected neighbourhood. No resident or event service is connected.',
                  },
                  {
                    time: 'Example help request',
                    title: 'Grocery collection · contact details hidden',
                    desc: 'Example only. Direct contact remains private until both residents consent.',
                  },
                  {
                    time: 'Example safety notice',
                    title: 'Local notice · verify source and expiry',
                    desc: 'Example only. Confirm current information with its source before sharing.',
                  },
                ]
              : [
                {
                  time: sampleActivityTime(0),
                  title: 'A neighbour shared a local update',
                  desc: 'A local question or story can start a conversation with nearby group members.',
                },
                {
                  time: sampleActivityTime(1),
                  title: 'A hobby group welcomed new members',
                  desc: 'Shared-interest groups can bring introductions and upcoming events together.',
                },
              ]
            : isMunicipalWaterOperations
              ? waterWorkflows.map((workflow, index) => ({
                  time: sampleActivityTime(index),
                  title: humanizeWorkflowLabel(workflow.name),
                  desc:
                    workflow.steps.map(humanizeWorkflowLabel).join(' → ') ||
                    'Example workflow. Live utility services are not connected.',
                }))
              : product.workflows.slice(0, 3).map((workflow, index) => ({
                time: sampleActivityTime(index),
                title: humanizeWorkflowLabel(workflow.name),
                desc:
                  workflow.steps.map(humanizeWorkflowLabel).join(' → ') ||
                  'Example activity from this workflow.',
              }));
  const count = briefDescription
    .match(/\b([\d,]+)[ -]+(?:person|employee|people)/i)?.[1]
    ?.replaceAll(',', '');
  const offshoreWindRecords = offshoreWindRecordSet(screen.name);
  const mutualAidRecords = mutualAidRecordSet(screen.name);
  const municipalWaterRecords = municipalWaterRecordSet(screen.name);
  const titles: Record<string, string> = isMunicipalWaterOperations
    ? {
        'metric-cards': 'Water service response status',
        'summary-kpis': 'Water service response status',
        'activity-feed': 'Example response activity',
        'activity-timeline': 'Example response activity',
        'data-table': /clearance|water quality/i.test(screen.name)
          ? 'Water-quality review queue'
          : /resident|notice|update/i.test(screen.name)
            ? 'Resident update drafts'
            : /repair|work order/i.test(screen.name)
              ? 'Repair work orders'
              : /outage|incident/i.test(screen.name)
                ? 'Outage and incident queue'
                : 'Water network status',
      }
    : isOffshoreWindOperations
    ? {
        'metric-cards': 'Fleet and safety status',
        'summary-kpis': 'Fleet and safety status',
        'activity-feed': 'Operational activity',
        'activity-timeline': 'Operational activity',
        'data-table': /permit/i.test(screen.name)
          ? 'Permit to work queue'
          : /incident/i.test(screen.name)
            ? 'Incident response queue'
            : /crew|vessel/i.test(screen.name)
              ? 'Crew and vessel assignments'
              : /work order/i.test(screen.name)
                ? 'Maintenance work orders'
                : 'Turbine fleet status',
      }
    : isMutualAidCommunity
      ? {
          'metric-cards': 'Community activity at a glance',
          'summary-kpis': 'Community activity at a glance',
          'activity-feed': 'Neighbourhood updates',
          'activity-timeline': 'Neighbourhood updates',
          'data-table': /moderation|safety/i.test(screen.name)
            ? 'Safety and moderation queue'
            : /help|aid/i.test(screen.name)
              ? 'Community help board'
              : /event|skill/i.test(screen.name)
                ? 'Local events and skill swaps'
                : /privacy|language/i.test(screen.name)
                  ? 'Privacy and language preferences'
                  : 'Sourced local notices',
        }
    : employee
    ? {
        'metric-cards': isEmployeeEngagementScreen ? 'Engagement overview' : 'Your organisation at a glance',
        'summary-kpis': isEmployeeEngagementScreen ? 'Engagement overview' : 'Your organisation at a glance',
        'activity-feed': isEmployeeEngagementScreen ? 'Feedback and recognition' : 'People updates',
        'activity-timeline': 'Recent employee activity',
        'data-table': isEmployeeTeamsScreen
          ? 'Team directory'
          : isEmployeeEngagementScreen
            ? 'Feedback and recognition'
            : 'People and teams',
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
      : {
          'metric-cards': 'Key metrics',
          'summary-kpis': 'Key metrics',
          'results-grid': isRealEstate
            ? 'Available property listings'
            : isMarketplaceListings
              ? 'Available listings'
              : isMagazineProduct
                ? 'Magazine archive'
                : isRadioProduct
                  ? 'Programme archive'
                  : isLocalJournalism
                    ? 'Local reporting archive'
                    : 'Search results',
        };
  const saveFooterLabel = isReturnsPortal
    ? 'Submit return request'
    : isMutualAidSettingsScreen
      ? 'Save privacy preferences'
    : isEmployeeSettingsScreen
      ? 'Save preferences'
      : 'Save changes';
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
            ? role === 'conversion-cta' ? conversionCtaHeadline : headline
            : role === 'results-grid'
              ? isRealEstate
                ? 'Available property listings'
                : isMarketplaceListings
                  ? 'Available listings'
                  : isEcommerceCatalog
                    ? isMusicStore
                      ? 'Available albums'
                      : 'Available products'
                    : isStreamingCatalogue
                      ? 'Film catalogue'
                      : isMagazineProduct
                        ? 'Magazine archive'
                        : isRadioProduct
                          ? 'Programme archive'
                          : isLocalJournalism
                            ? 'Local reporting archive'
                            : 'Search results'
              : (titles[role] ?? screen.name),
    brand,
    links,
    eyebrow: 'Example organisation · sample content',
    badge: 'EXAMPLE',
    initials,
    headline: role === 'conversion-cta' ? conversionCtaHeadline : headline,
    subheadline: role === 'conversion-cta' ? conversionCtaDescription : description,
    description:
      role === 'conversion-cta'
        ? conversionCtaDescription
        : role === 'footer' && employee
          ? footerDescription
          : description,
    subtitle: isMunicipalWaterOperations
      ? `${screen.purpose}. Example prototype; utility systems and records are not connected.`
      : screen.purpose,
    panelTitle: isMunicipalWaterOperations
      ? 'Water service response priorities'
      : isOffshoreWindOperations
      ? 'Control room priorities'
      : isMutualAidCommunity
        ? 'Community coordination'
      : employee
        ? 'Your first weeks, made clearer'
        : 'Your workspace',
    panels: items.slice(0, 3).map((item, index) => ({
      id: `panel-${index}`,
      label: item.detail,
      text: `${item.title}\n${item.description}`,
    })),
    primaryCta: { label: primaryActionLabel, href: primaryActionHref },
    secondaryCta: {
      label: isMunicipalWaterOperations
        ? 'Review water-quality clearances'
        : isOffshoreWindOperations
        ? 'Check work orders'
        : isMutualAidCommunity
          ? 'See local events'
        : employee
          ? 'Explore onboarding'
          : 'See how it works',
      href: secondaryActionHref,
    },
    note: isMunicipalWaterOperations
      ? 'Example prototype · utility systems, water tests, live locations, and resident notices are not connected'
      : isMutualAidCommunity
      ? 'Example preview · no resident data is connected; verify notices before sharing'
      : 'Example interface · replace sample data with your organisation',
    items,
    events,
    cards: isMunicipalWaterOperations
      ? [
          { label: 'Open service incidents', val: '—', status: 'No connected data' },
          { label: 'Affected service areas', val: '—', status: 'No connected data' },
          { label: 'Crews available to dispatch', val: '—', status: 'No connected data' },
          { label: 'Repairs awaiting review', val: '—', status: 'No connected data' },
          { label: 'Water-quality clearances', val: '—', status: 'No connected data' },
          { label: 'Resident updates due', val: '—', status: 'No connected data' },
        ]
      : isOffshoreWindOperations
      ? [
          { label: 'Fleet availability', val: '—', status: 'No connected data' },
          { label: 'Active work orders', val: '—', status: 'No connected data' },
          { label: 'Permits awaiting approval', val: '—', status: 'No connected data' },
          { label: 'Unresolved incidents', val: '—', status: 'No connected data' },
          { label: 'Crew coverage', val: '—', status: 'No connected data' },
          { label: 'Safe access windows', val: '—', status: 'No connected data' },
        ]
      : isMutualAidCommunity
        ? [
            { label: 'Open help requests', val: '—', status: 'No connected data' },
            { label: 'Volunteer offers', val: '—', status: 'No connected data' },
            { label: 'Local events', val: '—', status: 'No connected data' },
            { label: 'Safety notices', val: '—', status: 'No connected data' },
          ]
      : employee && isEmployeeEngagementScreen
      ? [
          { label: 'Feedback', val: '—', status: 'No connected data' },
          { label: 'Recognition', val: '—', status: 'No connected data' },
          { label: 'Participation', val: '—', status: 'No connected data' },
        ]
      : employee
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
    rows: isMunicipalWaterOperations
      ? municipalWaterRecords.rows
      : isOffshoreWindOperations
      ? offshoreWindRecords.rows
      : isMutualAidCommunity
        ? mutualAidRecords.rows
      : isEcommerceCatalog
      ? ['A', 'B', 'C'].map((letter) => ({
          id: letter.charCodeAt(0),
          name: `Example ${ecommerceItemLabel.name} ${letter}`,
          type: `${ecommerceItemLabel.type} not connected`,
          quality: 0,
          status: isMusicStore
            ? 'Release availability not connected'
            : 'Availability not connected',
          displayValue: isMusicStore ? 'Release price not connected' : 'Price not connected',
          ...(productDetailHref ? { href: productDetailHref } : {}),
        }))
      : isMagazineProduct && /issues|essays|stories/i.test(screen.name)
        ? ['A', 'B', 'C'].map((letter) => ({
            id: letter.charCodeAt(0),
            name: `Example ${screen.name.toLowerCase().includes('essay') ? 'photo essay' : 'magazine issue'} ${letter}`,
            type: 'Editorial section and publication date',
            quality: 0,
            status: 'Issue details not connected',
            displayValue: 'Story count not connected',
          }))
        : isNewsroom && /assignments|planner|edition/i.test(screen.name)
          ? ['A', 'B', 'C'].map((letter) => ({
              id: letter.charCodeAt(0),
              name: `Example newsroom story ${letter}`,
              type: 'Reporter and editorial section',
              quality: 0,
              status: 'Assignment status not connected',
              displayValue: 'Copy review not connected',
            }))
          : isRadioProduct && /episode|schedule/i.test(screen.name)
            ? ['A', 'B', 'C'].map((letter) => ({
                id: letter.charCodeAt(0),
                name: `Example radio episode ${letter}`,
                type: 'Programme and transcript',
                quality: 0,
                status: 'Transcript not connected',
                displayValue: 'Duration not connected',
              }))
            : isLocalJournalism && /topic|archive/i.test(screen.name)
              ? ['A', 'B', 'C'].map((letter) => ({
                  id: letter.charCodeAt(0),
                  name: `Example local story ${letter}`,
                  type: 'Topic and byline',
                  quality: 0,
                  status: 'Article not connected',
                  displayValue: 'Publication date not connected',
                }))
              : isStreamingCatalogue
                ? ['A', 'B', 'C'].map((letter) => ({
                    id: letter.charCodeAt(0),
                    name: `Example film ${letter}`,
                    type: 'Genre and format not connected',
                    quality: 0,
                    status: 'Availability not connected',
                    displayValue: 'Runtime not connected',
                  }))
                : isFlightDocuments
                  ? ['A', 'B', 'C'].map((letter) => ({
                      id: letter.charCodeAt(0),
                      name: `Example travel document ${letter}`,
                      type: 'Boarding pass or journey document',
                      quality: 0,
                      status: 'Offline status not connected',
                      displayValue: 'Journey details not connected',
                    }))
                  : isEmployeeTeamsScreen
                    ? [
                        {
                          id: 1,
                          name: 'Example Product team',
                          type: 'Product planning and delivery · sample',
                          quality: 0,
                          status: 'Membership not connected',
                          displayValue: 'Member count not connected',
                        },
                        {
                          id: 2,
                          name: 'Example Engineering team',
                          type: 'Engineering systems · sample',
                          quality: 0,
                          status: 'Membership not connected',
                          displayValue: 'Member count not connected',
                        },
                        {
                          id: 3,
                          name: 'Example People team',
                          type: 'People operations · sample',
                          quality: 0,
                          status: 'Membership not connected',
                          displayValue: 'Member count not connected',
                        },
                      ]
                    : isEmployeeEngagementScreen
                      ? [
                          {
                            id: 1,
                            name: 'Example feedback topic',
                            type: 'Employee feedback · sample',
                            quality: 0,
                            status: 'Responses not connected',
                            displayValue: 'No connected data',
                          },
                          {
                            id: 2,
                            name: 'Example peer recognition',
                            type: 'Recognition · sample',
                            quality: 0,
                            status: 'Responses not connected',
                            displayValue: 'No connected data',
                          },
                          {
                            id: 3,
                            name: 'Example team pulse',
                            type: 'Engagement check-in · sample',
                            quality: 0,
                            status: 'Responses not connected',
                            displayValue: 'No connected data',
                          },
                        ]
                      : employee
                    ? [
                        {
                          id: 1,
                          name: 'Example colleague A',
                          type: 'Product team',
                          quality: 80,
                          status: 'Onboarding',
                          displayValue: 'Progress not connected',
                        },
                        {
                          id: 2,
                          name: 'Example colleague B',
                          type: 'Engineering team',
                          quality: 100,
                          status: 'Settled in',
                          displayValue: 'Progress not connected',
                        },
                        {
                          id: 3,
                          name: 'Example colleague C',
                          type: 'People team',
                          quality: 40,
                          status: 'Welcome week',
                          displayValue: 'Progress not connected',
                        },
                      ]
                    : isRealEstate
                      ? ['A', 'B', 'C'].map((letter, index) => ({
                          id: index + 1,
                          name: `Example property ${letter}`,
                          type: 'Location and features not connected',
                          quality: 0,
                          status: 'Availability not connected',
                          displayValue: 'Price not connected',
                        }))
                      : isMarketplaceListings
                        ? ['A', 'B', 'C'].map((letter, index) => ({
                            id: index + 1,
                            name: `Example listing ${letter}`,
                            type: 'Service details and availability not connected',
                            quality: 0,
                            status: 'Example listing',
                            displayValue: 'Availability not connected',
                          }))
                        : product.entities.map((entity, index) => ({
                            id: index + 1,
                            name: `Example ${entity.name}`,
                            type: entity.description ?? 'Record',
                            quality: 0,
                            status: 'Sample',
                            displayValue: isTradingTerminal
                              ? 'Market data not connected'
                              : 'Details not connected',
                          })),
    columnLabels: isMunicipalWaterOperations
      ? municipalWaterRecords.columnLabels
      : isOffshoreWindOperations
      ? offshoreWindRecords.columnLabels
      : isMutualAidCommunity
        ? mutualAidRecords.columnLabels
      : isEmployeeTeamsScreen
      ? { name: 'Team', type: 'Focus', quality: 'Members', status: 'Status' }
      : isEmployeeEngagementScreen
        ? { name: 'Item', type: 'Type', quality: 'Details', status: 'Status' }
        : isEcommerceCatalog
      ? isMusicStore
        ? {
            name: 'Album',
            type: 'Artist and tracks',
            quality: 'Release price',
            status: 'Availability',
          }
        : {
            name: 'Product',
            type: ecommerceItemLabel.type,
            quality: 'Price',
            status: 'Availability',
          }
      : isMagazineProduct && /issues|essays|stories/i.test(screen.name)
        ? {
            name: screen.name.toLowerCase().includes('essay') ? 'Photo essay' : 'Issue',
            type: 'Editorial section and date',
            quality: 'Stories',
            status: 'Publication status',
          }
        : isNewsroom && /assignments|planner|edition/i.test(screen.name)
          ? {
              name: 'Story',
              type: 'Reporter and section',
              quality: 'Copy review',
              status: 'Assignment status',
            }
          : isRadioProduct && /episode|schedule/i.test(screen.name)
            ? {
                name: 'Programme or episode',
                type: 'Broadcast time and transcript',
                quality: 'Duration',
                status: 'Archive status',
              }
            : isLocalJournalism && /topic|archive/i.test(screen.name)
              ? {
                  name: 'Local story',
                  type: 'Topic and byline',
                  quality: 'Published',
                  status: 'Article status',
                }
              : isStreamingCatalogue
                ? {
                    name: 'Film',
                    type: 'Genre and format',
                    quality: 'Runtime',
                    status: 'Availability',
                  }
                : isFlightDocuments
                  ? {
                      name: 'Document',
                      type: 'Journey',
                      quality: 'Offline access',
                      status: 'Status',
                    }
                  : isRealEstate
                    ? {
                        name: 'Property',
                        type: 'Location and features',
                        quality: 'Price',
                        status: 'Availability',
                      }
                    : {
                        name: employee ? 'Colleague' : 'Record',
                        type: employee ? 'Team' : 'Context',
                        quality: employee ? 'Progress' : 'Data',
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
      : isMunicipalWaterOperations
        ? waterWorkflows.map((workflow) => ({
            title: humanizeWorkflowLabel(workflow.name),
            tasks: workflow.steps.map(humanizeWorkflowLabel),
          }))
      : product.workflows.map((workflow) => ({
          title: humanizeWorkflowLabel(workflow.name),
          tasks: workflow.steps.map(humanizeWorkflowLabel),
        })),
    label:
      role === 'search-header'
        ? searchCopy.label
        : role === 'conversion-cta'
          ? primaryActionLabel
          : role === 'message-composer'
            ? 'Write a message'
            : role === 'auth-card'
              ? 'Work email'
              : role === 'settings-form'
                ? isMutualAidSettingsScreen
                  ? 'Privacy and language preferences'
                  : isReturnsPortal
                  ? 'Return reason'
                  : isEmployeeSettingsScreen
                    ? 'Policy acknowledgement (preview only)'
                    : 'Notification preferences'
                : role === 'save-footer'
                  ? saveFooterLabel
                  : role === 'auth-footer'
                    ? 'Sign in requires your authentication backend'
                    : 'Continue onboarding',
    placeholder:
      role === 'search-header'
        ? searchCopy.placeholder
        : role === 'message-composer'
          ? 'Write a message…'
          : role === 'settings-form' && isMutualAidSettingsScreen
            ? 'Connect resident accounts to configure'
          : role === 'settings-form' && isEmployeeSettingsScreen
            ? 'Local preview — not saved'
          : role === 'settings-form' && isReturnsPortal
            ? 'Describe why these items are being returned'
            : undefined,
    helperText:
      role === 'search-header'
        ? searchCopy.helperText
        : role === 'message-composer'
          ? 'Example input. Connect a messaging backend to send messages.'
          : role === 'save-footer' && isReturnsPortal
            ? 'Connect a returns service before submitting requests.'
            : role === 'save-footer' && isEmployeeSettingsScreen
              ? 'Connect persistence to save.'
              : role === 'save-footer'
                ? 'Connect persistence to save changes.'
          : role === 'settings-form' && isEmployeeSettingsScreen
            ? 'Sample respectful workplace and information security guidance. Replace with approved company text; acknowledgements are not stored in this preview.'
          : role === 'settings-form' && isReturnsPortal
            ? 'Example field. Connect order data and a returns service in the exported application.'
          : role === 'settings-form' && isMutualAidSettingsScreen
            ? 'Example settings only. No resident profile, language preference, or consent state is connected. Changes are not saved in this preview.'
            : 'Example field. Connect persistence and your backend in the exported application.',
    children:
      role === 'pagination'
        ? 'Paging unavailable'
        : role === 'action-controls' || role === 'action-button'
          ? 'Connect an action to continue'
        : role === 'save-footer'
          ? saveFooterLabel
        : role === 'auth-footer'
          ? 'Authentication backend required'
          : 'Continue',
    disabled:
      isMutualAidSettingsScreen && role === 'settings-form'
        ? true
        : ['save-footer', 'auth-footer', 'action-controls', 'action-button', 'pagination'].includes(
            role
          ),
    href: primaryActionHref,
  };
  if (role === 'save-footer' && isReturnsPortal) {
    content.title = 'Connect a returns service before submitting requests.';
  }
  if (role === 'save-footer' && isEmployeeSettingsScreen) {
    content.title = 'Connect persistence to save.';
  }
  if (role === 'save-footer' && isMutualAidSettingsScreen) {
    content.title = 'Connect an account service to save privacy preferences.';
  }
  if (role === 'pagination') {
    content.title = 'Connect a paging data source before navigating additional records.';
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
    role !== 'pagination' &&
    !(role === 'save-footer' && (isReturnsPortal || isEmployeeSettingsScreen))
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
    button: ['children', 'disabled', 'title', 'helperText'],
    'magnetic-button': ['children', 'disabled', 'title', 'helperText'],
    input: ['label', 'helperText', 'placeholder', 'disabled', 'title'],
  };
  return Object.fromEntries(
    (accepted[resourceSlug] ?? [])
      .filter((key) => content[key] !== undefined)
      .map((key) => [key, content[key]])
  );
}
