import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  const baseUrl = process.env.NEST_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { message: "NEST_API_URL no está configurado" },
      { status: 500 },
    );
  }

  const resp = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const res = NextResponse.json(
      { message: data?.message ?? "Refresh inválido" },
      { status: 401 },
    );
    res.cookies.set("accessToken", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  const { accessToken, refreshToken: newRefreshToken } = data ?? {};
  if (!accessToken || !newRefreshToken) {
    return NextResponse.json(
      { message: "Respuesta inválida del servidor de refresh" },
      { status: 502 },
    );
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });

  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15, // 15 min
  });

  res.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
