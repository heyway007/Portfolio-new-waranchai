import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(path, "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders Waranchai's portfolio identity and public sections", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Waranchai Pungwattananukul/i);
  assert.match(html, /Full-Stack Web Developer/i);
  assert.match(html, /id="work"/i);
  assert.match(html, /id="experience"/i);
  assert.match(html, /id="skills"/i);
  assert.match(html, /id="contact"/i);
});

test("does not ship the starter preview", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.doesNotMatch(
    html,
    /codex-preview|Building your site|react-loading-skeleton/i,
  );
});

test("redirects anonymous admin and preview requests to login", async () => {
  for (const path of ["/admin", "/preview"]) {
    const response = await render(path);
    assert.ok([302, 303, 307, 308].includes(response.status));
    assert.match(response.headers.get("location") ?? "", /\/admin\/login/);
  }
});
