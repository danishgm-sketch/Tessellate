# AGENTS.md — Tessellate Autonomous Build Contract

This file is the authoritative operating contract for any autonomous coding agent working in this repository.

## 0. Owner intent

The owner expects an agent to be able to receive only the repository URL, inspect the repository, read this file, and begin implementation without asking for a project brief.

Your role is not to brainstorm a different product. Your role is to faithfully implement the product already specified here.

When the specification has made a decision, **the decision is closed** unless implementation is impossible or two specification files directly conflict.

## 1. Mandatory reading order

Before writing code, read in this exact order:

1. `README.md`
2. `AGENTS.md` (this file)
3. `docs/PRODUCT_SPEC.md`
4. `docs/DESIGN_SYSTEM.md`
5. `design/REFERENCE_DIRECTIONS.md`
6. `docs/WORKBENCH_SPEC.md`
7. `docs/COMPOSITION_ENGINE.md`
8. `docs/DATA_CONTRACTS.md`
9. `docs/ARCHITECTURE.md`
10. `docs/QUALITY_SECURITY.md`
11. `docs/DEPLOYMENT_COST.md`
12. `docs/BUILD_ORDER.md`
13. `docs/DECISIONS.md`

Do not begin implementation before this reading is complete.

## 2. Decision hierarchy

When sources conflict, resolve in this order:

1. Security and hard cost constraints.
2. Explicit non-negotiables in `README.md` and this file.
3. Data contracts.
4. Architecture.
5. Product specification.
6. Workbench specification.
7. Design system.
8. Visual reference directions.
9. Local implementation convenience.

Document any conflict and resolution in `docs/DECISIONS.md`.

## 3. Hard constraints

Never violate these without owner intervention:

### Cost
- Normal infrastructure goal: £0–£8/month.
- Absolute pre-commercial hard ceiling: £20/month.
- Do not add a paid SaaS dependency merely for convenience.
- Do not add a hosted search service, hosted queue, hosted vector database, hosted image transformation service or always-on application server unless the repository specification is intentionally revised.

### AI
- Core browsing, composition, editing, audit and export must work without an LLM.
- Platform must not absorb unlimited inference costs.
- Natural-language AI features use BYO provider credentials or a user-configured compatible endpoint.
- Provider secrets are never persisted in D1/R2 in V1.

### Product
- Public component/pattern source is free.
- Never introduce a Pro component gate or download cap.
- Design coherence comes before component count.
- The system composes through manifests and validated mutations, not arbitrary source mutation.

### Security
- Untrusted community code never runs on the authenticated main application origin.
- No `eval` or equivalent dynamic arbitrary code execution in product runtime.
- Validate all public API boundaries with canonical schemas.
- No secrets in client bundles, logs or repository.

### Accessibility
- Platform shell and Workbench target WCAG 2.2 AA.
- Reduced motion is a first-class mode.
- All core operations must be keyboard-accessible.

## 4. Approved stack — do not substitute

### Monorepo
- pnpm workspaces.
- TypeScript strict mode.

### Public site
- Astro.
- React islands where interaction is required.
- Tailwind CSS 4.

### Workbench
- React.
- Zustand.
- dnd-kit.
- CodeMirror 6 for code/structured text surfaces where needed.
- Motion for interface animation.

### Schemas and validation
- Zod.

### Search
- Orama.
- Optional local semantic embedding with Transformers.js.

### Backend
- Cloudflare Workers.
- Hono.
- D1.
- R2.

### Authentication
- Better Auth.
- GitHub OAuth only in V1.

### Resource ecosystem
- React + TypeScript + Tailwind CSS 4 is the canonical V1 resource target.
- shadcn-compatible registry conventions.

### Testing
- Vitest.
- Playwright.
- axe integration.

### Icons
- Lucide for product chrome.

Do not replace these with Next.js, Firebase, Supabase, Clerk, Algolia, MongoDB, Prisma, Redux, GraphQL, Elasticsearch, a hosted vector store, or a paid visual editor SDK.

## 5. Working method

Implement the first incomplete task in `docs/BUILD_ORDER.md`.

For every task:

1. Read affected contracts/specifications.
2. State the task in your own internal plan.
3. Implement the smallest complete vertical slice.
4. Add/modify tests.
5. Run targeted tests.
6. Run repository-level checks required by the phase gate.
7. Inspect the rendered output when UI changed.
8. Correct visual/functional regressions.
9. Update docs/contracts if public behaviour changed.
10. Mark the build-order item complete only when acceptance criteria pass.

Never mark a task complete because code was written. Completion means the defined outcome works.

## 6. No fake completion

Forbidden completion shortcuts:

- placeholder `TODO` presented as implemented functionality;
- fake buttons that do nothing;
- hardcoded screenshots where functional UI is specified;
- mocked API responses left in production paths;
- empty routes presented as complete;
- hidden errors replaced with silent fallback;
- tests removed to make CI pass;
- accessibility rules disabled wholesale;
- type errors suppressed with `any` as an expedient architecture;
- lint rules disabled globally to avoid repair.

Placeholders may exist only in phases where `BUILD_ORDER.md` explicitly permits scaffolding, and must be clearly labelled in code and UI.

## 7. Autonomous decision policy

You may make local decisions about:

- function names;
- private helper structure;
- test fixture organization;
- exact algorithmic implementation when input/output behaviour is specified;
- internal component decomposition;
- minor spacing within stated visual tokens;
- error message wording consistent with product tone.

You may **not** independently change:

- product positioning;
- routes;
- primary stack;
- data ownership boundaries;
- storage architecture;
- Design DNA dimensions;
- Workbench primary panel model;
- resource-count launch targets;
- core page hierarchy;
- free-vs-paid philosophy;
- security isolation model;
- deployment architecture;
- major design identity.

If an unspecified major decision becomes unavoidable, choose the option that is:

1. cheapest operationally;
2. most portable;
3. simplest to reason about;
4. easiest to test;
5. most aligned with existing contracts;

and record it in `docs/DECISIONS.md`.

## 8. Dependency policy

Before adding a dependency:

- confirm existing packages cannot solve it cleanly;
- prefer small, active, framework-aligned libraries;
- avoid overlapping packages;
- avoid runtime dependencies for build-time-only jobs;
- avoid packages that materially increase public-site JS without clear value;
- note non-obvious dependencies in the relevant architecture file.

No dependency may create a recurring paid-service requirement.

## 9. Visual implementation contract

The visual references are directional but the design tokens and layout metrics are authoritative.

When implementing UI:

- preserve the calm editorial shell around expressive resource previews;
- do not turn the site into a generic purple/blue glowing AI landing page;
- do not overuse glassmorphism;
- do not over-round every rectangle;
- do not use gradients as decoration without purpose;
- maintain high information quality and restraint;
- make the library itself the spectacle;
- use motion sparingly in platform chrome and richly only in demonstrations/resources;
- use the provided reference SVGs and visual direction document as acceptance references.

For any materially new page, produce desktop and mobile screenshots locally and compare against `docs/DESIGN_SYSTEM.md`.

## 10. Resource authoring contract

Every resource must:

- validate against `ResourceManifest`;
- use project semantic tokens rather than hard-coded project-wide styling values;
- declare dependencies;
- declare performance and accessibility metadata;
- declare responsive strategy;
- include source/provenance/licence metadata;
- pass 360px, 768px and 1440px checks;
- support reduced-motion behaviour when animated;
- avoid remote asset dependencies unless explicitly documented and licensed;
- be exportable without Tessellate runtime lock-in.

## 11. Commit discipline

Preferred commits are scoped and reviewable.

Use conventional messages such as:

- `feat(schema): add resource manifest contract`
- `feat(catalog): render validated resource grid`
- `feat(workbench): add Design DNA inspector`
- `test(composer): cover compatibility hard constraints`
- `docs(adr): record preview isolation decision`

Do not mix unrelated refactors into feature commits.

## 12. Error handling

Fail loudly in development.

For invalid manifests:
- build fails with actionable path + schema error.

For user project corruption:
- preserve the raw local record;
- enter recoverable safe mode;
- offer export of raw manifest;
- never silently discard user work.

For unsupported browser capabilities:
- degrade semantic search to full-text;
- degrade WebGPU to WASM;
- degrade rich effects to static/reduced alternatives;
- never break core browsing/composition.

## 13. Performance discipline

Targets:

- public homepage initial JS <150 KB gzip where practical;
- catalogue base route initial JS <200 KB gzip;
- Workbench may lazy-load up to ~750 KB gzip as an application route;
- search index initial compressed target <2 MB;
- embedding model never initial-loads on public pages;
- previews mount lazily;
- videos do not preload offscreen;
- 3D loads only on demand and with capability checks.

If a feature breaks a budget, fix architecture before accepting the regression.

## 14. Definition of done for UI

A UI task is done only when:

- desktop layout is correct;
- tablet/mobile behaviour is intentionally defined;
- keyboard works;
- focus states are visible;
- reduced motion is respected;
- no console errors;
- no obvious layout overflow;
- loading/empty/error state exists where applicable;
- screenshot was visually inspected;
- tests cover critical behaviour.

## 15. First action for a fresh clone

If repository contains only documentation/scaffolding:

1. Start Phase 0 in `docs/BUILD_ORDER.md` immediately.
2. Do not ask the owner whether to proceed.
3. Do not create a new plan that supersedes `BUILD_ORDER.md`.
4. Do not start resource volume production before schemas, rendering and validation are stable.
5. Keep the repository runnable at the end of every completed task.

## 16. Stopping conditions

Stop autonomous execution only when one of these is true:

- owner explicitly stops you;
- required credential/permission is unavailable and no local implementation can proceed;
- specification contains a direct contradiction with no safe resolution;
- proceeding would violate the hard monthly-cost ceiling;
- proceeding would introduce a known security vulnerability;
- the next task requires a legal/licensing decision not covered by current policy.

When stopped, leave the repository in a passing state and write the blocker clearly to `docs/DECISIONS.md` or an issue.

## 17. Guiding sentence

When uncertain, preserve this product identity:

> Tessellate does not sell a pile of components. Tessellate understands what a product needs, composes a coherent interface system from an open resource vocabulary, and gives humans and agents precise control over the result.
