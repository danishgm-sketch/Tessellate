import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { getEffectiveNodeDNA } from '../../utils/dna-helpers.js';
import { FeelMixer } from '../feel-mixer/FeelMixer.js';
import {
  getVisualAmbitionStop,
  getStructuralCreativityStop,
  VISUAL_AMBITION_STOPS,
  STRUCTURAL_CREATIVITY_STOPS,
} from '@tessellate/dna';
import type { PartialDesignDNA } from '@tessellate/schemas';
import { Eye, Compass } from 'lucide-react';

export function IntentTab() {
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

  const visualAmbitionVal = effectiveDNA.visualAmbition ?? 50;
  const structuralCreativityVal = effectiveDNA.structuralCreativity ?? 40;

  const visualStop = getVisualAmbitionStop(visualAmbitionVal);
  const structuralStop = getStructuralCreativityStop(structuralCreativityVal);

  const visualDef = VISUAL_AMBITION_STOPS[visualStop];
  const structuralDef = STRUCTURAL_CREATIVITY_STOPS[structuralStop];

  const isVisualOverridden = nodeOverrides?.visualAmbition !== undefined;
  const isStructuralOverridden = nodeOverrides?.structuralCreativity !== undefined;

  return (
    <div data-testid="intent-tab" className="p-4 space-y-6 text-xs overflow-y-auto">
      {/* Feel Mixer */}
      <FeelMixer />

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Visual Ambition */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#111217] dark:text-[#F5F7FA]">
            <Eye className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#6782FF]" />
            <span>Visual Ambition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                isVisualOverridden
                  ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                  : 'bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#8B8F97]'
              }`}
            >
              {isVisualOverridden ? 'Overridden' : 'Inherited'}
            </span>
            <span className="font-mono text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
              {visualAmbitionVal}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={visualAmbitionVal}
          onChange={(e) => handleUpdate({ visualAmbition: Number(e.target.value) })}
          className="w-full h-1.5 bg-[#D9D6CF] dark:bg-[#272C34] rounded-lg appearance-none cursor-pointer accent-[#2547E8] dark:accent-[#6782FF]"
        />

        <div className="rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2.5 space-y-1">
          <div className="font-bold text-[#111217] dark:text-[#F5F7FA] capitalize">
            {visualDef.label}
          </div>
          <p className="text-[11px] text-[#62666F] dark:text-[#A8AFBA] leading-normal">
            {visualDef.description}
          </p>
        </div>
      </div>

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Structural Creativity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#111217] dark:text-[#F5F7FA]">
            <Compass className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#6782FF]" />
            <span>Structural Creativity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                isStructuralOverridden
                  ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                  : 'bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#8B8F97]'
              }`}
            >
              {isStructuralOverridden ? 'Overridden' : 'Inherited'}
            </span>
            <span className="font-mono text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
              {structuralCreativityVal}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={structuralCreativityVal}
          onChange={(e) => handleUpdate({ structuralCreativity: Number(e.target.value) })}
          className="w-full h-1.5 bg-[#D9D6CF] dark:bg-[#272C34] rounded-lg appearance-none cursor-pointer accent-[#2547E8] dark:accent-[#6782FF]"
        />

        <div className="rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2.5 space-y-1">
          <div className="font-bold text-[#111217] dark:text-[#F5F7FA] capitalize">
            {structuralDef.label}
          </div>
          <p className="text-[11px] text-[#62666F] dark:text-[#A8AFBA] leading-normal">
            {structuralDef.description}
          </p>
        </div>
      </div>
    </div>
  );
}
