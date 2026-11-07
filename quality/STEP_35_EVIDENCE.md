# Step 35 — Accessibility

Status: **local browser gate complete; deployed release and assistive-technology review remain open**.

## Scope and method

Ran `tests/e2e/accessibility-hardening-step-35.spec.ts` against the built Sites Worker runtime in Chromium. Desktop was 1440×900 and mobile was 390×844. Axe scanned the home page, Explore, Compose, Workbench, the Button resource detail and isolated preview, and the playful HR showcase. Workbench was also scanned after opening each of its five desktop modes and each of its five mobile tabs. The scans used WCAG 2.0/2.1/2.2 A/AA tags and the target-size rule. All 24 route/mode scans reported zero violations. Eight focused heading-order checks also passed after the fix.

Keyboard checks exercised public and Workbench skip links, desktop search, mobile navigation and Explore filter dialogs, Escape handling, focus return and containment, plus the desktop layer reorder action using keyboard focus and Space. The test records Playwright accessibility-tree snapshots for the route scans. Reduced-motion emulation verified animation suppression. A 720 CSS-pixel layout was checked as the reflow equivalent of a 1440 CSS-pixel desktop at 200% zoom. Every audited route returned HTTP 200; route runtime evidence recorded zero console errors, uncaught exceptions, failed requests or HTTP errors.

The 720 CSS-pixel check tests the reflow behavior expected at 200% zoom; it does not change native browser zoom. Accessibility-tree snapshots are a semantic smoke check, not spoken output from NVDA or VoiceOver. Those native zoom and assistive-technology checks remain required at the public release and user-testing gates. Mobile layer reordering was not separately exercised by the desktop keyboard reorder regression; the mobile Workbench interaction and action reachability remain covered by Step 17.

### Follow-up — complete Gold variant matrix

The full Sites Worker suite subsequently ran Axe across all 120 variants in the 40-resource Gold registry and found a serious contrast violation in `split-product-hero/nocturne`. The badge inherited muted ink (`#62666f`) on the component's dark canvas (`#0b0d10`), measuring 3.38:1 against the 4.5:1 text requirement. A focused regression was confirmed failing before the fix. The Nocturne badge now uses neutral-400 text; the focused regression and the complete 120-variant matrix pass with zero Axe violations. Before/after screenshots and the finding record are in `quality/evidence/step-35/followup/`.

## Findings and fixes

### Medium — showcase preview headings skipped document levels

**Evidence:** Before captures under `quality/evidence/step-35/before/heading-order-*.json` recorded Axe heading-order violations on the AI developer platform, luxury ecommerce, luxury hospitality and scientific research showcase pages at desktop and mobile sizes. The surrounding page hierarchy started at `h1`, while screen selectors used a later heading level for the preview title.

**Reproduction:** Open one of those showcase routes and run an Axe WCAG scan; the preview title jumps over a heading level.

**Root cause:** `ShowcasePreview` chose the preview title's heading level independently of the document's existing `h1` hierarchy.

**Affected code:** `apps/site/src/components/ShowcasePreview.tsx`.

**Remediation:** Render the selected preview label as an `h2` before its manifest content. The same four routes now pass with zero Axe findings on both audited viewports.

### Medium — public skip links were missing or pointed at absent targets

**Evidence:** The first keyboard pass found no skip link on the homepage and no working content target on Explore. The route-wide regression then verified the shared skip link and focusable main target on `/`, `/explore/`, `/compose/`, `/r/button/`, `/tools/accessibility/`, `/docs/cli/`, `/showcase/showcase-playful-hr/`, and `/about/`. Before screenshots and final target evidence are under `quality/evidence/step-35/`.

**Reproduction:** Use Tab as the first keyboard action on a public page, activate “Skip to content,” and inspect the focused element. Previously the homepage offered no skip action and several shell pages had no matching `#main-content` target.

**Root cause:** The homepage and Explore use separate shell implementations, and many Astro pages rendered a main landmark without a shared ID or `tabindex` target. A skip link implemented only inside one layout could not cover those shells consistently.

**Affected code:** `apps/site/src/components/home/SiteHeader.tsx`, `packages/ui/src/components/header.tsx`, `apps/site/src/pages/index.astro`, `apps/site/src/layouts/PublicLayout.astro`, and the page-level main landmarks under `apps/site/src/pages/`.

**Remediation:** Add the skip link as the first focusable item in each shared header, use `#main-content` consistently, and make every audited public main target programmatically focusable. Desktop and mobile browser checks now confirm the link is the first Tab stop and moves focus to its target.

### Medium — Workbench lacked a named main landmark, page heading and skip target

**Evidence:** The first route scan exposed the missing main landmark and heading in Workbench. The final route audit confirms a named, focusable Workbench main landmark and an `h1` on desktop and mobile; all Workbench mode/tab Axe scans pass.

**Reproduction:** Open `/workbench/` and inspect the accessibility tree or navigate with a screen reader. The editor previously had no page-level main landmark, title or shortcut past the toolbar.

**Root cause:** Workbench is a client-only application rendered outside the public Astro layout, so it did not inherit the public shell's landmark and skip-link structure.

**Affected code:** `packages/workbench/src/components/WorkbenchShell.tsx` and `packages/workbench/src/components/mobile/MobileWorkbench.tsx`.

**Remediation:** Add a “Skip to editor” link, named focusable main landmark and project-named `h1` to both Workbench shells.

## Evidence

- Machine-readable result: `quality/evidence/step-35/verification.json`.
- Desktop and mobile route Axe/runtime/accessibility-tree records: `quality/evidence/step-35/sites-chromium/core-route-a11y.json` and `quality/evidence/step-35/sites-mobile-chromium/core-route-a11y.json`.
- Workbench mode/tab results: `quality/evidence/step-35/sites-chromium/workbench-mode-a11y.json` and `quality/evidence/step-35/sites-mobile-chromium/workbench-mode-a11y.json`.
- Skip target and layer reorder results: `quality/evidence/step-35/sites-chromium/skip-targets.json`, `quality/evidence/step-35/sites-mobile-chromium/skip-targets.json`, and `quality/evidence/step-35/sites-chromium/keyboard-layer-reorder.json`.
- Before/after captures are saved alongside these records. The four pre-fix heading reports are in `quality/evidence/step-35/before/`.

The verified command passed 13 tests with one intentional mobile-only skip. The skip is the desktop layer-panel reorder test; the five mobile Workbench tabs and mobile-specific keyboard navigation checks passed. The full browser evidence is local to the Sites Worker build; the published review Site still requires the public release gate.

### 2026-10-21 local verification follow-up — AUD-100

The AI Chat Panel standalone resource preview previously began with an `h4`, producing a moderate desktop heading-order finding. A red browser run reproduced it. The resource heading is now `h2`, and regenerated shared Gold/export source carries the same correction. `pnpm exec playwright test --config tests/e2e/sites-preview.playwright.config.ts tests/e2e/catalog-resource-render.spec.ts --grep "AI Chat Panel standalone"` passed 2/2 Sites Worker desktop/mobile cases. The visible first heading is correct and runtime/network error arrays are empty. Screenshots and reports are `quality/evidence/step-35/after/ai-chat-panel-heading-sites-{chromium,mobile-chromium}.{png,json}`. AUD-100 remains pending published review verification.
