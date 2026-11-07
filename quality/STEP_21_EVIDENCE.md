# Step 21 — History and checkpoints

Step 21 verifies undo/redo history through the visible Workbench at 1440 × 900
and 390 × 844. The same user journey makes 51 sequential Visual Ambition edits,
reloads the saved project, undoes and redoes every retained step, then reloads
again and restores a named checkpoint.

The before captures exposed AUD-157. The ProjectManifest survived reload at
Visual Ambition 51, but Workbench had reset its in-memory history and future
stacks, leaving Undo disabled. Both viewport reports show zero console errors or
warnings, uncaught exceptions, failed requests and HTTP errors; the defect was
lost state rather than a failed page or network request.

Workbench now stores recent snapshots and the undo/redo pointers in a versioned
IndexedDB object store. Snapshots are schema-validated and immutable; only new
manifest snapshots and the small pointer are written, and rapid edits coalesce
so the newest history is durable before the toolbar reports Saved. Loading a
project restores its available history before enabling editing. Checkpoint
restoration also respects the same 50-step history limit as other mutations.
The toolbar's Local indicator now exposes the history save state to sighted and
screen-reader users.

The browser regression is deliberately driven through the UI: it uses the
keyboard-accessible range, reloads the real project URL, clicks Undo/Redo,
creates a named checkpoint through Snapshots, changes the project, reloads, and
restores that checkpoint. It exports manifests at each boundary and compares
them exactly. The final desktop and mobile reports show 50-step undo returning
the exact retained manifest, 50-step redo returning the exact final manifest,
and checkpoint restoration returning the exact checkpoint manifest. They also
record zero browser and network errors.

During implementation, browser regressions caught three additional failures:
queued full-stack writes could lag behind fast edits, checkpoint restore could
exceed the 50-step storage bound, and Blend could overwrite its source project's
history snapshot. History persistence now coalesces to the latest stack,
checkpoint restore trims its prior-state stack, and snapshot IDs are scoped to
their owning project. The Blend regression failed before the ID fix and passes
after it. Its before/after screenshots and runtime reports are linked here:

- [Source project entered recovery mode after Blend — before](evidence/step-21/before/blend-source-history-overwritten-desktop-1440.png)
- [Source project history preserved after Blend — after](evidence/step-21/after/blend-source-history-preserved-desktop-1440.png)

The targeted store and persistence tests pass (17 tests). Final local gates pass:
917 Vitest tests across 63 files, workspace typecheck, lint with 0 errors and the
existing 51-warning allowance, all 16 behavioral release gates, production build
with 717 Astro pages, bundle budgets, licence/provenance, and security/secret
audits. The full browser suite has no failures: main desktop/mobile 189 passed
and 67 skipped; Sites Worker 45 passed and 27 skipped, including all 324
resources and Gold variant/state checks; standalone preview 3 passed. The
public review deployment has not yet been updated, so AUD-157 and AUD-158 remain
locally verified and await issue-specific deployed confirmation at Step 45.

Before screenshots:

- [Undo disabled after reload — desktop](evidence/step-21/before/undo-after-reload-desktop-1440.png)
- [Undo disabled after reload — mobile](evidence/step-21/before/undo-after-reload-mobile-390.png)

After screenshots:

- [History and checkpoint workflow — desktop](evidence/step-21/after/history-persistence-desktop-1440.png)
- [History and checkpoint workflow — mobile](evidence/step-21/after/history-persistence-mobile-390.png)
- [Source project history preserved after Blend — desktop](evidence/step-21/after/blend-source-history-preserved-desktop-1440.png)

Machine-readable runtime reports and downloaded manifests are under
`quality/evidence/step-21/{before,after}/`. The finding and status are recorded
as AUD-157 in `audit/runtime-audit.json` and `audit/RUNTIME_AUDIT.md`.
