import { getRuntimeEnv } from "../platform/env.server";
import { hasAdminSession } from "./session.server";

export async function hasPageAdminSession(cookie: string): Promise<boolean> {
  try {
    const db = getRuntimeEnv().DB;
    if (!db) return false;
    return await hasAdminSession(
      db,
      new Request("https://portfolio.local/admin", {
        headers: cookie ? { cookie } : undefined,
      }),
    );
  } catch {
    return false;
  }
}
