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
            Coding agents like Claude Code, Gemini CLI, Cursor, and Copilot struggle when asked to edit arbitrary CSS and complex component hierarchies from scratch. Tessellate gives them a deterministic, schema-validated operating contract.
          </p>

          <ul className="space-y-3 text-sm text-[#111217]">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span><strong>Machine-Readable Manifests:</strong> Everything compiles to validated <code>.tess.json</code> files.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span><strong>Structured Mutations:</strong> Agents modify layouts via typed operations with inverse rollbacks.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span><strong>Zero Hallucinations:</strong> Components use registered semantic slots rather than loose arbitrary HTML.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2547E8] shrink-0" />
              <span><strong>Complete Handoff Package:</strong> Generates <code>AGENT_HANDOFF.md</code> with setup instructions and schema tokens.</span>
            </li>
          </ul>
        </div>

        {/* Right Column Code / Terminal Mock */}
        <div className="lg:col-span-6 rounded-2xl border border-[#D9D6CF] bg-[#111217] p-6 text-white font-mono text-xs shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[#8B8F97]">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#C9FF57]" />
              <span>AGENT_HANDOFF.json</span>
            </div>
            <span className="text-[10px] text-[#C9FF57]">VALIDATED SCHEMA</span>
          </div>

          <pre className="text-white/90 overflow-x-auto leading-relaxed text-[11px]">
{`{
  "$schema": "https://tessellate.dev/schemas/v1/project.json",
  "name": "Market Intelligence Terminal",
  "productModel": {
    "archetype": "fintech-telemetry",
    "userSophistication": 88,
    "accessibilityFloor": "AA"
  },
  "designDNA": {
    "contrast": 92,
    "curvature": 0,
    "motion": 15,
    "geometryFamily": "sharp"
  },
  "mutations": [
    { "type": "LOCK_NODE", "targetId": "navigation" },
    { "type": "RECOMPOSE_SCREEN", "screenId": "dashboard" }
  ]
}`}
          </pre>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8B8F97]">
            <span>Deterministic Mutation Planner Ready</span>
            <span className="text-white">v0.1.0</span>
          </div>
        </div>
      </div>
    </section>
  );
}
