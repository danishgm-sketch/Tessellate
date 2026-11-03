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
