import assert from "node:assert/strict";
import test from "node:test";
import { defaultPortfolio } from "../lib/content/default-portfolio.ts";

class FakeStatement {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new FakeStatement(this.database, this.sql, values);
  }

  async first() {
    if (this.sql.includes("SELECT id FROM site_settings")) {
      return { id: "primary" };
    }
    if (this.sql.includes("SELECT payload FROM site_settings")) {
      return { payload: JSON.stringify(this.database.settings) };
    }
    return null;
  }

  async all() {
    if (!this.sql.includes("FROM content_entries")) return { results: [] };
    const includeDrafts = !this.sql.includes("WHERE status = ?");
    return {
      results: this.database.entries.filter(
        (entry) => includeDrafts || entry.status === this.values[0],
      ),
    };
  }

  async run() {
    return { meta: { changes: 0 } };
  }
}

class FakeD1 {
  constructor(settings, entries) {
    this.settings = settings;
    this.entries = entries;
  }

  prepare(sql) {
    return new FakeStatement(this, sql);
  }

  async batch(statements) {
    return Promise.all(statements.map((statement) => statement.run()));
  }
}

function portfolioDbWithDraft(hiddenProjectId) {
  const entries = [
    ...defaultPortfolio.experience,
    ...defaultPortfolio.education,
    ...defaultPortfolio.skillGroups,
    ...defaultPortfolio.projects,
  ].map((entry) => {
    const status = entry.id === hiddenProjectId ? "draft" : entry.status;
    return {
      id: entry.id,
      type: entry.type,
      payload: JSON.stringify({ ...entry, status }),
      status,
      sort_order: entry.sortOrder,
    };
  });
  return new FakeD1(defaultPortfolio.settings, entries);
}

async function render(path = "/", bindings = {}) {
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
      ...bindings,
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

test("server HTML and public JSON exclude draft projects from D1", async () => {
  const DB = portfolioDbWithDraft("project-warehouse");
  const htmlResponse = await render("/", { DB });
  assert.equal(htmlResponse.status, 200);
  const html = await htmlResponse.text();
  assert.doesNotMatch(html, /Warehouse Management System/i);
  assert.match(html, /Style Bangkok/i);

  const jsonResponse = await render("/api/portfolio", { DB });
  assert.equal(jsonResponse.status, 200);
  const result = await jsonResponse.json();
  assert.equal(
    result.data.projects.some((project) => project.id === "project-warehouse"),
    false,
  );
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
