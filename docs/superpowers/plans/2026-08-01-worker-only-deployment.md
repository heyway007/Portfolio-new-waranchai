# Worker-Only Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Cloudflare Worker the portfolio's only supported deployment target and prevent GPT Sites publishing from being reintroduced accidentally.

**Architecture:** Remove the Sites project marker that automatically selects the GPT Sites workflow. Keep the existing Wrangler deployment, D1, and R2 configuration unchanged, and enforce the Worker-only contract through the existing Node test suite and active README guidance.

**Tech Stack:** Node.js test runner, npm scripts, Vinext, Wrangler, Cloudflare Workers, D1, R2, GitHub `main`.

## Global Constraints

- The only supported production URL is `https://waranchai-portfolio.newforico-9ea.workers.dev/`.
- Production deployment uses `npm run deploy:cloudflare`.
- Preserve D1 binding `DB` and R2 binding `PORTFOLIO_ASSETS`.
- Do not change portfolio UI, content, authentication, APIs, migrations, or stored data.
- Do not create, save, or deploy a GPT Sites version.
- Work directly on the existing `main` checkout; do not create a worktree.

## File Structure

- `.openai/hosting.json`: remove the GPT Sites project marker completely.
- `README.md`: replace active Sites environment guidance with Worker deployment guidance.
- `tests/cloudflare-config.test.mjs`: executable Worker-only deployment contract.

---

### Task 1: Enforce Worker-Only Deployment

**Files:**

- Delete: `.openai/hosting.json`
- Modify: `README.md`
- Modify: `tests/cloudflare-config.test.mjs`

**Interfaces:**

- Consumes: `package.json` script `deploy:cloudflare` and `wrangler.jsonc` bindings.
- Produces: a repository with no Sites project marker and a test that requires the Worker deployment script.

- [ ] **Step 1: Write the failing Worker-only contract**

Extend `tests/cloudflare-config.test.mjs` with `access` and `readFile` checks:

```js
test("uses Cloudflare Worker as the only deployment target", async () => {
  await assert.rejects(
    access(new URL("../.openai/hosting.json", import.meta.url)),
    (error) => error?.code === "ENOENT",
  );

  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const readme = await readFile(
    new URL("../README.md", import.meta.url),
    "utf8",
  );

  assert.equal(
    packageJson.scripts["deploy:cloudflare"],
    "npm run build && wrangler deploy",
  );
  assert.doesNotMatch(readme, /chatgpt\.site|Sites environment variables/i);
  assert.match(readme, /npm run deploy:cloudflare/);
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```powershell
node --test --test-name-pattern="only deployment target" tests/cloudflare-config.test.mjs
```

Expected: FAIL because `.openai/hosting.json` still exists and README still directs hosted values to Sites.

- [ ] **Step 3: Remove the Sites marker and update active guidance**

Delete `.openai/hosting.json`.

Replace the active README sentence about Sites environment variables with:

```markdown
Deploy production with `npm run deploy:cloudflare`. Configure runtime secrets with Wrangler; D1 `DB` and R2 `PORTFOLIO_ASSETS` remain declared in `wrangler.jsonc`.
```

Keep historical records under `docs/superpowers/` unchanged.

- [ ] **Step 4: Run the focused test and verify the green state**

Run:

```powershell
node --test --test-name-pattern="only deployment target" tests/cloudflare-config.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run repository checks**

Run:

```powershell
npm run test:unit
npm test
npm run lint
git diff --check
```

Expected: 39 unit tests pass, all Node integration/contract tests pass, lint exits 0, and `git diff --check` reports no errors.

- [ ] **Step 6: Commit the Worker-only contract**

```powershell
git add -- README.md tests/cloudflare-config.test.mjs
git add -u -- .openai/hosting.json
git commit -m "Use Cloudflare Worker as the only deployment target"
```

### Task 2: Push and Verify the Worker Release

**Files:**

- Verify: `package.json`
- Verify: `wrangler.jsonc`
- Verify: deployed Worker response

**Interfaces:**

- Consumes: clean verified `main` and `npm run deploy:cloudflare`.
- Produces: updated GitHub `main` and a healthy Worker-only production deployment.

- [ ] **Step 1: Push `main` to GitHub**

```powershell
git push origin main
```

Expected: the Worker-only commit is accepted on `origin/main` without a force push.

- [ ] **Step 2: Deploy only the Cloudflare Worker**

```powershell
npm run deploy:cloudflare
```

Expected: Wrangler reports a successful deployment to
`https://waranchai-portfolio.newforico-9ea.workers.dev/`. Do not call any GPT Sites tools.

- [ ] **Step 3: Verify production reachability and assets**

```powershell
$site = Invoke-WebRequest -Uri 'https://waranchai-portfolio.newforico-9ea.workers.dev/' -UseBasicParsing
$fontPath = [regex]::Match($site.Content, 'url\((/assets/_vinext_fonts/[^)]+\.woff2)\)').Groups[1].Value
$font = Invoke-WebRequest -Uri ([uri]::new([uri]'https://waranchai-portfolio.newforico-9ea.workers.dev/', $fontPath)) -Method Head -UseBasicParsing
$site.StatusCode
$font.StatusCode
```

Expected: both status codes are `200` and the rendered HTML contains no local `.vinext/fonts` path.

- [ ] **Step 4: Run final verification on the pushed tree**

```powershell
npm run test:unit
npm test
npm run lint
git diff --check
git status -sb
```

Expected: all checks pass and status is `## main...origin/main` with no changes.
