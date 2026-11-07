# Step 42 — Fault-injection evidence

Faults were injected against the locally built ChatGPT Sites Worker in Chromium at 1440×900 and 390×844. No public Site was changed. The machine-readable matrix is `quality/evidence/step-42/fault-injection-matrix.json`; each new browser case has a JSON runtime record and screenshot beside it.

## Results

- **Catalogue:** a schema-invalid catalogue returned with HTTP 200. Compose reported the catalogue unavailable, kept Compose disabled, recovered through its visible retry control, and then rendered three directions at desktop and mobile sizes.
- **API:** the Sites `/api/**` requests were aborted. The host Lab became unavailable, while the deterministic reduce-motion command still changed the visible project DNA and preserved project identity. Chromium logged the expected failed health request; there was no uncaught page error.
- **Storage:** all seven existing desktop browser fault/recovery tests passed, including unavailable localStorage, unavailable IndexedDB, malformed saved data, and browser-process restart.
- **Authentication:** all six API auth-hardening tests passed; missing auth bindings return 503 for account routes without breaking guest behavior.
- **Malformed data and export:** a schema-valid imported manifest with an unknown resource was preserved for inspection, but ZIP export stopped with an explicit unresolved-resource error instead of substituting a component. Injected ZIP download creation failure was shown to the user with its error detail and no uncaught exception.
- **CLI and model:** all 19 CLI black-box tests passed, including offline catalogue failure; the offline laptop-model Lab E2E passed with no mutation proposal.
- **Restart recovery:** the Step 37 post-reboot record confirms all expected Docker containers recovered without manual starts and Tessellate API health returned HTTP 200.

## AUD-314 — Missing-project recovery offered an unrelated export

- **Severity:** Medium.
- **Evidence:** before the fix, the red Sites Worker regression found one “Export the current manifest” link at a stale `/workbench/?project=<missing-id>` route. See `quality/evidence/step-42/before/stale-project-export-red-test.md`. After-fix screenshots and runtime records are `quality/evidence/step-42/stale-project-safe-recovery-sites-chromium.png` and `...-mobile-chromium.png`.
- **Root cause:** the generic storage-error page serialized the Workbench store’s initial sample manifest even though the requested project had not loaded.
- **Affected code:** `packages/workbench/src/components/WorkbenchShell.tsx` and `tests/e2e/fault-injection-step-42.spec.ts`.
- **Remediation:** the recovery page now says that no project was opened and saved records remain unchanged; it offers Compose or starting a new local sample, and does not offer an unrelated manifest download. Corrupt records continue to use their separate raw-record recovery view.
- **Verification:** red-to-green Sites Worker E2E at desktop and mobile; zero Axe violations, console errors, page errors, failed requests, HTTP errors, or horizontal overflow in the stale-project state.
- **Disposition:** Fixed and locally verified. Public review verification remains pending for Step 45.

## Test summary

- New Step 42 Sites Worker E2E: **9 passed, 1 intentionally skipped** (the desktop-only command bar test in mobile inspection mode).
- Browser persistence recovery: **7 passed**.
- API authentication: **6 passed**.
- CLI black-box: **19 passed**.
- Standalone export fidelity: **13 passed**, including the clean install/build/browser smoke.
- Offline laptop-model Lab: **1 passed**.
- Workspace typecheck and lint passed; production build generated 733 Astro pages and the Sites Worker artifact.
- Full aggregate `pnpm test:e2e` passed the Astro, Sites Worker desktop/mobile, and preview-app profiles with zero failures. Configured platform and desktop-only skips remain as listed in the Playwright output. The API outage case is restricted to the Sites Worker profile because Astro does not proxy `/api/**`.
- Final integrity checks passed: `git diff --check` and JSON parsing for the runtime audit, Step 42 matrix, and Step 37 reboot-recovery record (which contains a UTF-8 BOM).

The injected browser ZIP failure intentionally emits one caught `console.error` and a native alert. The injected API outage intentionally emits one failed health request and Chromium’s `net::ERR_FAILED` console message. These are recorded diagnostics of the test fault; neither produces an uncaught exception. No Critical or High finding was discovered in these fault cases. No Site version was saved or published, and public verification remains a release-stage task.
