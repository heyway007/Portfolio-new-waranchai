# Hero Contact Action and Warm Graphite Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Hero contact action navigate to the Contact section and brighten the public portfolio with the approved Warm Graphite gradient.

**Architecture:** Keep navigation declarative by changing the existing secondary Hero anchor to `#contact`, relying on native fragment behavior and the existing smooth/reduced-motion CSS. Replace only the `.portfolio-site` background layers so Admin and global document styling remain untouched.

**Tech Stack:** React 19, TypeScript, Vinext, CSS, Node test runner

## Global Constraints

- Preserve the localized `settings.copy.heroContactAction` label.
- Keep the Contact section's existing unique `id="contact"` as the navigation target.
- Apply Warm Graphite only to `.portfolio-site`; do not change Admin styling or global paper/ink tokens.
- Use the approved gradient colors `#1c2229`, `#11161c`, and `#202832` with restrained orange and slate-blue radial glows.
- Do not add JavaScript scrolling, new animations, CMS fields, dependencies, or breakpoint overrides.
- Work directly on `main` as explicitly authorized.

---

### Task 1: Hero contact navigation and Warm Graphite background

**Files:**
- Modify: `tests/design-contract.test.mjs`
- Modify: `app/components/portfolio/Hero.tsx`
- Modify: `app/globals.css`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: the existing Contact target `id="contact"` and global smooth/reduced-motion behavior.
- Produces: a localized Hero anchor with `href="#contact"` and the approved `.portfolio-site` gradient.

- [ ] **Step 1: Write the failing design contract**

Read `Hero.tsx` at the top of `tests/design-contract.test.mjs`:

```js
const heroSource = await readFile(
  new URL("../app/components/portfolio/Hero.tsx", import.meta.url),
  "utf8",
);
```

Add this test after the existing Hero layout contract:

```js
test("links the Hero contact action to the Warm Graphite Contact flow", () => {
  assert.match(
    heroSource,
    /className="button button-quiet"[\s\S]*?href="#contact"/,
  );
  assert.doesNotMatch(heroSource, /mailto:/);
  assert.match(
    styles,
    /\.portfolio-site\s*{[^}]*background:\s*radial-gradient\(circle at 16% 18%,\s*rgb\(255 138 0 \/ 18%\),\s*transparent 36%\),\s*radial-gradient\(circle at 86% 72%,\s*rgb\(98 124 154 \/ 22%\),\s*transparent 43%\),\s*linear-gradient\(135deg,\s*#1c2229 0%,\s*#11161c 55%,\s*#202832 100%\)/,
  );
});
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --test --test-name-pattern="Warm Graphite Contact flow" tests/design-contract.test.mjs
```

Expected: FAIL because `Hero.tsx` still uses `mailto:` and `.portfolio-site` still uses the old dark background.

- [ ] **Step 3: Implement the native Contact anchor**

Replace the secondary Hero action in `Hero.tsx` with:

```tsx
<a className="button button-quiet" href="#contact">
  {localize(settings.copy.heroContactAction, language)}
</a>
```

Do not change the localized label or the email link inside `Contact.tsx`.

- [ ] **Step 4: Implement the approved Warm Graphite gradient**

Replace only the `.portfolio-site` background declaration in `app/globals.css` with:

```css
background:
  radial-gradient(circle at 16% 18%, rgb(255 138 0 / 18%), transparent 36%),
  radial-gradient(circle at 86% 72%, rgb(98 124 154 / 22%), transparent 43%),
  linear-gradient(135deg, #1c2229 0%, #11161c 55%, #202832 100%);
```

Add `/.superpowers/` to `.gitignore` under the misc section so local Visual Companion artifacts do not enter source control.

- [ ] **Step 5: Verify focused GREEN**

Run:

```powershell
node --test --test-name-pattern="Warm Graphite Contact flow" tests/design-contract.test.mjs
node --test tests/design-contract.test.mjs
```

Expected: the focused contract and every design contract pass.

- [ ] **Step 6: Run full verification**

Run:

```powershell
npm test
npm run test:unit
npm run lint
npx tsc --noEmit
```

Expected: build, integration tests, unit tests, lint, and TypeScript all pass.

- [ ] **Step 7: Commit the implementation**

```powershell
git add .gitignore app/components/portfolio/Hero.tsx app/globals.css tests/design-contract.test.mjs docs/superpowers/plans/2026-08-01-hero-contact-warm-gradient.md
git commit -m "style: brighten portfolio and link Hero contact"
```
