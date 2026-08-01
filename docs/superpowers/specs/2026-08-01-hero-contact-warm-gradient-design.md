# Hero Contact Action and Warm Graphite Background Design

## Goal

Make the Thai “คุยเรื่องโปรเจกต์” hero action move visitors directly to the Contact section, and brighten the public portfolio with the approved Warm Graphite gradient without changing Admin styling or CMS data.

## Approved Direction

- The user selected visual option A, Warm Graphite.
- The hero contact action must navigate to `#contact` instead of opening an email client.
- Navigation uses the existing native anchor and global smooth-scrolling behavior.
- The public page receives a layered graphite gradient with restrained orange and slate-blue light.
- The existing orange accent, light text, technical grid, cards, and component layouts remain unchanged.

## Interaction Design

`Hero.tsx` keeps the secondary action as an `<a>` element and changes only its destination from `mailto:` to `#contact`. Native fragment navigation is preferred over `scrollIntoView()` because it remains keyboard-accessible, works without extra client state, provides a meaningful URL fragment, and automatically follows the existing reduced-motion rule that disables smooth scrolling when requested.

The Contact section already owns the unique `id="contact"`, so no new component, event handler, or data field is required. The localized button label continues to come from `settings.copy.heroContactAction`.

## Visual Design

The `.portfolio-site` background becomes a three-layer Warm Graphite composition:

1. A restrained orange radial glow near the upper-left area.
2. A subtle slate-blue radial glow toward the lower-right area.
3. A brighter graphite linear gradient running from `#1c2229` through `#11161c` to `#202832`.

The gradient applies only to `.portfolio-site`. Admin pages and global paper/ink tokens are out of scope. Text and interactive controls retain their existing colors to preserve contrast and visual identity.

## Responsive and Accessibility Behavior

- The gradient scales naturally with the public page and needs no breakpoint-specific override.
- The native `#contact` link works with keyboard navigation and the existing `scroll-padding-top` value.
- Existing `prefers-reduced-motion` CSS changes smooth navigation to immediate navigation.
- No new animation or motion effect is introduced.

## Testing

- Add a source/design contract proving the hero secondary action uses `href="#contact"` and no longer constructs a `mailto:` URL.
- Add a CSS design contract proving `.portfolio-site` includes the approved Warm Graphite gradient layers.
- Run the full build/integration suite, unit suite, ESLint, and TypeScript checks.

## Scope

In scope: the public Hero contact action, the public `.portfolio-site` background, related regression contracts, and ignoring local Visual Companion artifacts.

Out of scope: Contact content, email/phone links inside Contact, Admin pages, CMS schema, D1/R2 bindings, layout, typography, and deployment configuration.
