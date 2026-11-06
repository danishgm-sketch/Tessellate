import { readFile, writeFile } from 'node:fs/promises';

const auditPath = 'audit/runtime-audit.json';
const reportPath = 'quality/evidence/step-45/public-v78-reaudit/manual-copy-suspects/report.json';
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const report = JSON.parse(await readFile(reportPath, 'utf8'));
const bySlug = new Map(report.results.map((result) => [result.slug, result]));
const screenshot = (slug, viewport, kind = 'preview-before') =>
  `quality/evidence/step-45/public-v78-reaudit/manual-copy-suspects/${slug}-${viewport}-${kind}.png`;
const commonEvidence = (slug, route) => {
  const result = bySlug.get(slug);
  return {
    route: `https://tessellate-v1-review.ismayildanish-gm.chatgpt.site${route}`,
    browser: {
      desktop: {
        url: result.url,
        viewport: '1440x900',
        status: result.status,
        consoleErrors: result.telemetry.consoleErrors,
        consoleWarnings: result.telemetry.consoleWarnings,
        uncaughtExceptions: result.telemetry.uncaughtExceptions,
        failedRequests: result.telemetry.failedRequests,
        httpErrors: result.telemetry.httpErrors,
        previewText: result.frameText,
        interaction: result.interaction,
        screenshot: screenshot(slug, 'desktop-1440x900'),
      },
      mobile: {
        url: bySlug.get(slug).url,
        viewport: '390x844',
        status: bySlug.get(slug).status,
        screenshot: screenshot(slug, 'mobile-390x844'),
      },
    },
  };
};

const entries = [
  {
    id: 'AUD-496', severity: 'medium', route: '/r/admin-console-shell/', viewport: '1440x900, 390x844', category: 'content',
    title: 'Admin shell presents fabricated organization membership and authentication as live state',
    expected: 'The sample layout should identify example data and avoid claiming a live member count or identity provider.',
    actual: 'The preview showed “Active Organization Members (14)” and “All members authenticated with GitHub OAuth.” without a sample-data disclosure.',
    reproduction: ['Open /r/admin-console-shell/ at 1440x900 or 390x844.', 'Inspect the live preview; the member count and OAuth claim are visible.'],
    screenshot: screenshot('admin-console-shell', 'desktop-1440x900'),
    evidence: commonEvidence('admin-console-shell', '/r/admin-console-shell/'),
    rootCause: 'The resource hard-coded a fabricated member count and provider claim as default content.',
    affectedCode: ['resources/shells/admin-console-shell/index.tsx', 'resources/shells/admin-console-shell/manifest.json'],
    remediation: 'Replace fabricated live claims with an explicit example-data disclosure and identify the missing identity-provider integration.',
  },
  {
    id: 'AUD-497', severity: 'medium', route: '/r/admin-console-shell/', viewport: '1440x900, 390x844', category: 'accessibility',
    title: 'Invite User control has no action or feedback',
    expected: 'The invite control should call a host action or be disabled with a truthful explanation.',
    actual: 'The enabled button remained unchanged after clicking on desktop and mobile.',
    reproduction: ['Open /r/admin-console-shell/.', 'Click Invite User; no dialog, navigation, status or visible state change occurs.'],
    screenshot: screenshot('admin-console-shell', 'desktop-1440x900'),
    evidence: commonEvidence('admin-console-shell', '/r/admin-console-shell/'),
    rootCause: 'The component rendered an unconditional button without an invitation callback contract.',
    affectedCode: ['resources/shells/admin-console-shell/index.tsx'],
    remediation: 'Add an optional host callback, disable the control when absent, and provide an accessible explanation.',
  },
  {
    id: 'AUD-498', severity: 'medium', route: '/r/ai-memory-context-panel/', viewport: '1440x900, 390x844', category: 'content',
    title: 'Local preference examples are presented as active assistant memory',
    expected: 'The panel should say that rows are example local state and do not represent persisted assistant memory.',
    actual: 'The preview claimed “Active Assistant Memory” and “Short & long-term conversational recall”; Purge All only cleared component-local sample rows.',
    reproduction: ['Open /r/ai-memory-context-panel/.', 'Compare the active-memory claims with the local-only effect of Purge All.'],
    screenshot: screenshot('ai-memory-context-panel', 'desktop-1440x900'),
    evidence: commonEvidence('ai-memory-context-panel', '/r/ai-memory-context-panel/'),
    rootCause: 'The default component content described a real assistant memory store although its state existed only in React memory.',
    affectedCode: ['resources/ai/ai-memory-context-panel/index.tsx', 'resources/ai/ai-memory-context-panel/manifest.json'],
    remediation: 'Identify example preferences and local-only clearing; add an empty state and accessible row-removal names.',
  },
  {
    id: 'AUD-499', severity: 'medium', route: '/r/ai-prompt-history/', viewport: '1440x900, 390x844', category: 'data',
    title: 'Prompt history preview shows invented prompts, timestamps and token usage as stored records',
    expected: 'Example prompt rows and usage figures should be clearly disclosed as samples, and catalogue metadata should not claim these are previous requests.',
    actual: 'Three fabricated requests with relative timestamps and token counts appeared under “Prompt History” without a sample-data note.',
    reproduction: ['Open /r/ai-prompt-history/.', 'Inspect the prompt rows and token/time figures before interacting.'],
    screenshot: screenshot('ai-prompt-history', 'desktop-1440x900'),
    evidence: commonEvidence('ai-prompt-history', '/r/ai-prompt-history/'),
    rootCause: 'Hard-coded request examples and usage metrics were presented as a real history log in both component and manifest copy.',
    affectedCode: ['resources/ai/ai-prompt-history/index.tsx', 'resources/ai/ai-prompt-history/manifest.json'],
    remediation: 'Label the list as sample records, state that provider usage is not stored, and update the resource intent metadata.',
  },
  {
    id: 'AUD-500', severity: 'medium', route: '/r/ai-prompt-history/', viewport: '1440x900, 390x844', category: 'accessibility',
    title: 'Prompt Replay button does not replay or provide feedback',
    expected: 'Replay should use a host callback or be disabled with an explanation.',
    actual: 'The enabled Replay button produced no visible state change on desktop or mobile.',
    reproduction: ['Open /r/ai-prompt-history/.', 'Click Replay on any row; no action or feedback occurs.'],
    screenshot: screenshot('ai-prompt-history', 'desktop-1440x900'),
    evidence: commonEvidence('ai-prompt-history', '/r/ai-prompt-history/'),
    rootCause: 'The resource rendered Replay buttons without a replay callback contract.',
    affectedCode: ['resources/ai/ai-prompt-history/index.tsx'],
    remediation: 'Add an optional host replay callback and disable each button with a connected explanation when the callback is absent.',
  },
  {
    id: 'AUD-501', severity: 'medium', route: '/r/ai-suggested-actions/', viewport: '1440x900, 390x844', category: 'accessibility',
    title: 'Suggested next-step controls only changed selection styling while implying workflow execution',
    expected: 'The example should either invoke an actual host operation or report clearly that the click is only a local preview.',
    actual: 'Clicking “Export as Vite App” only changed the selected ring and did not export a project or report an outcome.',
    reproduction: ['Open /r/ai-suggested-actions/.', 'Click Export as Vite App; no export starts and no visible text explains the result.'],
    screenshot: screenshot('ai-suggested-actions', 'desktop-1440x900'),
    evidence: commonEvidence('ai-suggested-actions', '/r/ai-suggested-actions/'),
    rootCause: 'The component used a local selected-state style for action cards, while the preview host callback reported a generic activated state.',
    affectedCode: ['resources/ai/ai-suggested-actions/index.tsx', 'resources/ai/ai-suggested-actions/manifest.json', 'apps/preview/src/components/PreviewHost.tsx'],
    remediation: 'Identify the cards as examples, connect an optional action contract, and make the preview callback explicitly say no product operation ran.',
  },
  {
    id: 'AUD-502', severity: 'medium', route: '/r/api-capability-section/', viewport: '1440x900, 390x844', category: 'content',
    title: 'API section advertises endpoint paths that are not implemented by the Hono API',
    expected: 'Endpoint examples should match current API routes or be labeled as illustrative rather than documentation.',
    actual: 'The section presented /api/v1/resources/:slug, /api/v1/compose and /api/v1/dna/tokens as programmatic API access; those paths are absent from apps/api/src/index.ts and its mounted routers.',
    reproduction: ['Open /r/api-capability-section/.', 'Compare the displayed endpoints with the mounted routes in apps/api/src/index.ts.'],
    screenshot: screenshot('api-capability-section', 'desktop-1440x900'),
    evidence: commonEvidence('api-capability-section', '/r/api-capability-section/'),
    rootCause: 'The endpoint cards were static sample copy with no disclosure or link to the actual API reference.',
    affectedCode: ['resources/sections/api-capability-section/index.tsx', 'resources/sections/api-capability-section/manifest.json'],
    remediation: 'Label the card paths as illustrative patterns and direct integrators to current API documentation.',
  },
  {
    id: 'AUD-503', severity: 'medium', route: '/r/audit-log/', viewport: '1440x900, 390x844', category: 'content',
    title: 'Fabricated audit events are shown as a live immutable security trail',
    expected: 'The event rows, actor identifiers and reserved example IP addresses should be visibly identified as sample data; metadata must not claim immutability.',
    actual: 'The preview showed API key rotation and project events under “Security Audit Trail”, while the manifest promised an immutable audit trail and no sample disclosure appeared.',
    reproduction: ['Open /r/audit-log/.', 'Inspect the event heading, actor/IP rows, and resource intent metadata.'],
    screenshot: screenshot('audit-log', 'desktop-1440x900'),
    evidence: commonEvidence('audit-log', '/r/audit-log/'),
    rootCause: 'Static event fixtures and an unsupported immutable/security claim were shipped without identifying the records as examples.',
    affectedCode: ['resources/blocks/audit-log/index.tsx', 'resources/blocks/audit-log/manifest.json'],
    remediation: 'Label events as examples, remove the immutable claim, and state that production requires a server-managed event source.',
  },
  {
    id: 'AUD-504', severity: 'medium', route: '/r/command-centre-shell/', viewport: '1440x900, 390x844', category: 'content',
    title: 'Command-centre shell asserts all systems are operational without telemetry',
    expected: 'A static layout should use neutral sample status and disclose that no live telemetry is connected.',
    actual: 'The preview displayed “Global Cluster Telemetry” and a green “ALL SYSTEMS OPERATIONAL” status beside generic nodes.',
    reproduction: ['Open /r/command-centre-shell/.', 'Inspect the health banner; it remains green with no connected data source.'],
    screenshot: screenshot('command-centre-shell', 'desktop-1440x900'),
    evidence: commonEvidence('command-centre-shell', '/r/command-centre-shell/'),
    rootCause: 'The shell hard-coded a successful operational state and telemetry title into its default UI and manifest.',
    affectedCode: ['resources/shells/command-centre-shell/index.tsx', 'resources/shells/command-centre-shell/manifest.json'],
    remediation: 'Use an example-layout label and neutral “sample status — not live” copy; identify nodes as examples.',
  },
  {
    id: 'AUD-505', severity: 'medium', route: '/r/cohort-matrix/', viewport: '1440x900, 390x844', category: 'data',
    title: 'Cohort sizes and retention percentages appear to be measured product metrics',
    expected: 'The chart should visibly state that cohort labels, sizes and percentages are illustrative examples.',
    actual: 'The table showed 2026 cohort sizes up to 2,100 and retention percentages without a sample disclosure.',
    reproduction: ['Open /r/cohort-matrix/.', 'Inspect the cohort sizes and percentages in the table.'],
    screenshot: screenshot('cohort-matrix', 'desktop-1440x900'),
    evidence: commonEvidence('cohort-matrix', '/r/cohort-matrix/'),
    rootCause: 'Hard-coded cohort data was rendered as ordinary product analytics with no disclosure or table caption.',
    affectedCode: ['resources/data/cohort-matrix/index.tsx', 'resources/data/cohort-matrix/manifest.json'],
    remediation: 'Mark the values as illustrative and add an accessible caption clarifying they are not live metrics.',
  },
];

const existing = new Set(audit.entries.map((entry) => entry.id));
const additions = entries.filter((entry) => !existing.has(entry.id)).map((entry) => ({
  ...entry,
  console: [],
  network: [],
  fixCommit: null,
  status: 'fixed-awaiting-deployed-verification',
}));
if (additions.length > 0) {
  audit.entries.push(...additions);
  await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
}
console.log(`Added ${additions.length} findings; ${entries.length - additions.length} already existed.`);
