// Compatibility wrapper while migrating modules to src/features/*
export type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types";
export {
  createCategory,
  deleteCategory as deleteCategoryApi,
  listCategories,
  updateCategory,
} from "@/features/categories/api";

export async function deleteCategory(id: number): Promise<{ ok: boolean }> {
  await deleteCategoryApi(id);
  return { ok: true };
}
