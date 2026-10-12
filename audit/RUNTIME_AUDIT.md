# Tessellate runtime audit

Status: **NOT ACCEPTED**. Repairs are implemented; deployed version 5 verification is pending.

Deployed baseline: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site

Evidence comes from real browser interactions, screenshots, downloaded manifests and independent installations. No application stores were called to complete the workflow.

## CRITICAL

### AUD-023: Employee brief inferred as analytics

- Status: OPEN
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Employee experience architecture with people, teams, onboarding, engagement and policies.
- Observed: ANALYTICS model targets analysts and quantitative metrics; no onboarding screen, no people or teams.
- Reproduction: Wait for catalogue ready. -> Submit the exact employee brief, professional but playful, Refined and Inventive.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Root cause: Substring archetype detection rewards incidental dashboard/technical words; planner substitutes fixed telemetry screens and ignores recommended domain screens.
- Affected code: `packages/composer/src/archetypes.ts`, `packages/composer/src/interpreter.ts`, `packages/composer/src/planner.ts`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-024: Semantically unrelated Gold resources fill required roles

- Status: OPEN
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Each role resolves to a compatible working resource.
- Observed: Marketing value proposition and CTA become three-pane shells; dashboard metrics become Nav Tree / Visual Canvas / Inspector; grammar panes duplicate across all screen types.
- Reproduction: Compose the employee brief. -> Inspect each direction and Workbench screens.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Root cause: Role matching accepts grammar categories and falls back to every Gold resource; screen roles union application grammar roles irrespective of screen class.
- Affected code: `packages/compatibility/src/compose-pipeline.ts`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-028: Reload silently discards project edits

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Edits, locks and local overrides survive reload.
- Observed: After recompose, replacement and Surprise, reload returns the initial manifest with no locks or edits.
- Reproduction: Open Direction C. -> Lock a section, Recompose, Replace, Surprise. -> Export manifest. -> Reload and export again.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Shell loads initial localStorage snapshot; mutations are not persisted.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/persistence/storage.ts`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-029: Standalone export fails a clean build

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: ZIP installs, builds and runs without repository packages.
- Observed: npm install succeeds, npm run build fails: gradient-fill is not assignable to AreaChartVariant.
- Reproduction: Replace overview header with offered area-chart. -> Export ZIP. -> Extract into a clean directory. -> npm install --no-audit --no-fund; npm run build.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Replacement uses a fabricated sample catalogue with variants that do not exist in canonical resource source.
- Affected code: `packages/workbench/src/mutations/replace.ts`, `packages/exporter/src`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-083: Sites asset bypass removes security response headers

- Status: OPEN
- Route / viewport: /preview/?resource=button / 1440x900
- Expected: All page responses, particularly preview HTML, retain CSP and security headers.
- Observed: Version 2 matching asset responses contain no CSP, nosniff or Referrer-Policy; an unmatched route returns the Worker security headers.
- Reproduction: GET /preview/?resource=button and inspect response headers -> GET /__tessellate_missing_probe and compare headers
- Before evidence: [audit/evidence/deployed-version-2/instrumented/home-1440.png](evidence/deployed-version-2/instrumented/home-1440.png)
- Root cause: The Sites host serves matching assets before the Worker even with run_worker_first configured.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/sites/README.md`, `apps/sites/prepare-static.mjs`, `apps/sites/worker.ts`, `docs/DECISIONS.md`
- Remediation: fix(sites): route protected HTML through security worker on native host
- Applied commit: `6ba48a9a31c6f69c46cd0e8170e437fbc870b24e`

## HIGH

### AUD-001: Public route /components is missing

- Status: OPEN
- Route / viewport: /components / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /components at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/components-1440.png](evidence/before/instrumented/components-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-002: Public route /sections is missing

- Status: OPEN
- Route / viewport: /sections / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /sections at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/sections-1440.png](evidence/before/instrumented/sections-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-003: Public route /blocks is missing

- Status: OPEN
- Route / viewport: /blocks / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /blocks at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/blocks-1440.png](evidence/before/instrumented/blocks-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-004: Public route /pages is missing

- Status: OPEN
- Route / viewport: /pages / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /pages at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/pages-1440.png](evidence/before/instrumented/pages-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-005: Public route /effects is missing

- Status: OPEN
- Route / viewport: /effects / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /effects at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/effects-1440.png](evidence/before/instrumented/effects-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-006: Public route /motion is missing

- Status: OPEN
- Route / viewport: /motion / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /motion at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/motion-1440.png](evidence/before/instrumented/motion-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-007: Public route /backgrounds is missing

- Status: OPEN
- Route / viewport: /backgrounds / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /backgrounds at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/backgrounds-1440.png](evidence/before/instrumented/backgrounds-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-008: Public route /ai is missing

- Status: OPEN
- Route / viewport: /ai / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /ai at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/ai-1440.png](evidence/before/instrumented/ai-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-009: Public route /data is missing

- Status: OPEN
- Route / viewport: /data / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /data at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/data-1440.png](evidence/before/instrumented/data-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-010: Public route /blueprints is missing

- Status: OPEN
- Route / viewport: /blueprints / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /blueprints at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/blueprints-1440.png](evidence/before/instrumented/blueprints-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-011: Public route /collections is missing

- Status: OPEN
- Route / viewport: /collections / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /collections at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/collections-1440.png](evidence/before/instrumented/collections-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-012: Public route /about is missing

- Status: OPEN
- Route / viewport: /about / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /about at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/about-1440.png](evidence/before/instrumented/about-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-013: Public route /agents is missing

- Status: OPEN
- Route / viewport: /agents / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /agents at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/agents-1440.png](evidence/before/instrumented/agents-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-014: Public route /creators is missing

- Status: OPEN
- Route / viewport: /creators / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /creators at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/creators-1440.png](evidence/before/instrumented/creators-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-015: Public route /docs is missing

- Status: OPEN
- Route / viewport: /docs / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /docs at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/docs-1440.png](evidence/before/instrumented/docs-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-016: Public route /docs/registry is missing

- Status: OPEN
- Route / viewport: /docs/registry / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /docs/registry at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/docs-registry-1440.png](evidence/before/instrumented/docs-registry-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-017: Public route /license is missing

- Status: OPEN
- Route / viewport: /license / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /license at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/license-1440.png](evidence/before/instrumented/license-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-018: Public route /privacy is missing

- Status: OPEN
- Route / viewport: /privacy / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /privacy at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/privacy-1440.png](evidence/before/instrumented/privacy-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-019: Public route /showcase is missing

- Status: OPEN
- Route / viewport: /showcase / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /showcase at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/showcase-1440.png](evidence/before/instrumented/showcase-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-020: Public route /sponsor is missing

- Status: OPEN
- Route / viewport: /sponsor / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /sponsor at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/sponsor-1440.png](evidence/before/instrumented/sponsor-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-021: Public route /terms is missing

- Status: OPEN
- Route / viewport: /terms / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /terms at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/terms-1440.png](evidence/before/instrumented/terms-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-022: Public route /trends is missing

- Status: OPEN
- Route / viewport: /trends / 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Observed: HTTP 404 and generic not-found page.
- Reproduction: Open /trends at desktop and mobile widths.
- Before evidence: [audit/evidence/before/instrumented/trends-1440.png](evidence/before/instrumented/trends-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: `apps/site/src/pages`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-025: Generated product inherits resource demo content

- Status: OPEN
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Brand, copy and sample records match the submitted objective, with sample data identified.
- Observed: Tessellate marketing text, fake testimonials and ingestion/incidents/CPU/token data appear in employee product.
- Reproduction: Inspect all three direction previews. -> Open settings and dashboard in Workbench.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Root cause: Composition creates only a title prop, leaving domain-specific resource defaults intact.
- Affected code: `packages/compatibility/src/compose-pipeline.ts`, `resources`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-026: Repeated composition overwrites project identity

- Status: OPEN
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Separate briefs create separate persisted projects while explicit seeds remain deterministic.
- Observed: Every Direction C uses proj-direction-c-tessellateseedv1dirc.
- Reproduction: Compose two different briefs. -> Compare project URLs.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Root cause: UI reuses fixed default seed as persisted project identity.
- Affected code: `apps/site/src/components/ComposeView.tsx`, `packages/compatibility/src/compose-pipeline.ts`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-027: Direction previews are too small to inspect

- Status: OPEN
- Route / viewport: /compose / 1440x900; 390x844
- Expected: Readable previews with screen navigation and distinct structural direction.
- Observed: Three tiny clipped/scaled marketing heroes conceal the rest of the product; all use same hero content.
- Reproduction: Inspect all three previews at desktop and mobile.
- Before evidence: [audit/evidence/before/instrumented/flagship-directions.png](evidence/before/instrumented/flagship-directions.png)
- Root cause: Fixed miniature frame without accessible full direction preview or screen selector.
- Affected code: `apps/site/src/components/ComposeView.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-030: Replacement offers incompatible resource

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Candidates satisfy the semantic role and hard constraints using the actual Gold catalogue.
- Observed: Only area-chart is offered for entity-profile-header; no meaningful candidate preview.
- Reproduction: Select overview-header. -> Open Replace.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Hardcoded four-resource catalogue and permissive same-section-type match override semantics.
- Affected code: `packages/workbench/src/mutations/replace.ts`, `packages/workbench/src/components/replace/ReplaceDrawer.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-031: Replacement previews are synthetic drawings

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Candidate displays its actual renderer and content.
- Observed: Generic chart bars, grey rectangles or fake dollar metric replace actual candidate components.
- Reproduction: Open Replace and inspect its candidates.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: ResourceVisualPreview draws mock graphics instead of canonical renderer.
- Affected code: `packages/workbench/src/components/replace/ReplaceDrawer.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-032: Compare uses unrelated financial project

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Compare targets the initial checkpoint of this exact project.
- Observed: Apex Financial Intelligence is comparison baseline for employee brief.
- Reproduction: Open Direction C. -> Click Compare.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: setManifest resets history but retains sample-project checkpoint.
- Affected code: `packages/workbench/src/store/workbench-store.ts`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-033: Blend invents a financial source direction

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Blend uses an actual saved direction of the current brief or truthfully requires one.
- Observed: Source B is a renamed sample fintech manifest with fabricated DNA.
- Reproduction: Open Direction C. -> Click Blend.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: BlendModal constructs createSampleProject rather than loading composition siblings.
- Affected code: `packages/workbench/src/components/blend/BlendModal.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-034: Toolbar modes do not open corresponding inspector

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Style, Motion and Content display the appropriate controls.
- Observed: Top mode changes but right inspector remains Intent.
- Reproduction: Click each top mode after opening Workbench.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: setActiveMode only sets activeMode, not activeRightTab.
- Affected code: `packages/workbench/src/store/workbench-store.ts`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-035: Unnamed Workbench and direction controls

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Every interactive control has an accessible name.
- Observed: Axe critical button-name and label failures (7 Workbench ranges, 3 direction ranges).
- Reproduction: Run unsuppressed Axe on Compose directions and Workbench. -> Navigate controls by keyboard.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Range controls lack linked labels; layer expanders and default sample buttons lack names.
- Affected code: `packages/workbench/src/components/right-inspector`, `packages/workbench/src/components/left-panel`, `apps/site/src/components/ComposeView.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-036: Selection and lock tiles are not keyboard controls

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Keyboard users can select page/layer and toggle locks.
- Observed: Clickable div rows and lock tiles are omitted from tab order.
- Reproduction: Tab through Layers and Locks inspector.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Click handlers use generic divs without keyboard semantics.
- Affected code: `packages/workbench/src/components/left-panel`, `packages/workbench/src/components/right-inspector/ConstraintsTab.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-037: Workbench mixes unreadable dark and light chrome

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Calm coherent shell with readable project title and inspector.
- Observed: Near-white title on light toolbar and mixed dark/light areas; mobile canvas begins with huge empty shell panes.
- Reproduction: Open Workbench at 1440, 1024 and 390.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Dark variants apply via preference without coherent explicit theme tokens; resource shell fallback compounds unusable canvas.
- Affected code: `apps/site/src/styles/global.css`, `packages/workbench/src/components`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-038: Mobile omits primary editing controls

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Primary modes, replacement, export and viewport operations remain usable.
- Observed: Mobile Inspect includes only Intent, Style and Locks; Resource, Content, Motion and Export missing.
- Reproduction: Open Workbench at 390x844. -> Use all bottom tabs.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Separate MobileWorkbench duplicates a restricted subset of desktop controls.
- Affected code: `packages/workbench/src/components/mobile/MobileWorkbench.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-039: Audit score implies unverified accessibility

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Audit distinguishes manifest heuristics from measured runtime compliance.
- Observed: Accessibility 20/20 and responsive 15/15 despite critical and serious Axe failures.
- Reproduction: Open Audit. -> Compare with captured Axe evidence.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Audit labels heuristic checks as compliance and does not explain measurement limits.
- Affected code: `packages/workbench/src/components/audit/AuditPanel.tsx`, `packages/workbench/src/audit`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-042: Resource preview silently renders Button

- Status: OPEN
- Route / viewport: /r/area-chart / 1440x900; 390x844
- Expected: Area chart detail displays its actual chart.
- Observed: iframe shows button despite chart title and source.
- Reproduction: Open /r/area-chart and inspect preview.
- Before evidence: [audit/evidence/before/instrumented/r-area-chart-1440.png](evidence/before/instrumented/r-area-chart-1440.png)
- Root cause: PreviewHost selects fallback component instead of full canonical registry.
- Affected code: `apps/site/src/components/PreviewHost.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-043: Use in Workbench ignores selected resource

- Status: OPEN
- Route / viewport: /r/button / 1440x900; 390x844
- Expected: Chosen resource opens in a real new or current project with that resource.
- Observed: ?resource=button loads the previous project unchanged.
- Reproduction: Open /r/button. -> Click Use in Workbench.
- Before evidence: [audit/evidence/before/instrumented/r-button-1440.png](evidence/before/instrumented/r-button-1440.png)
- Root cause: Workbench bootstrap ignores resource URL parameter.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-044: Header Search click opens nothing

- Status: OPEN
- Route / viewport: / / 1440x900; 390x844
- Expected: Click opens a usable search palette, Escape closes and restores focus.
- Observed: No modal or search input appears.
- Reproduction: Click header Search.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Root cause: SiteHeader mounts CommandPalette without isOpen; palette internal state starts closed.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/CommandPalette.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-046: Homepage mosaic links refer to nonexistent resources

- Status: OPEN
- Route / viewport: / / 1440x900; 390x844
- Expected: Every resource link resolves to its actual catalogue record.
- Observed: telemetry-chart and metric-card routes return404.
- Reproduction: Click corresponding mosaic resources.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Root cause: Static slug strings refer to legacy sample resources absent from324 catalogue.
- Affected code: `apps/site/src/components/home/CatalogueMosaic.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-047: Homepage claims measured perfect accessibility

- Status: OPEN
- Route / viewport: / / 1440x900; 390x844
- Expected: Public claims are supported and clearly distinguish illustration.
- Observed: Audit100/100 AACompliant and zero-debt accessibility appear despite captured serious failures.
- Reproduction: Inspect homepage Workbench reveal.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Root cause: Hardcoded demonstration score presented without qualification.
- Affected code: `apps/site/src/components/home/WorkbenchReveal.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-048: Shared muted text fails contrast

- Status: OPEN
- Route / viewport: / / 1440x900; 390x844
- Expected: Normal text meets WCAG AA in each theme.
- Observed: Serious Axe color-contrast failures: homepage36, Explore52, Compose56, Workbench19 nodes.
- Reproduction: Run Axe without disabling contrast on all major routes.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Root cause: Muted#8B8F97 and opacity reductions are too light on paper; dark/light hardcoded combinations fail.
- Affected code: `apps/site/src/styles/global.css`, `packages/ui`, `apps/site/src/components`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-049: Sites static runtime drops security headers

- Status: OPEN
- Route / viewport: / / 1440x900; 390x844
- Expected: Deployment preserves declared CSP, nosniff, referrer and frame policies.
- Observed: Live responses contain none of the headers specified in _headers.
- Reproduction: Inspect live HTTP response headers for document and catalogue.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Root cause: Sites native static hosting does not interpret Cloudflare Pages _headers.
- Affected code: `apps/sites/prepare-static.mjs`, `.openai/hosting.json`, `apps/site/public/_headers`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `8dda28d7f9d4b33aa2c735486e70bc91ad0f5c1a`

### AUD-050: Library Apply does not replace a resource

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: The operation changes the actual validated project without fabricated refs or identity collisions.
- Observed: Apply KPI Metric Card changes the selected layout title to Active Metric but keeps its original resource/subtree.
- Reproduction: Select a node -> Open Library -> Apply KPI Metric Card -> Export the manifest
- Before evidence: [audit/evidence/before/library-apply-before.jpg](evidence/before/library-apply-before.jpg)
- Root cause: Hardcoded legacy library fabricates four entries; Apply calls updateNodeProps rather than a resource mutation.
- Affected code: `p`, `a`, `c`, `k`, `a`, `g`, `e`, `s`, `/`, `w`, `o`, `r`, `k`, `b`, `e`, `n`, `c`, `h`, `/`, `s`, `r`, `c`, `/`, `c`, `o`, `m`, `p`, `o`, `n`, `e`, `n`, `t`, `s`, `/`, `l`, `e`, `f`, `t`, `-`, `p`, `a`, `n`, `e`, `l`
- Remediation: Canonical resource replacement, unique subtree IDs and shared state checks. Local implementation is awaiting deployed re-audit.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-051: Duplicating a screen duplicates every node identity

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: The operation changes the actual validated project without fabricated refs or identity collisions.
- Observed: Export contains 77 nodes but only 67 unique node IDs after duplicating Marketing Home.
- Reproduction: Open Pages -> Duplicate Marketing Home -> Export the manifest -> Compare node IDs across screens
- Before evidence: [audit/evidence/before/pages-duplicate-before.jpg](evidence/before/pages-duplicate-before.jpg)
- Root cause: PagesTab deep-clones the tree without allocating node IDs.
- Affected code: `p`, `a`, `c`, `k`, `a`, `g`, `e`, `s`, `/`, `w`, `o`, `r`, `k`, `b`, `e`, `n`, `c`, `h`, `/`, `s`, `r`, `c`, `/`, `c`, `o`, `m`, `p`, `o`, `n`, `e`, `n`, `t`, `s`, `/`, `l`, `e`, `f`, `t`, `-`, `p`, `a`, `n`, `e`, `l`
- Remediation: Canonical resource replacement, unique subtree IDs and shared state checks. Local implementation is awaiting deployed re-audit.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-052: Every palette control applies the same unrelated mutation

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: Selecting Coral Human persists that palette and changes the rendered colours.
- Observed: All 20 buttons set colourfulness to 50. No palette selection is stored, and the canvas remains unchanged.
- Reproduction: Open Style inspector at project scope -> Select Coral Human -> Inspect the canvas -> Export the manifest
- Before evidence: [audit/evidence/before/palette-coral-no-change-before.jpg](evidence/before/palette-coral-no-change-before.jpg)
- Root cause: StyleTab uses an identical placeholder callback for every palette; normalizer ignores tokenOverrides.
- Affected code: `p`, `a`, `c`, `k`, `a`, `g`, `e`, `s`, `/`, `w`, `o`, `r`, `k`, `b`, `e`, `n`, `c`, `h`, `/`, `s`, `r`, `c`, `/`, `c`, `o`, `m`, `p`, `o`, `n`, `e`, `n`, `t`, `s`, `/`, `r`, `i`, `g`, `h`, `t`, `-`, `i`, `n`, `s`, `p`, `e`, `c`, `t`, `o`, `r`, `/`, `S`, `t`, `y`, `l`, `e`, `T`, `a`, `b`, `.`, `t`, `s`, `x`, `;`, ` `, `p`, `a`, `c`, `k`, `a`, `g`, `e`, `s`, `/`, `r`, `e`, `n`, `d`, `e`, `r`, `e`, `r`, `/`, `s`, `r`, `c`, `/`, `t`, `o`, `k`, `e`, `n`, `s`, `/`, `n`, `o`, `r`, `m`, `a`, `l`, `i`, `z`, `e`, `r`, `.`, `t`, `s`
- Remediation: Persist paletteId in the existing node tokenOverrides contract and resolve it throughout runtime and standalone export. Regression initially failed cobalt versus coral.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-053: Showcase handoff opens the previous unrelated project

- Status: OPEN
- Route / viewport: /showcases / 1440x900
- Expected: Inspect in Workbench loads the selected Kudos employee showcase.
- Observed: The URL requests showcase-playful-hr but Workbench displays the previous analytics project.
- Reproduction: Open Showcases. -> Select the Kudos HR example. -> Click Inspect in Workbench. -> Compare its name and content with the selected example.
- Before evidence: [audit/evidence/before/showcase-handoff-wrong-project-before.jpg](evidence/before/showcase-handoff-wrong-project-before.jpg)
- Root cause: Workbench boot reads only project query and ignores showcase query, then restores the previous local project.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `apps/site/src/components/ShowcasesGallery.tsx`
- Remediation: fix(workbench): preserve truthful editing navigation and history
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-054: Required preview props are absent from resource fixtures

- Status: OPEN
- Route / viewport: /explore / 1440x900
- Expected: Every published resource has its required preview data and functional local callbacks.
- Observed: Four loaded catalogue resource previews throw undefined array errors; other required-input primitives are affected.
- Reproduction: Open Explore in the second local review build. -> Wait for real sandboxed resource previews to mount. -> Inspect browser exceptions and CSP console messages.
- Before evidence: [audit/evidence/local-iteration-2/instrumented/explore-1440.png](evidence/local-iteration-2/instrumented/explore-1440.png)
- Root cause: Resource manifest preview defaults are empty despite required TypeScript properties. The former Button fallback hid the broken contracts.
- Affected code: `resources/primitives/*/manifest.json`
- Remediation: fix(workbench): preserve truthful editing navigation and history
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-055: Dynamic resource CSS preload is blocked by the sandbox CSP

- Status: OPEN
- Route / viewport: /preview / 1440x900
- Expected: Actual resource chunks load under the isolated preview policy without CSP errors.
- Observed: Astro/Vite requests shared CSS through the dynamic-import preloader, but connect-src none blocks the request repeatedly.
- Reproduction: Open Explore in the second local review build. -> Wait for real sandboxed resource previews to mount. -> Inspect browser exceptions and CSP console messages.
- Before evidence: [audit/evidence/local-iteration-2/instrumented/r-button-1440.png](evidence/local-iteration-2/instrumented/r-button-1440.png)
- Root cause: CSS chunk splitting introduces a fetch-based preload. A single canonical stylesheet avoids the fetch without expanding the preview network policy.
- Affected code: `apps/site/astro.config.mjs`
- Remediation: fix(sites): enforce isolated preview security with static asset worker
- Applied commit: `8dda28d7f9d4b33aa2c735486e70bc91ad0f5c1a`

### AUD-056: accessibility: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/accessibility / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/accessibility/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/accessibility-1440.png](evidence/before/tools/accessibility-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-057: accessibility: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/accessibility / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 4 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/accessibility/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/accessibility-1440.png](evidence/before/tools/accessibility-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-058: backgrounds: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/backgrounds / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 7 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/backgrounds/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/backgrounds-1440.png](evidence/before/tools/backgrounds-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-059: backgrounds: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/backgrounds / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 9 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/backgrounds/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/backgrounds-1440.png](evidence/before/tools/backgrounds-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-060: dataviz: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/dataviz / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/dataviz/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/dataviz-1440.png](evidence/before/tools/dataviz-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-061: dataviz: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/dataviz / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 3 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/dataviz/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/dataviz-1440.png](evidence/before/tools/dataviz-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-062: dna: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/dna / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 37 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/dna/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/dna-1440.png](evidence/before/tools/dna-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-063: icons: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/icons / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 2 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/icons/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/icons-1440.png](evidence/before/tools/icons-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-064: icons: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/icons / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/icons/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/icons-1440.png](evidence/before/tools/icons-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-065: layout: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/layout / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/layout/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/layout-1440.png](evidence/before/tools/layout-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-066: layout: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/layout / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 2 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/layout/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/layout-1440.png](evidence/before/tools/layout-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-067: motion: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/motion / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 5 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/motion/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/motion-1440.png](evidence/before/tools/motion-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-068: motion: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/motion / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 6 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/motion/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/motion-1440.png](evidence/before/tools/motion-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-069: palette: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/palette / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 11 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/palette/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/palette-1440.png](evidence/before/tools/palette-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-070: palette: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/palette / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 18 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/palette/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/palette-1440.png](evidence/before/tools/palette-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-071: section-planner: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/section-planner / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 16 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/section-planner/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/section-planner-1440.png](evidence/before/tools/section-planner-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-072: section-planner: scrollable-region-focusable blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/section-planner / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 1 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/section-planner/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/section-planner-1440.png](evidence/before/tools/section-planner-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-073: typography: color-contrast blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/typography / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 12 offending elements, Axe impact serious.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/typography/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/typography-1440.png](evidence/before/tools/typography-1440.png)
- Root cause: Tool styles fail contrast or keyboard reachability in the rendered surface.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-074: typography: label blocks accessibility acceptance

- Status: OPEN
- Route / viewport: /tools/typography / 1440x900
- Expected: Controls have accessible names, readable contrast and keyboard access.
- Observed: 1 offending elements, Axe impact critical.
- Reproduction: Open https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/tools/typography/. -> Inspect the visible tool controls and run Axe on the rendered page.
- Before evidence: [audit/evidence/before/tools/typography-1440.png](evidence/before/tools/typography-1440.png)
- Root cause: Rendered tool fields use adjacent visual captions without programmatic association.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/astro.config.mjs`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/advanced-data-table.json`, `apps/site/public/r/ai-file-context-picker.json`, `apps/site/public/r/ai-prompt-composer.json`, `apps/site/public/r/ai-research-answer.json`, `apps/site/public/r/ai-suggested-actions.json`, `apps/site/public/r/area-chart.json`, `apps/site/public/r/bar-chart.json`, `apps/site/public/r/button.json`, `apps/site/public/r/collapsible-sidebar.json`, `apps/site/public/r/cta-minimal.json`, `apps/site/public/r/dashboard-kpi-grid.json`, `apps/site/public/r/dashboard-skeleton.json`, `apps/site/public/r/dialog.json`, `apps/site/public/r/donut-chart.json`, `apps/site/public/r/editorial-hero.json`, `apps/site/public/r/empty-workspace.json`, `apps/site/public/r/entity-profile-header.json`, `apps/site/public/r/error-state.json`, `apps/site/public/r/fade-up-reveal.json`, `apps/site/public/r/faq-accordion.json`, `apps/site/public/r/feature-bento.json`, `apps/site/public/r/feature-matrix.json`, `apps/site/public/r/filter-builder.json`, `apps/site/public/r/footer-product.json`, `apps/site/public/r/input.json`, `apps/site/public/r/kanban-board.json`, `apps/site/public/r/logo-cloud-minimal.json`, `apps/site/public/r/magnetic-button.json`, `apps/site/public/r/marketing-nav-cta.json`, `apps/site/public/r/minimal-top-nav.json`, `apps/site/public/r/notification-centre.json`, `apps/site/public/r/pricing-three-tier.json`, `apps/site/public/r/select.json`, `apps/site/public/r/split-product-hero.json`, `apps/site/public/r/subtle-grid-field.json`, `apps/site/public/r/testimonial-grid.json`, `apps/site/public/r/time-series-chart.json`, `apps/site/public/r/timeline.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `apps/site/src/components/CommandPalette.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/src/components/DnaLab.tsx`, `apps/site/src/components/ExploreView.tsx`, `apps/site/src/components/PreviewHost.tsx`, `apps/site/src/components/ResourceCard.tsx`, `apps/site/src/components/ResourceInspector.tsx`, `apps/site/src/components/ResourcePreviewFrame.tsx`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/SavedCollection.tsx`, `apps/site/src/components/ShowcasePreview.tsx`, `apps/site/src/components/UiGallery.tsx`, `apps/site/src/components/home/AgentsSection.tsx`, `apps/site/src/components/home/AuditPerformanceProof.tsx`, `apps/site/src/components/home/CatalogueMosaic.tsx`, `apps/site/src/components/home/CompatibilityExplanation.tsx`, `apps/site/src/components/home/EssentialVsExperimental.tsx`, `apps/site/src/components/home/FinalComposerFooter.tsx`, `apps/site/src/components/home/HeroComposer.tsx`, `apps/site/src/components/home/NotComponentLibrary.tsx`, `apps/site/src/components/home/SiteHeader.tsx`, `apps/site/src/components/home/StructureComparison.tsx`, `apps/site/src/components/home/ThreeDirectionsDemo.tsx`, `apps/site/src/components/home/WorkbenchReveal.tsx`, `apps/site/src/components/tools/AccessibilityLab.tsx`, `apps/site/src/components/tools/BackgroundStudio.tsx`, `apps/site/src/components/tools/DatavizStyler.tsx`, `apps/site/src/components/tools/IconLab.tsx`, `apps/site/src/components/tools/LayoutComposer.tsx`, `apps/site/src/components/tools/MotionStudio.tsx`, `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/site/src/components/tools/SectionPlanner.tsx`, `apps/site/src/components/tools/ToolsHub.tsx`, `apps/site/src/components/tools/TypographyLab.tsx`, `apps/site/src/layouts/PublicLayout.astro`, `apps/site/src/lib/catalogue.ts`, `apps/site/src/lib/documentation.ts`, `apps/site/src/pages/[category].astro`, `apps/site/src/pages/about/index.astro`, `apps/site/src/pages/agents/index.astro`, `apps/site/src/pages/blueprints/[slug].astro`, `apps/site/src/pages/blueprints/index.astro`, `apps/site/src/pages/collections/index.astro`, `apps/site/src/pages/compose/index.astro`, `apps/site/src/pages/creators/index.astro`, `apps/site/src/pages/docs/[slug].astro`, `apps/site/src/pages/docs/index.astro`, `apps/site/src/pages/docs/registry.astro`, `apps/site/src/pages/explore/index.astro`, `apps/site/src/pages/license/index.astro`, `apps/site/src/pages/pages/index.astro`, `apps/site/src/pages/preview/index.astro`, `apps/site/src/pages/privacy/index.astro`, `apps/site/src/pages/r/[slug].astro`, `apps/site/src/pages/resources/[slug].astro`, `apps/site/src/pages/showcase/[slug].astro`, `apps/site/src/pages/showcase/index.astro`, `apps/site/src/pages/showcases.astro`, `apps/site/src/pages/sponsor/index.astro`, `apps/site/src/pages/terms/index.astro`, `apps/site/src/pages/tools/accessibility.astro`, `apps/site/src/pages/tools/backgrounds.astro`, `apps/site/src/pages/tools/dataviz.astro`, `apps/site/src/pages/tools/dna.astro`, `apps/site/src/pages/tools/icons.astro`, `apps/site/src/pages/tools/index.astro`, `apps/site/src/pages/tools/layout.astro`, `apps/site/src/pages/tools/motion.astro`, `apps/site/src/pages/tools/palette.astro`, `apps/site/src/pages/tools/section-planner.astro`, `apps/site/src/pages/tools/typography.astro`, `apps/site/src/pages/trends/index.astro`, `apps/site/src/styles/global.css`
- Remediation: fix(site): restore real public routes previews and accessible tools
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-075: Domain binding duplicates the screen title across every dashboard section

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: The profile header, summary, activity feed and people table have distinct meaningful labels.
- Observed: The local employee dashboard repeats Team Overview for four unrelated sections.
- Reproduction: Compose the exact employee brief. -> Open Direction C and its Team Overview screen. -> Inspect the section headings.
- Before evidence: [audit/evidence/local-iteration-4b/flagship/07-radical-recomposition.png](evidence/local-iteration-4b/flagship/07-radical-recomposition.png)
- Root cause: New content binding used screen.name for every semantic role.
- Affected code: `packages/compatibility/src/content-bindings.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-076: Employee examples ignore the stated organisation size

- Status: OPEN
- Route / viewport: /compose / 1440x900
- Expected: A 1200-person brief shows that stated size or an honest unconnected-data state.
- Observed: The real Direction C preview still shows 500 people when the brief specifies 1200.
- Reproduction: Open Compose. -> Enter the 1200-person brief from the evidence record. -> Compose and inspect the People KPI in Direction C.
- Before evidence: [audit/evidence/local-iteration-4b/count/wrong-employee-count.png](evidence/local-iteration-4b/count/wrong-employee-count.png)
- Root cause: Employee content binding contained a literal 500-person organisation count.
- Affected code: `packages/compatibility/src/content-bindings.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-077: Playfulness changes manifest metadata without projecting into the resource appearance

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: A local onboarding playfulness change alters the rendered interface and is inherited by its resource children.
- Observed: Changing onboarding playfulness from 0 to 100 leaves its rendered resource radius, accent and text unchanged. Screenshot pixels differ slightly due to interaction state; computed resource appearance does not.
- Reproduction: Open Onboarding in Workbench. -> Select its root in Layers. -> Set Playfulness to 0, then 100 with the keyboard. -> Inspect the actual wizard-content resource tokens.
- Before evidence: [audit/evidence/local-iteration-4b/feel/playfulness-100.png](evidence/local-iteration-4b/feel/playfulness-100.png)
- Root cause: The semantic token normalizer ignored the playfulness dimension.
- Affected code: `packages/renderer/src/tokens/normalizer.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-078: Standalone screen navigation has insufficient accent contrast

- Status: OPEN
- Route / viewport: standalone export / 1440x900
- Expected: The active exported screen control uses the correct contrasting semantic foreground.
- Observed: Desktop standalone Axe reports a serious contrast failure: white text on #6782FF is 3.37:1.
- Reproduction: Download the actual standalone ZIP through Workbench. -> Extract to a clean directory, install and build. -> Run the real preview and inspect desktop accessibility and install diagnostics.
- Before evidence: [audit/evidence/local-iteration-4b/flagship/standalone-1440.png](evidence/local-iteration-4b/flagship/standalone-1440.png)
- Root cause: Generated App navigation hardcodes white instead of the semantic accent foreground.
- Affected code: `packages/exporter/src/source-tree.ts`
- Remediation: fix(composition): render coherent domain resources and portable exports
- Applied commit: `d506d40dafa41227f6313d691f6ce68b5a4601ae`

### AUD-080: React forwarded primitive exports rejected by preview loader

- Status: OPEN
- Route / viewport: /preview/?resource=button / 1440x900
- Expected: The actual Button, Input and Icon Button render from their published source.
- Observed: The loader reports no valid React component export for React forwardRef objects.
- Reproduction: Open /r/button -> Inspect the actual preview
- Before evidence: [audit/evidence/local-iteration-5/resources/button-1440.png](evidence/local-iteration-5/resources/button-1440.png)
- Root cause: PreviewHost treats only JavaScript functions as React components, excluding forwardRef and memo exports.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/src/components/PreviewHost.tsx`, `resources/shells/messaging-shell/index.tsx`
- Remediation: fix(previews): support forwarded components and mobile messaging layout
- Applied commit: `b30caf328b68b087f5052ad1f586a354a97cde5b`

### AUD-084: Palette sample Execute Action control does nothing and implies a real transaction

- Status: OPEN
- Route / viewport: /tools/palette / 1440x900
- Expected: The sample control gives truthful interaction feedback or is explicitly disabled.
- Observed: Clicking Execute Action has no handler, status or effect; the sample badge also says VERIFIED without explaining what is verified.
- Reproduction: Open Palette Studio -> Click Execute Action
- Before evidence: [audit/evidence/deployed-version-2/tool-interactions/palette.png](evidence/deployed-version-2/tool-interactions/palette.png)
- Root cause: The palette demonstration uses a presentation-only button without interaction state and misleading sample labels.
- Affected code: `apps/site/src/components/tools/PaletteStudio.tsx`, `apps/sites/README.md`, `apps/sites/prepare-static.mjs`, `apps/sites/worker.ts`, `docs/DECISIONS.md`
- Remediation: fix(sites): route protected HTML through security worker on native host
- Applied commit: `6ba48a9a31c6f69c46cd0e8170e437fbc870b24e`

### AUD-085: Blend changes project identity without updating URL and reload restores previous project

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: The new blended project opens and reloads under its own identity.
- Observed: Downloaded Blend manifest has a new ID, but URL retains original Direction C; reload opens old Direction C.
- Reproduction: Compose employee directions -> Apply a real Blend -> Export manifest and reload
- Before evidence: [audit/evidence/deployed-version-2/supplemental/blended-project.png](evidence/deployed-version-2/supplemental/blended-project.png)
- Root cause: Workbench autosave journals new manifest IDs but does not update project URL.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/components/left-panel/PagesTab.tsx`
- Remediation: fix(workbench): retain blended identity and accessible page actions
- Applied commit: `23c42bfcdf3a09ba09dcf2605a7a5b0ca33021f2`

### AUD-086: Pages screen selection nests action buttons inside a button role

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: Selection, Duplicate and Delete are independent keyboard controls.
- Observed: Axe reports nine serious nested-interactive violations in employee Pages.
- Reproduction: Open employee Workbench -> Open Pages -> Run Axe
- Before evidence: [audit/evidence/deployed-version-2/supplemental/compare-actual-employee.png](evidence/deployed-version-2/supplemental/compare-actual-employee.png)
- Root cause: Screen row has role=button while containing duplicate/delete buttons.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/components/left-panel/PagesTab.tsx`
- Remediation: fix(workbench): retain blended identity and accessible page actions
- Applied commit: `23c42bfcdf3a09ba09dcf2605a7a5b0ca33021f2`

### AUD-087: Pages duplicate and delete controls fail touch target requirements

- Status: OPEN
- Route / viewport: /workbench / 1440x900
- Expected: Page actions have adequate pointer target sizes.
- Observed: Axe reports 18 serious target-size failures; controls are only 20px.
- Reproduction: Open Pages in employee Workbench -> Inspect Duplicate/Delete target sizes
- Before evidence: [audit/evidence/deployed-version-2/supplemental/duplicate-screen.png](evidence/deployed-version-2/supplemental/duplicate-screen.png)
- Root cause: Page action buttons use 12px icons and only 4px padding.
- Affected code: `packages/workbench/src/components/WorkbenchShell.tsx`, `packages/workbench/src/components/left-panel/PagesTab.tsx`
- Remediation: fix(workbench): retain blended identity and accessible page actions
- Applied commit: `23c42bfcdf3a09ba09dcf2605a7a5b0ca33021f2`

### AUD-088: Explore discards search relevance order and puts unrelated cards before an exact resource match

- Status: OPEN
- Route / viewport: /explore/?q=advanced+data+table / 1440x900
- Expected: The exact Advanced Data Table resource ranks before unrelated Activity Feed cards.
- Observed: The visible first preview is Activity Feed after searching advanced data table.
- Reproduction: Open Explore -> Search advanced data table -> Inspect first result
- Before evidence: [audit/evidence/deployed-version-2/search-ranking-before.png](evidence/deployed-version-2/search-ranking-before.png)
- Root cause: Explore converts ranked Orama hits to an ID set and filters the original catalogue order, destroying relevance ordering.
- Affected code: `apps/site/src/components/ExploreView.tsx`
- Remediation: fix(search): retain canonical resource relevance ordering
- Applied commit: `af2a3e70435605e06d7190eafbf347d401df2789`

### AUD-089: Hosting edge injects bot detection that violates isolated preview CSP

- Status: OPEN
- Route / viewport: /preview/?resource=accessibility-commitment-section / 1440x900;390x844
- Expected: Only canonical application scripts run; isolated previews make no network connections.
- Observed: Injected cdn-cgi challenge script creates an extra iframe and a CSP-blocked request on real preview pages.
- Reproduction: Open an isolated preview on deployed version 3 -> Inspect console and failed requests
- Before evidence: [audit/evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png](evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png)
- Root cause: Hosting edge transforms HTML unless the origin declares Cache-Control no-transform.
- Affected code: `apps/sites/worker.ts`
- Remediation: Declare no-transform for HTML, preserving strict CSP without allowing challenge network requests.
- Applied commit: `c95b43527eacf4bedc32c45b31eddec6a8314b80`

### AUD-090: Accessibility resource invents certification and universal compliance

- Status: OPEN
- Route / viewport: /preview/?resource=accessibility-commitment-section / 1440x900;390x844
- Expected: Portable example clearly states accessibility goals, not unverified certification.
- Observed: AA CERTIFIED, 100% keyboard support and universal verified contrast appear without supporting evidence.
- Reproduction: Open accessibility commitment preview -> Read badges and pillars
- Before evidence: [audit/evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png](evidence/deployed-version-3/resources/accessibility-commitment-section-1440.png)
- Root cause: Hardcoded resource copy presents design targets as measured certification.
- Affected code: `resources/sections/accessibility-commitment-section/index.tsx`
- Remediation: Replace certification and universal claims with explicit design targets and integration verification guidance.
- Applied commit: `c844313604c45cfbbea0db4d15a741fcafbfc4d0`

### AUD-091: Mobile navigation overlay cannot close with Escape or contain keyboard focus

- Status: OPEN
- Route / viewport: / / 390x844
- Expected: Navigation overlay has dialog semantics, contains Tab focus, closes with Escape and returns focus to its toggle.
- Observed: Escape leaves aria-expanded true; the overlay lacks dialog keyboard handling.
- Reproduction: Focus mobile menu toggle -> Press Enter -> Press Escape
- Before evidence: [audit/evidence/deployed-version-3/mobile-menu-escape-before.png](evidence/deployed-version-3/mobile-menu-escape-before.png)
- Root cause: Mobile drawer is a conditional div without the existing shared dialog focus hook.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`
- Remediation: Reuse shared focus containment and restoration hook, add dialog semantics and a truthful Close control.
- Applied commit: `6599d03435a58351d92216beaf9986d44680a02a`

### AUD-092: Homepage dark agent example inherits light muted tokens

- Status: OPEN
- Route / viewport: / / 1440x900;390x844
- Expected: Text on dark examples meets AA contrast.
- Observed: Muted labels measure 3.25:1 against #111217; Axe reports serious contrast failures.
- Reproduction: Open homepage -> Scroll to agent example -> Inspect text and contrast
- Before evidence: [audit/evidence/deployed-version-4/agent-example-before-390.png](evidence/deployed-version-4/agent-example-before-390.png)
- Root cause: Dark example surface lacks the shared .dark token scope.
- Affected code: `apps/site/src/components/home/AgentsSection.tsx`
- Remediation: Apply shared dark semantic token scope, preserving global light shell tokens.
- Applied commit: `1a00169483d8b7ad72b1bf762547abbd0b5df94c`

### AUD-093: Homepage labels a noncanonical pseudo-manifest as validated schema

- Status: OPEN
- Route / viewport: / / 1440x900;390x844
- Expected: Example uses canonical contract fields and discloses that it is an excerpt.
- Observed: VALIDATED SCHEMA badge accompanies invented archetype and obsolete DNA fields.
- Reproduction: Open homepage -> Scroll to agent example -> Inspect text and contrast
- Before evidence: [audit/evidence/deployed-version-4/agent-example-before-390.png](evidence/deployed-version-4/agent-example-before-390.png)
- Root cause: Static illustrative copy diverged from the canonical manifest contracts and made an unverified validation claim.
- Affected code: `apps/site/src/components/home/AgentsSection.tsx`
- Remediation: Use canonical employee manifest fields and explicitly label the incomplete example ILLUSTRATIVE EXCERPT.
- Applied commit: `1a00169483d8b7ad72b1bf762547abbd0b5df94c`

### AUD-094: 1024px public navigation clips the primary Start building control

- Status: OPEN
- Route / viewport: / / 1024x900
- Expected: Primary controls and navigation fit intentionally at tablet/desktop breakpoints.
- Observed: Document overflows to 1088px at 1024px; Start building extends beyond the right edge.
- Reproduction: Open route at stated width -> Activate primary navigation/export control
- Before evidence: [audit/evidence/deployed-version-4/header-1024-before.png](evidence/deployed-version-4/header-1024-before.png)
- Root cause: Full desktop navigation activates at 1024px before its combined minimum width can fit.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`
- Remediation: Activate full navigation at 1280px and retain the working navigation drawer below that width.
- Applied commit: `a81ef51bcb98e6e42d862b84dbc2153c75bc8ce3`

### AUD-095: Mobile Workbench canvas intercepts Export menu taps

- Status: OPEN
- Route / viewport: /workbench / 390x844
- Expected: Manifest and ZIP choices are tappable above the project canvas and fit within the screen.
- Observed: Actual export choice clicks are intercepted by the generated navigation; the popup extends past the left edge.
- Reproduction: Open route at stated width -> Activate primary navigation/export control
- Before evidence: [audit/evidence/deployed-version-4/mobile-export-before.png](evidence/deployed-version-4/mobile-export-before.png)
- Root cause: Resource navigation z-index escapes an unscoped mobile canvas and exceeds the toolbar stacking level.
- Affected code: `packages/workbench/src/components/mobile/MobileWorkbench.tsx`, `packages/workbench/src/components/TopToolbar.tsx`
- Remediation: Create a local mobile canvas stacking context and constrain the small-screen export popup to viewport gutters.
- Applied commit: `f1898713cf8ddf930f6d8770b1426fc5e2d285fc`

### AUD-096: Shared Compose header overflows at the 1024px breakpoint

- Status: OPEN
- Route / viewport: /compose / 1024x900
- Expected: Shared public header fits at tablet width without clipping primary controls.
- Observed: Compose document measures 1039px at a 1024px viewport; Start building extends offscreen.
- Reproduction: Open route at stated viewport -> Inspect header or open Mobile Workbench Audit
- Before evidence: [audit/evidence/deployed-version-4/compose-header-1024-before.png](evidence/deployed-version-4/compose-header-1024-before.png)
- Root cause: Shared Header activates its full desktop nav at 1024px before minimum content width fits.
- Affected code: `packages/ui/src/components/header.tsx`
- Remediation: Use the intentional navigation sheet below 1280px, matching the corrected homepage header.
- Applied commit: `a81ef51bcb98e6e42d862b84dbc2153c75bc8ce3`

### AUD-097: Mobile Audit results scrolling region is not keyboard focusable

- Status: OPEN
- Route / viewport: /workbench / 390x844
- Expected: Keyboard users can focus and scroll project audit diagnostics.
- Observed: Axe reports serious scrollable-region-focusable failure in the mobile Audit results.
- Reproduction: Open route at stated viewport -> Inspect header or open Mobile Workbench Audit
- Before evidence: [audit/evidence/deployed-version-4/mobile-audit-before.png](evidence/deployed-version-4/mobile-audit-before.png)
- Root cause: Scrollable results container has no focusable child when no fixes are available and lacks tabindex.
- Affected code: `packages/workbench/src/components/audit/AuditPanel.tsx`
- Remediation: Name the results region and make it focusable without altering audit content or disabling accessibility rules.
- Applied commit: `d840283be402234f08a51cdc88ba720de86459b4`

### AUD-098: Scrollable documentation code cannot receive keyboard focus

- Status: OPEN
- Route / viewport: /docs/registry / 390x844
- Expected: Keyboard users can focus and scroll long registry commands and code examples.
- Observed: Registry pre overflows at mobile width and Axe reports serious scrollable-region-focusable failure.
- Reproduction: Open Registry docs at 390px -> Tab to the overflowing command -> Inspect keyboard access and Axe findings
- Before evidence: [audit/evidence/deployed-version-4/docs-keyboard-before.png](evidence/deployed-version-4/docs-keyboard-before.png)
- Root cause: Scrollable code blocks lack tabindex; the same pattern appears in Compose JSON details, resource source tabs and canonical Markdown.
- Affected code: `apps/site/src/pages/docs/registry.astro`, `apps/site/src/components/ResourceTabs.tsx`, `apps/site/src/components/ComposeView.tsx`, `apps/site/astro.config.mjs`
- Remediation: Make authored code blocks focusable and add a build-time Markdown transform for pre/table keyboard access.
- Applied commit: `d840283be402234f08a51cdc88ba720de86459b4`

### AUD-100: Unverified uptime and benchmark measurements

- Status: OPEN
- Route / viewport: /preview/?resource=customer-metrics-strip / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Resource demos present invented figures as measured or audited product evidence.
- Reproduction: Open the resource preview. -> Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/customer-metrics-strip-1440.png](evidence/deployed-version-4/resources/customer-metrics-strip-1440.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Applied commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-101: Invented compliance certifications

- Status: OPEN
- Route / viewport: /preview/?resource=compliance-proof / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Resource demos claim independent certification and guaranteed compliance without evidence.
- Reproduction: Open the resource preview. -> Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/compliance-proof-1440.png](evidence/deployed-version-4/resources/compliance-proof-1440.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Applied commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-102: Fabricated adoption and review counts

- Status: OPEN
- Route / viewport: /preview/?resource=social-proof-hero / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Social proof hero presents invented teams and review counts as real Tessellate adoption.
- Reproduction: Open the resource preview. -> Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/social-proof-hero-1440.png](evidence/deployed-version-4/resources/social-proof-hero-1440.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Applied commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-103: Fabricated customer testimonials

- Status: OPEN
- Route / viewport: /preview/?resource=testimonial-quote / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Three testimonial layouts attribute invented endorsements to named customers.
- Reproduction: Open the resource preview. -> Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/testimonial-quote-1440.png](evidence/deployed-version-4/resources/testimonial-quote-1440.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Applied commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-104: Unconfigured enterprise services advertised

- Status: OPEN
- Route / viewport: /preview/?resource=pricing-enterprise / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Enterprise template advertises VPC, R2, SOC2 attestations and dedicated support that are not configured.
- Reproduction: Open the resource preview. -> Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/pricing-enterprise-1440.png](evidence/deployed-version-4/resources/pricing-enterprise-1440.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Applied commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-105: Enterprise consultation button has no action

- Status: OPEN
- Route / viewport: /preview/?resource=pricing-enterprise / 1440x900; 390x844
- Expected: Demonstrations identify illustrative content and require evidence or a configured integration.
- Observed: Enabled consultation button has no handler or destination.
- Reproduction: Open the resource preview. -> Read the default content or activate the consultation button.
- Before evidence: [audit/evidence/deployed-version-4/resources/pricing-enterprise-1440.png](evidence/deployed-version-4/resources/pricing-enterprise-1440.png)
- Root cause: Unqualified fabricated defaults in reusable resource source and fixtures.
- Affected code: `resources/sections/compliance-proof/index.tsx`, `resources/sections/customer-metrics-strip/fixtures.ts`, `resources/sections/customer-metrics-strip/index.tsx`, `resources/sections/feature-comparison/index.tsx`, `resources/sections/performance-benchmark-section/index.tsx`, `resources/sections/pricing-enterprise/index.tsx`, `resources/sections/social-proof-hero/fixtures.ts`, `resources/sections/social-proof-hero/index.tsx`, `resources/sections/testimonial-carousel/fixtures.ts`, `resources/sections/testimonial-carousel/index.tsx`, `resources/sections/testimonial-grid/fixtures.ts`, `resources/sections/testimonial-grid/index.tsx`, `resources/sections/testimonial-quote/fixtures.ts`, `resources/sections/testimonial-quote/index.tsx`, `resources/sections/trust-badges-strip/fixtures.ts`, `resources/sections/trust-badges-strip/index.tsx`, `resources/typography/counter-typography/index.tsx`, `resources/typography/text-path-arc/index.tsx`
- Remediation: fix(resources): replace fabricated product claims with explicit examples
- Applied commit: `5c79c062529840b4b5ce2a15145f18c9a12529cc`

### AUD-106: Loaded resource previews have insufficient text and action contrast

- Status: OPEN
- Route / viewport: /explore; /preview/?resource=ai-approval-request / 1440x900; 390x844
- Expected: Visible preview labels and primary actions meet WCAG AA contrast.
- Observed: Amber action 3.19:1, warning labels 2.71:1, emerald target labels fail Axe contrast.
- Reproduction: Wait for visible Explore previews to load. -> Run Axe with iframe content included. -> Open the accessibility commitment and approval request previews.
- Before evidence: [audit/evidence/local-v5-acceptance/responsive-keyboard/explore-1440.png](evidence/local-v5-acceptance/responsive-keyboard/explore-1440.png)
- Root cause: Decorative amber and emerald shade 600 used for small text and white button labels.
- Affected code: `resources/ai/ai-approval-request/index.tsx`, `resources/sections/accessibility-commitment-section/index.tsx`
- Remediation: fix(a11y): restore contrast in loaded catalogue previews
- Applied commit: `1d5cc6ea426f5484f589287de7aa98c80dee4525`

## MEDIUM

### AUD-040: Surprise provides no change explanation

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: Visible explanation accurately reports mutations and preserved locks.
- Observed: Change occurs but user sees no explanation.
- Reproduction: Click Surprise and inspect feedback.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: Returned operation rationale is not surfaced in shell.
- Affected code: `packages/workbench/src/components/TopToolbar.tsx`, `packages/workbench/src/store/workbench-store.ts`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-041: 430px canvas preset missing

- Status: OPEN
- Route / viewport: /workbench / 1440x900; 390x844
- Expected: All requested device widths can be selected.
- Observed: Toolbar offers 1440,1024,768,390 only.
- Reproduction: Inspect canvas viewport controls.
- Before evidence: [audit/evidence/before/instrumented/flagship-workbench.png](evidence/before/instrumented/flagship-workbench.png)
- Root cause: DevicePreset omits 430 and toolbar repeats restricted list.
- Affected code: `packages/workbench/src/types.ts`, `packages/workbench/src/components/canvas/CanvasToolbar.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `9ba4517421a716ff4f8cc6ceea304d9fa19914da`

### AUD-045: Sign in link mislabels local Workbench

- Status: OPEN
- Route / viewport: / / 1440x900; 390x844
- Expected: Navigation reflects actual unauthenticated staging behavior.
- Observed: Sign in opens local Workbench without sign-in.
- Reproduction: Click Sign in.
- Before evidence: [audit/evidence/before/instrumented/home-1440.png](evidence/before/instrumented/home-1440.png)
- Root cause: Static header label implies unavailable authentication flow.
- Affected code: `apps/site/src/components/home/SiteHeader.tsx`
- Remediation: Pending root-cause remediation and deployed verification.
- Applied commit: `08c06b875e7b2c11c95593279ba4e418332099ed`

### AUD-081: Messaging shell sidebar and input overflow at mobile width

- Status: OPEN
- Route / viewport: /preview/?resource=messaging-shell / 390x844
- Expected: Channels and message pane remain usable at 390px.
- Observed: Fixed 224px sidebar and implicit input minimum cause a 419px document.
- Reproduction: Open messaging shell resource preview at 390px
- Before evidence: [audit/evidence/local-iteration-5/resources/messaging-shell-390.png](evidence/local-iteration-5/resources/messaging-shell-390.png)
- Root cause: The shell has no container breakpoint or minimum-width reset.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/src/components/PreviewHost.tsx`, `resources/shells/messaging-shell/index.tsx`
- Remediation: fix(previews): support forwarded components and mobile messaging layout
- Applied commit: `b30caf328b68b087f5052ad1f586a354a97cde5b`

### AUD-082: Master detail resource overflows mobile and uses pointer-only selection

- Status: OPEN
- Route / viewport: /r/two-pane-master-detail-shell / 390x844
- Expected: The queue stacks above details at narrow widths and selection supports keyboard.
- Observed: Fixed 320px queue and detail padding produce a 459px document; queue items are clickable divs.
- Reproduction: Open the actual master-detail preview at 390px -> Try selecting another incident with Tab and Enter
- Before evidence: [audit/evidence/local-iteration-6/resources/two-pane-master-detail-shell-390.png](evidence/local-iteration-6/resources/two-pane-master-detail-shell-390.png)
- Root cause: Fixed horizontal layout lacks container breakpoint; queue selection has no semantic button.
- Affected code: `apps/preview/public/data/catalog.json`, `apps/preview/public/data/catalog.min.json`, `apps/site/public/data/catalog.json`, `apps/site/public/data/catalog.min.json`, `apps/site/public/data/showcases/showcase-ai-developer-platform.json`, `apps/site/public/data/showcases/showcase-creator-analytics.json`, `apps/site/public/data/showcases/showcase-financial-terminal.json`, `apps/site/public/data/showcases/showcase-luxury-ecommerce.json`, `apps/site/public/data/showcases/showcase-luxury-hospitality.json`, `apps/site/public/data/showcases/showcase-minimal-productivity.json`, `apps/site/public/data/showcases/showcase-playful-hr.json`, `apps/site/public/data/showcases/showcase-scientific-research.json`, `apps/site/public/r/messaging-shell.json`, `apps/site/public/r/two-pane-master-detail-shell.json`, `packages/exporter/src/generated-gold-sources.ts`, `resources/shells/two-pane-master-detail-shell/index.tsx`
- Remediation: fix(resources): make master detail responsive and keyboard selectable
- Applied commit: `27c59b2e7471c0bee4860999c6ae3029e0ac07d3`

### AUD-099: Catalogue creates excessive offscreen preview contexts before filtering

- Status: OPEN
- Route / viewport: /explore / 1440x900;390x844
- Expected: Only nearby resource previews mount; filtering avoids large unnecessary document request batches.
- Observed: Initial 50-result view creates 50 iframe contexts; fast filtering cancels many preview documents.
- Reproduction: Open Explore -> Search advanced data table as catalogue loads -> Inspect preview document requests and iframe count
- Before evidence: [audit/evidence/deployed-version-4/catalogue-preview-window-before.png](evidence/deployed-version-4/catalogue-preview-window-before.png)
- Root cause: Browser-native iframe lazy loading alone has a broad loading threshold and still creates every browsing context.
- Affected code: `apps/site/src/components/ResourceCard.tsx`
- Remediation: Use IntersectionObserver to mount real previews within 160px of the viewport, retaining a browser-capability fallback.
- Applied commit: `ab6e2cb6e13b0cda59a6255920608968b971b5ff`

## LOW

### AUD-079: Standalone npm install emits an unsupported project configuration warning

- Status: OPEN
- Route / viewport: standalone export / 1440x900
- Expected: The portable export installs without package-manager-specific configuration warnings.
- Observed: npm warns that only-built-dependencies is an unknown project configuration.
- Reproduction: Download the actual standalone ZIP through Workbench. -> Extract to a clean directory, install and build. -> Run the real preview and inspect desktop accessibility and install diagnostics.
- Before evidence: [audit/runtime-audit.json](runtime-audit.json)
- Root cause: Exporter writes a pnpm-specific setting into .npmrc, which npm does not support.
- Affected code: `packages/exporter/src/source-tree.ts`
- Remediation: test(export): verify preview readiness through real HTTP response
- Applied commit: `76e106e506cb0afd12a43d1f2f2f2095459dd174`
