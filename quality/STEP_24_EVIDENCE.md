# Step 24 — Agent handoff package

Step 24 adds a Beta “Download Agent Handoff Package” action to the visible
Workbench Export menu. It produces the seven contract files:
`AGENT_PROMPT.md`, `COMPONENTS.md`, `DESIGN.md`, `IMPLEMENTATION.md`,
`PRODUCT.md`, `dependencies.json`, and `project.tess.json`. The embedded manifest
is schema-validated and exactly matches the manifest selected in Workbench.
Documentation is derived from the selected project, including screens, design
tokens, node/resource references, props, variants, lock state, target devices,
accessibility floor, and project constraints. The ZIP contains documentation
and the manifest only; it does not include registry resource source or assets.

The Vite export’s hash-based screen navigation is described accurately beside
the manifest’s declared route slugs. It binds a screen navigation resource to
the manifest's primary and secondary items and uses a shell fallback only when
the active screen has no navigation resource. Hidden screens omitted from the
declared menu are not added to that menu. The handoff also explains that
ScreenGraph edges describe planner-level flows while component CTA destinations
are recorded separately in `COMPONENTS.md`.

Baseline runtime dependencies are listed, and `dependencies.json` reports
`review-required` when those packages conflict with the project allowlist. The
package does not claim that resource references include their source code or
that dependency policy has been resolved.

The fresh visible workflow used the exact employee-experience brief, selected
Direction C, opened Workbench, and used keyboard navigation to download both
the Tessellate manifest and the handoff ZIP. Its manifest ID, complete JSON,
audience, objective, screens, Design DNA, navigation, and resource tree match
the selected project. Separate desktop and mobile browser sessions record no
console errors or warnings, uncaught exceptions, failed requests, or HTTP
errors. A further mobile capture resizes the desktop session after Direction C
is selected, preserving the same project ID and manifest hash; see [the
same-project mobile screenshot](evidence/step-24/after/employee-workbench-same-project-mobile-390.png)
and desktop runtime report. The independent evaluator initially scored the
package Product 2/2, Design 2/2, Screens/navigation 1/2, Components/resources
2/2, Constraints 2/2, and Implementation starting point 1/2. It verified all
14 referenced catalogue resources and identified a duplicate navigation bar in
the standalone Vite export; AUD-175 records the failure and its root-cause fix.
The handoff documentation now describes the manifest-driven navigation
behavior. The final package also gives a concrete first vertical slice,
dependency resolution steps, resource-source checks, focused implementation
test criteria, and exact validation commands. A fresh independent review scored
the final archive 12/12 across product, design, screens/navigation,
components/resources, constraints, and implementation starting point. The
review confirmed all 32 resource instances, the exact desktop manifest match,
and same-manifest mobile evidence. The 390px capture is a resized desktop
browser session; the separate mobile browser run composes its own project, so
it has a different generated project ID.

## Content regressions found during the handoff review

Comparing the handoff with the actual Direction C project exposed additional
user-visible composition defects, so the package review was expanded to inspect
the generated product rather than only its documentation:

- The manifest said `People & Co` while navigation props said `People & Teams`.
- “Meet your team” opened Onboarding; “Explore onboarding” returned to Marketing
  Home.
- Teams showed colleague records and people-oriented columns.
- Engagement reused generic overview rows and metrics.
- Settings rendered a second copy of navigation and a generic save CTA.
- Teams presented enabled pagination with no paging behavior.
- Settings had no policy acknowledgement context and did not identify the
  missing persistence boundary.

The before manifest extracts and screenshots are under
[`evidence/step-24/before/employee-content/`](evidence/step-24/before/employee-content/).
After screenshots show Teams at [desktop](evidence/step-24/after/employee-product-teams-desktop-chrome.png)
and [mobile](evidence/step-24/after/employee-product-teams-mobile-chrome.png),
Engagement at [desktop](evidence/step-24/after/employee-product-engagement-desktop-chrome.png)
and [mobile](evidence/step-24/after/employee-product-engagement-mobile-chrome.png),
and Settings at [desktop](evidence/step-24/after/employee-product-settings-policies-desktop-chrome.png)
and [mobile](evidence/step-24/after/employee-product-settings-policies-mobile-chrome.png).
The Settings acknowledgement is deliberately labeled preview-only and not
stored; the disabled button remains named “Save preferences” and its visible
helper explains “Connect persistence to save.” The sample is not represented
as a connected HR policy workflow.

Eight findings, AUD-167–174, are recorded separately in
[`audit/runtime-audit.json`](../audit/runtime-audit.json) and
[`audit/RUNTIME_AUDIT.md`](../audit/RUNTIME_AUDIT.md). Each has a local red-to-
green regression or an explicit UI assertion. The first content regressions
were captured from the manifest saved by the visible UI; the navigation,
pagination and save-control defects additionally have before screenshots.

The evaluator's export review found AUD-175: a generated screen selector
duplicated embedded navigation and listed screens absent from the declared
NavigationModel. The before/after desktop and mobile evidence is under
[`evidence/step-24/before/`](evidence/step-24/before/) and
[`evidence/step-24/after/`](evidence/step-24/after/). The clean standalone test
now installs dependencies outside the repository, builds and opens the Vite
export in Chromium, verifies manifest links and hidden-screen omission, switches
between a screen with embedded navigation and one using the shell fallback, and
records zero overflow or browser/network errors.

The AUD-175 standalone exporter regression uses a separate Omni Telemetry test
fixture to exercise navigation resources and shell fallback; it is not the
employee-experience project. The same-project mobile screenshot above is
captured by resizing the actual Direction C Workbench session, and the handoff
archive is generated from that session's exact manifest.

## Verification

- `pnpm install --frozen-lockfile` — passed for all 23 workspace projects.
- `pnpm build:catalog` — passed; 324 resources and 40 Gold runtime resources.
- `pnpm typecheck` — all 22 workspace packages passed.
- `pnpm lint` — zero errors; 51 configured warnings remain.
- `pnpm test` — 928 tests passed across 63 files.
- `pnpm audit:all` — all 16 release gates passed, including catalogue provenance, security, secret, isolation and bundle-budget checks.
- `pnpm build` — passed; Astro produced 717 pages. Existing Vite large-chunk warnings remain while configured budgets pass.
- `pnpm test:e2e` — passed: 203 main-app, 45 Sites Worker and 3 isolated preview-app tests; configured skips are reported by their projects.
- `pnpm exec playwright test tests/e2e/compose-workbench-handoff.spec.ts` — desktop and mobile passed. It exercises both marketing links in Workbench Preview, the Teams, Engagement and Settings screens, the disabled pagination/save controls, manifest export, and all seven handoff ZIP files.
- Clean standalone React/Vite export regression — passed isolated dependency installation, build and Chromium runtime navigation checks, including declared destinations, hidden-screen omission, embedded-navigation/fallback switching, 390px overflow, and zero browser/network errors.
- Runtime reports: [`desktop`](evidence/step-24/after/agent-handoff-desktop-chrome.json) and [`mobile`](evidence/step-24/after/agent-handoff-mobile-chrome.json).

The employee experience policy acknowledgement is a clearly labeled local
preview because the exported design has no policy store or save handler. The
handoff package is Beta because it documents references rather than bundling
resource source, and its dependency allowlist review can remain unresolved.
Published review-site verification remains open for Step 45; none of these local
results close the issues on the deployed Site.
