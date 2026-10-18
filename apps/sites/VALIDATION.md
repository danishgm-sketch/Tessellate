# Sites review validation

The canonical Astro application builds 710 static pages. React islands, deterministic composition, Workbench, Gold registry and standalone exporter are reused. Sites requires an isolated asset Worker adapter to enforce original security headers; no wholesale rewrite was made.

The canonical architecture remains Astro/React/Hono/Better Auth with D1/R2-oriented packages. Staging uses existing browser persistence and requires no authentication. D1 and R2 bindings are null; no new database, asset service, paid dependency or secret persistence was introduced. Existing £20/month infrastructure ceiling remains a constraint.

Server API persistence, GitHub OAuth and R2 uploads are not provisioned in this review environment. They are not simulated. CLI/MCP packages remain distributable source, rather than processes hosted by the public review Site. Human-facing browsing, composition, editing, audit and independent export are client-side workflows.

Native public assets previously bypassed Worker security controls. The adapter prefixes payload paths and packages HTML as binary payloads so public routes are handled by the Worker. HTML responses use no-transform to prevent hosting-layer script injection conflicting with the original CSP. Opaque preview frames remain sandboxed and cannot reach APIs or external hosts; a path-scoped same-origin `connect-src` for immutable `/_astro/` assets is required for the browser's stylesheet preload and was verified against the deployed Site.

Version 5 deployed from 79671fab6adb7f598a8801ef8dd4409f90f6b0f6. Its real flagship, all 324 resources at two widths, 31 public routes, ten tools, responsive/keyboard audit, five native regressions, and independent standalone ZIP runtime passed. A final content sweep found four more unsupported claims; these were fixed and version 6 verification is pending.

Current local quality suite: 391 unit/integration tests; frozen dependency installation; catalogue validation; TypeScript; ESLint (zero errors, 34 existing warnings); all 16 release gates; licence/provenance; secret/security; production build and bundle budgets pass. Full browser acceptance remains required on the final deployed version. One medium compact Direction A card limitation is documented; its full interactive preview is usable.

Complete changes, findings, screenshots and final deployed acceptance are recorded under audit/ and the pull request. No code-level success is treated as deployed acceptance.
