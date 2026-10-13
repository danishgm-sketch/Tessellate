import React, { useState } from 'react';

export function EssentialVsExperimental() {
  const [level, setLevel] = useState<'essential' | 'elevated' | 'experimental'>('elevated');

  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="max-w-3xl mb-12 space-y-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
          Visual Spectrum Control
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217]">
          Essential → Experimental.
        </h2>
        <p className="text-lg text-[#62666F] font-normal leading-relaxed">
          One continuous mathematical spectrum. From a zero-distraction utilitarian compliance tool to a high-ambition expressive product hero, without changing the underlying component vocabulary.
        </p>

        {/* Level Selector Pills */}
        <div className="inline-flex p-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] gap-1">
          {(['essential', 'elevated', 'experimental'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                level === l
                  ? 'bg-[#111217] text-white shadow'
                  : 'text-[#62666F] hover:text-[#111217]'
              }`}
            >
              {l === 'essential' && '01 · Essential'}
              {l === 'elevated' && '02 · Elevated (Default)'}
              {l === 'experimental' && '03 · Experimental'}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Preview Stage */}
      <div className="rounded-3xl border border-[#D9D6CF] bg-white p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Mock UI Screen */}
          <div className="lg:col-span-8 rounded-2xl border border-[#D9D6CF] overflow-hidden p-6 sm:p-8 transition-all duration-500 bg-[#FAF9F6]">
            {/* Header of mock app */}
            <div className="flex items-center justify-between pb-6 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded flex items-center justify-center font-bold text-xs transition-all ${
                    level === 'essential'
                      ? 'bg-[#111217] text-white rounded-none'
                      : level === 'elevated'
                      ? 'bg-[#2547E8] text-white rounded-md'
                      : 'bg-gradient-to-tr from-[#2547E8] to-[#C9FF57] text-[#111217] rounded-full shadow-lg'
                  }`}
                >
                  T
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${level === 'experimental' ? 'font-serif text-base' : ''}`}>
                    Vault Analytics Dashboard
                  </h4>
                  <span className="text-[11px] font-mono text-[#8B8F97]">REVISION · 2026.04</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-white border border-[#D9D6CF] font-mono text-[#62666F]">
                  AA WCAG
                </span>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold text-white transition-all ${
                    level === 'essential'
                      ? 'bg-[#111217] rounded-none'
                      : level === 'elevated'
                      ? 'bg-[#2547E8] rounded-md shadow-sm'
                      : 'bg-[#111217] rounded-full hover:scale-105'
                  }`}
                >
                  Export Data
                </button>
              </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {[
                { title: 'Gross Volume', val: '£4.28M', delta: '+12%' },
                { title: 'Active Accounts', val: '18,400', delta: '+8%' },
                { title: 'Latency Budget', val: '42ms', delta: 'OPTIMAL' },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`p-4 transition-all duration-300 ${
                    level === 'essential'
                      ? 'bg-white border border-[#D9D6CF] rounded-none'
                      : level === 'elevated'
                      ? 'bg-white border border-[#D9D6CF] rounded-xl shadow-sm'
                      : 'bg-gradient-to-br from-white to-[#FAF9F6] border border-[#2547E8]/20 rounded-2xl shadow-md'
                  }`}
                >
                  <span className="block text-[11px] font-mono text-[#8B8F97] uppercase mb-1">
                    {m.title}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-xl font-bold tracking-tight text-[#111217] ${level === 'experimental' ? 'text-2xl text-[#2547E8]' : ''}`}>
                      {m.val}
                    </span>
                    <span className="text-[10px] font-mono text-[#177B55] font-semibold">
                      {m.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Content / Chart Mock */}
            <div
              className={`p-5 transition-all ${
                level === 'essential'
                  ? 'bg-white border border-[#D9D6CF] rounded-none'
                  : level === 'elevated'
                  ? 'bg-white border border-[#D9D6CF] rounded-xl'
                  : 'bg-white border border-[#2547E8]/30 rounded-2xl shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-[#111217]">
                  Telemetry Stream (24-Hour Settlement)
                </span>
                <span className="text-[11px] font-mono text-[#8B8F97]">
                  {level === 'essential' && 'Standard Grid'}
                  {level === 'elevated' && 'Smoothed Cadence'}
                  {level === 'experimental' && 'Kinetic Spring Wave'}
                </span>
              </div>
              <div className="h-20 w-full flex items-end gap-1.5 pt-2">
                {[30, 45, 60, 40, 75, 85, 65, 90, 80, 95, 70, 88].map((v, i) => (
                  <div
                    key={i}
                    className={`flex-1 transition-all duration-500 ${
                      level === 'essential'
                        ? 'bg-[#111217] rounded-none'
                        : level === 'elevated'
                        ? 'bg-[#2547E8] rounded-t-sm'
                        : 'bg-gradient-to-t from-[#2547E8] to-[#C9FF57] rounded-t-lg shadow-sm'
                    }`}
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Technical Explanation of the Mode */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase font-semibold text-[#2547E8]">
                {level === 'essential' && 'Level 01 · Ambition 20–35'}
                {level === 'elevated' && 'Level 02 · Ambition 45–65'}
                {level === 'experimental' && 'Level 03 · Ambition 75–95'}
              </span>
              <h3 className="text-2xl font-semibold text-[#111217]">
                {level === 'essential' && 'Quiet, Compliant Precision'}
                {level === 'elevated' && 'Balanced Editorial Elegance'}
                {level === 'experimental' && 'High-Chroma Kinetic Ambition'}
              </h3>
              <p className="text-sm text-[#62666F] leading-relaxed">
                {level === 'essential' &&
                  'Focuses on maximum speed, zero cognitive overhead, and strict WCAG AAA contrast. Sharp radii and direct utilitarian layout.'}
                {level === 'elevated' &&
                  'The standard default for SaaS and enterprise products. Subtle surface elevations, disciplined 8px radii, and calm typography rhythm.'}
                {level === 'experimental' &&
                  'For pioneering products and consumer experiences. Kinetic spring transitions, dynamic chroma gradients, pill-shaped geometries, and bold focal headers.'}
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#62666F] bg-[#FAF9F6] p-4 rounded-xl border border-[#D9D6CF]">
              <div className="flex justify-between">
                <span>Visual Ambition:</span>
                <span className="font-semibold text-[#111217]">
                  {level === 'essential' ? '25' : level === 'elevated' ? '55' : '88'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Geometry Curvature:</span>
                <span className="font-semibold text-[#111217]">
                  {level === 'essential' ? '0px (Sharp)' : level === 'elevated' ? '8px (Disciplined)' : '9999px (Pill)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Motion Personality:</span>
                <span className="font-semibold text-[#111217]">
                  {level === 'essential' ? 'instant-utility' : level === 'elevated' ? 'soft-ease' : 'playful-spring'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
