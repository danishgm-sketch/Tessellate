# Public Tessellate v82 targeted re-audit

Captured 2026-11-06 against the public review Site:

- URL: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/
- Site version: `appgver_b0cf623b90f481919d9112f97a7e4865` (deployment `appgdep_6aee1759ae9081918b3e1530b9fd28fa`)
- Canonical source commit: `99f9bb7370d45926e5abd9e2475c267846d0540c`
- Sites mirror source commit: `20cdb2d29a3dea0f4272525edf038902bb00287f`
- D1/R2: unbound

## AUD-511 deployed verification

The visible Compose workflow ran the exact employee-experience brief at 1440×900 and 390×844. It selected Refined ambition and Radical structural creativity, composed all three directions, inspected Design DNA, and captured loading and settled previews. The test delayed script requests by 700 ms so the lazy loading state remained observable; this delay is a test condition, not a claim about normal network performance.

Direction A showed five accessible `role=status` loading messages at both sizes. Every message said “Loading interface element…” and none exposed a resource slug. Directions B and C had already loaded their resource modules by the time each card was inspected. All three directions settled with five rendered resource nodes each, zero unresolved resources, zero required-role diagnostics, and zero renderer load failures. The visible direction names, Design DNA, navigation, and grammar remained distinct.

Browser console errors/warnings, uncaught exceptions, failed requests, and HTTP errors were all zero in both runs. Each browser loaded 31 script requests. Reports and initial/settled/detail screenshots are in `directions-settled/`.

| Viewport | Result | Initial Direction A status | Resources per direction | Browser/network errors |
| --- | --- | --- | ---: | ---: |
| 1440×900 | PASS | 5 generic loading statuses; no slugs | 5 / 5 / 5 | 0 |
| 390×844 | PASS | 5 generic loading statuses; no slugs | 5 / 5 / 5 | 0 |

The renderer regression also passed against the Sites source checkout. GitHub CI passed twice on the exact canonical commit, including E2E/Axe. AUD-511 is closed as deployed-verified on v82. This targeted check does not repeat the v81 31-route and full flagship sweep or close unrelated findings.

## Sites package

The saved archive was built from the pushed Sites mirror commit. Its packaged tree contained no Verso source or projected paths. It carried the existing static Astro app and Worker artifact, the canonical 324-resource catalogue and 40 Gold runtime resources, and no D1/R2 bindings. The build passed; existing large JavaScript chunk and ineffective dynamic-import warnings remain documented, while the configured eager-route bundle budgets passed.
