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
