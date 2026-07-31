# Dark Technical Portfolio Redesign

## Summary

Redesign Waranchai's bilingual portfolio around the supplied dark technical
reference while preserving the existing content model, admin CMS, D1 database,
R2 image storage, language switch, preview flow, and Cloudflare deployment.

The result should feel like a senior full-stack developer's product interface:
dark, structured, precise, and modern. Orange is used as a functional accent,
not decoration. Motion supports hierarchy and feedback without competing with
the content.

## Goals

- Replace the current light editorial theme with a dark technical visual system.
- Use IBM Plex Sans Thai Looped consistently for readable Thai and English.
- Make the first viewport communicate full-stack expertise and featured work.
- Make projects, experience, skills, and contact information faster to scan.
- Add restrained hover and scroll effects with clear interactive feedback.
- Preserve all CMS-managed content and bilingual behavior.
- Maintain strong mobile usability, keyboard access, and reduced-motion support.

## Non-goals

- Do not copy the reference image pixel for pixel.
- Do not create fake projects, employment records, metrics, or testimonials.
- Do not replace the CMS, database schema, R2 storage, authentication, or APIs.
- Do not redesign the admin interface beyond inheriting the new readable base
  font; its existing editing workflow and visual stability must be preserved.
- Do not add animation libraries or continuous decorative animation.
- Do not add a working contact-form backend in this redesign.

## Visual System

### Typography

- Primary family: `IBM Plex Sans Thai Looped` through `next/font/google`.
- Body copy: 400.
- Navigation and controls: 500.
- Card headings and section titles: 600.
- Hero emphasis: 700.
- Keep Geist Mono only for short English technical labels, indexes, and status
  metadata. Thai copy must never depend on the mono face.
- Body line height: approximately 1.65 for Thai and 1.55–1.65 for English.
- Avoid body text below 15px on desktop or mobile.

### Color

- Page background: near-black charcoal (`#0b0d10` range).
- Raised surfaces: slightly lighter charcoal (`#11151a` range).
- Primary text: warm off-white (`#f4f1ea` range).
- Secondary text: cool neutral gray with sufficient contrast.
- Accent: vivid amber-orange (`#ff8a00` range).
- Lines: low-opacity white, with orange reserved for active or interactive
  states.
- Use a subtle radial orange glow and faint technical grid only in selected
  regions such as the hero and contact section.

### Shape and spacing

- Thin one-pixel borders, moderate 10–16px radii, and restrained shadows.
- Use a wide centered content rail, with compact vertical rhythm compared with
  the existing oversized editorial layout.
- Maintain at least 44px interactive hit targets.

## Page Structure

### Header

- Sticky dark glass header with a circular W mark and first name.
- Centered section navigation on desktop.
- Compact TH/EN segmented switch at the right.
- Mobile navigation remains collapsible and keyboard accessible.
- Active/hover navigation uses an orange underline that grows from the center.

### Hero

- Two-column desktop layout.
- Left column contains the developer eyebrow, a large bilingual headline,
  concise introduction, and two calls to action.
- Emphasize one phrase in orange, following the reference image.
- Right column keeps Waranchai's real portrait, presented inside a technical
  frame with a grid, small capability labels, and restrained orange edge light.
- Do not fabricate system diagrams or dashboard metrics.
- On small screens, text precedes the portrait and actions remain easy to tap.

### About and summary metrics

- Reduce the current oversized About section into a concise introduction with
  three honest summary metrics derived at render time from CMS-managed data:
  experience span from the earliest experience start year, published project
  count, and total listed skills.
- Metric labels remain bilingual CMS-managed copy. Values must never be
  hard-coded marketing claims.
- Metrics use bordered cells and orange numeric emphasis.

### Featured projects

- Use a responsive card grid: two columns on desktop and one column on mobile.
- Keep real project images, descriptions, tags, and link availability states.
- Cards include a dark image frame, compact metadata, project title, summary,
  tags, and an external-link affordance when a real URL exists.
- The first projects may span more visual space only when the layout remains
  balanced with the available project count.

### Experience and education

- Use a vertical orange timeline for experience.
- Pair it with a compact education/statistics panel on desktop.
- Any statistics repeated in this panel must use the same derived values as the
  About section; do not create a second source of truth.
- Mobile collapses to a single chronological stream.
- Dates, company, role, and descriptions remain CMS-driven.

### Skills

- Present skill groups as compact technical cards rather than oversized columns.
- Use simple typographic or CSS marks; do not introduce inaccurate brand logos.
- Cards show group name and skills with clear hierarchy.

### Contact and footer

- Use a split contact layout with a large invitation on the left and real
  contact links on the right.
- Do not add a fake message submission form.
- Add a compact footer row and back-to-top control.

## Interaction and Motion

### Hover and focus

- Primary buttons: subtle orange gradient sweep, 2px lift, and arrow movement.
- Secondary buttons: border changes from neutral to orange.
- Project cards: 4–6px lift, orange border glow, and image scale up to 1.03.
- Skill cards: surface brightens slightly and the index/accent moves a few
  pixels.
- Timeline nodes: orange halo expands on hover or focus within the item.
- Contact links: underline or border reveal rather than large movement.
- Keyboard focus remains more visible than hover.

### Scroll reveals

- Add one reusable reveal behavior using `IntersectionObserver`.
- Sections fade in and move upward 16–24px once.
- Groups use a restrained 50–80ms stagger.
- No parallax, scroll-jacking, cursor replacement, or infinite animation.
- Header and language controls must remain immediately usable before hydration.

### Reduced motion

- `prefers-reduced-motion: reduce` disables reveal transforms, stagger delays,
  image scaling, and smooth scrolling.
- Content remains visible if JavaScript fails or observers are unavailable.

## Responsive Behavior

- Desktop: 1200px and above, wide two-column hero and project grid.
- Tablet: 760–1199px, reduced spacing and simplified secondary panels.
- Mobile: below 760px, single-column content, compact typography, no clipped
  labels, and no hover-only information.
- The Thai language version must be checked independently because Thai headings
  wrap differently from English.

## Architecture and Data Flow

- `PortfolioClient` continues to own language state, mobile navigation, and live
  portfolio refresh.
- Existing section components continue to receive `PortfolioData` and localized
  strings. Styling and small presentational wrappers may change.
- Introduce a small reveal utility/component only if necessary; it must not own
  business data.
- Font loading belongs in `app/layout.tsx`.
- Theme tokens, responsive styles, hover states, and keyframes belong in
  `app/globals.css`.
- No database migration or API contract change is required.

## Error and Edge Handling

- Projects without a working URL remain clearly labeled and are not rendered as
  misleading clickable links.
- Image alt text and existing image validation remain intact.
- Missing optional content must not leave empty decorative panels.
- If live portfolio refresh fails, server-rendered content remains visible.
- Animation must never hide content permanently.

## Accessibility

- Maintain semantic section headings and navigation landmarks.
- Preserve the skip link and visible focus states.
- Confirm text and controls meet WCAG AA contrast.
- Do not communicate availability or interaction using orange alone.
- All effects must work with keyboard focus and touch input.

## Testing and Acceptance Criteria

- Existing unit, server-rendering, database, authentication, and deployment
  tests continue to pass.
- Add focused tests for any new reveal behavior and font/config contract where
  practical.
- Verify production build and Cloudflare static assets.
- Browser-check English and Thai at approximately 1440px, 768px, and 390px.
- Confirm no horizontal overflow and no layout shift caused by the font.
- Confirm reduced-motion mode displays all content without animated movement.
- Confirm every CMS-managed section still renders and language switching works.
- Confirm public pages, admin pages, API routes, D1, and R2 behavior are
  unchanged.

## Expected Files

- `app/layout.tsx`
- `app/globals.css`
- `app/components/portfolio/PortfolioClient.tsx`
- `app/components/portfolio/Hero.tsx`
- `app/components/portfolio/ProjectGrid.tsx`
- `app/components/portfolio/Timeline.tsx`
- `app/components/portfolio/SkillGroups.tsx`
- `app/components/portfolio/Contact.tsx`
- Focused tests for new behavior or deployment contracts
