# Booking Details Form

Contact details, notes and consent for a booking, a deposit summary and a confirmation state.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading. |
| `description` | string | Line under the heading. |
| `entity` | string | What is booked. |
| `selectedSlotLabel` | string | Chosen slot, e.g. "Tuesday 13 January at 09:45". |
| `depositLabel` | string | Deposit due now, e.g. "£20.00". |
| `onSubmit` | callback | Receives { name, email, phone, notes, consent }. |
| `onBack` | callback | Shows a Back button when provided. |
| `errorMessage` | string | Error from your service, announced in an alert region when booking fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `confirmed` | boolean | Shows the confirmation state. |
| `privacyHref` | string | Privacy policy link. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
