# Local Font Development Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Inter and Prompt load from HTTP-served local assets in both `vinext dev` and production builds on Windows.

**Architecture:** Replace `next/font/google` with pinned Fontsource packages whose CSS and WOFF2 files are processed by Vite. Import Latin Inter plus Latin and Thai Prompt faces for weights 400, 500, 600, and 700 from the root layout, preserving the existing CSS font stack while removing the obsolete post-build path rewriter.

**Tech Stack:** React 19, TypeScript, Vinext 0.0.50, Vite 8, Fontsource 5.3.0, Node test runner

## Global Constraints

- No runtime Google Fonts or CDN dependency.
- Preserve the CSS stack `"Inter", "Prompt", sans-serif` and weights 400, 500, 600, and 700.
- Bundle only Latin Inter and Latin/Thai Prompt subsets.
- Development and production output must contain no `.vinext/fonts` filesystem URL.
- Work directly on `main` as previously authorized by the user.

---

### Task 1: Replace Vinext-generated font URLs with bundled Fontsource assets

**Files:**
- Modify: `tests/design-contract.test.mjs`
- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `scripts/fix-vinext-font-paths.mjs`

**Interfaces:**
- Consumes: Fontsource CSS entrypoints `@fontsource/inter/latin-{weight}.css`, `@fontsource/prompt/latin-{weight}.css`, and `@fontsource/prompt/thai-{weight}.css` for weights 400, 500, 600, and 700.
- Produces: Global `Inter` and `Prompt` declarations emitted as Vite-managed HTTP assets and used by the existing CSS stack.

- [ ] **Step 1: Write the failing source contract test**

Replace the font setup assertions in `tests/design-contract.test.mjs` with assertions that reject `next/font/google` and require every selected Fontsource entrypoint:

```js
test("uses bundled Inter and Prompt assets across the application", () => {
  const source = `\${layout}\n\${styles}`;

  assert.doesNotMatch(layout, /next\/font\/google/);
  for (const weight of [400, 500, 600, 700]) {
    assert.match(layout, new RegExp(`@fontsource/inter/latin-\${weight}\\.css`));
    assert.match(layout, new RegExp(`@fontsource/prompt/latin-\${weight}\\.css`));
    assert.match(layout, new RegExp(`@fontsource/prompt/thai-\${weight}\\.css`));
  }
  assert.doesNotMatch(source, /--font-inter|--font-prompt/);
  assert.doesNotMatch(
    source,
    /IBM_Plex_Sans_Thai_Looped|Geist_Mono|--font-ibm-plex-thai|--font-geist-mono/,
  );
  assert.match(
    styles,
    /font-family:\s*["']Inter["'],\s*["']Prompt["'],\s*sans-serif;/,
  );

  const explicitFontRules = styles.match(/font:\s*[^;]+;/g) ?? [];
  for (const rule of explicitFontRules) {
    if (rule === "font: inherit;") continue;
    assert.match(
      rule,
      /["']Inter["'],\s*["']Prompt["'],\s*sans-serif/,
      `Unexpected font shorthand: \${rule}`,
    );
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/design-contract.test.mjs`

Expected: FAIL because `app/layout.tsx` still imports `next/font/google` and does not import Fontsource CSS.

- [ ] **Step 3: Update the production-render regression**

Change `renders deployable self-hosted font URLs` in `tests/rendered-html.test.mjs` so it verifies no generated filesystem font path is emitted:

```js
test("renders without generated filesystem font URLs", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /(?:[A-Z]:)?[^"'()]*\.vinext\/fonts/i);
  assert.doesNotMatch(html, /data-vinext-fonts/i);
});
```

- [ ] **Step 4: Install the pinned local font packages**

Run: `npm install @fontsource/inter@5.3.0 @fontsource/prompt@5.3.0`

Expected: `package.json` and `package-lock.json` list both packages at version `5.3.0`.

- [ ] **Step 5: Replace the root font loader**

In `app/layout.tsx`, remove the `next/font/google` import, both font constructor calls, and the generated body classes. Add these imports before `./globals.css`:

```tsx
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/prompt/latin-400.css";
import "@fontsource/prompt/latin-500.css";
import "@fontsource/prompt/latin-600.css";
import "@fontsource/prompt/latin-700.css";
import "@fontsource/prompt/thai-400.css";
import "@fontsource/prompt/thai-500.css";
import "@fontsource/prompt/thai-600.css";
import "@fontsource/prompt/thai-700.css";
import "./globals.css";
```

Render the body without a generated class:

```tsx
<body>{children}</body>
```

- [ ] **Step 6: Remove the obsolete production rewrite**

Set the build script in `package.json` to:

```json
"build": "cross-env WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext build"
```

Delete `scripts/fix-vinext-font-paths.mjs`, because no `next/font` output remains to rewrite.

- [ ] **Step 7: Verify GREEN with focused and full checks**

Run:

```powershell
node --test tests/design-contract.test.mjs
npm run test:unit
npm run build
node --test tests/rendered-html.test.mjs tests/cloudflare-config.test.mjs tests/design-contract.test.mjs tests/remote-bindings.test.mjs
npm run lint
npx tsc --noEmit
```

Expected: every command exits 0. The build CSS contains Fontsource WOFF2 asset URLs and the rendered HTML contains no `.vinext/fonts` or `data-vinext-fonts` declaration.

- [ ] **Step 8: Verify the running development server**

Request `http://localhost:3000/`, extract the linked CSS asset URLs, and request at least one emitted Prompt Thai WOFF2 URL.

Expected: page response is 200, no Windows filesystem font path appears, and the Prompt Thai WOFF2 response is 200 with a font content type.

- [ ] **Step 9: Commit**

```powershell
git add app/layout.tsx package.json package-lock.json tests/design-contract.test.mjs tests/rendered-html.test.mjs scripts/fix-vinext-font-paths.mjs docs/superpowers/plans/2026-08-01-local-font-dev-fix.md
git commit -m "fix: serve Thai fonts during local development"
```


