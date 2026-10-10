---
trigger: glob
globs: "apps/api/**, migrations/**, packages/exporter/**, packages/mcp/**, packages/cli/**"
description: "Tessellate backend, storage, security and cost-ceiling rules."
---

# Tessellate Backend Rules

Before backend/storage/security changes, read:

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT_COST.md`
- `docs/QUALITY_SECURITY.md`
- `docs/DATA_CONTRACTS.md`

Rules:

1. Hono + Cloudflare Workers is the launch API runtime.
2. D1 stores small authenticated/shared account state, not the canonical public resource catalogue.
3. R2 is used only when object storage is genuinely necessary.
4. Guest core experience must remain usable without backend availability after static assets are loaded where feasible.
5. Do not add paid SaaS infrastructure for convenience.
6. Normal expected infrastructure cost is £0–£8/month; £20/month is a hard pre-commercial ceiling.
7. Never write cloud state on every Workbench interaction; local IndexedDB is immediate source during editing and cloud sync is checkpoint-based.
8. AI provider credentials are memory-only by default and never persisted to D1/R2/logs/analytics in V1.
9. Untrusted preview code never executes with authenticated application-origin privileges.
10. Validate every external API boundary with canonical schemas and authorize object ownership server-side.
11. Do not accept arbitrary proxy destinations for AI traffic.
12. Export should be browser-side where practical; do not build a paid remote build farm.
13. Keep core domain packages Cloudflare-neutral so a future inexpensive VPS migration remains possible.
14. Any change likely to threaten the £20/month ceiling requires an explicit owner decision before merge.
