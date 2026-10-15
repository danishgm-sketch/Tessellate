# Week Calendar

Five-day week view built from events or from record rows: day columns on wide screens, an agenda list on small ones.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading, empty states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading. |
| `description` | string | Line under the heading. |
| `entity` | string | What is scheduled. |
| `events` | object[] | Events: [{ title, start, detail }]. |
| `columns` | string[] | Record fields (a date-like field becomes the time). |
| `rows` | object[] | Records to place on the calendar. |
| `sampleData` | boolean | Marks the schedule as sample. |
| `weekStart` | string | First day (ISO date). |
| `locale` | string | Locale for day names. |
| `loading` | boolean | Loading state. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
