"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attachProductModifierGroup,
  detachProductModifierGroup,
  listProductModifierGroups,
} from "./api";
import type { AttachProductModifierGroupInput } from "./types";

export const productModifierGroupsQueryKeys = {
  all: ["product-modifier-groups"] as const,
  list: (productId: number) =>
    [...productModifierGroupsQueryKeys.all, "list", productId] as const,
};

export function useProductModifierGroupsQuery(productId: number | null) {
  return useQuery({
    queryKey: productId
      ? productModifierGroupsQueryKeys.list(productId)
      : [...productModifierGroupsQueryKeys.all, "list", "idle"],
    queryFn: () => listProductModifierGroups(productId as number),
    enabled: typeof productId === "number",
  });
}

export function useAttachProductModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: number;
      payload: AttachProductModifierGroupInput;
    }) => attachProductModifierGroup(productId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: productModifierGroupsQueryKeys.list(variables.productId),
      });
    },
  });
}

export function useDetachProductModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, groupId }: { productId: number; groupId: number }) =>
      detachProductModifierGroup(productId, groupId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: productModifierGroupsQueryKeys.list(variables.productId),
      });
    },
  });
}
