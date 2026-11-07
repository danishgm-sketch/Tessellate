import { readFile, writeFile } from 'node:fs/promises';
const path = 'docs/PRODUCT_HARDENING.md';
let text = await readFile(path, 'utf8');
text = text.replace(
  'PR #10 is open and unmerged; exact-head CI succeeded on 8fdb115e70356fb03bc9e3eb2076a5794d44aa6a.',
  'PR #10 is open and unmerged. Its deployed application source passed CI on the product-code head before this audit-evidence-only update; the evidence update is being checked separately before handoff.'
);
const step = text.split('\n').find((line) => line.startsWith('- [ ] 39 Language/copy'));
if (!step) throw new Error('Step 39 checklist line not found');
const updated = `${step} The public v78 follow-up (2026-11-06) also closes AUD-471–AUD-491 after 30/30 targeted desktop/mobile checks; all 324 resource details loaded at both widths and all 1,944 variants rendered. The v78 route and copy re-audit is recorded in quality/evidence/step-45/public-v78-reaudit/ and quality/STEP_39_EVIDENCE.md. Step 39 stays open: a complete manual review across every visible string, CLI/MCP, docs, and secondary workflows is not yet evidenced.`;
text = text.replace(step, updated);
await writeFile(path, text, 'utf8');
const goalPath = 'docs/GRAND_GOAL_PROGRESS.md';
let goal = await readFile(goalPath, 'utf8');
goal = goal.replace(
  '- Active scoped branch: codex/surprise-net-change-audit at 8fdb115e70356fb03bc9e3eb2076a5794d44aa6a. PR #10 remains open and unmerged; exact-head GitHub CI is green. Public review Site v78 serves canonical code 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca through Sites mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d.',
  '- Active scoped branch: codex/surprise-net-change-audit. PR #10 remains open and unmerged; the v78 application source passed GitHub CI on its product-code head before this audit-only evidence update. Public review Site v78 serves canonical code 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca through Sites mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d.'
);
await writeFile(goalPath, goal, 'utf8');
console.log('Updated Step 39 and current CI chronology.');
