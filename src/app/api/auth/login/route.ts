import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const baseUrl = process.env.NEST_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { message: "NEST_API_URL no está configurado" },
      { status: 500 },
    );
  }

  const resp = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "*/*" },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Credenciales inválidas" },
      { status: resp.status },
    );
  }

  const { accessToken, refreshToken } = data ?? {};
  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { message: "Respuesta inválida del servidor de auth" },
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

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  return res;
}
