import React, { useState } from 'react';
import { X, Layers, Sparkles } from 'lucide-react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import {
  ALL_BLEND_CATEGORIES,
  type BlendCategory,
  type BlendSourceKey,
  type BlendConfig,
} from '../../blend/blend-engine.js';
import { createSampleProject } from '../../store/sample-project.js';

export const BlendModal: React.FC = () => {
  const isBlendOpen = useWorkbenchStore((state) => state.isBlendOpen);
  const closeBlend = useWorkbenchStore((state) => state.closeBlend);
  const manifest = useWorkbenchStore((state) => state.manifest);
  const blendWith = useWorkbenchStore((state) => state.blendWith);

  // Alternative source B for blending demo / synthesis
  const [sourceB] = useState(() => {
    const b = createSampleProject();
    b.name = 'Direction B (Expressive Horizon)';
    b.designDNA = {
      ...b.designDNA,
      visualAmbition: 85,
      structuralCreativity: 75,
      colourfulness: 80,
      curvature: 90,
      surfacePersonality: 'glass',
      geometryFamily: 'pill',
      motionPersonality: 'playful',
    };
    return b;
  });

  const [selections, setSelections] = useState<Record<BlendCategory, BlendSourceKey>>({
    structure: 'A',
    typography: 'B',
    colour: 'B',
    motion: 'A',
    density: 'A',
    geometry: 'B',
    navigation: 'A',
    imagery: 'B',
    components: 'A',
  });

  if (!isBlendOpen) return null;

  const handleSelect = (category: BlendCategory, source: BlendSourceKey) => {
    setSelections((prev) => ({ ...prev, [category]: source }));
  };

  const handleApply = () => {
    const config: BlendConfig = {
      selections,
      name: `Blended: ${manifest.name.slice(0, 15)} + ${sourceB.name.slice(0, 15)}`,
    };
    blendWith(sourceB, config);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Blend Directions"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 text-zinc-100"
    >
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-6 bg-zinc-900/90">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold">Blend Mode</h2>
          </div>
          <button
            onClick={closeBlend}
            aria-label="Close Blend Mode"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <p className="text-xs text-zinc-400">
            Synthesize a new coherent direction by selecting the origin source for each core design dimension. Original projects are preserved.
          </p>

          {/* Sources Summary Banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Source A</span>
              <h4 className="text-sm font-semibold text-zinc-200 mt-0.5">{manifest.name}</h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Ambition: {manifest.designDNA.visualAmbition} • Surface: {manifest.designDNA.surfacePersonality}
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Source B</span>
              <h4 className="text-sm font-semibold text-zinc-200 mt-0.5">{sourceB.name}</h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Ambition: {sourceB.designDNA.visualAmbition} • Surface: {sourceB.designDNA.surfacePersonality}
              </p>
            </div>
          </div>

          {/* 9 Category Pickers */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Dimension Sources (9 Categories)
            </h3>
            <div className="grid grid-cols-1 divide-y divide-zinc-800/80 rounded-lg border border-zinc-800 bg-zinc-950/50">
              {ALL_BLEND_CATEGORIES.map((category) => {
                const currentChoice = selections[category];
                return (
                  <div key={category} className="flex items-center justify-between p-3">
                    <span className="text-xs font-medium capitalize text-zinc-300">
                      {category}
                    </span>
                    <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleSelect(category, 'A')}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentChoice === 'A'
                            ? 'bg-indigo-600 font-semibold text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Source A
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelect(category, 'B')}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentChoice === 'B'
                            ? 'bg-amber-600 font-semibold text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Source B
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex h-14 items-center justify-end gap-3 border-t border-zinc-800 px-6 bg-zinc-900/90">
          <button
            type="button"
            onClick={closeBlend}
            className="rounded-md px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Layers className="h-3.5 w-3.5" />
            Apply Direction Blend
          </button>
        </footer>
      </div>
    </div>
  );
};
