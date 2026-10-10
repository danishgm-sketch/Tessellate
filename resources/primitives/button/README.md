# Button Primitive

Tactile, accessible multi-intent button primitive with three curated launch configurations: **Quiet**, **Expressive**, and **Nocturne**.

## Intent & Usage

- **Summary**: Primary and secondary interactive action trigger for initiating operations, submitting forms, confirming decisions, or navigating.
- **Ideal For**: Primary forms, dialog actions, toolbar triggers, card actions.
- **Avoid For**: In-line body copy links, dense data table status indicators.
- **Jobs**:
  - Submit user intent
  - Trigger modal dialog
  - Confirm dangerous operation
  - Cancel ongoing action

## Curated Configurations

1. **Quiet** (Default)
   - Monochrome, restrained, minimal contrast for high data density shells.
   - Ideal for developer tools, dashboards, and institutional software.
2. **Expressive**
   - Cobalt interactive system emphasis, tactile elevation and hover lift.
   - Ideal for product onboarding, marketing CTAs, and modern SaaS.
3. **Nocturne**
   - Obsidian dark canvas with razor-sharp hairline borders and crisp luminescence.
   - Ideal for dark-mode IDEs, creative tooling, and financial terminals.

## Props API

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'quiet' \| 'expressive' \| 'nocturne'` | `'quiet'` | Curated design personality variant |
| `intent` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Semantic action priority |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Height and padding dimension |
| `icon` | `React.ReactNode` | `undefined` | Optional icon graphic |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon alignment relative to label |
| `disabled` | `boolean` | `false` | Disables interaction and reduces opacity |

## Accessibility Verification

- **Target**: WCAG 2.2 AA compliant.
- **Keyboard Navigation**: Native HTML `<button>` semantics. Triggers on `Enter` and `Space`.
- **Focus Indicator**: High-contrast 2px focus ring with offset, visible across all themes.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce`, eliminating transitions and tactile scaling.
- **Screen Readers**: Supports native `aria-*` attributes.

## Performance

- **Bundle footprint**: < 1 KB gzip.
- **Dependencies**: Zero external dependencies (native React + Tailwind CSS 4).
- **Runtime complexity**: Low (deterministic CSS class composition).
