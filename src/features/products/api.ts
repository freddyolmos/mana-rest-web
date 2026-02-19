import { apiRequest } from "@/lib/api-client";
import type {
  CreateProductInput,
  Product,
  ProductFilters,
  UpdateProductInput,
} from "./types";

const PRODUCTS_PATH = "/products";

export function listProducts(filters?: ProductFilters) {
  return apiRequest<Product[]>(PRODUCTS_PATH, {
    query: {
      categoryId: filters?.categoryId,
      isActive: filters?.isActive,
      q: filters?.q,
    },
  });
}

export function getProductById(id: number) {
  return apiRequest<Product>(`${PRODUCTS_PATH}/${id}`);
}

export function createProduct(input: CreateProductInput) {
  return apiRequest<Product>(PRODUCTS_PATH, {
    method: "POST",
    body: input,
  });
}

export function updateProduct(id: number, input: UpdateProductInput) {
  return apiRequest<Product>(`${PRODUCTS_PATH}/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function toggleProductActive(id: number) {
  return apiRequest<Product>(`${PRODUCTS_PATH}/${id}/toggle-active`, {
    method: "PATCH",
  });
}
