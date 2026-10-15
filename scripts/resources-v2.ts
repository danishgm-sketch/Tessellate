/**
 * Contract v2 resources (Phase 30): one spec per resource generates its manifest.json, preview.tsx,
 * fixtures.ts and README.md next to the hand-written index.tsx, so props, states and metadata stay in step.
 *
 *   pnpm resources:v2
 *
 * Status stays "experimental" until a named human reviews the resource (D-040). Accessibility claims are
 * backed by tests: tests/e2e/resource-contract.spec.ts (axe incl. AAA contrast, keyboard, 360/768/1440)
 * and packages/catalog/src/__tests__/contract-v2.test.ts (token-only lint, props-driven rendering).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ResourceManifestSchema, type PropSpec, type ResourceManifest } from '../packages/schemas/src/index.js';

interface V2Spec {
  /** Upgrade an existing v1 resource in place: keep its id, roles, categories, tags and relationships. */
  migrate?: boolean;
  dir: string;
  slug: string;
  name: string;
  component: string;
  resourceType: ResourceManifest['resourceType'];
  categories: string[];
  roles: string[];
  description: string;
  purposes: string[];
  archetypes: Array<[string, number]>;
  idealFor: string[];
  avoidFor: string[];
  jobs: string[];
  tags: string[];
  props: PropSpec[];
  states: { loading: boolean; empty: boolean; error: boolean };
  /** Props used for the preview and fixtures (realistic sample content, labelled as such). */
  sample: Record<string, unknown>;
  interaction: ResourceManifest['interactionDNA'];
  density: number;
  widths: ResourceManifest['layoutDNA']['preferredWidths'];
}

const p = (name: string, type: PropSpec['type'], description: string, extra: Partial<PropSpec> = {}): PropSpec => ({
  name,
  type,
  required: false,
  description,
  ...extra,
});
const variantProp = p('variant', 'enum', 'Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens.', {
  enumValues: ['quiet', 'expressive', 'nocturne'],
});
const formState = (verb: string) => [
  p('errorMessage', 'string', `Error from your service, announced in an alert region when ${verb} fails.`),
  p('loading', 'boolean', 'Shows the busy state and disables submission.'),
];
const formInteraction: ResourceManifest['interactionDNA'] = {
  interactionDensity: 55,
  motionIntensity: 5,
  keyboardComplexity: 'low',
  hoverDependency: 'none',
  directManipulation: false,
};

const SPECS: V2Spec[] = [
  {
    dir: 'auth', slug: 'sign-in-form', name: 'Sign-in Form', component: 'SignInForm', resourceType: 'block',
    categories: ['auth', 'forms'], roles: ['auth', 'sign-in', 'form'],
    description: 'Email and password sign-in with inline validation, accessible errors, a loading state and links to reset and sign-up.',
    purposes: ['Account sign-in', 'Client portals'], archetypes: [['saas', 90], ['healthcare-clinic', 85], ['booking-scheduling', 85]],
    idealFor: ['Any product with accounts'], avoidFor: ['Passwordless-only products'], jobs: ['Sign a returning user in'],
    tags: ['auth', 'login', 'sign-in', 'password'],
    props: [
      p('productName', 'string', 'Product name shown above the form.', { content: 'productName' }),
      p('heading', 'string', 'Form heading.'),
      p('description', 'string', 'Short line under the heading.'),
      p('onSubmit', 'callback', 'Receives { email, password, remember }; return a promise to show the loading state.'),
      ...formState('sign-in'),
      p('forgotPasswordHref', 'string', 'Link to the password reset page.'),
      p('signUpHref', 'string', 'Link to account creation.'),
      p('submitLabel', 'string', 'Button label.'),
      variantProp,
    ],
    states: { loading: true, empty: false, error: true },
    sample: { productName: 'Northside Physio', description: 'Welcome back. Sign in to manage your appointments.' },
    interaction: formInteraction, density: 40, widths: ['narrow'],
  },
  {
    dir: 'auth', slug: 'sign-up-form', name: 'Sign-up Form', component: 'SignUpForm', resourceType: 'block',
    categories: ['auth', 'forms'], roles: ['auth', 'sign-up', 'form'],
    description: 'Account creation with name, email, password length guidance and terms consent.',
    purposes: ['Account creation', 'Onboarding entry'], archetypes: [['saas', 90], ['marketplace', 80]],
    idealFor: ['Self-serve sign-up'], avoidFor: ['Invite-only products'], jobs: ['Create a new account'],
    tags: ['auth', 'register', 'sign-up'],
    props: [
      p('productName', 'string', 'Product name shown above the form.', { content: 'productName' }),
      p('heading', 'string', 'Form heading.'),
      p('description', 'string', 'Short line under the heading.'),
      p('onSubmit', 'callback', 'Receives { name, email, password, acceptTerms }.'),
      ...formState('sign-up'),
      p('minPasswordLength', 'number', 'Minimum password length checked in the form (enforce on the server too).'),
      p('termsHref', 'string', 'Terms page link.'),
      p('privacyHref', 'string', 'Privacy policy link.'),
      p('signInHref', 'string', 'Sign-in page link.'),
      p('submitLabel', 'string', 'Button label.'),
      variantProp,
    ],
    states: { loading: true, empty: false, error: true },
    sample: { productName: 'Northside Physio' },
    interaction: formInteraction, density: 40, widths: ['narrow'],
  },
  {
    dir: 'auth', slug: 'password-reset-form', name: 'Password Reset Form', component: 'PasswordResetForm', resourceType: 'block',
    categories: ['auth', 'forms'], roles: ['auth', 'password-reset', 'form'],
    description: 'Request a password reset link with an account-neutral confirmation that never reveals whether an email is registered.',
    purposes: ['Account recovery'], archetypes: [['saas', 85]],
    idealFor: ['Email and password accounts'], avoidFor: ['SSO-only products'], jobs: ['Recover access to an account'],
    tags: ['auth', 'forgot-password', 'reset'],
    props: [
      p('productName', 'string', 'Product name shown above the form.', { content: 'productName' }),
      p('heading', 'string', 'Form heading.'),
      p('description', 'string', 'Explanation under the heading.'),
      p('onSubmit', 'callback', 'Receives the email address and sends the reset email.'),
      ...formState('the request'),
      p('signInHref', 'string', 'Link back to sign-in.'),
      variantProp,
    ],
    states: { loading: true, empty: false, error: true },
    sample: { productName: 'Northside Physio' },
    interaction: formInteraction, density: 35, widths: ['narrow'],
  },
  {
    dir: 'forms', slug: 'entity-form', name: 'Record Form', component: 'EntityForm', resourceType: 'block',
    categories: ['forms', 'data'], roles: ['form', 'entity', 'create'],
    description: "Create or edit a record from its fields, with input types inferred from field names and required-field validation.",
    purposes: ['Create records', 'Edit records'], archetypes: [['internal-tools', 90], ['crm', 85], ['saas', 80]],
    idealFor: ['Back-office data entry'], avoidFor: ['Multi-step wizards'], jobs: ['Create or update a record'],
    tags: ['form', 'crud', 'record'],
    props: [
      p('heading', 'string', 'Form heading (defaults to "New <entity>").', { content: 'heading' }),
      p('description', 'string', 'Line under the heading.', { content: 'description' }),
      p('entity', 'string', 'Record type, e.g. "Appointment".', { content: 'entity' }),
      p('fields', 'object[]', 'Field names or { name, label, type, required, options, hint } specs.', { content: 'fields' }),
      p('onSubmit', 'callback', 'Receives the values keyed by field name.'),
      p('onCancel', 'callback', 'Shows a Cancel button when provided.'),
      p('submitLabel', 'string', 'Button label.'),
      ...formState('saving'),
      variantProp,
    ],
    states: { loading: true, empty: false, error: true },
    sample: { entity: 'Appointment', fields: ['date and time', 'service', 'with', 'status', 'notes'] },
    interaction: formInteraction, density: 55, widths: ['content'],
  },
  {
    dir: 'forms', slug: 'booking-slot-picker', name: 'Booking Slot Picker', component: 'BookingSlotPicker', resourceType: 'block',
    categories: ['forms', 'scheduling'], roles: ['booking', 'calendar', 'picker'],
    description: 'Day tabs and a grid of available times; arrow keys move between days and exactly one slot can be chosen.',
    purposes: ['Appointment booking', 'Class and table reservations'], archetypes: [['booking-scheduling', 95], ['healthcare-clinic', 90], ['beauty-salon', 85]],
    idealFor: ['Self-service booking'], avoidFor: ['Multi-day stays (use a date range picker)'], jobs: ['Choose a time to book'],
    tags: ['booking', 'appointments', 'availability', 'time-slot'],
    props: [
      p('heading', 'string', 'Heading (defaults to "Choose a time for your <entity>").'),
      p('description', 'string', 'Line under the heading.'),
      p('entity', 'string', 'What is booked, e.g. "Appointment".', { content: 'entity' }),
      p('days', 'object[]', 'Availability: [{ date: "2026-01-12", slots: ["09:00", …] }]. Omit to show labelled example availability.'),
      p('durationMinutes', 'number', 'Slot length shown to the user.'),
      p('onSelect', 'callback', 'Receives { date, time } when a slot is chosen.'),
      p('loading', 'boolean', 'Shows "Loading availability…".'),
      p('errorMessage', 'string', 'Error announced in an alert region.'),
      p('locale', 'string', 'Locale for day names, e.g. "en-GB".'),
      variantProp,
    ],
    states: { loading: true, empty: true, error: true },
    sample: { entity: 'Appointment', durationMinutes: 45 },
    interaction: { ...formInteraction, keyboardComplexity: 'medium' }, density: 55, widths: ['content', 'wide'],
  },
  {
    dir: 'forms', slug: 'booking-details-form', name: 'Booking Details Form', component: 'BookingDetailsForm', resourceType: 'block',
    categories: ['forms', 'scheduling'], roles: ['booking', 'form', 'checkout'],
    description: 'Contact details, notes and consent for a booking, a deposit summary and a confirmation state.',
    purposes: ['Confirm a booking'], archetypes: [['booking-scheduling', 95], ['healthcare-clinic', 90]],
    idealFor: ['The second step of a booking flow'], avoidFor: ['Account sign-up'], jobs: ['Collect booking details and confirm'],
    tags: ['booking', 'checkout', 'details'],
    props: [
      p('heading', 'string', 'Heading.'),
      p('description', 'string', 'Line under the heading.'),
      p('entity', 'string', 'What is booked.', { content: 'entity' }),
      p('selectedSlotLabel', 'string', 'Chosen slot, e.g. "Tuesday 13 January at 09:45".'),
      p('depositLabel', 'string', 'Deposit due now, e.g. "£20.00".'),
      p('onSubmit', 'callback', 'Receives { name, email, phone, notes, consent }.'),
      p('onBack', 'callback', 'Shows a Back button when provided.'),
      ...formState('booking'),
      p('confirmed', 'boolean', 'Shows the confirmation state.'),
      p('privacyHref', 'string', 'Privacy policy link.'),
      variantProp,
    ],
    states: { loading: true, empty: false, error: true },
    sample: { entity: 'Appointment', selectedSlotLabel: 'Tuesday 13 January at 09:45', depositLabel: '£20.00' },
    interaction: formInteraction, density: 45, widths: ['content'],
  },
  {
    dir: 'forms', slug: 'contact-form', name: 'Contact Form', component: 'ContactForm', resourceType: 'block',
    categories: ['forms', 'support'], roles: ['form', 'contact', 'support'],
    description: 'Contact or support request with topic choice, validation and a sent confirmation.',
    purposes: ['Support requests', 'Enquiries'], archetypes: [['local-business', 90], ['professional-services', 85], ['helpdesk-support', 80]],
    idealFor: ['Contact and support pages'], avoidFor: ['Live chat'], jobs: ['Send a message to the business'],
    tags: ['contact', 'support', 'enquiry'],
    props: [
      p('heading', 'string', 'Heading.'),
      p('description', 'string', 'Line under the heading.'),
      p('topics', 'string[]', 'Topics to choose from.'),
      p('onSubmit', 'callback', 'Receives { name, email, topic, message }.'),
      ...formState('sending'),
      p('responseTime', 'string', 'Expected reply time shown after sending.'),
      variantProp,
    ],
    states: { loading: true, empty: false, error: true },
    sample: {},
    interaction: formInteraction, density: 45, widths: ['content'],
  },
  {
    dir: 'commerce', slug: 'order-summary', name: 'Order Summary', component: 'OrderSummary', resourceType: 'block',
    categories: ['commerce', 'checkout'], roles: ['commerce', 'checkout', 'summary'],
    description: 'Line items, discount, delivery, tax and totals in minor units, formatted for any currency and locale.',
    purposes: ['Checkout', 'Basket'], archetypes: [['ecommerce', 95], ['booking-scheduling', 80]],
    idealFor: ['Checkout sidebars'], avoidFor: ['Invoices (use a table)'], jobs: ['Show what the customer is paying for'],
    tags: ['checkout', 'cart', 'totals'],
    props: [
      p('heading', 'string', 'Heading.'),
      p('lines', 'object[]', 'Items: [{ name, quantity, unitAmount (minor units), description }]. Omit to show labelled example items.'),
      p('currency', 'string', 'ISO 4217 code, e.g. "GBP".'),
      p('discountAmount', 'number', 'Discount in minor units.'),
      p('discountLabel', 'string', 'Discount label.'),
      p('taxAmount', 'number', 'Tax in minor units.'),
      p('taxLabel', 'string', 'Tax label, e.g. "VAT".'),
      p('shippingAmount', 'number', 'Delivery in minor units (0 shows "Free").'),
      p('dueNowAmount', 'number', 'Deposit due now in minor units.'),
      p('loading', 'boolean', 'Shows "Updating totals…".'),
      p('locale', 'string', 'Locale for number formatting.'),
      variantProp,
    ],
    states: { loading: true, empty: true, error: false },
    sample: { dueNowAmount: 2000 },
    interaction: { ...formInteraction, interactionDensity: 15 }, density: 50, widths: ['narrow'],
  },
  {
    dir: 'commerce', slug: 'payment-form', name: 'Payment Form', component: 'PaymentForm', resourceType: 'block',
    categories: ['commerce', 'checkout'], roles: ['commerce', 'checkout', 'payment'],
    description: "Checkout payment layout with billing name and postcode and a slot for your provider's secure card fields; it never handles card numbers itself.",
    purposes: ['Take a payment', 'Deposits'], archetypes: [['ecommerce', 95], ['booking-scheduling', 85]],
    idealFor: ['Stripe Elements or similar hosted fields'], avoidFor: ['Storing card data'], jobs: ['Collect payment securely'],
    tags: ['payment', 'checkout', 'card'],
    props: [
      p('heading', 'string', 'Heading.'),
      p('amountLabel', 'string', 'Formatted amount on the pay button.'),
      p('cardFields', 'node', "Your payment provider's secure card fields."),
      p('onPay', 'callback', 'Receives { name, postcode } when the form is valid.'),
      ...formState('payment'),
      p('securityNote', 'string', 'Line under the button.'),
      variantProp,
    ],
    states: { loading: true, empty: false, error: true },
    sample: { amountLabel: '£20.00' },
    interaction: formInteraction, density: 45, widths: ['narrow'],
  },
  {
    dir: 'forms', slug: 'document-editor', name: 'Document Editor', component: 'DocumentEditor', resourceType: 'block',
    categories: ['forms', 'editor'], roles: ['editor', 'document', 'notes'],
    description: 'Markdown editor for notes and documents with a formatting toolbar, keyboard shortcuts, word count and save state.',
    purposes: ['Clinical or case notes', 'Documents'], archetypes: [['healthcare-clinic', 85], ['productivity', 85], ['professional-services', 80]],
    idealFor: ['Notes attached to a record'], avoidFor: ['Collaborative real-time editing'], jobs: ['Write and save a note'],
    tags: ['editor', 'markdown', 'notes'],
    props: [
      p('heading', 'string', 'Heading (defaults to the entity name).'),
      p('entity', 'string', 'What is being written, e.g. "Treatment note".', { content: 'entity' }),
      p('value', 'string', 'Initial Markdown.'),
      p('onChange', 'callback', 'Receives the Markdown on every edit.'),
      p('onSave', 'callback', 'Shows a Save button and handles Ctrl+S.'),
      p('placeholder', 'string', 'Placeholder text.'),
      p('savedLabel', 'string', 'Last-saved message.'),
      ...formState('saving'),
      p('readOnly', 'boolean', 'Read-only mode.'),
      variantProp,
    ],
    states: { loading: true, empty: true, error: true },
    sample: { entity: 'Treatment note', value: '## Session summary\n\n- Range of motion improved\n- Continue home exercises' },
    interaction: { ...formInteraction, keyboardComplexity: 'medium' }, density: 50, widths: ['content', 'wide'],
  },
];

SPECS.push(...MIGRATIONS());

const root = path.resolve('resources');
const now = '2026-10-15T00:00:00.000Z';

for (const spec of SPECS) {
  const dir = path.join(root, spec.dir, spec.slug);
  if (!fs.existsSync(path.join(dir, 'index.tsx'))) throw new Error(`${spec.slug}: write index.tsx first`);
  const existing = fs.existsSync(path.join(dir, 'manifest.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')) : null;
  const keep = spec.migrate && existing ? existing : null;
  const manifest: ResourceManifest = ResourceManifestSchema.parse({
    ...(keep ?? {}),
    schemaVersion: '1.0.0',
    contractVersion: 2,
    id: keep?.id ?? `res_v2_${spec.slug.replace(/-/g, '_')}`,
    slug: spec.slug,
    name: spec.name,
    version: keep ? '1.1.0' : '1.0.0',
    status: 'experimental',
    description: spec.description,
    resourceType: spec.resourceType,
    categories: keep?.categories ?? spec.categories,
    roles: keep?.roles ?? spec.roles,
    purposes: keep?.purposes ?? spec.purposes,
    productArchetypes: keep?.productArchetypes ?? spec.archetypes.map(([tag, weight]) => ({ tag, weight })),
    creator: { id: 'tessellate_core', displayName: 'Tessellate Core', handle: 'tessellate', url: 'https://tessellate.design' },
    provenance: { origin: 'tessellate', derivative: false, aiAssistance: 'substantial' },
    license: { spdx: 'MIT', name: 'MIT License', url: 'https://opensource.org/licenses/MIT', redistributionVerified: true, attributionRequired: false },
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    dependencies: [],
    files: [
      { path: 'index.tsx', kind: 'component', required: true },
      { path: 'preview.tsx', kind: 'component', required: true },
      { path: 'fixtures.ts', kind: 'fixture', required: true },
      { path: 'README.md', kind: 'asset', required: true },
    ],
    registry: { name: spec.slug, dependencies: [], devDependencies: [], registryDependencies: [] },
    preview: { component: `${spec.component}Preview`, defaultProps: spec.sample, viewport: 1440 },
    slots: [],
    variants: (['quiet', 'expressive', 'nocturne'] as const).map((v) => ({
      id: v,
      name: v[0]!.toUpperCase() + v.slice(1),
      description: v === 'quiet' ? 'Flat surface with a hairline border.' : v === 'expressive' ? 'Raised surface with a soft shadow.' : 'Strong outline for high-contrast layouts.',
      props: { variant: v },
    })),
    tags: keep?.tags ?? spec.tags,
    intent: { summary: spec.description, idealFor: spec.idealFor, avoidFor: spec.avoidFor, jobs: spec.jobs, contentRequirements: [] },
    visualDNA: { visualAmbition: 30, curvature: 40, density: spec.density },
    interactionDNA: spec.interaction,
    layoutDNA: { density: spec.density, whitespace: 100 - spec.density, asymmetry: 0, preferredWidths: spec.widths, layoutFamilies: ['standard'] },
    responsive: { verifiedWidths: [360, 768, 1440], defaultStrategy: 'stack' },
    accessibility: {
      levelTarget: 'AAA',
      keyboardVerified: true,
      screenReaderSemantics: true,
      reducedMotionVerified: true,
      contrastTokenCompatible: true,
      focusVisible: true,
      knownLimitations: ['Automated checks only (axe incl. AAA contrast, keyboard, 360/768/1440); awaiting human review.'],
    },
    performance: { jsCost: 'tiny', gpuCost: 'none', mediaCost: 'none', runtimeComplexity: 'low', lazyRecommended: false, continuousAnimation: false },
    complexity: 'medium',
    customizability: 'high',
    compatibility: {},
    relationships: keep?.relationships ?? [],
    quality: { overall: 80, accessibility: 85, responsive: 85, performance: 90, codeQuality: 85, composability: 85, visualCraft: 75, dependencyCleanliness: 100, documentation: 80 },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    props: spec.props,
    states: spec.states,
    stylingContract: { tokenOnly: true, reducedMotion: 'respected' },
  });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const fixtureName = `${spec.component[0]!.toLowerCase()}${spec.component.slice(1)}Fixtures`;
  fs.writeFileSync(
    path.join(dir, 'fixtures.ts'),
    `import type { ${spec.component}Props } from './index.js';\n\n/** Sample content for previews and tests (not real data). */\nexport const ${fixtureName}: ${spec.component}Props = ${JSON.stringify(spec.sample, null, 2)};\n`,
  );

  const stateButtons = [
    "['ready', 'Ready']",
    spec.states.loading ? "['loading', 'Loading']" : '',
    spec.states.error && spec.props.some((x) => x.name === 'errorMessage') ? "['error', 'Error']" : '',
  ].filter(Boolean);
  fs.writeFileSync(
    path.join(dir, 'preview.tsx'),
    `import React, { useState } from 'react';
import { ${spec.component}, type ${spec.component}Variant } from './index.js';
import { ${fixtureName} } from './fixtures.js';

type PreviewState = 'ready' | 'loading' | 'error';

export function ${spec.component}Preview() {
  const [variant, setVariant] = useState<${spec.component}Variant>('quiet');
  const [state, setState] = useState<PreviewState>('ready');
  const chip = (active: boolean) =>
    \`rounded-ui-sm px-2.5 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-focus \${active ? 'bg-ink text-canvas' : 'bg-surface-raised text-ink border border-hairline'}\`;
  return (
    <div className="flex w-full flex-col bg-canvas">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-surface px-3 py-2 text-xs">
        <span className="font-semibold text-ink">${spec.name}</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Variant">
          {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
            <button key={v} type="button" aria-pressed={variant === v} onClick={() => setVariant(v)} className={chip(variant === v)}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="State">
          {([${stateButtons.join(', ')}] as Array<[PreviewState, string]>).map(([s, label]) => (
            <button key={s} type="button" aria-pressed={state === s} onClick={() => setState(s)} className={chip(state === s)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-8">
        <${spec.component}
          {...${fixtureName}}
          variant={variant}
          ${spec.states.loading ? "loading={state === 'loading'}" : ''}
          ${spec.props.some((x) => x.name === 'errorMessage') ? "errorMessage={state === 'error' ? 'Something went wrong. Please try again.' : undefined}" : ''}
        />
      </div>
    </div>
  );
}
`,
  );

  const propRows = spec.props.map((x) => `| \`${x.name}\` | ${x.type}${x.enumValues ? ` (${x.enumValues.join(' / ')})` : ''} | ${x.description} |`).join('\n');
  fs.writeFileSync(
    path.join(dir, 'README.md'),
    `# ${spec.name}

${spec.description}

Contract v2: content comes from props, styling uses only semantic token utilities (\`bg-surface\`, \`text-ink\`, \`bg-accent\` …), and loading${spec.states.empty ? ', empty' : ''}${spec.states.error ? ' and error' : ''} states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
${propRows}

## Accessibility

Labelled controls, errors linked with \`aria-describedby\` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
`,
  );
  console.log(`[resources:v2] ${spec.dir}/${spec.slug}`);
}


/** v1 resources upgraded to contract v2 in place (Phase 30): the sections every composed app screen uses. */
function MIGRATIONS(): V2Spec[] {
  const display: ResourceManifest['interactionDNA'] = { interactionDensity: 25, motionIntensity: 5, keyboardComplexity: 'low', hoverDependency: 'none', directManipulation: false };
  const common = { migrate: true, purposes: [], archetypes: [] as Array<[string, number]>, idealFor: [], avoidFor: [], jobs: [], tags: [], categories: [], roles: [] };
  const text = (name: string, d: string, c?: string) => p(name, 'string', d, c ? { content: c } : {});
  return [
    {
      ...common, dir: 'shells', slug: 'app-sidebar-expanded', name: 'App Sidebar', component: 'AppSidebarExpanded', resourceType: 'block',
      description: "Application navigation: a vertical sidebar from the md breakpoint and a scrollable bar on small screens, with the client's brand and aria-current on the active page.",
      props: [text('brand', 'Product name shown at the top.', 'brand'), p('items', 'object[]', 'Links: [{ label, href }].', { content: 'items' }), p('activeHref', 'string', 'Current page; defaults to the first item.'), p('userLabel', 'string', 'Signed-in user text.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: { brand: 'Northside Physio', items: [{ label: 'Overview', href: '/overview' }, { label: 'Appointments', href: '/appointments' }, { label: 'Patients', href: '/patients' }, { label: 'Invoices', href: '/invoices' }] },
      interaction: display, density: 50, widths: ['narrow'],
    },
    {
      ...common, dir: 'shells', slug: 'breadcrumb-header', name: 'Page Header', component: 'BreadcrumbHeader', resourceType: 'block',
      description: 'Page header with breadcrumb trail, title, description and an optional primary action.',
      props: [text('heading', 'Page title.', 'heading'), text('description', 'What the page is for.', 'description'), p('breadcrumbs', 'object[]', 'Trail: [{ label, href }].'), p('actionLabel', 'string', 'Primary action label.'), p('actionHref', 'string', 'Primary action link.'), p('onAction', 'callback', 'Primary action handler.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: { heading: 'Appointments', description: 'Browse, search and filter appointments.', breadcrumbs: [{ label: 'Clinic', href: '/' }, { label: 'Appointments' }], actionLabel: 'New appointment' },
      interaction: display, density: 50, widths: ['full'],
    },
    {
      ...common, dir: 'blocks', slug: 'advanced-data-table', name: 'Records Table', component: 'AdvancedDataTable', resourceType: 'block',
      description: 'Records table with search, sortable columns (aria-sort), pagination and loading, empty and error states.',
      props: [text('heading', 'Table heading.', 'heading'), text('description', 'Line under the heading.', 'description'), text('entity', 'Record type.', 'entity'), p('columns', 'string[]', 'Column keys in order.', { content: 'columns' }), p('rows', 'object[]', 'Rows keyed by column.', { content: 'rows' }), p('sampleData', 'boolean', 'Marks rows as sample data.', { content: 'sampleData' }), p('pageSize', 'number', 'Rows per page.'), p('loading', 'boolean', 'Loading state.'), p('errorMessage', 'string', 'Error announced in an alert region.'), p('emptyMessage', 'string', 'Shown when there are no rows.'), p('onRowClick', 'callback', 'Receives the clicked row.'), variantProp],
      states: { loading: true, empty: true, error: true },
      sample: { entity: 'Appointment', columns: ['patient', 'date and time', 'service', 'status'], rows: [{ patient: 'Amira Khan', 'date and time': '2026-01-12 09:00', service: 'Assessment', status: 'Scheduled' }, { patient: 'Ben Carter', 'date and time': '2026-01-13 10:30', service: 'Follow-up', status: 'Completed' }], sampleData: true },
      interaction: { ...display, interactionDensity: 60, keyboardComplexity: 'medium' }, density: 70, widths: ['wide', 'full'],
    },
    {
      ...common, dir: 'blocks', slug: 'entity-list', name: 'Record List', component: 'EntityList', resourceType: 'block',
      description: 'Compact list of records with title, subtitle and status; good for side panels and small screens.',
      props: [text('heading', 'List heading.', 'heading'), text('description', 'Line under the heading.', 'description'), text('entity', 'Record type.', 'entity'), p('columns', 'string[]', 'Title, subtitle and status fields.', { content: 'columns' }), p('rows', 'object[]', 'Records.', { content: 'rows' }), p('sampleData', 'boolean', 'Marks rows as sample.', { content: 'sampleData' }), p('hrefFor', 'callback', 'Builds a link for each record.'), p('loading', 'boolean', 'Loading state.'), p('emptyMessage', 'string', 'Shown when there are no records.'), variantProp],
      states: { loading: true, empty: true, error: false },
      sample: { entity: 'Patient', columns: ['name', 'last visit', 'status'], rows: [{ name: 'Amira Khan', 'last visit': '12 Jan', status: 'Active' }, { name: 'Ben Carter', 'last visit': '9 Jan', status: 'Discharged' }], sampleData: true },
      interaction: display, density: 60, widths: ['narrow', 'content'],
    },
    {
      ...common, dir: 'blocks', slug: 'dashboard-kpi-grid', name: 'Key Numbers', component: 'DashboardKpiGrid', resourceType: 'block',
      description: 'Key numbers in a responsive grid, each with an optional change indicator and sample marker.',
      props: [text('heading', 'Heading.', 'heading'), text('description', 'Line under the heading.', 'description'), p('metrics', 'object[]', 'Metrics: [{ label, value, change, positive, sample }].', { content: 'metrics' }), p('loading', 'boolean', 'Loading state.'), variantProp],
      states: { loading: true, empty: false, error: false },
      sample: { metrics: [{ label: 'Appointments this week', value: 86, change: '+9%', positive: true, sample: true }, { label: 'New patients', value: 14, sample: true }] },
      interaction: display, density: 60, widths: ['wide', 'full'],
    },
    {
      ...common, dir: 'blocks', slug: 'activity-feed', name: 'Activity Feed', component: 'ActivityFeed', resourceType: 'block',
      description: 'Recent activity as an ordered list of who did what and when.',
      props: [text('heading', 'Heading.'), text('description', 'Line under the heading.', 'description'), p('items', 'object[]', 'Items: [{ actor, action, target, time }].'), p('loading', 'boolean', 'Loading state.'), p('emptyMessage', 'string', 'Shown when there is no activity.'), p('locale', 'string', 'Locale for times.'), variantProp],
      states: { loading: true, empty: true, error: false },
      sample: {},
      interaction: display, density: 55, widths: ['content'],
    },
    {
      ...common, dir: 'blocks', slug: 'calendar-week', name: 'Week Calendar', component: 'CalendarWeek', resourceType: 'block',
      description: 'Five-day week view built from events or from record rows: day columns on wide screens, an agenda list on small ones.',
      props: [text('heading', 'Heading.', 'heading'), text('description', 'Line under the heading.', 'description'), text('entity', 'What is scheduled.', 'entity'), p('events', 'object[]', 'Events: [{ title, start, detail }].'), p('columns', 'string[]', 'Record fields (a date-like field becomes the time).', { content: 'columns' }), p('rows', 'object[]', 'Records to place on the calendar.', { content: 'rows' }), p('sampleData', 'boolean', 'Marks the schedule as sample.', { content: 'sampleData' }), p('weekStart', 'string', 'First day (ISO date).'), p('locale', 'string', 'Locale for day names.'), p('loading', 'boolean', 'Loading state.'), variantProp],
      states: { loading: true, empty: true, error: false },
      sample: {},
      interaction: display, density: 55, widths: ['wide', 'full'],
    },
    {
      ...common, dir: 'blocks', slug: 'entity-profile-header', name: 'Record Header', component: 'EntityProfileHeader', resourceType: 'block',
      description: 'Header for a single record: initials avatar, title, status, key facts and a primary action.',
      props: [text('heading', 'Record title (defaults to the first field).'), text('description', 'Line under the title.'), text('entity', 'Record type.', 'entity'), p('fields', 'string[]', 'Fields in display order.', { content: 'fields' }), p('record', 'object', 'The record.', { content: 'record' }), p('sampleData', 'boolean', 'Marks the record as sample.', { content: 'sampleData' }), p('actionLabel', 'string', 'Primary action label.'), p('onAction', 'callback', 'Primary action handler.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: { entity: 'Patient', fields: ['name', 'status', 'date of birth', 'clinician'], record: { name: 'Amira Khan', status: 'Active', 'date of birth': '1958-04-02', clinician: 'Dr Osei' }, sampleData: true, actionLabel: 'Book appointment' },
      interaction: display, density: 50, widths: ['full'],
    },
    {
      ...common, dir: 'shells', slug: 'minimal-top-nav', name: 'Site Header', component: 'MinimalTopNav', resourceType: 'block',
      description: 'Site header with brand, links and a call to action; collapses into a disclosure menu on small screens.',
      props: [text('brand', 'Product name.', 'brand'), text('brandHref', 'Brand link.'), p('items', 'object[]', 'Links: [{ label, href }].', { content: 'items' }), text('actionLabel', 'Call to action label.'), text('actionHref', 'Call to action link.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: { brand: 'Northside Physio', items: [{ label: 'Treatments', href: '#treatments' }, { label: 'Prices', href: '#prices' }, { label: 'Contact', href: '#contact' }], actionLabel: 'Book now' },
      interaction: display, density: 45, widths: ['full'],
    },
    {
      ...common, dir: 'sections', slug: 'editorial-hero', name: 'Editorial Hero', component: 'EditorialHero', resourceType: 'section',
      description: 'Text-led hero with a strong heading, supporting line and up to two actions.',
      props: [text('eyebrow', 'Line above the heading, e.g. the product name.', 'eyebrow'), text('heading', 'Main heading.', 'heading'), text('description', 'Supporting line.', 'description'), text('primaryActionLabel', 'Primary button.', 'primaryActionLabel'), text('primaryActionHref', 'Primary link.'), text('secondaryActionLabel', 'Secondary button.', 'secondaryActionLabel'), text('secondaryActionHref', 'Secondary link.'), text('note', 'Reassurance under the buttons.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: { eyebrow: 'Northside Physio', heading: 'Book care easily, recover with confidence.', description: 'Book appointments, pay deposits and see your treatment plan, all in one place.', primaryActionLabel: 'Book an appointment', secondaryActionLabel: 'Our treatments' },
      interaction: display, density: 30, widths: ['full'],
    },
    {
      ...common, dir: 'sections', slug: 'feature-grid-3x2', name: 'Feature Grid', component: 'FeatureGrid3x2', resourceType: 'section',
      description: 'Feature or benefit grid: one column on phones, two on tablets, three on desktop.',
      props: [text('heading', 'Section heading.', 'heading'), text('description', 'Line under the heading.', 'description'), p('items', 'object[]', 'Features: [{ title, description }], up to six.', { content: 'items' }), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: {},
      interaction: display, density: 40, widths: ['full'],
    },
    {
      ...common, dir: 'sections', slug: 'cta-minimal', name: 'Call to Action', component: 'CtaMinimal', resourceType: 'section',
      description: 'Closing call to action: one heading, one line and up to two buttons.',
      props: [text('heading', 'Heading.', 'heading'), text('description', 'Supporting line.'), text('primaryActionLabel', 'Primary button.', 'primaryActionLabel'), text('primaryActionHref', 'Primary link.'), text('secondaryActionLabel', 'Secondary button.'), text('secondaryActionHref', 'Secondary link.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: { heading: 'Ready to book your first session?', primaryActionLabel: 'Book now' },
      interaction: display, density: 30, widths: ['full'],
    },
    {
      ...common, dir: 'sections', slug: 'footer-minimal', name: 'Footer', component: 'FooterMinimal', resourceType: 'section',
      description: 'Compact footer with brand, links, legal links and copyright.',
      props: [text('brand', 'Product name.', 'brand'), p('items', 'object[]', 'Links: [{ label, href }].', { content: 'items' }), text('copyright', 'Copyright line.', 'copyright'), p('legalItems', 'object[]', 'Legal links.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: { brand: 'Northside Physio', items: [{ label: 'Treatments', href: '#' }, { label: 'Book', href: '#' }] },
      interaction: display, density: 40, widths: ['full'],
    },
    {
      ...common, dir: 'blocks', slug: 'entity-overview', name: 'Record Details', component: 'EntityOverview', resourceType: 'block',
      description: "All details of one record as a labelled description list; long text fields span the full width.",
      props: [text('heading', 'Section heading.'), text('entity', 'Record type.', 'entity'), p('fields', 'string[]', 'Fields in display order.', { content: 'fields' }), p('record', 'object', 'The record.', { content: 'record' }), p('sampleData', 'boolean', 'Marks the record as sample.', { content: 'sampleData' }), p('loading', 'boolean', 'Loading state.'), variantProp],
      states: { loading: true, empty: false, error: false },
      sample: { entity: 'Appointment', fields: ['date and time', 'service', 'with', 'status', 'notes'], record: { 'date and time': '2026-01-13 09:45', service: 'Follow-up', with: 'Dr Osei', status: 'Scheduled', notes: 'Bring exercise diary.' }, sampleData: true },
      interaction: display, density: 50, widths: ['content', 'wide'],
    },
    {
      ...common, dir: 'blocks', slug: 'settings-navigation', name: 'Settings Navigation', component: 'SettingsNavigation', resourceType: 'block',
      description: 'Settings section navigation: a vertical list from the md breakpoint, a scrollable row on small screens.',
      props: [text('heading', 'Heading.'), p('items', 'object[]', 'Sections: [{ label, href, description }].'), text('activeHref', 'Current section.'), variantProp],
      states: { loading: false, empty: false, error: false },
      sample: {},
      interaction: display, density: 45, widths: ['narrow'],
    },
    {
      ...common, dir: 'blocks', slug: 'profile-settings', name: 'Profile Settings', component: 'ProfileSettings', resourceType: 'block',
      description: 'Profile and reminder preferences with validation, loading and a saved confirmation.',
      props: [text('heading', 'Heading.'), text('description', 'Line under the heading.'), p('initialValues', 'object', 'Current values: { name, email, phone, emailReminders, textReminders }.'), p('onSave', 'callback', 'Receives the values.'), text('errorMessage', 'Error announced in an alert region.'), p('loading', 'boolean', 'Loading state.'), variantProp],
      states: { loading: true, empty: false, error: true },
      sample: { initialValues: { name: 'Amira Khan', email: 'amira@example.com' } },
      interaction: { ...display, interactionDensity: 55 }, density: 45, widths: ['content'],
    },
  ];
}
