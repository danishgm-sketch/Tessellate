import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BillingOverview } from '../resources/blocks/billing-overview/index.js';
import { RecentItems } from '../resources/blocks/recent-items/index.js';
import { PricingCalculatorShell } from '../resources/sections/pricing-calculator-shell/index.js';
import { PricingComparisonTable } from '../resources/sections/pricing-comparison-table/index.js';
import { PricingThreeTier } from '../resources/sections/pricing-three-tier/index.js';
import { PricingToggle } from '../resources/sections/pricing-toggle/index.js';
import { PricingTwoTier } from '../resources/sections/pricing-two-tier/index.js';
import { PricingUsageBased } from '../resources/sections/pricing-usage-based/index.js';
import { PlanFeatureMatrix } from '../resources/sections/plan-feature-matrix/index.js';
import { FaqAccordion } from '../resources/sections/faq-accordion/index.js';

const commercialExamples = [
  ['three-tier pricing', PricingThreeTier],
  ['pricing comparison table', PricingComparisonTable],
  ['pricing toggle', PricingToggle],
  ['two-tier pricing', PricingTwoTier],
  ['usage-based pricing', PricingUsageBased],
  ['pricing calculator', PricingCalculatorShell],
  ['plan feature matrix', PlanFeatureMatrix],
] as const;

describe('commercial resource examples do not assert Tessellate terms', () => {
  it.each(commercialExamples)('%s identifies its prices and plan details as examples', (_name, Component) => {
    const html = renderToStaticMarkup(createElement(Component));
    expect(html).toMatch(/example|illustrative/i);
    expect(html).not.toMatch(/Tessellate|Free Core|Team Sync|all 324|dedicated SLA|private registry|cancel anytime|Organization Pro|Team Pro Plan|Role-Based Access Control|Real-time Project Checkpoints/i);
  });

  it('leaves plan actions visibly unavailable until a selection handler exists', () => {
    const twoTier = renderToStaticMarkup(createElement(PricingTwoTier));
    const toggle = renderToStaticMarkup(createElement(PricingToggle));
    expect(twoTier).toMatch(/disabled[^>]*>Connect plan action/i);
    expect(twoTier).toMatch(/Connect a selection action to enable this example button/i);
    expect(toggle).toMatch(/disabled[^>]*>Connect plan action/i);
    expect(toggle).toMatch(/Connect a plan-selection action to enable this example button/i);
  });

  it('FAQ accordion uses example wording instead of product-specific claims', () => {
    const html = renderToStaticMarkup(createElement(FaqAccordion));
    expect(html).toMatch(/Example questions and answers/i);
    expect(html).not.toMatch(/Tessellate|100% free and open core|all 324 canonical launch resources|official MCP server bindings/i);
  });
});

describe('dashboard resources identify their static sample data', () => {
  it('billing overview does not imply a real active subscription or payment action', () => {
    const html = renderToStaticMarkup(createElement(BillingOverview));
    expect(html).toMatch(/Sample account details and pricing/i);
    expect(html).toMatch(/EXAMPLE/);
    expect(html).not.toMatch(/ACTIVE|Renews on Nov 1, 2026/i);
    expect(html).toMatch(/disabled[^>]*>Connect payment action/i);
    expect(html).toMatch(/Payment updates are not connected in this example/i);
  });

  it('recent items use neutral sample content and do not look clickable without navigation', () => {
    const html = renderToStaticMarkup(createElement(RecentItems));
    expect(html).toMatch(/Example activity and timestamps/i);
    expect(html).not.toMatch(/Trading|Portfolio|Order Book|Financial Terminal/i);
    expect(html).not.toMatch(/cursor-pointer|hover:bg-neutral-50/);
    expect(html).not.toMatch(/<button|<a\b/i);
  });
});
