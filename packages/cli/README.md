# Tessellate CLI

The `tess` command searches and installs catalogue resources, composes and validates project manifests, exports standalone React/Vite projects, and runs the resource quality gate.

In a checked-out Tessellate repository, build it with:

```sh
pnpm build:catalog
pnpm --filter @tessellate/cli build
```

The build produces a self-contained Node.js executable and bundles the validated catalogue used by `tess search` and `tess view`. Those commands work offline from the packaged catalogue. `tess add` still needs a local registry or network access when the requested resource source is not present in the project.

Configured remote registries must use HTTPS. The CLI rejects registry hosts that resolve to private or local network addresses by default and does not follow redirects. For a registry you operate on a trusted local/private network, set `TESS_ALLOW_PRIVATE_REGISTRY=1` for that CLI invocation. This opt-in permits private HTTPS targets and HTTP only when the target resolves to a local/private address; do not set it while using an untrusted project configuration.

Core commands include `init`, `search`, `view`, `add`, `compose`, `export`, `validate`, and `doctor`. `lint`, `ingest`, `gate`, and `create-resource` are Beta and are marked as such in `tess --help`; their broader rule, parser, and hostile-input coverage remains in the hardening programme. Invalid manifests, unavailable catalogues, failed gates, and missing inputs return a non-zero process status. `ingest` parses supported React `.tsx` or `.jsx` route/entry files into a partial JSX structure, leaves source untouched, and refuses output paths that resolve to source files. Product intent, business logic, navigation behavior, CSS Modules, and dynamic styles are not inferred. Treat its archetype as unknown and review the generated manifest before composition or export.

`create-resource` writes an unpublished draft. Its provenance and license stay unresolved, its responsive-width list is empty, accessibility checks are false, and quality scores remain zero until a contributor supplies evidence. `tess validate` checks manifest shape; it does not certify generated source or behavior. The draft README contains review steps and does not claim registry installation.

The linter is a heuristic review aid, not a rendered accessibility or design-system certification. It reports color classes without guessing replacement roles; `lint --fix` only makes small spacing changes to non-zero grid values when the nearest 4px value is one pixel away.

The package is kept private until its distribution license and registry release are established. The build can still be packed and installed locally for clean-environment verification.
