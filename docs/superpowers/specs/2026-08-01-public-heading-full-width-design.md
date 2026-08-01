# Public Heading Full-width Design

## Objective

Make every public section heading visually occupy the complete width available inside its existing section container. The surrounding section content rail and project carousel padding remain unchanged.

## Root cause

The public `.section-heading` grid already uses one column. Its `<h2>` still has `max-width: 18ch`, which visually preserves the narrow heading width from the former two-column design and makes the layout appear locked.

## Styling change

- Set `.section-heading` and `.section-heading-wide` to `width: 100%` while retaining their one-column grid.
- Set `.section-heading h2` to `width: 100%` and `max-width: none`.
- Keep existing font size, line height, wrapping, responsive breakpoints, section content rails, and carousel padding.
- Do not change Admin styles or components.

## Alternatives considered

- Remove the heading text constraint only (selected together with explicit wrapper width): fixes the root cause and makes the intended width unambiguous.
- Change headings to `display: block`: unnecessary because the one-column grid already behaves correctly.
- Expand every section and carousel edge-to-edge: broader than requested and would change the established page gutters.

## Verification

Design contracts assert `width: 100%` on both heading classes and on their `<h2>`, plus `max-width: none` on the `<h2>`. Existing public rendering, carousel, Admin, build, test, lint, and TypeScript checks must continue to pass.

## Scope

This change modifies public heading width only. It does not modify content, components, CMS/Admin behavior, section rails, carousel layout, database bindings, or deployment configuration.
