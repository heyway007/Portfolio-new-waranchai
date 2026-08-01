# Project Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long project grid with an autoplay carousel that shows three cards per desktop slide, two on tablet, and one on mobile.

**Architecture:** Add pure carousel pagination helpers in a small module and convert `ProjectGrid` into a client component that mounts only the active project page. The component owns responsive sizing, autoplay, hover/focus pause, wraparound navigation, pagination, and touch swipe; the existing stylesheet owns the three/two/one-column layout and reduced-motion presentation.

**Tech Stack:** React 19, TypeScript, Vinext, Next Image, CSS, Vitest, Node test runner

## Global Constraints

- Desktop shows exactly three project cards per slide.
- Tablet shows two cards and mobile shows one card.
- Autoplay advances every 5000ms, wraps at the end, and pauses on hover or focus.
- Previous/next controls, pagination dots, and horizontal touch swipe remain available.
- Reduced motion disables autoplay and slide animation.
- Existing project data, card content, D1 bindings, CMS/admin behavior, and other sections remain unchanged.
- Add no carousel dependency.
- Work directly on `main` and execute inline as previously authorized.

---

### Task 1: Carousel pagination model

**Files:**
- Create: `app/components/portfolio/project-carousel.ts`
- Create: `tests/project-carousel.test.ts`

**Interfaces:**
- Produces `PROJECTS_PER_SLIDE_DESKTOP = 3` and `PROJECT_AUTOPLAY_INTERVAL_MS = 5000`.
- Produces `getProjectsPerSlide(viewportWidth: number): 1 | 2 | 3`.
- Produces `getProjectSlideCount(projectCount: number, projectsPerSlide: number): number`.
- Produces `wrapProjectSlideIndex(index: number, slideCount: number): number`.
- Produces `getVisibleProjectSlice<T>(projects: readonly T[], slideIndex: number, projectsPerSlide: number): T[]`.

- [ ] **Step 1: Write the failing helper tests**

Create `tests/project-carousel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getProjectsPerSlide,
  getProjectSlideCount,
  getVisibleProjectSlice,
  wrapProjectSlideIndex,
} from "../app/components/portfolio/project-carousel";

describe("project carousel", () => {
  it("uses three, two, and one cards at the approved breakpoints", () => {
    expect(getProjectsPerSlide(1440)).toBe(3);
    expect(getProjectsPerSlide(1200)).toBe(3);
    expect(getProjectsPerSlide(1199)).toBe(2);
    expect(getProjectsPerSlide(761)).toBe(2);
    expect(getProjectsPerSlide(760)).toBe(1);
  });

  it("counts partial slides and handles an empty collection", () => {
    expect(getProjectSlideCount(10, 3)).toBe(4);
    expect(getProjectSlideCount(6, 3)).toBe(2);
    expect(getProjectSlideCount(0, 3)).toBe(0);
  });

  it("wraps navigation in either direction", () => {
    expect(wrapProjectSlideIndex(4, 4)).toBe(0);
    expect(wrapProjectSlideIndex(-1, 4)).toBe(3);
    expect(wrapProjectSlideIndex(8, 0)).toBe(0);
  });

  it("returns only the active project page", () => {
    const projects = ["a", "b", "c", "d", "e"];
    expect(getVisibleProjectSlice(projects, 0, 3)).toEqual(["a", "b", "c"]);
    expect(getVisibleProjectSlice(projects, 1, 3)).toEqual(["d", "e"]);
    expect(getVisibleProjectSlice(projects, -1, 3)).toEqual(["d", "e"]);
  });
});
```

- [ ] **Step 2: Run the unit test to verify RED**

Run: `npm run test:unit -- tests/project-carousel.test.ts`

Expected: FAIL because `project-carousel.ts` does not exist.

- [ ] **Step 3: Implement the pure helpers**

Create `app/components/portfolio/project-carousel.ts`:

```ts
export const PROJECTS_PER_SLIDE_DESKTOP = 3;
export const PROJECT_AUTOPLAY_INTERVAL_MS = 5000;

export function getProjectsPerSlide(viewportWidth: number): 1 | 2 | 3 {
  if (viewportWidth <= 760) return 1;
  if (viewportWidth <= 1199) return 2;
  return 3;
}

export function getProjectSlideCount(projectCount: number, projectsPerSlide: number) {
  if (projectCount <= 0) return 0;
  return Math.ceil(projectCount / Math.max(1, projectsPerSlide));
}

export function wrapProjectSlideIndex(index: number, slideCount: number) {
  if (slideCount <= 0) return 0;
  return ((index % slideCount) + slideCount) % slideCount;
}

export function getVisibleProjectSlice<T>(
  projects: readonly T[],
  slideIndex: number,
  projectsPerSlide: number,
) {
  const safePageSize = Math.max(1, projectsPerSlide);
  const slideCount = getProjectSlideCount(projects.length, safePageSize);
  const start = wrapProjectSlideIndex(slideIndex, slideCount) * safePageSize;
  return projects.slice(start, start + safePageSize);
}
```

- [ ] **Step 4: Run the unit test to verify GREEN**

Run: `npm run test:unit -- tests/project-carousel.test.ts`

Expected: all four tests pass.

- [ ] **Step 5: Commit the pagination model**

```powershell
git add app/components/portfolio/project-carousel.ts tests/project-carousel.test.ts
git commit -m "test: define project carousel pagination"
```

---

### Task 2: Responsive autoplay carousel component

**Files:**
- Modify: `app/components/portfolio/ProjectGrid.tsx`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes all helpers from Task 1.
- Preserves `ProjectGrid({ projects, language, copy })`.
- Produces `.project-carousel`, `.project-carousel-viewport`, `.project-slide-grid`, `.project-carousel-controls`, `.project-carousel-button`, `.project-carousel-dots`, and `.project-carousel-status`.

- [ ] **Step 1: Write the failing rendered HTML contract**

Extend the dark technical section test in `tests/rendered-html.test.mjs`:

```js
assert.match(html, /class="project-carousel"/i);
assert.match(html, /class="project-carousel-viewport"/i);
assert.match(html, /class="project-slide-grid"/i);
assert.match(html, /class="project-carousel-controls"/i);
assert.match(html, /aria-current="true"/i);
assert.equal((html.match(/class="project-card(?:\s|\")/g) ?? []).length, 3);
```

- [ ] **Step 2: Build and run the focused rendered test to verify RED**

Run:

```powershell
npm run build
node --test --test-name-pattern="dark technical section" tests/rendered-html.test.mjs
```

Expected: FAIL because the existing section still renders `projects-grid` and all projects.

- [ ] **Step 3: Convert `ProjectGrid` to the client carousel**

Add `"use client"` and React state/effect/ref imports. Initialize `projectsPerSlide` to `PROJECTS_PER_SLIDE_DESKTOP` so server and first client render both contain three cards. Add effects that:

- update page size from `window.innerWidth` on mount and resize;
- track `(prefers-reduced-motion: reduce)` changes;
- clamp the active slide after page-size or project-count changes;
- advance every `PROJECT_AUTOPLAY_INTERVAL_MS` unless paused, reduced motion is active, or fewer than two slides exist.

Use `getVisibleProjectSlice` and render only that page. Keep the original project card markup and calculate the global number with `slideIndex * projectsPerSlide + index + 1`.

Wrap the active grid in:

```tsx
<div
  className="project-carousel"
  role="region"
  aria-roledescription="carousel"
  aria-label={carouselLabel}
  onMouseEnter={() => setPointerPaused(true)}
  onMouseLeave={() => setPointerPaused(false)}
  onFocusCapture={() => setFocusPaused(true)}
  onBlurCapture={handleBlur}
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}
>
```

Navigation updates a `direction: -1 | 1` state and wraps the slide index. A touch/pen pointer delta of at least 50px navigates once. Render previous/next 44px buttons, one dot per slide with `aria-current` on the active dot, and localized Thai/English status text. Use `data-direction` plus a key containing page size and slide index on `.project-slide-grid` so each page change restarts the slide animation.

- [ ] **Step 4: Verify focused component GREEN**

Run:

```powershell
npm run build
node --test --test-name-pattern="dark technical section" tests/rendered-html.test.mjs
npm run test:unit -- tests/project-carousel.test.ts
```

Expected: focused tests pass and the built server HTML contains three initial project cards.

- [ ] **Step 5: Commit the behavior**

```powershell
git add app/components/portfolio/ProjectGrid.tsx app/components/portfolio/project-carousel.ts tests/project-carousel.test.ts tests/rendered-html.test.mjs
git commit -m "feat: add autoplay project carousel"
```

---

### Task 3: Carousel layout, controls, and motion contracts

**Files:**
- Modify: `app/globals.css`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Consumes the carousel class names and `data-direction` from Task 2.
- Produces desktop 3-column, tablet 2-column, and mobile 1-column slide layouts.

- [ ] **Step 1: Write failing CSS contracts**

Add a `project carousel` test to `tests/design-contract.test.mjs` that checks:

```js
assertCssRule(styles, ".portfolio-site .project-slide-grid", "grid-template-columns", "repeat(3, minmax(0, 1fr))");
assertCssRule(styles, ".portfolio-site .project-carousel-button", "min-width", "44px");
assertCssRule(styles, ".portfolio-site .project-carousel-button", "min-height", "44px");
assert.match(styles, /@keyframes\s+project-slide-forward/);
assert.match(styles, /@keyframes\s+project-slide-backward/);
assert.match(styles, /@media\s*\(max-width:\s*1199px\)[\s\S]*?\.portfolio-site \.project-slide-grid\s*{[^}]*repeat\(2,/);
assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.portfolio-site \.project-slide-grid\s*{[^}]*minmax\(0,\s*1fr\)/);
assert.match(reducedMotionStyles, /\.portfolio-site \.project-slide-grid/);
assert.match(reducedMotionStyles, /animation:\s*none/);
```

- [ ] **Step 2: Run the CSS contract to verify RED**

Run: `node --test --test-name-pattern="project carousel" tests/design-contract.test.mjs`

Expected: FAIL because the carousel selectors and animations do not exist.

- [ ] **Step 3: Implement carousel styling**

Replace `.projects-grid` with a clipped `.project-carousel-viewport` and `.project-slide-grid` that uses `repeat(3, minmax(0, 1fr))`. Add forward/backward keyframes using a small horizontal translate plus opacity, and choose the animation from `data-direction`. Style the control row, 44px circular arrow buttons, compact status, and pagination dots with visible hover/focus/current states. Add `touch-action: pan-y` to the carousel viewport.

At `max-width: 1199px`, change `.project-slide-grid` to two columns. At `max-width: 760px`, change it to one column and keep controls comfortably wrapped. In the reduced-motion block, set `.project-slide-grid { animation: none; }`.

- [ ] **Step 4: Verify focused GREEN**

Run:

```powershell
npm run build
node --test tests/rendered-html.test.mjs tests/design-contract.test.mjs
npm run test:unit -- tests/project-carousel.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 5: Run complete verification**

Run:

```powershell
npm test
npm run test:unit
npm run lint
npx tsc --noEmit
```

Inspect `http://localhost:3000` at desktop, tablet, and mobile widths when browser automation is available. Confirm three/two/one cards, five-second autoplay, hover/focus pause, wraparound arrows, dots, swipe, no horizontal page overflow, and complete reduced-motion behavior.

- [ ] **Step 6: Commit the finished carousel**

```powershell
git add app/globals.css tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-project-carousel.md
git commit -m "style: finish responsive project carousel"
```
