# Site Header

Site header with brand, links and a call to action; collapses into a disclosure menu on small screens.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `brand` | string | Product name. |
| `brandHref` | string | Brand link. |
| `items` | object[] | Links: [{ label, href }]. |
| `actionLabel` | string | Call to action label. |
| `actionHref` | string | Call to action link. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
