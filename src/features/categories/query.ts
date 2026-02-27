"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "./api";
import type { CreateCategoryInput, UpdateCategoryInput } from "./types";

export const categoriesQueryKeys = {
  all: ["categories"] as const,
  list: (isActive?: boolean) => [...categoriesQueryKeys.all, { isActive }] as const,
};

export function useCategoriesQuery(input?: { isActive?: boolean }) {
  return useQuery({
    queryKey: categoriesQueryKeys.list(input?.isActive),
    queryFn: () => listCategories(input),
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCategoryInput;
    }) => updateCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
}
