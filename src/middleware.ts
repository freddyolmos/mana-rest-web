import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const isPublic =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api");

  if (isPublic) return NextResponse.next();

  const accessToken = request.cookies.get("accessToken")?.value;
  if (accessToken) return NextResponse.next();

  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  const refreshResp = await fetch(`${origin}/api/auth/refresh`, {
    method: "POST",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });

  if (!refreshResp.ok) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();

  const setCookie = refreshResp.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
