import React from 'react';
import type { ResourceRendererMap } from './types.js';
import { Button } from '../../../resources/primitives/button/index.js';

export interface MetricCardProps {
  label?: string;
  value?: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
}

export function MetricCard({
  label = 'Active Telemetry',
  value = '99.98%',
  change = '+0.15%',
  changeType = 'positive',
  subtext = 'Last 24 hours rolling window',
}: MetricCardProps): React.ReactElement {
  const isPositive = changeType === 'positive';
  return (
    <div
      className="p-5 rounded-[var(--tess-radius-md,14px)] bg-[var(--tess-surface,#FAF9F6)] border border-[var(--tess-hairline,#D9D6CF)] shadow-[var(--tess-shadow-1,0_1px_2px_rgba(17,18,23,0.05))] transition-all flex flex-col gap-2 min-w-[220px]"
    >
      <div className="flex items-center justify-between text-xs text-[var(--tess-ink-secondary,#62666F)] font-medium">
        <span>{label}</span>
        {change && (
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
              isPositive
                ? 'bg-emerald-50 text-[var(--tess-signal-success,#177B55)] border border-emerald-200'
                : 'bg-rose-50 text-[var(--tess-signal-danger,#C83D48)] border border-rose-200'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-[var(--tess-ink,#111217)] font-[var(--tess-font-display,sans-serif)]">
        {value}
      </div>
      {subtext && (
        <div className="text-[11px] text-[var(--tess-ink-muted,#8B8F97)]">
          {subtext}
        </div>
      )}
    </div>
  );
}

export interface AppHeaderProps {
  brandName?: string;
  links?: Array<{ label: string; href?: string }>;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export function AppHeader({
  brandName = 'Tessellate System',
  links = [
    { label: 'Overview', href: '#' },
    { label: 'Telemetry', href: '#' },
    { label: 'Settings', href: '#' },
  ],
  ctaLabel = 'Launch',
  onCtaClick,
}: AppHeaderProps): React.ReactElement {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-[var(--tess-canvas,#F4F2ED)] border-b border-[var(--tess-hairline,#D9D6CF)]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 font-bold tracking-tight text-[var(--tess-ink,#111217)] font-[var(--tess-font-heading,sans-serif)]">
          <div className="w-4 h-4 rounded-[var(--tess-radius-xs,4px)] bg-[var(--tess-accent,#2547E8)]" />
          <span>{brandName}</span>
        </div>
        <nav className="hidden sm:flex items-center gap-4 text-xs font-medium text-[var(--tess-ink-secondary,#62666F)]">
          {links.map((link) => (
            <a key={link.label} href={link.href ?? '#'} className="hover:text-[var(--tess-ink,#111217)] transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      {ctaLabel && (
        <button
          type="button"
          onClick={onCtaClick}
          className="px-3.5 py-1.5 rounded-[var(--tess-radius-sm,8px)] bg-[var(--tess-accent,#2547E8)] hover:bg-[var(--tess-accent-hover,#1E3CCD)] text-white text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-[var(--tess-focus-ring-width,2px)] focus:ring-[var(--tess-focus-ring-color,#2547E8)] focus:ring-offset-[var(--tess-focus-ring-offset,2px)]"
        >
          {ctaLabel}
        </button>
      )}
    </header>
  );
}

export interface HeroBannerProps {
  headline?: string;
  description?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryClick?: () => void;
}

export function HeroBanner({
  headline = 'Engineered for Deterministic Precision',
  description = 'Compose cohesive interface architecture with rigorous Design DNA and zero runtime lock-in.',
  primaryActionLabel = 'Get Started',
  secondaryActionLabel = 'Explore Architecture',
  onPrimaryClick,
}: HeroBannerProps): React.ReactElement {
  return (
    <section className="w-full py-12 px-6 flex flex-col items-start gap-4 bg-[var(--tess-surface,#FAF9F6)] border border-[var(--tess-hairline,#D9D6CF)] rounded-[var(--tess-radius-lg,20px)] shadow-[var(--tess-shadow-1,0_1px_2px_rgba(17,18,23,0.05))]">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--tess-ink,#111217)] font-[var(--tess-font-display,sans-serif)]">
          {headline}
        </h1>
        <p className="text-sm sm:text-base text-[var(--tess-ink-secondary,#62666F)] font-[var(--tess-font-body,sans-serif)] leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {primaryActionLabel && (
          <button
            type="button"
            onClick={onPrimaryClick}
            className="px-4 py-2 rounded-[var(--tess-radius-sm,8px)] bg-[var(--tess-accent,#2547E8)] hover:bg-[var(--tess-accent-hover,#1E3CCD)] text-white text-xs font-semibold transition-all focus:outline-none focus:ring-[var(--tess-focus-ring-width,2px)] focus:ring-[var(--tess-focus-ring-color,#2547E8)]"
          >
            {primaryActionLabel}
          </button>
        )}
        {secondaryActionLabel && (
          <button
            type="button"
            className="px-4 py-2 rounded-[var(--tess-radius-sm,8px)] border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface-raised,#FFFFFF)] text-[var(--tess-ink,#111217)] text-xs font-semibold hover:bg-[var(--tess-surface,#FAF9F6)] transition-all"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </section>
  );
}

import { GENERATED_GOLD_RENDERERS } from './generated-gold-registry.js';

export const DEFAULT_RESOURCE_RENDERERS: ResourceRendererMap = {
  // Generated Gold 40 resource components
  ...GENERATED_GOLD_RENDERERS,

  // Primitives family
  button: Button as unknown as React.ComponentType<Record<string, unknown>>,
  'res_primitive_button_01': Button as unknown as React.ComponentType<Record<string, unknown>>,

  // Analytics family
  'metric-card': MetricCard as unknown as React.ComponentType<Record<string, unknown>>,
  'res_analytics_metric_card_01': MetricCard as unknown as React.ComponentType<Record<string, unknown>>,

  // Navigation family
  'app-header': AppHeader as unknown as React.ComponentType<Record<string, unknown>>,
  'res_nav_header_01': AppHeader as unknown as React.ComponentType<Record<string, unknown>>,

  // Marketing family
  'hero-banner': HeroBanner as unknown as React.ComponentType<Record<string, unknown>>,
  'res_marketing_hero_01': HeroBanner as unknown as React.ComponentType<Record<string, unknown>>,
};
