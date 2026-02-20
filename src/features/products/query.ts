"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  getProductById,
  listProducts,
  toggleProductActive,
  updateProduct,
} from "./api";
import type {
  CreateProductInput,
  ProductFilters,
  UpdateProductInput,
} from "./types";

export const productsQueryKeys = {
  all: ["products"] as const,
  list: (filters?: ProductFilters) => [...productsQueryKeys.all, { filters }] as const,
  detail: (id: number) => [...productsQueryKeys.all, "detail", id] as const,
};

export function useProductsQuery(
  filters?: ProductFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: productsQueryKeys.list(filters),
    queryFn: () => listProducts(filters),
    enabled: options?.enabled,
  });
}

export function useProductQuery(id: number | null) {
  return useQuery({
    queryKey: id ? productsQueryKeys.detail(id) : [...productsQueryKeys.all, "detail", "idle"],
    queryFn: () => getProductById(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductInput) => createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductInput }) =>
      updateProduct(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useToggleProductActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleProductActive(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: productsQueryKeys.detail(id) });
    },
  });
}
