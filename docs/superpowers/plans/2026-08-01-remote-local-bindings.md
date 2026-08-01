# Remote Local Bindings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `npm run dev` use the existing remote Cloudflare D1 database and R2 bucket while keeping deployment resource identities unchanged.

**Architecture:** Enable remote development independently on the existing `DB` and `PORTFOLIO_ASSETS` binding declarations in `wrangler.jsonc`. Protect that choice with a source-configuration regression test and document that local CMS actions affect production data immediately.

**Tech Stack:** Wrangler 4.92, Cloudflare Vite plugin 1.37, D1, R2, Vinext, Node.js test runner, JSONC, Markdown

## Global Constraints

- Use per-binding `remote: true`; do not enable the Vite plugin's global `remoteBindings` option.
- Preserve the binding names `DB` and `PORTFOLIO_ASSETS`.
- Preserve the existing D1 database name, database ID, migration directory, and R2 bucket name.
- Keep local administrator credentials in ignored `.dev.vars`.
- Do not issue write requests or mutate production data during verification.
- Production builds and deployments must continue to use the existing resources.
- Preserve the pre-existing uncommitted changes in `tests/cloudflare-config.test.mjs`.

---

### Task 1: Enable and Verify Remote Development Bindings

**Files:**
- Create: `tests/remote-bindings.test.mjs`
- Modify: `package.json`
- Modify: `wrangler.jsonc`
- Modify: `README.md`

**Interfaces:**
- Consumes: Wrangler binding objects named `DB` and `PORTFOLIO_ASSETS`.
- Produces: `DB.remote === true` and `PORTFOLIO_ASSETS.remote === true` for local development; an explicit warning in the local-development documentation.

- [ ] **Step 1: Write the failing source-configuration test**

Create `tests/remote-bindings.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceConfig = JSON.parse(
  await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
);

test("local development uses the remote D1 and R2 resources", () => {
  const database = sourceConfig.d1_databases.find(
    ({ binding }) => binding === "DB",
  );
  const bucket = sourceConfig.r2_buckets.find(
    ({ binding }) => binding === "PORTFOLIO_ASSETS",
  );

  assert.equal(database?.remote, true);
  assert.equal(bucket?.remote, true);
});
```

Append the new test file to the existing `test` script in `package.json` so it
remains part of normal build verification:

```json
"test": "npm run build && node --test tests/rendered-html.test.mjs tests/cloudflare-config.test.mjs tests/design-contract.test.mjs tests/remote-bindings.test.mjs"
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/remote-bindings.test.mjs
```

Expected: FAIL in `local development uses the remote D1 and R2 resources` because both `remote` properties are currently absent.

- [ ] **Step 3: Enable each remote binding explicitly**

Update the D1 binding in `wrangler.jsonc` without changing its existing values:

```json
{
  "binding": "DB",
  "database_name": "waranchai-portfolio-db",
  "database_id": "683ef44d-3fa3-414e-9a26-45029b473811",
  "migrations_dir": "drizzle",
  "remote": true
}
```

Update the R2 binding in the same file:

```json
{
  "binding": "PORTFOLIO_ASSETS",
  "bucket_name": "waranchai-portfolio-assets",
  "remote": true
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/remote-bindings.test.mjs
```

Expected: PASS for all configuration tests.

- [ ] **Step 5: Document the production-data behavior**

Insert this warning after the `npm run dev` command block in `README.md`:

```markdown
> **Remote development data:** `npm run dev` connects the `DB` and
> `PORTFOLIO_ASSETS` bindings to the production D1 database and R2 bucket.
> Changes made through the local CMS, including uploads and deletions, take
> effect on the deployed site's data immediately. Use
> `npm run db:migrate:remote` for schema migrations.
```

- [ ] **Step 6: Run complete static and build verification**

Run:

```powershell
npm run test:unit
npm run build
node --test tests/remote-bindings.test.mjs
npm run lint
npx tsc --noEmit
npx wrangler deploy --dry-run
```

Expected: every command exits with code 0. The dry run validates the Wrangler configuration without deploying or writing application data. Run the complete `npm test` only if the pre-existing uncommitted `tests/cloudflare-config.test.mjs` work is in a passing state; otherwise report that unrelated failure without modifying that file.

- [ ] **Step 7: Smoke-test remote binding startup without application requests**

Run `npm run dev`, wait for the Cloudflare/Vite ready message, confirm its startup output identifies `DB` and `PORTFOLIO_ASSETS` as remote bindings, and then stop the process without opening a page or sending an HTTP request.

Expected: the development server starts without a binding or authentication error; no application request is sent and no production data is changed.

- [ ] **Step 8: Review the final diff and commit**

Run:

```powershell
git diff --check
Get-Content tests\remote-bindings.test.mjs
git diff -- package.json wrangler.jsonc README.md
git status --short
```

Expected: the four planned implementation files contain only the remote-binding change, `git diff --check` reports no whitespace errors, and the pre-existing `tests/cloudflare-config.test.mjs` change is preserved separately.

Commit:

```powershell
git add -- tests/remote-bindings.test.mjs package.json wrangler.jsonc README.md
git commit -m "dev: use remote Cloudflare data bindings"
```
