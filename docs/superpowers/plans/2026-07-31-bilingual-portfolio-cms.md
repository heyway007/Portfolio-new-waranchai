# Bilingual Portfolio CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a modern bilingual portfolio for Waranchai Pungwattananukul with a secure single-administrator CMS for every public section.

**Architecture:** A Sites-compatible Vinext application will serve the public portfolio, authenticated admin UI, and route handlers from one Cloudflare Worker. D1 will store content, sessions, login throttling, and asset metadata; R2 will store uploaded images. Typed content contracts and validation remain independent from the UI so public rendering, admin forms, APIs, seed data, and tests share the same rules.

**Tech Stack:** TypeScript 5.9, React 19, Next-compatible App Router through Vinext, Cloudflare Workers, D1, R2, Drizzle ORM, Vitest, CSS, Web Crypto.

## Global Constraints

- Public content must support Thai and English with an in-place TH/EN switch and saved device preference.
- The first language is the saved preference, then browser language, then English.
- Missing selected-language text falls back to the other language.
- The chosen visual direction is Modern Editorial: warm light neutrals, large editorial type, generous whitespace, and electric-blue accents.
- Public layouts must work on mobile, tablet, and desktop and respect reduced-motion preferences.
- Only projects with a valid non-empty live URL display a visit action.
- Every public section must be editable by one authenticated administrator.
- Content must support ordering and draft/published states; public queries must never return drafts.
- Uploaded files must use R2; structured content, sessions, throttling, and asset metadata must use D1.
- Admin credentials must come from hosted runtime configuration and must never be committed.
- Cloudflare Worker-compatible ESM output and the starter `sites()` Vite plugin must be preserved.
- The initial deployed content must accurately reflect `NEW_PORTFOLIO.pdf`.
- Multiple administrators, blog publishing, visitor accounts, contact-message storage, analytics dashboards, and automatic translation are out of scope.

---

## File Structure

### Application shell and public experience

- `app/layout.tsx` - global metadata and root HTML/body.
- `app/globals.css` - design tokens, responsive public/admin styling, motion preferences.
- `app/page.tsx` - server entry that loads published portfolio data.
- `app/components/portfolio/PortfolioClient.tsx` - client-side language preference, mobile navigation, and public composition.
- `app/components/portfolio/Hero.tsx` - hero and primary actions.
- `app/components/portfolio/ProjectGrid.tsx` - selected work cards and optional links.
- `app/components/portfolio/Timeline.tsx` - experience and education presentation.
- `app/components/portfolio/SkillGroups.tsx` - categorized skills.
- `app/components/portfolio/Contact.tsx` - bilingual contact close.

### Content contracts and persistence

- `lib/content/types.ts` - bilingual types, entry discriminators, and portfolio aggregate.
- `lib/content/default-portfolio.ts` - PDF-derived fallback/seed content.
- `lib/content/i18n.ts` - language selection and translation fallback.
- `lib/content/validation.ts` - settings, entry, URL, and ordering validation.
- `lib/content/repository.ts` - published and preview content queries and D1 row mapping.
- `db/schema.ts` - D1 tables for entries, settings, sessions, login attempts, and assets.
- `drizzle/0001_portfolio_cms.sql` - database structure.
- `drizzle/0002_seed_portfolio.sql` - initial content.

### Authentication

- `lib/auth/password.ts` - PBKDF2 hash parsing and verification.
- `lib/auth/session.ts` - secure session creation, lookup, cookie handling, and deletion.
- `lib/auth/rate-limit.ts` - D1-backed login throttling.
- `lib/auth/require-admin.ts` - server-side authorization boundary.
- `app/admin/login/page.tsx` - administrator sign-in screen.
- `app/api/auth/login/route.ts` - login route.
- `app/api/auth/logout/route.ts` - logout route.

### Admin and APIs

- `app/admin/page.tsx` - protected CMS page.
- `app/admin/AdminClient.tsx` - admin navigation, state refresh, notifications, and editor composition.
- `app/admin/components/BilingualField.tsx` - paired Thai/English input control.
- `app/admin/components/SettingsEditor.tsx` - hero, profile, contact, and global settings.
- `app/admin/components/EntryListEditor.tsx` - experience, education, and skill-group list CRUD/order.
- `app/admin/components/ProjectEditor.tsx` - project CRUD, tags, optional URL, images, order, and status.
- `app/admin/components/ImageUploader.tsx` - authenticated image selection and upload.
- `app/preview/page.tsx` - authenticated draft-inclusive preview.
- `app/api/admin/content/route.ts` - full admin snapshot.
- `app/api/admin/settings/route.ts` - update settings.
- `app/api/admin/entries/route.ts` - create entries.
- `app/api/admin/entries/[id]/route.ts` - update and delete entries.
- `app/api/admin/reorder/route.ts` - transactional ordering.
- `app/api/admin/assets/route.ts` - validate/upload images and write metadata.
- `app/media/[...key]/route.ts` - stream stored R2 objects.

### Verification and project support

- `tests/content.test.ts` - localization and validation.
- `tests/password.test.ts` - PBKDF2 verification.
- `tests/session.test.ts` - cookie security, expiry, and session invalidation.
- `tests/admin-service.test.ts` - authenticated content mutations and draft/public boundaries.
- `tests/rendered-html.test.mjs` - built worker public/admin smoke checks.
- `.dev.vars.example` - required local variable names with no secrets.
- `.openai/hosting.json` - logical `DB` and `PORTFOLIO_ASSETS` bindings.
- `public/images/portfolio/*` - optimized images derived from the source PDF.
- `public/og.png` - final site-specific sharing image if image text inspection passes.

---

### Task 1: Scaffold the Sites Application and Preserve the Approved Inputs

**Files:**
- Create: starter files under `app/`, `build/`, `db/`, `worker/`, `public/`, and project root.
- Modify: `.gitignore`
- Modify: `.openai/hosting.json`
- Create: `public/images/portfolio/portrait.webp`
- Create: `public/images/portfolio/project-*.webp`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: approved design specification and `C:\Users\ASUS\Downloads\NEW_PORTFOLIO.pdf`.
- Produces: buildable Vinext project, `DB` D1 binding, `PORTFOLIO_ASSETS` R2 binding, and normalized web imagery.

- [ ] **Step 1: Initialize the Sites starter once**

Run the Sites initializer with the project directory as its target. Preserve the existing `.git`, `docs/`, and `tmp/` directories and do not run the initializer again.

```powershell
bash "C:/Users/ASUS/.codex/plugins/cache/openai-bundled/sites/0.1.31/scripts/init-site.sh" "C:/laragon/www/Portfolio-new"
```

Expected: `package.json`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `.openai/hosting.json`, and the Vinext build files exist; dependencies install successfully.

- [ ] **Step 2: Start the retained development server**

```powershell
npm run dev
```

Expected: Vinext prints one healthy Local URL. Keep this process alive until hosting finishes and open that exact URL once in the Codex browser.

- [ ] **Step 3: Configure logical persistence bindings**

Set `.openai/hosting.json` to:

```json
{
  "d1": "DB",
  "r2": "PORTFOLIO_ASSETS"
}
```

- [ ] **Step 4: Convert source imagery**

Render the PDF at sufficient resolution, crop the portrait and each distinct project screenshot, remove slide furniture, and export web assets at a maximum 2200 px long edge with visually lossless WebP settings.

Expected files:

```text
public/images/portfolio/portrait.webp
public/images/portfolio/warehouse.webp
public/images/portfolio/style-bangkok.webp
public/images/portfolio/asia-cement.webp
public/images/portfolio/lease-it.webp
public/images/portfolio/thai-health.webp
public/images/portfolio/cepa.webp
public/images/portfolio/bangkok-electric-fair.webp
public/images/portfolio/adventure-earth.webp
public/images/portfolio/svoa.webp
public/images/portfolio/baan-football.webp
```

- [ ] **Step 5: Replace the disposable starter smoke assertion**

First update the test helper from `render()` to `render(path = "/")` and construct the request with `new URL(path, "http://localhost")`. Then write the initial smoke test so the upcoming product must replace the starter:

```js
test("does not ship starter preview metadata", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL because the starter still contains preview metadata and skeleton copy.

- [ ] **Step 7: Commit the scaffold and source assets**

```powershell
git add .openai app build db public tests worker *.json *.mjs *.ts .gitignore
git commit -m "chore: scaffold portfolio site"
```

---

### Task 2: Define Typed Bilingual Content, Fallbacks, and Validation

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/content/default-portfolio.ts`
- Create: `lib/content/i18n.ts`
- Create: `lib/content/validation.ts`
- Create: `tests/content.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: normalized images from Task 1.
- Produces: `PortfolioData`, `ContentEntry`, `localize()`, `validateSettings()`, and `validateEntry()` used by repository, public UI, APIs, and admin forms.

- [ ] **Step 1: Add Vitest and its test script**

Add `"test:unit": "vitest run"` and install `vitest` as a development dependency.

```powershell
npm install --save-dev vitest
```

- [ ] **Step 2: Write failing content tests**

Create tests that require language fallback and optional URL behavior:

```ts
import { describe, expect, it } from "vitest";
import { localize } from "../lib/content/i18n";
import { validateEntry } from "../lib/content/validation";

describe("localize", () => {
  it("uses the requested translation", () => {
    expect(localize({ en: "Work", th: "ผลงาน" }, "th")).toBe("ผลงาน");
  });

  it("falls back to the other translation", () => {
    expect(localize({ en: "Work", th: "" }, "th")).toBe("Work");
  });
});

describe("project validation", () => {
  const project = {
    type: "project",
    slug: "style-bangkok",
    title: { en: "Style Bangkok", th: "สไตล์ แบงค็อก" },
    summary: { en: "Corporate website", th: "เว็บไซต์องค์กร" },
    body: { en: "", th: "" },
    role: { en: "Full-Stack Developer", th: "นักพัฒนา Full-Stack" },
    technologies: ["PHP", "CSS3"],
    liveUrl: "",
    coverImage: "/images/portfolio/style-bangkok.webp",
    supportingImages: [],
    featured: true,
    status: "published",
    sortOrder: 1,
  } as const;

  it("accepts an omitted project URL", () => {
    expect(validateEntry(project).ok).toBe(true);
  });

  it("rejects a malformed project URL", () => {
    expect(validateEntry({ ...project, liveUrl: "style bangkok" }).ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run the unit test to verify it fails**

```powershell
npm run test:unit
```

Expected: FAIL because content modules do not exist.

- [ ] **Step 4: Implement the shared contracts**

Define the stable public types:

```ts
export type Language = "en" | "th";
export type LocalizedText = { en: string; th: string };
export type PublishStatus = "draft" | "published";
export type EntryType = "experience" | "education" | "skillGroup" | "project";

export interface BaseEntry {
  id: string;
  type: EntryType;
  status: PublishStatus;
  sortOrder: number;
}

export interface PortfolioData {
  settings: SiteSettings;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skillGroups: SkillGroupEntry[];
  projects: ProjectEntry[];
}
```

Add concrete entry interfaces with the exact fields from the design specification.

- [ ] **Step 5: Implement language fallback**

```ts
export function localize(value: LocalizedText, language: Language): string {
  const primary = value[language].trim();
  if (primary) return primary;
  return value[language === "en" ? "th" : "en"].trim();
}
```

- [ ] **Step 6: Implement explicit validation**

`validateSettings()` and `validateEntry()` must:

- reject missing English and Thai values only when both are blank;
- accept an empty `liveUrl`;
- accept only `http:` or `https:` project URLs;
- require integer `sortOrder >= 0`;
- restrict `status` and `type` to declared values;
- require at least one technology for projects;
- return `{ ok: true, value }` or `{ ok: false, errors: Record<string, string> }`.

- [ ] **Step 7: Add factual PDF-derived defaults**

Populate `default-portfolio.ts` with:

- biography, telephone, email, and Bangkok location from page 2;
- four experience entries from page 3;
- two education entries from page 4;
- categorized skills from page 5;
- ten project entries from pages 6-16;
- accurate initial image paths from Task 1;
- Thai translations written naturally rather than word-for-word.

- [ ] **Step 8: Run unit tests**

```powershell
npm run test:unit
```

Expected: PASS.

- [ ] **Step 9: Commit typed content**

```powershell
git add lib tests package.json package-lock.json
git commit -m "feat: define bilingual portfolio content"
```

---

### Task 3: Add D1 Schema, Seed Migration, and Repository

**Files:**
- Modify: `db/schema.ts`
- Create: `drizzle/0001_portfolio_cms.sql`
- Create: `drizzle/0002_seed_portfolio.sql`
- Modify: `drizzle/meta/_journal.json`
- Create: `lib/content/repository.ts`
- Create: `tests/repository.test.ts`

**Interfaces:**
- Consumes: `PortfolioData`, `ContentEntry`, and `defaultPortfolio`.
- Produces: `getPublishedPortfolio(): Promise<PortfolioData>`, `getAdminPortfolio(): Promise<PortfolioData>`, `upsertSettings()`, `createEntry()`, `updateEntry()`, `deleteEntry()`, and `reorderEntries()`.

- [ ] **Step 1: Write failing row-mapping tests**

```ts
it("groups rows into the portfolio aggregate and excludes drafts publicly", () => {
  const result = portfolioFromRows(settingsRow, [
    publishedProjectRow,
    { ...draftProjectRow, status: "draft" },
  ], false);

  expect(result.projects.map((project) => project.id)).toEqual(["project-live"]);
});

it("includes drafts for an authenticated preview", () => {
  const result = portfolioFromRows(settingsRow, [publishedProjectRow, draftProjectRow], true);
  expect(result.projects).toHaveLength(2);
});
```

- [ ] **Step 2: Run the repository test to verify it fails**

```powershell
npx vitest run tests/repository.test.ts
```

Expected: FAIL because repository mapping does not exist.

- [ ] **Step 3: Define D1 tables**

Use Drizzle to define:

```ts
export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey(),
  payload: text("payload", { mode: "json" }).notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const contentEntries = sqliteTable("content_entries", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  slug: text("slug"),
  payload: text("payload", { mode: "json" }).notNull(),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
```

Also define `admin_sessions`, `login_attempts`, and `assets` with indexes for session expiry, entry type/status/order, and asset storage key.

- [ ] **Step 4: Generate and inspect migration SQL**

```powershell
npm run db:generate
```

Expected: migration creates all five tables and their required indexes without dropping unrelated data.

- [ ] **Step 5: Add the initial seed migration**

Insert one site settings row and every default experience, education, skill group, and project as JSON. Use stable IDs and escape JSON safely. All source-derived entries start as `published`.

- [ ] **Step 6: Implement the repository boundary**

`getPublishedPortfolio()` must query only `status = 'published'`. `getAdminPortfolio()` may include all states. If the D1 binding is unavailable during build-time page probing, the public method returns `defaultPortfolio`; admin/write methods return a clear storage-unavailable error.

Use transactions/batches for reorder operations:

```ts
await env.DB.batch(
  orderedIds.map((id, sortOrder) =>
    env.DB.prepare(
      "UPDATE content_entries SET sort_order = ?, updated_at = ? WHERE id = ? AND type = ?"
    ).bind(sortOrder, Date.now(), id, type)
  )
);
```

- [ ] **Step 7: Run repository and content tests**

```powershell
npx vitest run tests/content.test.ts tests/repository.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit persistence**

```powershell
git add db drizzle lib/content/repository.ts tests/repository.test.ts
git commit -m "feat: persist portfolio content in D1"
```

---

### Task 4: Implement Single-Administrator Authentication

**Files:**
- Create: `lib/auth/password.ts`
- Create: `lib/auth/session.ts`
- Create: `lib/auth/rate-limit.ts`
- Create: `lib/auth/require-admin.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/admin/login/page.tsx`
- Create: `.dev.vars.example`
- Create: `tests/password.test.ts`
- Create: `tests/session.test.ts`

**Interfaces:**
- Consumes: D1 `admin_sessions` and `login_attempts`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH`.
- Produces: `verifyPassword()`, `createAdminSession()`, `requireAdmin()`, login/logout routes, and protected session cookie `portfolio_admin_session`.

- [ ] **Step 1: Write failing password tests**

```ts
it("accepts the matching PBKDF2 password", async () => {
  const stored = await hashPasswordForTest("correct horse battery staple", fixedSalt);
  await expect(verifyPassword("correct horse battery staple", stored)).resolves.toBe(true);
});

it("rejects a different password", async () => {
  const stored = await hashPasswordForTest("correct horse battery staple", fixedSalt);
  await expect(verifyPassword("wrong password", stored)).resolves.toBe(false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```powershell
npx vitest run tests/password.test.ts
```

Expected: FAIL because password helpers do not exist.

- [ ] **Step 3: Implement Web Crypto PBKDF2 verification**

Use the stored format `pbkdf2-sha256$210000$<base64-salt>$<base64-hash>`. Derive 32 bytes with SHA-256 and compare bytes without early exit.

```ts
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  "PBKDF2",
  false,
  ["deriveBits"],
);
```

- [ ] **Step 4: Implement D1-backed sessions**

- Generate 32 random bytes.
- Send the raw base64url token only to the browser.
- Store only its SHA-256 digest in D1.
- Expire sessions after 12 hours.
- Use `HttpOnly; Secure; SameSite=Strict; Path=/`.
- Delete expired sessions when checking or creating a session.

Add session tests using an in-memory D1 test double:

```ts
it("sets a secure twelve-hour cookie", async () => {
  const result = await createAdminSession(fakeDb, fixedNow);
  expect(result.cookie).toContain("HttpOnly");
  expect(result.cookie).toContain("Secure");
  expect(result.cookie).toContain("SameSite=Strict");
  expect(result.expiresAt).toBe(fixedNow + 12 * 60 * 60 * 1000);
});

it("rejects and removes an expired session", async () => {
  fakeDb.seedExpiredSession();
  await expect(readAdminSession(fakeDb, expiredCookie, fixedNow)).resolves.toBeNull();
  expect(fakeDb.sessionCount()).toBe(0);
});
```

- [ ] **Step 5: Implement durable login throttling**

Track a SHA-256 key derived from normalized email plus connecting IP. Permit five failed attempts per 15-minute window, return HTTP 429 when exceeded, and clear the row on successful login.

- [ ] **Step 6: Implement login and logout routes**

The login route must:

1. validate JSON input;
2. enforce rate limiting;
3. compare normalized email with `ADMIN_EMAIL`;
4. verify against `ADMIN_PASSWORD_HASH`;
5. create the session;
6. return a generic bilingual invalid-credentials message for both unknown email and wrong password.

The logout route deletes the session and expires the cookie.

- [ ] **Step 7: Add the protected login page**

Create a compact Modern Editorial login page with labeled email/password fields, a loading state, translated error text, and redirect to `/admin` after success.

- [ ] **Step 8: Document required local variable names**

`.dev.vars.example` contains names only:

```dotenv
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
```

- [ ] **Step 9: Run authentication tests**

```powershell
npx vitest run tests/password.test.ts tests/session.test.ts
```

Expected: PASS.

- [ ] **Step 10: Commit authentication**

```powershell
git add .dev.vars.example app/admin/login app/api/auth lib/auth tests/password.test.ts tests/session.test.ts
git commit -m "feat: secure portfolio admin"
```

---

### Task 5: Build the Modern Editorial Public Portfolio

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `app/components/portfolio/PortfolioClient.tsx`
- Create: `app/components/portfolio/Hero.tsx`
- Create: `app/components/portfolio/ProjectGrid.tsx`
- Create: `app/components/portfolio/Timeline.tsx`
- Create: `app/components/portfolio/SkillGroups.tsx`
- Create: `app/components/portfolio/Contact.tsx`
- Delete: `app/_sites-preview/SkeletonPreview.tsx`
- Delete: `app/_sites-preview/preview.css`
- Modify: `package.json`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `getPublishedPortfolio()`, `PortfolioData`, and `localize()`.
- Produces: responsive public page and stable section anchors `about`, `work`, `experience`, `skills`, and `contact`.

- [ ] **Step 1: Extend the built-worker smoke test**

```js
test("renders the portfolio identity and public sections", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Waranchai Pungwattananukul/);
  assert.match(html, /Full-Stack Web Developer/);
  assert.match(html, /id="work"/);
  assert.match(html, /id="experience"/);
  assert.match(html, /id="skills"/);
  assert.match(html, /id="contact"/);
  assert.doesNotMatch(html, /codex-preview|Building your site/i);
});
```

- [ ] **Step 2: Run the smoke test to verify it fails**

```powershell
npm test
```

Expected: FAIL because the product UI has not replaced the skeleton.

- [ ] **Step 3: Replace starter metadata and shell**

Set the title to `Waranchai Pungwattananukul - Full-Stack Web Developer`, add the site-specific description, remove all `codex-preview` metadata, and set the root color scheme and font variables.

- [ ] **Step 4: Implement client language state**

`PortfolioClient` must:

```ts
const [language, setLanguage] = useState<Language>("en");

useEffect(() => {
  const saved = window.localStorage.getItem("portfolio-language");
  setLanguage(saved === "th" || saved === "en"
    ? saved
    : navigator.language.toLowerCase().startsWith("th") ? "th" : "en");
}, []);
```

On language change, save the preference, update `document.documentElement.lang`, and keep the current scroll position.

- [ ] **Step 5: Implement the public sections**

- Header: sticky but visually light; accessible mobile menu; TH/EN control.
- Hero: portrait, name, role, introduction, work and contact actions.
- Selected Work: alternating desktop cards; one column on mobile; optional external action only for valid URLs.
- Experience and education: chronological editorial timeline.
- Skills: five meaningful groups, not an unstructured tag cloud.
- Contact: mail, telephone, Bangkok, closing message.

- [ ] **Step 6: Implement the visual system**

Define tokens for warm background, ink, electric blue, muted copy, borders, spacing, content width, and type scale. Include:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Ensure visible `:focus-visible` outlines, 44 px minimum touch controls, legible line length, and no clipped display type at 320 px width.

- [ ] **Step 7: Remove starter-only code**

Delete `app/_sites-preview`, remove `react-loading-skeleton`, and refresh the lockfile:

```powershell
npm uninstall react-loading-skeleton
```

- [ ] **Step 8: Build and run tests**

```powershell
npm run build
npm run test:unit
npm test
```

Expected: all commands PASS.

- [ ] **Step 9: Commit the public site**

```powershell
git add app lib package.json package-lock.json tests
git commit -m "feat: build bilingual editorial portfolio"
```

---

### Task 6: Add Authenticated Content and Image APIs

**Files:**
- Create: `app/api/admin/content/route.ts`
- Create: `app/api/admin/settings/route.ts`
- Create: `app/api/admin/entries/route.ts`
- Create: `app/api/admin/entries/[id]/route.ts`
- Create: `app/api/admin/reorder/route.ts`
- Create: `app/api/admin/assets/route.ts`
- Create: `app/media/[...key]/route.ts`
- Create: `lib/assets/validation.ts`
- Create: `lib/content/admin-service.ts`
- Create: `tests/assets.test.ts`
- Create: `tests/admin-service.test.ts`

**Interfaces:**
- Consumes: `requireAdmin()`, repository writes, R2 `PORTFOLIO_ASSETS`, and validation contracts.
- Produces: authenticated JSON CRUD API, safe image upload, and readable media URLs.

- [ ] **Step 1: Write failing asset validation tests**

```ts
it("accepts JPEG, PNG, WebP, and AVIF under 8 MiB", () => {
  expect(validateImageMeta({ type: "image/webp", size: 1024 }).ok).toBe(true);
});

it("rejects SVG and oversized payloads", () => {
  expect(validateImageMeta({ type: "image/svg+xml", size: 1024 }).ok).toBe(false);
  expect(validateImageMeta({ type: "image/png", size: 8 * 1024 * 1024 + 1 }).ok).toBe(false);
});
```

- [ ] **Step 2: Run the asset test to verify it fails**

```powershell
npx vitest run tests/assets.test.ts
```

Expected: FAIL because asset validation does not exist.

- [ ] **Step 3: Implement consistent API authorization**

Every `/api/admin/*` handler begins with `requireAdmin(request)`. Missing or expired sessions return HTTP 401. Validation failures return HTTP 400 with `{ ok: false, errors }`. Storage failures return HTTP 503 without exposing internal details.

- [ ] **Step 4: Write failing admin-service tests**

```ts
it("refuses an unauthenticated mutation", async () => {
  await expect(updateSettings({ admin: null, input: validSettings })).rejects.toMatchObject({
    status: 401,
  });
});

it("keeps a draft out of the public aggregate after creation", async () => {
  await createEntry({ admin, input: draftProject });
  expect((await repository.getPublishedPortfolio()).projects).toHaveLength(0);
  expect((await repository.getAdminPortfolio()).projects).toHaveLength(1);
});

it("applies one complete unique project order", async () => {
  await reorderEntries({ admin, type: "project", orderedIds: ["p2", "p1"] });
  expect(repository.projectOrder()).toEqual(["p2", "p1"]);
});
```

- [ ] **Step 5: Run admin-service tests to verify they fail**

```powershell
npx vitest run tests/admin-service.test.ts
```

Expected: FAIL because the authenticated service boundary does not exist.

- [ ] **Step 6: Implement settings and entry CRUD**

- `GET /api/admin/content` returns settings and all entry statuses.
- `PUT /api/admin/settings` validates and replaces settings.
- `POST /api/admin/entries` assigns `crypto.randomUUID()`, validates, and inserts.
- `PUT /api/admin/entries/:id` validates and updates while preserving the ID/type contract.
- `DELETE /api/admin/entries/:id` requires `{ confirm: true }`.
- `POST /api/admin/reorder` validates one entry type plus a complete unique ID order and applies a D1 batch.

- [ ] **Step 7: Implement safe R2 uploads**

Accept `multipart/form-data` field `file`. Validate MIME type, size, and file signature before writing. Generate keys as `portfolio/<uuid>.<extension>`, write the R2 object, then write D1 metadata. If the metadata insert fails, delete the just-written R2 object.

- [ ] **Step 8: Implement the media route**

Stream R2 objects with their stored content type, ETag, `X-Content-Type-Options: nosniff`, and cache headers. Return 404 for absent keys and reject path traversal.

- [ ] **Step 9: Run unit and production builds**

```powershell
npm run test:unit
npm run build
```

Expected: PASS.

- [ ] **Step 10: Commit the API layer**

```powershell
git add app/api app/media lib/assets lib/content/admin-service.ts tests/assets.test.ts tests/admin-service.test.ts
git commit -m "feat: add portfolio content APIs and uploads"
```

---

### Task 7: Build the Complete Admin CMS and Draft Preview

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/AdminClient.tsx`
- Create: `app/admin/components/BilingualField.tsx`
- Create: `app/admin/components/SettingsEditor.tsx`
- Create: `app/admin/components/EntryListEditor.tsx`
- Create: `app/admin/components/ProjectEditor.tsx`
- Create: `app/admin/components/ImageUploader.tsx`
- Create: `app/preview/page.tsx`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: authenticated admin APIs, `PortfolioData`, and `getAdminPortfolio()`.
- Produces: complete CMS UI and authenticated preview that includes drafts.

- [ ] **Step 1: Add built-worker protection tests**

```js
test("redirects anonymous admin requests to login", async () => {
  const response = await render("/admin");
  assert.ok([302, 303, 307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/admin\/login/);
});

test("does not expose preview anonymously", async () => {
  const response = await render("/preview");
  assert.ok([302, 303, 307, 308, 401].includes(response.status));
});
```

- [ ] **Step 2: Run the smoke test to verify it fails**

```powershell
npm test
```

Expected: FAIL because protected pages do not exist.

- [ ] **Step 3: Implement the protected admin shell**

`app/admin/page.tsx` calls `requireAdmin()` before rendering. The client presents six focused sections: Overview, Profile, Experience, Education, Skills, and Projects. Include logout and preview actions.

- [ ] **Step 4: Implement reusable bilingual fields**

`BilingualField` renders paired labeled inputs:

```ts
interface BilingualFieldProps {
  label: string;
  value: LocalizedText;
  multiline?: boolean;
  onChange(value: LocalizedText): void;
  errors?: Partial<Record<Language, string>>;
}
```

Both language values remain visible together on desktop and stack on mobile.

- [ ] **Step 5: Implement settings and list editors**

- `SettingsEditor`: name, title, hero, about, contact close, email, telephone, location, portrait.
- `EntryListEditor`: create, edit, delete, publish/unpublish, move up/down for experience, education, and skill groups.
- Preserve local input when an API call fails.
- Announce success/error with an accessible live region.
- Require confirmation before deletion.

- [ ] **Step 6: Implement the project editor**

Support every project field in the design. The URL field is optional; clearing it saves an empty string. Image upload returns the asset URL and alternative-text fields remain editable in Thai and English.

- [ ] **Step 7: Implement authenticated preview**

`/preview` loads `getAdminPortfolio()` after `requireAdmin()`, renders `PortfolioClient`, displays a visible preview banner, and sets `robots: { index: false, follow: false }`.

- [ ] **Step 8: Add loading, empty, and failure states**

- Disable only the control currently saving.
- Keep forms mounted on server errors.
- Provide a retry action when the initial admin snapshot fails.
- Render an intentional empty state when a section has no entries.

- [ ] **Step 9: Run tests and build**

```powershell
npm run test:unit
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 10: Commit the CMS**

```powershell
git add app/admin app/preview app/globals.css tests/rendered-html.test.mjs
git commit -m "feat: add complete portfolio CMS"
```

---

### Task 8: Finish Metadata, Social Preview, Accessibility, and Verification

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `public/og.png` when generated text is correct.
- Modify: `tests/rendered-html.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Consumes: stable finished visual direction and public copy.
- Produces: share-ready metadata, final verification evidence, and operator guidance.

- [ ] **Step 1: Freeze and generate one social-card brief**

Create exactly one landscape image using the finished name, role, warm-neutral/electric-blue palette, editorial typography, and project-grid motif. Inspect the returned image for exact spelling of:

```text
Waranchai Pungwattananukul
Full-Stack Web Developer
```

Retry once only if the image is unusable. Omit `og:image` if neither image passes text inspection.

- [ ] **Step 2: Wire absolute request-host metadata**

Add canonical, Open Graph, and X metadata for the public site. Do not add social-image metadata unless `public/og.png` passed inspection. Add no-index metadata for `/admin`, `/admin/login`, and `/preview`.

- [ ] **Step 3: Extend final smoke assertions**

Assert the built page contains:

- site-specific title and description;
- portrait alternative text;
- all public section landmarks;
- no starter metadata or copy;
- no public draft marker;
- admin/preview no-index behavior.

- [ ] **Step 4: Run the complete verification suite**

```powershell
npm run test:unit
npm test
npm run lint
npm run build
git status --short
```

Expected: all test, lint, and build commands PASS; only intentional generated/modified files appear.

- [ ] **Step 5: Inspect deployment artifacts**

Confirm:

```text
dist/server/index.js
dist/.openai/hosting.json
dist/.openai/drizzle/0001_portfolio_cms.sql
dist/.openai/drizzle/0002_seed_portfolio.sql
```

Confirm `.openai/hosting.json` contains only `project_id` when assigned plus the logical `d1` and `r2` fields.

- [ ] **Step 6: Update operator guidance**

Document:

- local setup using `.dev.vars.example`;
- PBKDF2 hash-generation command;
- D1/R2 role;
- initial administrator sign-in path;
- content publishing and optional project URL behavior;
- no credentials or deployment secrets.

- [ ] **Step 7: Commit the verified release**

```powershell
git add app public tests README.md package.json package-lock.json
git commit -m "chore: prepare portfolio for release"
```

---

### Task 9: Save and Deploy the Exact Validated Source

**Files:**
- Modify: `.openai/hosting.json` with the Sites `project_id`.
- Create temporarily: packaged deployment archive outside committed source.

**Interfaces:**
- Consumes: successful Task 8 build and exact branch-head commit SHA.
- Produces: saved Sites version, private production deployment URL, and configured hosted runtime values.

- [ ] **Step 1: Generate administrator credentials**

Generate one random temporary password and its PBKDF2 hash locally. Retain the plaintext only long enough to hand it to the user in the final response. Configure hosted values:

```text
ADMIN_EMAIL=waranchai_new@hotmail.com
ADMIN_PASSWORD_HASH=pbkdf2-sha256$210000$...
```

- [ ] **Step 2: Create or reuse the Sites project**

Call `create_site` exactly once because this is a new local site, save the returned opaque `project_id` in `.openai/hosting.json`, and reuse its source write credential.

- [ ] **Step 3: Rebuild after hosting metadata changes**

```powershell
npm run build
```

Expected: PASS with the final project ID and required logical bindings packaged.

- [ ] **Step 4: Commit and push the exact validated source**

Commit `.openai/hosting.json`, push with the temporary authorization header returned by Sites, and capture the pushed branch-head SHA without writing credentials to Git configuration or the remote URL.

- [ ] **Step 5: Package and save one version**

Use the Sites `package-site.sh` helper to stage `dist/`, hosting metadata, and migrations. Save one version using the exact pushed commit SHA and archive.

- [ ] **Step 6: Deploy privately and poll**

Deploy the saved version privately. Poll deployment status until it reports `succeeded` or a terminal failure.

- [ ] **Step 7: Open the deployed site and hand off**

Open the exact production URL in the Codex browser, stop the retained local development server, and return:

- production URL;
- administrator URL `/admin`;
- administrator email;
- temporary password with an instruction to store it securely;
- concise summary of bilingual switching, optional project links, content editing, preview, and publishing.
