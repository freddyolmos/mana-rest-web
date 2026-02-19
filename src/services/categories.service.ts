// Compatibility wrapper while migrating modules to src/features/*
export type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types";
export {
  createCategory,
  listCategories,
  updateCategory,
} from "@/features/categories/api";

export async function deleteCategory(): Promise<{ ok: boolean }> {
  throw new Error("Eliminar categorías no está implementado en la API");
}
