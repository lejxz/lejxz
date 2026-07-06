import { NextRequest, NextResponse } from "next/server";

/**
 * Dev-only proxy: forwards `/api/dashboard/file/:name` to the dashboard-api
 * mini-service on port 3030. See the sibling `data/route.ts` for the full
 * rationale.
 */

const MINI_SERVICE_URL = "http://localhost:3030";

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
  const { name } = await context.params;
  const url = new URL(req.url);
  const target = new URL(
    `${MINI_SERVICE_URL}/api/dashboard/file/${encodeURIComponent(name)}${url.search}`
  );
  target.searchParams.delete("XTransformPort");

  const headers = new Headers();
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
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "Content-Type, x-dashboard-password",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Mini-service unreachable", detail: msg },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  return proxy(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  return proxy(req, context);
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
