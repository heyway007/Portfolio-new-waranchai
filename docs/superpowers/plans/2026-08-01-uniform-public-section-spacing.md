# Uniform Public Section Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply compact, equal top and bottom padding to every public content section after the Hero.

**Architecture:** Keep the existing shared `--section-space` mechanism and replace its fluid values with exact responsive values. Make Contact consume the same value on both vertical edges while preserving all horizontal padding rules.

**Tech Stack:** CSS, Node test runner

## Global Constraints

- Desktop section padding is `5rem` top and bottom.
- Tablet section padding is `4rem` top and bottom.
- Mobile section padding is `3rem` top and bottom.
- About, Work, Experience, Skills, and Contact use the shared values.
- Keep Hero, horizontal gutters, carousel, headings, components, content, and Admin unchanged.
- Work directly on `main` and execute inline as explicitly authorized.

---

### Task 1: Shared responsive section spacing

**Files:**
- Modify: `tests/design-contract.test.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Produces no JavaScript or component API changes.
- Preserves `.section { padding: var(--section-space) 0; }`.

- [ ] **Step 1: Write the failing CSS contract**

Add a `uses compact uniform public section spacing` test:

```js
test("uses compact uniform public section spacing", () => {
  assertCssRule(styles, ".portfolio-site", "--section-space", "5rem");
  assert.match(
    styles,
    /@media\s*\(max-width:\s*1199px\)[\s\S]*?\.portfolio-site\s*{[^}]*--section-space:\s*4rem/,
  );
  assert.match(
    styles,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site\s*{[^}]*--section-space:\s*3rem/,
  );
  assertCssRule(
    styles,
    ".portfolio-site .contact-section",
    "padding-block",
    "var(--section-space)",
  );
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test --test-name-pattern="compact uniform public section spacing" tests/design-contract.test.mjs`

Expected: FAIL because the current values are fluid 5.5–8.5rem, 5–7rem, and 4.75rem, and Contact has a separate 2rem bottom padding.

- [ ] **Step 3: Implement the shared spacing values**

In `app/globals.css`:

```css
.portfolio-site {
  --section-space: 5rem;
}

@media (max-width: 1199px) {
  .portfolio-site {
    --section-space: 4rem;
  }
}

@media (max-width: 760px) {
  .portfolio-site {
    --section-space: 3rem;
  }
}
```

Replace Contact's padding shorthand with `padding-block: var(--section-space)` and preserve its current horizontal expression in `padding-inline`:

```css
padding-block: var(--section-space);
padding-inline: max(2rem, calc((100vw - 82.5rem) / 2));
```

- [ ] **Step 4: Verify focused GREEN**

Run: `node --test tests/design-contract.test.mjs`

Expected: all design contracts pass.

- [ ] **Step 5: Run full verification**

Run:

```powershell
npm test
npm run test:unit
npm run lint
npx tsc --noEmit
```

Expected: build, integration tests, unit tests, lint, and TypeScript all pass.

- [ ] **Step 6: Commit**

```powershell
git add app/globals.css tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-uniform-public-section-spacing.md
git commit -m "style: tighten public section spacing"
```
