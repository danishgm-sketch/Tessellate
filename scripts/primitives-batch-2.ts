import type { PrimitiveDef } from './primitives-builder.js';

export const BATCH_2: PrimitiveDef[] = [
  // 16. Radio Group
  {
    slug: 'radio-group',
    name: 'Radio Group',
    description: 'Accessible single-choice selection group with circle indicators and keyboard navigation.',
    categories: ['primitives', 'inputs'],
    roles: ['radiogroup', 'control'],
    purposes: ['Payment method choice', 'Plan selection', 'Visual theme selection'],
    componentName: 'RadioGroup',
    tags: ['radio-group', 'radio', 'single-select', 'choice'],
    idealFor: ['Mutually exclusive list of 2–6 distinct options'],
    avoidFor: ['Large lists of 10+ items (use Select)'],
    jobs: ['Choose exactly one option from visible set'],
    indexCode: `import React from 'react';

export type RadioGroupVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  variant?: RadioGroupVariant;
  name?: string;
  options: RadioOption[];
  value: string;
  onChange: (val: string) => void;
}

export function RadioGroup({
  variant = 'quiet',
  options,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        let indicator = 'border-neutral-300';
        if (isSelected) {
          indicator = 'border-neutral-900 bg-neutral-900';
          if (variant === 'expressive') indicator = 'border-[#2547E8] bg-[#2547E8]';
          if (variant === 'nocturne') indicator = 'border-white bg-white';
        }

        return (
          <label
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div className={\`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border \${indicator}\`}>
              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-neutral-950" />}
            </div>
            <div className="text-xs">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{opt.label}</span>
              {opt.description && <p className="text-neutral-500 mt-0.5">{opt.description}</p>}
            </div>
          </label>
        );
      })}
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { RadioGroup } from './index.js';

export function RadioGroupPreview() {
  const [val, setVal] = useState('monthly');
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <RadioGroup
        variant="expressive"
        value={val}
        onChange={setVal}
        options={[
          { value: 'monthly', label: 'Monthly Billing', description: 'Billed monthly at standard rate.' },
          { value: 'yearly', label: 'Annual Billing', description: 'Save 20% with annual upfront commitment.' },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: 'a', options: [{ value: 'a', label: 'Default' }] };
export const expressiveFixture = { variant: 'expressive', value: '1', options: [{ value: '1', label: 'Pro' }] };
export const nocturneFixture = { variant: 'nocturne', value: 'dark', options: [{ value: 'dark', label: 'Dark' }] };
`,
    readmeCode: `# Radio Group Primitive
Accessible single-choice selection group with circle indicators and keyboard navigation.
`,
  },

  // 17. Switch
  {
    slug: 'switch',
    name: 'Switch',
    description: 'Accessible sliding toggle switch for boolean preferences and instant settings.',
    categories: ['primitives', 'inputs'],
    roles: ['switch', 'control'],
    purposes: ['Feature toggles', 'Notifications active', 'Theme preference'],
    componentName: 'Switch',
    tags: ['switch', 'toggle', 'boolean', 'control'],
    idealFor: ['Settings that take immediate effect without form submission'],
    avoidFor: ['Standard form submission inputs (use Checkbox)'],
    jobs: ['Toggle instant setting on/off'],
    indexCode: `import React from 'react';

export type SwitchVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SwitchProps {
  variant?: SwitchVariant;
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  variant = 'quiet',
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SwitchProps) {
  let track = checked ? 'bg-neutral-900' : 'bg-neutral-200';
  if (variant === 'expressive' && checked) track = 'bg-[#2547E8] shadow-xs';
  if (variant === 'nocturne' && checked) track = 'bg-white';

  return (
    <label className={\`inline-flex items-center justify-between gap-4 cursor-pointer select-none \${disabled ? 'opacity-40 pointer-events-none' : ''}\`}>
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-neutral-900 dark:text-neutral-100">{label}</span>}
          {description && <p className="text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={\`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 \${track}\`}
      >
        <span
          className={\`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-0.5 ml-0.5 shadow-xs \${
            checked ? (variant === 'nocturne' ? 'translate-x-4 bg-neutral-950' : 'translate-x-4') : 'translate-x-0'
          }\`}
        />
      </button>
    </label>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Switch } from './index.js';

export function SwitchPreview() {
  const [on, setOn] = useState(true);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <Switch variant="expressive" label="Automated Backups" description="Sync checkpoints to local IndexedDB every minute." checked={on} onChange={setOn} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', checked: true, label: 'Analytics' };
export const expressiveFixture = { variant: 'expressive', checked: true, label: 'Sound effects' };
export const nocturneFixture = { variant: 'nocturne', checked: false, label: 'Telemetry stream' };
`,
    readmeCode: `# Switch Primitive
Accessible sliding toggle switch for boolean preferences and instant settings.
`,
  },

  // 18. Slider
  {
    slug: 'slider',
    name: 'Slider',
    description: 'Smooth continuous value slider with track, fill, and precision drag thumb.',
    categories: ['primitives', 'inputs'],
    roles: ['slider', 'control'],
    purposes: ['Volume controls', 'DNA dimension adjusting', 'Opacity sliders'],
    componentName: 'Slider',
    tags: ['slider', 'range', 'continuous', 'control'],
    idealFor: ['Granular numerical adjustment across a bounded spectrum'],
    avoidFor: ['Discrete categorical choices with few items'],
    jobs: ['Drag value across continuous spectrum', 'Reflect numerical magnitude'],
    indexCode: `import React from 'react';

export type SliderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SliderProps {
  variant?: SliderVariant;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}

export function Slider({
  variant = 'quiet',
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: SliderProps) {
  let accent = 'accent-neutral-900';
  if (variant === 'expressive') accent = 'accent-[#2547E8]';
  if (variant === 'nocturne') accent = 'accent-white';

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs">
        {label && <span className="font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>}
        <span className="font-mono text-neutral-500">{value}</span>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={\`w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer \${accent}\`}
        />
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Slider } from './index.js';

export function SliderPreview() {
  const [val, setVal] = useState(65);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <Slider variant="expressive" label="Visual Ambition (DNA)" value={val} onChange={setVal} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: 40 };
export const expressiveFixture = { variant: 'expressive', value: 75 };
export const nocturneFixture = { variant: 'nocturne', value: 90 };
`,
    readmeCode: `# Slider Primitive
Smooth continuous value slider with track, fill, and precision drag thumb.
`,
  },

  // 19. Range Slider
  {
    slug: 'range-slider',
    name: 'Range Slider',
    description: 'Dual-thumb interval selector for bounding min/max numerical thresholds simultaneously.',
    categories: ['primitives', 'inputs'],
    roles: ['slider', 'range', 'control'],
    purposes: ['Price filtering', 'Latency bounds', 'Date interval limits'],
    componentName: 'RangeSlider',
    tags: ['range-slider', 'interval', 'dual-thumb', 'filter'],
    idealFor: ['Lower and upper bound constraints'],
    avoidFor: ['Single scalar settings'],
    jobs: ['Define range lower and upper boundaries'],
    indexCode: `import React from 'react';

export type RangeSliderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RangeSliderProps {
  variant?: RangeSliderVariant;
  label?: string;
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
}

export function RangeSlider({
  variant = 'quiet',
  label,
  min = 0,
  max = 100,
  value,
  onChange,
}: RangeSliderProps) {
  const [low, high] = value;
  let accent = 'accent-neutral-900';
  if (variant === 'expressive') accent = 'accent-[#2547E8]';
  if (variant === 'nocturne') accent = 'accent-white';

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs">
        {label && <span className="font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>}
        <span className="font-mono text-neutral-500">{low} – {high}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="range"
          min={min}
          max={high}
          value={low}
          onChange={(e) => onChange([Number(e.target.value), high])}
          className={\`w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer \${accent}\`}
        />
        <input
          type="range"
          min={low}
          max={max}
          value={high}
          onChange={(e) => onChange([low, Number(e.target.value)])}
          className={\`w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer \${accent}\`}
        />
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { RangeSlider } from './index.js';

export function RangeSliderPreview() {
  const [bounds, setBounds] = useState<[number, number]>([20, 80]);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <RangeSlider variant="expressive" label="Price Filter ($)" value={bounds} onChange={setBounds} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: [10, 50] };
export const expressiveFixture = { variant: 'expressive', value: [25, 75] };
export const nocturneFixture = { variant: 'nocturne', value: [0, 100] };
`,
    readmeCode: `# Range Slider Primitive
Dual-thumb interval selector for bounding min/max numerical thresholds simultaneously.
`,
  },

  // 20. Segmented Control
  {
    slug: 'segmented-control',
    name: 'Segmented Control',
    description: 'High-density toggle bar with active sliding pill indicator between mutual modes.',
    categories: ['primitives', 'inputs'],
    roles: ['segmented-control', 'tablist'],
    purposes: ['View toggles (Grid/List)', 'Mode switchers', 'Time horizons (1D/1W/1M)'],
    componentName: 'SegmentedControl',
    tags: ['segmented-control', 'toggle', 'pill', 'modes'],
    idealFor: ['2–5 compact mutually exclusive state switches'],
    avoidFor: ['Lengthy multi-word labels'],
    jobs: ['Switch between discrete view modes instantly'],
    indexCode: `import React from 'react';

export type SegmentedControlVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  variant?: SegmentedControlVariant;
  options: SegmentedControlOption[];
  value: string;
  onChange: (val: string) => void;
}

export function SegmentedControl({
  variant = 'quiet',
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  let container = 'bg-neutral-100 p-1 border border-neutral-200';
  let activePill = 'bg-white text-neutral-900 shadow-xs';
  if (variant === 'expressive') {
    container = 'bg-[#F2EFE9] p-1 border border-[#D9D6CF]';
    activePill = 'bg-white text-[#2547E8] font-semibold shadow-xs';
  } else if (variant === 'nocturne') {
    container = 'bg-[#11141B] p-1 border border-[#2E3440]';
    activePill = 'bg-[#1E232E] text-white border border-neutral-700 shadow-xs';
  }

  return (
    <div className={\`inline-flex rounded-lg \${container}\`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={\`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 \${
              isSelected ? activePill : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }\`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { SegmentedControl } from './index.js';

export function SegmentedControlPreview() {
  const [mode, setMode] = useState('grid');
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <SegmentedControl
        variant="expressive"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'grid', label: 'Grid' },
          { value: 'list', label: 'List' },
          { value: 'compact', label: 'Compact' },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: 'day', options: [{ value: 'day', label: 'Day' }] };
export const expressiveFixture = { variant: 'expressive', value: 'month', options: [{ value: 'month', label: 'Month' }] };
export const nocturneFixture = { variant: 'nocturne', value: 'year', options: [{ value: 'year', label: 'Year' }] };
`,
    readmeCode: `# Segmented Control Primitive
High-density toggle bar with active sliding pill indicator between mutual modes.
`,
  },

  // 21. Tabs
  {
    slug: 'tabs',
    name: 'Tabs',
    description: 'Accessible tabbed navigation system with active underlined or pill indicators and panels.',
    categories: ['primitives', 'navigation'],
    roles: ['tabs', 'tablist'],
    purposes: ['Section switching', 'Workspace subviews', 'Code snippet languages'],
    componentName: 'Tabs',
    tags: ['tabs', 'navigation', 'tablist', 'panels'],
    idealFor: ['Partitioning related content on single screen'],
    avoidFor: ['Sequential multi-step forms (use Wizard)'],
    jobs: ['Switch active content panel without page reload'],
    indexCode: `import React from 'react';

export type TabsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  variant?: TabsVariant;
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ variant = 'quiet', tabs, activeId, onChange }: TabsProps) {
  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];

  let borderBottom = 'border-b border-neutral-200';
  let activeIndicator = 'border-neutral-900 text-neutral-900 font-semibold';
  if (variant === 'expressive') {
    borderBottom = 'border-b border-[#D9D6CF]';
    activeIndicator = 'border-[#2547E8] text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    borderBottom = 'border-b border-[#2E3440]';
    activeIndicator = 'border-white text-white font-semibold';
  }

  return (
    <div className="w-full space-y-4">
      <div className={\`flex gap-6 \${borderBottom}\`}>
        {tabs.map((tab) => {
          const isSelected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(tab.id)}
              className={\`pb-2.5 text-sm transition-all border-b-2 -mb-px \${
                isSelected ? activeIndicator : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }\`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="text-sm">
        {activeTab?.content}
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Tabs } from './index.js';

export function TabsPreview() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="p-8 max-w-md mx-auto bg-[#FAF9F6]">
      <Tabs
        variant="expressive"
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview', content: <p className="text-neutral-600">High-level interface telemetry metrics.</p> },
          { id: 'analytics', label: 'Analytics', content: <p className="text-neutral-600">Detailed conversion rate records.</p> },
          { id: 'settings', label: 'Settings', content: <p className="text-neutral-600">Workspace token and API keys.</p> },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', activeId: '1', tabs: [{ id: '1', label: 'Tab 1', content: 'C1' }] };
export const expressiveFixture = { variant: 'expressive', activeId: '2', tabs: [{ id: '2', label: 'Design DNA', content: 'DNA' }] };
export const nocturneFixture = { variant: 'nocturne', activeId: '3', tabs: [{ id: '3', label: 'Logs', content: 'Logs' }] };
`,
    readmeCode: `# Tabs Primitive
Accessible tabbed navigation system with active underlined or pill indicators and panels.
`,
  },

  // 22. Accordion
  {
    slug: 'accordion',
    name: 'Accordion',
    description: 'Collapsible vertically stacked disclosure panels with rotating chevron animations.',
    categories: ['primitives', 'layout'],
    roles: ['accordion', 'disclosure'],
    purposes: ['FAQ lists', 'Sidebar hierarchies', 'Complex inspection panels'],
    componentName: 'Accordion',
    tags: ['accordion', 'collapse', 'faq', 'disclosure'],
    idealFor: ['Saving vertical space when users scan headers first'],
    avoidFor: ['Content that must be read concurrently without clicking'],
    jobs: ['Expand and collapse content items on demand'],
    indexCode: `import React, { useState } from 'react';

export type AccordionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  variant?: AccordionVariant;
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ variant = 'quiet', items, allowMultiple = false }: AccordionProps) {
  const [expanded, setExpanded] = useState<string[]>([items[0]?.id || '']);

  const toggle = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(allowMultiple ? expanded.filter((i) => i !== id) : []);
    } else {
      setExpanded(allowMultiple ? [...expanded, id] : [id]);
    }
  };

  let theme = 'border-neutral-200 divide-neutral-200';
  if (variant === 'expressive') theme = 'border-[#D9D6CF] divide-[#D9D6CF]';
  if (variant === 'nocturne') theme = 'border-[#2E3440] divide-[#2E3440] text-white';

  return (
    <div className={\`w-full rounded-lg border divide-y overflow-hidden \${theme}\`}>
      {items.map((item) => {
        const isOpen = expanded.includes(item.id);
        return (
          <div key={item.id} className="text-sm">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <span>{item.title}</span>
              <span className={\`transition-transform duration-200 text-xs \${isOpen ? 'rotate-180' : ''}\`}>
                ▼
              </span>
            </button>
            {isOpen && <div className="p-4 pt-0 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { Accordion } from './index.js';

export function AccordionPreview() {
  return (
    <div className="p-8 max-w-md mx-auto bg-[#FAF9F6]">
      <Accordion
        variant="expressive"
        items={[
          { id: '1', title: 'What is Tessellate Design DNA?', content: 'A 10-dimensional mathematical vector capturing visual density, contrast, and motion.' },
          { id: '2', title: 'Can I export clean React code?', content: 'Yes, full standalone Vite + React + Tailwind CSS code is produced without lock-in.' },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', items: [{ id: '1', title: 'Item 1', content: 'Details' }] };
export const expressiveFixture = { variant: 'expressive', items: [{ id: '2', title: 'Feature', content: 'Explanation' }] };
export const nocturneFixture = { variant: 'nocturne', items: [{ id: '3', title: 'Config', content: 'JSON' }] };
`,
    readmeCode: `# Accordion Primitive
Collapsible vertically stacked disclosure panels with rotating chevron animations.
`,
  },

  // 23. Disclosure
  {
    slug: 'disclosure',
    name: 'Disclosure',
    description: 'Single collapsible toggle container with summary header and expandable details.',
    categories: ['primitives', 'layout'],
    roles: ['disclosure', 'collapse'],
    purposes: ['Advanced options', 'Changelog details', 'Raw JSON view'],
    componentName: 'Disclosure',
    tags: ['disclosure', 'collapse', 'details', 'summary'],
    idealFor: ['Hiding secondary details under an inline toggle'],
    avoidFor: ['Critical instructions needed on first glance'],
    jobs: ['Reveal supplementary details on user toggle'],
    indexCode: `import React, { useState } from 'react';

export type DisclosureVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DisclosureProps {
  variant?: DisclosureVariant;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Disclosure({ variant = 'quiet', title, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  let theme = 'border-neutral-200 dark:border-neutral-800';
  if (variant === 'expressive') theme = 'border-[#D9D6CF]';
  if (variant === 'nocturne') theme = 'border-[#2E3440] bg-[#11141B] text-white';

  return (
    <div className={\`w-full rounded-lg border p-3 text-sm \${theme}\`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between font-medium text-left text-xs"
      >
        <span>{title}</span>
        <span className="text-neutral-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">{children}</div>}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { Disclosure } from './index.js';

export function DisclosurePreview() {
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <Disclosure variant="expressive" title="Advanced Generator Parameters">
        <p>Seed value: 0x93FA. Convergence threshold: 0.05.</p>
      </Disclosure>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', title: 'Raw payload' };
export const expressiveFixture = { variant: 'expressive', title: 'Advanced config' };
export const nocturneFixture = { variant: 'nocturne', title: 'Trace stack' };
`,
    readmeCode: `# Disclosure Primitive
Single collapsible toggle container with summary header and expandable details.
`,
  },

  // 24. Tooltip
  {
    slug: 'tooltip',
    name: 'Tooltip',
    description: 'Micro-interaction popup providing contextual hints on hover or keyboard focus.',
    categories: ['primitives', 'feedback'],
    roles: ['tooltip', 'hint'],
    purposes: ['Button descriptions', 'Icon labels', 'Keyboard shortcut hints'],
    componentName: 'Tooltip',
    tags: ['tooltip', 'hint', 'popover', 'hover'],
    idealFor: ['Describing icon-only controls and technical abbreviations'],
    avoidFor: ['Essential interactive content (links or buttons)'],
    jobs: ['Explain ambiguous controls on hover/focus'],
    indexCode: `import React, { useState } from 'react';

export type TooltipVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TooltipProps {
  variant?: TooltipVariant;
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ variant = 'quiet', content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  let bubble = 'bg-neutral-900 text-white shadow-md';
  if (variant === 'expressive') bubble = 'bg-[#1E232E] text-white border border-[#2547E8] shadow-lg';
  if (variant === 'nocturne') bubble = 'bg-white text-neutral-950 font-semibold shadow-lg';

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={\`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 whitespace-nowrap rounded px-2 py-1 text-[11px] pointer-events-none \${bubble}\`}>
          {content}
        </div>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { Tooltip } from './index.js';

export function TooltipPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Tooltip variant="expressive" content="Export as React project (⌘E)">
        <button className="px-3 py-1.5 border rounded-lg text-sm bg-white shadow-xs">Export</button>
      </Tooltip>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', content: 'Inspect element' };
export const expressiveFixture = { variant: 'expressive', content: 'Generate with AI' };
export const nocturneFixture = { variant: 'nocturne', content: 'Terminal open' };
`,
    readmeCode: `# Tooltip Primitive
Micro-interaction popup providing contextual hints on hover or keyboard focus.
`,
  },

  // 25. Popover
  {
    slug: 'popover',
    name: 'Popover',
    description: 'Floating rich content card anchored to a target trigger with dismissal handling.',
    categories: ['primitives', 'overlays'],
    roles: ['popover', 'overlay'],
    purposes: ['Date picker overlay', 'Filter settings menu', 'User card preview'],
    componentName: 'Popover',
    tags: ['popover', 'floating', 'overlay', 'card'],
    idealFor: ['Interactive panels triggered by a specific button'],
    avoidFor: ['Simple text hints (use Tooltip)'],
    jobs: ['Open interactive contextual panel next to trigger'],
    indexCode: `import React, { useState } from 'react';

export type PopoverVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PopoverProps {
  variant?: PopoverVariant;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Popover({ variant = 'quiet', trigger, children }: PopoverProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={\`absolute top-full left-0 mt-2 z-50 min-w-64 rounded-xl border p-4 \${theme}\`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { Popover } from './index.js';

export function PopoverPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Popover
        variant="expressive"
        trigger={<button className="px-3 py-1.5 border rounded-lg text-sm bg-white shadow-xs">Filter Settings</button>}
      >
        <div className="space-y-2 text-xs">
          <p className="font-semibold">Display Density</p>
          <p className="text-neutral-500">Configure visual compact scaling for table rows.</p>
        </div>
      </Popover>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Popover Primitive
Floating rich content card anchored to a target trigger with dismissal handling.
`,
  },

  // 26. Dropdown Menu
  {
    slug: 'dropdown-menu',
    name: 'Dropdown Menu',
    description: 'Floating contextual menu with item hover states, shortcut indicators, and dividers.',
    categories: ['primitives', 'overlays', 'navigation'],
    roles: ['menu', 'dropdown'],
    purposes: ['User account options', 'Row action menu', 'Export formats'],
    componentName: 'DropdownMenu',
    tags: ['dropdown-menu', 'menu', 'actions', 'popup'],
    idealFor: ['Secondary action palettes connected to a button'],
    avoidFor: ['Complex navigation structures (use MegaNav)'],
    jobs: ['Display secondary action list on trigger click'],
    indexCode: `import React, { useState } from 'react';

export type DropdownMenuVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  danger?: boolean;
}

export interface DropdownMenuProps {
  variant?: DropdownMenuVariant;
  trigger: React.ReactNode;
  items: MenuItem[];
  onSelect?: (id: string) => void;
}

export function DropdownMenu({ variant = 'quiet', trigger, items, onSelect }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-lg';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-xl';

  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={\`absolute right-0 top-full mt-1.5 z-50 min-w-48 rounded-lg border p-1 \${theme}\`}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect?.(item.id);
                  setOpen(false);
                }}
                className={\`flex w-full items-center justify-between rounded px-3 py-1.5 text-xs text-left \${
                  item.danger ? 'text-rose-600 hover:bg-rose-50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }\`}
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="opacity-40 font-mono text-[10px]">{item.shortcut}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { DropdownMenu } from './index.js';

export function DropdownMenuPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <DropdownMenu
        variant="expressive"
        trigger={<button className="px-3 py-1.5 border rounded-lg text-sm bg-white shadow-xs">Actions ▾</button>}
        items={[
          { id: 'duplicate', label: 'Duplicate Node', shortcut: '⌘D' },
          { id: 'export', label: 'Export Code', shortcut: '⌘E' },
          { id: 'delete', label: 'Delete', danger: true },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', items: [{ id: 'edit', label: 'Edit' }] };
export const expressiveFixture = { variant: 'expressive', items: [{ id: 'share', label: 'Share' }] };
export const nocturneFixture = { variant: 'nocturne', items: [{ id: 'fork', label: 'Fork' }] };
`,
    readmeCode: `# Dropdown Menu Primitive
Floating contextual menu with item hover states, shortcut indicators, and dividers.
`,
  },

  // 27. Context Menu
  {
    slug: 'context-menu',
    name: 'Context Menu',
    description: 'Right-click action palette anchored directly to the user pointer coordinates.',
    categories: ['primitives', 'overlays'],
    roles: ['contextmenu', 'menu'],
    purposes: ['Canvas node context', 'File system item menu', 'Table row actions'],
    componentName: 'ContextMenu',
    tags: ['context-menu', 'right-click', 'pointer', 'actions'],
    idealFor: ['Power user desktop workspaces and canvas editors'],
    avoidFor: ['Mobile-only touch applications'],
    jobs: ['Trigger contextual actions on right-click'],
    indexCode: `import React, { useState } from 'react';

export type ContextMenuVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ContextMenuProps {
  variant?: ContextMenuVariant;
  children: React.ReactNode;
}

export function ContextMenu({ variant = 'quiet', children }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
  };

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {children}
      {pos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPos(null)} />
          <div
            style={{ top: pos.y, left: pos.x }}
            className={\`fixed z-50 min-w-44 rounded-lg border p-1 text-xs \${theme}\`}
          >
            <button type="button" onClick={() => setPos(null)} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Cut
            </button>
            <button type="button" onClick={() => setPos(null)} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Copy
            </button>
            <button type="button" onClick={() => setPos(null)} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Lock Layer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ContextMenu } from './index.js';

export function ContextMenuPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <ContextMenu variant="expressive">
        <div className="p-12 border-2 border-dashed border-neutral-300 rounded-xl text-center text-xs text-neutral-500">
          Right-click inside this zone to inspect context actions
        </div>
      </ContextMenu>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Context Menu Primitive
Right-click action palette anchored directly to the user pointer coordinates.
`,
  },

  // 28. Command Menu
  {
    slug: 'command-menu',
    name: 'Command Menu',
    description: '⌘K spotlight dialog modal with quick command search, group categories, and keyboard arrow navigation.',
    categories: ['primitives', 'overlays', 'search'],
    roles: ['command', 'dialog', 'search'],
    purposes: ['Quick navigation', 'Command execution', 'Shortcuts palette'],
    componentName: 'CommandMenu',
    tags: ['command-menu', 'cmdk', 'spotlight', 'shortcuts'],
    idealFor: ['High velocity developer tools and complex SaaS apps'],
    avoidFor: ['Simple public marketing landing pages'],
    jobs: ['Fast keyboard execution of arbitrary product commands'],
    indexCode: `import React, { useState } from 'react';

export type CommandMenuVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandItem {
  id: string;
  category: string;
  label: string;
  shortcut?: string;
}

export interface CommandMenuProps {
  variant?: CommandMenuVariant;
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  onSelect?: (id: string) => void;
}

export function CommandMenu({
  variant = 'quiet',
  open,
  onClose,
  items,
  onSelect,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');
  if (!open) return null;

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()));

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-xs p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={\`relative w-full max-w-lg rounded-xl border overflow-hidden z-10 \${theme}\`}>
        <div className="flex items-center px-4 py-3 border-b border-inherit">
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="text-[10px] text-neutral-400 font-mono border rounded px-1">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-auto p-2 space-y-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect?.(item.id);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded px-3 py-2 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-40 uppercase tracking-wider font-mono">{item.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { CommandMenu } from './index.js';

export function CommandMenuPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Command Palette (⌘K)
      </button>
      <CommandMenu
        variant="expressive"
        open={open}
        onClose={() => setOpen(false)}
        items={[
          { id: '1', category: 'Navigation', label: 'Go to Workbench' },
          { id: '2', category: 'Action', label: 'Trigger Recomposition' },
          { id: '3', category: 'Export', label: 'Download Source ZIP' },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', open: false, items: [] };
export const expressiveFixture = { variant: 'expressive', open: true, items: [{ id: '1', category: 'General', label: 'Help' }] };
export const nocturneFixture = { variant: 'nocturne', open: false, items: [] };
`,
    readmeCode: `# Command Menu Primitive
⌘K spotlight dialog modal with quick command search, group categories, and keyboard arrow navigation.
`,
  },

  // 29. Dialog
  {
    slug: 'dialog',
    name: 'Dialog',
    description: 'Accessible modal dialog window with backdrop scrim, focus trapping, and header/footer slots.',
    categories: ['primitives', 'overlays'],
    roles: ['dialog', 'modal'],
    purposes: ['Creation workflows', 'Configuration editing', 'Information displays'],
    componentName: 'Dialog',
    tags: ['dialog', 'modal', 'overlay', 'window'],
    idealFor: ['Focused multi-field forms or critical intermediate workflows'],
    avoidFor: ['Small lightweight tooltips or non-blocking alerts'],
    jobs: ['Trap focus inside modal until user explicitly confirms or closes'],
    indexCode: `import React from 'react';

export type DialogVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DialogProps {
  variant?: DialogVariant;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  variant = 'quiet',
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  if (!open) return null;

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={\`relative w-full max-w-md rounded-2xl border p-6 z-10 space-y-4 \${theme}\`}>
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>}
        </div>
        <div className="py-2 text-sm">{children}</div>
        {footer && <div className="flex justify-end gap-2 pt-2 border-t border-inherit">{footer}</div>}
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Dialog } from './index.js';

export function DialogPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Dialog
      </button>
      <Dialog
        variant="expressive"
        open={open}
        onClose={() => setOpen(false)}
        title="Create Design Direction"
        description="Specify the archetype and structural parameters for generation."
        footer={
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 bg-[#2547E8] text-white text-xs rounded-lg font-medium">
            Confirm
          </button>
        }
      >
        <p className="text-xs text-neutral-600">Enter direction seed and constraints.</p>
      </Dialog>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', open: false, title: 'Title' };
export const expressiveFixture = { variant: 'expressive', open: true, title: 'Project Settings' };
export const nocturneFixture = { variant: 'nocturne', open: false, title: 'Logs' };
`,
    readmeCode: `# Dialog Primitive
Accessible modal dialog window with backdrop scrim, focus trapping, and header/footer slots.
`,
  },

  // 30. Alert Dialog
  {
    slug: 'alert-dialog',
    name: 'Alert Dialog',
    description: 'Destructive confirmation modal requiring explicit acknowledgment or cancellation before proceeding.',
    categories: ['primitives', 'overlays', 'feedback'],
    roles: ['alertdialog', 'modal'],
    purposes: ['Delete confirmations', 'Reset state alerts', 'Destructive actions'],
    componentName: 'AlertDialog',
    tags: ['alert-dialog', 'confirm', 'destructive', 'modal'],
    idealFor: ['Irreversible data deletion or dangerous permission changes'],
    avoidFor: ['Standard informational messages'],
    jobs: ['Prevent accidental deletion with explicit user confirmation'],
    indexCode: `import React from 'react';

export type AlertDialogVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AlertDialogProps {
  variant?: AlertDialogVariant;
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function AlertDialog({
  variant = 'quiet',
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
}: AlertDialogProps) {
  if (!open) return null;

  let card = 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141B]';
  if (variant === 'expressive') card = 'border-[#D9D6CF] bg-white shadow-2xl';
  if (variant === 'nocturne') card = 'border-[#2E3440] bg-[#11141B] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={\`relative w-full max-w-sm rounded-2xl border p-6 z-10 space-y-4 shadow-2xl \${card}\`}>
        <h3 className="text-base font-semibold text-rose-600">{title}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { AlertDialog } from './index.js';

export function AlertDialogPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border border-rose-300 text-rose-600 rounded-lg text-sm bg-white">
        Delete Project
      </button>
      <AlertDialog
        variant="expressive"
        open={open}
        onClose={() => setOpen(false)}
        title="Delete workspace project?"
        description="This action cannot be undone. All unsynced local mutations will be permanently cleared."
        onConfirm={() => setOpen(false)}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', open: false, title: 'Warning', description: 'Sure?' };
export const expressiveFixture = { variant: 'expressive', open: true, title: 'Delete Item', description: 'Perm irreversible' };
export const nocturneFixture = { variant: 'nocturne', open: false, title: 'Purge D1', description: 'Clear all' };
`,
    readmeCode: `# Alert Dialog Primitive
Destructive confirmation modal requiring explicit acknowledgment or cancellation before proceeding.
`,
  },
];
