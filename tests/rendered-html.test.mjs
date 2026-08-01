import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
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

async function render(path = "/", bindings = {}, requestHeaders = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(path, "http://localhost"), {
      headers: { accept: "text/html", ...requestHeaders },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
      DB: portfolioDbWithDraft(""),
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
  assert.match(html, /class="portfolio-site"/i);
  assert.match(html, /class="hero-technical-frame"/i);
  assert.match(html, /class="about-metrics"/i);
  assert.match(html, />10<.*Years of experience/is);
  assert.match(html, />22<.*Skills/is);
  assert.match(html, /data-reveal/i);
  assert.match(html, /id="work"/i);
  assert.match(html, /id="experience"/i);
  assert.match(html, /id="skills"/i);
  assert.match(html, /id="contact"/i);
});

test("renders deployable self-hosted font URLs", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /url\(\/assets\/_vinext_fonts\//i);
  assert.doesNotMatch(html, /(?:[A-Z]:)?[^"'()]*\.vinext\/fonts/i);
});

test("renders host-aware social metadata from the root layout", async () => {
  const response = await render(
    "/admin/login",
    {},
    {
      "x-forwarded-host": "portfolio.example",
      "x-forwarded-proto": "https",
    },
  );
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(
    html,
    /property="og:image" content="https:\/\/portfolio\.example\/og\.png"/i,
  );
  assert.match(
    html,
    /name="twitter:image" content="https:\/\/portfolio\.example\/og\.png"/i,
  );
  assert.match(
    html,
    /name="twitter:card" content="summary_large_image"/i,
  );
});

test("ships a 1200 by 630 social preview PNG", async () => {
  const png = await readFile(new URL("../public/og.png", import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  assert.equal(png.toString("ascii", 12, 16), "IHDR");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});

test("renders the dark technical section structure without fake controls", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.match(html, /class="projects-grid"/i);
  assert.match(html, /class="timeline-track"/i);
  assert.match(html, /class="journey-summary"/i);
  assert.match(html, /class="skills-grid"/i);
  assert.match(html, /class="contact-layout"/i);
  assert.doesNotMatch(html, /<form[^>]*class="contact/i);
});

test("renders every skill as a local icon with its name below", async () => {
  const response = await render("/");
  const html = await response.text();
  const skillItems = html.match(/class="skill-item"/g) ?? [];

  assert.equal(skillItems.length, 22);
  assert.match(html, /src="\/icons\/skills\/php\.svg"/i);
  assert.match(html, /src="\/icons\/skills\/google-search-console\.svg"/i);
  assert.match(html, /class="skill-name"[^>]*>PHP</i);
  assert.match(html, /class="skill-name"[^>]*>Search Console</i);
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

test("fails closed when the public database binding is missing", async () => {
  const response = await render("/api/portfolio", { DB: undefined });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("applies the packaged asset dimension migration to the initial schema", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    for (const migration of [
      "0000_brainy_valeria_richards.sql",
      "0001_condemned_susan_delgado.sql",
    ]) {
      const sql = await readFile(
        new URL(`../drizzle/${migration}`, import.meta.url),
        "utf8",
      );
      database.exec(sql.replaceAll("--> statement-breakpoint", ""));
    }
    const columns = database.prepare("PRAGMA table_info(assets)").all();
    assert.ok(columns.some((column) => column.name === "width"));
    assert.ok(columns.some((column) => column.name === "height"));
  } finally {
    database.close();
  }
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
