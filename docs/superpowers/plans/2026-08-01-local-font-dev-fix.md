# Local Font Development Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Inter and Prompt load from HTTP-served local assets in both `vinext dev` and production builds on Windows.

**Architecture:** Replace `next/font/google` with pinned Fontsource packages processed by Vite. Import Latin Inter plus Latin and Thai Prompt for weights 400, 500, 600, and 700, preserving the CSS stack while removing the obsolete post-build rewriter.

**Tech Stack:** React 19, TypeScript, Vinext 0.0.50, Vite 8, Fontsource 5.3.0, Node test runner

## Global Constraints

- No runtime Google Fonts or CDN dependency.
- Preserve `"Inter", "Prompt", sans-serif` and weights 400, 500, 600, and 700.
- Bundle only Latin Inter and Latin/Thai Prompt subsets.
- Development and production must contain no `.vinext/fonts` filesystem URL.
- Work directly on `main` as authorized by the user.

---

### Task 1: Bundle local font assets

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `tests/design-contract.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `scripts/fix-vinext-font-paths.mjs`

**Interfaces:**
- Consumes: Fontsource CSS entrypoints for Latin Inter and Latin/Thai Prompt.
- Produces: Vite-managed Inter and Prompt WOFF2 assets used by the existing global CSS stack.

- [ ] **Step 1: Write the failing built-output regression**

Add `readdir` to the `node:fs/promises` import in `tests/rendered-html.test.mjs`. Replace the old deployable-font test with:

```js
test("emits self-hosted Thai fonts without filesystem URLs", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /(?:[A-Z]:)?[^"'()]*\.vinext\/fonts/i);
  assert.doesNotMatch(html, /data-vinext-fonts/i);

  const assetDirectory = new URL("../dist/client/assets/", import.meta.url);
  const assetNames = await readdir(assetDirectory);
  const css = (
    await Promise.all(
      assetNames
        .filter((name) => name.endsWith(".css"))
        .map((name) => readFile(new URL(name, assetDirectory), "utf8")),
    )
  ).join("\n");

  assert.match(css, /font-family:\s*["']Prompt["']/i);
  assert.match(css, /U\+0E01-0E5B/i);
  assert.doesNotMatch(css, /(?:[A-Z]:)?[^"'()]*\.vinext\/fonts/i);
  for (const weight of [400, 500, 600, 700]) {
    assert.ok(
      assetNames.some(
        (name) =>
          name.includes("prompt-thai-" + weight + "-normal") &&
          name.endsWith(".woff2"),
      ),
      "missing bundled Prompt Thai " + weight + " font",
    );
  }
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test --test-name-pattern="self-hosted Thai fonts" tests/rendered-html.test.mjs`

Expected: FAIL because the existing build injects `data-vinext-fonts` and has no Fontsource Prompt Thai assets.

- [ ] **Step 3: Install pinned packages**

Run: `npm install @fontsource/inter@5.3.0 @fontsource/prompt@5.3.0`

Expected: both manifests list version `5.3.0`.

- [ ] **Step 4: Replace the root font loader**

Remove `next/font/google` and its constructors from `app/layout.tsx`. Import:

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

Render `<body>{children}</body>` without generated font classes.

- [ ] **Step 5: Remove obsolete rewrite behavior**

Restore the build script to:

```json
"build": "cross-env WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext build"
```

Delete `scripts/fix-vinext-font-paths.mjs`. In `tests/design-contract.test.mjs` keep the behavioral CSS-stack and old-family exclusions, but remove the obsolete CSS-variable assertions.

- [ ] **Step 6: Verify GREEN**

Run:

```powershell
npm run build
node --test --test-name-pattern="self-hosted Thai fonts" tests/rendered-html.test.mjs
npm run test:unit
node --test tests/rendered-html.test.mjs tests/cloudflare-config.test.mjs tests/design-contract.test.mjs tests/remote-bindings.test.mjs
npm run lint
npx tsc --noEmit
```

Expected: all commands exit 0; built Prompt Thai assets exist and no generated filesystem font URL remains.

- [ ] **Step 7: Verify the development server**

Request `http://localhost:3000/`, inspect all linked font CSS, and request one emitted Prompt Thai WOFF2 URL.

Expected: page is 200, no Windows filesystem font path appears, and the font returns 200 with a font content type.

- [ ] **Step 8: Commit**

```powershell
git add app/layout.tsx package.json package-lock.json tests/design-contract.test.mjs tests/rendered-html.test.mjs scripts/fix-vinext-font-paths.mjs docs/superpowers/plans/2026-08-01-local-font-dev-fix.md
git commit -m "fix: serve Thai fonts during local development"
```
