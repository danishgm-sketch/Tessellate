# Activity Feed

Recent activity as an ordered list of who did what and when.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading, empty states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading. |
| `description` | string | Line under the heading. |
| `items` | object[] | Items: [{ actor, action, target, time }]. |
| `loading` | boolean | Loading state. |
| `emptyMessage` | string | Shown when there is no activity. |
| `locale` | string | Locale for times. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
