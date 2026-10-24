import React, { useState } from 'react';
import { Mark } from './mark.js';
import { Sheet } from './sheet.js';

export interface HeaderProps {
  onSearchClick?: () => void;
  onSignInClick?: () => void;
  currentPath?: string;
}

export function Header({ onSearchClick, onSignInClick, currentPath = '/' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Compose', href: '/compose' },
    { label: 'Workbench', href: '/workbench' },
    { label: 'Tools', href: '/tools' },
    { label: 'Agents', href: '/agents' },
    { label: 'Creators', href: '/creators' },
    { label: 'Docs', href: '/docs' },
  ];

  return (
    <>
    <a href="#main-content" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:not-sr-only focus:bg-white focus:px-3 focus:py-2 focus:text-[#111217] focus:outline-2 focus:outline-offset-2 focus:outline-[#2547E8]">Skip to content</a>
    <header className="sticky top-0 z-40 w-full border-b border-[#D9D6CF] bg-[#F4F2ED]/90 backdrop-blur-md transition-colors dark:border-[#272C34] dark:bg-[#0B0D10]/90">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-3 sm:px-6">
        {/* Left: Mark + Brand + Desktop Nav */}
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2.5 text-[#111217] dark:text-[#F5F7FA]">
            <Mark size={24} />
            <span className="text-base font-semibold tracking-tight">Tessellate</span>
          </a>

          <nav aria-label="Primary" className="hidden xl:flex items-center gap-4 text-sm">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href || currentPath.startsWith(link.href + '/');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-md transition-colors ${
                    isActive
                      ? 'font-semibold text-[#111217] dark:text-[#F5F7FA]'
                      : 'text-[#62666F] hover:text-[#111217] dark:text-[#A8AFBA] dark:hover:text-[#F5F7FA]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={()=>onSearchClick ? onSearchClick() : window.location.assign('/explore?focus=search')}
            aria-label="Search resources (Press Command-K)"
            className="flex items-center gap-2 min-h-[32px] rounded-lg border border-[#D9D6CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#62666F] hover:border-[#C7C3BA] hover:text-[#111217] dark:border-[#272C34] dark:bg-[#111419] dark:text-[#A8AFBA] dark:hover:border-[#353C46] cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[#D9D6CF] bg-[#ECE9E2] px-1.5 py-0.5 text-[10px] font-mono dark:border-[#353C46] dark:bg-[#1C2128]">
              ⌘K
            </kbd>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/danishgm-sketch/Tessellate"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="inline-flex items-center justify-center min-h-[32px] min-w-[32px] rounded-lg p-1.5 text-[#62666F] hover:bg-black/5 hover:text-[#111217] dark:text-[#A8AFBA] dark:hover:bg-white/5 dark:hover:text-[#F5F7FA]"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Sign In */}
          <button
            type="button"
            onClick={()=>onSignInClick ? onSignInClick() : window.location.assign('/workbench')}
            className="hidden sm:inline-flex items-center min-h-[32px] text-xs font-medium text-[#62666F] hover:text-[#111217] dark:text-[#A8AFBA] dark:hover:text-[#F5F7FA] px-2.5 py-1 rounded-lg cursor-pointer"
          >
            {onSignInClick ? 'Sign in' : 'Local projects'}
          </button>

          {/* Primary CTA */}
          <a href="/compose" className="inline-flex items-center min-h-[32px] bg-[#2547E8] text-white rounded px-3 py-2 text-xs">Start building</a>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation"
            className="xl:hidden inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg p-2 text-[#62666F] hover:bg-black/5 dark:text-[#A8AFBA]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Sheet */}
      <Sheet open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} title="Menu" side="right">
        <nav className="flex flex-col gap-4 py-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#111217] hover:text-[#2547E8] dark:text-[#F5F7FA] dark:hover:text-[#6782FF]"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 pt-4 border-t border-[#D9D6CF] dark:border-[#272C34] flex flex-col gap-3">
            <a href="/compose" className="w-full rounded bg-[#2547E8] text-white px-4 py-3 text-center">Start building</a>
          </div>
        </nav>
      </Sheet>
    </header>
    </>
  );
}
