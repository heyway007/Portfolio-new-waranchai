# LINE Contact Channel Design

## Goal

Add LINE as a first-class contact channel on the public portfolio, showing both a clickable QR code and a text link, while allowing every LINE-specific value to be maintained from the existing Admin profile editor.

## Data Model

Extend `SiteSettings` with four required fields:

- `lineUrl: string` — the external LINE add-friend URL.
- `lineLabel: LocalizedText` — the visible Thai and English link label.
- `lineQrImage: string` — a static or R2-backed image reference.
- `lineQrAlt: LocalizedText` — accessible Thai and English alternative text.

Default settings use `https://line.me/ti/p/gxajAHMh2V`, the supplied QR image, and bilingual labels. `portfolioFromRows` already merges stored settings over defaults, so existing D1 settings documents receive the new values without a database migration. Saving the profile later persists the complete merged settings object.

## Validation

`validateSettings` requires all four LINE values. `lineUrl` must be an absolute `http:` or `https:` URL. `lineQrImage` uses the existing image-reference validator, and the label and alternative text use the existing localized-text validator.

Invalid or unsafe LINE URLs are rejected by the Admin settings API. No LINE-specific domain lock is added, so a future official LINE URL format can be saved without a code change.

## Admin Experience

The Profile & Contact editor adds:

- A URL input labeled “LINE add-friend URL”.
- A bilingual field labeled “LINE link label”.
- An `ImageUploader` labeled “LINE QR code”, reusing the current authenticated R2 upload flow.
- A bilingual field labeled “LINE QR alternative text”.

The Admin layout and save flow remain unchanged. No new API route, asset system, or database table is required.

## Public Contact Experience

The right-hand Contact details column keeps location, email, and phone, then adds a dedicated LINE block. The block contains:

- A clickable square QR image that opens `lineUrl` in a new tab.
- A separate localized text link to the same URL.

Both external anchors use `target="_blank"` and `rel="noreferrer"`. The QR uses `next/image` with fixed intrinsic dimensions and `unoptimized` so both the packaged default image and R2 media references work consistently in the Cloudflare deployment.

The QR is visually contained in a compact dark card with an orange focus/hover border. It is approximately 10–11rem on desktop and remains within the viewport on mobile. Existing Contact typography, footer, and section spacing remain unchanged.

## Supplied Asset

Copy `C:/Users/ASUS/Downloads/F0131EC3-0A89-4B00-81EF-72ECE81066CD.jpg` into the repository as `public/images/portfolio/line-qr.jpg`. This 900×900 image becomes the default `lineQrImage`; Admin uploads can replace it with an R2-backed reference.

## Accessibility and Responsive Behavior

- The QR has localized alternative text from settings.
- Both the image and text provide keyboard-accessible links to LINE.
- Focus-visible styling is distinct from hover styling.
- Mobile layout stays single-column and does not introduce horizontal scrolling.
- No new motion or animation is introduced.

## Testing

- Add validation tests proving a complete LINE settings payload is accepted and unsafe/non-HTTP URLs are rejected.
- Add repository compatibility coverage proving stored settings that predate LINE receive the default LINE values.
- Add rendered HTML coverage for the LINE URL, QR image, localized alternative text, and secure external-link attributes.
- Add design contracts for the QR dimensions and responsive LINE block.
- Run the full build/integration suite, unit suite, ESLint, and TypeScript checks.

## Scope

In scope: `SiteSettings`, defaults, validation, Admin profile fields, the public Contact component, the supplied QR asset, Contact-specific CSS, and regression tests.

Out of scope: generic social-contact arrays, new API endpoints, database schema changes, changes to email or phone, analytics tracking, LINE SDK integration, and Admin navigation changes.
