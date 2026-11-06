import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AdminConsoleShell } from '../resources/shells/admin-console-shell/index.js';
import { AIMemoryContextPanel } from '../resources/ai/ai-memory-context-panel/index.js';
import { AIPromptHistory } from '../resources/ai/ai-prompt-history/index.js';
import { AISuggestedActions } from '../resources/ai/ai-suggested-actions/index.js';
import { ApiCapabilitySection } from '../resources/sections/api-capability-section/index.js';
import { AuditLog } from '../resources/blocks/audit-log/index.js';
import { CommandCentreShell } from '../resources/shells/command-centre-shell/index.js';
import { CohortMatrix } from '../resources/data/cohort-matrix/index.js';

const render = (component: Parameters<typeof createElement>[0], props?: object) =>
  renderToStaticMarkup(createElement(component, props));

const manifest = (slug: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`../resources/${slug}/manifest.json`, import.meta.url)), 'utf8')) as {
  description: string;
  intent: { summary: string; jobs: string[] };
};

describe('v78 user-facing copy and control regressions', () => {
  it('does not imply that the admin preview has live members or GitHub authentication', () => {
    const html = render(AdminConsoleShell);
    expect(html).toMatch(/example organization data/i);
    expect(html).toMatch(/identity provider.*not connected/i);
    expect(html).not.toMatch(/Active Organization Members \(14\)|authenticated with GitHub OAuth/i);
  });

  it('does not offer an enabled invitation without a host action', () => {
    const html = render(AdminConsoleShell);
    expect(html).toContain('disabled=""');
    expect(html).toMatch(/Connect an invite handler/i);
  });

  it('enables host actions only when a caller supplies handlers', () => {
    const handler = () => undefined;
    expect(render(AdminConsoleShell, { onInvite: handler })).not.toContain('disabled=""');
    expect(render(AIPromptHistory, { onReplay: handler })).not.toContain('disabled=""');
    expect(render(AISuggestedActions, { onAction: handler })).not.toContain('disabled=""');
  });

  it('identifies assistant-memory rows as local example state', () => {
    const html = render(AIMemoryContextPanel);
    expect(html).toMatch(/Example assistant memory/i);
    expect(html).toMatch(/Local preview only.*not connected to an assistant/i);
    expect(html).not.toMatch(/Active Assistant Memory|Short &amp; long-term conversational recall|Purge All/);
  });

  it('labels prompt history and disables replay until the host supplies a handler', () => {
    const html = render(AIPromptHistory);
    expect(html).toMatch(/Example prompt history/i);
    expect(html).toMatch(/sample records.*provider usage is stored/i);
    expect(html).toContain('disabled=""');
    expect(html).toMatch(/Connect a replay handler/i);
  });

  it('labels suggested actions as examples and does not expose fake action controls', () => {
    const html = render(AISuggestedActions);
    expect(html).toMatch(/Example suggested actions/i);
    expect(html).toMatch(/connect action handlers/i);
    expect(html).toContain('disabled=""');
    expect(html).toMatch(/Examples only; connect action handlers to enable these steps/i);
  });

  it('does not present sample endpoint patterns as current API documentation', () => {
    const html = render(ApiCapabilitySection);
    expect(html).toMatch(/Illustrative API examples/i);
    expect(html).toMatch(/not API documentation/i);
  });

  it('labels audit events as illustrative and removes the immutable-trail claim', () => {
    const html = render(AuditLog);
    expect(html).toMatch(/Example audit events/i);
    expect(html).toMatch(/sample records.*not live audit data/i);
    expect(html).not.toMatch(/immutable audit trail/i);
  });

  it('does not report sample command-centre status as live system health', () => {
    const html = render(CommandCentreShell);
    expect(html).toMatch(/Example telemetry layout/i);
    expect(html).toMatch(/Sample status.*not live/i);
    expect(html).not.toMatch(/ALL SYSTEMS OPERATIONAL|Global Cluster Telemetry/i);
  });

  it('labels cohort sizes and retention percentages as illustrative data', () => {
    const html = render(CohortMatrix);
    expect(html).toMatch(/Illustrative retention data.*not live metrics/i);
    expect(html).toMatch(/Illustrative cohort retention examples/i);
  });

  it.each([
    ['shells/admin-console-shell', /example.*illustrative/i],
    ['ai/ai-memory-context-panel', /local preview|example/i],
    ['ai/ai-prompt-history', /example|sample/i],
    ['ai/ai-suggested-actions', /example/i],
    ['sections/api-capability-section', /illustrative|not API documentation/i],
    ['blocks/audit-log', /example|sample/i],
    ['shells/command-centre-shell', /example|sample/i],
    ['data/cohort-matrix', /illustrative|not live/i],
  ] as const)('keeps %s catalogue metadata honest', (resourcePath, disclosure) => {
    const value = manifest(resourcePath);
    expect(`${value.description} ${value.intent.summary} ${value.intent.jobs.join(' ')}`).toMatch(disclosure);
  });
});
