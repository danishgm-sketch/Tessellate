# Sign-in Form

Email and password sign-in with inline validation, accessible errors, a loading state and links to reset and sign-up.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `productName` | string | Product name shown above the form. |
| `heading` | string | Form heading. |
| `description` | string | Short line under the heading. |
| `onSubmit` | callback | Receives { email, password, remember }; return a promise to show the loading state. |
| `errorMessage` | string | Error from your service, announced in an alert region when sign-in fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `forgotPasswordHref` | string | Link to the password reset page. |
| `signUpHref` | string | Link to account creation. |
| `submitLabel` | string | Button label. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
