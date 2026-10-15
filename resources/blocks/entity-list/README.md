# Record List

Compact list of records with title, subtitle and status; good for side panels and small screens.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading, empty states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | List heading. |
| `description` | string | Line under the heading. |
| `entity` | string | Record type. |
| `columns` | string[] | Title, subtitle and status fields. |
| `rows` | object[] | Records. |
| `sampleData` | boolean | Marks rows as sample. |
| `hrefFor` | callback | Builds a link for each record. |
| `loading` | boolean | Loading state. |
| `emptyMessage` | string | Shown when there are no records. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
