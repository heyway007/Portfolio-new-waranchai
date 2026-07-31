# Waranchai Portfolio CMS

A bilingual Modern Editorial portfolio for Waranchai Pungwattananukul. The public site server-renders published D1 content, remembers the visitor's TH/EN preference, and refreshes that same published snapshot in the browser. A single administrator can edit every section, upload imagery to R2, preview drafts, reorder entries, and publish content.

## Local development

1. Copy `.dev.vars.example` to `.dev.vars`.
2. Set `ADMIN_EMAIL`.
3. Generate and set `ADMIN_PASSWORD_HASH` using the format:

   ```text
   pbkdf2-sha256$210000$<base64-salt>$<base64-hash>
   ```

4. Install and start:

   ```powershell
   npm install
   npm run dev
   ```

The public site is at `/`, the CMS is at `/admin`, and draft preview is at `/preview`.

## Content behavior

- Public requests return only `published` entries.
- The admin snapshot includes both `draft` and `published` entries.
- Project website URLs are optional. An empty URL hides the public visit button and presents the project as a case study.
- Project case-study copy, cover imagery, and supporting images are editable.
- SEO title, description, navigation, section headings, labels, and calls to action are editable in Thai and English.
- Thai and English fields are edited together. If one translation is empty, the public site displays the available translation.
- D1 stores settings, entries, sessions, login throttling, and asset metadata.
- R2 stores administrator-uploaded images.
- Initial content and optimized imagery are derived from `NEW_PORTFOLIO.pdf`.

## Verification

```powershell
npm run test:unit
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Security

- Never commit `.dev.vars` or production credentials.
- Hosted values belong in Sites environment variables.
- Sessions use secure HTTP-only cookies and expire after 12 hours.
- Login attempts are limited to five failures per 15-minute window.
- All admin APIs enforce server-side session checks.
