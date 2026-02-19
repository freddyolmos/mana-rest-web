"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, getOrderById, markOrderReady, sendOrderToKitchen } from "./api";
import type { CreateOrderInput } from "./types";

export const ordersQueryKeys = {
  all: ["orders"] as const,
  detail: (id: number) => [...ordersQueryKeys.all, "detail", id] as const,
};

export function useOrderQuery(id: number | null) {
  return useQuery({
    queryKey: id ? ordersQueryKeys.detail(id) : [...ordersQueryKeys.all, "detail", "idle"],
    queryFn: () => getOrderById(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderInput) => createOrder(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      void queryClient.setQueryData(ordersQueryKeys.detail(data.id), data);
    },
  });
}

export function useSendOrderToKitchenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendOrderToKitchen(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(id) });
    },
  });
}

export function useMarkOrderReadyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markOrderReady(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(id) });
    },
  });
}
