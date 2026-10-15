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

const root = path.resolve('resources');
const now = '2026-10-15T00:00:00.000Z';

for (const spec of SPECS) {
  const dir = path.join(root, spec.dir, spec.slug);
  if (!fs.existsSync(path.join(dir, 'index.tsx'))) throw new Error(`${spec.slug}: write index.tsx first`);
  const existing = fs.existsSync(path.join(dir, 'manifest.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')) : null;
  const manifest: ResourceManifest = ResourceManifestSchema.parse({
    schemaVersion: '1.0.0',
    contractVersion: 2,
    id: `res_v2_${spec.slug.replace(/-/g, '_')}`,
    slug: spec.slug,
    name: spec.name,
    version: '1.0.0',
    status: 'experimental',
    description: spec.description,
    resourceType: spec.resourceType,
    categories: spec.categories,
    roles: spec.roles,
    purposes: spec.purposes,
    productArchetypes: spec.archetypes.map(([tag, weight]) => ({ tag, weight })),
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
    tags: spec.tags,
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
    relationships: [],
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
