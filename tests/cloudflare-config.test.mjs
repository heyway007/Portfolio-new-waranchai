import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
