# Record Header

Header for a single record: initials avatar, title, status, key facts and a primary action.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Record title (defaults to the first field). |
| `description` | string | Line under the title. |
| `entity` | string | Record type. |
| `fields` | string[] | Fields in display order. |
| `record` | object | The record. |
| `sampleData` | boolean | Marks the record as sample. |
| `actionLabel` | string | Primary action label. |
| `onAction` | callback | Primary action handler. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
