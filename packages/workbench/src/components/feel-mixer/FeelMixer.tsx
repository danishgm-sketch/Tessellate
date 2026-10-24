import React, { useId, useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import {
  getScopedDNA, isScopeLocked,
  extractFeelTraits,
  mapFeelPhraseToDna,
  CANONICAL_FEEL_TRAITS,
} from '../../utils/dna-helpers.js';
import type { PartialDesignDNA } from '@tessellate/schemas';
import { Sliders, RotateCcw } from 'lucide-react';

export function FeelMixer() {
  const controlId = useId();
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const updateNodeDNA = useWorkbenchStore((state) => state.updateNodeDNA);
  const updateProjectDNA = useWorkbenchStore((state) => state.updateProjectDNA);
  const resetNodeDNA = useWorkbenchStore((state) => state.resetNodeDNA);

  const [phraseInput, setPhraseInput] = useState('');
  const pinnedTraits = [
    'professionalism',
    'playfulness',
    'warmth',
    'technicality',
    'luxury',
  ];

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode =
    activeScreen && selectedNodeId
      ? findNodeById(activeScreen.rootNode, selectedNodeId)
      : null;

  const nodeOverrides = selectedNode?.dnaOverrides;
  const locked = isScopeLocked(manifest,activeScreenId,selectedNodeId);
  const effectiveDNA = getScopedDNA(manifest, activeScreenId, selectedNodeId);
  const traits = extractFeelTraits(effectiveDNA, nodeOverrides, pinnedTraits);

  const statusLabel = (status: string) => {
    if (locked) return 'Locked';
    if (!selectedNode) return 'Project';
    return status === 'overridden' ? 'Overridden' : 'Inherited';
  };

  const handleTraitChange = (id: string, value: number) => {
    const canonical = CANONICAL_FEEL_TRAITS.find((t) => t.id === id);
    const key = canonical?.dnaKey ?? id;
    const partial: PartialDesignDNA = { [key]: value };

    if (selectedNode) {
      updateNodeDNA(selectedNode.id, partial);
    } else {
      updateProjectDNA(partial);
    }
  };

  const handleApplyPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phraseInput.trim()) return;

    const mapped = mapFeelPhraseToDna(phraseInput);
    if (mapped) {
      if (selectedNode) {
        updateNodeDNA(selectedNode.id, mapped);
      } else {
        updateProjectDNA(mapped);
      }
      setPhraseInput('');
    }
  };

  const handleResetNode = () => {
    if (selectedNode) {
      resetNodeDNA(selectedNode.id);
    }
  };

  return (
    <div data-testid="feel-mixer" className="space-y-4">
      <fieldset disabled={locked} className="space-y-4 border-0 p-0 m-0 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111217] dark:text-[#F5F7FA]">
          <Sliders className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#879DFF]" />
          <span>Feel Mixer (5 Pinned Traits)</span>
        </div>
        {selectedNode && nodeOverrides && Object.keys(nodeOverrides).length > 0 && (
          <button
            onClick={handleResetNode}
            className="flex items-center gap-1 text-[10px] text-[#2547E8] dark:text-[#879DFF] hover:underline"
            title="Remove local DNA overrides and inherit from this node's ancestors"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset to Inherited</span>
          </button>
        )}
      </div>

      {/* Trait Sliders */}
      <div className="space-y-3">
        {traits.map((trait) => {
          const label = statusLabel(trait.status);
          const statusClass = locked
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
            : trait.status === 'overridden' && selectedNode
              ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
              : 'bg-[#FAF9F6] dark:bg-[#0B0D10] text-[var(--text-muted)]';
          return (
          <div key={trait.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#111217] dark:text-[#F5F7FA]">
                {trait.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${statusClass}`}
                >
                  {label}
                </span>
                <span className="font-mono text-xs font-bold text-[#111217] dark:text-[#F5F7FA] w-7 text-right">
                  {trait.value}
                </span>
              </div>
            </div>

            <input
              id={`${controlId}-${trait.id}`}
              name={`feel-${trait.id}`}
              type="range"
              aria-label={trait.name}
              min={0}
              max={100}
              value={trait.value}
              onChange={(e) => handleTraitChange(trait.id, Number(e.target.value))}
              className="w-full h-1.5 bg-[#D9D6CF] dark:bg-[#272C34] rounded-lg appearance-none cursor-pointer accent-[#2547E8] dark:accent-[#6782FF]"
            />
          </div>
          );
        })}
      </div>

      {/* Natural Language Feel Mapper */}
      <form onSubmit={handleApplyPhrase} className="pt-2 border-t border-[#D9D6CF] dark:border-[#272C34] space-y-1.5">
        <label htmlFor={`${controlId}-feel-phrase`} className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
          Add Trait or Feel Phrase
        </label>
        <div className="flex items-center gap-1.5">
          <input
            id={`${controlId}-feel-phrase`}
            name="feel-phrase"
            type="text"
            aria-label="Feel phrase"
            placeholder="e.g. professional but playful, dense and technical"
            value={phraseInput}
            onChange={(e) => setPhraseInput(e.target.value)}
            className="flex-1 rounded-lg border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] px-2.5 py-1.5 text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#2547E8]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#2547E8] dark:bg-[#6782FF] px-2.5 py-1.5 text-xs font-semibold text-white dark:text-[#0B0D10] hover:opacity-90 shrink-0"
          >
            Apply
          </button>
        </div>
      </form>
    </fieldset>
    </div>
  );
}
