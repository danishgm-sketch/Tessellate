# Product hardening programme

Owner-directed programme, 2026-10-16. This governs work until release and
supersedes the historical feature-build checklist. No new major features,
export targets, model architectures, catalogue categories, labs, archetypes,
MCP product areas, marketplace systems, hosting architectures or Workbench modes.
Every change must improve reliability, usefulness or coherence of existing work.

Canonical integration candidate: `consolidation/product-hardening`. `main` remains
the protected released branch until a reviewed PR with green CI is merged.
Legacy branches are evidence/reference, never parallel sources of product truth.

## Execution order

Do not advance a checkbox merely because code exists. Record evidence and defects.

- [x] 01 Canonicalise repository — reconcile source branches, ADRs, README, PR policy.
- [x] 02 Establish green baseline — all commands below, fresh checkout, green CI.
- [x] 03 Inventory every existing feature in `CURRENT_PRODUCT_INVENTORY.md`.
- [x] 04 Classify Core / Beta / Lab, with visible labels and safe isolation. See `quality/STEP_04_EVIDENCE.md`; the reviewed DNA mutation defect is locally fixed and remains open for deployed verification at the public-RC gate.
- [x] 05 Freeze and test contracts/schemas, versions, migrations and round trips. Evidence: `quality/SCHEMA_CONTRACT_MATRIX.md` and `quality/STEP_05_EVIDENCE.md`; all 87 leaf-contract cases and repository tests pass.
- [x] 06 Certify all 324 resources; Gold requires browser evidence, not metadata. Local resource certification passed the seven-width catalogue matrix, 972-variant smoke, Gold 40 × 3-variant/seven-width matrix, Axe, keyboard, reduced-motion and state checks; see `quality/STEP_06_EVIDENCE.md`. Keep the 70 fixed findings open until public-RC deployed re-audit.
- [x] 07 Certify renderer and Workbench/preview/export semantic parity. All 40 Gold resources and 120 variants pass the local renderer parity matrix. Site v14 closed AUD-072–073 and AUD-075–078; Site v15 found an unsupported baseline Button variant in export, which was fixed and rejected in v15. Site v15 then exposed expected validation logging as a console error; Site v16 confirms the invalid ZIP is rejected with no download, console error, uncaught exception, failed request, or HTTP error. AUD-085 is locally verified in the separate Vite preview runtime. D1/R2 remain unbound. See `quality/STEP_07_EVIDENCE.md`; completion is limited to the renderer/export parity scope and does not close the broader runtime audit.
- [x] 08 Catalogue/search, including manually adjudicated real queries. Site v20 desktop/mobile verification passed the catalogue search and facet interactions, and resource-detail tabs passed the responsive and Axe checks. AUD-099 is closed; AUD-100 remains tracked for the isolated AI preview heading order. See `quality/STEP_08_EVIDENCE.md` and `audit/evidence/catalog-search-v20/`.
- [x] 09 Product interpretation — 100 adjudicated briefs across all 18 archetypes, interpreted from descriptions only. The benchmark rose from 45/100 to 100/100 cases after fixing primary-signal weighting, secondary-tag noise, blueprint metric fallback, and fiscal keyword overreach. The exact employee-experience brief now validates against its specialized audience, objective, entities, workflows and screens. See `quality/STEP_09_EVIDENCE.md` and `quality/PRODUCT_INTERPRETATION_BENCHMARK_RESULTS.json`. The deployed review Site remains v20; browser verification is still required at the RC gate.
- [x] 10 Screen planning — necessary, domain-correct, navigable mobile-aware screens. The 100-brief no-override planner benchmark, composition/build integration, all 744 unit/integration tests, production build, all 16 release gates, and the complete local Playwright command passed. Evidence: `quality/STEP_10_EVIDENCE.md`. Public review-site verification remains open for step 45.
- [x] 11 Design DNA — observable independent dimensions and interactions. Shared continuous slider mapping now preserves exact 0–100 scores in Compose/Workbench; token tests and the desktop Workbench browser journey verify rendered typography, motion and surface effects. Full tests (787), typecheck, lint, production build and `audit:all` passed; runtime evidence reports no browser errors or failed requests. Remaining catalog metadata/content-tone limits are documented for resource/showcase phases. See `quality/STEP_11_EVIDENCE.md` and `quality/evidence/design-dna/`. Public verification remains at Step 45.
- [x] 12 Directions — meaningful grammar, hierarchy, navigation and resource differences. The exact employee brief was composed through the visible UI at 1440×900; all three previews were inspected and recorded. A failing browser regression exposed Direction C's empty right pane and duplicate activity resource. The shared layout now places the data table and timeline in separate content panes, with C selecting the existing Gold Timeline resource. See `quality/STEP_12_EVIDENCE.md` and `quality/evidence/directions/`. Public review verification remains at Step 45.
- [x] 13 Compatibility — fail closed on Core capability, variant, dependency, licence, performance, and mobile constraints. Added red-to-green regressions for composition and replacement candidate selection; 798 unit/integration tests, all 16 local release gates, the production build and budgets, the complete local Playwright/Sites Worker/standalone-preview suite, both hosted validation workflows, and the hosted 16-point audit passed. Evidence: `quality/STEP_13_EVIDENCE.md`. Public review verification remains scheduled for Step 45.
- [x] 14 Composition — manually reviewed quality benchmark, separate from integrity. The 100-brief × 3-direction visible review passed at 1440 × 900, 390 × 844, and 768 × 1024 from source `fbfe17db24a076c152ac7905334437053a23d346`. All three reports capture visible Product Architecture, all 38 Design DNA fields, and zero unresolved resources or browser/network errors. Thirty contact sheets and full-size flagship captures were visually reviewed. Every direction pair differs on navigation, composition grammar, and semantic component roles across all 100 briefs. Evidence: `quality/STEP_14_EVIDENCE.md` and `quality/evidence/step-14/manual-review/current/`.
- [x] 15 Compose UX — controls, loading, invalid input, interruption and mobile. Local production-preview browser checks pass on desktop/mobile with red-to-green regressions for five input, state, and accessibility defects. Evidence: `quality/STEP_15_EVIDENCE.md` and `quality/evidence/step-15/`; deployed review verification remains at Step 45.
- [x] 16 Exact Compose → Workbench manifest handoff, including props and locks. Direction C was selected through the visible preview and compared with the Workbench manifest export at desktop and mobile widths; evidence: `quality/STEP_16_EVIDENCE.md` and `quality/evidence/step-16/after/`.
- [x] 17 Workbench fundamentals — selection, canvas, panels, keyboard, mobile. The visible Direction C journey now selects project/root, section, component and element nodes, exercises all five modes and panels, and verifies desktop/mobile navigation. It exposed and fixed resource-kind flattening and canvas selection on disabled controls; both red-to-green regressions and runtime captures are in `quality/STEP_17_EVIDENCE.md` and `quality/evidence/step-17/`. Public review verification remains at Step 45.
- [x] 18 Intent inheritance — inherited/overridden/locked/reset at available visible Workbench levels. Project-scope DNA now says Project; locks disclose snapshot persistence; reset resumes ancestor inheritance. Desktop/mobile browser evidence and local runtime reports: `quality/STEP_18_EVIDENCE.md` and `quality/evidence/step-18/`. Public review verification remains at Step 45.
- [x] 19 Individual mutations — correct changes, unique IDs, undo and export. Local browser evidence covers screen and node duplication, unique route/ID handling, sibling move, confirmed delete, lock/unlock, Gold resource replacement, accessibility/performance Beta fixes, undo/redo, and manifest export at desktop/mobile sizes. Unspecified mutation verbs and hide remain Lab; untested matrix dimensions remain FAIL. See `quality/STEP_19_EVIDENCE.md`; public review verification remains scheduled for Step 45.
- [x] 20 Structural mutations — Recompose tests divergence 20/50/70/95, preserves exact locked subtrees, and is exercised at 95% through the visible desktop/mobile Workbench with undo/redo. Surprise Me tests 20/60/90 and is exercised at 60% through the visible Workbench. The browser run exposed AUD-156: mobile action feedback was hidden outside Command; a shared polite status now remains visible on the active tab. `Rethink Structure` stays isolated as Lab until its operation contract is defined. Evidence: `quality/STEP_20_EVIDENCE.md`; public review verification remains scheduled for Step 45.
- [x] 21 History — a visible 51-edit desktop/mobile journey verifies the 50-step undo/redo window survives reload, restores exact manifests, and persists named checkpoints. It exposed AUD-157 (history discarded on reload); versioned IndexedDB snapshots, latest-state coalescing, save feedback, and bounded checkpoint restoration now pass the browser regression. Evidence: `quality/STEP_21_EVIDENCE.md`; public review verification remains scheduled for Step 45.
- [x] 22 Persistence — browser store failures, corrupt-record recovery, schema migrations, quotas, separate projects and browser-process restart. The desktop/mobile fault-injection regressions and recovery evidence pass; cross-tab conflict and offline-network dimensions remain explicitly FAIL in `quality/FEATURE_MATRIX.md`. Site confirmation remains pending for Step 45; see `quality/STEP_22_EVIDENCE.md`.
- [x] 23 React export — all 100 adjudicated briefs × three directions were exported as independent ZIPs, extracted, installed outside repository `node_modules`, built, and smoke-tested in Vite preview at desktop/mobile sizes. The regression exposed AUD-165: quoted and markup-like user copy broke built-in semantic-role TSX. JSON-encoded JSX expressions fix it; the red-to-green runtime check and 300-project report pass. Evidence: `quality/STEP_23_EVIDENCE.md`; public review verification remains pending for Step 45.
- [ ] 24 Agent handoff — final-project documents and fresh-agent continuation evaluation.
- [ ] 25 Secondary exporters — Next.js, tokens and native fidelity, Beta/Lab as warranted.
- [ ] 26 CLI — black-box installation, all commands, malformed input and Windows paths.
- [ ] 27 MCP — actual clients, GUI parity and complete compose/mutate/export journeys.
- [ ] 28 Linter — measured false positives/negatives and syntax-safe fixes.
- [ ] 29 Ingestion/patching — preserve source/business logic; explicit safety boundaries.
- [ ] 30 Registry gate — truthful independent check count and hostile submissions.
- [ ] 31 Auth/cloud — guest safety, ownership, expired sessions and sync conflicts.
- [ ] 32 Backend/inference — outages, durable leases, authorization and model evaluation.
- [ ] 33 Ten tools — useful controls, reset/output, keyboard and mobile.
- [ ] 34 Blueprints/showcases — real resources, domain-correct content, mutation/export.
- [ ] 35 Accessibility — Axe plus keyboard, screen-reader smoke, 200% zoom and contrast.
- [ ] 36 Responsive — 360/390/430/768/1024/1280/1440/1536, actual usability.
- [ ] 37 Security — previews, API, CLI/MCP, secrets, ZIP paths and source ingestion.
- [ ] 38 Performance — real workloads and regression budgets.
- [ ] 39 Language/copy — truthful natural language, no invented evidence/domain residue.
- [ ] 40 Visual refinement — preserve reference identity and product-wide coherence.
- [ ] 41 Cross-feature workflows — UI/CLI/MCP/ingestion/export agree.
- [ ] 42 Fault injection — catalogue, API, storage, auth, malformed data and ZIP failures.
- [ ] 43 Stress/scale — 1–2 hours, hundreds of operations, 3/10/30/50+ screens.
- [ ] 44 Clean-machine testing — container, clean cache, no developer secrets/modules.
- [ ] 45 Public RC — `release/v1-utility-rc1`, zero P0/P1, feature freeze.
- [ ] 46 Human usability testing — 5–10 unfamiliar participants, observed evidence.
- [ ] 47 Final coherence audit — one manifest, terminology, engine and design system.
- [ ] 48 Release — all final owner acceptance conditions and green protected main.

## Baseline exit gate

Run the exact commands in a fresh checkout. `audit:all` includes bundle checks;
when the checkout has no build output, that command must build its prerequisites.
Do not begin step 03 while this gate is red.

```sh
pnpm install --frozen-lockfile
pnpm build:catalog
pnpm typecheck
pnpm lint
pnpm test
pnpm audit:all
pnpm build
pnpm test:e2e
```

## Evidence and capability policy

Core requires tests, applicable browser/mobile/accessibility/integration coverage,
clear errors, documentation and production error handling. Beta must be visibly
labelled with known limits and safe failure. Lab must be isolated from Core and
never silently mutate production projects. Initial nominations are not certification.
The bespoke model and native exporters must not determine Core reliability.

Create `quality/FEATURE_MATRIX.md` after the baseline, covering every feature and
all owner-specified input/state/persistence/browser/accessibility/network/security
dimensions. Allowed results: PASS, FAIL, DEGRADED, NOT APPLICABLE, LAB ONLY.
Unexecuted applicable checks are FAIL (missing evidence), never presumed PASS.

Steps 05–20 are complete within their stated local scopes and evidence files.
Step 19's visible-browser checks cover screen duplicate/add, node duplicate/sibling
move/confirmed delete, lock/unlock, Gold replacement, exact undo/redo, mobile action
reachability, manifest export, and the accessibility/performance Beta suggestion
apply flow. The audit regressions verify the finding clears and the corrected values
survive schema-valid manifest export. Operations without specified, distinct
semantics are isolated as Lab. Evidence is in `quality/STEP_19_EVIDENCE.md` and
`quality/evidence/step-19/`.

Step 20 covers the 20/50/70/95 Recompose and 20/60/90 Surprise Me divergence
levels, exact locked-subtree hashes, resource resolution, duplicate IDs, and
visible UI undo/redo at desktop and mobile sizes. The mobile check found and
fixed AUD-156, where successful action feedback was mounted only inside the
Command tab. `Rethink Structure` remains Lab-only pending a distinct operation
contract. Evidence is in `quality/STEP_20_EVIDENCE.md` and
`quality/evidence/step-20/`; public review verification remains scheduled for
Step 45.

Step 21 covers the 50-step history window through visible keyboard edits,
project reload, exact undo/redo manifest comparisons, and named checkpoint
restoration at desktop and mobile sizes. It found and locally fixed AUD-157,
where the manifest persisted but the undo/redo stacks were reset on reload, and
AUD-158, where Blend could overwrite its source project's history snapshots.
The browser regression also verifies that rapid edits finish persisting before
the local history state reports Saved and that Blend and source-project histories
remain independent. Evidence is in `quality/STEP_21_EVIDENCE.md` and
`quality/evidence/step-21/`; issue-specific published Site verification remains
scheduled for Step 45.

The feature matrix keeps every untested dimension at FAIL. Public review verification
remains scheduled for Step 45; local evidence does not close a deployed finding or
certify release readiness. The audit suggestions remain Beta: browser contrast,
measured runtime performance gain, and other suggestion rules still need separate
validation.

For P0/P1 keep issue, reproduction, screenshot/log, root cause, failing regression,
fix, passing regression, deployment verification and regression protection.
Local success alone does not close a deployed defect. P0/P1 must be zero at release;
P2/P3 require explicit tracking/rationale. Tests never replace semantic/visual review.

## Flagship acceptance

Use the owner's exact 500-person employee-experience brief, entirely through UI:
homepage → Compose → three real directions → C → Workbench → onboarding/settings
overrides → dashboard KPI lock → radical recompose → replacement → Surprise Me →
undo/redo → responsive → audit → save/reload → manifest → React ZIP → clean install
→ build → real browser. Desktop and mobile, no internal store manipulation.
Also cover developer observability, luxury travel, ecommerce, scientific research
and creator/productivity. Real human usability sessions cannot be fabricated by agents.
