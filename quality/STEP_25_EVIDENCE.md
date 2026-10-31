# Step 25 — Secondary exporters

Step 25 is complete with deliberately different capability tiers. Next.js and
W3C token export remain Beta; React Native and SwiftUI remain isolated Labs.
No native target is described as a faithful or production-ready export.

## Next.js

The generated employee-experience project came from the Step 24 handoff ZIP's
`project.tess.json`, not a hand-authored fixture. It was written to a clean
temporary directory outside the repository, installed with npm without using
repository `node_modules`, built in production mode, and served with `next start`.
The generated package installed 47 packages, built on Next.js 15.5.28, and
`npm audit --audit-level=moderate` reported zero advisories. The package has no
`@tessellate/*` runtime dependency.

Playwright exercised the homepage at 1440×900 and 390×844, selected Settings &
Policies through the visible navigation, and checked the generated employee
copy, horizontal overflow, console, page errors, failed requests and HTTP
failures. Both viewports returned HTTP 200, had no overflow or runtime/network
errors, and used 44px navigation targets. Axe reported zero violations.

Evidence: [desktop homepage](evidence/step-25/nextjs/desktop-1440x900.png),
[mobile homepage](evidence/step-25/nextjs/mobile-390x844.png),
[settings screen](evidence/step-25/nextjs/desktop-settings-1440x900.png),
[browser report](evidence/step-25/nextjs/runtime-report.json),
[install/build/audit report](evidence/step-25/nextjs/install-build-report.json).

The audit exposed and fixed four generator defects:

1. Next 15 resolved a vulnerable PostCSS 8.4.31 through its nested dependency.
   The generated package now applies a scoped Next/PostCSS override to patched
   PostCSS 8.5.23 or later; the independent final install resolved 8.5.31 and
   returned zero advisories.
2. Navigation labels were emitted as quoted JSX text, so the UI showed literal
   quote marks. They now render as JSON-encoded JSX expressions. A generator
   regression test failed before the fix and passes afterward.
3. Navigation links measured 16px high at both desktop and mobile sizes. The
   exported shell and embedded product navigation now provide 44px targets. The
   browser smoke failed before the fix and passes at both viewports afterward.
4. The Next.js package included Vite-only dependencies and an npm-unknown
   `.npmrc` setting. The target now excludes Vite dependencies and the unused
   setting; the clean npm install dropped from 100 to 47 packages.

The metadata title now uses a JSON-safe string literal. Next.js remains Beta
because this is one project/brief, the output has not been benchmarked against
the full manifest set, and parity with Workbench has not been established.

## W3C Design Tokens

The generated DTCG JSON now contains a `config.json` for Style Dictionary and
expresses each font-family list as the DTCG-required array of individual font
names. Style Dictionary 4.4.0 consumed the generated files and produced
`build/css/tokens.css`; the resulting font-family custom property is valid CSS
with the family names and fallbacks preserved. The focused test first failed on
the previous comma-separated string value, then passed with the DTCG arrays.

Evidence: [generated token package](evidence/step-25/w3c-style-dictionary/),
[Style Dictionary output](evidence/step-25/w3c-style-dictionary/build/css/tokens.css).
The DTCG font-family shape follows the [DTCG 2025.10 format](https://www.designtokens.org/tr/2025.10/format/)
and Style Dictionary's [CSS font-family transform](https://styledictionary.com/reference/hooks/transforms/predefined/).

Token export remains Beta: this validates one downstream consumer only; Figma,
Penpot, and import/round-trip behavior remain unverified. The generated README
no longer implies those importers are certified.

## Expo / React Native and SwiftUI

Both generators now emit visibly labelled Lab scaffolds. They preserve project
name, screen names, root-node IDs/roles, and normalized Design DNA only. They do
not claim to translate Tessellate resources, nested hierarchy, props, slots,
content, navigation semantics, responsive strategies, or interactions. Invented
metrics and no-op action buttons were removed. The SwiftUI README states that
its output is a library with no executable app or simulator launch target.

Generator tests verify the Lab labels and reject the old synthetic values and
actions. No Expo device/runtime or Swift compiler test is claimed here; native
fidelity remains Lab-only pending the dedicated exporter hardening work.

## Verification

- `pnpm exec vitest run packages/exporter/src/__tests__/exporter.test.ts` — 14 passed.
- Next.js clean install, production build and `npm audit` — passed; zero advisories.
- Next.js Playwright desktop/mobile browser smoke — passed; zero uncaught errors,
  failed requests, HTTP failures, overflow or serious/critical Axe violations.
- Style Dictionary 4.4.0 downstream CSS build — passed.
- `pnpm exec vitest run packages/exporter/src/__tests__/exporter.test.ts` — 14 passed.
- Full `pnpm test` — 63 files and 928 tests passed.
- `pnpm typecheck` — all 22 workspace projects passed.
- `pnpm lint` — passed with 0 errors and 48 existing warnings (configured limit: 51).
- `pnpm build` — passed; catalogue validated 324 resources and Astro built 717 pages. Existing Vite chunk-size warnings remain.
- `pnpm audit:all` — all 16 release-gate checks passed, then build, bundle budget, licence/provenance and secret/security audits passed.
- `git diff --check` and audit/report JSON parsing — recorded after implementation below.
