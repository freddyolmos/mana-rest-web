export type Category = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const BASE = "/api/proxy/categories";

async function toJsonOrThrow(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    let message = `Error ${res.status}`;
    if (contentType.includes("application/json") && text) {
      const data = JSON.parse(text) as { message?: string; error?: string };
      message = data.message || data.error || message;
    } else if (text) {
      message = text;
    }
    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Respuesta no es JSON: ${contentType}`);
  }

  return JSON.parse(text);
}

export type CreateCategoryInput = {
  name: string;
  sortOrder: number;
};

export type UpdateCategoryInput = {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function listCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}?isActive=true`, { cache: "no-store" });
  return toJsonOrThrow(res);
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return toJsonOrThrow(res);
}

export async function updateCategory(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return toJsonOrThrow(res);
}

export async function deleteCategory(id: number): Promise<{ ok: boolean }> {
  throw new Error("Eliminar categorías no está implementado en la API");
}
