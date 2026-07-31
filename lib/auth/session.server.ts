import {
  buildSessionCookie,
  createSessionToken,
  getSessionToken,
  hashSessionToken,
  SESSION_SECONDS,
} from "./session";
import { ensureDatabase } from "../content/database.server";

export async function createAdminSession(
  db: D1Database,
): Promise<{ cookie: string; expiresAt: number }> {
  await ensureDatabase(db);
  const token = createSessionToken();
  const tokenHash = await hashSessionToken(token);
  const now = Date.now();
  const expiresAt = now + SESSION_SECONDS * 1000;
  await db
    .prepare("DELETE FROM admin_sessions WHERE expires_at <= ?")
    .bind(now)
    .run();
  await db
    .prepare(
      "INSERT INTO admin_sessions (token_hash, expires_at, created_at) VALUES (?, ?, ?)",
    )
    .bind(tokenHash, expiresAt, now)
    .run();
  return { cookie: buildSessionCookie(token), expiresAt };
}

export async function hasAdminSession(
  db: D1Database,
  request: Request,
): Promise<boolean> {
  await ensureDatabase(db);
  const token = getSessionToken(request);
  if (!token) return false;
  const tokenHash = await hashSessionToken(token);
  const now = Date.now();
  const session = await db
    .prepare(
      "SELECT expires_at FROM admin_sessions WHERE token_hash = ? LIMIT 1",
    )
    .bind(tokenHash)
    .first<{ expires_at: number }>();
  if (!session || session.expires_at <= now) {
    await db
      .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .bind(tokenHash)
      .run();
    return false;
  }
  return true;
}

export async function deleteAdminSession(
  db: D1Database,
  request: Request,
): Promise<void> {
  await ensureDatabase(db);
  const token = getSessionToken(request);
  if (!token) return;
  await db
    .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
    .bind(await hashSessionToken(token))
    .run();
}

