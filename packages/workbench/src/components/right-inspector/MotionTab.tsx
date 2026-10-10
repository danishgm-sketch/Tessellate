import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { getEffectiveNodeDNA } from '../../utils/dna-helpers.js';
import type { PartialDesignDNA } from '@tessellate/schemas';
import { Wind, Activity } from 'lucide-react';

export function MotionTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const updateNodeDNA = useWorkbenchStore((state) => state.updateNodeDNA);
  const updateProjectDNA = useWorkbenchStore((state) => state.updateProjectDNA);
  const reducedMotion = useWorkbenchStore((state) => state.reducedMotion);
  const toggleReducedMotion = useWorkbenchStore((state) => state.toggleReducedMotion);

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

  const motionVal = effectiveDNA.motion ?? 40;

  return (
    <div data-testid="motion-tab" className="p-4 space-y-6 text-xs overflow-y-auto">
      {/* Reduced Motion Override Simulation */}
      <div className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#111217] dark:text-[#F5F7FA]">
            <Wind className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulate Reduced Motion</span>
          </div>
          <button
            onClick={toggleReducedMotion}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
              reducedMotion
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                : 'bg-[#FAF9F6] text-[#8B8F97] dark:bg-[#0B0D10]'
            }`}
          >
            {reducedMotion ? 'Active (WCAG)' : 'Inactive'}
          </button>
        </div>
        <p className="text-[11px] text-[#62666F] dark:text-[#A8AFBA]">
          Enforces instant transition durations, zero looping animations, and accessible focus state transitions.
        </p>
      </div>

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Motion Intensity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#111217] dark:text-[#F5F7FA]">
            <Activity className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#6782FF]" />
            <span>Motion Intensity</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
            {motionVal}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={motionVal}
          onChange={(e) => handleUpdate({ motion: Number(e.target.value) })}
          className="w-full h-1.5 bg-[#D9D6CF] dark:bg-[#272C34] rounded-lg appearance-none cursor-pointer accent-[#2547E8] dark:accent-[#6782FF]"
        />
        <div className="flex justify-between text-[10px] text-[#8B8F97] font-mono">
          <span>0 (Static)</span>
          <span>50 (Smooth)</span>
          <span>100 (Cinematic)</span>
        </div>
      </div>

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Motion Personality */}
      <div className="space-y-2">
        <span className="font-bold text-[#111217] dark:text-[#F5F7FA]">
          Motion Personality Preset
        </span>
        <div className="grid grid-cols-2 gap-2">
          {['precise', 'snappy', 'gliding', 'playful'].map((personality) => (
            <button
              key={personality}
              onClick={() => handleUpdate({ motionPersonality: personality })}
              className={`p-2 rounded-xl border text-left capitalize text-xs font-medium transition-all ${
                effectiveDNA.motionPersonality === personality
                  ? 'border-[#2547E8] bg-white dark:border-[#6782FF] dark:bg-[#171B21] text-[#2547E8] dark:text-[#6782FF] shadow-xs'
                  : 'border-[#D9D6CF] bg-[#FAF9F6] dark:border-[#272C34] dark:bg-[#0B0D10] text-[#62666F] dark:text-[#A8AFBA]'
              }`}
            >
              <div className="font-bold">{personality}</div>
              <div className="text-[10px] opacity-70">
                {personality === 'precise'
                  ? '120ms sharp ease-out'
                  : personality === 'snappy'
                  ? '180ms spring feel'
                  : personality === 'gliding'
                  ? '300ms smooth bezier'
                  : '250ms bouncy playful'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
