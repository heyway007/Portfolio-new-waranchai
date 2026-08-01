# Full-width Header and Code Hero Design

## Objective

Make the public landing view feel closer to a modern developer portfolio: a full-width sticky header, a left hero panel using the existing portrait as a background behind the current introduction, and a right code editor that types a realistic Laravel Blade example using Livewire and Reverb.

## Header

The sticky header spans the full viewport instead of using `--content-rail`. Its brand, navigation, and language controls keep the current three-column desktop layout but use responsive horizontal padding. The mobile menu remains anchored to the full-width header and retains its current 44px touch targets.

## Hero composition

The hero remains the first content section and uses two balanced columns on desktop. The left panel contains the existing portrait as a cover image behind the existing availability, identity, introduction, and actions. A dark left-to-right and bottom gradient protects text contrast while allowing the portrait to remain visible. The portrait is decorative in this composition because the same person is identified by the heading.

The right panel resembles a compact dark editor. It includes window controls, a `realtime-dashboard.blade.php` tab, line numbers, a blinking caret, Laravel/Livewire/Reverb status labels, and a Reverb connection indicator. The code demonstrates a Blade view subscribing with Laravel Echo, reacting to a Reverb event, calling a Livewire method, and rendering a Livewire component.

## Animation

A focused client component owns the code sample and typing state. It types the sample from beginning to end, pauses, clears, and repeats. The editor is marked so screen readers do not announce every character. When `prefers-reduced-motion: reduce` is active, it renders the complete sample immediately and disables caret blinking and typing transitions.

## Responsive behavior

At tablet widths the two columns narrow while preserving the composition. At mobile widths they stack: the portrait/text panel appears first and the editor second. The editor keeps a bounded height and scrolls internally without widening the page. Header navigation continues to use the existing menu button.

## Alternatives considered

- React typing component (selected): supports dynamic text, looping, and reduced-motion behavior without coupling timings to text length.
- CSS `steps()` animation: fewer runtime lines, but brittle when the Blade sample changes and difficult to make multiline.
- Animated image or video: visually predictable but inaccessible, larger, and not responsive to content or theme changes.

## Accessibility and performance

- Preserve visible focus styles and current language/navigation semantics.
- Keep all controls at least 44px in both dimensions.
- Use the existing optimized portrait asset with `next/image` and no new remote media.
- Keep animated text out of live regions and provide an editor label.
- Disable motion and caret animation for reduced-motion users.

## Verification

- Component tests cover editor structure, Blade/Laravel/Livewire/Reverb content, and typing-state boundaries.
- Design-contract tests cover a full-width header, responsive stacking, and reduced-motion behavior.
- Rendered HTML tests confirm the new hero editor replaces the previous portrait frame.
- Build, full tests, unit tests, lint, TypeScript, and local responsive visual checks must pass.

## Scope

This change does not alter CMS data, D1/R2 bindings, other portfolio sections, project content, or deployment configuration.
