import { hashSessionToken } from "./session";
import { ensureDatabase } from "../content/database.server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function loginAttemptKey(
  request: Request,
  email: string,
): Promise<string> {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "local";
  return hashSessionToken(`${email.trim().toLowerCase()}|${ip}`);
}

export async function isLoginLimited(
  db: D1Database,
  key: string,
): Promise<boolean> {
  await ensureDatabase(db);
  const row = await db
    .prepare(
      "SELECT count, window_started_at FROM login_attempts WHERE attempt_key = ? LIMIT 1",
    )
    .bind(key)
    .first<{ count: number; window_started_at: number }>();
  if (!row) return false;
  if (Date.now() - row.window_started_at >= WINDOW_MS) {
    await db
      .prepare("DELETE FROM login_attempts WHERE attempt_key = ?")
      .bind(key)
      .run();
    return false;
  }
  return row.count >= MAX_ATTEMPTS;
}

export async function recordFailedLogin(
  db: D1Database,
  key: string,
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO login_attempts (attempt_key, count, window_started_at, updated_at)
       VALUES (?, 1, ?, ?)
       ON CONFLICT(attempt_key) DO UPDATE SET
         count = CASE
           WHEN ? - window_started_at >= ? THEN 1
           ELSE count + 1
         END,
         window_started_at = CASE
           WHEN ? - window_started_at >= ? THEN ?
           ELSE window_started_at
         END,
         updated_at = ?`,
    )
    .bind(key, now, now, now, WINDOW_MS, now, WINDOW_MS, now, now)
    .run();
}

export async function clearLoginAttempts(
  db: D1Database,
  key: string,
): Promise<void> {
  await db
    .prepare("DELETE FROM login_attempts WHERE attempt_key = ?")
    .bind(key)
    .run();
}

