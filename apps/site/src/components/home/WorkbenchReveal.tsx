import React from 'react';
import { ArrowRight, Terminal, Shield } from 'lucide-react';

export function WorkbenchReveal() {
  return (
    <section className="bg-[#0B0D10] text-[#F5F7FA] py-28 px-6 select-none border-t border-[#272C34] relative overflow-hidden">
      {/* Background dot grid pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#A8AFBA 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[1440px] mx-auto relative z-10 space-y-12">
        {/* Kicker & Title */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#6782FF]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#A8AFBA]">
              Command Studio
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
            Step inside the engine.<br />
            Inspect every mathematical token.
          </h2>
          <p className="text-lg text-[#A8AFBA] font-normal leading-relaxed">
            The Workbench is not a simplified visual builder. It is a full deterministic operating environment where you inspect semantic trees, lock structural sections, mix adjective feels, and run 100-point audits.
          </p>
        </div>

        {/* Workbench Interface Mock Window */}
        <div className="rounded-2xl border border-[#272C34] bg-[#111217] shadow-2xl overflow-hidden">
          {/* Top chrome bar */}
          <div className="h-12 border-b border-[#272C34] bg-[#171B21] px-4 flex items-center justify-between text-xs font-mono text-[#A8AFBA]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#E05252]" />
                <span className="h-3 w-3 rounded-full bg-[#D99B26]" />
                <span className="h-3 w-3 rounded-full bg-[#2E9E66]" />
              </div>
              <span className="text-white font-semibold font-sans ml-2">Tessellate Workbench</span>
              <span className="text-[11px] text-[#62666F]">v0.1.0 · Local IndexedDB</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#272C34] text-xs font-mono text-[#6782FF]">
                <Shield className="h-3.5 w-3.5" />
                <span>Audit 100/100 · AA Compliant</span>
              </span>
              <span className="hidden sm:inline text-xs text-[#A8AFBA]">Head: Rev #14</span>
            </div>
          </div>

          {/* Workbench Body Layout */}
          <div className="grid grid-cols-12 min-h-[420px]">
            {/* Left Layers Panel (Col 3) */}
            <div className="hidden md:block col-span-3 border-r border-[#272C34] bg-[#0E1015] p-4 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between text-[#62666F] font-semibold">
                <span>SEMANTIC LAYERS</span>
                <span>4 NODES</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded bg-[#171B21] text-white border border-[#272C34]">
                  <span>❖ RootLayout</span>
                  <span className="text-[10px] text-[#6782FF]">LOCKED</span>
                </div>
                <div className="pl-3 space-y-1.5 text-[#A8AFBA]">
                  <div className="p-1.5 rounded hover:bg-[#171B21]/50 cursor-pointer">
                    ├─ NavigationBar
                  </div>
                  <div className="p-1.5 rounded hover:bg-[#171B21]/50 cursor-pointer">
                    ├─ TelemetryMetricGrid
                  </div>
                  <div className="p-1.5 rounded hover:bg-[#171B21]/50 cursor-pointer">
                    └─ AuditedDataTable
                  </div>
                </div>
              </div>
            </div>

            {/* Central Canvas (Col 6) */}
            <div className="col-span-12 md:col-span-6 p-6 flex flex-col justify-between bg-[#171B21]/50">
              <div className="rounded-xl border border-[#272C34] bg-[#111217] p-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Live Render Preview (Desktop 1440px)</span>
                  <span className="font-mono text-[#6782FF] text-[10px]">INHERITED PROJECT DNA</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 rounded bg-[#171B21] border border-[#272C34] p-2 flex flex-col justify-between">
                    <span className="text-[10px] text-[#A8AFBA]">SETTLEMENT</span>
                    <span className="font-bold text-white text-base">£142,500</span>
                  </div>
                  <div className="h-16 rounded bg-[#171B21] border border-[#272C34] p-2 flex flex-col justify-between">
                    <span className="text-[10px] text-[#A8AFBA]">CONFIRMATIONS</span>
                    <span className="font-bold text-[#6782FF] text-base">99.98%</span>
                  </div>
                </div>
                <div className="h-28 rounded bg-[#171B21] border border-[#272C34] p-3 flex items-center justify-center font-mono text-xs text-[#A8AFBA]">
                  Interactive Recomposition Canvas
                </div>
              </div>

              {/* Bottom command bar simulation */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#272C34] bg-[#0E1015] text-xs font-mono text-[#A8AFBA] mt-4">
                <Terminal className="h-3.5 w-3.5 text-[#6782FF]" />
                <span className="text-white">recompose screen around locked items</span>
                <span className="text-[#62666F] ml-auto">↵ enter</span>
              </div>
            </div>

            {/* Right Inspector Panel (Col 3) */}
            <div className="hidden lg:block col-span-3 border-l border-[#272C34] bg-[#0E1015] p-4 space-y-4 text-xs font-mono">
              <div className="text-[#62666F] font-semibold border-b border-[#272C34] pb-2">
                DESIGN DNA INSPECTOR
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[#A8AFBA]">
                    <span>Contrast Floor</span>
                    <span className="text-white">92</span>
                  </div>
                  <div className="h-1 bg-[#272C34] rounded overflow-hidden">
                    <div className="h-full w-11/12 bg-[#6782FF]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[#A8AFBA]">
                    <span>Curvature</span>
                    <span className="text-white">0px (Sharp)</span>
                  </div>
                  <div className="h-1 bg-[#272C34] rounded overflow-hidden">
                    <div className="h-full w-1 bg-[#6782FF]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[#A8AFBA]">
                    <span>Motion Easing</span>
                    <span className="text-white">calm-precision</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button to launch Workbench */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-[#272C34]">
          <div className="text-sm text-[#A8AFBA]">
            Works 100% offline in browser storage with optional BYO cloud and AI capabilities.
          </div>
          <a
            href="/workbench"
            className="flex items-center gap-2 rounded-xl bg-[#2547E8] hover:bg-[#1E3CCD] text-white px-6 py-3.5 text-sm font-semibold transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            <span>Launch Workbench Studio</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
