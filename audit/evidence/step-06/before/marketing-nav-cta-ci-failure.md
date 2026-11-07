# Marketing CTA compact-width failure — CI baseline

- Run: [CI run 39024038848](https://github.com/danishgm-sketch/Tessellate/actions/runs/39024038848)
- Workflow step: Playwright E2E & Axe accessibility tests
- Route: `/resources/marketing-nav-cta/`
- Outer viewport: 360px wide
- Isolated preview viewport: 292px wide

The catalogue matrix recorded a preview document scroll width of 316px and 321px
against the 292px frame. The Gold variant matrix recorded widths of 316px, 316px
and 321px. The CI job failed on both responsive certification tests.

GitHub retained the failed test output and DOM geometry in its log, but the
workflow did not upload browser screenshots or traces. This baseline is therefore
preserved as log evidence; no screenshot has been reconstructed.
