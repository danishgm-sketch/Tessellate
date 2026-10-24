import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Terminal,
  Shield,
  Zap,
  Layers,
  Sparkles,
  Command,
  Heart,
  Globe2,
  Eye,
  SlidersHorizontal,
  Table,
  Cpu,
  RefreshCw,
  Folder,
  FileText,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Trash2,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { CopyFailureNotice, useToolClipboard } from './useToolClipboard';

interface IconEntry {
  name: string;
  category: string;
  keywords: string[];
  Component: LucideIcon;
}

const ICONS_CATALOG: IconEntry[] = [
  {
    name: 'ArrowRight',
    category: 'Navigation',
    keywords: ['arrow', 'next', 'forward', 'right'],
    Component: ArrowRight,
  },
  {
    name: 'ArrowUpRight',
    category: 'Navigation',
    keywords: ['external', 'link', 'outbound', 'corner'],
    Component: ArrowUpRight,
  },
  {
    name: 'CheckCircle2',
    category: 'Feedback',
    keywords: ['success', 'done', 'confirmed', 'check'],
    Component: CheckCircle2,
  },
  {
    name: 'AlertCircle',
    category: 'Feedback',
    keywords: ['warning', 'error', 'alert', 'notice'],
    Component: AlertCircle,
  },
  {
    name: 'Activity',
    category: 'Analytics',
    keywords: ['pulse', 'chart', 'health', 'heartbeat'],
    Component: Activity,
  },
  {
    name: 'Terminal',
    category: 'Developer',
    keywords: ['cli', 'command', 'prompt', 'code'],
    Component: Terminal,
  },
  {
    name: 'Shield',
    category: 'Security',
    keywords: ['security', 'protect', 'safe', 'audit'],
    Component: Shield,
  },
  {
    name: 'Zap',
    category: 'Actions',
    keywords: ['lightning', 'fast', 'quick', 'energy'],
    Component: Zap,
  },
  {
    name: 'Layers',
    category: 'Interface',
    keywords: ['stack', 'layout', 'components', 'hierarchy'],
    Component: Layers,
  },
  {
    name: 'Sparkles',
    category: 'Interface',
    keywords: ['magic', 'ai', 'generate', 'clean'],
    Component: Sparkles,
  },
  {
    name: 'Command',
    category: 'Developer',
    keywords: ['keyboard', 'cmd', 'shortcut', 'macro'],
    Component: Command,
  },
  {
    name: 'Heart',
    category: 'Actions',
    keywords: ['like', 'love', 'favorite', 'sponsor'],
    Component: Heart,
  },
  {
    name: 'Globe2',
    category: 'Navigation',
    keywords: ['world', 'web', 'internet', 'global'],
    Component: Globe2,
  },
  {
    name: 'Eye',
    category: 'Interface',
    keywords: ['view', 'inspect', 'preview', 'look'],
    Component: Eye,
  },
  {
    name: 'SlidersHorizontal',
    category: 'Interface',
    keywords: ['settings', 'tune', 'filter', 'adjust'],
    Component: SlidersHorizontal,
  },
  {
    name: 'Table',
    category: 'Analytics',
    keywords: ['records', 'grid', 'rows', 'spreadsheet'],
    Component: Table,
  },
  {
    name: 'Cpu',
    category: 'Developer',
    keywords: ['processor', 'hardware', 'compute', 'chip'],
    Component: Cpu,
  },
  {
    name: 'RefreshCw',
    category: 'Actions',
    keywords: ['reload', 'sync', 'reset', 'update'],
    Component: RefreshCw,
  },
  {
    name: 'Folder',
    category: 'Files',
    keywords: ['directory', 'storage', 'collection', 'archive'],
    Component: Folder,
  },
  {
    name: 'FileText',
    category: 'Files',
    keywords: ['document', 'page', 'manifest', 'article'],
    Component: FileText,
  },
  {
    name: 'Lock',
    category: 'Security',
    keywords: ['locked', 'protect', 'immutable', 'safe'],
    Component: Lock,
  },
  {
    name: 'Unlock',
    category: 'Security',
    keywords: ['unlocked', 'open', 'mutable', 'free'],
    Component: Unlock,
  },
  {
    name: 'Maximize2',
    category: 'Interface',
    keywords: ['expand', 'fullscreen', 'grow', 'zoom'],
    Component: Maximize2,
  },
  {
    name: 'Minimize2',
    category: 'Interface',
    keywords: ['collapse', 'shrink', 'dock', 'reduce'],
    Component: Minimize2,
  },
  {
    name: 'Trash2',
    category: 'Actions',
    keywords: ['delete', 'remove', 'discard', 'clear'],
    Component: Trash2,
  },
  {
    name: 'Plus',
    category: 'Actions',
    keywords: ['add', 'create', 'new', 'insert'],
    Component: Plus,
  },
];

export function IconLab() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIconName, setSelectedIconName] = useState<string>('Sparkles');
  const [iconSize, setIconSize] = useState<number>(24);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [colorHex, setColorHex] = useState<string>('#2547E8');
  const [hasBadge, setHasBadge] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<'jsx' | 'svg' | null>(null);
  const { copyText, copyFailed } = useToolClipboard();
  const selectedIconSvgRef = useRef<SVGSVGElement>(null);

  const categories = [
    'All',
    'Navigation',
    'Feedback',
    'Analytics',
    'Developer',
    'Security',
    'Interface',
    'Actions',
    'Files',
  ];

  const filteredIcons = useMemo(() => {
    return ICONS_CATALOG.filter((i) => {
      const matchCat = selectedCategory === 'All' || i.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const selectedIcon = useMemo(() => {
    return ICONS_CATALOG.find((i) => i.name === selectedIconName) ?? ICONS_CATALOG[0]!;
  }, [selectedIconName]);

  const SelectedComponent = selectedIcon.Component;

  // Generated React JSX snippet
  const generatedJsx = useMemo(() => {
    return `<${selectedIcon.name} size={${iconSize}} strokeWidth={${strokeWidth}} color="${colorHex}" />`;
  }, [selectedIcon, iconSize, strokeWidth, colorHex]);

  const copyToClipboard = async (text: string, format: 'jsx' | 'svg') => {
    const copied = await copyText(text);
    setCopiedFormat(copied ? format : null);
    if (copied) setTimeout(() => setCopiedFormat(null), 2000);
  };

  const copySelectedSvg = () => {
    const preview = selectedIconSvgRef.current;
    if (!preview) return;
    const standalone = preview.cloneNode(true) as SVGSVGElement;
    standalone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    standalone.setAttribute('width', String(iconSize));
    standalone.setAttribute('height', String(iconSize));
    standalone.setAttribute('viewBox', '0 0 24 24');
    standalone.setAttribute('fill', 'none');
    standalone.setAttribute('stroke', colorHex);
    standalone.setAttribute('stroke-width', String(strokeWidth));
    standalone.setAttribute('stroke-linecap', 'round');
    standalone.setAttribute('stroke-linejoin', 'round');
    const licenseComment = document.createComment(`${selectedIcon.name} (Lucide ISC License)`);
    standalone.insertBefore(licenseComment, standalone.firstChild);
    copyToClipboard(new XMLSerializer().serializeToString(standalone), 'svg');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D6CF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Tool 10 · Permissive Icon Vocabulary
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login · ISC License
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            SVG / Icon Lab
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Inspect, tune stroke geometry, recolour, and export permissively licensed icons for
            production.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(generatedJsx, 'jsx')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm"
          >
            {copiedFormat === 'jsx' ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>Copy React Icon JSX</span>
          </button>
        </div>
      </div>

      <CopyFailureNotice failed={copyFailed} />

      {/* Main Grid: Parameters (Left 4), Library Grid (Center 5), Preview Inspector (Right 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tuner Controls (Col 4) */}
        <div className="lg:col-span-4 space-y-6 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#2547E8]" />
              <h2 className="text-sm font-semibold text-[#111217]">Icon Geometry Tuner</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setIconSize(24);
                setStrokeWidth(2);
                setColorHex('#2547E8');
                setHasBadge(false);
              }}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#111217] flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#111217]">Optical Box Size</span>
              <span className="font-mono text-[#62666F]">{iconSize}px</span>
            </div>
            <input
              aria-label="Icon size"
              type="range"
              min="16"
              max="64"
              step="4"
              value={iconSize}
              onChange={(e) => setIconSize(Number(e.target.value))}
              className="w-full accent-[#2547E8] cursor-pointer"
            />
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#111217]">Stroke Weight</span>
              <span className="font-mono text-[#62666F]">{strokeWidth}px</span>
            </div>
            <input
              aria-label="Icon stroke width"
              type="range"
              min="1"
              max="3.5"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-[#2547E8] cursor-pointer"
            />
          </div>

          {/* Color Selector */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <label className="block text-xs font-semibold text-[#111217]">Icon Chroma</label>
            <div className="flex items-center gap-2">
              <input
                aria-label="Icon colour picker"
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border border-[#D9D6CF]"
              />
              <input
                aria-label="Icon colour hex value"
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
              />
            </div>
          </div>

          {/* Badge Frame Toggle */}
          <div className="pt-2 border-t border-[#D9D6CF] flex items-center justify-between">
            <span className="text-xs font-medium text-[#111217]">Background Tile Badge</span>
            <input
              aria-label="Has badge"
              type="checkbox"
              checked={hasBadge}
              onChange={(e) => setHasBadge(e.target.checked)}
              className="accent-[#2547E8] rounded"
            />
          </div>
        </div>

        {/* Icon Catalog Browser (Col 8) */}
        <div className="lg:col-span-8 space-y-4 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          {/* Search Bar + Categories */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                aria-label="Filter presets"
                type="text"
                placeholder="Search icons (e.g. arrow, lock)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-1 max-w-full overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                    selectedCategory === c
                      ? 'bg-[#111217] text-white'
                      : 'text-[#62666F] hover:text-[#111217] bg-[#FAF9F6]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-3 border-t border-[#D9D6CF]">
            {filteredIcons.map((item) => {
              const Comp = item.Component;
              const isSelected = selectedIconName === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIconName(item.name)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#2547E8] bg-[#E7EBFF] shadow-sm'
                      : 'border-[#D9D6CF] bg-[#FAF9F6] hover:border-[#111217] hover:bg-white'
                  }`}
                >
                  <div
                    className={hasBadge ? 'p-2 rounded-lg bg-white border border-[#D9D6CF]/70' : ''}
                  >
                    <Comp size={iconSize} strokeWidth={strokeWidth} color={colorHex} />
                  </div>
                  <span className="text-[10px] font-mono text-[#62666F] mt-2 line-clamp-1">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inspection & Code Export Footer */}
          <div className="pt-4 border-t border-[#D9D6CF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs">
              <div className="p-1.5 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF]">
                <SelectedComponent
                  ref={selectedIconSvgRef}
                  aria-hidden="true"
                  size={18}
                  strokeWidth={strokeWidth}
                  color={colorHex}
                />
              </div>
              <span className="font-semibold text-[#111217]">Selected: {selectedIcon.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#D9D6CF] text-[#62666F]">
                {selectedIcon.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(generatedJsx, 'jsx')}
                className="px-3 py-1.5 rounded-lg border border-[#D9D6CF] text-xs font-semibold text-[#111217] hover:bg-[#FAF9F6]"
              >
                {copiedFormat === 'jsx' ? 'Copied JSX!' : 'Copy JSX'}
              </button>
              <button
                type="button"
                onClick={copySelectedSvg}
                className="px-3 py-1.5 rounded-lg bg-[#111217] text-white text-xs font-semibold hover:bg-[#2547E8]"
              >
                {copiedFormat === 'svg' ? 'Copied SVG!' : 'Copy SVG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
