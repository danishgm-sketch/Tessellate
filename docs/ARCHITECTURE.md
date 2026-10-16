# Tessellate Architecture

> Current operating state (2026-10-16): D-041 retains the owner-authorized optional laptop Docker API/local D1/CPU host; D-042 freezes expansion. Static Astro/browser-local Core remains independent. Existing Sites packaging is an isolated hosting adapter, not a new app stack. Cloud D1/R2, GitHub OAuth and a permanent laptop tunnel are configuration-dependent, not proven live by these historical launch plans. All deployment/pricing assertions below are architectural targets until verified.


## 1. Architecture objective

Tessellate must deliver a large, sophisticated product while remaining inexpensive to operate. The architecture therefore maximises:

- static generation;
- browser-side computation;
- local-first state;
- precomputed metadata;
- deterministic algorithms;
- edge functions only for genuinely dynamic shared state;
- user-funded AI inference;
- portability away from any single host.

The architecture explicitly avoids paying for capabilities that can be precomputed or run in the browser.

## 2. Monorepo

Package manager: pnpm.

Canonical structure:

```text
tessellate/
│
├── apps/
│   ├── site/                 # Astro public site + React islands
│   ├── api/                  # Hono Cloudflare Worker
│   └── preview/              # isolated resource preview origin/app
│
├── packages/
│   ├── ui/                   # Tessellate product-shell UI primitives
│   ├── schemas/              # canonical Zod/data contracts
│   ├── catalog/              # resource loading/indexing/catalogue API
│   ├── search/               # Orama + local semantic search adapters
│   ├── dna/                  # DesignDNA presets/mapping/inheritance
│   ├── composer/             # deterministic ProductModel/screen/composition engine
│   ├── compatibility/        # hard constraints + scoring + graph
│   ├── renderer/             # ProjectManifest -> live React UI
│   ├── workbench/            # Workbench app modules
│   ├── exporter/             # ZIP, manifest, agent package
│   ├── registry/             # shadcn-compatible registry build/runtime
│   ├── cli/                  # @tessellate/cli
│   ├── mcp/                  # @tessellate/mcp
│   └── testing/              # fixtures/test helpers/a11y/visual helpers
│
├── resources/                # public catalogue source of truth
│   ├── primitives/
│   ├── navigation/
│   ├── marketing/
│   ├── application/
│   ├── data/
│   ├── ai/
│   ├── motion/
│   ├── backgrounds/
│   ├── typography/
│   └── states/
│
├── presets/
│   ├── dna/
│   ├── palettes/
│   ├── typography/
│   ├── motion/
│   └── responsive/
│
├── blueprints/
├── grammars/
├── scripts/
├── migrations/
├── tests/
├── docs/
├── design/
│
├── AGENTS.md
├── ARCHITECTURE.md (optional root alias later if helpful)
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── README.md
```

## 3. Public site

Framework: Astro.

Responsibilities:
- homepage;
- catalogue category pages;
- resource detail pages;
- blueprint pages;
- creator pages;
- docs;
- showcase;
- tools shells;
- Workbench route host;
- authentication entry UI;
- public project pages.

Rendering strategy:

### Pre-render at build time where possible
- homepage shell;
- resource catalogue pages;
- individual resource pages;
- docs;
- blueprints;
- static collections;
- public marketing pages.

### Hydrate React islands only where required
- search;
- filters;
- interactive previews;
- composer;
- tools;
- Workbench;
- account/project interactions.

Avoid turning the entire Astro site into a client-side SPA.

## 4. Workbench

Workbench is React-based and lazy-loaded as an application island/route.

State layers:

### Canonical project state
`ProjectManifest` in Zustand store.

### Ephemeral UI state
- selection;
- panels;
- canvas zoom/pan;
- hover;
- open menus;
- temporary previews.

Keep this separate from canonical project state so transient UI does not pollute export/history.

### History
Semantic mutation operation log.

### Persistence
IndexedDB adapter writes durable local project state.

Cloud sync adapter only runs for authenticated users.

## 5. API Worker

Framework: Hono on Cloudflare Workers.

The API is intentionally narrow.

V1 route families:

```text
/api/auth/*
/api/me
/api/projects
/api/projects/:id
/api/projects/:id/revisions
/api/projects/:id/publish
/api/published/:slug
/api/favorites
/api/collections
/api/creator-links
/api/reports
/api/ai/:provider/*
```

Do not expose catalogue CRUD at runtime. Public catalogue ships from Git/build artifacts.

## 6. Database

Cloudflare D1.

D1 stores small shared account/application state:

- profiles;
- project metadata;
- cloud project snapshots/revisions;
- favourites;
- collections;
- published project metadata;
- creator links;
- abuse/report records;
- AI proxy rate-limit/accounting counters.

It does **not** store:

- canonical resource code;
- canonical resource manifests as the source of truth;
- generated search index;
- preview bundle artefacts.

## 7. Object storage

Cloudflare R2.

Use for:
- optional user-uploaded logos/images;
- project thumbnails;
- large preview media not suitable for repository/CDN build output;
- future database exports/backups;
- optional build-generated artefacts if static host limitations require it.

R2 references are content-addressed where useful to deduplicate identical assets.

## 8. Catalogue ownership

Git is canonical.

Each resource folder contains:

```text
resource-slug/
├── manifest.ts or manifest.json
├── index.tsx
├── preview.tsx
├── fixtures.ts
├── README.md
└── optional assets/
```

A build step:
1. discovers resources;
2. validates manifests;
3. validates files/dependencies;
4. generates flattened catalogue JSON;
5. generates search index;
6. generates registry artefacts;
7. generates static routes;
8. optionally generates thumbnails/previews.

Invalid resource manifest fails the build.

## 9. Search architecture

### Full-text
Orama index built from:
- name;
- description;
- categories;
- roles;
- purposes;
- intent strings;
- tags;
- archetype metadata;
- selected DNA labels.

Ship compressed browser index.

### Semantic
Precompute resource embeddings at build time.

Browser query embedding:
- use Transformers.js;
- prefer WebGPU when supported;
- fall back to WASM;
- do not load embedding model until semantic search is requested/beneficial.

If semantic is unavailable, full-text and metadata filters remain fully functional.

## 10. AI provider architecture

Adapter interface:

```ts
interface AIProviderAdapter {
  id: string;
  validateCredential(...): Promise<Result>;
  structuredGenerate<T>(request: StructuredRequest<T>): Promise<T>;
  streamText?(...): AsyncIterable<...>;
}
```

V1 adapters:
- OpenAI;
- Anthropic;
- Gemini;
- OpenRouter-compatible.

Credentials are runtime session secrets, preferably in memory.

When a provider requires server-side proxying:
- credential passes only for that request;
- no persistence;
- no cache;
- redact request/response from ordinary logs;
- apply abuse/rate controls;
- return provider errors safely.

Do not create a universal provider abstraction so complex that provider-specific structured-output strengths are lost. Maintain shared minimum interface plus provider-specific implementations.

## 11. Authentication

Better Auth + GitHub OAuth.

Guest-first is mandatory.

Core product without login:
- browse;
- search;
- compose;
- workbench local save;
- export.

Login adds:
- cloud save;
- favourites;
- collections;
- publish;
- creator identity.

No password auth V1.

## 12. Local persistence

Use IndexedDB via a very small internal adapter (dependency allowed only if justified; direct IndexedDB wrapper may be written if simpler).

Namespaces:
- projects;
- project history/checkpoints;
- cached catalogue/search artefacts;
- user preferences;
- optional non-secret provider/model preference;
- recently used resources.

Never store provider API keys by default.

## 13. Preview isolation

Resource previews run on separate app/origin from authenticated shell.

Requirements:
- no auth cookies sent;
- iframe sandbox;
- strict CSP;
- no top navigation;
- outbound network restricted by default;
- message protocol allowlisted;
- preview receives only fixture/theme/device config;
- preview cannot directly mutate parent state.

Parent communicates via typed `postMessage` protocol with origin validation.

## 14. Renderer

`packages/renderer` turns semantic ProjectNodes into live React components.

Renderer inputs:
- ProjectManifest;
- catalogue registry;
- effective DesignDNA;
- token map;
- viewport context;
- reduced-motion state.

Renderer must not fetch resource metadata ad hoc over network if catalogue is already local.

Unknown/missing resource:
- render recoverable placeholder with resource ID;
- report audit issue;
- project remains openable.

## 15. Export architecture

Export is mostly browser-side.

Steps:
1. validate ProjectManifest;
2. collect referenced resources/dependencies;
3. render generated project file tree;
4. include design token files;
5. include component files;
6. include content/fixture data;
7. include dependencies/package manifest;
8. include README/implementation notes;
9. compress via fflate;
10. download ZIP.

No paid remote build worker is required.

## 16. Registry

Build shadcn-compatible registry artefacts from canonical resources.

Endpoint pattern:

```text
/r/{name}.json
```

Namespace examples:

```text
@tess/hero-editorial
@tess/sidebar-intelligence
@tess/theme-nocturne
@tess/motion-soft-spring
```

Registry artefacts are static/CDN served whenever possible.

## 17. CLI

Package: `@tessellate/cli`.

Commands:

```text
tess init
tess search
tess view
tess add
tess compose
tess export
tess validate
tess doctor
tess create-resource
```

CLI consumes public static catalogue/registry metadata where possible, reducing dynamic API load.

## 18. MCP

Package: `@tessellate/mcp`.

Initial tools:
- search_resources;
- get_resource;
- get_resource_code;
- get_resource_metadata;
- find_alternatives;
- recommend_resources;
- compose_screen;
- compose_product;
- validate_project;
- audit_project;
- get_design_dna;
- list_design_directions;
- export_project.

Prefer local/deterministic implementation when MCP server is installed locally. Remote hosted MCP can be considered later.

## 19. Agent-readable assets

Generate:
- `/llms.txt`;
- `/llms-full.txt`;
- `/openapi.json`;
- `/catalog.json`;
- `/catalog.min.json`;
- resource JSON endpoints;
- registry docs;
- manifest JSON Schema;
- MCP tool documentation.

## 20. Build pipeline

Canonical pipeline:

```text
install
↓
typecheck schemas/packages
↓
validate licences
↓
validate catalogue
↓
unit tests
↓
generate catalogue
↓
generate search index
↓
generate registry
↓
build preview app/resources
↓
build site/api
↓
Playwright critical flows
↓
a11y checks
↓
deploy
```

No generated artefact should be manually edited.

## 21. CI

GitHub Actions.

PR checks:
- install with lockfile;
- typecheck;
- lint;
- unit tests;
- catalogue validation;
- licence validation;
- build;
- targeted Playwright;
- accessibility smoke.

Resource-contribution PR additionally runs resource-specific screenshots at:
- 360px;
- 768px;
- 1440px.

## 22. Environments

### local
Uses Wrangler local D1/R2 emulation where feasible and local fixture auth mode only in development.

### preview
Per-PR/branch deployment where available at zero/low incremental cost.

### production
Cloudflare-backed.

No separate permanently running staging server is required initially.

## 23. Configuration

Environment variables must be centrally documented in `.env.example` and typed in code.

Expected categories:
- GitHub OAuth app credentials;
- Better Auth secret;
- Cloudflare bindings configured by platform/wrangler;
- public site origin;
- preview origin;
- optional feature flags.

No AI provider customer keys are deployment env vars for the BYO flow.

## 24. Portability

Keep domain logic host-neutral.

Cloudflare-specific code should stay in:
- `apps/api` adapters;
- storage bindings;
- deployment config.

Core packages:
- schemas;
- DNA;
- composer;
- compatibility;
- renderer;
- search catalogue logic;

must not import Cloudflare runtime APIs.

This allows future VPS migration:
- static files via Caddy;
- Hono/Node adapter;
- SQLite;
- filesystem/S3-compatible object storage.

## 25. Avoided architecture

Do not introduce in V1:
- microservices;
- message brokers;
- Redis;
- Kubernetes;
- container orchestration;
- hosted vector DB;
- server-side rendering for every catalogue page;
- database-backed CMS for resources;
- server-side headless browser preview per request;
- always-on WebSocket collaboration infrastructure.

## 26. Architecture success criteria

The architecture is successful when:

- anonymous browsing/composition generates almost no dynamic backend load;
- search works even during API outage after static assets load;
- local projects survive without account/server;
- catalogue can be rebuilt entirely from Git;
- adding thousands of static resources does not create proportional runtime database cost;
- AI provider outage does not break deterministic core;
- core domain packages can execute in browser, Node and Workers where appropriate;
- production can remain below the cost ceiling at early traffic levels.
