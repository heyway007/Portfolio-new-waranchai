# Public Eyebrow Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all eyebrow labels from the public portfolio and make every public section heading a single-column layout without changing Admin or CMS data.

**Architecture:** Remove eyebrow markup at the public component boundary and delete only props that become unused. Preserve all content types, stored fields, validation, and Admin components; simplify the existing public CSS heading rule and repair spacing exposed by the removed elements.

**Tech Stack:** React 19, TypeScript, Vinext, CSS, Node test runner

## Global Constraints

- Remove public eyebrow markup from Hero, About, Work, Experience, Education, Skills, and Contact.
- `.section-heading` and `.section-heading-wide` use one column.
- Do not modify Admin components, CMS forms, content types, validation, default data, or database behavior.
- Keep all primary headings and content unchanged.
- Work directly on `main` and execute inline as explicitly authorized.

---

### Task 1: Public eyebrow markup and heading layout

**Files:**
- Modify: `app/components/portfolio/Hero.tsx`
- Modify: `app/components/portfolio/PortfolioClient.tsx`
- Modify: `app/components/portfolio/ProjectGrid.tsx`
- Modify: `app/components/portfolio/Timeline.tsx`
- Modify: `app/components/portfolio/SkillGroups.tsx`
- Modify: `app/components/portfolio/Contact.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Preserve `Hero({ settings, language })`, `ProjectGrid({ projects, language, copy })`, and `Contact({ settings, language })`.
- Change `Timeline` by removing the `eyebrow: string` and `educationLabel: string` props.
- Change `SkillGroups` by removing the `eyebrow: string` prop.
- Preserve every Admin and content-data interface.

- [ ] **Step 1: Write failing public DOM and CSS contracts**

In `tests/rendered-html.test.mjs`, extend the public identity test:

```js
assert.doesNotMatch(html, /class="hero-eyebrow"/i);
assert.doesNotMatch(html, /class="eyebrow"/i);
```

In `tests/design-contract.test.mjs`, add:

```js
test("uses one-column public headings without eyebrow styling", () => {
  assertCssRule(
    styles,
    ".portfolio-site .section-heading",
    "grid-template-columns",
    "minmax(0, 1fr)",
  );
  assertCssRule(
    styles,
    ".portfolio-site .section-heading-wide",
    "grid-template-columns",
    "minmax(0, 1fr)",
  );
  assert.doesNotMatch(styles, /\.portfolio-site \.hero-eyebrow/);
});
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
npm run build
node --test --test-name-pattern="portfolio identity|one-column public headings" tests/rendered-html.test.mjs tests/design-contract.test.mjs
```

Expected: FAIL because public eyebrow markup and the two-column heading rule still exist.

- [ ] **Step 3: Remove public eyebrow markup and obsolete props**

Make these exact component changes:

- `Hero.tsx`: delete the `<p className="hero-eyebrow">` block only.
- `PortfolioClient.tsx`: delete the About eyebrow; stop passing `experienceEyebrow`, `education`, and `skillsEyebrow` to child props.
- `ProjectGrid.tsx`: delete the Work eyebrow while retaining the `<h2>`.
- `Timeline.tsx`: remove `eyebrow` and `educationLabel` from destructuring and types; delete both eyebrow paragraphs.
- `SkillGroups.tsx`: remove `eyebrow` from destructuring and types; delete its eyebrow paragraph.
- `Contact.tsx`: delete the Contact eyebrow while retaining the closing `<h2>`.

Do not remove eyebrow fields from `SiteSettings`, `SiteCopy`, validation, default data, or Admin components.

- [ ] **Step 4: Simplify public heading and spacing CSS**

Replace the public heading rule with:

```css
.portfolio-site .section-heading,
.portfolio-site .section-heading-wide {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}
```

Delete the public `.hero-eyebrow, .eyebrow` rule, reduce `.status-row` bottom margin to `clamp(1.5rem, 3vw, 2.25rem)`, and delete the obsolete mobile `.section-heading { gap: 0.9rem; }` rule. Add:

```css
.portfolio-site .education-panel article:first-child {
  padding-top: 0;
  border-top: 0;
}
```

Keep `.admin-login .eyebrow` and `.admin-shell .eyebrow` rules unchanged.

- [ ] **Step 5: Verify focused GREEN**

Run:

```powershell
npm run build
node --test tests/rendered-html.test.mjs tests/design-contract.test.mjs
npx tsc --noEmit
```

Expected: all focused tests and TypeScript pass.

- [ ] **Step 6: Run full verification**

Run:

```powershell
npm test
npm run test:unit
npm run lint
npx tsc --noEmit
```

Expected: build, integration tests, unit tests, lint, and TypeScript all pass with no public eyebrow DOM.

- [ ] **Step 7: Commit**

```powershell
git add app/components/portfolio/Hero.tsx app/components/portfolio/PortfolioClient.tsx app/components/portfolio/ProjectGrid.tsx app/components/portfolio/Timeline.tsx app/components/portfolio/SkillGroups.tsx app/components/portfolio/Contact.tsx app/globals.css tests/rendered-html.test.mjs tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-public-eyebrow-removal.md
git commit -m "style: remove public section eyebrows"
```
