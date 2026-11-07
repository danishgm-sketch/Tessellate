# Linux compact-resource overflow baseline

- CI run: [39027328212](https://github.com/danishgm-sketch/Tessellate/actions/runs/39027328212)
- Workflow step: Playwright E2E & Axe accessibility tests
- Test: all catalogue resources render at every certified width in the Sites Worker
- Outer viewport: 360px; isolated resource preview: 292px

The Linux Chromium report failed on three resources that the Windows run did
not flag:

| Resource | Measured document width | Preview width |
| --- | ---: | ---: |
| `command-first-nav` | 303px | 292px |
| `feature-tabs` | 296px | 292px |
| `gradient-accent-text` | 304px | 292px |

The workflow retained these DOM measurements and the ancestor geometry in its
log, but it did not upload screenshots or Playwright traces. This file records
that log evidence; it does not reconstruct a baseline image.
