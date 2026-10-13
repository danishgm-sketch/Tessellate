import React, { useState } from 'react';
import type { ResourceManifest } from '@tessellate/schemas';
import { ArrowUpRight, Copy, Terminal, Check, Dna } from 'lucide-react';

export interface ResourceInspectorProps {
  manifest: ResourceManifest;
}

export function ResourceInspector({ manifest }: ResourceInspectorProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`import { ${manifest.name} } from "@/components/ui/${manifest.slug}";`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(`npx shadcn add @tessellate/${manifest.slug}`);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 1800);
  };

  return (
    <div className="sticky top-20 flex flex-col gap-5 rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] p-5 shadow-xs">
      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-2">
        <a
          href={`/workbench?resource=${manifest.slug}`}
          className="h-10 w-full rounded-lg bg-[var(--tess-cobalt,#2547E8)] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-[var(--tess-cobalt-hover,#1E3CCD)] transition-colors"
        >
          <span>Use in Workbench</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="h-9 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white text-[var(--tess-ink,#111217)] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[var(--tess-canvas,#F4F2ED)] transition-colors shadow-2xs"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy import'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyInstall}
            className="h-9 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white text-[var(--tess-ink,#111217)] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[var(--tess-canvas,#F4F2ED)] transition-colors shadow-2xs"
          >
            {copiedInstall ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>{copiedInstall ? 'Copied' : 'npx install'}</span>
          </button>
        </div>
      </div>

      <div className="h-[1px] bg-[var(--tess-hairline,#D9D6CF)]" />

      {/* Meta Specs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--tess-ink-secondary,#62666F)]">Quality Score</span>
          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            {manifest.quality.overall} / 100
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--tess-ink-secondary,#62666F)]">Category</span>
          <span className="font-medium text-[var(--tess-ink,#111217)] capitalize">
            {manifest.categories[0]}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--tess-ink-secondary,#62666F)]">SPDX License</span>
          <span className="font-mono font-semibold text-[var(--tess-cobalt,#2547E8)]">
            {manifest.license.spdx}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--tess-ink-secondary,#62666F)]">Creator</span>
          <span className="font-medium text-[var(--tess-ink,#111217)]">
            {manifest.creator.displayName}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--tess-ink-secondary,#62666F)]">Framework & Styling</span>
          <span className="font-mono text-[11px] text-[var(--tess-ink-secondary,#62666F)]">
            {manifest.framework} + {manifest.styling}
          </span>
        </div>
      </div>

      <div className="h-[1px] bg-[var(--tess-hairline,#D9D6CF)]" />

      {/* Design DNA Signature */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#8B8F97)]">
          <Dna className="w-3.5 h-3.5 text-[var(--tess-cobalt,#2547E8)]" />
          <span>Design DNA Profile</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { label: 'Density', val: manifest.visualDNA.density ?? 60 },
            { label: 'Visual Ambition', val: manifest.visualDNA.visualAmbition ?? 50 },
            { label: 'Contrast', val: manifest.visualDNA.contrast ?? 70 },
            { label: 'Curvature', val: manifest.visualDNA.curvature ?? 50 },
            { label: 'Motion', val: manifest.visualDNA.motion ?? 40 },
          ].map((dim, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px] text-[var(--tess-ink-secondary,#62666F)]">
                <span>{dim.label}</span>
                <span className="font-mono">{dim.val}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--tess-canvas-strong,#ECE9E2)] overflow-hidden">
                <div
                  className="h-full bg-[var(--tess-cobalt,#2547E8)] rounded-full transition-all"
                  style={{ width: `${dim.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
