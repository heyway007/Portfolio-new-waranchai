# Contact Heading and Floating Back to Top Design

## Objective

Reduce the public Contact heading so it remains prominent without overpowering the contact details, and replace the footer-only Back to Top link with a floating control available after the visitor scrolls down the page.

## Typography

- Desktop and tablet: `font-size: clamp(2.25rem, 5vw, 4.75rem)`.
- Mobile at 760px and below: `font-size: clamp(2rem, 10vw, 3.25rem)`.
- Keep the existing `max-width`, weight, letter spacing, line height, wrapping, content, and Contact layout.

## Back to Top behavior

- Add one focused client component mounted once by the public portfolio shell.
- Keep the control out of the DOM while `window.scrollY <= 240` so it cannot receive focus while hidden.
- Render it as a fixed bottom-right link to `#top` after `window.scrollY > 240`.
- Use the existing localized `backToTop` CMS copy as the accessible label and visible text.
- Remove the old Back to Top link from `.footer-bottom` to avoid duplicate navigation.
- Listen to scroll events passively and update state only when the threshold result changes.

## Presentation and accessibility

- Use a compact dark circular/pill control with the existing orange accent, a minimum 48px hit target, visible hover/focus states, and sufficient stacking order.
- Keep the control inside the viewport on desktop and mobile using responsive bottom/right offsets.
- Respect the existing smooth-scroll behavior and the existing Reduced Motion rule that changes scrolling to automatic.
- Preserve the footer copyright and its responsive layout.

## Architecture

`BackToTop.tsx` owns the browser scroll state and exports a pure `shouldShowBackToTop(scrollY: number): boolean` helper for boundary testing. `PortfolioClient` supplies the localized label and mounts the control after the public content. `Contact` becomes presentation-only and no longer renders the footer navigation link.

## Alternatives considered

- Medium reduction (selected): retains a clear closing statement while improving balance.
- Small size: creates more space but weakens the visual close of the page.
- Slight reduction: may remain too dominant on common laptop widths.
- Scroll-position client component (selected): direct, deterministic, and easy to test at the 240px boundary.
- Hero sentinel with `IntersectionObserver`: valid but adds observer lifecycle complexity for one threshold.
- CSS scroll-driven animation: avoids state but browser support and focus/DOM behavior are less predictable.

## Verification

Unit tests cover the 240px visibility boundary. Rendered HTML and source contracts cover the single floating control, removed footer link, localized label, passive scroll listener, 48px hit target, fixed positioning, responsive offsets, and Reduced Motion behavior. Design contracts also assert both exact responsive heading font-size values. Existing public layout, section spacing, Admin, build, tests, lint, and TypeScript checks must pass.

## Scope

This change modifies `.contact-message h2`, introduces one public client control, and removes the duplicate footer link. It does not change Contact columns, section spacing, stored content, CMS/Admin behavior, database bindings, or deployment configuration.
