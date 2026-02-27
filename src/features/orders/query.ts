"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrderItem,
  attachTableToOrder,
  createOrder,
  getOrderById,
  listOrders,
  markOrderReady,
  releaseTableFromOrder,
  removeOrderItem,
  sendOrderToKitchen,
  updateOrderItem,
} from "./api";
import type {
  AddOrderItemInput,
  CreateOrderInput,
  QueryOrdersInput,
  UpdateOrderItemInput,
} from "./types";

export const ordersQueryKeys = {
  all: ["orders"] as const,
  list: (filters?: QueryOrdersInput) => [...ordersQueryKeys.all, "list", { filters }] as const,
  detail: (id: number) => [...ordersQueryKeys.all, "detail", id] as const,
};

export function useOrdersQuery(filters?: QueryOrdersInput) {
  return useQuery({
    queryKey: ordersQueryKeys.list(filters),
    queryFn: () => listOrders(filters),
  });
}

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

export function useAddOrderItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: number;
      payload: AddOrderItemInput;
    }) => addOrderItem(orderId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
    },
  });
}

export function useUpdateOrderItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      payload,
    }: {
      orderId: number;
      itemId: number;
      payload: UpdateOrderItemInput;
    }) => updateOrderItem(orderId, itemId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
    },
  });
}

export function useRemoveOrderItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      removeOrderItem(orderId, itemId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
    },
  });
}

export function useAttachTableToOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, tableId }: { orderId: number; tableId: number }) =>
      attachTableToOrder(orderId, tableId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
      void queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useReleaseTableFromOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => releaseTableFromOrder(orderId),
    onSuccess: (_data, orderId) => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}
