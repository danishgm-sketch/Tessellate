# App Sidebar

Application navigation: a vertical sidebar from the md breakpoint and a scrollable bar on small screens, with the client's brand and aria-current on the active page.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `brand` | string | Product name shown at the top. |
| `items` | object[] | Links: [{ label, href }]. |
| `activeHref` | string | Current page; defaults to the first item. |
| `userLabel` | string | Signed-in user text. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
