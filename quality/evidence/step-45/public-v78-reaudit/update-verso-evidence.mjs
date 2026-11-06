import { appendFile, readFile, writeFile } from 'node:fs/promises';

const versoEvidence = `

## Fresh owner-local revalidation — 2026-11-06

A new static inventory and canonical-schema projection were generated from the current private source tree outside the repository. The inventory contains 1,053 modules, reports zero static parse warnings, and preserves the source license as UNLICENSED. All 1,053 projected manifests are experimental, unverified, and blocked from redistribution; none is eligible for public catalogue, Gold, Workbench, registry, CLI/MCP, or export use.

The two local applications were started on loopback only (127.0.0.1). The current full browser audit rendered 1,053/1,053 projected modules with zero unresolved modules, render failures, or render-sweep warnings. The catalogue contained 1,377 unique slugs during the private run (324 public plus the isolated local projection). The representative detail route returned HTTP 200, with no browser console errors, uncaught exceptions, failed requests, or bad responses. The application origin returned 404 for a private source module; the dedicated preview origin returned 200. The preview remained in a distinct sandboxed iframe using the existing allow-scripts and allow-same-origin policy, with an origin distinct from the application origin.

Axe reported zero violations and one incomplete color-contrast check; no contrast certification is claimed. The representative WebGL resource produced four Chromium GPU-driver warnings about a GPU stall during ReadPixels screenshot/readback. No module failed, but this is retained as a performance observation and does not certify GPU-heavy resources. The full JSON report, private inventory/projection, and two screenshots remain outside Git under the owner-local temporary evidence directory; only this aggregate report is committed. The inventory and projection scripts each passed their seven-file focused suite (25 tests total) on the current branch.

This revalidation confirms private local discovery and rendering only. It neither resolves redistribution rights nor certifies resource accessibility, performance, responsive behavior, or export fidelity. The earlier out-of-repository source boundary and no-public-copy rule remain unchanged.
`;
await appendFile('quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md', versoEvidence, 'utf8');
const goalPath = 'docs/GRAND_GOAL_PROGRESS.md';
let goal = await readFile(goalPath, 'utf8');
goal = goal.replace(
  "- Verso's technically permissible integration is complete as a private, local-only inspection adapter over 1,053/1,053 inventoried modules. The modules are exercised using the canonical schema and isolated preview app; no Verso source or derivative is copied into the public catalogue, Gold registry, Workbench, registry endpoints, CLI/MCP, or exporters. Source license is UNLICENSED and redistribution rights are unresolved, so public inclusion and per-resource Core certification remain blocked.",
  "- Verso's technically permissible integration is complete as a private, local-only inspection adapter over 1,053/1,053 modules. Fresh current-source inventory/projection and browser audit passed 25 focused tests and rendered 1,053/1,053 previews with zero module failures. Source isolation was 404 at the Site origin and 200 at the distinct loopback preview origin; Axe found zero violations and one incomplete contrast check. One representative WebGL module emitted four GPU readback/stall warnings. No source or derivative is copied into public catalogue, Gold, Workbench, registry, CLI/MCP or exporters. Source license is UNLICENSED; public inclusion and Core certification remain blocked pending rights and per-resource checks. Aggregate evidence: quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md; raw inventory, projection, report and screenshots remain outside Git."
);
await writeFile(goalPath, goal, 'utf8');
console.log('Recorded the fresh private Verso verification without copying source or raw reports into the repository.');
