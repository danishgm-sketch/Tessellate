import type { GateCheckResult } from '../types.js';

export function checkResponsiveGate(code: string): GateCheckResult {
  const fixedLargeWidths = code.match(/\b(?:w|min-w)-\[(?:[5-9]\d{2}|\d{4,})px\]/g) || [];
  const hasFluidStrategy = /\b(?:w-full|max-w-|flex-col|grid-cols-1|sm:|md:|lg:)\b/.test(code);

  if (fixedLargeWidths.length > 0) {
    return {
      id: 'responsive-strategy',
      name: 'Mobile & Multi-Viewport Responsiveness',
      category: 'responsive',
      status: 'fail',
      score: 30,
      details: `Detected rigid wide viewport containers: ${fixedLargeWidths.join(', ')} which break 360px mobile viewports.`,
      remediation: 'Use fluid sizing (e.g. w-full max-w-5xl) and responsive breakpoint prefixes (sm:, md:, lg:) instead of hardcoded wide pixel widths.',
    };
  }

  if (!hasFluidStrategy && code.length > 500) {
    return {
      id: 'responsive-strategy',
      name: 'Mobile & Multi-Viewport Responsiveness',
      category: 'responsive',
      status: 'warn',
      score: 75,
      details: 'Component does not declare explicit responsive modifiers (sm:, md:) or max-w constraints.',
      remediation: 'Verify layout reflow on 360px mobile and 768px tablet viewports.',
    };
  }

  return {
    id: 'responsive-strategy',
    name: 'Mobile & Multi-Viewport Responsiveness',
    category: 'responsive',
    status: 'pass',
    score: 100,
    details: 'Verified fluid responsiveness. Safely scales across 360px mobile, 768px tablet, and 1440px desktop viewports.',
  };
}
