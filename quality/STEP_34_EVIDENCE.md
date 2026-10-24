# Step 34 — Blueprints and showcases

Status: **local browser gate complete; capabilities remain Beta**. Public deployment verification is deferred to Step 45.

## Scope and method

Ran `tests/e2e/blueprints-showcases-hardening.spec.ts` against the built production preview in Chromium at 1440×900 and 390×844. The route audit visited `/blueprints/`, `/showcase/`, `/showcases/`, all 12 blueprint detail routes and all 8 showcase detail routes. It recorded a screenshot, URL, viewport, console messages, uncaught exceptions, failed requests, HTTP errors, Axe findings and document overflow for each route. It selected every one of the 31 showcase screens and checked the rendered screen ID, unresolved-resource diagnostics and screen-level overflow.

The browser workflow opened every blueprint from its detail page, composed through the visible UI, inspected and rendered all three directions, selected Direction C, opened that exact project in Workbench, moved the Visual Ambition slider with the keyboard and exported a manifest for canonical schema validation. For each showcase, the browser downloaded the exact example manifest, opened a Workbench local copy, changed Visual Ambition, exported the copy and compared project content and all documented companion dimensions against the source. Four showcase filter builders were also exercised through add, field/operator/value entry, live status announcement and remove.

Evidence files:

- [Desktop route audit](evidence/step-34/after/desktop-chrome-route-audit.json)
- [Mobile route audit](evidence/step-34/after/mobile-chrome-route-audit.json)
- [Blueprint Workbench workflow](evidence/step-34/after/blueprint-workbench/workflow.json)
- [Showcase Workbench workflow](evidence/step-34/after/showcase-workbench/workflow.json)
- [Machine-readable verification summary](evidence/step-34/verification.json)

Before screenshots show the hospitality example rendered as an editorial newsroom and the employee showcase framed around hiring. After screenshots include [Velluto at desktop](evidence/step-34/after/desktop-chrome-showcase-showcase-luxury-hospitality.png), [Velluto on mobile](evidence/step-34/after/mobile-chrome-showcase-showcase-luxury-hospitality.png), [Kudos at desktop](evidence/step-34/after/desktop-chrome-showcase-showcase-playful-hr.png), and [Kudos on mobile](evidence/step-34/after/mobile-chrome-showcase-showcase-playful-hr.png). Workbench captures include [Velluto](evidence/step-34/after/showcase-workbench/showcase-luxury-hospitality-workbench.png) and [Kudos](evidence/step-34/after/showcase-workbench/showcase-playful-hr-workbench.png).

## Defects found and fixed

### P2 — Hospitality showcase generated a media/newsroom product

**Evidence:** The before screenshot [Velluto before](evidence/step-34/before/desktop-chrome-showcase-luxury-hospitality.png) shows a journalism workspace. Its generated manifest used the `media` archetype and included article/editorial screens. The regression test was first run against this state and failed its expected `travel` archetype and stay/room/reservation screens.

**Root cause:** `composeShowcase` passed the invalid hospitality alias to the product interpreter; its fallback and the editorial wording selected a media product.

**Fix:** Map the existing hospitality showcase to the canonical `travel` archetype, replace its brief with residence discovery, rooms, concierge and reservation terms, and set the static showcase archetype metadata to `travel`. The regenerated manifest now has `Find a Stay`, `Room Details` and `Reservation Checkout`, with no article-reader, journalist or newsroom content.

**Regression protection:** `packages/compatibility/src/__tests__/showcase-composition.test.ts` and the visible-route assertions in `tests/e2e/blueprints-showcases-hardening.spec.ts`.

### P2 — Employee showcase copy described hiring instead of employee experience

**Evidence:** The before screenshot [Kudos before](evidence/step-34/before/desktop-chrome-showcase-playful-hr.png) used a hiring-focused title. The route manifest and UI now identify `Kudos Employee Experience` and show people, teams, engagement, onboarding and policies.

**Root cause:** Showcase presentation copy retained the old hiring title/description even though the composition path had a dedicated employee-experience brief and generated employee workflows.

**Fix:** Align the title, tagline and description with the shipped employee-experience workflow. Strengthen the browser regression to reject candidate, applicant, hiring, recruiter and interview residue.

**Regression protection:** `packages/compatibility/src/__tests__/showcase-composition.test.ts` and the visible route plus Workbench/export assertions in `tests/e2e/blueprints-showcases-hardening.spec.ts`.

### P2 — Showcase descriptions contained duplicate or unmeasured claims

**Evidence:** The luxury commerce tagline repeated “bespoke”; the productivity tagline claimed “zero cloud latency” without measurement or a cloud service.

**Root cause:** Showcase sample copy had not received a truthful content pass.

**Fix:** Remove the repeated adjective and describe the productivity example as a local notes/focus/calendar workspace without a latency claim.

**Regression protection:** Generated catalogue/showcase output is rebuilt by `pnpm build:catalog`; source and generated JSON were reviewed together.

### P2 — Nocturne resource variants reduced helper-text contrast on light screens

**Evidence:** Before the fix, Axe reported a 1.97:1 foreground/background contrast for disabled-action helper text on the AI developer showcase. The screenshot showed pale helper text on the light page canvas.

**Root cause:** A global `[data-resource-variant="nocturne"]` rule forced light-theme text tokens to dark-theme gray for every descendant, including helper text outside the component’s dark surface.

**Fix:** Remove that global token override. The manifest renderer’s screen tokens now remain the color authority; Nocturne components can define their own surface/variant styles without recoloring unrelated text.

**Regression protection:** Axe runs across every blueprint/showcase route at both tested viewports. No serious or critical violations remain in this route matrix. The broader resource/variant matrix is still owned by its earlier certification step.

## Results and remaining limits

- 23/23 routes returned HTTP 200 at each viewport; 0 console errors or warnings, uncaught exceptions, failed requests or HTTP errors.
- All 31 showcase screens were selected and rendered; there were 0 unresolved-resource or unresolved-role diagnostics and 0 screen-level or document-level horizontal overflow findings.
- Twelve blueprints each generated three visible resolved directions. Direction C opened as the selected project, accepted a keyboard DNA edit and exported a schema-valid manifest. Eight showcases opened as local Workbench copies, preserved source product/screen content, accepted the documented Visual Ambition composite change and exported schema-valid manifests.
- Browser/runtime captures recorded 0 errors, failed requests or HTTP errors across both Workbench workflows. Filter-builder actions passed in four showcase examples; generic unconnected button resources are disabled and carry helper explanations.
- Axe found four **moderate** heading-order findings at each viewport: `/showcase/showcase-ai-developer-platform/`, `/showcase/showcase-luxury-ecommerce/`, `/showcase/showcase-luxury-hospitality/` and `/showcase/showcase-scientific-research/`. Serious/critical violations: 0. These remain open for Step 35; no accessibility pass is claimed for screen-reader use.
- Other public controls and every component interaction inside every example were not exhaustively exercised. Workbench handoff/edit was automated at desktop; mobile currently verifies route rendering, screen switching and preview behavior only. Sample data and unconnected external actions remain explicitly labelled; showcase and blueprint tiers stay Beta.
- Public-site deployment, manual screen-reader testing, 200% zoom, reduced-motion variants and the full responsive matrix remain open for their later gates.

## Validation

- `pnpm build:catalog` — passed; all 324 resources validated and showcase JSON regenerated.
- `pnpm build` — passed; 717 static Astro pages generated.
- `pnpm exec vitest run packages/compatibility/src/__tests__/showcase-composition.test.ts packages/composer/src/__tests__/showcases-and-pages.test.ts` — 12 passed.
- `pnpm exec playwright test tests/e2e/blueprints-showcases-hardening.spec.ts` — 4 passed, 2 intentional mobile workflow skips. The route test runs in desktop and mobile projects; Workbench mutation/export runs on desktop because mobile editing is not yet certified.

### 2026-10-21 local verification follow-up — AUD-106

The Prompt Canvas route regression now checks the rendered preview at 1440×900 and 390×844. It records exactly one navigation role and no substituted editor-toolbar role, with no Axe violations, console errors, uncaught exceptions, failed requests, HTTP errors, or horizontal overflow. The focused run `pnpm exec playwright test tests/e2e/blueprints-showcases-hardening.spec.ts --grep "all blueprint and showcase routes render with usable content"` passed 2/2 desktop/mobile cases. Screenshots and route reports are under `quality/evidence/step-34/after/`. AUD-106 is fixed locally and remains pending published review verification.
