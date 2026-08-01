# Full-width Header and Code Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-width portfolio header and a two-panel hero with portrait-backed copy on the left and a typing Laravel Blade editor on the right.

**Architecture:** Add one focused client component for the code sample, token presentation, and typing timer. Keep CMS-owned hero copy in `Hero.tsx`, move the existing portrait into a decorative background layer, and implement layout/responsive/reduced-motion behavior in the existing public stylesheet.

**Tech Stack:** React 19, TypeScript, Vinext, Next Image, CSS, Vitest, Node test runner

## Global Constraints

- Keep the header sticky, full viewport width, and accessible at desktop and mobile sizes.
- Reuse `/images/portfolio/portrait.webp` from CMS settings; add no remote media.
- Use a realistic `realtime-dashboard.blade.php` sample mentioning Laravel Echo, Livewire, and Reverb.
- Animated text must not be an ARIA live region.
- Reduced-motion users see the complete sample without typing or caret animation.
- Do not change CMS data, D1/R2 bindings, other sections, or deployment configuration.
- Work directly on `main` and execute inline as previously authorized.

---

### Task 1: Typing Blade editor

**Files:**
- Create: `app/components/portfolio/HeroCodeEditor.tsx`
- Create: `tests/hero-code-editor.test.ts`

**Interfaces:**
- Exports `HERO_CODE_SAMPLE: string`.
- Exports `getVisibleCode(source: string, characterCount: number): string`.
- Exports `tokenizeBladeLine(line: string): Array<{ value: string; kind: "plain" | "comment" | "blade" | "string" | "keyword" }>`.
- Exports `HeroCodeEditor(): JSX.Element`.

- [ ] **Step 1: Write the failing unit test**

Create `tests/hero-code-editor.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  HERO_CODE_SAMPLE,
  getVisibleCode,
  tokenizeBladeLine,
} from "../app/components/portfolio/HeroCodeEditor";

describe("hero Blade editor", () => {
  it("shows a realistic realtime Laravel stack", () => {
    expect(HERO_CODE_SAMPLE).toContain("Echo.private");
    expect(HERO_CODE_SAMPLE).toContain(".listen");
    expect(HERO_CODE_SAMPLE).toContain("$wire.refreshStats");
    expect(HERO_CODE_SAMPLE).toContain("<livewire:stats-grid");
    expect(HERO_CODE_SAMPLE).toContain("Reverb");
  });

  it("clamps typing progress to the code sample", () => {
    expect(getVisibleCode("blade", -2)).toBe("");
    expect(getVisibleCode("blade", 3)).toBe("bla");
    expect(getVisibleCode("blade", 99)).toBe("blade");
  });

  it("classifies Blade comments and realtime keywords", () => {
    expect(tokenizeBladeLine("{{-- Reverb stream --}}")).toEqual([
      { value: "{{-- Reverb stream --}}", kind: "comment" },
    ]);
    expect(tokenizeBladeLine("Echo.private('dashboard')")).toEqual([
      { value: "Echo", kind: "keyword" },
      { value: ".private(", kind: "plain" },
      { value: "'dashboard'", kind: "string" },
      { value: ")", kind: "plain" },
    ]);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm run test:unit -- tests/hero-code-editor.test.ts`

Expected: FAIL because `HeroCodeEditor.tsx` does not exist.

- [ ] **Step 3: Implement the editor and pure helpers**

Create `HeroCodeEditor.tsx` with `"use client"`, a multiline Blade sample, clamped prefix rendering, deterministic token classification, and a timer:

```tsx
const TYPE_INTERVAL_MS = 18;
const HOLD_INTERVAL_MS = 2200;

export function getVisibleCode(source: string, characterCount: number) {
  return source.slice(0, Math.max(0, Math.min(characterCount, source.length)));
}
```

The effect checks `window.matchMedia("(prefers-reduced-motion: reduce)")`. Reduced motion sets the count to the complete sample. Otherwise it increments one character every 18ms, holds for 2200ms at completion, then resets to zero. Render:

- three editor window dots;
- tab `realtime-dashboard.blade.php`;
- status `Reverb connected`;
- an ordered list of tokenized code lines;
- footer chips `Laravel 12`, `Livewire 3`, and `Reverb`;
- a caret marked `aria-hidden="true"`;
- editor region `aria-label="Animated Laravel Blade code example"` and `aria-live="off"`.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:unit -- tests/hero-code-editor.test.ts`

Expected: all three tests pass.

- [ ] **Step 5: Commit the isolated editor**

```powershell
git add app/components/portfolio/HeroCodeEditor.tsx tests/hero-code-editor.test.ts
git commit -m "feat: add animated Blade code editor"
```

---

### Task 2: Full-width header and portrait-backed hero

**Files:**
- Modify: `app/components/portfolio/Hero.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`
- Modify: `tests/design-contract.test.mjs`

**Interfaces:**
- Consumes `HeroCodeEditor()` from Task 1.
- Preserves `Hero({ settings, language })` and all CMS/localization inputs.
- Produces `.hero-copy-panel`, `.hero-portrait-background`, `.hero-copy-content`, and `.hero-code-panel`.

- [ ] **Step 1: Write failing rendered and CSS contract tests**

In `tests/rendered-html.test.mjs` update the dark hero assertion to require:

```js
assert.match(html, /class="hero-copy-panel"/i);
assert.match(html, /class="hero-code-editor"/i);
assert.match(html, /realtime-dashboard\.blade\.php/i);
assert.match(html, /Reverb connected/i);
assert.doesNotMatch(html, /class="portrait-frame"/i);
```

In `tests/design-contract.test.mjs` add a test that asserts:

```js
assertCssRule(styles, ".portfolio-site .site-header", "width", "100%");
assert.match(styles, /\.hero-copy-panel/);
assert.match(styles, /\.hero-portrait-background/);
assert.match(styles, /\.hero-code-editor/);
assert.match(styles, /\.code-caret/);
assert.match(styles, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
assert.match(reducedMotionStyles, /\.portfolio-site \.code-caret/);
assert.match(reducedMotionStyles, /animation:\s*none/);
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
npm run build
node --test --test-name-pattern="dark technical section|full-width code hero" tests/rendered-html.test.mjs tests/design-contract.test.mjs
```

Expected: FAIL because the old portrait frame remains and the editor/layout classes do not exist.

- [ ] **Step 3: Recompose `Hero.tsx`**

Import `HeroCodeEditor`. Rename `hero-copy` to `hero-copy-panel`, add a fill-positioned decorative `Image` with class `hero-portrait-background` and empty alt text, wrap the existing textual content in `hero-copy-content`, and replace the old `hero-visual`, technical frame, portrait frame, and index with:

```tsx
<div className="hero-code-panel">
  <HeroCodeEditor />
</div>
```

- [ ] **Step 4: Implement layout, editor styling, and responsive rules**

In `app/globals.css`:

- set `.site-header` to `width: 100%`, remove auto margins, and add `padding-inline: clamp(1rem, 3vw, 3rem)`;
- make `.hero` a near-full-width two-column grid with bounded content and a smaller gap;
- style `.hero-copy-panel` as an isolated, overflow-hidden dark panel with a minimum height;
- absolutely fill `.hero-portrait-background`, use `object-fit: cover`, position the face to the right/top, and add a dark gradient overlay through `.hero-copy-panel::after`;
- keep `.hero-copy-content` above the image and constrain text width;
- style the editor shell, toolbar, tab, numbered code list, tokens, status dot, footer chips, and caret;
- at 760px stack the hero, keep both panels bounded, and make code horizontally scrollable;
- in reduced motion disable `.code-caret` animation and all editor transitions.

Delete obsolete `.hero-visual`, `.hero-technical-frame`, `.portrait-frame`, and `.hero-index` rules and their responsive overrides.

- [ ] **Step 5: Verify focused GREEN**

Run:

```powershell
npm run build
node --test tests/rendered-html.test.mjs tests/design-contract.test.mjs
npm run test:unit -- tests/hero-code-editor.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 6: Run full verification and visual QA**

Run:

```powershell
npm test
npm run test:unit
npm run lint
npx tsc --noEmit
```

Inspect `http://localhost:3000` at desktop and mobile widths. Confirm the header touches both viewport edges, the portrait remains legible behind the left copy, the editor types and loops without layout shift, mobile stacks without horizontal page overflow, and reduced motion shows the complete sample.

- [ ] **Step 7: Commit**

```powershell
git add app/components/portfolio/Hero.tsx app/globals.css tests/rendered-html.test.mjs tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-full-width-header-code-hero.md
git commit -m "feat: rebuild hero with realtime code animation"
```
