import { hasPositiveArchetypeCue, type ArchetypeDefinition } from './archetypes.js';

export function isEmployeeExperienceBrief(text: string): boolean {
  return (
    /\b(?:employee experience|employee engagement|employee portal|workplace experience|people operations|people ops|human resources|hr management|hr platform)\b/i.test(
      text
    ) &&
    !/\b(?:recruit(?:ing|ment|er|ers)|talent acquisition|candidate|applicant|hiring|interview|job opening|open role|job requisition)\b/i.test(
      text
    )
  );
}

/** Apply employee-specific product context to SaaS without overriding an explicit recruitment taxonomy. */
export function specialisePeopleOperations(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  if (base.id !== 'saas' || !isEmployeeExperienceBrief(text)) return base;
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
    forbiddenPatterns: [],
  };
}

/** Replace warehouse defaults with consent-aware service workflows for bicycle repair co-ops. */
export function specialiseBicycleRepairOperations(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  const isBicycleRepairService =
    /\b(?:bicycle|bike|e[- ]?bike)\b/i.test(text) &&
    /\b(?:repair|service)\b/i.test(text) &&
    /\b(?:shop|co[- ]?op|cooperative|workshop|mechanics?|service desk)\b/i.test(text);

  if (base.id !== 'erp-operations' || !isBicycleRepairService) return base;

  return {
    ...base,
    name: 'Bicycle Repair Operations',
    description:
      'Service intake, safety inspection, consented estimates, parts availability, and pickup readiness for bicycle repair workshops.',
    primaryAudience: 'Mechanics, service advisors, and volunteer coordinators at bicycle repair co-ops',
    primaryObjective:
      'Receive bicycles, triage brake and steering safety, confirm repair estimates, reserve available parts, and return each bicycle ready for pickup',
    userSophistication: 62,
    trustRequirement: 94,
    informationComplexity: 72,
    dataDensity: 68,
    collaborationLevel: 74,
    transactionCriticality: 45,
    navigationComplexity: 68,
    mobileImportance: 92,
    defaultEntities: [
      {
        name: 'RepairJob',
        description: 'A bicycle repair request with reported symptoms, safety status, consent, and pickup state',
        fields: ['id', 'bikeType', 'reportedIssue', 'safetyStatus', 'estimateStatus', 'assignedMechanic', 'partsStatus', 'pickupReady'],
      },
      {
        name: 'Inspection',
        description: 'Recorded brake and steering checks for a repair job',
        fields: ['id', 'repairJobId', 'brakeStatus', 'steeringStatus', 'findings', 'inspectedBy', 'inspectedAt'],
      },
      {
        name: 'Part',
        description: 'A repair part with on-hand and reserved quantities',
        fields: ['id', 'name', 'stockOnHand', 'reservedQuantity', 'availability'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'intake-bicycle',
        name: 'Check in a bicycle and record the rider-reported issue',
        steps: ['record-bike-details', 'capture-reported-symptoms', 'assign-intake-priority'],
      },
      {
        id: 'inspect-bicycle-safety',
        name: 'Inspect brake and steering safety before assigning repair work',
        steps: ['inspect-brakes', 'inspect-steering', 'record-safety-findings', 'set-repair-priority'],
      },
      {
        id: 'confirm-repair-estimate',
        name: 'Confirm estimate consent, check parts, and assign a mechanic',
        steps: ['prepare-itemized-estimate', 'record-rider-consent', 'reserve-available-parts', 'assign-mechanic'],
      },
      {
        id: 'prepare-bicycle-pickup',
        name: 'Verify completed safety checks and prepare a bicycle for pickup',
        steps: ['record-repair-checks', 'verify-safety', 'mark-pickup-ready', 'notify-rider'],
      },
    ],
    recommendedScreens: [
      {
        name: 'Service Desk',
        screenType: 'dashboard',
        purpose: 'Review today’s check-ins, safety-critical repairs, and pickup commitments',
        jobs: ['review-repair-queue', 'triage-safety-priority'],
        required: true,
      },
      {
        name: 'Repair Intake',
        screenType: 'detail-entity',
        purpose: 'Record the bicycle, rider-reported symptoms, and intake priority',
        jobs: ['intake-bicycle', 'record-reported-symptoms'],
        required: true,
      },
      {
        name: 'Safety Inspection',
        screenType: 'workspace-editor',
        purpose: 'Document brake and steering checks before repair work is assigned',
        jobs: ['inspect-bicycle-safety', 'record-safety-findings'],
        required: true,
      },
      {
        name: 'Parts & Estimates',
        screenType: 'index-list',
        purpose: 'Check part availability and record rider consent for a repair estimate',
        jobs: ['confirm-repair-estimate', 'reserve-available-parts'],
        required: true,
      },
      {
        name: 'Pickup & Handover',
        screenType: 'detail-entity',
        purpose: 'Verify safety checks and mark a completed bicycle ready for pickup',
        jobs: ['prepare-bicycle-pickup', 'notify-rider'],
        required: true,
      },
    ],
    requiredCapabilities: [
      'bicycle-repair-service-workflow',
      'service-intake',
      'brake-and-steering-safety-inspection',
      'consented-repair-estimates',
      'parts-availability',
      'pickup-readiness',
    ],
    forbiddenPatterns: [
      ...base.forbiddenPatterns,
      'marking-a-safety-critical-bicycle-ready-without-an-inspection-record',
      'charging-for-repairs-before-rider-estimate-consent',
    ],
  };
}

/** Replace warehouse defaults with privacy-conscious food-pantry operations. */
export function specialiseFoodPantryOperations(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  const isCommunityFoodPantry =
    /\b(?:food pantry|food bank|community pantry)\b/i.test(text) &&
    /\b(?:households?|volunteers?|grocery packs?|emergency parcels?|food safety|chilled stock|expiry dates?|waitlist|pickup instructions?)\b/i.test(
      text
    );

  if (base.id !== 'erp-operations' || !isCommunityFoodPantry) return base;

  return {
    ...base,
    name: 'Community Food Pantry Operations',
    description:
      'Coordinate household pickup, weekly grocery-pack choices, emergency parcels, safe stock rotation, and restricted food-safety escalation.',
    primaryAudience: 'Households, pantry volunteers, and assigned food-safety coordinators',
    primaryObjective:
      'Coordinate weekly grocery-pack choices, same-day emergency parcels, chilled-stock expiry, and clear pickup instructions while collecting only essential household details',
    userSophistication: 48,
    trustRequirement: 96,
    informationComplexity: 66,
    dataDensity: 58,
    collaborationLevel: 88,
    transactionCriticality: 32,
    navigationComplexity: 64,
    mobileImportance: 96,
    defaultEntities: [
      {
        name: 'Household Pickup',
        description: 'A household-selected name, pickup essentials, chosen pack, and collection status',
        fields: ['id', 'chosenName', 'pickupEssentials', 'packSelection', 'pickupStatus'],
      },
      {
        name: 'Pack Selection',
        description: 'A household’s choices for a scheduled weekly grocery pack',
        fields: ['id', 'householdId', 'week', 'chosenItems', 'substitutions', 'status'],
      },
      {
        name: 'Stock Lot',
        description: 'A pantry item with storage conditions, quantity, and use-by date',
        fields: ['id', 'itemName', 'storageCondition', 'availableQuantity', 'useByDate'],
      },
      {
        name: 'Restricted Safety Route',
        description: 'A private coordinator route with a neutral volunteer packing alert',
        fields: ['id', 'householdId', 'assignedCoordinatorId', 'neutralPackingAlert', 'status'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'schedule-pantry-pickups',
        name: 'Assign weekly pickup slots, update the waitlist, and issue plain-language instructions',
        steps: ['review-pickup-capacity', 'offer-pickup-slot', 'update-waitlist', 'prepare-pickup-instructions'],
      },
      {
        id: 'select-weekly-pack',
        name: 'Record a household’s weekly grocery-pack choices and confirm available substitutions',
        steps: ['review-pack-options', 'record-household-choices', 'confirm-substitutions'],
      },
      {
        id: 'prepare-emergency-parcel',
        name: 'Coordinate a same-day emergency parcel using only the chosen name and pickup essentials',
        steps: ['record-essential-pickup-details', 'prepare-parcel', 'confirm-handoff'],
      },
      {
        id: 'rotate-chilled-stock',
        name: 'Check chilled-stock expiry, rotate safe items, and flag stock that must be withdrawn',
        steps: ['review-storage-condition', 'sort-by-use-by-date', 'withdraw-expired-stock'],
      },
      {
        id: 'route-restricted-safety-concern',
        name: 'Send a neutral packing alert to volunteers and route restricted safety concerns to an assigned coordinator',
        steps: ['prepare-neutral-packing-alert', 'restrict-safety-details', 'route-safeguarding-concern'],
      },
    ],
    recommendedScreens: [
      {
        name: 'Pickup Schedule & Waitlist',
        screenType: 'dashboard',
        purpose: 'Review pickup capacity, waitlist changes, and same-day parcel priorities',
        jobs: ['schedule-pantry-pickups', 'review-pickup-capacity', 'triage-emergency-parcels'],
        required: true,
      },
      {
        name: 'Household Intake & Pickup',
        screenType: 'detail-entity',
        purpose: 'Record a chosen name and pickup essentials, then provide clear multilingual instructions',
        jobs: ['record-essential-pickup-details', 'prepare-pickup-instructions'],
        required: true,
      },
      {
        name: 'Weekly Pack Choices',
        screenType: 'detail-entity',
        purpose: 'Record grocery-pack choices and confirm available substitutions with the household',
        jobs: ['review-pack-options', 'record-household-choices', 'confirm-substitutions'],
        required: true,
      },
      {
        name: 'Emergency Parcels',
        screenType: 'index-list',
        purpose: 'Coordinate same-day parcels and neutral packing alerts without exposing private notes',
        jobs: ['triage-emergency-parcels', 'prepare-parcel', 'confirm-handoff'],
        required: true,
      },
      {
        name: 'Stock & Expiry',
        screenType: 'index-list',
        purpose: 'Review chilled stock by storage condition and use-by date before rotation or withdrawal',
        jobs: ['review-storage-condition', 'sort-by-use-by-date', 'withdraw-expired-stock'],
        required: true,
      },
      {
        name: 'Food Safety & Safeguarding',
        screenType: 'detail-entity',
        purpose: 'Keep allergy details with assigned food-safety coordinators and route safeguarding separately',
        jobs: ['restrict-safety-details', 'route-safeguarding-concern'],
        required: true,
      },
    ],
    requiredCapabilities: [
      'food-pantry-workflow',
      'minimal-household-data-intake',
      'offline-intake-continuity',
      'multilingual-pickup-instructions',
      'expiry-aware-chilled-stock',
      'coordinator-restricted-allergy-details',
      'private-safeguarding-route',
    ],
    forbiddenPatterns: [
      ...base.forbiddenPatterns,
      'collecting-proof-of-immigration-income-or-diagnosis',
      'showing-private-allergy-notes-to-volunteers',
      'exposing-safeguarding-case-notes',
      'payment-or-donation-collection',
    ],
  };
}

/** Specialize anchored disaster-response coordination without implying live integrations. */
export function specialiseCommunityEmergencyOperations(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  const hasResponseAnchor =
    /\b(?:mutual[- ]aid(?: network)?|community emergency response|disaster response(?: coordination)?|humanitarian relief(?: coordination)?)\b/i.test(
      text
    );
  const hasFieldContext =
    /\b(?:shelters?|neighbou?rhood hubs?|relief supplies|evacuation|flood|wildfire|storm|volunteer shifts?|welfare checks?)\b/i.test(
      text
    );

  if (base.id !== 'erp-operations' || !hasResponseAnchor || !hasFieldContext) return base;

  return {
    ...base,
    name: 'Community Emergency Response Operations',
    description:
      'Coordinate aid requests, shelter and hub capacity, supplies, and volunteer handovers while keeping public status aggregated.',
    primaryAudience: 'Volunteer coordinators, shelter teams, and neighbourhood-hub leads',
    primaryObjective:
      'Coordinate essential-aid requests, shelter capacity, safe pickup points, and volunteer handovers with minimal personal data',
    userSophistication: 52,
    trustRequirement: 99,
    informationComplexity: 78,
    dataDensity: 70,
    collaborationLevel: 96,
    transactionCriticality: 30,
    navigationComplexity: 74,
    mobileImportance: 98,
    defaultEntities: [
      {
        name: 'ReliefRequest',
        description: 'An aid type, assigned hub, manually reviewed priority, and status without identity or contact details',
        fields: ['id', 'aidType', 'assignedHubId', 'manualPriority', 'status'],
      },
      {
        name: 'HubCapacity',
        description: 'Example service capacity and safe pickup availability for a shelter or neighborhood hub',
        fields: ['id', 'hubName', 'safePickupPoints', 'accessibleTransportCapacity', 'serviceStatus'],
      },
      {
        name: 'SupplyStock',
        description: 'A manually checked supply type, quantity, and assigned hub',
        fields: ['id', 'supplyType', 'quantityAvailable', 'hubId', 'lastUpdatedAt'],
      },
      {
        name: 'ShiftHandover',
        description: 'Open request count, supply notes, and update time for the next volunteer shift',
        fields: ['id', 'hubId', 'openRequestCount', 'supplyNotes', 'lastUpdatedAt'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'review-aid-requests',
        name: 'Review essential-aid requests and manually assign a shelter or neighborhood hub',
        steps: ['record-minimal-aid-type', 'review-priority-manually', 'assign-safe-hub', 'confirm-request-status'],
      },
      {
        id: 'coordinate-shelter-pickup-capacity',
        name: 'Coordinate shelter and hub capacity, safe pickup points, and accessible transport',
        steps: ['review-hub-service-status', 'confirm-safe-pickup-point', 'coordinate-accessible-transport'],
      },
      {
        id: 'track-relief-supplies',
        name: 'Review manually checked water, charging, and blanket supplies at each hub',
        steps: ['record-supply-quantity', 'assign-supply-to-hub', 'review-last-checked-time'],
      },
      {
        id: 'handover-volunteer-shift',
        name: 'Hand over open requests, supply notes, and unresolved work to the next volunteer shift',
        steps: ['review-open-request-count', 'record-supply-notes', 'confirm-next-shift-handover'],
      },
      {
        id: 'publish-aggregated-public-status',
        name: 'Share aggregated service capacity and safe pickup points without exposing individual requests',
        steps: ['aggregate-hub-capacity', 'remove-request-level-details', 'review-public-status-copy'],
      },
      {
        id: 'reconcile-outage-requests',
        name: 'Review locally recorded requests after an outage; synchronization is not assumed',
        steps: ['review-locally-recorded-requests', 'check-duplicate-submissions', 'confirm-manual-reconciliation'],
      },
    ],
    recommendedScreens: [
      {
        name: 'Coordination Overview',
        screenType: 'dashboard',
        purpose: 'Review request counts, hub service capacity, supplies, and shift handovers as example data',
        jobs: ['review-aid-requests', 'coordinate-shelter-pickup-capacity'],
        required: true,
      },
      {
        name: 'Request Intake & Triage',
        screenType: 'workspace-editor',
        purpose: 'Record an aid type and assigned hub for manual priority review using minimal personal data',
        jobs: ['review-aid-requests', 'reconcile-outage-requests'],
        required: true,
      },
      {
        name: 'Shelter & Hub Capacity',
        screenType: 'index-list',
        purpose: 'Review safe pickup points and accessible transport by shelter or neighborhood hub',
        jobs: ['coordinate-shelter-pickup-capacity'],
        required: true,
      },
      {
        name: 'Supplies & Distribution',
        screenType: 'index-list',
        purpose: 'Review manually checked water, charging, and blanket quantities at each hub',
        jobs: ['track-relief-supplies'],
        required: true,
      },
      {
        name: 'Volunteer Shift Handover',
        screenType: 'workspace-editor',
        purpose: 'Pass open requests and supply notes between volunteer shifts',
        jobs: ['handover-volunteer-shift', 'reconcile-outage-requests'],
        required: true,
      },
      {
        name: 'Public Capacity Status',
        screenType: 'dashboard',
        purpose: 'Show reviewed aggregate capacity and safe pickup points without individual request details',
        jobs: ['publish-aggregated-public-status'],
        required: true,
      },
    ],
    requiredCapabilities: [
      'community-emergency-response-workflow',
      'minimal-aid-request-intake',
      'privacy-preserving-request-routing',
      'manual-priority-review',
      'shelter-hub-capacity-coordination',
      'accessible-transport-planning',
      'offline-request-capture-and-reconciliation',
      'volunteer-shift-handover',
      'aggregated-public-capacity',
      'privacy-preserving-public-status',
    ],
    forbiddenPatterns: [
      ...base.forbiddenPatterns,
      'collecting-immigration-status-or-medical-diagnosis',
      'publishing-individual-request-or-welfare-check-details',
      'automated-emergency-eligibility-or-priority-decisions',
      'claiming-live-sms-dispatch-or-mapping-integrations',
      'claiming-automatic-offline-synchronization',
      'payment-or-fundraising-collection',
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
  if (base.id !== 'ecommerce') return base;

  const returnsPortal =
    /\b(?:returns? portal|return approval|refund steps|refund status|return request|process returns)\b/i.test(
      text
    );
  if (!returnsPortal) {
    const isGrocery = /\b(?:grocery|fresh food)\b/i.test(text);
    const isMusic = /\b(?:licensed albums?|music shop|digital music)\b/i.test(text);
    const isCosmetics = /\b(?:cosmetics?|ingredients?)\b/i.test(text);
    const isHomeGoods = /\b(?:home goods?|product specifications)\b/i.test(text);
    const catalogProfile = /\b(?:grocery|fresh food)\b/i.test(text)
      ? {
          objective:
            'Help local shoppers find fresh food, build a grocery order, choose a delivery window, and confirm their purchase',
          purpose: 'Search fresh food, compare item details, and build a delivery order',
          jobs: ['search-fresh-food', 'compare-item-details', 'choose-delivery-window'],
        }
      : /\b(?:licensed albums?|music shop|digital music)\b/i.test(text)
        ? {
            objective:
              'Help listeners sample licensed albums, compare releases, and buy selected music downloads',
            purpose: 'Browse licensed albums, preview samples, and choose releases to buy',
            jobs: ['browse-albums', 'play-sample', 'buy-selected-release'],
          }
        : /\b(?:cosmetics?|ingredients?)\b/i.test(text)
          ? {
              objective:
                'Help shoppers compare cosmetic ingredients, select product variations, and review delivery and returns before buying',
              purpose: 'Compare ingredients, product variations, delivery, and returns',
              jobs: ['compare-ingredients', 'select-variation', 'review-delivery-and-returns'],
            }
          : /\b(?:home goods?|collections?|product specifications)\b/i.test(text)
            ? {
                objective:
                  'Help shoppers browse home-goods collections, compare product specifications, and complete a clear purchase flow',
                purpose: 'Browse home-goods collections and compare product specifications',
                jobs: ['browse-collections', 'compare-specifications', 'complete-purchase'],
              }
            : {
                objective:
                  'Help shoppers browse seasonal clothing, compare garment details and sizes, and complete checkout',
                purpose:
                  'Browse seasonal garments, compare materials and sizes, and choose a product',
                jobs: ['browse-seasonal-clothing', 'compare-garments-and-sizes', 'choose-product'],
              };

    const specialised: ArchetypeDefinition = {
      ...base,
      name: 'Online Store',
      primaryObjective: catalogProfile.objective,
      recommendedScreens: [
        {
          name: 'Product Catalog',
          screenType: 'search-explore',
          purpose: catalogProfile.purpose,
          jobs: catalogProfile.jobs,
          required: true,
        },
        ...base.recommendedScreens.slice(1),
      ],
    };

    if (isGrocery) {
      specialised.primaryAudience = 'Local grocery shoppers and delivery teams';
      specialised.defaultWorkflows = [
        {
          id: 'build-grocery-order',
          name: 'Find fresh food, add items to a grocery order, and choose a delivery window',
          steps: ['search-fresh-food', 'add-grocery-items', 'choose-delivery-window'],
        },
        {
          id: 'track-grocery-delivery',
          name: 'Review grocery substitutions and delivery progress',
          steps: ['review-substitutions', 'track-delivery'],
        },
      ];
    }

    if (isMusic) {
      specialised.primaryAudience =
        'Music listeners discovering licensed albums and digital releases';
      specialised.defaultEntities = [
        {
          name: 'Album',
          description: 'A licensed album with artist, track list, and release details',
          fields: ['id', 'title', 'artist', 'tracks', 'releaseDate', 'licence'],
        },
        {
          name: 'Release',
          description: 'A digital music release available to sample and purchase',
          fields: ['id', 'albumId', 'format', 'price', 'availability'],
        },
        {
          name: 'Download',
          description: 'A purchased release available for account download',
          fields: ['id', 'releaseId', 'orderId', 'downloadStatus'],
        },
      ];
      specialised.defaultWorkflows = [
        {
          id: 'sample-and-buy-album',
          name: 'Browse licensed albums, play a sample, and buy a selected release',
          steps: ['browse-albums', 'play-sample', 'select-release', 'complete-purchase'],
        },
        {
          id: 'download-music',
          name: 'Find a purchased music release and download it again',
          steps: ['find-purchased-release', 'download-release'],
        },
      ];
    }

    if (isCosmetics) {
      specialised.primaryAudience =
        'Cosmetics shoppers comparing ingredients and product variations';
      specialised.defaultEntities = [
        {
          name: 'Product',
          description: 'A cosmetic product with ingredients, variations, and delivery details',
          fields: ['id', 'title', 'ingredients', 'variants', 'price', 'delivery', 'returns'],
        },
        ...base.defaultEntities.slice(1),
      ];
      specialised.defaultWorkflows = [
        {
          id: 'compare-cosmetics',
          name: 'Compare ingredients, choose a product variation, and review delivery and returns',
          steps: ['compare-ingredients', 'select-variation', 'review-delivery-and-returns'],
        },
        ...base.defaultWorkflows.slice(0, 1),
      ];
    }

    if (isHomeGoods) {
      specialised.defaultWorkflows = [
        {
          id: 'compare-home-goods',
          name: 'Browse home-goods collections and compare product specifications',
          steps: ['browse-collections', 'compare-specifications', 'choose-product'],
        },
        ...base.defaultWorkflows.slice(0, 1),
      ];
    }

    return specialised;
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

/** Specialise the travel archetype around the journey the brief actually describes. */
export function specialiseTravel(base: ArchetypeDefinition, text: string): ArchetypeDefinition {
  if (base.id !== 'travel') return base;

  const flightManagement =
    /\b(?:flight[- ]management|frequent flyers?|gate updates?|check[- ]in reminders?|travel documents?)\b/i.test(
      text
    );
  const tripPlanning =
    /\b(?:trip[- ]planning|trip planner|shared itinerary|coordinate dates|day[- ]by[- ]day plan)\b/i.test(
      text
    );
  const hotelBooking =
    /\b(?:boutique hotel|hotel booking|hotel reservation|room details|reservation flow)\b/i.test(
      text
    );
  const guestPortal =
    /\b(?:guest portal|resort guest|on[- ]property services?|concierge assistance)\b/i.test(text);
  const destinationGuide = /\b(?:destination guide|neighborhoods|save recommendations)\b/i.test(
    text
  );

  if (flightManagement) {
    return {
      ...base,
      name: 'Flight Management',
      primaryAudience: 'Frequent flyers managing confirmed journeys and travel documents',
      primaryObjective:
        'Help frequent flyers track confirmed journeys, complete check-in, follow gate updates, and find travel documents',
      defaultEntities: [
        {
          name: 'Flight',
          description: 'A confirmed flight with route, departure time, gate, and status',
          fields: [
            'id',
            'carrier',
            'flightNumber',
            'origin',
            'destination',
            'departureAt',
            'gate',
            'status',
          ],
        },
        {
          name: 'Journey',
          description: 'A traveler itinerary containing one or more confirmed flights',
          fields: ['id', 'travelerId', 'flightIds', 'dates', 'confirmationCode'],
        },
        {
          name: 'Travel Document',
          description: 'A boarding pass or travel document linked to a confirmed journey',
          fields: ['id', 'journeyId', 'type', 'issuedAt', 'offlineAvailable'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'manage-confirmed-journey',
          name: 'Review a confirmed journey, check in, and follow gate updates',
          steps: ['review-flight', 'complete-check-in', 'track-gate-updates'],
        },
        {
          id: 'retrieve-travel-documents',
          name: 'Find a boarding pass and keep travel documents available offline',
          steps: ['open-boarding-pass', 'save-document-offline'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Journey Overview',
          screenType: 'dashboard',
          purpose: 'Upcoming confirmed flights, check-in reminders, and gate changes',
          jobs: ['review-upcoming-journeys', 'complete-check-in', 'track-gate-updates'],
          required: true,
        },
        {
          name: 'Flight Details',
          screenType: 'detail-entity',
          purpose: 'Flight status, route, departure details, and boarding information',
          jobs: ['review-flight-status', 'find-boarding-gate'],
          required: true,
        },
        {
          name: 'Travel Documents',
          screenType: 'index-list',
          purpose: 'Boarding passes and journey documents available for offline access',
          jobs: ['find-boarding-pass', 'save-documents-offline'],
          required: true,
        },
      ],
      requiredCapabilities: ['flight-status', 'check-in-reminders', 'offline-travel-documents'],
    };
  }

  if (hotelBooking) {
    return {
      ...base,
      name: 'Hotel Booking',
      primaryAudience: 'Travelers comparing hotel rooms and making reservations',
      primaryObjective:
        'Help travelers compare hotel rooms, amenities, local guides, and availability before confirming a reservation',
      defaultEntities: [
        {
          name: 'Hotel',
          description: 'A hotel with location, amenities, and guest information',
          fields: ['id', 'name', 'location', 'amenities', 'rating'],
        },
        {
          name: 'Room',
          description: 'A room option with details, capacity, and availability',
          fields: ['id', 'hotelId', 'name', 'capacity', 'amenities', 'availability'],
        },
        {
          name: 'Reservation',
          description: 'A confirmed room reservation with dates and guest details',
          fields: ['id', 'roomId', 'dates', 'guests', 'confirmationCode', 'status'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'reserve-hotel-room',
          name: 'Compare rooms, choose dates, and confirm a hotel reservation',
          steps: ['search-hotels', 'compare-room-details', 'choose-dates', 'confirm-reservation'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Find a Stay',
          screenType: 'search-explore',
          purpose: 'Search boutique hotels by dates, amenities, and location',
          jobs: ['search-hotels', 'compare-availability'],
          required: true,
        },
        {
          name: 'Room Details',
          screenType: 'detail-entity',
          purpose: 'Room details, amenities, local guidance, and cancellation terms',
          jobs: ['review-room', 'check-amenities'],
          required: true,
        },
        {
          name: 'Reservation Checkout',
          screenType: 'checkout-transaction',
          purpose: 'Review reservation dates, guest details, and clear payment terms',
          jobs: ['review-reservation', 'confirm-booking'],
          required: true,
        },
      ],
      requiredCapabilities: ['availability-search', 'room-details', 'reservation-flow'],
    };
  }

  if (guestPortal) {
    return {
      ...base,
      name: 'Resort Guest Portal',
      primaryAudience: 'Resort guests and on-property service teams',
      primaryObjective:
        'Help resort guests review their stay, request concierge assistance, and find on-property services',
      defaultEntities: [
        {
          name: 'Stay',
          description: 'A guest stay with dates, room, and reservation details',
          fields: ['id', 'guestId', 'room', 'arrivalDate', 'departureDate', 'confirmationCode'],
        },
        {
          name: 'Service',
          description: 'An on-property service with availability and request details',
          fields: ['id', 'name', 'location', 'hours', 'availability'],
        },
        {
          name: 'Concierge Request',
          description: 'A guest request and its service status',
          fields: ['id', 'guestId', 'serviceId', 'requestedAt', 'status'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'request-concierge-help',
          name: 'Find a resort service and request concierge assistance',
          steps: ['browse-on-property-services', 'request-assistance', 'track-request'],
        },
        {
          id: 'review-resort-stay',
          name: 'Review stay details, arrival information, and guest services',
          steps: ['review-stay-details', 'find-property-services'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Stay Overview',
          screenType: 'dashboard',
          purpose: 'Stay dates, arrival information, and services for this visit',
          jobs: ['review-stay-details', 'find-next-service'],
          required: true,
        },
        {
          name: 'On-Property Services',
          screenType: 'index-list',
          purpose: 'Browse resort services, locations, and hours',
          jobs: ['browse-services', 'check-service-hours'],
          required: true,
        },
        {
          name: 'Concierge Requests',
          screenType: 'messages-collaboration',
          purpose: 'Request concierge help and follow each response',
          jobs: ['request-assistance', 'follow-service-request'],
          required: true,
        },
      ],
      requiredCapabilities: ['concierge-requests', 'on-property-services', 'stay-details'],
    };
  }

  if (destinationGuide) {
    return {
      ...base,
      name: 'Destination Guide',
      primaryAudience: 'Travelers exploring neighborhoods and planning visits',
      primaryObjective:
        'Help travelers explore destination neighborhoods, save recommendations, and build a day-by-day plan',
      defaultEntities: [
        {
          name: 'Destination',
          description: 'A destination neighborhood with places and practical details',
          fields: ['id', 'name', 'region', 'highlights', 'transport'],
        },
        {
          name: 'Recommendation',
          description: 'A saved place or activity with a traveler note',
          fields: ['id', 'destinationId', 'name', 'category', 'savedBy'],
        },
        {
          name: 'Day Plan',
          description: 'A day-by-day visit plan containing saved recommendations',
          fields: ['id', 'date', 'recommendationIds', 'notes'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'build-destination-plan',
          name: 'Explore neighborhoods, save places, and organize a day-by-day plan',
          steps: ['explore-neighborhoods', 'save-recommendation', 'organize-day-plan'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Explore Destinations',
          screenType: 'search-explore',
          purpose: 'Explore neighborhoods, local highlights, and saved recommendations',
          jobs: ['browse-neighborhoods', 'save-places'],
          required: true,
        },
        {
          name: 'Neighborhood Detail',
          screenType: 'detail-entity',
          purpose: 'Neighborhood overview, saved places, and practical visitor information',
          jobs: ['review-neighborhood', 'save-recommendations'],
          required: true,
        },
        {
          name: 'Day-by-Day Plan',
          screenType: 'workspace-editor',
          purpose: 'Organize saved recommendations into a shared daily itinerary',
          jobs: ['organize-activities', 'coordinate-days'],
          required: true,
        },
      ],
      requiredCapabilities: ['destination-discovery', 'saved-recommendations', 'shared-day-plan'],
    };
  }

  if (tripPlanning) {
    return {
      ...base,
      name: 'Trip Planner',
      primaryAudience: 'Travelers planning a shared trip together',
      primaryObjective:
        'Help travelers compare destinations, save places, coordinate dates, and build a shared itinerary',
      defaultEntities: [
        {
          name: 'Trip',
          description: 'A shared trip with travelers, dates, and itinerary items',
          fields: ['id', 'name', 'travelerIds', 'startDate', 'endDate'],
        },
        {
          name: 'Destination',
          description: 'A destination being considered or saved for the trip',
          fields: ['id', 'name', 'region', 'highlights', 'estimatedCost'],
        },
        {
          name: 'Itinerary Item',
          description: 'A saved place or activity assigned to a trip day',
          fields: ['id', 'tripId', 'date', 'place', 'notes'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'plan-shared-trip',
          name: 'Compare destinations, coordinate dates, and build a shared itinerary',
          steps: ['compare-destinations', 'save-places', 'coordinate-dates', 'build-itinerary'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Destination Search',
          screenType: 'search-explore',
          purpose: 'Compare trip destinations and save places for a shared plan',
          jobs: ['compare-destinations', 'save-places'],
          required: true,
        },
        {
          name: 'Shared Itinerary',
          screenType: 'workspace-editor',
          purpose: 'Coordinate dates and organize saved places into trip days',
          jobs: ['coordinate-dates', 'organize-itinerary'],
          required: true,
        },
        {
          name: 'Saved Places',
          screenType: 'index-list',
          purpose: 'Review and organize places saved by trip participants',
          jobs: ['review-saved-places', 'choose-trip-stops'],
          required: true,
        },
      ],
      requiredCapabilities: ['trip-comparison', 'shared-itinerary', 'saved-places'],
    };
  }

  return base;
}

/** Keep film streaming journeys separate from newspaper and magazine publishing. */
export function specialiseMedia(base: ArchetypeDefinition, text: string): ArchetypeDefinition {
  if (base.id !== 'media') {
    return base;
  }

  const isPublicLibrary =
    ['public library', 'community library', 'book lending library'].some((cue) =>
      hasPositiveArchetypeCue(text, cue)
    ) &&
    [
      'book catalogue',
      'book catalog',
      'reserve books',
      'hold queue',
      'branch pickup',
      'reading circles',
      'author events',
      'library branches',
    ].some((cue) => hasPositiveArchetypeCue(text, cue));

  if (isPublicLibrary) {
    return {
      ...base,
      name: 'Public Library Service',
      description:
        'Book discovery, private holds, branch pickup, and community reading programmes for public libraries.',
      primaryAudience: 'Library members, volunteer librarians, and branch coordinators',
      primaryObjective:
        'Help residents discover books, reserve titles for branch pickup, and find local reading programmes while protecting their reading privacy',
      userSophistication: 38,
      trustRequirement: 96,
      informationComplexity: 58,
      dataDensity: 48,
      collaborationLevel: 72,
      transactionCriticality: 18,
      navigationComplexity: 58,
      mobileImportance: 96,
      defaultEntities: [
        {
          name: 'BookRecord',
          description: 'A catalogue title with author, subjects, format, and branch availability',
          fields: ['id', 'title', 'authors', 'subjects', 'format', 'availabilitySummary'],
        },
        {
          name: 'HoldRequest',
          description: 'A member’s private request for a title at a selected branch',
          fields: ['id', 'titleId', 'branchId', 'pickupWindow', 'status'],
        },
        {
          name: 'LibraryBranch',
          description: 'A local branch with opening hours and accessible services',
          fields: ['id', 'name', 'openingHours', 'accessibleServices'],
        },
        {
          name: 'LibraryProgramme',
          description: 'A reading circle or author event with a branch and schedule',
          fields: ['id', 'title', 'programmeType', 'branchId', 'schedule'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'discover-library-items',
          name: 'Search the book catalogue and review availability by branch',
          steps: ['search-catalogue', 'review-branch-availability', 'open-title-details'],
        },
        {
          id: 'coordinate-private-holds',
          name: 'Request a title for pickup and review only the member’s own hold status',
          steps: ['choose-pickup-branch', 'request-hold', 'review-own-hold-status'],
        },
        {
          id: 'find-reading-programmes',
          name: 'Find reading circles and local author events by branch and date',
          steps: ['browse-reading-circles', 'find-author-events', 'review-branch-schedule'],
        },
        {
          id: 'set-reading-accessibility',
          name: 'Choose accessible reading preferences and review reading-history privacy',
          steps: ['choose-text-size', 'review-screen-reader-support', 'review-reading-privacy'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Catalogue & Branch Availability',
          screenType: 'search-explore',
          purpose: 'Search books and compare availability and opening hours across nearby branches',
          jobs: ['discover-library-items', 'review-branch-availability'],
          required: true,
        },
        {
          name: 'Holds & Pickup',
          screenType: 'index-list',
          purpose: 'Request branch pickup and privately review a member’s own active holds',
          jobs: ['coordinate-private-holds', 'review-own-hold-status'],
          required: true,
        },
        {
          name: 'Reading Circles & Events',
          screenType: 'index-list',
          purpose: 'Find community reading circles and author events by branch and date',
          jobs: ['find-reading-programmes', 'review-branch-schedule'],
          required: true,
        },
        {
          name: 'Accessibility & Privacy',
          screenType: 'settings',
          purpose: 'Review reading display preferences, assistive support, and private history controls',
          jobs: ['set-reading-accessibility', 'review-reading-privacy'],
          required: true,
        },
      ],
      requiredCapabilities: [
        'public-library-service-workflow',
        'book-catalogue-search',
        'branch-availability-and-hours',
        'private-hold-requests',
        'branch-pickup-windows',
        'reading-circle-and-event-discovery',
        'accessible-reading-controls',
        'private-reading-history',
        'low-bandwidth-catalogue-browsing',
      ],
      forbiddenPatterns: [
        ...base.forbiddenPatterns,
        'publicly-visible-member-hold-requests',
        'shared-or-sold-reading-history',
        'book-purchase-or-payment-assumptions',
      ],
    };
  }

  if (/\b(?:streaming service|browse films|watchlist|film catalogue)\b/i.test(text)) {
    return {
      ...base,
      name: 'Film Streaming',
      primaryAudience: 'Viewers discovering films and managing what they want to watch',
      primaryObjective:
        'Help viewers discover films, continue a watchlist, and explore editorial collections by theme',
      defaultEntities: [
        {
          name: 'Film',
          description: 'A film title with genre, runtime, rating, and availability',
          fields: ['id', 'title', 'genre', 'runtime', 'rating', 'availability'],
        },
        {
          name: 'Collection',
          description: 'An editorial film collection organized around a theme',
          fields: ['id', 'title', 'theme', 'filmIds', 'editor'],
        },
        {
          name: 'Watchlist Entry',
          description: 'A film saved by a viewer for later',
          fields: ['id', 'viewerId', 'filmId', 'savedAt', 'viewingStatus'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'discover-film',
          name: 'Browse films, review a title, and explore related collections',
          steps: ['browse-films', 'review-film-details', 'open-themed-collection'],
        },
        {
          id: 'manage-watchlist',
          name: 'Save a film and continue a personal watchlist',
          steps: ['save-film', 'review-watchlist', 'continue-watching'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Film Catalogue',
          screenType: 'search-explore',
          purpose: 'Browse films and editorial collections by theme',
          jobs: ['browse-films', 'explore-collections'],
          required: true,
        },
        {
          name: 'Film Detail',
          screenType: 'detail-entity',
          purpose: 'Review a film, its availability, and related collections',
          jobs: ['review-film', 'open-related-collection'],
          required: true,
        },
        {
          name: 'Watchlist',
          screenType: 'index-list',
          purpose: 'Review saved films and continue watching',
          jobs: ['review-watchlist', 'continue-watching'],
          required: true,
        },
      ],
      requiredCapabilities: ['film-discovery', 'watchlist', 'themed-collections'],
    };
  }

  if (
    /\b(?:public radio|radio service|radio station|live programs|listening schedule)\b/i.test(text)
  ) {
    return {
      ...base,
      name: 'Public Radio',
      primaryAudience: 'Listeners, programme producers, and public radio editors',
      primaryObjective:
        'Help listeners find live programmes, browse episode archives, and read transcripts from their public radio service',
      dataDensity: 55,
      defaultEntities: [
        {
          name: 'Programme',
          description: 'A scheduled radio programme with a host and broadcast time',
          fields: ['id', 'title', 'host', 'schedule', 'status'],
        },
        {
          name: 'Episode',
          description: 'A broadcast episode with audio, duration, and transcript',
          fields: ['id', 'programmeId', 'title', 'duration', 'publishedAt'],
        },
        {
          name: 'Transcript',
          description: 'An accessible text transcript linked to an episode',
          fields: ['id', 'episodeId', 'body', 'language'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'listen-live',
          name: 'Find a live programme and review its broadcast schedule',
          steps: ['browse-programmes', 'check-listening-schedule', 'open-live-broadcast'],
        },
        {
          id: 'browse-episodes',
          name: 'Find an archived episode and read its transcript',
          steps: ['search-episode-archive', 'play-episode', 'read-transcript'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Live Radio',
          screenType: 'dashboard',
          purpose: 'Find current programmes and the next live broadcasts',
          jobs: ['find-live-programme', 'check-next-broadcast'],
          required: true,
        },
        {
          name: 'Episode Archive',
          screenType: 'index-list',
          purpose: 'Browse and search past radio episodes',
          jobs: ['search-episodes', 'filter-programmes'],
          required: true,
        },
        {
          name: 'Listening Schedule',
          screenType: 'index-list',
          purpose: 'Review programme times and upcoming broadcasts',
          jobs: ['review-broadcast-times', 'plan-listening'],
          required: true,
        },
        {
          name: 'Episode Transcript',
          screenType: 'detail-entity',
          purpose: 'Read the transcript and episode details',
          jobs: ['read-transcript', 'review-episode'],
          required: false,
        },
      ],
      requiredCapabilities: [
        'live-programme-discovery',
        'episode-archive',
        'accessible-transcripts',
      ],
    };
  }

  if (/\b(?:digital magazine|magazine platform|editorial issues|photo essays)\b/i.test(text)) {
    return {
      ...base,
      name: 'Digital Magazine',
      primaryAudience: 'Magazine readers, photographers, and editorial teams',
      primaryObjective:
        'Help readers discover magazine issues, enjoy photo essays, and save stories with comfortable reading preferences',
      dataDensity: 40,
      defaultEntities: [
        {
          name: 'Magazine Issue',
          description: 'A curated issue with a cover, publication date, and stories',
          fields: ['id', 'title', 'cover', 'publishedAt', 'storyIds'],
        },
        {
          name: 'Photo Essay',
          description: 'A visual editorial story with a photographer and image sequence',
          fields: ['id', 'title', 'photographer', 'imageCount', 'publishedAt'],
        },
        {
          name: 'Saved Story',
          description: 'An issue story saved to a reader library',
          fields: ['id', 'readerId', 'storyId', 'savedAt'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'explore-issues',
          name: 'Browse magazine issues and open an editorial story',
          steps: ['browse-issues', 'open-photo-essay', 'save-story'],
        },
        {
          id: 'set-reading-preferences',
          name: 'Adjust typography and review saved stories',
          steps: ['choose-reading-type', 'set-reading-preferences', 'review-saved-stories'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Magazine Issues',
          screenType: 'search-explore',
          purpose: 'Browse current and past issues by theme and publication date',
          jobs: ['browse-issues', 'choose-issue'],
          required: true,
        },
        {
          name: 'Photo Essays',
          screenType: 'index-list',
          purpose: 'Explore image-led stories and photographer features',
          jobs: ['browse-photo-essays', 'open-essay'],
          required: true,
        },
        {
          name: 'Saved Stories',
          screenType: 'index-list',
          purpose: 'Return to articles saved for later reading',
          jobs: ['review-saved-stories', 'remove-saved-story'],
          required: true,
        },
        {
          name: 'Reading Preferences',
          screenType: 'settings',
          purpose: 'Choose readable type and display preferences',
          jobs: ['adjust-reading-type', 'set-display-preferences'],
          required: true,
        },
      ],
      requiredCapabilities: [
        'issue-discovery',
        'photo-essay-reading',
        'saved-stories',
        'reading-preferences',
      ],
    };
  }

  if (
    /\b(?:newsroom planning|newsroom tool|assign story coverage|prepare an edition)\b/i.test(text)
  ) {
    return {
      ...base,
      name: 'Newsroom Planning',
      primaryAudience: 'News editors, reporters, and newsroom planning teams',
      primaryObjective:
        'Help editors assign story coverage, review copy, and prepare a coherent front page and edition for publication',
      dataDensity: 80,
      defaultEntities: [
        {
          name: 'Story Assignment',
          description: 'A planned story with an owner, section, and editorial status',
          fields: ['id', 'headline', 'reporter', 'section', 'status'],
        },
        {
          name: 'Draft Story',
          description: 'Article copy under editorial review with comments and revision history',
          fields: ['id', 'headline', 'body', 'reviewer', 'revision'],
        },
        {
          name: 'Edition',
          description: 'A publication edition with ordered front-page stories and approval status',
          fields: ['id', 'date', 'storyIds', 'editor', 'status'],
        },
      ],
      defaultWorkflows: [
        {
          id: 'plan-coverage',
          name: 'Assign story coverage and track reporting progress',
          steps: ['create-story-assignment', 'assign-reporter', 'review-coverage'],
        },
        {
          id: 'prepare-edition',
          name: 'Review copy, arrange front-page stories, and approve the edition',
          steps: ['review-draft-copy', 'arrange-front-page', 'approve-edition'],
        },
      ],
      recommendedScreens: [
        {
          name: 'Newsroom Planner',
          screenType: 'workspace-editor',
          purpose: 'Arrange the front page and coordinate editorial coverage',
          jobs: ['arrange-front-page', 'review-edition-balance'],
          required: true,
        },
        {
          name: 'Story Assignments',
          screenType: 'index-list',
          purpose: 'Assign reporters and track story coverage status',
          jobs: ['assign-reporter', 'track-story-progress'],
          required: true,
        },
        {
          name: 'Copy Review',
          screenType: 'detail-entity',
          purpose: 'Review draft copy, comments, and requested changes',
          jobs: ['review-copy', 'resolve-editor-comments'],
          required: true,
        },
        {
          name: 'Edition Preview',
          screenType: 'detail-entity',
          purpose: 'Check ordered stories and approve the prepared edition',
          jobs: ['preview-edition', 'approve-edition'],
          required: true,
        },
      ],
      requiredCapabilities: [
        'story-assignment',
        'copy-review',
        'front-page-planning',
        'edition-approval',
      ],
    };
  }

  if (/\b(?:newspaper|local journalism|news site)\b/i.test(text)) {
    return {
      ...base,
      name: 'Local Journalism',
      primaryAudience: 'Local readers, reporters, and community editors',
      primaryObjective:
        'Deliver trustworthy local journalism, clear topic archives, and a comfortable long-form reading experience',
    };
  }
  return base;
}

/** Keep AI products on their stated workflow while retaining the existing AI archetype. */
export function specialiseAi(base: ArchetypeDefinition, text: string): ArchetypeDefinition {
  if (base.id !== 'ai') return base;

  const profiles: Array<{
    match: RegExp;
    context: Partial<ArchetypeDefinition>;
  }> = [
    {
      match: /\b(?:generative audio|music drafts|audio generation|approved stems)\b/i,
      context: {
        name: 'Generative Audio Studio',
        primaryAudience: 'Composers and music producers developing assisted audio drafts',
        primaryObjective:
          'Help composers generate and compare music drafts, then organize approved audio stems',
        defaultEntities: [
          {
            name: 'Audio Generation',
            description: 'A model-generated music draft with its prompt and status',
            fields: ['id', 'prompt', 'model', 'duration', 'status'],
          },
          {
            name: 'Track',
            description: 'A music draft saved for comparison or later editing',
            fields: ['id', 'title', 'generationId', 'duration', 'createdAt'],
          },
          {
            name: 'Stem',
            description: 'An approved isolated audio layer in a track',
            fields: ['id', 'trackId', 'instrument', 'approvalStatus'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'create-audio-draft',
            name: 'Write a music direction and compare generated drafts',
            steps: ['write-music-direction', 'generate-audio-drafts', 'compare-variations'],
          },
          {
            id: 'organize-approved-stems',
            name: 'Review approved stems and organize them with a track',
            steps: ['review-stems', 'approve-stems', 'organize-track'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Audio Studio',
            screenType: 'workspace-editor',
            purpose: 'Write a music direction and compare generated audio drafts',
            jobs: ['write-music-direction', 'compare-audio-variations'],
            required: true,
          },
          {
            name: 'Track Library',
            screenType: 'index-list',
            purpose: 'Organize saved music drafts and return to earlier versions',
            jobs: ['browse-tracks', 'reopen-track'],
            required: true,
          },
          {
            name: 'Stem Review',
            screenType: 'detail-entity',
            purpose: 'Review and organize approved stems for a track',
            jobs: ['review-approved-stems', 'organize-stems'],
            required: true,
          },
        ],
        requiredCapabilities: [
          'audio-draft-generation',
          'variation-comparison',
          'approved-stem-management',
        ],
      },
    },
    {
      match:
        /\b(?:support assistant|help center|support questions|uncertain responses|support answers)\b/i,
      context: {
        name: 'Human-reviewed Support Assistant',
        primaryAudience:
          'Support specialists and customers seeking answers from a company help center',
        primaryObjective:
          'Assist support teams with sourced answers and a human review path for uncertain responses',
        defaultEntities: [
          {
            name: 'Support Case',
            description: 'A customer question with a response and review status',
            fields: ['id', 'question', 'answer', 'confidence', 'status'],
          },
          {
            name: 'Knowledge Source',
            description: 'A help-center passage cited by an answer',
            fields: ['id', 'title', 'url', 'passage', 'updatedAt'],
          },
          {
            name: 'Answer Review',
            description: 'A response awaiting a support specialist review',
            fields: ['id', 'caseId', 'reviewer', 'decision', 'reviewedAt'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'answer-support-question',
            name: 'Answer a support question with linked help-center passages',
            steps: ['ask-support-question', 'retrieve-knowledge-passages', 'review-sourced-answer'],
          },
          {
            id: 'review-uncertain-answer',
            name: 'Review uncertain answers before they reach a customer',
            steps: [
              'flag-low-confidence-answer',
              'check-source-passages',
              'approve-or-edit-response',
            ],
          },
        ],
        recommendedScreens: [
          {
            name: 'Support Assistant',
            screenType: 'messages-collaboration',
            purpose: 'Answer customer questions with visible help-center sources',
            jobs: ['ask-question', 'inspect-citations'],
            required: true,
          },
          {
            name: 'Answer Review Queue',
            screenType: 'index-list',
            purpose: 'Review uncertain AI answers before they are sent',
            jobs: ['review-uncertain-answer', 'approve-response'],
            required: true,
          },
          {
            name: 'Knowledge Sources',
            screenType: 'index-list',
            purpose: 'Inspect and maintain the passages used for grounded answers',
            jobs: ['browse-help-center-sources', 'check-source-freshness'],
            required: true,
          },
        ],
        requiredCapabilities: ['source-citations', 'uncertainty-routing', 'human-answer-review'],
      },
    },
    {
      match:
        /\b(?:evaluation workbench|model evaluation|fixed test set|failure examples|review regressions)\b/i,
      context: {
        name: 'Model Evaluation Workbench',
        primaryAudience:
          'Machine-learning practitioners comparing model quality and regression risk',
        primaryObjective:
          'Help practitioners compare model versions on fixed evaluations and review concrete failure examples',
        dataDensity: 85,
        defaultEntities: [
          {
            name: 'Model Version',
            description: 'A version under evaluation against a fixed test set',
            fields: ['id', 'model', 'version', 'createdAt'],
          },
          {
            name: 'Evaluation Run',
            description: 'A reproducible evaluation result for one model version',
            fields: ['id', 'modelVersionId', 'testSetId', 'score', 'status'],
          },
          {
            name: 'Failure Example',
            description: 'A test case that exposes a model error or regression',
            fields: ['id', 'runId', 'input', 'expected', 'actual', 'severity'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'compare-model-evaluations',
            name: 'Compare model versions on the same fixed test set',
            steps: ['select-model-versions', 'run-fixed-test-set', 'compare-evaluation-results'],
          },
          {
            id: 'review-model-regressions',
            name: 'Inspect failure examples and record regression findings',
            steps: ['filter-failure-examples', 'review-case-details', 'record-regression'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Evaluation Overview',
            screenType: 'dashboard',
            purpose: 'Compare evaluation results and recent model regressions',
            jobs: ['compare-model-results', 'spot-regressions'],
            required: true,
          },
          {
            name: 'Evaluation Runs',
            screenType: 'index-list',
            purpose: 'Review reproducible runs and their fixed test sets',
            jobs: ['browse-evaluation-runs', 'compare-versions'],
            required: true,
          },
          {
            name: 'Failure Cases',
            screenType: 'index-list',
            purpose: 'Inspect the examples behind failed checks and model regressions',
            jobs: ['filter-failure-cases', 'review-model-errors'],
            required: true,
          },
        ],
        requiredCapabilities: [
          'fixed-test-set-evaluation',
          'model-version-comparison',
          'failure-case-review',
        ],
      },
    },
    {
      match:
        /\b(?:autonomous agent|agent workspace|bounded actions|approve changes before execution)\b/i,
      context: {
        name: 'Bounded Agent Workspace',
        primaryAudience: 'Operations staff configuring and reviewing bounded automated actions',
        primaryObjective:
          'Help operators configure agent tools, test bounded actions, and approve changes before execution',
        defaultEntities: [
          {
            name: 'Agent',
            description: 'A configured agent with an explicit tool and action boundary',
            fields: ['id', 'name', 'instructions', 'allowedTools', 'status'],
          },
          {
            name: 'Agent Run',
            description: 'A test or approved agent execution with a reviewable outcome',
            fields: ['id', 'agentId', 'actions', 'status', 'createdAt'],
          },
          {
            name: 'Approval Request',
            description: 'A proposed action awaiting an operator decision',
            fields: ['id', 'runId', 'proposedChange', 'reviewer', 'decision'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'configure-bounded-agent',
            name: 'Set an agent boundary and test its permitted actions',
            steps: ['define-agent-purpose', 'select-allowed-tools', 'test-bounded-actions'],
          },
          {
            id: 'approve-agent-change',
            name: 'Inspect a proposed change and approve it before execution',
            steps: ['inspect-run-history', 'review-proposed-change', 'approve-before-execution'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Agent Workspace',
            screenType: 'workspace-editor',
            purpose: 'Configure tool access and test bounded agent actions',
            jobs: ['configure-agent', 'test-permitted-actions'],
            required: true,
          },
          {
            name: 'Approval Queue',
            screenType: 'index-list',
            purpose: 'Review proposed changes before an agent can execute them',
            jobs: ['review-proposed-actions', 'approve-or-reject'],
            required: true,
          },
          {
            name: 'Run History',
            screenType: 'index-list',
            purpose: 'Inspect test runs and approved action history',
            jobs: ['inspect-agent-runs', 'review-action-outcomes'],
            required: true,
          },
        ],
        requiredCapabilities: [
          'bounded-tool-access',
          'pre-execution-approval',
          'agent-run-history',
        ],
      },
    },
    {
      match:
        /\b(?:image generation|image-generation|visual concepts|illustrators|generated images)\b/i,
      context: {
        name: 'Image Generation Studio',
        primaryAudience: 'Illustrators and visual designers developing image concepts',
        primaryObjective:
          'Help illustrators develop image concepts, refine prompts, and keep earlier generations organized',
        defaultEntities: [
          {
            name: 'Image Prompt',
            description: 'A saved visual direction with reusable prompt details',
            fields: ['id', 'text', 'style', 'updatedAt'],
          },
          {
            name: 'Image Generation',
            description: 'A generated visual concept linked to its prompt and model',
            fields: ['id', 'promptId', 'model', 'image', 'createdAt'],
          },
          {
            name: 'Concept Collection',
            description: 'A group of related visual concepts kept for later refinement',
            fields: ['id', 'name', 'generationIds', 'updatedAt'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'develop-image-concept',
            name: 'Refine a visual prompt and compare image generations',
            steps: ['edit-image-prompt', 'generate-visual-concepts', 'compare-generations'],
          },
          {
            id: 'organize-image-drafts',
            name: 'Save a generation and return to earlier visual drafts',
            steps: ['save-generation', 'organize-concepts', 'reopen-earlier-draft'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Image Studio',
            screenType: 'workspace-editor',
            purpose: 'Refine prompts and compare generated visual concepts',
            jobs: ['refine-image-prompt', 'compare-generations'],
            required: true,
          },
          {
            name: 'Generation Library',
            screenType: 'index-list',
            purpose: 'Organize saved image generations and concept collections',
            jobs: ['browse-generations', 'open-concept-collection'],
            required: true,
          },
          {
            name: 'Prompt Drafts',
            screenType: 'index-list',
            purpose: 'Return to earlier prompts without losing draft history',
            jobs: ['browse-prompt-drafts', 'restore-earlier-prompt'],
            required: true,
          },
        ],
        requiredCapabilities: ['image-generation', 'prompt-history', 'generation-library'],
      },
    },
  ];

  const selected = profiles.find((profile) => profile.match.test(text));
  return selected ? { ...base, ...selected.context } : base;
}

/** Specialize existing developer-tools products without adding new archetypes. */
export function specialiseDeveloperTools(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  if (base.id !== 'developer-tools') return base;

  const profiles: Array<{ match: RegExp; context: Partial<ArchetypeDefinition> }> = [
    {
      match: /\b(?:api debugging console|debug api|replay a failing call|inspect requests)\b/i,
      context: {
        name: 'API Debugging Console',
        primaryAudience: 'Backend engineers diagnosing API requests and responses',
        primaryObjective:
          'Help engineers inspect API requests, compare responses, replay failures, and save working examples',
        defaultEntities: [
          {
            name: 'API Request',
            description: 'A captured request with method, route, headers, and timing',
            fields: ['id', 'method', 'url', 'headers', 'duration', 'status'],
          },
          {
            name: 'API Response',
            description: 'The response body, status, and headers returned by a request',
            fields: ['id', 'requestId', 'status', 'headers', 'body'],
          },
          {
            name: 'Saved Request Example',
            description: 'A reusable working request saved by an engineer',
            fields: ['id', 'name', 'requestId', 'environment', 'updatedAt'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'debug-api-request',
            name: 'Inspect a request, compare its response, and replay a failing call',
            steps: ['inspect-api-request', 'compare-api-response', 'replay-failing-request'],
          },
          {
            id: 'save-request-example',
            name: 'Save a corrected request as a reusable example',
            steps: ['edit-request', 'verify-response', 'save-working-example'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Request Inspector',
            screenType: 'workspace-editor',
            purpose: 'Inspect request details and compare API responses',
            jobs: ['inspect-request', 'compare-response'],
            required: true,
          },
          {
            name: 'Saved Requests',
            screenType: 'index-list',
            purpose: 'Find and reopen working request examples',
            jobs: ['browse-saved-requests', 'open-request-example'],
            required: true,
          },
          {
            name: 'Response Detail',
            screenType: 'detail-entity',
            purpose: 'Review a response body, status, and request timing',
            jobs: ['inspect-response-body', 'review-request-timing'],
            required: true,
          },
        ],
        requiredCapabilities: ['request-inspection', 'response-comparison', 'safe-request-replay'],
      },
    },
    {
      match: /\b(?:kubernetes|deployment monitor|failed releases|deployment monitor)\b/i,
      context: {
        name: 'Kubernetes Deployment Monitor',
        primaryAudience: 'Platform engineers monitoring Kubernetes deployments and release health',
        primaryObjective:
          'Help platform teams detect failed releases and trace deployment incidents to recent service logs',
        defaultEntities: [
          {
            name: 'Kubernetes Service',
            description: 'A service deployed to an environment with rollout health',
            fields: ['id', 'name', 'cluster', 'namespace', 'status'],
          },
          {
            name: 'Release',
            description: 'A deployment rollout with a version and completion state',
            fields: ['id', 'serviceId', 'version', 'startedAt', 'status'],
          },
          {
            name: 'Deployment Incident',
            description: 'A failed or degraded release linked to diagnostic logs',
            fields: ['id', 'releaseId', 'severity', 'summary', 'logStreamId'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'monitor-deployments',
            name: 'Review Kubernetes service health and recent release status',
            steps: ['select-cluster', 'review-service-health', 'inspect-release-status'],
          },
          {
            id: 'investigate-release-incident',
            name: 'Open a failed release and follow it into the recent log stream',
            steps: ['identify-failed-release', 'open-incident', 'inspect-related-logs'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Deployment Overview',
            screenType: 'dashboard',
            purpose: 'Monitor service health and highlight failed Kubernetes releases',
            jobs: ['monitor-deployments', 'identify-failed-release'],
            required: true,
          },
          {
            name: 'Release History',
            screenType: 'index-list',
            purpose: 'Review rollout versions and deployment status by service',
            jobs: ['browse-releases', 'compare-deployment-status'],
            required: true,
          },
          {
            name: 'Incident Logs',
            screenType: 'search-explore',
            purpose: 'Trace a release incident to its recent service log stream',
            jobs: ['search-related-logs', 'inspect-incident-context'],
            required: true,
          },
        ],
        requiredCapabilities: [
          'kubernetes-service-health',
          'release-failure-detection',
          'incident-log-links',
        ],
      },
    },
    {
      match: /\b(?:distributed tracing|tracing console|service latency|inspect the span)\b/i,
      context: {
        name: 'Distributed Tracing Console',
        primaryAudience:
          'Platform engineers investigating latency and runtime incidents across services',
        primaryObjective:
          'Help engineers trace service latency, filter runtime errors, and inspect the span behind an incident',
        defaultEntities: [
          {
            name: 'Trace',
            description: 'An end-to-end request path across participating services',
            fields: ['id', 'rootService', 'duration', 'status', 'startedAt'],
          },
          {
            name: 'Span',
            description: 'A timed operation within a distributed trace',
            fields: ['id', 'traceId', 'service', 'operation', 'duration', 'error'],
          },
          {
            name: 'Service',
            description: 'An instrumented service with latency and error measurements',
            fields: ['id', 'name', 'environment', 'latency', 'errorRate'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'investigate-trace-latency',
            name: 'Filter traces by service latency and inspect the critical span',
            steps: ['filter-slow-traces', 'open-trace', 'inspect-critical-span'],
          },
          {
            id: 'investigate-runtime-error',
            name: 'Find a runtime error and review the affected service path',
            steps: ['filter-runtime-errors', 'follow-service-path', 'review-error-span'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Trace Explorer',
            screenType: 'search-explore',
            purpose: 'Filter distributed traces by latency, service, and runtime error',
            jobs: ['search-traces', 'filter-runtime-errors'],
            required: true,
          },
          {
            name: 'Service Map',
            screenType: 'dashboard',
            purpose: 'Review service relationships, latency, and error hotspots',
            jobs: ['inspect-service-paths', 'spot-latency-hotspots'],
            required: true,
          },
          {
            name: 'Span Detail',
            screenType: 'detail-entity',
            purpose: 'Inspect the operation and timing behind a trace incident',
            jobs: ['inspect-span', 'review-runtime-error'],
            required: true,
          },
        ],
        requiredCapabilities: [
          'trace-search',
          'service-latency-inspection',
          'span-level-error-review',
        ],
      },
    },
    {
      match:
        /\b(?:source-control review|pull requests|continuous integration checks|requested changes)\b/i,
      context: {
        name: 'Source Control Review',
        primaryAudience:
          'Software maintainers reviewing pull requests and continuous integration results',
        primaryObjective:
          'Help maintainers organize pull requests, inspect CI checks, and resolve requested changes',
        defaultEntities: [
          {
            name: 'Pull Request',
            description: 'A proposed source change with author, branch, and review state',
            fields: ['id', 'title', 'author', 'branch', 'status'],
          },
          {
            name: 'Review Comment',
            description: 'A requested change or discussion attached to a pull request',
            fields: ['id', 'pullRequestId', 'file', 'line', 'status'],
          },
          {
            name: 'CI Check',
            description: 'An automated build or test result for a source revision',
            fields: ['id', 'pullRequestId', 'name', 'status', 'completedAt'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'review-pull-request',
            name: 'Review a pull request and resolve requested changes',
            steps: ['open-pull-request', 'inspect-diff', 'resolve-review-comments'],
          },
          {
            id: 'review-ci-results',
            name: 'Check build results and approve a ready change',
            steps: ['review-ci-checks', 'inspect-failures', 'approve-ready-change'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Pull Requests',
            screenType: 'index-list',
            purpose: 'Organize open pull requests by review and CI status',
            jobs: ['browse-pull-requests', 'filter-review-status'],
            required: true,
          },
          {
            name: 'Review Queue',
            screenType: 'detail-entity',
            purpose: 'Inspect a change and resolve reviewer requests',
            jobs: ['review-source-changes', 'resolve-comments'],
            required: true,
          },
          {
            name: 'CI Checks',
            screenType: 'dashboard',
            purpose: 'Review build and test status across proposed changes',
            jobs: ['inspect-ci-status', 'find-failing-checks'],
            required: true,
          },
        ],
        requiredCapabilities: ['pull-request-review', 'ci-status', 'change-request-resolution'],
      },
    },
    {
      match: /\b(?:feature-flag|feature flag|rollout rules|target environments)\b/i,
      context: {
        name: 'Feature Flag Console',
        primaryAudience: 'Application engineers managing controlled feature releases',
        primaryObjective:
          'Help engineers define feature rollout rules, target environments, and review change history before release',
        defaultEntities: [
          {
            name: 'Feature Flag',
            description: 'A controlled application capability with a rollout state',
            fields: ['id', 'name', 'key', 'status', 'owner'],
          },
          {
            name: 'Rollout Rule',
            description: 'A targeting condition that controls who receives a feature',
            fields: ['id', 'flagId', 'condition', 'percentage', 'environment'],
          },
          {
            name: 'Flag Change',
            description: 'An audited update to a flag or rollout rule',
            fields: ['id', 'flagId', 'actor', 'change', 'createdAt'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'configure-rollout',
            name: 'Define a rollout rule and choose its target environment',
            steps: ['create-feature-flag', 'define-rollout-rule', 'select-environment'],
          },
          {
            id: 'review-flag-change',
            name: 'Review flag history before releasing a change',
            steps: ['inspect-change-history', 'verify-rollout-targets', 'approve-release'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Flag Rules',
            screenType: 'index-list',
            purpose: 'Define rollout rules and inspect their targeting conditions',
            jobs: ['browse-feature-flags', 'edit-rollout-rule'],
            required: true,
          },
          {
            name: 'Environments',
            screenType: 'settings',
            purpose: 'Choose and review rollout target environments',
            jobs: ['manage-environments', 'review-targets'],
            required: true,
          },
          {
            name: 'Change History',
            screenType: 'index-list',
            purpose: 'Review the audit trail for flag and rollout updates',
            jobs: ['browse-flag-changes', 'inspect-change'],
            required: true,
          },
        ],
        requiredCapabilities: [
          'feature-flag-management',
          'environment-targeting',
          'audited-rollouts',
        ],
      },
    },
    {
      match: /\b(?:sdk portal|software development kit|explore endpoints|webhook delivery)\b/i,
      context: {
        name: 'SDK and API Portal',
        primaryAudience: 'Software teams integrating APIs and maintaining client SDKs',
        primaryObjective:
          'Help software teams explore endpoints, copy runnable examples, track SDK versions, and validate webhook delivery',
        defaultEntities: [
          {
            name: 'API Endpoint',
            description: 'A documented operation with a method, route, and example',
            fields: ['id', 'name', 'method', 'path', 'version'],
          },
          {
            name: 'SDK Version',
            description: 'A published client library version with release notes',
            fields: ['id', 'package', 'version', 'releasedAt', 'changes'],
          },
          {
            name: 'Webhook Delivery',
            description: 'A test or production event delivery with response status',
            fields: ['id', 'event', 'target', 'status', 'attemptedAt'],
          },
        ],
        defaultWorkflows: [
          {
            id: 'integrate-api-endpoint',
            name: 'Explore an endpoint and run a client example',
            steps: ['find-endpoint', 'copy-client-example', 'verify-response'],
          },
          {
            id: 'validate-webhook',
            name: 'Test webhook delivery and review SDK version changes',
            steps: ['send-test-event', 'inspect-delivery-response', 'review-sdk-version'],
          },
        ],
        recommendedScreens: [
          {
            name: 'Endpoint Reference',
            screenType: 'documentation',
            purpose: 'Browse endpoint contracts and copy runnable client examples',
            jobs: ['search-endpoints', 'copy-client-example'],
            required: true,
          },
          {
            name: 'Webhook Delivery',
            screenType: 'index-list',
            purpose: 'Send test events and inspect webhook delivery results',
            jobs: ['test-webhook', 'inspect-delivery'],
            required: true,
          },
          {
            name: 'SDK Versions',
            screenType: 'index-list',
            purpose: 'Review client library releases and version changes',
            jobs: ['browse-sdk-versions', 'review-release-notes'],
            required: true,
          },
        ],
        requiredCapabilities: ['endpoint-reference', 'runnable-sdk-examples', 'webhook-testing'],
      },
    },
  ];

  const selected = profiles.find((profile) => profile.match.test(text));
  return selected ? { ...base, ...selected.context } : base;
}
/** Adapt meal-planning language within the existing productivity archetype. */
export function specialiseMealPlanning(base: ArchetypeDefinition, text: string): ArchetypeDefinition {
  if (
    base.id !== 'productivity' ||
    !['meal planning', 'meal planner', 'weekly meal plan', 'weeknight dinner'].some((cue) =>
      hasPositiveArchetypeCue(text, cue)
    ) ||
    !['recipe', 'shopping list', 'pantry', 'household'].some((cue) => hasPositiveArchetypeCue(text, cue))
  ) {
    return base;
  }

  return {
    ...base,
    primaryAudience: 'Adults planning meals and grocery shopping for shared households',
    primaryObjective:
      'Plan practical weeknight meals around dietary needs and pantry ingredients, coordinate adult household preferences, and keep a consolidated grocery list usable offline',
    userSophistication: 45,
    trustRequirement: 88,
    informationComplexity: 55,
    dataDensity: 50,
    collaborationLevel: 65,
    transactionCriticality: 30,
    navigationComplexity: 50,
    mobileImportance: 100,
    defaultEntities: [
      {
        name: 'WeeklyMealPlan',
        description: 'A household week plan with dinners, serving counts, and an optional grocery budget target',
        fields: ['id', 'weekOf', 'mealIds', 'servingCount', 'weeklyGroceryBudget', 'status'],
      },
      {
        name: 'Recipe',
        description: 'A dinner recipe with editable portions, ingredients, dietary tags, and declared allergens',
        fields: ['id', 'title', 'servingCount', 'ingredients', 'dietaryTags', 'allergens'],
      },
      {
        name: 'PantryItem',
        description: 'An available ingredient with quantity and freshness information',
        fields: ['id', 'name', 'quantity', 'unit', 'useByDate'],
      },
      {
        name: 'ShoppingList',
        description: 'Missing ingredients consolidated for a week of meals, including offline in-store checks',
        fields: ['id', 'weekOf', 'items', 'estimatedTotal', 'checkedItemIds', 'lastOfflineUpdate'],
      },
      {
        name: 'MealSuggestion',
        description: 'An adult household member’s proposed meal and household vote summary',
        fields: ['id', 'recipeId', 'proposedBy', 'voteCount', 'status'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'plan-weeknight-meals',
        name: 'Choose five weeknight dinners, adjust portions, and review dietary needs',
        steps: ['review-household-preferences', 'choose-dinner-recipes', 'adjust-portions', 'confirm-week-plan'],
      },
      {
        id: 'build-shopping-list',
        name: 'Consolidate missing ingredients, check pantry stock, and shop from an offline-ready list',
        steps: ['combine-recipe-ingredients', 'subtract-pantry-stock', 'review-budget-target', 'check-items-in-store'],
      },
      {
        id: 'coordinate-meal-suggestions',
        name: 'Review adult household meal suggestions and votes before confirming the weekly plan',
        steps: ['review-suggestions', 'compare-votes', 'add-selected-meal'],
      },
      {
        id: 'track-pantry-freshness',
        name: 'Update pantry quantities and use-by dates to guide the next meal plan',
        steps: ['check-available-ingredients', 'update-quantities', 'review-use-by-dates'],
      },
    ],
    recommendedScreens: [
      {
        name: 'Weekly Meal Plan',
        screenType: 'dashboard',
        purpose: 'Arrange five weeknight dinners around household preferences and review adult suggestions and votes',
        jobs: ['choose-dinner-recipes', 'adjust-portions', 'confirm-week-plan'],
        required: true,
      },
      {
        name: 'Recipes & Dietary Needs',
        screenType: 'search-explore',
        purpose: 'Find recipes, edit servings, and review declared allergens and dietary tags',
        jobs: ['find-recipes', 'adjust-portions', 'review-allergen-labels'],
        required: true,
      },
      {
        name: 'Shopping List & Pantry',
        screenType: 'index-list',
        purpose: 'Consolidate missing groceries, track pantry freshness, and check items while offline in-store',
        jobs: ['build-shopping-list', 'review-pantry-stock', 'check-items-offline'],
        required: true,
      },
    ],
    requiredCapabilities: [...base.requiredCapabilities, 'meal-planning-workflow'],
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

/** Replace OSINT-shaped defaults with field-science workflows for marine surveys. */
export function specialiseMarineFieldResearch(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  if (
    base.id !== 'intelligence-research' ||
    !/\b(?:marine biology|marine ecology|marine fieldwork|oceanographic survey|benthic survey|species survey|transect survey|field atlas)\b/i.test(
      text
    )
  ) {
    return base;
  }

  return {
    ...base,
    name: 'Marine Field Research',
    primaryAudience: 'Marine biologists, field survey crews, and permit reviewers',
    primaryObjective:
      'Record species observations along survey transects, connect field evidence, and review permit conditions',
    userSophistication: 70,
    trustRequirement: 90,
    informationComplexity: 80,
    dataDensity: 68,
    collaborationLevel: 85,
    transactionCriticality: 35,
    navigationComplexity: 68,
    mobileImportance: 95,
    defaultEntities: [
      {
        name: 'Species',
        description: 'A recorded taxon with identification notes and conservation context',
        fields: [
          'id',
          'scientificName',
          'commonName',
          'identificationStatus',
          'conservationStatus',
        ],
      },
      {
        name: 'Survey',
        description: 'A field survey with location, transects, dates, and assigned crew',
        fields: ['id', 'site', 'transects', 'startDate', 'crew'],
      },
      {
        name: 'Observation',
        description: 'A field record linking an identified species to a place, time, and evidence',
        fields: ['id', 'surveyId', 'speciesId', 'location', 'observedAt', 'evidence'],
      },
      {
        name: 'Permit',
        description: 'A fieldwork permission with jurisdiction, dates, and recorded conditions',
        fields: ['id', 'jurisdiction', 'validFrom', 'validUntil', 'conditions'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'record-transect-observation',
        name: 'Record a species observation along a transect and attach field evidence',
        steps: [
          'select-survey',
          'record-location-and-time',
          'identify-species',
          'attach-evidence',
          'save-observation',
        ],
      },
      {
        id: 'review-survey-permit',
        name: 'Review permit conditions before assigning fieldwork',
        steps: ['select-permit', 'check-survey-restrictions', 'confirm-crew-access'],
      },
      {
        id: 'prepare-offline-fieldwork',
        name: 'Prepare transect records for offline fieldwork and review queued changes after return',
        steps: [
          'select-survey-area',
          'prepare-field-records',
          'record-offline-observations',
          'review-pending-changes',
        ],
      },
    ],
    recommendedScreens: [
      {
        name: 'Survey Overview',
        screenType: 'dashboard',
        purpose:
          'Review assigned surveys, transects, crew responsibilities, and open permit checks',
        jobs: ['review-survey-assignments', 'open-transect', 'check-permit-status'],
        required: true,
      },
      {
        name: 'Field Survey',
        screenType: 'workspace-editor',
        purpose:
          'Capture species observations, location notes, and field evidence along a transect',
        jobs: ['record-observation', 'attach-field-evidence', 'review-offline-queue'],
        required: true,
      },
      {
        name: 'Observation Review',
        screenType: 'index-list',
        purpose: 'Review and resolve field observations with their linked evidence',
        jobs: ['filter-observations', 'review-identification', 'resolve-review-item'],
        required: true,
      },
      {
        name: 'Permits & Protocols',
        screenType: 'index-list',
        purpose: 'Check permit validity, survey restrictions, and field protocols',
        jobs: ['find-permit', 'review-conditions', 'check-validity'],
        required: true,
      },
    ],
    requiredCapabilities: [
      'field-observation-records',
      'offline-field-capture',
      'evidence-provenance-links',
      'permit-condition-review',
    ],
    forbiddenPatterns: ['ephemeral-data-loss', 'unverified-species-identification'],
  };
}

/** Replace classroom defaults with a focused adult language-practice workflow. */
export function specialiseLanguageLearning(
  base: ArchetypeDefinition,
  text: string
): ArchetypeDefinition {
  if (
    base.id !== 'education' ||
    !/\b(?:language[- ]learning|language practice|foreign[- ]language|learn(?:ing)?\s+(?:a\s+|new\s+)?language|(?:Spanish|French|German|Italian|Portuguese|Mandarin|Japanese|Arabic)\s+(?:learning|practice|lessons?|course))\b/i.test(
      text
    ) ||
    !/\b(?:adult|dyslexia|offline|no (?:mobile )?signal|speaking practice|pronunciation|adjustable text|short sessions?|commute)\b/i.test(
      text
    )
  ) {
    return base;
  }

  const language =
    text.match(/\b(?:Spanish|French|German|Italian|Portuguese|Mandarin|Japanese|Arabic)\b/i)?.[0]
      ?.replace(/^./, (initial) => initial.toLocaleUpperCase()) ?? 'target-language';

  return {
    ...base,
    name: 'Language Learning',
    description:
      'Short, practical language-practice sessions with readable study material and learner-controlled progress.',
    primaryAudience: `Adult ${language} learners, including people who benefit from dyslexia-friendly reading controls`,
    primaryObjective:
      `Build useful ${language} vocabulary and speaking confidence through short listening and practice sessions`,
    userSophistication: 40,
    trustRequirement: 80,
    informationComplexity: 45,
    dataDensity: 35,
    collaborationLevel: 25,
    transactionCriticality: 15,
    navigationComplexity: 38,
    mobileImportance: 98,
    defaultEntities: [
      {
        name: 'Language Course',
        description: 'A learner-selected language and proficiency path',
        fields: ['id', 'language', 'level', 'learningGoal'],
      },
      {
        name: 'Learning Unit',
        description: 'A short lesson with audio, vocabulary, and a practice goal',
        fields: ['id', 'courseId', 'topic', 'estimatedMinutes', 'offlineAvailability'],
      },
      {
        name: 'Vocabulary Item',
        description: 'A word or phrase with its meaning and pronunciation audio',
        fields: ['id', 'term', 'translation', 'pronunciationAudio', 'reviewState'],
      },
      {
        name: 'Practice Attempt',
        description: 'A listening or speaking exercise and its learner-visible feedback',
        fields: ['id', 'unitId', 'exerciseType', 'completedAt', 'feedback'],
      },
    ],
    defaultWorkflows: [
      {
        id: 'start-short-language-practice',
        name: `Start a short ${language} practice session`,
        steps: [
          'resume-learning-path',
          'choose-a-short-session',
          'listen-to-pronunciation',
          'practice-speaking',
          'review-progress',
        ],
      },
      {
        id: 'prepare-lessons-for-offline-use',
        name: 'Download selected lessons before a commute without mobile signal',
        steps: [
          'choose-learning-units',
          'check-storage-needs',
          'download-selected-lessons',
          'open-available-offline-lessons',
        ],
      },
      {
        id: 'review-vocabulary',
        name: 'Review vocabulary with adjustable reading and audio controls',
        steps: [
          'open-saved-vocabulary',
          'adjust-text-spacing',
          'listen-to-pronunciation',
          'review-word-meaning',
        ],
      },
    ],
    recommendedScreens: [
      {
        name: 'Today',
        screenType: 'dashboard',
        purpose:
          `Resume a short ${language} practice session and review progress without pressure-based streaks`,
        jobs: ['resume-practice', 'review-learning-progress'],
        required: true,
      },
      {
        name: 'Practice Session',
        screenType: 'workspace-editor',
        purpose:
          'Practice listening and speaking with clear pronunciation audio and dyslexia-friendly text settings',
        jobs: ['listen-to-pronunciation', 'practice-speaking', 'adjust-text-spacing'],
        required: true,
      },
      {
        name: 'Vocabulary Review',
        screenType: 'index-list',
        purpose: 'Review useful words and phrases with adjustable reading and audio controls',
        jobs: ['open-saved-vocabulary', 'listen-to-pronunciation', 'review-word-meaning'],
        required: true,
      },
      {
        name: 'Offline Library',
        screenType: 'index-list',
        purpose:
          'Choose lessons to download and open lessons that are available without a network connection',
        jobs: ['choose-learning-units', 'download-selected-lessons', 'open-available-offline-lessons'],
        required: true,
      },
    ],
    requiredCapabilities: [
      'short-session-learning',
      'audio-pronunciation',
      'speaking-practice',
      'dyslexia-friendly-text-controls',
      'downloadable-offline-lessons',
    ],
    forbiddenPatterns: [
      'pressure-based-streaks',
      'tiny-dense-reading-layouts',
      'loss-of-offline-progress',
      'core-lessons-unavailable-without-signal',
    ],
  };
}
