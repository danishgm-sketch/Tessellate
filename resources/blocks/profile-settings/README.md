# Profile Settings

Profile and reminder preferences with validation, loading and a saved confirmation.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading. |
| `description` | string | Line under the heading. |
| `initialValues` | object | Current values: { name, email, phone, emailReminders, textReminders }. |
| `onSave` | callback | Receives the values. |
| `errorMessage` | string | Error announced in an alert region. |
| `loading` | boolean | Loading state. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
