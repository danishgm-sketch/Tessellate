# Step 22 — Local persistence and recovery

Step 22 tested browser persistence at 1440 × 900 and 390 × 844 through the
visible Workbench. It covered denied journal reads, a full localStorage journal,
IndexedDB being unavailable, both persistent stores failing, an old project
schema, malformed saved data, and a full Chromium process restart against the
same temporary browser profile. It also re-opened a project in a fresh context
and compared exported manifests and undo state.

The first browser regressions reproduced six defects. A blocked synchronous
localStorage read aborted project recovery even when IndexedDB held a valid
project; quota errors were treated as fatal before the database save could
finish; IndexedDB errors during project, history, and checkpoint startup blocked
journal-backed editing; successful in-memory migration did not update the
stored record; identical malformed data mirrored across two journal keys
appeared twice in safe recovery; and, when both stores failed, Workbench claimed
the project had been journaled even though quota prevented that write. The
regression is configured to persist a before capture whenever it observes that
false claim, but no such before capture was produced in this run. Its
desktop/mobile after reports and failing assertion are retained.

The loader now isolates journal reads, probes write availability, falls back to
the durable store, and persists successfully migrated manifests in the current
schema. Project, history, and checkpoint storage failures are reported in the
Workbench without silently presenting unsaved state as durable. If only the
recovery journal works, editing continues while history is labelled limited.
If neither durable store works, editing and manifest export remain available for
the current session, and the warning says to export before closing. Corrupt raw
records remain unchanged, are listed once, and can be exported exactly.

| Finding | Severity | Result |
| --- | --- | --- |
| AUD-159 — localStorage read failure prevented IndexedDB recovery | High | Fixed; exact manifest and undo state restored |
| AUD-160 — journal quota prevented a successful IndexedDB save | High | Fixed; edits and reload use IndexedDB |
| AUD-161 — IndexedDB failure blocked journal-backed editing | High | Fixed; manifest survives reload and history limitation is explicit |
| AUD-162 — migrated legacy data remained stored in the old schema | Medium | Fixed; current schema persisted and reloaded exactly |
| AUD-163 — mirrored corrupt data appeared twice | Low | Fixed; one raw record export preserves the original bytes |
| AUD-164 — total storage failure falsely claimed a durable save | High | Fixed; unsaved warning is truthful and export remains available |

The 14-case persistence browser suite passed across desktop and mobile. Every
after report records zero console errors or warnings, uncaught exceptions,
failed requests, or HTTP errors. The process-restart test closes Chromium and
relaunches it against the same profile directory; the reopened browser restores
the exact manifest and undo history. The corrupt-data test verifies the source
record is unchanged and the downloaded raw payload is byte-for-byte equal.

Related project isolation remains covered by the Step 21 Blend regression,
which verifies that a second project cannot overwrite its source project's
history. Cross-tab concurrent writes have not yet been tested; that dimension
remains FAIL in `quality/FEATURE_MATRIX.md`. Back/forward navigation, tablet
layout, high contrast, slow/offline network behavior, refresh during a pending
write, and import/export round-trip also remain unverified for this feature.
These are tracked as FAIL or DEGRADED rather than being inferred from the
passing persistence journey.

The full repository suite passed after the fixes: 917 Vitest tests, workspace
typecheck, lint with zero errors and the existing 51-warning allowance, 16/16
behavioral release gates, 717 Astro pages, bundle budgets, all 324 catalogue
licence/provenance checks, and zero secret/security violations. Playwright
passed 201 main desktop/mobile checks (67 skipped by configuration), 45 Sites
Worker checks (27 skipped by configuration, including all 324 resource
renderings), and all 3 standalone preview checks. The focused Workbench browser
set passed 40 checks with 8 configured skips.

Public review-site verification remains pending for Step 45. Findings are
locally verified and remain open for deployed confirmation until that gate.

Before captures:

- [Blocked localStorage recovery — desktop](evidence/step-22/before/localstorage-read-blocks-indexeddb-recovery-desktop-1440.png)
- [Blocked localStorage recovery — mobile](evidence/step-22/before/localstorage-read-blocks-indexeddb-recovery-mobile-390.png)
- [Recovery journal quota failure — desktop](evidence/step-22/before/recovery-journal-quota-blocks-workbench-desktop-1440.png)
- [IndexedDB outage — desktop](evidence/step-22/before/indexeddb-unavailable-blocks-workbench-desktop-1440.png)
- [Legacy data not written forward — desktop](evidence/step-22/before/legacy-project-not-upgraded-desktop-1440.png)
- [Duplicate corrupt recovery records — mobile](evidence/step-22/before/duplicate-corrupt-recovery-records-mobile-390.png)

After captures:

- [IndexedDB recovery — desktop](evidence/step-22/after/localstorage-read-blocks-indexeddb-recovery-desktop-1440.png)
- [Journal quota fallback — desktop](evidence/step-22/after/recovery-journal-quota-indexeddb-fallback-desktop-1440.png)
- [IndexedDB outage with limited history — mobile](evidence/step-22/after/indexeddb-unavailable-journal-recovery-mobile-390.png)
- [Legacy manifest upgraded — desktop](evidence/step-22/after/legacy-project-upgraded-desktop-1440.png)
- [Corrupt project safely recovered — mobile](evidence/step-22/after/corrupted-project-safe-recovery-mobile-390.png)
- [Project restored after browser restart — desktop](evidence/step-22/after/browser-restart-restores-project-desktop-1440.png)
- [Total storage failure reported truthfully — mobile](evidence/step-22/after/storage-unavailable-export-warning-mobile-390.png)

All viewport runtime reports are stored in `quality/evidence/step-22/{before,after}/`.
