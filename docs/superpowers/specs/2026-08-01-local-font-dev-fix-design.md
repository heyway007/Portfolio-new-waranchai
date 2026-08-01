# Local Font Development Fix

## Problem

On Windows, `vinext dev` injects `next/font/google` declarations whose font URLs point to absolute filesystem paths such as `C:/laragon/.../.vinext/fonts/...woff2`. Browsers cannot load those paths from an HTTP page, so Thai text falls back instead of using Prompt. The existing post-build rewrite only fixes `dist/server` and therefore does not affect the development server.

## Selected design

Replace `next/font/google` for Inter and Prompt with packaged, self-hosted Fontsource assets. Import only the Latin Inter face and the Latin/Thai Prompt faces for weights 400, 500, 600, and 700. The bundler will expose these files as normal HTTP assets in both development and production, without a Google Fonts runtime request or a Windows filesystem URL.

The CSS stack remains `"Inter", "Prompt", sans-serif`, preserving the current visual design. Inter handles Latin text and Prompt handles Thai glyphs. `font-display: swap` remains provided by the packaged declarations.

## Alternatives considered

- Patch Vinext development middleware: tightly coupled to Vinext internals and likely to break on upgrades.
- Rewrite generated `.vinext/fonts/style.css` while dev runs: timing-dependent and mutates generated output.
- Packaged self-hosted assets (selected): deterministic URLs in dev/build, small application change, and no runtime CDN dependency.

## Verification

- A regression test must prove the layout no longer imports `next/font/google` and imports local font packages.
- Local HTML must contain no `.vinext/fonts` or Windows filesystem font URLs.
- Requested Thai font assets must return HTTP 200 with a font content type.
- Unit tests, production build tests, lint, and TypeScript checks must remain green.

## Scope

This change only repairs font delivery. Typography names, weights, layout, content, D1/R2 bindings, and the visual system remain unchanged.
