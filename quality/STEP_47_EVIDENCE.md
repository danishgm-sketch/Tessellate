# Step 47 — Final product coherence audit

**Status:** passed as a documentation and shared-contract coherence audit on
2026-10-30. This step does not certify untested feature-matrix dimensions or
claim a human usability study. The current tree was `release/v1-utility-rc1`
at `f9011a4ff8094e9ce288f63d8ade08cc5f117765` before the evidence corrections
in this commit.

## Scope and method

- Compared the current product description and capability boundaries in
  `README.md`, `docs/PRODUCT_HARDENING.md`,
  `docs/CURRENT_PRODUCT_INVENTORY.md`, `docs/CAPABILITY_TIERS.md`,
  `quality/FEATURE_MATRIX.md`, `docs/ARCHITECTURE.md`,
  `docs/DEPLOYMENT_COST.md`, and `docs/DECISIONS.md`.
- Followed package dependencies and imports for the visible Compose and
  Workbench applications, CLI, MCP, canonical schemas, DNA package,
  compatibility pipeline, and exporter.
- Compared cross-surface claims with `quality/STEP_41_EVIDENCE.md` and the
  deployed v55 machine report and screenshots documented in
  `quality/STEP_45_EVIDENCE.md`.
- Checked branch protection and the exact PR head through GitHub before
  editing: PR #5 targets `main`, requires the `validate` check, enforces
  administrators, and currently requires zero approvals. No protection was
  bypassed.

## Results

### One project contract

- `@tessellate/schemas` is the shared source for `ProjectManifest`,
  `DesignDNA`, resources, and typed mutations. Workbench persistence,
  history, mutation validation, CLI, MCP, the API, catalogue loading, and
  export/import paths consume these schemas rather than declaring competing
  project formats.
- Visible Compose, CLI compose, and MCP compose invoke the shared
  `composeProjectPipeline` from `@tessellate/compatibility`. The Workbench
  applies typed mutations and validates the resulting manifest. CLI, MCP and
  Workbench invoke `@tessellate/exporter` for supported source/export flows.
- `@tessellate/dna` owns shared presets, sliders, feel mapping and inheritance
  semantics; the UI and MCP use those shared functions and canonical schema.
- Step 41 black-box integration evidence exercised UI → Workbench → ZIP plus
  CLI/MCP validate/export; MCP DNA change → Workbench → CLI/MCP; CLI compose →
  visible Workbench import/edit/export; and MCP compose → visible Workbench
  import/edit/CLI validation. Tested project identity, screen count, and
  generated file trees matched at the tested boundaries. This is evidence for
  those fixtures and workflows, not every capability in the inventory.

### Capability and evidence language

- Core/Beta/Lab labels describe support boundaries. They are not automatically
  equivalent to certification. `quality/FEATURE_MATRIX.md` uses `FAIL` for
  dimensions lacking named feature-level evidence, not for a known runtime
  failure.
- The 324-resource catalogue and Gold 40 are distinct: Gold is a runtime
  eligibility boundary; it is not a claim that all catalogue resources have
  equivalent Core certification.
- Code ingestion/patching, native exporters, Next.js export, local semantic
  search and laptop-model inference remain bounded by the Beta/Lab disclosures
  in `docs/CAPABILITY_TIERS.md`, D-043, D-046, and the inventory. No broader
  fidelity or model-accuracy promise was found in the current README.
- The Step 03 inventory is a dated enumeration snapshot. Its older
  “runtime unverified” and “audit pending” row text must be read with later
  issue-specific evidence; the Step 45 public v55 report supersedes those
  notes only for the routes, screenshots, interactions, viewports, exports,
  and Axe scans it names. The inventory and feature matrix do not imply that
  all 158 rows or all matrix dimensions have passed.

### One deployment boundary

- The public app remains Astro with React islands; the Sites adapter packages
  its static output without replacing the canonical stack. No D1 or R2 binding
  was provisioned for v55. Browser-local project behavior remains available;
  authenticated cloud/account features that require D1/configuration and
  laptop-host inference are not available on that Site.
- README and deployment docs preserve the optional laptop Docker API/model
  boundary and the £20/month ceiling. No paid service, credential storage,
  new database, hosted inference, or security-policy exception was introduced.
- The v55 release report records public access, 31 routes at desktop/mobile,
  eight showcases at desktop/mobile, the flagship flow, eight responsive
  widths, the stated Axe scans, WebKit smoke, and independent React export.
  It records zero new findings and zero open P0/P1, while retaining 176
  Medium and 8 Low items that still await issue-specific deployed verification
  or host resolution. Those items are not reclassified as fixed here.

## Coherence defects found and corrected

1. `docs/DECISIONS.md` called D-046 the current operating authority even though
   D-042 governs the hardening freeze and D-046 is the scoped ingestion/patch
   decision. The register header now names D-042 and clarifies later decisions
   as refinements.
2. The Step 46 record and README still said unfamiliar-participant sessions
   were release-required after the owner granted a human-validation waiver.
   Both now document the narrow waiver without claiming participants or
   results. The waiver is recorded as D-064.
3. The Step 03 inventory did not point readers from historical route-level
   audit notes to the later v55 evidence. It now states which record
   supersedes those notes and preserves the limits of that re-audit.
4. The Sites adapter README called v37 its most recent complete runtime audit
   even though Step 45 had completed a broader v55 deployed audit. The adapter
   README now points to v55 and its exact evidence and preserves the distinction
   between the audited runtime and later source documentation changes.
5. The Site publication record still called v30 current, and the last dated
   continuation in the hardening plan called v50 current. The publication
   record now points to the live Sites metadata and the v55 full-audit record;
   the hardening plan identifies v55 as the latest full deployed re-audit and
   labels its older dated notes as historical checkpoints.

These were documentation/coherence defects, not runtime defects. No application
source, schemas, manifest format, component catalogue, deployment architecture,
or security policy changed in this step.

## Verification and release boundary

- Shared package imports were checked in the application/CLI/MCP source trees;
  cross-surface behavior is backed by the named Step 41 browser/integration
  evidence.
- Public behavior is backed by the v55 deployed re-audit, not inferred from
  source presence. Its evidence and explicit limitations remain unchanged.
- The v55 Sites source packages runtime code from canonical commit
  `2ffe98ac669e97f9a766acdcbe71f62c4ea14691`. A scoped Git comparison from
  that commit to pre-audit head `f9011a4ff8094e9ce288f63d8ade08cc5f117765`
  found no changes under `apps/`, `packages/`, or `resources/`; the deployed
  application code therefore matches the current source. Astro's public
  documentation routes are generated from `docs/*.md`, however, so the
  documentation corrections in this step require a new saved and deployed Site
  version after the exact source is pushed. Quality evidence under `quality/`
  is not part of those public documentation routes.
- Final release is **not yet complete**. Step 48 still requires this PR to
  merge through protected `main` after exact-head CI succeeds. No branch
  protection, reviewer, or status-check requirement was bypassed.

### Local gate rerun — 2026-10-30

- `pnpm install --frozen-lockfile`: passed, all 23 workspace projects current.
- `pnpm build:catalog`: passed, 324 resources validated and 40 Gold resources
  generated.
- `pnpm typecheck`: passed across 22 configured workspace packages.
- `pnpm lint`: passed within the configured warning cap.
- `pnpm test`: 1,224 passed, 1 configured skip, 79 files.
- `pnpm audit:all`: passed all 16 behavioral gates, 324/324 static isolation
  scans, production build (733 Astro pages), Sites Worker artifact build,
  bundle budgets, 324/324 licence/provenance/quality records, zero security
  violations, and dependency audit with no known vulnerabilities.
- `pnpm test:e2e`: 696 passed, 167 configured skips, zero failures: Astro
  desktop/mobile 353/121; Sites Worker desktop 187/6 and mobile 153/40;
  isolated preview app 3/0. Desktop Sites Worker ran the complete 324-resource
  responsive certification; the profile's Gold variant, CSP, fault-injection,
  responsive, flagship, export, and cross-surface checks passed.
- Build output retained the existing preview-app >500 kB raw chunk warning;
  gzip route budgets passed. Node emitted `NO_COLOR`/`FORCE_COLOR` environment
  warnings from Playwright processes; they did not affect test results.
- No application package or resource changed. The existing v55 deployment still
  provides the verified runtime, while its rendered decision, inventory and
  hardening documentation will remain stale until the updated source is saved
  and deployed. The Sites source checkout is prepared from the existing remote;
  it requires the corrected README, deployment record, and `docs/*.md` files
  before a new archive is built. Step 48 still needs green exact-head GitHub CI,
  publication of the docs-updated public RC, and protected merge.
