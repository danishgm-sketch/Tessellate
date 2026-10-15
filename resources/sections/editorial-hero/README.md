# Editorial Hero

Text-led hero with a strong heading, supporting line and up to two actions.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `eyebrow` | string | Line above the heading, e.g. the product name. |
| `heading` | string | Main heading. |
| `description` | string | Supporting line. |
| `primaryActionLabel` | string | Primary button. |
| `primaryActionHref` | string | Primary link. |
| `secondaryActionLabel` | string | Secondary button. |
| `secondaryActionHref` | string | Secondary link. |
| `note` | string | Reassurance under the buttons. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
