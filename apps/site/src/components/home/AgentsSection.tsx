import React from 'react';
import { Bot, Terminal, CheckCircle2 } from 'lucide-react';

export function AgentsSection() {
  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Text */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#2547E8]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Agent-Native Architecture
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217] leading-[1.08]">
            Built for autonomous agents and humans alike.
          </h2>

          <p className="text-lg text-[#62666F] font-normal leading-relaxed">
            Coding agents and people can inspect the same project manifest and use the same typed
            mutation contracts to change an interface.
          </p>

          <ul className="space-y-3 text-sm text-[#111217]">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span>
                <strong>Project manifests:</strong> Export a composed project as a schema-validated{' '}
                <code>.tess.json</code> file.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span>
                <strong>Structured mutations:</strong> Typed operations can update project structure
                and provide inverse changes for undo.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span>
                <strong>Registered resources:</strong> Composition selects from the resource
                registry; unsupported roles remain visible for review.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span>
                <strong>Agent handoff:</strong> Exports the project brief, design, implementation,
                components, dependencies, and an agent prompt.
              </span>
            </li>
          </ul>
        </div>

        {/* Right Column Code / Terminal Mock */}
        <div className="dark lg:col-span-6 rounded-2xl border border-[#D9D6CF] bg-[#111217] p-6 text-white font-mono text-xs shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#C9FF57]" />
              <span id="agent-handoff-json-specification-label">ProjectManifest excerpt</span>
            </div>
            <span className="text-[10px] text-[#C9FF57]">ILLUSTRATIVE EXCERPT</span>
          </div>

          <pre
            role="group"
            aria-labelledby="agent-handoff-json-specification-label"
            className="text-white/90 overflow-x-auto leading-relaxed text-[11px]"
            tabIndex={0}
          >
            {`{
  "schemaVersion": "1.0.0",
  "name": "Employee experience",
  "productModel": {
    "productArchetypes": [
      { "tag": "recruitment", "weight": 100 }
    ]
  },
  "designDNA": {
    "professionalism": 80,
    "playfulness": 55,
    "visualAmbition": 40,
    "structuralCreativity": 85
  },
  "screens": [
    { "name": "Team Overview", "slug": "/overview" }
  ]
}}`}
          </pre>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Example fields · complete contracts in Docs</span>
            <span className="text-white">v0.1.0</span>
          </div>
        </div>
      </div>
    </section>
  );
}
