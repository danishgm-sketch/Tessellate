# Isolated preview cold-load check

## Scenario

Chrome DevTools against the production Vite preview at `390×844`, device scale
factor 2, Fast 3G, 4× CPU slowdown, and reduced motion. The local page has no
CrUX field data. Each exact-route comparison below is a single cold navigation,
so the LCP readings are observations rather than a reliable before/after trend.

## Before the change

- `?resource=button` rendered the real Button after loading its manifest chunk.
- LCP was 2,690 ms; CLS was 0.00.
- The critical request path reached 3,200 ms because the manifest request followed
  the main script. The request list contained the document, main script, CSS,
  and manifest.
- Main script: 555.83 kB raw, 146.67 kB gzip. Vite reported an ineffective
  dynamic Button import because the renderer also imported that module eagerly.

## After the change

- The same `?resource=button` URL renders from the base renderer and its local
  manifest. The request list contains the document, main script, and CSS; no
  Button module or manifest request follows the main script.
- LCP was 2,727 ms; CLS was 0.00. Three additional cold reloads through the
  canonical resource ID recorded LCP values of 2,594, 2,753, and 2,870 ms. These
  samples do not establish an LCP improvement.
- The measured critical request path was 2,260 ms in the same-route trace.
- Main script: 552.74 kB raw, 146.70 kB gzip. The ineffective dynamic import
  warning is gone; the separate 500 kB raw chunk-size warning remains.
- The mobile Lighthouse snapshot scores 100 for Accessibility and Best
  Practices. The page has one `main` landmark, no horizontal overflow, and no
  console errors or warnings. The Button activates by keyboard and announces
  “Example action activated.”

## Verification

- Standalone preview Playwright suite: 4 passed, including Button slug and ID,
  keyboard activation, reduced-motion updates, actual resource utility styles,
  and the visible unknown-resource error.
- Renderer and preview typechecks, focused action-prop unit test, repository
  lint, and production preview build pass.
- The full workspace build and route gzip-budget audit passed earlier in this
  pass, before the final landmark-only markup follow-up.
