# Public Eyebrow Removal Design

## Objective

Remove every eyebrow label from the public portfolio and simplify public section headings to a single-column layout. Keep all administrator-facing eyebrow labels, CMS fields, stored content, validation, and database behavior unchanged.

## Public presentation

The Hero, About, Work, Experience, Education, Skills, and Contact areas no longer render eyebrow text. Their primary titles and content remain unchanged. Removing the markup, rather than hiding it with CSS, prevents unused text from remaining in the accessibility tree and avoids empty layout tracks.

All public `.section-heading` elements, including `.section-heading-wide`, use one grid column. Their `<h2>` elements occupy the full available heading width. Spacing is adjusted so headings remain balanced after the eyebrow row is removed.

## Component boundaries

- Remove the public hero eyebrow element from `Hero`.
- Remove section eyebrow elements from `PortfolioClient`, `ProjectGrid`, `Timeline`, `SkillGroups`, and `Contact`.
- Remove public-only eyebrow props that become unused from `Timeline` and `SkillGroups` and update their callers.
- Keep localized eyebrow fields in `SiteCopy` and settings types because the Admin editor and existing stored payloads still use them.
- Keep all `.eyebrow` markup and styling under `.admin-*` selectors unchanged.

## Styling

Delete the public `.hero-eyebrow, .eyebrow` presentation rule because no public component will consume it. Change the public section-heading grid from two columns to one column and remove obsolete responsive heading-column overrides. Do not alter Admin eyebrow rules.

## Alternatives considered

- Remove public markup and simplify props (selected): clean DOM, no accessibility residue, and no empty grid column.
- Hide public eyebrows with CSS: smaller edit, but leaves unused content and component props rendered.
- Remove eyebrow fields across CMS and storage: unnecessary and risks breaking existing Admin payloads.

## Verification

- Rendered HTML tests assert that no `hero-eyebrow` or public `class="eyebrow"` remains in the portfolio markup.
- Design contracts assert that `.section-heading` and `.section-heading-wide` use a single column while Admin eyebrow contracts remain intact.
- Build, full integration tests, unit tests, lint, and TypeScript checks must pass.

## Scope

This change affects public presentation only. It does not modify the Admin interface, CMS forms, content types, validation, default data, database bindings, project carousel behavior, or deployment configuration.
