import React from 'react';
import { Heart, Globe2, ArrowRight } from 'lucide-react';

export function CommonsAndCreators() {
  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Free Commons Pillar */}
        <div className="rounded-3xl border border-[#D9D6CF] bg-[#FAF9F6] p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-[#2547E8]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Public Commons
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111217]">
            100% Free. No Pro component gates. No download caps.
          </h3>

          <p className="text-sm sm:text-base text-[#62666F] leading-relaxed">
            Interface building blocks belong in the public commons. Tessellate will never lock
            high-value tables or charts behind a paywalled subscription. The entire component and
            pattern vocabulary is freely accessible to developers and autonomous agents forever.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white border border-[#D9D6CF] text-[#111217]">
              MIT / Apache 2.0
            </span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white border border-[#D9D6CF] text-[#111217]">
              Zero Telemetry Tracking
            </span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white border border-[#D9D6CF] text-[#111217]">
              Copy & Paste or Download ZIP
            </span>
          </div>
        </div>

        {/* Right: Creator Ecosystem Pillar */}
        <div className="rounded-3xl border border-[#D9D6CF] bg-white p-8 sm:p-10 space-y-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-[#C83D48]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Creator Ecosystem
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111217]">
            Publish resources with a declared contract.
          </h3>

          <p className="text-sm sm:text-base text-[#62666F] leading-relaxed">
            Resource manifests can describe variants, slots, dependencies, and Design DNA priors.
            This helps compatible React tools inspect a resource before integration; each target
            application still needs its own review.
          </p>

          <div className="pt-2">
            <a
              href="/creators"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#2547E8] hover:underline"
            >
              <span>Learn how to author & submit a manifest</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
