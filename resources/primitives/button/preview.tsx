import React, { useState } from 'react';
import { Button, type ButtonVariant, type ButtonIntent, type ButtonSize } from './index.js';

export interface ButtonPreviewProps {
  initialVariant?: ButtonVariant;
  initialIntent?: ButtonIntent;
  initialSize?: ButtonSize;
  label?: string;
}

export function ButtonPreview({
  initialVariant = 'expressive',
  initialIntent = 'primary',
  initialSize = 'md',
  label = 'Interactive Button',
}: ButtonPreviewProps) {
  const [variant, setVariant] = useState<ButtonVariant>(initialVariant);
  const [intent, setIntent] = useState<ButtonIntent>(initialIntent);
  const [size, setSize] = useState<ButtonSize>(initialSize);
  const [clickCount, setClickCount] = useState(0);

  const isDark = variant === 'nocturne';

  return (
    <div
      className={`min-h-full w-full p-8 transition-colors duration-200 ${
        isDark ? 'bg-[#0B0D10] text-neutral-100' : 'bg-[#FAF9F6] text-neutral-900'
      }`}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Live Interactive Stage */}
        <div
          className={`rounded-2xl border p-8 flex flex-col items-center justify-center gap-6 shadow-sm ${
            isDark ? 'border-[#1E232E] bg-[#11141B]' : 'border-[#E5E2DA] bg-white'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-4 py-6">
            <Button
              variant={variant}
              intent={intent}
              size={size}
              onClick={() => setClickCount((c) => c + 1)}
            >
              {label} {clickCount > 0 && `(${clickCount})`}
            </Button>
            <Button variant={variant} intent="secondary" size={size}>
              Secondary
            </Button>
            <Button variant={variant} intent="ghost" size={size}>
              Ghost
            </Button>
            <Button variant={variant} intent="danger" size={size}>
              Danger
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs opacity-60">
            <span>Click count: {clickCount}</span>
            <span>•</span>
            <span>Focusable via Tab</span>
            <span>•</span>
            <span>Enter / Space trigger</span>
          </div>
        </div>

        {/* Curated Configurations Comparison */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60">
            Curated Launch Configurations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quiet */}
            <div
              onClick={() => setVariant('quiet')}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                variant === 'quiet'
                  ? 'border-[#2547E8] ring-2 ring-[#2547E8]/20 bg-white'
                  : 'border-[#E5E2DA] bg-white hover:border-neutral-400'
              } text-neutral-900`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Quiet</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 uppercase font-mono">
                  Default
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
                Monochrome, minimal contrast for high data density shells.
              </p>
              <div className="flex gap-2">
                <Button variant="quiet" intent="primary" size="sm">
                  Primary
                </Button>
                <Button variant="quiet" intent="secondary" size="sm">
                  Cancel
                </Button>
              </div>
            </div>

            {/* Expressive */}
            <div
              onClick={() => setVariant('expressive')}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                variant === 'expressive'
                  ? 'border-[#2547E8] ring-2 ring-[#2547E8]/20 bg-white'
                  : 'border-[#E5E2DA] bg-white hover:border-neutral-400'
              } text-neutral-900`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Expressive</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E7EBFF] text-[#2547E8] uppercase font-mono">
                  Accent
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
                Cobalt primary, tactile elevation and hover lift.
              </p>
              <div className="flex gap-2">
                <Button variant="expressive" intent="primary" size="sm">
                  Deploy
                </Button>
                <Button variant="expressive" intent="secondary" size="sm">
                  Draft
                </Button>
              </div>
            </div>

            {/* Nocturne */}
            <div
              onClick={() => setVariant('nocturne')}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                variant === 'nocturne'
                  ? 'border-[#2547E8] ring-2 ring-[#2547E8]/40 bg-[#11141B]'
                  : 'border-[#222733] bg-[#11141B] hover:border-neutral-600'
              } text-neutral-100`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Nocturne</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C202C] text-neutral-300 uppercase font-mono">
                  Dark
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4 line-clamp-2">
                Obsidian dark canvas with crisp luminescence.
              </p>
              <div className="flex gap-2">
                <Button variant="nocturne" intent="primary" size="sm">
                  Execute
                </Button>
                <Button variant="nocturne" intent="secondary" size="sm">
                  Inspect
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div
          className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 text-xs ${
            isDark ? 'border-[#1E232E] bg-[#11141B]' : 'border-[#E5E2DA] bg-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold opacity-70">Intent:</span>
            {(['primary', 'secondary', 'ghost', 'danger'] as ButtonIntent[]).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIntent(i)}
                className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                  intent === i
                    ? 'bg-[#2547E8] text-white'
                    : isDark
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold opacity-70">Size:</span>
            {(['sm', 'md', 'lg'] as ButtonSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-2 py-1 rounded uppercase font-medium transition-colors ${
                  size === s
                    ? 'bg-[#2547E8] text-white'
                    : isDark
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButtonPreview;
