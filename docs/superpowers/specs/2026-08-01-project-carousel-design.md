# Project Carousel Design

## Objective

Replace the long project grid in the second public section with an automatic, responsive carousel. The desktop view shows three project cards per slide, while smaller screens reduce the visible count without changing the existing project content or card visual language.

## Carousel behavior

- Show three cards per slide at desktop widths, two at tablet widths, and one on mobile.
- Advance to the next slide automatically every five seconds and wrap from the final slide back to the first.
- Provide previous and next buttons plus clickable pagination dots.
- Pause automatic movement while the pointer is over the carousel or keyboard focus is anywhere inside it, then resume after interaction ends.
- Support horizontal swipe gestures on touch and pointer devices.
- Keep project numbering global across the full project collection rather than restarting at each slide.
- Clamp the current slide whenever the language, project collection, or responsive page size changes.

## Rendering and architecture

`ProjectGrid` becomes a focused client component and owns the active page, responsive page size, autoplay timer, pause state, and swipe gesture state. Pure helper functions calculate page size, page count, page wrapping, and the visible project slice so their boundary behavior can be unit-tested independently.

Only the current page of cards is mounted. This prevents the section from remaining a long rendered list and gives each navigation action a clear slide transition. The existing card markup, CMS-driven text, images, links, case-study details, and D1 data flow stay unchanged.

## Animation

Cards on the active page enter together with a short horizontal fade. Manual and automatic navigation use the same animation. The carousel frame clips the transition so off-page content does not create horizontal document overflow.

When `prefers-reduced-motion: reduce` is active, autoplay is disabled, swipe and manual controls remain available, and slide/card animation is removed.

## Responsive behavior

- Above 1199px: three equal-width columns.
- From 761px through 1199px: two equal-width columns.
- At 760px and below: one full-width card.

The controls remain at least 44px square. Pagination dots expose the current slide and localized accessible labels. A compact status announces the current slide out of the total without announcing every autoplay tick as an urgent update.

## Alternatives considered

- React state with a visible project slice (selected): renders only the active cards, needs no dependency, and allows deterministic responsive/autoplay behavior.
- CSS scroll snap: simple and touch-friendly, but keeps every project mounted in one long horizontal track and needs more coordination for autoplay and page-sized jumps.
- Third-party carousel library: feature-rich, but unnecessary for this bounded interaction and would add bundle/dependency overhead.

## Accessibility

- Label the carousel and navigation controls in the active language.
- Mark the current pagination dot with `aria-current="true"`.
- Pause autoplay during hover and keyboard focus.
- Keep focus visible and preserve existing links and `<details>` behavior.
- Disable autoplay and all slide transitions for reduced-motion users.

## Verification

- Unit tests cover responsive page sizing, page count, wraparound, and project slicing.
- Rendered HTML tests confirm the carousel structure, three initial cards, controls, and pagination status.
- CSS contract tests cover three/two/one-column layouts, control target sizes, animation, and reduced motion.
- Build, full tests, unit tests, lint, and TypeScript checks must pass.

## Scope

This change does not modify project data, CMS/admin behavior, database bindings, card content, other public sections, or deployment configuration.
