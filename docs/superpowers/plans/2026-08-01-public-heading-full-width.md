# Public Heading Full-width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining text-width lock so all public section headings use 100% of the width available inside their current containers.

**Architecture:** Change only the existing public heading CSS declarations and extend the design contract that already verifies the one-column layout. Preserve section rails, carousel gutters, responsive typography, components, content, and Admin styles.

**Tech Stack:** CSS, Node test runner

## Global Constraints

- `.section-heading` and `.section-heading-wide` set `width: 100%`.
- `.section-heading h2` sets `width: 100%` and `max-width: none`.
- Keep the existing one-column grid, typography, content rails, carousel layout, and Admin behavior unchanged.
- Work directly on `main` and execute inline as explicitly authorized.

---

### Task 1: Full-width public headings

**Files:**
- Modify: `tests/design-contract.test.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Extends the existing `uses one-column public headings without eyebrow styling` contract.
- Produces no JavaScript or component API changes.

- [ ] **Step 1: Write the failing CSS contract**

Extend the existing public-heading test with:

```js
assertCssRule(styles, ".portfolio-site .section-heading", "width", "100%");
assertCssRule(styles, ".portfolio-site .section-heading-wide", "width", "100%");
assertCssRule(styles, ".portfolio-site .section-heading h2", "width", "100%");
assertCssRule(styles, ".portfolio-site .section-heading h2", "max-width", "none");
```

- [ ] **Step 2: Verify RED**

Run: `node --test --test-name-pattern="one-column public headings" tests/design-contract.test.mjs`

Expected: FAIL because the wrappers do not explicitly set width and the heading still sets `max-width: 18ch`.

- [ ] **Step 3: Implement the minimal CSS fix**

Add `width: 100%` to the grouped `.section-heading, .section-heading-wide` rule. Replace `max-width: 18ch` in `.section-heading h2` with:

```css
width: 100%;
max-width: none;
```

Do not change `.section`, `.work-section`, `.project-carousel`, responsive font sizes, or Admin selectors.

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
git add app/globals.css tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-public-heading-full-width.md
git commit -m "style: expand public headings to full width"
```
