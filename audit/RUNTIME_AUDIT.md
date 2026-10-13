# Tessellate runtime audit

**Status: ACCEPTED** after a complete browser re-audit of deployed Site version 7.

Deployment: [https://tessellate-v1-review.ismayildanish-gm.chatgpt.site](https://tessellate-v1-review.ismayildanish-gm.chatgpt.site)
Deployed source: `16fc7cc67b4cd4c6a746f545bd3751709e7e5990`
Branch: `codex/e2e-production-audit`
Findings: 130 total — 5 Critical, 112 High, 12 Medium, 1 Low. 129 closed, 1 accepted, 0 open.

All required public routes returned HTTP 200 at 1440×900 and 390×844. The flagship workflow, all three actual directions, all 324 resource previews, all ten tools, the representative showcase/blueprint/resource/documentation routes, accessibility checks, keyboard navigation, and independent ZIP runtime were exercised against the deployed Site. Evidence is stored under [audit/evidence/deployed-version-7](evidence/deployed-version-7).

The only accepted residual is AUD-111: the compact Direction A card crops the complete screen, while its labelled full preview remains readable and inspectable. No Critical or High finding remains open.

## CRITICAL

### AUD-023: Employee brief inferred as analytics

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Employee experience architecture with people, teams, onboarding, engagement and policies.
- Observed: ANALYTICS model targets analysts and quantitative metrics; no onboarding screen, no people or teams.
- Reproduction:
  - Wait for catalogue ready.
  - Submit the exact employee brief, professional but playful, Refined and Inventive.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [results.json](evidence/deployed-version-7/directions/results.json)
  - [02-three-directions.png](evidence/deployed-version-7/flagship/02-three-directions.png)
- Root cause: Substring archetype detection rewards incidental dashboard/technical words; planner substitutes fixed telemetry screens and ignores recommended domain screens.
- Affected code: `packages/composer/src/archetypes.ts`, `packages/composer/src/interpreter.ts`, `packages/composer/src/planner.ts`
- Remediation: Implemented in commit d506d40dafa41227f6313d691f6ce68b5a4601ae and verified against Site version 7.
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-024: Semantically unrelated Gold resources fill required roles

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Each role resolves to a compatible working resource.
- Observed: Marketing value proposition and CTA become three-pane shells; dashboard metrics become Nav Tree / Visual Canvas / Inspector; grammar panes duplicate across all screen types.
- Reproduction:
  - Compose the employee brief.
  - Inspect each direction and Workbench screens.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [results.json](evidence/deployed-version-7/directions/results.json)
  - [02-three-directions.png](evidence/deployed-version-7/flagship/02-three-directions.png)
- Root cause: Role matching accepts grammar categories and falls back to every Gold resource; screen roles union application grammar roles irrespective of screen class.
- Affected code: `packages/compatibility/src/compose-pipeline.ts`
- Remediation: Implemented in commit d506d40dafa41227f6313d691f6ce68b5a4601ae and verified against Site version 7.
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-028: Reload silently discards project edits

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Edits, locks and local overrides survive reload.
- Observed: After recompose, replacement and Surprise, reload returns the initial manifest with no locks or edits.
- Reproduction:
  - Open Direction C.
  - Lock a section, Recompose, Replace, Surprise.
  - Export manifest.
  - Reload and export again.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [checkpoint-persists.png](evidence/deployed-version-7/supplemental/checkpoint-persists.png)
  - [05-settings-conservative.tess.json](evidence/deployed-version-7/flagship/05-settings-conservative.tess.json)
  - [06-locked-summary.tess.json](evidence/deployed-version-7/flagship/06-locked-summary.tess.json)
- Root cause: Shell loads initial localStorage snapshot; mutations are not persisted.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/persistence/storage.ts`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-029: Standalone export fails a clean build

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: ZIP installs, builds and runs without repository packages.
- Observed: npm install succeeds, npm run build fails: gradient-fill is not assignable to AreaChartVariant.
- Reproduction:
  - Replace overview header with offered area-chart.
  - Export ZIP.
  - Extract into a clean directory.
  - npm install --no-audit --no-fund; npm run build.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [standalone-build.json](evidence/deployed-version-7/flagship/standalone-build.json)
  - [standalone-runtime.json](evidence/deployed-version-7/flagship/standalone-runtime.json)
- Root cause: Replacement uses a fabricated sample catalogue with variants that do not exist in canonical resource source.
- Affected code: `packages/workbench/src/mutations/replace.ts`, `packages/exporter/src`
- Remediation: Implemented in commit d506d40dafa41227f6313d691f6ce68b5a4601ae and verified against Site version 7.
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-083: Sites asset bypass removes security response headers

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=button / 1440x900
- Expected: All page responses, particularly preview HTML, retain CSP and security headers.
- Observed: Version 2 matching asset responses contain no CSP, nosniff or Referrer-Policy; an unmatched route returns the Worker security headers.
- Reproduction:
  - GET /preview/?resource=button and inspect response headers
  - GET /__tessellate_missing_probe and compare headers
- Before evidence: [audit/evidence/deployed-version-2/instrumented/home-1440.png](evidence/deployed-version-2/instrumented/home-1440.png)
- Deployed evidence:
  - [button-1440.png](evidence/deployed-version-7/resources/button-1440.png)
  - [button-390.png](evidence/deployed-version-7/resources/button-390.png)
  - [security-headers.json](evidence/deployed-version-7/security-headers.json)
- Root cause: The Sites host serves matching assets before the Worker even with run_worker_first configured.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/sites/README.md`, `apps/sites/prepare-static.mjs`, `apps/sites/worker.ts`, `docs/DECISIONS.md`
- Remediation: fix(sites): route protected HTML through security worker on native host
- Fix commit: `6ba48a9a31c6f69c46cd0e8170e437fbc870b24e`

## HIGH

### AUD-001: Public route /components is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /components / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /components at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/components-1440.png](evidence/before/instrumented/components-1440.png)
- Deployed evidence:
  - [components-1440.png](evidence/deployed-version-7/instrumented/components-1440.png)
  - [components-390.png](evidence/deployed-version-7/instrumented/components-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-002: Public route /sections is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /sections / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /sections at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/sections-1440.png](evidence/before/instrumented/sections-1440.png)
- Deployed evidence:
  - [sections-1440.png](evidence/deployed-version-7/instrumented/sections-1440.png)
  - [sections-390.png](evidence/deployed-version-7/instrumented/sections-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-003: Public route /blocks is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /blocks / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /blocks at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/blocks-1440.png](evidence/before/instrumented/blocks-1440.png)
- Deployed evidence:
  - [blocks-1440.png](evidence/deployed-version-7/instrumented/blocks-1440.png)
  - [blocks-390.png](evidence/deployed-version-7/instrumented/blocks-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-004: Public route /pages is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /pages / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /pages at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/pages-1440.png](evidence/before/instrumented/pages-1440.png)
- Deployed evidence:
  - [pages-1440.png](evidence/deployed-version-7/instrumented/pages-1440.png)
  - [pages-390.png](evidence/deployed-version-7/instrumented/pages-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-005: Public route /effects is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /effects / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /effects at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/effects-1440.png](evidence/before/instrumented/effects-1440.png)
- Deployed evidence:
  - [effects-1440.png](evidence/deployed-version-7/instrumented/effects-1440.png)
  - [effects-390.png](evidence/deployed-version-7/instrumented/effects-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-006: Public route /motion is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /motion / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /motion at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/motion-1440.png](evidence/before/instrumented/motion-1440.png)
- Deployed evidence:
  - [motion-1440.png](evidence/deployed-version-7/instrumented/motion-1440.png)
  - [motion-390.png](evidence/deployed-version-7/instrumented/motion-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-007: Public route /backgrounds is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /backgrounds / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /backgrounds at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/backgrounds-1440.png](evidence/before/instrumented/backgrounds-1440.png)
- Deployed evidence:
  - [backgrounds-1440.png](evidence/deployed-version-7/instrumented/backgrounds-1440.png)
  - [backgrounds-390.png](evidence/deployed-version-7/instrumented/backgrounds-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-008: Public route /ai is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /ai / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /ai at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/ai-1440.png](evidence/before/instrumented/ai-1440.png)
- Deployed evidence:
  - [ai-1440.png](evidence/deployed-version-7/instrumented/ai-1440.png)
  - [ai-390.png](evidence/deployed-version-7/instrumented/ai-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-009: Public route /data is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /data / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /data at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/data-1440.png](evidence/before/instrumented/data-1440.png)
- Deployed evidence:
  - [data-1440.png](evidence/deployed-version-7/instrumented/data-1440.png)
  - [data-390.png](evidence/deployed-version-7/instrumented/data-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-010: Public route /blueprints is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /blueprints / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /blueprints at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/blueprints-1440.png](evidence/before/instrumented/blueprints-1440.png)
- Deployed evidence:
  - [blueprints-1440.png](evidence/deployed-version-7/instrumented/blueprints-1440.png)
  - [blueprints-390.png](evidence/deployed-version-7/instrumented/blueprints-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-011: Public route /collections is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /collections / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /collections at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/collections-1440.png](evidence/before/instrumented/collections-1440.png)
- Deployed evidence:
  - [collections-1440.png](evidence/deployed-version-7/instrumented/collections-1440.png)
  - [collections-390.png](evidence/deployed-version-7/instrumented/collections-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-012: Public route /about is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /about / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /about at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/about-1440.png](evidence/before/instrumented/about-1440.png)
- Deployed evidence:
  - [about-1440.png](evidence/deployed-version-7/instrumented/about-1440.png)
  - [about-390.png](evidence/deployed-version-7/instrumented/about-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-013: Public route /agents is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /agents / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /agents at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/agents-1440.png](evidence/before/instrumented/agents-1440.png)
- Deployed evidence:
  - [agents-1440.png](evidence/deployed-version-7/instrumented/agents-1440.png)
  - [agents-390.png](evidence/deployed-version-7/instrumented/agents-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-014: Public route /creators is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /creators / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /creators at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/creators-1440.png](evidence/before/instrumented/creators-1440.png)
- Deployed evidence:
  - [creators-1440.png](evidence/deployed-version-7/instrumented/creators-1440.png)
  - [creators-390.png](evidence/deployed-version-7/instrumented/creators-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-015: Public route /docs is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /docs / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /docs at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/docs-1440.png](evidence/before/instrumented/docs-1440.png)
- Deployed evidence:
  - [docs-1440.png](evidence/deployed-version-7/instrumented/docs-1440.png)
  - [docs-390.png](evidence/deployed-version-7/instrumented/docs-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-016: Public route /docs/registry is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /docs/registry / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /docs/registry at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/docs-registry-1440.png](evidence/before/instrumented/docs-registry-1440.png)
- Deployed evidence:
  - [docs-registry-1440.png](evidence/deployed-version-7/instrumented/docs-registry-1440.png)
  - [docs-registry-390.png](evidence/deployed-version-7/instrumented/docs-registry-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-017: Public route /license is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /license / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /license at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/license-1440.png](evidence/before/instrumented/license-1440.png)
- Deployed evidence:
  - [license-1440.png](evidence/deployed-version-7/instrumented/license-1440.png)
  - [license-390.png](evidence/deployed-version-7/instrumented/license-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-018: Public route /privacy is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /privacy / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /privacy at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/privacy-1440.png](evidence/before/instrumented/privacy-1440.png)
- Deployed evidence:
  - [privacy-1440.png](evidence/deployed-version-7/instrumented/privacy-1440.png)
  - [privacy-390.png](evidence/deployed-version-7/instrumented/privacy-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-019: Public route /showcase is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /showcase / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /showcase at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/showcase-1440.png](evidence/before/instrumented/showcase-1440.png)
- Deployed evidence:
  - [showcase-1440.png](evidence/deployed-version-7/instrumented/showcase-1440.png)
  - [showcase-390.png](evidence/deployed-version-7/instrumented/showcase-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-020: Public route /sponsor is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /sponsor / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /sponsor at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/sponsor-1440.png](evidence/before/instrumented/sponsor-1440.png)
- Deployed evidence:
  - [sponsor-1440.png](evidence/deployed-version-7/instrumented/sponsor-1440.png)
  - [sponsor-390.png](evidence/deployed-version-7/instrumented/sponsor-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-021: Public route /terms is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /terms / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /terms at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/terms-1440.png](evidence/before/instrumented/terms-1440.png)
- Deployed evidence:
  - [terms-1440.png](evidence/deployed-version-7/instrumented/terms-1440.png)
  - [terms-390.png](evidence/deployed-version-7/instrumented/terms-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-022: Public route /trends is missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /trends / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction:
  - Open /trends at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/trends-1440.png](evidence/before/instrumented/trends-1440.png)
- Deployed evidence:
  - [trends-1440.png](evidence/deployed-version-7/instrumented/trends-1440.png)
  - [trends-390.png](evidence/deployed-version-7/instrumented/trends-390.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-025: Generated product inherits resource demo content

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Brand, copy and sample records match the submitted objective, with sample data identified.
- Observed: Tessellate marketing text, fake testimonials and ingestion/incidents/CPU/token data appear in employee product.
- Reproduction:
  - Inspect all three direction previews.
  - Open settings and dashboard in Workbench.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [02-three-directions.png](evidence/deployed-version-7/flagship/02-three-directions.png)
- Root cause: Composition creates only a title prop, leaving domain-specific resource defaults intact.
- Affected code: `packages/compatibility/src/compose-pipeline.ts`, `resources`
- Remediation: Implemented in commit d506d40dafa41227f6313d691f6ce68b5a4601ae and verified against Site version 7.
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-026: Repeated composition overwrites project identity

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Separate briefs create separate persisted projects while explicit seeds remain deterministic.
- Observed: Every Direction C uses proj-direction-c-tessellateseedv1dirc.
- Reproduction:
  - Compose two different briefs.
  - Compare project URLs.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [02-three-directions.png](evidence/deployed-version-7/flagship/02-three-directions.png)
- Root cause: UI reuses fixed default seed as persisted project identity.
- Affected code: `apps/site/src/components/ComposeView.tsx`, `packages/compatibility/src/compose-pipeline.ts`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-027: Direction previews are too small to inspect

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Readable previews with screen navigation and distinct structural direction.
- Observed: Three tiny clipped/scaled marketing heroes conceal the rest of the product; all use same hero content.
- Reproduction:
  - Inspect all three previews at desktop and mobile.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [02-three-directions.png](evidence/deployed-version-7/flagship/02-three-directions.png)
- Root cause: Fixed miniature frame without accessible full direction preview or screen selector.
- Affected code: `apps/site/src/components/ComposeView.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-030: Replacement offers incompatible resource

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Candidates satisfy the semantic role and hard constraints using the actual Gold catalogue.
- Observed: Only area-chart is offered for entity-profile-header; no meaningful candidate preview.
- Reproduction:
  - Select overview-header.
  - Open Replace.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Hardcoded four-resource catalogue and permissive same-section-type match override semantics.
- Affected code: `packages/workbench/src/mutations/replace.ts`, `packages/workbench/src/components/replace/ReplaceDrawer.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-031: Replacement previews are synthetic drawings

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Candidate displays its actual renderer and content.
- Observed: Generic chart bars, grey rectangles or fake dollar metric replace actual candidate components.
- Reproduction:
  - Open Replace and inspect its candidates.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: ResourceVisualPreview draws mock graphics instead of canonical renderer.
- Affected code: `packages/workbench/src/components/replace/ReplaceDrawer.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-032: Compare uses unrelated financial project

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Compare targets the initial checkpoint of this exact project.
- Observed: Apex Financial Intelligence is comparison baseline for employee brief.
- Reproduction:
  - Open Direction C.
  - Click Compare.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: setManifest resets history but retains sample-project checkpoint.
- Affected code: `packages/workbench/src/store/workbench-store.ts`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-033: Blend invents a financial source direction

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Blend uses an actual saved direction of the current brief or truthfully requires one.
- Observed: Source B is a renamed sample fintech manifest with fabricated DNA.
- Reproduction:
  - Open Direction C.
  - Click Blend.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: BlendModal constructs createSampleProject rather than loading composition siblings.
- Affected code: `packages/workbench/src/components/blend/BlendModal.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-034: Toolbar modes do not open corresponding inspector

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Style, Motion and Content display the appropriate controls.
- Observed: Top mode changes but right inspector remains Intent.
- Reproduction:
  - Click each top mode after opening Workbench.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: setActiveMode only sets activeMode, not activeRightTab.
- Affected code: `packages/workbench/src/store/workbench-store.ts`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-035: Unnamed Workbench and direction controls

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Every interactive control has an accessible name.
- Observed: Axe critical button-name and label failures (7 Workbench ranges, 3 direction ranges).
- Reproduction:
  - Run unsuppressed Axe on Compose directions and Workbench.
  - Navigate controls by keyboard.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Range controls lack linked labels; layer expanders and default sample buttons lack names.
- Affected code: `packages/workbench/src/components/right-inspector`, `packages/workbench/src/components/left-panel`, `apps/site/src/components/ComposeView.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-036: Selection and lock tiles are not keyboard controls

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Keyboard users can select page/layer and toggle locks.
- Observed: Clickable div rows and lock tiles are omitted from tab order.
- Reproduction:
  - Tab through Layers and Locks inspector.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Click handlers use generic divs without keyboard semantics.
- Affected code: `packages/workbench/src/components/left-panel`, `packages/workbench/src/components/right-inspector/ConstraintsTab.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-037: Workbench mixes unreadable dark and light chrome

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Calm coherent shell with readable project title and inspector.
- Observed: Near-white title on light toolbar and mixed dark/light areas; mobile canvas begins with huge empty shell panes.
- Reproduction:
  - Open Workbench at 1440, 1024 and 390.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Dark variants apply via preference without coherent explicit theme tokens; resource shell fallback compounds unusable canvas.
- Affected code: `apps/site/src/styles/global.css`, `packages/workbench/src/components`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-038: Mobile omits primary editing controls

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Primary modes, replacement, export and viewport operations remain usable.
- Observed: Mobile Inspect includes only Intent, Style and Locks; Resource, Content, Motion and Export missing.
- Reproduction:
  - Open Workbench at 390x844.
  - Use all bottom tabs.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Separate MobileWorkbench duplicates a restricted subset of desktop controls.
- Affected code: `packages/workbench/src/components/mobile/MobileWorkbench.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-039: Audit score implies unverified accessibility

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Audit distinguishes manifest heuristics from measured runtime compliance.
- Observed: Accessibility 20/20 and responsive 15/15 despite critical and serious Axe failures.
- Reproduction:
  - Open Audit.
  - Compare with captured Axe evidence.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Audit labels heuristic checks as compliance and does not explain measurement limits.
- Affected code: `packages/workbench/src/components/audit/AuditPanel.tsx`, `packages/workbench/src/audit`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-042: Resource preview silently renders Button

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /r/area-chart / 1440x900; 390x844
- Expected: Area chart detail displays its actual chart.
- Observed: iframe shows button despite chart title and source.
- Reproduction:
  - Open /r/area-chart and inspect preview.
- Before evidence: [audit/evidence/before/instrumented/r-area-chart-1440.png](evidence/before/instrumented/r-area-chart-1440.png)
- Deployed evidence:
  - [r-area-chart-1440.png](evidence/deployed-version-7/instrumented/r-area-chart-1440.png)
  - [r-area-chart-390.png](evidence/deployed-version-7/instrumented/r-area-chart-390.png)
- Root cause: PreviewHost selects fallback component instead of full canonical registry.
- Affected code: `apps/site/src/components/PreviewHost.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-043: Use in Workbench ignores selected resource

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /r/button / 1440x900; 390x844
- Expected: Chosen resource opens in a real new or current project with that resource.
- Observed: ?resource=button loads the previous project unchanged.
- Reproduction:
  - Open /r/button.
  - Click Use in Workbench.
- Before evidence: [audit/evidence/before/instrumented/r-button-1440.png](evidence/before/instrumented/r-button-1440.png)
- Deployed evidence:
  - [r-button-1440.png](evidence/deployed-version-7/instrumented/r-button-1440.png)
  - [r-button-390.png](evidence/deployed-version-7/instrumented/r-button-390.png)
- Root cause: Workbench bootstrap ignores resource URL parameter.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-044: Header Search click opens nothing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900; 390x844
- Expected: Click opens a usable search palette, Escape closes and restores focus.
- Observed: No modal or search input appears.
- Reproduction:
  - Click header Search.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: SiteHeader mounts CommandPalette without isOpen; palette internal state starts closed.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/CommandPalette.tsx`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-046: Homepage mosaic links refer to nonexistent resources

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900; 390x844
- Expected: Every resource link resolves to its actual catalogue record.
- Observed: telemetry-chart and metric-card routes return404.
- Reproduction:
  - Click corresponding mosaic resources.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Static slug strings refer to legacy sample resources absent from324 catalogue.
- Affected code: `apps/site/src/components/home/CatalogueMosaic.tsx`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-047: Homepage claims measured perfect accessibility

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900; 390x844
- Expected: Public claims are supported and clearly distinguish illustration.
- Observed: Audit100/100 AACompliant and zero-debt accessibility appear despite captured serious failures.
- Reproduction:
  - Inspect homepage Workbench reveal.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Hardcoded demonstration score presented without qualification.
- Affected code: `apps/site/src/components/home/WorkbenchReveal.tsx`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-048: Shared muted text fails contrast

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900; 390x844
- Expected: Normal text meets WCAG AA in each theme.
- Observed: Serious Axe color-contrast failures: homepage36, Explore52, Compose56, Workbench19 nodes.
- Reproduction:
  - Run Axe without disabling contrast on all major routes.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Muted#8B8F97 and opacity reductions are too light on paper; dark/light hardcoded combinations fail.
- Affected code: `apps/site/src/styles/global.css`, `packages/ui`, `apps/site/src/components`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-049: Sites static runtime drops security headers

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900; 390x844
- Expected: Deployment preserves declared CSP, nosniff, referrer and frame policies.
- Observed: Live responses contain none of the headers specified in _headers.
- Reproduction:
  - Inspect live HTTP response headers for document and catalogue.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Sites native static hosting does not interpret Cloudflare Pages _headers.
- Affected code: `apps/sites/prepare-static.mjs`, `.openai/hosting.json`, `apps/site/public/_headers`
- Remediation: Implemented in commit 8dda28d7f9d4b33aa2c735486e70bc91ad0f5c1a and verified against Site version 7.
- Fix commit: `8dda28d7f9d4b33aa2c735486e70bc91ad0f5c1a`

### AUD-050: Library Apply does not replace a resource

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: The operation changes the actual validated project without fabricated refs or identity collisions.
- Observed: Apply KPI Metric Card changes the selected layout title to Active Metric but keeps its original resource/subtree.
- Reproduction:
  - Select a node
  - Open Library
  - Apply KPI Metric Card
  - Export the manifest
- Before evidence: [audit/evidence/before/library-apply-before.jpg](evidence/before/library-apply-before.jpg)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Hardcoded legacy library fabricates four entries; Apply calls updateNodeProps rather than a resource mutation.
- Affected code: `packages/workbench/src/components/left-panel`
- Remediation: Canonical resource replacement, unique subtree IDs and shared state checks. Local implementation is awaiting deployed re-audit.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-051: Duplicating a screen duplicates every node identity

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: The operation changes the actual validated project without fabricated refs or identity collisions.
- Observed: Export contains 77 nodes but only 67 unique node IDs after duplicating Marketing Home.
- Reproduction:
  - Open Pages
  - Duplicate Marketing Home
  - Export the manifest
  - Compare node IDs across screens
- Before evidence: [audit/evidence/before/pages-duplicate-before.jpg](evidence/before/pages-duplicate-before.jpg)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: PagesTab deep-clones the tree without allocating node IDs.
- Affected code: `packages/workbench/src/components/left-panel`
- Remediation: Canonical resource replacement, unique subtree IDs and shared state checks. Local implementation is awaiting deployed re-audit.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-052: Every palette control applies the same unrelated mutation

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: Selecting Coral Human persists that palette and changes the rendered colours.
- Observed: All 20 buttons set colourfulness to 50. No palette selection is stored, and the canvas remains unchanged.
- Reproduction:
  - Open Style inspector at project scope
  - Select Coral Human
  - Inspect the canvas
  - Export the manifest
- Before evidence: [audit/evidence/before/palette-coral-no-change-before.jpg](evidence/before/palette-coral-no-change-before.jpg)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: StyleTab uses an identical placeholder callback for every palette; normalizer ignores tokenOverrides.
- Affected code: `packages/workbench/src/components/right-inspector/StyleTab.tsx; packages/renderer/src/tokens/normalizer.ts`
- Remediation: Persist paletteId in the existing node tokenOverrides contract and resolve it throughout runtime and standalone export. Regression initially failed cobalt versus coral.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-053: Showcase handoff opens the previous unrelated project

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /showcases / 1440x900
- Expected: Inspect in Workbench loads the selected Kudos employee showcase.
- Observed: The URL requests showcase-playful-hr but Workbench displays the previous analytics project.
- Reproduction:
  - Open Showcases.
  - Select the Kudos HR example.
  - Click Inspect in Workbench.
  - Compare its name and content with the selected example.
- Before evidence: [audit/evidence/before/showcase-handoff-wrong-project-before.jpg](evidence/before/showcase-handoff-wrong-project-before.jpg)
- Deployed evidence:
  - [showcases-1440.png](evidence/deployed-version-7/instrumented/showcases-1440.png)
  - [showcases-390.png](evidence/deployed-version-7/instrumented/showcases-390.png)
- Root cause: Workbench boot reads only project query and ignores showcase query, then restores the previous local project.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `apps/site/src/components/ShowcasesGallery.tsx`
- Remediation: fix(workbench): preserve truthful editing navigation and history
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-054: Required preview props are absent from resource fixtures

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /explore / 1440x900
- Expected: Every published resource has its required preview data and functional local callbacks.
- Observed: Four loaded catalogue resource previews throw undefined array errors; other required-input primitives are affected.
- Reproduction:
  - Open Explore in the second local review build.
  - Wait for real sandboxed resource previews to mount.
  - Inspect browser exceptions and CSP console messages.
- Before evidence: [audit/evidence/local-iteration-2/instrumented/explore-1440.png](evidence/local-iteration-2/instrumented/explore-1440.png)
- Deployed evidence:
  - [explore-1440.png](evidence/deployed-version-7/instrumented/explore-1440.png)
  - [explore-390.png](evidence/deployed-version-7/instrumented/explore-390.png)
- Root cause: Resource manifest preview defaults are empty despite required TypeScript properties. The former Button fallback hid the broken contracts.
- Affected code: `resources/primitives/*/manifest.json`
- Remediation: fix(workbench): preserve truthful editing navigation and history
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-055: Dynamic resource CSS preload is blocked by the sandbox CSP

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview / 1440x900
- Expected: Actual resource chunks load under the isolated preview policy without CSP errors.
- Observed: Astro/Vite requests shared CSS through the dynamic-import preloader, but connect-src none blocks the request repeatedly.
- Reproduction:
  - Open Explore in the second local review build.
  - Wait for real sandboxed resource previews to mount.
  - Inspect browser exceptions and CSP console messages.
- Before evidence: [audit/evidence/local-iteration-2/instrumented/r-button-1440.png](evidence/local-iteration-2/instrumented/r-button-1440.png)
- Deployed evidence:
  - [button-1440.png](evidence/deployed-version-7/resources/button-1440.png)
  - [button-390.png](evidence/deployed-version-7/resources/button-390.png)
- Root cause: CSS chunk splitting introduces a fetch-based preload. A single canonical stylesheet avoids the fetch without expanding the preview network policy.
- Affected code: `apps/site/astro.config.mjs`
- Remediation: fix(sites): enforce isolated preview security with static asset worker
- Fix commit: `8dda28d7f9d4b33aa2c735486e70bc91ad0f5c1a`

### AUD-056: accessibility: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/accessibility / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/accessibility/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/accessibility-1440.png](evidence/before/tools/accessibility-1440.png)
- Deployed evidence:
  - [accessibility.png](evidence/deployed-version-7/tool-interactions/accessibility.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-057: accessibility: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/accessibility / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 4 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/accessibility/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/accessibility-1440.png](evidence/before/tools/accessibility-1440.png)
- Deployed evidence:
  - [accessibility.png](evidence/deployed-version-7/tool-interactions/accessibility.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-058: backgrounds: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/backgrounds / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 7 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/backgrounds/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/backgrounds-1440.png](evidence/before/tools/backgrounds-1440.png)
- Deployed evidence:
  - [backgrounds.png](evidence/deployed-version-7/tool-interactions/backgrounds.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-059: backgrounds: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/backgrounds / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 9 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/backgrounds/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/backgrounds-1440.png](evidence/before/tools/backgrounds-1440.png)
- Deployed evidence:
  - [backgrounds.png](evidence/deployed-version-7/tool-interactions/backgrounds.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-060: dataviz: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/dataviz / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/dataviz/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/dataviz-1440.png](evidence/before/tools/dataviz-1440.png)
- Deployed evidence:
  - [dataviz.png](evidence/deployed-version-7/tool-interactions/dataviz.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-061: dataviz: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/dataviz / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 3 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/dataviz/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/dataviz-1440.png](evidence/before/tools/dataviz-1440.png)
- Deployed evidence:
  - [dataviz.png](evidence/deployed-version-7/tool-interactions/dataviz.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-062: dna: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/dna / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 37 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/dna/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/dna-1440.png](evidence/before/tools/dna-1440.png)
- Deployed evidence:
  - [tools-dna-1440.png](evidence/deployed-version-7/instrumented/tools-dna-1440.png)
  - [dna.png](evidence/deployed-version-7/tool-interactions/dna.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-063: icons: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/icons / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 2 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/icons/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/icons-1440.png](evidence/before/tools/icons-1440.png)
- Deployed evidence:
  - [icons.png](evidence/deployed-version-7/tool-interactions/icons.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-064: icons: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/icons / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/icons/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/icons-1440.png](evidence/before/tools/icons-1440.png)
- Deployed evidence:
  - [icons.png](evidence/deployed-version-7/tool-interactions/icons.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-065: layout: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/layout / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/layout/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/layout-1440.png](evidence/before/tools/layout-1440.png)
- Deployed evidence:
  - [layout.png](evidence/deployed-version-7/tool-interactions/layout.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-066: layout: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/layout / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 2 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/layout/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/layout-1440.png](evidence/before/tools/layout-1440.png)
- Deployed evidence:
  - [layout.png](evidence/deployed-version-7/tool-interactions/layout.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-067: motion: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/motion / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/motion/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/motion-1440.png](evidence/before/tools/motion-1440.png)
- Deployed evidence:
  - [motion.png](evidence/deployed-version-7/tool-interactions/motion.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-068: motion: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/motion / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 6 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/motion/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/motion-1440.png](evidence/before/tools/motion-1440.png)
- Deployed evidence:
  - [motion.png](evidence/deployed-version-7/tool-interactions/motion.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-069: palette: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/palette / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 11 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/palette/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/palette-1440.png](evidence/before/tools/palette-1440.png)
- Deployed evidence:
  - [palette.png](evidence/deployed-version-7/tool-interactions/palette.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-070: palette: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/palette / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 18 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/palette/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/palette-1440.png](evidence/before/tools/palette-1440.png)
- Deployed evidence:
  - [palette.png](evidence/deployed-version-7/tool-interactions/palette.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-071: section-planner: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/section-planner / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 16 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/section-planner/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/section-planner-1440.png](evidence/before/tools/section-planner-1440.png)
- Deployed evidence:
  - [section-planner.png](evidence/deployed-version-7/tool-interactions/section-planner.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-072: section-planner: scrollable-region-focusable blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/section-planner / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 1 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/section-planner/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/section-planner-1440.png](evidence/before/tools/section-planner-1440.png)
- Deployed evidence:
  - [section-planner.png](evidence/deployed-version-7/tool-interactions/section-planner.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-073: typography: color-contrast blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/typography / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 12 offending elements, Axe impact serious.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/typography/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/typography-1440.png](evidence/before/tools/typography-1440.png)
- Deployed evidence:
  - [typography.png](evidence/deployed-version-7/tool-interactions/typography.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-074: typography: label blocks accessibility acceptance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/typography / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 1 offending elements, Axe impact critical.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/typography/.
  - Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/typography-1440.png](evidence/before/tools/typography-1440.png)
- Deployed evidence:
  - [typography.png](evidence/deployed-version-7/tool-interactions/typography.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-075: Domain binding duplicates the screen title across every dashboard section

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: The profile header, summary, activity feed and people table have distinct meaningful labels.
- Observed: The local employee dashboard repeats Team Overview for four unrelated sections.
- Reproduction:
  - Compose the exact employee brief.
  - Open Direction C and its Team Overview screen.
  - Inspect the section headings.
- Before evidence: [audit/evidence/local-iteration-4b/flagship/07-radical-recomposition.png](evidence/local-iteration-4b/flagship/07-radical-recomposition.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: New content binding used screen.name for every semantic role.
- Affected code: `packages/compatibility/src/content-bindings.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-076: Employee examples ignore the stated organisation size

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1440x900
- Expected: A 1200-person brief shows that stated size or an honest unconnected-data state.
- Observed: The real Direction C preview still shows 500 people when the brief specifies 1200.
- Reproduction:
  - Open Compose.
  - Enter the 1200-person brief from the evidence record.
  - Compose and inspect the People KPI in Direction C.
- Before evidence: [audit/evidence/local-iteration-4b/count/wrong-employee-count.png](evidence/local-iteration-4b/count/wrong-employee-count.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [02-three-directions.png](evidence/deployed-version-7/flagship/02-three-directions.png)
- Root cause: Employee content binding contained a literal 500-person organisation count.
- Affected code: `packages/compatibility/src/content-bindings.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-077: Playfulness changes manifest metadata without projecting into the resource appearance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: A local onboarding playfulness change alters the rendered interface and is inherited by its resource children.
- Observed: Changing onboarding playfulness from 0 to 100 leaves its rendered resource radius, accent and text unchanged. Screenshot pixels differ slightly due to interaction state; computed resource appearance does not.
- Reproduction:
  - Open Onboarding in Workbench.
  - Select its root in Layers.
  - Set Playfulness to 0, then 100 with the keyboard.
  - Inspect the actual wizard-content resource tokens.
- Before evidence: [audit/evidence/local-iteration-4b/feel/playfulness-100.png](evidence/local-iteration-4b/feel/playfulness-100.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: The semantic token normalizer ignored the playfulness dimension.
- Affected code: `packages/renderer/src/tokens/normalizer.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-078: Standalone screen navigation has insufficient accent contrast

- Status: CLOSED — verified on deployed version 7
- Route / viewport: standalone export / 1440x900
- Expected: The active exported screen control uses the correct contrasting semantic foreground.
- Observed: Desktop standalone Axe reports a serious contrast failure: white text on #6782FF is 3.37:1.
- Reproduction:
  - Download the actual standalone ZIP through Workbench.
  - Extract to a clean directory, install and build.
  - Run the real preview and inspect desktop accessibility and install diagnostics.
- Before evidence: [audit/evidence/local-iteration-4b/flagship/standalone-1440.png](evidence/local-iteration-4b/flagship/standalone-1440.png)
- Deployed evidence:
  - [standalone-runtime.json](evidence/deployed-version-7/flagship/standalone-runtime.json)
  - [standalone-1440.png](evidence/deployed-version-7/flagship/standalone-1440.png)
- Root cause: Generated App navigation hardcodes white instead of the semantic accent foreground.
- Affected code: `packages/exporter/src/source-tree.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Fix commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-080: React forwarded primitive exports rejected by preview loader

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=button / 1440x900
- Expected: The actual Button, Input and Icon Button render from their published source.
- Observed: The loader reports no valid React component export for React forwardRef objects.
- Reproduction:
  - Open /r/button
  - Inspect the actual preview
- Before evidence: [audit/evidence/local-iteration-5/resources/button-1440.png](evidence/local-iteration-5/resources/button-1440.png)
- Deployed evidence:
  - [button-1440.png](evidence/deployed-version-7/resources/button-1440.png)
  - [button-390.png](evidence/deployed-version-7/resources/button-390.png)
- Root cause: PreviewHost treats only JavaScript functions as React components, excluding forwardRef and memo exports.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/src/components/PreviewHost.tsx`, `resources/shells/messaging-shell/index.tsx`
- Remediation: fix(previews): support forwarded components and mobile messaging layout
- Fix commit: `b30caf328b68b087f5052ad1f586a354a97cde5b`

### AUD-084: Palette sample Execute Action control does nothing and implies a real transaction

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /tools/palette / 1440x900
- Expected: The sample control gives truthful interaction feedback or is explicitly disabled.
- Observed: Clicking Execute Action has no handler, status or effect; the sample badge also says VERIFIED without explaining what is verified.
- Reproduction:
  - Open Palette Studio
  - Click Execute Action
- Before evidence: [audit/evidence/deployed-version-2/tool-interactions/palette.png](evidence/deployed-version-2/tool-interactions/palette.png)
- Deployed evidence:
  - [palette.png](evidence/deployed-version-7/tool-interactions/palette.png)
- Root cause: The palette demonstration uses a presentation-only button without interaction state and misleading sample labels.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/sites/README.md`, `apps/sites/prepare-static.mjs`, `apps/sites/worker.ts`, `docs/DECISIONS.md`
- Remediation: fix(sites): route protected HTML through security worker on native host
- Fix commit: `6ba48a9a31c6f69c46cd0e8170e437fbc870b24e`

### AUD-085: Blend changes project identity without updating URL and reload restores previous project

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: The new blended project opens and reloads under its own identity.
- Observed: Downloaded Blend manifest has a new ID, but URL retains original Direction C; reload opens old Direction C.
- Reproduction:
  - Compose employee directions
  - Apply a real Blend
  - Export manifest and reload
- Before evidence: [audit/evidence/deployed-version-2/supplemental/blended-project.png](evidence/deployed-version-2/supplemental/blended-project.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Workbench autosave journals new manifest IDs but does not update project URL.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/components/left-panel/PagesTab.tsx`
- Remediation: fix(workbench): retain blended identity and accessible page actions
- Fix commit: `23c42bfcdf3a09ba09dcf2605a7a5b0ca33021f2`

### AUD-086: Pages screen selection nests action buttons inside a button role

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: Selection, Duplicate and Delete are independent keyboard controls.
- Observed: Axe reports nine serious nested-interactive violations in employee Pages.
- Reproduction:
  - Open employee Workbench
  - Open Pages
  - Run Axe
- Before evidence: [audit/evidence/deployed-version-2/supplemental/compare-actual-employee.png](evidence/deployed-version-2/supplemental/compare-actual-employee.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Screen row has role=button while containing duplicate/delete buttons.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/components/left-panel/PagesTab.tsx`
- Remediation: fix(workbench): retain blended identity and accessible page actions
- Fix commit: `23c42bfcdf3a09ba09dcf2605a7a5b0ca33021f2`

### AUD-087: Pages duplicate and delete controls fail touch target requirements

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900
- Expected: Page actions have adequate pointer target sizes.
- Observed: Axe reports 18 serious target-size failures; controls are only 20px.
- Reproduction:
  - Open Pages in employee Workbench
  - Inspect Duplicate/Delete target sizes
- Before evidence: [audit/evidence/deployed-version-2/supplemental/duplicate-screen.png](evidence/deployed-version-2/supplemental/duplicate-screen.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Page action buttons use 12px icons and only 4px padding.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/components/left-panel/PagesTab.tsx`
- Remediation: fix(workbench): retain blended identity and accessible page actions
- Fix commit: `23c42bfcdf3a09ba09dcf2605a7a5b0ca33021f2`

### AUD-088: Explore discards search relevance order and puts unrelated cards before an exact resource match

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /explore/?q=advanced+data+table / 1440x900
- Expected: The exact Advanced Data Table resource ranks before unrelated Activity Feed cards.
- Observed: The visible first preview is Activity Feed after searching advanced data table.
- Reproduction:
  - Open Explore
  - Search advanced data table
  - Inspect first result
- Before evidence: [audit/evidence/deployed-version-2/search-ranking-before.png](evidence/deployed-version-2/search-ranking-before.png)
- Deployed evidence:
  - [explore-1440.png](evidence/deployed-version-7/instrumented/explore-1440.png)
  - [explore-390.png](evidence/deployed-version-7/instrumented/explore-390.png)
- Root cause: Explore converts ranked Orama hits to an ID set and filters the original catalogue order, destroying relevance ordering.
- Affected code: `apps/site/src/components/ExploreView.tsx`
- Remediation: fix(search): retain canonical resource relevance ordering
- Fix commit: `af2a3e70435605e06d7190eafbf347d401df2789`

### AUD-089: Hosting edge injects bot detection that violates isolated preview CSP

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=accessibility-commitment-section / 1440x900;390x844
- Expected: Only canonical application scripts run; isolated previews make no network connections.
- Observed: Injected cdn-cgi challenge script creates an extra iframe and a CSP-blocked request on real preview pages.
- Reproduction:
  - Open an isolated preview on deployed version 3
  - Inspect console and failed requests
- Before evidence: [audit/evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png](evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png)
- Deployed evidence:
  - [accessibility-commitment-section-1440.png](evidence/deployed-version-7/resources/accessibility-commitment-section-1440.png)
  - [accessibility-commitment-section-390.png](evidence/deployed-version-7/resources/accessibility-commitment-section-390.png)
- Root cause: Hosting edge transforms HTML unless the origin declares Cache-Control no-transform.
- Affected code: `apps/sites/worker.ts`
- Remediation: Declare no-transform for HTML, preserving strict CSP without allowing challenge network requests.
- Fix commit: `c95b43527eacf4bedc32c45b31eddec6a8314b80`

### AUD-090: Accessibility resource invents certification and universal compliance

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=accessibility-commitment-section / 1440x900;390x844
- Expected: Portable example clearly states accessibility goals, not unverified certification.
- Observed: AA CERTIFIED, 100% keyboard support and universal verified contrast appear without supporting evidence.
- Reproduction:
  - Open accessibility commitment preview
  - Read badges and pillars
- Before evidence: [audit/evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png](evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png)
- Deployed evidence:
  - [accessibility-commitment-section-1440.png](evidence/deployed-version-7/resources/accessibility-commitment-section-1440.png)
  - [accessibility-commitment-section-390.png](evidence/deployed-version-7/resources/accessibility-commitment-section-390.png)
- Root cause: Hardcoded resource copy presents design targets as measured certification.
- Affected code: `resources/sections/accessibility-commitment-section/index.tsx`
- Remediation: Replace certification and universal claims with explicit design targets and integration verification guidance.
- Fix commit: `c844313604c45cfbbea0db4d15a741fcafbfc4d0`

### AUD-091: Mobile navigation overlay cannot close with Escape or contain keyboard focus

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 390x844
- Expected: Navigation overlay has dialog semantics, contains Tab focus, closes with Escape and returns focus to its toggle.
- Observed: Escape leaves aria-expanded true; the overlay lacks dialog keyboard handling.
- Reproduction:
  - Focus mobile menu toggle
  - Press Enter
  - Press Escape
- Before evidence: [audit/evidence/deployed-version-3/mobile-menu-escape-before.png](evidence/deployed-version-3/mobile-menu-escape-before.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Mobile drawer is a conditional div without the existing shared dialog focus hook.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`
- Remediation: Reuse shared focus containment and restoration hook, add dialog semantics and a truthful Close control.
- Fix commit: `6599d03435a58351d92216beaf9986d44680a02a`

### AUD-092: Homepage dark agent example inherits light muted tokens

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900;390x844
- Expected: Text on dark examples meets AA contrast.
- Observed: Muted labels measure 3.25:1 against #111217; Axe reports serious contrast failures.
- Reproduction:
  - Open homepage
  - Scroll to agent example
  - Inspect text and contrast
- Before evidence: [audit/evidence/deployed-version-4/agent-example-before-390.png](evidence/deployed-version-4/agent-example-before-390.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Dark example surface lacks the shared .dark token scope.
- Affected code: `apps/site/src/components/home/AgentsSection.tsx`
- Remediation: Apply shared dark semantic token scope, preserving global light shell tokens.
- Fix commit: `1a00169483d8b7ad72b1bf762547abbd0b5df94c`

### AUD-093: Homepage labels a noncanonical pseudo-manifest as validated schema

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900;390x844
- Expected: Example uses canonical contract fields and discloses that it is an excerpt.
- Observed: VALIDATED SCHEMA badge accompanies invented archetype and obsolete DNA fields.
- Reproduction:
  - Open homepage
  - Scroll to agent example
  - Inspect text and contrast
- Before evidence: [audit/evidence/deployed-version-4/agent-example-before-390.png](evidence/deployed-version-4/agent-example-before-390.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Static illustrative copy diverged from the canonical manifest contracts and made an unverified validation claim.
- Affected code: `apps/site/src/components/home/AgentsSection.tsx`
- Remediation: Use canonical employee manifest fields and explicitly label the incomplete example ILLUSTRATIVE EXCERPT.
- Fix commit: `1a00169483d8b7ad72b1bf762547abbd0b5df94c`

### AUD-094: 1024px public navigation clips the primary Start building control

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1024x900
- Expected: Primary controls and navigation fit intentionally at tablet/desktop breakpoints.
- Observed: Document overflows to 1088px at 1024px; Start building extends beyond the right edge.
- Reproduction:
  - Open route at stated width
  - Activate primary navigation/export control
- Before evidence: [audit/evidence/deployed-version-4/header-1024-before.png](evidence/deployed-version-4/header-1024-before.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Full desktop navigation activates at 1024px before its combined minimum width can fit.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`
- Remediation: Activate full navigation at 1280px and retain the working navigation drawer below that width.
- Fix commit: `a81ef51bcb98e6e42d862b84dbc2153c75bc8ce3`

### AUD-095: Mobile Workbench canvas intercepts Export menu taps

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 390x844
- Expected: Manifest and ZIP choices are tappable above the project canvas and fit within the screen.
- Observed: Actual export choice clicks are intercepted by the generated navigation; the popup extends past the left edge.
- Reproduction:
  - Open route at stated width
  - Activate primary navigation/export control
- Before evidence: [audit/evidence/deployed-version-4/mobile-export-before.png](evidence/deployed-version-4/mobile-export-before.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Resource navigation z-index escapes an unscoped mobile canvas and exceeds the toolbar stacking level.
- Affected code: `packages/workbench/src/components/mobile/MobileWorkbench.tsx`, `packages/workbench/src/components/TopToolbar.tsx`
- Remediation: Create a local mobile canvas stacking context and constrain the small-screen export popup to viewport gutters.
- Fix commit: `f1898713cf8ddf930f6d8770b1426fc5e2d285fc`

### AUD-096: Shared Compose header overflows at the 1024px breakpoint

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1024x900
- Expected: Shared public header fits at tablet width without clipping primary controls.
- Observed: Compose document measures 1039px at a 1024px viewport; Start building extends offscreen.
- Reproduction:
  - Open route at stated viewport
  - Inspect header or open Mobile Workbench Audit
- Before evidence: [audit/evidence/deployed-version-4/compose-header-1024-before.png](evidence/deployed-version-4/compose-header-1024-before.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [02-three-directions.png](evidence/deployed-version-7/flagship/02-three-directions.png)
- Root cause: Shared Header activates its full desktop nav at 1024px before minimum content width fits.
- Affected code: `packages/ui/src/components/header.tsx`
- Remediation: Use the intentional navigation sheet below 1280px, matching the corrected homepage header.
- Fix commit: `a81ef51bcb98e6e42d862b84dbc2153c75bc8ce3`

### AUD-097: Mobile Audit results scrolling region is not keyboard focusable

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 390x844
- Expected: Keyboard users can focus and scroll project audit diagnostics.
- Observed: Axe reports serious scrollable-region-focusable failure in the mobile Audit results.
- Reproduction:
  - Open route at stated viewport
  - Inspect header or open Mobile Workbench Audit
- Before evidence: [audit/evidence/deployed-version-4/mobile-audit-before.png](evidence/deployed-version-4/mobile-audit-before.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Scrollable results container has no focusable child when no fixes are available and lacks tabindex.
- Affected code: `packages/workbench/src/components/audit/AuditPanel.tsx`
- Remediation: Name the results region and make it focusable without altering audit content or disabling accessibility rules.
- Fix commit: `d840283be402234f08a51cdc88ba720de86459b4`

### AUD-098: Scrollable documentation code cannot receive keyboard focus

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /docs/registry / 390x844
- Expected: Keyboard users can focus and scroll long registry commands and code examples.
- Observed: Registry pre overflows at mobile width and Axe reports serious scrollable-region-focusable failure.
- Reproduction:
  - Open Registry docs at 390px
  - Tab to the overflowing command
  - Inspect keyboard access and Axe findings
- Before evidence: [audit/evidence/deployed-version-4/docs-keyboard-before.png](evidence/deployed-version-4/docs-keyboard-before.png)
- Deployed evidence:
  - [docs-registry-1440.png](evidence/deployed-version-7/instrumented/docs-registry-1440.png)
  - [docs-registry-390.png](evidence/deployed-version-7/instrumented/docs-registry-390.png)
- Root cause: Scrollable code blocks lack tabindex; the same pattern appears in Compose JSON details, resource source tabs and canonical Markdown.
- Affected code: `apps/site/src/pages/docs/registry.astro`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/astro.config.mjs`
- Remediation: Make authored code blocks focusable and add a build-time Markdown transform for pre/table keyboard access.
- Fix commit: `d840283be402234f08a51cdc88ba720de86459b4`

### AUD-100: Unverified uptime and benchmark measurements

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=customer-metrics-strip / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Resource demos present invented figures as measured or audited product evidence.
- Reproduction:
  - Open the resource preview.
  - Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/customer-metrics-strip-1440.png](evidence/deployed-version-4/resources/customer-metrics-strip-1440.png)
- Deployed evidence:
  - [customer-metrics-strip-1440.png](evidence/deployed-version-7/resources/customer-metrics-strip-1440.png)
  - [customer-metrics-strip-390.png](evidence/deployed-version-7/resources/customer-metrics-strip-390.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Fix commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-101: Invented compliance certifications

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=compliance-proof / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Resource demos claim independent certification and guaranteed compliance without evidence.
- Reproduction:
  - Open the resource preview.
  - Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/compliance-proof-1440.png](evidence/deployed-version-4/resources/compliance-proof-1440.png)
- Deployed evidence:
  - [compliance-proof-1440.png](evidence/deployed-version-7/resources/compliance-proof-1440.png)
  - [compliance-proof-390.png](evidence/deployed-version-7/resources/compliance-proof-390.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Fix commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-102: Fabricated adoption and review counts

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=social-proof-hero / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Social proof hero presents invented teams and review counts as real Tessellate adoption.
- Reproduction:
  - Open the resource preview.
  - Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/social-proof-hero-1440.png](evidence/deployed-version-4/resources/social-proof-hero-1440.png)
- Deployed evidence:
  - [social-proof-hero-1440.png](evidence/deployed-version-7/resources/social-proof-hero-1440.png)
  - [social-proof-hero-390.png](evidence/deployed-version-7/resources/social-proof-hero-390.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Fix commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-103: Fabricated customer testimonials

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=testimonial-quote / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Three testimonial layouts attribute invented endorsements to named customers.
- Reproduction:
  - Open the resource preview.
  - Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/testimonial-quote-1440.png](evidence/deployed-version-4/resources/testimonial-quote-1440.png)
- Deployed evidence:
  - [testimonial-quote-1440.png](evidence/deployed-version-7/resources/testimonial-quote-1440.png)
  - [testimonial-quote-390.png](evidence/deployed-version-7/resources/testimonial-quote-390.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Fix commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-104: Unconfigured enterprise services advertised

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=pricing-enterprise / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Enterprise template advertises VPC, R2, SOC2 attestations and dedicated support that are not configured.
- Reproduction:
  - Open the resource preview.
  - Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/pricing-enterprise-1440.png](evidence/deployed-version-4/resources/pricing-enterprise-1440.png)
- Deployed evidence:
  - [pricing-enterprise-1440.png](evidence/deployed-version-7/resources/pricing-enterprise-1440.png)
  - [pricing-enterprise-390.png](evidence/deployed-version-7/resources/pricing-enterprise-390.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Fix commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-105: Enterprise consultation button has no action

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=pricing-enterprise / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Enabled consultation button has no handler or destination.
- Reproduction:
  - Open the resource preview.
  - Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/pricing-enterprise-1440.png](evidence/deployed-version-4/resources/pricing-enterprise-1440.png)
- Deployed evidence:
  - [pricing-enterprise-1440.png](evidence/deployed-version-7/resources/pricing-enterprise-1440.png)
  - [pricing-enterprise-390.png](evidence/deployed-version-7/resources/pricing-enterprise-390.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Fix commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-106: Loaded resource previews have insufficient text and action contrast

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /explore; /preview/?resource=ai-approval-request / 1440x900; 390x844
- Expected: Visible preview labels and primary actions meet WCAG AA contrast.
- Observed: Amber action 3.19:1, warning labels 2.71:1, emerald target labels fail Axe contrast.
- Reproduction:
  - Wait for visible Explore previews to load.
  - Run Axe with iframe content included.
  - Open the accessibility commitment and approval request previews.
- Before evidence: [audit/evidence/local-v5-acceptance/responsive-keyboard/explore-1440.png](evidence/local-v5-acceptance/responsive-keyboard/explore-1440.png)
- Deployed evidence:
  - [explore-1440.png](evidence/deployed-version-7/instrumented/explore-1440.png)
  - [results.json](evidence/deployed-version-7/preview-accessibility/results.json)
- Root cause: Decorative amber and emerald shade 600 used for small text and white button labels.
- Affected code: `resources/ai/ai-approval-request/index.tsx`, `resources/sections/accessibility-commitment-section/index.tsx`
- Remediation: fix(a11y): restore contrast in loaded catalogue previews
- Fix commit: `1d5cc6ea426f5484f589287de7aa98c80dee4525`

### AUD-107: Fabricated press quotations

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=press-mentions-strip / 1440x900; 390x844
- Expected: Resource defaults describe capabilities truthfully and require evidence for claims.
- Observed: Invented Tessellate endorsements attributed to TechCrunch, Wired and The Verge.
- Reproduction:
  - Open the deployed resource preview.
  - Read the default claim.
- Before evidence: [audit/evidence/deployed-version-5/resources/press-mentions-strip-1440.png](evidence/deployed-version-5/resources/press-mentions-strip-1440.png)
- Deployed evidence:
  - [press-mentions-strip-1440.png](evidence/deployed-version-7/resources/press-mentions-strip-1440.png)
  - [press-mentions-strip-390.png](evidence/deployed-version-7/resources/press-mentions-strip-390.png)
- Root cause: Invented proof copy in resource source and fixtures.
- Affected code: `resources/sections/press-mentions-strip/index.tsx`, `resources/sections/press-mentions-strip/fixtures.ts`
- Remediation: Replace assertions with illustrative copy or explicit measurement and verification requirements.
- Fix commit: `7785a42ea78ddd2acecec7053029587e66ac5cd9`

### AUD-108: Unmeasured perfect Lighthouse score

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=feature-metrics / 1440x900; 390x844
- Expected: Resource defaults describe capabilities truthfully and require evidence for claims.
- Observed: Claims audited 100/100 desktop and mobile performance without a report.
- Reproduction:
  - Open the deployed resource preview.
  - Read the default claim.
- Before evidence: [audit/evidence/deployed-version-5/resources/feature-metrics-1440.png](evidence/deployed-version-5/resources/feature-metrics-1440.png)
- Deployed evidence:
  - [feature-metrics-1440.png](evidence/deployed-version-7/resources/feature-metrics-1440.png)
  - [feature-metrics-390.png](evidence/deployed-version-7/resources/feature-metrics-390.png)
- Root cause: Invented proof copy in resource source and fixtures.
- Affected code: `resources/sections/feature-metrics/index.tsx`, `resources/sections/feature-metrics/fixtures.ts`
- Remediation: Replace assertions with illustrative copy or explicit measurement and verification requirements.
- Fix commit: `7785a42ea78ddd2acecec7053029587e66ac5cd9`

### AUD-109: Unsupported encryption guarantee

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=security-proof / 1440x900; 390x844
- Expected: Resource defaults describe capabilities truthfully and require evidence for claims.
- Observed: Claims AES-256 end-to-end encryption, although local browser projects are not encrypted by the component.
- Reproduction:
  - Open the deployed resource preview.
  - Read the default claim.
- Before evidence: [audit/evidence/deployed-version-5/resources/security-proof-1440.png](evidence/deployed-version-5/resources/security-proof-1440.png)
- Deployed evidence:
  - [security-proof-1440.png](evidence/deployed-version-7/resources/security-proof-1440.png)
  - [security-proof-390.png](evidence/deployed-version-7/resources/security-proof-390.png)
- Root cause: Invented proof copy in resource source and fixtures.
- Affected code: `resources/sections/security-proof/index.tsx`, `resources/sections/security-proof/fixtures.ts`
- Remediation: Replace assertions with illustrative copy or explicit measurement and verification requirements.
- Fix commit: `7785a42ea78ddd2acecec7053029587e66ac5cd9`

### AUD-110: Unsupported composition performance and quality guarantees

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=split-product-hero / 1440x900; 390x844
- Expected: Resource defaults describe capabilities truthfully and require evidence for claims.
- Observed: Claims zero bundle penalty and guaranteed visual harmony without evidence.
- Reproduction:
  - Open the deployed resource preview.
  - Read the default claim.
- Before evidence: [audit/evidence/deployed-version-5/resources/split-product-hero-1440.png](evidence/deployed-version-5/resources/split-product-hero-1440.png)
- Deployed evidence:
  - [split-product-hero-1440.png](evidence/deployed-version-7/resources/split-product-hero-1440.png)
  - [split-product-hero-390.png](evidence/deployed-version-7/resources/split-product-hero-390.png)
- Root cause: Invented proof copy in resource source and fixtures.
- Affected code: `resources/sections/split-product-hero/index.tsx`, `resources/sections/split-product-hero/fixtures.ts`
- Remediation: Replace assertions with illustrative copy or explicit measurement and verification requirements.
- Fix commit: `7785a42ea78ddd2acecec7053029587e66ac5cd9`

### AUD-112: Fictitious case study is presented as a Tessellate customer result

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=case-study-spotlight / 1440x900; 390x844
- Expected: An approved customer case or a clearly marked example without unsupported metrics.
- Observed: The page names KRONOS ANALYTICS, claims 4.2x speed, 18 migrated micro-frontends, and 140-to-36 component consolidation.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=case-study-spotlight at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/case-study-spotlight-1440.png](evidence/deployed-version-5/demo-content/case-study-spotlight-1440.png)
- Deployed evidence:
  - [case-study-spotlight-1440.png](evidence/deployed-version-7/resources/case-study-spotlight-1440.png)
  - [case-study-spotlight-390.png](evidence/deployed-version-7/resources/case-study-spotlight-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [case-study-spotlight-1440.png](evidence/deployed-version-7/demo-content/case-study-spotlight-1440.png)
  - [case-study-spotlight-390.png](evidence/deployed-version-7/demo-content/case-study-spotlight-390.png)
- Root cause: The resource defaults and fixture contain invented customer, metric, and outcome copy.
- Affected code: `resources/sections/case-study-spotlight/index.tsx`, `resources/sections/case-study-spotlight/fixtures.ts`
- Remediation: Replace with explicit example copy, remove unsupported outcomes, and disable the case-study link until a destination is configured.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-113: Named customer story invents adoption and performance outcomes

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=customer-story-split / 1440x900; 390x844
- Expected: A verified customer story or an explicitly illustrative template.
- Observed: The page attributes a robotics dashboard and under-20ms delivery result to Helios Autonomous Systems after adopting Tessellate.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=customer-story-split at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/customer-story-split-1440.png](evidence/deployed-version-5/demo-content/customer-story-split-1440.png)
- Deployed evidence:
  - [customer-story-split-1440.png](evidence/deployed-version-7/resources/customer-story-split-1440.png)
  - [customer-story-split-390.png](evidence/deployed-version-7/resources/customer-story-split-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [customer-story-split-1440.png](evidence/deployed-version-7/demo-content/customer-story-split-1440.png)
  - [customer-story-split-390.png](evidence/deployed-version-7/demo-content/customer-story-split-390.png)
- Root cause: The resource defaults invent a company, testimonial-like story, and measured performance.
- Affected code: `resources/sections/customer-story-split/index.tsx`, `resources/sections/customer-story-split/fixtures.ts`
- Remediation: Use clearly labelled example copy and require a configured story destination.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-115: Executive briefing presents invented operating metrics as real

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=executive-summary-panel / 1440x900; 390x844
- Expected: Verified, connected data or clearly identified sample values.
- Observed: The default briefing reports 18.4% API growth, zero security anomalies, 100% uptime, 82% capacity, and a Q4 reservation decision without indicating sample data.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=executive-summary-panel at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/executive-summary-panel-1440.png](evidence/deployed-version-5/demo-content/executive-summary-panel-1440.png)
- Deployed evidence:
  - [executive-summary-panel-1440.png](evidence/deployed-version-7/resources/executive-summary-panel-1440.png)
  - [executive-summary-panel-390.png](evidence/deployed-version-7/resources/executive-summary-panel-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [executive-summary-panel-1440.png](evidence/deployed-version-7/demo-content/executive-summary-panel-1440.png)
  - [executive-summary-panel-390.png](evidence/deployed-version-7/demo-content/executive-summary-panel-390.png)
- Root cause: Static demo copy is styled as a current executive report, with no illustrative-data qualifier.
- Affected code: `resources/blocks/executive-summary-panel/index.tsx`
- Remediation: Label the briefing and values as illustrative and say the panel is not connected to telemetry.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-116: Service status card reports fabricated live uptime and latency

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=status-overview / 1440x900; 390x844
- Expected: Live values sourced from a monitored service, or clearly identified sample values.
- Observed: The resource reports 100% operational and fixed 1.2ms, 0.4ms, 12ms, and 3.1ms latencies as service health.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=status-overview at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/status-overview-1440.png](evidence/deployed-version-5/demo-content/status-overview-1440.png)
- Deployed evidence:
  - [status-overview-1440.png](evidence/deployed-version-7/resources/status-overview-1440.png)
  - [status-overview-390.png](evidence/deployed-version-7/resources/status-overview-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [status-overview-1440.png](evidence/deployed-version-7/demo-content/status-overview-1440.png)
  - [status-overview-390.png](evidence/deployed-version-7/demo-content/status-overview-390.png)
- Root cause: Hardcoded success states and latency values are rendered with live-status styling.
- Affected code: `resources/blocks/status-overview/index.tsx`
- Remediation: Use an example snapshot label and remove claims of live operational status.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-117: Booking selector advertises real slots but submits nowhere

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=cta-demo-booking / 1440x900; 390x844
- Expected: Real calendar availability and submission, or a truthful disabled state.
- Observed: Tomorrow availability and four time slots are enabled; clicking each and Confirm Slot leaves URL and rendered state unchanged.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=cta-demo-booking at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/cta-demo-booking-1440.png](evidence/deployed-version-5/demo-content/cta-demo-booking-1440.png)
- Deployed evidence:
  - [cta-demo-booking-1440.png](evidence/deployed-version-7/resources/cta-demo-booking-1440.png)
  - [cta-demo-booking-390.png](evidence/deployed-version-7/resources/cta-demo-booking-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [cta-demo-booking-1440.png](evidence/deployed-version-7/demo-content/cta-demo-booking-1440.png)
  - [cta-demo-booking-390.png](evidence/deployed-version-7/demo-content/cta-demo-booking-390.png)
- Root cause: Static slot buttons and confirmation have no selection state, callback, calendar integration, or disabled explanation.
- Affected code: `resources/sections/cta-demo-booking/index.tsx`
- Remediation: Label sample availability, implement selection, and disable confirmation until a caller supplies a booking handler.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-118: Upgrade prompt advertises unsupported cloud sync and a Pro tier

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=upgrade-prompt / 1440x900; 390x844
- Expected: Only configured products and destinations are advertised.
- Observed: The default card promises cloud checkpoints and unlimited collaboration under TEAM PRO; Upgrade Now is enabled but does nothing.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=upgrade-prompt at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/upgrade-prompt-1440.png](evidence/deployed-version-5/demo-content/upgrade-prompt-1440.png)
- Deployed evidence:
  - [upgrade-prompt-1440.png](evidence/deployed-version-7/resources/upgrade-prompt-1440.png)
  - [upgrade-prompt-390.png](evidence/deployed-version-7/resources/upgrade-prompt-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [upgrade-prompt-1440.png](evidence/deployed-version-7/demo-content/upgrade-prompt-1440.png)
  - [upgrade-prompt-390.png](evidence/deployed-version-7/demo-content/upgrade-prompt-390.png)
- Root cause: The static marketing resource invents a paid plan and collaboration product with an inert action.
- Affected code: `resources/blocks/upgrade-prompt/index.tsx`
- Remediation: Present a plan template, remove Tessellate subscription claims, and require an upgrade callback.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-119: Offline banner promises unconfigured secure storage and cloud sync

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=offline-state / 1440x900; 390x844
- Expected: Persistence and synchronization statements match the host application and current configuration.
- Observed: The banner guarantees secure IndexedDB storage and says cloud synchronization resumes automatically, although the review Site has no such binding or sync setup.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=offline-state at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/offline-state-1440.png](evidence/deployed-version-5/demo-content/offline-state-1440.png)
- Deployed evidence:
  - [offline-state-1440.png](evidence/deployed-version-7/resources/offline-state-1440.png)
  - [offline-state-390.png](evidence/deployed-version-7/resources/offline-state-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [offline-state-1440.png](evidence/deployed-version-7/demo-content/offline-state-1440.png)
  - [offline-state-390.png](evidence/deployed-version-7/demo-content/offline-state-390.png)
- Root cause: Generic offline-state copy assumes a particular encrypted store and automatic remote synchronization.
- Affected code: `resources/states/offline-state/index.tsx`, `resources/states/offline-state/README.md`
- Remediation: State that offline persistence depends on the host app and no remote synchronization is configured by this example.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-120: Architecture diagram misstates provisioned storage and security

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=architecture-diagram-section / 1440x900; 390x844
- Expected: Architecture diagrams distinguish optional reference services from provisioned services and measured performance.
- Observed: The diagram says the review deployment has a D1/R2 registry, encrypted checkpoints, and sub-millisecond routing. The Site has no D1 or R2 bindings.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=architecture-diagram-section at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/architecture-diagram-section-1440.png](evidence/deployed-version-5/demo-content/architecture-diagram-section-1440.png)
- Deployed evidence:
  - [architecture-diagram-section-1440.png](evidence/deployed-version-7/resources/architecture-diagram-section-1440.png)
  - [architecture-diagram-section-390.png](evidence/deployed-version-7/resources/architecture-diagram-section-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [architecture-diagram-section-1440.png](evidence/deployed-version-7/demo-content/architecture-diagram-section-1440.png)
  - [architecture-diagram-section-390.png](evidence/deployed-version-7/demo-content/architecture-diagram-section-390.png)
- Root cause: A generic reference diagram is presented as the deployed Site topology, including unsupported encryption and latency claims.
- Affected code: `resources/sections/architecture-diagram-section/index.tsx`
- Remediation: Label it optional reference architecture, disclose unprovisioned bindings, and remove security/performance assertions.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-121: Developer footer fabricates build identity and edge telemetry

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=footer-developer / 1440x900; 390x844
- Expected: Build ID, health, and latency are sourced from a real build/runtime or marked as examples.
- Observed: The footer asserts SHA c4b2a9f, 100% edge health, and 0.8ms latency without corresponding runtime data.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=footer-developer at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/footer-developer-1440.png](evidence/deployed-version-5/demo-content/footer-developer-1440.png)
- Deployed evidence:
  - [footer-developer-1440.png](evidence/deployed-version-7/resources/footer-developer-1440.png)
  - [footer-developer-390.png](evidence/deployed-version-7/resources/footer-developer-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [footer-developer-1440.png](evidence/deployed-version-7/demo-content/footer-developer-1440.png)
  - [footer-developer-390.png](evidence/deployed-version-7/demo-content/footer-developer-390.png)
- Root cause: Static placeholders are rendered as live build and edge metrics.
- Affected code: `resources/sections/footer-developer/index.tsx`, `resources/sections/footer-developer/README.md`
- Remediation: Replace pseudo telemetry with an explicit example label and request runtime-supplied values for live display.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-122: Download CTA claims an unpublished release and unsupported channels

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=cta-download / 1440x900; 390x844
- Expected: Only available, tested distribution channels and valid package versions are shown.
- Observed: The page advertises v1.0.0 as release ready and enables npm/pnpm/Homebrew install buttons; the workspace CLI package is private and the buttons do nothing.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=cta-download at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/cta-download-1440.png](evidence/deployed-version-5/demo-content/cta-download-1440.png)
- Deployed evidence:
  - [cta-download-1440.png](evidence/deployed-version-7/resources/cta-download-1440.png)
  - [cta-download-390.png](evidence/deployed-version-7/resources/cta-download-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [cta-download-1440.png](evidence/deployed-version-7/demo-content/cta-download-1440.png)
  - [cta-download-390.png](evidence/deployed-version-7/demo-content/cta-download-390.png)
- Root cause: The component assumes a public package release and renders nonfunctional buttons for unsupported installers.
- Affected code: `resources/sections/cta-download/index.tsx`, `resources/sections/cta-download/manifest.json`, `resources/sections/cta-download/README.md`
- Remediation: Remove unverified version/channel claims and provide a disabled, explained default until an install integration is supplied.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-124: Comparison table publishes unmeasured product benchmark results

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=comparison-table / 1440x900; 390x844
- Expected: Comparative data is backed by reproducible measurements or explicitly illustrative.
- Observed: The table claims Tessellate Pure is 1.2KB/0.4ms with no dependencies versus a generic alternative at 4.8KB/2.1ms/four libraries.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=comparison-table at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/comparison-table-1440.png](evidence/deployed-version-5/demo-content/comparison-table-1440.png)
- Deployed evidence:
  - [comparison-table-1440.png](evidence/deployed-version-7/resources/comparison-table-1440.png)
  - [comparison-table-390.png](evidence/deployed-version-7/resources/comparison-table-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [comparison-table-1440.png](evidence/deployed-version-7/demo-content/comparison-table-1440.png)
  - [comparison-table-390.png](evidence/deployed-version-7/demo-content/comparison-table-390.png)
- Root cause: Hardcoded benchmark values are presented as a product comparison without methodology or example context.
- Affected code: `resources/blocks/comparison-table/index.tsx`, `resources/blocks/comparison-table/README.md`
- Remediation: Rename sample columns and label the values as illustrative until measured data and methodology are provided.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-125: FAQ guarantees offline IndexedDB behavior and verified migrations

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=faq-two-column / 1440x900; 390x844
- Expected: Answers match the deployed persistence and migration behavior.
- Observed: The FAQ claims IndexedDB persistence, full offline operation, immutable resources, and verified migrations as universal behavior.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=faq-two-column at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/faq-two-column-1440.png](evidence/deployed-version-5/demo-content/faq-two-column-1440.png)
- Deployed evidence:
  - [faq-two-column-1440.png](evidence/deployed-version-7/resources/faq-two-column-1440.png)
  - [faq-two-column-390.png](evidence/deployed-version-7/resources/faq-two-column-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [faq-two-column-1440.png](evidence/deployed-version-7/demo-content/faq-two-column-1440.png)
  - [faq-two-column-390.png](evidence/deployed-version-7/demo-content/faq-two-column-390.png)
- Root cause: The canned answer describes persistence and compatibility as guarantees without qualifying host configuration or scope.
- Affected code: `resources/sections/faq-two-column/index.tsx`
- Remediation: Describe offline behavior as host-app dependent and keep migration claims limited to implemented, tested schema paths.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-126: Feature grid overstates performance, accessibility, and sync support

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=feature-grid-3x2 / 1440x900; 390x844
- Expected: Feature claims reflect measured performance, audited accessibility, and configured services.
- Observed: Defaults claim microsecond parsing, meeting WCAG 2.2 AA, and optional GitHub OAuth cloud sync without qualifications.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=feature-grid-3x2 at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/feature-grid-3x2-1440.png](evidence/deployed-version-5/demo-content/feature-grid-3x2-1440.png)
- Deployed evidence:
  - [feature-grid-3x2-1440.png](evidence/deployed-version-7/resources/feature-grid-3x2-1440.png)
  - [feature-grid-3x2-390.png](evidence/deployed-version-7/resources/feature-grid-3x2-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [feature-grid-3x2-1440.png](evidence/deployed-version-7/demo-content/feature-grid-3x2-1440.png)
  - [feature-grid-3x2-390.png](evidence/deployed-version-7/demo-content/feature-grid-3x2-390.png)
- Root cause: Marketing defaults turn targets and optional architecture into unconditional shipped-product guarantees.
- Affected code: `resources/sections/feature-grid-3x2/index.tsx`
- Remediation: Qualify targets, require implementation-specific accessibility verification, and identify sync as a separately configured capability.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-130: The disabled Compose action becomes hard to read while catalogue intelligence loads

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /compose / 1440x900
- Expected: The primary Compose action remains legible while disabled, with at least 4.5:1 text contrast in light and dark presentation modes.
- Observed: On deployed version 6 the disabled button renders white text over a 50%-opacity cobalt fill. The user-visible contrast calculation is 2.4:1; the instrumented route scan also reported a serious color-contrast violation at 2.39:1.
- Reproduction:
  - Open /compose at 1440x900 and let the catalogue remain in its initial loading state, or block /data/catalog.json and wait for Catalogue unavailable.
  - Scroll the disabled Compose Interface System button into view.
  - Measure the composed foreground/background contrast or run the Compose contrast regression test; version 6 reports 2.4:1 and fails the 4.5:1 threshold.
- Before evidence: [audit/evidence/deployed-version-6/compose-contrast/disabled-submit-1440.png](evidence/deployed-version-6/compose-contrast/disabled-submit-1440.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [result.json](evidence/deployed-version-7/compose-contrast/result.json)
  - [disabled-submit-1440.png](evidence/deployed-version-7/compose-contrast/disabled-submit-1440.png)
- Root cause: ComposeView uses disabled:opacity-50 on a cobalt background while retaining white button text, reducing the visible fill contrast during catalogue loading and error states.
- Affected code: `apps/site/src/components/ComposeView.tsx`
- Remediation: Keep the native catalogue-ready disabled gate and use an opaque neutral disabled fill with a readable foreground in both themes.
- Fix commit: `d301f9c0af6bafa04f554b86120cce7b16612f24`

## MEDIUM

### AUD-040: Surprise provides no change explanation

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Visible explanation accurately reports mutations and preserved locks.
- Observed: Change occurs but user sees no explanation.
- Reproduction:
  - Click Surprise and inspect feedback.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: Returned operation rationale is not surfaced in shell.
- Affected code: `packages/workbench/src/components/TopToolbar.tsx`, `packages/workbench/src/store/workbench-store.ts`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-041: 430px canvas preset missing

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: All requested device widths can be selected.
- Observed: Toolbar offers 1440,1024,768,390 only.
- Reproduction:
  - Inspect canvas viewport controls.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Deployed evidence:
  - [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png)
  - [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png)
  - [result.json](evidence/deployed-version-7/flagship/result.json)
  - [03-direction-c-handoff.png](evidence/deployed-version-7/flagship/03-direction-c-handoff.png)
- Root cause: DevicePreset omits 430 and toolbar repeats restricted list.
- Affected code: `packages/workbench/src/types.ts`, `packages/workbench/src/components/canvas/CanvasToolbar.tsx`
- Remediation: Implemented in commit 9ba4517421a716ff4f8cc6ceea304d9fa19914da and verified against Site version 7.
- Fix commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-045: Sign in link mislabels local Workbench

- Status: CLOSED — verified on deployed version 7
- Route / viewport: / / 1440x900; 390x844
- Expected: Navigation reflects actual unauthenticated staging behavior.
- Observed: Sign in opens local Workbench without sign-in.
- Reproduction:
  - Click Sign in.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Deployed evidence:
  - [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png)
  - [home-390.png](evidence/deployed-version-7/instrumented/home-390.png)
- Root cause: Static header label implies unavailable authentication flow.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`
- Remediation: Implemented in commit 08c06b875e7b2c11c95593279ba4e418332099ed and verified against Site version 7.
- Fix commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-081: Messaging shell sidebar and input overflow at mobile width

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=messaging-shell / 390x844
- Expected: Channels and message pane remain usable at 390px.
- Observed: Fixed 224px sidebar and implicit input minimum cause a 419px document.
- Reproduction:
  - Open messaging shell resource preview at 390px
- Before evidence: [audit/evidence/local-iteration-5/resources/messaging-shell-390.png](evidence/local-iteration-5/resources/messaging-shell-390.png)
- Deployed evidence:
  - [messaging-shell-1440.png](evidence/deployed-version-7/resources/messaging-shell-1440.png)
  - [messaging-shell-390.png](evidence/deployed-version-7/resources/messaging-shell-390.png)
- Root cause: The shell has no container breakpoint or minimum-width reset.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/src/components/PreviewHost.tsx`, `resources/shells/messaging-shell/index.tsx`
- Remediation: fix(previews): support forwarded components and mobile messaging layout
- Fix commit: `b30caf328b68b087f5052ad1f586a354a97cde5b`

### AUD-082: Master detail resource overflows mobile and uses pointer-only selection

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /r/two-pane-master-detail-shell / 390x844
- Expected: The queue stacks above details at narrow widths and selection supports keyboard.
- Observed: Fixed 320px queue and detail padding produce a 459px document; queue items are clickable divs.
- Reproduction:
  - Open the actual master-detail preview at 390px
  - Try selecting another incident with Tab and Enter
- Before evidence: [audit/evidence/local-iteration-6/resources/two-pane-master-detail-shell-390.png](evidence/local-iteration-6/resources/two-pane-master-detail-shell-390.png)
- Deployed evidence:
  - [two-pane-master-detail-shell-1440.png](evidence/deployed-version-7/resources/two-pane-master-detail-shell-1440.png)
  - [two-pane-master-detail-shell-390.png](evidence/deployed-version-7/resources/two-pane-master-detail-shell-390.png)
- Root cause: Fixed horizontal layout lacks container breakpoint; queue selection has no semantic button.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/messaging-shell.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `packages/exporter/src/generated-gold-sources.ts`, `resources/shells/two-pane-master-detail-shell/index.tsx`
- Remediation: fix(resources): make master detail responsive and keyboard selectable
- Fix commit: `27c59b2e7471c0bee4860999c6ae3029e0ac07d3`

### AUD-099: Catalogue creates excessive offscreen preview contexts before filtering

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /explore / 1440x900;390x844
- Expected: Only nearby resource previews mount; filtering avoids large unnecessary document request batches.
- Observed: Initial 50-result view creates 50 iframe contexts; fast filtering cancels many preview documents.
- Reproduction:
  - Open Explore
  - Search advanced data table as catalogue loads
  - Inspect preview document requests and iframe count
- Before evidence: [audit/evidence/deployed-version-4/catalogue-preview-window-before.png](evidence/deployed-version-4/catalogue-preview-window-before.png)
- Deployed evidence:
  - [explore-1440.png](evidence/deployed-version-7/instrumented/explore-1440.png)
  - [explore-390.png](evidence/deployed-version-7/instrumented/explore-390.png)
- Root cause: Browser-native iframe lazy loading alone has a broad loading threshold and still creates every browsing context.
- Affected code: `apps/site/src/components/ResourceCard.tsx`
- Remediation: Use IntersectionObserver to mount real previews within 160px of the viewport, retaining a browser-capability fallback.
- Fix commit: `ab6e2cb6e13b0cda59a6255920608968b971b5ff`

### AUD-111: Direction A compact card provides limited screen content

- Status: ACCEPTED — documented non-blocking limitation
- Route / viewport: /compose / 1440x900
- Expected: Compact direction card communicates both navigation and screen content.
- Observed: Unscaled navigation occupies most of the compact card crop; the full preview renders the complete screen.
- Reproduction:
  - Compose the exact employee brief.
  - Inspect Direction A compact card.
  - Open Inspect full preview and DNA to view the actual complete screen.
- Before evidence: [audit/evidence/deployed-version-5/flagship/direction-01.png](evidence/deployed-version-5/flagship/direction-01.png)
- Deployed evidence:
  - [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png)
  - [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png)
  - [direction-01-full-preview.png](evidence/deployed-version-7/directions/direction-01-full-preview.png)
- Root cause: Unscaled complete project is cropped into a small direction-card viewport.
- Affected code: `apps/site/src/components/ComposeView.tsx`
- Remediation: Retain the readable full interactive preview; consider a dedicated compact overview in a later visual refinement.
- Remaining rationale: Non-blocking compact-card limitation. The clearly labelled full-preview control displays every screen at readable size and is exercised in acceptance. A dedicated summary rendering would alter preview presentation beyond the repaired workflow.

### AUD-114: Logo cloud implies fabricated customer adoption

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=logo-cloud-minimal / 1440x900; 390x844
- Expected: Approved customer/partner marks or conspicuously illustrative placeholders.
- Observed: The default logo cloud displays Acme Corp, Starlight Data, Hyperion, Vertex Labs, and Nexus AI under a claim that they use design systems.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=logo-cloud-minimal at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/logo-cloud-minimal-1440.png](evidence/deployed-version-5/demo-content/logo-cloud-minimal-1440.png)
- Deployed evidence:
  - [logo-cloud-minimal-1440.png](evidence/deployed-version-7/resources/logo-cloud-minimal-1440.png)
  - [logo-cloud-minimal-390.png](evidence/deployed-version-7/resources/logo-cloud-minimal-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [logo-cloud-minimal-1440.png](evidence/deployed-version-7/demo-content/logo-cloud-minimal-1440.png)
  - [logo-cloud-minimal-390.png](evidence/deployed-version-7/demo-content/logo-cloud-minimal-390.png)
- Root cause: The component and fixture ship named placeholder brands without an example label.
- Affected code: `resources/sections/logo-cloud-minimal/index.tsx`, `resources/sections/logo-cloud-minimal/fixtures.ts`
- Remediation: Replace names with visible example placeholders and mark the heading as illustrative.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-123: Product hero shows a fictional runtime address and unqualified catalogue claims

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=product-screenshot-hero / 1440x900; 390x844
- Expected: A preview uses a real target or is clearly marked as an example, and controls are actionable or disabled.
- Observed: The hero displays workbench.tessellate.design, claims 324 validated resources and live token synchronization, and an enabled Start Building Free button does nothing.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=product-screenshot-hero at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/product-screenshot-hero-1440.png](evidence/deployed-version-5/demo-content/product-screenshot-hero-1440.png)
- Deployed evidence:
  - [product-screenshot-hero-1440.png](evidence/deployed-version-7/resources/product-screenshot-hero-1440.png)
  - [product-screenshot-hero-390.png](evidence/deployed-version-7/resources/product-screenshot-hero-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [product-screenshot-hero-1440.png](evidence/deployed-version-7/demo-content/product-screenshot-hero-1440.png)
  - [product-screenshot-hero-390.png](evidence/deployed-version-7/demo-content/product-screenshot-hero-390.png)
- Root cause: A static mock preview uses a hard-coded external host and unqualified demo claims; its CTA has no target.
- Affected code: `resources/sections/product-screenshot-hero/index.tsx`, `resources/sections/product-screenshot-hero/fixtures.ts`, `resources/sections/product-screenshot-hero/README.md`
- Remediation: Mark the frame as an example, remove dynamic claims, and require an explicit CTA URL.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-127: AI candidate comparison presents invented latency and quality scores as measurements

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=ai-generation-compare / 1440x900; 390x844
- Expected: Benchmarks use measured runs or an explicit illustrative-data label.
- Observed: Candidate cards display 420/510ms latency and 92/98 cohesion scores without identifying them as sample values.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=ai-generation-compare at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/ai-generation-compare-1440.png](evidence/deployed-version-5/demo-content/ai-generation-compare-1440.png)
- Deployed evidence:
  - [ai-generation-compare-1440.png](evidence/deployed-version-7/resources/ai-generation-compare-1440.png)
  - [ai-generation-compare-390.png](evidence/deployed-version-7/resources/ai-generation-compare-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [ai-generation-compare-1440.png](evidence/deployed-version-7/demo-content/ai-generation-compare-1440.png)
  - [ai-generation-compare-390.png](evidence/deployed-version-7/demo-content/ai-generation-compare-390.png)
- Root cause: Hardcoded demonstration scores are styled as runtime comparison results with no example label.
- Affected code: `resources/ai/ai-generation-compare/index.tsx`
- Remediation: Mark all values as illustrative and avoid presenting static scores as generated output.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-128: Editorial hero advertises an unreleased version and unmeasured speed

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /preview/?resource=editorial-hero / 1440x900; 390x844
- Expected: Version and performance claims match the current release state and measured behavior.
- Observed: The default announces Version 2.0 and promises sub-millisecond execution while the CLI package is private at 0.1.0.
- Reproduction:
  - Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview/?resource=editorial-hero at 1440x900.
  - Read the resource content and exercise every visible button.
  - Repeat at 390x844.
- Before evidence: [audit/evidence/deployed-version-5/demo-content/editorial-hero-1440.png](evidence/deployed-version-5/demo-content/editorial-hero-1440.png)
- Deployed evidence:
  - [editorial-hero-1440.png](evidence/deployed-version-7/resources/editorial-hero-1440.png)
  - [editorial-hero-390.png](evidence/deployed-version-7/resources/editorial-hero-390.png)
  - [after-results.json](evidence/deployed-version-7/demo-content/after-results.json)
  - [editorial-hero-1440.png](evidence/deployed-version-7/demo-content/editorial-hero-1440.png)
  - [editorial-hero-390.png](evidence/deployed-version-7/demo-content/editorial-hero-390.png)
- Root cause: Stale promotional defaults are disconnected from release metadata and benchmark evidence.
- Affected code: `resources/sections/editorial-hero/index.tsx`
- Remediation: Remove the false version announcement and phrase performance as a measured target rather than a guarantee.
- Fix commit: `eb491b6d3ed9afcf368424090cff2a76cce33de3`

### AUD-129: Showcase graph identity changes during identical builds

- Status: CLOSED — verified on deployed version 7
- Route / viewport: /showcase/showcase-playful-hr/ / 1440x900; 390x844
- Expected: Repeated composition of the same showcase with the same catalogue yields the same screen-graph identity and stable example metadata.
- Observed: The regression reproducer composed the same playful-HR showcase twice and observed graph-recruitment-mv67u2p8 then graph-recruitment-mv67u2q4. The graph ID is built from Date.now(), so regenerated manifests differ despite identical input.
- Reproduction:
  - Open the deployed playful-HR showcase at desktop and mobile widths.
  - Run `pnpm exec vitest run packages/compatibility/src/__tests__/showcase-composition.test.ts` twice-composition regression.
  - Before remediation the new test fails because consecutive calls produce different screenGraph.id values.
- Before evidence: [audit/evidence/deployed-version-5/showcase-stability/showcase-playful-hr-1440.png](evidence/deployed-version-5/showcase-stability/showcase-playful-hr-1440.png)
- Deployed evidence:
  - [showcase-playful-hr-1440.png](evidence/deployed-version-7/showcase-stability/showcase-playful-hr-1440.png)
  - [showcase-playful-hr-390.png](evidence/deployed-version-7/showcase-stability/showcase-playful-hr-390.png)
  - [result.json](evidence/deployed-version-7/showcase-stability/result.json)
  - [workbench-handoff.tess.json](evidence/deployed-version-7/showcase-stability/workbench-handoff.tess.json)
- Root cause: packages/composer/src/planner.ts derives ScreenGraph.id from Date.now(). composeShowcase also inherits wall-clock timestamps from the user-project composition path rather than using its stable fixture timestamps.
- Affected code: `packages/composer/src/planner.ts`, `packages/compatibility/src/showcase-composition.ts`, `scripts/build-catalog.ts`
- Remediation: Derive graph IDs from a canonical ProductModel value and give generated example showcases their fixture timestamps. Keep current timestamps for newly composed user projects.
- Fix commit: `53bf7453e1acc0f25c50fbfe055dcb36f140ec23`

## LOW

### AUD-079: Standalone npm install emits an unsupported project configuration warning

- Status: CLOSED — verified on deployed version 7
- Route / viewport: standalone export / 1440x900
- Expected: The portable export installs without package-manager-specific configuration warnings.
- Observed: npm warns that only-built-dependencies is an unknown project configuration.
- Reproduction:
  - Download the actual standalone ZIP through Workbench.
  - Extract to a clean directory, install and build.
  - Run the real preview and inspect desktop accessibility and install diagnostics.
- Before evidence: [audit/evidence/local-iteration-4b/flagship/npm-install.log](evidence/local-iteration-4b/flagship/npm-install.log)
- Deployed evidence:
  - [standalone-build.json](evidence/deployed-version-7/flagship/standalone-build.json)
- Root cause: Exporter writes a pnpm-specific setting into .npmrc, which npm does not support.
- Affected code: `packages/exporter/src/source-tree.ts`
- Remediation: test(export): verify preview readiness through real HTTP response
- Fix commit: `76e106e506cb0afd12a43d1f2f2f2095459dd174`

## Route classification

| Route | Result | Viewports | Evidence |
|---|---|---|---|
| / | PASS | 1440×900, 390×844 | [home-1440.png](evidence/deployed-version-7/instrumented/home-1440.png), [home-390.png](evidence/deployed-version-7/instrumented/home-390.png) |
| /explore | PASS | 1440×900, 390×844 | [explore-1440.png](evidence/deployed-version-7/instrumented/explore-1440.png), [explore-390.png](evidence/deployed-version-7/instrumented/explore-390.png) |
| /components | PASS | 1440×900, 390×844 | [components-1440.png](evidence/deployed-version-7/instrumented/components-1440.png), [components-390.png](evidence/deployed-version-7/instrumented/components-390.png) |
| /sections | PASS | 1440×900, 390×844 | [sections-1440.png](evidence/deployed-version-7/instrumented/sections-1440.png), [sections-390.png](evidence/deployed-version-7/instrumented/sections-390.png) |
| /blocks | PASS | 1440×900, 390×844 | [blocks-1440.png](evidence/deployed-version-7/instrumented/blocks-1440.png), [blocks-390.png](evidence/deployed-version-7/instrumented/blocks-390.png) |
| /pages | PASS | 1440×900, 390×844 | [pages-1440.png](evidence/deployed-version-7/instrumented/pages-1440.png), [pages-390.png](evidence/deployed-version-7/instrumented/pages-390.png) |
| /effects | PASS | 1440×900, 390×844 | [effects-1440.png](evidence/deployed-version-7/instrumented/effects-1440.png), [effects-390.png](evidence/deployed-version-7/instrumented/effects-390.png) |
| /motion | PASS | 1440×900, 390×844 | [motion-1440.png](evidence/deployed-version-7/instrumented/motion-1440.png), [motion-390.png](evidence/deployed-version-7/instrumented/motion-390.png) |
| /backgrounds | PASS | 1440×900, 390×844 | [backgrounds-1440.png](evidence/deployed-version-7/instrumented/backgrounds-1440.png), [backgrounds-390.png](evidence/deployed-version-7/instrumented/backgrounds-390.png) |
| /ai | PASS | 1440×900, 390×844 | [ai-1440.png](evidence/deployed-version-7/instrumented/ai-1440.png), [ai-390.png](evidence/deployed-version-7/instrumented/ai-390.png) |
| /data | PASS | 1440×900, 390×844 | [data-1440.png](evidence/deployed-version-7/instrumented/data-1440.png), [data-390.png](evidence/deployed-version-7/instrumented/data-390.png) |
| /compose | PASS | 1440×900, 390×844 | [compose-1440.png](evidence/deployed-version-7/instrumented/compose-1440.png), [compose-390.png](evidence/deployed-version-7/instrumented/compose-390.png) |
| /workbench | PASS | 1440×900, 390×844 | [workbench-1440.png](evidence/deployed-version-7/instrumented/workbench-1440.png), [workbench-390.png](evidence/deployed-version-7/instrumented/workbench-390.png) |
| /blueprints | PASS | 1440×900, 390×844 | [blueprints-1440.png](evidence/deployed-version-7/instrumented/blueprints-1440.png), [blueprints-390.png](evidence/deployed-version-7/instrumented/blueprints-390.png) |
| /collections | PASS | 1440×900, 390×844 | [collections-1440.png](evidence/deployed-version-7/instrumented/collections-1440.png), [collections-390.png](evidence/deployed-version-7/instrumented/collections-390.png) |
| /creators | PASS | 1440×900, 390×844 | [creators-1440.png](evidence/deployed-version-7/instrumented/creators-1440.png), [creators-390.png](evidence/deployed-version-7/instrumented/creators-390.png) |
| /showcase | PASS | 1440×900, 390×844 | [showcase-1440.png](evidence/deployed-version-7/instrumented/showcase-1440.png), [showcase-390.png](evidence/deployed-version-7/instrumented/showcase-390.png) |
| /trends | PASS | 1440×900, 390×844 | [trends-1440.png](evidence/deployed-version-7/instrumented/trends-1440.png), [trends-390.png](evidence/deployed-version-7/instrumented/trends-390.png) |
| /tools | PASS | 1440×900, 390×844 | [tools-1440.png](evidence/deployed-version-7/instrumented/tools-1440.png), [tools-390.png](evidence/deployed-version-7/instrumented/tools-390.png) |
| /agents | PASS | 1440×900, 390×844 | [agents-1440.png](evidence/deployed-version-7/instrumented/agents-1440.png), [agents-390.png](evidence/deployed-version-7/instrumented/agents-390.png) |
| /docs | PASS | 1440×900, 390×844 | [docs-1440.png](evidence/deployed-version-7/instrumented/docs-1440.png), [docs-390.png](evidence/deployed-version-7/instrumented/docs-390.png) |
| /sponsor | PASS | 1440×900, 390×844 | [sponsor-1440.png](evidence/deployed-version-7/instrumented/sponsor-1440.png), [sponsor-390.png](evidence/deployed-version-7/instrumented/sponsor-390.png) |
| /about | PASS | 1440×900, 390×844 | [about-1440.png](evidence/deployed-version-7/instrumented/about-1440.png), [about-390.png](evidence/deployed-version-7/instrumented/about-390.png) |
| /license | PASS | 1440×900, 390×844 | [license-1440.png](evidence/deployed-version-7/instrumented/license-1440.png), [license-390.png](evidence/deployed-version-7/instrumented/license-390.png) |
| /privacy | PASS | 1440×900, 390×844 | [privacy-1440.png](evidence/deployed-version-7/instrumented/privacy-1440.png), [privacy-390.png](evidence/deployed-version-7/instrumented/privacy-390.png) |
| /terms | PASS | 1440×900, 390×844 | [terms-1440.png](evidence/deployed-version-7/instrumented/terms-1440.png), [terms-390.png](evidence/deployed-version-7/instrumented/terms-390.png) |
| /r/button | PASS | 1440×900, 390×844 | [r-button-1440.png](evidence/deployed-version-7/instrumented/r-button-1440.png), [r-button-390.png](evidence/deployed-version-7/instrumented/r-button-390.png) |
| /r/area-chart | PASS | 1440×900, 390×844 | [r-area-chart-1440.png](evidence/deployed-version-7/instrumented/r-area-chart-1440.png), [r-area-chart-390.png](evidence/deployed-version-7/instrumented/r-area-chart-390.png) |
| /preview/?resource=button | PASS | 1440×900, 390×844 | [button-1440.png](evidence/deployed-version-7/resources/button-1440.png), [button-390.png](evidence/deployed-version-7/resources/button-390.png) |
| /blueprints/b2b-saas | PASS | 1440×900, 390×844 | [blueprints-b2b-saas-1440.png](evidence/deployed-version-7/responsive-keyboard/blueprints-b2b-saas-1440.png), [blueprints-b2b-saas-390.png](evidence/deployed-version-7/responsive-keyboard/blueprints-b2b-saas-390.png) |
| /showcase/showcase-playful-hr/ | PASS | 1440×900, 390×844 | [showcase-playful-hr-1440.png](evidence/deployed-version-7/showcase-stability/showcase-playful-hr-1440.png), [showcase-playful-hr-390.png](evidence/deployed-version-7/showcase-stability/showcase-playful-hr-390.png) |
| /tools/dna | PASS | 1440×900, 390×844 | [tools-dna-1440.png](evidence/deployed-version-7/instrumented/tools-dna-1440.png), [dna.png](evidence/deployed-version-7/tool-interactions/dna.png) |
| /docs/registry | PASS | 1440×900, 390×844 | [docs-registry-1440.png](evidence/deployed-version-7/instrumented/docs-registry-1440.png), [docs-registry-390.png](evidence/deployed-version-7/instrumented/docs-registry-390.png) |
| /showcases | PASS | 1440×900, 390×844 | [showcases-1440.png](evidence/deployed-version-7/instrumented/showcases-1440.png), [showcases-390.png](evidence/deployed-version-7/instrumented/showcases-390.png) |
| /data/catalog.json | PASS | 1440×900, 390×844 | [catalog-load.json](evidence/deployed-version-7/catalog-load.json) |

## Final deployed acceptance

- Employee brief composed into three structurally distinct directions; Direction C opened with matching project ID, Design DNA, screen list, navigation, and resource refs.
- Product model contains people, teams, onboarding, engagement, and settings content; no finance, trading, telemetry, or unrelated placeholder residue appeared.
- Each direction has nine screens, 40 resource refs, zero missing/synthetic refs, and zero unresolved required roles.
- Direction C lock survived radical recomposition and Surprise Me; replacement used a Gold Timeline resource; Undo/Redo restored exact exported manifests.
- Axe reported zero violations on audited shell, resource, generated-product, Workbench, tool, and mobile views. The disabled Compose action measured 5.75:1 in the deployed failure state.
- All 324 resources rendered at desktop/mobile: 648 checks, zero errors, failed requests, or overflow. All ten tools produced visible changes through their controls.
- Standalone ZIP extracted outside the repository, installed 90 packages, built with TypeScript and Vite, ran on a real preview server, and passed desktop/mobile browser and Axe checks. No `@tessellate/*` runtime dependency.
- Security response headers, including CSP, `nosniff`, Referrer-Policy and frame policy, were present on the shell, isolated preview, and resource detail responses.
- No D1/R2 bindings were provisioned; no paid infrastructure was added; the project remains within its documented £20/month ceiling.
