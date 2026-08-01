# Skill Logo Grid Design

## Goal

Replace the text-pill presentation below “A practical, full-stack toolkit.”
with locally hosted, full-color SVG icons and a visible skill name below every
icon. Display all 22 CMS-managed skills while preserving the existing five
skill groups and the site's dark technical visual language.

## Content and Data Flow

The CMS data model remains unchanged. `SkillGroupEntry.skills` continues to be
an array of strings, so existing D1 content, validation, APIs, and admin editing
continue to work without a migration.

A centralized icon registry maps a normalized skill name to a local SVG path.
`SkillGroups` looks up each CMS value at render time and always renders the CMS
string as the visible label. Unknown or newly added values use a local generic
tool icon instead of producing a broken image.

The initial registry covers every current default skill:

- Backend: PHP, Laravel, MySQL, RESTful API, CMS.
- Frontend: JavaScript, TypeScript, HTML, CSS3, jQuery, AngularJS, AJAX.
- Platform & Delivery: Git / GitHub, Linux, DevOps, Web Hosting.
- Quality: Responsive Design, Web Security, Web Performance.
- Growth & Analytics: SEO, GA4, Search Console.

## Icon Assets

SVG files live under `public/icons/skills/` and are served from the same origin.
Recognizable technologies use their official brand shapes and colors. Skills
without a single official brand use purpose-built pictograms with distinct,
theme-compatible colors:

- RESTful API: connected endpoints.
- CMS: content panels.
- AJAX: bidirectional data transfer.
- DevOps: delivery/infinity loop.
- Web Hosting: server rack.
- Responsive Design: desktop and mobile devices.
- Web Security: shield and lock.
- Web Performance: speed gauge.
- SEO: search and trend mark.

The fallback tool icon is neutral and uses the portfolio accent color. All SVGs
are local files with a fixed `viewBox`, no scripts, no remote references, and
no embedded raster data. Because each visible name provides the accessible
text, icon images are decorative and use empty alternative text.

## Layout and Styling

Keep the current section heading and five groups. Replace the five-column card
wall with stacked group rows so each group can present its complete icon set at
a useful size:

- Each group retains its number and bilingual group heading.
- Each group contains a responsive grid of icon items.
- Icons render at approximately 48 pixels on desktop and 42 pixels on compact
  screens, with the skill name centered directly below.
- Wide screens fit up to seven items per row; tablets use four or five; phones
  use two or three based on available width.
- Subtle borders, dark surfaces, orange focus accents, and existing section
  spacing keep the result consistent with the rest of the portfolio.
- Hover and keyboard focus may lift the border/color emphasis without moving
  the item. Reduced-motion mode keeps all transforms disabled.

Long labels wrap without clipping. A missing icon mapping does not change the
layout because the fallback occupies the same fixed icon frame.

## Scope Boundaries

This change affects only the public skill presentation, its local SVG assets,
and focused tests. It does not change D1, R2, CMS forms, skill values, section
copy, navigation, APIs, authentication, or project statistics.

## Verification

- Unit-test that every default skill resolves to a non-fallback local icon and
  that an unknown skill resolves to the generic fallback.
- Render-test that all current skill names and decorative icon images appear in
  server HTML.
- Extend the design contract to require the grouped responsive icon grid and
  preserve reduced-motion behavior.
- Run the full unit, build/integration, lint, and TypeScript verification suites.
- Inspect desktop and mobile screenshots to confirm full-color icons, names
  below icons, readable wrapping, and no horizontal overflow.
