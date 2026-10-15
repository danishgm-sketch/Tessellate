# Booking Slot Picker

Day tabs and a grid of available times; arrow keys move between days and exactly one slot can be chosen.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading, empty and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading (defaults to "Choose a time for your <entity>"). |
| `description` | string | Line under the heading. |
| `entity` | string | What is booked, e.g. "Appointment". |
| `days` | object[] | Availability: [{ date: "2026-01-12", slots: ["09:00", …] }]. Omit to show labelled example availability. |
| `durationMinutes` | number | Slot length shown to the user. |
| `onSelect` | callback | Receives { date, time } when a slot is chosen. |
| `loading` | boolean | Shows "Loading availability…". |
| `errorMessage` | string | Error announced in an alert region. |
| `locale` | string | Locale for day names, e.g. "en-GB". |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
