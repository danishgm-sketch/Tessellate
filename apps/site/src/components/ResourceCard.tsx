import React, { useState, useEffect, useRef } from 'react';
import {isGoldResource} from '@tessellate/catalog/gold';
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
  const [actionError,setActionError]=useState('');
  const gold=isGoldResource(manifest.slug);
  useEffect(()=>{const read=()=>{try {const stored:unknown=JSON.parse(localStorage.getItem('tessellate_saved_resources') ?? '[]');if(Array.isArray(stored))setSaved(stored.includes(manifest.slug));}catch{setActionError('Saved collection could not be read. Its data has been preserved.');}};read();window.addEventListener('tessellate-saved-resources-changed',read);return ()=>window.removeEventListener('tessellate-saved-resources-changed',read);},[manifest.slug]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const previewRef=useRef<HTMLDivElement>(null);
  const [previewVisible,setPreviewVisible]=useState(false);
  useEffect(()=>{
    if(typeof IntersectionObserver==='undefined'){setPreviewVisible(true);return undefined;}
    // Mount the isolated resource runtime only when its card enters the viewport.
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){setPreviewVisible(true);observer.disconnect();}
    },{rootMargin:'0px'});
    if(previewRef.current)observer.observe(previewRef.current);
    return ()=>observer.disconnect();
  },[]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    void navigator.clipboard.writeText(`npx shadcn@latest add ${window.location.origin}/r/${manifest.slug}.json`).then(()=>{setCopied(true);setActionError('');}).catch(cause=>setActionError(`Copy failed: ${String(cause)}`));
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {const stored:unknown=JSON.parse(localStorage.getItem('tessellate_saved_resources') ?? '[]');if(!Array.isArray(stored) || stored.some(value=>typeof value!=='string'))throw new Error('Stored collection is invalid; preserving it.');const slugs=new Set<string>(stored);if(saved)slugs.delete(manifest.slug);else slugs.add(manifest.slug);localStorage.setItem('tessellate_saved_resources',JSON.stringify([...slugs]));setSaved(!saved);setActionError('');window.dispatchEvent(new Event('tessellate-saved-resources-changed'));}catch(cause){setActionError(String(cause));}
    onSave?.(manifest);
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] transition-all duration-200 hover:border-[var(--tess-hairline-strong,#C7C3BA)] hover:shadow-md overflow-hidden">
      {/* 16:10 Preview Frame */}
      <div ref={previewRef} className="relative aspect-[16/10] w-full bg-[var(--tess-canvas,#F4F2ED)] border-b border-[var(--tess-hairline,#D9D6CF)] flex items-center justify-center p-6 overflow-hidden">
        {previewVisible ? <iframe src={`/preview-content/?resource=${manifest.slug}`} title={`${manifest.name} actual preview`} sandbox="allow-scripts" loading="lazy" className="w-full h-full border-0 bg-white" /> : <span className="text-xs text-[var(--tess-ink-muted)]">Preview loads when visible</span>}
        {/* Hover Actions Overlay (Max 4 actions: Preview, Save, Use, Copy) */}
        <div className="absolute inset-x-0 bottom-0 sm:inset-0 bg-white sm:bg-[var(--tess-ink,#111217)]/10 backdrop-blur-0 sm:backdrop-blur-[2px] opacity-100 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2 px-2 py-2 sm:p-4">
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

          {gold && <a
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
          </a>}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy registry install command"
            className="h-8 w-8 rounded-lg bg-white text-[var(--tess-ink,#111217)] flex items-center justify-center shadow-sm hover:bg-neutral-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {actionError && <p role="alert" className="p-3 text-xs">{actionError}</p>}
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

        <div className="flex items-center justify-between text-xs text-[var(--tess-ink-muted,#62666F)]">
          <span className="line-clamp-1">{manifest.creator.displayName}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] uppercase font-mono tracking-tight text-[var(--tess-ink-secondary,#62666F)]">
              {manifest.license.spdx}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[var(--tess-ink-secondary)]">{gold ? 'Gold runtime · composition and browser export' : 'Live sandbox preview · source download'}</p>
      </div>
    </div>
  );
}
