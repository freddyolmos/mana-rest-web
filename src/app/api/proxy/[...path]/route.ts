import { NextRequest, NextResponse } from "next/server";

type ProxyRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(name + "="));
  return found
    ? decodeURIComponent(found.split("=").slice(1).join("="))
    : undefined;
}

async function proxy(req: NextRequest, method: string, path: string[]) {
  try {
    if (!Array.isArray(path)) {
      return NextResponse.json(
        {
          message: "Ruta inválida en proxy",
          detail: "params.path no es array",
        },
        { status: 400 },
      );
    }

    const cookieHeader = req.headers.get("cookie");
    const accessToken = getCookieValue(cookieHeader, "accessToken");

    if (!accessToken) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const baseUrl = process.env.NEST_API_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { message: "NEST_API_URL no configurado" },
        { status: 500 },
      );
    }

    const targetUrl = `${baseUrl}/api/${path.join("/")}${req.nextUrl.search}`;

    const headers: Record<string, string> = {
      accept: "*/*",
      Authorization: `Bearer ${accessToken}`,
    };

    let body: string | undefined = undefined;
    if (method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      body = await req.text();
    }

    const resp = await fetch(targetUrl, { method, headers, body });
    const text = await resp.text();

    return new NextResponse(text, {
      status: resp.status,
      headers: {
        "Content-Type": resp.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { message: "Proxy error", detail: message },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, ctx: ProxyRouteContext) {
  const { path = [] } = await ctx.params;
  return proxy(req, "GET", path);
}

export async function POST(req: NextRequest, ctx: ProxyRouteContext) {
  const { path = [] } = await ctx.params;
  return proxy(req, "POST", path);
}

export async function PUT(req: NextRequest, ctx: ProxyRouteContext) {
  const { path = [] } = await ctx.params;
  return proxy(req, "PUT", path);
}

export async function PATCH(req: NextRequest, ctx: ProxyRouteContext) {
  const { path = [] } = await ctx.params;
  return proxy(req, "PATCH", path);
}

export async function DELETE(req: NextRequest, ctx: ProxyRouteContext) {
  const { path = [] } = await ctx.params;
  return proxy(req, "DELETE", path);
}
