import React, { useRef, useState } from 'react';

export type FilterBuilderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FilterBuilderProps {
  variant?: FilterBuilderVariant;
}

interface FilterRule {
  id: number;
  field: string;
  operator: string;
  value: string;
}

const fields = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'location', label: 'Location' },
  { id: 'createdAt', label: 'Created date' },
];

const operators = [
  { id: 'contains', label: 'contains' },
  { id: 'equals', label: 'equals' },
  { id: 'startsWith', label: 'starts with' },
];

export function FilterBuilder({ variant = 'quiet' }: FilterBuilderProps) {
  const [rules, setRules] = useState<FilterRule[]>([]);
  const nextRuleId = useRef(1);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const addRule = () => {
    const id = nextRuleId.current++;
    setRules((current) => [...current, { id, field: '', operator: 'contains', value: '' }]);
  };

  const updateRule = (id: number, update: Partial<Omit<FilterRule, 'id'>>) => {
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, ...update } : rule))
    );
  };

  const removeRule = (id: number) => {
    setRules((current) => current.filter((rule) => rule.id !== id));
  };

  return (
    <div className={`w-full p-4 sm:p-6 rounded-[var(--tess-radius-xl,8px)] border transition-colors ${bg}`}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-sm font-semibold">Filter Rules</h3>
        <button type="button" onClick={addRule} className="text-xs px-2.5 py-2 rounded border min-h-10">
          + Add Condition
        </button>
      </div>

      {rules.length === 0 ? (
        <p className="text-xs text-neutral-600 dark:text-neutral-300 py-3">
          No conditions yet. Add a condition to build a filter.
        </p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => {
            const fieldLabel = fields.find((field) => field.id === rule.field)?.label ?? '';
            const operatorLabel = operators.find((operator) => operator.id === rule.operator)?.label ?? '';
            const summary = [fieldLabel, operatorLabel, rule.value.trim()].filter(Boolean).join(' ');

            return (
              <div
                key={rule.id}
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2"
              >
                <label className="min-w-0 text-xs font-medium">
                  <span className="sr-only">Field {index + 1}</span>
                  <select
                    aria-label={`Field ${index + 1}`}
                    value={rule.field}
                    onChange={(event) => updateRule(rule.id, { field: event.target.value })}
                    className="w-full min-h-10 rounded border bg-transparent px-2"
                  >
                    <option value="">Choose a field</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0 text-xs font-medium">
                  <span className="sr-only">Operator {index + 1}</span>
                  <select
                    aria-label={`Operator ${index + 1}`}
                    value={rule.operator}
                    onChange={(event) => updateRule(rule.id, { operator: event.target.value })}
                    className="w-full min-h-10 rounded border bg-transparent px-2"
                  >
                    {operators.map((operator) => (
                      <option key={operator.id} value={operator.id}>
                        {operator.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0 text-xs font-medium">
                  <span className="sr-only">Value {index + 1}</span>
                  <input
                    aria-label={`Value ${index + 1}`}
                    value={rule.value}
                    onChange={(event) => updateRule(rule.id, { value: event.target.value })}
                    placeholder="Enter a value"
                    className="w-full min-h-10 rounded border bg-transparent px-2"
                  />
                </label>
                <button
                  type="button"
                  aria-label={`Remove condition ${index + 1}`}
                  onClick={() => removeRule(rule.id)}
                  className="min-h-10 min-w-10 rounded border px-2 text-xs"
                >
                  Remove
                </button>
                {summary && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="sm:col-span-4 text-xs font-mono text-neutral-600 dark:text-neutral-300"
                  >
                    {summary}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-300">
        Example rules only. Connect a data source to apply filters.
      </p>
    </div>
  );
}
