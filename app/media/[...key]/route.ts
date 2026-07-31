import { getRuntimeEnv } from "../../../lib/platform/env.server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, context: RouteContext) {
  const { key: segments } = await context.params;
  if (!segments?.length || segments.some((segment) => segment === "..")) {
    return new Response("Not found", { status: 404 });
  }
  const key = segments.join("/");
  const object = await getRuntimeEnv().PORTFOLIO_ASSETS.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}

