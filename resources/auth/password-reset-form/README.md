# Password Reset Form

Request a password reset link with an account-neutral confirmation that never reveals whether an email is registered.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `productName` | string | Product name shown above the form. |
| `heading` | string | Form heading. |
| `description` | string | Explanation under the heading. |
| `onSubmit` | callback | Receives the email address and sends the reset email. |
| `errorMessage` | string | Error from your service, announced in an alert region when the request fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `signInHref` | string | Link back to sign-in. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
