# Order Summary

Line items, discount, delivery, tax and totals in minor units, formatted for any currency and locale.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading, empty states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading. |
| `lines` | object[] | Items: [{ name, quantity, unitAmount (minor units), description }]. Omit to show labelled example items. |
| `currency` | string | ISO 4217 code, e.g. "GBP". |
| `discountAmount` | number | Discount in minor units. |
| `discountLabel` | string | Discount label. |
| `taxAmount` | number | Tax in minor units. |
| `taxLabel` | string | Tax label, e.g. "VAT". |
| `shippingAmount` | number | Delivery in minor units (0 shows "Free"). |
| `dueNowAmount` | number | Deposit due now in minor units. |
| `loading` | boolean | Shows "Updating totals…". |
| `locale` | string | Locale for number formatting. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
