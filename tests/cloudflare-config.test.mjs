import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(
  await readFile(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"),
);

test("production build emits one D1 binding per name", () => {
  const bindings = config.d1_databases.map(({ binding }) => binding);

  assert.equal(bindings.length, new Set(bindings).size);
  assert.deepEqual(bindings, ["DB"]);
});

test("production build emits one R2 binding per name", () => {
  const bindings = config.r2_buckets.map(({ binding }) => binding);

  assert.equal(bindings.length, new Set(bindings).size);
  assert.deepEqual(bindings, ["PORTFOLIO_ASSETS"]);
});

test("static assets bypass the Worker before dynamic route fallback", () => {
  assert.equal(config.assets.run_worker_first, false);
});

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
