import { beforeEach, describe, expect, it } from "vitest";
import { POST as createEntryRoute } from "../app/api/admin/entries/route";
import { POST as reorderRoute } from "../app/api/admin/reorder/route";
import { POST as uploadRoute } from "../app/api/admin/assets/route";
import { ensureSeedData } from "../lib/content/database.server";
import { setRuntimeEnv } from "../lib/platform/env.server";

class RouteStatement {
  constructor(
    private database: RouteD1,
    public sql: string,
    public values: unknown[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new RouteStatement(this.database, this.sql, values);
  }

  async first<T>(): Promise<T | null> {
    if (this.sql.includes("SELECT expires_at FROM admin_sessions")) {
      return { expires_at: Date.now() + 60_000 } as T;
    }
    if (this.sql.includes("SELECT id FROM site_settings")) {
      return (this.database.hasSettings ? { id: "primary" } : null) as T | null;
    }
    return null;
  }

  async all<T>() {
    if (this.sql.includes("SELECT id FROM content_entries WHERE type")) {
      return { results: [{ id: "p1" }, { id: "p2" }] as T[] };
    }
    return { results: [] as T[] };
  }

  async run() {
    if (this.sql.includes("INSERT") && this.sql.includes("content_entries")) {
      this.database.createdEntries.push(JSON.parse(String(this.values[3])));
    }
    if (this.sql.includes("INSERT OR IGNORE INTO site_settings")) {
      this.database.hasSettings = true;
    }
    if (this.sql.includes("UPDATE content_entries SET sort_order")) {
      this.database.reorders.push({
        order: Number(this.values[0]),
        id: String(this.values[2]),
      });
    }
    if (this.sql.includes("INSERT INTO assets") && this.database.failAssetInsert) {
      throw new Error("asset metadata failure");
    }
    return { meta: { changes: 1 } };
  }
}

class RouteD1 {
  createdEntries: Record<string, unknown>[] = [];
  reorders: { order: number; id: string }[] = [];
  failAssetInsert = false;
  hasSettings = true;

  prepare(sql: string) {
    return new RouteStatement(this, sql);
  }

  async batch(statements: RouteStatement[]) {
    return Promise.all(statements.map((statement) => statement.run()));
  }
}

class RouteR2 {
  deleted: string[] = [];

  async put() {}

  async delete(key: string) {
    this.deleted.push(key);
  }
}

function authenticatedJsonRequest(path: string, body: unknown) {
  return new Request(`https://portfolio.test${path}`, {
    method: "POST",
    headers: {
      cookie: "portfolio_admin_session=route-test-token",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

let db: RouteD1;
let bucket: RouteR2;

beforeEach(() => {
  db = new RouteD1();
  bucket = new RouteR2();
  setRuntimeEnv({
    DB: db as unknown as D1Database,
    PORTFOLIO_ASSETS: bucket as unknown as R2Bucket,
  });
});

describe("admin route authorization and persistence", () => {
  it("rejects an unauthenticated content mutation", async () => {
    const response = await createEntryRoute(
      new Request("https://portfolio.test/api/admin/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "project" }),
      }),
    );
    expect(response.status).toBe(401);
    expect(db.createdEntries).toHaveLength(0);
  });

  it("creates a validated draft and normalizes its URL", async () => {
    const response = await createEntryRoute(
      authenticatedJsonRequest("/api/admin/entries", {
        id: "",
        type: "project",
        slug: "route-draft",
        title: { en: "Route draft", th: "ทดสอบเส้นทาง" },
        summary: { en: "Draft summary", th: "สรุปร่าง" },
        body: { en: "", th: "" },
        role: { en: "Developer", th: "นักพัฒนา" },
        technologies: ["TypeScript"],
        liveUrl: "   ",
        coverImage: "",
        imageAlt: { en: "", th: "" },
        supportingImages: [],
        featured: false,
        status: "draft",
        sortOrder: 0,
      }),
    );
    expect(response.status).toBe(201);
    const result = (await response.json()) as {
      value: { liveUrl: string };
    };
    expect(result.value.liveUrl).toBe("");
    expect(db.createdEntries).toHaveLength(1);
  });

  it("applies a complete authenticated reorder in one batch", async () => {
    const response = await reorderRoute(
      authenticatedJsonRequest("/api/admin/reorder", {
        type: "project",
        orderedIds: ["p2", "p1"],
      }),
    );
    expect(response.status).toBe(200);
    expect(db.reorders).toEqual([
      { order: 0, id: "p2" },
      { order: 1, id: "p1" },
    ]);
  });

  it("deletes the R2 object when asset metadata persistence fails", async () => {
    db.failAssetInsert = true;
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const view = new DataView(png.buffer);
    view.setUint32(16, 800);
    view.setUint32(20, 600);
    const form = new FormData();
    form.set("file", new File([png], "test.png", { type: "image/png" }));
    form.set("altEn", "Test image");
    form.set("altTh", "ภาพทดสอบ");
    const response = await uploadRoute(
      new Request("https://portfolio.test/api/admin/assets", {
        method: "POST",
        headers: { cookie: "portfolio_admin_session=route-test-token" },
        body: form,
      }),
    );
    expect(response.status).toBe(503);
    expect(bucket.deleted).toHaveLength(1);
    expect(bucket.deleted[0]).toMatch(/^portfolio\/.+\.png$/);
  });

  it("initializes the complete portfolio seed in an empty database", async () => {
    db.hasSettings = false;
    await ensureSeedData(db as unknown as D1Database);
    expect(db.hasSettings).toBe(true);
    expect(db.createdEntries).toHaveLength(21);
  });
});
