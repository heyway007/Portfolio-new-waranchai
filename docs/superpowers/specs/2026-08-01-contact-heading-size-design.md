# Contact Heading Size Design

## Objective

Reduce the public Contact heading so it remains prominent without overpowering the contact details or surrounding sections.

## Typography

- Desktop and tablet: `font-size: clamp(2.25rem, 5vw, 4.75rem)`.
- Mobile at 760px and below: `font-size: clamp(2rem, 10vw, 3.25rem)`.
- Keep the existing `max-width`, weight, letter spacing, line height, wrapping, content, and Contact layout.

## Alternatives considered

- Medium reduction (selected): retains a clear closing statement while improving balance.
- Small size: creates more space but weakens the visual close of the page.
- Slight reduction: may remain too dominant on common laptop widths.

## Verification

Design contracts assert both exact responsive font-size values. Existing public layout, section spacing, Admin, build, tests, lint, and TypeScript checks must pass.

## Scope

This change modifies only `.contact-message h2` font sizing. It does not change content, components, Contact columns, spacing, CMS/Admin behavior, or deployment configuration.
