import { getRuntimeEnv } from "../platform/env.server";
import { hasAdminSession } from "./session.server";

export async function requireAdmin(request: Request): Promise<D1Database> {
  const { DB } = getRuntimeEnv();
  if (!DB) {
    throw new Response("Storage unavailable", { status: 503 });
  }
  if (!(await hasAdminSession(DB, request))) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return DB;
}
