import React, { useId } from 'react';

export type OrderSummaryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OrderLine {
  name: string;
  quantity?: number;
  /** Unit price in minor units (pence/cents) to avoid rounding errors. */
  unitAmount: number;
  description?: string;
}

export interface OrderSummaryProps {
  heading?: string;
  lines?: OrderLine[];
  /** ISO 4217 code, e.g. "GBP". */
  currency?: string;
  /** Discount in minor units. */
  discountAmount?: number;
  discountLabel?: string;
  /** Tax in minor units; omit when prices include tax. */
  taxAmount?: number;
  taxLabel?: string;
  shippingAmount?: number;
  /** Amount due now, when only a deposit is taken (minor units). */
  dueNowAmount?: number;
  loading?: boolean;
  locale?: string;
  variant?: OrderSummaryVariant;
}

const SAMPLE_LINES: OrderLine[] = [
  { name: 'Initial assessment (45 min)', unitAmount: 6500 },
  { name: 'Follow-up session', quantity: 2, unitAmount: 4500 },
];

/** Line items, adjustments and totals, formatted for the given currency and locale. */
export function OrderSummary({
  heading = 'Order summary',
  lines,
  currency = 'GBP',
  discountAmount = 0,
  discountLabel = 'Discount',
  taxAmount,
  taxLabel = 'VAT',
  shippingAmount,
  dueNowAmount,
  loading = false,
  locale = 'en-GB',
  variant = 'quiet',
}: OrderSummaryProps) {
  const id = useId();
  const items = lines ?? SAMPLE_LINES;
  const fmt = (minor: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
  const subtotal = items.reduce((sum, l) => sum + l.unitAmount * (l.quantity ?? 1), 0);
  const total = subtotal - discountAmount + (taxAmount ?? 0) + (shippingAmount ?? 0);
  const shell = variant === 'expressive' ? 'shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';
  const row = 'flex justify-between gap-4 py-1.5 text-sm';

  return (
    <section className={`w-full max-w-md rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`} aria-busy={loading}>
      <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
        {heading}
      </h2>
      {!lines && <p className="mt-1 text-xs text-ink-secondary">Example items.</p>}
      {loading ? (
        <p role="status" className="mt-4 text-sm text-ink-secondary">
          Updating totals…
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-secondary">Your basket is empty.</p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-hairline">
            {items.map((l, i) => (
              <li key={`${l.name}-${i}`} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {l.name}
                    {(l.quantity ?? 1) > 1 && <span className="text-ink-secondary"> × {l.quantity}</span>}
                  </p>
                  {l.description && <p className="text-xs text-ink-secondary">{l.description}</p>}
                </div>
                <p className="text-sm font-medium tabular-nums text-ink">{fmt(l.unitAmount * (l.quantity ?? 1))}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 border-t border-hairline pt-3">
            <div className={row}>
              <dt className="text-ink-secondary">Subtotal</dt>
              <dd className="tabular-nums">{fmt(subtotal)}</dd>
            </div>
            {discountAmount > 0 && (
              <div className={row}>
                <dt className="text-ink-secondary">{discountLabel}</dt>
                <dd className="tabular-nums text-success">−{fmt(discountAmount)}</dd>
              </div>
            )}
            {shippingAmount !== undefined && (
              <div className={row}>
                <dt className="text-ink-secondary">Delivery</dt>
                <dd className="tabular-nums">{shippingAmount === 0 ? 'Free' : fmt(shippingAmount)}</dd>
              </div>
            )}
            {taxAmount !== undefined && (
              <div className={row}>
                <dt className="text-ink-secondary">{taxLabel}</dt>
                <dd className="tabular-nums">{fmt(taxAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-hairline pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{fmt(total)}</dd>
            </div>
            {dueNowAmount !== undefined && (
              <div className="mt-2 flex justify-between gap-4 rounded-ui-sm bg-accent-soft px-3 py-2 text-sm font-semibold text-ink">
                <dt>Due now</dt>
                <dd className="tabular-nums">{fmt(dueNowAmount)}</dd>
              </div>
            )}
          </dl>
        </>
      )}
    </section>
  );
}
