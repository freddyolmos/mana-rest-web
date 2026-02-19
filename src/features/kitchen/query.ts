"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderStatus } from "@/features/orders/types";
import { getKitchenOrderById, listKitchenOrders, updateKitchenItem } from "./api";
import type { UpdateKitchenItemInput } from "./types";

export const kitchenQueryKeys = {
  all: ["kitchen"] as const,
  list: (status?: OrderStatus) => [...kitchenQueryKeys.all, "orders", { status }] as const,
  detail: (id: number) => [...kitchenQueryKeys.all, "order", id] as const,
};

export function useKitchenOrdersQuery(status?: OrderStatus) {
  return useQuery({
    queryKey: kitchenQueryKeys.list(status),
    queryFn: () => listKitchenOrders(status),
  });
}

export function useKitchenOrderQuery(id: number | null) {
  return useQuery({
    queryKey: id ? kitchenQueryKeys.detail(id) : [...kitchenQueryKeys.all, "order", "idle"],
    queryFn: () => getKitchenOrderById(id as number),
    enabled: typeof id === "number",
  });
}

export function useUpdateKitchenItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      payload,
    }: {
      orderId: number;
      itemId: number;
      payload: UpdateKitchenItemInput;
    }) => updateKitchenItem(orderId, itemId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: kitchenQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: kitchenQueryKeys.detail(variables.orderId),
      });
    },
  });
}
