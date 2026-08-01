# Contact Heading and Floating Back to Top Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the Contact heading and replace its footer-only Back to Top link with a localized floating control shown after 240px of scrolling.

**Architecture:** Add a small client component that owns scroll-threshold state and exports a pure visibility helper. Mount it once from `PortfolioClient`, remove the duplicate footer link from `Contact`, and keep all presentation in the public stylesheet.

**Tech Stack:** React 19, TypeScript, Vinext, CSS, Vitest, Node test runner

## Global Constraints

- Contact heading uses `clamp(2.25rem, 5vw, 4.75rem)` on desktop/tablet and `clamp(2rem, 10vw, 3.25rem)` on mobile.
- Back to Top is absent at `scrollY <= 240` and visible at `scrollY > 240`.
- The floating control replaces the footer link and uses the existing localized CMS copy.
- The control is fixed bottom-right with a minimum 48px hit target and visible focus state.
- Preserve Contact columns, section spacing, CMS/Admin data, database bindings, and deployment configuration.
- Work directly on `main` and execute inline as explicitly authorized.

---

### Task 1: Scroll-aware Back to Top component

**Files:**
- Create: `app/components/portfolio/BackToTop.tsx`
- Create: `tests/back-to-top.test.ts`
- Modify: `app/components/portfolio/PortfolioClient.tsx`
- Modify: `app/components/portfolio/Contact.tsx`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Produces `BACK_TO_TOP_THRESHOLD = 240`.
- Produces `shouldShowBackToTop(scrollY: number): boolean`.
- Produces `BackToTop({ label }: { label: string }): JSX.Element | null`.
- `PortfolioClient` consumes `BackToTop` and passes `label("backToTop")`.

- [ ] **Step 1: Write the failing threshold unit test**

Create `tests/back-to-top.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  BACK_TO_TOP_THRESHOLD,
  shouldShowBackToTop,
} from "../app/components/portfolio/BackToTop";

describe("Back to Top", () => {
  it("appears only after the visitor scrolls beyond 240px", () => {
    expect(BACK_TO_TOP_THRESHOLD).toBe(240);
    expect(shouldShowBackToTop(0)).toBe(false);
    expect(shouldShowBackToTop(240)).toBe(false);
    expect(shouldShowBackToTop(241)).toBe(true);
  });
});
```

- [ ] **Step 2: Verify unit RED**

Run: `npm run test:unit -- tests/back-to-top.test.ts`

Expected: FAIL because `BackToTop.tsx` does not exist.

- [ ] **Step 3: Implement the component and helper**

Create `BackToTop.tsx` with `"use client"`, `useEffect`, and `useState`:

```tsx
export const BACK_TO_TOP_THRESHOLD = 240;

export function shouldShowBackToTop(scrollY: number) {
  return scrollY > BACK_TO_TOP_THRESHOLD;
}

export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      const nextVisible = shouldShowBackToTop(window.scrollY);
      setVisible((current) => current === nextVisible ? current : nextVisible);
    };
    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });
    return () => window.removeEventListener("scroll", syncVisibility);
  }, []);

  if (!visible) return null;
  return <a className="back-to-top" href="#top" aria-label={label}>{label}</a>;
}
```

- [ ] **Step 4: Verify unit GREEN**

Run: `npm run test:unit -- tests/back-to-top.test.ts`

Expected: the boundary test passes.

- [ ] **Step 5: Write failing integration/source contracts**

In `tests/design-contract.test.mjs`, read `BackToTop.tsx`, `PortfolioClient.tsx`, and `Contact.tsx`, then add:

```js
test("mounts one localized floating Back to Top control", () => {
  assert.match(backToTopSource, /addEventListener\("scroll",\s*syncVisibility,\s*{\s*passive:\s*true\s*}\)/);
  assert.match(backToTopSource, /className="back-to-top"/);
  assert.match(portfolioClientSource, /<BackToTop\s+label={label\("backToTop"\)}\s*\/>/);
  assert.doesNotMatch(contactSource, /href="#top"/);
});
```

- [ ] **Step 6: Verify integration RED**

Run: `node --test --test-name-pattern="localized floating Back to Top" tests/design-contract.test.mjs`

Expected: FAIL because the new component is not mounted and Contact still owns the footer link.

- [ ] **Step 7: Mount the control and remove the footer link**

Import `BackToTop` in `PortfolioClient.tsx` and render:

```tsx
<BackToTop label={label("backToTop")} />
```

as a direct child of `.portfolio-site` after `#main-content`. Delete the `<a href="#top">` from `Contact.tsx` while keeping the copyright paragraph.

- [ ] **Step 8: Verify integration GREEN**

Run:

```powershell
npm run build
node --test --test-name-pattern="localized floating Back to Top" tests/design-contract.test.mjs
npm run test:unit -- tests/back-to-top.test.ts
npx tsc --noEmit
```

Expected: build, integration contract, unit test, and TypeScript pass.

- [ ] **Step 9: Commit the behavior**

```powershell
git add app/components/portfolio/BackToTop.tsx app/components/portfolio/PortfolioClient.tsx app/components/portfolio/Contact.tsx tests/back-to-top.test.ts tests/design-contract.test.mjs
git commit -m "feat: add floating Back to Top control"
```

---

### Task 2: Contact typography and floating control styling

**Files:**
- Modify: `app/globals.css`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Consumes `.back-to-top` from Task 1.
- Preserves all public component APIs.

- [ ] **Step 1: Write failing CSS contracts**

Add a `styles the smaller Contact heading and floating control` test:

```js
test("styles the smaller Contact heading and floating control", () => {
  assertCssRule(styles, ".portfolio-site .contact-message h2", "font-size", "clamp(2.25rem, 5vw, 4.75rem)");
  assertCssRule(styles, ".portfolio-site .back-to-top", "position", "fixed");
  assertCssRule(styles, ".portfolio-site .back-to-top", "min-width", "48px");
  assertCssRule(styles, ".portfolio-site .back-to-top", "min-height", "48px");
  assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.contact-message h2\s*{[^}]*font-size:\s*clamp\(2rem,\s*10vw,\s*3.25rem\)/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.back-to-top/);
});
```

- [ ] **Step 2: Verify CSS RED**

Run: `node --test --test-name-pattern="smaller Contact heading" tests/design-contract.test.mjs`

Expected: FAIL because the old heading sizes and no floating-control styles remain.

- [ ] **Step 3: Implement the CSS**

Set the approved heading sizes. Add `.back-to-top` as a fixed, z-index 60, bottom-right inline-flex control with minimum 48px dimensions, compact padding, dark translucent background, orange border/text, visible hover/focus states, and `backdrop-filter`. At mobile widths reduce the right/bottom offsets to `1rem` and apply the approved mobile heading size.

Remove dead `.footer-bottom a` selectors from the shared contact-link rules and from the reduced-motion interaction contract list. Keep copyright styling and footer layout intact.

- [ ] **Step 4: Verify focused GREEN**

Run:

```powershell
node --test tests/design-contract.test.mjs
npm run test:unit -- tests/back-to-top.test.ts
```

Expected: all design and Back to Top unit tests pass.

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
git add app/globals.css tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-contact-heading-back-to-top.md
git commit -m "style: finish Contact and Back to Top polish"
```
