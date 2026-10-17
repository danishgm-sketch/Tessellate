# Runtime audit — resource and renderer hardening

This is a local browser audit against the built ChatGPT Sites Worker boundary at
`http://127.0.0.1:4323`. It is not a verification of the public review Site.
Machine-readable findings and their current status are in
[`runtime-audit.json`](./runtime-audit.json). All fixes await verification in a
published review version during the public-RC phase.

**Current disposition:** 74 findings (14 High, 60 Medium). The Step 06 resource fixes and four Step 07 renderer/export fixes have local regression evidence. All findings remain `fixed-awaiting-deployed-verification` until the public review Site is updated and re-audited in the public-RC phase. PR CI passed on the pre-Step-07 baseline `dbc85c436047e0ae9c17896afd96722132b7ae58`; the new Step 07 changes are queued for CI. An earlier PR run exposed a race in the Gold test's loading-state check; the test now waits for the exact rendered resource node and variant.

At the Step 06 checkpoint, `pnpm test:e2e` passed: 73 of 124 desktop/mobile browser tests passed, 51 tests were explicitly skipped by project scope, and all 23 Sites Worker tests passed. It included the expanded state and action regressions. The 11-case state matrix, exact-resource readiness check, dialog modal regression, Prompt Composer action regression, and 40 × 3 Axe matrix passed. The catalogue report covered 324 resources and 972 variants with zero findings, failed requests or cancellations; the Gold report covered 40 resources / 120 variants with zero findings. Existing state fixtures cover six Gold data resources; the expanded matrix covers array-driven resources at empty and 30–40 item counts, disabled Button/Input/Select, named loading/error states, long text, and fixed-slot partial data. See [`e2e-suite-final.json`](evidence/step-06/results/e2e-suite-final.json) and the individual browser reports alongside it.

## HIGH

### AUD-001 — Marketing CTA had no action

- Evidence: initial Gold browser keyboard probe found an enabled CTA with no visible response. Reproduction: open `/resources/marketing-nav-cta/`, focus **Start Free**, press Enter.
- Root cause: `MarketingNavCta` had no action contract and always rendered an enabled button.
- Affected code: `resources/shells/marketing-nav-cta/index.tsx`, `apps/site/src/components/PreviewHost.tsx`.
- Remediation: accept a host callback, disable the button with an accessible explanation when disconnected, and show explicit preview feedback when connected.
- Regression: `tests/resource-action-contracts.test.tsx`; keyboard interaction in `tests/e2e/gold-resource-certification.spec.ts`.

### AUD-002 — Pricing plan actions were dead

- Evidence: initial Gold browser keyboard probe found three enabled **Get Started** controls with no feedback. Reproduction: open `/resources/pricing-three-tier/`, press Enter on a plan action.
- Root cause: no callback contract existed for plan selection.
- Affected code: `resources/sections/pricing-three-tier/index.tsx`, `apps/site/src/components/PreviewHost.tsx`.
- Remediation: route the selected plan to the host, disable unconnected controls accessibly, and report selection in the isolated preview.
- Regression: `tests/resource-action-contracts.test.tsx`; keyboard interaction in `tests/e2e/gold-resource-certification.spec.ts`.

### AUD-003 — Empty workspace action was dead

- Evidence: initial Gold browser keyboard probe found **Create New Project** enabled without a response. Reproduction: open `/resources/empty-workspace/`, press Enter on the action.
- Root cause: the component had no creation callback and did not signal the missing integration.
- Affected code: `resources/blocks/empty-workspace/index.tsx`, `apps/site/src/components/PreviewHost.tsx`.
- Remediation: add a host action, disable it with an accessible explanation when absent, and provide visible preview feedback.
- Regression: `tests/resource-action-contracts.test.tsx`; keyboard interaction in `tests/e2e/gold-resource-certification.spec.ts`.

### AUD-004 — Magnetic button had no click action

- Evidence: initial Gold browser keyboard probe found the button responded to pointer movement but pressing Enter had no response. Reproduction: open `/resources/magnetic-button/`, focus the button, press Enter.
- Root cause: the component implemented only pointer tracking while exposing button semantics.
- Affected code: `resources/motion/magnetic-button/index.tsx`, `apps/site/src/components/PreviewHost.tsx`.
- Remediation: add an optional host action, disable the button with an accessible explanation when disconnected, and show preview feedback when connected.
- Regression: `tests/resource-action-contracts.test.tsx`; keyboard interaction in `tests/e2e/gold-resource-certification.spec.ts`.

### AUD-005 — Preview retry did not invoke feedback

- Evidence: initial Gold browser keyboard probe found **Retry Operation** enabled without response. Reproduction: open `/resources/error-state/`, activate retry.
- Root cause: `ErrorState` already accepted `onRetry`, but `PreviewHost` did not provide it.
- Affected code: `apps/site/src/components/PreviewHost.tsx`, `resources/states/error-state/index.tsx`.
- Remediation: connect a preview-only retry example and disable the control with an accessible explanation if the consuming app supplies no retry handler.
- Regression: `tests/resource-action-contracts.test.tsx`; keyboard interaction in `tests/e2e/gold-resource-certification.spec.ts`.

### AUD-066 — Input preview had no accessible name

- Evidence: the [before capture](evidence/step-06/before/a11y-gold/input-quiet-1440.png) shows the unlabeled field; the [after capture](evidence/step-06/after/a11y-gold/input-quiet-1440.png) shows its visible label and example value. The Axe baseline recorded this critical violation in all three variants.
- Reproduction: open `/preview/?resource=input&variant=quiet`, then run the Gold-resource WCAG 2.2 AA Axe matrix.
- Root cause: the manifest passed no default props to the preview, so PreviewHost rendered an Input without its optional label.
- Affected code: `resources/primitives/input/manifest.json`, `tests/e2e/gold-resource-accessibility-certification.spec.ts`.
- Remediation: provide sample label and placeholder values in the manifest. The 120-variant Axe matrix now reports zero violations. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-067 — Native form values were corrupted in live resource previews

- Evidence: the [before Input capture](evidence/step-06/before/form-interactions/input-event-corruption-1440.png) shows `[object Object]` after typing; the [fixed Input capture](evidence/step-06/after/form-interactions/input-retains-value-1440.png) shows `Ada Lovelace`. The fixed Textarea capture shows the retained sentence. The Select regression is captured [before](evidence/step-06/before/form-interactions/select-state-reset-1440.png) and [after](evidence/step-06/after/form-interactions/select-retains-choice-1440.png).
- Reproduction: open `/resources/input/` and type `Ada Lovelace`, then type a sentence in `/resources/textarea/`; open `/resources/select/` and choose **Second option**. Previously, native text controls stored the change event as their value and Select reverted to its initial choice.
- Root cause: `PreviewHost` stored React's native `onChange` event instead of extracting `target.value` or `target.checked`.
- Affected code: `apps/site/src/components/PreviewHost.tsx`.
- Remediation: normalize native control events while preserving primitive/array callback values from custom resources. Focused browser regressions now pass for Input, Textarea, Select and adjacent action-feedback behavior. The issue remains `fixed-awaiting-deployed-verification` until a published review build is audited.

### AUD-069 — Gold Dialog lacked accessible modal semantics and keyboard behavior

- Evidence: the [before capture](evidence/step-06/before/dialog-accessibility-390.png) shows the open preview. The red browser regression failed because the visible panel had no `role="dialog"`; after remediation the [after capture](evidence/step-06/after/dialog-accessibility-390.png) and the focused test show a labelled modal, focus containment and Escape close with no console, page, HTTP or failed-request diagnostics.
- Reproduction: open `/resources/dialog/` at 390x844, inspect the preview accessibility tree, then run `tests/e2e/gold-dialog-accessibility.spec.ts`. Before the fix the visible panel was not exposed as a dialog.
- Root cause: the component implemented a visual overlay only, despite its manifest promising an accessible modal and focus trapping.
- Affected code: `resources/primitives/dialog/index.tsx` and `tests/e2e/gold-dialog-accessibility.spec.ts`.
- Remediation: add modal semantics and labelled title/description associations, move focus into the modal, contain Tab navigation, and close on Escape. The focused regression now passes locally; deployed review verification is pending.

### AUD-070 — AI Prompt Composer Execute control was a dead button

- Evidence: the [before capture](evidence/step-06/before/ai-prompt-action-390.png) shows a composed prompt with an enabled Execute Prompt control but no connected result; the [after capture](evidence/step-06/after/ai-prompt-action-390.png) and [machine report](evidence/step-06/results/ai-prompt-action.json) show explicit local preview feedback, zero provider requests and zero browser diagnostics.
- Reproduction: open `/resources/ai-prompt-composer/` at 390x844, enter a prompt and click **Execute Prompt**. Before remediation, the action produced no state change or feedback.
- Root cause: the component had no execute callback contract or disabled fallback, and its preview host did not inject an action.
- Affected code: `resources/ai/ai-prompt-composer/index.tsx`, `resources/ai/ai-prompt-composer/README.md`, `apps/site/src/components/PreviewHost.tsx` and `tests/e2e/gold-resource-action-completion.spec.ts`.
- Remediation: require an optional `onExecute` callback, disable the control accessibly when disconnected, and make the isolated preview say that it only previewed locally without sending a provider request. The pre-fix browser regression failed; the focused fixed regression passes. Deployed review verification remains pending.

### AUD-071 — Unknown resource preview rendered an unrelated Button

- Evidence: the [before capture](evidence/step-07/before/unknown-resource-button-fallback.png) shows Button UI for an unknown resource ID; the [fixed capture](evidence/step-07/after/unknown-resource-error-state.png) shows the unavailable-resource alert. The pre-fix browser test failed because no alert existed. The fixed browser test receives `TESSELLATE_PREVIEW_ERROR`, sends no READY message, and reports zero console errors or failed requests.
- Reproduction: open `/preview/?resource=__missing-resource-for-renderer-audit__` at 1440x900.
- Root cause: `PreviewApp` substituted the Button component when lookup failed, making its missing-resource branch unreachable.
- Affected code: `apps/preview/src/main.tsx` and `tests/e2e/preview-unknown-resource-regression.spec.ts`.
- Remediation: initialize URL state before rendering, remove the unrelated fallback, display an accessible unavailable state, and report an error without reporting readiness. Deployed verification remains outstanding.

### AUD-072 — Workbench dropped nested children when a resource also had prop children

- Evidence: the [before capture](evidence/step-07/before/manifest-prop-child-only.png) contains only the explicit prop child; the [fixed canvas capture](evidence/step-07/after/manifest-and-prop-children.png) and [Workbench Preview capture](evidence/step-07/after/preview-modal-children.png) contain both sources. The pre-fix browser probe found the nested node count was zero, with no console or network errors.
- Reproduction: open the seeded Workbench manifest with `canvas-workspace-shell`, a `props.children` value, and a nested manifest child.
- Root cause: `NodeRenderer` treated `props.children` and rendered nested nodes as alternatives.
- Affected code: `packages/renderer/src/node-renderer.tsx`, `packages/renderer/src/__tests__/gold-registry.test.tsx`, and `tests/e2e/renderer-children-parity.spec.ts`.
- Remediation: compose both sources into the declared resource slot, filtering explicit children through the Gold prop contract. The renderer and Workbench browser regressions cover the case. Deployed verification remains outstanding.

### AUD-073 — Standalone export discarded resource prop children when nested children existed

- Evidence: the generated-source regression failed before the fix because screen JSX omitted the literal prop child whenever the node had nested children. The fixed export is installed in a clean temporary directory, built, opened in a real browser, and shows both child sources in [this capture](evidence/step-07/after/standalone-export-children.png) with no browser console errors.
- Reproduction: export a project where `canvas-workspace-shell` receives `props.children` and a nested manifest child; inspect and run the generated screen.
- Root cause: the source generator emitted resource prop children or nested children, never both.
- Affected code: `packages/exporter/src/source-tree.ts` and `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`.
- Remediation: emit the serialized prop child followed by nested child JSX. Clean install/build/browser verification is part of the regression. Deployed verification remains outstanding.

### AUD-074 — Unsupported variants silently fell through to component defaults

- Evidence: the [before capture](evidence/step-07/before/unsupported-variant-fell-through.png) shows Button rendered for an undeclared variant; the [fixed capture](evidence/step-07/after/unsupported-variant-diagnostic.png) shows a recoverable diagnostic. The pre-fix Workbench test failed because the diagnostic was absent. The fixed Workbench test and exporter regression pass without console errors.
- Reproduction: load a Workbench manifest or export containing `variant=unsupported-variant` for the Button resource.
- Root cause: renderer and exporter had no canonical access to each resource's declared variant IDs.
- Affected code: `scripts/generate-gold-artifacts.ts`, generated renderer/exporter metadata, `packages/renderer/src/node-renderer.tsx`, `packages/exporter/src/node-disk-resolver.ts`, and `packages/exporter/src/source-tree.ts`.
- Remediation: generate variant declarations from each canonical resource manifest, render a visible non-substitution diagnostic in Workbench, and reject invalid exported variants with the accepted values. Deployed verification remains outstanding.

## MEDIUM

### AUD-068 — Form controls announced a false generic action when clicked

- Evidence: the [before capture](evidence/step-06/before/form-interactions/input-misleading-action-status-1440.png) shows an action status after merely focusing the Input; the [fixed capture](evidence/step-06/after/form-interactions/input-no-false-action-status-1440.png) has no status. Textarea and Select also pass the no-false-status assertion.
- Reproduction: open `/resources/input/`, `/resources/textarea/` or `/resources/select/` and click the form control. Previously, the preview announced “Example action activated.”
- Root cause: `PreviewHost` injected a generic `onClick` callback into every resource, including form controls.
- Affected code: `apps/site/src/components/PreviewHost.tsx`.
- Remediation: limit the generic callback to action primitives and preserve dedicated callbacks for other preview actions. A browser regression confirms Button still provides feedback. The issue remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-006 — Documentation shell overflowed on mobile

- Evidence: before screenshot [`documentation-shell-390.png`](evidence/step-06/before/documentation-shell-390.png); 376px document scroll width inside a 322px preview at a 390x844 browser viewport. Reproduction: open `/resources/documentation-shell/` at mobile width.
- Root cause: fixed desktop sidebar and main padding without a responsive stacking strategy.
- Affected code: `resources/shells/documentation-shell/index.tsx`.
- Remediation: stack panes under the container breakpoint, reduce compact-width padding and hide the optional page index until there is room.
- Regression: `tests/e2e/catalog-resource-render.spec.ts`.

### AUD-007 — Floating navigation overflowed on mobile

- Evidence: before screenshot [`floating-nav-390.png`](evidence/step-06/before/floating-nav-390.png); 347px content width inside a 322px preview at 390x844. Reproduction: open `/resources/floating-nav/` at mobile width.
- Root cause: a single-row pill with fixed gaps and padding.
- Affected code: `resources/shells/floating-nav/index.tsx`.
- Remediation: allow the pill to wrap and tighten the gaps and padding at compact widths.
- Regression: `tests/e2e/catalog-resource-render.spec.ts`.

### AUD-008 — Webhook endpoint row clipped on mobile

- Evidence: before screenshot [`webhook-management-390.png`](evidence/step-06/before/webhook-management-390.png); 341px content width inside a 322px preview at 390x844. Reproduction: open `/resources/webhook-management/` at mobile width.
- Root cause: a long, unbreakable URL shared a non-wrapping row with its status badge.
- Affected code: `resources/blocks/webhook-management/index.tsx`.
- Remediation: stack the row at compact widths, allow the URL to break anywhere and keep the status badge fixed-width.
- Regression: `tests/e2e/catalog-resource-render.spec.ts`.

### AUD-009 — app-sidebar-expanded exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/app-sidebar-expanded-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Dashboard; Telemetry; Composition Engine; Design DNA; API Tokens rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/app-sidebar-expanded/.
  - Inspect or activate Dashboard; its destination is only #.
- Root cause: resources/shells/app-sidebar-expanded/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/app-sidebar-expanded/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-010 — breadcrumb-header exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/breadcrumb-header-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Projects; Telemetry rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/breadcrumb-header/.
  - Inspect or activate Projects; its destination is only #.
- Root cause: resources/shells/breadcrumb-header/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/breadcrumb-header/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-011 — centered-top-nav exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/centered-top-nav-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Features; Showcase; Pricing; Blog rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/centered-top-nav/.
  - Inspect or activate Features; its destination is only #.
- Root cause: resources/shells/centered-top-nav/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/centered-top-nav/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-012 — collapsible-sidebar exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/collapsible-sidebar-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Overview; Settings rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/collapsible-sidebar/.
  - Inspect or activate Overview; its destination is only #.
- Root cause: resources/shells/collapsible-sidebar/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/collapsible-sidebar/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-013 — floating-nav exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/floating-nav-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Overview; Specs; Changelog rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/floating-nav/.
  - Inspect or activate Overview; its destination is only #.
- Root cause: resources/shells/floating-nav/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/floating-nav/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-014 — footer-minimal exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/footer-minimal-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Privacy; Terms; Status: Operational rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/footer-minimal/.
  - Inspect or activate Privacy; its destination is only #.
- Root cause: resources/sections/footer-minimal/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/sections/footer-minimal/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-015 — footer-sitemap exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/footer-sitemap-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: 17 sitemap entries across Resources, Platform, Community and Legal rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/footer-sitemap/.
  - Inspect or activate 17 sitemap entries across Resources, Platform, Community and Legal; its destination is only #.
- Root cause: resources/sections/footer-sitemap/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/sections/footer-sitemap/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-016 — marketing-nav-cta exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/marketing-nav-cta-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Features; Pricing rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/marketing-nav-cta/.
  - Inspect or activate Features; its destination is only #.
- Root cause: resources/shells/marketing-nav-cta/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/marketing-nav-cta/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-017 — mega-nav exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/mega-nav-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Enterprise; Docs rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/mega-nav/.
  - Inspect or activate Enterprise; its destination is only #.
- Root cause: resources/shells/mega-nav/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/mega-nav/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-018 — minimal-top-nav exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/minimal-top-nav-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Overview; People; Settings rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/minimal-top-nav/.
  - Inspect or activate Overview; its destination is only #.
- Root cause: resources/shells/minimal-top-nav/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/minimal-top-nav/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-019 — mobile-drawer-nav exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/mobile-drawer-nav-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Catalogue; Workbench; Design DNA; Documentation rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/mobile-drawer-nav/.
  - Open the Menu drawer.
  - Inspect or activate Catalogue; its destination is only #.
- Root cause: resources/shells/mobile-drawer-nav/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/mobile-drawer-nav/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-020 — responsive-app-shell exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/responsive-app-shell-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Dashboard; Analytics; Settings rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/responsive-app-shell/.
  - Inspect or activate Dashboard; its destination is only #.
- Root cause: resources/shells/responsive-app-shell/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/responsive-app-shell/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-021 — transparent-solid-nav exposed navigation entries with placeholder destinations

- Evidence: [before screenshot](evidence/step-06/before/navigation/transparent-solid-nav-dead-links-before.png). Expected: A visible link should have a real destination. If the consuming application has not supplied one, the preview should show a non-interactive label. Actual: Engine; Gallery rendered as anchors with href="#"; activation did not navigate to a page or matching in-preview section.
- Reproduction:
  - Open /resources/transparent-solid-nav/.
  - Inspect or activate Engine; its destination is only #.
- Root cause: resources/shells/transparent-solid-nav/index.tsx hardcoded placeholder fragment destinations instead of accepting consumer-provided links; the preview presented those placeholders as working navigation.
- Affected code: `resources/shells/transparent-solid-nav/index.tsx`
- Remediation: Accept real destinations from consumer props and render entries without an href as plain labels. The default demo no longer pretends that a placeholder fragment is a working route.
- Regression: The all-resource Sites Worker browser test now rejects empty, #, and unresolved fragment destinations; resource contract tests verify real destinations pass through.

### AUD-022 — Breadcrumb Header Export was an enabled no-op

- Evidence: [before screenshot](evidence/step-06/before/actions/breadcrumb-header-dead-control-before.png). Expected: Export should produce a visible host action or be disabled with an accessible explanation until its consumer is connected. Actual: The browser accepted activation of Export, but there was no response, navigation or state change.
- Reproduction:
  - Open /resources/breadcrumb-header/.
  - Activate Export; no feedback or state change occurs.
- Root cause: resources/shells/breadcrumb-header/index.tsx The button had no export callback and no disabled state.
- Affected code: `resources/shells/breadcrumb-header/index.tsx`
- Remediation: Add an optional callback, disable the control with an accessible reason when it is not connected, and wire a preview callback that produces visible status feedback.
- Regression: The Sites Worker browser test activates the control and checks its visible feedback; unit tests cover disabled and connected states.

### AUD-023 — Breadcrumb Header Save was an enabled no-op

- Evidence: [before screenshot](evidence/step-06/before/actions/breadcrumb-header-dead-control-before.png). Expected: Save should produce a visible host action or be disabled with an accessible explanation until its consumer is connected. Actual: The browser accepted activation of Save, but there was no response, navigation or state change.
- Reproduction:
  - Open /resources/breadcrumb-header/.
  - Activate Save; no feedback or state change occurs.
- Root cause: resources/shells/breadcrumb-header/index.tsx The button had no save callback and no disabled state.
- Affected code: `resources/shells/breadcrumb-header/index.tsx`
- Remediation: Add an optional callback, disable the control with an accessible reason when it is not connected, and wire a preview callback that produces visible status feedback.
- Regression: The Sites Worker browser test activates the control and checks its visible feedback; unit tests cover disabled and connected states.

### AUD-024 — Centered Top Navigation included an unconnected default CTA

- Evidence: [before screenshot](evidence/step-06/before/actions/centered-top-nav-dead-control-before.png). Expected: Get Started should produce a visible host action or be disabled with an accessible explanation until its consumer is connected. Actual: The browser accepted activation of Get Started, but there was no response, navigation or state change.
- Reproduction:
  - Open /resources/centered-top-nav/.
  - Activate Get Started; no feedback or state change occurs.
- Root cause: resources/shells/centered-top-nav/index.tsx The default CTA button had no action contract.
- Affected code: `resources/shells/centered-top-nav/index.tsx`
- Remediation: Add an optional callback, disable the control with an accessible reason when it is not connected, and wire a preview callback that produces visible status feedback.
- Regression: The Sites Worker browser test activates the control and checks its visible feedback; unit tests cover disabled and connected states.

### AUD-025 — Floating Navigation Open was an enabled no-op

- Evidence: [before screenshot](evidence/step-06/before/actions/floating-nav-dead-control-before.png). Expected: Open should produce a visible host action or be disabled with an accessible explanation until its consumer is connected. Actual: The browser accepted activation of Open, but there was no response, navigation or state change.
- Reproduction:
  - Open /resources/floating-nav/.
  - Activate Open; no feedback or state change occurs.
- Root cause: resources/shells/floating-nav/index.tsx The button had no open callback and no disabled state.
- Affected code: `resources/shells/floating-nav/index.tsx`
- Remediation: Add an optional callback, disable the control with an accessible reason when it is not connected, and wire a preview callback that produces visible status feedback.
- Regression: The Sites Worker browser test activates the control and checks its visible feedback; unit tests cover disabled and connected states.

### AUD-026 — Mega Navigation Launch was an enabled no-op

- Evidence: [before screenshot](evidence/step-06/before/actions/mega-nav-dead-control-before.png). Expected: Launch should produce a visible host action or be disabled with an accessible explanation until its consumer is connected. Actual: The browser accepted activation of Launch, but there was no response, navigation or state change.
- Reproduction:
  - Open /resources/mega-nav/.
  - Activate Launch; no feedback or state change occurs.
- Root cause: resources/shells/mega-nav/index.tsx The button had no launch callback and no disabled state.
- Affected code: `resources/shells/mega-nav/index.tsx`
- Remediation: Add an optional callback, disable the control with an accessible reason when it is not connected, and wire a preview callback that produces visible status feedback.
- Regression: The Sites Worker browser test activates the control and checks its visible feedback; unit tests cover disabled and connected states.

### AUD-027 — Transparent Navigation Docs was an enabled no-op

- Evidence: [before screenshot](evidence/step-06/before/actions/transparent-solid-nav-dead-control-before.png). Expected: Docs should produce a visible host action or be disabled with an accessible explanation until its consumer is connected. Actual: The browser accepted activation of Docs, but there was no response, navigation or state change.
- Reproduction:
  - Open /resources/transparent-solid-nav/.
  - Activate Docs; no feedback or state change occurs.
- Root cause: resources/shells/transparent-solid-nav/index.tsx The button had no navigation/action callback and no disabled state.
- Affected code: `resources/shells/transparent-solid-nav/index.tsx`
- Remediation: Add an optional callback, disable the control with an accessible reason when it is not connected, and wire a preview callback that produces visible status feedback.
- Regression: The Sites Worker browser test activates the control and checks its visible feedback; unit tests cover disabled and connected states.

### AUD-028 — Mega Navigation disclosure did not expose its expanded state

- Evidence: [before screenshot](evidence/step-06/before/actions/mega-nav-disclosure-before.png). Expected: The Products disclosure should report aria-expanded and identify the controlled menu while opening and closing it. Actual: The menu opened visually, but the button had no expanded-state attribute or controlled-menu relationship.
- Reproduction:
  - Open /resources/mega-nav/.
  - Activate Products; the menu appears without an exposed expanded state.
- Root cause: resources/shells/mega-nav/index.tsx toggled a menu visually without aria-expanded or aria-controls.
- Affected code: `resources/shells/mega-nav/index.tsx`
- Remediation: Expose aria-expanded and aria-controls on the disclosure button and identify the controlled menu. Keep the visual open/close behavior unchanged.
- Regression: The Sites Worker browser test opens and closes the menu and checks its visible state and aria-expanded value.

### AUD-029 — Footer claimed system status was Operational without a live status source

- Evidence: [before screenshot](evidence/step-06/before/navigation/footer-minimal-dead-links-before.png). Expected: A status label should not claim availability unless it is backed by a live status source. Actual: The default footer stated “Status: Operational” in a static resource preview.
- Reproduction:
  - Open /resources/footer-minimal/ at 390x844.
  - Read the footer status label.
- Root cause: resources/sections/footer-minimal/index.tsx hardcoded an operational-health claim into a generic static footer.
- Affected code: `resources/sections/footer-minimal/index.tsx`
- Remediation: Replace the unsupported live-status claim with neutral status text unless a real status source is supplied.
- Regression: The resource browser evidence and content review verify the neutral default label.

## False-positive probe results

The first generic keyboard probe compared whole-document HTML before and after
pressing Enter on the first button. It also flagged the already-selected row/tab
in the two-pane and split-hero examples and missed the transient fade transition.
Those three were not defects. The final test now checks the native click event and
the expected control-specific visible result; the full Gold matrix passes.

## Audit-tool isolation limit

Attempting to inject Axe into the opaque resource iframe caused Axe's stylesheet
inspection to issue a fetch that the intended preview policy blocked with
`connect-src 'none'`. This came from the injected audit script, not from the
application during normal use. The CSP was preserved, the failed probe was
removed from product evidence, and accessibility scanning inside the isolated
preview remains outstanding until an isolation-preserving approach is available.

## Current browser evidence

- All 324 catalogue previews rendered at 360, 390, 430, 768, 1024, 1280 and
  1440px. All 972 declared variants were selected and rendered at desktop width.
  Zero console errors, page exceptions, failed requests, HTTP errors, unresolved
  resource fallbacks, dead links or overflows remained after fixes.
- The canonical `/r/ai-prompt-hero/` page returned HTTP 200 at 390x844 and
  1440x900, with the exact document title, exact heading, live preview, no
  browser errors and no horizontal page overflow. Its desktop preview measured
  764px; evidence is in `results/canonical-resource-route.json`.
- The focused 13-resource navigation/control run covered the 52 former placeholder links, six no-op controls, mobile drawer behavior and mega-menu disclosure; it recorded zero browser findings.
- All 40 Gold resources rendered each of their three declared variants at 360,
  390, 430, 768, 1024, 1280 and 1440; each preview retained its isolated iframe
  sandbox. All 33 tested enabled controls were reachable with visible keyboard
  focus, Enter activated them and the expected result appeared. Reduced Motion
  was toggled through the visible toolbar and reached the renderer for all 40.
- Before/after screenshots are under `audit/evidence/step-06/`; machine-readable outputs are in `audit/evidence/step-06/results/`.
- All 42 entries remain `fixed-awaiting-deployed-verification`; local success
  does not establish behavior on the public review Site.
- This does not yet certify every loading, empty, error, long-text or large-data
  state; screen-reader semantics, full contrast coverage, or public deployment
  behavior.

## Expanded resource-certification findings

These findings came from the seven-width audit and subsequent visual review. The
initial failed run recorded compact-preview overflow in 11 resources. Its
Playwright screenshots were cleared by a later run before 10 of those images had
been copied into durable evidence; the limitation is recorded in the machine
ledger rather than inventing before screenshots. Current screenshots document
the corrected layouts. The two retained AI Prompt Hero before screenshots show
the representative iframe overflow and malformed wide resource-detail layout.

### HIGH

### AUD-030 — Interpolated resource title corrupted the detail-page DOM

- Evidence: before screenshot [`ai-prompt-hero-1280-overflow.png`](evidence/step-06/before/wide-matrix/ai-prompt-hero-1280-overflow.png); after screenshot [`resources-ai-prompt-hero-1280.png`](evidence/step-06/after/resource-layout/resources-ai-prompt-hero-1280.png). Before the fix, the title was truncated and the preview measured 237px at a 1280px viewport.
- Reproduction: open `/resources/ai-prompt-hero/` at 1280x900 and inspect the document title, heading, tag list and preview/inspector grid.
- Root cause: splitting the title around `manifest.slug` made Astro hoist the closing `title` and `head` markup into the middle of the title text. The malformed template then produced invalid body nesting and a narrow preview across the resource-detail pages.
- Affected code: `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/r/[slug].astro`.
- Remediation: emit the complete title as one expression, use a semantic resource header and keep the preview/inspector columns min-width-safe. Both detail routes now use the same structure.
- Regression: the browser test requires the exact title and exact level-one heading, checks `/r/ai-prompt-hero/` at 390px and 1440px, and verifies the desktop preview remains at least 500px wide.

## MEDIUM

### AUD-031 — AI activity feed overflowed at 360px

- Evidence: current screenshot [`resources-ai-agent-activity-feed-360.png`](evidence/step-06/after/resource-layout/resources-ai-agent-activity-feed-360.png). The initial seven-width run recorded inner preview overflow.
- Reproduction: open `/resources/ai-agent-activity-feed/` at 360x844.
- Root cause: timestamp, agent badge and long action text competed for one row without a compact reflow.
- Affected code: `resources/ai/ai-agent-activity-feed/index.tsx`.
- Remediation: wrap event metadata and give action text a full-width flex basis on compact screens. A regression also asserts the action occupies at least 60% of the preview width.

### AUD-032 — AI prompt hero overflowed its preview

- Evidence: before screenshots [`360px`](evidence/step-06/before/wide-matrix/ai-prompt-hero-360-overflow.png) and [`1280px`](evidence/step-06/before/wide-matrix/ai-prompt-hero-1280-overflow.png); corrected screenshots are under `evidence/step-06/after/resource-layout/`. The initial widths were 306px content in a 292px preview at 360px, and 279px content in a 237px preview at 1280px and 1440px.
- Reproduction: open `/resources/ai-prompt-hero/` at 360x844 or 1280x900.
- Root cause: centered intrinsic-width flex content, fixed side padding and non-wrapping prompt controls exceeded the iframe.
- Affected code: `resources/sections/ai-prompt-hero/index.tsx`.
- Remediation: make the content column full-width and shrinkable, break long text, and wrap the prompt action row and preset chips.

### AUD-033 — AI source citation rows overflowed at 360px

- Evidence: current screenshot [`resources-ai-source-citations-360.png`](evidence/step-06/after/resource-layout/resources-ai-source-citations-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/ai-source-citations/` at 360x844.
- Root cause: source title and long path shared a fixed non-wrapping row.
- Affected code: `resources/ai/ai-source-citations/index.tsx`.
- Remediation: wrap the row and allow source paths to break anywhere.

### AUD-034 — Breadcrumb header overflowed at 360px

- Evidence: current screenshot [`resources-breadcrumb-header-360.png`](evidence/step-06/after/resource-layout/resources-breadcrumb-header-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/breadcrumb-header/` at 360x844.
- Root cause: fixed-height, single-row breadcrumbs and actions used desktop padding.
- Affected code: `resources/shells/breadcrumb-header/index.tsx`.
- Remediation: use a minimum height, compact padding and wrapping layouts for the trail and actions.

### AUD-035 — Counter typography overflowed at 360px

- Evidence: current screenshot [`resources-counter-typography-360.png`](evidence/step-06/after/resource-layout/resources-counter-typography-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/counter-typography/` at 360x844.
- Root cause: large value, unit and delta were forced onto one baseline row.
- Affected code: `resources/typography/counter-typography/index.tsx`.
- Remediation: allow the number/unit row to wrap and move the delta onto its own compact-width line.

### AUD-036 — Floating assistant dialog overflowed at 360px

- Evidence: current screenshot [`resources-floating-ai-assistant-360.png`](evidence/step-06/after/resource-layout/resources-floating-ai-assistant-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/floating-ai-assistant/` at 360x844.
- Root cause: an inline-flex wrapper and fixed 20rem dialog retained desktop intrinsic width.
- Affected code: `resources/ai/floating-ai-assistant/index.tsx`.
- Remediation: let the dialog use its wrapper width and cap that wrapper at the existing 20rem maximum.

### AUD-037 — Inline rewrite toolbar overflowed at 360px

- Evidence: current screenshot [`resources-inline-ai-rewrite-360.png`](evidence/step-06/after/resource-layout/resources-inline-ai-rewrite-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/inline-ai-rewrite/` at 360x844.
- Root cause: header, tone and action controls were grouped in fixed horizontal flex rows.
- Affected code: `resources/ai/inline-ai-rewrite/index.tsx`.
- Remediation: permit the header and control groups to wrap at compact widths.

### AUD-038 — Integration filters overflowed at 360px

- Evidence: current screenshot [`resources-integration-directory-preview-360.png`](evidence/step-06/after/resource-layout/resources-integration-directory-preview-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/integration-directory-preview/` at 360x844.
- Root cause: the category-chip row was centered but did not wrap.
- Affected code: `resources/sections/integration-directory-preview/index.tsx`.
- Remediation: enable wrapping while preserving centered alignment.

### AUD-039 — Interactive demo controls overflowed at 360px

- Evidence: current screenshot [`resources-interactive-demo-hero-360.png`](evidence/step-06/after/resource-layout/resources-interactive-demo-hero-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/interactive-demo-hero/` at 360x844.
- Root cause: density, mode and workspace status controls were fixed to horizontal rows.
- Affected code: `resources/sections/interactive-demo-hero/index.tsx`.
- Remediation: let control groups and preview status wrap within the demo card.

### AUD-040 — Mega navigation overflowed at 360px

- Evidence: current screenshot [`resources-mega-nav-360.png`](evidence/step-06/after/resource-layout/resources-mega-nav-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/mega-nav/` at 360x844.
- Root cause: a fixed-height single row and desktop dropdown spacing required more width than the preview had.
- Affected code: `resources/shells/mega-nav/index.tsx`.
- Remediation: use a minimum height, wrapping navigation and a compact single-column dropdown.

### AUD-041 — Multi-series chart legend overflowed at 360px

- Evidence: current screenshot [`resources-multi-series-line-chart-360.png`](evidence/step-06/after/resource-layout/resources-multi-series-line-chart-360.png); the initial width matrix recorded overflow.
- Reproduction: open `/resources/multi-series-line-chart/` at 360x844.
- Root cause: legend controls occupied one unbreakable horizontal row beside the chart heading.
- Affected code: `resources/data/multi-series-line-chart/index.tsx`.
- Remediation: cap and wrap legend controls within the chart width.

### AUD-042 — AI activity text remained too narrow after wrapping

- Evidence: the failing browser assertion measured 56px of action text in a 292px preview. The corrected screenshot is [`resources-ai-agent-activity-feed-360.png`](evidence/step-06/after/resource-layout/resources-ai-agent-activity-feed-360.png).
- Reproduction: open `/resources/ai-agent-activity-feed/` at 360x844 and inspect the first activity action.
- Root cause: wrapping the row fixed horizontal overflow but still allowed the action flex item to shrink alongside timestamp and agent metadata.
- Affected code: `resources/ai/ai-agent-activity-feed/index.tsx`, `tests/e2e/catalog-resource-render.spec.ts`.
- Remediation: give the action a full row below the small-screen breakpoint and assert a 60% minimum content width.

The first 324-resource all-variant attempt exposed a test-only iframe navigation
race: it inspected the old document after the variant `src` changed. The test
now waits for the preview frame's load event; the 12-resource regression passed
with zero findings. That harness race is not counted as a product defect.

### AUD-043 — Advanced data table had no empty or no-match state

- Evidence: [`advanced-data-table-empty-360.png`](evidence/step-06/after/state-captures/advanced-data-table-empty-360.png); machine diagnostics and long/large-data interactions are in [`gold-resource-states-final.json`](evidence/step-06/results/gold-resource-states-final.json).
- Reproduction: open `/resources/advanced-data-table/` at 360x844, pass an empty `rows` array, or filter a non-empty table to a value with no matches.
- Root cause: the table mapped the filtered rows but rendered no row or status when the result count was zero.
- Affected code: `resources/blocks/advanced-data-table/index.tsx`.
- Remediation: render an accessible live status that distinguishes an empty dataset from a filter with no matches; exercise both states in the browser regression.

### AUD-044 — Kanban board had no empty-board guidance

- Evidence: [`kanban-board-empty-360.png`](evidence/step-06/after/state-captures/kanban-board-empty-360.png); machine diagnostics and long/large-data interactions are in [`gold-resource-states-final.json`](evidence/step-06/results/gold-resource-states-final.json).
- Reproduction: open `/resources/kanban-board/` at 360x844 and pass an empty `columns` array.
- Root cause: the board rendered its heading and an empty column grid with no explanation when the array was empty.
- Affected code: `resources/blocks/kanban-board/index.tsx`.
- Remediation: render a responsive, accessible empty-state message and cover it with a browser regression.

### AUD-045 — Marketing CTA preview header overflowed in Linux Chromium

- Evidence: the [failed CI log and captured DOM measurements](evidence/step-06/before/marketing-nav-cta-ci-failure.md) show a 316–321px document inside a 292px iframe at a 360px outer viewport. The [post-fix 360px and 390px captures](evidence/step-06/after/resource-layout/) show the header reflow. The new regression diagnostics are in `evidence/step-06/results/marketing-nav-cta-responsive.json`.
- Reproduction: run the Sites Worker catalogue matrix in Linux Chromium and open `/resources/marketing-nav-cta/` at 360x844.
- Root cause: the brand and navigation/CTA occupied one horizontal flex row with desktop spacing. Linux font metrics pushed its intrinsic width beyond the preview.
- Affected code: `resources/shells/marketing-nav-cta/index.tsx`, `tests/e2e/catalog-resource-render.spec.ts`.
- Remediation: allow the header and navigation group to wrap, tighten compact CTA spacing, and assert no overflow or overlap at 360px and 390px.

### AUD-046 — Timeline had no empty-event state

- Evidence: the before capture [`timeline-empty-360-before.png`](evidence/step-06/before/state-captures/timeline-empty-360-before.png) shows a blank event area; the corrected [`timeline-empty-360.png`](evidence/step-06/after/state-captures/timeline-empty-360.png) shows the accessible status.
- Reproduction: open `/resources/timeline/` at 360x844 and set the preview `events` array to empty.
- Root cause: Timeline mapped events without a zero-event branch.
- Affected code: `resources/blocks/timeline/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: render a polite status for an empty event list and test it alongside long event content.

### AUD-047 — KPI grid had no empty-card state

- Evidence: [`dashboard-kpi-grid-empty-360-before.png`](evidence/step-06/before/state-captures/dashboard-kpi-grid-empty-360-before.png) shows the unexplained blank card area; [`dashboard-kpi-grid-empty-360.png`](evidence/step-06/after/state-captures/dashboard-kpi-grid-empty-360.png) shows the empty status.
- Reproduction: open `/resources/dashboard-kpi-grid/` at 360x844 and set `cards` to an empty array.
- Root cause: the grid mapped cards directly and had no zero-card state.
- Affected code: `resources/blocks/dashboard-kpi-grid/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: display an accessible empty-state status and test large, long-label input.

### AUD-048 — Empty notification centre had no status and an enabled no-op action

- Evidence: [`notification-centre-empty-360-before.png`](evidence/step-06/before/state-captures/notification-centre-empty-360-before.png) shows the empty list and active action; [`notification-centre-empty-360.png`](evidence/step-06/after/state-captures/notification-centre-empty-360.png) shows the truthful message and disabled action.
- Reproduction: open `/resources/notification-centre/` at 360x844 with an empty `events` array, then activate **Mark all as read**.
- Root cause: there was no empty-state branch and the action did not check whether unread notifications existed.
- Affected code: `resources/blocks/notification-centre/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: announce the empty list and disable the action unless unread notifications are present.

### AUD-049 — Notification centre ignored event updates after mount

- Evidence: the browser regression started from [`notification-centre-empty-360-before.png`](evidence/step-06/before/state-captures/notification-centre-empty-360-before.png) and then supplied 50 events; the final event is visible in [`notification-centre-large-360.png`](evidence/step-06/after/state-captures/notification-centre-large-360.png).
- Reproduction: set `events` to empty, update it with 50 entries, and check for the 50th notification.
- Root cause: the component read `events` only in the `useState` initializer, so preview-host updates left stale local state.
- Affected code: `resources/blocks/notification-centre/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: synchronize item state when supplied events change and verify the update through the isolated preview iframe.

### AUD-050 — Mark-all-read action had no accessible confirmation

- Evidence: the original browser test failed to find a status region after keyboard activation; the corrected interaction capture [`notification-centre-read-feedback-360.png`](evidence/step-06/after/state-captures/notification-centre-read-feedback-360.png) shows the announced result. The pre-fix after-click screenshot was not retained.
- Reproduction: focus **Mark all as read** with unread notifications and press Enter; the original implementation changed styling without announcing completion.
- Root cause: the action only changed local read flags and rendered no live status.
- Affected code: `resources/blocks/notification-centre/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: announce the count in a polite status and disable the action after all notifications are read.

### AUD-051 — Empty time-series chart displayed a false zero

- Evidence: [`time-series-chart-empty-360-before.png`](evidence/step-06/before/state-captures/time-series-chart-empty-360-before.png) shows the zero metric and axes without samples; the corrected [`time-series-chart-empty-360.png`](evidence/step-06/after/state-captures/time-series-chart-empty-360.png) reports the no-data state.
- Reproduction: open `/resources/time-series-chart/` at 360x844 and set `data` to an empty array.
- Root cause: the missing final sample fell through to a numeric zero, while the chart always rendered axes and had no empty-data state.
- Affected code: `resources/data/time-series-chart/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: hide the numeric metric and axes for an empty dataset and expose an accessible no-data message.

### AUD-052 — Command-first navigation overflowed at 360px in Linux Chromium

- Evidence: the [Linux CI failure log](evidence/step-06/before/linux-compact-resource-overflows.md) measured 303px of content in a 292px preview; the after capture is [`resources-command-first-nav-360.png`](evidence/step-06/after/resource-layout/resources-command-first-nav-360.png).
- Reproduction: run the Sites Worker catalogue matrix in Linux Chromium and open `/resources/command-first-nav/` at 360x844.
- Root cause: the title, search prompt and status were forced into one fixed-height row with desktop padding.
- Affected code: `resources/shells/command-first-nav/index.tsx`, `tests/e2e/catalog-resource-render.spec.ts`.
- Remediation: put the search prompt on a full-width compact row, allow header height to grow, and capture 360px/1440px evidence.
- Verification: the rebuilt 324-resource matrix passed at all seven widths with zero findings; status remains `fixed-awaiting-deployed-verification` pending Linux CI and public review re-audit.

### AUD-053 — Feature tabs overflowed at 360px in Linux Chromium

- Evidence: the [Linux CI failure log](evidence/step-06/before/linux-compact-resource-overflows.md) measured 296px of content in a 292px preview; the after capture is [`resources-feature-tabs-360.png`](evidence/step-06/after/resource-layout/resources-feature-tabs-360.png).
- Reproduction: run the Sites Worker catalogue matrix in Linux Chromium and open `/resources/feature-tabs/` at 360x844.
- Root cause: three tab buttons used fixed horizontal padding in a non-wrapping row.
- Affected code: `resources/sections/feature-tabs/index.tsx`, `tests/e2e/catalog-resource-render.spec.ts`.
- Remediation: permit wrapping and reduce button padding at compact widths.
- Verification: the rebuilt 324-resource matrix passed at all seven widths with zero findings; status remains `fixed-awaiting-deployed-verification` pending Linux CI and public review re-audit.

### AUD-054 — Gradient headline overflowed at 360px in Linux Chromium

- Evidence: the [Linux CI failure log](evidence/step-06/before/linux-compact-resource-overflows.md) measured 304px of content in a 292px preview; the after capture is [`resources-gradient-accent-text-360.png`](evidence/step-06/after/resource-layout/resources-gradient-accent-text-360.png).
- Reproduction: run the Sites Worker catalogue matrix in Linux Chromium and open `/resources/gradient-accent-text/` at 360x844.
- Root cause: desktop padding and a 30px heading left too little space for longer headline words inside the preview.
- Affected code: `resources/typography/gradient-accent-text/index.tsx`, `tests/e2e/catalog-resource-render.spec.ts`.
- Remediation: reduce compact-width padding and heading size, and allow long headline words to wrap.
- Verification: the rebuilt 324-resource matrix passed at all seven widths with zero findings; status remains `fixed-awaiting-deployed-verification` pending Linux CI and public review re-audit.

### AUD-055 — Empty Kanban state suggested unavailable add actions

- Evidence: the before capture shows an empty status telling the user to add a column or task, while the preview exposes no add controls. The after capture states the board condition without promising an action.
- Reproduction: open `/resources/kanban-board/` at 360x844, set `columns` to an empty array, and inspect the status and controls.
- Root cause: the empty-state copy described add functionality that the standalone resource does not implement.
- Affected code: `resources/blocks/kanban-board/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: use a factual empty-state status and assert the empty preview does not promise absent actions.
- Regression: the Sites Worker browser test first failed on the old status, then passed with the updated status and zero buttons in the empty state. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-056 — Kanban sample tasks displayed fabricated catalogue counts

- Evidence: the before capture contains “Scale 56 application blocks”, “72 Marketing sections verified” and “44 Primitives complete”. The after capture uses representative onboarding tasks without product totals.
- Reproduction: open `/resources/kanban-board/` at 360x844 and inspect the default task cards.
- Root cause: the default demo fixture embedded unsupported product counts in task text.
- Affected code: `resources/blocks/kanban-board/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: replace fabricated totals with representative onboarding tasks and assert those false claims are absent in the browser preview.
- Regression: the Sites Worker browser test failed when the old metric was visible; the rebuilt 40-resource Gold matrix and updated six-resource state test pass. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-057 — Bar chart implied its sample values were real sign-up data

- Evidence: the [before capture](evidence/step-06/before/state-captures/bar-chart-unlabelled-sample-360.png) shows operational sign-up copy and a total without a sample-data disclosure; the [after capture](evidence/step-06/after/browser-captures/gold-40/bar-chart-360.png) names sample sign-ups and labels the values illustrative.
- Reproduction: open `/resources/bar-chart/` at 360x844 and inspect the chart heading, description and total.
- Root cause: fixed demo values were labeled as daily conversions and a total.
- Affected code: `resources/data/bar-chart/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: identify the chart and total as sample data and show an explicit illustrative-data disclaimer. The regression asserts both in the real preview iframe. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-058 — Donut chart implied sample subscription shares were actual revenue data

- Evidence: the [before capture](evidence/step-06/before/state-captures/donut-chart-unlabelled-sample-360.png) describes fixed segments as tier revenue contribution; the [after capture](evidence/step-06/after/browser-captures/gold-40/donut-chart-360.png) labels the subscription mix as a sample and discloses illustrative data.
- Reproduction: open `/resources/donut-chart/` at 360x844 and inspect the title, explanation and fixed segments.
- Root cause: bundled demo values used product revenue copy without a disclosure.
- Affected code: `resources/data/donut-chart/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: identify the visualization as a sample and disclose that values are illustrative. The regression asserts both labels in the preview iframe. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-059 — Area chart implied fixed ingestion values were live measurements

- Evidence: the [before capture](evidence/step-06/before/state-captures/area-chart-unlabelled-sample-360.png) shows a cluster-ingestion claim and 420 GB peak without sample context; the [after capture](evidence/step-06/after/browser-captures/gold-40/area-chart-360.png) identifies a sample and discloses illustrative values.
- Reproduction: open `/resources/area-chart/` at 360x844 and inspect the chart heading, explanation and peak value.
- Root cause: fixed demo values were described as current ingestion measurements.
- Affected code: `resources/data/area-chart/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: make the sample context explicit and label the peak as a sample value. The regression asserts the sample title and disclosure in the preview iframe. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-060 — Time-series chart claimed real-time data without a source

- Evidence: the [before capture](evidence/step-06/before/state-captures/time-series-chart-unlabelled-live-data-360.png) shows a hard-coded API throughput series labeled as real-time; the [after capture](evidence/step-06/after/browser-captures/gold-40/time-series-chart-360.png) identifies a sample series and discloses illustrative data.
- Reproduction: open `/resources/time-series-chart/` at 360x844 and inspect the default title and status copy.
- Root cause: a static default dataset was paired with real-time language and no sample label.
- Affected code: `resources/data/time-series-chart/index.tsx`, `tests/e2e/gold-resource-state-certification.spec.ts`.
- Remediation: use a sample-specific title and explicitly disclose that there is no live measurement source. The regression asserts both in the preview iframe. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-061 — Nocturne muted text fell below WCAG contrast across 15 Gold resources

- Evidence: the [before capture](evidence/step-06/before/a11y-gold/ai-prompt-composer-nocturne-1440.png) shows low-contrast muted copy; the [after capture](evidence/step-06/after/a11y-gold/ai-prompt-composer-nocturne-1440.png) uses a readable Nocturne token. The full baseline report records 23 contrast violations across 15 Nocturne resources.
- Reproduction: open `/preview/?resource=ai-prompt-composer&variant=nocturne` at 1440x900 and run Axe with WCAG 2.2 AA tags.
- Root cause: muted ink tokens changed for `.dark` but were not scoped to the `data-resource-variant="nocturne"` variant used by isolated resource previews.
- Affected code: `apps/site/src/styles/global.css` and the muted-copy resources listed in `audit/runtime-audit.json`.
- Remediation: set Nocturne muted ink tokens on the resource-variant scope and give the fade-up replay control a matching dark surface. The final matrix reports zero violations. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-062 — AI research confidence badge had insufficient contrast on light surfaces

- Evidence: the [before capture](evidence/step-06/before/a11y-gold/ai-research-answer-quiet-1440.png) shows the light green badge; the [after capture](evidence/step-06/after/a11y-gold/ai-research-answer-quiet-1440.png) uses a darker light-theme label.
- Reproduction: open `/preview/?resource=ai-research-answer&variant=quiet` and run Axe.
- Root cause: the green confidence color measured 2.34:1 on the pale badge background.
- Affected code: `resources/ai/ai-research-answer/index.tsx`.
- Remediation: use a darker green for light variants and a lighter green for Nocturne. The final matrix reports zero violations. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-063 — Feature matrix status text fell below WCAG contrast on light surfaces

- Evidence: the [before capture](evidence/step-06/before/a11y-gold/feature-matrix-quiet-1440.png) shows the status values; the [after capture](evidence/step-06/after/a11y-gold/feature-matrix-quiet-1440.png) uses higher-contrast values.
- Reproduction: open `/preview/?resource=feature-matrix&variant=quiet` and run Axe.
- Root cause: emerald-600 measured 3.65:1 on white and 3.32:1 on the Expressive surface.
- Affected code: `resources/sections/feature-matrix/index.tsx`.
- Remediation: use emerald-800 on light surfaces and emerald-300 on Nocturne. The final matrix reports zero violations. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-064 — Error-state heading fell below WCAG contrast on its expressive background

- Evidence: the [before capture](evidence/step-06/before/a11y-gold/error-state-expressive-1440.png) shows the red heading; the [after capture](evidence/step-06/after/a11y-gold/error-state-expressive-1440.png) uses a darker red.
- Reproduction: open `/preview/?resource=error-state&variant=expressive` and run Axe.
- Root cause: red-600 measured 4.31:1 on the blush background.
- Affected code: `resources/states/error-state/index.tsx`.
- Remediation: use red-700 on light surfaces and preserve red-400 on Nocturne. The final matrix reports zero violations. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

### AUD-065 — Recommended pricing badge had insufficient contrast in all variants

- Evidence: the [before capture](evidence/step-06/before/a11y-gold/pricing-three-tier-nocturne-1440.png) shows the low-contrast badge; the [after capture](evidence/step-06/after/a11y-gold/pricing-three-tier-nocturne-1440.png) uses a lighter label on the dark surface.
- Reproduction: open `/preview/?resource=pricing-three-tier&variant=nocturne` and run Axe.
- Root cause: emerald-600 measured 3.31:1 on light surfaces and 4.17:1 on the Nocturne badge.
- Affected code: `resources/sections/pricing-three-tier/index.tsx`.
- Remediation: use emerald-800 on light surfaces and emerald-300 on Nocturne. The final matrix reports zero violations. Status remains `fixed-awaiting-deployed-verification` pending public review re-audit.
