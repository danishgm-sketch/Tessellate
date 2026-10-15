# Record Form

Create or edit a record from its fields, with input types inferred from field names and required-field validation.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Form heading (defaults to "New <entity>"). |
| `description` | string | Line under the heading. |
| `entity` | string | Record type, e.g. "Appointment". |
| `fields` | object[] | Field names or { name, label, type, required, options, hint } specs. |
| `onSubmit` | callback | Receives the values keyed by field name. |
| `onCancel` | callback | Shows a Cancel button when provided. |
| `submitLabel` | string | Button label. |
| `errorMessage` | string | Error from your service, announced in an alert region when saving fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
