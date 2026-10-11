import type { BlockDef } from './blocks-builder.js';

export const BLOCKS_BATCH_1: BlockDef[] = [
  // 1. Dashboard KPI Strip
  {
    slug: 'dashboard-kpi-strip',
    name: 'Dashboard KPI Strip',
    description: 'Horizontal metric row featuring primary metrics, deltas, and micro sparkline indicators.',
    categories: ['blocks', 'dashboards', 'kpi'],
    roles: ['dashboard', 'metrics'],
    purposes: ['Executive dashboards', 'Telemetry headers', 'Financial overviews'],
    componentName: 'DashboardKpiStrip',
    tags: ['dashboard-kpi-strip', 'kpi', 'metrics', 'dashboard'],
    idealFor: ['Summary telemetry across core product KPIs'],
    avoidFor: ['Lengthy narrative bodies'],
    jobs: ['Display high-level operational counts and trend percentages'],
    indexCode: `import React from 'react';

export type DashboardKpiStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DashboardKpiStripProps {
  variant?: DashboardKpiStripVariant;
  kpis?: Array<{ label: string; value: string; delta: string; positive?: boolean }>;
}

export function DashboardKpiStrip({
  variant = 'quiet',
  kpis = [
    { label: 'Active Sessions', value: '18,429', delta: '+12.4%', positive: true },
    { label: 'P99 Latency', value: '1.24 ms', delta: '-8.1%', positive: true },
    { label: 'Error Rate', value: '0.002%', delta: '-0.01%', positive: true },
    { label: 'Throughput', value: '4.8M req/s', delta: '+18.0%', positive: true },
  ],
}: DashboardKpiStripProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={\`w-full p-4 rounded-xl border transition-colors \${bg}\`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={\`p-4 rounded-lg border \${card}\`}>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1 block">{k.label}</span>
            <div className="text-2xl font-bold font-mono tracking-tight mb-1">{k.value}</div>
            <span className={\`text-xs font-semibold \${k.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}\`}>
              {k.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DashboardKpiStrip, DashboardKpiStripVariant } from './index.js';

export function DashboardKpiStripPreview() {
  const [variant, setVariant] = useState<DashboardKpiStripVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Dashboard KPI Strip Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as DashboardKpiStripVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <DashboardKpiStrip variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const dashboardKpiStripFixtures = {};`,
    readmeCode: `# Dashboard KPI Strip

Horizontal metric strip with trend deltas and compact data density.`,
  },

  // 2. Dashboard KPI Grid
  {
    slug: 'dashboard-kpi-grid',
    name: 'Dashboard KPI Grid',
    description: 'Multi-column grid of key performance cards with visual trend indicators and contextual meta.',
    categories: ['blocks', 'dashboards', 'kpi'],
    roles: ['dashboard', 'grid'],
    purposes: ['Analytical command centres', 'Operational dashboards'],
    componentName: 'DashboardKpiGrid',
    tags: ['dashboard-kpi-grid', 'kpi', 'grid', 'metrics'],
    idealFor: ['Dashboards requiring 6+ core operational metrics'],
    avoidFor: ['Minimal single-metric headers'],
    jobs: ['Organize dense metric arrays with consistent visual weight'],
    indexCode: `import React from 'react';

export type DashboardKpiGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DashboardKpiGridProps {
  variant?: DashboardKpiGridVariant;
}

export function DashboardKpiGrid({ variant = 'quiet' }: DashboardKpiGridProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  const cards = [
    { label: 'Active Clusters', val: '48', status: 'Healthy' },
    { label: 'Sync Latency', val: '12ms', status: 'Optimal' },
    { label: 'Replica Count', val: '144', status: 'Balanced' },
    { label: 'Memory Util', val: '42.1%', status: 'Nominal' },
    { label: 'CPU Load', val: '28.4%', status: 'Nominal' },
    { label: 'Storage Free', val: '8.4 TB', status: '82% free' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Cluster Operational Health</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={\`p-4 rounded-lg border \${card}\`}>
            <span className="text-[11px] font-mono uppercase text-neutral-500 mb-1 block">{c.label}</span>
            <div className="text-2xl font-bold font-mono tracking-tight mb-2">{c.val}</div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DashboardKpiGrid, DashboardKpiGridVariant } from './index.js';

export function DashboardKpiGridPreview() {
  const [variant, setVariant] = useState<DashboardKpiGridVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Dashboard KPI Grid Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as DashboardKpiGridVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <DashboardKpiGrid variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const dashboardKpiGridFixtures = {};`,
    readmeCode: `# Dashboard KPI Grid

Grid layout accommodating multiple operational telemetry metrics.`,
  },

  // 3. Executive Summary Panel
  {
    slug: 'executive-summary-panel',
    name: 'Executive Summary Panel',
    description: 'High-level synthesis card summarizing critical alerts, key wins, and risk flags.',
    categories: ['blocks', 'dashboards', 'summary'],
    roles: ['dashboard', 'executive'],
    purposes: ['C-level briefings', 'Weekly review summaries'],
    componentName: 'ExecutiveSummaryPanel',
    tags: ['executive-summary-panel', 'summary', 'executive', 'briefing'],
    idealFor: ['Executive briefing views and high-level team summaries'],
    avoidFor: ['Raw event log feeds'],
    jobs: ['Synthesize multi-source information into a crisp executive briefing'],
    indexCode: `import React from 'react';

export type ExecutiveSummaryPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ExecutiveSummaryPanelProps {
  variant?: ExecutiveSummaryPanelVariant;
}

export function ExecutiveSummaryPanel({ variant = 'quiet' }: ExecutiveSummaryPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <span className="font-bold text-sm">Executive Operations Briefing</span>
        <span className="text-[11px] font-mono opacity-60">Q3 Week 42</span>
      </div>
      <p className="text-xs sm:text-sm opacity-80 leading-relaxed mb-6">
        All telemetry targets exceeded baseline parameters. API traffic increased by 18.4% week-on-week with zero security anomalies detected.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={\`p-3 rounded-lg border text-xs \${card}\`}>
          <div className="font-semibold mb-1">Key Win</div>
          <div className="opacity-75">100% uptime sustained across all edge nodes.</div>
        </div>
        <div className={\`p-3 rounded-lg border text-xs \${card}\`}>
          <div className="font-semibold mb-1">Attention</div>
          <div className="opacity-75">Storage tier reaching 82% capacity threshold.</div>
        </div>
        <div className={\`p-3 rounded-lg border text-xs \${card}\`}>
          <div className="font-semibold mb-1">Action Required</div>
          <div className="opacity-75">Approve Q4 capacity reservation expansion.</div>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ExecutiveSummaryPanel, ExecutiveSummaryPanelVariant } from './index.js';

export function ExecutiveSummaryPanelPreview() {
  const [variant, setVariant] = useState<ExecutiveSummaryPanelVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Executive Summary Panel Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ExecutiveSummaryPanelVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ExecutiveSummaryPanel variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const executiveSummaryPanelFixtures = {};`,
    readmeCode: `# Executive Summary Panel

High-level briefing panel condensing wins, risks, and next actions.`,
  },

  // 4. Activity Feed
  {
    slug: 'activity-feed',
    name: 'Activity Feed',
    description: 'Chronological timeline of system events, team actions, and commit updates.',
    categories: ['blocks', 'dashboards', 'activity'],
    roles: ['dashboard', 'feed'],
    purposes: ['Team collaboration streams', 'Audit history previews'],
    componentName: 'ActivityFeed',
    tags: ['activity-feed', 'timeline', 'feed', 'audit'],
    idealFor: ['Observing continuous team and agent activity in a workspace'],
    avoidFor: ['Complex multi-tier dashboards without recent events'],
    jobs: ['Display streaming chronological events with user avatars and timestamps'],
    indexCode: `import React from 'react';

export type ActivityFeedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ActivityFeedProps {
  variant?: ActivityFeedVariant;
}

export function ActivityFeed({ variant = 'quiet' }: ActivityFeedProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const events = [
    { user: 'Elena R.', action: 'published revision 1.0.4', time: '12m ago' },
    { user: 'Agent Antigravity', action: 'validated 72 marketing sections', time: '44m ago' },
    { user: 'Marcus V.', action: 'merged pull request #142', time: '2h ago' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Workspace Activity Feed</h3>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.user + e.time} className="flex items-center justify-between text-xs py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
            <div className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-full bg-neutral-300 dark:bg-neutral-700 font-bold flex items-center justify-center text-[10px]">
                {e.user.charAt(0)}
              </span>
              <span><strong>{e.user}</strong> {e.action}</span>
            </div>
            <span className="font-mono opacity-50 text-[11px]">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ActivityFeed, ActivityFeedVariant } from './index.js';

export function ActivityFeedPreview() {
  const [variant, setVariant] = useState<ActivityFeedVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Activity Feed Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ActivityFeedVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ActivityFeed variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const activityFeedFixtures = {};`,
    readmeCode: `# Activity Feed

Chronological activity stream showing user and agent workspace actions.`,
  },

  // 5. Notification Centre
  {
    slug: 'notification-centre',
    name: 'Notification Centre',
    description: 'Alert and message stream with dismiss actions, read status toggles, and filters.',
    categories: ['blocks', 'dashboards', 'notifications'],
    roles: ['dashboard', 'notifications'],
    purposes: ['In-app alerts', 'System event notifications'],
    componentName: 'NotificationCentre',
    tags: ['notification-centre', 'notifications', 'alerts', 'inbox'],
    idealFor: ['Workspace notification popouts and inboxes'],
    avoidFor: ['Public marketing landing pages'],
    jobs: ['Allow users to review, filter, and acknowledge operational alerts'],
    indexCode: `import React, { useState } from 'react';

export type NotificationCentreVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NotificationCentreProps {
  variant?: NotificationCentreVariant;
}

export function NotificationCentre({ variant = 'quiet' }: NotificationCentreProps) {
  const [items, setItems] = useState([
    { id: 1, title: 'Build Succeeded', time: '2m ago', read: false },
    { id: 2, title: 'Token Threshold Exceeded', time: '1h ago', read: false },
    { id: 3, title: 'New Member Joined Team', time: '1d ago', read: true },
  ]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-semibold">Notification Centre</h3>
        <button type="button" onClick={markAllRead} className="text-xs text-neutral-500 hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {!it.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
              <span className={it.read ? 'opacity-60' : 'font-semibold'}>{it.title}</span>
            </div>
            <span className="font-mono text-[11px] opacity-50">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { NotificationCentre, NotificationCentreVariant } from './index.js';

export function NotificationCentrePreview() {
  const [variant, setVariant] = useState<NotificationCentreVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Notification Centre Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as NotificationCentreVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <NotificationCentre variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const notificationCentreFixtures = {};`,
    readmeCode: `# Notification Centre

Interactive notification panel with read/unread statuses and batch acknowledgement.`,
  },

  // 6. Quick Actions Panel
  {
    slug: 'quick-actions-panel',
    name: 'Quick Actions Panel',
    description: 'Grid of immediate high-frequency operational triggers and shortcut launchers.',
    categories: ['blocks', 'dashboards', 'actions'],
    roles: ['dashboard', 'quick-actions'],
    purposes: ['Workflow shortcuts', 'Frequent tasks'],
    componentName: 'QuickActionsPanel',
    tags: ['quick-actions-panel', 'shortcuts', 'actions', 'launchers'],
    idealFor: ['Home screens with frequent administrative triggers'],
    avoidFor: ['Passive read-only reports'],
    jobs: ['Provide one-click action buttons for primary workflow commands'],
    indexCode: `import React from 'react';

export type QuickActionsPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface QuickActionsPanelProps {
  variant?: QuickActionsPanelVariant;
}

export function QuickActionsPanel({ variant = 'quiet' }: QuickActionsPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let btn = 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    btn = 'bg-white hover:border-[#2547E8] border-neutral-200 text-neutral-900 shadow-2xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    btn = 'bg-[#151921] hover:border-cyan-400 border-[#2E3440] text-neutral-200';
  }

  const actions = [
    { label: 'New Project', icon: '+' },
    { label: 'Import Schema', icon: '↓' },
    { label: 'Run DNA Audit', icon: '⚡' },
    { label: 'Export Code', icon: '↗' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            className={\`p-4 rounded-lg border flex flex-col items-center justify-center text-center transition-all \${btn}\`}
          >
            <span className="text-base font-bold mb-1">{a.icon}</span>
            <span className="text-xs font-semibold">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { QuickActionsPanel, QuickActionsPanelVariant } from './index.js';

export function QuickActionsPanelPreview() {
  const [variant, setVariant] = useState<QuickActionsPanelVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Quick Actions Panel Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as QuickActionsPanelVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <QuickActionsPanel variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const quickActionsPanelFixtures = {};`,
    readmeCode: `# Quick Actions Panel

Button grid providing instant execution shortcuts for common commands.`,
  },

  // 7. Recent Items
  {
    slug: 'recent-items',
    name: 'Recent Items',
    description: 'List of recently modified files, projects, or manifests with timestamp and author.',
    categories: ['blocks', 'dashboards', 'navigation'],
    roles: ['dashboard', 'recent'],
    purposes: ['Fast file resumption', 'Recent history overview'],
    componentName: 'RecentItems',
    tags: ['recent-items', 'recents', 'history', 'files'],
    idealFor: ['Workspace launchers and file manager sidebars'],
    avoidFor: ['Empty state dashboards'],
    jobs: ['Let user jump back into recent work with one click'],
    indexCode: `import React from 'react';

export type RecentItemsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RecentItemsProps {
  variant?: RecentItemsVariant;
}

export function RecentItems({ variant = 'quiet' }: RecentItemsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { name: 'Analytics Dashboard Blueprint', type: 'Blueprint', time: '14m ago' },
    { name: 'Nocturne Trading Terminal', type: 'Showcase', time: '2h ago' },
    { name: 'Pricing Three Tier Component', type: 'Section', time: '1d ago' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Recent Documents</h3>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.name} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <div>
              <div className="font-semibold">{it.name}</div>
              <span className="text-[10px] font-mono opacity-50 uppercase">{it.type}</span>
            </div>
            <span className="font-mono text-[11px] opacity-60">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { RecentItems, RecentItemsVariant } from './index.js';

export function RecentItemsPreview() {
  const [variant, setVariant] = useState<RecentItemsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Recent Items Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as RecentItemsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <RecentItems variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const recentItemsFixtures = {};`,
    readmeCode: `# Recent Items

List of recently accessed documents and blueprints for swift resumption.`,
  },

  // 8. Pinned Items
  {
    slug: 'pinned-items',
    name: 'Pinned Items',
    description: 'User-favorited resources and project bookmarks with quick unpin toggles.',
    categories: ['blocks', 'dashboards', 'favorites'],
    roles: ['dashboard', 'pinned'],
    purposes: ['Bookmarked components', 'Priority project access'],
    componentName: 'PinnedItems',
    tags: ['pinned-items', 'favorites', 'bookmarks', 'pinned'],
    idealFor: ['Personalized developer workspaces and project hubs'],
    avoidFor: ['Unauthenticated anonymous sessions without local storage'],
    jobs: ['Keep essential resources immediately reachable at the top of the workspace'],
    indexCode: `import React from 'react';

export type PinnedItemsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PinnedItemsProps {
  variant?: PinnedItemsVariant;
}

export function PinnedItems({ variant = 'quiet' }: PinnedItemsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/60';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-2xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  const pinned = [
    { title: 'Core Design DNA Palette', desc: 'Active project palette: Nocturne Cyber' },
    { title: 'Executive Admin Shell', desc: 'Canonical 3-pane responsive container' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Pinned Workspaces</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pinned.map((p) => (
          <div key={p.title} className={\`p-4 rounded-lg border \${card}\`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs">{p.title}</span>
              <span className="text-amber-500 text-xs">★</span>
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PinnedItems, PinnedItemsVariant } from './index.js';

export function PinnedItemsPreview() {
  const [variant, setVariant] = useState<PinnedItemsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pinned Items Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PinnedItemsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <PinnedItems variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const pinnedItemsFixtures = {};`,
    readmeCode: `# Pinned Items

Card block showcasing favorited workspaces with unpin triggers.`,
  },

  // 9. Watchlist Panel
  {
    slug: 'watchlist-panel',
    name: 'Watchlist Panel',
    description: 'Monitored entities or stocks table with streaming value fluctuations and alert bells.',
    categories: ['blocks', 'dashboards', 'finance'],
    roles: ['dashboard', 'watchlist'],
    purposes: ['Financial tickers', 'Monitored server health'],
    componentName: 'WatchlistPanel',
    tags: ['watchlist-panel', 'finance', 'watchlist', 'ticker'],
    idealFor: ['Trading terminals and systems monitoring real-time ticker data'],
    avoidFor: ['Static document pages'],
    jobs: ['Display tracked entities with live price and percentage changes'],
    indexCode: `import React from 'react';

export type WatchlistPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WatchlistPanelProps {
  variant?: WatchlistPanelVariant;
}

export function WatchlistPanel({ variant = 'quiet' }: WatchlistPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const list = [
    { symbol: 'TSLA.US', price: '$248.50', delta: '+3.2%' },
    { symbol: 'NVDA.US', price: '$128.90', delta: '+1.8%' },
    { symbol: 'AAPL.US', price: '$224.10', delta: '-0.4%' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Entity Watchlist</h3>
      <div className="space-y-3 font-mono text-xs">
        {list.map((item) => (
          <div key={item.symbol} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="font-bold">{item.symbol}</span>
            <div className="flex items-center gap-4">
              <span>{item.price}</span>
              <span className={item.delta.startsWith('+') ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {item.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { WatchlistPanel, WatchlistPanelVariant } from './index.js';

export function WatchlistPanelPreview() {
  const [variant, setVariant] = useState<WatchlistPanelVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Watchlist Panel Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as WatchlistPanelVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <WatchlistPanel variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const watchlistPanelFixtures = {};`,
    readmeCode: `# Watchlist Panel

Monitored entity panel displaying streaming price deltas and ticker changes.`,
  },

  // 10. Status Overview
  {
    slug: 'status-overview',
    name: 'Status Overview',
    description: 'System health dashboard block tracking services, regional latency, and incident reports.',
    categories: ['blocks', 'dashboards', 'status'],
    roles: ['dashboard', 'health'],
    purposes: ['Infrastructure uptime', 'Service status'],
    componentName: 'StatusOverview',
    tags: ['status-overview', 'status', 'health', 'uptime'],
    idealFor: ['Internal operations dashboards and public status pages'],
    avoidFor: ['Casual marketing features'],
    jobs: ['Report status across distributed cloud services'],
    indexCode: `import React from 'react';

export type StatusOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StatusOverviewProps {
  variant?: StatusOverviewVariant;
}

export function StatusOverview({ variant = 'quiet' }: StatusOverviewProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const services = [
    { name: 'Core Engine API', status: 'Operational', latency: '1.2ms' },
    { name: 'Registry Edge Cache', status: 'Operational', latency: '0.4ms' },
    { name: 'Authentication OAuth', status: 'Operational', latency: '12ms' },
    { name: 'AST Code Generator', status: 'Operational', latency: '3.1ms' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-semibold">Service Health</h3>
        <span className="text-xs text-emerald-600 font-mono font-bold">100% OPERATIONAL</span>
      </div>
      <div className="space-y-3 font-mono text-xs">
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{s.name}</span>
            </div>
            <span className="opacity-60">{s.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { StatusOverview, StatusOverviewVariant } from './index.js';

export function StatusOverviewPreview() {
  const [variant, setVariant] = useState<StatusOverviewVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Status Overview Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as StatusOverviewVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <StatusOverview variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const statusOverviewFixtures = {};`,
    readmeCode: `# Status Overview

Service health monitor block reporting latency metrics and operational states.`,
  },

  // 11. Advanced Data Table
  {
    slug: 'advanced-data-table',
    name: 'Advanced Data Table',
    description: 'Feature-rich data table with column sorting, checkbox selection, pagination, and filter bar.',
    categories: ['blocks', 'data', 'tables'],
    roles: ['table', 'advanced'],
    purposes: ['Enterprise data management', 'Complex entity inspection'],
    componentName: 'AdvancedDataTable',
    tags: ['advanced-data-table', 'table', 'data-table', 'sorting'],
    idealFor: ['Data-heavy administrative workspaces'],
    avoidFor: ['Mobile-only vertical cards'],
    jobs: ['Support column sorting, multi-row selection, and structured records'],
    indexCode: `import React, { useState } from 'react';

export type AdvancedDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AdvancedDataTableProps {
  variant?: AdvancedDataTableVariant;
}

export function AdvancedDataTable({ variant = 'quiet' }: AdvancedDataTableProps) {
  const [selected, setSelected] = useState<number[]>([]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = [
    { id: 1, name: 'button', type: 'primitive', quality: 98, status: 'verified' },
    { id: 2, name: 'editorial-hero', type: 'section', quality: 96, status: 'verified' },
    { id: 3, name: 'admin-console-shell', type: 'block', quality: 96, status: 'verified' },
  ];

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className={\`w-full rounded-xl border overflow-hidden transition-colors \${bg}\`}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs">
        <span className="font-semibold">{selected.length} row(s) selected</span>
        <button type="button" className="px-3 py-1 rounded border font-mono">Filter</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="p-3 w-8">#</th>
              <th className="p-3">Resource Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Quality</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggle(r.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-3 font-semibold font-sans">{r.name}</td>
                <td className="p-3 opacity-75">{r.type}</td>
                <td className="p-3 text-emerald-600 font-bold">{r.quality}/100</td>
                <td className="p-3 uppercase text-[10px]">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AdvancedDataTable, AdvancedDataTableVariant } from './index.js';

export function AdvancedDataTablePreview() {
  const [variant, setVariant] = useState<AdvancedDataTableVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Advanced Data Table Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as AdvancedDataTableVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <AdvancedDataTable variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const advancedDataTableFixtures = {};`,
    readmeCode: `# Advanced Data Table

Full-featured data table with row selection, type tags, and sorting support.`,
  },

  // 12. Compact Data Table
  {
    slug: 'compact-data-table',
    name: 'Compact Data Table',
    description: 'High-density tabular list designed for tight panels and real-time feeds.',
    categories: ['blocks', 'data', 'tables'],
    roles: ['table', 'compact'],
    purposes: ['High density dashboards', 'Sidebar records'],
    componentName: 'CompactDataTable',
    tags: ['compact-data-table', 'compact', 'table', 'density'],
    idealFor: ['Tight sidebars and data-dense secondary panes'],
    avoidFor: ['Large touch-screen kiosk displays'],
    jobs: ['Maximize row count in confined vertical spaces'],
    indexCode: `import React from 'react';

export type CompactDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CompactDataTableProps {
  variant?: CompactDataTableVariant;
}

export function CompactDataTable({ variant = 'quiet' }: CompactDataTableProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { key: 'CPU-0', load: '18%', temp: '42°C' },
    { key: 'CPU-1', load: '24%', temp: '44°C' },
    { key: 'CPU-2', load: '12%', temp: '40°C' },
    { key: 'CPU-3', load: '82%', temp: '58°C' },
  ];

  return (
    <div className={\`w-full rounded-xl border overflow-hidden font-mono text-[11px] transition-colors \${bg}\`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="px-3 py-1.5">Core</th>
            <th className="px-3 py-1.5">Utilization</th>
            <th className="px-3 py-1.5">Temp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
          {items.map((it) => (
            <tr key={it.key} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
              <td className="px-3 py-1.5 font-bold">{it.key}</td>
              <td className="px-3 py-1.5">{it.load}</td>
              <td className="px-3 py-1.5 opacity-70">{it.temp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CompactDataTable, CompactDataTableVariant } from './index.js';

export function CompactDataTablePreview() {
  const [variant, setVariant] = useState<CompactDataTableVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Compact Data Table Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CompactDataTableVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <CompactDataTable variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const compactDataTableFixtures = {};`,
    readmeCode: `# Compact Data Table

Condensed tabular format for telemetry logs and sidebar inspectors.`,
  },

  // 13. Expandable Data Table
  {
    slug: 'expandable-data-table',
    name: 'Expandable Data Table',
    description: 'Data grid where each row expands to reveal detailed sub-attributes or nested logs.',
    categories: ['blocks', 'data', 'tables'],
    roles: ['table', 'expandable'],
    purposes: ['Nested record inspection', 'Multi-level data browsing'],
    componentName: 'ExpandableDataTable',
    tags: ['expandable-data-table', 'expandable', 'nested', 'table'],
    idealFor: ['Viewing records with auxiliary telemetry details'],
    avoidFor: ['Pure flat lists'],
    jobs: ['Permit inline row expansion without navigating away from table'],
    indexCode: `import React, { useState } from 'react';

export type ExpandableDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ExpandableDataTableProps {
  variant?: ExpandableDataTableVariant;
}

export function ExpandableDataTable({ variant = 'quiet' }: ExpandableDataTableProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = [
    { id: 1, name: 'Ingestion Cluster A', region: 'us-east-1', details: '12 active replicas. Last rebalanced 4m ago.' },
    { id: 2, name: 'Edge Gateway B', region: 'eu-west-1', details: 'Serving TLS 1.3 traffic. Zero dropped packets.' },
  ];

  return (
    <div className={\`w-full rounded-xl border overflow-hidden text-xs transition-colors \${bg}\`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
          <tr>
            <th className="p-3 w-8"></th>
            <th className="p-3">Cluster Name</th>
            <th className="p-3">Region</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {rows.map((r) => (
            <React.Fragment key={r.id}>
              <tr
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 cursor-pointer"
              >
                <td className="p-3 text-neutral-400 font-mono">{expanded === r.id ? '▼' : '▶'}</td>
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3 font-mono opacity-70">{r.region}</td>
              </tr>
              {expanded === r.id && (
                <tr className="bg-neutral-50/50 dark:bg-neutral-900/30">
                  <td colSpan={3} className="p-4 pl-10 text-xs opacity-75 font-mono">
                    {r.details}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ExpandableDataTable, ExpandableDataTableVariant } from './index.js';

export function ExpandableDataTablePreview() {
  const [variant, setVariant] = useState<ExpandableDataTableVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Expandable Data Table Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ExpandableDataTableVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ExpandableDataTable variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const expandableDataTableFixtures = {};`,
    readmeCode: `# Expandable Data Table

Table supporting expandable sub-rows revealing nested telemetry data.`,
  },

  // 14. Grouped Data Table
  {
    slug: 'grouped-data-table',
    name: 'Grouped Data Table',
    description: 'Table with hierarchical category headers grouping related entity records.',
    categories: ['blocks', 'data', 'tables'],
    roles: ['table', 'grouped'],
    purposes: ['Categorized inventory', 'Multi-tenant listings'],
    componentName: 'GroupedDataTable',
    tags: ['grouped-data-table', 'grouped', 'table', 'categories'],
    idealFor: ['Viewing records segmented by project or department'],
    avoidFor: ['Small 2-row tables'],
    jobs: ['Group related rows under distinct section header dividers'],
    indexCode: `import React from 'react';

export type GroupedDataTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GroupedDataTableProps {
  variant?: GroupedDataTableVariant;
}

export function GroupedDataTable({ variant = 'quiet' }: GroupedDataTableProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const groups = [
    {
      category: 'Primitives',
      items: [
        { name: 'Button', slug: 'button', size: '1.2 KB' },
        { name: 'Input', slug: 'input', size: '1.4 KB' },
      ],
    },
    {
      category: 'Shells',
      items: [
        { name: 'Minimal Top Nav', slug: 'minimal-top-nav', size: '2.8 KB' },
      ],
    },
  ];

  return (
    <div className={\`w-full rounded-xl border overflow-hidden text-xs transition-colors \${bg}\`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
          <tr>
            <th className="p-3">Resource</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Gzip Size</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <React.Fragment key={g.category}>
              <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-mono font-bold text-[10px] uppercase text-neutral-500">
                <td colSpan={3} className="px-3 py-2">{g.category}</td>
              </tr>
              {g.items.map((it) => (
                <tr key={it.slug} className="border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50/50">
                  <td className="p-3 font-semibold">{it.name}</td>
                  <td className="p-3 font-mono opacity-70">{it.slug}</td>
                  <td className="p-3 font-mono opacity-70">{it.size}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { GroupedDataTable, GroupedDataTableVariant } from './index.js';

export function GroupedDataTablePreview() {
  const [variant, setVariant] = useState<GroupedDataTableVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Grouped Data Table Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as GroupedDataTableVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <GroupedDataTable variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const groupedDataTableFixtures = {};`,
    readmeCode: `# Grouped Data Table

Table grouping entity rows under category divider headers.`,
  },

  // 15. Comparison Table
  {
    slug: 'comparison-table',
    name: 'Comparison Table',
    description: 'Matrix comparing parameters or feature sets across multiple items side by side.',
    categories: ['blocks', 'data', 'comparison'],
    roles: ['table', 'comparison'],
    purposes: ['Parameter benchmarking', 'Item comparison'],
    componentName: 'ComparisonTable',
    tags: ['comparison-table', 'comparison', 'matrix', 'benchmark'],
    idealFor: ['Comparing two or three alternative models or configurations'],
    avoidFor: ['Single item detail views'],
    jobs: ['Side-by-side comparative inspection of entity specs'],
    indexCode: `import React from 'react';

export type ComparisonTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ComparisonTableProps {
  variant?: ComparisonTableVariant;
}

export function ComparisonTable({ variant = 'quiet' }: ComparisonTableProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const rows = [
    { metric: 'Gzip Size', modelA: '1.2 KB', modelB: '4.8 KB' },
    { metric: 'Parsing Speed', modelA: '0.4 ms', modelB: '2.1 ms' },
    { metric: 'Dependencies', modelA: '0 external', modelB: '4 libraries' },
  ];

  return (
    <div className={\`w-full rounded-xl border overflow-hidden text-xs transition-colors \${bg}\`}>
      <table className="w-full text-left">
        <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
          <tr>
            <th className="p-3">Specification</th>
            <th className="p-3">Tessellate Pure</th>
            <th className="p-3">Generic Alternative</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
          {rows.map((r) => (
            <tr key={r.metric} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
              <td className="p-3 font-semibold font-sans">{r.metric}</td>
              <td className="p-3 text-emerald-600 font-bold">{r.modelA}</td>
              <td className="p-3 opacity-60">{r.modelB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ComparisonTable, ComparisonTableVariant } from './index.js';

export function ComparisonTablePreview() {
  const [variant, setVariant] = useState<ComparisonTableVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Comparison Table Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ComparisonTableVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ComparisonTable variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const comparisonTableFixtures = {};`,
    readmeCode: `# Comparison Table

Side-by-side comparison matrix evaluating metrics between multiple choices.`,
  },

  // 16. Entity List
  {
    slug: 'entity-list',
    name: 'Entity List',
    description: 'Clean vertical item list with avatar/status, main description, and quick menu trigger.',
    categories: ['blocks', 'data', 'lists'],
    roles: ['list', 'entities'],
    purposes: ['User listings', 'Team directories', 'Resource browsing'],
    componentName: 'EntityList',
    tags: ['entity-list', 'list', 'entities', 'directory'],
    idealFor: ['Displaying user or team listings cleanly'],
    avoidFor: ['Complex relational databases requiring 10 columns'],
    jobs: ['Render vertical entity cards with avatar, title, and action menu'],
    indexCode: `import React from 'react';

export type EntityListVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityListProps {
  variant?: EntityListVariant;
}

export function EntityList({ variant = 'quiet' }: EntityListProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const entities = [
    { name: 'Sarah Connor', role: 'Security Architect', status: 'Online' },
    { name: 'Miles Dyson', role: 'Systems Engineer', status: 'Offline' },
    { name: 'John Croft', role: 'Product Lead', status: 'In Meeting' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Team Directory</h3>
      <div className="space-y-3">
        {entities.map((e) => (
          <div key={e.name} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 font-bold flex items-center justify-center">
                {e.name.charAt(0)}
              </span>
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-[11px] opacity-60">{e.role}</div>
              </div>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EntityList, EntityListVariant } from './index.js';

export function EntityListPreview() {
  const [variant, setVariant] = useState<EntityListVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Entity List Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as EntityListVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <EntityList variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const entityListFixtures = {};`,
    readmeCode: `# Entity List

Vertical entity row list with avatar representation and role meta.`,
  },

  // 17. Kanban Board
  {
    slug: 'kanban-board',
    name: 'Kanban Board',
    description: 'Multi-column task board with status lanes (Todo, In Progress, Done) and draggable cards.',
    categories: ['blocks', 'data', 'planning'],
    roles: ['kanban', 'board'],
    purposes: ['Sprint planning', 'Task management'],
    componentName: 'KanbanBoard',
    tags: ['kanban-board', 'kanban', 'board', 'tasks'],
    idealFor: ['Task and ticket organization by development status'],
    avoidFor: ['Dense tabular calculations'],
    jobs: ['Group task cards into status lanes'],
    indexCode: `import React from 'react';

export type KanbanBoardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KanbanBoardProps {
  variant?: KanbanBoardVariant;
}

export function KanbanBoard({ variant = 'quiet' }: KanbanBoardProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let lane = 'bg-neutral-50/60 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-2xs';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    lane = 'bg-white border-blue-100 shadow-xs';
    card = 'bg-neutral-50/50 border-neutral-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    lane = 'bg-[#151921] border-[#2E3440]';
    card = 'bg-[#0E1217] border-[#2E3440]';
  }

  const columns = [
    { title: 'Backlog', tasks: ['Audit contrast on Nocturne tokens', 'Generate OpenAPI spec'] },
    { title: 'In Progress', tasks: ['Scale 56 application blocks'] },
    { title: 'Complete', tasks: ['72 Marketing sections verified', '44 Primitives complete'] },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border overflow-x-auto transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-6">Task Board</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[600px]">
        {columns.map((col) => (
          <div key={col.title} className={\`p-4 rounded-xl border flex flex-col gap-3 \${lane}\`}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>{col.title}</span>
              <span className="font-mono text-[10px] opacity-60">({col.tasks.length})</span>
            </div>
            {col.tasks.map((task) => (
              <div key={task} className={\`p-3 rounded-lg border text-xs \${card}\`}>
                <span className="font-medium">{task}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { KanbanBoard, KanbanBoardVariant } from './index.js';

export function KanbanBoardPreview() {
  const [variant, setVariant] = useState<KanbanBoardVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Kanban Board Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as KanbanBoardVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <KanbanBoard variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const kanbanBoardFixtures = {};`,
    readmeCode: `# Kanban Board

Status-column task board for managing issues and agile workflow sprints.`,
  },

  // 18. Timeline
  {
    slug: 'timeline',
    name: 'Timeline',
    description: 'Chronological event list with vertical connecting line and timestamp nodes.',
    categories: ['blocks', 'data', 'planning'],
    roles: ['timeline', 'events'],
    purposes: ['Milestone tracking', 'Historical event logging'],
    componentName: 'Timeline',
    tags: ['timeline', 'chronology', 'events', 'milestones'],
    idealFor: ['Displaying ordered project milestones and commit logs'],
    avoidFor: ['Categorical non-time-based lists'],
    jobs: ['Map out sequential milestones along a connected line'],
    indexCode: `import React from 'react';

export type TimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TimelineProps {
  variant?: TimelineVariant;
}

export function Timeline({ variant = 'quiet' }: TimelineProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const events = [
    { time: '10:00 AM', title: 'System Deploy', desc: 'Released version 1.0.0 to edge nodes.' },
    { time: '11:30 AM', title: 'Catalog Synced', desc: 'All 324 manifests validated and compiled.' },
    { time: '02:00 PM', title: 'Security Audit', desc: 'Passed automated WCAG AA accessibility tests.' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-6">Execution Timeline</h3>
      <div className="space-y-6 border-l-2 border-neutral-200 dark:border-neutral-800 ml-3 pl-6">
        {events.map((e) => (
          <div key={e.title} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-neutral-900 dark:bg-white" />
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-0.5">{e.time}</span>
            <div className="font-semibold text-xs mb-0.5">{e.title}</div>
            <p className="text-[11px] opacity-75">{e.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { Timeline, TimelineVariant } from './index.js';

export function TimelinePreview() {
  const [variant, setVariant] = useState<TimelineVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Timeline Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as TimelineVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <Timeline variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const timelineFixtures = {};`,
    readmeCode: `# Timeline

Vertical connecting timeline displaying timestamped project events.`,
  },

  // 19. Calendar Month
  {
    slug: 'calendar-month',
    name: 'Calendar Month',
    description: 'Monthly 7x5 grid view with day numbers, event markers, and active date highlights.',
    categories: ['blocks', 'data', 'calendar'],
    roles: ['calendar', 'month'],
    purposes: ['Event scheduling', 'Monthly capacity planning'],
    componentName: 'CalendarMonth',
    tags: ['calendar-month', 'calendar', 'month', 'schedule'],
    idealFor: ['Full-month event and sprint scheduling interfaces'],
    avoidFor: ['Simple time picker inputs'],
    jobs: ['Render monthly calendar grid with event badges'],
    indexCode: `import React from 'react';

export type CalendarMonthVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CalendarMonthProps {
  variant?: CalendarMonthVariant;
}

export function CalendarMonth({ variant = 'quiet' }: CalendarMonthProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">October 2026</h3>
        <span className="font-mono text-xs opacity-60">Month View</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="p-1 opacity-50 font-bold">{d}</div>
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={\`p-2 rounded text-[11px] \${day === 11 ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}\`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CalendarMonth, CalendarMonthVariant } from './index.js';

export function CalendarMonthPreview() {
  const [variant, setVariant] = useState<CalendarMonthVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Calendar Month Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CalendarMonthVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <CalendarMonth variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const calendarMonthFixtures = {};`,
    readmeCode: `# Calendar Month

Standard 31-day month grid with highlighted active dates and day headings.`,
  },

  // 20. Calendar Week
  {
    slug: 'calendar-week',
    name: 'Calendar Week',
    description: '7-column weekly schedule view displaying time slots and scheduled appointment cards.',
    categories: ['blocks', 'data', 'calendar'],
    roles: ['calendar', 'week'],
    purposes: ['Weekly team calendars', 'Meeting schedulers'],
    componentName: 'CalendarWeek',
    tags: ['calendar-week', 'calendar', 'week', 'schedule'],
    idealFor: ['Detailed week-at-a-glance scheduling views'],
    avoidFor: ['Multi-year roadmaps'],
    jobs: ['Display weekly schedule columns with scheduled slots'],
    indexCode: `import React from 'react';

export type CalendarWeekVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CalendarWeekProps {
  variant?: CalendarWeekVariant;
}

export function CalendarWeek({ variant = 'quiet' }: CalendarWeekProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let slot = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    slot = 'bg-blue-50 text-blue-900 border border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    slot = 'bg-[#151921] text-cyan-300 border border-[#2E3440]';
  }

  const days = ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16'];

  return (
    <div className={\`w-full p-6 rounded-xl border overflow-x-auto transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Weekly Schedule</h3>
      <div className="grid grid-cols-5 gap-3 min-w-[500px]">
        {days.map((d) => (
          <div key={d} className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-3">
            <span className="font-mono text-[11px] font-bold block mb-3 text-neutral-500">{d}</span>
            <div className={\`p-2 rounded text-[10px] font-semibold mb-2 \${slot}\`}>
              Design Review
            </div>
            <div className="text-[10px] opacity-40 font-mono">No other events</div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CalendarWeek, CalendarWeekVariant } from './index.js';

export function CalendarWeekPreview() {
  const [variant, setVariant] = useState<CalendarWeekVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Calendar Week Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CalendarWeekVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <CalendarWeek variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const calendarWeekFixtures = {};`,
    readmeCode: `# Calendar Week

Five-day weekly column view showing scheduled appointment slots.`,
  },

  // 21. Schedule Agenda
  {
    slug: 'schedule-agenda',
    name: 'Schedule Agenda',
    description: 'Linear agenda list of upcoming events sorted by time with location tags.',
    categories: ['blocks', 'data', 'calendar'],
    roles: ['agenda', 'schedule'],
    purposes: ['Daily agenda', 'Upcoming events'],
    componentName: 'ScheduleAgenda',
    tags: ['schedule-agenda', 'agenda', 'schedule', 'events'],
    idealFor: ['Personal daily schedules and conference agenda tracks'],
    avoidFor: ['Complex grid calendar representations'],
    jobs: ['Render ordered list of upcoming events with time and tag metadata'],
    indexCode: `import React from 'react';

export type ScheduleAgendaVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScheduleAgendaProps {
  variant?: ScheduleAgendaVariant;
}

export function ScheduleAgenda({ variant = 'quiet' }: ScheduleAgendaProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const events = [
    { time: '09:00 - 10:00', title: 'Architecture Standup', room: 'Room Alpha' },
    { time: '11:30 - 12:30', title: 'Catalog Verification Review', room: 'Main Stage' },
    { time: '14:00 - 15:00', title: 'Agent MCP Demo', room: 'Virtual Lab' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Today's Agenda</h3>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.title} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold">{e.title}</div>
              <span className="text-[10px] opacity-60">{e.room}</span>
            </div>
            <span className="font-mono text-[11px] opacity-75">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ScheduleAgenda, ScheduleAgendaVariant } from './index.js';

export function ScheduleAgendaPreview() {
  const [variant, setVariant] = useState<ScheduleAgendaVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Schedule Agenda Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ScheduleAgendaVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ScheduleAgenda variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const scheduleAgendaFixtures = {};`,
    readmeCode: `# Schedule Agenda

Linear event list presenting daily agenda items with times and locations.`,
  },
];
