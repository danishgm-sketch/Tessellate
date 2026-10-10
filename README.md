# Tessellate

> **Describe the product. Get the interface.**
>
> Tessellate is an open interface-intelligence layer: a free component/pattern commons, deterministic UI composition engine, visual workbench, registry, CLI and agent interface that turns product intent into a coherent, code-ready interface system.

## Read this first — autonomous-agent entrypoint

This repository is intentionally designed so that an autonomous coding agent can enter the repository with essentially no project briefing and execute the build from repository instructions alone.

Antigravity automatically discovers the root `AGENTS.md` / `GEMINI.md` workspace rules. Current Antigravity still requires a user action to spawn an agent, so after adding this repository to an Antigravity project the minimal bootstrap instruction is simply:

```text
/goal Start
```

`GEMINI.md` defines `Start` as: execute `AGENTS.md` and `docs/BUILD_ORDER.md` autonomously from the first incomplete item until a documented stopping condition applies.

If you are Antigravity, Codex, Claude Code, or another autonomous engineering agent:

1. Read `AGENTS.md` completely.
2. Read every document listed in `AGENTS.md` under **Mandatory reading order**.
3. Treat those documents as the product owner's decisions. Do not reopen major architectural, product, design, infrastructure or stack choices unless a documented contradiction makes implementation impossible.
4. Start at the first incomplete item in `docs/BUILD_ORDER.md`.
5. Work in vertical, testable increments. Run the required checks after every increment.
6. Record any unavoidable deviation in `docs/DECISIONS.md` before implementing it.
7. Do not ask the owner to choose between reasonable implementation details that are already specified. Make only local engineering judgments consistent with the specification.
8. Never replace a specified system with a convenient but materially different one.

## Non-negotiable constraints

- **Target hosting/maintenance cost:** normally £0–£8/month; **hard ceiling £20/month** before deliberate commercial scaling.
- **Launch deployment:** Cloudflare static/edge-first architecture. No always-on paid server required.
- **AI cost:** no platform-funded unlimited inference. Core product must work deterministically without LLM calls. AI features use user-supplied provider credentials where necessary.
- **Public resource code:** free. No Pro component paywall, daily download cap or source-code subscription.
- **Primary V1 stack:** React + TypeScript + Tailwind CSS 4 resources; Astro public shell; React workbench; Hono/Workers API; D1 for small account state; R2 for optional large user assets.
- **Resource catalogue source of truth:** Git repository, not a runtime database.
- **Project editing model:** structured manifests and validated mutations, not arbitrary AI-written source-code mutation.
- **Accessibility:** platform UI targets WCAG 2.2 AA.
- **Security:** arbitrary community JavaScript never executes on the authenticated application origin.

## V1 public beta scope

V1 is intentionally large enough to feel like a mature ecosystem:

- 324 canonical coded resources.
- 972 curated resource configurations (three configurations per canonical resource).
- 36 complete page compositions.
- 12 complete product blueprints.
- 30 Design DNA presets.
- deterministic Product Interpreter and composition engine.
- Visual Ambition and Structural Creativity controls.
- project/page/section/component/element intent inheritance.
- locking, replacing, restructuring, restyling, comparison and history.
- Workbench live canvas.
- local-first projects with optional cloud sync.
- hybrid browser-side search.
- ZIP/source export and `.tess.json` export.
- shadcn-compatible registry.
- CLI.
- MCP server.
- agent-readable documentation and manifests.
- ten free client-side UI laboratories.
- GitHub sign-in for cloud state/contribution identity.

The exact launch corpus is enumerated in `docs/LAUNCH_INVENTORY.md`; agents must not invent a different set merely to reach the numerical targets.

## Core mental model

```text
PRODUCT INTENT
    ↓
PRODUCT MODEL
    ↓
DESIGN DNA
    ↓
SCREEN GRAPH
    ↓
COMPOSITION GRAMMAR
    ↓
COMPATIBILITY ENGINE
    ↓
RESOURCE GRAPH
    ↓
NORMALISATION ENGINE
    ↓
LIVE INTERFACE
    ↓
VALIDATED MUTATIONS
    ↓
EXPORT / REGISTRY / CLI / MCP
```

The critical distinction is that Tessellate does **not** merely recommend attractive components. It first defines a coherent interface system and then selects/adapts compatible resources to satisfy that system.

## Product structure

Primary public routes:

```text
/
/explore
/components
/sections
/blocks
/pages
/effects
/motion
/backgrounds
/ai
/data
/r/[slug]
/compose
/workbench
/workbench/[project]
/blueprints
/blueprints/[slug]
/collections
/collections/[slug]
/creators
/creators/[username]
/showcase
/trends
/tools
/tools/dna
/tools/background
/tools/motion
/tools/palette
/tools/type
/tools/layout
/tools/sections
/tools/data
/tools/accessibility
/tools/icons
/agents
/docs
/docs/registry
/docs/cli
/docs/mcp
/docs/manifest
/docs/contributing
/sponsor
/about
/license
/privacy
/terms
```

## Mandatory specification index

- `AGENTS.md` — autonomous-agent operating contract.
- `GEMINI.md` — Antigravity bootstrap rule.
- `docs/PRODUCT_SPEC.md` — product scope and behaviour.
- `docs/DESIGN_SYSTEM.md` — exact visual system and responsive behaviour.
- `docs/WORKBENCH_SPEC.md` — editor/workbench interaction model.
- `docs/COMPOSITION_ENGINE.md` — ProductModel, DesignDNA, compatibility, normalisation and mutation architecture.
- `docs/ARCHITECTURE.md` — monorepo, applications, packages, storage and infrastructure.
- `docs/DATA_CONTRACTS.md` — canonical data models and schema requirements.
- `docs/LAUNCH_INVENTORY.md` — exact 324 resources and complete supporting launch corpus.
- `docs/BUILD_ORDER.md` — exact implementation order and phase gates.
- `docs/QUALITY_SECURITY.md` — tests, performance budgets, accessibility, preview isolation and contribution gates.
- `docs/DEPLOYMENT_COST.md` — Cloudflare deployment and £20/month ceiling.
- `docs/DECISIONS.md` — locked decision register.
- `design/REFERENCE_DIRECTIONS.md` — visual north stars and GPT image-generation briefs.
- `design/reference-home.svg` — homepage composition reference.
- `design/reference-workbench.svg` — Workbench composition reference.

## Local development

### Prerequisites

- Node.js >= 22 (tested on Node v24)
- pnpm >= 10 (tested on pnpm v11)

### Commands

```bash
# Install workspace dependencies
pnpm install

# Run local development servers (site, preview, api)
pnpm dev

# Run strict TypeScript typecheck across monorepo
pnpm typecheck

# Run linter
pnpm lint

# Run unit tests
pnpm test

# Build all applications and packages
pnpm build

# Run end-to-end tests
pnpm test:e2e
```

## Definition of success

A first-time visitor must experience this sequence:

1. **10 seconds:** “This is a large, serious free UI library.”
2. **30 seconds:** “It understands which interface pieces belong together.”
3. **1 minute:** “It can design an entire application, not merely recommend components.”
4. **3 minutes:** “I can independently control how professional, playful, cinematic, dense, minimal or radical every part is.”
5. **5 minutes:** “I can restructure the product without losing sections I like.”
6. **10 minutes:** “I can export a complete structured project and hand it directly to a coding agent.”

## North star

Tessellate is not trying to become the biggest component website.

It is trying to become:

> **The open interface-intelligence layer between an idea and working software.**
