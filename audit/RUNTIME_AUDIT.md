# Runtime audit — resource and renderer hardening

This audit combines public route inspections and real-browser checks of the
deployed Astro/React Site, Workbench, Sites Worker boundary, and clean standalone
exports. Site v11 verified the exact employee-experience brief from Compose to
Direction C in Workbench at desktop and mobile widths; Site v14 reran that visible
Compose-to-Direction-C smoke at the same widths. Site v13 verified the Reduced
Motion toolbar state; Site v14 verifies the toolbar and Replay Entrance together.
Historic route and flagship captures remain under
[`evidence/public-site-v10`](evidence/public-site-v10) and
[`evidence/public-site-v11`](evidence/public-site-v11). The latest targeted
captures are under `evidence/step-07/deployed-v13-after-fix/`,
`evidence/step-07/deployed-v13-replay-failure/`, and
`evidence/step-07/deployed-v14-after-fix/`, and `evidence/deployed-v14-flagship/`. Machine-readable findings and status
are in [`runtime-audit.json`](./runtime-audit.json); a finding closes only after
its affected behavior passes on a published review version.

**Current disposition:** 155 findings (37 High, 117 Medium, 1 Low): 27 closed after deployed verification, 90 fixed and awaiting issue-specific deployed checks, 35 verified locally (AUD-085 in the separate Vite preview runtime and AUD-122–155 in Compose/resource/Workbench previews), and AUD-080, AUD-100, and AUD-106 remain open. Site v20 closes AUD-088–099. Step 14 added AUD-101–105 and AUD-107–142; Step 15 added AUD-143–147; Step 17 added AUD-148–149; Step 18 added AUD-150–151; Step 19 added AUD-152–155 for screen route integrity, page route validation, reachable layer mutations, and mutation-tier accuracy. The composition, data-truth, resource-accessibility, and Workbench findings are fixed locally, with deployed review verification still pending. AUD-134–137 record ecommerce, digital music, flight-management, and film-streaming briefs that inherited unrelated product workflows; AUD-138 records flight-oriented copy in destination search; AUD-139 records the missing Product Catalog to Product Detail path; AUD-140 records dark-canvas contrast failures in expressive Gold resource variants; AUD-141 records keyboard-inaccessible scrollable Gold resource content; AUD-142 records mobile clipping in the three-pane shell; AUD-148 records disabled-control canvas selection failure; AUD-149 records resource-kind flattening in composition; AUD-150 records incorrect Project Scope DNA labels; AUD-151 records unclear lock snapshot behavior. The full current-source visible benchmark covered 100 briefs and 300 directions at desktop and mobile sizes; reports record zero unresolved diagnostics, console errors, warnings, uncaught exceptions, failed requests, or HTTP errors. Issue-specific before/after captures and red/green regressions are recorded. The showcase browser check also exposed duplicate navigation in the AI Developer Platform (AUD-106), tracked for Step 43. The desktop Explore Axe scan found a moderate heading-order issue inside the AI Chat Panel resource preview (AUD-100), tracked for the ordered accessibility/resource hardening step. Broader route, accessibility, and flagship work remains in the ordered hardening programme. See quality/STEP_08_EVIDENCE.md, quality/STEP_14_EVIDENCE.md, quality/STEP_15_EVIDENCE.md, quality/STEP_17_EVIDENCE.md, quality/STEP_18_EVIDENCE.md, and evidence/catalog-search-v20/.

The v11 and v14 flagship smoke reports record the exact employee-experience brief at 1440 × 900 and 390 × 844: all 324 catalogue entries loaded, all three previews rendered, Direction C opened Workbench, the favicon returned HTTP 200 as image/svg+xml, and the unknown-resource route exposed one assertive alert without a substitute or controls. Both versions had no Compose or Workbench horizontal overflow at 390px. Site v14 recorded zero console errors, uncaught exceptions, failed requests, or HTTP errors across the smoke at either viewport.

The v11 audit found AUD-082 (the exported nine-screen selector wrapped into three rows at 390px) and AUD-083 (Fade-Up Replay Entrance reversed after 50 ms, before its 300–700 ms transition completed). Site v14 closes AUD-082: the exported nine-screen project was downloaded through the public Workbench, validated against the canonical manifest schema, installed and built outside the repo, then opened in a real browser at desktop and mobile sizes. All nine selector buttons stayed in one row, screen switches worked, and there were zero browser/network errors. Site v14 also closes AUD-083: a 40-sample replay trace reached opacity 0 at 310 ms for four samples and finished at opacity 1.

Site v12 reproduced AUD-084; Site v13 confirms the Reduced Motion toggle sets transition and animation duration to 0s while ON and restores 0.3s while OFF. A race in the first v13 audit sampled before iframe reload completed; the corrected harness waits for computed styles and root state. That recheck exposed AUD-086: Replay still hid the card while Reduced Motion was on. Site v14 now keeps opacity at 1 and announces that motion was skipped. The v13/v14 resource-page runs loaded the 324-resource catalogue and recorded zero console errors, uncaught exceptions, failed requests, or HTTP errors; the mobile route had no overflow.

The separate Vite preview app also omitted resource utility classes (AUD-085); its before/after captures show the layout correction, and its production CSS grew from 34.75 kB to 149.42 kB to include existing resource styles. Local validation for canonical code commit 32803eb15d72b4020fe6aec90e9b587e2f7812fb passed: 85 main-browser tests (53 project-scoped skips), 26 Sites Worker tests, 3 preview-app tests, 622 unit/integration tests, lint with zero errors and 51 configured warnings, and all 16 pnpm audit:all gates plus build, bundle, provenance, and security audits. GitHub CI for that code commit passed. The production build created 717 Astro pages. Public Site v14 is based on Sites source commit 7323e8e9edfb6e07c5485c9d19ff37a8ca8043f5; its canonical code source is GitHub commit 32803eb15d72b4020fe6aec90e9b587e2f7812fb.

At the Step 06 checkpoint, `pnpm test:e2e` passed: 73 of 124 desktop/mobile browser tests passed, 51 tests were explicitly skipped by project scope, and all 23 Sites Worker tests passed. It included the expanded state and action regressions. The 11-case state matrix, exact-resource readiness check, dialog modal regression, Prompt Composer action regression, and 40 × 3 Axe matrix passed. The catalogue report covered 324 resources and 972 variants with zero findings, failed requests or cancellations; the Gold report covered 40 resources / 120 variants with zero findings. Existing state fixtures cover six Gold data resources; the expanded matrix covers array-driven resources at empty and 30–40 item counts, disabled Button/Input/Select, named loading/error states, long text, and fixed-slot partial data. See [`e2e-suite-final.json`](evidence/step-06/results/e2e-suite-final.json) and the individual browser reports alongside it.

## CRITICAL

No Critical findings are recorded in this audit register.

## HIGH

### AUD-101 — Freelance marketplace messages contained booking workflows

- **Evidence:** the before browser screenshot `quality/evidence/composition-quality/before/composition-mkt-01-direction-01.png` shows host booking, date selection, payment confirmation, and seller inventory setup in a freelance designer inbox. The after capture shows client inquiry and designer proposal examples.
- **Reproduction:** open `/compose` at 1440 × 900, enter benchmark brief MKT-01, compose, then inspect Direction A's Messages & Inquiries screen.
- **Root cause:** the generic marketplace archetype reused accommodation and transaction workflows for freelance services.
- **Affected code:** `packages/composer/src/domain-context.ts`, `packages/composer/src/interpreter.ts`, and `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** specialize the existing marketplace archetype using service/proposal intent and protect other appointment/listing contexts with benchmark fixtures. The fix passes locally; deployed verification remains open.
- **Related evidence:** `quality/STEP_14_EVIDENCE.md`, `quality/evidence/composition-quality/after/runtime.json`.

### AUD-102 — Community activity stream used an inbox resource

- **Evidence:** the before screenshot `quality/evidence/composition-quality/before/composition-con-04-direction-01.png` shows a chronological community stream rendered with the notification centre and “Mark all as read”. After the fix all three directions use the Gold timeline.
- **Reproduction:** open `/compose` at 1440 × 900, enter CON-04, compose, and inspect Activity Stream in Directions A, B, and C.
- **Root cause:** `activity-feed` admitted an inbox resource whose semantics conflict with community posts and conversations.
- **Affected code:** `packages/compatibility/src/compose-pipeline.ts` and `packages/compatibility/src/semantic-roles.ts`.
- **Remediation:** select the chronological Gold timeline for consumer community feeds. Local benchmark and browser regressions pass; deployed verification remains open.
- **Related evidence:** `quality/STEP_14_EVIDENCE.md`, `quality/evidence/composition-quality/after/runtime.json`.

### AUD-103 — Marketplace messaging roles lacked Gold contracts

- **Evidence:** the initial no-override benchmark reported unresolved required message roles. The after runtime report records channels-rail, message-thread, and message-composer resolved to `collapsible-sidebar`, `timeline`, and `input` across A/B/C.
- **Reproduction:** run the no-override composition benchmark before adding the role mappings and inspect required-role diagnostics for marketplace message screens.
- **Root cause:** `ROLE_RESOURCES` omitted channels-rail, message-thread, and message-composer.
- **Affected code:** `packages/compatibility/src/semantic-roles.ts`, `packages/compatibility/src/compose-pipeline.ts`, and `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** add explicit Gold contracts, avoid duplicate navigation beside a channels rail, and disclose that message sending requires a connected backend. Local benchmark and browser tests pass; deployed verification remains open.
- **Related evidence:** `quality/STEP_14_EVIDENCE.md`, `quality/evidence/composition-quality/after/runtime.json`.

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
- Remediation: initialize URL state before rendering, remove the unrelated fallback, display an unavailable state, and report an error without reporting readiness. Site v10 now displays the unknown-resource diagnostic and no substitute button, so this finding is closed after deployed verification; a separate alert-semantics finding is AUD-081.

### AUD-072 — Workbench dropped nested children when a resource also had prop children

- Evidence: the [before capture](evidence/step-07/before/manifest-prop-child-only.png) contains only the explicit prop child; the [fixed canvas capture](evidence/step-07/after/manifest-and-prop-children.png) and [Workbench Preview capture](evidence/step-07/after/preview-modal-children.png) contain both sources. The pre-fix browser probe found the nested node count was zero, with no console or network errors.
- Reproduction: open the seeded Workbench manifest with `canvas-workspace-shell`, a `props.children` value, and a nested manifest child.
- Root cause: `NodeRenderer` treated `props.children` and rendered nested nodes as alternatives.
- Affected code: `packages/renderer/src/node-renderer.tsx`, `packages/renderer/src/__tests__/gold-registry.test.tsx`, and `tests/e2e/renderer-children-parity.spec.ts`.
- Remediation: compose both sources into the declared resource slot, filtering explicit children through the Gold prop contract. Unit and browser regressions pass. Site v14 visibly rendered both prop and nested child content in Workbench; see `evidence/deployed-v14-flagship/deployed-renderer-parity-audit.json` and its desktop capture. Closed after deployed verification.

### AUD-073 — Standalone export discarded resource prop children when nested children existed

- Evidence: the generated-source regression failed before the fix because screen JSX omitted the literal prop child whenever the node had nested children. The fixed export is installed in a clean temporary directory, built, opened in a real browser, and shows both child sources in [this capture](evidence/step-07/after/standalone-export-children.png) with no browser console errors.
- Reproduction: export a project where `canvas-workspace-shell` receives `props.children` and a nested manifest child; inspect and run the generated screen.
- Root cause: the source generator emitted resource prop children or nested children, never both.
- Affected code: `packages/exporter/src/source-tree.ts` and `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`.
- Remediation: emit the serialized prop child followed by nested child JSX. A project exported from the deployed v14 Workbench showed both sources after a clean external install/build and desktop/mobile runtime check; see `evidence/deployed-v14-flagship/deployed-parity-export-build.json` and `deployed-parity-export-runtime.json`. Closed after deployed verification.

### AUD-074 — Unsupported variants silently fell through to component defaults

- Evidence: the [before capture](evidence/step-07/before/unsupported-variant-fell-through.png) shows Button rendered for an undeclared variant; the [Workbench diagnostic](evidence/deployed-v14-flagship/deployed-unsupported-variant-1440x900.png) shows the deployed UI now blocks that component. However, activating Export on Site v14 downloads an invalid ZIP; its clean build fails with TS2322 in [this build log](evidence/deployed-v14-flagship/deployed-invalid-variant-export-build-failure.txt). A new local Vite/Next regression failed before the baseline resolver fix and passes after it.
- Reproduction: load a Workbench manifest or export containing `variant=unsupported-variant` for the Button resource.
- Root cause: renderer and exporter had no canonical access to each resource's declared variant IDs.
- Affected code: `scripts/generate-gold-artifacts.ts`, generated renderer/exporter metadata, `packages/renderer/src/node-renderer.tsx`, `packages/exporter/src/node-disk-resolver.ts`, and `packages/exporter/src/source-tree.ts`.
- Remediation: generate variant declarations from each canonical resource manifest, render a visible non-substitution diagnostic in Workbench, and reject invalid exported variants with the accepted values. The built-in Button resolver lacked `acceptedVariants`, bypassing the exporter check even though resource-backed Gold components were covered. The local fix adds the canonical `quiet`, `expressive`, and `nocturne` values to the shared Vite/Next baseline resolver, with a failing-then-passing regression. Site v14 still exhibits the export defect; AUD-074 is fixed locally and awaits deployed verification on a newly saved review version. See `evidence/deployed-v14-flagship/deployed-invalid-variant-export-build.json`.

### AUD-075 — Workbench dropped declared slot content when nested children existed

- Evidence: the [before capture](evidence/step-07/before/resource-slot-child-lost.png) shows only the nested manifest node; the [fixed canvas capture](evidence/step-07/after/resource-slot-and-nested-children.png) and [Preview capture](evidence/step-07/after/preview-modal-slot-children.png) show both the declared slot content and nested node. The pre-fix renderer unit and Workbench browser tests failed; the fixed tests pass with no console errors or failed requests.
- Reproduction: load a Workbench manifest whose `canvas-workspace-shell` has `slots.children` text plus a nested child node, then inspect the canvas and Preview modal.
- Root cause: `NodeRenderer` resolved explicit children from `props.children` only, ignoring `slots.children` even when the resource contract allowed it.
- Affected code: `packages/renderer/src/node-renderer.tsx`, `packages/renderer/src/__tests__/gold-registry.test.tsx`, and `tests/e2e/renderer-children-parity.spec.ts`.
- Remediation: resolve the declared slot after prop children, enforce the resource child contract, and compose explicit content with nested nodes. Site v14 visibly rendered both declared slot content and nested nodes; see `evidence/deployed-v14-flagship/deployed-renderer-parity-audit.json`. Closed after deployed verification. Fix commit: `37432376face72876ca66c2bc788be116bb377a7`.

### AUD-076 — Standalone export ignored Workbench responsive node strategies

- Evidence: the [before capture](evidence/step-07/before/export-responsive-override-visible.png) shows `Content omitted on mobile` still visible at 390 px; the [fixed export capture](evidence/step-07/after/standalone-export-responsive-390.png) omits it. The same clean generated app applies the mobile stack and collapse strategies. The before browser regression failed on visibility; the fixed browser regression passed with no console errors or failed requests.
- Reproduction: export the shared renderer parity fixture, perform a clean install/build, start Vite preview, and inspect it at 390x844.
- Root cause: generated node wrappers omitted responsive strategy metadata, and the shared layout CSS had no mobile rules for those strategies.
- Affected code: `packages/exporter/src/source-tree.ts`, `packages/renderer/src/layout-contract.ts`, the shared fixture and its renderer/export browser tests.
- Remediation: emit a `data-responsive-strategy` for supported strategies and apply shared mobile container-query rules for omit, stack, and collapse. Site v14's Workbench 390 preset and the UI-generated standalone export both hid, stacked, and collapsed the expected nodes at mobile width; see `evidence/deployed-v14-flagship/deployed-renderer-parity-390-preset.png` and `deployed-parity-export-runtime.json`. Closed after deployed verification. Fix commit: `6baf9d1e93b2a6e11cac075b21d879cfa2c863ae`.

### AUD-078 — The Dialog resource made standalone exports fail to build

- Evidence: the [pre-fix clean-build log](evidence/step-07/before/gold-dialog-export-build-failure.txt) shows TypeScript rejecting every exported Dialog variant because `onClose` was required. The [standalone browser capture](evidence/step-07/after/export-dialog-open-1440.png) shows the generated Dialog; the clean-export test closes it with Escape and records no browser errors or failed requests.
- Reproduction: export a manifest containing the canonical Dialog with its sample `open`, `title`, and `children` props; install dependencies in a clean directory and run `pnpm build`. Before the fix, TS2741 reported a missing `onClose` prop.
- Root cause: the resource required a function callback that ProjectManifest cannot serialize and had no local close behavior when used without a host callback.
- Affected code: `resources/primitives/dialog/index.tsx`, generated Gold source, the shared Gold parity fixture, and `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`.
- Remediation: make `onClose` optional, preserve controlled behavior when supplied, and close local state on Escape or backdrop when no host callback exists. The deployed Workbench and standalone ZIP both opened the Dialog and closed it with Escape; the clean export built successfully with no Tessellate runtime dependency. See `evidence/deployed-v14-flagship/deployed-parity-export-build.json` and `deployed-parity-export-runtime.json`. Closed after deployed verification.

### AUD-088 — Advertised catalog facet filters do not affect results or survive reload

- Evidence: Site v16's [browser report](evidence/catalog-search-v16/density-filter-regression.json) records 15 dashboard results both before and after selecting **Density → Dense**, `?q=dashboard` without the selected facet, and the facet cleared after reload. The [after screenshot](evidence/catalog-search-v16/density-filter-after-1440x900.png) shows Dense checked while the same results remain.
- Reproduction: open `/explore` at 1440 × 900, search `dashboard`, expand Density and select Dense, then compare the count and URL before and after reload.
- Root cause: `ExploreRail` exposes filter fields that `executeSearch` never applies; `ExploreView` only reads and writes query, type, purpose and feel parameters.
- Affected code: `apps/site/src/components/ExploreRail.tsx`, `apps/site/src/components/ExploreView.tsx`, `packages/search/src/query.ts`, `packages/search/src/indexer.ts`, and `packages/search/src/types.ts`.
- Remediation: derive each facet from canonical manifest metadata, apply selected facets, serialize them in the URL, and verify visible result changes, combined filters and reload restoration. Site v19 passed combined facet, reload, and stale-selection checks at 1440 × 900 and 390 × 844; closed after deployed verification. See `evidence/catalog-search-v19/runtime-audit.json`.

### AUD-089 — Multi-term search returns unrelated resources and omits searchable intent

- Evidence: the Site v16 suggested query [luxury checkout screenshot](evidence/catalog-search-v16/luxury-checkout-suggested-query-1440x900.png) shows 13 results led by Conic Light Field, Counter Typography and Editorial Display Stack, with no checkout resource. The [query report](evidence/catalog-search-v16/normal-use-network-audit.json) records only one result for `payment` and zero for `checkout`, despite checkout/payment intent in catalogue manifests.
- Reproduction: open `/explore`, choose the suggested `luxury checkout` query, then search `payment` and `checkout`.
- Root cause: the search document omits `intent.contentRequirements`, while the query is passed to Orama without a product-level rule that checks coverage of meaningful terms. A result matching only `luxury` can outrank an absent checkout match.
- Affected code: `packages/search/src/indexer.ts`, `packages/search/src/query.ts`, `packages/search/src/types.ts`, and `packages/search/src/__tests__/search.test.ts`.
- Remediation: index intent fields that describe supported content, rank by meaningful token coverage before text relevance, and show a truthful empty state when no result satisfies a multi-term query. Site v19 found relevant `payment` results and kept `luxury checkout` empty rather than returning unrelated resources at both viewports; closed after deployed verification. See `evidence/catalog-search-v19/runtime-audit.json`.

### AUD-098 — Opaque Explore previews could not fetch compiled styles

- Evidence: Site v18's [Explore report](evidence/catalog-search-v18/runtime-audit.json) recorded nine desktop and two mobile CSP errors plus blocked requests for `/_astro/style.RWED2-xG.css`. The [desktop screenshot](evidence/catalog-search-v18/explore-initial-1440x900.png) shows multiple preview cards still on “Loading the actual resource…”.
- Reproduction: open `/explore` at 1440 × 900 or 390 × 844, wait for sandboxed resource previews, then inspect console/network events for the stylesheet request.
- Root cause: preview CSP used `connect-src 'none'`. Astro/Vite fetches the compiled stylesheet while preloading resource modules; `style-src` alone did not authorize that fetch from an opaque frame.
- Affected code: `apps/sites/worker.ts` and its CSP contract tests.
- Remediation: allow `connect-src` only to same-origin immutable `/_astro/` assets. Keep APIs, arbitrary same-origin paths, external hosts, and nested frames blocked. Site v19 rendered the real Accordion preview in its opaque sandbox with zero CSP or compiled-asset errors; closed after deployed verification. See `evidence/catalog-search-v19/runtime-audit.json` and the Sites Worker browser regression.

### AUD-111 — E-commerce conversion CTA used onboarding copy and a missing route

- **Evidence:** the before screenshot at `quality/evidence/step-14/manual-review/before/ecom-01-direction-01-before-desktop.png` shows “Continue onboarding” on the storefront. The visible UI regression records the after state at `quality/evidence/step-14/manual-review/after/ecom-01-direction-01-desktop.png`; its runtime report checks navigation and browser/network errors.
- **Reproduction:** open `/compose`, compose ECOM-01, inspect each direction’s Storefront Catalog, and activate the conversion CTA. Before the fix the fragment was `#screen-overview`, absent from the project’s screen IDs.
- **Root cause:** e-commerce had no archetype-specific CTA copy or target rule and inherited the generic onboarding label and overview fallback.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the composition quality benchmark, and the visible Compose browser test.
- **Remediation:** use “View product details” and resolve the CTA fragment to the generated Product Detail screen; assert semantic target validity in all three directions and click the CTA through the visible UI.
- **Verification:** the composition benchmark failed before the fix and passes after it. The visible browser regression also passes locally; this finding remains open until a published review version is re-audited.
- **Fix commit:** `77cbad5f`.

### AUD-112 — Returns portal brief generated a storefront purchase flow

- **Evidence:** the before browser screenshots at `quality/evidence/step-14/manual-review/desktop/ecom-06-direction-01.png` and `quality/evidence/step-14/manual-review/mobile/ecom-06-direction-01.png` show the return-portal brief rendered with a generic product-discovery objective and the onboarding CTA. The visible preview’s manifest contains Storefront Catalog, Product Detail, Checkout, and Order Confirmation.
- **Reproduction:** open `/compose`, enter benchmark brief ECOM-06 without an archetype override, compose, and inspect Product Architecture and each direction.
- **Root cause:** the interpreter applied the single generic ecommerce archetype to an explicit returns portal, so the screen planner inherited a new-purchase funnel.
- **Affected code:** `packages/composer/src/domain-context.ts`, `packages/composer/src/interpreter.ts`, `packages/compatibility/src/content-bindings.ts`, and the adjudicated interpretation/composition benchmarks.
- **Remediation:** specialize the existing ecommerce archetype for returns intent with order lookup, return request, and refund status workflows/screens; bind return-specific sample content and CTA copy.
- **Verification:** the benchmark assertion was red before the fix and passes after it; a visible Compose regression now checks the three direction manifests and selected preview. Review-site verification remains open.
- **Fix commit:** `77cbad5f`.

### AUD-119 — Brokerage terminal brief inherited retail banking workflows

- **Evidence:** the before screenshot at
  `quality/evidence/step-14/manual-review/before/full-benchmark-initial/desktop/fin-05-direction-01.png`
  shows Account Balances, bank statements, and a notification action. After
  captures show Market Overview, Order Book, Positions & Risk, and Trade History
  at desktop and mobile sizes.
- **Reproduction:** open `/compose`, enter benchmark brief FIN-05, compose, and
  inspect Directions 01–03 at 1440 × 900 and 390 × 844.
- **Root cause:** the general fintech profile was reused for explicit brokerage
  and order-book intent, leaving retail banking screens and content in place.
- **Affected code:** `packages/composer/src/domain-context.ts`,
  `packages/composer/src/interpreter.ts`,
  `packages/compatibility/src/content-bindings.ts`, the adjudicated interpreter
  and composition benchmarks, and the visible Compose regression.
- **Remediation:** specialize the existing fintech archetype only when the brief
  explicitly describes trading terminals, market depth, brokerages, order books,
  or equity dealers. The 100-brief regressions were red before the fix and now
  enforce market screens, relevant events, and no banking residue. Desktop and
  mobile browser reports record no console errors, uncaught exceptions, failed
  requests, or HTTP errors. Deployed review verification remains open.

### AUD-134 — Clothing commerce brief composed as a marketing storefront

- **Evidence:** the baseline preview at quality/evidence/step-14/manual-review/before/full-benchmark-initial/desktop/ecom-01-direction-01.png starts with a marketing hero and delivery promise. The current preview at quality/evidence/step-14/manual-review/current/desktop/ecom-01-direction-01.png starts with Product Catalog and product search; a mobile capture is alongside it.
- **Reproduction:** open /compose, enter benchmark brief ECOM-01, compose, and inspect Direction 01’s screen plan and Product Catalog preview.
- **Root cause:** the ecommerce archetype defaulted to a Storefront Catalog marketing screen and the generic planner mapped it to marketing-page semantics.
- **Affected code:** packages/composer/src/archetypes.ts, packages/composer/src/domain-context.ts, packages/composer/src/planner.ts, and the composition benchmark.
- **Remediation:** make searchable Product Catalog the ecommerce default and bind clothing discovery, details, sizing, and checkout content. The 100-brief benchmark and current desktop/mobile UI run pass locally; deployed verification remains open.

### AUD-135 — Digital music commerce inherited a physical storefront workflow

- **Evidence:** baseline ECOM-04 screenshots use Storefront Catalog and generic order-delivery copy. Current desktop/mobile captures show album search, release details, licensed sample/download context, and the generated purchase flow.
- **Reproduction:** open /compose, enter benchmark brief ECOM-04, compose, and inspect the product model, screen plan, and catalog resource data.
- **Root cause:** the generic ecommerce model did not distinguish physical goods from digital music releases.
- **Affected code:** packages/composer/src/domain-context.ts, packages/composer/src/interpreter.ts, packages/compatibility/src/content-bindings.ts, and the interpretation/composition benchmarks.
- **Remediation:** specialize music commerce around albums and releases, with sample, purchase, and download workflows. The semantic regression passed after failing on the generic plan; deployed verification remains open.

### AUD-136 — Flight-management brief planned as a destination and hotel product

- **Evidence:** baseline TRV-03 shows Destination Showcase and a travel-discovery hero. Current desktop/mobile captures show Journey Overview, Flight Details, and Travel Documents with check-in, gate, and confirmed-flight context.
- **Reproduction:** open /compose, enter benchmark brief TRV-03, compose, and inspect the generated screens and direction preview.
- **Root cause:** broad travel planning reused a destination/hospitality architecture for confirmed-flight operations.
- **Affected code:** packages/composer/src/domain-context.ts, packages/composer/src/interpreter.ts, and the interpretation/composition benchmarks.
- **Remediation:** distinguish flight management from destination discovery and specialize the model and screens around confirmed journeys. The regression passes locally; deployed verification remains open.

### AUD-137 — Film-streaming brief inherited a newspaper publishing architecture

- **Evidence:** baseline MED-04 contains Front Page Feed and a journalism hero. Current desktop/mobile captures show Film Catalogue, Film Detail, and Watchlist with film search and collection context.
- **Reproduction:** open /compose, enter benchmark brief MED-04, compose, and inspect the generated screens, hero copy, and catalogue.
- **Root cause:** the media archetype shared a news-publishing product model with streaming products.
- **Affected code:** packages/composer/src/domain-context.ts, packages/composer/src/interpreter.ts, packages/compatibility/src/content-bindings.ts, and the interpretation/composition benchmarks.
- **Remediation:** specialize film streaming around catalogue, detail, and watchlist workflows. Red/green semantic coverage and the current desktop/mobile visible benchmark pass locally; deployed verification remains open.

### AUD-139 — Product Catalog could not navigate to Product Detail

- **Severity:** High.
- **Evidence:** the archived ECOM-01 desktop/mobile screenshots under `quality/evidence/step-14/manual-review/versions/062c7f0e/` show a Product Catalog with no detail action. The after captures under `quality/evidence/step-14/manual-review/after/` show the “View product details” action and the Product Detail screen it opens. Runtime reports record zero console errors, uncaught exceptions, failed requests, or HTTP errors.
- **Reproduction:** compose benchmark brief ECOM-01, inspect Product Catalog in each direction, and look for a route to Product Detail. Before the fix no such link was rendered.
- **Root cause:** Product Catalog did not require the `conversion-cta` role; the music-store target override could also match Product Catalog itself.
- **Affected code:** `packages/composer/src/planner.ts`, `packages/compatibility/src/content-bindings.ts`, and the composition unit and browser regressions.
- **Remediation:** require a detail action on ecommerce discovery screens, bind it to Product Detail with product or album wording, and verify that selecting it changes the visible preview screen. The unit regression failed before the fix; focused desktop/mobile UI checks and the visible catalog-to-detail browser test now pass. Fix commit: `a84b6f0c`. Deployed verification remains open.

### AUD-140 — Dark product canvases made light resource variants unreadable

- **Severity:** High.
- **Evidence:** the pre-fix Direction 02 screenshot at
  `quality/evidence/step-14/manual-review/versions/87a90100/desktop/ai-03-direction-02.png`
  shows muted labels disappearing against the dark canvas. The all-Gold dark
  canvas Axe sweep found contrast failures in 16 of 40 expressive resource
  variants: advanced-data-table reached 1.44:1, entity-profile-header 1.53:1,
  error-state 1.65:1, and muted labels on white surfaces 2.20:1.
- **Reproduction:** open `/compose`, enter benchmark brief AI-03, compose, open
  Direction 02 (Neural Flow), and inspect Support Assistant. Run
  `tests/e2e/resource-dark-expressive-contrast.spec.ts` to check all Gold
  resources against the dark canvas.
- **Root cause:** Design DNA supplies dark muted-text tokens at screen scope,
  while multiple resource variants render fixed light surfaces and inherit those
  tokens. Several expressive panels were translucent, so they also blended with
  the dark canvas beneath them.
- **Affected code:** the 16 resource implementations listed in
  `audit/runtime-audit.json` under AUD-140, their generated registry/export
  sources, and the resource contrast regressions.
- **Remediation:** scope semantic text tokens to each component's declared
  variant and make the affected expressive surfaces opaque. Light variants retain
  dark text and nocturne retains light text, including in standalone resource
  source.
- **Verification:** before the fix, Axe failed for 16/40 Gold resources. After
  commit `79e780b1`, the focused 12-case Playwright suite passes and the 40-Gold
  expressive/dark sweep reports zero violations. The full 100-brief desktop and
  mobile Compose review also passes against this commit with 600 screenshots and
  clean runtime reports; see `quality/STEP_14_EVIDENCE.md`.
- **Disposition:** fixed locally; public/review deployment verification remains
  pending under the ordered release programme.

### AUD-141 — Scrollable Gold resource panels were not keyboard reachable

- **Severity:** High.
- **Evidence:** the [failed CI mobile Axe run](https://github.com/danishgm-sketch/Tessellate/actions/runs/39160229735)
  reported serious
  `scrollable-region-focusable` violations in `error-state`, `feature-matrix`,
  and `three-pane-app-shell`. The local mobile repro reported the latter two.
  The fixed mobile shell capture is
  `quality/evidence/step-14/accessibility/three-pane-shell-mobile-390-after.png`;
  the 40-resource Axe result is in
  `quality/evidence/step-14/accessibility/gold-expressive-dark-mobile-after.json`.
- **Reproduction:** run
  `pnpm exec playwright test tests/e2e/resource-dark-expressive-contrast.spec.ts --project=mobile-chrome --workers=1`,
  then tab through the overflowing error sample, comparison table, and workspace
  canvas. Before the fix, Axe fails and keyboard focus skips those scroll regions.
- **Root cause:** the resources used overflow containers without keyboard focus,
  accessible names where needed, or a visible focus treatment.
- **Affected code:** the three resource implementations and
  `tests/e2e/resource-dark-expressive-contrast.spec.ts` plus
  `tests/e2e/resource-scroll-accessibility.spec.ts`.
- **Remediation:** add keyboard focus and visible focus styling to the overflow
  regions, give the comparison table and canvas meaningful names, and assert
  both Axe results and actual keyboard focus in a mobile browser.
- **Verification:** after fix commit `8a53e00c`, the 40-Gold-resource Axe sweep
  passes at 1440 × 900 and 390 × 844 with zero findings; six keyboard and
  responsive browser checks pass locally. The report JSON records the source
  SHA and viewport for both runs. CI on the fixed commit is pending.
- **Disposition:** fixed locally; deployed verification remains pending.

### AUD-149 — Composition flattened resource kinds into section nodes

- **Severity:** High.
- **Evidence:** the before Workbench capture at
  `../quality/evidence/step-17/before/resource-kinds-flattened-desktop-1440x900.png`
  shows the visible Layers tree without component or element levels. The failing
  composer contract named the concrete mismatch: `entity-profile-header` is a
  block resource but was emitted as a section. The after desktop/mobile reports
  record root, section, component and element selection through the visible UI.
- **Reproduction:** enter the exact employee-experience brief in `/compose`, open
  Direction C in Workbench, and inspect the Layers tree and inspector. Before the
  fix, the composer test rejected the block-to-section mapping, and the browser
  journey could not find any component node.
- **Root cause:** the composition pipeline assigned `section` to every
  resource-backed node except navigation, discarding `ResourceManifest.resourceType`.
- **Affected code:** `packages/compatibility/src/compose-pipeline.ts`,
  `packages/compatibility/src/__tests__/compose-pipeline.test.ts`, and
  `tests/e2e/workbench-fundamentals-hardening.spec.ts`.
- **Remediation:** map the selected resource type to its editor node type while
  keeping navigation as layout. A red-to-green contract regression now checks
  every resource-backed node; desktop and mobile browser journeys confirm the
  Workbench shows and selects root, section, component and element nodes.
- **Verification:** `quality/STEP_17_EVIDENCE.md` records the passing production
  preview runs and zero browser or network errors. Public review verification is
  still required at Step 45.
- **Disposition:** fixed locally; deployed verification remains pending.


### AUD-152 — Duplicate screens generated a duplicate route and invalid manifest

- **Severity:** High.
- **Evidence:** `quality/evidence/step-19/before/duplicate-screen-collision.png` and its JSON show both copied Marketing Home pages at `/-copy`; the raw downloaded manifest failed canonical validation because routes were duplicated. The after captures show distinct routes and schema validation passing.
- **Reproduction:** Open the Playful HR showcase in Workbench at 1440 × 900, duplicate Marketing Home twice from Pages, then inspect the routes and export the manifest.
- **Root cause:** Screen duplication always appended the fixed `-copy` suffix and used the same copy name without checking existing screens; root `/` therefore became `/-copy` every time. The former timestamp ID generation also risked repeated IDs for rapid actions.
- **Affected code:** `packages/workbench/src/components/left-panel/PagesTab.tsx` and `tests/e2e/workbench-mutation-hardening.spec.ts`.
- **Remediation:** Normalize root paths from the screen name, choose a unique copy name/route, create fresh IDs with the shared ID generator, and validate the exported manifest.
- **Verification:** The baseline browser test fails and records an invalid manifest. Current desktop/mobile runs verify two unique routes and IDs and a schema-valid download. Public review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.
## MEDIUM

### AUD-148 — Disabled canvas actions prevented resource selection

- **Severity:** Medium.
- **Evidence:** the before screenshot at
  `../quality/evidence/step-17/before/disabled-resource-canvas-selection-not-selectable-mobile-390x844.png`
  shows the disabled action on the selected settings screen, while the associated
  failed browser report leaves Preview active. The after capture at
  `../quality/evidence/step-17/after/disabled-resource-canvas-selection-mobile-390x844.png`
  shows the containing resource selected with Inspect open.
- **Reproduction:** enter the exact employee-experience brief, open Direction C,
  switch to Settings & Policies at 390 × 844, and tap the disabled
  “Explore Interface System” control. Before the fix, Workbench remained on
  Preview and the inspector showed no selected node.
- **Root cause:** native disabled controls suppress the click event used by the
  canvas selection handler, so selection never reached the containing node.
- **Affected code:** `packages/renderer/src/node-renderer.tsx` and
  `tests/e2e/workbench-fundamentals-hardening.spec.ts`.
- **Remediation:** capture pointerdown at the resource boundary when its target
  is disabled, prevent the disabled action, and select the resource node. The
  control stays disabled until it has a real action.
- **Verification:** the explicit mobile browser regression failed before the
  renderer change and passes after it; Workbench opens Inspect for the component
  with zero console errors, uncaught exceptions, failed requests or HTTP errors.
  Public review verification remains at Step 45.
- **Disposition:** fixed locally; deployed verification remains pending.

### AUD-077 — Standalone export dropped standard data and accessibility attributes

- Evidence: the [before capture](evidence/step-07/before/export-data-attribute-dropped.png) and failing clean-export browser assertion showed the shared Button fixture lacked its `data-tracking-id` attribute. The [after capture](evidence/step-07/after/export-data-attribute-preserved.png) shows the generated standalone resource; its browser assertion verifies the attribute is present. The passing clean install/build/browser run recorded zero console errors or failed requests.
- Reproduction: export the shared renderer parity fixture, clean-install its generated dependencies, build and preview it, then query `[data-tracking-id="parity-action"]`. Before the fix the locator count was zero; Workbench retained the same attribute.
- Root cause: exporter prop filtering allowed only names explicitly declared by the resource, dropping standard `data-*` and `aria-*` attributes that Workbench intentionally forwards.
- Affected code: `packages/exporter/src/source-tree.ts`, `packages/testing/src/renderer-parity-fixture.ts`, and renderer/exporter/Workbench parity tests.
- Remediation: preserve `data-*` and `aria-*` props while continuing to filter undeclared ordinary props. Site v14 Workbench and the clean standalone export retained `data-tracking-id="parity-action"` and its accessible label; see `evidence/deployed-v14-flagship/deployed-parity-export-runtime.json`. Closed after deployed verification. Fix commit: `1f92c1ed2d3e7e54f129f0d844faf2ef22e2a956`.

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

### AUD-080 — Direction previews do not show their advertised structural differences

- Evidence: [Site v10 Compose capture](evidence/public-site-v10/compose-directions-1440.png) first showed three Team Overview previews with the same content and section order. The [v11 Compose capture](evidence/public-site-v11/compose-directions-1440.png) confirms the same issue remains: Direction 03 advertises rail navigation and a tri-column-intelligence layout, but its preview still uses a conventional header and content pane.
- Reproduction: open `/compose` at 1440 × 900, compose the employee-experience brief with Refined ambition and Inventive creativity, then compare the three previews.
- Root cause: the direction cards render each manifest's same primary screen through `ManifestRenderer`; the generated grammar and navigation differences are shown as metadata but do not produce the promised structural variation in the rendered preview.
- Affected code: `apps/site/src/components/ComposeView.tsx`, `packages/compatibility/src/direction-generator.ts`, and the ordered Step 12 composition integration.
- Remediation: make each direction's grammar change manifest structure, navigation, and resource selection, and add a browser-level regression that rejects theme-only variation. The v11 desktop and mobile smoke still shows the same structure across cards; this remains open until Step 12.

### AUD-081 — Public unknown-resource preview is not announced as an alert

- Evidence: [Site v10 unknown-resource capture](evidence/public-site-v10/unknown-resource-1440.png) showed the diagnostic without alert semantics. The [v11 desktop capture](evidence/public-site-v11/unknown-resource-1440.png), [mobile capture](evidence/public-site-v11/unknown-resource-390.png), and [smoke report](evidence/public-site-v11/flagship-smoke.json) record one assertive alert on both viewports, no substitute or buttons, and zero browser errors.
- Reproduction: open `/preview/?resource=__missing-resource-for-renderer-audit__` on Site v10 and inspect its accessibility tree.
- Root cause: the public Astro `PreviewHost` rendered load failures as a plain `div` with muted text on a transparent preview background.
- Affected code: `apps/site/src/components/PreviewHost.tsx` and `tests/e2e/sites-unknown-resource-preview.spec.ts`.
- Remediation: expose the diagnostic as an assertive `role=alert`, use a solid higher-contrast surface, and cover desktop/mobile behavior. The pre-fix browser test failed on both viewports; the v11 deployed checks now pass at 1440 × 900 and 390 × 844, so this finding is closed.

### AUD-082 — Exported screen selector wrapped into three rows on mobile

- Evidence: the [public v11 export capture](evidence/step-07/before/export-project-navigation-wraps-390.png) shows nine screen buttons spread across three rows above the manifest product navigation. Site v14 export through the visible Workbench produced a nine-screen manifest and ZIP. The manifest passed ProjectManifestSchema; clean install and production build passed outside the repository; the exported project switched screens at 1440 × 900 and 390 × 844 with a one-row selector, no mobile overflow, and zero console or network errors. See the [visible export report](evidence/deployed-v14-flagship/visible-export-audit.json), [external build record](evidence/deployed-v14-flagship/external-export-build.json), [runtime report](evidence/deployed-v14-flagship/standalone-runtime-audit.json), and [mobile after capture](evidence/deployed-v14-flagship/standalone-export-390x844.png).
- Reproduction: compose the employee-experience brief on the public Site, open Direction C, download the Standalone React ZIP, clean-install/build it, then view the project at 390 × 844.
- Root cause: packages/exporter/src/source-tree.ts used a wrapping flex group for the nine generated screen buttons and a wrapping header for the project name.
- Affected code: packages/exporter/src/source-tree.ts and packages/exporter/src/**tests**/standalone-export-fidelity.test.ts.
- Remediation: stack the title and keep screen controls in a single horizontally scrollable row on narrow screens. The clean-install browser test verifies computed layout, screen switching, responsive resource strategies and zero console/request failures. Fix commit: d6102e53b203355e68411ce91f0630346534e6f3. Closed after public Site v14 (Sites source commit 7323e8e9edfb6e07c5485c9d19ff37a8ca8043f5).

### AUD-083 — Fade-Up Replay Entrance reversed before its transition completed

- Evidence: the [deployed v11 browser timeline](evidence/step-07/before/fade-up-replay-timeline.json) records only a brief opacity dip before the animation resets. The v14 [after report](evidence/step-07/deployed-v14-after-fix/runtime.json) samples the live card 40 times after replay: opacity reached 0 at 310 ms, remained at or below 0.01 for four samples, and completed at 1. The same Site v14 report confirms Reduced Motion ON skips the animation while leaving the card visible and announcing the skip; OFF restores the 0.3s transition. The route and 324-resource catalogue returned HTTP 200; desktop and mobile had zero console errors, uncaught exceptions, failed requests or HTTP errors, and mobile had no overflow. See the [completed replay capture](evidence/step-07/deployed-v14-after-fix/fade-up-replay-final-1440x900.png).
- Reproduction: open /resources/fade-up-reveal/ at 1440 × 900 and activate Replay Entrance. The v11 version reset after 50 ms, reversing before the 300 ms Quiet transition could complete.
- Root cause: resources/motion/fade-up-reveal/index.tsx restored the card after a fixed 50 ms, shorter than the 300 ms Quiet transition and the 500/700 ms Nocturne/Expressive transitions.
- Affected code: resources/motion/fade-up-reveal/index.tsx and tests/e2e/gold-resource-certification.spec.ts.
- Remediation: hold the hidden state through the active variant exit transition, then replay the entrance. Reduced-motion preference or preview toggle skips the animation with a polite status message. The Gold browser certification verifies hidden opacity and full return to opacity one; focused and complete Sites Worker runs pass. Fix commit: 6c8ecc0f0e11a7707b997326fd3855a6060eca91. **Closed after public Site v14** (Sites source commit 7323e8e9edfb6e07c5485c9d19ff37a8ca8043f5).

### AUD-084 — Reduced Motion preview control left transitions enabled

- Evidence: the [public v12 runtime report](evidence/step-07/deployed-v12-before-fix/runtime.json) records a 300 ms Fade-Up transition after the control changes to ON, despite the browser reporting no OS reduced-motion preference. The [desktop before capture](evidence/step-07/deployed-v12-before-fix/fade-up-reduced-motion-on-1440x900.png) shows the original state. The v13 [after report](evidence/step-07/deployed-v13-after-fix/runtime.json) verifies 0s transition/animation while ON and 0.3s after OFF. It recorded HTTP 200, 324 catalogue entries, and zero console errors, uncaught exceptions, failed requests, or HTTP errors; mobile had no overflow. The [desktop after capture](evidence/step-07/deployed-v13-after-fix/fade-up-reduced-motion-on-1440x900.png) is at 1440 × 900.
- Reproduction: open the Fade-Up resource page at 1440 × 900, activate Reduced Motion, and inspect the preview card's computed `transition-duration`. Before remediation it remained 0.3s and animated.
- Root cause: Tailwind's `motion-reduce` utility only responds to the operating-system media query. The preview toolbar sends a separate state value and does not change that media query.
- Affected code: `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/styles/global.css`, shared UI preview-motion CSS, and `tests/e2e/preview-form-interactions.spec.ts`.
- Remediation: reflect the toggle on the isolated iframe document root and use a shared, scoped CSS override to reduce transition and animation durations regardless of OS preference. The Sites Worker regression verifies 0s when ON and restores 0.3s when OFF. Fix commit: `35a8fe5634fde34d3f0a38b41ab70aafdbb5ae2d`. **Closed after public Site v13** (Sites source commit `148f16a972e74e1859d3f6c3523cf5fc3b292a9e`).

### AUD-086 — Reduced Motion still let Replay Entrance hide the Fade-Up card

- Evidence: the [deployed v13 report](evidence/step-07/deployed-v13-replay-failure/runtime.json) records `transitionDuration: 0s` while Reduced Motion is ON, but after Replay Entrance the card was at opacity `0` after 80 ms and there was no status message. The [before capture](evidence/step-07/deployed-v13-replay-failure/fade-up-reduced-motion-replay-80ms-1440x900.png) shows the blank content region. Site v14's [after report](evidence/step-07/deployed-v14-after-fix/runtime.json) records opacity `1`, the accessible skip message, correct 0s/0.3s toggle transitions, 324 catalogue entries, and zero console, uncaught, failed-request, or HTTP errors at desktop and mobile. The [after capture](evidence/step-07/deployed-v14-after-fix/fade-up-reduced-motion-replay-80ms-1440x900.png) shows the card and message.
- Reproduction: open `/resources/fade-up-reveal/` at 1440 × 900 with the OS preference set to no-preference, turn on the visible Reduced Motion toggle, wait for the iframe to reload, then activate Replay Entrance and inspect the card at 80 ms.
- Root cause: the Fade-Up handler checked only `matchMedia('(prefers-reduced-motion: reduce)')`. The toolbar uses `data-tessellate-reduced-motion` on the iframe root. CSS suppressed transition timing, but the handler still set `revealed=false`.
- Affected code: `resources/motion/fade-up-reveal/index.tsx`, generated standalone Gold source, and `tests/e2e/preview-form-interactions.spec.ts`.
- Remediation: treat the OS preference or the iframe root toggle attribute as reduced motion before mutating visibility; retain opacity 1 and announce that the animation was skipped. The regression failed before the fix because the status element was absent, then passed after a clean build. Fix commit: `32803eb15d72b4020fe6aec90e9b587e2f7812fb`. **Closed after public Site v14** (Sites source commit `7323e8e9edfb6e07c5485c9d19ff37a8ca8043f5`).

### AUD-085 — Standalone preview app omitted canonical resource utility styles

- Evidence: the [before screenshot](evidence/step-07/preview-app-before/resource-styles-1440x900.png) shows flattened variant controls and an unstyled replay button. Its [runtime record](evidence/step-07/preview-app-before/runtime.json) shows the resource retained its `duration-300` class while computed transition duration was 0s. The [after screenshot](evidence/step-07/preview-app-after/resource-styles-1440x900.png) restores the expected layout; the [runtime record](evidence/step-07/preview-app-after/runtime.json) reports 0.3s. Both runs recorded zero console errors, uncaught exceptions and failed requests.
- Reproduction: run the standalone `@tessellate/preview` app and open `/?resource=fade-up-reveal` at 1440 × 900. Before the fix, inspect the card class list and computed transition duration.
- Root cause: `apps/preview/src/style.css` did not register the shared `resources` directory as a Tailwind source, so utilities authored by resource packages were omitted from its CSS bundle.
- Affected code: `apps/preview/src/style.css`, `tests/e2e/preview-reduced-motion.spec.ts`, and `tests/e2e/preview-app.playwright.config.ts`.
- Remediation: register the existing resource tree with Tailwind and assert the normal/reduced/restored motion durations through the browser. The regression failed before the fix with 0s and now passes with 0.3s → 0s → 0.3s. This Vite runtime is separate from the public Sites Astro app and has been verified locally. Fix commit: `5ef3c2bfb65764b8102f7e3ad8e8f251509a2c3f`.

### AUD-087 — Handled export validation failure was logged as a browser console error

- Evidence: Site v15's [renderer parity report](evidence/deployed-v15-export-fix/deployed-renderer-parity-audit.json) records the expected unsupported-variant dialog, no download, no uncaught exception, no failed request and no HTTP error, but `zeroConsoleErrors` is false. Site v16's [renderer parity report](evidence/deployed-v16-export-fix/deployed-renderer-parity-audit.json) records the same visible rejection with no download and `zeroConsoleErrors`, `zeroUncaughtErrors`, `zeroFailedRequests`, and `zeroHttpErrors` all true. The [v16 Workbench capture](evidence/deployed-v16-export-fix/deployed-unsupported-variant-1440x900.png) shows the preserved diagnostic before export.
- Reproduction: open a schema-valid Workbench manifest with an unsupported Button variant, choose **Export → Download Standalone React Project**, then inspect the browser console after the validation dialog appears.
- Root cause: `TopToolbar` logged every caught ZIP export failure through `console.error`; the exporter represented expected project validation failures as generic `Error` values.
- Affected code: `packages/exporter/src/source-tree.ts`, `packages/workbench/src/components/TopToolbar.tsx`, and `tests/e2e/unsupported-resource-variant-regression.spec.ts`.
- Remediation: represent export validation failures with `ExportValidationError`, suppress error logging for that expected user-correctable case, retain logging for unexpected faults, and cover the visible dialog, rejected download, and zero-console-error result in Playwright. The regression passes locally and on deployed Site v16 (canonical commit `7b49224898066edc9162d901e0cc945af7b24105`, Sites source commit `37fd259499ac4a634db77e091f0a8cd3ff6f1464`); status: closed after deployed verification.

### AUD-090 — Typing a search phrase starts and aborts dozens of preview requests

- Evidence: the Site v16 [typed-search network report](evidence/catalog-search-v16/typed-search-network-audit.json) records 45 `net::ERR_ABORTED` requests while typing `luxury checkout` at 70 ms per character. Most were preview iframe documents and their JS/CSS chunks; there were no HTTP status errors or browser console errors.
- Reproduction: open `/explore`, wait for the initial list and type `luxury checkout` at a natural cadence while recording failed requests.
- Root cause: `ExploreView` executes search on each input change. This repeatedly replaces `ResourceCard` instances while their intersection-triggered preview iframes are still loading.
- Affected code: `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/ResourceCard.tsx`, and the Explore browser tests.
- Remediation: debounce committed query execution without delaying the input and cover request behavior during natural typing. Site v19's natural-paced typing checks passed at both viewports with no unresolved failures. The report retains result-replacement `ERR_ABORTED` requests as expected cancellations rather than discarding them; closed after deployed verification. See `evidence/catalog-search-v19/runtime-audit.json`.

### AUD-091 — Explore stops at 50 of 324 resources without a continuation control

- Evidence: Site v16's [search report](evidence/catalog-search-v16/normal-use-network-audit.json) records 324 catalogue resources but only 50 displayed results for the broad `data table` query and no continuation control. The [initial Explore screenshot](evidence/catalog-search-v16/explore-initial-1440x900.png) shows the truncated list.
- Reproduction: open `/explore`, note the 324-resource catalogue, search `data table`, and inspect the end of the results.
- Root cause: `executeSearch` truncates candidate hits before strict filters, defaults to 50 returned results, and reports the truncated count as `totalHits`; `ExploreView` renders the one page without pagination.
- Affected code: `packages/search/src/query.ts`, `packages/search/src/types.ts`, `apps/site/src/components/ExploreView.tsx`, and the Explore browser tests.
- Remediation: count matches after filtering, support offset-based incremental results, show `Showing X of Y`, and expose a keyboard-accessible continuation control. Site v19 continued beyond the initial 50 results and showed the true total at both viewports; closed after deployed verification. See `evidence/catalog-search-v19/runtime-audit.json`.

### AUD-092 — Accessibility facet overstates what catalogue metadata proves

- Evidence: the Site v16 [before report](evidence/catalog-search-v16/accessibility-label-before.json) records the visible “Verified AA” label while all 324 manifests declare `levelTarget: AAA`; the [before screenshot](evidence/catalog-search-v16/accessibility-label-before-1440x900.png) captures the claim.
- Reproduction: open deployed `/explore`, expand Accessibility, and compare the “Verified AA” option to `accessibility.levelTarget` in `/data/catalog.json`.
- Root cause: the indexer collapsed AA and AAA declared targets into one AA value, while the facet wording presented a target as verified conformance.
- Affected code: `packages/search/src/indexer.ts`, `apps/site/src/components/ExploreRail.tsx`, `docs/PRODUCT_SPEC.md`, and Explore browser tests.
- Remediation: expose “AA target or higher” and “AAA target” as declared target values and keep verification fields distinct. Site v19 showed the declared target wording at both viewports; closed after deployed verification. See `evidence/catalog-search-v19/runtime-audit.json`.

### AUD-093 — Explore advertises facet values absent from the loaded catalogue

- Evidence: the Site v16 [before report](evidence/catalog-search-v16/empty-filter-options-before.json) records `None`, `Heavy`, and `Sparse` options despite zero matching records; the [before screenshot](evidence/catalog-search-v16/empty-motion-facet-options-1440x900.png) shows the Motion facet.
- Reproduction: open deployed `/explore`, expand Motion, Density, and Resource, then compare the options to the values in `/data/catalog.json`.
- Root cause: ExploreRail rendered fixed filter choices without deriving the actual option set from loaded search documents.
- Affected code: `apps/site/src/components/ExploreRail.tsx`, `apps/site/src/components/ExploreView.tsx`, `packages/search/src/indexer.ts`, and Explore browser tests.
- Remediation: intersect the supported facet vocabulary with indexed manifest values, hide empty choices, and retain a stale URL-selected value so it can be removed. Site v19 hid absent values and allowed a stale URL selection to be removed at both viewports; closed after deployed verification. See `evidence/catalog-search-v19/runtime-audit.json`.

### AUD-094 — Mobile Explore filters were not a keyboard dialog

- Evidence: the deployed v17 [390 × 844 keyboard report](evidence/catalog-search-v17/mobile-filter-keyboard-before.json) records zero dialog semantics, focus left on the trigger behind the open drawer, and the drawer still visible after Escape. The [before screenshot](evidence/catalog-search-v17/mobile-filter-drawer-before-escape-390x844.png) shows the overlay. The reproduction produced no console errors or failed requests.
- Reproduction: open `/explore` at 390 × 844, activate **Filters**, inspect the accessibility tree and focus, then press Escape.
- Root cause: the mobile filter overlay had no dialog semantics or modal keyboard/focus lifecycle.
- Affected code: `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/ExploreRail.tsx`.
- Remediation: add a labeled modal dialog, focus containment, Escape and backdrop closing, focus restoration, page scroll locking, and one clear dialog title. Site v19 passed the mobile dialog semantics, focus-wrap, Escape-close, and focus-return checks; closed after deployed verification. See `evidence/catalog-search-v19/explore-390x844.json`.

### AUD-095 — The isolated activity preview skipped to an H4 heading

- Evidence: the deployed v17 [resource report](evidence/catalog-search-v17/ai-agent-heading-before.json) records an H4 primary heading and Axe `heading-order` impact `moderate`; the [before screenshot](evidence/catalog-search-v17/ai-agent-heading-before-1440x900.png) shows the preview. The route returned HTTP 200 with no console errors, failed requests, or HTTP errors.
- Reproduction: open `/r/ai-agent-activity-feed/` at 1440 × 900 and inspect the preview heading or run Axe heading-order.
- Root cause: the resource authored its standalone primary heading as H4 despite being rendered in its own isolated document.
- Affected code: `resources/ai/ai-agent-activity-feed/index.tsx` and generated Gold export source.
- Remediation: use an H2 in the isolated preview and assert its level and sample-data label in the Sites Worker browser regression. Site v19's isolated preview began with H2 and exposed the static-sample label; closed after deployed verification. See `evidence/catalog-search-v19/resource-detail-audit.json`.

### AUD-096 — Resource detail tabs skipped heading levels

- Evidence: the deployed v17 [resource detail report](evidence/catalog-search-v17/resource-tabs-heading-before.json) records H1 followed by four H4 headings and a moderate Axe `heading-order` violation. The route returned HTTP 200 with zero console errors, uncaught exceptions, failed requests, or HTTP errors; the [before screenshot](evidence/catalog-search-v17/resource-tabs-heading-before-1440x900.png) captures the page.
- Reproduction: open `/r/ai-agent-activity-feed/` at 1440 × 900 with Intent selected, then inspect headings or run Axe. The same tab renderer is shared by every resource detail page.
- Root cause: `ResourceTabs` used H4 section headings and an H5 variant heading beneath the page H1.
- Affected code: `apps/site/src/components/ResourceTabs.tsx`.
- Remediation: use H2 for tab sections, add a declared-variants H2, and use H3 for each variant card. Site v19 passed heading-order checks across all eight tabs at desktop and mobile widths; closed after deployed verification. See `evidence/catalog-search-v19/resource-detail-audit.json`.

### AUD-097 — Fixed sample events were presented as live telemetry

- Evidence: the deployed v17 [resource screenshot](evidence/catalog-search-v17/ai-agent-heading-before-1440x900.png) and [catalogue record](evidence/catalog-search-v17/ai-agent-heading-before.json) show a fixed local activity example described as a real-time telemetry stream. The public route itself had zero console errors, failed requests, and HTTP errors.
- Reproduction: open `/r/ai-agent-activity-feed/` and compare the real-time description and pulsing green indicator with the fixed hardcoded rows and intent metadata.
- Root cause: the resource fixture contained static project-internal events while its README, manifest, variant copy, and generated catalogue advertised live behavior.
- Affected code: `resources/ai/ai-agent-activity-feed/index.tsx`, its README and manifest, generated catalogue records, and `packages/exporter/src/generated-gold-sources.ts`.
- Remediation: label rows as static sample data, remove the live pulse, use generic sample events, and describe the host-data contract. Site v19's detail description and isolated preview consistently identified the rows as static sample activity and the Milestones filter behaved correctly; closed after deployed verification. See `evidence/catalog-search-v19/resource-detail-audit.json`.

### AUD-099 — Resource detail navigation landmarks were not distinguishable by name

- Evidence: Site v19's [resource detail report](evidence/catalog-search-v19/resource-detail-audit.json) records the desktop `landmark-unique` violation (`moderate`) on `.xl\\:flex`; the mobile run records no violation because the desktop primary navigation is hidden. The [v20 desktop screenshot](evidence/catalog-search-v20/resource-detail-after-1440x900.png) captures the corrected route.
- Reproduction: open `/r/ai-agent-activity-feed/` at 1440 × 900 and run Axe on any detail tab.
- Root cause: the shared `Header` primary navigation and resource breadcrumb both lacked accessible names.
- Affected code: `packages/ui/src/components/header.tsx` and `apps/site/src/pages/resources/[slug].astro`.
- Remediation: name them “Primary” and “Resource breadcrumb” respectively and assert both landmarks plus the `landmark-unique` Axe rule in desktop and mobile Playwright projects. Site v20 passes all eight tabs at both viewports with zero Axe violations, console errors, uncaught errors, failed requests, HTTP errors, or overflow. The desktop-only navigation remains correctly hidden below 1280px. Fix commit: `96ec0b04f234c209e43e462943e588a58d0308c3`.

### AUD-100 — Explore AI Chat Panel preview starts at an out-of-order heading level

- Evidence: The Site v20 desktop Explore report records one moderate Axe `heading-order` violation in the `AI Chat Panel actual preview` iframe, targeting its leading `h4`. The mobile Explore report has no Axe violations. See [`explore-1440x900.json`](evidence/catalog-search-v20/explore-1440x900.json) and the [desktop Explore capture](evidence/catalog-search-v20/explore-initial-1440x900.png).
- Reproduction: open `/explore` at 1440 × 900, wait for resource previews, and run Axe with WCAG 2.2 AA tags. The isolated AI Chat Panel preview begins at H4 without preceding headings.
- Root cause: the resource component uses a level-four heading even when rendered as the first heading in its standalone preview document.
- Affected code: `resources/ai/ai-chat-panel/index.tsx` and its generated preview/export source.
- Remediation: choose heading semantics that remain correct in the isolated resource preview and composed product contexts, add a browser regression, then verify the deployed desktop and mobile routes. Status remains open for the ordered resource/accessibility hardening work.

## MEDIUM

### AUD-106 — AI Developer Platform showcase duplicates its navigation

- **Evidence:** `quality/evidence/composition-quality/after/showcase-ai-developer-platform-mobile.png` shows two consecutive Prompt Workspace navigation bars before the mobile Prompt Canvas content. The public browser route returned HTTP 200 without console, uncaught, failed-request, or HTTP errors. Desktop and mobile runtime reports are in `quality/evidence/composition-quality/after/showcase-runtime-desktop.json` and `showcase-runtime-mobile.json`.
- **Reproduction:** open `/showcase/showcase-ai-developer-platform/` at 390 × 844 and inspect the first Prompt Canvas screen.
- **Root cause:** the screen graph contains both `navigation` and `editor-toolbar`; the `editor-toolbar` role maps to the same `minimal-top-nav` resource as navigation.
- **Affected code:** `packages/composer/src/screen-grammar.ts`, `packages/compatibility/src/semantic-roles.ts`, and `packages/composer/src/showcases.ts`.
- **Remediation:** during Step 43, provide an appropriate non-navigation toolbar resource contract or remove the duplicate role when global navigation is already present, then verify both desktop and mobile showcases.
- **Status:** open; intentionally deferred to the ordered showcase-hardening step.
- **Related evidence:** `quality/STEP_14_EVIDENCE.md`, `quality/evidence/composition-quality/after/runtime.json`.

### AUD-107 — Community timeline exposed internal workflow step identifiers

- **Evidence:** `quality/evidence/composition-quality/before/community-intermediate-metrics-direction-01.png` and its runtime record show `Step 1`, `choose-community`, and other internal identifiers in user-facing activity copy. The fixed browser capture uses natural-language example entries.
- **Reproduction:** compose CON-04 and inspect Direction A's Activity Stream timeline.
- **Root cause:** generic workflow binding copied internal step IDs into timeline descriptions.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** bind contextual community examples with human-facing copy and an explicit Example label. Local unit and browser checks pass; deployed verification remains open.
- **Related evidence:** `quality/STEP_14_EVIDENCE.md`, `quality/evidence/composition-quality/after/runtime.json`.

### AUD-108 — Community Activity Stream repeated its screen heading

- **Evidence:** the intermediate capture titled both the screen header and timeline card “Activity Stream”. The fixed capture calls the feed “Latest community updates”.
- **Reproduction:** compose CON-04 and compare the screen header with the timeline heading in Direction A.
- **Root cause:** the generic activity-feed title defaulted to the screen name even when the screen header already used it.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** give the community timeline its own contextual heading. Local browser and benchmark assertions pass; deployed verification remains open.

### AUD-109 — Direction C left most of a community activity canvas empty

- **Evidence:** the before screenshot `quality/evidence/composition-quality/before/composition-con-04-direction-03.png` places a lone activity panel in the narrow right column. The after screenshot uses the full content width, and the browser test measures feed width against its parent grid.
- **Reproduction:** compose CON-04, select Direction C, and compare the Activity Stream width with the workspace grid.
- **Root cause:** shared workspace layout always placed `activity-feed` in column 2, even when no data table filled column 1.
- **Affected code:** `packages/renderer/src/layout-contract.ts`.
- **Remediation:** add a shared activity-only workspace modifier that spans the feed across the single available column. Local browser regression passes; deployed verification remains open.

### AUD-110 — Employee dashboard invented onboarding and team-pulse values

- **Evidence:** the before flagship screenshot shows an unprovided count of 12 journeys and a Positive team-pulse result. The updated screenshot displays Example / Illustrative only for those values while retaining the 500-person figure from the brief.
- **Reproduction:** compose the flagship employee-experience brief and inspect Direction A's Team Overview.
- **Root cause:** default employee bindings inserted plausible count and sentiment data without a source.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** bind only the people count supplied by the brief and label other summary cards as illustrative examples. The 100-brief benchmark and visible browser check pass; deployed verification remains open.

### AUD-104 — Community activity screen contained irrelevant placeholder KPI cards

- **Evidence:** the before community screenshot shows em-dash KPI values and “Connect your data” prompts without a data integration feature. The intermediate capture shows entity-name cards labelled “Example” that still do not represent meaningful community measures. The fixed capture removes the unrelated metric section.
- **Reproduction:** compose CON-04 and inspect the Activity Stream summary area in all three directions at 1440 × 900.
- **Root cause:** the generic dashboard grammar required KPI cards even when the community feed had no relevant summary metrics.
- **Affected code:** `packages/composer/src/planner.ts` and `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** omit the KPI role for the community Activity Stream and keep example metrics only on screens where they add useful context. The benchmark and visible browser regression pass; deployed verification remains open.
- **Related evidence:** `quality/STEP_14_EVIDENCE.md`, `quality/evidence/composition-quality/after/runtime.json`.

### AUD-105 — Profile header contained unbound summary copy

- **Evidence:** the before community screenshot shows “Example profile summary” despite no corresponding prop. The after screenshot omits that unrelated phrase.
- **Reproduction:** compose CON-04 and inspect the header at 1440 × 900.
- **Root cause:** `entity-profile-header` rendered static text outside its declared props.
- **Affected code:** `resources/blocks/entity-profile-header/index.tsx` and `packages/exporter/src/generated-gold-sources.ts`.
- **Remediation:** remove the hardcoded phrase; catalog rebuild propagates the resource source. The local browser regression passes; deployed verification remains open.
- **Related evidence:** `quality/STEP_14_EVIDENCE.md`, `quality/evidence/composition-quality/after/runtime.json`.

### AUD-113 — Feature Bento rendered a blank card for three-item compositions

- **Evidence:** the before capture at `quality/evidence/step-14/manual-review/before/feature-bento-three-items-order-lookup-desktop.png` shows three return-portal items and a fourth card containing only decorative dots.
- **Reproduction:** open the Feature Bento resource preview and provide three items, or compose a product whose value-proposition binder provides three entities; inspect the grid.
- **Root cause:** the component always rendered four card slots although its `items` prop is optional and composition commonly supplies three entities.
- **Affected code:** `resources/sections/feature-bento/index.tsx` and its Gold resource browser-state regression.
- **Remediation:** render only supplied cards and use balanced one-, two-, three-, or four-item grid layouts.
- **Verification:** the Sites Worker browser test failed before the fix with four headings for three items. After the fix it checks three nonempty cards, no overflow, and clean browser diagnostics at 390 × 844 and 1440 × 900. Local verification passes; deployed review verification remains open.
- **Fix commit:** `993714e9`.

### AUD-114 — Returns request disable message was replaced by a generic backend tooltip

- **Evidence:** the ECOM-06 Return Request screen shows the disabled Submit return request action and service-connection helper copy in [the after capture](evidence/step-14/manual-review/after/ecom-06-return-request-direction-03-desktop.png). The [pre-fix reproduction record](evidence/step-14/manual-review/before/aud-114-disabled-tooltip-reproduction.md) records the observed generic backend title and notes that the first tooltip hover was not preserved as a screenshot. Desktop and mobile after captures show the disabled action. Viewport-specific runtime reports record the corrected title.
- **Reproduction:** open /compose, compose ECOM-06, select Return Request in a direction preview, and inspect the disabled submit button title.
- **Root cause:** the shared disabled-action fallback overwrote the specific returns-service explanation assigned by the content binder.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, its composition benchmark, and the visible Compose browser regression.
- **Remediation:** preserve the returns-specific disabled title and assert it in both the manifest benchmark and real Compose UI test. Both local regressions pass; deployed verification remains open.
- **Fix commit:** `77cbad5f`.

### AUD-115 — Returns request screen duplicated the primary navigation

- **Evidence:** the before capture at [Direction C, Return Request](evidence/step-14/manual-review/before/ecom-06-return-request-duplicate-navigation-before.png) shows Order Lookup, Refund Status, and Return Request repeated in the sidebar and a second top bar. The composition benchmark assertion failed before the planner fix because the screen contained a `settings-nav` node.
- **Reproduction:** open /compose, compose ECOM-06, inspect Direction C, and select Return Request.
- **Root cause:** the settings-screen grammar adds `settings-nav`; the generic resource mapping rendered another full product navigation inside the global sidebar shell.
- **Affected code:** `packages/composer/src/planner.ts` and the semantic and browser regressions for ECOM-06.
- **Remediation:** omit the settings sub-navigation for an explicit returns request form. The semantic regression failed before the planner fix and passes after it. The rebuilt visible browser test confirms a single rendered nav and captures the corrected screen; deployed verification remains open.

- **Fix commit:** `77cbad5f`.

### AUD-116 — Ordinary activity feeds rendered notification-inbox controls

- **Evidence:** the pre-fix SAS-01 Direction A screenshot at
  `evidence/step-14/manual-review/before/full-benchmark-initial/desktop/sas-01-direction-01.png`
  shows a notification panel on Overview Dashboard with “Mark all as read”. The
  after captures under `evidence/step-14/manual-review/after/activity-feed-sas-01-*`
  show a chronological timeline instead.
- **Reproduction:** open `/compose`, enter the SAS-01 design-consultancy brief,
  compose, and inspect Overview Dashboard in each direction at desktop or mobile
  size.
- **Root cause:** ordinary `activity-feed` roles could score either `timeline` or
  `notification-centre`; only consumer screens and Direction C were forced to use
  the timeline.
- **Affected code:** `packages/compatibility/src/compose-pipeline.ts`, its 100-brief
  composition benchmark, and the visible Compose browser regression.
- **Remediation:** use the timeline for activity by default and allow the
  notification centre only on explicitly named Notifications, Inbox, or Alerts
  screens. The benchmark red/green check covers every generated activity role;
  the browser test confirms all three SAS-01 directions at desktop and mobile.
  Local reports record no console, uncaught, failed-request, or HTTP errors.
  Deployed review verification remains open.

### AUD-117 — Activity examples exposed sequence labels and workflow identifiers

- **Evidence:** the pre-fix SAS-01 Direction A screenshot displays “Step 1”; the
  Direction C screenshot also shows raw identifiers such as `send-invites` and
  `configure-workspace`. The after captures show “Example” and readable labels.
- **Reproduction:** compose the SAS-01 brief and inspect the event time, title,
  and details in Directions A and C.
- **Root cause:** generic activity binding used the workflow array index as a
  timestamp and copied internal workflow step identifiers into the event detail.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the
  composition benchmark, and the visible Compose browser regression.
- **Remediation:** mark sample time as “Example” and humanize workflow names and
  steps before binding them to the resource. The benchmark checks all generated
  activity events for raw internal values, and the desktop/mobile browser test
  confirms the three rendered directions. Deployed review verification remains
  open.

### AUD-118 — Activity panel repeated the enclosing screen title

- **Evidence:** the pre-fix SAS-01 Direction A screenshot shows “Overview
  Dashboard” as the screen heading, KPI heading, and activity panel heading. The
  after capture labels the panel “Recent activity”.
- **Reproduction:** compose the SAS-01 brief, select Overview Dashboard, and
  compare the screen heading with the activity panel heading.
- **Root cause:** the generic `activity-feed` title fallback reused `screen.name`.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the
  composition benchmark, and the visible Compose browser regression.
- **Remediation:** use contextual activity headings for generic, employee,
  community, returns, and notification content. A manifest-level regression and
  real browser assertion cover every generated direction at desktop and mobile.
  Deployed review verification remains open.

### AUD-120 — Generated KPI cards used “Example” as a metric value

- **Evidence:** the before screenshot at
  `quality/evidence/step-14/manual-review/before/full-benchmark-initial/desktop/fin-05-direction-01.png`
  shows “Example” as the large value for Account, Transaction, and Transfer cards,
  even though their badge says “Illustrative only”. The after screenshots show an
  em dash and “Market data not connected”.
- **Reproduction:** compose FIN-05 in `/compose` and inspect Market Overview.
- **Root cause:** the shared content binder supplied the literal word “Example”
  whenever a product entity had no connected source value.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`,
  `resources/blocks/dashboard-kpi-grid/index.tsx`, the 100-brief composition
  benchmark, and the visible browser regression.
- **Remediation:** represent missing values as an em dash, disclose missing data
  connections, and style unavailable statuses neutrally. Values directly present
  in a brief are identified as brief-derived. The benchmark failed before the fix
  on FIN-05; it now checks all briefs. Deployed review verification remains open.

### AUD-121 — KPI status copy was cramped into two mobile columns

- **Evidence:**
  `quality/evidence/step-14/manual-review/before/fintech-kpi-mobile-before-layout.png`
  shows “Market data not connected” split across several short lines in two
  columns. The after mobile screenshot shows one card per row.
- **Reproduction:** open `/compose` at 390 × 844, compose FIN-05, and inspect
  Direction 01 Market Overview.
- **Root cause:** the shared KPI resource forced two columns below its medium
  container breakpoint even when cards were too narrow for their status copy.
- **Affected code:** `resources/blocks/dashboard-kpi-grid/index.tsx` and the
  visible Compose browser regression.
- **Remediation:** use one column in compact containers, two in intermediate
  containers, and three in wide containers. The browser test verifies computed
  grid columns at 390 × 844 and 1440 × 900; deployed review verification remains
  open.

### AUD-122 — Generic workspace branding repeated the word Workspace

- **Evidence:** the desktop and mobile before screenshots at
  `quality/evidence/step-14/manual-review/before/aud-122-workspace-brand-duplicate-desktop.png`
  and `...-mobile.png` show “Workspace Workspace” with a “WW” avatar. The after
  screenshots in `quality/evidence/step-14/manual-review/after/` show “Team
  Workspace” and “TW”.
- **Reproduction:** open `/compose` at 1440 × 900 or 390 × 844; enter the SAS-01
  design-consultancy brief; compose; inspect Direction 01, Overview Dashboard.
- **Root cause:** the shared content binder always appended “Workspace” to the
  first inferred entity, including when that entity was already named Workspace.
- **Affected code:** `packages/compatibility/src/content-bindings.ts` and the
  visible browser regression in `tests/e2e/composition-quality-smoke.spec.ts`.
- **Remediation:** use “Team Workspace” for a generic Workspace entity, preserve
  existing Workspace suffixes, and derive the two-letter avatar mark from the
  final brand. The red browser assertion failed at both viewports before the fix;
  the desktop/mobile browser run now passes with no captured browser/network
  errors.
- **Disposition:** fixed and locally verified; deployed review verification is
  still required.

### AUD-123 — SaaS overview repeated its page heading above KPI cards

- **Evidence:** the before screenshots at
  `quality/evidence/step-14/manual-review/before/aud-123-duplicate-kpi-heading-desktop.png`
  and `...-mobile.png` show two exact “Overview Dashboard” headings. The after
  screenshots at `quality/evidence/step-14/manual-review/after/` retain one page
  heading and label the KPI section “Key metrics”.
- **Reproduction:** open `/compose` at 1440 × 900 or 390 × 844; enter the SAS-01
  design-consultancy brief; compose; inspect Direction 01, Overview Dashboard.
- **Root cause:** generic metric-card titles fell back to `screen.name`, duplicating
  the parent page heading.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the
  100-brief composition benchmark, and the visible Compose browser regression.
- **Remediation:** assign generic KPI sections the heading “Key metrics” while
  retaining employee and returns-specific labels. The red browser assertion
  observed two page headings at both viewport sizes before the fix; browser and
  all-direction benchmark checks now pass locally.
- **Disposition:** fixed and locally verified; deployed review verification is
  still required.

### AUD-124 — Timeline sample data used “Example” as a timestamp

- **Evidence:** the desktop and mobile before captures for AUD-123 in
  `quality/evidence/step-14/manual-review/before/` show the Recent activity feed
  rendering “EXAMPLE” in the timestamp position beneath the sample event. The
  same shared binding produced that label for multiple industries.
- **Reproduction:** compose the SAS-01 consultancy workspace brief at 1440 × 900
  or 390 × 844, open Direction 01's Overview Dashboard, and inspect Recent
  activity. The prior 100-brief browser and composition data showed literal
  `time: "Example"` values in activity feeds across 51 briefs.
- **Root cause:** generic workflows and several domain-specific feed fixtures
  placed the sample marker in the `time` field instead of a human-readable
  relative label.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the
  composition-quality benchmark, and the visible Compose regression.
- **Remediation:** replace placeholder timestamp values with deterministic
  relative labels such as Today, Yesterday, and Earlier this week. The benchmark
  now rejects literal Example timestamps.
- **Verification:** the 100-brief benchmark failed on 51 brief cases before the
  fix and passes after it. The visible Compose regression passes at desktop and
  mobile sizes; both screenshots and runtime reports show no console, uncaught,
  failed-request, or HTTP errors.
- **Disposition:** fixed and locally verified; deployed review verification is
  still required.

### AUD-125 — Real-estate property search rendered marketing feature cards

- **Severity:** Medium.
- **Evidence:** `quality/evidence/step-14/manual-review/before/aud-125-real-estate-search-grid-before-desktop.png` shows a screen titled “Search & Map Explorer” with generic feature cards and no map or property results. The after capture `quality/evidence/step-14/manual-review/after/rea-01-direction-01-desktop.png` shows a truthful Property Search screen and listing table.
- **Reproduction:** Compose the REA-01 home-search brief, inspect Direction 01, and select the search screen.
- **Root cause:** The screen plan promised an unimplemented map and the results-grid semantic role resolved to a marketing Feature Bento resource.
- **Affected code:** `packages/composer/src/archetypes.ts`, `packages/compatibility/src/semantic-roles.ts`, `packages/compatibility/src/content-bindings.ts`, and composition benchmark/browser tests.
- **Remediation:** Rename the screen Property Search and bind results-grid to the existing Gold data table with domain-specific, clearly unconnected property fields. Desktop/mobile checks cover all three directions.
- **Disposition:** Fixed and verified in the local Sites Worker; public review deployment verification remains pending.

### AUD-126 — Marketplace search header used onboarding copy

- **Severity:** Medium.
- **Evidence:** The before capture `quality/evidence/step-14/manual-review/before/aud-126-search-input-onboarding-copy-before-desktop.png` shows “Continue onboarding” on a marketplace search page. The after MKT-01 captures show a “Search listings” label and service-connection disclosure.
- **Reproduction:** Compose the MKT-01 marketplace brief and inspect Explore Listings in each direction.
- **Root cause:** The shared search-header binder reused employee onboarding defaults when no domain-specific copy was present.
- **Affected code:** `packages/compatibility/src/content-bindings.ts` and the composition benchmark/browser tests.
- **Remediation:** Bind search label, placeholder, and help text to the detected marketplace, real-estate, education, and developer-tool context with a truthful generic fallback.
- **Disposition:** Fixed and verified in the local Sites Worker at desktop/mobile; public review deployment verification remains pending.

### AUD-127 — Travel hero repeated the objective in its subtitle

- **Severity:** Medium.
- **Evidence:** The before captures under `quality/evidence/step-14/manual-review/before/aud-127-travel-duplicate-objective-before-*` repeat the trip-planning objective in the hero. After captures `quality/evidence/step-14/manual-review/after/trv-01-direction-01-*` show concise audience-oriented supporting copy.
- **Reproduction:** Compose the TRV-01 trip-planning brief and compare the Direction 01 hero headline and subtitle.
- **Root cause:** Generic hero fallback copy restated the brief objective and appended a generic booking promise.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the composition benchmark, and visible browser tests.
- **Remediation:** Use concise contextual copy that does not repeat the objective or imply an unimplemented booking service.
- **Disposition:** Fixed and verified in the local Sites Worker at desktop/mobile; public review deployment verification remains pending.

### AUD-128 — Filter Builder did not edit conditions

- **Severity:** Medium.
- **Evidence:** The before capture `audit/evidence/step-06/after/browser-captures/gold-40/filter-builder-1440.png` shows static example rules; Add Condition inserted a fixed unrelated category. After captures under `quality/evidence/step-14/manual-review/after/aud-128-filter-builder-editable-*` show an empty state and an editable field/operator/value row.
- **Reproduction:** Open `/resources/filter-builder/`, add a condition, change its field, operator, and value, then remove it.
- **Root cause:** The add action appended a canned fixture row; existing rules were static text rather than stateful controls.
- **Affected code:** `resources/blocks/filter-builder/index.tsx`, its README, and `tests/e2e/preview-form-interactions.spec.ts`.
- **Remediation:** Add blank editable rules, support editing and removal, and explain that example rules do not apply until a data source is connected.
- **Verification:** The visible browser regression passes at 1440 and 390 widths, with screenshots and a runtime report showing no console, uncaught, failed-request, or HTTP errors.
- **Disposition:** Fixed and verified in the local Sites Worker; public review deployment verification remains pending.

### AUD-129 — Marketplace search showed unrelated proposal and review rows

- **Severity:** Medium.
- **Evidence:** The before marketplace captures at `quality/evidence/step-14/manual-review/before/full-benchmark-initial/desktop/mkt-01-direction-01.png` and the corresponding mobile path show non-listing records. After `quality/evidence/step-14/manual-review/after/mkt-01-search-direction-01-desktop.png` shows listing-specific records.
- **Reproduction:** Compose the MKT-01 marketplace brief and inspect the Explore Listings rows in Direction 01.
- **Root cause:** The generic entity-table binding reused proposal/review entities on a listing-discovery screen.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the 100-brief quality benchmark, and the visible browser regression.
- **Remediation:** Supply listing-specific sample records and reject proposal/review rows in marketplace search. The browser check covers all three directions at desktop/mobile sizes.
- **Disposition:** Fixed and verified in the local Sites Worker; public review deployment verification remains pending.

### AUD-130 — Entity rows implied fabricated numeric progress values

- **Severity:** Medium.
- **Evidence:** The same before MKT-01 capture shows `0/100` values for records with no numeric source. After screenshots label the values “Availability not connected”; related employee rows explicitly disclose that progress data is not connected.
- **Reproduction:** Compose MKT-01 and inspect the Explore Listings table values and status column.
- **Root cause:** The shared entity fallback formatted absent data as an arbitrary quality percentage, without regard to the record’s meaning.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the composition benchmark, and the visible browser regression.
- **Remediation:** Provide domain-specific unavailable states and reject generated numeric scores when source data contains no measure.
- **Disposition:** Fixed and verified in the local Sites Worker at desktop/mobile; public review deployment verification remains pending.

### AUD-131 — Mobile data tables clipped important fields

- **Severity:** Medium.
- **Evidence:** The before MKT-01 mobile capture at `quality/evidence/step-14/manual-review/before/full-benchmark-initial/mobile/mkt-01-direction-01.png` shows the table cropped at the viewport edge, hiding later fields. The after mobile capture shows full-width listing cards with the record and all fields stacked.
- **Reproduction:** Compose MKT-01 at 390 × 844 and inspect Explore Listings without horizontal scrolling.
- **Root cause:** `advanced-data-table` relied on an overflow-x scroll surface at all sizes and had no mobile record layout.
- **Affected code:** `resources/blocks/advanced-data-table/index.tsx`, its README, and the composition browser regression.
- **Remediation:** Preserve the keyboard-scrollable semantic table at wider widths and render each record as a labeled mobile card. The mobile browser check verifies all rows and no card overflow.
- **Disposition:** Fixed and verified in the local Sites Worker at 390 × 844; public review deployment verification remains pending.

### AUD-132 — Unavailable table values used the success color

- **Severity:** Medium.
- **Evidence:** The before MKT-01 capture shows “Availability not connected” in green. After desktop/mobile MKT-01 and REA-01 captures use neutral text for unavailable values. The browser regression asserts the neutral state class.
- **Reproduction:** Compose MKT-01 or REA-01 and inspect the listing table value color at desktop and mobile widths.
- **Root cause:** `advanced-data-table` applied the success green to every display value, including values explicitly marked unavailable.
- **Affected code:** `resources/blocks/advanced-data-table/index.tsx` and the visible browser regression.
- **Remediation:** Use neutral styling for not-connected/unavailable values while retaining success styling only for available values.
- **Disposition:** Fixed and verified in the local Sites Worker at desktop/mobile; public review deployment verification remains pending.

### AUD-133 — Employee dashboard marked disconnected metrics with success-green badges

- **Severity:** Medium.
- **Evidence:** The before captures at `quality/evidence/step-14/manual-review/before/aud-133-unavailable-kpi-success-tone-desktop.png` and `...-mobile.png` show em-dash values labelled “No connected data” in green. The after captures under `quality/evidence/step-14/manual-review/after/` use neutral gray badges.
- **Reproduction:** Open `/compose` at 1440 × 900 or 390 × 844, enter the exact employee-experience brief, compose, and inspect Team Overview in each direction.
- **Root cause:** The KPI status matcher recognized “not connected” but not “No connected data”, so the badge fell through to its success tone.
- **Affected code:** `resources/blocks/dashboard-kpi-grid/index.tsx` and `tests/e2e/direction-generation-audit.spec.ts`.
- **Remediation:** Classify common no-data, unavailable, unconfigured, illustrative, and sample states as neutral in the shared KPI resource.
- **Verification:** The visible-browser regression failed before the change on the success-green classes, then passed for all three directions at desktop and mobile sizes. Captured runtime reports record no console errors, uncaught exceptions, failed requests, or HTTP errors.
- **Fix commit:** `554c4ee6`.
- **Disposition:** Fixed and locally verified; deployed review verification is still required.

### AUD-138 — Destination search used flight-oriented search instructions

- **Severity:** Medium.
- **Evidence:** the baseline TRV-01 preview at quality/evidence/step-14/manual-review/before/full-benchmark-initial/desktop/trv-01-direction-01.png used travel-generic search language; current desktop/mobile previews say “Search destinations” and refer to saved places.
- **Reproduction:** open /compose, enter benchmark brief TRV-01, compose, and inspect the Destination Search label and placeholder.
- **Root cause:** shared travel search bindings used flight-oriented wording for a destination-planning screen.
- **Affected code:** packages/compatibility/src/content-bindings.ts and the composition-quality benchmark.
- **Remediation:** bind search copy to product and screen semantics. The all-directions regression and full desktop/mobile visible benchmark pass locally; deployed verification remains open.

### AUD-142 — Three-pane app shell clipped its navigation and inspector on mobile

- **Severity:** Medium.
- **Evidence:** the phone-width shell capture at
  `quality/evidence/step-14/accessibility/three-pane-shell-mobile-390-after.png`
  shows navigation, canvas, and inspector stacked in the available width. Before
  the fix, the fixed-width side panes exceeded 390px and the parent clipped them.
- **Reproduction:** open
  `/preview/?resource=three-pane-app-shell&variant=expressive&theme=dark` at
  390 × 844. The original fixed desktop row cut off the inspector; the repaired
  shell stacks all three panes with no horizontal overflow.
- **Root cause:** a desktop-only row with 14rem and 16rem fixed side panes used
  `overflow-hidden`, despite the resource declaring a mobile collapse strategy.
- **Affected code:** `resources/shells/three-pane-app-shell/index.tsx` and its
  responsive browser regression.
- **Remediation:** stack all panes on small screens, constrain the canvas width,
  and restore the three-column workspace at the tablet breakpoint.
- **Verification:** after fix commit `8a53e00c`, mobile browser checks confirm
  all three panes fit within 390px; desktop checks confirm all three columns
  remain present with no horizontal overflow. CI on the fixed commit is pending.
- **Disposition:** fixed locally; deployed verification remains pending.

### AUD-150 — Project DNA values were labelled inherited

- **Severity:** Medium.
- **Evidence:** the before screenshot at
  `quality/evidence/step-18/before/project-scope-reported-as-inherited.png`
  shows Project Scope while all Feel Mixer and Intent badges say INHERITED. The
  after desktop capture labels the same seven values PROJECT; the mobile report
  verifies the project source and an inherited child value.
- **Reproduction:** compose the exact employee-experience brief, open Direction C,
  select a node, deselect it, and inspect all DNA status badges at 1440 × 900.
- **Root cause:** the inspector treated a missing selected node as an inherited
  value rather than as the project-level source.
- **Affected code:** `packages/workbench/src/components/feel-mixer/FeelMixer.tsx`,
  `packages/workbench/src/components/right-inspector/IntentTab.tsx`, and the
  inheritance browser regression.
- **Remediation:** show Project at the base scope, Inherited or Overridden for
  node values, and Locked when a lock applies. The desktop regression checks all
  seven project-scope labels; mobile exercises an inherited node value.
- **Verification:** both desktop and mobile Playwright checks pass with zero
  console errors, warnings, uncaught exceptions, failed requests, or HTTP errors.
  Public review verification remains scheduled for Step 45.

### AUD-151 — DNA lock snapshot behavior was not explained after unlocking

- **Severity:** Medium.
- **Evidence:** the before capture at
  `quality/evidence/step-18/before/unlock-snapshots-as-overrides.png` shows all
  visible DNA dimensions marked Overridden after unlock, with Reset to Inherited
  available. The after captures show the locked value frozen, the unlocked
  snapshot explained by the lock control, and the changed parent value restored
  after an explicit reset.
- **Reproduction:** lock Design DNA on an inheriting child, change its parent,
  unlock the child, then inspect its status and reset control.
- **Root cause:** the control described protection during recomposition but did
  not disclose that the frozen effective values remain local after unlock.
- **Affected code:** `packages/workbench/src/components/right-inspector/ConstraintsTab.tsx`,
  `packages/workbench/src/components/feel-mixer/FeelMixer.tsx`, and the
  inheritance browser regression.
- **Remediation:** explain that the DNA snapshot remains local after unlock and
  that Reset to Inherited resumes ancestor values. The visible regression checks
  locked, unlocked-overridden, and reset-inherited states.
- **Verification:** desktop visible UI checks pass with clean runtime/network
  reports. Public review verification remains scheduled for Step 45.

### AUD-153 — Add Page accepted a route already in use

- **Severity:** Medium.
- **Evidence:** Baseline capture `quality/evidence/step-19/before/add-screen-route-collision.png` and JSON show `/people` submitted while the list count rose from 7 to 8 with no alert. The after report shows the count remains 7 and an accessible error is shown.
- **Reproduction:** In the Workbench Pages panel, add a new screen using the existing `/people` route.
- **Root cause:** The Add Page handler did not compare the normalized candidate route with routes already present in the manifest.
- **Affected code:** `packages/workbench/src/components/left-panel/PagesTab.tsx` and `tests/e2e/workbench-mutation-hardening.spec.ts`.
- **Remediation:** Normalize existing and proposed paths, reject collisions before mutation, and expose the reason as an alert. A unique route is then accepted.
- **Verification:** The baseline browser test fails because the route was added; current desktop/mobile checks verify rejection and successful unique route creation. Public review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-154 — Tree mutation engine actions were not reachable from the Layers UI

- **Severity:** Medium.
- **Evidence:** The baseline screenshot `quality/evidence/step-19/before/layer-actions-root.png` shows no selected-layer action panel. The baseline test cannot find the Duplicate action. After captures show the available actions at desktop and 390 × 844.
- **Reproduction:** Open the Playful HR Workbench, select Layers, then select the screen root or a child node.
- **Root cause:** The mutation executor supported insert, move and delete, but `LayersTab` rendered only node locks and no controls for those mutations.
- **Affected code:** `packages/workbench/src/components/left-panel/LayersTab.tsx`, `tests/e2e/workbench-mutation-hardening.spec.ts`, and `docs/WORKBENCH_SPEC.md`.
- **Remediation:** Connect non-root duplicate, sibling move and confirmed delete actions to the existing mutation/history path; explain disabled root/locked operations and document that cross-parent move is unavailable.
- **Verification:** Desktop/mobile regressions verify selection, locking guards, duplicate/move/delete, undo/redo, manifest fidelity, mobile bounds and no horizontal overflow. The action-region Axe scan reports no WCAG 2.0/2.1/2.2 A/AA violations. Public review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-155 — Unspecified mutation verbs were classified as Beta

- **Severity:** Medium.
- **Evidence:** Before inventory rows listed Improve, Simplify, Intensify and Match DNA as Beta, while the selected-layer UI had no corresponding distinct operations. The updated inventory, feature matrix and Workbench contract list them as Lab; Hide is Lab because visibility is absent from the manifest schema.
- **Reproduction:** Compare the mutation inventory and Workbench capability list with the visible controls and mutation schemas.
- **Root cause:** Natural-language intent language was recorded as a shipped capability without an operation-specific target, output contract or observable success criterion.
- **Affected code/docs:** `docs/CURRENT_PRODUCT_INVENTORY.md`, `docs/WORKBENCH_SPEC.md`, and `quality/FEATURE_MATRIX.md`.
- **Remediation:** Keep unspecified verbs out of the production mutation promise until their behavior and safety criteria are defined; mark them Lab and keep unsupported requests from silently mutating the manifest.
- **Verification:** Inventory, matrix and Workbench contract now describe implemented actions and documented Lab boundaries. This is a documentation/capability-tier correction; public review verification remains pending for Step 45.
- **Disposition:** Corrected and verified locally.
## LOW

### AUD-079 — Published Site favicon returned 404

- Evidence: the v10 [Compose capture](evidence/public-site-v10/compose-directions-1440.png) identifies the affected public page; the [baseline machine-readable smoke report](evidence/public-site-v10/flagship-smoke.json) records `/favicon.svg` as HTTP 404, corroborated by the Site Worker log. The v11 [desktop/mobile smoke report](evidence/public-site-v11/flagship-smoke.json) records HTTP 200 and `image/svg+xml` at both viewports.
- Reproduction: open `/compose` on Site v10 and request `/favicon.svg`.
- Root cause: pages declared the favicon URL, but the public asset directory did not contain the file.
- Affected code: `apps/site/public/favicon.svg`, `apps/site/src/layouts/PublicLayout.astro`, and the public page head declarations.
- Remediation: add the mark as a public SVG and cover status, content type, and SVG markup in desktop and mobile browser tests. The regression failed 2/2 before the asset was added, passed in the Sites Worker, and the deployed v11 check now passes at both viewports, so this finding is closed.
