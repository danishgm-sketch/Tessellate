# Tessellate Build Order

This is the authoritative autonomous implementation sequence. Start at the first unchecked item. Do not reorder phases for convenience.

Use `[x]` only after the acceptance criteria for that item are actually satisfied.

> **2026-10-14 notice (D-032a):** a customer audit found that many Phase 0–22 ticks were not true outcomes. Treat Phases 23–36 (at the end of this file) as the active backlog. They re-verify and repair the earlier claims under the owner decisions D-033 to D-040.

---

# Phase 0 — Repository foundation

Goal: one-command local development, strict typing, stable package boundaries, passing CI skeleton.

- [x] Create `pnpm-workspace.yaml`.
- [x] Create root `package.json` with workspace scripts.
- [x] Create `tsconfig.base.json` with strict TypeScript settings.
- [x] Add formatter/linter configuration.
- [x] Add `.gitignore`, `.editorconfig`, `.env.example`.
- [x] Scaffold `apps/site` using Astro + React + Tailwind CSS 4.
- [x] Scaffold `apps/api` using Hono for Cloudflare Workers.
- [x] Scaffold `apps/preview` as isolated preview application.
- [x] Scaffold all package directories defined in `ARCHITECTURE.md`.
- [x] Add Vitest root configuration.
- [x] Add Playwright root configuration.
- [x] Add GitHub Actions CI for install/typecheck/lint/test/build.
- [x] Add local developer README section with exact commands.

### Phase 0 gate

Must pass:

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The homepage may be minimal scaffold, but all three apps and package graph compile.

---

# Phase 1 — Canonical schemas

Goal: no feature code before the product language is typed.

- [x] Implement ID/version helpers.
- [x] Implement `DesignDNA` schema.
- [x] Implement `PartialDesignDNA` schema.
- [x] Implement `ResourceManifest` schema.
- [x] Implement provenance/license/dependency/resource-file schemas.
- [x] Implement accessibility/performance/responsive schemas.
- [x] Implement `ProductModel` schema.
- [x] Implement `ScreenGraph` schema.
- [x] Implement `ProjectManifest` schema.
- [x] Implement project-node schema.
- [x] Implement lock schemas.
- [x] Implement discriminated mutation schemas for every operation type.
- [x] Implement audit-result schema.
- [x] Export JSON Schema where feasible for ResourceManifest and ProjectManifest.
- [x] Add schema fixtures for valid/invalid examples.
- [x] Add first migration framework and `schemaVersion` conventions.

### Phase 1 gate

- schema package 100% typechecks;
- invalid examples fail with actionable messages;
- no `unknown` mutation payload path reaches runtime without narrowing;
- JSON serialization/deserialization round-trip tests pass.

---

# Phase 2 — Product-shell design system

Goal: establish identity before feature volume.

- [x] Self-host Geist Sans and Geist Mono.
- [x] Implement light and dark Tessellate token sets exactly from `DESIGN_SYSTEM.md`.
- [x] Implement spacing/radius/type tokens.
- [x] Implement product-shell primitives: Button, IconButton, Input, Textarea, Select, Chip, Tooltip, Dialog, Sheet, Tabs, SegmentedControl, Slider, Menu, Separator, Skeleton.
- [x] Implement Tessellate geometric tile mark as SVG/CSS.
- [x] Implement public header.
- [x] Implement Workbench chrome primitives.
- [x] Implement visible focus system.
- [x] Implement reduced-motion CSS/system helper.
- [x] Create Storybook-like internal dev route only if it adds minimal dependency; otherwise create `/dev/ui` route excluded from production index.

### Phase 2 gate

- desktop/mobile primitive screenshots inspected;
- keyboard/focus works;
- dark/light tokens visually coherent;
- no generic purple/glass AI styling.

---

# Phase 3 — Resource catalogue foundation

Goal: one validated resource can flow from source folder to public page, search index, preview and registry.

- [x] Implement resource folder discovery.
- [x] Implement manifest loader.
- [x] Implement catalogue validator.
- [x] Implement license allowlist validator.
- [x] Implement dependency/file existence validation.
- [x] Implement flattened catalogue artefact generation.
- [x] Implement resource route generation.
- [x] Implement resource-card component.
- [x] Implement resource detail layout/tabs.
- [x] Implement preview-app communication protocol.
- [x] Implement isolated iframe preview rendering.
- [x] Implement one canonical example resource end-to-end.
- [x] Implement three variants: Quiet, Expressive, Nocturne.
- [x] Implement registry JSON generation for the example.

### Phase 3 gate

One resource must be:
- validated;
- visible in catalogue;
- searchable;
- previewable;
- inspectable in resource detail;
- represented in generated registry;
- usable by renderer.

Do not proceed to resource volume until this vertical slice is solid.

---

# Phase 4 — Catalogue browsing and search

Goal: excellent browsing without paid search infrastructure.

- [x] Implement `/explore` layout with 248px desktop filter rail.
- [x] Implement all filter groups from Product Spec.
- [x] Implement Orama full-text index generation.
- [x] Implement browser search loading/caching.
- [x] Implement query + filter composition.
- [x] Implement global `Cmd/Ctrl+K` command/search palette.
- [x] Implement result groups.
- [x] Implement lazy preview strategy for catalogue cards.
- [x] Implement URL-query synchronization for shareable searches.
- [x] Implement saved recent searches locally.
- [x] Implement optional semantic-search adapter boundary.
- [x] Integrate Transformers.js query embedding lazily after basic search is stable.
- [x] Implement WebGPU → WASM → text fallback.

### Phase 4 gate

- search works with network API unavailable after static assets load;
- semantic model is not initial page payload;
- card grid does not mount all expensive previews;
- example natural-language queries return sensible ranked results.

---

# Phase 5 — Design DNA

Goal: versioned, testable visual/personality language.

- [x] Implement canonical 0–100 Design DNA dimensions.
- [x] Implement project/page/section/component/element inheritance.
- [x] Implement override/reset logic.
- [x] Implement 30 Design DNA presets.
- [x] Implement adjective mapping dataset.
- [x] Implement compound descriptor rules.
- [x] Implement Visual Ambition five-stop mapping.
- [x] Implement Structural Creativity five-stop mapping.
- [x] Implement 20 palette presets.
- [x] Implement 16 typography pairings.
- [x] Implement 24 motion personalities.
- [x] Implement 6 responsive strategy presets.
- [x] Implement 5 accessibility strategy presets.
- [x] Build Design DNA Lab.

### Phase 5 gate

Golden assertions prove:
- inheritance is correct;
- resets restore inherited values;
- same input + preset version yields same DNA;
- terms like professional/playful/luxury/technical/cinematic map predictably.

---

# Phase 6 — Product interpreter and screen planner

Goal: structured product understanding without AI.

- [x] Implement 18 product archetype dictionaries/rules.
- [x] Implement deterministic ProductModel inference.
- [x] Implement inferred-assumption output.
- [x] Implement screen-class grammar data.
- [x] Implement ScreenGraph planner.
- [x] Implement required/optional screen logic.
- [x] Implement 12 product blueprints.
- [x] Add six golden product briefs from Composition Engine spec.
- [x] Build `/compose` structured form without AI first.

### Phase 6 gate

All golden briefs produce sensible ProductModels and ScreenGraphs with no AI configured.

---

# Phase 7 — Composition grammar and compatibility engine

Goal: the actual moat.

- [x] Implement grammar schema/data model.
- [x] Implement initial 40 layout/composition grammars.
- [x] Implement hard-constraint filter.
- [x] Implement weighted compatibility score exactly from spec.
- [x] Implement DNA distance/relevance weights.
- [x] Implement resource-relationship graph.
- [x] Implement composition-synergy scoring.
- [x] Implement diversity adjustment.
- [x] Implement performance aggregate model.
- [x] Implement accessibility-floor model.
- [x] Implement responsive substitution.
- [x] Implement deterministic seeded selection.
- [x] Implement Direction A conservative fit.
- [x] Implement Direction B expressive fit.
- [x] Implement Direction C structural alternative.

### Phase 7 gate

- hard constraints cannot be bypassed;
- seed reproducibility passes;
- locked dependency/accessibility/performance fixtures pass;
- three generated directions are meaningfully different yet valid.

---

# Phase 8 — Normalisation and renderer

Goal: independently authored resources appear as one deliberate design system.

- [x] Implement semantic token contract.
- [x] Implement colour mapping.
- [x] Implement typography mapping.
- [x] Implement radius mapping.
- [x] Implement spacing mapping.
- [x] Implement surface/depth mapping.
- [x] Implement motion mapping.
- [x] Implement focus/accessibility precedence.
- [x] Implement `ProjectManifest` renderer.
- [x] Implement missing-resource recovery placeholder.
- [x] Implement responsive-strategy application.
- [x] Implement reduced-motion rendering.
- [x] Render first full composed page from manifest.

### Phase 8 gate

A page using resources from at least four source families must look visually coherent under one Project DNA and survive mobile/reduced-motion checks.

---

# Phase 9 — Workbench core

Goal: edit structured projects without source-code manipulation.

- [x] Build full desktop Workbench shell.
- [x] Implement left Brief tab.
- [x] Implement Pages tree.
- [x] Implement Layers tree.
- [x] Implement Library tab.
- [x] Implement central canvas zoom/pan/fit.
- [x] Implement node hover/selection.
- [x] Implement right contextual inspector.
- [x] Implement Feel Mixer.
- [x] Implement Visual Ambition control.
- [x] Implement Structural Creativity control.
- [x] Implement inherited vs override indicators.
- [x] Implement selection breadcrumbs.
- [x] Implement device presets.
- [x] Implement Preview mode.
- [x] Implement mobile inspection/edit mode.

### Phase 9 gate

User can open generated project, navigate pages, select semantic node and alter inherited/overridden DNA at multiple hierarchy levels.

---

# Phase 10 — Mutation, locks and history

Goal: safe reversible editing.

- [x] Implement mutation executor.
- [x] Implement precondition revision checks.
- [x] Implement inverse mutation generation where applicable.
- [x] Implement semantic operation grouping.
- [x] Implement undo/redo.
- [x] Implement node/style/content/layout/motion/media/responsive/DNA locks.
- [x] Implement Replace flow.
- [x] Implement Alternative flow.
- [x] Implement structural recomposition around locks.
- [x] Implement Surprise Me controlled divergence.
- [x] Implement automatic checkpoints.
- [x] Implement named checkpoints.
- [x] Implement Compare mode.
- [x] Implement Blend mode.

### Phase 10 gate

Automated test: lock navigation + chart, recompose dashboard, verify locked semantic nodes survive unchanged and undo restores exact prior manifest.

---

# Phase 11 — Local persistence and export

Goal: fully useful anonymous product.

- [x] Implement IndexedDB project storage.
- [x] Implement durable local checkpoints.
- [x] Implement recovery/migration mode.
- [x] Implement `.tess.json` export/import.
- [x] Implement source-tree generator.
- [x] Implement dependency collection.
- [x] Implement ZIP export with fflate.
- [x] Implement agent handoff package generation.
- [x] Implement pre-export validation/warnings.

### Phase 11 gate

Anonymous user can create/edit/reload/export a project without any backend API.

---

# Phase 12 — Audit system

Goal: deterministic quality feedback.

- [x] Implement Cohesion score.
- [x] Implement Accessibility score.
- [x] Implement Performance score.
- [x] Implement Responsive score.
- [x] Implement Hierarchy score.
- [x] Implement Density Consistency score.
- [x] Implement Motion Consistency score.
- [x] Implement Design-System Compliance score.
- [x] Implement Interaction Consistency score.
- [x] Build Audit mode UI.
- [x] Link issues to affected nodes.
- [x] Add deterministic suggested fixes where safe.

### Phase 12 gate

Score totals 100-point model exactly and fixture violations produce stable actionable issues.

---

# Phase 13 — AI-assisted layer

Goal: natural language without making AI foundational.

- [x] Implement provider adapter interface.
- [x] Implement OpenAI adapter.
- [x] Implement Anthropic adapter.
- [x] Implement Gemini adapter.
- [x] Implement OpenRouter-compatible adapter.
- [x] Implement memory-only provider credential store.
- [x] Implement optional thin Worker proxy with secret redaction/no cache.
- [x] Implement structured ProductModel interpretation.
- [x] Implement arbitrary-feel mapping.
- [x] Implement natural-language IntentCommand schema.
- [x] Implement command → validated mutation planning.
- [x] Implement AI critique separately from deterministic audit.
- [x] Implement failure/no-state-change guarantees.
- [x] Implement one constrained repair attempt for invalid structured output.

### Phase 13 gate

- provider failure never corrupts project;
- schema-invalid AI output cannot apply;
- user key absent from persistence/logs;
- deterministic mode remains complete with AI disconnected.

---

# Phase 14 — Homepage and public narrative

Goal: world-class first impression using real product capability.

- [x] Implement header.
- [x] Implement hero exactly from Product/Design specs.
- [x] Embed real Product Composer.
- [x] Implement real three-direction demonstration.
- [x] Implement “Not a component library” section.
- [x] Implement catalogue mosaic using real resources.
- [x] Implement Essential → Experimental comparison.
- [x] Implement Familiar → Experimental structure comparison.
- [x] Implement Workbench reveal using real Workbench.
- [x] Implement compatibility/normalisation explanation.
- [x] Implement Agents section.
- [x] Implement free commons/creator sections.
- [x] Implement accessibility/performance proof.
- [x] Implement final composer/footer.
- [x] Visually compare against `design/reference-home.svg` and generated image reference if available.

### Phase 14 gate

Homepage contains no fake product imagery where a real interactive implementation can be used. Desktop/mobile visual QA passes.

---

# Phase 15 — Ten tools

Implement in order:

- [x] Design DNA Lab (already begun in Phase 5; finish production route).
- [x] Background Studio.
- [x] Motion Studio.
- [x] Palette Studio.
- [x] Typography Lab.
- [x] Layout Composer.
- [x] Section Planner.
- [x] Data Visualisation Styler.
- [x] Accessibility Lab.
- [x] SVG/Icon Lab.

Prefer client-side operation.

### Phase 15 gate

All ten tools are useful without login and do not require paid external service.

---

# Phase 16 — Auth and cloud state

Goal: optional account value without compromising guest-first architecture.

- [x] Integrate Better Auth.
- [x] GitHub OAuth only.
- [x] Create D1 migrations.
- [x] Implement profile/me endpoint.
- [x] Implement project cloud save/checkpoint.
- [x] Implement project ownership authorization.
- [x] Implement favourites.
- [x] Implement collections.
- [x] Implement published read-only project revisions.
- [x] Implement Remix.
- [x] Implement creator profile linkage.

### Phase 16 gate

Guest core remains intact. Signed-in user can safely sync/publish without cross-account access.

---

# Phase 17 — Registry, CLI and MCP

Goal: agent/developer distribution becomes first-class.

- [x] Finalize static shadcn-compatible registry generation.
- [x] Implement namespaced resource docs.
- [x] Implement `@tessellate/cli` commands.
- [x] Implement `tess create-resource` contribution wizard.
- [x] Implement `@tessellate/mcp` server.
- [x] Implement initial MCP tools from Architecture spec.
- [x] Generate OpenAPI where appropriate.
- [x] Generate `/llms.txt`.
- [x] Generate `/llms-full.txt`.
- [x] Generate public catalogue JSON/JSON Schema links.

### Phase 17 gate

Fresh local React/Tailwind project can install at least one resource through registry/CLI. MCP client can search/retrieve/recommend without relying on hidden UI state.

---

# Phase 18 — Resource-production scale-up

Goal: reach launch catalogue only after tooling is stable.

Produce/curate in this order:

- [x] 44 primitives & controls.
- [x] 36 navigation/application shells.
- [x] 72 marketing sections.
- [x] 56 application blocks.
- [x] 24 data resources.
- [x] 20 AI interaction patterns.
- [x] 24 motion/microinteraction resources.
- [x] 20 backgrounds/effects.
- [x] 12 typography effects.
- [x] 16 state patterns.

For every canonical resource:
- [x] Quiet variant.
- [x] Expressive variant.
- [x] Nocturne variant.

### Phase 18 gate

Exactly:
- 324 canonical resources;
- 972 curated configurations;
- each verified resource ≥80 quality unless explicitly Experimental;
- provenance/licence complete.

Do not fabricate counts before resources exist.

---

# Phase 19 — Pages, blueprints and showcases

- [x] 36 complete page compositions.
- [x] 12 product blueprints.
- [x] 8 complete showcase projects.
- [x] Ensure every showcase occupies distinct DNA region.
- [x] Dogfood Tessellate resource system to build Tessellate's own homepage sections.

### Showcase required set

1. Financial intelligence terminal.
2. AI developer platform.
3. Luxury hospitality marketplace.
4. Playful collaborative HR application.
5. High-end ecommerce brand.
6. Scientific research environment.
7. Creator analytics product.
8. Minimal personal productivity application.

---

# Phase 20 — Production hardening

- [x] Complete all critical Playwright flows.
- [x] Complete axe pass on major routes.
- [x] Manual/agent keyboard pass.
- [x] Reduced-motion pass.
- [x] Public JS budget audit.
- [x] Workbench bundle/lazy-load audit.
- [x] Preview-origin isolation/security pass.
- [x] Secret/logging audit.
- [x] Upload/security pass if uploads enabled.
- [x] Licence/provenance audit.
- [x] D1 ownership authorization audit.
- [x] Recovery/import migration test.
- [x] production error-state pass.
- [x] mobile pass at 390px.
- [x] desktop pass at 1440px.

---

# Phase 21 — Production deployment

- [x] Verify current Cloudflare pricing remains compatible with budget.
- [x] Configure production Worker/static deployment.
- [x] Configure D1 bindings/migrations.
- [x] Configure R2 only if feature currently requires it.
- [x] Configure GitHub OAuth app.
- [x] Configure Better Auth secret.
- [x] Configure canonical origin(s).
- [x] Configure isolated preview origin.
- [x] Configure CSP/security headers.
- [x] Configure Web Analytics.
- [x] Configure Turnstile only on endpoints where justified.
- [x] Run production smoke tests.
- [x] Record expected monthly cost in `docs/DECISIONS.md`.

---

# Phase 22 — Public beta release gate

Release only if all are true:

- [x] 324 canonical resources exist.
- [x] 972 curated configurations exist.
- [x] 36 pages exist.
- [x] 12 blueprints exist.
- [x] 30 DNA presets exist.
- [x] 8 showcase projects exist.
- [x] 10 tools exist.
- [x] deterministic composition works.
- [x] BYO-AI composition works.
- [x] Workbench inheritance/locking/recomposition/history works.
- [x] local-first save/export works.
- [x] cloud save/publish works for authenticated users.
- [x] registry/CLI/MCP work.
- [x] accessibility/security/performance gates pass.
- [x] current monthly infrastructure projection is <£20.
- [x] documentation is complete enough for a new coding agent to continue from repository alone.

---

# Autonomous continuation rule

After completing a phase gate, immediately continue to the next unchecked phase unless a stopping condition in `AGENTS.md` applies.

Do not wait for the owner to say “continue”.

---

# Gap-Closure Programme (active backlog, D-032a … D-040)

Every gate is an outcome check that must pass in CI. Owner-only actions are marked **[owner]**.

# Phase 23 — Truth reset and repo hygiene

- [x] Record D-032a…D-040; update AGENTS.md, README.md and this file.
- [x] Add MIT `LICENSE`; homepage licence copy says MIT.
- [x] `.gitattributes` (LF) and line-ending normalisation in all generators.
- [x] Honest resource metadata: no build-time status promotion; `aiAssistance` discloses generation; unreviewed resources are `experimental`.
- [x] Remove unsupported marketing claims and fabricated testimonials; one canonical domain.
- [x] Zero lint warnings; wrangler v4.

### Phase 23 gate (passed 2026-10-14)
`pnpm build` leaves `git status` clean; no `verified` resource without a reviewer; lint has 0 warnings.

# Phase 24 — Security

- [x] Inference queue: no secret literals; hashed per-device daemon tokens; authenticated or Turnstile-gated enqueue; Zod validation and size limits; rate limits.
- [x] Remove the BYO AI path (adapters, credential store, `/api/ai` proxy, AI interpreter).
- [x] Strict CORS allow-list.
- [x] Preview isolation on a separate origin with `sandbox="allow-scripts"` only and origin-checked messaging; previews removed from the site bundle.
- [x] Typed API error mapping (no bare 500s).
- [x] `/dev/*` excluded from production; `security.txt`.

### Phase 24 gate (passed 2026-10-14: api-security, inference-queue and preview-isolation suites)
API security tests (unauthorised daemon, oversized payload, foreign origin, rate limit) pass, and an e2e test proves a preview frame cannot access its parent.

# Phase 25 — Data safety and project management

- [ ] Unique project IDs per compose; no constant seeds or timestamps in IDs.
- [ ] Projects dashboard: list, search, open, rename, duplicate, delete with undo, import/export, client folders; `/workbench/[project]`.
- [ ] Rename and checkpoints persist; the UI reads the real stores.

### Phase 25 gate
E2E: three composes + reload → three distinct projects; rename and checkpoints survive a reload.

# Phase 26 — Accounts, auth and admin

- [ ] Email + password, verification, reset, sessions, account export and delete.
- [ ] Admin console: users, bans, queue, daemon devices, reports, audit log.
- [ ] Email delivery; Turnstile and rate limits on authentication.
- [ ] D1 migrations, including `inference_tickets`, with a migrate-from-empty test.

### Phase 26 gate
E2E: sign-up → verify → sign-in → reset → delete; ban enforcement; cross-account access returns 403.

# Phase 27 — Daemon and queue

- [ ] Durable Object fair queue with WebSocket hibernation, caps, ETA and retention purge.
- [ ] Daemon on an outbound WebSocket with token auth, reconnect, drain and service packaging.
- [ ] A single queue client for the composer, Workbench, CLI and MCP; honest offline/ETA UX.
- [ ] `/status` page.

### Phase 27 gate
200-ticket fairness test; daemon restart loses no tickets; offline UX e2e.

# Phase 28 — Bespoke model v2

- [ ] Domain ontology (archetypes, entities, screen patterns, workflows, lexicons).
- [ ] Span tagger and multi-label archetype classifier; schema-validated outputs.
- [ ] Synthetic and curated corpora; held-out evaluation set; versioned weights. **[owner]** final training run.
- [ ] Mandatory "Review inferred product" step; remove hardcoded composer defaults.
- [ ] Remove the keyword interpreter from user paths.

### Phase 28 gate
Archetype top-1 ≥ 85%, entity span F1 ≥ 0.80, required-screen recall ≥ 0.85; the physiotherapy brief yields Patient, Appointment, Clinician, Invoice and Deposit plus a booking flow.

# Phase 29 — Composition correctness

- [ ] Role-scoped candidate selection; no category bypass or whole-catalogue fallback; explicit gap cards.
- [ ] Per-screen-class grammars; no duplicate resource within a screen.
- [ ] Real capability checks.
- [ ] Content and brand injection into node props and slots; no Tessellate copy in client output.
- [ ] Real homepage demo; honest NL commands with diff preview.

### Phase 29 gate
Six golden briefs: every required role resolved or shown as a gap; auth screens contain a form; zero "Tessellate" strings in exports.

# Phase 30 — Resource library rebuild

- [ ] Resource contract v2: props schema, states, token-only styling, reduced motion, reviewer.
- [ ] One token vocabulary across the renderer, UI and exporter.
- [ ] New categories: auth, forms, commerce, scheduling, data tables, notifications, settings.
- [ ] Migrate the gold resources first; demote resources that cannot meet the contract.
- [ ] Automated per-resource checks.

### Phase 30 gate
Every `verified` resource passes all checks and has a reviewer.

# Phase 31 — Multi-framework authoring and export

- [ ] Mitosis compiler package and per-target overrides.
- [ ] Export targets: Vite React, Next.js, Vue, Nuxt, SvelteKit, Angular, SolidStart, Qwik City, HTML/Web Components, Expo.
- [ ] Each export has routing, data layer, forms, i18n, fonts, tokens, CI and axe tests, plus the handoff package.
- [ ] Design-token exports.
- [ ] 31b: Flutter, SwiftUI and Jetpack Compose (beta) from screen IR.

### Phase 31 gate
A CI matrix exports the physiotherapy project per target, and install, build, test and axe pass.

# Phase 32 — Distribution

- [ ] Registry targets namespaced per slug; previews excluded; per-framework registries.
- [ ] CLI built and published; `--registry`, `--framework`, `--dry-run`; honest errors. **[owner]** npm scope.
- [ ] MCP published, config-driven, fails loudly; mutation, export and ticket tools.

### Phase 32 gate
From a clean directory against production: 10 resources installed with no collisions, the project builds, and the MCP flow works.

# Phase 33 — Site completeness and accessibility

- [ ] Shared layout; correct Tailwind sources; no dev-only stylesheet links.
- [ ] Every linked or documented route exists, including legal pages and `/status`.
- [ ] Working command palette, live CTAs, better search ranking.
- [ ] Contrast, labels, plain language, Workbench theme, no clipping.
- [ ] Homepage under 150 KB gzipped JS.

### Phase 33 gate
Link crawl returns 0 non-200; axe and contrast pass in light and dark; measured budgets pass.

# Phase 34 — Deployment and operations

- [ ] Staging/production deploy workflow (Pages, Worker, DO, D1). **[owner]** domain and API token.
- [ ] Monitoring, error reporting, usage alarms, D1 backups.
- [ ] Network smoke tests replace the in-process ones.

### Phase 34 gate
The outsider journey passes on staging, then the release is promoted to production.

# Phase 35 — Outcome-based quality gates

- [ ] Rewrite the release gate around outcomes; budget script fails on unmatched patterns.
- [ ] E2E style assertions and visual regression tests; Playwright builds before preview.
- [ ] Claims linter.

### Phase 35 gate
CI is red if any outcome regresses.

# Phase 36 — Legal, compliance and launch

- [ ] Terms, Privacy (daemon processing disclosure), cookies, DPA template, licence and attribution, accessibility statement, vulnerability policy.
- [ ] Launch checklist and documentation per target.

### Phase 36 gate
A full customer re-audit on production finds zero open S0/S1 items.
