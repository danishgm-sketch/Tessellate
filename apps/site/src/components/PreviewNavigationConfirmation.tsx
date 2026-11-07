import type { PreviewNavigationDestination } from '@tessellate/catalog/protocol';

interface PreviewNavigationConfirmationProps {
  destination: PreviewNavigationDestination;
  onDismiss: () => void;
}

export function PreviewNavigationConfirmation({
  destination,
  onDismiss,
}: PreviewNavigationConfirmationProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-canvas,#F4F2ED)] px-4 py-3 text-xs text-[var(--tess-ink-secondary,#62666F)]"
    >
      <span>
        This isolated preview requested a link to <code className="font-mono text-[var(--tess-ink,#111217)]">{destination.label}</code>.
      </span>
      <span className="flex items-center gap-3">
        <a
          href={destination.href}
          target={destination.external ? '_blank' : undefined}
          rel={destination.external ? 'noopener noreferrer' : undefined}
          className="font-semibold text-[var(--tess-cobalt,#2547E8)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Open preview link
        </a>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded px-1 py-0.5 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Dismiss
        </button>
      </span>
    </div>
  );
}
