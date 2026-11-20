# Local Verso Preview Adapter

This adapter lets a developer inspect private Verso source inside Tessellate's existing Explore and resource detail surfaces. It reuses Tessellate's `ResourceManifest` contract and the existing dedicated preview application on a separate local origin. The preview iframe grants `allow-same-origin` only when its configured origin has been validated as different from the application origin; the preview app has no account state or credentials. It does not add Verso to the public catalogue, Gold runtime, Workbench registry, browser export, registry endpoint, or a production Site build.

Verso declares `UNLICENSED` and `private`. Its source README identifies studied libraries as idea references and states that the code and copy are original. The adapter still marks every projected manifest experimental and uncertified, with `redistributionVerified: false` and `attributionRequired: "unknown"` until the owner's authorization and each item's provenance are reflected in canonical resource metadata. Resource cards and detail pages disable installation and redistribution actions. Compose and Workbench continue to use the existing Gold runtime boundary.

**Current authorization:** On 2026-11-07 the owner authorized Tessellate to use, modify, and redistribute their privately authored Verso collection as part of the public product; see D-067 in `docs/DECISIONS.md`. The package metadata remains unchanged, and this local adapter still does not publish source or qualify any entry for product use. The public feature freeze and per-resource provenance, accessibility, responsive, reduced-motion, performance, and export review remain in force. The authorization does not extend to any independently identified third-party code or assets.

## Prepare a private projection

Run the static-only inventory and manifest projection tools from the Tessellate repository. Store both outputs outside the repository and outside the Verso source tree:

```powershell
pnpm exec tsx scripts/verso-inventory.ts `
  --source "C:\path\to\private\verso" `
  --catalog "apps\site\public\data\catalog.json" `
  --output "C:\private-data\verso\inventory.json"

pnpm exec tsx scripts/adapt-verso-manifests.ts `
  --inventory "C:\private-data\verso\inventory.json" `
  --output "C:\private-data\verso\manifest-projection.json"
```

The inventory reads TypeScript metadata with the compiler parser. It never imports or executes component modules. The projection validates every entry with the canonical Zod schema and retains source paths, hashes, exports, statically declared prop names, declared lineage, and unresolved review blockers. Prop signatures are preview metadata only; they are not added to the public resource manifest or canonical catalogue.

## Start the local preview

Use two PowerShell sessions. In the preview session, set the private source and projection paths, then start the dedicated preview app. Private mode pins its bind to `127.0.0.1` and rejects wildcard or LAN bindings; command-line host overrides cannot expose the external source tree to the network.

```powershell
$env:TESSELLATE_PRIVATE_VERSO = '1'
$env:TESSELLATE_PRIVATE_VERSO_PROJECTION = 'C:\private-data\verso\manifest-projection.json'
$env:VITE_TESSELLATE_PARENT_ORIGINS = 'http://127.0.0.1:4321'
pnpm --filter @tessellate/preview dev -- --host 127.0.0.1 --port 5173
```

In the application session, use the same source/projection and point private resource previews to the separate app origin:

```powershell
$env:TESSELLATE_PRIVATE_VERSO = '1'
$env:TESSELLATE_PRIVATE_VERSO_PROJECTION = 'C:\private-data\verso\manifest-projection.json'
$env:PUBLIC_TESSELLATE_PRIVATE_PREVIEW_ORIGIN = 'http://127.0.0.1:5173'
pnpm --filter @tessellate/site dev -- --host 127.0.0.1 --port 4321
```

Open Explore and use private Verso cards, or open `/r/verso-<collection>-<id>` directly. Both dev servers verify the source closure hashes before loading it. The Tessellate application server may serve the private catalogue metadata but does not whitelist the external source directory; only the dedicated preview server exposes that directory, and it is loopback-only. The source runs only in the preview app's separate origin, inside a sandboxed iframe that cannot access the Tessellate application DOM or storage. The app validates the configured preview origin and message source before enabling the frame. The adapter removes Verso's remote Google Fonts import and uses local system font fallbacks. The Verso provider remains scoped to the preview and does not write palette state to local storage or the document root.

The preview passes ordinary React events and only those custom action callbacks that the static prop inventory declares. This avoids sending application-only event names onto a component's root DOM element. The preview-server CSP permits Vite's fixed React-refresh preamble by its exact content hash; it does not permit arbitrary inline scripts. The production preview headers do not use that development-only exception.

To render-audit every entry from the visible isolated preview app, keep the two local dev servers running and write evidence outside both the repository and source tree:

```powershell
$env:TESSELLATE_PRIVATE_VERSO_PROJECTION = 'C:\private-data\verso\manifest-projection.json'
$env:TESSELLATE_SITE_ORIGIN = 'http://127.0.0.1:4321'
$env:TESSELLATE_PRIVATE_PREVIEW_ORIGIN = 'http://127.0.0.1:5173'
pnpm exec node scripts/audit-private-verso-browser.mjs `
  --output 'C:\private-data\verso\audit\runtime.json'
```

The audit checks the Site overlay count, source-origin isolation (the Site origin must not serve a private source module while the preview origin must), a representative detail route at 1440×900 and 390×844, iframe sandboxing, Axe, and every projected source module in the preview app. It stores representative screenshots and runtime details beside the requested output file. `--limit 20` is available for a quick smoke run. A successful render pass is not a licence grant, accessibility certification, quality certification, Workbench registration, or permission to redistribute.

Unset both variables to return to the canonical 324-resource catalogue. The Astro configuration and Vite plugin reject private-source mode for builds. Do not publish a projection, its source, or a build produced from private source. Rights review and per-resource certification are still required before any item can enter the public registry or Gold runtime.
