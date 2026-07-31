import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/auth/session.server";
import { getRuntimeEnv } from "../../../../lib/platform/env.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = getRuntimeEnv().DB;
  const authenticated = db ? await hasAdminSession(db, request) : false;
  return NextResponse.json(
    { ok: authenticated },
    { status: authenticated ? 200 : 401 },
  );
}
