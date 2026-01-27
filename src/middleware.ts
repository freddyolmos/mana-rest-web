import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "@/lib/jwt";

type Role = "ADMIN" | "CASHIER" | "KITCHEN";

function isAllowed(pathname: string, role: Role) {
  if (pathname.startsWith("/categories")) return role === "ADMIN";
  if (pathname.startsWith("/products")) return role === "ADMIN";

  if (pathname.startsWith("/pos"))
    return role === "ADMIN" || role === "CASHIER";
  if (pathname.startsWith("/kitchen"))
    return role === "ADMIN" || role === "KITCHEN";

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const isPublic =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api");

  if (isPublic) return NextResponse.next();

  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    const refreshResp = await fetch(`${origin}/api/auth/refresh`, {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (!refreshResp.ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    const res = NextResponse.next();
    const setCookie = refreshResp.headers.get("set-cookie");
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  }

  const payload = decodeJwt(accessToken);
  const role = payload?.role;

  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (!isAllowed(pathname, role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
