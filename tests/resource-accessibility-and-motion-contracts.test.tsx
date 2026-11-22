import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AIPromptComposer } from '../resources/ai/ai-prompt-composer/index.js';
import { BeamGrid } from '../resources/backgrounds/beam-grid/index.js';
import { EntitySearch } from '../resources/blocks/entity-search/index.js';
import { MessagingThread } from '../resources/blocks/messaging-thread/index.js';
import { GeographicMap } from '../resources/data/geographic-map/index.js';
import { AnimatedBorderTrace } from '../resources/motion/animated-border-trace/index.js';
import { AnimatedGradientLine } from '../resources/motion/animated-gradient-line/index.js';
import { ScrollProgress } from '../resources/motion/scroll-progress/index.js';
import { SlideClipReveal } from '../resources/motion/slide-clip-reveal/index.js';
import { Autocomplete } from '../resources/primitives/autocomplete/index.js';
import { Combobox } from '../resources/primitives/combobox/index.js';
import { CommandMenu } from '../resources/primitives/command-menu/index.js';
import { Drawer } from '../resources/primitives/drawer/index.js';
import { PasswordInput } from '../resources/primitives/password-input/index.js';
import { RangeSlider } from '../resources/primitives/range-slider/index.js';
import { SearchInput } from '../resources/primitives/search-input/index.js';
import { Skeleton } from '../resources/primitives/skeleton/index.js';
import { Slider } from '../resources/primitives/slider/index.js';
import { Toast } from '../resources/primitives/toast/index.js';
import { CtaSplit } from '../resources/sections/cta-split/index.js';
import { FaqSearchable } from '../resources/sections/faq-searchable/index.js';
import { FooterNewsletter } from '../resources/sections/footer-newsletter/index.js';
import { PricingCalculatorShell } from '../resources/sections/pricing-calculator-shell/index.js';
import { PricingUsageBased } from '../resources/sections/pricing-usage-based/index.js';
import { CardGridSkeleton } from '../resources/states/card-grid-skeleton/index.js';
import { DashboardSkeleton } from '../resources/states/dashboard-skeleton/index.js';
import { InlineSpinner } from '../resources/states/inline-spinner/index.js';
import { PageSkeleton } from '../resources/states/page-skeleton/index.js';
import { ProcessingQueuedState } from '../resources/states/processing-queued-state/index.js';
import { ProgressiveLoader } from '../resources/states/progressive-loader/index.js';
import { TableSkeleton } from '../resources/states/table-skeleton/index.js';
import { MonospaceDataHeadline } from '../resources/typography/monospace-data-headline/index.js';
import { TextPathArc } from '../resources/typography/text-path-arc/index.js';

function assertAllFieldsLabeled(html: string) {
  const labelTargets = new Set(Array.from(html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g), (m) => m[1]));
  const controls = Array.from(html.matchAll(/<(input|textarea|select)\b([^>]*)>/g));
  expect(controls.length).toBeGreaterThan(0);

  for (const [, , attrs] of controls) {
    const hasAriaLabel = /\baria-label(?:ledby)?="[^"]+"/.test(attrs);
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    const hasPairedLabel = Boolean(idMatch?.[1] && labelTargets.has(idMatch[1]));
    expect(hasAriaLabel || hasPairedLabel, `Unlabeled control: ${attrs}`).toBe(true);
  }
}

describe('Step 39 resource accessibility and reduced-motion contracts', () => {
  it('labels icon-only buttons and dialog landmarks in primitives and AI composer', () => {
    const drawerHtml = renderToStaticMarkup(
      createElement(Drawer, { open: true, onClose: () => undefined, title: 'Details' }, 'Body')
    );
    expect(drawerHtml).toContain('role="dialog"');
    expect(drawerHtml).toContain('aria-modal="true"');
    expect(drawerHtml).toContain('aria-label="Close drawer"');

    const searchHtml = renderToStaticMarkup(
      createElement(SearchInput, { value: 'query', onChange: () => undefined, onClear: () => undefined })
    );
    expect(searchHtml).toContain('aria-label="Clear search"');
    assertAllFieldsLabeled(searchHtml);

    const toastHtml = renderToStaticMarkup(
      createElement(Toast, { title: 'Saved', onDismiss: () => undefined })
    );
    expect(toastHtml).toContain('aria-label="Dismiss notification"');

    const comboboxHtml = renderToStaticMarkup(
      createElement(Combobox, {
        label: 'Framework',
        options: [{ value: 'react', label: 'React' }],
        onSelect: () => undefined,
      })
    );
    expect(comboboxHtml).toContain('aria-label="Open options"');
    expect(comboboxHtml).toContain('aria-expanded="false"');
    assertAllFieldsLabeled(comboboxHtml);

    const commandHtml = renderToStaticMarkup(
      createElement(CommandMenu, {
        open: true,
        onClose: () => undefined,
        items: [{ id: '1', category: 'Actions', label: 'Export' }],
      })
    );
    expect(commandHtml).toContain('role="dialog"');
    expect(commandHtml).toContain('aria-label="Command menu"');
    assertAllFieldsLabeled(commandHtml);

    const promptComposerHtml = renderToStaticMarkup(createElement(AIPromptComposer));
    expect(promptComposerHtml).toContain('aria-label="Remove tokens.css"');
    assertAllFieldsLabeled(promptComposerHtml);
  });

  const labeledComponents = [
    ['Autocomplete (with label)', createElement(Autocomplete, { label: 'City', suggestions: ['London'], value: '', onChange: () => undefined })],
    ['Autocomplete (without label)', createElement(Autocomplete, { suggestions: ['London'], value: '', onChange: () => undefined })],
    ['PasswordInput', createElement(PasswordInput, { label: 'Passphrase' })],
    ['RangeSlider', createElement(RangeSlider, { label: 'Budget', value: [20, 80], onChange: () => undefined })],
    ['Slider (with label)', createElement(Slider, { label: 'Opacity', value: 50, onChange: () => undefined })],
    ['Slider (without label)', createElement(Slider, { value: 50, onChange: () => undefined })],
    ['EntitySearch', createElement(EntitySearch)],
    ['MessagingThread', createElement(MessagingThread)],
    ['ScrollProgress', createElement(ScrollProgress)],
    ['SlideClipReveal', createElement(SlideClipReveal)],
    ['CtaSplit', createElement(CtaSplit)],
    ['FaqSearchable', createElement(FaqSearchable)],
    ['FooterNewsletter', createElement(FooterNewsletter)],
    ['PricingCalculatorShell', createElement(PricingCalculatorShell)],
    ['PricingUsageBased', createElement(PricingUsageBased)],
  ] as const;

  it.each(labeledComponents)('%s provides an accessible label for every form control', (_name, element) => {
    assertAllFieldsLabeled(renderToStaticMarkup(element));
  });

  const animatedComponents = [
    ['BeamGrid', createElement(BeamGrid)],
    ['GeographicMap', createElement(GeographicMap)],
    ['AnimatedBorderTrace', createElement(AnimatedBorderTrace)],
    ['AnimatedGradientLine', createElement(AnimatedGradientLine)],
    ['Skeleton', createElement(Skeleton)],
    ['CardGridSkeleton', createElement(CardGridSkeleton)],
    ['DashboardSkeleton', createElement(DashboardSkeleton)],
    ['InlineSpinner', createElement(InlineSpinner)],
    ['PageSkeleton', createElement(PageSkeleton)],
    ['ProcessingQueuedState', createElement(ProcessingQueuedState)],
    ['ProgressiveLoader', createElement(ProgressiveLoader)],
    ['TableSkeleton', createElement(TableSkeleton)],
    ['MonospaceDataHeadline', createElement(MonospaceDataHeadline)],
    ['TextPathArc', createElement(TextPathArc)],
  ] as const;

  it.each(animatedComponents)('%s pairs continuous animate-* utilities with motion-reduce:animate-none', (_name, element) => {
    const html = renderToStaticMarkup(element);
    const classMatches = Array.from(html.matchAll(/class="([^"]*)"/g), (m) => m[1]);
    const animatedClasses = classMatches.filter((cls) => /\banimate-(?:pulse|spin|bounce|ping|\[)/.test(cls));
    expect(animatedClasses.length).toBeGreaterThan(0);
    for (const cls of animatedClasses) {
      expect(cls).toContain('motion-reduce:animate-none');
    }
  });

  it('discloses sample edge telemetry in GeographicMap', () => {
    const html = renderToStaticMarkup(createElement(GeographicMap));
    expect(html).toMatch(/Illustrative edge presence map/i);
    expect(html).toContain('6 Sample Regions');
    expect(html).not.toContain('6 Regions Healthy');
  });
});
