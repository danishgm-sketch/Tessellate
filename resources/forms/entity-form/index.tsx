import React, { useId, useState } from 'react';

export type EntityFormVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityFieldSpec {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select';
  required?: boolean;
  options?: string[];
  hint?: string;
}

export interface EntityFormProps {
  heading?: string;
  description?: string;
  /** Record type being created, e.g. "Appointment". */
  entity?: string;
  /** Field names (types are inferred from the name) or full field specs. */
  fields?: Array<string | EntityFieldSpec>;
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  errorMessage?: string;
  loading?: boolean;
  variant?: EntityFormVariant;
}

function inferSpec(field: string | EntityFieldSpec): Required<Pick<EntityFieldSpec, 'name' | 'label' | 'type'>> & EntityFieldSpec {
  const spec = typeof field === 'string' ? { name: field } : field;
  const n = spec.name.toLowerCase();
  const type =
    spec.type ??
    (n.includes('email') ? 'email'
      : /(date and time|time|start|end)/.test(n) ? 'datetime-local'
      : /(date|due|birth)/.test(n) ? 'date'
      : /(amount|total|price|deposit|fee|count|quantity|capacity)/.test(n) ? 'number'
      : /(note|description|summary|reason|message)/.test(n) ? 'textarea'
      : n === 'status' ? 'select'
      : 'text');
  return {
    ...spec,
    label: spec.label ?? spec.name.charAt(0).toUpperCase() + spec.name.slice(1),
    type,
    options: spec.options ?? (type === 'select' ? ['Active', 'Pending', 'Completed'] : undefined),
  };
}

const control =
  'w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger';

/** Create-or-edit form generated from a record's fields, with required-field validation. */
export function EntityForm({
  heading,
  description,
  entity = 'record',
  fields = ['name', 'status', 'notes'],
  onSubmit,
  onCancel,
  submitLabel,
  errorMessage,
  loading = false,
  variant = 'quiet',
}: EntityFormProps) {
  const id = useId();
  const specs = fields.map(inferSpec);
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const missing = specs.filter((s) => (s.required ?? s === specs[0]) && !values[s.name]?.trim());
  const isLoading = loading || busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (missing.length || !onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(values);
    } finally {
      setBusy(false);
    }
  };

  const shell = variant === 'expressive' ? 'shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';

  return (
    <section className={`w-full max-w-2xl rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="font-heading text-xl font-semibold">
        {heading ?? `New ${entity.toLowerCase()}`}
      </h2>
      {description && <p className="mt-1 text-sm text-ink-secondary">{description}</p>}
      <div role="alert" className="mt-3 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
        {touched && missing.length > 0 && (
          <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">
            Fill in: {missing.map((m) => m.label).join(', ')}.
          </p>
        )}
      </div>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit} aria-busy={isLoading}>
        {specs.map((spec, i) => {
          const required = spec.required ?? i === 0;
          const invalid = touched && required && !values[spec.name]?.trim();
          const fieldId = `${id}-${i}`;
          const common = {
            id: fieldId,
            name: spec.name,
            required,
            value: values[spec.name] ?? '',
            'aria-invalid': invalid,
            'aria-describedby': spec.hint ? `${fieldId}-hint` : undefined,
            className: control,
          };
          const set = (v: string) => setValues((prev) => ({ ...prev, [spec.name]: v }));
          return (
            <div key={spec.name} className={spec.type === 'textarea' ? 'space-y-1.5 sm:col-span-2' : 'space-y-1.5'}>
              <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
                {spec.label}
                {required && <span className="text-ink-secondary"> (required)</span>}
              </label>
              {spec.type === 'textarea' ? (
                <textarea {...common} rows={4} onChange={(e) => set(e.target.value)} />
              ) : spec.type === 'select' ? (
                <select {...common} onChange={(e) => set(e.target.value)}>
                  <option value="">Choose…</option>
                  {(spec.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...common} type={spec.type} onChange={(e) => set(e.target.value)} />
              )}
              {spec.hint && (
                <p id={`${fieldId}-hint`} className="text-sm text-ink-secondary">
                  {spec.hint}
                </p>
              )}
            </div>
          );
        })}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-ui-sm bg-accent px-4 py-2.5 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {isLoading ? 'Saving…' : submitLabel ?? `Save ${entity.toLowerCase()}`}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-ui-sm border border-hairline-strong bg-surface-raised px-4 py-2.5 text-base font-medium text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
