# Public v32 direction review

Date: 2026-10-26

Route: `/compose`

Brief: the exact employee-experience flagship brief

Desktop: 1440×900

Mobile: 390×844

The first compact-card screenshots appeared to show the same horizontal
navigation in all three directions. That was a thumbnail-width reading, not a
desktop layout failure. I opened each direction’s full preview through the
visible UI and inspected the rendered DOM and manifest. The desktop layouts
match their stated navigation models and are materially different:

| Direction | Manifest navigation | Screen root | Rendered navigation | Dashboard structure |
| --- | --- | --- | --- | --- |
| A — Calm Foundation | `sidebar` | `sidebar-shell` | `collapsible-sidebar`, 220px left column | Predictable sidebar with vertically flowing content |
| B — Expressive Horizon | `top-nav` | `top-nav-page-canvas` | `minimal-top-nav`, horizontal full-width bar | Single-column page canvas |
| C — Adaptive Architecture | `rail` | `workspace-dock-shell` | `minimal-top-nav`, vertical orientation in a 180px left rail | Three-pane workspace; people table and activity stream occupy separate columns |

At 390px, the three navigation surfaces wrap and the workspace columns stack;
the mobile render had no document overflow. This responsive convergence is
expected at the narrow viewport. The full mobile preview remains scrollable
inside its dialog.

All three full previews rendered real resources with zero missing-resource or
unresolved-required-role placeholders. The full-preview DOM records zero
uncaught exceptions, failed requests, or HTTP errors. The browser's
`securitypolicyviolation` event reports an enforced `script-src-elem` block for
`blockedURI: inline` on the Compose response; this is the already documented
Sites-injected CSP issue AUD-342. It did not stop Compose or preview rendering.

The captures and machine measurements are under:

- Compact cards: [`directions-desktop/directions.json`](directions-desktop/directions.json) and [`directions-mobile-full/directions.json`](directions-mobile-full/directions.json).
- Full desktop dialogs: [A](directions-desktop-full/direction-01-team-overview-dialog.png), [B](directions-desktop-full/direction-02-team-overview-dialog.png), [C](directions-desktop-full/direction-03-team-overview-dialog.png).
- Full mobile dialogs: [A](directions-mobile-full/direction-01-team-overview-dialog.png), [B](directions-mobile-full/direction-02-team-overview-dialog.png), [C](directions-mobile-full/direction-03-team-overview-dialog.png).
- Repeatable browser capture: [`capture-directions.mjs`](capture-directions.mjs).

No direction-generation defect was confirmed, so no direction finding or code
change was added from this review.
