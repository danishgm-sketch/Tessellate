import React, { useState } from 'react';
import { Bookmark, Plus, RotateCcw, SplitSquareHorizontal, Clock } from 'lucide-react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import type { Checkpoint } from '../../history/checkpoints.js';

interface CheckpointsMenuProps {
  onClose?: () => void;
}

export const CheckpointsMenu: React.FC<CheckpointsMenuProps> = ({ onClose }) => {
  const checkpoints = useWorkbenchStore((state) => state.checkpoints);
  const createCheckpoint = useWorkbenchStore((state) => state.createCheckpoint);
  const restoreCheckpoint = useWorkbenchStore((state) => state.restoreCheckpoint);
  const openCompare = useWorkbenchStore((state) => state.openCompare);

  const [namedInput, setNamedInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namedInput.trim()) return;
    createCheckpoint(namedInput.trim(), 'manual');
    setNamedInput('');
  };

  const handleRestore = (chk: Checkpoint) => {
    restoreCheckpoint(chk);
    onClose?.();
  };

  const handleCompare = (chk: Checkpoint) => {
    openCompare(chk.manifest);
    onClose?.();
  };

  return (
    <div
      role="menu"
      aria-label="Checkpoints Menu"
      className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-4 text-zinc-100 z-50 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Checkpoints ({checkpoints.length})
          </h3>
        </div>
      </div>

      {/* Create Named Checkpoint Input */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={namedInput}
          onChange={(e) => setNamedInput(e.target.value)}
          placeholder="Name checkpoint..."
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Save
        </button>
      </form>

      {/* Checkpoints List */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
        {checkpoints.map((chk) => (
          <div
            key={chk.id}
            className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 text-xs space-y-2 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-zinc-200 truncate">{chk.name}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                  chk.type === 'named'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {chk.type}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
              <Clock className="h-2.5 w-2.5" />
              <span>{new Date(chk.timestamp).toLocaleTimeString()}</span>
              {chk.description && <span>• {chk.description}</span>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => handleCompare(chk)}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <SplitSquareHorizontal className="h-3 w-3" />
                Compare
              </button>
              <button
                type="button"
                onClick={() => handleRestore(chk)}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Restore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
