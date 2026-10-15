import React, { useId, useRef, useState } from 'react';

export type DocumentEditorVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DocumentEditorProps {
  heading?: string;
  /** Record being written, e.g. "Treatment note". */
  entity?: string;
  /** Initial Markdown text. */
  value?: string;
  onChange?: (markdown: string) => void;
  onSave?: (markdown: string) => void | Promise<void>;
  placeholder?: string;
  /** Last saved time to show, e.g. "Saved 2 minutes ago". */
  savedLabel?: string;
  errorMessage?: string;
  loading?: boolean;
  readOnly?: boolean;
  variant?: DocumentEditorVariant;
}

type Wrap = { label: string; before: string; after: string; keys: string };
const TOOLS: Wrap[] = [
  { label: 'Bold', before: '**', after: '**', keys: 'Ctrl+B' },
  { label: 'Italic', before: '_', after: '_', keys: 'Ctrl+I' },
  { label: 'Heading', before: '## ', after: '', keys: '' },
  { label: 'Bullet list', before: '- ', after: '', keys: '' },
];

/**
 * Plain-text Markdown editor for notes and documents: formatting toolbar, keyboard shortcuts, word count and
 * save state. Markdown keeps exports framework-neutral and safe (no HTML injection).
 */
export function DocumentEditor({
  heading,
  entity = 'note',
  value = '',
  onChange,
  onSave,
  placeholder,
  savedLabel,
  errorMessage,
  loading = false,
  readOnly = false,
  variant = 'quiet',
}: DocumentEditorProps) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(value);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const shell = variant === 'expressive' ? 'shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';

  const update = (next: string) => {
    setText(next);
    setDirty(true);
    onChange?.(next);
  };

  const apply = (tool: Wrap) => {
    const el = ref.current;
    if (!el || readOnly) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const next = text.slice(0, s) + tool.before + text.slice(s, e) + tool.after + text.slice(e);
    update(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + tool.before.length, e + tool.before.length);
    });
  };

  const save = async () => {
    if (!onSave || busy) return;
    setBusy(true);
    try {
      await onSave(text);
      setDirty(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`w-full rounded-ui-lg bg-surface-raised font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`} aria-busy={loading || busy}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
          {heading ?? `${entity.charAt(0).toUpperCase()}${entity.slice(1)}`}
        </h2>
        <div role="toolbar" aria-label="Formatting" aria-controls={`${id}-text`} className="flex flex-wrap gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              disabled={readOnly}
              onClick={() => apply(tool)}
              title={tool.keys ? `${tool.label} (${tool.keys})` : tool.label}
              className="rounded-ui-xs border border-hairline bg-surface px-2.5 py-1.5 text-sm font-medium text-ink hover:bg-surface-raised disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {tool.label}
            </button>
          ))}
        </div>
      </header>
      <div role="alert" className="px-4 empty:hidden">
        {errorMessage && <p className="mt-3 rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      <label htmlFor={`${id}-text`} className="sr-only">
        {entity} text (Markdown)
      </label>
      {loading ? (
        <p role="status" className="px-4 py-10 text-sm text-ink-secondary">
          Loading…
        </p>
      ) : (
        <textarea
          id={`${id}-text`}
          ref={ref}
          value={text}
          readOnly={readOnly}
          placeholder={placeholder ?? `Write the ${entity.toLowerCase()}…`}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
              e.preventDefault();
              apply(TOOLS[0]!);
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
              e.preventDefault();
              apply(TOOLS[1]!);
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
              e.preventDefault();
              void save();
            }
          }}
          rows={14}
          className="block w-full resize-y bg-surface-raised px-4 py-4 font-body text-base leading-relaxed text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        />
      )}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-4 py-3 text-sm text-ink-secondary">
        <span aria-live="polite">
          {words} {words === 1 ? 'word' : 'words'} · {busy ? 'Saving…' : dirty ? 'Unsaved changes' : savedLabel ?? 'All changes saved'}
        </span>
        {onSave && !readOnly && (
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy || !dirty}
            className="rounded-ui-sm bg-accent px-3 py-1.5 font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Save
          </button>
        )}
      </footer>
    </section>
  );
}
