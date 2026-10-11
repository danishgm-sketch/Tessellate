# Tessellate Sites review artifact

Base: `antigravity/v1-merge-gate`, `50a2c7f11dcda22a8bfa61b83e3d687291b35905`.

Astro is natively compatible through its static export. This is a packaging adapter,
not a replacement application. All React packages, resource provenance, schemas,
composition, rendering, Workbench, and browser exporter remain canonical.

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build
node apps/sites/prepare-static.mjs
```

The adapter copies `apps/site/dist` into the root `dist` accepted by Sites. It also
copies the existing compiled stylesheet to `/src/styles/global.css`, which the
canonical resource-detail and preview pages reference. It does not edit HTML,
resource source, runtime code, design tokens, headers, or CSP. It adds no dependency.
Use the Sites source workflow helper to push and package this exact source state;
save the archive-backed version without deploying it. Publication requires explicit
owner approval. Every Sites deployment URL is production; a saved version has no
separate hosted preview in the available tools. Review locally before publication.

## Scope and limitations

- Guest homepage, Explore, Compose, Workbench, ten tools, `/showcases`, static
  resource pages, catalogues and registry JSON ship in the existing Astro build.
- `/docs`, its documentation subroutes, `/blueprints`, blueprint-detail routes,
  and `/showcase` do not exist in the base commit. Documentation and blueprint
  data remain in source; `/showcases` is the implemented showcase route.
- The resource-detail iframe registry contains only Button and falls back to it
  for other resource slugs. The Gold 40 project renderer is a separate registry
  and is preserved. This is a base-commit limitation, not a Sites restriction.
- GitHub OAuth, Better Auth, cloud sync/save/publish, favourites, account collections,
  reports and server AI proxy need the canonical Hono API, credentials and bindings;
  this static review does not provision or simulate them. CLI and stdio MCP remain
  distributable packages, not browser-hosted processes.
- Existing `/preview` is same-origin with `allow-scripts allow-same-origin`, and
  its message listener validates message shape but not sender origin. Preserve
  current curated-code behavior; do not admit untrusted/community code or add
  authenticated state to this staging origin. Separate-origin isolation must be
  verified before an authenticated/community preview launch. No security weakening
  is introduced by this packaging adapter.
- `_headers` is preserved verbatim, including CSP and caching. Actual Sites response
  headers and access behavior must be inspected after approved publication.
- No D1/R2 binding, new database, paid SaaS, inference service or always-on server
  is introduced. Browser persistence/export remain browser-side. Sites billing is
  not exposed by these tools, so no exact Sites monthly tariff is asserted.

See `VALIDATION.md` for results and outstanding acceptance gaps. Missing web routes
and incomplete detail previews require separate canonical feature work; a hosting
adapter must not disguise them as implemented.
