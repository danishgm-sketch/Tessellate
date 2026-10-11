export interface ResponsiveStrategyPreset {
  id: string;
  name: string;
  description: string;
  mobilePhilosophy:
    | 'focused-subset'
    | 'progressive-disclosure'
    | 'equal-capability'
    | 'companion-view'
    | 'primary-touch'
    | 'display-wall';
  tableBehavior: 'scroll' | 'card-stack' | 'summary-list';
  sidebarBehavior: 'docked' | 'drawer' | 'bottom-sheet' | 'hidden';
  minTouchTargetPx: number;
  layoutPriorities: {
    desktopColumns: number;
    tabletColumns: number;
    mobileColumns: number;
  };
}

export const RESPONSIVE_STRATEGIES: ResponsiveStrategyPreset[] = [
  // 1. Desktop Dense → Mobile Focused
  {
    id: 'desktop-dense-mobile-focused',
    name: 'Desktop Dense → Mobile Focused',
    description:
      'High-throughput multi-column layout on desktop, collapsing to high-priority triage and summary cards on mobile.',
    mobilePhilosophy: 'focused-subset',
    tableBehavior: 'summary-list',
    sidebarBehavior: 'drawer',
    minTouchTargetPx: 44,
    layoutPriorities: {
      desktopColumns: 12,
      tabletColumns: 6,
      mobileColumns: 1,
    },
  },

  // 2. Mobile First Progressive
  {
    id: 'mobile-first-progressive',
    name: 'Mobile First Progressive',
    description:
      'Engineered primarily for phone viewports, smoothly expanding with progressive enhancement for wider screens.',
    mobilePhilosophy: 'progressive-disclosure',
    tableBehavior: 'card-stack',
    sidebarBehavior: 'bottom-sheet',
    minTouchTargetPx: 48,
    layoutPriorities: {
      desktopColumns: 8,
      tabletColumns: 4,
      mobileColumns: 1,
    },
  },

  // 3. Equal Capability Adaptive
  {
    id: 'equal-capability-adaptive',
    name: 'Equal Capability Adaptive',
    description:
      'No features stripped on small screens; full CRUD, charts, and editing tools fully accessible across all viewports.',
    mobilePhilosophy: 'equal-capability',
    tableBehavior: 'scroll',
    sidebarBehavior: 'drawer',
    minTouchTargetPx: 44,
    layoutPriorities: {
      desktopColumns: 12,
      tabletColumns: 8,
      mobileColumns: 2,
    },
  },

  // 4. Read-Only Mobile Companion
  {
    id: 'read-only-mobile-companion',
    name: 'Read-Only Mobile Companion',
    description:
      'Mobile viewport acts as an executive telemetry and notification monitor; complex authoring deferred to desktop.',
    mobilePhilosophy: 'companion-view',
    tableBehavior: 'summary-list',
    sidebarBehavior: 'bottom-sheet',
    minTouchTargetPx: 44,
    layoutPriorities: {
      desktopColumns: 12,
      tabletColumns: 6,
      mobileColumns: 1,
    },
  },

  // 5. Touch-First Application
  {
    id: 'touch-first-application',
    name: 'Touch-First Application',
    description:
      'Large comfortable hit areas, bottom bar navigation, swipe drawers, and thumb-zone ergonomically optimized.',
    mobilePhilosophy: 'primary-touch',
    tableBehavior: 'card-stack',
    sidebarBehavior: 'bottom-sheet',
    minTouchTargetPx: 48,
    layoutPriorities: {
      desktopColumns: 6,
      tabletColumns: 4,
      mobileColumns: 1,
    },
  },

  // 6. Presentation / Large Display
  {
    id: 'presentation-large-display',
    name: 'Presentation / Large Display',
    description:
      'Optimized for 4K video walls, conference boardrooms, and command center projection systems with oversized type.',
    mobilePhilosophy: 'display-wall',
    tableBehavior: 'scroll',
    sidebarBehavior: 'docked',
    minTouchTargetPx: 44,
    layoutPriorities: {
      desktopColumns: 16,
      tabletColumns: 8,
      mobileColumns: 2,
    },
  },
];

export interface AccessibilityStrategyPreset {
  id: string;
  name: string;
  description: string;
  wcagLevel: 'AA' | 'AAA';
  minContrastNormal: number; // e.g. 4.5 or 7.0
  minContrastLarge: number; // e.g. 3.0 or 4.5
  focusRingWidthPx: number;
  focusRingOffsetPx: number;
  enforceReducedMotion: boolean;
  keyboardShortcutDensity: 'standard' | 'dense' | 'primary-nav';
  screenReaderVerbosity: 'concise' | 'balanced' | 'descriptive';
}

export const ACCESSIBILITY_STRATEGIES: AccessibilityStrategyPreset[] = [
  // 1. AA Balanced (Tessellate Default)
  {
    id: 'aa-balanced',
    name: 'AA Balanced',
    description: 'WCAG 2.2 AA compliant with 4.5:1 contrast, 2px visible focus rings, and full keyboard flow.',
    wcagLevel: 'AA',
    minContrastNormal: 4.5,
    minContrastLarge: 3.0,
    focusRingWidthPx: 2,
    focusRingOffsetPx: 2,
    enforceReducedMotion: false,
    keyboardShortcutDensity: 'standard',
    screenReaderVerbosity: 'balanced',
  },

  // 2. AA High Contrast
  {
    id: 'aa-high-contrast',
    name: 'AA High Contrast',
    description: 'Crisp high-contrast outlines, reinforced borders, and bold focus states for low-vision environments.',
    wcagLevel: 'AA',
    minContrastNormal: 5.5,
    minContrastLarge: 3.5,
    focusRingWidthPx: 3,
    focusRingOffsetPx: 2,
    enforceReducedMotion: false,
    keyboardShortcutDensity: 'standard',
    screenReaderVerbosity: 'balanced',
  },

  // 3. Reduced Motion First
  {
    id: 'reduced-motion-first',
    name: 'Reduced Motion First',
    description: 'Strict vestibular comfort: disables all spatial parallax, zoom animations, and auto-playing media.',
    wcagLevel: 'AA',
    minContrastNormal: 4.5,
    minContrastLarge: 3.0,
    focusRingWidthPx: 2,
    focusRingOffsetPx: 2,
    enforceReducedMotion: true,
    keyboardShortcutDensity: 'standard',
    screenReaderVerbosity: 'balanced',
  },

  // 4. Keyboard Power User
  {
    id: 'keyboard-power-user',
    name: 'Keyboard Power User',
    description: 'Complete non-mouse workflow with visible shortcut badges, focus traps, and rapid spatial jumping.',
    wcagLevel: 'AA',
    minContrastNormal: 4.5,
    minContrastLarge: 3.0,
    focusRingWidthPx: 2,
    focusRingOffsetPx: 2,
    enforceReducedMotion: false,
    keyboardShortcutDensity: 'dense',
    screenReaderVerbosity: 'concise',
  },

  // 5. AAA Aspirational
  {
    id: 'aaa-aspirational',
    name: 'AAA Aspirational',
    description: 'Rigorous WCAG 2.2 AAA conformity: 7:1 text contrast, 3px focus indicators, and comprehensive descriptions.',
    wcagLevel: 'AAA',
    minContrastNormal: 7.0,
    minContrastLarge: 4.5,
    focusRingWidthPx: 3,
    focusRingOffsetPx: 2,
    enforceReducedMotion: true,
    keyboardShortcutDensity: 'dense',
    screenReaderVerbosity: 'descriptive',
  },
];

const RESPONSIVE_BY_ID = new Map<string, ResponsiveStrategyPreset>(
  RESPONSIVE_STRATEGIES.map((r) => [r.id, r])
);

const ACCESSIBILITY_BY_ID = new Map<string, AccessibilityStrategyPreset>(
  ACCESSIBILITY_STRATEGIES.map((a) => [a.id, a])
);

/**
 * Retrieves a responsive strategy preset by its identifier.
 */
export function getResponsiveStrategy(id: string): ResponsiveStrategyPreset | undefined {
  return RESPONSIVE_BY_ID.get(id);
}

/**
 * Retrieves all registered responsive strategy presets.
 */
export function getAllResponsiveStrategies(): readonly ResponsiveStrategyPreset[] {
  return RESPONSIVE_STRATEGIES;
}

/**
 * Retrieves an accessibility strategy preset by its identifier.
 */
export function getAccessibilityStrategy(id: string): AccessibilityStrategyPreset | undefined {
  return ACCESSIBILITY_BY_ID.get(id);
}

/**
 * Retrieves all registered accessibility strategy presets.
 */
export function getAllAccessibilityStrategies(): readonly AccessibilityStrategyPreset[] {
  return ACCESSIBILITY_STRATEGIES;
}
