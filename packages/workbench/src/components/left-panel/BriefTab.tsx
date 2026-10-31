import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { Shield, Sparkles, CheckCircle, Ban } from 'lucide-react';
import { getProductArchetype, specialisePeopleOperations } from '@tessellate/composer';
import type { ProjectManifest } from '@tessellate/schemas';

function getArchetypeDisplayName(tag: string, description: string): string {
  const definition = getProductArchetype(tag);
  return definition ? specialisePeopleOperations(definition, description).name : tag;
}

export function BriefTab({
  projectManifest,
}: {
  projectManifest?: ProjectManifest;
} = {}) {
  const storedManifest = useWorkbenchStore((state) => state.manifest);
  const manifest = projectManifest ?? storedManifest;
  const model = manifest.productModel;

  return (
    <div data-testid="brief-tab" className="p-4 space-y-6 text-xs overflow-y-auto">
      {/* Product Overview */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#2547E8] dark:text-[#879DFF]">
          <Sparkles className="h-3 w-3" />
          <span>Product Intent Model</span>
        </div>
        <h3 className="text-sm font-bold text-[#111217] dark:text-[#F5F7FA]">
          {manifest.name}
        </h3>
        <p className="text-xs text-[#62666F] dark:text-[#A8AFBA] leading-relaxed">
          {manifest.description || 'No description provided.'}
        </p>
      </div>

      {/* Target Audience & Objective */}
      <div className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3 space-y-3">
        <div>
          <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">Target Audience</span>
          <p className="mt-0.5 text-xs font-medium text-[#111217] dark:text-[#F5F7FA]">
            {model.primaryAudience}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">Primary Objective</span>
          <p className="mt-0.5 text-xs font-medium text-[#111217] dark:text-[#F5F7FA]">
            {model.primaryObjective}
          </p>
        </div>
      </div>

      {/* Prior Dimensions */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider">
          Inferred Priors & Thresholds
        </span>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2 text-center">
            <span className="text-[10px] text-[#62666F] dark:text-[#A8AFBA]">Trust Req</span>
            <div className="mt-1 text-sm font-bold text-[#111217] dark:text-[#F5F7FA]">
              {model.trustRequirement}%
            </div>
          </div>
          <div className="rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2 text-center">
            <span className="text-[10px] text-[#62666F] dark:text-[#A8AFBA]">Data Density</span>
            <div className="mt-1 text-sm font-bold text-[#111217] dark:text-[#F5F7FA]">
              {model.dataDensity}%
            </div>
          </div>
          <div className="rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2 text-center">
            <span className="text-[10px] text-[#62666F] dark:text-[#A8AFBA]">Sophistication</span>
            <div className="mt-1 text-sm font-bold text-[#111217] dark:text-[#F5F7FA]">
              {model.userSophistication}%
            </div>
          </div>
        </div>
      </div>

      {/* Primary Archetypes */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider">
          Identified Archetypes
        </span>
        <div className="space-y-1.5">
          {model.productArchetypes.map((arch, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#111217] dark:text-[#F5F7FA] capitalize">
                  {getArchetypeDisplayName(arch.tag, manifest.description ?? '')}
                </span>
              </div>
              <span className="rounded bg-[#E7EBFF] dark:bg-[#1C2752] px-1.5 py-0.5 text-[10px] font-bold text-[#2547E8] dark:text-[#879DFF]">
                {Math.round(arch.weight)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints & Prohibited */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider">
          Hard Constraints
        </span>
        <div className="space-y-2">
          {model.constraints.requiredScreens && (
            <div className="flex items-start gap-2 text-xs text-[#111217] dark:text-[#F5F7FA]">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Required screens: </span>
                <span className="text-[#62666F] dark:text-[#A8AFBA]">
                  {model.constraints.requiredScreens.join(', ')}
                </span>
              </div>
            </div>
          )}
          {model.constraints.forbiddenPatterns &&
            model.constraints.forbiddenPatterns.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-[#111217] dark:text-[#F5F7FA]">
              <Ban className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Forbidden patterns: </span>
                <span className="text-[#62666F] dark:text-[#A8AFBA]">
                  {model.constraints.forbiddenPatterns.join(', ')}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-[#111217] dark:text-[#F5F7FA]">
            <Shield className="h-3.5 w-3.5 text-[#2547E8] shrink-0" />
            <span>
              Accessibility floor: <strong>{model.constraints.accessibilityFloor}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
