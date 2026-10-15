# Document Editor

Markdown editor for notes and documents with a formatting toolbar, keyboard shortcuts, word count and save state.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading, empty and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading (defaults to the entity name). |
| `entity` | string | What is being written, e.g. "Treatment note". |
| `value` | string | Initial Markdown. |
| `onChange` | callback | Receives the Markdown on every edit. |
| `onSave` | callback | Shows a Save button and handles Ctrl+S. |
| `placeholder` | string | Placeholder text. |
| `savedLabel` | string | Last-saved message. |
| `errorMessage` | string | Error from your service, announced in an alert region when saving fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `readOnly` | boolean | Read-only mode. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
