# Sign-up Form

Account creation with name, email, password length guidance and terms consent.

Contract v2: content comes from props, styling uses only semantic token utilities (`bg-surface`, `text-ink`, `bg-accent` …), and loading and error states are built in. Status: **experimental** until a human review.

## Props

| Prop | Type | Description |
|---|---|---|
| `productName` | string | Product name shown above the form. |
| `heading` | string | Form heading. |
| `description` | string | Short line under the heading. |
| `onSubmit` | callback | Receives { name, email, password, acceptTerms }. |
| `errorMessage` | string | Error from your service, announced in an alert region when sign-up fails. |
| `loading` | boolean | Shows the busy state and disables submission. |
| `minPasswordLength` | number | Minimum password length checked in the form (enforce on the server too). |
| `termsHref` | string | Terms page link. |
| `privacyHref` | string | Privacy policy link. |
| `signInHref` | string | Sign-in page link. |
| `submitLabel` | string | Button label. |
| `variant` | enum (quiet / expressive / nocturne) | Emphasis: quiet, expressive (elevated) or nocturne (strong outline). Colours come from tokens. |

## Accessibility

Labelled controls, errors linked with `aria-describedby` and announced in alert regions, visible focus, and no motion beyond short colour transitions (disabled under reduced motion). Checked automatically with axe (including AAA contrast) at 360, 768 and 1440 px.
