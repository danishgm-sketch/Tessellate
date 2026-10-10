import React, { useState } from 'react';
import type { ResourceManifest } from '@tessellate/schemas';
import { Eye, Bookmark, ArrowUpRight, Copy, Check } from 'lucide-react';

export interface ResourceCardProps {
  manifest: ResourceManifest;
  onPreview?: (manifest: ResourceManifest) => void;
  onUse?: (manifest: ResourceManifest) => void;
  onSave?: (manifest: ResourceManifest) => void;
}

export function ResourceCard({
  manifest,
  onPreview,
  onUse,
  onSave,
}: ResourceCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(`npx shadcn add @tessellate/${manifest.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSaved(!saved);
    onSave?.(manifest);
  };

  const qualityScore = manifest.quality.overall;
  const isVerified = manifest.status === 'verified';

  return (
    <div className="group relative flex flex-col rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] transition-all duration-200 hover:border-[var(--tess-hairline-strong,#C7C3BA)] hover:shadow-md overflow-hidden">
      {/* 16:10 Preview Frame */}
      <div className="relative aspect-[16/10] w-full bg-[var(--tess-canvas,#F4F2ED)] border-b border-[var(--tess-hairline,#D9D6CF)] flex items-center justify-center p-6 overflow-hidden">
        {/* Placeholder or mini representation */}
        <div className="flex flex-col items-center justify-center gap-2 text-center pointer-events-none select-none">
          <div className="h-9 px-4 rounded-lg bg-[var(--tess-cobalt,#2547E8)] text-white text-sm font-medium flex items-center justify-center shadow-xs">
            {manifest.name}
          </div>
          <span className="text-[11px] font-mono text-[var(--tess-ink-secondary,#62666F)]">
            {manifest.variants.length} curated variants
          </span>
        </div>

        {/* Hover Actions Overlay (Max 4 actions: Preview, Save, Use, Copy) */}
        <div className="absolute inset-0 bg-[var(--tess-ink,#111217)]/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2 p-4">
          <a
            href={`/r/${manifest.slug}`}
            onClick={(e) => {
              if (onPreview) {
                e.preventDefault();
                onPreview(manifest);
              }
            }}
            title="Preview resource"
            className="h-8 px-2.5 rounded-lg bg-white text-[var(--tess-ink,#111217)] text-xs font-medium flex items-center gap-1.5 shadow-sm hover:bg-neutral-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            title={saved ? 'Saved' : 'Save to collection'}
            className="h-8 w-8 rounded-lg bg-white text-[var(--tess-ink,#111217)] flex items-center justify-center shadow-sm hover:bg-neutral-100 transition-colors"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[var(--tess-cobalt,#2547E8)] text-[var(--tess-cobalt,#2547E8)]' : ''}`} />
          </button>

          <a
            href={`/workbench?resource=${manifest.slug}`}
            onClick={(e) => {
              if (onUse) {
                e.preventDefault();
                onUse(manifest);
              }
            }}
            title="Open in Workbench"
            className="h-8 px-2.5 rounded-lg bg-[var(--tess-cobalt,#2547E8)] text-white text-xs font-medium flex items-center gap-1 shadow-sm hover:bg-[var(--tess-cobalt-hover,#1E3CCD)] transition-colors"
          >
            <span>Use</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy registry install command"
            className="h-8 w-8 rounded-lg bg-white text-[var(--tess-ink,#111217)] flex items-center justify-center shadow-sm hover:bg-neutral-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <a
            href={`/r/${manifest.slug}`}
            className="text-sm font-semibold text-[var(--tess-ink,#111217)] hover:text-[var(--tess-cobalt,#2547E8)] transition-colors line-clamp-1"
          >
            {manifest.name}
          </a>
          <span className="shrink-0 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--tess-canvas-strong,#ECE9E2)] text-[var(--tess-ink-secondary,#62666F)]">
            {manifest.resourceType}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--tess-ink-muted,#8B8F97)]">
          <span className="line-clamp-1">{manifest.creator.displayName}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isVerified && (
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {qualityScore}
              </span>
            )}
            <span className="text-[10px] uppercase font-mono tracking-tight text-[var(--tess-ink-secondary,#62666F)]">
              {manifest.license.spdx}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
