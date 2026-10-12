# Tessellate runtime audit

Status: **NOT ACCEPTED**. This is the initial deployed baseline, not a success report. Issues close only after re-auditing the fixed deployed version.

Source: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site

Evidence uses actual UI, downloaded manifests and clean ZIP installation/build. No stores were called to complete the flagship workflow. Offscreen `client:visible` islands are not hydration exceptions.

## CRITICAL

### AUD-023: Employee brief inferred as analytics

- Route/viewport: /compose; 1440x900; 390x844
- Expected: Employee experience architecture with people, teams, onboarding, engagement and policies.
- Actual: ANALYTICS model targets analysts and quantitative metrics; no onboarding screen, no people or teams.
- Reproduction: Wait for catalogue ready. → Submit the exact employee brief, professional but playful, Refined and Inventive.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-directions.png)
- Root cause: Substring archetype detection rewards incidental dashboard/technical words; planner substitutes fixed telemetry screens and ignores recommended domain screens.
- Affected code: packages/composer/src/archetypes.ts, packages/composer/src/interpreter.ts, packages/composer/src/planner.ts
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-024: Semantically unrelated Gold resources fill required roles

- Route/viewport: /compose; 1440x900; 390x844
- Expected: Each role resolves to a compatible working resource.
- Actual: Marketing value proposition and CTA become three-pane shells; dashboard metrics become Nav Tree / Visual Canvas / Inspector; grammar panes duplicate across all screen types.
- Reproduction: Compose the employee brief. → Inspect each direction and Workbench screens.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-directions.png)
- Root cause: Role matching accepts grammar categories and falls back to every Gold resource; screen roles union application grammar roles irrespective of screen class.
- Affected code: packages/compatibility/src/compose-pipeline.ts
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-028: Reload silently discards project edits

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Edits, locks and local overrides survive reload.
- Actual: After recompose, replacement and Surprise, reload returns the initial manifest with no locks or edits.
- Reproduction: Open Direction C. → Lock a section, Recompose, Replace, Surprise. → Export manifest. → Reload and export again.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Shell loads initial localStorage snapshot; mutations are not persisted.
- Affected code: packages/workbench/src/components/WorkbenchShell.tsx, packages/workbench/src/persistence/storage.ts
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-029: Standalone export fails a clean build

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: ZIP installs, builds and runs without repository packages.
- Actual: npm install succeeds, npm run build fails: gradient-fill is not assignable to AreaChartVariant.
- Reproduction: Replace overview header with offered area-chart. → Export ZIP. → Extract into a clean directory. → npm install --no-audit --no-fund; npm run build.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Replacement uses a fabricated sample catalogue with variants that do not exist in canonical resource source.
- Affected code: packages/workbench/src/mutations/replace.ts, packages/exporter/src
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

## HIGH

### AUD-001: Public route /components is missing

- Route/viewport: /components; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /components at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/components-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-002: Public route /sections is missing

- Route/viewport: /sections; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /sections at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/sections-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-003: Public route /blocks is missing

- Route/viewport: /blocks; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /blocks at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/blocks-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-004: Public route /pages is missing

- Route/viewport: /pages; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /pages at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/pages-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-005: Public route /effects is missing

- Route/viewport: /effects; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /effects at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/effects-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-006: Public route /motion is missing

- Route/viewport: /motion; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /motion at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/motion-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-007: Public route /backgrounds is missing

- Route/viewport: /backgrounds; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /backgrounds at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/backgrounds-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-008: Public route /ai is missing

- Route/viewport: /ai; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /ai at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/ai-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-009: Public route /data is missing

- Route/viewport: /data; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /data at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/data-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-010: Public route /blueprints is missing

- Route/viewport: /blueprints; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /blueprints at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/blueprints-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-011: Public route /collections is missing

- Route/viewport: /collections; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /collections at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/collections-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-012: Public route /about is missing

- Route/viewport: /about; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /about at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/about-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-013: Public route /agents is missing

- Route/viewport: /agents; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /agents at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/agents-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-014: Public route /creators is missing

- Route/viewport: /creators; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /creators at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/creators-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-015: Public route /docs is missing

- Route/viewport: /docs; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /docs at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/docs-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-016: Public route /docs/registry is missing

- Route/viewport: /docs/registry; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /docs/registry at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/docs-registry-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-017: Public route /license is missing

- Route/viewport: /license; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /license at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/license-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-018: Public route /privacy is missing

- Route/viewport: /privacy; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /privacy at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/privacy-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-019: Public route /showcase is missing

- Route/viewport: /showcase; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /showcase at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/showcase-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-020: Public route /sponsor is missing

- Route/viewport: /sponsor; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /sponsor at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/sponsor-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-021: Public route /terms is missing

- Route/viewport: /terms; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /terms at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/terms-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-022: Public route /trends is missing

- Route/viewport: /trends; 1440x900; 390x844
- Expected: A useful, truthful page with working navigation.
- Actual: HTTP 404 and generic not-found page.
- Reproduction: Open /trends at desktop and mobile widths.
- Evidence: [screenshot](../audit/evidence/before/instrumented/trends-1440.png)
- Root cause: No Astro page or route alias implements this public destination.
- Affected code: apps/site/src/pages
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-025: Generated product inherits resource demo content

- Route/viewport: /compose; 1440x900; 390x844
- Expected: Brand, copy and sample records match the submitted objective, with sample data identified.
- Actual: Tessellate marketing text, fake testimonials and ingestion/incidents/CPU/token data appear in employee product.
- Reproduction: Inspect all three direction previews. → Open settings and dashboard in Workbench.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-directions.png)
- Root cause: Composition creates only a title prop, leaving domain-specific resource defaults intact.
- Affected code: packages/compatibility/src/compose-pipeline.ts, resources
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-026: Repeated composition overwrites project identity

- Route/viewport: /compose; 1440x900; 390x844
- Expected: Separate briefs create separate persisted projects while explicit seeds remain deterministic.
- Actual: Every Direction C uses proj-direction-c-tessellateseedv1dirc.
- Reproduction: Compose two different briefs. → Compare project URLs.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-directions.png)
- Root cause: UI reuses fixed default seed as persisted project identity.
- Affected code: apps/site/src/components/ComposeView.tsx, packages/compatibility/src/compose-pipeline.ts
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-027: Direction previews are too small to inspect

- Route/viewport: /compose; 1440x900; 390x844
- Expected: Readable previews with screen navigation and distinct structural direction.
- Actual: Three tiny clipped/scaled marketing heroes conceal the rest of the product; all use same hero content.
- Reproduction: Inspect all three previews at desktop and mobile.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-directions.png)
- Root cause: Fixed miniature frame without accessible full direction preview or screen selector.
- Affected code: apps/site/src/components/ComposeView.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-030: Replacement offers incompatible resource

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Candidates satisfy the semantic role and hard constraints using the actual Gold catalogue.
- Actual: Only area-chart is offered for entity-profile-header; no meaningful candidate preview.
- Reproduction: Select overview-header. → Open Replace.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Hardcoded four-resource catalogue and permissive same-section-type match override semantics.
- Affected code: packages/workbench/src/mutations/replace.ts, packages/workbench/src/components/replace/ReplaceDrawer.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-031: Replacement previews are synthetic drawings

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Candidate displays its actual renderer and content.
- Actual: Generic chart bars, grey rectangles or fake dollar metric replace actual candidate components.
- Reproduction: Open Replace and inspect its candidates.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: ResourceVisualPreview draws mock graphics instead of canonical renderer.
- Affected code: packages/workbench/src/components/replace/ReplaceDrawer.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-032: Compare uses unrelated financial project

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Compare targets the initial checkpoint of this exact project.
- Actual: Apex Financial Intelligence is comparison baseline for employee brief.
- Reproduction: Open Direction C. → Click Compare.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: setManifest resets history but retains sample-project checkpoint.
- Affected code: packages/workbench/src/store/workbench-store.ts
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-033: Blend invents a financial source direction

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Blend uses an actual saved direction of the current brief or truthfully requires one.
- Actual: Source B is a renamed sample fintech manifest with fabricated DNA.
- Reproduction: Open Direction C. → Click Blend.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: BlendModal constructs createSampleProject rather than loading composition siblings.
- Affected code: packages/workbench/src/components/blend/BlendModal.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-034: Toolbar modes do not open corresponding inspector

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Style, Motion and Content display the appropriate controls.
- Actual: Top mode changes but right inspector remains Intent.
- Reproduction: Click each top mode after opening Workbench.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: setActiveMode only sets activeMode, not activeRightTab.
- Affected code: packages/workbench/src/store/workbench-store.ts
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-035: Unnamed Workbench and direction controls

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Every interactive control has an accessible name.
- Actual: Axe critical button-name and label failures (7 Workbench ranges, 3 direction ranges).
- Reproduction: Run unsuppressed Axe on Compose directions and Workbench. → Navigate controls by keyboard.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Range controls lack linked labels; layer expanders and default sample buttons lack names.
- Affected code: packages/workbench/src/components/right-inspector, packages/workbench/src/components/left-panel, apps/site/src/components/ComposeView.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-036: Selection and lock tiles are not keyboard controls

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Keyboard users can select page/layer and toggle locks.
- Actual: Clickable div rows and lock tiles are omitted from tab order.
- Reproduction: Tab through Layers and Locks inspector.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Click handlers use generic divs without keyboard semantics.
- Affected code: packages/workbench/src/components/left-panel, packages/workbench/src/components/right-inspector/ConstraintsTab.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-037: Workbench mixes unreadable dark and light chrome

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Calm coherent shell with readable project title and inspector.
- Actual: Near-white title on light toolbar and mixed dark/light areas; mobile canvas begins with huge empty shell panes.
- Reproduction: Open Workbench at 1440, 1024 and 390.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Dark variants apply via preference without coherent explicit theme tokens; resource shell fallback compounds unusable canvas.
- Affected code: apps/site/src/styles/global.css, packages/workbench/src/components
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-038: Mobile omits primary editing controls

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Primary modes, replacement, export and viewport operations remain usable.
- Actual: Mobile Inspect includes only Intent, Style and Locks; Resource, Content, Motion and Export missing.
- Reproduction: Open Workbench at 390x844. → Use all bottom tabs.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Separate MobileWorkbench duplicates a restricted subset of desktop controls.
- Affected code: packages/workbench/src/components/mobile/MobileWorkbench.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-039: Audit score implies unverified accessibility

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Audit distinguishes manifest heuristics from measured runtime compliance.
- Actual: Accessibility 20/20 and responsive 15/15 despite critical and serious Axe failures.
- Reproduction: Open Audit. → Compare with captured Axe evidence.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Audit labels heuristic checks as compliance and does not explain measurement limits.
- Affected code: packages/workbench/src/components/audit/AuditPanel.tsx, packages/workbench/src/audit
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-042: Resource preview silently renders Button

- Route/viewport: /r/area-chart; 1440x900; 390x844
- Expected: Area chart detail displays its actual chart.
- Actual: iframe shows button despite chart title and source.
- Reproduction: Open /r/area-chart and inspect preview.
- Evidence: [screenshot](../audit/evidence/before/instrumented/r-area-chart-1440.png)
- Root cause: PreviewHost selects fallback component instead of full canonical registry.
- Affected code: apps/site/src/components/PreviewHost.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-043: Use in Workbench ignores selected resource

- Route/viewport: /r/button; 1440x900; 390x844
- Expected: Chosen resource opens in a real new or current project with that resource.
- Actual: ?resource=button loads the previous project unchanged.
- Reproduction: Open /r/button. → Click Use in Workbench.
- Evidence: [screenshot](../audit/evidence/before/instrumented/r-button-1440.png)
- Root cause: Workbench bootstrap ignores resource URL parameter.
- Affected code: packages/workbench/src/components/WorkbenchShell.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-044: Header Search click opens nothing

- Route/viewport: /; 1440x900; 390x844
- Expected: Click opens a usable search palette, Escape closes and restores focus.
- Actual: No modal or search input appears.
- Reproduction: Click header Search.
- Evidence: [screenshot](../audit/evidence/before/instrumented/home-1440.png)
- Root cause: SiteHeader mounts CommandPalette without isOpen; palette internal state starts closed.
- Affected code: apps/site/src/components/home/SiteHeader.tsx, apps/site/src/components/CommandPalette.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-046: Homepage mosaic links refer to nonexistent resources

- Route/viewport: /; 1440x900; 390x844
- Expected: Every resource link resolves to its actual catalogue record.
- Actual: telemetry-chart and metric-card routes return404.
- Reproduction: Click corresponding mosaic resources.
- Evidence: [screenshot](../audit/evidence/before/instrumented/home-1440.png)
- Root cause: Static slug strings refer to legacy sample resources absent from324 catalogue.
- Affected code: apps/site/src/components/home/CatalogueMosaic.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-047: Homepage claims measured perfect accessibility

- Route/viewport: /; 1440x900; 390x844
- Expected: Public claims are supported and clearly distinguish illustration.
- Actual: Audit100/100 AACompliant and zero-debt accessibility appear despite captured serious failures.
- Reproduction: Inspect homepage Workbench reveal.
- Evidence: [screenshot](../audit/evidence/before/instrumented/home-1440.png)
- Root cause: Hardcoded demonstration score presented without qualification.
- Affected code: apps/site/src/components/home/WorkbenchReveal.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-048: Shared muted text fails contrast

- Route/viewport: /; 1440x900; 390x844
- Expected: Normal text meets WCAG AA in each theme.
- Actual: Serious Axe color-contrast failures: homepage36, Explore52, Compose56, Workbench19 nodes.
- Reproduction: Run Axe without disabling contrast on all major routes.
- Evidence: [screenshot](../audit/evidence/before/instrumented/home-1440.png)
- Root cause: Muted#8B8F97 and opacity reductions are too light on paper; dark/light hardcoded combinations fail.
- Affected code: apps/site/src/styles/global.css, packages/ui, apps/site/src/components
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-049: Sites static runtime drops security headers

- Route/viewport: /; 1440x900; 390x844
- Expected: Deployment preserves declared CSP, nosniff, referrer and frame policies.
- Actual: Live responses contain none of the headers specified in _headers.
- Reproduction: Inspect live HTTP response headers for document and catalogue.
- Evidence: [screenshot](../audit/evidence/before/instrumented/home-1440.png)
- Root cause: Sites native static hosting does not interpret Cloudflare Pages _headers.
- Affected code: apps/sites/prepare-static.mjs, .openai/hosting.json, apps/site/public/_headers
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

## MEDIUM

### AUD-040: Surprise provides no change explanation

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: Visible explanation accurately reports mutations and preserved locks.
- Actual: Change occurs but user sees no explanation.
- Reproduction: Click Surprise and inspect feedback.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: Returned operation rationale is not surfaced in shell.
- Affected code: packages/workbench/src/components/TopToolbar.tsx, packages/workbench/src/store/workbench-store.ts
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-041: 430px canvas preset missing

- Route/viewport: /workbench; 1440x900; 390x844
- Expected: All requested device widths can be selected.
- Actual: Toolbar offers 1440,1024,768,390 only.
- Reproduction: Inspect canvas viewport controls.
- Evidence: [screenshot](../audit/evidence/before/instrumented/flagship-workbench.png)
- Root cause: DevicePreset omits 430 and toolbar repeats restricted list.
- Affected code: packages/workbench/src/types.ts, packages/workbench/src/components/canvas/CanvasToolbar.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

### AUD-045: Sign in link mislabels local Workbench

- Route/viewport: /; 1440x900; 390x844
- Expected: Navigation reflects actual unauthenticated staging behavior.
- Actual: Sign in opens local Workbench without sign-in.
- Reproduction: Click Sign in.
- Evidence: [screenshot](../audit/evidence/before/instrumented/home-1440.png)
- Root cause: Static header label implies unavailable authentication flow.
- Affected code: apps/site/src/components/home/SiteHeader.tsx
- Remediation: Pending root-cause remediation and deployed verification.
- Status: OPEN

## LOW

## Route classifications

| Route | Classification | HTTP | Evidence |
|---|---|---|---|
| / | DEGRADED | 200 | [screenshot](../audit/evidence/before/instrumented/home-1440.png) |
| /explore/ | DEGRADED | 307, 200 | [screenshot](../audit/evidence/before/instrumented/explore-1440.png) |
| /components | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/components-1440.png) |
| /sections | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/sections-1440.png) |
| /blocks | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/blocks-1440.png) |
| /pages | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/pages-1440.png) |
| /effects | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/effects-1440.png) |
| /motion | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/motion-1440.png) |
| /backgrounds | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/backgrounds-1440.png) |
| /ai | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/ai-1440.png) |
| /data | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/data-1440.png) |
| /compose/ | DEGRADED | 307, 200 | [screenshot](../audit/evidence/before/instrumented/compose-1440.png) |
| /workbench/ | DEGRADED | 307, 200 | [screenshot](../audit/evidence/before/instrumented/workbench-1440.png) |
| /blueprints | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/blueprints-1440.png) |
| /collections | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/collections-1440.png) |
| /about | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/about-1440.png) |
| /agents | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/agents-1440.png) |
| /creators | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/creators-1440.png) |
| /docs | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/docs-1440.png) |
| /docs/registry | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/docs-registry-1440.png) |
| /workbench/ | DEGRADED | 307, 200, 307, 200 | [screenshot](../audit/evidence/before/instrumented/flagship-shell-1440.png) |
| /license | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/license-1440.png) |
| /privacy | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/privacy-1440.png) |
| /r/area-chart/ | DEGRADED | 307, 200, 307, 200 | [screenshot](../audit/evidence/before/instrumented/r-area-chart-1440.png) |
| /r/button/ | DEGRADED | 307, 200, 307, 200 | [screenshot](../audit/evidence/before/instrumented/r-button-1440.png) |
| /showcase | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/showcase-1440.png) |
| /showcases/ | MISLEADING | 307, 200 | [screenshot](../audit/evidence/before/instrumented/showcases-1440.png) |
| /sponsor | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/sponsor-1440.png) |
| /terms | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/terms-1440.png) |
| /tools/ | DEGRADED | 307, 200 | [screenshot](../audit/evidence/before/instrumented/tools-1440.png) |
| /tools/dna/ | DEGRADED | 307, 200 | [screenshot](../audit/evidence/before/instrumented/tools-dna-1440.png) |
| /trends | BROKEN | 404 | [screenshot](../audit/evidence/before/instrumented/trends-1440.png) |

## Baseline flagship result

Catalogue readiness, three direction generation, choosing C, root/section selection, node-local settings override, locking, radical recomposition, replacement, Surprise, six history actions and both downloads were exercised through UI. History appeared to restore the resource across undo/redo; exact downloaded manifests remain available for comparison. Onboarding could not be exercised because inference omitted it. Replacement introduced unrelated ingestion content. Reload lost all edits. A clean independent ZIP installation succeeded (85 packages), but TypeScript build failed on the invalid `gradient-fill` variant. No successful exported-runtime test is claimed.

The passive browser run recorded zero genuine uncaught exceptions and zero requestfailed events on the flagship run, but explicit404 destinations, missing security headers and critical accessibility failures remain blockers.
