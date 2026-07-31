import { getRuntimeEnv } from "../platform/env.server";
import { hasAdminSession } from "./session.server";

export async function hasPageAdminSession(cookie: string): Promise<boolean> {
  try {
    return await hasAdminSession(
      getRuntimeEnv().DB,
      new Request("https://portfolio.local/admin", {
        headers: cookie ? { cookie } : undefined,
      }),
    );
  } catch {
    return false;
  }
}

