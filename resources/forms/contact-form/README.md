# Contact Form

Contact or support request with topic choice, validation and a sent confirmation.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading. |
| `description` | string | Line under the heading. |
| `topics` | string[] | Topics to choose from. |
| `onSubmit` | callback | Receives { name, email, topic, message }. |
| `errorMessage` | string | Error from your service, announced in an alert region when sending fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `responseTime` | string | Expected reply time shown after sending. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
