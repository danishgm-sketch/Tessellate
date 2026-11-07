# AUD-314 before-fix regression evidence

The Sites Worker was opened at `/workbench/?project=<unique-missing-id>` at 1440×900. The page correctly announced that the requested project was not found, but its recovery actions still included **Export the current manifest**.

The E2E regression was run red before changing `WorkbenchShell.tsx`:

```text
Expected the stale-project recovery route to offer zero "Export the current manifest" links.
Received: 1 link, on the read-only missing-project page.
```

The Workbench store is initialized with a sample manifest before the requested local project is loaded. The displayed link serialized that unrelated in-memory sample, so following the recovery action could download a project different from the one named in the URL. The red run’s persisted evidence is the failing locator count and the DOM state described above; after-fix desktop/mobile screenshots and runtime records are `quality/evidence/step-42/stale-project-safe-recovery-sites-*.{png,json}`.
