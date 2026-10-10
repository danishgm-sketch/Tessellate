# Tessellate Quality, Security, Accessibility and Performance Gates

## 1. Purpose

Tessellate is a public code/resource platform with an authenticated application shell, community contribution path, live previews and optional AI-provider traffic. Quality and security are therefore product features, not later hardening tasks.

This document defines release gates. An autonomous agent must treat failures here as blockers, not suggestions.

## 2. Release gate categories

Every production release must pass:

1. Type safety.
2. Unit tests.
3. Integration tests.
4. Critical-path browser tests.
5. Catalogue/schema validation.
6. Licence/provenance validation.
7. Accessibility checks.
8. Performance budgets.
9. Security checks.
10. Visual review of materially changed UI.

## 3. Type safety

- TypeScript strict mode is mandatory.
- No project-wide `skipLibCheck` as a shortcut unless a documented package incompatibility requires it.
- Avoid `any`; isolated `any` requires a comment explaining why schema validation or narrower types are impossible.
- Public package APIs must have explicit exported types.
- Zod schemas and TypeScript types should derive from one source where practical.

## 4. Linting

Use ESLint with focused rules for:
- React hooks;
- accessibility where compatible;
- import/order hygiene;
- no unused variables;
- no floating promises;
- no unsafe non-null assertions in public data paths where practical.

Do not accumulate dozens of stylistic lint rules that fight formatter output.

Use Prettier or an equivalent single formatter and commit the config.

## 5. Unit tests

Use Vitest.

High-priority packages:
- schemas;
- dna;
- composer;
- compatibility;
- renderer utilities;
- exporter;
- catalogue validation;
- mutation/history logic.

Required unit coverage categories:
- Design DNA inheritance;
- adjective mapping;
- ProductModel inference rules;
- hard compatibility rejection;
- compatibility scoring weights;
- deterministic seeds;
- lock preservation;
- mutation inversion;
- schema migration;
- responsive substitution;
- licence allowlist;
- export dependency collection;
- audit score calculations.

Avoid chasing a vanity line-coverage percentage at the expense of meaningful assertions. Critical domain packages should nevertheless maintain strong coverage.

## 6. Golden composition fixtures

Maintain fixtures for:

1. financial intelligence terminal;
2. playful HR platform;
3. luxury hospitality marketplace;
4. developer observability platform;
5. minimalist personal finance tool;
6. scientific research environment.

Each fixture asserts:
- valid ProductModel;
- expected screen classes;
- Design DNA direction ranges;
- required semantic roles;
- no forbidden pattern selection;
- accessibility/performance constraints respected;
- deterministic output for fixed catalogue + seed.

Do not overfit golden tests to exact resource IDs unless testing ranking.

## 7. Browser tests

Use Playwright.

Critical anonymous flows:

### Browse
- homepage loads;
- global search opens;
- catalogue search/filter works;
- resource detail loads;
- live preview renders.

### Compose
- enter product brief;
- deterministic composition returns three directions;
- select a direction;
- project opens in Workbench.

### Workbench
- select screen/node;
- modify Project DNA;
- add section-level override;
- inherited/explicit state correct;
- lock node;
- replace another node;
- undo/redo;
- device preview;
- audit;
- export manifest.

### Local persistence
- create/edit project;
- reload;
- project restores from IndexedDB.

Authenticated tests may use test fixtures/stubbed OAuth in CI rather than real GitHub login.

## 8. Resource validation

Every resource validation checks:

- manifest schema;
- file paths exist;
- declared dependencies match actual imports where feasible;
- no undeclared external network dependency;
- SPDX license allowlist;
- provenance fields complete;
- required slots documented;
- responsive metadata present;
- accessibility metadata present;
- performance metadata present;
- quality scores complete;
- registry build succeeds;
- preview build succeeds.

## 9. Resource viewport checks

Every verified resource is exercised at:

- 360px;
- 768px;
- 1440px.

Check:
- no horizontal overflow unless explicitly intrinsic;
- no clipped controls;
- text remains readable;
- touch interactions sensible;
- declared responsive strategy matches output.

## 10. Accessibility

Platform target: WCAG 2.2 AA.

Automated checks are necessary but insufficient.

### Automated
Integrate axe into key Playwright flows.

Check:
- labels;
- roles;
- heading order where applicable;
- contrast where computable;
- aria misuse;
- landmarks;
- focusable element basics.

### Manual/agent-assisted checklist
For every major interactive feature:
- complete by keyboard;
- focus order logical;
- focus visible;
- escape closes overlays appropriately;
- dialog focus trapped/restored;
- screen-reader name present for icon-only controls;
- state not conveyed only by colour;
- reduced motion works;
- drag/drop has keyboard alternative.

## 11. Reduced motion

At `prefers-reduced-motion: reduce`:
- eliminate nonessential continuous animation;
- remove parallax;
- remove scroll-scrub motion necessary only for decoration;
- prefer instant/opacity transitions;
- provide static alternative for animated preview where necessary.

Resources that claim `reducedMotionVerified: true` must be tested in that mode.

## 12. Performance budgets

### Public homepage
Target initial JS: <150 KB gzip where practical.

### Catalogue base route
Target initial JS: <200 KB gzip.

### Workbench
May lazy-load to ~750 KB gzip because it is an application, but expensive subsystems (semantic model, code editor, 3D) must load on demand.

### Search
Initial compressed full-text index target: <2 MB for V1 catalogue.

### Semantic model
Never initial-load on homepage/catalogue. Load only on semantic-search activation or idle opt-in path.

### Media
- no offscreen video preload;
- poster/static fallback;
- lazy images;
- responsive sources;
- avoid multi-megabyte decorative hero media on platform shell.

### 3D
- capability detect;
- lazy-load;
- pause when offscreen;
- reduced-motion/static fallback.

## 13. Runtime performance

Resource grid must not mount hundreds of live animated previews simultaneously.

Default strategy:
- static thumbnail/low-cost representation in grid;
- hydrate/live preview only when near viewport or explicitly hovered/opened;
- unmount or pause expensive preview when sufficiently offscreen.

Workbench:
- memoize semantic tree selectors;
- avoid rerendering whole canvas on inspector slider movement where local update possible;
- batch mutations;
- debounce durable persistence;
- keep ephemeral hover/selection state separate from ProjectManifest.

## 14. Security model

Primary rule:

> Untrusted code never executes with authenticated-origin privileges.

## 15. Preview isolation

Community/resource preview runs on separate origin/app.

Requirements:
- no main-domain auth cookie access;
- restrictive CSP;
- iframe sandbox;
- origin-validated `postMessage` protocol;
- no top-level navigation permission;
- no arbitrary outbound fetch by default;
- no localStorage/sessionStorage dependency shared with application;
- fixture/theme configuration only.

Suggested iframe permissions should begin maximally restrictive and add only required capability.

## 16. Content Security Policy

Main app CSP should avoid:
- `unsafe-eval`;
- wildcard script origins;
- wildcard frame origins;
- arbitrary connect-src.

Use hashes/nonces only where needed by deployment framework.

Preview CSP is separate and even more restrictive around parent/auth origins.

## 17. HTML/Markdown sanitation

- Markdown renders through a sanitised pipeline.
- User-supplied project text is rendered as text by default.
- Rich-text output uses explicit safe AST/schema, not direct unsanitised HTML.
- Never render AI output as raw HTML without sanitation/allowlist.

## 18. API validation

Every public API request validates:
- path params where applicable;
- query;
- body;
- auth state;
- ownership/authorization.

Responses containing typed domain objects should be validated during development/tests.

## 19. Authentication security

Better Auth + GitHub OAuth.

Requirements:
- secure HttpOnly cookies;
- SameSite appropriate to flow;
- CSRF protection;
- OAuth state/PKCE as supported/required;
- callback origin allowlist;
- session rotation/expiry per library guidance;
- no auth tokens in localStorage.

## 20. Authorization

For every project/collection mutation:
- resolve authenticated profile;
- verify object ownership or explicit permission;
- never trust client-provided owner ID.

Published read-only revisions are public by opaque slug/ID and cannot mutate source project.

## 21. AI provider secrets

V1 default: memory-only.

Rules:
- never D1;
- never R2;
- never analytics;
- never error telemetry;
- redact authorization headers;
- no request caching;
- clear from memory/session state on explicit disconnect;
- UI must explain storage policy.

If browser-to-provider direct request is supported safely, prefer it. Otherwise proxy minimally.

## 22. AI proxy abuse

Even though customer supplies key:
- rate limit per session/IP/account to protect infrastructure;
- cap request body size;
- restrict destination to supported provider endpoints;
- never accept arbitrary proxy URL except explicitly configured OpenRouter-compatible base URLs validated against safe rules;
- use Turnstile on anonymous abuse-prone paths if required.

## 23. Upload security

For user brand assets:
- explicit max file size;
- verify MIME and magic bytes where possible;
- allowlist image formats;
- SVG either reject initially or sanitise aggressively;
- random/content-addressed storage keys;
- no user-controlled executable extension;
- serve with correct content type and no-sniff headers.

V1 preferred uploads:
- PNG;
- JPEG;
- WebP;
- AVIF where tooling supports.

Treat SVG as a later opt-in unless sanitisation is robust.

## 24. Dependency security

CI:
- lockfile required;
- dependency audit;
- Dependabot/Renovate may be enabled;
- no unpinned GitHub commit dependencies in production without documentation;
- review transitive impact of large/abandoned packages.

Resource dependencies also pass allow/deny checks.

## 25. Licensing gate

A resource cannot publish unless:
- SPDX identifier recognized;
- license allowed for redistribution;
- original source recorded for non-Tessellate origin;
- attribution requirements captured;
- derivative status declared.

Ambiguous licensing is a blocker, not a warning.

## 26. Privacy

Collect minimal data.

Do not:
- fingerprint users;
- sell behavioural profiles;
- record raw AI prompts in analytics by default;
- log project content unnecessarily;
- retain provider secrets.

Analytics should be aggregate/product-focused.

## 27. Error telemetry

If a free/low-cost telemetry solution is added, scrub:
- credentials;
- project full content;
- AI prompts;
- uploaded asset URLs if private;
- OAuth tokens/cookies.

Error IDs can correlate user reports without leaking payloads.

## 28. Backups/recovery

Public catalogue:
- Git history is canonical.

D1:
- rely on platform point-in-time recovery initially;
- add scheduled SQL export to R2 once usage justifies.

User local data:
- Workbench offers explicit manifest export.

## 29. Visual quality gate

For major UI changes:
- desktop screenshot at 1440 width;
- mobile screenshot at 390 width;
- compare spacing/hierarchy against design system;
- inspect dark Workbench contrast;
- ensure no generic AI-style visual drift;
- inspect hover/focus/selected states.

## 30. Production release blocker examples

Block release if:
- schema-invalid catalogue resource exists;
- a core route throws console/runtime error;
- project data can be lost on ordinary reload;
- auth ownership check missing;
- preview code can access authenticated origin data;
- provider key appears in persistence/logs;
- Workbench core operation inaccessible by keyboard;
- public-site JS budget regresses substantially without documented justification;
- critical Playwright flow fails;
- licence provenance is ambiguous for newly published resource.
