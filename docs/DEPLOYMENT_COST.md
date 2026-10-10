# Tessellate Deployment and Cost Architecture

## 1. Hard requirement

Before deliberate commercial scaling, recurring platform infrastructure must remain below **£20/month**, with a normal early-stage target of **£0–£8/month**.

The product must be designed so that higher traffic increases static/CDN delivery far more rapidly than dynamic database/compute cost.

## 2. Production platform

Launch on Cloudflare using:

- static assets / Pages or Workers static assets for public site;
- Workers for API;
- D1 for account/project shared state;
- R2 for optional large user/media assets;
- Turnstile for abuse protection where needed;
- Cloudflare Web Analytics for basic privacy-oriented traffic analytics.

Do not launch with an always-on VPS unless platform constraints materially change.

## 3. Why edge/static first

Most Tessellate traffic is read-heavy:

- catalogue pages;
- docs;
- resource previews;
- search index;
- registry artefacts;
- public blueprints;
- static showcase material.

These should be prebuilt and cached rather than recomputed per request.

Anonymous composition should run predominantly in browser using shipped catalogue metadata and deterministic code.

## 4. Cost responsibility by feature

### Static catalogue
Platform cost should approach CDN/static cost, not database cost.

### Search
Browser-side. No Algolia/Elasticsearch/Typesense Cloud.

### Semantic search
Browser-side query embedding. Resource embeddings precomputed.

### Workbench
Browser-side state/rendering.

### Local projects
IndexedDB.

### Cloud projects
D1 only for authenticated users and meaningful checkpoints.

### AI
User-supplied provider credentials. Tessellate does not subsidize unlimited inference.

### Export
Browser-side ZIP generation.

### Registry
Static generated JSON where feasible.

### CLI/MCP
Consume static catalogue and local deterministic packages where feasible.

## 5. Expected early monthly spend

Target planning envelope:

| Service | Early target |
|---|---:|
| Static hosting/CDN | £0 |
| Workers API | £0 initially |
| D1 | £0 initially |
| R2 | £0 initially |
| Turnstile | £0 |
| Web Analytics | £0 |
| Search | £0 |
| Platform-funded AI | £0 |
| GitHub | £0 |
| Domain amortized | ~£1 |
| **Expected** | **~£1/month** |

Actual provider pricing changes over time. Before first production deployment and before any paid-plan change, verify current public pricing. The architecture goal matters more than assuming a permanent exact tariff.

## 6. Paid threshold policy

If free-tier capacity becomes insufficient:

1. identify which feature causes spend;
2. optimize/precompute/cache first;
3. upgrade only the specific service required;
4. document new expected monthly upper bound;
5. do not exceed £20/month without owner decision.

A likely first upgrade is Workers paid tier rather than adding a separate server fleet.

## 7. Budget circuit breakers

Implement operational safeguards:

- request rate limits on dynamic API;
- strict upload limits;
- AI proxy limits even with BYO key;
- no unbounded server-side image transformation;
- no server-side headless browser per anonymous request;
- no uncontrolled object-store public upload;
- no per-keystroke cloud project writes;
- no dynamic preview build per view.

## 8. D1 write discipline

Never write cloud state for every Workbench mutation.

Use:
- immediate IndexedDB update;
- debounced/idle cloud checkpoint;
- explicit save;
- publish snapshot.

For slider drags, only final/settled semantic operation enters durable cloud revision.

## 9. R2 discipline

Store only:
- user assets genuinely too large for D1;
- project thumbnails where useful;
- large preview media that should not live in Git/static build output;
- backup exports.

Apply per-user/project upload limits.

Prefer content-addressed deduplication for identical assets.

## 10. Static artefact strategy

Generated during CI/build:

- catalogue JSON;
- compressed catalogue;
- Orama index;
- resource embeddings;
- registry JSON;
- resource static pages;
- docs;
- OpenAPI/JSON schemas;
- `llms.txt` assets;
- preview bundles or preview metadata where feasible.

Serve from CDN/static layer.

## 11. AI cost architecture

Tessellate has two modes.

### Deterministic mode
Cost to platform: effectively ordinary static/browser usage.

### AI-assisted mode
User provides:
- OpenAI key;
- Anthropic key;
- Gemini key;
- supported compatible provider credential.

Provider credential is not persisted server-side in V1.

The UI must clearly communicate:

> AI-assisted operations use your configured provider and may incur charges from that provider. Tessellate's core composition tools work without AI.

## 12. No hidden SaaS dependencies

Do not introduce recurring paid services for:

- authentication;
- search;
- analytics;
- email;
- feature flags;
- vector database;
- image hosting;
- form handling;
- error tracking;
- queueing;
- cron;

unless the free/cheap native architecture becomes insufficient and the owner approves.

If a low-cost/open solution is needed later, document why it cannot be implemented within existing stack.

## 13. Email avoidance V1

GitHub OAuth only means V1 does not require:
- signup verification email;
- password reset email;
- transactional account email.

This avoids an unnecessary provider and operational surface.

System notices can initially appear in product/GitHub without email.

## 14. Scheduled jobs

Prefer build-time work and GitHub Actions for catalogue maintenance jobs.

If runtime scheduled maintenance becomes necessary, use Cloudflare Cron Triggers within existing Worker before adding external schedulers.

## 15. Backups

Catalogue:
- Git/GitHub history.

D1:
- platform recovery/Time Travel capabilities;
- later scheduled logical export to R2 if usage warrants.

R2 assets:
- content-addressed keys reduce accidental overwrite;
- deletion flows can use soft-delete metadata for a short period where affordable.

## 16. Monitoring

Keep early monitoring cheap:

- Cloudflare dashboard/analytics;
- GitHub Actions health;
- structured API error logs with secret scrubbing;
- lightweight health endpoint.

Do not add paid APM by default.

If error monitoring becomes necessary, first evaluate whether a free tier fits the hard cost ceiling and privacy requirements.

## 17. Deployment topology

Recommended domains/subdomains:

```text
www.tessellate.*        public site / workbench shell
tessellate.*            redirects/canonical depending domain choice
api.tessellate.*        optional API origin if separated
preview.tessellate.*    untrusted resource previews
```

The preview origin must remain security-isolated from authenticated app cookies.

## 18. CI/CD

On merge to main:

1. install frozen dependencies;
2. run typecheck/lint/tests;
3. validate catalogue/licences;
4. generate static artefacts;
5. build site/api/preview;
6. run browser smoke/accessibility;
7. deploy;
8. smoke production health endpoints/static resource availability.

If deployment fails, do not leave documentation marking the phase complete.

## 19. Secrets

Production secrets configured in deployment environment:

- Better Auth secret;
- GitHub OAuth client secret;
- any required signing secret.

Never commit.

Public config includes only safe origins/client identifiers as appropriate.

## 20. VPS escape hatch

Architecture must remain portable to one inexpensive VPS if desired later.

Target migration topology:

- Caddy or equivalent static/reverse proxy;
- Node runtime/Hono adapter;
- SQLite;
- local filesystem or S3-compatible object store;
- static Astro build.

Core packages must remain Cloudflare-neutral.

A VPS migration is considered acceptable only if:
- total monthly spend remains below £20;
- backups/security are explicitly handled;
- operational complexity does not exceed the value gained.

## 21. Cost review checklist

Before adding any feature, ask:

1. Can this be build-time?
2. Can this be client-side?
3. Can this be cached/static?
4. Can this be local-first?
5. Can this use an existing Cloudflare primitive?
6. Does it create unbounded per-user recurring cost?
7. Is a paid API essential or merely convenient?
8. Can BYO credentials shift variable inference cost to the requesting user?
9. What happens at 10× traffic?
10. Does this threaten the £20 ceiling?

If the answer to #10 is yes, do not merge without owner decision.
