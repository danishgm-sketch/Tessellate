# Tessellate Ultimate Product Vision

**Status:** Post-hardening public product ambition and execution charter  
**Date:** 2026-11-20  
**Governs:** Public product direction after closing the [Product Hardening Programme](docs/PRODUCT_HARDENING.md) release gate

---

## 1. Product north star

> Tessellate does not sell a pile of components. Tessellate understands what a product needs, composes a coherent interface system from an open resource vocabulary, and gives humans and agents precise control over the result.

Tessellate is built to become the open, agent-native standard for turning product intent into coherent, exportable interface systems:

- **Deterministic by default, AI-enhanced when brought by the user:** Brief interpretation, screen/flow architecture, 38-field Design DNA token synthesis, three-direction structural composition, compatibility constraint resolution, accessibility auditing, and source export run deterministically with zero required account, cloud backend, or platform inference subsidy. Optional natural-language refinement accepts strictly user-supplied (BYO) provider credentials without server-side key persistence in V1.
- **Calm editorial shell around expressive living systems:** The public catalogue, composer, and Workbench maintain typographic restraint, strict WCAG 2.2 AA discipline, reduced-motion first-class support, and full keyboard navigation while curated components express distinct aesthetics (`Quiet`, `Expressive`, `Nocturne`).
- **Open public commons, zero lock-in:** All public component/pattern source remains free forever with no Pro component paywall and no download cap. Every composed project is transparent JSON (`ProjectManifest`), editable via validated mutations, and exportable as standalone code with zero Tessellate runtime dependency.
- **Real isolation and brutal honesty:** Untrusted or resource preview code executes strictly on an opaque/sandboxed preview origin under strict CSP without `eval`. Any unsupported semantic capability renders as an explicit unresolved requirement and blocks misleading "runnable" ZIP generation rather than fabricating stubs.

---

## 2. Verified repository baseline (2026-11-20)

Before charting the public launch, this charter records the verified state of consolidated `main`:

| Domain | Verified current state | Key remaining gap |
| --- | --- | --- |
| Resource corpus | 324 validated resources across 3 variants (`Quiet`, `Expressive`, `Nocturne`); 40 tagged `verified-gold` for app composition | 284 non-Gold resources not yet promoted; static 8-check gate accepts 104/324 canonical and 13/40 Gold (`quality/STEP_30_EVIDENCE.md`) |
| Composition & blueprints | 18 archetypes, domain-specialized brief rules, 3-direction synthesis, compatibility constraints; 12 blueprints and 8 showcases (31 screens) | Remaining domain/copy nuance tracked under Hardening Step 39 |
| Editing & client tooling | React/Zustand Workbench with 50-step undo/redo, IndexedDB checkpoints, locks/overrides, DNA inspector, plus 10 Beta client tools | Final public-RC verification (Step 45) & release acceptance (Step 48); Step 46 human usability owner-waived (`D-064`) |
| Exporters & round-tripping | Core React/Vite ZIP export + handoff pack; Beta Next.js & DTCG token targets; Lab Expo & SwiftUI scaffolds | Promote Next.js & tokens to Core; harden bidirectional AST code sync beyond bounded Vite/Next diffs |
| Agent & CLI ecosystem | 12-command `@tessellate/cli` (`packages/cli`), 15-tool stdio MCP server + Beta SSE (`packages/mcp`), static `/r/index.json`, `/llms.txt`, `/openapi.json`, Beta AST linter & ingestor | Packages remain private pending licensing/semver release & authenticated remote MCP transport |
| Production hosting & state | 733 static Astro pages packaged in Sites Worker v89 (`tessellate-v1-review.ismayildanish-gm.chatgpt.site`); Hono API + D1 schemas written | Production cutover on custom Cloudflare Pages/Workers domain with bound D1, optional R2, live GitHub OAuth, and resolution of `AUD-419` (unconfigured public host forwarding) |
| Private Verso archive | 1,053 owner-authored modules inventoried & schema-projected locally (`D-067`); unmerged Contract v2 experiments preserved at tag `archive/claude-contract-v2` (`D-068`) | Per-item provenance, manifest, responsive, a11y, reduced-motion, and export certification before public admission |

---

## 3. Five pillars of the final publicly deployable product

### Pillar 1 — Real Cloudflare production cutover

Move from review-site snapshots to a continuously deployed, low-cost global production origin within the approved Cloudflare Workers / Hono / D1 / R2 / Better Auth stack:

1. **Production Workers + static Astro edge delivery:** Serve the Astro shell and isolated `/preview` sandbox origin automatically from green `main` pushes via CI/CD on the final public domain, with zero application CSP violations.
2. **Bound D1 & R2 + live GitHub OAuth:** Bind production D1 migrations (`0001_initial.sql` et al.) and minimal R2 bucket storage for shared project snapshots, user collections/favourites, revision-checked cloud sync (`expectedRevision`), and GitHub OAuth sign-in via Better Auth—while keeping anonymous local-first usage 100% functional without signing in.
3. **Stateless BYO-key edge gateway (`AUD-419` resolution):** Provide an explicit, zero-persistence edge pass-through (or client-direct call where CORS permits) for user-supplied OpenAI-compatible/Anthropic/Gemini keys, guaranteeing keys never touch D1, R2, or logs.

### Pillar 2 — 324/324 Gold-certified Contract-v2 resource commons

Eliminate the split between "valid metadata" and "composition-ready Gold runtime":

1. **Universal static gate compliance:** Remediate every failing provenance, dependency, isolation, and token check so **324/324 canonical resources** pass the eight-check static registry gate (`tess gate`), up from 104/324 today.
2. **Full browser Gold promotion:** Systematically audit, harden, and promote all remaining resources across desktop/mobile widths (360px, 768px, 1440px), Axe WCAG 2.2 AA scans, reduced-motion behavior, and standalone Vite/Next build parity so composers never hit artificial catalogue bottlenecks on real domain briefs.
3. **Curated Verso certification wave:** Under the owner authorization recorded in `D-067`, selectively adapt, clean-room verify provenance, and graduate high-value components from the 1,053-module local Verso collection to cover missing industry roles (healthcare scheduling, civic ops, rich data workflows, media/reading tools) only after full Gold certification.
4. **Canonical Contract v2 convergence:** Incrementally adopt proven schema ergonomics from archived `archive/claude-contract-v2` work where they strengthen token fidelity, multi-framework exports, and capability declarations without breaking existing `ProjectManifest` portability.

### Pillar 3 — Studio-grade visual & compositional intelligence + bidirectional code sync

Make Tessellate indispensable for real engineering teams rather than a one-shot mockup generator:

1. **Fail-closed composition with deep domain vocabulary:** Expand archetype and capability-gap coverage using real-world brief regression suites so every domain gets genuinely differentiated layouts across Directions A, B, and C, plus transparent role-coverage reporting.
2. **Promote Next.js & DTCG design tokens to Core:** Bring Next.js App Router export and Style Dictionary DTCG token generation to full feature, visual, contrast, and clean-install browser parity alongside React/Vite.
3. **True bidirectional codebase sync:** Upgrade `packages/ingest` and the AST linter so a developer can ingest an existing React/Next/Tailwind codebase into Tessellate, refine tokens, screens, and hierarchy visually or with an agent in Workbench, and emit clean, reviewable unified diffs back into their repository without clobbering business logic.

### Pillar 4 — Standard npm, MCP & static registry agent layer

Make Tessellate natively consumable from terminals, IDEs, and coding agents:

1. **Public npm packages (`@tessellate/cli`, `@tessellate/mcp`):** Publish versioned, signed releases with reproducible tarballs and zero workspace coupling so `npx @tessellate/cli` and MCP clients (`Claude`, `Codex`, `Cursor`, `Antigravity`) connect in one command.
2. **Open shadcn-compatible + agent discovery endpoints:** Maintain stable `/r/*.json` resource descriptors, `/llms.txt`, `/llms-full.txt`, and `/openapi.json` so any CLI or LLM workflow can query resources, verify constraints, and install clean source directly into user projects.
3. **Authenticated remote MCP server:** Pair local stdio MCP with a Cloudflare Worker SSE/HTTP MCP endpoint secured by scoped per-user tokens for hosted IDE/agent sessions.

### Pillar 5 — Open creator commons & remix ecosystem

Turn static showcase galleries into a living, trustworthy open design ecosystem:

1. **Shareable read-only remixes & community collections:** Signed-in authors can publish project manifests and forkable remix URLs (`/compose?from=<id>` or shared collection permalinks) stored in D1 with strict schema validation and public provenance attribution.
2. **PR-native community resource contributions:** External authors can author, lint (`tess lint`), gate (`tess gate`), and submit new resources via GitHub PRs validated automatically by the sandboxed component CI pipeline—all remaining public and free.

---

## 4. Phased launch roadmap

| Phase | Milestone | Scope & concrete exit criteria |
| --- | --- | --- |
| **Phase A** | Close Hardening Release Candidate | Complete Step 39 (full copy/domain truthfulness sweep), Step 45 (deploy clean `main` RC to review host & pass deployed audit ledger closure), and Step 48 (owner RC sign-off). No feature sprawl. |
| **Phase B** | **v1.0 Public Production Launch** | Cut over custom domain on Cloudflare Workers/Astro; bind production D1 + minimal R2 + live GitHub OAuth; resolve `AUD-419` with zero-persistence BYO-key forwarding; publish `@tessellate/cli` and `@tessellate/mcp` to npm (`1.0.0`); verify zero runtime CSP/console errors. |
| **Phase C** | **v1.5 Full 324 Gold & Multi-Target Core** | Reach 324/324 static `tess gate` pass and promote remaining verified resources to Gold; promote Next.js + DTCG tokens from Beta to Core; ship first certified batch of Verso components (`D-067`) filling real brief capability gaps. |
| **Phase D** | **v2.0 Bidirectional Sync & Commons** | Graduate AST codebase ingest/patch sync (`packages/ingest`) to Core; launch shareable D1 project remixes, remote authenticated MCP, community PR contribution pipeline, and compatible Contract v2 schema enhancements (`archive/claude-contract-v2`). |

---

## 5. Operational cost envelope

Tessellate stays sustainable without venture burn, metered component paywalls, or forced SaaS subscriptions. Target run-rate: **£0–£8/month** normal, strictly bounded below **£20/month** pre-commercial ceiling:

| Infrastructure component | Production choice | Expected monthly spend | Cost ceiling guardrail |
| --- | --- | --- | --- |
| Static site & docs (`/`, `/explore`, `/r/*`) | Cloudflare Pages / static Workers assets | £0 (free tier) | Unlimited requests on static edge assets |
| Edge API & MCP gateway | Cloudflare Workers (`@tessellate/api`) | £0–£4 (Workers free / Paid base plan) | Stay stateless; no always-on origin VM or node server |
| Relational metadata & auth | Cloudflare D1 + Better Auth (GitHub OAuth) | £0 (free tier quotas) | Store bounded manifests & metadata only; zero unindexed blob storage |
| Shared asset / ZIP snapshots | Cloudflare R2 (minimal, on demand) | £0–£1 (10 GB free storage, zero egress) | Do not mirror full npm/CDN assets; store only genuinely needed user exports |
| Search & embeddings | Orama build-time index + optional local WASM/WebGPU | £0 | No Algolia, Elasticsearch, or hosted vector database |
| AI inference | Deterministic core + optional BYO user API keys | £0 platform spend | Platform never proxies/funds shared inference quotas |
| CI/CD & public packages | GitHub Actions public repo + npm public registry | £0 | Concurrency & bounded Playwright workers avoid runner overruns |
| Domain DNS | Registered custom domain via Cloudflare DNS | ~£1 | Included well inside £8/mo normal budget |

---

## 6. Hard public-launch KPIs & release gates

Before declaring public production launch (`v1.0` and every subsequent minor release), `main` must pass all quantitative checks cleanly:

1. **Green baseline & CI parity:** All eight baseline commands (`install --frozen-lockfile`, `build:catalog`, `typecheck`, `lint`, `test`, `audit:all`, `build`, `test:e2e`) pass on exact merge commit before deployment.
2. **Performance budgets (`AGENTS.md` §13):** Public homepage initial JS <150 KB gzip; catalogue base route <200 KB gzip; Workbench lazy-loaded route <=750 KB gzip; search index <2 MB compressed; lazy preview mounting & on-demand 3D.
3. **Security & isolation:** 324/324 static resource isolation pass; zero `eval` / dynamic execution in product runtime; strict opaque preview origin + CSP with zero injected/runtime violations; zero secrets in Git, bundles, D1/R2, or telemetry.
4. **Accessibility & responsiveness:** Zero critical/serious Axe WCAG 2.2 AA violations across public routes, previews, and Workbench; complete keyboard navigation, visible focus states, reduced-motion adherence, and zero horizontal overflow at `360px`, `768px`, and `1440px`.
5. **Truthful export & zero fake UI:** Clean-install build pass on every Core exported framework before ZIP download is offered; zero inert controls, sample-data misrepresentation, or hidden errors.
