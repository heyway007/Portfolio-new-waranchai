import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/auth/session.server";
import { getRuntimeEnv } from "../../../../lib/platform/env.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authenticated = await hasAdminSession(getRuntimeEnv().DB, request);
  return NextResponse.json(
    { ok: authenticated },
    { status: authenticated ? 200 : 401 },
  );
}

