# Inter and Prompt Typography Design

## Summary

Replace every remaining portfolio, admin, and login font with one shared
fallback stack: `Inter, Prompt, sans-serif`. English and Latin characters use
Inter first; Thai characters fall back to Prompt. Remove IBM Plex Sans Thai
Looped and Geist Mono completely so the application loads only the two approved
families.

## Scope

- Apply the new stack to the public Portfolio, preview, admin, and admin login.
- Load Inter and Prompt through `next/font/google` with CSS variables.
- Use weights 400, 500, 600, and 700 for both families.
- Replace every explicit IBM Plex or Geist font reference in public and admin
  CSS with the same Inter/Prompt stack.
- Preserve all existing font sizes, weights, line heights, letter spacing,
  colors, layout, responsive behavior, and animation.
- Preserve CMS content, bilingual switching, D1, R2, authentication, APIs, and
  deployment configuration.

## Implementation Design

### Font loading

`app/layout.tsx` imports `Inter` and `Prompt` from `next/font/google`.

- Inter exposes `--font-inter` and loads the Latin subset.
- Prompt exposes `--font-prompt` and loads the Latin and Thai subsets.
- The body receives both generated variable classes.
- `IBM_Plex_Sans_Thai_Looped`, `Geist_Mono`, `--font-ibm-plex-thai`, and
  `--font-geist-mono` are removed.
- After Vinext builds on Windows, `scripts/fix-vinext-font-paths.mjs` rewrites
  cached local `.vinext/fonts` URLs in the server bundle to the matching
  `/assets/_vinext_fonts/` URLs emitted for production.

### CSS usage

The canonical family declaration is:

```css
font-family: "Inter", "Prompt", sans-serif;
```

Every `font:` shorthand that currently ends with the Geist variable keeps its
existing weight, size, and line height but ends with the canonical stack. The
global body rule uses the same order. No element retains a separate monospace
family. The generated variable classes remain on the body to load both font
files, while the CSS uses literal family names so the generic fallback embedded
by `next/font` cannot appear between Inter and Prompt.

## Error and Fallback Behavior

- If Inter is unavailable, Latin content falls back to Prompt and then the
  browser sans-serif family.
- Thai content uses Prompt because Inter does not provide Thai glyphs.
- `display: "swap"` keeps text visible during font loading.
- No text is hidden or delayed by JavaScript.
- The build fails if deployable self-hosted font URLs are missing or a local
  `.vinext/fonts` path remains in the server output.

## Testing and Acceptance Criteria

- Add a failing typography contract test before implementation.
- The contract requires `Inter` and `Prompt` imports and their CSS variables.
- The contract rejects IBM Plex Sans Thai Looped, Geist Mono, and both old CSS
  variables anywhere in `app/layout.tsx` or `app/globals.css`.
- Production build, unit tests, rendered HTML/config tests, lint, and
  `git diff --check` pass.
- Browser verification confirms Thai and English render at desktop and mobile
  widths without new wrapping, clipping, or horizontal overflow.
- Admin and login remain readable and visually stable.
- The verified commit is pushed to `main` and deployed to the existing public
  Worker and Sites project.

## Expected Files

- `app/layout.tsx`
- `app/globals.css`
- `tests/design-contract.test.mjs`

No database migration, dependency installation, content change, or API change
is required.
