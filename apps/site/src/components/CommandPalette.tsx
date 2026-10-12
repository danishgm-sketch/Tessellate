import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, Sparkles, Sliders, Code2, BookOpen, ExternalLink, X } from 'lucide-react';

export interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Pages' | 'Resources' | 'Actions';
  url?: string;
  action?: () => void;
  icon: React.ReactNode;
}

const DEFAULT_ITEMS: PaletteItem[] = [
  {
    id: 'compose',
    title: 'Compose Interface',
    subtitle: 'Generate UI directions from natural product intent',
    category: 'Pages',
    url: '/compose',
    icon: <Sparkles className="w-4 h-4 text-[var(--tess-cobalt,#2547E8)]" />,
  },
  {
    id: 'explore',
    title: 'Explore Library',
    subtitle: 'Browse all components, patterns, and motion primitives',
    category: 'Pages',
    url: '/explore',
    icon: <Compass className="w-4 h-4 text-[var(--tess-cobalt,#2547E8)]" />,
  },
  {
    id: 'workbench',
    title: 'Open Workbench',
    subtitle: 'Direct visual composition and Design DNA editor',
    category: 'Pages',
    url: '/workbench',
    icon: <Sliders className="w-4 h-4 text-[var(--tess-cobalt,#2547E8)]" />,
  },
  {
    id: 'resource-button',
    title: 'Button Primitive',
    subtitle: 'Tactile, accessible multi-intent button primitive',
    category: 'Resources',
    url: '/r/button',
    icon: <Code2 className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'dev-ui',
    title: 'Design System Gallery',
    subtitle: 'Inspect product-shell primitives and tokens',
    category: 'Pages',
    url: '/dev/ui',
    icon: <BookOpen className="w-4 h-4 text-amber-600" />,
  },
];

export function CommandPalette({ isOpen: controlledIsOpen, onClose }: CommandPaletteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (controlledIsOpen === undefined) {
          setInternalIsOpen((open) => !open);
        }
      } else if (e.key === 'Escape' && isModalOpen) {
        if (controlledIsOpen === undefined) {
          setInternalIsOpen(false);
        } else {
          onClose?.();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controlledIsOpen, isModalOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isModalOpen) {
      setQuery('');
      setSelectedIndex(0);
      const previous = document.activeElement as HTMLElement | null;
      inputRef.current?.focus();
      return () => previous?.focus();
    }
  }, [isModalOpen]);

  const handleClose = () => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    } else {
      onClose?.();
    }
  };

  const filteredItems = DEFAULT_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const term = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
      item.category.toLowerCase().includes(term)
    );
  });

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        if (selected.url) {
          window.location.href = selected.url;
        } else if (selected.action) {
          selected.action();
        }
        handleClose();
      }
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--tess-ink,#111217)]/30 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Palette Modal */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Search Tessellate" onKeyDown={event=>{
        if(event.key==='Tab') {
          const controls = dialogRef.current?.querySelectorAll<HTMLElement>('input,button,a[href]');
          const first=controls?.[0], last=controls?.[controls.length-1];
          if(event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
          else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
        }
      }} className="relative w-full max-w-xl rounded-xl border border-[var(--tess-hairline-strong,#C7C3BA)] bg-white shadow-xl overflow-hidden flex flex-col z-10 animate-in fade-in-0 zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)]">
          <Search className="w-4 h-4 text-[var(--tess-ink-muted,#8B8F97)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Search commands and resources"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            placeholder="Search commands, components, pages..."
            className="h-12 w-full bg-transparent text-sm text-[var(--tess-ink,#111217)] placeholder-[var(--tess-ink-muted,#8B8F97)] focus:outline-none"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={handleClose}
            className="p-1 rounded-md text-[var(--tess-ink-muted,#8B8F97)] hover:text-[var(--tess-ink,#111217)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[var(--tess-hairline,#D9D6CF)]/40">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--tess-ink-muted,#8B8F97)]">
              No matching commands or resources found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    if (item.url) window.location.href = item.url;
                    else if (item.action) item.action();
                    handleClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-[var(--tess-canvas,#F4F2ED)] text-[var(--tess-ink,#111217)]'
                      : 'hover:bg-neutral-50 text-[var(--tess-ink-secondary,#62666F)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-md bg-white border border-[var(--tess-hairline,#D9D6CF)] shadow-2xs">
                      {item.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--tess-ink,#111217)]">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-[11px] text-[var(--tess-ink-muted,#8B8F97)]">{item.subtitle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[var(--tess-ink-muted,#8B8F97)]">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--tess-canvas-strong,#ECE9E2)] font-mono">
                      {item.category}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="h-9 px-4 border-t border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-canvas,#F4F2ED)] flex items-center justify-between text-[11px] text-[var(--tess-ink-muted,#8B8F97)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-mono text-[10px]">Tessellate Search</span>
        </div>
      </div>
    </div>
  );
}
