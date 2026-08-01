# Inter and Prompt Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every Portfolio, preview, admin, and login font with the shared `Inter, Prompt, sans-serif` fallback stack.

**Architecture:** Keep the existing Vinext/React structure and change only root font loading plus explicit CSS font-family references. Inter handles Latin glyphs first, Prompt supplies Thai glyphs and the secondary Latin fallback, and browser sans-serif remains the terminal fallback.

**Tech Stack:** TypeScript 5.9, React 19, Vinext/Next 16 font compatibility APIs, CSS, Node test runner, Vitest, Cloudflare Workers, Sites.

## Global Constraints

- Work directly on the existing `main` checkout; the user explicitly declined a worktree.
- Apply the change to the public Portfolio, preview, admin, and admin login.
- Use the exact family order `"Inter", "Prompt", sans-serif` everywhere; keep the generated variables only for loading both families.
- Load Inter and Prompt weights 400, 500, 600, and 700 with `display: "swap"`.
- Load Inter subset `latin`; load Prompt subsets `latin` and `thai`.
- Remove `IBM_Plex_Sans_Thai_Looped`, `Geist_Mono`, `--font-ibm-plex-thai`, and `--font-geist-mono` completely.
- Preserve every existing font size, weight, line height, letter spacing, color, layout, responsive rule, and animation.
- Do not add dependencies or modify content, CMS, D1, R2, authentication, APIs, migrations, or deployment bindings.
- Reuse Sites project `appgprj_6a6c59322d148191bc93325e1b338cba` and public Worker `https://waranchai-portfolio.newforico-9ea.workers.dev/`.

## File Structure

- `tests/design-contract.test.mjs`: executable typography contract proving the approved loaders/variables exist and every old family is absent.
- `app/layout.tsx`: Inter and Prompt loader configuration and body variable classes.
- `app/globals.css`: canonical Inter/Prompt stack for the body and every explicit `font:` shorthand.
- `scripts/fix-vinext-font-paths.mjs`: Windows build hardening that maps Vinext's local font cache paths to deployable asset URLs.

---

### Task 1: Replace all font loading and CSS family references

**Files:**

- Modify: `tests/design-contract.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**

- Consumes: `Inter` and `Prompt` from `next/font/google`.
- Produces: CSS variables `--font-inter` and `--font-prompt` on `<body>`.
- Produces: canonical CSS family list `"Inter", "Prompt", sans-serif`.

- [ ] **Step 1: Write the failing typography contract**

Add this test to `tests/design-contract.test.mjs`:

```js
test("uses only the Inter and Prompt stack across the application", () => {
  const source = `${layout}\n${styles}`;

  assert.match(layout, /\bInter\b/);
  assert.match(layout, /\bPrompt\b/);
  assert.match(layout, /--font-inter/);
  assert.match(layout, /--font-prompt/);
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
      `Unexpected font shorthand: ${rule}`,
    );
  }
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```powershell
node --test --test-name-pattern="Inter and Prompt stack" tests/design-contract.test.mjs
```

Expected: FAIL because `app/layout.tsx` still imports IBM Plex Sans Thai Looped and Geist Mono and CSS still references their variables.

- [ ] **Step 3: Replace the root font loaders**

Change `app/layout.tsx` to:

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Prompt } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
```

Keep the existing `generateMetadata()` function unchanged. Change the body declaration to:

```tsx
<body className={`${inter.variable} ${prompt.variable}`}>
  {children}
</body>
```

- [ ] **Step 4: Replace every CSS family reference**

In `app/globals.css`, change the body rule to:

```css
body {
  font-family: "Inter", "Prompt", sans-serif;
}
```

Mechanically replace every terminal `var(--font-geist-mono)` inside a `font:` shorthand with:

```css
"Inter", "Prompt", sans-serif
```

Do not change the shorthand's weight, size, or line-height. Confirm no old font names or variables remain:

```powershell
rg -n "IBM_Plex|Geist|font-ibm|font-geist" app/layout.tsx app/globals.css
```

Expected: no matches.

- [ ] **Step 5: Run focused and unit verification**

Run:

```powershell
node --test --test-name-pattern="Inter and Prompt stack" tests/design-contract.test.mjs
npm run test:unit
npm run lint
git diff --check
```

Expected: focused contract PASS, all unit tests PASS, lint exit 0, and no whitespace errors.

- [ ] **Step 6: Review the bounded diff and commit**

Run:

```powershell
git diff -- app/layout.tsx app/globals.css tests/design-contract.test.mjs
git status --short
git add -- app/layout.tsx app/globals.css tests/design-contract.test.mjs
git commit -m "Use Inter and Prompt throughout the portfolio"
```

Expected: exactly the three intended files are committed.

---

### Task 2: Verify, push, and deploy the typography change

**Files:**

- Verify: `app/layout.tsx`
- Verify: `app/globals.css`
- Verify: `tests/design-contract.test.mjs`
- Preserve: `.openai/hosting.json`

**Interfaces:**

- Consumes: the committed Inter/Prompt source from Task 1.
- Produces: one verified `main` SHA on GitHub, the public Cloudflare Worker, and the existing Sites project.

- [ ] **Step 1: Run the complete fresh verification gate**

Run:

```powershell
npm run test:unit
npm test
npm run lint
git diff --check
git status -sb
```

Expected: unit, production/render/config/design tests PASS; lint and diff checks exit 0; the worktree is clean.

- [ ] **Step 2: Run browser typography QA**

Start the existing development server in a retained hidden process, open its exact printed local URL, and verify at 1440px and 390px:

- English computed family starts with Inter.
- Thai computed family includes Prompt as its available fallback and Thai glyphs render correctly.
- Portfolio headings, metadata, buttons, project cards, and contact use the shared stack.
- Admin login and admin surfaces use the same stack and remain visually stable.
- No new clipping, unexpected wrapping, or horizontal overflow appears.

Stop the retained development process after QA.

- [ ] **Step 3: Push the verified `main` commit**

Run:

```powershell
git push origin main
git rev-parse HEAD
git rev-parse origin/main
```

Expected: both SHAs are identical.

- [ ] **Step 4: Deploy the public Worker**

Run:

```powershell
npm run deploy:cloudflare
```

Expected: Wrangler deploys the existing `waranchai-portfolio` Worker with D1 `DB`, R2 `PORTFOLIO_ASSETS`, and the existing public URL.

- [ ] **Step 5: Save and deploy the existing Sites project**

- Reuse project ID `appgprj_6a6c59322d148191bc93325e1b338cba`; never call `create_site`.
- Push the exact verified HEAD to the existing Sites source branch with a short-lived per-command credential.
- Package the exact build with `C:/Users/ASUS/.codex/plugins/cache/openai-bundled/sites/0.1.31/scripts/package-site.sh`.
- Save one version with the exact HEAD SHA and archive.
- Deploy the saved version using the existing private/custom access policy and poll until `succeeded` or terminal failure.

- [ ] **Step 6: Verify production assets**

Request the public Worker HTML, emitted CSS asset, and `/og.png`:

```powershell
curl.exe -sS -o NUL -w "%{http_code}" "https://waranchai-portfolio.newforico-9ea.workers.dev/"
curl.exe -sS -o NUL -w "%{http_code}" "https://waranchai-portfolio.newforico-9ea.workers.dev/og.png"
```

Expected: HTTP 200. Fetch the emitted CSS referenced by production HTML and confirm it contains `--font-inter` and `--font-prompt` and contains neither `font-ibm` nor `font-geist`.

- [ ] **Step 7: Report the result**

Return the public Worker URL, private Sites URL, final commit, fresh test counts, and confirmation that Portfolio/admin/login all use Inter with Prompt fallback.
