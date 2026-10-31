import React from 'react';
import { ShieldCheck, Zap, Check } from 'lucide-react';

const AUDIT_CATEGORIES = [
  { name: 'Cohesion', max: 20, desc: 'Palette, curvature, and typography alignment' },
  { name: 'Accessibility', max: 20, desc: 'Declared accessibility metadata and semantic roles' },
  { name: 'Performance', max: 15, desc: 'Bundle size, dependencies, and runtime complexity' },
  { name: 'Responsive Layout', max: 15, desc: 'Ergonomic scaling across mobile, tablet & desktop' },
  { name: 'Visual Hierarchy', max: 10, desc: 'Clear focal headers & structural navigation' },
  { name: 'Density Consistency', max: 5, desc: 'Controlled spacing variance between cards' },
  { name: 'Motion Consistency', max: 5, desc: 'Cadence alignment & reduced-motion safety' },
  { name: 'Design Compliance', max: 5, desc: 'Declared design constraints and compatibility' },
  { name: 'Interaction Harmony', max: 5, desc: 'Clear single primary button actions per panel' },
];

export function AuditPerformanceProof() {
  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
          Quality & Security Invariants
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217]">
          Inspectable quality.
          <br />
          Verify in the browser.
        </h2>
        <p className="text-lg text-[#62666F] font-normal leading-relaxed">
          The deterministic audit inspects manifest and declared resource metadata. Browser
          accessibility, visual behaviour and export builds require runtime verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 100-Point Category Breakdown */}
        <div className="lg:col-span-8 rounded-2xl border border-[#D9D6CF] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#D9D6CF]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#2547E8]" />
              <h3 className="text-lg font-semibold text-[#111217]">Manifest Audit Rubric</h3>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#E7EBFF] text-[#2547E8]">
              Rubric: 100 points total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {AUDIT_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] space-y-1.5"
              >
                <div className="flex justify-between items-center font-semibold text-[#111217]">
                  <span>{cat.name}</span>
                  <span className="font-mono text-[#2547E8]">{cat.max} pts</span>
                </div>
                <p className="text-[11px] text-[#62666F] leading-tight">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Performance Guarantees */}
        <div className="lg:col-span-4 rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9D6CF]">
            <Zap className="h-4 w-4 text-[#12603F]" />
            <h3 className="text-base font-semibold text-[#111217]">Build and Runtime Budgets</h3>
          </div>

          <ul className="space-y-3 text-xs text-[#62666F]">
            <li className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-[#12603F] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Runtime Lock-In:</strong> Exported code is vanilla React 19 + Tailwind
                CSS 4. No Tessellate SDK required in production.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-[#12603F] shrink-0 mt-0.5" />
              <span>
                <strong>Reduced-Motion First Class:</strong> Smooth degradation to static fades when
                the user prefers reduced motion.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-[#12603F] shrink-0 mt-0.5" />
              <span>
                <strong>Homepage script budget:</strong> Initial JavaScript is checked against a 150
                KB gzip target. Load time depends on the device and connection.
              </span>
            </li>
          </ul>

          <div className="pt-3 border-t border-[#D9D6CF] font-mono text-[11px] text-[var(--text-muted)]">
            WCAG 2.2 AA is a target. A metadata score does not certify accessibility; test the
            rendered project.
          </div>
        </div>
      </div>
    </section>
  );
}
