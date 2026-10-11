export type MotionEntranceType =
  | 'fade'
  | 'slide-up'
  | 'scale'
  | 'reveal'
  | 'clip'
  | 'stagger'
  | 'none';

export type ReducedMotionBehavior = 'instant' | 'fade-only' | 'disabled';

export interface MotionPersonalityConfig {
  id: string;
  name: string;
  description: string;
  durationFast: number; // ms
  durationNormal: number; // ms
  durationSlow: number; // ms
  easing: string;
  springConfig?: { stiffness: number; damping: number; mass: number };
  hoverScale: number;
  entranceType: MotionEntranceType;
  reducedMotionBehavior: ReducedMotionBehavior;
}

export const MOTION_PERSONALITIES: MotionPersonalityConfig[] = [
  // 1. Instant Utility
  {
    id: 'instant-utility',
    name: 'Instant Utility',
    description: 'Immediate zero-delay responsiveness without decorative intermediate states.',
    durationFast: 0,
    durationNormal: 80,
    durationSlow: 120,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    hoverScale: 1.0,
    entranceType: 'none',
    reducedMotionBehavior: 'instant',
  },

  // 2. Snappy Productive
  {
    id: 'snappy-productive',
    name: 'Snappy Productive',
    description: 'Crisp, highly responsive micro-transitions tuned for repetitive power workflows.',
    durationFast: 100,
    durationNormal: 150,
    durationSlow: 220,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    hoverScale: 1.01,
    entranceType: 'fade',
    reducedMotionBehavior: 'instant',
  },

  // 3. Calm Precision (Tessellate Default)
  {
    id: 'calm-precision',
    name: 'Calm Precision',
    description: 'Controlled, smooth easing curves creating quiet authority and predictability.',
    durationFast: 140,
    durationNormal: 220,
    durationSlow: 320,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    hoverScale: 1.015,
    entranceType: 'fade',
    reducedMotionBehavior: 'fade-only',
  },

  // 4. Soft Ease
  {
    id: 'soft-ease',
    name: 'Soft Ease',
    description: 'Gentle organic deceleration with warm, gradual resting states.',
    durationFast: 180,
    durationNormal: 280,
    durationSlow: 420,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    hoverScale: 1.02,
    entranceType: 'slide-up',
    reducedMotionBehavior: 'fade-only',
  },

  // 5. Luxury Glide
  {
    id: 'luxury-glide',
    name: 'Luxury Glide',
    description: 'Expansive, slow-gliding inertia evoking heavyweight physical luxury materials.',
    durationFast: 250,
    durationNormal: 450,
    durationSlow: 700,
    easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
    hoverScale: 1.025,
    entranceType: 'reveal',
    reducedMotionBehavior: 'fade-only',
  },

  // 6. Editorial Reveal
  {
    id: 'editorial-reveal',
    name: 'Editorial Reveal',
    description: 'Masked curtain unravelling and staggered typographic line reveals.',
    durationFast: 200,
    durationNormal: 350,
    durationSlow: 550,
    easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    hoverScale: 1.0,
    entranceType: 'clip',
    reducedMotionBehavior: 'fade-only',
  },

  // 7. Playful Spring
  {
    id: 'playful-spring',
    name: 'Playful Spring',
    description: 'Lighthearted spring oscillations with subtle overshoot on interactive triggers.',
    durationFast: 180,
    durationNormal: 320,
    durationSlow: 480,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    springConfig: { stiffness: 350, damping: 20, mass: 1 },
    hoverScale: 1.04,
    entranceType: 'scale',
    reducedMotionBehavior: 'fade-only',
  },

  // 8. Energetic Bounce
  {
    id: 'energetic-bounce',
    name: 'Energetic Bounce',
    description: 'High-amplitude kinetic rebounds giving consumer products a youthful pulse.',
    durationFast: 220,
    durationNormal: 380,
    durationSlow: 550,
    easing: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    springConfig: { stiffness: 450, damping: 15, mass: 1 },
    hoverScale: 1.06,
    entranceType: 'scale',
    reducedMotionBehavior: 'fade-only',
  },

  // 9. Technical Mechanical
  {
    id: 'technical-mechanical',
    name: 'Technical Mechanical',
    description: 'Relay-like stepping and linear calibrations reminiscent of physical instrumentation.',
    durationFast: 100,
    durationNormal: 180,
    durationSlow: 260,
    easing: 'cubic-bezier(0, 0, 0.3, 1)',
    hoverScale: 1.0,
    entranceType: 'slide-up',
    reducedMotionBehavior: 'instant',
  },

  // 10. Organic Drift
  {
    id: 'organic-drift',
    name: 'Organic Drift',
    description: 'Subtle ambient levitation and fluid undulating motion.',
    durationFast: 300,
    durationNormal: 500,
    durationSlow: 800,
    easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
    hoverScale: 1.02,
    entranceType: 'fade',
    reducedMotionBehavior: 'disabled',
  },

  // 11. Cinematic Slow
  {
    id: 'cinematic-slow',
    name: 'Cinematic Slow',
    description: 'Deliberate, wide-angle cinematic transitions for narrative hero landing sections.',
    durationFast: 350,
    durationNormal: 600,
    durationSlow: 950,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    hoverScale: 1.03,
    entranceType: 'reveal',
    reducedMotionBehavior: 'fade-only',
  },

  // 12. Data Reactive
  {
    id: 'data-reactive',
    name: 'Data Reactive',
    description: 'Interpolations tuned to stream updates, live socket tickers, and numeric counters.',
    durationFast: 120,
    durationNormal: 200,
    durationSlow: 300,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    hoverScale: 1.01,
    entranceType: 'stagger',
    reducedMotionBehavior: 'instant',
  },

  // 13. Minimal Fade
  {
    id: 'minimal-fade',
    name: 'Minimal Fade',
    description: 'Pure opacity cross-fades without translation or coordinate displacement.',
    durationFast: 120,
    durationNormal: 180,
    durationSlow: 260,
    easing: 'ease-in-out',
    hoverScale: 1.0,
    entranceType: 'fade',
    reducedMotionBehavior: 'fade-only',
  },

  // 14. Layered Depth
  {
    id: 'layered-depth',
    name: 'Layered Depth',
    description: 'Parallax separation between foreground sheets, floating dialogs, and background planes.',
    durationFast: 200,
    durationNormal: 320,
    durationSlow: 480,
    easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
    hoverScale: 1.025,
    entranceType: 'scale',
    reducedMotionBehavior: 'fade-only',
  },

  // 15. Masked Storytelling
  {
    id: 'masked-storytelling',
    name: 'Masked Storytelling',
    description: 'Circular and SVG polygon clip-path expansions guiding the eye through a narrative.',
    durationFast: 250,
    durationNormal: 420,
    durationSlow: 650,
    easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
    hoverScale: 1.01,
    entranceType: 'clip',
    reducedMotionBehavior: 'fade-only',
  },

  // 16. Scroll Narrative
  {
    id: 'scroll-narrative',
    name: 'Scroll Narrative',
    description: 'Scrubbed scroll timelines tying animation progress directly to viewport scroll position.',
    durationFast: 150,
    durationNormal: 250,
    durationSlow: 400,
    easing: 'linear',
    hoverScale: 1.01,
    entranceType: 'stagger',
    reducedMotionBehavior: 'disabled',
  },

  // 17. Magnetic Interactive
  {
    id: 'magnetic-interactive',
    name: 'Magnetic Interactive',
    description: 'Cursor-attracted buttons and elements that subtly pull toward pointer velocity.',
    durationFast: 140,
    durationNormal: 240,
    durationSlow: 350,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    hoverScale: 1.05,
    entranceType: 'scale',
    reducedMotionBehavior: 'fade-only',
  },

  // 18. Elastic Direct Manipulation
  {
    id: 'elastic-direct-manipulation',
    name: 'Elastic Direct Manipulation',
    description: 'Rubber-band boundaries on swipe, drag reordering, and canvas panning.',
    durationFast: 180,
    durationNormal: 300,
    durationSlow: 450,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    springConfig: { stiffness: 300, damping: 25, mass: 1 },
    hoverScale: 1.02,
    entranceType: 'slide-up',
    reducedMotionBehavior: 'fade-only',
  },

  // 19. Heavy Inertia
  {
    id: 'heavy-inertia',
    name: 'Heavy Inertia',
    description: 'Substantial mass and friction damping suitable for industrial or heavy mechanical controls.',
    durationFast: 280,
    durationNormal: 480,
    durationSlow: 750,
    easing: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
    hoverScale: 1.01,
    entranceType: 'slide-up',
    reducedMotionBehavior: 'fade-only',
  },

  // 20. Lightweight Native
  {
    id: 'lightweight-native',
    name: 'Lightweight Native',
    description: 'Familiar iOS / macOS UIKit style spring timings that feel invisible and native.',
    durationFast: 120,
    durationNormal: 200,
    durationSlow: 300,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
    hoverScale: 1.015,
    entranceType: 'fade',
    reducedMotionBehavior: 'fade-only',
  },

  // 21. Reduced Motion First
  {
    id: 'reduced-motion-first',
    name: 'Reduced Motion First',
    description: 'Accessible by default: no displacement, zero vestibulo-ocular triggers, fast opacity only.',
    durationFast: 50,
    durationNormal: 100,
    durationSlow: 150,
    easing: 'linear',
    hoverScale: 1.0,
    entranceType: 'fade',
    reducedMotionBehavior: 'fade-only',
  },

  // 22. Spatial Camera
  {
    id: 'spatial-camera',
    name: 'Spatial Camera',
    description: '3D perspective rotations, z-axis dollying, and immersive depth planes.',
    durationFast: 300,
    durationNormal: 500,
    durationSlow: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    hoverScale: 1.04,
    entranceType: 'scale',
    reducedMotionBehavior: 'disabled',
  },

  // 23. Micro Delight
  {
    id: 'micro-delight',
    name: 'Micro Delight',
    description: 'Subtle sparkles, toggle flips, checkbox confetti, and tactile micro-rewards.',
    durationFast: 160,
    durationNormal: 260,
    durationSlow: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    springConfig: { stiffness: 400, damping: 18, mass: 0.8 },
    hoverScale: 1.04,
    entranceType: 'scale',
    reducedMotionBehavior: 'fade-only',
  },

  // 24. Experimental Kinetic
  {
    id: 'experimental-kinetic',
    name: 'Experimental Kinetic',
    description: 'Nonlinear choreographies, elastic distortions, variable frame pacing, and boundary pushing.',
    durationFast: 220,
    durationNormal: 420,
    durationSlow: 700,
    easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
    hoverScale: 1.05,
    entranceType: 'stagger',
    reducedMotionBehavior: 'disabled',
  },
];

const MOTION_BY_ID = new Map<string, MotionPersonalityConfig>(
  MOTION_PERSONALITIES.map((m) => [m.id, m])
);

/**
 * Retrieves a motion personality by its identifier.
 */
export function getMotionPersonality(id: string): MotionPersonalityConfig | undefined {
  return MOTION_BY_ID.get(id);
}

/**
 * Retrieves all registered motion personalities.
 */
export function getAllMotionPersonalities(): readonly MotionPersonalityConfig[] {
  return MOTION_PERSONALITIES;
}
