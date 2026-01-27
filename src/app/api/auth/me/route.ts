import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

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

  const resp = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { accept: "*/*", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const text = await resp.text();
  return new NextResponse(text, {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}
