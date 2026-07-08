import { NextRequest, NextResponse } from "next/server";

/**
 * Dev-only proxy: forwards `/api/dashboard/data` to the dashboard-api
 * mini-service on port 3030.
 *
 * WHY: In the dev sandbox the app is normally served through the Caddy
 * gateway on port 81, which inspects the `?XTransformPort=3030` query
 * param and reverse-proxies to the mini-service. But when the page is
 * accessed directly on port 3000 (e.g. agent-browser QA, local dev), the
 * browser's relative `/api/...` fetch hits Next.js itself — which has no
 * matching route and returns 404. This route handler bridges that gap by
 * proxying the request server-side to the mini-service.
 *
 * On the production GitHub Pages deploy this file is irrelevant — the
 * site is statically exported and the dashboard runs in read-only fallback
 * mode (the baked-in JSON data is used).
 *
 * Note: `output: export` is disabled in dev (see next.config.ts), so these
 * route handlers are active. In the production build config the static
 * export simply ignores dynamic routes.
 */

const MINI_SERVICE_URL = "http://localhost:3030";

async function proxy(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const target = new URL(
    `${MINI_SERVICE_URL}${url.pathname}${url.search.replace(/&?XTransformPort=\d+/, "")}`
  );
  // Strip the XTransformPort query param (the mini-service doesn't expect it).
  target.searchParams.delete("XTransformPort");

  const headers = new Headers();
  // Forward only safe headers.
  const passthrough = ["content-type", "x-dashboard-password"];
  passthrough.forEach((h) => {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  });

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
    init.duplex = "half";
  }

  try {
    const upstream = await fetch(target.toString(), init);
    const body = await upstream.text();
    const resp = new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "Content-Type, x-dashboard-password",
      },
    });
    return resp;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Mini-service unreachable", detail: msg },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, x-dashboard-password",
    },
  });
}
