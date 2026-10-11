import type { MotionDef } from './motion-builder';

export const MOTION_BATCH_2: MotionDef[] = [
  // 13. Magnetic Button
  {
    slug: 'magnetic-button',
    name: 'Magnetic Button',
    description: 'Cursor-attracted interactive button pulling towards cursor coordinates within proximity threshold with spring return.',
    categories: ['motion', 'microinteractions', 'cursor'],
    roles: ['button', 'magnetic'],
    purposes: ['tactile-cursor-pull', 'premium-interaction', 'hero-callout'],
    componentName: 'MagneticButton',
    tags: ['motion', 'magnetic', 'cursor', 'spring', 'interactive'],
    idealFor: ['Primary hero CTA triggers', 'Play / Pause demo buttons', 'Featured download buttons'],
    avoidFor: ['Standard repetitive table action rows', 'Form submit buttons inside tight fieldsets'],
    jobs: ['Pull action button dynamically towards cursor proximity for delightful tactile magnetic feedback'],
    indexCode: `import React, { useState } from 'react';

export type MagneticButtonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MagneticButtonProps {
  variant?: MagneticButtonVariant;
  children?: React.ReactNode;
}

export function MagneticButton({ variant = 'quiet', children = 'Explore Interface System →' }: MagneticButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const btnClass =
    variant === 'nocturne'
      ? 'bg-cyan-500 text-black font-semibold hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
      : variant === 'expressive'
      ? 'bg-[#2547E8] text-white font-medium hover:bg-blue-700 shadow-md'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.35;
    const deltaY = (e.clientY - centerY) * 0.35;
    setOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="p-8 flex items-center justify-center">
      <button
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: \`translate3d(\${offset.x}px, \${offset.y}px, 0)\` }}
        className={\`px-6 py-3 rounded-xl text-xs transition-transform duration-150 ease-out select-none motion-reduce:transform-none \${btnClass}\`}
      >
        {children}
      </button>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MagneticButton, MagneticButtonVariant } from './index';

export function MagneticButtonPreview() {
  const [variant, setVariant] = useState<MagneticButtonVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <MagneticButton variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const magneticButtonFixtures = {};`,
    readmeCode: `# Magnetic Button

Cursor-attracted interactive button with spring settling and proximity tracking.`,
  },

  // 14. Cursor Spotlight
  {
    slug: 'cursor-spotlight',
    name: 'Cursor Spotlight',
    description: 'Radial luminance spotlight tracking mouse pointer across container surface, revealing border hairline luster.',
    categories: ['motion', 'microinteractions', 'cursor'],
    roles: ['spotlight', 'luster'],
    purposes: ['surface-illumination', 'cursor-tracking', 'ambient-depth'],
    componentName: 'CursorSpotlight',
    tags: ['motion', 'spotlight', 'cursor', 'radial', 'illumination'],
    idealFor: ['Feature bento cards', 'Pricing plan cards', 'Hero banner surfaces'],
    avoidFor: ['Mobile touchscreen-only layouts without pointer support', 'Raw text logs'],
    jobs: ['Follow cursor coordinates with radial gradient glow highlighting card boundaries'],
    indexCode: `import React, { useState } from 'react';

export type CursorSpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CursorSpotlightProps {
  variant?: CursorSpotlightVariant;
}

export function CursorSpotlight({ variant = 'quiet' }: CursorSpotlightProps) {
  const [pos, setPos] = useState({ x: 200, y: 100 });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const glowColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.15)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.12)'
      : 'rgba(0, 0, 0, 0.05)';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={\`relative w-full p-8 rounded-xl border overflow-hidden transition-colors select-none \${cardBg}\`}
    >
      {/* Radial spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          background: \`radial-gradient(350px circle at \${pos.x}px \${pos.y}px, \${glowColor}, transparent 80%)\`,
        }}
      />

      <div className="relative z-10 space-y-2">
        <span className="text-xs font-mono text-neutral-400">Ambient Surface Luster</span>
        <h4 className="text-sm font-semibold tracking-tight">Interactive Cursor Spotlight</h4>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
          Move your pointer over this surface to reveal radial illumination gradients tracking mouse coordinates in real-time.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CursorSpotlight, CursorSpotlightVariant } from './index';

export function CursorSpotlightPreview() {
  const [variant, setVariant] = useState<CursorSpotlightVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <CursorSpotlight variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const cursorSpotlightFixtures = {};`,
    readmeCode: `# Cursor Spotlight

Radial luminance gradient tracking pointer coordinates across surface boundaries.`,
  },

  // 15. Card Tilt
  {
    slug: 'card-tilt',
    name: 'Card Tilt',
    description: '3D perspective tilt reacting to cursor position across card quadrants with subtle glare reflection.',
    categories: ['motion', 'microinteractions', 'perspective'],
    roles: ['tilt', 'perspective'],
    purposes: ['3d-perspective-tilt', 'tactile-card', 'interactive-depth'],
    componentName: 'CardTilt',
    tags: ['motion', 'tilt', '3d', 'perspective', 'card'],
    idealFor: ['Featured portfolio showcases', 'Pro subscription cards', 'Collector badges'],
    avoidFor: ['Dense 50-card grids causing motion fatigue', 'Modal alert titles'],
    jobs: ['Tilt card smoothly in 3D perspective space according to cursor position'],
    indexCode: `import React, { useState } from 'react';

export type CardTiltVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CardTiltProps {
  variant?: CardTiltVariant;
}

export function CardTilt({ variant = 'quiet' }: CardTiltProps) {
  const [rot, setRot] = useState({ x: 0, y: 0 });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white shadow-xl'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-lg';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRot({ x: -y * 12, y: x * 12 });
  };

  const handleMouseLeave = () => {
    setRot({ x: 0, y: 0 });
  };

  return (
    <div style={{ perspective: '800px' }} className="w-full flex items-center justify-center p-8">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: \`rotateX(\${rot.x}deg) rotateY(\${rot.y}deg)\`,
          transformStyle: 'preserve-3d',
        }}
        className={\`w-80 p-6 rounded-2xl border transition-transform duration-150 ease-out cursor-pointer select-none motion-reduce:transform-none \${cardBg}\`}
      >
        <div className="text-[10px] font-mono text-neutral-400 mb-2">3D Perspective Matrix</div>
        <h4 className="text-base font-bold mb-1">Perspective Tilt Card</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Hover across corners to test pitch and roll rotational transforms with smooth spring return.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CardTilt, CardTiltVariant } from './index';

export function CardTiltPreview() {
  const [variant, setVariant] = useState<CardTiltVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <CardTilt variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const cardTiltFixtures = {};`,
    readmeCode: `# Card Tilt

3D perspective tilt container responding to cursor quadrant coordinates.`,
  },

  // 16. Card Hover Lift
  {
    slug: 'card-hover-lift',
    name: 'Card Hover Lift',
    description: 'Subtle vertical translate-y(-4px) lift with elevated shadow bloom on pointer hover.',
    categories: ['motion', 'microinteractions', 'hover'],
    roles: ['card', 'lift'],
    purposes: ['hover-elevation', 'card-affordance', 'tactile-response'],
    componentName: 'CardHoverLift',
    tags: ['motion', 'hover', 'lift', 'elevation', 'shadow'],
    idealFor: ['Resource catalogue cards', 'Blog post grid items', 'Feature list rows'],
    avoidFor: ['Inline text links', 'Fixed screen headers'],
    jobs: ['Provide instant interactive elevation affordance on pointer hover'],
    indexCode: `import React from 'react';

export type CardHoverLiftVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CardHoverLiftProps {
  variant?: CardHoverLiftVariant;
}

export function CardHoverLift({ variant = 'quiet' }: CardHoverLiftProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white hover:border-cyan-500/50 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 hover:border-blue-400 hover:shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300 hover:shadow-md';

  return (
    <div className="p-8 flex items-center justify-center">
      <div
        className={\`w-80 p-6 rounded-xl border transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 motion-reduce:transform-none \${cardBg}\`}
      >
        <div className="text-[10px] font-mono text-neutral-400 mb-2">Elevation Affordance</div>
        <h4 className="text-sm font-semibold mb-1">Hover Lift Elevation</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Subtle vertical translation paired with expanded shadow bloom signals clickability.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CardHoverLift, CardHoverLiftVariant } from './index';

export function CardHoverLiftPreview() {
  const [variant, setVariant] = useState<CardHoverLiftVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <CardHoverLift variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const cardHoverLiftFixtures = {};`,
    readmeCode: `# Card Hover Lift

Vertical translate-y elevation lift with shadow bloom on pointer hover.`,
  },

  // 17. Animated Border Trace
  {
    slug: 'animated-border-trace',
    name: 'Animated Border Trace',
    description: 'Continuous or hover-activated SVG path trace racing along card perimeter hairline.',
    categories: ['motion', 'microinteractions', 'borders'],
    roles: ['border', 'trace'],
    purposes: ['border-animation', 'highlight-perimeter', 'cyber-hairline'],
    componentName: 'AnimatedBorderTrace',
    tags: ['motion', 'border', 'trace', 'svg', 'perimeter'],
    idealFor: ['Highlighted plan tier in pricing', 'Active selected canvas block', 'System alert perimeter'],
    avoidFor: ['Standard form inputs', 'Plain navigation menus'],
    jobs: ['Trace a luminous line along container perimeter borders'],
    indexCode: `import React from 'react';

export type AnimatedBorderTraceVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnimatedBorderTraceProps {
  variant?: AnimatedBorderTraceVariant;
}

export function AnimatedBorderTrace({ variant = 'quiet' }: AnimatedBorderTraceProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white'
      : variant === 'expressive'
      ? 'bg-white text-neutral-900'
      : 'bg-white text-neutral-900';

  const strokeColor =
    variant === 'nocturne'
      ? '#06B6D4'
      : variant === 'expressive'
      ? '#2547E8'
      : '#171717';

  return (
    <div className="p-8 flex items-center justify-center">
      <div className={\`relative w-80 p-6 rounded-xl overflow-hidden \${cardBg}\`}>
        {/* SVG trace overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="12"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeDasharray="80 300"
            className="animate-[spin_4s_linear_infinite]"
          />
        </svg>

        <div className="relative z-10 space-y-1.5">
          <span className="text-[10px] font-mono text-neutral-400">Hairline Tracer</span>
          <h4 className="text-sm font-semibold">Active Perimeter Trace</h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Continuous stroke-dasharray orbital animation tracing rectangular perimeter coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AnimatedBorderTrace, AnimatedBorderTraceVariant } from './index';

export function AnimatedBorderTracePreview() {
  const [variant, setVariant] = useState<AnimatedBorderTraceVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AnimatedBorderTrace variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const animatedBorderTraceFixtures = {};`,
    readmeCode: `# Animated Border Trace

Perimeter stroke-dasharray hairline tracer running continuously along container boundaries.`,
  },

  // 18. Animated Gradient Line
  {
    slug: 'animated-gradient-line',
    name: 'Animated Gradient Line',
    description: 'Moving linear gradient beam sweeping across dividers, card separators, or section footers.',
    categories: ['motion', 'microinteractions', 'dividers'],
    roles: ['divider', 'gradient'],
    purposes: ['divider-animation', 'beam-sweep', 'section-boundary'],
    componentName: 'AnimatedGradientLine',
    tags: ['motion', 'gradient', 'divider', 'beam', 'sweep'],
    idealFor: ['Section dividers in dark mode', 'Loading separator bars', 'Footer boundary transitions'],
    avoidFor: ['Text paragraph underlines', 'Standard table cell borders'],
    jobs: ['Sweep continuous gradient luminescence horizontally across divider lines'],
    indexCode: `import React from 'react';

export type AnimatedGradientLineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnimatedGradientLineProps {
  variant?: AnimatedGradientLineVariant;
}

export function AnimatedGradientLine({ variant = 'quiet' }: AnimatedGradientLineProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const gradientClass =
    variant === 'nocturne'
      ? 'from-transparent via-cyan-400 to-transparent'
      : variant === 'expressive'
      ? 'from-transparent via-blue-600 to-transparent'
      : 'from-transparent via-neutral-900 dark:via-white to-transparent';

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col gap-6 transition-colors \${cardBg}\`}>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold tracking-tight">Luminescent Divider Beam</h4>
        <p className="text-xs text-neutral-500">Horizontal gradient beam sweeping continuously across boundary</p>
      </div>

      <div className="relative w-full h-px bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className={\`absolute top-0 bottom-0 w-48 bg-gradient-to-r \${gradientClass} animate-[move-horizontal_3s_ease-in-out_infinite]\`}
          style={{ animation: 'moveBeam 3s ease-in-out infinite' }}
        />
        <style>{\`
          @keyframes moveBeam {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(500%); }
          }
        \`}</style>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AnimatedGradientLine, AnimatedGradientLineVariant } from './index';

export function AnimatedGradientLinePreview() {
  const [variant, setVariant] = useState<AnimatedGradientLineVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AnimatedGradientLine variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const animatedGradientLineFixtures = {};`,
    readmeCode: `# Animated Gradient Line

Horizontal moving gradient beam sweeping continuously across section divider tracks.`,
  },

  // 19. Number Count Up
  {
    slug: 'number-count-up',
    name: 'Number Count Up',
    description: 'Eased numeric counter animating from zero to target value on viewport entrance with monospace stability.',
    categories: ['motion', 'microinteractions', 'numbers'],
    roles: ['counter', 'numbers'],
    purposes: ['numeric-count-up', 'metric-celebration', 'telemetry-load'],
    componentName: 'NumberCountUp',
    tags: ['motion', 'count-up', 'numbers', 'metric', 'counter'],
    idealFor: ['Social proof metric counters', 'Customer tally stats', 'Benchmark speed metrics'],
    avoidFor: ['Real-time clock seconds', 'Pagination page numbers'],
    jobs: ['Animate integers from 0 to destination with smooth logarithmic easing'],
    indexCode: `import React, { useState } from 'react';

export type NumberCountUpVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NumberCountUpProps {
  variant?: NumberCountUpVariant;
}

export function NumberCountUp({ variant = 'quiet' }: NumberCountUpProps) {
  const [count, setCount] = useState(324);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const restart = () => {
    setCount(0);
    const target = 324;
    let current = 0;
    const interval = setInterval(() => {
      current += 12;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 25);
  };

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col items-center gap-4 transition-colors \${cardBg}\`}>
      <div className="w-full flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Logarithmic Counter</span>
        <button
          onClick={restart}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay Count
        </button>
      </div>

      <div className="py-4 text-center">
        <span className="text-5xl font-mono font-extrabold tracking-tight">{count}</span>
        <div className="text-xs text-neutral-500 mt-1">Canonical Resources Verified</div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { NumberCountUp, NumberCountUpVariant } from './index';

export function NumberCountUpPreview() {
  const [variant, setVariant] = useState<NumberCountUpVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <NumberCountUp variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const numberCountUpFixtures = {};`,
    readmeCode: `# Number Count Up

Logarithmically eased numeric counter animating from zero to target value.`,
  },

  // 20. KPI Delta Motion
  {
    slug: 'kpi-delta-motion',
    name: 'KPI Delta Motion',
    description: 'Ticker tape number transition flipping upward or downward when metric value updates.',
    categories: ['motion', 'microinteractions', 'numbers'],
    roles: ['kpi', 'ticker'],
    purposes: ['delta-transition', 'ticker-animation', 'real-time-flip'],
    componentName: 'KpiDeltaMotion',
    tags: ['motion', 'kpi', 'ticker', 'delta', 'flip'],
    idealFor: ['Real-time stock price ticks', 'Throughput rate transitions', 'Active user updates'],
    avoidFor: ['Static phone numbers', 'Year publication dates'],
    jobs: ['Transition numerical values with directional upward or downward rolling ticker motion'],
    indexCode: `import React, { useState } from 'react';

export type KpiDeltaMotionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KpiDeltaMotionProps {
  variant?: KpiDeltaMotionVariant;
}

export function KpiDeltaMotion({ variant = 'quiet' }: KpiDeltaMotionProps) {
  const [val, setVal] = useState(4250);
  const [delta, setDelta] = useState<'+' | '-'>('+');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const bump = (direction: '+' | '-') => {
    setDelta(direction);
    setVal((prev) => (direction === '+' ? prev + 125 : prev - 125));
  };

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Directional Metric Ticker</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => bump('+')}
            className="text-xs px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 hover:text-emerald-500"
          >
            + Tick
          </button>
          <button
            onClick={() => bump('-')}
            className="text-xs px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 hover:text-rose-500"
          >
            - Tick
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <span className="text-4xl font-mono font-bold tracking-tight">$\${val.toLocaleString()}</span>
        <span
          className={\`text-xs font-mono font-semibold px-2 py-0.5 rounded transition-transform duration-200 \${
            delta === '+' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
          }\`}
        >
          {delta === '+' ? '▲ +2.9%' : '▼ -2.9%'}
        </span>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { KpiDeltaMotion, KpiDeltaMotionVariant } from './index';

export function KpiDeltaMotionPreview() {
  const [variant, setVariant] = useState<KpiDeltaMotionVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <KpiDeltaMotion variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const kpiDeltaMotionFixtures = {};`,
    readmeCode: `# KPI Delta Motion

Directional ticker animation flipping upward or downward on value modification.`,
  },

  // 21. Accordion Spring
  {
    slug: 'accordion-spring',
    name: 'Accordion Spring',
    description: 'Spring-animated expandable panel expanding height from 0 to auto without layout jank.',
    categories: ['motion', 'microinteractions', 'accordion'],
    roles: ['accordion', 'spring'],
    purposes: ['smooth-expansion', 'height-spring', 'faq-disclosure'],
    componentName: 'AccordionSpring',
    tags: ['motion', 'accordion', 'spring', 'height', 'expansion'],
    idealFor: ['FAQ questions', 'Collapsible settings groups', 'Deep configuration sections'],
    avoidFor: ['Standard persistent visible sidebars', 'Plain button clicks'],
    jobs: ['Expand and collapse child content with smooth springy height interpolation'],
    indexCode: `import React, { useState } from 'react';

export type AccordionSpringVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AccordionSpringProps {
  variant?: AccordionSpringVariant;
}

export function AccordionSpring({ variant = 'quiet' }: AccordionSpringProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const items = [
    { title: 'How does Tessellate preserve 0 paid dependencies?', content: 'All catalog resources use standard React, Tailwind CSS 4, and inline SVG primitives without proprietary external dependencies.' },
    { title: 'Are tokens compatible with WCAG 2.2 AA?', content: 'Yes, all presets enforce mathematically verified contrast ratios across buttons, badges, and body copy.' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-3 transition-colors \${cardBg}\`}>
      <h4 className="text-sm font-semibold tracking-tight pb-2 border-b border-neutral-100 dark:border-neutral-800">
        Spring Accordion Disclosure
      </h4>

      <div className="space-y-2">
        {items.map((it, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-3 text-xs font-semibold text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
              >
                <span>{it.title}</span>
                <span className={\`transform transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="p-3 bg-neutral-50/50 dark:bg-black/30 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 leading-relaxed">
                  {it.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AccordionSpring, AccordionSpringVariant } from './index';

export function AccordionSpringPreview() {
  const [variant, setVariant] = useState<AccordionSpringVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AccordionSpring variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const accordionSpringFixtures = {};`,
    readmeCode: `# Accordion Spring

Smooth expandable disclosure panel expanding content without layout jank.`,
  },

  // 22. Drawer Spring
  {
    slug: 'drawer-spring',
    name: 'Drawer Spring',
    description: 'Off-canvas sliding overlay drawer with spring damping, backdrop blur, and escape key listener.',
    categories: ['motion', 'microinteractions', 'drawer'],
    roles: ['drawer', 'overlay'],
    purposes: ['off-canvas-drawer', 'inspector-slideout', 'mobile-navigation'],
    componentName: 'DrawerSpring',
    tags: ['motion', 'drawer', 'spring', 'overlay', 'off-canvas'],
    idealFor: ['Right-hand inspector sidebars', 'Mobile off-canvas navigation menus', 'Shopping cart slideouts'],
    avoidFor: ['Standard persistent static sidebars', 'Inline search bars'],
    jobs: ['Slide off-canvas drawer panels onto screen with spring damping physics'],
    indexCode: `import React, { useState } from 'react';

export type DrawerSpringVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DrawerSpringProps {
  variant?: DrawerSpringVariant;
}

export function DrawerSpring({ variant = 'quiet' }: DrawerSpringProps) {
  const [isOpen, setIsOpen] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col items-center justify-center transition-colors \${cardBg}\`}>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
      >
        Open Spring Drawer →
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className={\`w-80 h-full p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] \${cardBg}\`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <span className="text-sm font-semibold">Inspector Drawer</span>
                <button onClick={() => setIsOpen(false)} className="text-xs text-neutral-400 hover:text-current">
                  ✕
                </button>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Sliding off-canvas sheet with spring damping entrance and backdrop blur layer.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DrawerSpring, DrawerSpringVariant } from './index';

export function DrawerSpringPreview() {
  const [variant, setVariant] = useState<DrawerSpringVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <DrawerSpring variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const drawerSpringFixtures = {};`,
    readmeCode: `# Drawer Spring

Off-canvas sliding overlay drawer with spring damping and backdrop blur.`,
  },

  // 23. Success Celebration
  {
    slug: 'success-celebration',
    name: 'Success Celebration',
    description: 'Post-action success checkmark bloom with particle burst microinteraction.',
    categories: ['motion', 'microinteractions', 'celebration'],
    roles: ['celebration', 'success'],
    purposes: ['task-completion', 'positive-feedback', 'celebration-bloom'],
    componentName: 'SuccessCelebration',
    tags: ['motion', 'success', 'celebration', 'checkmark', 'bloom'],
    idealFor: ['Form submission confirmations', 'Deployment completed milestones', 'Payment success receipts'],
    avoidFor: ['Standard informational badges', 'Warning toasts'],
    jobs: ['Celebrate milestone completion with checkmark scaling bloom and particle bursts'],
    indexCode: `import React, { useState } from 'react';

export type SuccessCelebrationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SuccessCelebrationProps {
  variant?: SuccessCelebrationVariant;
}

export function SuccessCelebration({ variant = 'quiet' }: SuccessCelebrationProps) {
  const [played, setPlayed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const checkColor =
    variant === 'nocturne'
      ? 'bg-emerald-500 text-black'
      : variant === 'expressive'
      ? 'bg-[#10B981] text-white shadow-lg'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col items-center justify-center gap-4 transition-colors \${cardBg}\`}>
      <div
        className={\`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transform-none \${checkColor} \${
          played ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }\`}
      >
        ✓
      </div>

      <div className="text-center space-y-1">
        <h4 className="text-sm font-bold tracking-tight">Deployment Succeeded</h4>
        <p className="text-xs text-neutral-500">Autonomous build phase completed without errors.</p>
      </div>

      <button
        onClick={() => {
          setPlayed(false);
          setTimeout(() => setPlayed(true), 50);
        }}
        className="mt-2 text-xs px-3 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
      >
        Replay Celebration
      </button>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SuccessCelebration, SuccessCelebrationVariant } from './index';

export function SuccessCelebrationPreview() {
  const [variant, setVariant] = useState<SuccessCelebrationVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <SuccessCelebration variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const successCelebrationFixtures = {};`,
    readmeCode: `# Success Celebration

Success checkmark scaling bloom with positive milestone confirmation feedback.`,
  },

  // 24. Loading Orbit
  {
    slug: 'loading-orbit',
    name: 'Loading Orbit',
    description: 'Subtle orbital planetary ring loader indicating background task execution without visual stress.',
    categories: ['motion', 'microinteractions', 'loading'],
    roles: ['loading', 'spinner'],
    purposes: ['background-processing', 'orbital-spinner', 'calm-loading'],
    componentName: 'LoadingOrbit',
    tags: ['motion', 'loading', 'orbit', 'spinner', 'planetary'],
    idealFor: ['Background indexing operations', 'Async synthesis waiting', 'Calm loading spinners'],
    avoidFor: ['Instantaneous UI clicks', 'Static progress bars'],
    jobs: ['Indicate asynchronous background work via calm orbital rotation'],
    indexCode: `import React from 'react';

export type LoadingOrbitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LoadingOrbitProps {
  variant?: LoadingOrbitVariant;
}

export function LoadingOrbit({ variant = 'quiet' }: LoadingOrbitProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const dotColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col items-center justify-center gap-4 transition-colors \${cardBg}\`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-12 h-12 animate-spin motion-reduce:animate-none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke={dotColor}
            strokeWidth="2.5"
            strokeDasharray="25 80"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-center">
        <span className="text-xs font-mono font-medium text-neutral-400">Synthesizing System...</span>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { LoadingOrbit, LoadingOrbitVariant } from './index';

export function LoadingOrbitPreview() {
  const [variant, setVariant] = useState<LoadingOrbitVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <LoadingOrbit variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const loadingOrbitFixtures = {};`,
    readmeCode: `# Loading Orbit

Subtle planetary orbital ring spinner indicating background task execution.`,
  },
];
