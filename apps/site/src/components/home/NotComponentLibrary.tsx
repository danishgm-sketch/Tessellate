import React from 'react';
import { Check, X } from 'lucide-react';

export function NotComponentLibrary() {
  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      {/* Kicker & Title */}
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
          The Composition Paradigm
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217] leading-[1.08]">
          Not a component library.
          <br />A composition system.
        </h2>
        <p className="text-lg text-[#62666F] font-normal leading-relaxed">
          A resource catalogue gives you reusable building blocks. Tessellate adds a product brief,
          shared design settings, and a manifest that connects screens, resources, and project
          intent.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Traditional Component Libraries */}
        <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#D9D6CF]">
            <X className="h-5 w-5 text-[#C83D48]" />
            <h3 className="text-lg font-semibold text-[#111217]">
              Starting from a Resource Catalogue
            </h3>
          </div>

          <ul className="space-y-4 text-sm text-[#62666F]">
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C83D48] mt-2 shrink-0" />
              <span>
                <strong>Choose resources:</strong> The product team decides which components belong
                on each screen.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C83D48] mt-2 shrink-0" />
              <span>
                <strong>Carry design decisions:</strong> Shared tokens and interaction patterns need
                to stay aligned across resources.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C83D48] mt-2 shrink-0" />
              <span>
                <strong>Connect the screens:</strong> The team defines navigation, content, and how
                interface parts work together.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C83D48] mt-2 shrink-0" />
              <span>
                <strong>Review generated code:</strong> Check markup, styles, and behavior in the
                context of the product.
              </span>
            </li>
          </ul>

          <div className="rounded-xl bg-white/60 border border-[#D9D6CF] p-4 font-mono text-xs text-[var(--text-muted)]">
            Outcome: Resource choice, integration, and consistency remain with the product team.
          </div>
        </div>

        {/* Right: Tessellate Composition Engine */}
        <div className="rounded-2xl border border-[#2547E8]/30 bg-white p-8 space-y-6 shadow-md ring-1 ring-[#2547E8]/10">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#D9D6CF]">
            <Check className="h-5 w-5 text-[#2547E8]" />
            <h3 className="text-lg font-semibold text-[#111217]">Tessellate Composition Engine</h3>
          </div>

          <ul className="space-y-4 text-sm text-[#111217]">
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2547E8] mt-2 shrink-0" />
              <span>
                <strong>Product model:</strong> Interprets a brief into a product domain, audience,
                and user jobs before planning screens.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2547E8] mt-2 shrink-0" />
              <span>
                <strong>Design DNA:</strong> Shared visual settings guide composition and apply to
                resources that support them.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2547E8] mt-2 shrink-0" />
              <span>
                <strong>Manifest audit:</strong> A 100-point rubric scores declared structure and
                resource metadata; it does not certify the rendered interface.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2547E8] mt-2 shrink-0" />
              <span>
                <strong>Validated mutations:</strong> Workbench and integration tools apply typed
                manifest changes while respecting locked scope.
              </span>
            </li>
          </ul>

          <div className="rounded-xl bg-[#2547E8]/5 border border-[#2547E8]/20 p-4 font-mono text-xs text-[#2547E8] font-medium">
            Outcome: Export a standalone React + Tailwind project from the manifest you composed and
            reviewed.
          </div>
        </div>
      </div>
    </section>
  );
}
