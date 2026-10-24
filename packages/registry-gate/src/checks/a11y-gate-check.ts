import type { GateCheckResult } from '../types.js';

export function checkAccessibilityGate(code: string): GateCheckResult {
  const issues: string[] = [];

  // 1. Icon-only buttons without accessible labels
  const buttonTags = code.match(/<button[^>]*>[\s\S]*?<\/button>/g) || [];
  for (const btn of buttonTags) {
    const hasAriaLabel = /aria-label\s*=|aria-labelledby\s*=/i.test(btn);
    const hasVisibleText = />[^<{\s]+</.test(btn);
    const hasChildText = /<span>|<div>|<p>/.test(btn);
    const hasDynamicChildren = /\{[^{}]*(?:children|title|label|text|icon)[^{}]*\}/.test(btn);
    if (!hasAriaLabel && !hasVisibleText && !hasChildText && !hasDynamicChildren) {
      issues.push('Icon-only <button> missing aria-label or accessible text name');
    }
  }

  // 2. Images missing alt attribute
  const imgTags = code.match(/<img[^>]*>/g) || [];
  for (const img of imgTags) {
    if (!/\balt\s*=/i.test(img)) {
      issues.push('<img> element missing required alt attribute');
    }
  }

  // 3. Clickable divs without role and tabIndex
  const clickableDivs = code.match(/<div[^>]*onClick[\s\S]*?>/g) || [];
  for (const div of clickableDivs) {
    const hasRole = /role\s*=\s*["']button["']/i.test(div);
    const hasTabIndex = /tabIndex\s*=/i.test(div);
    if (!hasRole || !hasTabIndex) {
      issues.push('Non-interactive <div> with onClick missing role="button" and tabIndex={0}');
    }
  }

  // 4. Focus states on interactive buttons
  if (buttonTags.length > 0 && !code.includes('focus') && !code.includes('focus-visible')) {
    issues.push('Interactive button elements missing explicit focus-visible states');
  }

  if (issues.length > 0) {
    return {
      id: 'accessibility-audit',
      name: 'WCAG 2.2 AA / AAA Accessibility Floor',
      category: 'accessibility',
      status: 'fail',
      score: Math.max(0, 100 - issues.length * 20),
      details: `Accessibility audit identified ${issues.length} issue(s): ${issues.slice(0, 2).join('; ')}.`,
      remediation:
        'Ensure all buttons have accessible names (aria-label), images have alt tags, and keyboard focus outlines are visible.',
    };
  }

  return {
    id: 'accessibility-audit',
    name: 'WCAG 2.2 AA / AAA Accessibility Floor',
    category: 'accessibility',
    status: 'pass',
    score: 100,
    details:
      'Static accessibility checks found no listed markup issues; this does not replace runtime Axe, screen-reader, or keyboard testing.',
  };
}
