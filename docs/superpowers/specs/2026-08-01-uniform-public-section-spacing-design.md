# Uniform Public Section Spacing Design

## Objective

Reduce excessive vertical whitespace and apply the same top and bottom padding to every public content section after the Hero.

## Spacing scale

- Desktop above 1199px: `5rem` (80px) top and bottom.
- Tablet from 761px through 1199px: `4rem` (64px) top and bottom.
- Mobile at 760px and below: `3rem` (48px) top and bottom.

The shared `--section-space` custom property owns these values. About, Work, Experience, and Skills continue consuming it through `.section`. Contact uses the same value for both block edges instead of retaining its separate `2rem` bottom padding.

## Scope boundaries

- Keep Hero spacing unchanged because it uses a distinct layout and does not consume `.section` padding.
- Keep horizontal content rails, Work/Skills/Contact gutters, carousel layout, heading width, heading wrapping, typography, Admin styles, and CMS data unchanged.
- Do not introduce per-section spacing overrides.

## Alternatives considered

- Responsive 80/64/48px shared spacing (selected): compact on each device class while remaining consistent across sections.
- Fixed 64px at all widths: simpler, but too tight on large displays and too loose on small phones.
- More compact 64/56/40px: reduces scrolling further but compresses the large-heading visual rhythm too much.

## Verification

Design contracts assert all three exact `--section-space` values and require Contact to use `var(--section-space)` on both vertical edges. Existing build, integration tests, unit tests, lint, TypeScript, carousel, public heading, and Admin contracts must pass.

## Scope

This change modifies public vertical section padding only. It does not change components, content, databases, deployment, horizontal width, or Admin behavior.
