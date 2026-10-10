import React, { useState } from 'react';
import {
  Mark,
  Button,
  Input,
  Textarea,
  Select,
  Chip,
  Tabs,
  SegmentedControl,
  Slider,
  WorkbenchToolbar,
  WorkbenchPanel,
  WorkbenchCommandBar,
} from '@tessellate/ui';

export function UiGallery() {
  const [activeTab, setActiveTab] = useState('primitives');
  const [activeSegment, setActiveSegment] = useState<'essential' | 'refined' | 'striking'>('refined');
  const [sliderValue, setSliderValue] = useState(75);
  const [commandValue, setCommandValue] = useState('');

  return (
    <div className="space-y-16">
      <div>
        <div className="flex items-center gap-3">
          <Mark size={32} />
          <h1 className="text-3xl font-semibold tracking-tight">Product-Shell UI Primitives</h1>
        </div>
        <p className="mt-2 text-sm text-[#62666F] dark:text-[#A8AFBA]">
          Tessellate Design System gallery demonstrating light and dark shell tokens, primitives and focus handling.
        </p>
      </div>

      {/* Mark & Branding */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">1. Geometric Tile Mark</h2>
        <div className="flex items-center gap-6 rounded-2xl border border-[#D9D6CF] bg-[#FFFFFF] p-6 dark:border-[#272C34] dark:bg-[#111419]">
          <div className="flex flex-col items-center gap-2">
            <Mark size={16} />
            <span className="text-[11px] text-[#8B8F97]">16px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Mark size={24} />
            <span className="text-[11px] text-[#8B8F97]">24px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Mark size={36} />
            <span className="text-[11px] text-[#8B8F97]">36px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Mark size={48} />
            <span className="text-[11px] text-[#8B8F97]">48px</span>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">2. Buttons & Variants</h2>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#D9D6CF] bg-[#FFFFFF] p-6 dark:border-[#272C34] dark:bg-[#111419]">
          <Button variant="primary" size="sm">Primary SM</Button>
          <Button variant="primary" size="md">Primary MD</Button>
          <Button variant="primary" size="lg">Primary LG</Button>
          <Button variant="secondary" size="md">Secondary</Button>
          <Button variant="tertiary" size="md">Tertiary Ghost</Button>
          <Button variant="destructive" size="md">Destructive</Button>
          <Button variant="primary" size="md" disabled>Disabled</Button>
        </div>
      </section>

      {/* Form Controls */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">3. Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-[#D9D6CF] bg-[#FFFFFF] p-6 dark:border-[#272C34] dark:bg-[#111419]">
          <div className="space-y-4">
            <label className="block text-xs font-medium text-[#62666F] dark:text-[#A8AFBA]">Standard Input</label>
            <Input density="standard" placeholder="Describe the interface outcome..." />

            <label className="block text-xs font-medium text-[#62666F] dark:text-[#A8AFBA]">Compact Input (Workbench)</label>
            <Input density="compact" placeholder="Compact property value..." />

            <label className="block text-xs font-medium text-[#62666F] dark:text-[#A8AFBA]">Select Dropdown</label>
            <Select
              options={[
                { label: 'Essential (Restrained)', value: 'essential' },
                { label: 'Refined (Standard)', value: 'refined' },
                { label: 'Striking (Expressive)', value: 'striking' },
                { label: 'Stunning (Rich)', value: 'stunning' },
                { label: 'Experimental (Radical)', value: 'experimental' },
              ]}
            />
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-medium text-[#62666F] dark:text-[#A8AFBA]">Textarea</label>
            <Textarea rows={4} placeholder="Product description, target audience, key jobs to be done..." />
          </div>
        </div>
      </section>

      {/* Chips & Tags */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">4. Chips & Indicators</h2>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#D9D6CF] bg-[#FFFFFF] p-6 dark:border-[#272C34] dark:bg-[#111419]">
          <Chip variant="default">Default Tag</Chip>
          <Chip variant="default" selected>Selected Tag</Chip>
          <Chip variant="accent">Accent (Cobalt)</Chip>
          <Chip variant="subtle">Subtle Outline</Chip>
          <Chip variant="default" onRemove={() => {}}>Dismissible</Chip>
        </div>
      </section>

      {/* Interactive Controls */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">5. Interactive Controls</h2>
        <div className="space-y-6 rounded-2xl border border-[#D9D6CF] bg-[#FFFFFF] p-6 dark:border-[#272C34] dark:bg-[#111419]">
          <div>
            <span className="block text-xs font-medium text-[#62666F] dark:text-[#A8AFBA] mb-2">Tabs Component</span>
            <Tabs
              activeId={activeTab}
              onChange={setActiveTab}
              items={[
                { id: 'primitives', label: 'Primitives' },
                { id: 'navigation', label: 'Navigation', count: 36 },
                { id: 'marketing', label: 'Marketing', count: 72 },
              ]}
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-[#62666F] dark:text-[#A8AFBA] mb-2">Segmented Control</span>
            <SegmentedControl
              value={activeSegment}
              onChange={setActiveSegment}
              options={[
                { label: 'Essential', value: 'essential' },
                { label: 'Refined', value: 'refined' },
                { label: 'Striking', value: 'striking' },
              ]}
            />
          </div>

          <div>
            <Slider
              label="Visual Ambition Level"
              value={sliderValue}
              onChange={setSliderValue}
            />
          </div>
        </div>
      </section>

      {/* Workbench Dark Chrome Preview */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">6. Workbench Dark Chrome</h2>
        <div className="overflow-hidden rounded-2xl border border-[#272C34] bg-[#0B0D10] text-[#F5F7FA]">
          <WorkbenchToolbar
            left={
              <div className="flex items-center gap-2">
                <Mark size={20} />
                <span className="font-semibold text-xs">Fintech Terminal Demo</span>
              </div>
            }
            center={
              <div className="flex items-center gap-1">
                <Button size="sm" variant="secondary">Structure</Button>
                <Button size="sm" variant="primary">Design DNA</Button>
                <Button size="sm" variant="secondary">Audit</Button>
              </div>
            }
            right={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#707986]">100%</span>
                <Button size="sm" variant="primary">Export</Button>
              </div>
            }
          />

          <div className="flex h-64">
            <WorkbenchPanel side="left" title="Semantic Layers">
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="text-[#6782FF]">▸ AppShell (DualRail)</div>
                <div className="pl-3 text-[#A8AFBA]">▸ Header (DataTerminal)</div>
                <div className="pl-3 text-[#A8AFBA]">▸ KPIGrid (MultiMetric)</div>
                <div className="pl-3 text-[#A8AFBA]">▸ ChartSection (YieldCurve)</div>
              </div>
            </WorkbenchPanel>

            <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-[#707986]">
              [Central Composition Canvas with 24px subtle grid]
            </div>

            <WorkbenchPanel side="right" title="Design DNA Inspector">
              <div className="space-y-3">
                <div className="text-[11px] text-[#A8AFBA]">Professionalism: 95/100</div>
                <div className="text-[11px] text-[#A8AFBA]">Technicality: 90/100</div>
                <div className="text-[11px] text-[#A8AFBA]">Curvature: 15/100</div>
              </div>
            </WorkbenchPanel>
          </div>

          <WorkbenchCommandBar
            value={commandValue}
            onChange={setCommandValue}
          />
        </div>
      </section>
    </div>
  );
}
