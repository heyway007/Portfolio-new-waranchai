# Remove Public Skill and Project Numbering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the visible two-digit sequence numbers from public skill groups and project cards while reclaiming the skill-grid space they occupied.

**Architecture:** Remove the number elements at their React sources and delete their dedicated CSS rules. Convert skill-card layout from number/title/items to title/items on desktop and tablet, then to a single-column title-over-items layout on mobile; project image layout remains unchanged because its number was an absolute overlay.

**Tech Stack:** React 19, TypeScript, Vinext, CSS, Node test runner

## Global Constraints

- Delete `.skill-index` and `.project-number` markup; do not hide it with CSS.
- Delete the corresponding public CSS rules and leave no pseudo-element or generated counter replacement.
- Preserve project and skill order, carousel behavior, image priority, Admin data, D1/R2 bindings, and deployment configuration.
- Keep `projectIndex` in `ProjectGrid.tsx` because it still controls priority for the first two images.
- Desktop/tablet skill rows use two columns; mobile skill rows use one column.
- Work directly on `main` as explicitly authorized.

---

### Task 1: Remove both public numbering systems and reclaim layout

**Files:**
- Modify: `app/components/portfolio/SkillGroups.tsx`
- Modify: `app/components/portfolio/ProjectGrid.tsx`
- Modify: `app/globals.css`
- Modify: `tests/design-contract.test.mjs`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes the existing ordered `groups` and `projects` arrays without altering them.
- Produces skill rows containing only the localized heading and `.skill-items`.
- Produces project media without the decorative sequence-number overlay.

- [ ] **Step 1: Write the failing source and layout contract**

Read the two components near the top of `tests/design-contract.test.mjs`:

```js
const skillGroupsSource = await readFile(
  new URL("../app/components/portfolio/SkillGroups.tsx", import.meta.url),
  "utf8",
);
const projectGridSource = await readFile(
  new URL("../app/components/portfolio/ProjectGrid.tsx", import.meta.url),
  "utf8",
);
```

Add:

```js
test("removes public sequence numbers and reclaims their layout columns", () => {
  assert.doesNotMatch(skillGroupsSource, /skill-index/);
  assert.doesNotMatch(projectGridSource, /project-number/);
  assert.doesNotMatch(styles, /\.portfolio-site \.skill-index/);
  assert.doesNotMatch(styles, /\.portfolio-site \.project-number/);
  assertCssRule(
    styles,
    ".portfolio-site .skill-card",
    "grid-template-columns",
    "minmax(10rem, 0.3fr) minmax(0, 1fr)",
  );
  assert.match(
    styles,
    /@media\s*\(max-width:\s*1199px\)[\s\S]*?\.portfolio-site \.skill-card\s*{[^}]*grid-template-columns:\s*minmax\(8rem,\s*0\.28fr\)\s+minmax\(0,\s*1fr\)/,
  );
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.skill-card\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  );
});
```

- [ ] **Step 2: Write the failing rendered-output contract**

Add to the existing “renders the dark technical section structure without fake controls” test in `tests/rendered-html.test.mjs`:

```js
assert.doesNotMatch(html, /class="(?:skill-index|project-number)"/i);
```

- [ ] **Step 3: Verify RED**

Run:

```powershell
npm run build
node --test --test-name-pattern="public sequence numbers|dark technical section structure" tests/design-contract.test.mjs tests/rendered-html.test.mjs
```

Expected: FAIL because both components still emit number classes and the CSS still contains their rules.

- [ ] **Step 4: Remove the skill-group number markup**

Change the group map in `SkillGroups.tsx` from:

```tsx
{groups.map((group, index) => (
  <article className="skill-card" key={group.id} data-reveal>
    <p className="skill-index">{String(index + 1).padStart(2, "0")}</p>
```

to:

```tsx
{groups.map((group) => (
  <article className="skill-card" key={group.id} data-reveal>
```

Keep the heading and skill list unchanged.

- [ ] **Step 5: Remove the project number overlay**

Delete this span from `ProjectGrid.tsx`:

```tsx
<span className="project-number">
  {String(projectIndex + 1).padStart(2, "0")}
</span>
```

Do not remove `projectIndex`; retain `priority={projectIndex < 2}`.

- [ ] **Step 6: Remove dead CSS and update the responsive skill grid**

Delete the complete `.portfolio-site .skill-index` and `.portfolio-site .project-number` rules.

Set the base skill-card declaration to:

```css
grid-template-columns: minmax(10rem, 0.3fr) minmax(0, 1fr);
```

Inside `@media (max-width: 1199px)`, set:

```css
grid-template-columns: minmax(8rem, 0.28fr) minmax(0, 1fr);
```

Inside `@media (max-width: 760px)`, set:

```css
grid-template-columns: minmax(0, 1fr);
```

Remove `grid-column: 1 / -1` from the mobile `.skill-items` rule because the parent now has one column.

- [ ] **Step 7: Verify focused GREEN**

Run:

```powershell
npm run build
node --test --test-name-pattern="public sequence numbers|dark technical section structure" tests/design-contract.test.mjs tests/rendered-html.test.mjs
node --test tests/design-contract.test.mjs
```

Expected: the focused contracts and every design contract pass.

- [ ] **Step 8: Run full verification**

Run:

```powershell
npm test
npm run test:unit
npm run lint
npx tsc --noEmit
```

Expected: build, integration tests, unit tests, lint, and TypeScript all pass.

- [ ] **Step 9: Commit**

```powershell
git add app/components/portfolio/SkillGroups.tsx app/components/portfolio/ProjectGrid.tsx app/globals.css tests/design-contract.test.mjs tests/rendered-html.test.mjs docs/superpowers/plans/2026-08-02-remove-public-numbering.md
git commit -m "style: remove public sequence numbers"
```
