# LINE Contact Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a clickable LINE QR code and text link to the public Contact section, with all LINE values editable from the existing Admin profile editor.

**Architecture:** Extend `SiteSettings` with explicit LINE fields and default them so repository merging keeps older D1 settings compatible. Reuse the existing `ImageUploader` and R2 upload flow in Admin, then render the settings in `Contact` with a packaged default QR image and focused public CSS.

**Tech Stack:** React 19, TypeScript, Vinext, CSS, Vitest, Node test runner, Cloudflare D1/R2

## Global Constraints

- Default URL is exactly `https://line.me/ti/p/gxajAHMh2V`.
- Default QR image is `public/images/portfolio/line-qr.jpg`, copied from `C:/Users/ASUS/Downloads/F0131EC3-0A89-4B00-81EF-72ECE81066CD.jpg`.
- Admin edits the LINE URL, bilingual label, QR image, and bilingual alternative text.
- Reuse the existing authenticated `ImageUploader` and R2 asset endpoint; add no API route or database table.
- Existing D1 settings without LINE fields must receive defaults through `portfolioFromRows`.
- Public external LINE links use `target="_blank"` and `rel="noreferrer"`.
- Preserve email, phone, Contact typography, section spacing, Admin navigation, and deployment configuration.
- Work directly on `main` as explicitly authorized.

---

### Task 1: LINE settings model, defaults, validation, and backward compatibility

**Files:**
- Modify: `lib/content/types.ts`
- Modify: `lib/content/default-portfolio.ts`
- Modify: `lib/content/validation.ts`
- Modify: `tests/content.test.ts`
- Modify: `tests/repository.test.ts`

**Interfaces:**
- Produces `SiteSettings.lineUrl: string`.
- Produces `SiteSettings.lineLabel: LocalizedText`.
- Produces `SiteSettings.lineQrImage: string`.
- Produces `SiteSettings.lineQrAlt: LocalizedText`.
- Supplies validated settings consumed by Admin and `Contact` in later tasks.

- [ ] **Step 1: Write failing settings-validation tests**

Update imports in `tests/content.test.ts`:

```ts
import { defaultPortfolio } from "../lib/content/default-portfolio";
import { validateEntry, validateSettings } from "../lib/content/validation";
```

Add:

```ts
describe("settings validation", () => {
  it("accepts the complete default LINE contact settings", () => {
    const result = validateSettings(defaultPortfolio.settings);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.lineUrl).toBe(
        "https://line.me/ti/p/gxajAHMh2V",
      );
      expect(result.value.lineQrImage).toBe(
        "/images/portfolio/line-qr.jpg",
      );
    }
  });

  it("rejects an unsafe LINE contact URL", () => {
    const result = validateSettings({
      ...defaultPortfolio.settings,
      lineUrl: "javascript:alert(1)",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.lineUrl).toBeDefined();
  });
});
```

- [ ] **Step 2: Write the failing legacy-settings repository test**

Add to `tests/repository.test.ts`:

```ts
it("fills LINE defaults into stored settings created before LINE fields", () => {
  const legacySettings = {
    ...defaultPortfolio.settings,
  } as Record<string, unknown>;
  delete legacySettings.lineUrl;
  delete legacySettings.lineLabel;
  delete legacySettings.lineQrImage;
  delete legacySettings.lineQrAlt;

  const result = portfolioFromRows(
    JSON.stringify(legacySettings),
    [],
    false,
  );

  expect(result.settings.lineUrl).toBe(
    "https://line.me/ti/p/gxajAHMh2V",
  );
  expect(result.settings.lineQrImage).toBe(
    "/images/portfolio/line-qr.jpg",
  );
  expect(result.settings.lineLabel).toEqual({
    en: "Add me on LINE",
    th: "เพิ่มเพื่อนทาง LINE",
  });
});
```

- [ ] **Step 3: Verify RED**

Run:

```powershell
npm run test:unit -- tests/content.test.ts tests/repository.test.ts
```

Expected: FAIL because LINE fields are absent and unsafe `lineUrl` is not validated.

- [ ] **Step 4: Add the LINE settings interface and defaults**

Add to `SiteSettings` after `phone` in `lib/content/types.ts`:

```ts
lineUrl: string;
lineLabel: LocalizedText;
lineQrImage: string;
lineQrAlt: LocalizedText;
```

Add to `defaultPortfolio.settings` after `phone`:

```ts
lineUrl: "https://line.me/ti/p/gxajAHMh2V",
lineLabel: { en: "Add me on LINE", th: "เพิ่มเพื่อนทาง LINE" },
lineQrImage: "/images/portfolio/line-qr.jpg",
lineQrAlt: {
  en: "LINE QR code for Waranchai",
  th: "คิวอาร์โค้ด LINE สำหรับติดต่อวรัญชัย",
},
```

- [ ] **Step 5: Validate the LINE settings**

In `validateSettings`, normalize and validate the URL before building `settings`:

```ts
const lineUrl = stringValue(object.lineUrl, "lineUrl", errors, true, 1_000);
if (lineUrl && !validHttpUrl(lineUrl)) {
  errors.lineUrl = "Use a valid HTTP or HTTPS URL.";
}
```

Add these properties to the `settings` object after `phone`:

```ts
lineUrl,
lineLabel: localizedValue(object.lineLabel, "lineLabel", errors, true, 180),
lineQrImage: imageReference(
  object.lineQrImage,
  "lineQrImage",
  errors,
  true,
),
lineQrAlt: localizedValue(
  object.lineQrAlt,
  "lineQrAlt",
  errors,
  true,
  240,
),
```

- [ ] **Step 6: Verify GREEN**

Run:

```powershell
npm run test:unit -- tests/content.test.ts tests/repository.test.ts
npx tsc --noEmit
```

Expected: both unit files and TypeScript pass.

- [ ] **Step 7: Commit Task 1**

```powershell
git add lib/content/types.ts lib/content/default-portfolio.ts lib/content/validation.ts tests/content.test.ts tests/repository.test.ts
git commit -m "feat: add validated LINE contact settings"
```

---

### Task 2: Admin LINE fields and R2-backed QR uploader

**Files:**
- Modify: `app/admin/components/SettingsEditor.tsx`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Consumes the four `SiteSettings` LINE properties from Task 1.
- Consumes the existing `ImageUploader({ value, alt, onChange })` interface.
- Produces a Profile & Contact editing surface that saves through the existing settings API.

- [ ] **Step 1: Write the failing Admin source contract**

Read `SettingsEditor.tsx` near the top of `tests/design-contract.test.mjs`:

```js
const settingsEditorSource = await readFile(
  new URL(
    "../app/admin/components/SettingsEditor.tsx",
    import.meta.url,
  ),
  "utf8",
);
```

Add:

```js
test("edits every LINE contact field through the Admin profile", () => {
  assert.match(settingsEditorSource, /type="url"[\s\S]*?value={value\.lineUrl}/);
  assert.match(settingsEditorSource, /label="LINE link label"[\s\S]*?value={value\.lineLabel}/);
  assert.match(settingsEditorSource, /value={value\.lineQrImage}/);
  assert.match(settingsEditorSource, /alt={value\.lineQrAlt}/);
  assert.match(settingsEditorSource, /label="LINE QR alternative text"[\s\S]*?value={value\.lineQrAlt}/);
});
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --test --test-name-pattern="every LINE contact field" tests/design-contract.test.mjs
```

Expected: FAIL because the Admin editor has no LINE controls.

- [ ] **Step 3: Add the Admin URL and label fields**

After the email/phone block in `SettingsEditor.tsx`, add:

```tsx
<label>
  LINE add-friend URL
  <input
    type="url"
    value={value.lineUrl}
    onChange={(event) =>
      onChange({ ...value, lineUrl: event.target.value })
    }
  />
</label>
<BilingualField
  label="LINE link label"
  value={value.lineLabel}
  onChange={(lineLabel) => onChange({ ...value, lineLabel })}
/>
```

- [ ] **Step 4: Add the Admin QR uploader and alternative text**

Add after the LINE label:

```tsx
<div>
  <p className="admin-field-title">LINE QR code</p>
  <ImageUploader
    value={value.lineQrImage}
    alt={value.lineQrAlt}
    onChange={(lineQrImage) => onChange({ ...value, lineQrImage })}
  />
</div>
<BilingualField
  label="LINE QR alternative text"
  value={value.lineQrAlt}
  onChange={(lineQrAlt) => onChange({ ...value, lineQrAlt })}
/>
```

- [ ] **Step 5: Verify GREEN**

Run:

```powershell
node --test --test-name-pattern="every LINE contact field" tests/design-contract.test.mjs
npx tsc --noEmit
```

Expected: the Admin source contract and TypeScript pass.

- [ ] **Step 6: Commit Task 2**

```powershell
git add app/admin/components/SettingsEditor.tsx tests/design-contract.test.mjs
git commit -m "feat: manage LINE contact in Admin"
```

---

### Task 3: Public LINE QR and link

**Files:**
- Add: `public/images/portfolio/line-qr.jpg`
- Modify: `app/components/portfolio/Contact.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Consumes `settings.lineUrl`, `settings.lineLabel`, `settings.lineQrImage`, and `settings.lineQrAlt` from Task 1.
- Produces `.line-contact`, `.line-qr-link`, and `.contact-link` public elements.

- [ ] **Step 1: Write the failing rendered-output test**

Add `access` to the `node:fs/promises` import in `tests/rendered-html.test.mjs`, then add:

```js
test("renders a secure LINE QR code and text contact link", async () => {
  await access(
    new URL("../public/images/portfolio/line-qr.jpg", import.meta.url),
  );
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /class="line-contact"/i);
  assert.match(html, /src="\/images\/portfolio\/line-qr\.jpg"/i);
  assert.match(html, /alt="LINE QR code for Waranchai"/i);
  assert.equal(
    (html.match(/href="https:\/\/line\.me\/ti\/p\/gxajAHMh2V"/g) ?? [])
      .length,
    2,
  );
  assert.equal((html.match(/target="_blank"/g) ?? []).length >= 2, true);
  assert.equal((html.match(/rel="noreferrer"/g) ?? []).length >= 2, true);
});
```

- [ ] **Step 2: Write the failing public design contract**

Add to `tests/design-contract.test.mjs`:

```js
test("styles an accessible responsive LINE contact card", () => {
  assertCssRule(styles, ".portfolio-site .line-contact", "display", "grid");
  assertCssRule(styles, ".portfolio-site .line-qr-link", "width", "11rem");
  assertCssRule(styles, ".portfolio-site .line-qr-link", "aspect-ratio", "1");
  assert.match(styles, /\.portfolio-site \.line-qr-link:focus-visible/);
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.line-qr-link/,
  );
});
```

- [ ] **Step 3: Verify RED**

Run:

```powershell
npm run build
node --test --test-name-pattern="secure LINE QR|responsive LINE contact card" tests/rendered-html.test.mjs tests/design-contract.test.mjs
```

Expected: FAIL because the packaged QR asset, public markup, and LINE CSS do not exist.

- [ ] **Step 4: Package the supplied QR image**

Copy the binary asset without modifying it:

```powershell
Copy-Item -LiteralPath 'C:\Users\ASUS\Downloads\F0131EC3-0A89-4B00-81EF-72ECE81066CD.jpg' -Destination 'C:\laragon\www\Portfolio-new\public\images\portfolio\line-qr.jpg'
```

Verify the exact target:

```powershell
Get-Item 'C:\laragon\www\Portfolio-new\public\images\portfolio\line-qr.jpg' | Select-Object FullName,Length
```

- [ ] **Step 5: Render the public LINE contact block**

Import `Image` from `next/image` in `Contact.tsx`. Give the existing email and phone anchors `className="contact-link"`, then add inside `.contact-details` after phone:

```tsx
<div className="line-contact">
  <a
    className="line-qr-link"
    href={settings.lineUrl}
    target="_blank"
    rel="noreferrer"
    aria-label={localize(settings.lineLabel, language)}
  >
    <Image
      src={settings.lineQrImage}
      alt={localize(settings.lineQrAlt, language)}
      width={900}
      height={900}
      unoptimized
    />
  </a>
  <a
    className="contact-link line-text-link"
    href={settings.lineUrl}
    target="_blank"
    rel="noreferrer"
  >
    {localize(settings.lineLabel, language)}
  </a>
</div>
```

- [ ] **Step 6: Add the LINE card styling**

Change the existing Contact link selectors from `.contact-details a` to `.contact-details .contact-link`, including `::after`, hover/focus, and the reduced-motion selector list. Add:

```css
.portfolio-site .line-contact {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
  margin-top: 0.9rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--public-line);
}

.portfolio-site .line-qr-link {
  width: 11rem;
  max-width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  display: block;
  border: 1px solid rgb(255 138 0 / 35%);
  border-radius: 0.65rem;
  background: #fff;
  transition: border-color 180ms ease;
}

.portfolio-site .line-qr-link:hover {
  border-color: var(--accent);
}

.portfolio-site .line-qr-link:focus-visible {
  border-color: var(--accent);
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.portfolio-site .line-qr-link img {
  width: 100%;
  height: auto;
  display: block;
}
```

Inside `@media (max-width: 760px)`, add:

```css
.portfolio-site .line-qr-link {
  width: min(11rem, 48vw);
}
```

Update the reduced-motion selector contract in `tests/design-contract.test.mjs` from `.contact-details a` to `.contact-details .contact-link` so it matches the focused underline interaction.

- [ ] **Step 7: Verify focused GREEN**

Run:

```powershell
npm run build
node --test --test-name-pattern="secure LINE QR|responsive LINE contact card" tests/rendered-html.test.mjs tests/design-contract.test.mjs
node --test tests/design-contract.test.mjs
```

Expected: rendered LINE output and all design contracts pass.

- [ ] **Step 8: Run full verification**

Run:

```powershell
npm test
npm run test:unit
npm run lint
npx tsc --noEmit
```

Expected: build, integration tests, unit tests, lint, and TypeScript all pass.

- [ ] **Step 9: Commit Task 3**

```powershell
git add public/images/portfolio/line-qr.jpg app/components/portfolio/Contact.tsx app/globals.css tests/rendered-html.test.mjs tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-line-contact.md
git commit -m "feat: show LINE QR contact channel"
```
