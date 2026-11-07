import { readFile, writeFile } from 'node:fs/promises';

const runtimePath = 'audit/RUNTIME_AUDIT.md';
let runtime = await readFile(runtimePath, 'utf8');
runtime = runtime.replace(
  '**Current ledger:** 495 findings (0 Critical, 87 High, 379 Medium, 29 Low): 249 closed after deployed verification, 9 historical closed, 2 closed-local, 133 fixed awaiting deployed verification, 98 fixed and verified locally, 2 legacy fixed, and 2 documented Sites-host limitations. High/P1 and overall hardening gates remain incomplete.',
  '**Ledger at v78:** 495 findings (0 Critical, 87 High, 379 Medium, 29 Low): 270 closed after deployed verification, 9 historical closed, 2 closed-local, 112 fixed awaiting deployed verification, 98 fixed and verified locally, 2 legacy fixed, and 2 documented Sites-host limitations. High/P1 and overall hardening gates remain incomplete.'
);
runtime = runtime.replace(
  'The 21 issues remain `fixed-awaiting-deployed-verification`. v75 is the before-state; none is closed until the exact pushed source is published to the review Site and the same resource behaviors pass against the live deployment.',
  'At the v75 before-state, these 21 issues were `fixed-awaiting-deployed-verification`. This historical status is superseded by the issue-specific public v78 closeout below.'
);
await writeFile(runtimePath, runtime, 'utf8');

const goalPath = 'docs/GRAND_GOAL_PROGRESS.md';
let goal = await readFile(goalPath, 'utf8');
const oldHeading = '## Current checkpoint — 2026-11-03';
if (!goal.includes(oldHeading)) throw new Error('Historical goal checkpoint heading not found');
const currentGoal = `## Current checkpoint — 2026-11-06

- Active scoped branch: codex/surprise-net-change-audit at 8fdb115e70356fb03bc9e3eb2076a5794d44aa6a. PR #10 remains open and unmerged; exact-head GitHub CI is green. Public review Site v78 serves canonical code 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca through Sites mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d.
- Verso's technically permissible integration is complete as a private, local-only inspection adapter over 1,053/1,053 inventoried modules. The modules are exercised using the canonical schema and isolated preview app; no Verso source or derivative is copied into the public catalogue, Gold registry, Workbench, registry endpoints, CLI/MCP, or exporters. Source license is UNLICENSED and redistribution rights are unresolved, so public inclusion and per-resource Core certification remain blocked.
- The v78 deployed audit visited 31 routes at desktop/mobile, opened all 324 resource detail pages at both sizes, rendered 1,944 variants, passed 30 targeted issue tests, and completed eight representative Axe scans with zero violations. AUD-471–AUD-491 are issue-specifically closed after deployed checks. Evidence is in quality/evidence/step-45/public-v78-reaudit/.
- The audit register has 495 entries (0 Critical, 87 High, 379 Medium, 29 Low). 270 have deployed verification; 112 await their own deployed verification; 98 are locally verified; historical/local/host-limitation groups remain documented. AUD-419 is the sole nonclosed High finding; real provider forwarding needs the optional laptop host and provider endpoint. One mobile window.styleMedia deprecation warning was observed once and not reproduced; it remains documented.
- Product hardening is not complete. Step 39's full copy review and Step 48's final release gate remain open. Continue Step 39 in order, then follow the remaining hardening programme; PRODUCT_HARDENING.md remains authoritative. Human user sessions remain owner-waived, not passed. D1/R2 are unprovisioned and no paid infrastructure or secrets were added.

## Historical checkpoint — 2026-11-03`;
goal = goal.replace(oldHeading, currentGoal);
await writeFile(goalPath, goal, 'utf8');
console.log('Updated v75/v78 audit chronology and inserted the current 2026-11-06 goal checkpoint.');
