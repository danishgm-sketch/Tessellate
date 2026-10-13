import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { getEffectiveNodeDNA } from '../../utils/dna-helpers.js';
import {
  SEMANTIC_PALETTES,
  TYPOGRAPHY_PAIRINGS,
} from '@tessellate/dna';
import type { PartialDesignDNA, VisualMode } from '@tessellate/schemas';
import { Palette, Box, Sun, Moon, Type } from 'lucide-react';

export function StyleTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const updateNodeDNA = useWorkbenchStore((state) => state.updateNodeDNA);
  const updateProjectDNA = useWorkbenchStore((state) => state.updateProjectDNA);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode =
    activeScreen && selectedNodeId
      ? findNodeById(activeScreen.rootNode, selectedNodeId)
      : null;

  const nodeOverrides = selectedNode?.dnaOverrides;
  const effectiveDNA = getEffectiveNodeDNA(manifest.designDNA, nodeOverrides);

  const handleUpdate = (partial: PartialDesignDNA) => {
    if (selectedNode) {
      updateNodeDNA(selectedNode.id, partial);
    } else {
      updateProjectDNA(partial);
    }
  };

  const curvatureVal = effectiveDNA.curvature ?? 30;
  const depthVal = effectiveDNA.depth ?? 25;
  const visualModeVal = effectiveDNA.visualMode ?? 'light';

  const isCurvatureOverridden = nodeOverrides?.curvature !== undefined;
  const isDepthOverridden = nodeOverrides?.depth !== undefined;
  const isModeOverridden = nodeOverrides?.visualMode !== undefined;

  return (
    <div data-testid="style-tab" className="p-4 space-y-6 text-xs overflow-y-auto">
      {/* Visual Mode */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#111217] dark:text-[#F5F7FA]">Visual Mode</span>
          <span
            className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
              isModeOverridden
                ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                : 'bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#8B8F97]'
            }`}
          >
            {isModeOverridden ? 'Overridden' : 'Inherited'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'adaptive'] as VisualMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleUpdate({ visualMode: mode })}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                visualModeVal === mode
                  ? 'border-[#2547E8] bg-white dark:border-[#6782FF] dark:bg-[#171B21] text-[#2547E8] dark:text-[#6782FF] shadow-xs'
                  : 'border-[#D9D6CF] bg-[#FAF9F6] dark:border-[#272C34] dark:bg-[#0B0D10] text-[#62666F] dark:text-[#A8AFBA]'
              }`}
            >
              {mode === 'light' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              <span>{mode}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Curvature / Radius */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#111217] dark:text-[#F5F7FA]">
            <Box className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#6782FF]" />
            <span>Corner Curvature</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                isCurvatureOverridden
                  ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                  : 'bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#8B8F97]'
              }`}
            >
              {isCurvatureOverridden ? 'Overridden' : 'Inherited'}
            </span>
            <span className="font-mono text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
              {curvatureVal}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={curvatureVal}
          onChange={(e) => handleUpdate({ curvature: Number(e.target.value) })}
          className="w-full h-1.5 bg-[#D9D6CF] dark:bg-[#272C34] rounded-lg appearance-none cursor-pointer accent-[#2547E8] dark:accent-[#6782FF]"
        />

        <div className="flex justify-between text-[10px] text-[#8B8F97] font-mono">
          <span>0 (Sharp / 0px)</span>
          <span>45 (Smooth / 14px)</span>
          <span>100 (Pill / 9999px)</span>
        </div>
      </div>

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Surface Depth */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#111217] dark:text-[#F5F7FA]">Elevation & Depth</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                isDepthOverridden
                  ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                  : 'bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#8B8F97]'
              }`}
            >
              {isDepthOverridden ? 'Overridden' : 'Inherited'}
            </span>
            <span className="font-mono text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
              {depthVal}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={depthVal}
          onChange={(e) => handleUpdate({ depth: Number(e.target.value) })}
          className="w-full h-1.5 bg-[#D9D6CF] dark:bg-[#272C34] rounded-lg appearance-none cursor-pointer accent-[#2547E8] dark:accent-[#6782FF]"
        />
        <div className="flex justify-between text-[10px] text-[#8B8F97] font-mono">
          <span>0 (Flat Bordered)</span>
          <span>50 (Elevated)</span>
          <span>100 (Deep Shadow)</span>
        </div>
      </div>

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Palette Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-[#111217] dark:text-[#F5F7FA]">
          <Palette className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#6782FF]" />
          <span>Semantic Palettes ({SEMANTIC_PALETTES.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {SEMANTIC_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() =>
                handleUpdate({
                  colourfulness: 50,
                })
              }
              className="flex items-center gap-2 p-2 rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] hover:border-[#2547E8] text-left transition-all"
            >
              <div
                style={{ backgroundColor: palette.light.accent }}
                className="h-4 w-4 rounded-full shrink-0 border border-black/10 shadow-xs"
              />
              <div className="overflow-hidden">
                <div className="font-semibold text-[11px] text-[#111217] dark:text-[#F5F7FA] truncate">
                  {palette.name}
                </div>
                <div className="text-[9px] text-[#8B8F97] truncate">{palette.mood}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Typography Pairings */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-[#111217] dark:text-[#F5F7FA]">
          <Type className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#6782FF]" />
          <span>Typography Pairings ({TYPOGRAPHY_PAIRINGS.length})</span>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {TYPOGRAPHY_PAIRINGS.slice(0, 8).map((tp) => {
            const headingClean = (tp.headingFont.split(',')[0] ?? 'Sans').replace(/"/g, '');
            const bodyClean = (tp.bodyFont.split(',')[0] ?? 'Sans').replace(/"/g, '');
            return (
              <button
                key={tp.id}
                onClick={() =>
                  handleUpdate({
                    typographyPersonality: tp.id,
                    typographicExpression: tp.scaleRatio > 1.25 ? 75 : 40,
                  })
                }
                className="w-full flex items-center justify-between p-2 rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] hover:border-[#2547E8] text-left transition-all"
              >
                <div>
                  <div className="font-semibold text-[11px] text-[#111217] dark:text-[#F5F7FA]">
                    {tp.name}
                  </div>
                  <div className="text-[10px] text-[#8B8F97] truncate max-w-[200px]">
                    {headingClean} + {bodyClean}
                  </div>
                </div>
                <span className="text-[9px] uppercase font-mono text-[#8B8F97]">
                  {tp.scaleRatio}x
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
