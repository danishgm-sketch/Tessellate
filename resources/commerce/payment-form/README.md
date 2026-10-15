# Payment Form

Checkout payment layout with billing name and postcode and a slot for your provider's secure card fields; it never handles card numbers itself.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `heading` | string | Heading. |
| `amountLabel` | string | Formatted amount on the pay button. |
| `cardFields` | node | Your payment provider's secure card fields. |
| `onPay` | callback | Receives { name, postcode } when the form is valid. |
| `errorMessage` | string | Error from your service, announced in an alert region when payment fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `securityNote` | string | Line under the button. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
