import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EmptyWorkspace } from '../resources/blocks/empty-workspace/index.js';
import { AIPromptComposer } from '../resources/ai/ai-prompt-composer/index.js';
import { ErrorState } from '../resources/states/error-state/index.js';
import { MagneticButton } from '../resources/motion/magnetic-button/index.js';
import { MarketingNavCta } from '../resources/shells/marketing-nav-cta/index.js';
import { PricingThreeTier } from '../resources/sections/pricing-three-tier/index.js';
import { BreadcrumbHeader } from '../resources/shells/breadcrumb-header/index.js';
import { FloatingNav } from '../resources/shells/floating-nav/index.js';
import { TransparentSolidNav } from '../resources/shells/transparent-solid-nav/index.js';

const noActionExamples = [
  ['AI prompt execution', createElement(AIPromptComposer), 'Connect a provider action'],
  ['marketing CTA', createElement(MarketingNavCta), 'Connect a start action'],
  ['pricing actions', createElement(PricingThreeTier), 'Connect a plan selection action'],
  ['empty workspace action', createElement(EmptyWorkspace), 'Connect a project creation action'],
  ['magnetic button action', createElement(MagneticButton), 'Connect an action'],
  ['error retry action', createElement(ErrorState), 'Retry is unavailable'],
  ['breadcrumb export and save actions', createElement(BreadcrumbHeader), 'Connect an export action'],
  ['floating navigation action', createElement(FloatingNav), 'Connect an open action'],
  ['documentation navigation action', createElement(TransparentSolidNav), 'Connect a documentation action'],
] as const;

describe('Gold resource host-action contracts', () => {
  it.each(noActionExamples)('%s is disabled with an accessible explanation when no handler is wired', (_name, element, explanation) => {
    const html = renderToStaticMarkup(element);
    expect(html).toContain('disabled=""');
    expect(html).toContain(explanation);
    expect(html).toContain('aria-describedby=');
  });

  it('enables actions only when the host supplies a handler', () => {
    const handler = () => undefined;
    for (const element of [
      createElement(AIPromptComposer, { onExecute: () => undefined }),
      createElement(MarketingNavCta, { onCtaClick: handler }),
      createElement(PricingThreeTier, { onSelectPlan: handler }),
      createElement(EmptyWorkspace, { onCreateProject: handler }),
      createElement(MagneticButton, { onAction: handler }),
      createElement(ErrorState, { onRetry: handler }),
      createElement(BreadcrumbHeader, { onExport: handler, onSave: handler }),
      createElement(FloatingNav, { onOpen: handler }),
      createElement(TransparentSolidNav, { onDocsClick: handler }),
    ]) {
      expect(renderToStaticMarkup(element)).not.toContain('disabled=""');
    }
  });
});
