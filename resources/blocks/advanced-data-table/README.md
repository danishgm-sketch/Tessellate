# Records Table

Records table with search, sortable columns (aria-sort), pagination and loading, empty and error states.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading, empty and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Table heading. |
| `description` | string | Line under the heading. |
| `entity` | string | Record type. |
| `columns` | string[] | Column keys in order. |
| `rows` | object[] | Rows keyed by column. |
| `sampleData` | boolean | Marks rows as sample data. |
| `pageSize` | number | Rows per page. |
| `loading` | boolean | Loading state. |
| `errorMessage` | string | Error announced in an alert region. |
| `emptyMessage` | string | Shown when there are no rows. |
| `onRowClick` | callback | Receives the clicked row. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
