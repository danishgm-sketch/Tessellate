import type { AIDef } from './ai-builder';

export const AI_BATCH_2: AIDef[] = [
  // 11. AI Agent Activity Feed
  {
    slug: 'ai-agent-activity-feed',
    name: 'AI Agent Activity Feed',
    description:
      'Real-time telemetry stream showing background agent thoughts, state transitions, subagent spawns, and progress percentages.',
    categories: ['ai', 'patterns', 'agent'],
    roles: ['feed', 'agent'],
    purposes: ['agent-monitoring', 'background-telemetry', 'progress-tracking'],
    componentName: 'AIAgentActivityFeed',
    tags: ['ai', 'agent', 'activity', 'stream', 'telemetry'],
    idealFor: [
      'Autonomous multi-agent execution dashboard',
      'Background code synthesis monitoring',
      'Agent swarm status viewer',
    ],
    avoidFor: ['Synchronous modal alerts', 'Single number KPI cards'],
    jobs: ['Stream live subagent events, thought traces, and task completion milestones'],
    indexCode: `import React, { useState } from 'react';

export type AIAgentActivityFeedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIAgentActivityFeedProps {
  variant?: AIAgentActivityFeedVariant;
}

export function AIAgentActivityFeed({ variant = 'quiet' }: AIAgentActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'milestones'>('all');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const events = [
    { time: '01:14:02', agent: 'CatalogResearcher', action: 'Scanned 24 data visualization definitions in resources/data', type: 'info' },
    { time: '01:14:15', agent: 'TypeChecker', action: 'Completed full monorepo tsc --noEmit across 17 packages: 0 errors', type: 'milestone' },
    { time: '01:14:28', agent: 'RegistryGenerator', action: 'Generated shadcn-compatible endpoints in apps/site/public/r', type: 'milestone' },
    { time: '01:14:40', agent: 'Linter', action: 'Enforced strict 0 warnings rule on all components', type: 'info' },
  ];

  const displayed = filter === 'milestones' ? events.filter((e) => e.type === 'milestone') : events;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="text-sm font-semibold tracking-tight">Agent Swarm Activity</h4>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={\`px-2.5 py-1 rounded font-mono \${filter === 'all' ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold' : 'text-neutral-400'}\`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('milestones')}
            className={\`px-2.5 py-1 rounded font-mono \${filter === 'milestones' ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold' : 'text-neutral-400'}\`}
          >
            Milestones
          </button>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {displayed.map((e, idx) => (
          <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <span className="text-[11px] text-neutral-400 select-none">{e.time}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {e.agent}
            </span>
            <span className="flex-1 text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans text-xs">
              {e.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIAgentActivityFeed, AIAgentActivityFeedVariant } from './index';

export function AIAgentActivityFeedPreview() {
  const [variant, setVariant] = useState<AIAgentActivityFeedVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIAgentActivityFeed variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiAgentActivityFeedFixtures = {};`,
    readmeCode: `# AI Agent Activity Feed

Real-time telemetry stream displaying agent thoughts, state transitions, subagent executions, and milestones.`,
  },

  // 12. AI Approval Request
  {
    slug: 'ai-approval-request',
    name: 'AI Approval Request',
    description:
      'Human-in-the-loop intervention card requesting explicit user confirmation before executing irreversible, high-cost, or external operations.',
    categories: ['ai', 'patterns', 'governance'],
    roles: ['approval', 'governance'],
    purposes: ['human-in-the-loop', 'permission-gate', 'destructive-action-prevention'],
    componentName: 'AIApprovalRequest',
    tags: ['ai', 'approval', 'human-in-the-loop', 'permissions', 'gate'],
    idealFor: [
      'Codebase refactor authorization',
      'Production database migration confirmations',
      'External API spend approvals',
    ],
    avoidFor: ['Standard form submit buttons', 'Trivial read-only operations'],
    jobs: [
      'Pause autonomous agent execution and require human verification before sensitive steps',
    ],
    indexCode: `import React, { useState } from 'react';

export type AIApprovalRequestVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIApprovalRequestProps {
  variant?: AIApprovalRequestVariant;
}

export function AIApprovalRequest({ variant = 'quiet' }: AIApprovalRequestProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-amber-500/30 text-white'
      : variant === 'expressive'
      ? 'bg-amber-50/20 border-amber-300 text-neutral-900 shadow-sm'
      : 'bg-white border-amber-200 text-neutral-900';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 dark:border-amber-900/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <span className="text-base">⚠</span>
          <span>Human Approval Required</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
          HIGH IMPACT
        </span>
      </div>

      <div className="space-y-2 text-xs leading-relaxed">
        <p className="font-semibold text-sm">
          Autonomous Agent requests permission to overwrite 4 design tokens in <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">tokens.css</code>
        </p>
        <p className="text-neutral-500">
          This modification alters border-hairline, canvas-bg, accent-primary, and typography scale across 24 screen layouts.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-neutral-400 font-mono">Agent ID: agy_builder_04</span>
        <div className="flex gap-2">
          <button
            onClick={() => setStatus('rejected')}
            disabled={status !== 'pending'}
            className="px-3.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
          >
            {status === 'rejected' ? 'Rejected' : 'Reject Action'}
          </button>
          <button
            onClick={() => setStatus('approved')}
            disabled={status !== 'pending'}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {status === 'approved' ? '✓ Authorized' : 'Approve & Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIApprovalRequest, AIApprovalRequestVariant } from './index';

export function AIApprovalRequestPreview() {
  const [variant, setVariant] = useState<AIApprovalRequestVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIApprovalRequest variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiApprovalRequestFixtures = {};`,
    readmeCode: `# AI Approval Request

Human-in-the-loop intervention card requesting explicit user verification prior to sensitive or destructive operations.`,
  },

  // 13. AI Plan Review
  {
    slug: 'ai-plan-review',
    name: 'AI Plan Review',
    description:
      'Multi-stage structured action plan with phase gates, estimated complexity, acceptance criteria, and proceed triggers.',
    categories: ['ai', 'patterns', 'planning'],
    roles: ['plan', 'review'],
    purposes: ['plan-approval', 'phase-gate-review', 'task-decomposition'],
    componentName: 'AIPlanReview',
    tags: ['ai', 'plan', 'review', 'phases', 'tasks'],
    idealFor: [
      'Autonomous build order roadmaps',
      'Complex architectural refactor reviews',
      'Pre-flight deployment planning',
    ],
    avoidFor: ['Standard task item checklists', 'Simple single-command terminals'],
    jobs: ['Present structured multi-step execution plans with actionable proceed confirmations'],
    indexCode: `import React, { useState } from 'react';

export type AIPlanReviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIPlanReviewProps {
  variant?: AIPlanReviewVariant;
}

export function AIPlanReview({ variant = 'quiet' }: AIPlanReviewProps) {
  const [accepted, setAccepted] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const steps = [
    { num: '01', title: 'Generate Manifest Contracts', desc: 'Create 20 validated ResourceManifest JSON schemas with 0 dependencies.' },
    { num: '02', title: 'Synthesize React Components', desc: 'Author clean, accessible pure SVG + Tailwind components for all 3 variants.' },
    { num: '03', title: 'Monorepo Typecheck & Lint Gate', desc: 'Run pnpm typecheck and pnpm lint to verify 0 errors and 0 warnings.' },
    { num: '04', title: 'Test Suite & Phase Gate Commit', desc: 'Execute 253 tests across packages and commit with conventional commit message.' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-5 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Proposed Implementation Plan</h4>
          <p className="text-xs text-neutral-500">Autonomous execution strategy for Phase 18</p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
          4 Steps | ~2m runtime
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.num} className="flex items-start gap-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-mono font-bold text-neutral-400 mt-0.5">{s.num}</span>
            <div className="flex-1">
              <h5 className="text-xs font-semibold mb-0.5">{s.title}</h5>
              <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => setAccepted(!accepted)}
          className="px-5 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          {accepted ? '✓ Plan Accepted & Running' : 'Accept Plan & Proceed'}
        </button>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIPlanReview, AIPlanReviewVariant } from './index';

export function AIPlanReviewPreview() {
  const [variant, setVariant] = useState<AIPlanReviewVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIPlanReview variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiPlanReviewFixtures = {};`,
    readmeCode: `# AI Plan Review

Multi-stage structured action plan with phase gates, estimated complexities, and proceed confirmations.`,
  },

  // 14. AI Multi-Agent Board
  {
    slug: 'ai-multi-agent-board',
    name: 'AI Multi-Agent Board',
    description:
      'Kanban-style swarm status board tracking assigned subagents, conversation channels, and concurrent task states.',
    categories: ['ai', 'patterns', 'multi-agent'],
    roles: ['board', 'swarm'],
    purposes: ['swarm-coordination', 'subagent-management', 'concurrent-execution'],
    componentName: 'AIMultiAgentBoard',
    tags: ['ai', 'multi-agent', 'swarm', 'kanban', 'tasks'],
    idealFor: [
      'Multi-agent orchestration displays',
      'Autonomous team work distribution',
      'Subagent task lane tracking',
    ],
    avoidFor: ['Single user personal to-do lists', 'Static blog articles'],
    jobs: ['Coordinate and monitor parallel subagent workstreams in designated status lanes'],
    indexCode: `import React, { useState } from 'react';

export type AIMultiAgentBoardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIMultiAgentBoardProps {
  variant?: AIMultiAgentBoardVariant;
}

export function AIMultiAgentBoard({ variant = 'quiet' }: AIMultiAgentBoardProps) {
  const [activeLane] = useState('all');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const agents = [
    { name: 'ArchitectAgent', task: 'Design Schema 1.0.0', lane: 'Complete', status: 'done' },
    { name: 'CatalogAgent', task: 'Validating 324 resources', lane: 'In Progress', status: 'active' },
    { name: 'TestingAgent', task: 'Execute Playwright suite', lane: 'Queued', status: 'idle' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Autonomous Agent Swarm</h4>
          <p className="text-xs text-neutral-500">3 subagents coordinated via Antigravity SDK</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500">Active Swarm</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {['Queued', 'In Progress', 'Complete'].map((lane) => (
          <div key={lane} className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-mono font-semibold uppercase text-neutral-400">{lane}</span>
            {agents
              .filter((a) => a.lane === lane && (activeLane === 'all' || activeLane === lane))
              .map((a) => (
                <div key={a.name} className="p-2.5 rounded bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 text-xs shadow-xs">
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{a.name}</div>
                  <div className="text-[11px] text-neutral-500">{a.task}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIMultiAgentBoard, AIMultiAgentBoardVariant } from './index';

export function AIMultiAgentBoardPreview() {
  const [variant, setVariant] = useState<AIMultiAgentBoardVariant>('quiet');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIMultiAgentBoard variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiMultiAgentBoardFixtures = {};`,
    readmeCode: `# AI Multi-Agent Board

Kanban-style swarm status board coordinating concurrent subagent tasks across lifecycle lanes.`,
  },

  // 15. AI Memory/Context Panel
  {
    slug: 'ai-memory-context-panel',
    name: 'AI Memory Context Panel',
    description:
      'Inspector card showing active short-term and long-term agent memory slots, pinned user preferences, and purge controls.',
    categories: ['ai', 'patterns', 'memory'],
    roles: ['memory', 'inspector'],
    purposes: ['memory-inspection', 'preference-persistence', 'context-window-hygiene'],
    componentName: 'AIMemoryContextPanel',
    tags: ['ai', 'memory', 'context', 'inspector', 'preferences'],
    idealFor: ['User preference management', 'Session memory inspection', 'AI privacy controls'],
    avoidFor: ['Standard public footer links', 'Password inputs'],
    jobs: ['Inspect and manage persisted memory entities remembered by the assistant'],
    indexCode: `import React, { useState } from 'react';

export type AIMemoryContextPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIMemoryContextPanelProps {
  variant?: AIMemoryContextPanelVariant;
}

export function AIMemoryContextPanel({ variant = 'quiet' }: AIMemoryContextPanelProps) {
  const [memories, setMemories] = useState([
    { key: 'preferred_mode', val: 'Nocturne (dark obsidian canvas)' },
    { key: 'stack_target', val: 'React 19 + Tailwind CSS 4' },
    { key: 'dependency_rule', val: '0 undeclared dependencies allowed' },
  ]);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const removeMem = (k: string) => {
    setMemories(memories.filter((m) => m.key !== k));
  };

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Active Assistant Memory</h4>
          <p className="text-xs text-neutral-500">Short & long-term conversational recall</p>
        </div>
        <button
          onClick={() => setMemories([])}
          className="text-xs text-rose-500 hover:underline font-mono"
        >
          Purge All
        </button>
      </div>

      <div className="space-y-2">
        {memories.map((m) => (
          <div
            key={m.key}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
          >
            <div>
              <span className="text-neutral-400 mr-2">{m.key}:</span>
              <span className="font-semibold">{m.val}</span>
            </div>
            <button onClick={() => removeMem(m.key)} className="text-neutral-400 hover:text-rose-500 px-1">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIMemoryContextPanel, AIMemoryContextPanelVariant } from './index';

export function AIMemoryContextPanelPreview() {
  const [variant, setVariant] = useState<AIMemoryContextPanelVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIMemoryContextPanel variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiMemoryContextPanelFixtures = {};`,
    readmeCode: `# AI Memory Context Panel

Inspector surface detailing active agent memory entities, pinned user preferences, and purge controls.`,
  },

  // 16. AI Prompt History
  {
    slug: 'ai-prompt-history',
    name: 'AI Prompt History',
    description:
      'Searchable log of previous prompts with token stats, execution timestamps, and re-run buttons.',
    categories: ['ai', 'patterns', 'history'],
    roles: ['history', 'prompts'],
    purposes: ['prompt-auditing', 'query-replay', 'version-comparison'],
    componentName: 'AIPromptHistory',
    tags: ['ai', 'prompt', 'history', 'log', 'replay'],
    idealFor: [
      'Prompt experimentation logs',
      'Team prompt review libraries',
      'Token spend inspection',
    ],
    avoidFor: ['Real-time streaming chat messages', 'Single character typing fields'],
    jobs: ['Audit and replay past prompts with execution metrics and one-click reload'],
    indexCode: `import React, { useState } from 'react';

export type AIPromptHistoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIPromptHistoryProps {
  variant?: AIPromptHistoryVariant;
}

export function AIPromptHistory({ variant = 'quiet' }: AIPromptHistoryProps) {
  const [search, setSearch] = useState('');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const history = [
    { id: '1', prompt: 'Audit Design DNA alignment for all 56 application blocks', time: '10 mins ago', tokens: '1,420 tokens' },
    { id: '2', prompt: 'Generate 24 data visualization resources with zero runtime deps', time: '1 hour ago', tokens: '4,850 tokens' },
    { id: '3', prompt: 'Scaffold Phase 17 CLI with shadcn registry integration', time: 'Yesterday', tokens: '3,210 tokens' },
  ];

  const filtered = search ? history.filter((h) => h.prompt.toLowerCase().includes(search.toLowerCase())) : history;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Prompt History</h4>
          <p className="text-xs text-neutral-500">Replay or inspect previous generation requests</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter prompts..."
          className="px-2.5 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group"
          >
            <div className="flex-1 pr-4">
              <div className="font-medium mb-1 group-hover:text-current">{h.prompt}</div>
              <div className="text-[11px] font-mono text-neutral-400">
                {h.time} • {h.tokens}
              </div>
            </div>
            <button className="px-3 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Replay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIPromptHistory, AIPromptHistoryVariant } from './index';

export function AIPromptHistoryPreview() {
  const [variant, setVariant] = useState<AIPromptHistoryVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIPromptHistory variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiPromptHistoryFixtures = {};`,
    readmeCode: `# AI Prompt History

Searchable history of previous prompt runs with execution metrics and one-click replay controls.`,
  },

  // 17. AI File Context Picker
  {
    slug: 'ai-file-context-picker',
    name: 'AI File Context Picker',
    description:
      'Multi-select tree picker allowing users to attach specific project files and schemas into prompt context.',
    categories: ['ai', 'patterns', 'picker'],
    roles: ['picker', 'context'],
    purposes: ['file-selection', 'context-filtering', 'token-budgeting'],
    componentName: 'AIFileContextPicker',
    tags: ['ai', 'context', 'files', 'picker', 'tree'],
    idealFor: [
      'IDE file attachment modals',
      'Selective codebase grounding',
      'Context window optimization',
    ],
    avoidFor: ['Full disk file managers', 'Binary image galleries'],
    jobs: [
      'Select relevant workspace files to inject into prompt context with live token accounting',
    ],
    indexCode: `import React, { useState } from 'react';

export type AIFileContextPickerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIFileContextPickerProps {
  variant?: AIFileContextPickerVariant;
}

export function AIFileContextPicker({ variant = 'quiet' }: AIFileContextPickerProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    'src/tokens.css': true,
    'src/manifest.json': true,
  });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const files = [
    { path: 'src/tokens.css', size: '2.4 KB', tokens: 620 },
    { path: 'src/manifest.json', size: '1.8 KB', tokens: 450 },
    { path: 'src/Workbench.tsx', size: '14.2 KB', tokens: 3600 },
    { path: 'docs/DESIGN_SYSTEM.md', size: '8.6 KB', tokens: 2150 },
  ];

  const toggle = (p: string) => {
    setSelected((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const totalTokens = files
    .filter((f) => selected[f.path])
    .reduce((sum, f) => sum + f.tokens, 0);

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Attach File Context</h4>
          <p className="text-xs text-neutral-500">Inject workspace files into prompt memory</p>
        </div>
        <span className="text-xs font-mono font-medium text-cyan-500">
          Selected: {totalTokens} tokens
        </span>
      </div>

      <div className="space-y-2">
        {files.map((f) => {
          const isChecked = selected[f.path] ?? false;
          return (
            <div
              key={f.path}
              onClick={() => toggle(f.path)}
              className={\`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-colors \${
                isChecked
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800'
              }\`}
            >
              <div className="flex items-center gap-2.5">
                <input type="checkbox" checked={isChecked} readOnly className="rounded" />
                <span className="font-mono">{f.path}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
                <span>{f.size}</span>
                <span>~{f.tokens} tok</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIFileContextPicker, AIFileContextPickerVariant } from './index';

export function AIFileContextPickerPreview() {
  const [variant, setVariant] = useState<AIFileContextPickerVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIFileContextPicker variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiFileContextPickerFixtures = {};`,
    readmeCode: `# AI File Context Picker

Multi-select file tree picker allowing users to attach specific codebase documents with live token budgeting.`,
  },

  // 18. AI Model/Mode Switcher
  {
    slug: 'ai-model-mode-switcher',
    name: 'AI Model Mode Switcher',
    description:
      'Model-mode selector UI with local selection state; it does not connect to providers or manage credentials.',
    categories: ['ai', 'patterns', 'switcher'],
    roles: ['switcher', 'models'],
    purposes: ['mode-selector-layout', 'local-selection-state'],
    componentName: 'AIModelModeSwitcher',
    tags: ['ai', 'mode', 'switcher', 'example'],
    idealFor: ['Example mode selector', 'Local selection state studies'],
    avoidFor: ['Provider configuration', 'Credential management', 'Live model selection'],
    jobs: ['Change a local example mode in the preview without connecting to a model'],
    contentRequirements: [
      'Explain that options are examples and no model or provider is connected.',
    ],
    notes: [
      'Selections are local UI state only; credential and provider integration belong to the host application.',
    ],
    indexCode: `import React, { useState } from 'react';

export type AIModelModeSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIModelModeSwitcherProps {
  variant?: AIModelModeSwitcherVariant;
}

export function AIModelModeSwitcher({ variant = 'quiet' }: AIModelModeSwitcherProps) {
  const [activeModel, setActiveModel] = useState('balanced');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const models = [
    { id: 'fast', name: 'Fast', desc: 'Example mode for short, quick tasks', tag: 'Example' },
    { id: 'balanced', name: 'Balanced', desc: 'Example mode for general tasks', tag: 'Example' },
    { id: 'long-context', name: 'Long context', desc: 'Example mode for longer inputs', tag: 'Example' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Example model modes</h4>
          <p className="text-xs text-neutral-500">Example selector. Options change this preview only; no provider or local model is connected.</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">No model connected</span>
      </div>

      <div className="space-y-2.5">
        {models.map((m) => {
          const isSelected = activeModel === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModel(m.id)}
              aria-pressed={isSelected}
              className={\`w-full text-left flex items-center justify-between p-3.5 rounded-lg border text-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 \${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-1 ring-current'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }\`}
            >
              <div>
                <div className="font-semibold text-sm mb-0.5">{m.name}</div>
                <div className="text-xs text-neutral-500">{m.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 font-medium">
                {m.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIModelModeSwitcher, AIModelModeSwitcherVariant } from './index';

export function AIModelModeSwitcherPreview() {
  const [variant, setVariant] = useState<AIModelModeSwitcherVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIModelModeSwitcher variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiModelModeSwitcherFixtures = {};`,
    readmeCode: `# AI Model Mode Switcher

Local example mode selector. It does not connect to an AI provider or configure credentials.`,
  },

  // 19. AI Generation Compare
  {
    slug: 'ai-generation-compare',
    name: 'AI Generation Compare',
    description:
      'Side-by-side comparative split card evaluating two candidate AI generations with score metrics and selection trigger.',
    categories: ['ai', 'patterns', 'comparison'],
    roles: ['compare', 'evaluation'],
    purposes: ['candidate-evaluation', 'a-b-testing', 'design-variation-review'],
    componentName: 'AIGenerationCompare',
    tags: ['ai', 'compare', 'evaluation', 'side-by-side', 'candidates'],
    idealFor: [
      'Comparing 2 design variations',
      'Prompt output benchmarking',
      'Candidate selection workflows',
    ],
    avoidFor: ['Linear single-column blogs', 'Simple checkbox settings'],
    jobs: ['Present dual candidate AI responses side-by-side for human judgment and picking'],
    indexCode: `import React, { useState } from 'react';

export type AIGenerationCompareVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIGenerationCompareProps {
  variant?: AIGenerationCompareVariant;
}

export function AIGenerationCompare({ variant = 'quiet' }: AIGenerationCompareProps) {
  const [chosen, setChosen] = useState<'A' | 'B' | null>('B');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Candidate Generation Comparison</h4>
          <p className="text-xs text-neutral-500">Pick the best interface composition</p>
        </div>
        <span className="text-xs font-mono text-neutral-400">Prompt: "Executive Dashboard Header"</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Candidate A */}
        <div
          onClick={() => setChosen('A')}
          className={\`p-4 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all \${
            chosen === 'A'
              ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-2 ring-current'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }\`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold font-mono">Candidate A (Quiet)</span>
              <span className="text-[10px] font-mono text-neutral-400">Latency: 420ms</span>
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Monochrome high-density header with hairline dividers, compact breadcrumbs, and right-aligned metric sparklines.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
            <span className="text-[11px] font-mono text-neutral-400">Cohesion: 92/100</span>
            <button className="px-3 py-1 text-xs rounded bg-neutral-200 dark:bg-neutral-700 font-medium">
              {chosen === 'A' ? '✓ Selected' : 'Select A'}
            </button>
          </div>
        </div>

        {/* Candidate B */}
        <div
          onClick={() => setChosen('B')}
          className={\`p-4 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all \${
            chosen === 'B'
              ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-2 ring-current'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }\`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold font-mono">Candidate B (Nocturne)</span>
              <span className="text-[10px] font-mono text-neutral-400">Latency: 510ms</span>
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Obsidian backdrop with cyan hairline accents, high-contrast KPI counters, and status pulse indicators.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
            <span className="text-[11px] font-mono text-emerald-500">Cohesion: 98/100</span>
            <button className="px-3 py-1 text-xs rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium">
              {chosen === 'B' ? '✓ Selected' : 'Select B'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIGenerationCompare, AIGenerationCompareVariant } from './index';

export function AIGenerationComparePreview() {
  const [variant, setVariant] = useState<AIGenerationCompareVariant>('quiet');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIGenerationCompare variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiGenerationCompareFixtures = {};`,
    readmeCode: `# AI Generation Compare

Side-by-side comparative split card evaluating two candidate AI generations with quality metrics and selection actions.`,
  },

  // 20. AI Empty State
  {
    slug: 'ai-empty-state',
    name: 'AI Empty State',
    description:
      'First-run welcoming container introducing AI capabilities, sample prompts, and rapid starting templates.',
    categories: ['ai', 'patterns', 'empty'],
    roles: ['empty', 'onboarding'],
    purposes: ['first-run-assistance', 'prompt-discovery', 'empty-chat-welcome'],
    componentName: 'AIEmptyState',
    tags: ['ai', 'empty', 'welcome', 'samples', 'onboarding'],
    idealFor: [
      'New conversation blank slate',
      'AI workspace initial load',
      'Empty copilot container',
    ],
    avoidFor: ['Standard database error 500 alerts', 'Full tables'],
    jobs: ['Welcome users into AI interaction surfaces with guided starter suggestions'],
    indexCode: `import React from 'react';

export type AIEmptyStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIEmptyStateProps {
  variant?: AIEmptyStateVariant;
  onSelectPrompt?: (p: string) => void;
}

export function AIEmptyState({ variant = 'quiet', onSelectPrompt }: AIEmptyStateProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const starters = [
    { title: 'Compose B2B SaaS Dashboard', prompt: 'Create an analytics dashboard with KPI delta card, time series line chart, and audit log block.' },
    { title: 'Audit Color Contrast', prompt: 'Validate WCAG 2.2 AA token compliance across Quiet, Expressive, and Nocturne presets.' },
    { title: 'Export Standalone Vite App', prompt: 'Export workspace to a pure Vite + React + Tailwind 4 source tree.' },
  ];

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col items-center text-center gap-6 transition-colors \${cardBg}\`}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-neutral-100 dark:bg-neutral-800">
        ✦
      </div>

      <div className="max-w-md space-y-1.5">
        <h4 className="text-base font-semibold tracking-tight">How can Tessellate assist your build?</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Tessellate composes validated interface systems from canonical resources. Select a starter prompt below to begin:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left">
        {starters.map((s) => (
          <div
            key={s.title}
            onClick={() => onSelectPrompt?.(s.prompt)}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer transition-colors flex flex-col justify-between"
          >
            <div className="text-xs font-semibold mb-1 text-neutral-800 dark:text-neutral-200">{s.title}</div>
            <div className="text-[11px] text-neutral-500 leading-snug">{s.prompt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIEmptyState, AIEmptyStateVariant } from './index';

export function AIEmptyStatePreview() {
  const [variant, setVariant] = useState<AIEmptyStateVariant>('quiet');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <AIEmptyState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiEmptyStateFixtures = {};`,
    readmeCode: `# AI Empty State

First-run welcoming container introducing AI capabilities with starter prompts and template launchers.`,
  },
];
