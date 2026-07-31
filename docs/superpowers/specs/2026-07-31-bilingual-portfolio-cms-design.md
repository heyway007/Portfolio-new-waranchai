# Bilingual Portfolio CMS - Design Specification

## 1. Product Goal

Build a modern, easy-to-read bilingual portfolio website for Waranchai Pungwattananukul, based on the content and imagery in `NEW_PORTFOLIO.pdf`. The site will present Waranchai as a Full-Stack Web Developer and allow a single administrator to maintain every public section without editing code.

The first release will include:

- A responsive public portfolio in Thai and English.
- A persistent TH/EN language switcher.
- A protected admin area for all portfolio content.
- Optional live website links on projects.
- Image upload, ordering, draft, preview, and publishing controls.
- Production hosting with a database and managed image storage.

## 2. Audience and Success Criteria

### Primary audience

- Recruiters and hiring managers.
- Prospective freelance clients.
- Technical and business stakeholders reviewing prior work.

### Success criteria

- A first-time visitor can understand Waranchai's role, experience, and strongest projects within the first viewport and a short scroll.
- The site is comfortable to read on mobile, tablet, and desktop.
- Visitors can switch languages without losing their scroll position.
- Only projects with a valid live URL display a "Visit website" action.
- The administrator can update every public section, in both languages, without redeploying the site.
- Draft content never appears on the public site.
- Failed edits or uploads do not erase the previously saved content.

## 3. Visual Direction

The chosen direction is **Modern Editorial**.

- Use a warm, light neutral background rather than the PDF's original white/blue slide layout.
- Use large editorial typography, strong hierarchy, generous whitespace, and an electric-blue accent.
- Pair large project imagery with concise case-study copy.
- Use a restrained grid and subtle lines to provide structure without resembling a dashboard.
- Keep animation secondary to content: gentle reveal transitions, button feedback, and small image movement only.
- Preserve the source portrait and project imagery where they remain sharp enough for the web, while rebuilding the surrounding layout from scratch.
- Respect reduced-motion preferences.

The finished site must not imitate the original PDF page-by-page. The PDF supplies content and source imagery; the website receives a new responsive composition.

## 4. Public Information Architecture

The public experience is a single scrolling portfolio page with anchored navigation.

### Header

- Waranchai wordmark/name.
- Anchors for About, Work, Experience, Skills, and Contact.
- TH/EN language switch.
- Primary contact action.
- Compact mobile navigation.

### Hero

- Name and Full-Stack Web Developer title.
- Short bilingual introduction.
- Portrait from the source portfolio.
- A clear action to view selected work and a secondary contact action.

### Selected Work

- Large editorial project cards arranged in an alternating desktop composition and one column on mobile.
- Each card can include title, short summary, role, technology tags, imagery, and an optional external URL.
- The live website action is rendered only when a valid URL is saved.
- Projects without URLs remain complete case studies and are not visually treated as broken or unavailable.

Initial project content is sourced from the PDF:

- Warehouse Management System.
- Style Bangkok.
- Asia Cement.
- Lease It.
- Thai Health.
- CEPA.
- Bangkok Electric Fair.
- Adventure Earth.
- SVOA.
- Baan.Football.

### Experience

- A readable chronological timeline for:
  - iBusiness Corporation Co., Ltd. (2016-2019).
  - Defense Me Co., Ltd. (2019-2022).
  - Freelancer (2022-2025).
  - Healthy Smith Co., Ltd. (2026-present).

### Skills

- Group skills into meaningful categories rather than reproducing an unstructured tag cloud:
  - Backend.
  - Frontend.
  - Data and APIs.
  - Infrastructure and delivery.
  - Performance, security, SEO, and analytics.

### Education

- Siam Technological College, Vocational Certificate in Business Computer, 2009-2012.
- Siam University, Bachelor of Science in Computer Science, 2012-2015.

### Contact

- Email, telephone, and Bangkok location from the source portfolio.
- Direct email and telephone actions.
- Closing statement and availability text editable from the admin area.

## 5. Internationalization

- Thai and English content are stored as separate fields on each editable record.
- The header contains an always-visible TH/EN switch on desktop and mobile.
- The chosen language is stored as a device-local preference.
- The initial language uses the saved preference when available and otherwise follows the browser language, falling back to English.
- Switching languages updates content in place and preserves the current page/scroll context.
- If the chosen translation is empty, the corresponding value from the other language is shown as a temporary fallback.
- Admin forms display Thai and English inputs together so missing translations are easy to spot.
- Navigation labels, actions, validation messages, and empty states are translated alongside managed content.

## 6. Admin Experience

The admin area lives at `/admin` and is excluded from the public navigation.

### Authentication

- One administrator account with email and password.
- Password stored only as a secure hash.
- Secure, HTTP-only session cookie.
- Login attempts are rate-limited.
- Logout invalidates the active session.
- All admin pages, preview data, uploads, and write operations require a valid session.
- The initial account is provisioned securely through deployment configuration, not committed source values.

### Dashboard sections

- Profile and hero.
- Experience.
- Education.
- Skill groups and skills.
- Projects.
- Contact and global site settings.

### Editing behavior

- Create, edit, delete, reorder, publish, and unpublish records where applicable.
- Every translatable field has Thai and English inputs.
- Projects support:
  - Title and summary.
  - Longer case-study description.
  - Role.
  - Technology tags.
  - Cover and supporting images.
  - Optional live website URL.
  - Display order.
  - Draft or published status.
  - Featured status.
- A preview action renders draft content for the authenticated administrator without exposing it publicly.
- Destructive actions require confirmation.
- Forms preserve unsaved input when validation fails.

## 7. System Architecture

Use one deployable web application with four clear layers:

1. **Public UI** - reads published portfolio content and renders the bilingual responsive site.
2. **Admin UI** - authenticated forms, ordering, uploads, preview, and publishing controls.
3. **Server layer** - authentication, validation, content queries, write operations, upload authorization, and preview enforcement.
4. **Storage layer** - relational content database plus object storage for uploaded images.

The application will use the Sites-compatible web starter and Cloudflare-compatible server output. Structured portfolio content will use D1. Uploaded project and profile imagery will use R2. The site source will contain initial seed content derived from the approved PDF so the first deployment is complete.

### Data flow

- Public request -> selected language -> published content query -> translated view model -> rendered page.
- Admin save -> authenticated request -> schema validation -> database transaction -> success response.
- Image upload -> authenticated request -> file validation -> object storage -> stored asset reference.
- Preview -> authenticated request -> draft-inclusive query -> preview-only render.

## 8. Content Model

### Site settings

- Site name.
- Role/title in Thai and English.
- Hero introduction in Thai and English.
- About text in Thai and English.
- Contact closing text in Thai and English.
- Email, phone, and location.
- Portrait asset.

### Experience

- Company in Thai and English.
- Role in Thai and English.
- Summary in Thai and English.
- Start and end year.
- "Current" flag.
- Display order.
- Draft/published status.

### Education

- Institution in Thai and English.
- Qualification in Thai and English.
- Start and end year.
- Display order.
- Draft/published status.

### Skill groups and skills

- Group name in Thai and English.
- Skill label.
- Display order at group and skill level.
- Draft/published status.

### Projects

- Slug.
- Title in Thai and English.
- Short summary in Thai and English.
- Case-study body in Thai and English.
- Role in Thai and English.
- Technology list.
- Optional live URL.
- Cover image and supporting image references.
- Featured flag.
- Display order.
- Draft/published status.

### Assets

- Storage key.
- Original filename.
- MIME type.
- Width and height.
- Alternative text in Thai and English.
- Upload timestamp.

## 9. Validation and Error Handling

- Required fields, length limits, URLs, years, and ordering values are validated on the server.
- Uploaded images accept only approved web image formats and a defined maximum size.
- Image metadata is checked before storage.
- Database edits use transactions when an action affects multiple records.
- Upload failure leaves the prior image reference unchanged.
- Save errors return a clear bilingual message and keep entered form values.
- Public rendering tolerates missing optional imagery and links without broken controls.
- A translation fallback prevents blank public headings or summaries.
- Unknown public project slugs return a normal not-found response.
- Expired admin sessions redirect to login while avoiding accidental write retries.

## 10. Accessibility and Responsive Behavior

- Semantic headings and landmarks.
- Keyboard-accessible navigation, language switcher, dialogs, forms, and ordering controls.
- Visible focus states.
- Descriptive bilingual alternative text for managed images.
- Sufficient color contrast.
- Touch targets sized for mobile use.
- No essential meaning communicated by animation or color alone.
- Layouts designed for mobile first, with project imagery and typography scaling without clipping.

## 11. SEO and Sharing

- Editable page title and description in both languages.
- Canonical metadata appropriate to the deployed domain.
- Structured headings and meaningful project copy.
- Social preview artwork aligned with the final Modern Editorial visual direction.
- Admin and preview routes are excluded from search indexing.

## 12. Verification Strategy

- Validate production build and deployment compatibility.
- Test authentication, logout, session expiry, and rejected unauthenticated writes.
- Test CRUD, ordering, draft/publish behavior, and destructive confirmations.
- Test bilingual fields, language persistence, and translation fallback.
- Test optional project URLs: valid link shown, empty link hidden, invalid URL rejected.
- Test upload validation and preservation of the previous image on failure.
- Test the public page at representative mobile, tablet, and desktop widths through component and layout checks.
- Confirm keyboard access, focus visibility, headings, form labels, and reduced-motion behavior.
- Confirm seeded content matches the source PDF's factual information.

## 13. Initial Release Boundaries

Not included in the first release:

- Multiple administrator accounts or role-based permissions.
- Blog or article publishing.
- Visitor accounts.
- Contact-message database or email automation.
- Traffic analytics dashboard.
- Automatic translation.

The architecture may accommodate these later, but no first-release UI or data model will be added solely for them.

## 14. Acceptance Criteria

The release is accepted when:

- The public portfolio is deployed and readable in Thai and English.
- The new Modern Editorial design works across mobile and desktop layouts.
- All factual content from the source PDF is represented accurately.
- A single administrator can securely sign in and manage every public section.
- Admin changes can be drafted, previewed, reordered, published, and unpublished.
- Project live links are optional and appear only when present and valid.
- Images can be uploaded and replaced safely.
- Public visitors cannot access draft content or admin operations.
- Production build, required behavior tests, and deployment complete successfully.
