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
- [ ] 07 Certify renderer and Workbench/preview/export semantic parity. Local browser and standalone export checks pass; Site v11 is deployed. Keep open until CI is green and AUD-072–078 plus AUD-082/AUD-083 receive issue-specific deployed verification; see `quality/STEP_07_EVIDENCE.md`.
- [ ] 08 Catalogue/search, including manually adjudicated real queries.
- [ ] 09 Product interpretation — at least 100 adjudicated briefs, no overrides.
- [ ] 10 Screen planning — necessary, domain-correct, navigable mobile-aware screens.
- [ ] 11 Design DNA — observable independent dimensions and interactions.
- [ ] 12 Directions — meaningful grammar, hierarchy, navigation and resource differences.
- [ ] 13 Compatibility — fail closed on all hard constraints and missing candidates.
- [ ] 14 Composition — manually reviewed quality benchmark, separate from integrity.
- [ ] 15 Compose UX — controls, loading, invalid input, interruption and mobile.
- [ ] 16 Exact Compose → Workbench manifest handoff, including props and locks.
- [ ] 17 Workbench fundamentals — selection, canvas, panels, keyboard, mobile.
- [ ] 18 Intent inheritance — inherited/overridden/locked/reset at all levels.
- [ ] 19 Individual mutations — correct changes, unique IDs, undo and export.
- [ ] 20 Structural mutations — divergence, required content and exact lock preservation.
- [ ] 21 History — 50+ operations, exact undo/redo, reload and checkpoints.
- [ ] 22 Persistence — failures, corruption recovery, old data, quotas and conflicts.
- [ ] 23 React export — independent clean install/build/browser for benchmark projects.
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

Step 05 is complete locally: the nested leaf-schema and all mutation-payload
cases are exercised, and the repository test suite passes. Step 06 is the next
permitted phase; its resource certification must add real browser evidence and
must not infer Gold status from metadata alone.

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
