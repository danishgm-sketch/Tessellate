import React, { useState } from 'react';
import { ArrowRight, Github } from 'lucide-react';

export function FinalComposerFooter() {
  const [quickPrompt, setQuickPrompt] = useState('');

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = encodeURIComponent(quickPrompt.trim() || 'Employee experience platform');
    window.location.href = `/compose?brief=${query}`;
  };

  return (
    <footer className="border-t border-[#D9D6CF] bg-[#F4F2ED] select-none">
      {/* Final Call to Action Composer */}
      <div className="py-20 px-6 max-w-[1440px] mx-auto text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111217]">
            Start with a product brief.
          </h2>
          <p className="text-base text-[#62666F]">
            No credit card. No account required. Runs locally in your browser.
          </p>
        </div>

        <form
          onSubmit={handleLaunch}
          className="max-w-2xl mx-auto flex items-center gap-2 bg-white border border-[#D9D6CF] rounded-2xl p-2 shadow-sm focus-within:border-[#111217] transition-all"
        >
          <input
            id="footer-product-brief"
            name="quickProductBrief"
            type="text"
            aria-label="Product brief"
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            placeholder="Type your product concept (e.g. Developer security terminal)…"
            className="min-w-0 flex-1 px-4 py-2 text-sm text-[#111217] placeholder-[#62666F] bg-transparent border-none focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-colors shrink-0 shadow-sm"
          >
            <span>Launch Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Main Footer Links */}
      <div className="border-t border-[#D9D6CF] py-16 px-6 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="12"
                  height="12"
                  rx="2.5"
                  fill="#111217"
                  transform="rotate(6 8 8)"
                />
                <rect
                  x="18"
                  y="3"
                  width="12"
                  height="12"
                  rx="2.5"
                  fill="#2547E8"
                  transform="rotate(-6 24 9)"
                />
                <rect
                  x="3"
                  y="18"
                  width="12"
                  height="12"
                  rx="2.5"
                  fill="#2547E8"
                  transform="rotate(-4 9 24)"
                />
                <rect
                  x="18"
                  y="18"
                  width="12"
                  height="12"
                  rx="2.5"
                  fill="#111217"
                  transform="rotate(6 24 24)"
                />
              </svg>
              <span className="text-base font-bold text-[#111217] tracking-tight">Tessellate</span>
            </div>
            <p className="text-xs text-[#62666F] max-w-sm leading-relaxed">
              Open interface intelligence and deterministic UI composition platform for humans and
              autonomous coding agents.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[var(--text-muted)]">
              <span>MIT / Apache 2.0 Open Source</span>
            </div>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-semibold uppercase tracking-wider text-[#111217]">
              Product
            </span>
            <ul className="space-y-2 text-[#62666F]">
              <li>
                <a href="/explore" className="hover:text-[#111217]">
                  Explore Catalogue
                </a>
              </li>
              <li>
                <a href="/compose" className="hover:text-[#111217]">
                  Product Composer
                </a>
              </li>
              <li>
                <a href="/workbench" className="hover:text-[#111217]">
                  Workbench Studio
                </a>
              </li>
              <li>
                <a href="/tools" className="hover:text-[#111217]">
                  Ten Launch Tools
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Architecture */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-semibold uppercase tracking-wider text-[#111217]">
              Architecture
            </span>
            <ul className="space-y-2 text-[#62666F]">
              <li>
                <a href="/agents" className="hover:text-[#111217]">
                  Agent Integration
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-[#111217]">
                  Design DNA Contract
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-[#111217]">
                  Manifest audit rubric
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-[#111217]">
                  Structured Mutations
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Ecosystem */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-semibold uppercase tracking-wider text-[#111217]">
              Ecosystem
            </span>
            <ul className="space-y-2 text-[#62666F]">
              <li>
                <a href="/creators" className="hover:text-[#111217]">
                  Creator Commons
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/danishgm-sketch/Tessellate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#111217] flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <Github className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-[#111217]">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/workbench" className="hover:text-[#111217]">
                  Local Offline Mode
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#D9D6CF] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)] font-mono">
          <div>© 2026 Tessellate. Free open interface commons.</div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#177B55]" />
            <span className="text-[#111217]">Deterministic composition · v0.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
