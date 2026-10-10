export interface ProductBlueprint {
  id: string;
  name: string;
  archetypeId: string;
  description: string;
  defaultAudience: string;
  defaultObjective: string;
  priors: {
    userSophistication: number;
    trustRequirement: number;
    informationComplexity: number;
    dataDensity: number;
    collaborationLevel: number;
    transactionCriticality: number;
    navigationComplexity: number;
    mobileImportance: number;
  };
  requiredPageClasses: string[];
  optionalPageClasses: string[];
  defaultNavigationFamily: string;
  applicableDnaPresets: [string, string, string, ...string[]];
  responsivePriorities: {
    desktopStrategy: string;
    mobilePhilosophy: string;
  };
  antiPatterns: string[];
}

export const PRODUCT_BLUEPRINTS: ProductBlueprint[] = [
  // 1. AI Product
  {
    id: 'ai-product',
    name: 'AI Product',
    archetypeId: 'ai',
    description: 'Generative prompt studio, live execution canvas, and model configuration.',
    defaultAudience: 'Developers, designers, and domain specialists using machine intelligence',
    defaultObjective: 'Empower users to iterate on prompts, stream generations, and automate workflows',
    priors: {
      userSophistication: 75,
      trustRequirement: 80,
      informationComplexity: 70,
      dataDensity: 55,
      collaborationLevel: 60,
      transactionCriticality: 50,
      navigationComplexity: 50,
      mobileImportance: 60,
    },
    requiredPageClasses: ['workspace-editor', 'index-list', 'settings'],
    optionalPageClasses: ['marketing', 'analytics-reporting', 'documentation'],
    defaultNavigationFamily: 'command-first',
    applicableDnaPresets: ['cinematic-launch', 'bold-startup', 'future-command'],
    responsivePriorities: {
      desktopStrategy: 'equal-capability-adaptive',
      mobilePhilosophy: 'progressive-disclosure',
    },
    antiPatterns: [
      'Blocking full-screen loader without streaming feedback',
      'Hiding token cost and rate limits from users',
      'No way to copy or export raw generation output',
    ],
  },

  // 2. B2B SaaS
  {
    id: 'b2b-saas',
    name: 'B2B SaaS',
    archetypeId: 'saas',
    description: 'Multi-tenant team collaboration platform with role-based access and billing.',
    defaultAudience: 'Enterprise managers, cross-functional project teams, and operations leads',
    defaultObjective: 'Streamline distributed team deliverables and centralize organization status',
    priors: {
      userSophistication: 65,
      trustRequirement: 85,
      informationComplexity: 65,
      dataDensity: 65,
      collaborationLevel: 75,
      transactionCriticality: 60,
      navigationComplexity: 60,
      mobileImportance: 50,
    },
    requiredPageClasses: ['dashboard', 'index-list', 'settings', 'detail-entity'],
    optionalPageClasses: ['marketing', 'billing-account', 'onboarding'],
    defaultNavigationFamily: 'classic-app-sidebar',
    applicableDnaPresets: ['modern-enterprise', 'calm-saas', 'warm-professional'],
    responsivePriorities: {
      desktopStrategy: 'desktop-dense-mobile-focused',
      mobilePhilosophy: 'focused-subset',
    },
    antiPatterns: [
      'Forcing users through multi-step onboarding before seeing any dashboard value',
      'Unconfirmed deletion of shared team workspaces',
      'Non-accessible interactive table cells',
    ],
  },

  // 3. Developer Platform
  {
    id: 'developer-platform',
    name: 'Developer Platform',
    archetypeId: 'developer-tools',
    description: 'Real-time telemetry, API monitoring, logs stream, and deploy management.',
    defaultAudience: 'Software engineers, site reliability engineers, and system architects',
    defaultObjective: 'Provide sub-second insight into production systems and deployment state',
    priors: {
      userSophistication: 95,
      trustRequirement: 90,
      informationComplexity: 90,
      dataDensity: 92,
      collaborationLevel: 60,
      transactionCriticality: 70,
      navigationComplexity: 75,
      mobileImportance: 35,
    },
    requiredPageClasses: ['dashboard', 'search-explore', 'settings'],
    optionalPageClasses: ['documentation', 'analytics-reporting', 'admin'],
    defaultNavigationFamily: 'dual-rail',
    applicableDnaPresets: ['developer-native', 'technical-precision', 'dense-terminal'],
    responsivePriorities: {
      desktopStrategy: 'desktop-dense-mobile-focused',
      mobilePhilosophy: 'focused-subset',
    },
    antiPatterns: [
      'Overly spaced out decorative cards when developers need dense diagnostic data',
      'Truncating error messages and stack traces without copy buttons',
      'Lack of full keyboard navigation',
    ],
  },

  // 4. Fintech
  {
    id: 'fintech',
    name: 'Fintech',
    archetypeId: 'fintech',
    description: 'Secure financial ledgers, balance statements, money movement, and compliance.',
    defaultAudience: 'Treasury managers, controllers, accountants, and account holders',
    defaultObjective: 'Ensure cryptographic auditability, instant settlement visibility, and trust',
    priors: {
      userSophistication: 70,
      trustRequirement: 98,
      informationComplexity: 80,
      dataDensity: 85,
      collaborationLevel: 45,
      transactionCriticality: 98,
      navigationComplexity: 65,
      mobileImportance: 80,
    },
    requiredPageClasses: ['dashboard', 'index-list', 'checkout-transaction', 'settings'],
    optionalPageClasses: ['analytics-reporting', 'support', 'onboarding'],
    defaultNavigationFamily: 'classic-app-sidebar',
    applicableDnaPresets: ['financial-authority', 'institutional-intelligence', 'dense-terminal'],
    responsivePriorities: {
      desktopStrategy: 'desktop-dense-mobile-focused',
      mobilePhilosophy: 'equal-capability',
    },
    antiPatterns: [
      'Ambiguous pending vs settled transaction states',
      'Low-contrast text on critical financial balance amounts',
      'Executing money transfers without explicit multi-factor verification',
    ],
  },

  // 5. Ecommerce
  {
    id: 'ecommerce',
    name: 'Ecommerce',
    archetypeId: 'ecommerce',
    description: 'Product catalog display, visual lookbook, cart drawer, and checkout flow.',
    defaultAudience: 'Online shoppers, brand consumers, and merchandising teams',
    defaultObjective: 'Showcase merchandise with high visual ambition and deliver frictionless checkout',
    priors: {
      userSophistication: 45,
      trustRequirement: 90,
      informationComplexity: 50,
      dataDensity: 50,
      collaborationLevel: 25,
      transactionCriticality: 90,
      navigationComplexity: 55,
      mobileImportance: 90,
    },
    requiredPageClasses: ['marketing', 'detail-entity', 'checkout-transaction'],
    optionalPageClasses: ['support', 'index-list', 'authentication'],
    defaultNavigationFamily: 'marketing-mega-nav',
    applicableDnaPresets: ['high-end-commerce', 'fashion-forward', 'luxury-editorial'],
    responsivePriorities: {
      desktopStrategy: 'mobile-first-progressive',
      mobilePhilosophy: 'primary-touch',
    },
    antiPatterns: [
      'Unclear shipping fees revealed only on final payment step',
      'Tiny touch targets for size and variant buttons on mobile',
      'Slow-loading unoptimized product imagery',
    ],
  },

  // 6. Marketplace
  {
    id: 'marketplace',
    name: 'Marketplace',
    archetypeId: 'marketplace',
    description: 'Faceted search, map-based discovery, vendor profiles, and reservation agreements.',
    defaultAudience: 'Independent buyers/renters and third-party verified vendors/hosts',
    defaultObjective: 'Connect two-sided market participants with transparent pricing and ratings',
    priors: {
      userSophistication: 55,
      trustRequirement: 92,
      informationComplexity: 65,
      dataDensity: 60,
      collaborationLevel: 50,
      transactionCriticality: 85,
      navigationComplexity: 65,
      mobileImportance: 85,
    },
    requiredPageClasses: ['search-explore', 'detail-entity', 'checkout-transaction', 'messages-collaboration'],
    optionalPageClasses: ['marketing', 'settings', 'dashboard'],
    defaultNavigationFamily: 'search-first-header',
    applicableDnaPresets: ['luxury-editorial', 'premium-minimal', 'modern-enterprise'],
    responsivePriorities: {
      desktopStrategy: 'equal-capability-adaptive',
      mobilePhilosophy: 'primary-touch',
    },
    antiPatterns: [
      'Unverified reviews and opaque vendor ratings',
      'Map view breaking scroll gesture on mobile screens',
      'No in-app messaging channel between buyer and seller',
    ],
  },

  // 7. Analytics Platform
  {
    id: 'analytics-platform',
    name: 'Analytics Platform',
    archetypeId: 'analytics',
    description: 'Cohort analysis, multi-dimensional time series, metric builders, and KPI digests.',
    defaultAudience: 'Business intelligence analysts, growth engineers, and leadership teams',
    defaultObjective: 'Surface statistical anomalies, measure growth metrics, and generate reports',
    priors: {
      userSophistication: 80,
      trustRequirement: 90,
      informationComplexity: 85,
      dataDensity: 95,
      collaborationLevel: 55,
      transactionCriticality: 40,
      navigationComplexity: 70,
      mobileImportance: 45,
    },
    requiredPageClasses: ['dashboard', 'analytics-reporting', 'index-list'],
    optionalPageClasses: ['settings', 'workspace-editor', 'documentation'],
    defaultNavigationFamily: 'classic-app-sidebar',
    applicableDnaPresets: ['data-first-analytical', 'scientific-instrument', 'technical-precision'],
    responsivePriorities: {
      desktopStrategy: 'desktop-dense-mobile-focused',
      mobilePhilosophy: 'focused-subset',
    },
    antiPatterns: [
      'Truncating chart axes without clear labels or zero references',
      'Freezing the browser UI during large dataset rendering',
      'Inability to export raw tabular CSV records',
    ],
  },

  // 8. Research & Intelligence Platform
  {
    id: 'research-intelligence',
    name: 'Research & Intelligence Platform',
    archetypeId: 'intelligence-research',
    description: 'Entity relationship networks, source evidence verification, and analyst dossiers.',
    defaultAudience: 'Investigative analysts, risk officers, and forensic researchers',
    defaultObjective: 'Verify multi-hop entity connections with linked evidentiary citations',
    priors: {
      userSophistication: 85,
      trustRequirement: 95,
      informationComplexity: 92,
      dataDensity: 88,
      collaborationLevel: 65,
      transactionCriticality: 65,
      navigationComplexity: 80,
      mobileImportance: 30,
    },
    requiredPageClasses: ['workspace-editor', 'search-explore', 'detail-entity'],
    optionalPageClasses: ['index-list', 'dashboard', 'settings'],
    defaultNavigationFamily: 'icon-rail-context-panel',
    applicableDnaPresets: ['institutional-intelligence', 'editorial-research', 'dense-terminal'],
    responsivePriorities: {
      desktopStrategy: 'desktop-dense-mobile-focused',
      mobilePhilosophy: 'companion-view',
    },
    antiPatterns: [
      'Uncited summary claims without direct evidence source links',
      'Unrecoverable loss of analyst working notes',
      'Low readability contrast in long investigative texts',
    ],
  },

  // 9. CRM & Operations Platform
  {
    id: 'crm-operations',
    name: 'CRM & Operations Platform',
    archetypeId: 'crm',
    description: 'Interactive pipeline stages, relationship history, activity logs, and outreach.',
    defaultAudience: 'Account executives, sales teams, and customer success managers',
    defaultObjective: 'Maintain accurate client records and guide deals smoothly through stages',
    priors: {
      userSophistication: 60,
      trustRequirement: 85,
      informationComplexity: 70,
      dataDensity: 75,
      collaborationLevel: 75,
      transactionCriticality: 80,
      navigationComplexity: 65,
      mobileImportance: 70,
    },
    requiredPageClasses: ['workspace-editor', 'index-list', 'detail-entity'],
    optionalPageClasses: ['dashboard', 'settings', 'analytics-reporting'],
    defaultNavigationFamily: 'classic-app-sidebar',
    applicableDnaPresets: ['warm-professional', 'professional-playful', 'modern-enterprise'],
    responsivePriorities: {
      desktopStrategy: 'desktop-dense-mobile-focused',
      mobilePhilosophy: 'equal-capability',
    },
    antiPatterns: [
      'Rigid forms requiring 20 fields before saving a quick contact note',
      'Unresponsive drag-and-drop Kanban columns on tablet screens',
      'Hiding recent communication history behind multiple sub-menus',
    ],
  },

  // 10. Education Product
  {
    id: 'education-product',
    name: 'Education Product',
    archetypeId: 'education',
    description: 'Course pathways, video lectures, interactive coding quizzes, and progress streaks.',
    defaultAudience: 'Self-paced learners, bootcamps, and classroom students',
    defaultObjective: 'Foster engaging, step-by-step concept mastery with encouraging progress loops',
    priors: {
      userSophistication: 45,
      trustRequirement: 80,
      informationComplexity: 55,
      dataDensity: 50,
      collaborationLevel: 65,
      transactionCriticality: 45,
      navigationComplexity: 50,
      mobileImportance: 80,
    },
    requiredPageClasses: ['dashboard', 'workspace-editor', 'index-list'],
    optionalPageClasses: ['marketing', 'detail-entity', 'settings'],
    defaultNavigationFamily: 'workspace-tabs',
    applicableDnaPresets: ['playful-education', 'soft-consumer', 'youthful-social'],
    responsivePriorities: {
      desktopStrategy: 'equal-capability-adaptive',
      mobilePhilosophy: 'primary-touch',
    },
    antiPatterns: [
      'Losing student quiz state when navigating between questions',
      'Overly harsh negative error states that demotivate learners',
      'Unplayable video lectures on mobile viewports',
    ],
  },

  // 11. Creator & Media Platform
  {
    id: 'creator-media',
    name: 'Creator & Media Platform',
    archetypeId: 'creator',
    description: 'Publishing newsletter engine, subscriber tiers, audio/video embeds, and fan feeds.',
    defaultAudience: 'Independent newsletter writers, podcasters, video artists, and patrons',
    defaultObjective: 'Give creators full editorial freedom and direct paid subscriber connections',
    priors: {
      userSophistication: 55,
      trustRequirement: 80,
      informationComplexity: 50,
      dataDensity: 55,
      collaborationLevel: 40,
      transactionCriticality: 70,
      navigationComplexity: 50,
      mobileImportance: 85,
    },
    requiredPageClasses: ['dashboard', 'workspace-editor', 'index-list'],
    optionalPageClasses: ['marketing', 'detail-entity', 'billing-account'],
    defaultNavigationFamily: 'collapsible-app-sidebar',
    applicableDnaPresets: ['creative-studio', 'editorial-research', 'organic-human'],
    responsivePriorities: {
      desktopStrategy: 'equal-capability-adaptive',
      mobilePhilosophy: 'primary-touch',
    },
    antiPatterns: [
      'Accidental broadcast dispatches without confirmation step',
      'Cluttered distraction-heavy writing view',
      'Obscured payout and fee calculations',
    ],
  },

  // 12. Consumer Productivity App
  {
    id: 'consumer-productivity',
    name: 'Consumer Productivity App',
    archetypeId: 'productivity',
    description: 'Frictionless thought capture, today agenda, habit tracker, and markdown notes.',
    defaultAudience: 'Individuals seeking focus, daily organization, and fast personal capture',
    defaultObjective: 'Eliminate friction between cognitive thought and structured task capture',
    priors: {
      userSophistication: 50,
      trustRequirement: 75,
      informationComplexity: 45,
      dataDensity: 50,
      collaborationLevel: 30,
      transactionCriticality: 20,
      navigationComplexity: 40,
      mobileImportance: 90,
    },
    requiredPageClasses: ['dashboard', 'workspace-editor'],
    optionalPageClasses: ['index-list', 'settings'],
    defaultNavigationFamily: 'workspace-tabs',
    applicableDnaPresets: ['quiet-productivity', 'soft-consumer', 'minimal-neo-grotesk'],
    responsivePriorities: {
      desktopStrategy: 'equal-capability-adaptive',
      mobilePhilosophy: 'primary-touch',
    },
    antiPatterns: [
      'High keystroke latency in the text editor',
      'Requiring internet access for basic task creation and note taking',
      'Over-complicated taxonomy requirements before saving a thought',
    ],
  },
];

const BLUEPRINTS_BY_ID = new Map<string, ProductBlueprint>(
  PRODUCT_BLUEPRINTS.map((b) => [b.id, b])
);

/**
 * Retrieves a blueprint by its ID.
 */
export function getProductBlueprint(id: string): ProductBlueprint | undefined {
  return BLUEPRINTS_BY_ID.get(id);
}

/**
 * Retrieves all 12 canonical product blueprints.
 */
export function getAllProductBlueprints(): readonly ProductBlueprint[] {
  return PRODUCT_BLUEPRINTS;
}

/**
 * Finds the closest blueprint matching an archetype ID.
 */
export function findBlueprintByArchetype(archetypeId: string): ProductBlueprint {
  const match = PRODUCT_BLUEPRINTS.find((b) => b.archetypeId === archetypeId);
  return match ?? PRODUCT_BLUEPRINTS[1]!; // fallback to B2B SaaS
}
