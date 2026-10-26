# Step 39 — Language and copy evidence

Step 39 remains in progress. The work below concerns local Sites Worker and Astro build output. None of these fixes is closed as deployed until the published review Site is audited again.

## AUD-177 — AI Prompt Hero advertised an unavailable generation service

- Severity: Medium; route /r/ai-prompt-hero.
- Before evidence: quality/evidence/step-39/before/ (the prompt hero capture is historical local evidence).
- Observed: the resource promised to generate an entire interface system, named Gemini 2.5 Flash / BYO Key, described a model picker that was absent, and exposed an enabled Synthesize Blueprint button with no action. Its first preset described a trading terminal.
- Root cause: component copy and manifest claims assumed a provider and generation workflow that were not implemented.
- Affected source: resources/sections/ai-prompt-hero, scripts/sections-batch-1.ts.
- Remediation: describe a prompt-input pattern, remove the provider and unrelated preset, label the input, and disable the action without a host callback or prompt.
- Regression: desktop and mobile tests check copy, preset input, disabled action, and zero browser/network errors. Local Sites Worker verification passes; deployed verification is pending.

## AUD-178 — Sandboxed resource previews fail in plain Astro preview

- Severity: Medium; open pending Pages-runtime verification; route /r/ai-prompt-hero.
- Evidence: quality/evidence/step-39/astro-failure/ records the blank preview and failed opaque-origin module requests from plain Astro preview.
- Root cause: plain Astro preview does not apply the static host’s scoped CORS headers for immutable JavaScript assets.
- Remediation: apps/site/public/_headers allows cross-origin requests only for /_astro/* assets. It does not weaken CSP or iframe isolation.
- Status: local Sites Worker has its own asset policy. The Cloudflare Pages runtime has not been checked, so this finding remains open.

## AUD-179 — Inline Rewrite implied generated content and a completed action

- Severity: Medium; route /r/inline-ai-rewrite.
- Evidence: corrected local screenshots and runtime JSON are in quality/evidence/step-39/after/. The earlier implementation is preserved in pre-fix-source-diff.patch. Several route files under before/ were overwritten by a successful rerun and are invalid pre-fix screenshots.
- Root cause: fixed sample text and local state appeared to be generated output and an accepted external edit.
- Affected source: resources/ai/inline-ai-rewrite, scripts/ai-batch-1.ts, scripts/ai-builder.ts.
- Remediation: label fixed examples and local preview behavior, begin idle, and use accurate local action labels and feedback.
- Verification: desktop/mobile browser checks pass with no runtime or network errors. Deployment verification is pending.

## AUD-180 — Tool timeline presented example timings and output as execution

- Severity: Medium; route /r/ai-tool-execution-timeline.
- Evidence: corrected local captures are in quality/evidence/step-39/after/. The earlier implementation is preserved in pre-fix-source-diff.patch; later files under before/ are invalid as pre-fix captures.
- Root cause: a static sample trace claimed successful search/export and measured timings without running tools.
- Affected source: resources/ai/ai-tool-execution-timeline, scripts/ai-batch-1.ts, scripts/ai-builder.ts.
- Remediation: identify trace values as sample data, remove unrelated finance content, and state that no tools or files are created.
- Verification: desktop/mobile checks pass with no browser or network errors. Deployment verification is pending.

## AUD-181 — Shared AI metadata claimed capabilities unrelated to each component

- Severity: Medium; all 20 AI resource detail routes.
- Evidence: quality/evidence/step-39/ai-generator-metadata.json preserves the shared metadata before and after. Corrected route captures are in after/; later captures under before/ are not pre-fix images.
- Root cause: scripts/ai-builder.ts applied capability boilerplate about streaming, citations, approvals, model cards, and BYO endpoints to every resource.
- Remediation: use accurate shared style descriptions and allow per-resource content requirements and notes. Six audited seeds now describe their actual behavior.
- Verification: the catalogue validates 324 resources; representative desktop/mobile detail routes show corrected metadata. Full resource-by-resource copy review and deployed verification remain open.

## AUD-182 — Chat Panel named a provider and portrayed a fixed answer as live

- Severity: Medium; route /r/ai-chat-panel.
- Evidence: corrected local screenshots and interaction JSON are in after/. The prior implementation is in pre-fix-source-diff.patch; later files under before/ are invalid as pre-fix screenshots.
- Root cause: a static sample was branded as a connected assistant.
- Remediation: remove provider branding, label the fixed sample and reply, and describe local-only behavior in the manifest and readme.
- Verification: desktop/mobile tests exercise two sends, confirm the visible latest reply, and record no browser or network errors. Deployment verification is pending.

## AUD-183 — Model Mode Switcher falsely reported credentials and model access

- Severity: Medium; route /r/ai-model-mode-switcher.
- Evidence: corrected local screenshots and interaction JSON are in after/. The prior implementation is in pre-fix-source-diff.patch; later files under before/ are invalid as pre-fix screenshots.
- Root cause: a local example selector displayed commercial model/provider claims and BYO Key Active without a connection.
- Remediation: replace provider claims with example modes and disclose that no model is connected.
- Verification: desktop/mobile keyboard tests change the selected mode and aria-pressed state. Deployment verification is pending.

## AUD-184 — Source Citations claimed unverified examples were grounded

- Severity: Medium; route /r/ai-source-citations.
- Evidence: corrected local screenshots and interaction JSON are in after/. The prior implementation is in pre-fix-source-diff.patch; later files under before/ are invalid as pre-fix screenshots.
- Root cause: invented paths and excerpts were marked Grounded and 100% Verified without retrieval.
- Remediation: label sources and excerpts as examples, disclose that no retrieval or verification occurs, and make the selection keyboard-operable.
- Verification: desktop/mobile tests select and deselect with Enter and Space. Deployment verification is pending.

## AUD-185 — Research Answer fabricated source count, confidence, and latency

- Severity: Medium; route /r/ai-research-answer.
- Evidence: corrected local screenshots and runtime JSON are in after/. The prior implementation is in pre-fix-source-diff.patch; later files under before/ are invalid as pre-fix screenshots.
- Root cause: sample copy claimed twelve documents, 98% confidence, and sub-150ms output without retrieval or measurement.
- Remediation: use a general example answer and disclose that no sources or confidence score were produced.
- Verification: desktop/mobile tests confirm the disclosure and remove the fabricated claims. Deployment verification is pending.

## AUD-186 — Chat submit and Enter did not add the typed example

- Severity: Medium; route /r/ai-chat-panel.
- Evidence: the earlier implementation is in pre-fix-source-diff.patch; corrected interaction states are in after/. The initial red-run output was not retained.
- Root cause: the isolated preview did not update the controlled input state used by submit, and Enter did not reliably reach the form handler.
- Remediation: read the current value through an input ref, bind the send button directly, and handle Enter while respecting IME composition.
- Regression: browser tests submit by button and Enter, verify both replies and cleared input, and report no browser/network errors. Deployment verification is pending.

## AUD-187 — Chat preview clipped the composer and hid the newest reply

- Severity: Medium; route /r/ai-chat-panel.
- Before evidence: quality/evidence/step-39/before/desktop/ai-chat-panel-composer-clipped.png and ai-chat-panel-latest-reply-hidden.png preserve the two observed defects.
- Root cause: the message list had no bounded scroll area and did not follow new messages.
- Remediation: bound the panel to preview height, make the message list scroll, keep the composer visible, and scroll to the latest message after updates.
- Verification: desktop/mobile regression checks keep composer and latest reply inside the iframe. Deployment verification is pending.

## AUD-188 — Model-mode options were not keyboard-operable

- Severity: Medium; route /r/ai-model-mode-switcher.
- Evidence: corrected captures are in after/; the prior pointer-only markup is in pre-fix-source-diff.patch. Other files under before/ are invalid pre-fix screenshots.
- Root cause: selectable rows were clickable div elements without keyboard semantics.
- Remediation: use buttons with aria-pressed and visible focus.
- Verification: Enter selects Long context at desktop and mobile. Deployment verification is pending.

## AUD-189 — Citation rows were not keyboard-operable

- Severity: Medium; route /r/ai-source-citations.
- Evidence: corrected captures are in after/; the prior pointer-only markup is in pre-fix-source-diff.patch. Other files under before/ are invalid pre-fix screenshots.
- Root cause: citation controls were pointer-only containers.
- Remediation: use labelled buttons with aria-pressed, focus styling, and keyboard activation.
- Verification: Enter selects and Space deselects at desktop and mobile. Deployment verification is pending.

## AUD-190 — Resource detail status looked like independent verification

- Severity: Medium; route /r/ai-chat-panel; the status template is shared across resource details.
- Before evidence: quality/evidence/step-39/before/desktop/ai-chat-panel-status-unqualified.png and the corresponding mobile image show the unqualified badge.
- Root cause: the detail page rendered ResourceManifest.status without identifying it as manifest-provided metadata. Runtime composition eligibility is separately determined by the validated Gold registry.
- Remediation: prefix the badge with Manifest status:.
- Regression: the browser test failed at both viewports before the copy change and passes at both afterward. Post-fix screenshots are in quality/evidence/step-39/after/.
- Deployment verification remains pending.

## AUD-191 — Community CTA asserted an unsupported membership count

- Severity: Medium; route /r/cta-community.
- Deployed-before evidence: desktop/mobile screenshots and browser records are in quality/evidence/step-39/deployed-before/. Both routes returned HTTP 200 and recorded zero console errors, uncaught exceptions, failed requests, or HTTP errors. The frame displayed “Join 12,000+ UI Engineers.”
- Root cause: a specific member count was hard-coded without a source; the manifest also described a member counter.
- Affected code: resources/sections/cta-community/{index.tsx,manifest.json,README.md}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: remove the unsupported count and describe the component as a contributor/repository invitation. Local desktop/mobile regression checks pass. Public redeployment verification is pending.

## AUD-192 — Community CTA actions had no destinations

- Severity: Medium; route /r/cta-community.
- Deployed-before evidence: the screenshots in quality/evidence/step-39/deployed-before/ show “Join Discord Community” and “Star on GitHub” as buttons with no handlers or destinations.
- Root cause: the component used hard-coded buttons rather than configured links.
- Affected code: resources/sections/cta-community/{index.tsx,preview.tsx,manifest.json}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: add optional guideHref and repositoryHref, configure real destinations in the preview manifest, and render an explanatory status when neither is configured. Local desktop/mobile browser checks verify the links and destination attributes. Public redeployment verification is pending.

## AUD-193 — Product preview CTA claimed unsupported adoption

- Severity: Medium; route /r/cta-product-preview.
- Deployed-before evidence: the screenshots in quality/evidence/step-39/deployed-before/ show “Join thousands of developers” without an attributable adoption measure; browser logs recorded HTTP 200 and no runtime/network errors.
- Root cause: generic social-proof text was hard-coded as a product claim.
- Affected code: resources/sections/cta-product-preview/{index.tsx,manifest.json,README.md}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: describe the Compose workflow directly and remove the adoption claim. Local desktop/mobile regression checks pass; public redeployment verification is pending.

## AUD-194 — Static sample claimed a live Workbench and verified-resource count

- Severity: Medium; route /r/cta-product-preview.
- Deployed-before evidence: the preview displayed “[Workbench Canvas Active: 324 Verified Manifests Ready]” although the frame was a static sample without a connected project.
- Root cause: illustrative placeholder text was written as live status telemetry and a certification result.
- Affected code: resources/sections/cta-product-preview/{index.tsx,manifest.json,README.md}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: identify the panel as an example Workbench preview with no connected project. Local desktop/mobile tests check for the disclosure and reject the old live-status claim. Public redeployment verification is pending.

## AUD-195 — Product preview CTA did not open Compose

- Severity: Medium; route /r/cta-product-preview.
- Deployed-before evidence: the screenshots in quality/evidence/step-39/deployed-before/ show “Open Canvas Now” as an inert button.
- Root cause: the action was a button without an href or handler.
- Affected code: resources/sections/cta-product-preview/{index.tsx,preview.tsx,manifest.json}, scripts/sections-batch-4.ts, and the Step 39 browser regression.
- Remediation and verification: use optional composeHref, configure the preview destination as /compose, and show a truthful status when none is configured. Local desktop/mobile browser checks confirm the link and destination. Public redeployment verification is pending.

## AUD-196 — Composition outcome promised a certified production result

- Severity: Medium; route /.
- Before evidence: deployed-before desktop/mobile homepage screenshots and JSON show the zero-debt, fully accessible, complete-cohesion claim; both route loads returned HTTP 200 with no browser or network errors.
- Root cause: the page described an export as a guaranteed production outcome.
- Affected code: apps/site/src/components/home/NotComponentLibrary.tsx.
- Remediation: describe export capability without guaranteeing debt, accessibility, or cohesion. The corrected copy is captured in after/ homepage full-page screenshots and text JSON.

## AUD-197 — Manifest audit was presented as runtime certification

- Severity: Medium; route /.
- Before evidence: the comparison card said the 100-point audit evaluates WCAG AA/AAA, performance, and responsive layout before export.
- Root cause: manifest scoring and browser/build verification were conflated.
- Remediation: identify the 100-point manifest rubric and state it does not certify the rendered interface. The desktop/mobile regression checks this distinction.

## AUD-198 — Workbench marketing copy overstated its scope

- Severity: Medium; route /.
- Before evidence: the deployed copy called Workbench a full deterministic operating environment and promised 100-point audits and adjective-feel mixing.
- Remediation: describe project structure and Design DNA inspection, lock-aware changes, and manifest checks before export.

## AUD-199 — Agent section claimed zero hallucinations

- Severity: Medium; route /.
- Before evidence: the deployed page used the absolute “Zero Hallucinations” guarantee.
- Remediation: explain registry-backed resource selection and visible unsupported-role diagnostics.

## AUD-200 — Agent handoff section named a nonexistent file

- Severity: Medium; route /.
- Before evidence: the page promised AGENT_HANDOFF.md. The exporter source instead emits project.tess.json, PRODUCT.md, DESIGN.md, IMPLEMENTATION.md, COMPONENTS.md, dependencies.json, and AGENT_PROMPT.md.
- Remediation: describe the files the handoff actually contains; the browser test verifies the updated description.

## AUD-201 — Compatibility score was overstated as universal automatic repair

- Severity: Medium; route /.
- Before evidence: the page said every combination was scored and DNA discrepancies were automatically resolved.
- Remediation: explain candidate ranking and keep the normalized Design DNA fit score as one signal.

## AUD-202 — Homepage promised automatic mobile substitution

- Severity: Medium; route /.
- Before evidence: the page promised that desktop tables automatically become stacked cards on mobile.
- Remediation: describe declared responsive strategies and require preview checks at the target widths.

## AUD-203 — Creator section promised universal integration

- Severity: Medium; route /.
- Before evidence: the page promised compatibility with every system, instant integration, and no CSS conflicts.
- Remediation: explain that manifests help compatible React tools inspect a resource and that target applications still require review.

## AUD-204 — Resource badge overlapped its sample label

- Severity: Medium; route /; desktop and mobile.
- Before evidence: before/desktop/homepage-resource-badge-overlap.png and before/mobile/homepage-resource-badge-overlap.png show the DATA badge covering the chart’s “Sample values” label.
- Root cause: the absolute badge had no reserved space in the header row.
- Remediation: reserve space at all breakpoints; the browser test checks label/badge geometry. Corrected screenshots are in after/{desktop,mobile}/homepage-resource-mosaic.png.

## AUD-205 — Workbench toolbar overlapped at mobile width

- Severity: Medium; route /; 390x844.
- Before evidence: before/mobile/homepage-workbench-header-overlap.png.
- Root cause: a fixed-height desktop toolbar was forced into one row on mobile.
- Remediation: allow the toolbar to grow and stack status beneath the title. The browser test checks non-overlapping bounding boxes. The corrected capture and geometry JSON are after/mobile/homepage-workbench-example.png and .json.

## AUD-206 — Final CTA promised an unmeasured completion time

- Severity: Medium; route /.
- Before evidence: the deployed page said “Start composing in seconds.”
- Remediation: replace it with “Start with a product brief.” Local browser regressions reject the unsupported time claim.

## AUD-207–210 — Section Planner truthfulness and action labels

- Severity: AUD-207–209 Medium; AUD-210 Low; route `/tools/section-planner`.
- Deployed-before evidence: `quality/evidence/step-39/deployed-before/desktop-section-planner.{png,json}` and `mobile-section-planner.{png,json}` record five templates containing unverified feature, certification, benchmark, and integration claims; the primary action said “Export” while only copying; the counts were called telemetry; and the UI used “1 sections.” Requests returned successfully and the runtime logs recorded no console, uncaught, failed-request, or HTTP errors.
- Root causes: template copy implied product facts; a clipboard handler was mislabeled; static section counts were framed as telemetry; and count grammar always used plural.
- Affected source: `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, and browser tests in `tests/e2e/copy-quality-step-39.spec.ts` and `tests/e2e/tools-hardening.spec.ts`.
- Remediation: use sourced-details prompts, explain that the planner does not implement or certify sections, relabel the control “Copy Section Graph JSON,” rename the count panel “Section Mix Guide,” and pluralize accurately.
- Verification: the copy-quality regression selects all five archetypes, parses the actual JSON output, and checks desktop/mobile copy, with zero browser/network errors. The interaction regression reorders and adds a section, confirms the copied JSON reflects both changes, and resets the blueprint. Local Sites Worker tests pass. Screenshots and JSON after the fixes are in `quality/evidence/step-39/after/{desktop,mobile}/section-planner.{png,json}`. Public review deployment verification remains pending; all four findings stay open for deployed closure.

## AUD-211–216 — Typography Lab copy and responsive rendering

- Severity: AUD-211–213, AUD-215–216 Medium; AUD-214 Low. Route `/tools/typography`.
- Deployed-before evidence: desktop/mobile captures in `quality/evidence/step-39/deployed-before/` show an undisclosed finance ledger, the “zero cognitive strain” promise, “Status Indicator AA,” and “MEASURED METRIC.” The mobile table clipped its fourth column. Selecting Golden Ratio at 390px made the document 515px wide because the preview used a fixed 110px heading.
- Root causes: fabricated finance data and unverified claims were used as generic sample copy; calculated font sizes were described as measured telemetry; desktop-only table layout and fixed heading sizes were used at mobile widths.
- Affected code: `apps/site/src/components/tools/TypographyLab.tsx`, `tests/e2e/tools-hardening.spec.ts`, and `tests/e2e/copy-quality-step-39.spec.ts`.
- Remediation: replace ledger copy with neutral disclosed sample values, remove unsupported outcomes and AA wording, label calculated maximum sizes accurately, render labelled record cards on mobile, and generate fluid heading sizes using the same `clamp()` values in the preview and copied CSS.
- Verification: pre-fix browser regressions reproduced missing sample disclosure and missing mobile cards; the mobile fluid-scale test recorded 515px document width at a 390px viewport. The Sites Worker desktop/mobile regression now passes 2/2 at 1440x900 and 390x844, verifies the CSS output and every mobile field, records zero serious/critical Axe violations, and captures HTTP 200 with no console errors, uncaught exceptions, failed requests, or HTTP errors. Corrected screenshots and JSON are in `quality/evidence/step-39/after/{desktop,mobile}/typography-*`. Public review deployment verification remains pending; these findings are not closed.

## AUD-217–229 — Ten-tool claims, sample data, and reset state

- Deployed-before audit: all ten tool routes and `/tools` were inspected at 1440x900 and 390x844. Separate interaction captures exercise Design DNA Reset Baseline at both widths. The 24 deployed evidence files report HTTP 200, no console errors, uncaught exceptions, failed requests, or HTTP errors, and no Axe violations. Screenshots and JSON are under `quality/evidence/step-39/deployed-before/tools/`, `tools-hub/`, and `dna-reset/`.
- Findings: Accessibility Lab overstated its WCAG scope (AUD-217); Background Studio used fabricated telemetry and inert actions (AUD-218–219); Data Visualisation and Motion used unsupported capability or fabricated-result copy (AUD-220–221); Palette Studio overstated selected-pair contrast checks and used an undisclosed finance value (AUD-222–223); Design DNA used a telemetry label and fabricated latency/score sample (AUD-224–225); Layout Composer called a schematic a stress test (AUD-226); the shared Tools directory descriptions overstated tool behavior (AUD-227); preset descriptions promised unmeasured outcomes (AUD-228); and Reset Baseline did not restore its selected-preset state on the deployed page (AUD-229).
- Remediation: correct descriptions and metadata, use neutral disclosed samples, disable unconnected sample actions with an explanation, label the layout as a schematic preview, and reset the DNA values and selected preset together. A pre-fix browser test for reset failed; the fixed UI regression passes and saves `quality/evidence/step-39/after/desktop/dna-reset-baseline.{png,json}`.
- Local verification: the Sites Worker copy-quality suite passes 44/44 desktop/mobile cases, including the new tools hub, DNA, Layout, and sample-content checks. The separate tool browser suite passes 41 tests with 21 viewport-specific skips; all ten routes render at desktop/mobile widths, and the reset interaction passes on Astro preview. Updated copy-quality after-captures cover nine scenarios at both widths; all are HTTP 200 with zero serious/critical Axe violations, console errors, uncaught exceptions, failed requests, or HTTP errors. Detailed results are in `quality/evidence/step-39/after/{desktop,mobile}/`.
- Public review deployment is still serving the earlier copy and reset behavior. These findings remain fixed-awaiting-deployed-verification and are not closed. No Site version has been published for this hardening work.

## AUD-230–235 — CLI, MCP, and generated contribution claims

- Deployed-before evidence: `/docs/cli` and `/docs/mcp` were captured at 1440×900 and 390×844 in `quality/evidence/step-39/deployed-before/docs/{desktop,mobile}/`. Both pages returned HTTP 200 with no overflow, console errors or warnings, uncaught exceptions, failed requests, HTTP errors, or serious/critical Axe violations.
- Findings: CLI docs instructed users to install the private, unpublished package from npm (AUD-230) and made the required `validate` filename look optional (AUD-231). MCP tool metadata called lexical substring matches “the best” resources (AUD-232). The `create-resource` scaffold marked unreviewed content experimental and prefilled unsupported contributor, provenance, licensing, accessibility, responsive, and quality assertions (AUD-233); its README implied an unregistered draft could be installed (AUD-234); and its display-only root had inert focus/hover styling (AUD-235).
- Root-cause fixes: document the checkout-based CLI build and exact required argument; describe MCP recommendations as lexical candidates; generate drafts with unknown provenance, unasserted licensing, no verified widths, untested accessibility, and zero quality scores; label the scaffold unpublished; and remove the inert interaction affordances. The registry gate now rejects unknown provenance rather than treating the scaffold as publishable. Schema contracts and tests permit an empty verified-width list to mean “none verified.”
- Regression evidence: the CLI and MCP docs tests failed against the deployed baseline and pass against the local Sites Worker at both viewports (four browser cases). A built CLI was run from a clean OS temporary directory; it created and validated a draft and captured the manifest, source, README, and outputs at `quality/evidence/step-39/after/cli/draft-scaffold.json`. MCP protocol, schema, CLI, and registry-gate tests cover the changed behavior. Local browser evidence is in `quality/evidence/step-39/after/{desktop,mobile}/{cli-reference,mcp-reference}.{png,json}`.
- Disposition: AUD-230–231 remain fixed-awaiting-deployed-verification because the public Site still serves the earlier docs. AUD-232–235 are fixed and verified locally; none of these findings is closed on local evidence alone.

## Validation and scope

The focused Step 39 Sites Worker suite passes 48/48 desktop/mobile cases, including the new CLI and MCP documentation regressions. It records zero console errors, uncaught exceptions, failed requests, or HTTP errors, and zero serious/critical Axe violations on all captured tool routes. The ten-tool browser suite passes 41 checks with 21 viewport-specific skips. Design DNA Reset Baseline has a red-to-green regression. The latest Vitest suite passes 1,120 tests in 74 files; full typecheck passes across 22 packages; full lint reports zero errors and 33 existing warnings; `pnpm audit:all` passes all 16 behavioral release-gate checks, builds all 717 Astro pages and the Sites adapter, passes bundle budgets, audits all 324 licenses/provenance records, reports zero secret/security violations, and finds no dependency advisories. The latest complete E2E run passes: Astro 263 passed/105 skipped, Sites Worker 154 passed/32 skipped, and preview app 3 passed. `git diff --check` passes. Astro still emits an existing Vite chunk-size warning over 500 kB. The review Site has not been updated. Trace-based Core Web Vitals work is paused pending Chrome DevTools MCP setup; no Web Vitals result is claimed. Step 39 remains open pending the wider public product, resource metadata, and deployed re-verification.

**Evidence retention note:** a prior successful Playwright rerun overwrote some legacy resource captures under before/; those captures remain invalid as pre-fix evidence. The original AI chat clipping and resource-status screenshots remain valid. Use deployed-before/ for remote baseline evidence on AUD-191–203 and AUD-206; use the local before screenshots for AUD-204–205, captured before the responsive layout correction. CTA files under before/ are invalid; the correct deployed evidence is in deployed-before/. Tests save the corrected homepage and resource screenshots under after/. The original implementation is preserved in pre-fix-source-diff.patch. The initial red-run output for AUD-186 was not retained. No post-fix public deployment verification was performed.

## 2026-10-21 continuation — Inline AI Rewrite responsive/export parity

The Sites Worker browser check reproduced AUD-262 at `/resources/inline-ai-rewrite/`, 360×844. The preview iframe had 292px of available width; the three tone states measured 316px (Concise), 317px (Professional), and 317px (Energetic) of document scroll width. Before screenshots and JSON are in `quality/evidence/step-39/before/responsive/`. The fix makes the root shrinkable, reduces narrow-screen padding, stacks the heading and wraps tone buttons, adds `aria-pressed`, and removes an unsupported keyboard-shortcut hint. After screenshots and measurements are in `quality/evidence/step-39/after/responsive/`; all three states now measure 292px client and scroll width. The fresh run recorded HTTP 200 and zero console errors, uncaught exceptions, failed requests, or HTTP errors. The earlier baseline record contains one `net::ERR_ABORTED` Astro module request during the viewport update; it is preserved in the record, and the fresh run produced no failed request.

The shared runtime component had an embedded exporter copy. Regenerating Gold artifacts updated `packages/exporter/src/generated-gold-sources.ts` so clean standalone exports receive the same responsive source. A focused exporter fidelity regression checks the emitted component source; it passes, as do exporter typecheck, targeted ESLint, and the focused Sites Worker browser regression (1 pass, 1 mobile-project skip). The latest complete `pnpm test:e2e` run finished with no failures: Astro had 263 passes and 105 configured skips, Sites Worker had 154 passes and 32 configured skips, and the preview app had 3 passes. The 324-resource matrix and Gold accessibility/render certifications passed; the constrained-network Explore check recorded 3.745 seconds to render the first filtered preview in the full Worker run and 4.447 seconds in isolation, following one 8.845-second observation in an earlier run. The latest Vitest suite passes 1,120 tests. Public review verification remains pending, so AUD-262 stays `fixed-awaiting-deployed-verification`.

## 2026-10-21 continuation — evidence-based resource metadata and mobile status layout

### AUD-263 — Unassessed resource quality/accessibility was presented as verified

The deployed-before `/r/success-state` capture displayed a WCAG AAA label and green verification icons, while the canonical manifest inventory showed that 324 resources had inherited five true accessibility flags and 310 generic AAA targets. Only the 40 Gold resources had retained browser-certification evidence; the remaining 284 were unverified. Template quality numbers (overall 96–98, accessibility 98–99) had no assessment status or evidence but flowed into compatibility ranking and minimum-quality search filters. Deployed-before evidence is `quality/evidence/step-39/deployed-before/resource-metadata/desktop/accessibility-tab.png` and `.json`; the inventory is `quality/evidence/step-39/resource-assessment-audit.json`.

The contract now distinguishes `unassessed` from `reviewed`, and reviewed assessments require evidence references. Legacy/unassessed scores are hidden, excluded from quality filters and given neutral ranking weight. All resource builders default to unassessed with WCAG AA as a target. Non-Gold accessibility verification flags are cleared while Gold claims remain. Detail pages say “Quality assessment: Not assessed,” describe WCAG as a target, and distinguish Gold browser checks from unverified manifest claims. Schema, catalogue, compatibility, search, CLI and resource-page regressions pass. Corrected desktop/mobile runtime captures are `quality/evidence/step-39/after/{desktop,mobile}/resource-assessment.png` and `.json`.

### AUD-264 — Four accessibility status cards clipped at 390px

While visually inspecting the corrected mobile Accessibility tab, four “Not independently verified” labels were visibly clipped. The document width remained 390px, so the global overflow check missed the card-level defect. A red browser run recorded four overflowing text bounds: 146px card content widths versus 154–169px scroll widths. Evidence: `quality/evidence/step-39/before/resource-accessibility-overflow-mobile.png` and `.json`.

The root cause was a two-column grid below 768px combined with a horizontal label/status row inside each card. `ResourceTabs` now uses one column below 640px, two columns from 640px, and three from 1024px. The red-to-green regression checks card/text geometry at 360, 390, 430, 640, 768, 1024 and 1440px in both desktop and mobile Chromium profiles. All five cards fit at every width; at 390px each has 306px content width. The after screenshot and seven-width record are `quality/evidence/step-39/after/resource-accessibility-overflow-responsive.png` and `.json`. Every request returned HTTP 200, with no user-session console errors, uncaught exceptions, failed requests, HTTP errors, document overflow, or serious/critical Axe findings. Axe emits a separate CSP message when its audit instrumentation injects a temporary inline style; this is recorded separately from user-session errors.

Focused validation after these changes: the complete resource-copy Sites Worker browser file passes 22/22 desktop/mobile cases, including the seven-width card regression. Focused schema/catalogue/compatibility/search/CLI tests passed 98/98; full workspace typecheck passed across 22 packages; targeted ESLint passed; Astro built all 717 pages and the Sites Worker adapter built. The fixed Site has not been deployed, so AUD-263 and AUD-264 remain `fixed-awaiting-deployed-verification`. Chrome DevTools became available on 2026-10-23 and local cold-route traces are now recorded in `quality/evidence/step-38/after/chrome-devtools-lab.json`; field CrUX/INP and deployed Web Vitals are still unverified.

### 2026-10-21 E2E and typecheck follow-up

The full `pnpm test:e2e` matrix passed with no failures: Astro preview 263 passed / 105 skipped, Sites Worker 154 passed / 32 skipped, and the isolated preview app 3 passed. The Sites Worker suite rendered all 324 catalogue resources; Gold variant/accessibility, CSP isolation, seven-width responsive resource-status, copy-truthfulness and network-stress checks passed. A resource-preview test was moved from plain Astro preview into the Sites Worker suite because Astro preview does not apply the deployed `_headers` CORS policy used by opaque sandbox iframes; preview isolation and CSP were not weakened. Workbench E2E assertions now select the resource-backed `section` nodes that the composer actually creates, rather than assuming these generated screens contain component/element nodes. Full workspace `pnpm typecheck` passed across 22 packages; targeted ESLint and `git diff --check` pass. No separate product defect was added from these harness corrections. Public review deployment verification remains pending; AUD-263 and AUD-264 are fixed-awaiting-deployed-verification. Trace-based Core Web Vitals are paused pending DevTools MCP setup.

### 2026-10-21 local verification follow-up — AUD-178

The earlier blank iframe reproduction came from plain Astro preview, which does not apply the static `_headers` CORS policy. The production-oriented local Sites Worker adapter was then tested at 390×844 and 1440×900: the opaque sandboxed preview rendered `.tess-screen`, all relevant requests returned HTTP 200, and console, uncaught-exception, failed-request, and HTTP-error arrays were empty. The focused Sites Worker resource-route browser test passed. Evidence is `audit/evidence/step-06/results/canonical-resource-route.json` with screenshots under `audit/evidence/step-06/after/resource-layout/`. The adapter check does not certify the published Pages runtime; AUD-178 remains fixed-awaiting-deployed-verification until Step 45.

### 2026-10-21 continuation — AUD-269 mobile homepage filter hydration

The first complete local `pnpm test:e2e` run exposed a dropped tap on `/` at 390×844: the `data` filter stayed `aria-pressed=false` through 14 retries. The catalogue control was server-rendered but the `CatalogueMosaic` Astro island used `client:visible`, so its event handler was not ready when the button became visible. Changing the island to `client:load` fixed the first-tap behavior. This adds no new dependency; the production homepage bundle remains within its 150 KB gzip budget (99.09 KB).

The filter regression now checks the before/after ARIA state, that only the selected filter has selected styling, the final computed foreground/background colors after the transition, and that the result list contains only the Area Chart. Fresh desktop and mobile captures and runtime details are in `quality/evidence/step-39/after/{desktop,mobile}/homepage-resource-filter.{png,json}` (with `-before` and `-selected` screenshot names). The selected mobile screenshot was visually checked: Data is the only dark pill. Both focused Sites Worker cases pass; browser records show no console errors, uncaught exceptions, failed requests, or HTTP errors. The full local E2E run after the runtime fix passed 433 checks with 134 configured skips: Astro 263 passed/101 skipped, Sites Worker 167 passed/33 skipped, and preview app 3 passed. Public review verification remains pending, so AUD-269 is fixed-awaiting-deployed-verification.

### 2026-10-23 continuation — AUD-283 Section Planner hydration

A 100-run repeat of the Sites Worker mobile preset interaction reproduced one
lost click on run 92. The rendered preset appeared active before the
`client:load` island had registered its handler, leaving the selected objective
and copied section graph unchanged. A deterministic browser regression now
holds JavaScript requests and verifies the visible loading status, disabled
controls, ready state after script release, and a successful objective/graph
update. `SectionPlanner` disables its interactive controls until its first
client effect and announces “Loading planner controls…” while disabled. The
existing preset export test and new delayed-script test pass in Sites Worker
Chromium desktop and mobile (4/4). Before evidence is
`quality/evidence/step-39/before/section-planner-mobile-one-of-100-lost-preset-click.log`;
after screenshots and machine records are in
`quality/evidence/step-39/after/section-planner-hydration-sites-{chromium,mobile-chromium}.{png,json}`.
The finding is AUD-283 and remains pending public review verification.

The final post-dependency `pnpm test:e2e` matrix passed with 489 tests and 144
project-scoped skips: Astro preview 274/108, Sites Worker 212/36, and isolated
preview app 3/0. It includes AUD-283's hydration regression on desktop/mobile,
the full copy-truthfulness and responsive resource audit, and the Compose
progress fix; there were zero failures. The Sites Worker copy-quality suite
passes its 48 desktop/mobile cases with no runtime/network errors, horizontal
overflow, or serious/critical Axe findings. Frozen install, 324-resource
catalogue build, 22-package typecheck, 1,208 unit tests, lint, `pnpm audit:all`,
and `git diff --check` also pass. Chrome DevTools traces now provide local
interaction and route lab measurements under Step 38 evidence. CrUX field INP
and deployed performance evidence remain unavailable until the public review
version is updated and observed.

### 2026-10-23 continuation — AUD-297 metrics copy truthfulness

The deployed before captures at 1440×900 and 390×844 in
`quality/evidence/step-39/before/customer-metrics-copy-deployed-before-{desktop,mobile}.{png,json}`
show the detail page describing uptime, volume, latency, and scale despite a
preview containing only illustrative project, team, task, and completion
counts. Both routes returned HTTP 200 with no browser errors, failed requests,
or horizontal overflow. The metadata and README now describe those actual
values, warn that the defaults are examples, and avoid implying unmeasured
customer or infrastructure outcomes. The regression failed on desktop and
mobile before the content fix; after rebuilding the Astro output and Sites Worker static asset, both cases
pass. Screenshots and runtime evidence are in
`quality/evidence/step-39/after/customer-metrics-copy-{desktop,mobile}.{png,json}`
with matching preview screenshots. Both runs return HTTP 200 with no console
errors or warnings, uncaught exceptions, failed requests, or HTTP errors.
AUD-297 remains fixed-awaiting-deployed-verification until the public review
Site is updated.

### 2026-10-23 continuation — AUD-298/299 logo cloud truth and clipping

The deployed logo-cloud detail page presented eight real vendor names as
partner/customer wordmarks and claimed high customer-adopter volume. Its default
data had no relationship evidence or sample label. The same preview also
centered an overflowing row, clipping the first name at scrollLeft 0: the
deployed desktop trace measured `trackLeft: 24` and `firstLeft: -141.55` while
the page itself had no overflow. Before screenshots and runtime/geometry JSON
are in `quality/evidence/step-39/before/logo-cloud-marquee-deployed-before-{desktop,mobile}.{png,json}`.

Defaults now use visibly labeled “Sample Partner” names; metadata and README
explain they are placeholders and must be replaced with approved identities.
Caller-supplied names remain unlabeled. The horizontal viewport is a named,
keyboard-focusable scroll region with an intrinsic-width inner row, keeping its
first name visible while the rest remain reachable. The red-to-green Sites
Worker browser checks pass on desktop and mobile, confirming truthful labels,
zero initial clipping, pointer-scroll extent, region focus, keyboard scrolling,
and final-label reachability. After screenshots and machine-readable evidence
are in `quality/evidence/step-39/after/logo-cloud-marquee-{desktop,mobile}.{png,json}`;
both captures report zero console errors/warnings, uncaught exceptions, failed
requests, HTTP errors, or page-level overflow. AUD-298 and AUD-299 remain
fixed-awaiting-deployed-verification.

### 2026-10-23 continuation — AUD-300 homepage hydration guard

The desktop Sites Worker regression exposed a deferred-island timing gap in
the homepage Visual Spectrum demo: its server-rendered Essential button was
enabled before React attached the click handler, so a click on entry to the
section could leave the display on Elevated. The matching mobile run also
passed before the fix, so this is recorded as a desktop race rather than a
universal failure. The red capture at
`quality/evidence/step-39/before/desktop/homepage-spectrum-controls-before-hydration.{png,json}`
records HTTP 200, `buttonDisabled: false`, no preparing status, and zero
console, exception, failed-request, or HTTP errors.

The below-fold island remains deferred. It now renders all three selectors
disabled and exposes “Preparing comparison controls” until its hydration effect
enables them. The JavaScript-disabled regression verifies this safe server
state; the normal browser regression selects Essential and confirms the
`aria-pressed` state and “Level 01 · Ambition 20–35” result on desktop and
mobile. Green captures are in `quality/evidence/step-39/after/{desktop,mobile}/`.
The full post-fix E2E run passed 274 Astro, 218 Sites Worker, and 3 isolated
preview checks, with 144 project-scoped skips and no failures. `pnpm audit:all`
passed all 16 release gates, the 324-resource isolation scan, bundle budgets,
provenance/licence, secrets, and dependency audits. AUD-300 remains
fixed-awaiting-deployed-verification.

### 2026-10-23 continuation — AUD-301–304 social-proof and metrics truth

The deployed desktop/mobile resource review found three copy mismatches and
one fabricated metric display. `feature-metrics` claimed empirical benchmark
graphs and statistics while the preview asked the author to add reports;
`social-proof-hero` claimed verified customer proof while showing an example
rating and count; and `testimonial-grid` metadata called its default examples
real endorsements. The testimonial preview also hard-coded five stars on every
sample card without accepting rating data. Before screenshots and JSON are in
`quality/evidence/step-39/before/{feature-metrics,social-proof-hero,testimonial-grid}-deployed-before-{desktop,mobile}.*`.
Each route returned HTTP 200 at 1440×900 and 390×844 with no console errors or
warnings, uncaught exceptions, failed requests, HTTP errors, or horizontal
overflow.

The manifests and READMEs now describe the actual evidence-ready templates.
Social Proof Hero no longer adds a star beside its “Example rating” label.
Testimonial Grid accepts an optional 1–5 integer rating and renders it with an
accessible label only when supplied; its sample cards have no rating. The
pre-fix unit and desktop/mobile Sites Worker regressions failed on these cases;
the updated unit test passes 37/37 and the six targeted Sites Worker cases pass.
Green screenshots and machine-readable browser evidence are in
`quality/evidence/step-39/after/resource-proofs/`. The captures were visually
checked at both viewports. AUD-301–304 remain fixed-awaiting-deployed-verification
until the public review Site is updated.

### 2026-10-23 continuation — AUD-305 bounded validation and Zod advisory

The dependency gate found high advisory GHSA-mrhx-c7xc-m3w5 through the
workspace's Zod 4.6.5 resolution, while direct Zod 3 dependencies prevented a
single consistent collection-validation policy. Public collection schemas also
contained arrays without upper bounds. The regression evidence is
`quality/evidence/step-39/zod-collection-audit.json`.

Direct Zod dependencies and Better Auth's transitive resolution now use 4.6.7.
Public collection contracts have product-scale caps, API byte limits remain in
place, and the recursive project-node depth remains capped. Two hostile-input
regressions supply 25,000 malformed screens and children and verify length
rejection before per-item validation. The focused schema suite passes 144 tests,
workspace typecheck passes across 22 packages, lint has zero errors with 33
existing warnings, and the full unit suite passes 1,212 tests across 77 files.
`pnpm audit:all` passes all 16 behavioral gates, 324/324 resource-isolation
checks, the 718-page Astro build and Sites artifact, bundle budgets,
provenance/licence, security/secrets, and dependency audit. Full Playwright
passes 274 application, 224 Sites Worker, and 3 preview tests with 144
configured skips and zero failures. Captured logs and counts are recorded in
`quality/evidence/step-39/`. Public review verification remains pending.

### 2026-10-25 continuation — public v30 route and interaction follow-up

The targeted live v30 sweep captured 28 intended routes at desktop 1440×900 and
mobile 390×844 (56 route/viewport records): the homepage, Tools hub, all ten
tool routes, CLI and MCP docs, and 14 representative resource details. All 56
returned HTTP 200 with no horizontal document overflow, uncaught exceptions,
failed requests, or 4xx/5xx responses. Every page emitted the same separate
ChatGPT Sites dynamic inline-bootstrap CSP error (AUD-342); it remained blocked
and no CSP exception was added. Creators was captured at both widths in a
separate run. The machine-readable route report and screenshots are in
`quality/evidence/step-39/deployed-v30-route-audit.json` and
`quality/evidence/step-39/deployed-v30-routes/`. This is targeted Step 39
coverage, not the full public route or employee flagship audit.

The homepage Visual Spectrum control was checked in fresh public v30 sessions at
both widths. The server state was disabled with a visible preparing message;
after scrolling and hydration, selecting Experimental updated `aria-pressed`
and the displayed ambition range. This closes AUD-300. Evidence and screenshots
are in `deployed-v30-home-spectrum.json` and its recorded screenshot paths.

The same mobile capture exposed AUD-345: the illustrative preview heading was
compressed beside two status badges and wrapped to three lines. The local Sites
Worker regression failed before the fix with a 60px title box. The header now
stacks on narrow screens and wraps badges while preserving the desktop row. The
mobile regression passes, and the after screenshot was visually inspected at
`quality/evidence/step-39/after/mobile/homepage-spectrum-preview-header.png`.
The source change has not yet been verified on a published Site.

The public CTA Product Preview was exercised at 1440×900 and 390×844. On both,
START COMPOSING navigated only the opaque preview frame while the top-level page
stayed on `/r/cta-product-preview`; `/data/catalog.json` failed with
`net::ERR_FAILED` from the frame's null origin. The mobile before screenshot
and request details are in `deployed-v30-interactions.json`. This is AUD-344. The fix forwards a bounded
typed link request only after a trusted link activation. The parent validates
the expected iframe, opaque origin and resource ID, then presents an explicit
confirmation link. It does not grant top-navigation permission or change CSP.
The local Sites Worker suite passes all six detail, Explore and direct-preview
desktop/mobile cases; the confirmed top-level Compose route reaches Catalogue
ready with submission enabled. The public Site remains v30, so AUD-344 is
fixed-awaiting-deployed-verification.

The step audit now contains 345 findings: 0 Critical, 66 High, 262 Medium and
17 Low. Statuses are 40 closed after deployed verification, 212 fixed locally
and awaiting issue-specific deployment checks, 89 locally verified, 2 legacy
fixed, and 2 open (AUD-342 and AUD-343). On 2026-10-26 the full local gates
passed after these changes: frozen install, catalogue build (324 resources / 40
Gold), 22-package typecheck, lint, 1,220 unit tests (one skipped), all 16
`audit:all` gates, and the production build. The aggregate E2E run passed 316
Astro tests, 309 Sites Worker desktop/mobile tests, and 3 isolated-preview
tests (628 passed, 149 configured skips, zero failures). The public Site remains
v30, so AUD-344 and AUD-345 still await issue-specific deployed verification.

### 2026-10-26 continuation — public v32 spot verification

The owner-approved Sites v32 is now live at the existing review URL from
canonical commit `4eca97890e2d8182bcd72edfe5659997d4317c21` (Sites mirror
`5533d1082b649ec4429bb356cdc91ab3e2f2daf5`). The Home and Compose spot checks
returned HTTP 200 at 1440×900 and 390×844; Compose reached `Catalogue ready`
and fetched `/data/catalog.json` once per fresh load. The saved Workbench
project rendered without waiting for the catalogue; the Library 503/retry
flow recovered and retained the project. This closes AUD-346 after deployed
verification. Each checked public response still emits the blocked Sites
bootstrap CSP error (AUD-342), and the mobile home still clips preset 3
(AUD-351), so there were not zero browser console errors or zero visual
defects. Evidence: `quality/evidence/step-45/public-v32/`. This spot check does
not complete Step 39's copy/resource review or the full Step 45 public route,
accessibility, flagship, and standalone-export audit.

The expanded v32 route sweep captured all 26 requested product-shell routes plus
five representative details at 1440×900 and 390×844 (31 paths / 62 captures).
Every path returned HTTP 200 with no document overflow, uncaught exceptions,
failed requests, unexpected HTTP status, or visible-preview timeout. The route
records classify all 62 captures as DEGRADED because each response emits the
same blocked platform CSP script error (AUD-342). Route screenshots and the
machine record are under `quality/evidence/step-45/public-v32/routes/` and
`quality/evidence/step-45/public-v32/route-audit.json`.

This sweep also found AUD-353 on `/pages`: the Role-Based Onboarding recipe
used the phrase “interface telemetry” for persona setup. Before screenshots at
both viewports and the observed copy are in
`quality/evidence/step-45/public-v32/onboarding-copy-before.json`. A focused
composer test reproduced the bad phrase before the fix (1 failed, 6 passed),
then passed after the shared page-composition description was corrected (7/7).
The 733-page Astro production build passed; the corrected recipe rendered at
desktop and mobile with HTTP 200, no console errors, and no failed requests.
After screenshots and browser records are under
`quality/evidence/step-45/public-v32/onboarding-copy-local-after-*`. The
correction is local only; public v32 remains unchanged, so AUD-353 awaits
issue-specific deployed verification. Step 39 and the full Step 45 audit remain
in progress.

The current working tree passes the full Vitest run at bounded concurrency
(`pnpm exec vitest run --maxWorkers=4`: 1,221 passed, one configured skip),
root typecheck, ESLint, production build, and `pnpm audit:all`. The audit passed
all 16 behavioral gates, all 324 resource-isolation and licence/provenance
checks, gzip bundle budgets, and security/dependency audits. The default
parallel Vitest run had one artifact-isolation test timeout under contention;
that test passed alone and the bounded full suite passed. This is local evidence
only; no new Site version has been deployed.
