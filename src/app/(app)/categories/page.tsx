import { Title, Stack, Text } from "@mantine/core";
import { headers, cookies } from "next/headers";

type Category = { id: number; name: string };

async function getBaseUrl() {
  const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }

  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3001";
}

async function getCategories(): Promise<Category[]> {
  const baseUrl = await getBaseUrl();
  const requestUrl = `${baseUrl}/api/proxy/categories?isActive=true`;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(requestUrl, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`Error al cargar categorías: ${res.status} ${text}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Respuesta no es JSON: ${contentType} ${text}`);
  }

  return JSON.parse(text) as Category[];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <Stack>
      <Title order={2}>Categorías</Title>
      {categories.length === 0 && <Text c="dimmed">No hay categorías</Text>}
      {categories.map((c) => (
        <Text key={c.id}>• {c.name}</Text>
      ))}
    </Stack>
  );
}
