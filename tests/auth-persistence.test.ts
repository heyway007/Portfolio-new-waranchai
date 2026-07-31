import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearLoginAttempts,
  isLoginLimited,
  recordFailedLogin,
} from "../lib/auth/rate-limit.server";
import {
  createAdminSession,
  deleteAdminSession,
  hasAdminSession,
} from "../lib/auth/session.server";
import { getSessionToken } from "../lib/auth/session";

class MemoryStatement {
  constructor(
    private database: MemoryD1,
    private sql: string,
    private values: unknown[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new MemoryStatement(this.database, this.sql, values);
  }

  async first<T>(): Promise<T | null> {
    if (this.sql.includes("SELECT expires_at FROM admin_sessions")) {
      const expiresAt = this.database.sessions.get(String(this.values[0]));
      return (expiresAt === undefined ? null : { expires_at: expiresAt }) as T | null;
    }
    if (this.sql.includes("SELECT count, window_started_at FROM login_attempts")) {
      return (this.database.attempts.get(String(this.values[0])) ?? null) as T | null;
    }
    return null;
  }

  async all<T>() {
    return {
      results: [
        { name: "width" },
        { name: "height" },
      ] as T[],
    };
  }

  async run() {
    if (this.sql.includes("INSERT INTO admin_sessions")) {
      this.database.sessions.set(
        String(this.values[0]),
        Number(this.values[1]),
      );
    } else if (
      this.sql.includes("DELETE FROM admin_sessions WHERE expires_at")
    ) {
      const now = Number(this.values[0]);
      for (const [key, expiresAt] of this.database.sessions) {
        if (expiresAt <= now) this.database.sessions.delete(key);
      }
    } else if (
      this.sql.includes("DELETE FROM admin_sessions WHERE token_hash")
    ) {
      this.database.sessions.delete(String(this.values[0]));
    } else if (this.sql.includes("INSERT INTO login_attempts")) {
      const key = String(this.values[0]);
      const now = Number(this.values[1]);
      const existing = this.database.attempts.get(key);
      this.database.attempts.set(key, {
        count: existing ? existing.count + 1 : 1,
        window_started_at: existing?.window_started_at ?? now,
      });
    } else if (this.sql.includes("DELETE FROM login_attempts")) {
      this.database.attempts.delete(String(this.values[0]));
    }
    return { meta: { changes: 1 } };
  }
}

class MemoryD1 {
  sessions = new Map<string, number>();
  attempts = new Map<string, { count: number; window_started_at: number }>();

  prepare(sql: string) {
    return new MemoryStatement(this, sql);
  }

  async batch(statements: MemoryStatement[]) {
    return Promise.all(statements.map((statement) => statement.run()));
  }
}

afterEach(() => vi.restoreAllMocks());

describe("durable admin authentication", () => {
  it("expires and deletes an old session", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const db = new MemoryD1();
    const created = await createAdminSession(db as unknown as D1Database);
    const token = getSessionToken(
      new Request("https://example.com", {
        headers: { cookie: created.cookie.split(";")[0] },
      }),
    );
    expect(token).toBeTruthy();

    now.mockReturnValue(created.expiresAt + 1);
    const request = new Request("https://example.com/admin", {
      headers: { cookie: `portfolio_admin_session=${token}` },
    });
    await expect(
      hasAdminSession(db as unknown as D1Database, request),
    ).resolves.toBe(false);
    expect(db.sessions.size).toBe(0);
  });

  it("invalidates a session on logout", async () => {
    const db = new MemoryD1();
    const created = await createAdminSession(db as unknown as D1Database);
    const request = new Request("https://example.com/admin", {
      headers: { cookie: created.cookie.split(";")[0] },
    });
    await deleteAdminSession(db as unknown as D1Database, request);
    await expect(
      hasAdminSession(db as unknown as D1Database, request),
    ).resolves.toBe(false);
  });

  it("limits five failures in one window and clears after success", async () => {
    const db = new MemoryD1();
    const key = "email-and-ip-hash";
    for (let count = 0; count < 5; count += 1) {
      await recordFailedLogin(db as unknown as D1Database, key);
    }
    await expect(
      isLoginLimited(db as unknown as D1Database, key),
    ).resolves.toBe(true);
    await clearLoginAttempts(db as unknown as D1Database, key);
    await expect(
      isLoginLimited(db as unknown as D1Database, key),
    ).resolves.toBe(false);
  });
});
