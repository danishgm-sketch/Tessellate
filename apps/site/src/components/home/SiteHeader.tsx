import React, { useState, useEffect, useCallback } from 'react';
import { Search, Github, Menu, X, ArrowRight } from 'lucide-react';
import { useDialogFocus } from '@tessellate/ui';
import { CommandPalette } from '../CommandPalette.js';

export function SiteHeader() {
  const [interactive,setInteractive]=useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const closeMenu=useCallback(()=>setIsMenuOpen(false),[]);
  const navigationRef=useDialogFocus<HTMLDivElement>(isMenuOpen,closeMenu);
  useEffect(() => {
    setInteractive(true);
    const openSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase()==='k') {
        event.preventDefault(); setIsSearchOpen(open=>!open);
      }
    };
    window.addEventListener('keydown',openSearch);
    return ()=>window.removeEventListener('keydown',openSearch);
  },[]);

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b border-[#DEDAD2] bg-[#F4F2ED]/95 backdrop-blur-md px-6 select-none transition-colors">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between">
          {/* Left: Brand Mark + Desktop Nav */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-3 group">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none" className="shrink-0 transition-transform group-hover:scale-105">
                <rect x="2" y="2" width="12" height="12" rx="2.5" fill="#111217" transform="rotate(6 8 8)" />
                <rect x="18" y="3" width="12" height="12" rx="2.5" fill="#2547E8" transform="rotate(-6 24 9)" />
                <rect x="3" y="18" width="12" height="12" rx="2.5" fill="#2547E8" transform="rotate(-4 9 24)" />
                <rect x="18" y="18" width="12" height="12" rx="2.5" fill="#111217" transform="rotate(6 24 24)" />
              </svg>
              <span className="text-[17px] font-[650] tracking-tight text-[#111217]">
                Tessellate
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-medium text-[#62666F]">
              <a href="/explore" className="hover:text-[#111217] transition-colors">Explore</a>
              <a href="/showcases" className="hover:text-[#111217] transition-colors">Showcases</a>
              <a href="/compose" className="hover:text-[#111217] transition-colors">Compose</a>
              <a href="/workbench" className="hover:text-[#111217] transition-colors">Workbench</a>
              <a href="/tools" className="hover:text-[#111217] transition-colors">Tools</a>
              <a href="/agents" className="hover:text-[#111217] transition-colors">Agents</a>
              <a href="/creators" className="hover:text-[#111217] transition-colors">Creators</a>
              <a href="/docs" className="hover:text-[#111217] transition-colors">Docs</a>
            </nav>
          </div>

          {/* Right: Search, GitHub, Sign In, CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!interactive} onClick={() => setIsSearchOpen(true)}
              aria-label="Search resources (Press Command-K)"
              className="flex items-center gap-2 rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] px-3 py-1.5 text-xs text-[#62666F] hover:border-[#111217] hover:text-[#111217] transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline rounded bg-[#ECE9E2] px-1 py-0.5 text-[10px] font-mono text-[#62666F]">
                ⌘K
              </kbd>
            </button>

            <a
              href="https://github.com/danishgm-sketch/Tessellate"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] text-[#62666F] hover:text-[#111217] hover:border-[#111217] transition-colors"
              title="GitHub Repository"
              aria-label="GitHub Repository"
            >
              <Github className="h-4 w-4" />
            </a>

            <a
              href="/workbench"
              className="hidden md:inline text-xs font-semibold text-[#62666F] hover:text-[#111217] transition-colors px-2"
            >
              Local projects
            </a>

            <a
              href="/workbench"
              className="flex items-center gap-1.5 rounded-lg bg-[#111217] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2547E8] transition-colors shadow-sm"
            >
              <span>Start building</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              disabled={!interactive} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 text-[#62666F] hover:text-[#111217] transition-colors"
              aria-label="Toggle menu" aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      {isMenuOpen && (
        <div id="mobile-navigation" ref={navigationRef} role="dialog" aria-modal="true" aria-label="Main navigation" tabIndex={-1} className="fixed inset-0 top-16 z-40 bg-[#F4F2ED] p-6 lg:hidden flex flex-col justify-between overflow-y-auto animate-fade-in">
          <button type="button" onClick={closeMenu} aria-label="Close navigation" className="self-end min-h-10 min-w-10 p-2"><X className="h-5 w-5" /></button>
          <nav className="flex flex-col gap-4 text-lg font-semibold text-[#111217]">
            <a href="/explore" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Explore Catalogue</a>
            <a href="/showcases" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Showcases</a>
            <a href="/compose" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Product Composer</a>
            <a href="/workbench" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Workbench Studio</a>
            <a href="/tools" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Ten Tools</a>
            <a href="/agents" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Agent Integration</a>
            <a href="/creators" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Creator Commons</a>
            <a href="/docs" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-[#D9D6CF]">Documentation</a>
          </nav>
          <div className="pt-6 space-y-3">
            <a
              href="/workbench"
              className="block w-full py-3 text-center text-sm font-semibold rounded-xl bg-[#2547E8] text-white"
            >
              Launch Workbench
            </a>
            <a
              href="https://github.com/danishgm-sketch/Tessellate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 text-center text-sm font-semibold rounded-xl border border-[#D9D6CF] bg-white text-[#111217]"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      )}

      {/* Search Palette Modal */}
      {isSearchOpen && <CommandPalette isOpen={true} onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
