import { apiRequest } from "@/lib/api-client";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";

const CATEGORIES_PATH = "/categories";

export function listCategories(input?: { isActive?: boolean }) {
  return apiRequest<Category[]>(CATEGORIES_PATH, {
    query: {
      isActive: input?.isActive,
    },
  });
}

export function createCategory(input: CreateCategoryInput) {
  return apiRequest<Category>(CATEGORIES_PATH, {
    method: "POST",
    body: input,
  });
}

export function updateCategory(id: number, input: UpdateCategoryInput) {
  return apiRequest<Category>(`${CATEGORIES_PATH}/${id}`, {
    method: "PATCH",
    body: input,
  });
}
