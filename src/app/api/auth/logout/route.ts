import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const baseUrl = process.env.NEST_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { message: "NEST_API_URL no está configurado" },
      { status: 500 },
    );
  }

  if (accessToken) {
    try {
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {}
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set("accessToken", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("refreshToken", "", { httpOnly: true, path: "/", maxAge: 0 });

  return res;
}
