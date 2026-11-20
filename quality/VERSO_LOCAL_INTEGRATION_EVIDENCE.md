# Verso local integration evidence

**Captured:** 2026-11-03 (full local runtime audit repeated after the variant-handshake fix)

**Scope:** Owner-only local source inspection; no public redistribution.

## Runtime result

- 1,053 Verso entries were inventoried and validated against Tessellate's canonical `ResourceManifest` schema.
- All 1,053 source modules rendered in the separate local preview application; there were zero unresolved entries, render failures, or runtime warnings in the sweep.
- A representative resource detail page and isolated component preview were checked at 1440×900 and 390×844. Both had HTTP 200, no horizontal overflow, and no clipped page shell.
- Axe reported zero violations. One color-contrast check was incomplete; that result is not a contrast pass or a WCAG certification.
- The application origin returned 404 for a private source module, while the loopback preview origin served the module. The preview runs in a sandboxed iframe on a distinct origin and validates message origin/source before accepting preview messages.
- No uncaught browser exceptions, failed requests, or non-success HTTP responses were recorded by the audit.

The repeat run used the private projection's 1,053 records and checked every rendered source module again: 1,053/1,053 passed with zero unresolved entries, failures, or warnings. Source isolation again returned 404 on the application origin and 200 from the separate loopback preview origin. The audit output and screenshots remain outside Git in the owner's private evidence directory.

The full machine-readable browser run and screenshots remain in the owner's private evidence directory and are intentionally excluded from Git because they describe an external private source tree.

## Scope and limitations

This confirms local discovery and rendering. It does not certify each component's interaction states, accessibility, responsiveness, performance, or export fidelity, and it does not qualify any entry for Tessellate's public catalogue or Gold runtime.

Verso identifies itself as `UNLICENSED` and `private`; attribution and redistribution rights remain unresolved. Therefore all entries stay outside public catalogue data, Workbench composition, registry endpoints, CLI/MCP distribution, browser exports, and the production Sites build. Local integration is read-only and explicitly labelled as private preview. No source file or private projection is committed.

## Reproduction

Follow [`PRIVATE_VERSO_LOCAL_PREVIEW.md`](PRIVATE_VERSO_LOCAL_PREVIEW.md) to generate the inventory/projection outside the repository, start both loopback servers, and rerun the full browser audit. A successful local render remains an inspection result only and does not change the licensing boundary.


## Fresh owner-local revalidation — 2026-11-06

A new static inventory and canonical-schema projection were generated from the current private source tree outside the repository. The inventory contains 1,053 modules, reports zero static parse warnings, and preserves the source license as UNLICENSED. All 1,053 projected manifests are experimental, unverified, and blocked from redistribution; none is eligible for public catalogue, Gold, Workbench, registry, CLI/MCP, or export use.

The two local applications were started on loopback only (127.0.0.1). The current full browser audit rendered 1,053/1,053 projected modules with zero unresolved modules, render failures, or render-sweep warnings. The catalogue contained 1,377 unique slugs during the private run (324 public plus the isolated local projection). The representative detail route returned HTTP 200, with no browser console errors, uncaught exceptions, failed requests, or bad responses. The application origin returned 404 for a private source module; the dedicated preview origin returned 200. The preview remained in a distinct sandboxed iframe using the existing allow-scripts and allow-same-origin policy, with an origin distinct from the application origin.

Axe reported zero violations and one incomplete color-contrast check; no contrast certification is claimed. The representative WebGL resource produced four Chromium GPU-driver warnings about a GPU stall during ReadPixels screenshot/readback. No module failed, but this is retained as a performance observation and does not certify GPU-heavy resources. The full JSON report, private inventory/projection, and two screenshots remain outside Git under the owner-local temporary evidence directory; only this aggregate report is committed. The inventory and projection scripts each passed their seven-file focused suite (25 tests total) on the current branch.

This revalidation confirms private local discovery and rendering only. It neither resolves redistribution rights nor certifies resource accessibility, performance, responsive behavior, or export fidelity. The earlier out-of-repository source boundary and no-public-copy rule remain unchanged.

## Owner authorization update — 2026-11-07

The owner confirmed in writing that this is their own privately authored collection contributed for Tessellate and authorized use, modification, and redistribution in the Tessellate public product, with no separate license required. This supersedes the prior statement that no written project permission existed. The source package still declares `UNLICENSED` and `private`; that metadata is preserved and is not a general license grant for any independently identified third-party code or assets. The source README describes original code and copy inspired by studied ideas and states that no source code or copy was copied.

This authorization resolves the owner-permission blocker for owner-authored work. It does not certify individual entries or lift the active hardening feature freeze. The 1,053 projected entries remain experimental and outside public catalogue, Gold, Workbench, registry, CLI/MCP, Sites, and export surfaces until the ordered release gate permits integration and each entry passes canonical manifest, provenance, accessibility, responsive, reduced-motion, performance, and export review. The owner-local source/projection boundary and isolated preview remain in place. See D-067 in `docs/DECISIONS.md`.
