# Tessellate Build Order

This is the authoritative autonomous implementation sequence. Start at the first unchecked item. Do not reorder phases for convenience.

Use `[x]` only after the acceptance criteria for that item are actually satisfied.

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

- [ ] Implement canonical 0–100 Design DNA dimensions.
- [ ] Implement project/page/section/component/element inheritance.
- [ ] Implement override/reset logic.
- [ ] Implement 30 Design DNA presets.
- [ ] Implement adjective mapping dataset.
- [ ] Implement compound descriptor rules.
- [ ] Implement Visual Ambition five-stop mapping.
- [ ] Implement Structural Creativity five-stop mapping.
- [ ] Implement 20 palette presets.
- [ ] Implement 16 typography pairings.
- [ ] Implement 24 motion personalities.
- [ ] Implement 6 responsive strategy presets.
- [ ] Implement 5 accessibility strategy presets.
- [ ] Build Design DNA Lab.

### Phase 5 gate

Golden assertions prove:
- inheritance is correct;
- resets restore inherited values;
- same input + preset version yields same DNA;
- terms like professional/playful/luxury/technical/cinematic map predictably.

---

# Phase 6 — Product interpreter and screen planner

Goal: structured product understanding without AI.

- [ ] Implement 18 product archetype dictionaries/rules.
- [ ] Implement deterministic ProductModel inference.
- [ ] Implement inferred-assumption output.
- [ ] Implement screen-class grammar data.
- [ ] Implement ScreenGraph planner.
- [ ] Implement required/optional screen logic.
- [ ] Implement 12 product blueprints.
- [ ] Add six golden product briefs from Composition Engine spec.
- [ ] Build `/compose` structured form without AI first.

### Phase 6 gate

All golden briefs produce sensible ProductModels and ScreenGraphs with no AI configured.

---

# Phase 7 — Composition grammar and compatibility engine

Goal: the actual moat.

- [ ] Implement grammar schema/data model.
- [ ] Implement initial 40 layout/composition grammars.
- [ ] Implement hard-constraint filter.
- [ ] Implement weighted compatibility score exactly from spec.
- [ ] Implement DNA distance/relevance weights.
- [ ] Implement resource-relationship graph.
- [ ] Implement composition-synergy scoring.
- [ ] Implement diversity adjustment.
- [ ] Implement performance aggregate model.
- [ ] Implement accessibility-floor model.
- [ ] Implement responsive substitution.
- [ ] Implement deterministic seeded selection.
- [ ] Implement Direction A conservative fit.
- [ ] Implement Direction B expressive fit.
- [ ] Implement Direction C structural alternative.

### Phase 7 gate

- hard constraints cannot be bypassed;
- seed reproducibility passes;
- locked dependency/accessibility/performance fixtures pass;
- three generated directions are meaningfully different yet valid.

---

# Phase 8 — Normalisation and renderer

Goal: independently authored resources appear as one deliberate design system.

- [ ] Implement semantic token contract.
- [ ] Implement colour mapping.
- [ ] Implement typography mapping.
- [ ] Implement radius mapping.
- [ ] Implement spacing mapping.
- [ ] Implement surface/depth mapping.
- [ ] Implement motion mapping.
- [ ] Implement focus/accessibility precedence.
- [ ] Implement `ProjectManifest` renderer.
- [ ] Implement missing-resource recovery placeholder.
- [ ] Implement responsive-strategy application.
- [ ] Implement reduced-motion rendering.
- [ ] Render first full composed page from manifest.

### Phase 8 gate

A page using resources from at least four source families must look visually coherent under one Project DNA and survive mobile/reduced-motion checks.

---

# Phase 9 — Workbench core

Goal: edit structured projects without source-code manipulation.

- [ ] Build full desktop Workbench shell.
- [ ] Implement left Brief tab.
- [ ] Implement Pages tree.
- [ ] Implement Layers tree.
- [ ] Implement Library tab.
- [ ] Implement central canvas zoom/pan/fit.
- [ ] Implement node hover/selection.
- [ ] Implement right contextual inspector.
- [ ] Implement Feel Mixer.
- [ ] Implement Visual Ambition control.
- [ ] Implement Structural Creativity control.
- [ ] Implement inherited vs override indicators.
- [ ] Implement selection breadcrumbs.
- [ ] Implement device presets.
- [ ] Implement Preview mode.
- [ ] Implement mobile inspection/edit mode.

### Phase 9 gate

User can open generated project, navigate pages, select semantic node and alter inherited/overridden DNA at multiple hierarchy levels.

---

# Phase 10 — Mutation, locks and history

Goal: safe reversible editing.

- [ ] Implement mutation executor.
- [ ] Implement precondition revision checks.
- [ ] Implement inverse mutation generation where applicable.
- [ ] Implement semantic operation grouping.
- [ ] Implement undo/redo.
- [ ] Implement node/style/content/layout/motion/media/responsive/DNA locks.
- [ ] Implement Replace flow.
- [ ] Implement Alternative flow.
- [ ] Implement structural recomposition around locks.
- [ ] Implement Surprise Me controlled divergence.
- [ ] Implement automatic checkpoints.
- [ ] Implement named checkpoints.
- [ ] Implement Compare mode.
- [ ] Implement Blend mode.

### Phase 10 gate

Automated test: lock navigation + chart, recompose dashboard, verify locked semantic nodes survive unchanged and undo restores exact prior manifest.

---

# Phase 11 — Local persistence and export

Goal: fully useful anonymous product.

- [ ] Implement IndexedDB project storage.
- [ ] Implement durable local checkpoints.
- [ ] Implement recovery/migration mode.
- [ ] Implement `.tess.json` export/import.
- [ ] Implement source-tree generator.
- [ ] Implement dependency collection.
- [ ] Implement ZIP export with fflate.
- [ ] Implement agent handoff package generation.
- [ ] Implement pre-export validation/warnings.

### Phase 11 gate

Anonymous user can create/edit/reload/export a project without any backend API.

---

# Phase 12 — Audit system

Goal: deterministic quality feedback.

- [ ] Implement Cohesion score.
- [ ] Implement Accessibility score.
- [ ] Implement Performance score.
- [ ] Implement Responsive score.
- [ ] Implement Hierarchy score.
- [ ] Implement Density Consistency score.
- [ ] Implement Motion Consistency score.
- [ ] Implement Design-System Compliance score.
- [ ] Implement Interaction Consistency score.
- [ ] Build Audit mode UI.
- [ ] Link issues to affected nodes.
- [ ] Add deterministic suggested fixes where safe.

### Phase 12 gate

Score totals 100-point model exactly and fixture violations produce stable actionable issues.

---

# Phase 13 — AI-assisted layer

Goal: natural language without making AI foundational.

- [ ] Implement provider adapter interface.
- [ ] Implement OpenAI adapter.
- [ ] Implement Anthropic adapter.
- [ ] Implement Gemini adapter.
- [ ] Implement OpenRouter-compatible adapter.
- [ ] Implement memory-only provider credential store.
- [ ] Implement optional thin Worker proxy with secret redaction/no cache.
- [ ] Implement structured ProductModel interpretation.
- [ ] Implement arbitrary-feel mapping.
- [ ] Implement natural-language IntentCommand schema.
- [ ] Implement command → validated mutation planning.
- [ ] Implement AI critique separately from deterministic audit.
- [ ] Implement failure/no-state-change guarantees.
- [ ] Implement one constrained repair attempt for invalid structured output.

### Phase 13 gate

- provider failure never corrupts project;
- schema-invalid AI output cannot apply;
- user key absent from persistence/logs;
- deterministic mode remains complete with AI disconnected.

---

# Phase 14 — Homepage and public narrative

Goal: world-class first impression using real product capability.

- [ ] Implement header.
- [ ] Implement hero exactly from Product/Design specs.
- [ ] Embed real Product Composer.
- [ ] Implement real three-direction demonstration.
- [ ] Implement “Not a component library” section.
- [ ] Implement catalogue mosaic using real resources.
- [ ] Implement Essential → Experimental comparison.
- [ ] Implement Familiar → Experimental structure comparison.
- [ ] Implement Workbench reveal using real Workbench.
- [ ] Implement compatibility/normalisation explanation.
- [ ] Implement Agents section.
- [ ] Implement free commons/creator sections.
- [ ] Implement accessibility/performance proof.
- [ ] Implement final composer/footer.
- [ ] Visually compare against `design/reference-home.svg` and generated image reference if available.

### Phase 14 gate

Homepage contains no fake product imagery where a real interactive implementation can be used. Desktop/mobile visual QA passes.

---

# Phase 15 — Ten tools

Implement in order:

- [ ] Design DNA Lab (already begun in Phase 5; finish production route).
- [ ] Background Studio.
- [ ] Motion Studio.
- [ ] Palette Studio.
- [ ] Typography Lab.
- [ ] Layout Composer.
- [ ] Section Planner.
- [ ] Data Visualisation Styler.
- [ ] Accessibility Lab.
- [ ] SVG/Icon Lab.

Prefer client-side operation.

### Phase 15 gate

All ten tools are useful without login and do not require paid external service.

---

# Phase 16 — Auth and cloud state

Goal: optional account value without compromising guest-first architecture.

- [ ] Integrate Better Auth.
- [ ] GitHub OAuth only.
- [ ] Create D1 migrations.
- [ ] Implement profile/me endpoint.
- [ ] Implement project cloud save/checkpoint.
- [ ] Implement project ownership authorization.
- [ ] Implement favourites.
- [ ] Implement collections.
- [ ] Implement published read-only project revisions.
- [ ] Implement Remix.
- [ ] Implement creator profile linkage.

### Phase 16 gate

Guest core remains intact. Signed-in user can safely sync/publish without cross-account access.

---

# Phase 17 — Registry, CLI and MCP

Goal: agent/developer distribution becomes first-class.

- [ ] Finalize static shadcn-compatible registry generation.
- [ ] Implement namespaced resource docs.
- [ ] Implement `@tessellate/cli` commands.
- [ ] Implement `tess create-resource` contribution wizard.
- [ ] Implement `@tessellate/mcp` server.
- [ ] Implement initial MCP tools from Architecture spec.
- [ ] Generate OpenAPI where appropriate.
- [ ] Generate `/llms.txt`.
- [ ] Generate `/llms-full.txt`.
- [ ] Generate public catalogue JSON/JSON Schema links.

### Phase 17 gate

Fresh local React/Tailwind project can install at least one resource through registry/CLI. MCP client can search/retrieve/recommend without relying on hidden UI state.

---

# Phase 18 — Resource-production scale-up

Goal: reach launch catalogue only after tooling is stable.

Produce/curate in this order:

- [ ] 44 primitives & controls.
- [ ] 36 navigation/application shells.
- [ ] 72 marketing sections.
- [ ] 56 application blocks.
- [ ] 24 data resources.
- [ ] 20 AI interaction patterns.
- [ ] 24 motion/microinteraction resources.
- [ ] 20 backgrounds/effects.
- [ ] 12 typography effects.
- [ ] 16 state patterns.

For every canonical resource:
- [ ] Quiet variant.
- [ ] Expressive variant.
- [ ] Nocturne variant.

### Phase 18 gate

Exactly:
- 324 canonical resources;
- 972 curated configurations;
- each verified resource ≥80 quality unless explicitly Experimental;
- provenance/licence complete.

Do not fabricate counts before resources exist.

---

# Phase 19 — Pages, blueprints and showcases

- [ ] 36 complete page compositions.
- [ ] 12 product blueprints.
- [ ] 8 complete showcase projects.
- [ ] Ensure every showcase occupies distinct DNA region.
- [ ] Dogfood Tessellate resource system to build Tessellate's own homepage sections.

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

- [ ] Complete all critical Playwright flows.
- [ ] Complete axe pass on major routes.
- [ ] Manual/agent keyboard pass.
- [ ] Reduced-motion pass.
- [ ] Public JS budget audit.
- [ ] Workbench bundle/lazy-load audit.
- [ ] Preview-origin isolation/security pass.
- [ ] Secret/logging audit.
- [ ] Upload/security pass if uploads enabled.
- [ ] Licence/provenance audit.
- [ ] D1 ownership authorization audit.
- [ ] Recovery/import migration test.
- [ ] production error-state pass.
- [ ] mobile pass at 390px.
- [ ] desktop pass at 1440px.

---

# Phase 21 — Production deployment

- [ ] Verify current Cloudflare pricing remains compatible with budget.
- [ ] Configure production Worker/static deployment.
- [ ] Configure D1 bindings/migrations.
- [ ] Configure R2 only if feature currently requires it.
- [ ] Configure GitHub OAuth app.
- [ ] Configure Better Auth secret.
- [ ] Configure canonical origin(s).
- [ ] Configure isolated preview origin.
- [ ] Configure CSP/security headers.
- [ ] Configure Web Analytics.
- [ ] Configure Turnstile only on endpoints where justified.
- [ ] Run production smoke tests.
- [ ] Record expected monthly cost in `docs/DECISIONS.md`.

---

# Phase 22 — Public beta release gate

Release only if all are true:

- [ ] 324 canonical resources exist.
- [ ] 972 curated configurations exist.
- [ ] 36 pages exist.
- [ ] 12 blueprints exist.
- [ ] 30 DNA presets exist.
- [ ] 8 showcase projects exist.
- [ ] 10 tools exist.
- [ ] deterministic composition works.
- [ ] BYO-AI composition works.
- [ ] Workbench inheritance/locking/recomposition/history works.
- [ ] local-first save/export works.
- [ ] cloud save/publish works for authenticated users.
- [ ] registry/CLI/MCP work.
- [ ] accessibility/security/performance gates pass.
- [ ] current monthly infrastructure projection is <£20.
- [ ] documentation is complete enough for a new coding agent to continue from repository alone.

---

# Autonomous continuation rule

After completing a phase gate, immediately continue to the next unchecked phase unless a stopping condition in `AGENTS.md` applies.

Do not wait for the owner to say “continue”.
