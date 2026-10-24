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

**Current disposition:** 318 findings (0 Critical, 66 High, 238 Medium, 14 Low): 27 closed after deployed verification, 203 fixed locally and awaiting issue-specific deployed checks, 86 fixed and verified locally, 2 retain the legacy “fixed” status, and 0 remain open locally. Deployed verification remains a release gate.

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

### AUD-157 — Undo and redo history disappeared after reloading a local project

- **Severity:** High.
- **Evidence:** The desktop and mobile baseline reports in
  `quality/evidence/step-21/before/` record 51 visible edits and a saved manifest
  at Visual Ambition 51, but `undoEnabledAfterReload` is false. The screenshots
  show the loaded Workbench with Undo disabled. The after reports record exact
  undo, redo and checkpoint restoration, with no console or network errors.
- **Reproduction:** At 1440 × 900 or 390 × 844, open the Playful HR showcase in
  Workbench, open Project Scope > Intent, and make 51 keyboard changes on Visual
  Ambition. Reload the project URL. The manifest stays at 51 while Undo becomes
  disabled.
- **Root cause:** `WorkbenchShell` persisted the current manifest and checkpoint
  journal, but not the in-memory `history` and `future` stacks. `setManifest`
  correctly reset those arrays when the project loaded again.
- **Affected code:** `packages/workbench/src/persistence/storage.ts`,
  `packages/workbench/src/components/WorkbenchShell.tsx`,
  `packages/workbench/src/components/TopToolbar.tsx`,
  `packages/workbench/src/components/mobile/MobileWorkbench.tsx`, and
  `packages/workbench/src/store/workbench-store.ts`.
- **Remediation:** Store the 50-step stacks in a versioned IndexedDB store as
  validated immutable snapshots with a small pointer. Coalesce rapid edits so
  the latest stack reaches durable storage before reporting Saved, restore it
  when loading a project, and keep checkpoint restoration inside the same
  history bound.
- **Verification:** The desktop and mobile browser regression reloads after 51
  visible edits, undoes all 50 retained steps to the exact retained manifest,
  redoes all 50 to the exact final manifest, then reloads and restores a named
  checkpoint to the exact project state. Reports record zero console errors or
  warnings, uncaught exceptions, failed requests or HTTP errors. See
  `quality/STEP_21_EVIDENCE.md`. Public review verification remains pending for
  Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-158 — Blending a project overwrote the source project history

- **Severity:** High.
- **Evidence:** The [before screenshot](../quality/evidence/step-21/before/blend-source-history-overwritten-desktop-1440.png) and machine-readable report show the original project entering recovery mode with a missing undo-history snapshot after the blended project was reloaded. The [after screenshot](../quality/evidence/step-21/after/blend-source-history-preserved-desktop-1440.png) and report show both projects reloading independently and the source Undo restoring its prior DNA value.
- **Reproduction:** Open a Compose direction in Workbench and make a visible Intent edit. Blend it into a new project, reload the blend, then reopen the source project URL. Before the fix, the source Workbench displayed “Local project needs attention” and the missing-snapshot error.
- **Root cause:** Snapshot IDs were attached to manifest objects without an owning project scope, while IndexedDB used a global key. Blend reused a source snapshot in the new project history, overwrote the source record with blend ownership metadata, and left the source history pointer unresolved.
- **Affected code:** `packages/workbench/src/persistence/storage.ts` and `tests/e2e/workbench-actions-regression.spec.ts`.
- **Remediation:** Allocate snapshot IDs per owning project and include the project scope in each IndexedDB key so one manifest object can safely participate in multiple histories.
- **Verification:** The browser test was red before the fix and now creates/reloads the blend, reopens the source project, verifies Undo is enabled, and undoes the original edit. The reports contain zero console errors, failed requests, or HTTP errors. Public review verification remains pending for Step 45. See `quality/STEP_21_EVIDENCE.md`.
- **Disposition:** Fixed and verified locally.

### AUD-159 — A blocked localStorage read prevented IndexedDB project recovery

- **Severity:** High.
- **Evidence:** The before captures at `../quality/evidence/step-22/before/localstorage-read-blocks-indexeddb-recovery-desktop-1440.png` and `...mobile-390.png` show “Local project needs attention” even though the saved manifest and undo history exist in IndexedDB. After captures at `../quality/evidence/step-22/after/localstorage-read-blocks-indexeddb-recovery-desktop-1440.png` and `...mobile-390.png` show the exact project restored with a recovery warning.
- **Reproduction:** Open a saved Workbench project, deny reads for its project and active-project localStorage keys, then reload. Before the fix, Workbench stopped instead of using IndexedDB.
- **Root cause:** `loadBrowserProject` read the synchronous journal without a per-key exception boundary, so a browser `SecurityError` aborted the independent IndexedDB lookup.
- **Affected code:** `packages/workbench/src/persistence/browser-session.ts`, `packages/workbench/src/components/WorkbenchShell.tsx`, and `tests/e2e/workbench-persistence-hardening.spec.ts`.
- **Remediation:** Isolate journal reads, continue to the project database, and announce which store recovered the project.
- **Verification:** The desktop/mobile test failed before the fix and now restores the exported manifest and enabled Undo exactly, with no console, uncaught, failed-request or HTTP errors. Site deployment verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-160 — A full recovery journal treated a successful database save as fatal

- **Severity:** High.
- **Evidence:** The before reports at `../quality/evidence/step-22/before/recovery-journal-quota-blocks-workbench-desktop-1440.json` and `...mobile-390.json` record the Workbench blocking after `QuotaExceededError`. The after screenshots at `../quality/evidence/step-22/after/recovery-journal-quota-indexeddb-fallback-desktop-1440.png` and `...mobile-390.png` show an editable project restored from IndexedDB.
- **Reproduction:** Make browser `localStorage.setItem` throw `QuotaExceededError`, open Workbench, edit Visual Ambition, and reload. Before the fix, a journal-write failure ended the Workbench load even though IndexedDB was available.
- **Root cause:** `createProjectSaver` reported the synchronous recovery-journal write as a fatal save error before awaiting the independent database write.
- **Affected code:** `packages/workbench/src/persistence/browser-session.ts`, `packages/workbench/src/components/WorkbenchShell.tsx`, and `tests/e2e/workbench-persistence-hardening.spec.ts`.
- **Remediation:** Catch journal failures independently, probe quota at startup, save through IndexedDB, and show a truthful recovery message.
- **Verification:** Desktop/mobile regressions now edit, reload, and compare the exact saved manifest and history. Reports contain zero browser or network errors. Site deployment verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-161 — IndexedDB failure blocked journal-backed editing and history recovery

- **Severity:** High.
- **Evidence:** The before screenshots at `../quality/evidence/step-22/before/indexeddb-unavailable-blocks-workbench-desktop-1440.png` and `...mobile-390.png` show “Local project needs attention” after a visible project was opened. The after captures at `../quality/evidence/step-22/after/indexeddb-unavailable-journal-recovery-desktop-1440.png` and `...mobile-390.png` show an editable project with history explicitly marked limited.
- **Reproduction:** Make `IDBFactory.open` fail, open a showcase as a local project, edit its DNA, and reload. Before the fix, initial save or checkpoint/history reads ended the Workbench.
- **Root cause:** Project, history and checkpoint database failures were routed through the fatal load error even when the localStorage recovery journal retained the current project.
- **Affected code:** `packages/workbench/src/persistence/browser-session.ts`, `packages/workbench/src/persistence/storage.ts`, `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/components/TopToolbar.tsx`, `packages/workbench/src/components/mobile/MobileWorkbench.tsx`, and `tests/e2e/workbench-persistence-hardening.spec.ts`.
- **Remediation:** Keep journal-backed editing available, catch optional history/checkpoint failures, and label undo history as unavailable after reload instead of reporting it as saved.
- **Verification:** Desktop/mobile browser tests edit, reload, and compare the exact manifest while confirming the limited-history status, with no console or network errors. Site deployment verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-164 — Total storage failure falsely claimed a durable save

- **Severity:** High.
- **Evidence:** The desktop/mobile regression disables IndexedDB and makes Tessellate journal writes fail. Its assertion rejects any claim that the project was saved in the recovery journal. The after captures at `../quality/evidence/step-22/after/storage-unavailable-export-warning-desktop-1440.png` and `...mobile-390.png`, with runtime reports beside them, show the truthful unsaved warning and working manifest export. The regression is configured to save a before capture if the false claim is observed; no such before capture was produced in this run.
- **Reproduction:** Disable IndexedDB and make all Tessellate journal writes throw `QuotaExceededError`, open `/workbench`, and inspect the storage warning. Before the fix, the warning promised a journal save that never happened.
- **Root cause:** `createProjectSaver` reported the in-memory project fallback as journal-backed even when the journal write had failed.
- **Affected code:** `packages/workbench/src/persistence/browser-session.ts`, `packages/workbench/src/components/TopToolbar.tsx`, and `tests/e2e/workbench-persistence-hardening.spec.ts`.
- **Remediation:** Distinguish memory fallback with a failed journal from a successful journal fallback; say that the project is unsaved and prompt an immediate manifest export.
- **Verification:** The desktop and mobile browser regression keeps the session editable, validates the exported manifest, confirms no durable-save claim, and reports no console or network errors. The test contains a failing assertion for the false claim; the original before screenshot was not retained. Site deployment verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-165 — User-authored semantic copy broke standalone React/Vite builds

- **Severity:** High.
- **Evidence:** The failing clean-export log at `../quality/evidence/step-23/before/user-authored-semantic-copy-clean-build.log` records TypeScript parser errors in the generated Dashboard after ordinary text included quotes and `<`. The fixed desktop and mobile previews at `../quality/evidence/step-23/after/user-authored-semantic-copy-desktop-1440.png` and `...mobile-390.png`, with [runtime report](../quality/evidence/step-23/after/user-authored-semantic-copy-runtime.json), show that the exact copy renders as text in the independent build.
- **Reproduction:** Export a manifest containing built-in navigation, KPI, action, and status nodes with user-authored strings containing quotes, `<`, or `&`; install the generated package in a clean directory and run `pnpm build`. Before the fix, the generated TSX fails with `TS1003`, `TS1382`, and `TS1002`.
- **Root cause:** The Vite generator inserted semantic-role values directly into quoted JSX attributes and raw JSX children, without escaping them as JavaScript string expressions.
- **Affected code:** `packages/exporter/src/source-tree.ts`, `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`, and `quality/export/benchmark-standalone-runtime.ts`.
- **Remediation:** Serialize user-authored header, metric, action, status, and class values with `JSON.stringify` into JSX expressions so React renders them as text and attributes.
- **Verification:** The red-to-green regression performs a clean install/build and checks visible text, absence of injected script elements, desktop/mobile layout, console, and network state. All 300 projects in the 100-brief × three-direction export benchmark also install, build, open in Vite preview, and pass every-screen desktop/mobile checks with zero Tessellate runtime dependencies. See `quality/STEP_23_EVIDENCE.md`. Public review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-167 — Generated navigation brand disagreed with the project brand

- **Severity:** High.
- **Evidence:** The before Compose-to-Workbench screenshot is `../quality/evidence/step-24/before/employee-content/employee-content-pre-fix-desktop.png`; its captured manifest extract shows `People & Co` in the manifest and `People & Teams` in nine resource props. The after desktop/mobile reports record eight matching brand props and zero mismatches.
- **Reproduction:** Compose the exact employee-experience brief, select Direction C, then compare the Workbench/product navigation label with `ProjectManifest.brand.name`.
- **Root cause:** The manifest name and content binder independently hard-coded different workspace brands.
- **Affected code:** `packages/compatibility/src/content-bindings.ts` and `packages/compatibility/src/compose-pipeline.ts`.
- **Remediation:** Resolve the workspace brand once and pass it to every resource content binding.
- **Verification:** Composition unit tests and desktop/mobile Preview browser tests confirm consistent branding. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-168 — Employee marketing actions opened the wrong screens

- **Severity:** High.
- **Evidence:** The before manifest in `../quality/evidence/step-24/before/employee-content/employee-content-pre-fix-desktop.json` resolves “Meet your team” to Onboarding and “Explore onboarding” to Marketing Home. The after Workbench Preview tests activate both links at desktop and mobile sizes.
- **Reproduction:** Compose the exact employee-experience brief, open Direction C in Workbench Preview, and activate both Marketing Home actions.
- **Root cause:** Employee primary-target selection preferred onboarding, and the secondary fallback selected the first non-primary screen.
- **Affected code:** `packages/compatibility/src/content-bindings.ts` and `packages/compatibility/src/__tests__/compose-pipeline.test.ts`.
- **Remediation:** Map the primary action to Teams and the secondary action to Onboarding.
- **Verification:** Visible Preview navigation opens the stated screens at desktop and mobile, with zero browser/network errors. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-169 — Teams directory displayed colleague rows and mislabeled columns

- **Severity:** High.
- **Evidence:** The pre-fix extract `../quality/evidence/step-24/before/employee-content/employee-content-pre-fix-extract.json` records colleague rows and Colleague/Team/Progress columns on Teams. The after [desktop](../quality/evidence/step-24/after/employee-product-teams-desktop-chrome.png) and [mobile](../quality/evidence/step-24/after/employee-product-teams-mobile-chrome.png) screenshots show sample team records and Team/Focus/Members/Status columns.
- **Reproduction:** Compose the exact brief, open Direction C in Workbench Preview, and inspect the Teams screen.
- **Root cause:** People, Teams and Engagement reused one employee sample-row mapping.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** Bind team-specific sample records and identify unconnected membership/count fields.
- **Verification:** Unit and UI regressions reject colleague rows and verify the visible team-specific labels. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-170 — Engagement repeated generic team overview content

- **Severity:** High.
- **Evidence:** The pre-fix extract `../quality/evidence/step-24/before/employee-content/employee-content-pre-fix-extract.json` shows the Engagement title and rows matching the generic overview. The after [desktop](../quality/evidence/step-24/after/employee-product-engagement-desktop-chrome.png) and [mobile](../quality/evidence/step-24/after/employee-product-engagement-mobile-chrome.png) captures show distinct feedback and recognition content with no invented connected metrics.
- **Reproduction:** Compose the exact brief, open Direction C in Preview, and compare Team Overview with Engagement.
- **Root cause:** Employee records and summary metrics were selected without considering screen purpose.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** Bind sample feedback/recognition rows and unconnected-state metrics to Engagement.
- **Verification:** The content regression confirms Engagement records differ from Overview and the desktop/mobile browser captures show the expected screen. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-173 — Teams directory showed an enabled pagination action with no behavior

- **Severity:** High.
- **Evidence:** The before capture `../quality/evidence/step-24/before/employee-content/employee-teams-before-pagination-fix.png` shows an enabled “Continue” button. After captures show the disabled “Paging unavailable” action and the browser test verifies its explanatory title.
- **Reproduction:** Compose the exact brief, open Teams in Workbench Preview and activate the pagination action.
- **Root cause:** The pagination role fell back to a generic Gold button with an enabled default and no paging handler.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** Disable the action until paging data exists and state that limitation in the visible label/title.
- **Verification:** Desktop/mobile Preview asserts the button is disabled and has the paging-data explanation. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-174 — Disabled Settings save control used a generic live-product CTA label

- **Severity:** High.
- **Evidence:** The before capture `../quality/evidence/step-24/before/employee-content/employee-settings-before-single-navigation.png` shows “Explore Interface System →” on Settings. After captures show the disabled “Connect persistence to save” control.
- **Reproduction:** Compose the exact brief, open Settings & Policies in Workbench Preview, and inspect the save control.
- **Root cause:** The content binder’s Magnetic Button allowlist passed unsupported `label`/`disabled`/`title` props but omitted the component’s supported `children` prop, so its generic demo default appeared.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** Pass the supported child label and keep the control disabled while no save handler exists.
- **Verification:** A red-to-green composition test and visible desktop/mobile browser assertions confirm the explicit disabled label. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-175 — Standalone export duplicated navigation and exposed undeclared screens

- **Severity:** High.
- **Evidence:** The before [mobile screenshot](../quality/evidence/step-24/before/standalone-export-navigation-mobile-390.png) shows the generated all-screens bar duplicating the screen's own navigation and including Onboarding, which is omitted from the manifest's declared navigation. The after [desktop](../quality/evidence/step-24/after/standalone-export-navigation-desktop-1440.png) and [mobile](../quality/evidence/step-24/after/standalone-export-navigation-mobile-390.png) captures and [runtime report](../quality/evidence/step-24/after/standalone-export-navigation-mobile-chrome.json) record the standalone Vite result.
- **Reproduction:** Export the employee-experience Direction C project to React/Vite, open the clean standalone preview at desktop/mobile sizes, compare its screen-level navigation with the exporter shell, and activate a declared destination.
- **Root cause:** The exporter built a second navigation menu from every screen instead of using `ProjectManifest.navigation` and did not account for screen-level navigation resources.
- **Affected code:** `packages/exporter/src/source-tree.ts`, exporter regressions, and `packages/exporter/src/agent-handoff.ts`.
- **Remediation:** Bind navigation resources and shell fallback links to manifest primary/secondary items, render shell navigation only for the active screen without a navigation resource, and switch screens through accessible hash links.
- **Verification:** A red-to-green clean install/build/real-browser regression now verifies declared destinations, hidden-screen omission, navigation resource/shell fallback switching, zero mobile overflow, and zero console, warning, exception or network errors. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-233 — Resource scaffolder invented publish-ready provenance and certification metadata

- **Severity:** High; CLI `create-resource`.
- **Evidence:** The pre-fix generator assigned a named contributor, MIT with redistribution verified, original/no-AI provenance, three verified widths, AA/keyboard/screen-reader/reduced-motion claims, and high quality scores before review. The isolated after capture at `quality/evidence/step-39/after/cli/draft-scaffold.json` records the corrected output and successful schema validation.
- **Reproduction:** Run `tess create-resource --slug example-card` in a clean directory and inspect `resource.json` before editing it.
- **Root cause:** The generator reused launch-ready metadata and the schema could not represent unknown provenance or an empty responsive verification list.
- **Affected code:** `packages/cli/src/commands/create-resource.ts`, `packages/schemas/src/resource.ts`, and `packages/registry-gate/src/checks/license-provenance-check.ts`.
- **Remediation:** Generate an unpublished draft with unknown provenance, unselected license and unverified redistribution, no claimed responsive or accessibility verification, and zero unassessed quality scores. Allow unknown provenance and empty verified widths in the schema, and block unknown provenance at registry submission.
- **Verification:** Schema, registry-gate, and CLI regressions pass. The real CLI was built and run from an isolated temporary directory; manifest validation succeeds while metadata remains explicitly unverified. Fixed locally; not a Site runtime issue.

### AUD-263 — Resource catalogue presented template accessibility flags and quality scores as assessed metadata

- **Severity:** High; public resource details, search and composition selection.
- **Evidence:** The deployed-before [Accessibility tab](../quality/evidence/step-39/deployed-before/resource-metadata/desktop/accessibility-tab.png) and [machine record](../quality/evidence/step-39/deployed-before/resource-metadata/desktop/accessibility-tab.json) show `/r/success-state` at 1440×900 returning HTTP 200 with a WCAG AAA target and green verification icons. The source audit found all 324 manifests had all five accessibility verification flags set; 284 non-Gold resources had no retained Gold browser certification. Overall scores were 96–98 and accessibility scores 98–99 without a quality-assessment status or evidence reference. Machine evidence: `quality/evidence/step-39/resource-assessment-audit.json`.
- **Reproduction:** Open `/r/success-state`, select Accessibility, then compare with the Gold certification evidence in `quality/STEP_06_EVIDENCE.md`. Inspect `resources/**/manifest.json` and the resource builder templates; observe that the unsupported values also flowed into search and compatibility ranking.
- **Root cause:** Builders copied high scores, AAA targets, and positive verification flags into resources without checking test evidence. The schema could not distinguish an unassessed score from a reviewed score.
- **Affected code:** `scripts/*-builder.ts`, canonical resource manifests, `packages/schemas/src/resource.ts`, catalogue/compatibility/search consumers, and resource detail/Workbench inspectors.
- **Remediation:** Add an evidence-bearing quality assessment state; suppress unassessed scores from UI, quality filtering, and compatibility ranking; leave the 284 non-Gold accessibility flags unverified; set resource WCAG targets to AA; and distinguish Gold browser checks from manifest claims. Desktop/mobile browser verification is pending; the finding remains open for public closure at Step 45.

## HIGH (continued — 2026-10-24, Step 41 dependency audit)

### AUD-312 — transitive undici versions failed the dependency security gate

- **Severity:** High; workspace dependency graph.
- **Evidence:** `quality/evidence/step-41/pnpm-audit.json` records six undici advisories, including two high findings, for undici 7.29.1 in Wrangler/Miniflare paths and 8.11.2 in the Astro/Unifont path. `quality/evidence/step-41/dependency-audit-after.log` shows the clean dependency audit.
- **Reproduction:** Run `pnpm audit:dependencies` on the pre-fix lockfile; it reports high/moderate undici advisories against the locked 7.x and 8.x versions.
- **Root cause:** the workspace override pinned undici 7 below its patched version and did not constrain the newly resolved undici 8 line.
- **Affected code:** `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
- **Remediation:** move undici 7 to 7.30.1 and undici 8 to 8.12.2, matching the patched upstream release lines.
- **Verification:** `pnpm audit:dependencies` reports no known vulnerabilities and `pnpm why undici -r` confirms only 7.30.1 and 8.12.2 remain. Full quality gates are being rerun; public review verification remains pending.
- **Disposition:** Fixed and verified locally.

## MEDIUM

### AUD-171 — Policy acknowledgement was implied without a connected save flow

- **Severity:** Medium.
- **Evidence:** The pre-fix persisted manifest showed generic notification-preference copy. The after [desktop](../quality/evidence/step-24/after/employee-product-settings-policies-desktop-chrome.png) and [mobile](../quality/evidence/step-24/after/employee-product-settings-policies-mobile-chrome.png) captures show a preview-only field and a disabled save action that names the missing persistence requirement.
- **Reproduction:** Compose the exact brief, open Settings & Policies in Workbench Preview, and inspect the field/helper/save control.
- **Root cause:** The composition is a local UI preview without a policy store, but the content was not specific or clear about its persistence boundary.
- **Affected code:** `packages/compatibility/src/content-bindings.ts` and `packages/compatibility/src/__tests__/compose-pipeline.test.ts`.
- **Remediation:** Label guidance as sample content, state that acknowledgements are not stored, and disable the save action with an explicit persistence message. Do not represent the sample as a connected HR workflow.
- **Verification:** Desktop/mobile UI assertions confirm the preview-only and not-stored copy and disabled save action. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally; an actual policy store remains outside this preview’s scope.

### AUD-172 — Settings rendered the same product navigation twice

- **Severity:** Medium.
- **Evidence:** The [before screenshot](../quality/evidence/step-24/before/employee-content/employee-settings-before-single-navigation.png) shows two repeated People & Co navigation blocks. The after desktop/mobile captures show one navigation block; the stored manifest reports only the shared `navigation` role.
- **Reproduction:** Compose the exact brief, open Settings & Policies in Preview, and count navigation surfaces.
- **Root cause:** Settings grammar required `settings-nav` even though the shared navigation is inserted for every screen and the settings role mapped to the same Gold top navigation resource.
- **Affected code:** `packages/composer/src/planner.ts`.
- **Remediation:** Remove the redundant `settings-nav` role from planned settings screens while the shared Gold navigation is used.
- **Verification:** A previously failing composition regression and the desktop/mobile UI test confirm one navigation surface. Published review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

## MEDIUM

### AUD-166 — Agent handoff package was incomplete and unavailable in Workbench

- **Severity:** Medium.
- **Evidence:** Before the fix, the new exporter contract regression found only three legacy files, and the desktop browser journey timed out because the Workbench had no `export-agent-handoff-btn`. After screenshots at `../quality/evidence/step-24/after/workbench-agent-handoff-menu-desktop-chrome.png` and `...mobile-chrome.png` show the Beta action, with [desktop](../quality/evidence/step-24/after/agent-handoff-desktop-chrome.json) and [mobile](../quality/evidence/step-24/after/agent-handoff-mobile-chrome.json) runtime reports.
- **Reproduction:** Open the employee-experience project in Workbench and inspect Export; before the fix there was no Agent Handoff action. The generator returned only `AGENT_BRIEF.md`, `PROJECT_DNA.json`, and `manifest.tess.json`, and did not include `ProjectManifest.locks` in its lock summary.
- **Root cause:** The generator remained a partial library prototype instead of the seven-file contract, ignored project-level lock records, and was not connected to Workbench.
- **Affected code:** `packages/exporter/src/agent-handoff.ts`, `packages/exporter/src/__tests__/exporter.test.ts`, `packages/workbench/src/components/TopToolbar.tsx`, and `tests/e2e/compose-workbench-handoff.spec.ts`.
- **Remediation:** Generate the exact seven project-specific contract files from a schema-validated manifest, document node and project locks, make baseline and registry dependency limits explicit, add an actionable first vertical slice with dependency/resource resolution and concrete test criteria, and expose the ZIP through a visibly Beta Workbench action.
- **Verification:** The employee-experience Compose → Direction C → Workbench browser regression downloads and checks all seven files at 1440 × 900 and 390 × 844 using keyboard navigation. It verifies exact manifest parity, product audience/objective, screens, lock targets and resource references; a desktop session is resized to 390 × 844 with the same project ID and manifest hash and no document overflow. Console, uncaught, failed-request and HTTP-error lists are empty. Local validation passed; public review verification remains pending for Step 45. The generated handoff remains Beta because registry-specific dependency declarations still require catalogue resolution.
- **Disposition:** Fixed and verified locally.

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

- Evidence: the prior [before capture](evidence/step-06/before/a11y-gold/ai-research-answer-quiet-1440.png) shows the light green badge; the deployed review [Dark Expressive capture](../quality/evidence/step-39/deployed-before/final-regressions/desktop/ai-research-answer-dark-expressive.png) still measures 2.34:1. The local [corrected light-theme capture](evidence/step-06/after/a11y-gold/ai-research-answer-quiet-1440.png) and refreshed 120-variant Gold matrix pass.
- Reproduction: on the deployed review Site, open `/preview/?resource=ai-research-answer&variant=expressive` at 1440×900 and run Axe. The Example badge is reported at 2.34:1.
- Root cause: the green confidence color measured 2.34:1 on the pale badge background.
- Affected code: `resources/ai/ai-research-answer/index.tsx`.
- Remediation: use a darker green for light variants and a lighter green for Nocturne. The fresh local Sites Worker matrix reports zero violations; the deployed review Site still serves the failing version, so status remains `fixed-awaiting-deployed-verification` pending public review re-audit.

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
- Remediation: the local composition pipeline applies navigation topology and layout grammar to each manifest. Its browser regression compares A/B/C root roles, navigation, screen graph, resource references, rendered geometry, diagnostics, and runtime/network state.
- Local verification: the rebuilt Site renders A as a sidebar shell, B as a top-navigation canvas, and C as a workspace dock with a rail and aligned data-table/activity panes. Required employee content remains consistent while rendered structure changes. The 1440×900 run records no unresolved roles, browser errors, failed requests, or HTTP errors. See `quality/evidence/directions/current/runtime.json` and the three direction screenshots there.
- Disposition: fixed locally; awaiting published review-site verification at Step 45.

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
- Remediation: change the isolated sample heading to a semantic `h2`, regenerate the shared resource and exporter artifacts, and protect the hierarchy with a desktop/mobile Sites Worker regression.
- Local verification: the pre-fix Sites browser run observed H4 and failed; the rebuilt version passed at 1440×900 and 390×844 with H2 first and no captured runtime/network errors. Captures and machine records are in `quality/evidence/step-35/after/ai-chat-panel-heading-sites-*`.
- Disposition: fixed locally; awaiting published review-site verification at Step 45.

## MEDIUM

### AUD-106 — AI Developer Platform showcase duplicates its navigation

- **Evidence:** `quality/evidence/composition-quality/after/showcase-ai-developer-platform-mobile.png` shows two consecutive Prompt Workspace navigation bars before the mobile Prompt Canvas content. The public browser route returned HTTP 200 without console, uncaught, failed-request, or HTTP errors. Desktop and mobile runtime reports are in `quality/evidence/composition-quality/after/showcase-runtime-desktop.json` and `showcase-runtime-mobile.json`.
- **Reproduction:** open `/showcase/showcase-ai-developer-platform/` at 390 × 844 and inspect the first Prompt Canvas screen.
- **Root cause:** the screen graph contains both `navigation` and `editor-toolbar`; the `editor-toolbar` role maps to the same `minimal-top-nav` resource as navigation.
- **Affected code:** `packages/composer/src/screen-grammar.ts`, `packages/compatibility/src/semantic-roles.ts`, and `packages/composer/src/showcases.ts`.
- **Remediation:** until a real editor-toolbar resource contract exists, omit that role when product navigation is already present.
- **Local verification:** the desktop/mobile showcase route regression selects Prompt Canvas, asserts exactly one navigation role and no editor-toolbar substitute, and captures the rendered preview. The route matrix records HTTP 200, no Axe violations, console errors, uncaught exceptions, failed requests, HTTP errors, or overflow. Captures are in `quality/evidence/step-34/after/*-showcase-ai-developer-platform-prompt-canvas.png`.
- **Disposition:** fixed locally; awaiting published review-site verification at Step 45.
- **Related evidence:** `quality/STEP_34_EVIDENCE.md` and `quality/evidence/step-34/after/{desktop,mobile}-chrome-route-audit.json`.

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

### AUD-156 — Mobile Workbench hid structural-action results outside the Command tab

- **Severity:** Medium.
- **Evidence:** The before captures at
  `quality/evidence/step-20/before/recompose-feedback-hidden-mobile-390.png` and
  `quality/evidence/step-20/before/surprise-feedback-hidden-mobile-390.png` show
  the 390 × 844 Pages view after each action with no visible success message.
  Their runtime reports record `mutationApplied: true`, `feedbackVisible: false`,
  and no console errors, uncaught exceptions, failed requests, or HTTP errors.
  The after reports and screenshots show each action message below the toolbar.
- **Reproduction:** At 390 × 844, open the Playful HR showcase in Workbench,
  select Pages, lock the Team Overview KPI subtree, then run Recompose or
  Surprise Me. Export the manifest to confirm the operation occurred and inspect
  the active tab for a status announcement.
- **Root cause:** `MobileWorkbench` mounted `CommandBar` only on the Command tab;
  the shared `lastActionMessage` was consumed only by that panel.
- **Affected code:** `packages/workbench/src/components/mobile/MobileWorkbench.tsx`
  and `tests/e2e/workbench-structural-hardening.spec.ts`.
- **Remediation:** Render the shared action message as a polite live status below
  the toolbar on all other mobile tabs. The regression checks message content,
  viewport bounds, exact lock preservation, catalogue resolution, and undo/redo.
- **Verification:** All four desktop/mobile browser cases pass at 1440 × 900 and
  390 × 844. They report 324 resolvable catalogue resources, no duplicate node
  IDs, no console/runtime/network errors, and exact undo/redo restoration.
  Structural unit tests cover Recompose divergence 20, 50, 70 and 95; Surprise Me
  covers 20, 60 and 90. Public review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-162 — Legacy project migrations were not written back to browser storage

- **Severity:** Medium.
- **Evidence:** Before reports at `../quality/evidence/step-22/before/legacy-project-not-upgraded-desktop-1440.json` and `...mobile-390.json` record Workbench rendering schema `1.0.0` while browser storage remained `0.1.0`. After reports at `../quality/evidence/step-22/after/legacy-project-upgraded-desktop-1440.json` and `...mobile-390.json` confirm current-schema persistence and exact reload restoration.
- **Reproduction:** Seed a valid `0.1.0` project in the browser journal, open its Workbench URL, then inspect the saved record. Before the fix, only the in-memory manifest was migrated.
- **Root cause:** The browser loader returned the migrated manifest without recording that migration occurred, so Workbench did not persist the canonical form.
- **Affected code:** `packages/workbench/src/persistence/browser-session.ts`, `packages/workbench/src/components/WorkbenchShell.tsx`, and `tests/e2e/workbench-persistence-hardening.spec.ts`.
- **Remediation:** Track a successful migration, announce the upgrade, and save the validated current-schema manifest back to the browser stores.
- **Verification:** The desktop/mobile regression failed before the fix and now verifies the exported schema, stored schema, and exact project after reload. Site deployment verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-176 — WebKit reported a strict-CSP violation for an empty preview style

- **Severity:** Medium.
- **Evidence:** Before report at `evidence/step-38/before/webkit-explore-style-csp.json`; after reports at `quality/evidence/step-38/after/webkit-explore-style-csp.json` and the desktop/mobile workload JSON files. Screenshots are under `quality/evidence/step-38/after/`.
- **Reproduction:** In WebKit, open `/explore`, search for `onboarding`, and wait for the preview frames to mount at 1440 × 900 or 390 × 844.
- **Root cause:** WebKit reported a blocked inline rule with sample `body {}`. Its event had no source file or DOM target, and application-side style instrumentation saw no insertion, so the rule's producer is unknown.
- **Affected code:** `apps/sites/prepare-static.mjs`, `tests/e2e/sites-preview-csp.spec.ts`, and `tests/e2e/performance-workloads-step-38.spec.ts`.
- **Remediation:** Add only the exact SHA-256 of the sampled no-op rule to `style-src` and `style-src-elem`. No general inline-style permission was added.
- **Verification:** The complete Explore → Compose → Direction C → Workbench → Recompose → ZIP workflow and eight CSP scenarios pass in WebKit desktop/mobile with zero CSP events, console errors, uncaught exceptions, failed requests, or HTTP errors. Public deployment verification remains pending.
- **Disposition:** Fixed locally; awaiting deployed verification.

### AUD-177 — AI Prompt Hero claimed an unavailable provider and generation action

- **Severity:** Medium.
- **Evidence:** Before desktop/mobile screenshots and JSON are in `../quality/evidence/step-39/before/`; after captures and interaction evidence are in `../quality/evidence/step-39/after/`. The local Sites Worker Axe scan reports zero violations at both viewports, and application runtime/network logs are empty.
- **Reproduction:** Open `/r/ai-prompt-hero` in the local Sites Worker at 1440×900 or 390×844. Before the fix, the page named Gemini 2.5 Flash / BYO Key, promised a full generated interface, and exposed an enabled action with no handler. Selecting the first example only filled the text field.
- **Root cause:** The component, manifest, and duplicate section authoring seed described an integrated AI generator although no model or submit callback existed.
- **Affected code:** `resources/sections/ai-prompt-hero/{index.tsx,manifest.json,fixtures.ts,README.md}`, `scripts/sections-batch-1.ts`, and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation:** Describe the section as a prompt-input pattern, remove the provider and trading example, add an accessible field name and optional host callback, and disable the action with a local-only explanation when no callback is supplied.
- **Verification:** The desktop/mobile regression confirms keyboard-operated presets, direct input, disabled action, zero serious/critical Axe issues, and zero application console/network errors. Unit tests, typecheck, catalogue, monorepo/Sites builds, bundle budget, licence/provenance and security audits pass. Public deployment verification remains pending.
- **Disposition:** Fixed locally; awaiting deployed verification.

### AUD-178 — Sandboxed resource preview modules fail in the Astro preview runtime

- **Severity:** Medium.
- **Evidence:** The desktop screenshot and machine-readable capture are in `../quality/evidence/step-39/astro-failure/desktop/`; mobile runtime details are in `../quality/evidence/step-39/astro-failure/mobile/`. The preview iframe is blank and its `client.*.js` and `PreviewHost.*.js` requests fail CORS because the sandbox sends an opaque `null` origin while Astro preview serves an origin-specific or missing `Access-Control-Allow-Origin` header.
- **Reproduction:** Run the Astro production preview and open `/r/ai-prompt-hero` at 1440×900 or 390×844. Inspect the resource preview iframe and browser console/network log; the outer resource page loads, but the sandboxed preview remains blank.
- **Root cause:** the failure was reproduced only in Astro's local preview server, which ignores the static `_headers` file and therefore does not model the Sites asset CORS policy. The iframe's opaque origin is expected; Sites Worker applies a scoped CORS policy to fingerprinted `/_astro/*` assets.
- **Affected code:** `apps/site/public/_headers`, `playwright.config.ts`, and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation:** run sandbox module checks against the Sites Worker adapter; keep the iframe opaque and CSP unchanged. The existing static header and Worker policy scope cross-origin access to fingerprinted `/_astro/*` assets.
- **Local verification:** the rebuilt Sites Worker loads the real `/r/ai-prompt-hero/` preview at 390×844 and 1440×900 with HTTP 200 and no browser, failed-request, or HTTP errors. See `../audit/evidence/step-06/results/canonical-resource-route.json` and its screenshots. Plain Astro preview still ignores `_headers` and is not the deployment-runtime test.
- **Disposition:** fixed locally; awaiting verification that the published Pages/Sites asset runtime applies the policy at Step 45.

### AUD-179 — Inline Rewrite implied generated content and a completed action

- **Severity:** Medium; route `/r/inline-ai-rewrite`; corrected local captures are in `../quality/evidence/step-39/after/`. Earlier implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`; later files under `before/` were overwritten by the successful rerun.
- **Evidence and reproduction:** The old preview began with “Accepted”, used unsupported product copy, and exposed an enabled accept action despite no model request or external edit. Open the route, change tone, and inspect the default and action states.
- **Root cause:** Fixed sample text and local state were presented as generated output; the batch seed repeated the claim.
- **Affected code:** `resources/ai/inline-ai-rewrite/{index.tsx,manifest.json,README.md}`, `scripts/ai-batch-1.ts`, `scripts/ai-builder.ts`, and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation and verification:** Label fixed examples and local preview state, begin idle, use accurate local action labels, and align the seed and manifest. Desktop/mobile red-to-green browser checks pass without runtime or network errors. Awaiting deployed verification.

### AUD-180 — Static tool trace claimed successful execution and measured timings

- **Severity:** Medium; route `/r/ai-tool-execution-timeline`; corrected local captures are in `../quality/evidence/step-39/after/`. Earlier implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`; later files under `before/` were overwritten by the successful rerun.
- **Evidence and reproduction:** The old trace showed successful search and export results, unqualified timings, and unrelated finance content. Open the route and inspect the trace.
- **Root cause:** An illustrative trace was authored as a completed live tool run; its resource seed repeated the fake results.
- **Affected code:** `resources/ai/ai-tool-execution-timeline/{index.tsx,manifest.json,README.md}`, `scripts/ai-batch-1.ts`, `scripts/ai-builder.ts`, and the Step 39 browser test.
- **Remediation and verification:** Mark values as sample data, remove the unrelated resource, disclose that tools/files are not created, and align seed and manifest. Desktop/mobile checks pass with zero runtime/network errors. Awaiting deployed verification.

### AUD-181 — Shared AI metadata claimed capabilities unrelated to each component

- **Severity:** Medium; all 20 AI resource detail routes.
- **Evidence and reproduction:** `../quality/evidence/step-39/ai-generator-metadata.json` records the shared generator metadata before and after. Corrected local route captures are under `../quality/evidence/step-39/after/`; later route captures under `before/` are not pre-fix images. Inspect Variants and Intent on AI resource details and compare them to the actual component.
- **Root cause:** `scripts/ai-builder.ts` applied capability boilerplate about streaming, citations, approvals, model cards, and BYO endpoints to every AI pattern.
- **Affected code:** `scripts/ai-builder.ts`, `scripts/ai-batch-1.ts`, `scripts/ai-batch-2.ts`, and `resources/ai/*/manifest.json`.
- **Remediation and verification:** Add per-resource content requirements/notes and accurate shared style descriptions. The 324-resource catalogue validates and representative desktop/mobile metadata now matches the UI. Full AI resource review and deployed verification remain open.

### AUD-182 — Chat example named a provider and portrayed a fixed reply as live

- **Severity:** Medium; route `/r/ai-chat-panel`; corrected local captures are under `../quality/evidence/step-39/after/`. Earlier implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`; later files under `before/` were overwritten by the successful rerun.
- **Evidence and reproduction:** The earlier preview named Claude and presented a deterministic answer without disclosure. Open the route and inspect its heading and initial response.
- **Root cause:** A static UI sample was branded as a connected assistant.
- **Affected code:** `resources/ai/ai-chat-panel/{index.tsx,manifest.json,README.md}`, `scripts/ai-batch-1.ts`, and the Step 39 browser test.
- **Remediation and verification:** Remove provider branding, label the fixed sample/reply, and update its metadata. Desktop/mobile checks exercise two sends and confirm visible results with no runtime/network errors. Awaiting deployed verification.

### AUD-183 — Model selector falsely reported credentials and provider access

- **Severity:** Medium; route `/r/ai-model-mode-switcher`; corrected local captures are under `../quality/evidence/step-39/after/`. Earlier implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`; later files under `before/` were overwritten by the successful rerun.
- **Evidence and reproduction:** The prior preview listed commercial models, speed/context claims, and “BYO Key Active” despite no connection. Open the route and inspect the displayed model status.
- **Root cause:** A local example selector represented live provider configuration.
- **Affected code:** `resources/ai/ai-model-mode-switcher/{index.tsx,manifest.json,README.md}`, `scripts/ai-batch-2.ts`, `scripts/ai-builder.ts`, and the Step 39 browser test.
- **Remediation and verification:** Use example modes and disclose no model is connected. Keyboard/browser tests confirm Enter changes `aria-pressed` at desktop and mobile. Awaiting deployed verification.

### AUD-184 — Citation preview claimed invented sources were grounded and verified

- **Severity:** Medium; route `/r/ai-source-citations`; corrected local captures are under `../quality/evidence/step-39/after/`. Earlier implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`; later files under `before/` were overwritten by the successful rerun.
- **Evidence and reproduction:** Invented paths and excerpts were labelled Grounded and 100% Verified. Open the route and inspect the source labels and badge.
- **Root cause:** Example references were presented as retrieved evidence.
- **Affected code:** `resources/ai/ai-source-citations/{index.tsx,manifest.json,README.md}`, `scripts/ai-batch-1.ts`, `scripts/ai-builder.ts`, and the Step 39 browser test.
- **Remediation and verification:** Label sample names, paths, and excerpts; disclose no retrieval or verification. Keyboard tests select/deselect by Enter and Space on desktop/mobile; awaiting deployed verification.

### AUD-185 — Research answer fabricated source count, confidence, and latency

- **Severity:** Medium; route `/r/ai-research-answer`; corrected local captures are under `../quality/evidence/step-39/after/`. Earlier implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`; later files under `before/` were overwritten by the successful rerun.
- **Evidence and reproduction:** The old preview claimed twelve repository documents, 98% confidence, and sub-150ms output without retrieval or measurement. Open the route and inspect its summary badge and copy.
- **Root cause:** Sample research copy was presented as a measured result.
- **Affected code:** `resources/ai/ai-research-answer/{index.tsx,manifest.json,README.md}`, `scripts/ai-batch-1.ts`, `scripts/ai-builder.ts`, and the Step 39 browser test.
- **Remediation and verification:** Replace fabricated measurements with a general example answer and explicit no-source/no-confidence disclosure. Desktop/mobile browser checks pass; awaiting deployed verification.

### AUD-186 — Chat submit and Enter did not add the typed example

- **Severity:** Medium; route `/r/ai-chat-panel`; earlier implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`, with corrected desktop/mobile states in `../quality/evidence/step-39/after/`. The red-run output was not retained.
- **Evidence and reproduction:** Type a message and click Send example, then repeat and press Enter. The earlier isolated preview retained the text but added no message.
- **Root cause:** Controlled input state remained empty in the sandbox submit path, and Enter did not reliably reach the form handler.
- **Affected code:** `resources/ai/ai-chat-panel/index.tsx`, `scripts/ai-batch-1.ts`, and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation and verification:** Read the current field through a ref, bind the button directly, and handle Enter while respecting IME composition. Red-to-green desktop/mobile tests confirm both paths and cleared input; awaiting deployed verification.

### AUD-187 — Chat preview clipped the composer and hid the latest reply

- **Severity:** Medium; route `/r/ai-chat-panel`; clipped and hidden states are captured in `../quality/evidence/step-39/before/desktop/ai-chat-panel-{composer-clipped,latest-reply-hidden}.png`.
- **Evidence and reproduction:** Send messages until the preview exceeds its iframe height. The old panel expanded beyond the frame; after bounding it, the latest response remained outside the scroll viewport.
- **Root cause:** The panel had no bounded message scroll region and did not follow new messages.
- **Affected code:** `resources/ai/ai-chat-panel/index.tsx`, `scripts/ai-batch-1.ts`, and the Step 39 browser test.
- **Remediation and verification:** Bound the panel, scroll only the message list, keep the composer visible, and scroll to the latest message. Desktop/mobile tests assert both the latest reply and composer are in the iframe viewport; screenshots were visually inspected.

### AUD-188 — Model-mode options were not keyboard-operable

- **Severity:** Medium; route `/r/ai-model-mode-switcher`; corrected local captures are under `../quality/evidence/step-39/after/`; prior implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`. Later files under `before/` are not original screenshots.
- **Evidence and reproduction:** The old mode rows were clickable `div` elements. Tab through the preview and attempt to select Long context with Enter.
- **Root cause:** A selection control used pointer-only handlers.
- **Affected code:** `resources/ai/ai-model-mode-switcher/index.tsx`, `scripts/ai-batch-2.ts`, and the Step 39 browser test.
- **Remediation and verification:** Use buttons with `aria-pressed` and visible focus. Enter selection passes on desktop/mobile; awaiting deployed verification.

### AUD-189 — Citation rows were not keyboard-operable

- **Severity:** Medium; route `/r/ai-source-citations`; corrected local captures are under `../quality/evidence/step-39/after/`; prior implementation is in `../quality/evidence/step-39/pre-fix-source-diff.patch`. Later files under `before/` are not original screenshots.
- **Evidence and reproduction:** The old source rows were clickable `div` elements. Tab to a row and attempt to select it with Enter or Space.
- **Root cause:** An interactive selector was implemented as a pointer-only container.
- **Affected code:** `resources/ai/ai-source-citations/index.tsx`, `scripts/ai-batch-1.ts`, and the Step 39 browser test.
- **Remediation and verification:** Use labelled buttons with `aria-pressed`, focus styling, and keyboard support. Enter/Space selection passes at desktop/mobile; awaiting deployed verification.

### AUD-190 — Resource detail presented manifest status as unqualified verification

- **Severity:** Medium; route `/r/ai-chat-panel`; before/after desktop/mobile screenshots are in `../quality/evidence/step-39/`.
- **Evidence and reproduction:** Before screenshots show the detail header displaying only the status word `verified`. Open the resource route and compare the badge with the separate explanation that Workbench composition is limited to the validated Gold runtime registry.
- **Root cause:** The Astro detail template rendered `ResourceManifest.status` without identifying it as manifest-provided metadata; runtime eligibility is determined separately by the Gold registry.
- **Affected code:** `apps/site/src/pages/r/[slug].astro` and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation and verification:** Prefix the badge with “Manifest status:”. A red browser test failed at desktop and mobile before the copy change; both pass afterward. The updated local screenshots are recorded. Deployed verification remains pending.

### AUD-191 — Community CTA asserted an unsupported membership count

- Severity: Medium; route /r/cta-community.
- Deployed-before evidence: desktop/mobile screenshots and browser records are in quality/evidence/step-39/deployed-before/. Both routes returned HTTP 200 and recorded zero console errors, uncaught exceptions, failed requests, or HTTP errors. The frame displayed “Join 12,000+ UI Engineers.”
- Root cause: a specific member count was hard-coded without a source; the manifest also described a member counter.
- Affected code: resources/sections/cta-community/{index.tsx,manifest.json,README.md}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: remove the unsupported count and describe the component as a contributor/repository invitation. Local desktop/mobile regression checks pass. Public redeployment verification is pending.

### AUD-192 — Community CTA actions had no destinations

- Severity: Medium; route /r/cta-community.
- Deployed-before evidence: the screenshots in quality/evidence/step-39/deployed-before/ show “Join Discord Community” and “Star on GitHub” as buttons with no handlers or destinations.
- Root cause: the component used hard-coded buttons rather than configured links.
- Affected code: resources/sections/cta-community/{index.tsx,preview.tsx,manifest.json}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: add optional guideHref and repositoryHref, configure real destinations in the preview manifest, and render an explanatory status when neither is configured. Local desktop/mobile browser checks verify the links and destination attributes. Public redeployment verification is pending.

### AUD-193 — Product preview CTA claimed unsupported adoption

- Severity: Medium; route /r/cta-product-preview.
- Deployed-before evidence: the screenshots in quality/evidence/step-39/deployed-before/ show “Join thousands of developers” without an attributable adoption measure; browser logs recorded HTTP 200 and no runtime/network errors.
- Root cause: generic social-proof text was hard-coded as a product claim.
- Affected code: resources/sections/cta-product-preview/{index.tsx,manifest.json,README.md}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: describe the Compose workflow directly and remove the adoption claim. Local desktop/mobile regression checks pass; public redeployment verification is pending.

### AUD-194 — Static sample claimed a live Workbench and verified-resource count

- Severity: Medium; route /r/cta-product-preview.
- Deployed-before evidence: the preview displayed “[Workbench Canvas Active: 324 Verified Manifests Ready]” although the frame was a static sample without a connected project.
- Root cause: illustrative placeholder text was written as live status telemetry and a certification result.
- Affected code: resources/sections/cta-product-preview/{index.tsx,manifest.json,README.md}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: identify the panel as an example Workbench preview with no connected project. Local desktop/mobile tests check for the disclosure and reject the old live-status claim. Public redeployment verification is pending.

### AUD-195 — Product preview CTA did not open Compose

- Severity: Medium; route /r/cta-product-preview.
- Deployed-before evidence: the screenshots in quality/evidence/step-39/deployed-before/ show “Open Canvas Now” as an inert button.
- Root cause: the action was a button without an href or handler.
- Affected code: resources/sections/cta-product-preview/{index.tsx,preview.tsx,manifest.json}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: use optional composeHref, configure the preview destination as /compose, and show a truthful status when none is configured. Local desktop/mobile browser checks confirm the link and destination. Public redeployment verification is pending.

### AUD-196 — Composition outcome promised a certified production result

- Severity: Medium; route /.
- Deployed-before evidence: quality/evidence/step-39/deployed-before/desktop-homepage.png and mobile-homepage.png; matching JSON records HTTP 200 and no console, page, request, or HTTP errors.
- Observed: the page promised a “zero-debt, fully accessible” production codebase with complete design cohesion.
- Root cause: an exported manifest and project were described as guaranteed production outcomes.
- Affected code: apps/site/src/components/home/NotComponentLibrary.tsx.
- Remediation: describe the standalone React + Tailwind export without guaranteeing debt, accessibility, or design outcomes. Corrected desktop/mobile captures and full page text are in quality/evidence/step-39/after/.

### AUD-197 — Manifest scoring was presented as WCAG and runtime certification

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures show the claim that the 100-point engine evaluates WCAG AA/AAA, performance, and responsiveness before export. The quality section separately said browser accessibility and export builds require runtime verification.
- Root cause: product copy merged declared metadata scoring with browser and build verification.
- Affected code: apps/site/src/components/home/NotComponentLibrary.tsx and AuditPerformanceProof.tsx.
- Remediation: identify the manifest rubric and disclose that it does not certify the rendered interface. The homepage browser regression checks this distinction on desktop and mobile.

### AUD-198 — Workbench marketing copy overstated its scope

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures contain “full deterministic operating environment,” “100-point audits,” and “mix adjective feels.”
- Root cause: broad internal terminology and an unqualified audit claim were used for the Workbench summary.
- Affected code: apps/site/src/components/home/WorkbenchReveal.tsx.
- Remediation: describe inspection of project structure and Design DNA, lock-aware changes, and manifest checks before export. Corrected desktop/mobile captures are in quality/evidence/step-39/after/.

### AUD-199 — Agent section claimed zero hallucinations

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures show the absolute “Zero Hallucinations” claim.
- Root cause: registered resource selection was treated as a guarantee against all unsupported agent output.
- Affected code: apps/site/src/components/home/AgentsSection.tsx.
- Remediation: explain that composition selects registered resources and unsupported roles remain visible for review. Local desktop/mobile regressions reject the old guarantee.

### AUD-200 — Agent handoff section named a nonexistent output file

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures promised AGENT_HANDOFF.md; packages/exporter/src/agent-handoff.ts emits project.tess.json, PRODUCT.md, DESIGN.md, IMPLEMENTATION.md, COMPONENTS.md, dependencies.json, and AGENT_PROMPT.md.
- Root cause: homepage copy referenced an outdated, nonexistent export contract.
- Affected code: apps/site/src/components/home/AgentsSection.tsx.
- Remediation: describe the actual handoff contents. The local browser regression now checks the corrected handoff language.

### AUD-201 — Compatibility text implied universal scoring and automatic repair

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures say every combination is scored and DNA differences are automatically resolved.
- Root cause: candidate fit scoring was generalized into an automatic end-to-end guarantee.
- Affected code: apps/site/src/components/home/CompatibilityExplanation.tsx.
- Remediation: describe normalized DNA fit as one candidate-ranking signal and retain the need for browser review. Local desktop/mobile copy tests reject the earlier universal claims.

### AUD-202 — Homepage promised automatic mobile resource substitution

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures promise automatic conversion of a wide table into stacked cards on mobile.
- Root cause: a responsive strategy was presented as implemented renderer behavior.
- Affected code: apps/site/src/components/home/CompatibilityExplanation.tsx.
- Remediation: state that resources declare responsive approaches and that users should review previews at target widths. Local tests reject the automatic-substitution claim.

### AUD-203 — Creator section promised compatibility with every system

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures promise instant integration with every system and no CSS conflicts.
- Root cause: manifest metadata was described as guaranteeing downstream integration.
- Affected code: apps/site/src/components/home/CommonsAndCreators.tsx.
- Remediation: explain that manifests help compatible React tools inspect resources and that each target application needs review. Local desktop/mobile checks reject the universal claims.

### AUD-204 — Resource type badge covered the chart sample label

- Severity: Medium; route /; desktop and mobile.
- Before evidence: quality/evidence/step-39/before/desktop/homepage-resource-badge-overlap.png and before/mobile/homepage-resource-badge-overlap.png.
- Root cause: an absolutely positioned type badge occupied the same top-right space as “Sample values.”
- Affected code: apps/site/src/components/home/CatalogueMosaic.tsx.
- Remediation: reserve space for the badge at all breakpoints and assert the label and badge bounding boxes do not intersect. Corrected screenshots are in quality/evidence/step-39/after/{desktop,mobile}/homepage-resource-mosaic.png.

### AUD-205 — Workbench sample toolbar overlapped at mobile width

- Severity: Medium; route /; 390 x 844.
- Before evidence: quality/evidence/step-39/before/mobile/homepage-workbench-header-overlap.png.
- Root cause: the illustrative toolbar used one fixed-height row at every viewport.
- Affected code: apps/site/src/components/home/WorkbenchReveal.tsx.
- Remediation: allow the toolbar to grow and place sample status beneath the title at narrow widths. The mobile regression confirms the title and status bounds do not intersect; corrected screenshot and geometry evidence are in quality/evidence/step-39/after/mobile/homepage-workbench-example.png and .json.

### AUD-206 — Final CTA promised an unmeasured compose time

- Severity: Medium; route /.
- Evidence: deployed-before homepage captures show “Start composing in seconds.”
- Root cause: a specific latency promise was used without a measured target or guaranteed completion time.
- Affected code: apps/site/src/components/home/FinalComposerFooter.tsx.
- Remediation: invite visitors to start with a product brief without claiming a duration. Local desktop/mobile copy checks reject the timing claim.

### AUD-207 — Section Planner templates exported invented product claims

- Severity: Medium; route /tools/section-planner; desktop and mobile.
- Evidence: deployed-before screenshots and visible JSON in `quality/evidence/step-39/deployed-before/desktop-section-planner.{png,json}` and `mobile-section-planner.{png,json}` show unverified certifications, customer logos, sandboxes, benchmarks, plan tiers, measured latency, signed reports, and booking behavior. Corrected screenshots and the five archetype JSON outputs are in `quality/evidence/step-39/after/{desktop,mobile}/section-planner.{png,json}`.
- Reproduction: choose each Page Objective Archetype and inspect its visible descriptions and generated Grammar Manifest.
- Root cause: sample template descriptions were written as factual product claims rather than prompts that require sourced details.
- Affected code: `apps/site/src/components/tools/SectionPlanner.tsx` and `tests/e2e/copy-quality-step-39.spec.ts`.
- Remediation: make descriptions conditional on verified product information and disclose that templates neither implement nor verify the described sections. The local desktop/mobile regression checks all five actual manifest outputs and passes. Public deployment verification is pending.

### AUD-208 — Section Planner called clipboard copy an export

- Severity: Medium; route /tools/section-planner.
- Evidence: deployed-before screenshots show the “Export Section Graph JSON” label; the UI handler only copied JSON to the clipboard. The local `tests/e2e/tools-hardening.spec.ts` flow reorders and adds a section, clicks “Copy Section Graph JSON,” parses the clipboard value, and verifies the updated output.
- Reproduction: click the old “Export Section Graph JSON” control and observe that it copies text without downloading a file.
- Root cause: the visible action promised file export while invoking only a clipboard helper.
- Affected code: `apps/site/src/components/tools/SectionPlanner.tsx` and its desktop interaction regression.
- Remediation: relabel it “Copy Section Graph JSON.” The local browser regression passes; public deployment verification is pending.

### AUD-209 — Section Planner presented section counts as telemetry

- Severity: Medium; route /tools/section-planner.
- Evidence: deployed-before screenshots label the simple section-type summary “Grammar Balance Telemetry.” Corrected desktop/mobile screenshots label it “Section Mix Guide” and state the ranges are prompts rather than a score.
- Reproduction: open the planner and inspect the heading above the count ranges.
- Root cause: static counts were described with telemetry terminology despite no telemetry collection or measured quality score.
- Affected code: `apps/site/src/components/tools/SectionPlanner.tsx` and `tests/e2e/copy-quality-step-39.spec.ts`.
- Remediation: describe the counts and reference ranges directly. Local desktop/mobile checks pass; public deployment verification is pending.

### AUD-210 — Section count used incorrect singular grammar

- Severity: Low; route /tools/section-planner.
- Evidence: deployed-before screenshots show “1 sections”; corrected after screenshots display “1 section.”
- Reproduction: inspect a category containing exactly one active section.
- Root cause: the noun was always pluralized.
- Affected code: `apps/site/src/components/tools/SectionPlanner.tsx` and `tests/e2e/copy-quality-step-39.spec.ts`.
- Remediation: select the noun form from the count. Local desktop/mobile checks reject “1 sections”; public deployment verification is pending.

### AUD-211 — Typography Lab presented an unlabeled finance ledger as a generic specimen

- Severity: Medium; route `/tools/typography`; desktop and mobile.
- Evidence: the deployed-before desktop/mobile captures at `quality/evidence/step-39/deployed-before/desktop-typography-specimen.png` and `mobile-typography-specimen.png` show asset IDs, pound-denominated settlement values, percentage changes, and latency without a sample-data disclosure. The route returned HTTP 200 with no console, uncaught, request, or HTTP errors.
- Reproduction: open `/tools/typography`, choose the numerical specimen, and inspect the ledger labels and values.
- Root cause: a hard-coded finance ledger was framed as generic numerical telemetry.
- Affected code: `apps/site/src/components/tools/TypographyLab.tsx` and its browser regressions.
- Remediation: use domain-neutral sample rows, label the view “Tabular Figure Sample,” and state that values are illustrative, not live metrics. The local Sites Worker regression checks both viewports; public deployment verification is pending.

### AUD-212 — Typography Lab promised zero cognitive strain

- Severity: Medium; route `/tools/typography`.
- Evidence: deployed-before screenshots include “zero cognitive strain” in the hierarchy specimen paragraph.
- Reproduction: open `/tools/typography` and inspect the body sample in “Hierarchical Scale Ladder.”
- Root cause: an unsupported wellbeing outcome was used as sample copy.
- Affected code: `apps/site/src/components/tools/TypographyLab.tsx` and its browser regressions.
- Remediation: use neutral specimen copy and assert the claim is absent at desktop and mobile widths. Local Sites Worker tests pass; public deployment verification is pending.

### AUD-213 — Typography Lab used an undefined AA certification marker

- Severity: Medium; route `/tools/typography`.
- Evidence: deployed-before screenshots show “Status Indicator AA” without a defined conformance check or certification scope.
- Reproduction: open `/tools/typography` and inspect the last metadata line in the hierarchy sample.
- Root cause: an accessibility marker was used decoratively without an associated audit result.
- Affected code: `apps/site/src/components/tools/TypographyLab.tsx` and its browser regressions.
- Remediation: replace it with neutral example status text. The corrected local route has zero serious or critical Axe violations; public deployment verification is pending.

### AUD-215 — Four-column number sample clipped its final column on mobile

- Severity: Medium; route `/tools/typography`; 390x844.
- Evidence: the deployed-before mobile specimen screenshot clips the `ELAPSED` column at the right edge even though document-level width remains 390px.
- Reproduction: open `/tools/typography` at 390x844 and select the numerical specimen.
- Root cause: a four-column table with desktop padding was placed in a narrow card with overflow hidden.
- Affected code: `apps/site/src/components/tools/TypographyLab.tsx` and its browser regressions.
- Remediation: keep the table at wider widths and show labelled two-column record cards on mobile. The local Sites Worker regression verifies every field and no serious/critical Axe findings; public deployment verification is pending.

### AUD-216 — Golden Ratio preview overflowed the mobile viewport

- Severity: Medium; route `/tools/typography`; 390x844.
- Evidence: deployed-before interaction JSON measured a 515px document width at a 390px viewport after selecting Golden Ratio; `mobile-typography-interaction.png` shows the large heading extending beyond the canvas.
- Reproduction: open `/tools/typography` at 390x844 and choose Golden Ratio.
- Root cause: preview headings and copied CSS used fixed pixel sizes at every viewport.
- Affected code: `apps/site/src/components/tools/TypographyLab.tsx` and its browser regressions.
- Remediation: generate fluid `clamp()` values, use them in the live preview, and label calculated values as maximum sizes. The local Sites Worker measures 390px document width and a 36px mobile H1, while desktop remains 110px; public deployment verification is pending.

### AUD-217 — Accessibility Lab overstated a limited set of checks

- Severity: Medium; route `/tools/accessibility`; desktop and mobile.
- Evidence: deployed captures in `quality/evidence/step-39/deployed-before/tools/{desktop,mobile}/accessibility.{png,json}` show “WCAG 2.2 AA Baseline Guaranteed” and reduced-motion checks that were not represented by the visible controls. HTTP 200; zero console errors, uncaught exceptions, failed requests, HTTP errors, or Axe violations.
- Reproduction: open `/tools/accessibility` and compare its compliance copy with the three visible check areas.
- Root cause: the route retained broad compliance copy from an earlier scope.
- Affected code: `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/pages/tools/accessibility.astro`, and `tests/e2e/copy-quality-step-39.spec.ts`.
- Remediation: name the limited checks and disclose that the tool is not a full audit. Local desktop/mobile Sites Worker verification is recorded; deployed closure awaits a review release.

### AUD-218 — Background Studio used fabricated telemetry in a generic sample

- Severity: Medium; route `/tools/backgrounds`; desktop and mobile.
- Evidence: deployed captures in `quality/evidence/step-39/deployed-before/tools/{desktop,mobile}/backgrounds.{png,json}` show “Telemetry Node” and “HEALTH 99.8%” without a sample disclosure. Runtime and Axe reports are clean.
- Reproduction: open `/tools/backgrounds` and inspect the composition stage.
- Root cause: an operational monitoring specimen was reused for a background-pattern preview.
- Affected code: `apps/site/src/components/tools/BackgroundStudio.tsx` and its desktop/mobile copy regression.
- Remediation: replace the fabricated status with neutral sample content and identify the preview as static. Local browser regression passes; deployed closure awaits a review release.

### AUD-219 — Background Studio’s sample actions were enabled but inert

- Severity: Medium; route `/tools/backgrounds`; desktop and mobile.
- Evidence: the same deployed captures show enabled Dismiss/Acknowledge controls without handlers or feedback.
- Reproduction: focus and activate either sample button.
- Root cause: decorative sample controls were rendered as real actions without a connection contract.
- Affected code: `apps/site/src/components/tools/BackgroundStudio.tsx` and `tests/e2e/tools-hardening.spec.ts`.
- Remediation: disable them and explain that they are shown for layout only. Local browser regression passes; deployed closure awaits a review release.

### AUD-220 — Data Visualisation Styler advertised unsupported data and accessibility behavior

- Severity: Medium; route `/tools/dataviz`; desktop and mobile.
- Evidence: deployed captures in `quality/evidence/step-39/deployed-before/tools/{desktop,mobile}/dataviz.{png,json}` claim project Design DNA, responsive curves, WCAG contrast, and a 100ms interval without corresponding measured runtime behavior.
- Reproduction: open `/tools/dataviz` and read the description and chart header.
- Root cause: copy reflected planned capabilities rather than the current sample-chart controls.
- Affected code: `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/components/tools/ToolsHub.tsx`, and the copy regression.
- Remediation: describe sample chart settings and the rendered SVG output. Local desktop/mobile verification passes; deployed closure awaits a review release.

### AUD-221 — Motion Studio presented invented security and latency outcomes

- Severity: Medium; route `/tools/motion`; desktop and mobile.
- Evidence: deployed captures in `quality/evidence/step-39/deployed-before/tools/{desktop,mobile}/motion.{png,json}` show 20/20 PASS, token verification VALIDATED, and 38ms OPTIMAL telemetry in a motion example.
- Reproduction: open `/tools/motion` and inspect the kinetic sequence.
- Root cause: a decorative animation sequence used fabricated security and performance results.
- Affected code: `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/pages/tools/motion.astro`, and the copy regression.
- Remediation: use neutral sample labels with visible SAMPLE badges. Local desktop/mobile Sites Worker verification passes; deployed closure awaits a review release.

### AUD-222 — Palette Studio overstated selected contrast calculations as accessibility proof

- Severity: Medium; route `/tools/palette`; desktop and mobile.
- Evidence: deployed captures in `quality/evidence/step-39/deployed-before/tools/{desktop,mobile}/palette.{png,json}` describe accessible tokens, live AA/AAA validation, and “token rendering proof,” though only selected pairs are calculated.
- Reproduction: open `/tools/palette` and compare the introductory claim with the four displayed pair calculations.
- Root cause: a few pair calculations were presented as a complete palette or screen assessment.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/components/tools/ToolsHub.tsx`, and its browser regression.
- Remediation: limit the description to calculated pairs and state that this is not a full interface certification. Local browser verification passes; deployed closure awaits a review release.

### AUD-223 — Palette Studio presented an undisclosed financial amount as sample UI

- Severity: Medium; route `/tools/palette`; desktop and mobile.
- Evidence: the same deployed captures show “Institutional Ledger Card” and “£2,450,000.00” without identifying the value as sample data.
- Reproduction: open `/tools/palette` and inspect Active Surface Preview.
- Root cause: a finance specimen was reused in a generic palette tool.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx` and its desktop/mobile regression.
- Remediation: use a neutral value and label the preview as static sample content. Local browser verification passes; deployed closure awaits a review release.

### AUD-224 — Design DNA Lab called parsed feel changes telemetry

- Severity: Medium; route `/tools/dna`; desktop and mobile.
- Evidence: deployed captures in `quality/evidence/step-39/deployed-before/tools/{desktop,mobile}/dna.{png,json}` call the recognized words and deterministic DNA deltas “Parser Telemetry.”
- Reproduction: open Feel Mixer and inspect its parsed-values panel.
- Root cause: engineering monitoring language was reused for input interpretation details.
- Affected code: `apps/site/src/components/DnaLab.tsx` and the copy regression.
- Remediation: rename it “Feel Mapping Details.” Local Sites Worker regression passes; deployed closure awaits a review release.

### AUD-225 — Design DNA Lab’s typography specimen contained fabricated performance values

- Severity: Medium; route `/tools/dna`.
- Evidence: the deployed DNA captures show `const dnaScore = 92.4; // latency 4.2ms` without source or sample disclosure.
- Reproduction: open the Typography tab and inspect its monospace example.
- Root cause: a decorative code specimen used invented score and latency values.
- Affected code: `apps/site/src/components/DnaLab.tsx` and the copy regression.
- Remediation: replace the metric with a neutral feel-setting example. Local desktop/mobile Sites Worker regression passes; deployed closure awaits a review release.

### AUD-226 — Layout Composer called a schematic preview a responsive stress test

- Severity: Medium; route `/tools/layout`; desktop and mobile.
- Evidence: deployed captures in `quality/evidence/step-39/deployed-before/tools/{desktop,mobile}/layout.{png,json}` say “stress-test” and “PORT SIMULATION,” while rendering fixed schematic wireframes.
- Reproduction: open `/tools/layout`, switch the viewport buttons, and inspect the preview.
- Root cause: a viewport-dependent sketch was described as executing and testing generated layouts.
- Affected code: `apps/site/src/components/tools/LayoutComposer.tsx`, its metadata page, and the copy regression.
- Remediation: label it a wireframe preview and state that it does not run or test a generated page. Local Sites Worker desktop/mobile regression passes; deployed closure awaits a review release.

### AUD-227 — Tools directory summaries promised capabilities absent from linked tools

- Severity: Medium; route `/tools`; desktop and mobile.
- Evidence: deployed captures at `quality/evidence/step-39/deployed-before/tools-hub/{desktop,mobile}/tools-hub.{png,json}` include APCA, WCAG reduced-motion support, complete AA/AAA palette validation, stress tests, telemetry typesetting, and Design DNA chart behavior not present in the linked tools.
- Reproduction: open `/tools` and compare the cards with Motion, Palette, Layout, Data Visualisation, Accessibility, and Typography.
- Root cause: the shared card-description table reflected planned rather than implemented capabilities.
- Affected code: `apps/site/src/components/tools/ToolsHub.tsx` and its Sites Worker regression.
- Remediation: describe the available presets, previews, selected-pair calculations, and copy outputs. Local desktop/mobile verification passes; deployed closure awaits a review release.

### AUD-228 — Design DNA preset descriptions promised unmeasured outcomes

- Severity: Medium; route `/tools/dna`; desktop and mobile.
- Evidence: deployed DNA captures include “ultra-fast latency,” “zero distraction,” “rapid conversion drive,” security-proof and accessibility promises, and safety-critical ergonomics as preset descriptions.
- Reproduction: review the Calm SaaS, Bold Startup, Quiet Productivity, Financial Authority, Civic, Healthcare, and Industrial preset descriptions.
- Root cause: preset descriptions used operational outcomes as aesthetic shorthand without evidence.
- Affected code: `packages/dna/src/presets.ts`, `apps/site/src/components/tools/DnaLab.tsx`, and the copy regression.
- Remediation: describe visual and layout cues without claiming measured latency, conversion, security, privacy, or compliance outcomes. Local desktop/mobile regression passes; deployed closure awaits a review release.

### AUD-229 — Design DNA reset left the previously selected preset active

- Severity: Medium; route `/tools/dna`; desktop and mobile.
- Evidence: the deployed interaction captures at `quality/evidence/step-39/deployed-before/dna-reset/{desktop,mobile}/dna-reset-state-mismatch.{png,json}` show Bold Startup remains highlighted and remains the detail heading after Reset Baseline; HTTP 200 and no console, uncaught, network, HTTP, or Axe findings.
- Reproduction: select Bold Startup, then activate Reset Baseline.
- Root cause: reset did not restore the selected-preset state together with the baseline DNA values.
- Affected code: `apps/site/src/components/DnaLab.tsx` and `tests/e2e/tools-hardening.spec.ts`.
- Remediation: restore the initial Institutional Intelligence preset and DNA together. The pre-fix browser regression failed; the local Astro regression now passes and saves `quality/evidence/step-39/after/desktop/dna-reset-baseline.{png,json}`. Public verification awaits a review release.

### AUD-230 — CLI reference offered installation commands for an unpublished package

- **Severity:** Medium; route `/docs/cli`; desktop and mobile.
- **Evidence:** Deployed-before captures in `quality/evidence/step-39/deployed-before/docs/{desktop,mobile}/cli.{png,json}` show `pnpm add -g @tessellate/cli` and `npx @tessellate/cli`; `packages/cli/package.json` and `packages/cli/README.md` both identify the package as private.
- **Reproduction:** Open `/docs/cli` and follow its Installation block.
- **Root cause:** Documentation described a planned npm release that is not available.
- **Affected code:** `apps/site/src/pages/docs/cli.astro` and its browser regression.
- **Remediation:** State the package is private and give the checked-out repository build/invocation commands. Local desktop/mobile tests pass; public Site verification is pending.

### AUD-232 — MCP recommendation description overstated lexical matching

- **Severity:** Medium; local MCP tool metadata.
- **Evidence:** The pre-fix tool description said “best resources”, while `recommend_resources` assigns scores only when whitespace terms occur as substrings of names, descriptions, tags, or categories. The returned payload already identifies `lexical-token-overlap` as the method.
- **Reproduction:** Connect a real MCP Client over stdio, list tools, then compare the `recommend_resources` description with its scorer.
- **Root cause:** Agent-facing metadata used an unqualified ranking claim instead of naming the lexical method.
- **Affected code:** `packages/mcp/src/tools.ts` and `packages/mcp/src/__tests__/client-workflow.test.ts`.
- **Remediation:** Describe results as lexical-overlap candidates, not semantic rankings or guaranteed fits. The official MCP Client regression passes; fixed locally.

### AUD-234 — Generated README claimed an unregistered draft could be installed

- **Severity:** Medium; CLI `create-resource` output.
- **Evidence:** The pre-fix template told contributors to run `tess add <slug>` and a public shadcn URL immediately after local scaffolding. `quality/evidence/step-39/after/cli/draft-scaffold.json` captures the new README stating the resource is unpublished and unregistered and includes review steps instead.
- **Reproduction:** Run `tess create-resource --slug example-card` in a clean directory and read the generated README.
- **Root cause:** The scaffold template conflated local generation with registry publication.
- **Affected code:** `packages/cli/src/commands/create-resource.ts`, `packages/cli/src/__tests__/cli.test.ts`, and `packages/cli/README.md`.
- **Remediation:** Remove installation commands and explain the review and submission requirements. The built CLI capture and regression pass; fixed locally.

### AUD-265 — Compose downloads the Workbench editor bundle before project handoff

- Evidence: the pre-fix route record and screenshot are `quality/evidence/step-38/before/compose-workbench-bundle-isolation-sites-chromium.json` and `.png`. A red cold-load regression measured 588,984 JavaScript transfer bytes across 39 resources, over its 450,000-byte ceiling. The post-fix desktop/mobile reports and screenshots are in `quality/evidence/step-38/after/`.
- Reproduction: open `/compose` in a fresh browser context against the Sites Worker and wait for the visible “Catalogue ready” state. Inspect JavaScript resource transfer. Before the fix the route loaded the entire Workbench bundle even though the user had not selected a direction.
- Root cause: `ComposeView` imported `saveLocalProject` from the Workbench root barrel. That barrel re-exports the editor shell, panels, modals, mutation engines, history and persistence.
- Affected code: `apps/site/src/components/ComposeView.tsx`, `packages/workbench/package.json`, and `tests/e2e/site-route-performance-step-38.spec.ts`.
- Remediation: expose the existing persistence module through `@tessellate/workbench/persistence` and use that subpath from Compose. Chromium and WebKit desktop/mobile checks now record 349,756 transfer bytes across 19 JavaScript resources (40.6% lower); decoded JavaScript falls from about 2.49 MB to 1.39 MB. The eager Compose route bundle falls from 561.55 KiB to 335.99 KiB gzip. The visible Compose-to-Workbench/Recompose workflow passes in both browser engines and viewports. Public review verification remains pending at Step 45.

### AUD-266 — Explore mounted sandboxed previews below the initial viewport

- **Severity:** Medium; route `/explore`; desktop and mobile.
- **Evidence:** The pre-fix full-page capture and machine record are [before screenshot](../quality/evidence/step-38/before/sites-worker/explore-desktop-1440x900.png) and [before metrics](../quality/evidence/step-38/before/explore-preview-visibility.json). At 1440×900, nine previews were mounted although only six intersected the viewport; three began at y=955. The post-fix viewport screenshots and [before/after metrics](../quality/evidence/step-38/after/explore-preview-visibility.json) show six visible frames and zero offscreen frames at desktop, two visible at 390×844, and the real resource screen after scroll.
- **Reproduction:** Open `/explore` in a fresh local Sites Worker context. Before the fix, the 160px root margin mounted the three next-row preview iframes below the 900px viewport. After the fix, wheel-scroll to the first lazy card and verify its iframe and `.tess-screen` render.
- **Root cause:** `ResourceCard` used a 160px `IntersectionObserver` root margin, starting sandboxed runtime frames before their cards were visible.
- **Affected code:** `apps/site/src/components/ResourceCard.tsx` and `tests/e2e/site-route-performance-step-38.spec.ts`.
- **Remediation:** Set the observer margin to `0px`; the local Chromium regression passes at 1440×900 and 390×844. Desktop mounted frames fell from nine to six, script responses fell from 108 to 87, and unique measured encoded script-body bytes fell from 333,558 to 326,813. Scrolling still mounts and renders the actual next resource. Both profiles recorded zero console errors, uncaught exceptions, failed requests, or HTTP errors. The fix awaits published review verification at Step 45.

## LOW

### AUD-231 — CLI reference made the required validation file look optional

- **Severity:** Low; route `/docs/cli`; desktop and mobile.
- **Evidence:** The deployed-before CLI page shows `tess validate [path]`; the built command prints `Usage: tess validate [options] <file>`. The actual output is captured in `quality/evidence/step-39/after/cli/draft-scaffold.json` for a valid file invocation, and local browser regressions check the required-argument syntax.
- **Reproduction:** Open `/docs/cli`, then run `node packages/cli/dist/index.cjs validate --help` from a built checkout.
- **Root cause:** Optional-argument brackets were used for a required positional filename.
- **Affected code:** `apps/site/src/pages/docs/cli.astro` and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation:** Show `tess validate <file>`. Local desktop/mobile checks pass; public Site verification is pending.

### AUD-235 — Generated display container had focus and hover affordances without interaction

- **Severity:** Low; CLI `create-resource` output.
- **Evidence:** The pre-fix source template attached `hover:` and `focus-visible:` classes to a non-focusable `div` with no interaction handler. The after CLI capture and test verify those classes are absent.
- **Reproduction:** Run `tess create-resource --slug example-card` and inspect the generated component root.
- **Root cause:** An interactive button-like sample style was reused for a display-only scaffold.
- **Affected code:** `packages/cli/src/commands/create-resource.ts` and `packages/cli/src/__tests__/cli.test.ts`.
- **Remediation:** Declare only the display role and remove inert hover/focus styling. The generated-source regression passes; fixed locally.

### AUD-214 — Computed type sizes were mislabeled as measured metrics

- Severity: Low; route `/tools/typography`.
- Evidence: the deployed hierarchy specimen called calculated font-size values “MEASURED METRIC.”
- Reproduction: open `/tools/typography` and inspect the value-column heading.
- Root cause: telemetry wording was reused for locally computed scale values.
- Affected code: `apps/site/src/components/tools/TypographyLab.tsx` and its browser regressions.
- Remediation: label the values “Maximum Size.” Local desktop/mobile Sites Worker checks reject the old label; public deployment verification is pending.

### AUD-163 — Mirrored corrupt project data appeared twice in recovery mode

- **Severity:** Low.
- **Evidence:** The before captures at `../quality/evidence/step-22/before/duplicate-corrupt-recovery-records-desktop-1440.png` and `...mobile-390.png` show two identical raw-record export links. The after captures at `../quality/evidence/step-22/after/corrupted-project-safe-recovery-desktop-1440.png` and `...mobile-390.png` show one preserved record and one exact raw export.
- **Reproduction:** Store the same malformed raw project in its project-specific journal and the active-project journal, then open the project URL.
- **Root cause:** Each journal entry was added independently to the recovery list even when both contained the same raw record and validation error.
- **Affected code:** `packages/workbench/src/persistence/browser-session.ts` and `tests/e2e/workbench-persistence-hardening.spec.ts`.
- **Remediation:** Deduplicate damaged records by their raw payload and validation reason while preserving distinct damaged records.
- **Verification:** The visible-browser regression failed before the fix and now confirms one export link, byte-for-byte raw export preservation, no overflow, and zero browser/network errors. Site deployment verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

### AUD-079 — Published Site favicon returned 404

- Evidence: the v10 [Compose capture](evidence/public-site-v10/compose-directions-1440.png) identifies the affected public page; the [baseline machine-readable smoke report](evidence/public-site-v10/flagship-smoke.json) records `/favicon.svg` as HTTP 404, corroborated by the Site Worker log. The v11 [desktop/mobile smoke report](evidence/public-site-v11/flagship-smoke.json) records HTTP 200 and `image/svg+xml` at both viewports.
- Reproduction: open `/compose` on Site v10 and request `/favicon.svg`.
- Root cause: pages declared the favicon URL, but the public asset directory did not contain the file.
- Affected code: `apps/site/public/favicon.svg`, `apps/site/src/layouts/PublicLayout.astro`, and the public page head declarations.
- Remediation: add the mark as a public SVG and cover status, content type, and SVG markup in desktop and mobile browser tests. The regression failed 2/2 before the asset was added, passed in the Sites Worker, and the deployed v11 check now passes at both viewports, so this finding is closed.

## Step 39 resource claims, controls, metadata, and responsive preview (AUD-236–262)

### HIGH

#### AUD-236 — Accessibility template claimed formal WCAG compliance and automated guarantees

- Evidence: deployed-before screenshot [accessibility-commitment-section](../quality/evidence/step-39/deployed-before/resource-claims/desktop/accessibility-commitment-section.png); machine record: `quality/evidence/step-39/deployed-before/resource-claims/desktop/accessibility-commitment-section.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /r/accessibility-commitment-section at 1440x900 and 390x844. Compare the detail description with the preview checklist.
- Root cause: The manifest described an aspirational checklist as an implemented compliance audit.
- Affected code: `resources/sections/accessibility-commitment-section/{manifest.json,index.tsx,README.md}`.
- Remediation: Describe design goals and integration checks; make the detail page, manifest, and sample agree. Local desktop/mobile preview and detail regressions pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-237 — Compliance template claimed certified badges and downloadable reports

- Evidence: deployed-before screenshot [compliance-proof](../quality/evidence/step-39/deployed-before/resource-claims/desktop/compliance-proof.png); machine record: `quality/evidence/step-39/deployed-before/resource-claims/desktop/compliance-proof.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /r/compliance-proof at desktop and mobile widths. Compare the detail description with the rendered template and controls.
- Root cause: Resource metadata was copied from a planned product behavior rather than the component contract.
- Affected code: `resources/sections/compliance-proof/{manifest.json,index.tsx,README.md}`.
- Remediation: Rename and describe the resource as an illustrative evidence template; require scope and source before claims. Local desktop/mobile regressions pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-238 — Unverified trust labels were shown with green verification checkmarks

- Evidence: deployed-before screenshot [trust-badges-strip](../quality/evidence/step-39/deployed-before/resource-previews/desktop/trust-badges-strip.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/trust-badges-strip.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=trust-badges-strip at desktop and mobile widths. Inspect the icons next to EVIDENCE REQUIRED, VERIFY SCOPE, REVIEW POLICY, and TARGET.
- Root cause: The sample used a success icon as decoration without connecting it to verification state.
- Affected code: `resources/sections/trust-badges-strip/{manifest.json,index.tsx,README.md}`.
- Remediation: Replace the success icon with a neutral marker and add a sample-label disclosure. The corrected desktop/mobile preview contains no checkmark; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-239 — Security proof section asserted controls it did not inspect

- Evidence: deployed-before screenshot [security-proof](../quality/evidence/step-39/deployed-before/resource-claims/desktop/security-proof.png); machine record: `quality/evidence/step-39/deployed-before/resource-claims/desktop/security-proof.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /r/security-proof at desktop and mobile widths. Inspect its detail description and the three preview checklist rows.
- Root cause: A presentation component was written as if it were a security scanner and product attestation.
- Affected code: `resources/sections/security-proof/{manifest.json,index.tsx,README.md}`.
- Remediation: Convert statements to review prompts, replace pass labels, and disclose that no scan or verification occurs. Local desktop/mobile checks pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-240 — Success sample fabricated an export count and production result

- Evidence: deployed-before screenshot [success-state](../quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=success-state at desktop and mobile widths. Read the completion title and message.
- Root cause: Static demo values and export-specific copy were embedded as default component props.
- Affected code: `resources/states/success-state/{index.tsx,manifest.json,README.md}`.
- Remediation: Use neutral completion copy and require the host to provide artifact state. The corrected preview passes desktop/mobile regressions; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-242 — Success State preview failed serious text-contrast checks

- Evidence: deployed-before screenshot [success-state](../quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=success-state at 1440x900. Run Axe with WCAG 2.2 AA tags.
- Root cause: Green-on-pale-green heading and button colors were selected without checking their rendered contrast.
- Affected code: `resources/states/success-state/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Use higher-contrast green tokens and test the actual preview with Axe. Local desktop/mobile Axe runs now report zero violations; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-261 — Success State title and action failed WCAG text contrast

- Evidence: deployed-before screenshot [success-state](../quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=success-state at 1440×900 or 390×844. Run Axe against the rendered preview; the title and View Exported Files action are reported as serious color-contrast.
- Root cause: The example success title used emerald-600 on a pale surface and the disabled action retained an emerald-600 background, both below the normal-text AA threshold.
- Affected code: `resources/states/success-state/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Use accessible dark-green title and action colors on light surfaces and ensure the disabled action remains readable. The desktop/mobile Preview regression passes locally; deployed verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

### MEDIUM

#### AUD-241 — View Exported Files appeared enabled without an artifact handler

- Evidence: deployed-before screenshot [success-state](../quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/success-state.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=success-state. Try to activate View Exported Files without a host callback.
- Root cause: The component rendered its next-step button unconditionally and did not distinguish the disconnected state visually.
- Affected code: `resources/states/success-state/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Disable the action without a callback, explain the missing artifact viewer, and apply a neutral disabled style. Local desktop/mobile regressions pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-243 — Document detail card guaranteed export to any React environment

- Evidence: deployed-before screenshot [document-detail](../quality/evidence/step-39/deployed-before/resource-previews/desktop/document-detail.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/document-detail.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=document-detail. Read the architecture note below the title.
- Root cause: A broad exporter guarantee was presented as a fact inside a static document card.
- Affected code: `resources/blocks/document-detail/{index.tsx,manifest.json,README.md}`.
- Remediation: State that the React/Vite exporter generates source for review and adaptation, and label the card as a static example. Local regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-244 — Export Spec button had no action

- Evidence: deployed-before screenshot [document-detail](../quality/evidence/step-39/deployed-before/resource-previews/desktop/document-detail.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/document-detail.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=document-detail. Activate Export Spec (PDF / Markdown).
- Root cause: The static sample included an export CTA without a host-action contract.
- Affected code: `resources/blocks/document-detail/{index.tsx,manifest.json}`.
- Remediation: Remove the dead button and replace it with an explicit static-example note. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-245 — Accordion FAQ made blanket dependency and contrast guarantees

- Evidence: deployed-before screenshot [accordion-spring](../quality/evidence/step-39/deployed-before/resource-previews/desktop/accordion-spring.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/accordion-spring.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=accordion-spring. Expand both FAQ items and inspect their answers.
- Root cause: Global product assertions were used as sample answers inside an unrelated component.
- Affected code: `resources/motion/accordion-spring/{index.tsx,manifest.json,README.md}`.
- Remediation: Describe the example’s React/CSS dependencies and state that color pairs must be checked in the integrated project. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-246 — Accordion advertised spring motion and no layout jank without implementing either

- Evidence: deployed-before screenshot [accordion-spring](../quality/evidence/step-39/deployed-before/resource-claims/desktop/accordion-spring.png); machine record: `quality/evidence/step-39/deployed-before/resource-claims/desktop/accordion-spring.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /r/accordion-spring and /preview/?resource=accordion-spring. Expand an item and compare the transition with the spring/no-jank claim.
- Root cause: The resource name and prose described a motion model absent from the panel implementation.
- Affected code: `resources/motion/accordion-spring/{index.tsx,manifest.json,README.md}`.
- Remediation: Rename the public resource to Animated Disclosure Accordion and animate the panel with a reduced-motion-aware CSS Grid transition; remove the no-jank guarantee. Local regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-247 — Accordion buttons did not expose disclosure state or panel relationships

- Evidence: deployed-before screenshot [accordion-spring](../quality/evidence/step-39/deployed-before/resource-previews/desktop/accordion-spring.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/accordion-spring.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=accordion-spring. Inspect each question button before and after activation.
- Root cause: The component implemented a visual toggle without the disclosure pattern semantics.
- Affected code: `resources/motion/accordion-spring/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Add stable trigger/panel IDs, aria-expanded, aria-controls, region labelling, keyboard testing, and reduced-motion support. Local browser and Axe checks pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-248 — Editorial typography preview used a fake system version and production guarantee

- Evidence: deployed-before screenshot [editorial-display-stack](../quality/evidence/step-39/deployed-before/resource-previews/desktop/editorial-display-stack.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/editorial-display-stack.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=editorial-display-stack at desktop and mobile widths.
- Root cause: Decorative headline copy was mistaken for product proof and release metadata.
- Affected code: `resources/typography/editorial-display-stack/{index.tsx,manifest.json,README.md}`.
- Remediation: Replace the fake version and production guarantee with neutral guidance about a heading, supporting copy, and an emphasized phrase. Local regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-249 — Feature Tabs claimed mathematical guardrails and verified UIs

- Evidence: deployed-before screenshot [feature-tabs](../quality/evidence/step-39/deployed-before/resource-previews/desktop/feature-tabs.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/feature-tabs.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=feature-tabs. Switch across the Design, Code, and Agents tabs.
- Root cause: Marketing copy implied functional validation that the tab component does not perform.
- Affected code: `resources/sections/feature-tabs/{index.tsx,manifest.json}`.
- Remediation: Describe the example’s supported manifest and MCP workflows and expose selected tabs with aria-pressed. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-250 — Interactive demo displayed fake HTTP and isolation results

- Evidence: deployed-before screenshot [interactive-demo-hero](../quality/evidence/step-39/deployed-before/resource-previews/desktop/interactive-demo-hero.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/interactive-demo-hero.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=interactive-demo-hero. Change spacing and theme and inspect the reported status.
- Root cause: Decorative status output imitated a real network and CSS-isolation test.
- Affected code: `resources/sections/interactive-demo-hero/{index.tsx,manifest.json}`.
- Remediation: Label the card as a local sample, describe the controls precisely, and remove the simulated test results. Local desktop/mobile interaction regressions pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-251 — Sticky narrative repeated identical verification content in every phase

- Evidence: deployed-before screenshot [feature-sticky-narrative](../quality/evidence/step-39/deployed-before/resource-previews/desktop/feature-sticky-narrative.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/feature-sticky-narrative.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=feature-sticky-narrative. Compare the three phase headings and paragraphs.
- Root cause: A single placeholder narrative was copied into each repeated card.
- Affected code: `resources/sections/feature-sticky-narrative/{index.tsx,manifest.json}`.
- Remediation: Replace the repeated cards with distinct Compose, Refine, and Export steps. Local desktop/mobile regression asserts each unique heading occurs once; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-252 — Sticky narrative promised unverified control, security, and accessibility outcomes

- Evidence: deployed-before screenshot [feature-sticky-narrative](../quality/evidence/step-39/deployed-before/resource-previews/desktop/feature-sticky-narrative.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/feature-sticky-narrative.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=feature-sticky-narrative. Read the headline and all three phase descriptions.
- Root cause: A marketing sample bundled absolute product promises with the repeated placeholder narrative.
- Affected code: `resources/sections/feature-sticky-narrative/{index.tsx,manifest.json}`.
- Remediation: Use factual Compose-to-Workbench-to-export language and remove the absolute claims. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-253 — Workflow steps claimed code was emitted directly into a local repository

- Evidence: deployed-before screenshot [how-it-works-steps](../quality/evidence/step-39/deployed-before/resource-previews/desktop/how-it-works-steps.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/how-it-works-steps.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=how-it-works-steps at desktop and mobile widths.
- Root cause: The flow copy skipped the browser download boundary and described an unimplemented filesystem write.
- Affected code: `resources/sections/how-it-works-steps/{index.tsx,manifest.json}`.
- Remediation: Describe choosing a brief, refining the project in Workbench, and downloading a React/Vite project or manifest. Local regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-254 — AI Command Bar metadata promised natural-language command execution

- Evidence: deployed-before screenshot [ai-command-bar](../quality/evidence/step-39/deployed-before/resource-claims/desktop/ai-command-bar.png); machine record: `quality/evidence/step-39/deployed-before/resource-claims/desktop/ai-command-bar.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /r/ai-command-bar and /preview/?resource=ai-command-bar. Type into the sample filter and inspect whether a command executes.
- Root cause: The resource description copied intended AI behavior into a local filtering example.
- Affected code: `resources/ai/ai-command-bar/{index.tsx,manifest.json}`.
- Remediation: Label the input as a sample-list filter and state that no command runs in the preview. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-255 — Command rows looked actionable but had no handlers

- Evidence: deployed-before screenshot [ai-command-bar](../quality/evidence/step-39/deployed-before/resource-previews/desktop/ai-command-bar.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/ai-command-bar.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=ai-command-bar. Hover or focus a listed command and attempt activation.
- Root cause: Command examples reused interactive row styling without implementing the command contract.
- Affected code: `resources/ai/ai-command-bar/index.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Remove pointer/hover affordances, label the control as a filter, and assert the filtered sample list changes. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-256 — AI prompt starters were inert clickable divs

- Evidence: deployed-before screenshot [ai-empty-state](../quality/evidence/step-39/deployed-before/resource-previews/desktop/ai-empty-state.png); machine record: `quality/evidence/step-39/deployed-before/resource-previews/desktop/ai-empty-state.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /preview/?resource=ai-empty-state. Tab through the prompt starters and attempt to select one.
- Root cause: The component treated a visual card as an action without a semantic button or an available host callback.
- Affected code: `resources/ai/ai-empty-state/{index.tsx,manifest.json}`.
- Remediation: Render semantic buttons, disable them without a callback, and explain how a host enables them. Local desktop/mobile regressions pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-257 — Palette preset promised an 18:1 contrast floor and WCAG AAA

- Evidence: deployed-before screenshot [pure-monochrome-preset](../quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.png); machine record: `quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /tools/palette. Select Pure Monochrome and inspect its description and results.
- Root cause: A visual preset was described as a compliance-certified palette.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Describe the color direction and ask users to check each listed pair and component state separately. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-258 — Palette contrast panel implied a full palette or interface audit

- Evidence: deployed-before screenshot [palette-studio](../quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.png); machine record: `quality/evidence/step-39/deployed-before/resource-metadata/desktop/palette-preset.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /tools/palette at desktop and mobile widths. Inspect the title, calculated pair rows, and coverage note.
- Root cause: A limited four-pair calculation was named as if it audited the complete palette and rendered interface.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Name it Selected Pair Contrast Check, disclose the four-pair limit, and use the WCAG 0.04045 sRGB threshold. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-259 — Catalogue cards showed an unlabeled green quality number

- Evidence: deployed-before screenshot [resource-catalogue-cards](../quality/evidence/step-39/deployed-before/resource-metadata/desktop/quality-card.png); machine record: `quality/evidence/step-39/deployed-before/resource-metadata/desktop/quality-card.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /explore?q=success-state at desktop and mobile widths. Inspect the Success State card footer and compare it with the detail-page score.
- Root cause: ResourceCard displayed manifest.quality.overall without its label or provenance.
- Affected code: `apps/site/src/components/ResourceCard.tsx, apps/site/src/components/ResourceInspector.tsx, and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Remove the score from cards and suppress it on details until a reviewed assessment includes evidence. Unassessed scores no longer influence minimum-quality search filters or compatibility ranking. Local desktop/mobile regression passes; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-260 — Accessibility tab presented manifest flags as verified certification

- Evidence: deployed-before screenshot [resource-accessibility-metadata](../quality/evidence/step-39/deployed-before/resource-metadata/desktop/accessibility-tab.png); machine record: `quality/evidence/step-39/deployed-before/resource-metadata/desktop/accessibility-tab.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record.
- Reproduction: Open /r/success-state and select Accessibility. Compare the declared flags with the Axe result for /preview/?resource=success-state.
- Root cause: ResourceTabs rendered manifest booleans as verification results, and several audited resources used unsupported AAA targets.
- Affected code: `apps/site/src/components/ResourceTabs.tsx, 13 audited resource manifests, and tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Label WCAG levels as targets, present only Gold browser evidence as an independent check, and show other claims as unverified. Builder defaults and all canonical resource manifests now use the AA platform target; non-Gold verification flags are false. Local detail and preview regressions pass; public verification is pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-262 — Inline AI Rewrite preview overflowed its 360px mobile frame

- Evidence: the local Sites Worker red-run screenshot [inline-ai-rewrite](../quality/evidence/step-39/before/responsive/inline-ai-rewrite-360-concise.png); machine record: `quality/evidence/step-39/before/responsive/inline-ai-rewrite-360.json`. The route returned HTTP 200; pre-fix runtime evidence is preserved in that record; corrected capture: [after](../quality/evidence/step-39/after/responsive/inline-ai-rewrite-360-concise.png) with machine record `quality/evidence/step-39/after/responsive/inline-ai-rewrite-360.json`.
- Reproduction: Open /resources/inline-ai-rewrite/ at 360×844. Choose Mobile (360px) in the preview controls. Switch through Concise, Professional, and Energetic; observe horizontal clipping and measure the preview document width.
- Root cause: The example used fixed horizontal padding and a non-wrapping header/tone row without a min-width reset, so its inner content exceeded the constrained resource frame.
- Affected code: `resources/ai/inline-ai-rewrite/index.tsx, scripts/generate-gold-artifacts.ts output packages/exporter/src/generated-gold-sources.ts, tests/e2e/inline-ai-rewrite-responsive.spec.ts, and packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`.
- Remediation: Use a min-width-safe root, reduce padding at narrow widths, stack the header, allow tone controls to wrap, and expose their selection with aria-pressed. Remove the unsupported keyboard shortcut hint, regenerate the embedded Gold source used by standalone exports, and cover the exported source with a fidelity regression. The fresh Sites Worker regression now records 292px client and scroll widths for all three tones with zero console, uncaught, failed-request, or HTTP errors; deployed review verification remains pending. The local regression passes; status remains fixed-awaiting-deployed-verification.

#### AUD-264 — Resource accessibility status text clipped inside mobile cards

- Evidence: pre-fix local Sites Worker capture [mobile cards before](../quality/evidence/step-39/before/resource-accessibility-overflow-mobile.png) and geometry [before record](../quality/evidence/step-39/before/resource-accessibility-overflow-mobile.json); corrected responsive capture [mobile cards after](../quality/evidence/step-39/after/resource-accessibility-overflow-responsive.png) and [seven-width record](../quality/evidence/step-39/after/resource-accessibility-overflow-responsive.json).
- Reproduction: Open `/r/success-state` at 390×844 and select Accessibility. Four of five status labels extend outside their cards: the pre-fix two-column grid produced 146px cards with 154–169px scroll widths, while the page itself stayed 390px wide.
- Root cause: The tab used two columns below 768px, and each card kept labels and verification text in one horizontal flex row.
- Affected code: `apps/site/src/components/ResourceTabs.tsx` and `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- Remediation: Use one column below 640px, two from 640px, and three from 1024px. The red-to-green Sites Worker regression runs in desktop and mobile Chromium at 360, 390, 430, 640, 768, 1024, and 1440px. All five cards fit with no clipped text or page overflow; at 390px each has 306px of content width. It records HTTP 200, no user-session console errors, uncaught exceptions, failed requests or HTTP errors, and no serious/critical Axe findings. Axe itself emits a separate CSP message when injecting its temporary inline style; the capture distinguishes this tooling output from user-session runtime errors. Public review verification remains pending; this finding is not closed.

#### AUD-265 — Compose loaded Workbench editor code before handoff

- Evidence: local Sites Worker cold-load measurements recorded 588,984 JavaScript transfer bytes before the fix and 349,756 after.
- Reproduction: open /compose in a cold browser context and compare JavaScript PerformanceResourceTiming entries before entering Workbench.
- Root cause: Compose imported persistence from the Workbench package barrel, which re-exported the full editor graph.
- Affected code: apps/site/src/components/ComposeView.tsx and packages/workbench/package.json.
- Remediation: consume the narrow persistence subpath. Chromium and WebKit desktop/mobile checks pass locally; public verification remains pending for Step 45.

#### AUD-266 — Explore mounted preview frames before they entered the viewport

- Evidence: the pre-fix desktop Sites Worker capture mounted three offscreen iframes; the corrected run has six visible and zero offscreen frames.
- Reproduction: open /explore at 1440x900 and inspect preview iframe bounds before scrolling.
- Root cause: a 160px IntersectionObserver prewarm margin started resource runtimes before each card was visible.
- Affected code: apps/site/src/components/ResourceCard.tsx.
- Remediation: set the prewarm margin to 0px; normal scrolling still mounts and renders the next preview. Local desktop/mobile runtime checks pass; public verification remains pending for Step 45.

#### AUD-267 — Preview text selection replaced field values and announced a false action

- Evidence: the first Sites Worker E2E run failed when focusing a Textarea: the browser snapshot contained status text “Selected [object Object]” and textbox value “[object Object]”. The red-to-green machine record is quality/evidence/step-37/preview-native-onselect-regression.json. The corrected 1440x900 capture is [here](evidence/step-06/after/form-interactions/textarea-no-false-action-status-1440.png).
- Reproduction: open /resources/textarea/ at 1440x900 and click the empty textarea without typing.
- Root cause: PreviewHost passed semantic onSelect to every component. React also uses onSelect for native text-selection events, so focusing a field supplied an event object to the action callback.
- Affected code: apps/site/src/components/PreviewHost.tsx and tests/e2e/preview-form-interactions.spec.ts.
- Remediation: supply onSelect only to CommandMenu, Combobox and DropdownMenu resources. The Sites Worker regression verifies unchanged text values, no false status, no console/page/network failures, and a working Combobox selection. The complete local E2E chain passes; public review verification remains pending for Step 45.

## MEDIUM

#### AUD-268 — Public app-shell CSP allowed arbitrary inline scripts and styles

- Evidence: deployed response headers and a Chromium inline-script probe are recorded in the live evidence file quality/evidence/step-37/site-shell-csp-live-probe.json; before screenshots: audit/evidence/step-37/site-shell-csp-before-1440.png and audit/evidence/step-37/site-shell-csp-before-390.png. Local response and browser checks are in audit/evidence/step-37/site-shell-csp-local-after.json, with after screenshots audit/evidence/step-37/site-shell-csp-after-1440.png and audit/evidence/step-37/site-shell-csp-after-390.png.
- Reproduction: on the deployed review Site, append a script to the home page that assigns window.__tessellateInlineProbe = true; the script executes. The same harmless probe against the rebuilt local Sites Worker is blocked.
- Root cause: the Worker reused the broad application CSP template instead of deriving the inline code allowlist from built Astro pages.
- Affected code: apps/sites/worker.ts, apps/sites/prepare-static.mjs, and tests/e2e/sites-preview-csp.spec.ts.
- Remediation: generate SHA-256 allowlists from all 716 non-preview HTML pages; restrict script and style-element directives to those hashes and preserve the separate style-attribute allowance needed by current UI output. The 14-case CSP suite and full local E2E pipeline pass. The review Site still serves its previous response policy; deployment verification is pending Step 45.

#### AUD-269 — Mobile homepage catalogue filter could drop the first tap

- Evidence: the pre-interaction 390×844 capture is `quality/evidence/step-39/after/mobile/homepage-resource-filter-before.png`; the corrected selected state is `quality/evidence/step-39/after/mobile/homepage-resource-filter-selected.png`, with machine evidence in `quality/evidence/step-39/after/mobile/homepage-resource-filter.json`. Desktop captures and state are under the corresponding `desktop/` directory. The initial full E2E run failed at `tests/e2e/copy-quality-step-39.spec.ts:863`: the mobile `data` filter remained `aria-pressed=false` through 14 retries after tap.
- Reproduction: open `/` at 390×844, scroll to “The Resource Vocabulary,” and tap `data` as soon as its control appears. Before the fix, the first tap was dropped while the Astro island was waiting to hydrate; after the fix, the first tap filters the cards and updates the selected pill.
- Root cause: `CatalogueMosaic` used Astro `client:visible`, so server-rendered buttons became visible and tappable before React installed their event handlers.
- Affected code: `apps/site/src/pages/index.astro` and `tests/e2e/copy-quality-step-39.spec.ts`.
- Remediation: hydrate this interactive homepage island with `client:load`. The browser regression now checks both selected-state ARIA and final rendered colors after the transition, along with the filtered resource list. The fixed local full E2E pipeline passed 433 tests with 134 configured skips; the focused filter interaction passed desktop and mobile. Before/after local screenshots and runtime evidence report no console errors, uncaught exceptions, failed requests, or HTTP errors. The production review Site has not been redeployed, so this finding remains `fixed-awaiting-deployed-verification`.

#### AUD-274 — Top-level preview could attempt programmatic outbound navigation

- Evidence: local Sites Worker browser probe at 1440×900 and 390×844; machine record: `quality/evidence/step-37/programmatic-navigation-gate.json`; current preview captures: `quality/evidence/step-37/preview-direct-after-1440.png` and `preview-direct-after-390.png`. In the embedded `/explore` frame, parent `frame-src` blocked the external destination before any request. In a top-level `/preview/?resource=button`, the dummy `example.invalid` navigation was observed by Playwright and aborted with `net::ERR_BLOCKED_BY_CLIENT` before network access.
- Reproduction: open `/preview/?resource=button`, inject a dummy input value, and invoke `window.location.assign` with an example.invalid destination containing that value. Compare with the same probe in an embedded `/explore` preview, where the app-shell `frame-src` blocks navigation before a request is issued.
- Root cause: the registry scanner rejected executable URL schemes but allowed remote and unresolved programmatic destinations. The normal embedded Site has a parent frame policy; the directly opened preview does not.
- Affected code: `packages/registry-gate/src/checks/isolation-check.ts`, `packages/registry-gate/src/__tests__/registry-gate.test.ts`, and `apps/sites/worker.ts` policy behavior.
- Remediation: the source-isolation gate now rejects unresolved and non-fragment `location.assign`/`replace`, `location.href` writes, and reflected navigation while retaining user-activated external anchors. The regression was red before the fix; 72 registry-gate tests, 1,197 full unit tests, 22 typechecks, lint, 18 desktop/mobile CSP tests, all 324 resource scans, and `pnpm audit:all` pass. Direct preview behavior itself has not been redeployed; this issue remains fixed locally and awaiting Step 45 verification.

## LOW

#### AUD-270 — Full unit suite could time out during canonical Gold admission scan

- Evidence: `quality/evidence/step-37/gold-artifact-timeout-regression.json` records the initial 5-second timeout, the isolated 3.28-second pass, and the later full-suite pass (76 files, 1,195 tests).
- Reproduction: run `pnpm test` with the standard four Vitest workers while the Gold artifact regression scans all 324 canonical resources and enumerates Gold components. One full run exceeded the default 5-second test timeout (7.1 seconds observed); the test passed when run alone.
- Root cause: the exhaustive filesystem security regression used Vitest's 5-second per-test default despite two catalogue-wide scans under concurrent suite load.
- Affected code: `tests/security/gold-artifacts.test.ts`.
- Remediation: give this specific exhaustive regression a bounded 15-second timeout without changing its assertions. The subsequent full suite passed 76/76 files and 1,195/1,195 tests. This is a test-suite reliability correction, not a product runtime defect.

#### AUD-271 — Registry-gate package test command found no tests

- Evidence: `quality/evidence/step-37/registry-gate-package-test-command.json` records the failing filtered-package invocation and the corrected 70/70 pass.
- Reproduction: run `pnpm --filter @tessellate/registry-gate test`. The original script ran Vitest from `packages/registry-gate`, where the shared root include globs did not match any files.
- Root cause: the package script relied on package-local execution while the repository Vitest config and test globs are rooted at the monorepo.
- Affected code: `packages/registry-gate/package.json`.
- Remediation: anchor the package script at `../..` and target `packages/registry-gate/src/__tests__`; the same filtered command now passes 70/70 registry-gate tests. This is a developer-command reliability correction, not a product runtime defect.

#### AUD-272 — Acceptance tests bypassed the Workbench UI through a localhost store global

- Evidence: the pre-fix Workbench store attached its Zustand store to `window` for localhost and `127.0.0.1`; the former flagship test used it for internal state inspection/mutation. The post-fix machine record is [workbench-debug-store-regression.json](../quality/evidence/step-52/workbench-debug-store-regression.json), with after screenshots [desktop](../quality/evidence/step-52/after/employee-workbench-desktop-1440.png) and [mobile](../quality/evidence/step-52/after/employee-workbench-mobile-390.png).
- Reproduction: open `/workbench` locally and inspect whether `window.__tessellate_workbench_store__` exists. Before the fix, acceptance automation read or mutated the project through it rather than exercising visible controls. The updated desktop/mobile tests assert the global is absent.
- Root cause: a local-only diagnostics hook in the Workbench store exposed the Zustand store to page JavaScript, and the acceptance test had grown to depend on that shortcut.
- Affected code: `packages/workbench/src/store/workbench-store.ts`, `tests/e2e/flagship-acceptance-journey.spec.ts`, and `apps/sites/sites-smoke.spec.ts`.
- Remediation: remove the global hook; drive composition, editing, history and export through the visible UI; validate project state through the user-exported manifest and ZIP. Desktop acceptance passed the clean standalone install/build/browser smoke. Mobile acceptance passed the same visible editing/export workflow. Both runs report no console errors, uncaught exceptions, failed requests or HTTP errors. This was a test-integrity issue scoped to local development, not an observed deployed Site defect; the public review Site has not been redeployed with this branch.

#### AUD-273 — Local Sites smoke ran against an Astro preview instead of the Sites Worker

- Evidence: the former test command returned 404s for `/` and `/workbench` when the preview pointed to root `dist`, which is replaced by Worker output. Pointing Astro preview at its own output then produced opaque-origin CORS errors because the Astro server did not apply Sites Worker response headers. The red/green machine record is [sites-smoke-worker-regression.json](../quality/evidence/step-52/sites-smoke-worker-regression.json); successful Worker captures are [desktop](../quality/evidence/step-52/after/sites-worker-home-desktop.png) and [mobile](../quality/evidence/step-52/after/sites-worker-home-mobile.png).
- Reproduction: run `pnpm exec playwright test --config apps/sites/playwright.config.ts apps/sites/sites-smoke.spec.ts` without `SITES_SMOKE_URL`. Before correction, the smoke used a standalone Astro server, not the deployment Worker. After correction it starts the built Worker locally and passes both smoke tests.
- Root cause: the local smoke configuration targeted the wrong build output and server type, so it did not model the Sites asset binding or response policy.
- Affected code: `apps/sites/playwright.config.ts` and `apps/sites/astro.preview.config.mjs`.
- Remediation: target the local Sites Worker at `127.0.0.1:4323`; keep the Astro-only preview pointed at the canonical Astro artifact for any direct Astro inspection. Local Worker smoke passes 2/2 tests with no collected browser errors or failed essential requests. Public review deployment remains pending.

## HIGH

### AUD-275 — Sandboxed resource previews ignored valid same-origin host updates

- **Evidence:** before the fix, the visible Sites state test sent a valid update for the Advanced Data Table, but the “Filter People directory” textbox and empty state never appeared. The failing assertion is captured in [the preview-origin record](../quality/evidence/step-37/preview-host-origin-before.md). After the fix, Quiet → Expressive changes the rendered button at 1440×900 and 390×844; see the [desktop before](../quality/evidence/step-37/preview-host-variant-before-1440.png), [desktop after](../quality/evidence/step-37/preview-host-variant-after-1440.png), [mobile before](../quality/evidence/step-37/preview-host-variant-before-390.png), and [mobile after](../quality/evidence/step-37/preview-host-variant-after-390.png).
- **Reproduction:** in the Sites Worker, open `/resources/advanced-data-table/` at 360×844 and run the empty/large data state flow. Before the fix, its prop update was ignored. On `/r/button`, selecting Expressive changed the toolbar but left the rendered Button in Quiet.
- **Root cause:** `PreviewHost` treated `MessageEvent.origin` as the renderer’s opaque origin rather than the sender origin. The same-origin app host was consequently rejected.
- **Affected code:** `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, and `apps/site/src/scripts/preview-wrapper.ts`.
- **Remediation:** require the direct parent window and the exact same-origin sender for changes; validate READY messages from the sandboxed child against its opaque `null` origin. The top-level safety wrapper initializes read-only previews from URL parameters.
- **Validation:** the Sites Worker state/accessibility/preview selection passes 14/14, the Gold accessibility suite passes all 120 variants, and the variant change regression passes desktop and mobile. Typecheck, lint, all 1,204 unit tests, and `pnpm audit:all` pass. The fix still requires the release-candidate deployed verification.

## MEDIUM (continued)

### AUD-276 — Registry gate accepted fetch aliases through Window and Document proxies

- **Evidence:** The source gate accepted `window.window.fetch`; after that first correction, `window.frames.fetch` still passed; after Window aliases were added, `document.defaultView.fetch` still passed. These three staged red reproductions and the final ten-form matrix are recorded in [`window-proxy-network-alias.json`](../quality/evidence/step-37/window-proxy-network-alias.json). Resource source was statically parsed only; it was never executed and no request was sent.
- **Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The focused regression exercises ten direct and globally rooted Window/Document proxy paths and confirms rejection through the checker and representative full contribution-gate flow.
- **Root cause:** Window-reference resolution omitted nested `window`, `frames`, and `opener` members. It also did not resolve `Document.defaultView` to the protected browser Window, so the network-sink detector missed fetch aliases through those paths.
- **Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.
- **Remediation:** Resolve nested Window proxies and `Document.defaultView` before applying existing network-sink detection. The full contribution gate rejects the temporary resource with a failed security-isolation report.
- **Validation:** The focused regression passes 2/2 tests and covers 23 proxy/alias/callback forms; the registry-gate package passes 76 tests; `pnpm test` passes 1206 tests in 77 files; all 22 workspace typechecks pass; changed-file ESLint passes; source isolation passes 324/324; and `pnpm audit:all` passes. The fix is local; deployed verification remains open.
### AUD-277 — Registry gate accepted fetch through a destructured Window proxy alias

- **Evidence:** Before the fix, `const { window: browserWindow } = globalThis; const request = browserWindow.fetch; request('https://collector.invalid/data')` passed static source admission. The red regression and the final three-form destructuring matrix are recorded in [`window-proxy-destructured-alias.json`](../quality/evidence/step-37/window-proxy-destructured-alias.json). Source was parsed only; it was never executed.
- **Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The test covers renamed destructured aliases from `globalThis.window`, `globalThis.frames`, and `document.defaultView`, plus representative complete-gate rejection.
- **Root cause:** Window alias resolution followed ordinary variable initializers but did not follow TypeScript `BindingElement` declarations for destructured members.
- **Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.
- **Remediation:** Resolve a destructured Window proxy only when its property name is statically known and its initializer is already a recognized Window or Document reference. The complete contribution gate rejects the representative temporary resource.
- **Validation:** The focused regression passes 2/2 tests and covers 23 proxy/alias/callback forms; the registry-gate package passes 76 tests; the full workspace suite passes 1206 tests in 77 files; all 22 workspace typechecks and changed-file ESLint pass; source isolation passes 324/324; and `pnpm audit:all` passes all 16 gates, production builds, budgets, provenance, secret/security, and dependency audits. Deployed verification remains open.
### AUD-278 — Registry gate accepted direct and destructured assignments from Window proxies

- **Evidence:** Before the fix, both `browserWindow = globalThis.window` and `({ window: browserWindow } = globalThis)` allowed a later aliased fetch to pass static admission. The red/green record is [`window-proxy-assignment-alias.json`](../quality/evidence/step-37/window-proxy-assignment-alias.json). Resource source was analyzed, not executed.
- **Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. Before the fix, the mutable-alias case expected a rejection but received pass; it now fails closed through both the checker and full contribution-gate flow.
- **Root cause:** Window alias analysis followed variable initializers and destructured declarations but did not trace direct or object-pattern assignment expressions into a local identifier before use.
- **Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.
- **Remediation:** Index identifier assignment expressions once per TypeScript checker/source file, then resolve only earlier direct or statically named object-pattern assignments through the trusted Window-reference analysis.
- **Validation:** The focused regression passes 2/2 tests and covers 23 proxy/alias/callback forms; the registry-gate package passes 76 tests; the full workspace suite passes 1206 tests in 77 files; all 22 workspace typechecks and changed-file ESLint pass; source isolation passes 324/324; and `pnpm audit:all` passes all 16 gates, production builds, budgets, provenance, secret/security, and dependency audits. Deployed verification remains open.
### AUD-279 — Registry gate allowed network capability references to escape through callbacks

- **Evidence:** Before the fix, passing `globalThis.fetch` into a callback parameter passed static admission; equivalent callback transfers also escaped for WebSocket, XMLHttpRequest, EventSource, and `navigator.sendBeacon`. The red/green report is [`window-proxy-callback-transfer.json`](../quality/evidence/step-37/window-proxy-callback-transfer.json). Resource source was statically analyzed only; it was never executed.
- **Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The regression passes fetch, WebSocket, XMLHttpRequest, EventSource, and sendBeacon references into callback parameters and verifies that both the checker and complete contribution gate reject representative forms.
- **Root cause:** Network sink detection depended on tracing a call target to a known browser Window reference. Passing the capability into a callback parameter broke that local alias chain.
- **Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.
- **Remediation:** Reject statically identified fetch, WebSocket, XMLHttpRequest, EventSource, and sendBeacon property references and destructured bindings regardless of receiver. Resource implementations have no outbound network capability.
- **Validation:** The focused regression passes 2/2 tests and covers 23 proxy/alias/callback forms; the registry-gate package passes 76 tests; the full workspace suite passes 1206 tests in 77 files; all 22 workspace typechecks and changed-file ESLint pass; source isolation passes 324/324; and `pnpm audit:all` passes all 16 gates, builds, budgets, provenance, security, and dependency audits. Deployed verification remains open.

### AUD-280 — Registry gate allowed worklet module loading

- **Evidence:** The pre-fix scanner returned `pass` for `AudioContext.audioWorklet.addModule('https://collector.invalid/processor.js')` and `CSS.paintWorklet.addModule('https://collector.invalid/paint.js')`. A dynamic method lookup through a Worklet alias also passed after the first correction. Resource code was parsed only; it was never executed and no request was sent. Red-to-green records are in `quality/evidence/step-37/worklet-module-loading.json`.
- **Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The regression covers direct audio and CSS paint Worklets, aliases, destructuring, reassignment, reflection, typed Worklet parameters, and unknown computed method names. Representative submissions are also rejected by `runRegistryGate`.
- **Root cause:** The isolation scanner blocked fetch, Worker, media, and reflected network constructors but did not recognize the Worklet `addModule()` API, which loads executable modules outside ordinary import syntax.
- **Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.
- **Remediation:** Reject `addModule` access as a dynamic module/network capability, detect unknown computed method lookups on Worklet references, and reject reflected `addModule` extraction.
- **Validation:** The focused registry-gate file passes 4 tests; the package passes 78 tests; `pnpm test` passes 1208 tests in 77 files; `pnpm test:e2e` passes 438 tests with 133 configured skips and zero failures; the Sites Worker CSP regression passes on desktop and mobile; `pnpm audit:all` passes 16/16 behavioral gates; typecheck and changed-file ESLint pass; and source isolation passes 324/324. Release-candidate deployed verification remains open.

## HIGH (continued)

### AUD-305 — Unbounded Zod collections exposed validation to excessive work

- **Evidence:** The dependency gate reported [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) through the workspace's Zod 4.6.5 dependency; direct Zod 3 dependencies also meant collection bounds could not consistently use the upstream early-rejection behavior. The after record is [`zod-collection-audit.json`](../quality/evidence/step-39/zod-collection-audit.json), with captured [`pnpm audit`](../quality/evidence/step-39/zod-audit-after.log) and schema regressions in [`zod-schema-regressions.log`](../quality/evidence/step-39/zod-schema-regressions.log).
- **Reproduction:** Run `pnpm audit:all` on the pre-fix dependency graph to see the high advisory. Feed 25,000 malformed entries to the project-screen and recursive-child schemas; before explicit bounds, the schemas attempted to parse each item rather than rejecting the collection length first.
- **Root cause:** Core public/persisted collection schemas had arrays without maximum sizes and workspace packages resolved multiple Zod majors, including the affected 4.6.5 release.
- **Affected code:** `pnpm-workspace.yaml`, `pnpm-lock.yaml`, direct Zod dependencies in `apps/api` and `packages/{schemas,workbench,mcp,registry-gate}`, collection schemas in `packages/schemas/src`, MCP device bounds, and schema tests.
- **Remediation:** Standardize direct dependencies and Better Auth's transitive resolution on Zod 4.6.7, set product-scale upper bounds on external arrays/sets/maps, retain byte limits at API boundaries and the recursive project-node depth cap, and add large malformed collection regressions.
- **Validation:** `pnpm audit` reports no known vulnerabilities; schema tests pass 144/144, the full unit suite passes 1,212/1,212, and `pnpm typecheck` and `pnpm lint` pass. `pnpm audit:all` passes all 16 release gates, builds 718 Astro pages and the Sites artifact, certifies resource isolation 324/324, and passes bundle, provenance/licence, security and dependency audits. Full Playwright passes 274 application, 224 Sites Worker and 3 preview tests with 144 configured skips and no failures. See [`zod-collection-audit.json`](../quality/evidence/step-39/zod-collection-audit.json) and captured gate logs. Public review verification remains pending.

### AUD-281 — Explore skeleton failed a serious Axe ARIA rule

- **Evidence:** the loading-state capture is `quality/evidence/step-38/before/explore-loading-sites-chromium.png`; after adding an explicit status role, the loading capture is `quality/evidence/step-38/after/explore-loading-sites-chromium.png`. The Core-surface Axe check failed on both desktop and mobile with serious `aria-prohibited-attr` findings.
- **Reproduction:** Open `/explore` in a fresh Sites Worker context at 1440×900 or 390×844, keep the catalogue loading state visible, and run the Core-surface Axe scan.
- **Root cause:** the skeleton grid placed `aria-label` on a generic `div` without a role.
- **Affected code:** `apps/site/src/components/ExploreView.tsx`.
- **Remediation:** give the inert skeleton grid `role="status"`, preserving its label and busy state.
- **Validation:** focused desktop/mobile Axe tests pass after rebuilding. The issue is fixed locally and still awaits published review verification.

## MEDIUM (continued)

### AUD-282 — Explore reported zero results while a new search was pending

- **Evidence:** the pre-fix query-transition capture and sample are `quality/evidence/step-38/before/explore-query-transition-sites-chromium.{png,json}`; the corrected capture and sample are under `quality/evidence/step-38/after/` with the same basename. The red run showed “Showing 0 of 0” before the matching search finished.
- **Reproduction:** Open `/explore`, complete a query with no matches, replace it with a matching query, and inspect the live status during the 250ms debounce.
- **Root cause:** search completion was recorded as a boolean, so a completed result for an old query was treated as current.
- **Affected code:** `apps/site/src/components/ExploreView.tsx` and `tests/e2e/site-route-performance-step-38.spec.ts`.
- **Remediation:** associate completed search state with a stable signature of the visible query and sorted filters; show a pending status and reserved skeleton results until that signature completes.
- **Validation:** the focused Sites Worker route suite passed 6/6, including the transition regression. Full post-remediation browser validation and published review verification are being completed separately.

### AUD-283 — Section Planner exposed inert controls before hydration

- **Evidence:** the flaky mobile click failed on run 92 of 100; the red repeat log is `quality/evidence/step-39/before/section-planner-mobile-one-of-100-lost-preset-click.log`. The deterministic delayed-script regression captures disabled/loading and ready states at `quality/evidence/step-39/after/section-planner-hydration-sites-mobile-chromium-{loading,ready}.png` and records both in its JSON file.
- **Reproduction:** On a cold `/tools/section-planner` mobile load, tap an objective preset as soon as its server-rendered label appears. Before the fix, the enabled-looking preset could receive a tap before the island registered a handler, leaving the objective unchanged.
- **Root cause:** server-rendered controls were enabled before the `client:load` React island hydrated.
- **Affected code:** `apps/site/src/components/tools/SectionPlanner.tsx` and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation:** disable all planner actions and show a live “Loading planner controls…” status until client hydration completes.
- **Validation:** delayed-JavaScript and normal preset tests pass in desktop and mobile Sites Worker profiles (4/4). Full post-remediation browser validation and published review verification remain separate gates.

### AUD-284 — Astro JSX/MDX rendering used an advisory-affected release

- **Evidence:** the first `pnpm audit:dependencies` run reported moderate [GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8) for the locked `astro@7.2.8`, below the 7.3.2 fix. The clean after audit is recorded in `quality/evidence/step-38/after/audit-all-20261023-post-dependency-fix.log`.
- **Reproduction:** Run `pnpm audit:dependencies` before the package update. It reports the advisory on `apps__site>astro`.
- **Root cause:** the lockfile selected an Astro release before its dynamic JSX/MDX script/style child escaping fix.
- **Affected code:** `apps/site/package.json` and `pnpm-lock.yaml`.
- **Remediation:** update Astro to 7.4.2, which includes the upstream fix.
- **Validation:** frozen installation, production build, dependency audit, and all of `pnpm audit:all` pass. The full browser matrix is being rerun against the upgraded dependency; published review verification remains open.

### AUD-285 — MCP rate-limit chain used a vulnerable ip-address release

- **Evidence:** the initial dependency audit reported moderate [GHSA-rxp7-6hxx-x8q5](https://github.com/advisories/GHSA-rxp7-6hxx-x8q5) for `ip-address@10.7.3` under the MCP SDK's `express-rate-limit` path. The clean after audit is recorded in `quality/evidence/step-38/after/audit-all-20261023-post-dependency-fix.log`.
- **Reproduction:** Run `pnpm audit:dependencies` before the workspace override. It reports the advisory at `packages__mcp>@modelcontextprotocol/sdk>express-rate-limit>ip-address`.
- **Root cause:** the transitive lock selected the vulnerable patch release.
- **Affected code:** `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
- **Remediation:** pin the workspace override to patched `ip-address@10.7.4`.
- **Validation:** frozen installation and `pnpm audit:all` pass; the full browser matrix is rerunning with the final lockfile. Published review verification remains open.

## HIGH (continued — 2026-10-23)

### AUD-307 — MCP SDK dependency graph included vulnerable body-parser 2.3.0

- **Evidence:** `quality/evidence/step-40/audit-all-body-parser-before.log` reports [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828) as high severity through `packages__mcp>@modelcontextprotocol/sdk>express>body-parser`. `pnpm why body-parser -r` showed 2.3.0 before the fix. The MCP SSE implementation uses Node's HTTP server directly and does not import Express or body-parser, but the vulnerable package was still present in the runtime dependency graph and made the security audit fail.
- **Reproduction:** Run `pnpm audit:all` before the workspace override and inspect the final dependency audit. Run `pnpm why body-parser -r` to inspect the SDK dependency path.
- **Root cause:** The MCP SDK's Express dependency graph resolved affected `body-parser@2.3.0`, and the workspace had no patched-version override.
- **Affected code:** `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
- **Remediation:** Pin the affected dependency to patched `body-parser@2.4.0`. A frozen install passes, `pnpm audit` reports no known vulnerabilities, the MCP client/SSE workflow tests pass 7/7, and `pnpm audit:all` passes all 16 behavioral gates, 324/324 source-isolation checks, production builds, bundle budgets, provenance, security and dependency audits. Public release verification remains pending.

## MEDIUM (continued — 2026-10-23)

### AUD-287 — Compose marked non-field headings as form labels

- **Evidence:** after screenshot `quality/evidence/step-35/sites-chromium/sites-chromium--compose-.png`; Changed the three headings to spans. The Sites Worker regression checks every Compose label is associated; local post-fix browser run passes. Published review verification is pending.
- **Reproduction:** Open /compose at desktop width. Inspect label.control for every label; these three labels return null. Run the Compose label regression in tests/e2e/accessibility-hardening-step-35.spec.ts.
- **Root cause:** Compose used label elements for visual grouping headings even though each group contains buttons rather than a labeled form field.
- **Affected code:** `apps/site/src/components/ComposeView.tsx`, `tests/e2e/accessibility-hardening-step-35.spec.ts`.
- **Remediation:** Changed the three headings to spans. The Sites Worker regression checks every Compose label is associated; local post-fix browser run passes. Published review verification is pending.

### AUD-288 — Explore search omitted native field identity

- **Evidence:** after screenshot `quality/evidence/step-38/after/explore-desktop-1440x900-after.png`; Added id catalogue-search and name q. Desktop/mobile Sites Worker browser regression passes after catalogue readiness. Published review verification is pending.
- **Reproduction:** Open /explore. Inspect the Search catalogue textbox id and name attributes. Run the field identity case in tests/e2e/explore-search-hardening.spec.ts.
- **Root cause:** The Explore search input had an aria-label but no native form identity.
- **Affected code:** `apps/site/src/components/ExploreView.tsx`, `tests/e2e/explore-search-hardening.spec.ts`.
- **Remediation:** Added id catalogue-search and name q. Desktop/mobile Sites Worker browser regression passes after catalogue readiness. Published review verification is pending.

### AUD-289 — Homepage composition fields lacked native identity

- **Evidence:** after screenshot `quality/evidence/step-38/after/sites-worker/home-desktop-1440x900.png`; Added stable ids and names to the prompt and feel fields. Sites Worker desktop/mobile regression passes. Published review verification is pending.
- **Reproduction:** Open the homepage at desktop or mobile width. Inspect text inputs in the hero and final composer blocks. Run tests/e2e/home-performance-step-38.spec.ts.
- **Root cause:** Homepage composer fields were authored as interactive inputs without their own form identity.
- **Affected code:** `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `tests/e2e/home-performance-step-38.spec.ts`.
- **Remediation:** Added stable ids and names to the prompt and feel fields. Sites Worker desktop/mobile regression passes. Published review verification is pending.

### AUD-290 — Employee preview table filters lacked unique field identity

- **Evidence:** after screenshot `quality/evidence/step-24/after/employee-directions-sites-chromium.png`; Added per-instance filter IDs/names and unique checkbox IDs with a per-table checkbox name. The catalogue was rebuilt; direction filters remain independent and desktop/mobile handoff tests pass. Published review verification is pending.
- **Reproduction:** Compose the employee experience brief. Inspect the filter textbox in each of the three direction previews. Filter Direction C to a no-match query and then clear it. Run the filter contract in tests/e2e/compose-workbench-handoff.spec.ts.
- **Root cause:** The shared AdvancedDataTable resource exposed only an aria-label for its filter and did not distinguish filter and row-selection form fields.
- **Affected code:** `resources/blocks/advanced-data-table/index.tsx`, `tests/e2e/compose-workbench-handoff.spec.ts`.
- **Remediation:** Added per-instance filter IDs/names and unique checkbox IDs with a per-table checkbox name. The catalogue was rebuilt; direction filters remain independent and desktop/mobile handoff tests pass. Published review verification is pending.

### AUD-292 — Explore search accepted input before island hydration

- **Evidence:** after screenshot `quality/evidence/step-38/after/explore-loading-sites-chromium.png`; The input now stays disabled and displays Preparing search until urlReady. The deterministic delayed-script test and normal search path pass on desktop and mobile Sites Worker. Published review verification is pending.
- **Reproduction:** Delay the ExploreView island JavaScript on /explore. Attempt to type before hydration completes. Run the delayed-script case in tests/e2e/explore-search-hardening.spec.ts.
- **Root cause:** Server-rendered Explore markup exposed an active search input before urlReady indicated the event handlers had attached.
- **Affected code:** `apps/site/src/components/ExploreView.tsx`, `tests/e2e/explore-search-hardening.spec.ts`.
- **Remediation:** The input now stays disabled and displays Preparing search until urlReady. The deterministic delayed-script test and normal search path pass on desktop and mobile Sites Worker. Published review verification is pending.

### AUD-293 — Workbench Design DNA sliders lacked native identity

- **Evidence:** after screenshot `quality/evidence/step-24/after/employee-workbench-controls-sites-chromium.png`; Generated stable per-instance IDs with useId and explicit names for all seven sliders. The exact Compose-to-Workbench test now reports zero missing identities or duplicate IDs on desktop and mobile. Published review verification is pending.
- **Reproduction:** Compose the exact employee-experience brief and open Direction C in Workbench. Inspect the Feel Mixer and intent sliders. Run tests/e2e/compose-workbench-handoff.spec.ts; before the fix it reported nine unnamed controls in the Workbench surface.
- **Root cause:** The FeelMixer and IntentTab range inputs provided aria-labels but omitted native identifiers, including instance isolation for repeated inspector mounts.
- **Affected code:** `packages/workbench/src/components/feel-mixer/FeelMixer.tsx`, `packages/workbench/src/components/right-inspector/IntentTab.tsx`, `tests/e2e/compose-workbench-handoff.spec.ts`.
- **Remediation:** Generated stable per-instance IDs with useId and explicit names for all seven sliders. The exact Compose-to-Workbench test now reports zero missing identities or duplicate IDs on desktop and mobile. Published review verification is pending.

### AUD-294 — Feel phrase label was not associated with its input

- **Evidence:** after screenshot `quality/evidence/step-24/after/employee-workbench-controls-sites-chromium.png`; Connected the label with htmlFor to a per-instance input ID and added a form name. The desktop/mobile handoff regression confirms every label has an associated control. Published review verification is pending.
- **Reproduction:** Compose the exact employee brief and open Direction C in Workbench. Inspect the Add Trait or Feel Phrase label control relationship. Run tests/e2e/compose-workbench-handoff.spec.ts before the fix.
- **Root cause:** FeelMixer rendered a standalone label without connecting it to the phrase input; an aria-label on the input did not repair the label relationship.
- **Affected code:** `packages/workbench/src/components/feel-mixer/FeelMixer.tsx`, `tests/e2e/compose-workbench-handoff.spec.ts`.
- **Remediation:** Connected the label with htmlFor to a per-instance input ID and added a form name. The desktop/mobile handoff regression confirms every label has an associated control. Published review verification is pending.

### AUD-296 — Compose blocked its first response frame during generation

- **Evidence:** The initial Compose click trace measured 299 ms INP (4 ms input delay, 120 ms processing, 175 ms presentation). After the fix, Chrome DevTools measured a 32 ms pointer interaction (0.8 ms input delay, 11 ms processing, 20 ms presentation) at 1440×900. The exact employee brief generated three rendered directions; LCP was 119 ms and CLS 0.00. There were no console messages or failed network requests. The captured in-progress UI is `quality/evidence/step-38/after/compose-progress-sites-chromium.png`; machine-readable details are in `quality/evidence/step-38/after/compose-interaction-chrome-devtools.json`. Published review verification is pending.
- **Reproduction:** Open `/compose` at 1440×900 with the catalogue ready, enter the employee-experience brief, choose Refined and Radical, start a Chrome DevTools performance trace, then submit Compose. Inspect the longest interaction and verify all three direction previews render.
- **Root cause:** `composeProjectPipeline` ran inside the submit task before React could paint feedback, so the click waited for product interpretation and resource selection.
- **Affected code:** `apps/site/src/components/ComposeView.tsx`, `tests/e2e/compose-responsiveness-hardening.spec.ts`.
- **Remediation:** Yield through two animation frames to paint a truthful busy status before running deterministic composition, then commit the three-direction result in a React transition. At 4× emulated CPU the regression confirms the busy state appears, the action is guarded against duplicate submissions, and all three previews complete. Local Chrome DevTools INP is 32 ms; published review verification remains open.

### AUD-297 — Metrics resource metadata claimed unmeasured infrastructure outcomes

- **Evidence:** deployed before screenshots at [1440×900](../quality/evidence/step-39/before/customer-metrics-copy-deployed-before-desktop.png) and [390×844](../quality/evidence/step-39/before/customer-metrics-copy-deployed-before-mobile.png) show the page describing uptime, volume, latency, and scale while its actual preview shows illustrative project, team, task, and completion values. Machine-readable before telemetry is beside each capture. The after screenshots are `quality/evidence/step-39/after/customer-metrics-copy-desktop.png` and `quality/evidence/step-39/after/customer-metrics-copy-mobile.png`; machine-readable browser evidence is also stored beside them. Before assertions failed on desktop and mobile.
- **Reproduction:** Open `/r/customer-metrics-strip` at 1440×900 or 390×844 and compare the summary and usage guidance with the four default preview values. Before the fix, run `pnpm exec playwright test --config tests/e2e/sites-preview.playwright.config.ts -g "metrics strip catalogue copy"`.
- **Root cause:** the canonical manifest and README described generic infrastructure credibility rather than the values rendered by the resource.
- **Affected code:** `resources/sections/customer-metrics-strip/manifest.json`, `resources/sections/customer-metrics-strip/README.md`, and `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- **Remediation:** Metadata now describes project, team, task, and completion metrics and marks defaults as illustrative. After rebuilding the Sites static artifact, desktop and mobile browser checks pass with HTTP 200 and no console/network errors. Published review verification remains pending.

### AUD-298 — Default marquee wordmarks implied real customer relationships

- **Evidence:** the deployed before captures at 1440×900 and 390×844 in `quality/evidence/step-39/before/logo-cloud-marquee-deployed-before-{desktop,mobile}.{png,json}` show real vendor names beside copy describing partner/customer wordmarks and high customer-adopter volume. The preview itself has no corresponding relationship data. Both routes return HTTP 200 with no console errors/warnings, uncaught exceptions, failed requests, or HTTP errors.
- **Reproduction:** Open `/r/logo-cloud-marquee` at desktop or mobile width and compare its default names and claims. Before the fix, the desktop/mobile Sites Worker test failed because the resource neither labeled the names as samples nor avoided named vendors.
- **Root cause:** the component hardcoded real vendor names as defaults while the manifest described them as customer and partner proof without sample disclosure.
- **Affected code:** `resources/sections/logo-cloud-marquee/index.tsx`, its manifest and README, and `tests/resource-demo-truth.test.ts` / `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- **Remediation:** Defaults now use visibly labeled sample partner names; the manifest and README describe placeholders and require approved identities for published claims. Explicit caller-provided names are not labeled as samples. Desktop/mobile browser checks pass locally with the sample disclosure and scroll cue visible, and with no console warnings/errors, uncaught exceptions, failed requests, HTTP errors, or page overflow; public review verification remains pending.

### AUD-299 — Centered marquee overflow clipped its first wordmark

- **Evidence:** the deployed before geometry at `quality/evidence/step-39/before/logo-cloud-marquee-deployed-before-desktop.json` recorded a 716 px track with 882 px content, trackLeft 24 px, and firstLeft −141.55 px. The screenshot shows the leading name clipped even though the page has no horizontal overflow. After records in `quality/evidence/step-39/after/logo-cloud-marquee-{desktop,mobile}.{png,json}` show firstLeft aligned at trackLeft on both viewports.
- **Reproduction:** Open the resource detail page and inspect the first name at scrollLeft 0. Before the fix, `tests/e2e/resource-copy-truthfulness-step-39.spec.ts` failed on desktop and mobile because the first item extended left of the scrolling viewport.
- **Root cause:** the scrollable flex row used `justify-center`; when its content exceeded the viewport width, centering shifted the first item into negative overflow.
- **Affected code:** `resources/sections/logo-cloud-marquee/index.tsx` and `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- **Remediation:** The outer region now owns horizontal scrolling and keyboard focus, while a max-content inner track keeps the first wordmark aligned with the viewport. A visible cue explains horizontal scrolling. Browser tests verify first-item visibility, focus, keyboard scrolling, and reachability of the final label on desktop/mobile; machine-readable after evidence records the keyboard scroll amount and final-label visibility. Public review verification remains pending.

### AUD-300 — Homepage visual spectrum controls were active before island hydration

- **Evidence:** the local Sites Worker before screenshot and JSON at `quality/evidence/step-39/before/homepage-spectrum-controls-before-hydration.{png,json}` show the Essential selector server-rendered enabled with no loading explanation while JavaScript is disabled. The full desktop Sites browser run clicked it before the `client:visible` island hydrated and the selection remained Elevated; the mobile equivalent passed.
- **Reproduction:** Open `/`, scroll the Essential → Experimental section into view, and activate 01 · Essential immediately. The failing browser regression also opens the route with JavaScript disabled and asserts the pre-hydration control state.
- **Root cause:** the below-fold React island was deferred with `client:visible`, but its server-rendered buttons were enabled before their click handlers attached.
- **Affected code:** `apps/site/src/pages/index.astro`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, and `tests/e2e/copy-quality-step-39.spec.ts`.
- **Remediation:** Keep the island deferred, render its selectors disabled, and expose a visible “Preparing comparison controls” status until the first client effect enables them. Desktop/mobile interaction and JavaScript-disabled state regressions pass locally; public review verification remains pending.

### AUD-301 — Performance metrics metadata claimed empirical results for a prompt template

- **Evidence:** deployed before captures at 1440×900 and 390×844 in `quality/evidence/step-39/before/feature-metrics-deployed-before-{desktop,mobile}.{png,json}` show the metadata promising empirical benchmark graphs and comparison statistics while the preview contains a sample JavaScript budget and prompts to add tracking and Lighthouse reports. Both HTTP responses were 200 with no console warnings/errors, uncaught exceptions, failed requests, or HTTP errors.
- **Reproduction:** Open `/r/feature-metrics` on desktop or mobile. Compare its description, purpose, jobs, and README with the preview's “Example target”, “Review”, and “Measure” prompts. The pre-fix desktop/mobile Sites Worker assertions failed on the unsupported empirical claim.
- **Root cause:** The manifest and README described a measured benchmark product while the component rendered an evidence-collection template.
- **Affected code:** `resources/sections/feature-metrics/manifest.json`, `resources/sections/feature-metrics/README.md`, and `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- **Remediation:** Metadata now describes an illustrative performance-reporting template and requires dated reports, sources, and measurement conditions. Desktop/mobile Sites Worker checks pass; after captures are in `quality/evidence/step-39/after/resource-proofs/`. Public review verification remains pending.

### AUD-302 — Social-proof metadata promised verified evidence for illustrative defaults

- **Evidence:** deployed before captures at 1440×900 and 390×844 in `quality/evidence/step-39/before/social-proof-hero-deployed-before-{desktop,mobile}.{png,json}` show the metadata claiming verified counts and ratings while the preview says “Example rating”, “Example: 128 teams”, and “Evidence required”. Both routes return HTTP 200 without browser or network errors.
- **Reproduction:** Open `/r/social-proof-hero` at desktop or mobile width and compare the manifest-driven intent panel with the default evidence labels. The pre-fix desktop/mobile Sites Worker checks failed because the metadata presented examples as verified results.
- **Root cause:** Resource copy described published customer proof even though the component was a placeholder layout; the decorative star visually overemphasized its example rating.
- **Affected code:** `resources/sections/social-proof-hero/index.tsx`, its manifest and README, and `tests/resource-demo-truth.test.ts` / `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- **Remediation:** The resource is now documented as an illustrative template, requires approved evidence, and no longer adds a star beside “Example rating”. Desktop/mobile checks pass; public review verification remains pending.

### AUD-303 — Testimonial metadata presented illustrative copy as customer endorsements

- **Evidence:** deployed before captures at 1440×900 and 390×844 in `quality/evidence/step-39/before/testimonial-grid-deployed-before-{desktop,mobile}.{png,json}` show the detail page calling the sample content customer endorsements while the preview labels quotes and identities as examples. HTTP status is 200 at both sizes, with no browser or network errors.
- **Reproduction:** Open `/r/testimonial-grid` and compare the detail description and intent panel to its “Illustrative quote” and “Example Customer” content. The pre-fix desktop/mobile Sites Worker assertions failed on the old endorsement claim.
- **Root cause:** Manifest intent and README copy were not updated when the component defaults were made explicit examples.
- **Affected code:** `resources/sections/testimonial-grid/manifest.json`, `resources/sections/testimonial-grid/README.md`, and `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- **Remediation:** Copy now describes a responsive template for approved statements and clearly labels the defaults as illustrative. Desktop/mobile Sites Worker tests pass; public review verification remains pending.

### AUD-304 — Illustrative testimonials received fabricated five-star ratings

- **Evidence:** the deployed before screenshots in `quality/evidence/step-39/before/testimonial-grid-deployed-before-{desktop,mobile}.png` show five stars on every card even though the quote text is explicitly illustrative. The pre-fix `tests/resource-demo-truth.test.ts` regression failed on the hard-coded stars. Routes returned HTTP 200 without browser/network errors.
- **Reproduction:** Open `/r/testimonial-grid` and inspect each default card. Before the fix, rendering the component with no rating data still produced five stars.
- **Root cause:** The component hard-coded a five-star row independently of its testimonial props, which had no rating field.
- **Affected code:** `resources/sections/testimonial-grid/index.tsx`, `tests/resource-demo-truth.test.ts`, and `tests/e2e/resource-copy-truthfulness-step-39.spec.ts`.
- **Remediation:** Ratings are optional; only integer values from one through five render, and a supplied score has an accessible label. Unit and desktop/mobile Sites Worker checks pass with no default stars; public review verification remains pending.

## MEDIUM (continued — 2026-10-23)

### AUD-306 — Mobile homepage pushed the composer below the first viewport

- **Evidence:** before screenshot `quality/evidence/step-40/before/home-mobile-viewport.png` and red regression log `quality/evidence/step-40/before/home-mobile-regression-red.log` show a 1,306.78px hero (155% of an 844px viewport), with the Compose button below the fold. After screenshot `quality/evidence/step-40/after/home-mobile-viewport.png` and `quality/evidence/step-40/after/home-mobile-layout-measurement.json` show a 658.53px hero (78%) and the button bottom at y=665.53. Desktop and mobile captures for six public surfaces are recorded in `quality/evidence/step-40/after/visual-audit.json`.
- **Reproduction:** Open `/` at 390×844 and inspect the hero and Compose button bounds. Before the fix, both Sites Chromium mobile projects failed `tests/e2e/home-visual-rhythm-step-40.spec.ts`; after it, both pass and the compact Feel, ambition and structure disclosure opens all three controls.
- **Root cause:** mobile retained oversized heading and spacing, preset chips wrapped into several lines, the brief used three rows, desktop controls stacked below it, and the current-settings panel repeated those controls.
- **Affected code:** `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, and `tests/e2e/home-visual-rhythm-step-40.spec.ts`.
- **Remediation:** compacted mobile spacing and brief input, made presets horizontally scrollable, moved Feel/ambition/structure controls into a native disclosure on narrow screens, kept the Compose action visible, and hid the redundant settings summary below `xl`. The 2-project mobile regression, Sites Worker capture, production build, bundle budgets, typecheck and lint pass; no browser console/page errors or failed network requests occurred. This is locally verified; public release verification remains pending.

### AUD-308 — Documentation index omitted all canonical repository guides

- **Evidence:** the pre-fix screenshots `quality/evidence/step-40/before/docs-index-{desktop,mobile}-full.png` show a single Registry installation link and a largely empty documentation page. The pre-fix route probe measured only 375 characters of body text and no browser or network errors. After captures and the 16-link regression are in `quality/evidence/step-40/after/all-routes/` and `quality/evidence/step-40/after/documentation-index-regression.json`.
- **Reproduction:** Open `/docs/` at 1440×900 or 390×844. Before the fix, only the hard-coded Registry installation guide appears; opening `/docs/product-spec/` does not resolve to the repository guide. The new Playwright test fails before the fix with one link where 16 are expected.
- **Root cause:** `apps/site/src/lib/documentation.ts` walked five levels above its directory, resolving outside the repository's `docs/` folder. The Markdown glob was empty, so the index and dynamic canonical guide routes were omitted.
- **Affected code:** `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/[slug].astro`, and `tests/e2e/documentation-index-step-40.spec.ts`.
- **Remediation:** Corrected the glob to resolve the repository-root `docs/` directory. The build now emits all 15 Markdown-backed guide routes plus the Registry guide; the browser regression verifies 16 links and opens the Product Specification at desktop and mobile. Local verification passes; deployed review verification remains pending.

### AUD-309 — Activity Feed presented fabricated events as live workspace activity

- **Evidence:** the pre-fix captures `quality/evidence/step-40/before/blocks-activity-feed-{desktop,mobile}-viewport.png` show invented people, a “validated 72” count, revision 1.0.4 and PR #142 with no example label. The post-fix direct resource captures and runtime telemetry are in `quality/evidence/step-40/after/all-routes/resource-activity-feed-{desktop,mobile}-viewport.png` and `visual-audit.json`.
- **Reproduction:** Open `/blocks` or `/r/activity-feed/` at 1440×900 or 390×844. Before the fix, the default preview implied those static entries were actual workspace activity. The new unit regression failed before the fix because “Sample activity” was missing.
- **Root cause:** The resource hard-coded sample people and events, accepted no live event data, and had no visible disclosure; its manifest and README did not document that limitation.
- **Affected code:** `resources/blocks/activity-feed/index.tsx`, `manifest.json`, `README.md`, `tests/resource-demo-truth.test.ts`, and `tests/e2e/activity-feed-sample-disclosure-step-40.spec.ts`.
- **Remediation:** Label the feed “Sample activity,” replace the fabricated identities, counts and identifiers with generic example entries, and document that the component is static. The full 1,213-test unit suite passes. The aggregate `pnpm test:e2e` rerun passes 509 tests with 144 configured skips and zero failures; the Sites Worker iframe regression passes on desktop and mobile. The test is excluded from plain Astro because that server does not provide the Sites Worker opaque-origin CORS policy; the product security policy is unchanged. `pnpm audit:all` passes. Public review verification remains pending.

## MEDIUM (continued — 2026-10-24, Step 41)

### AUD-310 — identical manifests produced timestamp-dependent exports

- **Evidence:** `quality/evidence/step-41/before/export-determinism-regression.json` records the failing same-input comparison: generated README timestamps differed. The regression passes after the fix.
- **Reproduction:** Call the source-tree exporter twice with the same valid manifest and target, then compare every output path and byte. Before the fix, generated README content differed.
- **Root cause:** all five export targets inserted the current timestamp into generated README content.
- **Affected code:** `packages/exporter/src/targets/vite.ts`, `next.ts`, `expo.ts`, `swiftui.ts`, `tokens.ts`, and `packages/exporter/src/__tests__/exporter.test.ts`.
- **Remediation:** replace time-varying attribution with stable attribution and test exact source-tree equality for each target.
- **Verification:** exporter tests pass 16/16. Cross-surface browser tests confirm CLI and MCP exports match byte-for-byte for the tested UI, CLI and MCP manifests. This is local verification; public review verification remains pending.
- **Disposition:** Fixed and verified locally.

### AUD-311 — Workbench had no UI to open a CLI or MCP manifest

- **Evidence:** `quality/evidence/step-41/before/workbench-import-regression.json` records the failed visible-control lookup before the fix. After screenshots and round-trip records are in `quality/evidence/step-41/after/sites-desktop/` and `quality/evidence/step-41/after/sites-mobile/`.
- **Reproduction:** Open Workbench and inspect its Export menu. Before the fix, there was no manifest file chooser, so CLI- or MCP-created projects could not be handed to the editor through the UI.
- **Root cause:** the canonical JSON importer was available in the exporter package, but Workbench did not connect it to a user-visible action.
- **Affected code:** `packages/workbench/src/components/TopToolbar.tsx`, `docs/WORKBENCH_SPEC.md`, `docs/CURRENT_PRODUCT_INVENTORY.md`, and `tests/e2e/cross-surface-manifest-step-41.spec.ts`.
- **Remediation:** add “Open Tessellate Manifest” to the existing Export menu. Use the canonical schema/migration importer, enforce a 5 MiB input limit, reject local project-ID collisions, and preserve the current project on malformed or conflicting input.
- **Verification:** the local Sites Worker regression passes 6/6 desktop/mobile cases, covering CLI and MCP imports, visible edits, manifest export, CLI/MCP validation, malformed input, duplicate IDs and zero Axe findings. Browser console, page-error, failed-request and HTTP-error lists are empty. Public review verification remains pending.
- **Disposition:** Fixed and verified locally.

### AUD-313 — transitive fast-uri version failed the dependency security gate

- **Severity:** Medium; workspace dependency graph.
- **Evidence:** `quality/evidence/step-41/pnpm-audit.json` records four advisories (two moderate and two low) affecting fast-uri 3.1.8 in the MCP SDK's Ajv validation path. `quality/evidence/step-41/dependency-audit-after.log` shows the clean dependency audit.
- **Reproduction:** Run `pnpm audit:dependencies` on the pre-fix lockfile; it reports fast-uri advisories for the MCP package graph.
- **Root cause:** the MCP SDK validation dependency resolved to fast-uri 3.1.8, below patched 3.1.9.
- **Affected code:** `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
- **Remediation:** constrain the fast-uri 3.x line to 3.1.9.
- **Verification:** `pnpm audit:dependencies` reports no known vulnerabilities and `pnpm why fast-uri -r` confirms 3.1.9. Full quality gates are being rerun; public review verification remains pending.
- **Disposition:** Fixed and verified locally.

## MEDIUM (continued — 2026-10-24, Step 42)

### AUD-314 — missing-project recovery offered an unrelated manifest export

- **Evidence:** before the fix, the Sites Worker red regression found one “Export the current manifest” link on a missing-project recovery route. The test context and reproduced assertion are recorded in `quality/evidence/step-42/before/stale-project-export-red-test.md`; after-fix desktop/mobile screenshots and runtime records are in `quality/evidence/step-42/`.
- **Reproduction:** open `/workbench/?project=<unique-id-not-present-in-browser-storage>`. The route reports that the requested project is missing but, before the fix, offered to export a manifest anyway.
- **Root cause:** the generic `storageError` branch serialized the Workbench store’s initial sample manifest before any project had loaded.
- **Affected code:** `packages/workbench/src/components/WorkbenchShell.tsx` and `tests/e2e/fault-injection-step-42.spec.ts`.
- **Remediation:** remove the misleading download from this recovery state. Explain that no project was opened and saved browser records remain unchanged; offer Compose or starting a new local sample. Corrupt records retain their separate raw-record export path.
- **Verification:** red-to-green Sites Worker E2E passes at 1440×900 and 390×844. The stale-project state has zero Axe violations, console/page errors, failed requests, HTTP errors, and horizontal overflow. Public review verification remains pending for Step 45.
- **Disposition:** Fixed and verified locally.

## MEDIUM (continued — 2026-10-24, Step 44)

### AUD-315 — Long CLI code samples overflowed the mobile documentation page

- **Evidence:** before capture quality/evidence/step-44/sites-docs-cli-before-360.png shows the CLI guide extending 29px beyond its 360px viewport. The after capture quality/evidence/step-44/sites-docs-cli-after-360.png shows the page constrained to the viewport and the code block in its own scroll region.
- **Reproduction:** Open /docs/cli at 360×844 and inspect long command examples. Before the fix, the document width was 389px and code examples did not provide keyboard scrolling.
- **Root cause:** shared preformatted-code styles did not constrain width or enable overflow scrolling, and the CLI code blocks were not keyboard focusable.
- **Affected code:** apps/site/src/styles/global.css, apps/site/src/pages/docs/cli.astro, and tests/e2e/documentation-keyboard-regression.spec.ts.
- **Remediation:** constrain preformatted blocks to their container, make overflow scrollable, and label/focus the CLI snippets. The Sites Worker regression verifies viewport width and ArrowRight scrolling.
- **Disposition:** Fixed and verified in the clean-container browser run; public review verification remains open.

### AUD-316 — Workbench project title collapsed out of the mobile toolbar

- **Evidence:** quality/evidence/step-44/sites-workbench-before-430.png shows the title visually missing at 430×844 while its button remains in the accessibility tree. The after capture quality/evidence/step-44/sites-workbench-after-430.png shows the title and Local Saved state.
- **Reproduction:** Open /workbench at 430×844 and inspect the top toolbar. Before the fix, the title button had no visible width.
- **Root cause:** the identity/save toolbar cluster used flex-1 at narrow widths and competed with mode/action groups in the same row.
- **Affected code:** packages/workbench/src/components/TopToolbar.tsx and tests/e2e/responsive-hardening-step-36.spec.ts.
- **Remediation:** place the identity/save cluster on a full-width row below the mobile breakpoint. The Sites Worker regression verifies project identity and save status at 360px and 430px.
- **Disposition:** Fixed and verified in the clean-container browser run; public review verification remains open.

### AUD-317 — Homepage composer default brief describes an unrelated finance product

- **Severity:** High; first-run product/content coherence.
- **Evidence:** `quality/evidence/step-45/pre-rc-public-browser.json` and desktop/mobile screenshots show the v20 default brief in a clean browser context with empty localStorage. It describes an AI market-intelligence product for procurement teams.
- **Reproduction:** Open the public homepage in a clean context at 1440×900 or 390×844 and inspect the product brief before editing it.
- **Root cause:** `HeroComposer` initialized its controlled state with a stale market-intelligence/procurement brief.
- **Affected code:** `apps/site/src/components/home/HeroComposer.tsx`, `tests/e2e/home-default-brief-truthfulness.spec.ts`, and `tests/e2e/home-performance-step-38.spec.ts`.
- **Remediation:** Use a coherent employee-experience example as the default and share the same brief with the HR preset.
- **Verification:** The new browser regression failed against the old value, then passed for desktop, mobile, and Sites Worker profiles after the change. Public review verification remains pending.

### AUD-318 — Homepage composer fields lack stable form identity attributes

- **Severity:** Low; browser form semantics and autofill.
- **Evidence:** The Site v20 clean-context capture records six homepage inputs, textarea, or select fields without an `id` or `name` attribute; each retained an accessible name, and no console or network errors were observed. See `quality/evidence/step-45/pre-rc-public-browser.json`.
- **Reproduction:** Inspect the homepage input, textarea, and select elements in a clean browser context at 1440×900 or 390×844.
- **Root cause:** The published `HeroComposer` markup omitted stable form identities.
- **Affected code:** `apps/site/src/components/home/HeroComposer.tsx` and `tests/e2e/home-performance-step-38.spec.ts`.
- **Remediation:** Add stable IDs and names to the controlled fields.
- **Verification:** Local browser tests pass with IDs/names in place. The current fields already have accessible names, so this is limited to browser form semantics and autofill. Public review verification remains pending.

## LOW (continued)

### AUD-286 — Astro View Transitions allowed CSS declaration injection in an affected release

- **Evidence:** the initial dependency audit reported low [GHSA-mpr7-6m5w-76rw](https://github.com/advisories/GHSA-mpr7-6m5w-76rw) for locked `astro@7.2.8`, within the affected 7.1.0–7.3.2 range. The clean after audit is recorded in `quality/evidence/step-38/after/audit-all-20261023-post-dependency-fix.log`.
- **Reproduction:** Run `pnpm audit:dependencies` before the Astro update. It reports the advisory on `apps__site>astro`.
- **Root cause:** the lockfile selected an Astro release before transition animation values were escaped from CSS declarations.
- **Affected code:** `apps/site/package.json` and `pnpm-lock.yaml`.
- **Remediation:** update Astro to 7.4.2, which includes the 7.3.3 fix.
- **Validation:** frozen installation, production build, dependency audit, and `pnpm audit:all` pass. The final browser matrix is in progress; published review verification remains open.

## LOW (continued — 2026-10-23)

### AUD-291 — Browser favicon fallback returned 404

- **Evidence:** Network-only finding; Added a valid ICO wrapper derived from the existing favicon mark. The Sites Worker desktop/mobile response regression passes with HTTP 200 and a valid ICO header. Published review verification is pending.
- **Reproduction:** Open a public Site route in Chromium. Inspect the automatic /favicon.ico request or run tests/e2e/site-favicon.spec.ts before the fix.
- **Root cause:** The site declared and served an SVG favicon but did not provide a fallback at the conventional ICO URL requested by the browser.
- **Affected code:** `apps/site/public/favicon.ico`, `tests/e2e/site-favicon.spec.ts`.
- **Remediation:** Added a valid ICO wrapper derived from the existing favicon mark. The Sites Worker desktop/mobile response regression passes with HTTP 200 and a valid ICO header. Published review verification is pending.

### AUD-295 — Workbench command field omitted its native name

- **Evidence:** after screenshot `quality/evidence/step-24/after/employee-workbench-controls-sites-chromium.png`; Added the explicit tessellate-command name. The desktop/mobile handoff test now finds no input, textarea, or select without an id or name. Published review verification is pending.
- **Reproduction:** Compose the exact employee brief and open Direction C in Workbench. Inspect the Tessellate command input name. Run tests/e2e/compose-workbench-handoff.spec.ts before the fix.
- **Root cause:** CommandBar gave its input an accessible label but omitted native form identity.
- **Affected code:** `packages/workbench/src/components/CommandBar.tsx`, `tests/e2e/compose-workbench-handoff.spec.ts`.
- **Remediation:** Added the explicit tessellate-command name. The desktop/mobile handoff test now finds no input, textarea, or select without an id or name. Published review verification is pending.
