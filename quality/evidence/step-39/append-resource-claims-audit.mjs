import { readFile, writeFile } from 'node:fs/promises';

const findings = [
  {
    id: 'AUD-236', severity: 'high', category: 'content', slug: 'accessibility-commitment-section', evidenceKind: 'resource-claims',
    title: 'Accessibility template claimed formal WCAG compliance and automated guarantees',
    expected: 'A design checklist should describe its intended goal and ask the integrator to verify the rendered product.',
    actual: 'The detail page called the resource a formal WCAG 2.2 AA compliance manifesto with automated audit and keyboard guarantees, while its preview asked users to verify their own integration.',
    reproduction: ['Open /r/accessibility-commitment-section at 1440x900 and 390x844.', 'Compare the detail description with the preview checklist.'],
    rootCause: 'The manifest described an aspirational checklist as an implemented compliance audit.',
    affectedCode: 'resources/sections/accessibility-commitment-section/{manifest.json,index.tsx,README.md}',
    remediation: 'Describe design goals and integration checks; make the detail page, manifest, and sample agree. Local desktop/mobile preview and detail regressions pass; public verification is pending.',
  },
  {
    id: 'AUD-237', severity: 'high', category: 'content', slug: 'compliance-proof', evidenceKind: 'resource-claims',
    title: 'Compliance template claimed certified badges and downloadable reports',
    expected: 'A compliance layout should be labelled illustrative and require current evidence before it supports a claim.',
    actual: 'The resource description promised certified badges and downloadable reports, but the preview was a static evidence template with no downloads.',
    reproduction: ['Open /r/compliance-proof at desktop and mobile widths.', 'Compare the detail description with the rendered template and controls.'],
    rootCause: 'Resource metadata was copied from a planned product behavior rather than the component contract.',
    affectedCode: 'resources/sections/compliance-proof/{manifest.json,index.tsx,README.md}',
    remediation: 'Rename and describe the resource as an illustrative evidence template; require scope and source before claims. Local desktop/mobile regressions pass; public verification is pending.',
  },
  {
    id: 'AUD-238', severity: 'high', category: 'content', slug: 'trust-badges-strip', evidenceKind: 'resource-previews',
    title: 'Unverified trust labels were shown with green verification checkmarks',
    expected: 'Unverified certifications and targets should not be presented with a visual pass indicator.',
    actual: 'SOC 2, ISO, privacy, and WCAG labels were explicitly marked as needing evidence or review, but each had a green checkmark.',
    reproduction: ['Open /preview/?resource=trust-badges-strip at desktop and mobile widths.', 'Inspect the icons next to EVIDENCE REQUIRED, VERIFY SCOPE, REVIEW POLICY, and TARGET.'],
    rootCause: 'The sample used a success icon as decoration without connecting it to verification state.',
    affectedCode: 'resources/sections/trust-badges-strip/{manifest.json,index.tsx,README.md}',
    remediation: 'Replace the success icon with a neutral marker and add a sample-label disclosure. The corrected desktop/mobile preview contains no checkmark; public verification is pending.',
  },
  {
    id: 'AUD-239', severity: 'high', category: 'content', slug: 'security-proof', evidenceKind: 'resource-claims',
    title: 'Security proof section asserted controls it did not inspect',
    expected: 'A static section should provide review prompts and disclose that it does not scan or verify a product.',
    actual: 'The description claimed enterprise encryption, RBAC, and data residency; the preview showed passed security checks, including zero dynamic evaluation and isolated previews, without examining a target product.',
    reproduction: ['Open /r/security-proof at desktop and mobile widths.', 'Inspect its detail description and the three preview checklist rows.'],
    rootCause: 'A presentation component was written as if it were a security scanner and product attestation.',
    affectedCode: 'resources/sections/security-proof/{manifest.json,index.tsx,README.md}',
    remediation: 'Convert statements to review prompts, replace pass labels, and disclose that no scan or verification occurs. Local desktop/mobile checks pass; public verification is pending.',
  },
  {
    id: 'AUD-240', severity: 'high', category: 'data', slug: 'success-state', evidenceKind: 'resource-previews',
    title: 'Success sample fabricated an export count and production result',
    expected: 'A generic success state should use neutral defaults unless the host supplies actual completion data.',
    actual: 'The preview claimed 11 production-ready files, zero external lock-in, and a completed system export even though no export ran.',
    reproduction: ['Open /preview/?resource=success-state at desktop and mobile widths.', 'Read the completion title and message.'],
    rootCause: 'Static demo values and export-specific copy were embedded as default component props.',
    affectedCode: 'resources/states/success-state/{index.tsx,manifest.json,README.md}',
    remediation: 'Use neutral completion copy and require the host to provide artifact state. The corrected preview passes desktop/mobile regressions; public verification is pending.',
  },
  {
    id: 'AUD-241', severity: 'medium', category: 'state', slug: 'success-state', evidenceKind: 'resource-previews',
    title: 'View Exported Files appeared enabled without an artifact handler',
    expected: 'An artifact action must work or be visibly disabled with a truthful explanation.',
    actual: 'The preview exposed an enabled-looking button without a callback or action result.',
    reproduction: ['Open /preview/?resource=success-state.', 'Try to activate View Exported Files without a host callback.'],
    rootCause: 'The component rendered its next-step button unconditionally and did not distinguish the disconnected state visually.',
    affectedCode: 'resources/states/success-state/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Disable the action without a callback, explain the missing artifact viewer, and apply a neutral disabled style. Local desktop/mobile regressions pass; public verification is pending.',
  },
  {
    id: 'AUD-242', severity: 'high', category: 'accessibility', slug: 'success-state', evidenceKind: 'resource-previews',
    title: 'Success State preview failed serious text-contrast checks',
    expected: 'Default preview text and buttons should meet WCAG AA contrast requirements.',
    actual: 'Deployed Axe reported a 3.37:1 heading and 3.65:1 button contrast ratio against the default background; both fail the 4.5:1 text threshold.',
    reproduction: ['Open /preview/?resource=success-state at 1440x900.', 'Run Axe with WCAG 2.2 AA tags.'],
    rootCause: 'Green-on-pale-green heading and button colors were selected without checking their rendered contrast.',
    affectedCode: 'resources/states/success-state/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Use higher-contrast green tokens and test the actual preview with Axe. Local desktop/mobile Axe runs now report zero violations; public verification is pending.',
  },
  {
    id: 'AUD-243', severity: 'medium', category: 'content', slug: 'document-detail', evidenceKind: 'resource-previews',
    title: 'Document detail card guaranteed export to any React environment',
    expected: 'The card should describe the supported exporter without guaranteeing compatibility with every downstream environment.',
    actual: 'The sample said the manifest guarantees full exportability to any modern React environment.',
    reproduction: ['Open /preview/?resource=document-detail.', 'Read the architecture note below the title.'],
    rootCause: 'A broad exporter guarantee was presented as a fact inside a static document card.',
    affectedCode: 'resources/blocks/document-detail/{index.tsx,manifest.json,README.md}',
    remediation: 'State that the React/Vite exporter generates source for review and adaptation, and label the card as a static example. Local regression passes; public verification is pending.',
  },
  {
    id: 'AUD-244', severity: 'medium', category: 'state', slug: 'document-detail', evidenceKind: 'resource-previews',
    title: 'Export Spec button had no action',
    expected: 'An export control should download a document or be absent until the host connects it.',
    actual: 'The preview displayed an enabled PDF/Markdown export button with no callback.',
    reproduction: ['Open /preview/?resource=document-detail.', 'Activate Export Spec (PDF / Markdown).'],
    rootCause: 'The static sample included an export CTA without a host-action contract.',
    affectedCode: 'resources/blocks/document-detail/{index.tsx,manifest.json}',
    remediation: 'Remove the dead button and replace it with an explicit static-example note. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-245', severity: 'medium', category: 'content', slug: 'accordion-spring', evidenceKind: 'resource-previews',
    title: 'Accordion FAQ made blanket dependency and contrast guarantees',
    expected: 'The FAQ should describe this example and ask consumers to validate their selected colors and dependency tree.',
    actual: 'The preview claimed all catalogue resources had zero paid dependencies and mathematically verified WCAG contrast.',
    reproduction: ['Open /preview/?resource=accordion-spring.', 'Expand both FAQ items and inspect their answers.'],
    rootCause: 'Global product assertions were used as sample answers inside an unrelated component.',
    affectedCode: 'resources/motion/accordion-spring/{index.tsx,manifest.json,README.md}',
    remediation: 'Describe the example’s React/CSS dependencies and state that color pairs must be checked in the integrated project. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-246', severity: 'medium', category: 'visual', slug: 'accordion-spring', evidenceKind: 'resource-claims',
    title: 'Accordion advertised spring motion and no layout jank without implementing either',
    expected: 'Motion metadata and descriptions should match the animation implemented by the resource.',
    actual: 'The original page promised spring height expansion without layout jank; it only rotated the chevron while the panel appeared without an expanding transition.',
    reproduction: ['Open /r/accordion-spring and /preview/?resource=accordion-spring.', 'Expand an item and compare the transition with the spring/no-jank claim.'],
    rootCause: 'The resource name and prose described a motion model absent from the panel implementation.',
    affectedCode: 'resources/motion/accordion-spring/{index.tsx,manifest.json,README.md}',
    remediation: 'Rename the public resource to Animated Disclosure Accordion and animate the panel with a reduced-motion-aware CSS Grid transition; remove the no-jank guarantee. Local regression passes; public verification is pending.',
  },
  {
    id: 'AUD-247', severity: 'medium', category: 'accessibility', slug: 'accordion-spring', evidenceKind: 'resource-previews',
    title: 'Accordion buttons did not expose disclosure state or panel relationships',
    expected: 'Each disclosure trigger should expose aria-expanded and aria-controls and reference a labelled panel.',
    actual: 'The original buttons only changed React state; assistive technology received no expanded state or panel relationship.',
    reproduction: ['Open /preview/?resource=accordion-spring.', 'Inspect each question button before and after activation.'],
    rootCause: 'The component implemented a visual toggle without the disclosure pattern semantics.',
    affectedCode: 'resources/motion/accordion-spring/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Add stable trigger/panel IDs, aria-expanded, aria-controls, region labelling, keyboard testing, and reduced-motion support. Local browser and Axe checks pass; public verification is pending.',
  },
  {
    id: 'AUD-248', severity: 'medium', category: 'content', slug: 'editorial-display-stack', evidenceKind: 'resource-previews',
    title: 'Editorial typography preview used a fake system version and production guarantee',
    expected: 'A typography sample should not imply a versioned system or production readiness unless those claims refer to a real release.',
    actual: 'The preview showed “SYSTEM ARCHITECTURE • V2.4” and called the output production-ready interface systems.',
    reproduction: ['Open /preview/?resource=editorial-display-stack at desktop and mobile widths.'],
    rootCause: 'Decorative headline copy was mistaken for product proof and release metadata.',
    affectedCode: 'resources/typography/editorial-display-stack/{index.tsx,manifest.json,README.md}',
    remediation: 'Replace the fake version and production guarantee with neutral guidance about a heading, supporting copy, and an emphasized phrase. Local regression passes; public verification is pending.',
  },
  {
    id: 'AUD-249', severity: 'medium', category: 'content', slug: 'feature-tabs', evidenceKind: 'resource-previews',
    title: 'Feature Tabs claimed mathematical guardrails and verified UIs',
    expected: 'A feature overview should state what its tabs show without promising verification or mathematical guarantees.',
    actual: 'The preview promised mathematically guarded design tokens and verified UIs without guesswork, although the component only switches static descriptions.',
    reproduction: ['Open /preview/?resource=feature-tabs.', 'Switch across the Design, Code, and Agents tabs.'],
    rootCause: 'Marketing copy implied functional validation that the tab component does not perform.',
    affectedCode: 'resources/sections/feature-tabs/{index.tsx,manifest.json}',
    remediation: 'Describe the example’s supported manifest and MCP workflows and expose selected tabs with aria-pressed. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-250', severity: 'medium', category: 'content', slug: 'interactive-demo-hero', evidenceKind: 'resource-previews',
    title: 'Interactive demo displayed fake HTTP and isolation results',
    expected: 'Local preview controls should report only the sample changes they make.',
    actual: 'The demo showed “200 OK” and “Zero styling leakage detected” even though it only changed a local card’s spacing and color.',
    reproduction: ['Open /preview/?resource=interactive-demo-hero.', 'Change spacing and theme and inspect the reported status.'],
    rootCause: 'Decorative status output imitated a real network and CSS-isolation test.',
    affectedCode: 'resources/sections/interactive-demo-hero/{index.tsx,manifest.json}',
    remediation: 'Label the card as a local sample, describe the controls precisely, and remove the simulated test results. Local desktop/mobile interaction regressions pass; public verification is pending.',
  },
  {
    id: 'AUD-251', severity: 'medium', category: 'content', slug: 'feature-sticky-narrative', evidenceKind: 'resource-previews',
    title: 'Sticky narrative repeated identical verification content in every phase',
    expected: 'Each phase should add a distinct step to the described workflow.',
    actual: 'All three phases repeated “Canonical Verification Standard” and the same resource-check paragraph.',
    reproduction: ['Open /preview/?resource=feature-sticky-narrative.', 'Compare the three phase headings and paragraphs.'],
    rootCause: 'A single placeholder narrative was copied into each repeated card.',
    affectedCode: 'resources/sections/feature-sticky-narrative/{index.tsx,manifest.json}',
    remediation: 'Replace the repeated cards with distinct Compose, Refine, and Export steps. Local desktop/mobile regression asserts each unique heading occurs once; public verification is pending.',
  },
  {
    id: 'AUD-252', severity: 'medium', category: 'content', slug: 'feature-sticky-narrative', evidenceKind: 'resource-previews',
    title: 'Sticky narrative promised unverified control, security, and accessibility outcomes',
    expected: 'A generic product narrative should not guarantee total control, zero cloud dependencies, zero undeclared dependencies, or AA results.',
    actual: 'The preview claimed 100% control and “zero” dependencies and described AA accessibility as a deterministic resource guarantee.',
    reproduction: ['Open /preview/?resource=feature-sticky-narrative.', 'Read the headline and all three phase descriptions.'],
    rootCause: 'A marketing sample bundled absolute product promises with the repeated placeholder narrative.',
    affectedCode: 'resources/sections/feature-sticky-narrative/{index.tsx,manifest.json}',
    remediation: 'Use factual Compose-to-Workbench-to-export language and remove the absolute claims. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-253', severity: 'medium', category: 'content', slug: 'how-it-works-steps', evidenceKind: 'resource-previews',
    title: 'Workflow steps claimed code was emitted directly into a local repository',
    expected: 'The steps should describe the actual browser download flow and avoid promising a SaaS-runtime guarantee.',
    actual: 'The component said it directly emitted code to the user’s local repository, but the exporter downloads a standalone ZIP.',
    reproduction: ['Open /preview/?resource=how-it-works-steps at desktop and mobile widths.'],
    rootCause: 'The flow copy skipped the browser download boundary and described an unimplemented filesystem write.',
    affectedCode: 'resources/sections/how-it-works-steps/{index.tsx,manifest.json}',
    remediation: 'Describe choosing a brief, refining the project in Workbench, and downloading a React/Vite project or manifest. Local regression passes; public verification is pending.',
  },
  {
    id: 'AUD-254', severity: 'medium', category: 'content', slug: 'ai-command-bar', evidenceKind: 'resource-claims',
    title: 'AI Command Bar metadata promised natural-language command execution',
    expected: 'Metadata should say whether the sample filters commands or executes them through a host.',
    actual: 'The detail page said it understood natural-language system instructions and intent-matched actions; the preview only filtered a fixed list.',
    reproduction: ['Open /r/ai-command-bar and /preview/?resource=ai-command-bar.', 'Type into the sample filter and inspect whether a command executes.'],
    rootCause: 'The resource description copied intended AI behavior into a local filtering example.',
    affectedCode: 'resources/ai/ai-command-bar/{index.tsx,manifest.json}',
    remediation: 'Label the input as a sample-list filter and state that no command runs in the preview. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-255', severity: 'medium', category: 'state', slug: 'ai-command-bar', evidenceKind: 'resource-previews',
    title: 'Command rows looked actionable but had no handlers',
    expected: 'Rows that do not invoke commands should not use pointer styling or imply they can be selected.',
    actual: 'The sample list rows looked like clickable commands but had no execution or selection behavior.',
    reproduction: ['Open /preview/?resource=ai-command-bar.', 'Hover or focus a listed command and attempt activation.'],
    rootCause: 'Command examples reused interactive row styling without implementing the command contract.',
    affectedCode: 'resources/ai/ai-command-bar/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Remove pointer/hover affordances, label the control as a filter, and assert the filtered sample list changes. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-256', severity: 'medium', category: 'accessibility', slug: 'ai-empty-state', evidenceKind: 'resource-previews',
    title: 'AI prompt starters were inert clickable divs',
    expected: 'Prompt starters should be keyboard-operable buttons connected to a prompt handler or explicitly disabled.',
    actual: 'The starters were styled as interactive divs, had no keyboard semantics, and PreviewHost did not supply the prompt callback.',
    reproduction: ['Open /preview/?resource=ai-empty-state.', 'Tab through the prompt starters and attempt to select one.'],
    rootCause: 'The component treated a visual card as an action without a semantic button or an available host callback.',
    affectedCode: 'resources/ai/ai-empty-state/{index.tsx,manifest.json}',
    remediation: 'Render semantic buttons, disable them without a callback, and explain how a host enables them. Local desktop/mobile regressions pass; public verification is pending.',
  },
  {
    id: 'AUD-257', severity: 'medium', category: 'content', slug: 'pure-monochrome-preset', evidenceKind: 'resource-previews',
    evidencePath: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.json',
    evidenceScreenshot: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.png',
    title: 'Palette preset promised an 18:1 contrast floor and WCAG AAA',
    expected: 'A preset description should not guarantee a palette-wide contrast floor that the tool does not calculate.',
    actual: 'Pure Monochrome claimed an 18:1+ floor and strict WCAG 2.2 AAA compliance, but the values depend on selected pairs and component states.',
    reproduction: ['Open /tools/palette.', 'Select Pure Monochrome and inspect its description and results.'],
    rootCause: 'A visual preset was described as a compliance-certified palette.',
    affectedCode: 'apps/site/src/components/tools/PaletteStudio.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Describe the color direction and ask users to check each listed pair and component state separately. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-258', severity: 'medium', category: 'content', slug: 'palette-studio', evidenceKind: 'resource-previews',
    evidencePath: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.json',
    evidenceScreenshot: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.png',
    title: 'Palette contrast panel implied a full palette or interface audit',
    expected: 'The interface should identify the exact pairs it calculates and disclose that component states remain untested.',
    actual: 'The prior “Contrast Health Matrix” and general palette language implied broader validation than four selected token pairs.',
    reproduction: ['Open /tools/palette at desktop and mobile widths.', 'Inspect the title, calculated pair rows, and coverage note.'],
    rootCause: 'A limited four-pair calculation was named as if it audited the complete palette and rendered interface.',
    affectedCode: 'apps/site/src/components/tools/PaletteStudio.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Name it Selected Pair Contrast Check, disclose the four-pair limit, and use the WCAG 0.04045 sRGB threshold. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-259', severity: 'medium', category: 'content', slug: 'resource-catalogue-cards', evidenceKind: 'resource-claims',
    evidencePath: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/quality-card.json',
    evidenceScreenshot: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/quality-card.png',
    title: 'Catalogue cards showed an unlabeled green quality number',
    expected: 'A numeric resource-quality score needs a clear source and method or should be omitted from compact cards.',
    actual: 'Explore cards showed green numbers such as 96 or 98 without identifying them as self-declared manifest fields or independent assessments.',
    reproduction: ['Open /explore?q=success-state at desktop and mobile widths.', 'Inspect the Success State card footer and compare it with the detail-page score.'],
    rootCause: 'ResourceCard displayed manifest.quality.overall without its label or provenance.',
    affectedCode: 'apps/site/src/components/ResourceCard.tsx, apps/site/src/components/ResourceInspector.tsx, and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Remove the score from cards and label it as a manifest-declared score on details with an explicit non-independent-measurement note. Local desktop/mobile regression passes; public verification is pending.',
  },
  {
    id: 'AUD-260', severity: 'medium', category: 'accessibility', slug: 'resource-accessibility-metadata', evidenceKind: 'resource-claims',
    evidencePath: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/accessibility-tab.json',
    evidenceScreenshot: 'quality/evidence/step-39/deployed-before/resource-metadata/desktop/accessibility-tab.png',
    title: 'Accessibility tab presented manifest flags as verified certification',
    expected: 'Resource detail should distinguish author-declared accessibility metadata from independently tested conformance.',
    actual: 'The detail tab displayed WCAG AAA targets and green verified check icons without explaining that they came from manifest fields.',
    reproduction: ['Open /r/success-state and select Accessibility.', 'Compare the declared flags with the Axe result for /preview/?resource=success-state.'],
    rootCause: 'ResourceTabs rendered manifest booleans as verification results, and several audited resources used unsupported AAA targets.',
    affectedCode: 'apps/site/src/components/ResourceTabs.tsx, 13 audited resource manifests, and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Label these values as manifest declarations, reduce unsupported AAA targets to AA for the audited resources, and test the actual component with Axe. Local detail and preview regressions pass; public verification is pending.',
  },
  {
    id: 'AUD-261', severity: 'high', category: 'accessibility', slug: 'success-state', evidenceKind: 'resource-previews',
    route: '/preview/?resource=success-state',
    evidencePath: 'quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.json',
    evidenceScreenshot: 'quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.png',
    title: 'Success State title and action failed WCAG text contrast',
    expected: 'The resource title and its action label should each meet at least 4.5:1 contrast against their rendered surfaces.',
    actual: 'Axe measured the title at 3.37:1 (#009966 on #f0f8f1) and the 12px white action label at 3.65:1 on #009966, reporting serious color-contrast violations on desktop and mobile.',
    reproduction: ['Open /preview/?resource=success-state at 1440×900 or 390×844.', 'Run Axe against the rendered preview; the title and View Exported Files action are reported as serious color-contrast.'],
    rootCause: 'The example success title used emerald-600 on a pale surface and the disabled action retained an emerald-600 background, both below the normal-text AA threshold.',
    affectedCode: 'resources/states/success-state/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts',
    remediation: 'Use accessible dark-green title and action colors on light surfaces and ensure the disabled action remains readable. The desktop/mobile Preview regression passes locally; deployed verification is pending.',
  },
  {
    id: 'AUD-262', severity: 'medium', category: 'visual', slug: 'inline-ai-rewrite', evidenceKind: 'responsive',
    route: '/resources/inline-ai-rewrite/',
    viewport: '360x844',
    evidencePath: 'quality/evidence/step-39/before/responsive/inline-ai-rewrite-360.json',
    evidenceScreenshot: 'quality/evidence/step-39/before/responsive/inline-ai-rewrite-360-concise.png',
    afterEvidencePath: 'quality/evidence/step-39/after/responsive/inline-ai-rewrite-360.json',
    afterScreenshot: 'quality/evidence/step-39/after/responsive/inline-ai-rewrite-360-concise.png',
    title: 'Inline AI Rewrite preview overflowed its 360px mobile frame',
    expected: 'The resource preview should fit its 292px available content width at a 360px viewport for every tone.',
    actual: 'At 360px, the nested preview had 292px of client width but 316px scroll width in Concise and 317px in Professional and Energetic. The header and tone row also crowded the narrow preview.',
    reproduction: ['Open /resources/inline-ai-rewrite/ at 360×844.', 'Choose Mobile (360px) in the preview controls.', 'Switch through Concise, Professional, and Energetic; observe horizontal clipping and measure the preview document width.'],
    rootCause: 'The example used fixed horizontal padding and a non-wrapping header/tone row without a min-width reset, so its inner content exceeded the constrained resource frame.',
    affectedCode: 'resources/ai/inline-ai-rewrite/index.tsx, scripts/generate-gold-artifacts.ts output packages/exporter/src/generated-gold-sources.ts, tests/e2e/inline-ai-rewrite-responsive.spec.ts, and packages/exporter/src/__tests__/standalone-export-fidelity.test.ts',
    remediation: 'Use a min-width-safe root, reduce padding at narrow widths, stack the header, allow tone controls to wrap, and expose their selection with aria-pressed. Remove the unsupported keyboard shortcut hint, regenerate the embedded Gold source used by standalone exports, and cover the exported source with a fidelity regression. The fresh Sites Worker regression now records 292px client and scroll widths for all three tones with zero console, uncaught, failed-request, or HTTP errors; deployed review verification remains pending.',
  },
];

const auditPath = 'audit/runtime-audit.json';
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const existing = new Set(audit.entries.map((entry) => entry.id));
const newEntries = [];
for (const finding of findings) {
  if (existing.has(finding.id)) continue;
  const viewport = '1440x900 and 390x844';
  const route = finding.route ?? (finding.slug.startsWith('palette') || finding.slug === 'pure-monochrome-preset'
    ? '/tools/palette'
    : finding.slug === 'resource-catalogue-cards'
      ? '/explore?q=success-state'
      : finding.slug === 'resource-accessibility-metadata'
        ? '/r/success-state'
        : `/${finding.evidenceKind === 'resource-claims' ? 'r' : 'preview/?resource'}${finding.evidenceKind === 'resource-claims' ? `/${finding.slug}` : `=${finding.slug}`}`);
  const evidenceDir = `quality/evidence/step-39/deployed-before/${finding.evidenceKind}`;
  const beforeJson = finding.evidencePath ?? `${evidenceDir}/desktop/${finding.slug}.json`;
  const before = JSON.parse(await readFile(beforeJson, 'utf8'));
  const runtime = before.runtime ?? {};
  const consoleEvidence = [
    ...(runtime.consoleErrors ?? []).map((message) => `error: ${message}`),
    ...(runtime.consoleWarnings ?? []).map((message) => `warning: ${message}`),
    ...(runtime.uncaughtExceptions ?? []).map((message) => `uncaught: ${message}`),
  ];
  const networkEvidence = [
    { url: before.route, status: before.status },
    ...(runtime.failedRequests ?? []).map((request) => ({ failedRequest: request })),
    ...(runtime.httpErrors ?? []).map((response) => ({ httpError: response })),
  ];
  const screenshot = finding.evidenceScreenshot ?? `${evidenceDir}/desktop/${finding.slug}.png`;
  newEntries.push({
    id: finding.id,
    severity: finding.severity,
    route,
    viewport: finding.viewport ?? viewport,
    category: finding.category,
    title: finding.title,
    expected: finding.expected,
    actual: finding.actual,
    reproduction: [...finding.reproduction, `Pre-fix runtime record: ${beforeJson}; primary route returned HTTP ${before.status}; ${finding.id === 'AUD-262' ? 'the record also preserves one net::ERR_ABORTED Astro module request during the viewport update; the fresh post-fix run recorded zero failed requests.' : 'no console, uncaught, failed-request, or HTTP errors were recorded.'}`],
    console: consoleEvidence,
    network: networkEvidence,
    screenshot,
    ...(finding.afterScreenshot ? { afterScreenshot: finding.afterScreenshot, afterEvidence: finding.afterEvidencePath } : {}),
    rootCause: finding.rootCause,
    fixCommit: null,
    status: 'fixed-awaiting-deployed-verification',
    remediation: `${finding.remediation} Corrected local screenshots are under ${finding.id === 'AUD-262' ? 'quality/evidence/step-39/after/responsive/' : 'quality/evidence/step-39/after/resource-previews/'} or are captured by the desktop/mobile regression.`,
  });
}

audit.entries.push(...newEntries);
audit.generatedAt = new Date().toISOString();
if (!audit.scope.includes('AUD-262')) {
  audit.scope += ' Step 39 added AUD-236–261 from deployed desktop/mobile resource previews and detail routes covering accessibility/compliance/security claims, sample success states, inactive actions, motion semantics, AI examples, palette scope, declared metadata, and the Success State contrast failure. AUD-262 records the 360px Inline AI Rewrite preview overflow reproduced in the Sites Worker and fixed with a focused responsive regression. Local fixes are browser-verified; deployed verification remains pending.';
}
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');

const markdownPath = 'audit/RUNTIME_AUDIT.md';
let markdown = await readFile(markdownPath, 'utf8');
const highCount = audit.entries.filter((entry) => entry.severity === 'high').length;
const mediumCount = audit.entries.filter((entry) => entry.severity === 'medium').length;
const lowCount = audit.entries.filter((entry) => entry.severity === 'low').length;
const criticalCount = audit.entries.filter((entry) => entry.severity === 'critical').length;
const closed = audit.entries.filter((entry) => entry.status === 'closed-deployed-verified').length;
const awaiting = audit.entries.filter((entry) => entry.status === 'fixed-awaiting-deployed-verification').length;
const locallyVerified = audit.entries.filter((entry) => entry.status === 'fixed-local-verified').length;
const open = audit.entries.filter((entry) => entry.status === 'open').length;
const headline = `**Current disposition:** ${audit.entries.length} findings (${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium, ${lowCount} Low): ${closed} closed after deployed verification, ${awaiting} fixed locally and awaiting issue-specific deployed checks, ${locallyVerified} fixed and verified locally, and ${open} remain open.`;
markdown = markdown.replace(/\*\*Current disposition:\*\*[^\n]*/, headline);
const resourceClaimsHeading = '## Step 39 resource claims, controls, metadata, and responsive preview (AUD-236–262)';
const resourceSectionIndex = markdown.indexOf(resourceClaimsHeading);
if (resourceSectionIndex >= 0) markdown = markdown.slice(0, resourceSectionIndex).trimEnd();
markdown += `\n\n${resourceClaimsHeading}\n\n`;
const stepFindings = findings.map((finding) => ({ finding, entry: audit.entries.find((entry) => entry.id === finding.id) })).filter(({ entry }) => entry);
for (const severity of ['high', 'medium']) {
  const records = stepFindings.filter(({ entry }) => entry.severity === severity);
  if (!records.length) continue;
  markdown += `### ${severity.toUpperCase()}\n\n`;
  for (const { finding, entry } of records) {
    const evidence = entry.screenshot;
    const evidenceRecord = finding.evidencePath ?? evidence.replace('.png', '.json');
    const afterLink = entry.afterScreenshot ? `; corrected capture: [after](../${entry.afterScreenshot}) with machine record \`${entry.afterEvidence}\`` : '';
    markdown += `#### ${entry.id} — ${entry.title}\n\n`;
    markdown += `- Evidence: ${entry.id === 'AUD-262' ? 'the local Sites Worker red-run screenshot' : 'deployed-before screenshot'} [${finding.slug}](../${evidence}); machine record: \`${evidenceRecord}\`. The route returned HTTP ${entry.network[0]?.status ?? 'unknown'}; pre-fix runtime evidence is preserved in that record${afterLink}.\n`;
    markdown += `- Reproduction: ${finding.reproduction.join(' ')}\n`;
    markdown += `- Root cause: ${finding.rootCause}\n`;
    markdown += `- Affected code: \`${finding.affectedCode}\`.\n`;
    markdown += `- Remediation: ${finding.remediation} The local regression passes; status remains fixed-awaiting-deployed-verification.\n\n`;
  }
}

await writeFile(markdownPath, `${markdown.trimEnd()}\n`, 'utf8');
