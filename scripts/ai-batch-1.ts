import type { AIDef } from './ai-builder';

export const AI_BATCH_1: AIDef[] = [
  // 1. AI Chat Panel
  {
    slug: 'ai-chat-panel',
    name: 'AI Chat Panel',
    description: 'Multi-turn conversational AI message stream with role badges, markdown body, copy action, and input composer.',
    categories: ['ai', 'patterns', 'chat'],
    roles: ['chat', 'panel'],
    purposes: ['conversational-assistant', 'multi-turn-chat', 'prompt-execution'],
    componentName: 'AIChatPanel',
    tags: ['ai', 'chat', 'assistant', 'stream', 'messages'],
    idealFor: ['Interactive conversational copilot', 'Customer support assistance', 'Code troubleshooting companion'],
    avoidFor: ['Silent headless batch jobs', 'Static pricing tables'],
    jobs: ['Conduct multi-turn conversational interactions with clear role styling and actions'],
    indexCode: `import React, { useState } from 'react';

export type AIChatPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIChatPanelProps {
  variant?: AIChatPanelVariant;
}

export function AIChatPanel({ variant = 'quiet' }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'user', content: 'Can you optimize the SVG viewBox calculation for the TimeSeriesChart component?' },
    { role: 'assistant', content: 'Certainly. To make the chart fully responsive, normalize the padding and use a fixed aspect ratio viewBox of 600x220 with scalable path coordinates.' },
  ]);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const userBubble =
    variant === 'nocturne'
      ? 'bg-[#151921] border-[#2E3440] text-neutral-200'
      : variant === 'expressive'
      ? 'bg-neutral-100 border-neutral-200 text-neutral-900'
      : 'bg-neutral-50 border-neutral-200 text-neutral-900';

  const assistantBubble =
    variant === 'nocturne'
      ? 'bg-[#0F141C] border-cyan-900/50 text-cyan-50'
      : variant === 'expressive'
      ? 'bg-blue-50/50 border-blue-200 text-neutral-900'
      : 'bg-white border-neutral-200 text-neutral-900';

  const sendBtn =
    variant === 'nocturne'
      ? 'bg-cyan-500 text-black font-semibold hover:bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8] text-white font-medium hover:bg-blue-700'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: input.trim() },
      { role: 'assistant', content: \`Analyzed: "\${input.trim()}". Applied deterministic update with 0 dependencies.\` },
    ]);
    setInput('');
  };

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col justify-between min-h-[420px] transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-sm font-semibold tracking-tight">Tessellate Assistant</h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
            Claude 3.7 Sonnet
          </span>
        </div>
      </div>

      <div className="flex-1 py-4 space-y-4 overflow-y-auto">
        {messages.map((m, idx) => (
          <div key={idx} className={\`flex flex-col \${m.role === 'user' ? 'items-end' : 'items-start'}\`}>
            <div className="text-[10px] uppercase font-mono text-neutral-400 mb-1 px-1">
              {m.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div
              className={\`p-3.5 rounded-xl text-xs max-w-lg border leading-relaxed \${
                m.role === 'user' ? userBubble : assistantBubble
              }\`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to design, refine, or audit interface..."
          className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
        <button type="submit" className={\`px-4 py-2 text-xs rounded-lg transition-colors \${sendBtn}\`}>
          Send
        </button>
      </form>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIChatPanel, AIChatPanelVariant } from './index';

export function AIChatPanelPreview() {
  const [variant, setVariant] = useState<AIChatPanelVariant>('quiet');

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
      <AIChatPanel variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiChatPanelFixtures = {};`,
    readmeCode: `# AI Chat Panel

Multi-turn conversational AI message stream with role badges, markdown bubbles, and input composer.`,
  },

  // 2. AI Copilot Sidebar
  {
    slug: 'ai-copilot-sidebar',
    name: 'AI Copilot Sidebar',
    description: 'Collapsible contextual side pane providing real-time AI suggestions, file diffs, and inline run triggers.',
    categories: ['ai', 'patterns', 'sidebar'],
    roles: ['sidebar', 'copilot'],
    purposes: ['contextual-assistance', 'side-by-side-editing', 'code-review'],
    componentName: 'AICopilotSidebar',
    tags: ['ai', 'copilot', 'sidebar', 'dock', 'suggestions'],
    idealFor: ['IDE-style side workspace', 'Design editor copilot', 'Documentation authoring assistant'],
    avoidFor: ['Mobile bottom sheets with zero screen width', 'Modal confirmations'],
    jobs: ['Provide always-present contextual intelligence alongside the active document'],
    indexCode: `import React, { useState } from 'react';

export type AICopilotSidebarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AICopilotSidebarProps {
  variant?: AICopilotSidebarVariant;
}

export function AICopilotSidebar({ variant = 'quiet' }: AICopilotSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const actionBg =
    variant === 'nocturne'
      ? 'bg-[#151921] hover:bg-[#1E232E] border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-blue-50/50 hover:bg-blue-50 border-blue-200 text-blue-900'
      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200';

  return (
    <div className={\`w-full max-w-sm p-5 rounded-xl border flex flex-col gap-4 transition-all \${cardBg} \${collapsed ? 'h-16 overflow-hidden' : ''}\`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h4 className="text-sm font-semibold tracking-tight">Active Context Copilot</h4>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-neutral-400 hover:text-current font-mono"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="text-xs text-neutral-500 leading-relaxed">
            Inspecting <span className="font-mono text-neutral-800 dark:text-neutral-200 font-medium">DashboardView.tsx</span>. Found 2 token inconsistencies in border contrast.
          </div>

          <div className="space-y-2">
            <div className={\`p-3 rounded-lg border text-xs cursor-pointer transition-colors \${actionBg}\`}>
              <div className="font-medium mb-1">Fix border contrast token</div>
              <div className="text-[11px] text-neutral-500">Replaces hardcoded border-slate-300 with semantic border-border-default.</div>
            </div>
            <div className={\`p-3 rounded-lg border text-xs cursor-pointer transition-colors \${actionBg}\`}>
              <div className="font-medium mb-1">Add keyboard shortcuts</div>
              <div className="text-[11px] text-neutral-500">Registers ArrowUp / ArrowDown navigation for search table results.</div>
            </div>
          </div>

          <button className="w-full py-2 text-xs rounded-lg font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90">
            Apply All Recommended Fixes
          </button>
        </>
      )}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AICopilotSidebar, AICopilotSidebarVariant } from './index';

export function AICopilotSidebarPreview() {
  const [variant, setVariant] = useState<AICopilotSidebarVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <AICopilotSidebar variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiCopilotSidebarFixtures = {};`,
    readmeCode: `# AI Copilot Sidebar

Collapsible contextual copilot sidebar providing automated recommendations and one-click patch actions.`,
  },

  // 3. Floating AI Assistant
  {
    slug: 'floating-ai-assistant',
    name: 'Floating AI Assistant',
    description: 'Draggable or floating bottom-corner action launcher with modal conversation bubble and prompt chips.',
    categories: ['ai', 'patterns', 'floating'],
    roles: ['assistant', 'fab'],
    purposes: ['floating-assistant', 'ambient-support', 'quick-prompt'],
    componentName: 'FloatingAIAssistant',
    tags: ['ai', 'floating', 'fab', 'launcher', 'modal'],
    idealFor: ['Global web app ambient support trigger', 'In-app onboarding help', 'Documentation assistant pill'],
    avoidFor: ['Inline form field inputs', 'Narrow table cells'],
    jobs: ['Trigger fast AI modal help from anywhere in the application viewport'],
    indexCode: `import React, { useState } from 'react';

export type FloatingAIAssistantVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FloatingAIAssistantProps {
  variant?: FloatingAIAssistantVariant;
}

export function FloatingAIAssistant({ variant = 'quiet' }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-lg';

  const triggerBg =
    variant === 'nocturne'
      ? 'bg-cyan-500 text-black hover:bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8] text-white hover:bg-blue-700'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  return (
    <div className="relative inline-flex flex-col items-end">
      {isOpen && (
        <div className={\`w-80 p-4 rounded-xl border mb-3 flex flex-col gap-3 transition-all \${cardBg}\`}>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold">Tessellate Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-xs text-neutral-400 hover:text-current">
              ✕
            </button>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Need help selecting an archetype or generating tokens? Choose a quick question below:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Explain Design DNA', 'Check AA Contrast', 'Export Manifest'].map((chip) => (
              <button
                key={chip}
                className="text-[11px] px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={\`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-transform hover:scale-105 \${triggerBg}\`}
        aria-label="Toggle AI Assistant"
      >
        ✦
      </button>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FloatingAIAssistant, FloatingAIAssistantVariant } from './index';

export function FloatingAIAssistantPreview() {
  const [variant, setVariant] = useState<FloatingAIAssistantVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <div className="flex justify-end">
        <FloatingAIAssistant variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const floatingAIAssistantFixtures = {};`,
    readmeCode: `# Floating AI Assistant

Bottom-corner ambient action launcher with expand/collapse popover modal and quick prompt chips.`,
  },

  // 4. Inline AI Rewrite
  {
    slug: 'inline-ai-rewrite',
    name: 'Inline AI Rewrite',
    description: 'Inline text selection overlay offering tone adjustments, shortening, expansion, and diff acceptance.',
    categories: ['ai', 'patterns', 'inline'],
    roles: ['editor', 'rewrite'],
    purposes: ['copy-editing', 'tone-transformation', 'inline-generation'],
    componentName: 'InlineAIRewrite',
    tags: ['ai', 'inline', 'rewrite', 'diff', 'tone'],
    idealFor: ['Rich text editors', 'Markdown document writing', 'Customer response drafts'],
    avoidFor: ['Binary boolean flags', 'Pure numerical tables'],
    jobs: ['Refine selected prose inline with tone options and instant accept/reject diffs'],
    indexCode: `import React, { useState } from 'react';

export type InlineAIRewriteVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InlineAIRewriteProps {
  variant?: InlineAIRewriteVariant;
}

export function InlineAIRewrite({ variant = 'quiet' }: InlineAIRewriteProps) {
  const [tone, setTone] = useState<'concise' | 'professional' | 'energetic'>('concise');
  const [status, setStatus] = useState<'idle' | 'reviewed'>('reviewed');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const tones = ['concise', 'professional', 'energetic'] as const;

  const originalText = 'We have built a platform that enables teams to construct web applications quickly.';
  const rewrittenTexts = {
    concise: 'Tessellate accelerates interface construction through validated semantic resources.',
    professional: 'Tessellate equips engineering organizations with a deterministic system for composing high-fidelity software.',
    energetic: 'Ship stunning, production-ready interfaces instantly with Tessellate’s open resource vocabulary!',
  };

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">Inline AI Rewrite</span>
          <span className="text-[10px] font-mono text-neutral-400">Ctrl + Shift + R</span>
        </div>
        <div className="flex gap-1.5">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={\`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors \${
                tone === t
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }\`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-xs">
          <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Original</span>
          <span className="line-through text-neutral-500">{originalText}</span>
        </div>

        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <span className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Rewritten ({tone})</span>
          <span className="font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
            {rewrittenTexts[tone]}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => setStatus('idle')}
          className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
        >
          Discard
        </button>
        <button
          onClick={() => setStatus('reviewed')}
          className="px-4 py-1.5 text-xs rounded-lg font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          {status === 'reviewed' ? '✓ Accepted' : 'Accept Rewrite'}
        </button>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { InlineAIRewrite, InlineAIRewriteVariant } from './index';

export function InlineAIRewritePreview() {
  const [variant, setVariant] = useState<InlineAIRewriteVariant>('quiet');

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
      <InlineAIRewrite variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const inlineAIRewriteFixtures = {};`,
    readmeCode: `# Inline AI Rewrite

Inline text transformation overlay with tone selection buttons and instant diff acceptance.`,
  },

  // 5. AI Command Bar
  {
    slug: 'ai-command-bar',
    name: 'AI Command Bar',
    description: 'Spotlight-style floating palette that understands natural-language system instructions and intent-matched actions.',
    categories: ['ai', 'patterns', 'command'],
    roles: ['command', 'palette'],
    purposes: ['natural-language-commands', 'action-discovery', 'system-navigation'],
    componentName: 'AICommandBar',
    tags: ['ai', 'command', 'palette', 'spotlight', 'shortcuts'],
    idealFor: ['Power user navigation modal', 'AI workflow triggering', 'Natural language settings modification'],
    avoidFor: ['Standard static form drop-downs', 'Breadcrumb headers'],
    jobs: ['Interpret natural language user requests into concrete platform actions and commands'],
    indexCode: `import React, { useState } from 'react';

export type AICommandBarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AICommandBarProps {
  variant?: AICommandBarVariant;
}

export function AICommandBar({ variant = 'quiet' }: AICommandBarProps) {
  const [query, setQuery] = useState('');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white shadow-2xl'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-xl';

  const commands = [
    { title: 'Switch to Nocturne visual mode', category: 'Theme', shortcut: '⌘ T' },
    { title: 'Export current workspace as standalone Vite project', category: 'Export', shortcut: '⌘ E' },
    { title: 'Audit contrast against WCAG 2.2 AA', category: 'Audit', shortcut: '⌘ A' },
    { title: 'Generate Shadcn registry manifest', category: 'Registry', shortcut: '⌘ G' },
  ];

  const filtered = query
    ? commands.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : commands;

  return (
    <div className={\`w-full max-w-xl rounded-2xl border p-4 flex flex-col gap-3 transition-colors \${cardBg}\`}>
      <div className="flex items-center gap-3 px-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-neutral-400">✦</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI or type an action (e.g. switch theme, export)..."
          className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-neutral-400"
          autoFocus
        />
        <kbd className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-400">
          ESC
        </kbd>
      </div>

      <div className="space-y-1">
        {filtered.map((cmd) => (
          <div
            key={cmd.title}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                {cmd.category}
              </span>
              <span className="font-medium group-hover:text-current">{cmd.title}</span>
            </div>
            <kbd className="text-[10px] font-mono text-neutral-400">{cmd.shortcut}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AICommandBar, AICommandBarVariant } from './index';

export function AICommandBarPreview() {
  const [variant, setVariant] = useState<AICommandBarVariant>('quiet');

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
      <AICommandBar variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiCommandBarFixtures = {};`,
    readmeCode: `# AI Command Bar

Spotlight-style floating command palette that interprets natural language actions into system commands.`,
  },

  // 6. AI Prompt Composer
  {
    slug: 'ai-prompt-composer',
    name: 'AI Prompt Composer',
    description: 'Structured prompt input box with context variable attachment pills, system mode badges, and token counters.',
    categories: ['ai', 'patterns', 'composer'],
    roles: ['input', 'composer'],
    purposes: ['prompt-crafting', 'context-injection', 'token-tracking'],
    componentName: 'AIPromptComposer',
    tags: ['ai', 'prompt', 'composer', 'tokens', 'attachments'],
    idealFor: ['Advanced prompt engineering surface', 'Agent task delegation input', 'Contextual code generation'],
    avoidFor: ['Standard single-line login email inputs', 'Search query simple box'],
    jobs: ['Author structured AI prompts with attached file references and live token consumption estimates'],
    indexCode: `import React, { useState } from 'react';

export type AIPromptComposerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIPromptComposerProps {
  variant?: AIPromptComposerVariant;
}

export function AIPromptComposer({ variant = 'quiet' }: AIPromptComposerProps) {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState(['tokens.css', 'workbench.ts']);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const removeFile = (f: string) => {
    setAttachedFiles(attachedFiles.filter((item) => item !== f));
  };

  const estimatedTokens = Math.round(text.length / 4) + attachedFiles.length * 120;

  return (
    <div className={\`w-full p-5 rounded-xl border flex flex-col gap-3 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs">
        <span className="font-semibold">Prompt Studio</span>
        <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
          <span>Context: {attachedFiles.length} files</span>
          <span>~{estimatedTokens} tokens</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 py-1">
        {attachedFiles.map((f) => (
          <span
            key={f}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            <span>📄 {f}</span>
            <button onClick={() => removeFile(f)} className="hover:text-rose-500">×</button>
          </span>
        ))}
        <button
          onClick={() => setAttachedFiles([...attachedFiles, 'spec.md'])}
          className="text-xs px-2 py-1 rounded border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-neutral-400"
        >
          + Add Context
        </button>
      </div>

      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Compose task instructions... E.g. 'Refactor the TimeSeriesChart to support Nocturne glowing fills while preserving AA contrast.'"
        className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 leading-relaxed resize-none"
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-neutral-400">Shift + Enter for newline</span>
        <button className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90">
          Execute Prompt
        </button>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIPromptComposer, AIPromptComposerVariant } from './index';

export function AIPromptComposerPreview() {
  const [variant, setVariant] = useState<AIPromptComposerVariant>('quiet');

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
      <AIPromptComposer variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiPromptComposerFixtures = {};`,
    readmeCode: `# AI Prompt Composer

Structured prompt authoring surface with context attachment pills and live token estimation.`,
  },

  // 7. AI Suggested Actions
  {
    slug: 'ai-suggested-actions',
    name: 'AI Suggested Actions',
    description: 'Context-sensitive action strip offering next logical steps, workflow continuations, and automated shortcuts.',
    categories: ['ai', 'patterns', 'actions'],
    roles: ['strip', 'suggestions'],
    purposes: ['action-recommendation', 'guided-workflow', 'productivity-boost'],
    componentName: 'AISuggestedActions',
    tags: ['ai', 'suggestions', 'actions', 'chips', 'workflow'],
    idealFor: ['Post-generation next step recommendations', 'Chat conclusion action pills', 'Empty project initial ideas'],
    avoidFor: ['Complex nested menus', 'Static disclaimer footers'],
    jobs: ['Suggest high-probability next steps based on recent conversation or generation state'],
    indexCode: `import React, { useState } from 'react';

export type AISuggestedActionsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AISuggestedActionsProps {
  variant?: AISuggestedActionsVariant;
}

export function AISuggestedActions({ variant = 'quiet' }: AISuggestedActionsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const actionPill =
    variant === 'nocturne'
      ? 'bg-[#151921] hover:bg-[#1E232E] border-[#2E3440] text-cyan-400'
      : variant === 'expressive'
      ? 'bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 text-blue-900'
      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200';

  const actions = [
    { id: '1', title: 'Export as Vite App', desc: 'Bundle React + Tailwind 4 source tree' },
    { id: '2', title: 'Run Contrast Audit', desc: 'Validate WCAG 2.2 AA against 3 presets' },
    { id: '3', title: 'Generate Shadcn Manifest', desc: 'Create registry schema item file' },
  ];

  return (
    <div className={\`w-full p-5 rounded-xl border flex flex-col gap-3 transition-colors \${cardBg}\`}>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-amber-500">✦</span>
        <span>Suggested Next Steps</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => setSelected(act.id)}
            className={\`p-3 rounded-lg border text-left transition-all \${actionPill} \${
              selected === act.id ? 'ring-2 ring-current' : ''
            }\`}
          >
            <div className="text-xs font-semibold mb-1">{act.title}</div>
            <div className="text-[11px] text-neutral-500 leading-snug">{act.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AISuggestedActions, AISuggestedActionsVariant } from './index';

export function AISuggestedActionsPreview() {
  const [variant, setVariant] = useState<AISuggestedActionsVariant>('quiet');

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
      <AISuggestedActions variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiSuggestedActionsFixtures = {};`,
    readmeCode: `# AI Suggested Actions

Context-sensitive suggestion cards presenting next logical workflow steps and verification actions.`,
  },

  // 8. AI Source Citations
  {
    slug: 'ai-source-citations',
    name: 'AI Source Citations',
    description: 'Grounding source cards and citation tags attributing AI assertions back to documents, files, and URLs.',
    categories: ['ai', 'patterns', 'citations'],
    roles: ['citations', 'grounding'],
    purposes: ['provenance-verification', 'source-attribution', 'hallucination-mitigation'],
    componentName: 'AISourceCitations',
    tags: ['ai', 'citations', 'grounding', 'sources', 'provenance'],
    idealFor: ['RAG query responses', 'Research paper summaries', 'Legal/compliance policy answers'],
    avoidFor: ['Pure non-grounded creative copywriting', 'Simple color picker controls'],
    jobs: ['Attribute AI-generated claims to concrete source documents with quote snippets'],
    indexCode: `import React, { useState } from 'react';

export type AISourceCitationsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AISourceCitationsProps {
  variant?: AISourceCitationsVariant;
}

export function AISourceCitations({ variant = 'quiet' }: AISourceCitationsProps) {
  const [activeCite, setActiveCite] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const sources = [
    { id: 1, title: 'DESIGN_SYSTEM.md', path: 'docs/DESIGN_SYSTEM.md#L45', quote: 'Nocturne palette mandates #0B0D10 canvas and minimum 4.5:1 text contrast.' },
    { id: 2, title: 'WORKBENCH_SPEC.md', path: 'docs/WORKBENCH_SPEC.md#L112', quote: 'Workbench state persists strictly in IndexedDB with zero cloud syncing required.' },
    { id: 3, title: 'DATA_CONTRACTS.md', path: 'docs/DATA_CONTRACTS.md#L88', quote: 'ResourceManifest schema enforces strict provenance, licensing, and 0 undeclared deps.' },
  ];

  return (
    <div className={\`w-full p-5 rounded-xl border flex flex-col gap-3 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-semibold">Grounded Sources & Citations (3)</span>
        <span className="text-[10px] font-mono text-emerald-500">✓ 100% Verified</span>
      </div>

      <div className="space-y-2">
        {sources.map((src) => {
          const isSelected = activeCite === src.id;
          return (
            <div
              key={src.id}
              onClick={() => setActiveCite(isSelected ? null : src.id)}
              className={\`p-3 rounded-lg border text-xs cursor-pointer transition-colors \${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }\`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium font-mono">[{src.id}] {src.title}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{src.path}</span>
              </div>
              <p className="text-[11px] text-neutral-500 italic leading-relaxed">
                "{src.quote}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AISourceCitations, AISourceCitationsVariant } from './index';

export function AISourceCitationsPreview() {
  const [variant, setVariant] = useState<AISourceCitationsVariant>('quiet');

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
      <AISourceCitations variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiSourceCitationsFixtures = {};`,
    readmeCode: `# AI Source Citations

Grounding source cards and provenance references with exact file paths and quote snippets.`,
  },

  // 9. AI Research Answer
  {
    slug: 'ai-research-answer',
    name: 'AI Research Answer',
    description: 'Comprehensive synthesized research summary with executive takeaway, numbered key points, and confidence meter.',
    categories: ['ai', 'patterns', 'research'],
    roles: ['answer', 'research'],
    purposes: ['synthesis-summary', 'deep-research', 'confidence-scoring'],
    componentName: 'AIResearchAnswer',
    tags: ['ai', 'research', 'synthesis', 'confidence', 'summary'],
    idealFor: ['Deep research question answers', 'Literature review summaries', 'Technical architectural evaluations'],
    avoidFor: ['One-word autocomplete prompts', 'High-frequency logging terminal'],
    jobs: ['Deliver deep synthesized research answers with structured takeaway blocks and confidence indicators'],
    indexCode: `import React from 'react';

export type AIResearchAnswerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIResearchAnswerProps {
  variant?: AIResearchAnswerVariant;
}

export function AIResearchAnswer({ variant = 'quiet' }: AIResearchAnswerProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const calloutBg =
    variant === 'nocturne'
      ? 'bg-cyan-950/40 border-cyan-800 text-cyan-200'
      : variant === 'expressive'
      ? 'bg-blue-50 border-blue-200 text-blue-900'
      : 'bg-neutral-50 border-neutral-200 text-neutral-900';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Synthesis: Micro-frontend vs Monolith Export</h4>
          <p className="text-xs text-neutral-500">Synthesized from 12 architectural repository documents</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          Confidence: 98%
        </span>
      </div>

      <div className={\`p-4 rounded-lg border text-xs leading-relaxed \${calloutBg}\`}>
        <span className="font-bold uppercase tracking-wider block mb-1 text-[10px]">Executive Summary</span>
        Tessellate adopts a zero-runtime standalone export model. Standalone projects compile cleanly to Vite + React without any Tessellate runtime SDK lock-in or micro-frontend container overhead.
      </div>

      <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">1.</span>
          <span>Zero Lock-in: Component code exports as self-contained TypeScript and Tailwind files with no proprietary wrapper tags.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">2.</span>
          <span>Bundle Performance: Exported apps load in under 150ms with zero remote asset fetching.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">3.</span>
          <span>Guest Independence: Full export and preview lifecycle works offline in IndexedDB.</span>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIResearchAnswer, AIResearchAnswerVariant } from './index';

export function AIResearchAnswerPreview() {
  const [variant, setVariant] = useState<AIResearchAnswerVariant>('quiet');

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
      <AIResearchAnswer variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiResearchAnswerFixtures = {};`,
    readmeCode: `# AI Research Answer

Synthesized deep research response block with executive summary callout, numbered findings, and confidence badge.`,
  },

  // 10. AI Tool Execution Timeline
  {
    slug: 'ai-tool-execution-timeline',
    name: 'AI Tool Execution Timeline',
    description: 'Chronological timeline of agentic tool calls showing tool name, arguments, execution duration, and success status.',
    categories: ['ai', 'patterns', 'tools'],
    roles: ['timeline', 'tools'],
    purposes: ['tool-call-visualization', 'agentic-transparency', 'debugging-timeline'],
    componentName: 'AIToolExecutionTimeline',
    tags: ['ai', 'tools', 'timeline', 'agent', 'telemetry'],
    idealFor: ['Agent execution tracing', 'Tool call inspection log', 'Autonomous build transparency'],
    avoidFor: ['Simple marketing bullet lists', 'Standard blog post dates'],
    jobs: ['Visualize multi-step agent tool executions with duration metrics and collapsible outputs'],
    indexCode: `import React, { useState } from 'react';

export type AIToolExecutionTimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIToolExecutionTimelineProps {
  variant?: AIToolExecutionTimelineVariant;
}

export function AIToolExecutionTimeline({ variant = 'quiet' }: AIToolExecutionTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>('t2');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const toolCalls = [
    { id: 't1', tool: 'search_catalog', args: 'query: "candlestick", category: "data"', duration: '32ms', status: 'done', output: 'Found 1 verified resource: financial-candlestick-chart' },
    { id: 't2', tool: 'validate_manifest', args: 'target: "resources/data/financial-candlestick-chart"', duration: '18ms', status: 'done', output: 'Schema 1.0.0 valid. 0 undeclared dependencies.' },
    { id: 't3', tool: 'export_vite_project', args: 'outputDir: "exported-app"', duration: '140ms', status: 'done', output: 'Successfully exported 11 files with zero errors.' },
  ];

  return (
    <div className={\`w-full p-5 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-semibold">Agent Tool Call Execution Trace</span>
        <span className="text-[10px] font-mono text-neutral-400">Total runtime: 190ms</span>
      </div>

      <div className="space-y-3">
        {toolCalls.map((tc) => {
          const isExpanded = expandedId === tc.id;
          return (
            <div key={tc.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden text-xs">
              <div
                onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/60 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono font-semibold">{tc.tool}()</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
                  <span>{tc.duration}</span>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 bg-white dark:bg-black/30 border-t border-neutral-200 dark:border-neutral-800 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Arguments:</span>
                    <span className="text-neutral-800 dark:text-neutral-200">{tc.args}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Result:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{tc.output}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AIToolExecutionTimeline, AIToolExecutionTimelineVariant } from './index';

export function AIToolExecutionTimelinePreview() {
  const [variant, setVariant] = useState<AIToolExecutionTimelineVariant>('quiet');

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
      <AIToolExecutionTimeline variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiToolExecutionTimelineFixtures = {};`,
    readmeCode: `# AI Tool Execution Timeline

Chronological timeline of agentic tool calls showing argument parameters, execution durations, and return results.`,
  },
];
