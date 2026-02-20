import { apiRequest } from "@/lib/api-client";
import type {
  AddOrderItemInput,
  CreateOrderInput,
  Order,
  UpdateOrderItemInput,
} from "./types";

const ORDERS_PATH = "/orders";

export function getOrderById(id: number) {
  return apiRequest<Order>(`${ORDERS_PATH}/${id}`);
}

export function createOrder(input: CreateOrderInput) {
  return apiRequest<Order>(ORDERS_PATH, {
    method: "POST",
    body: input,
  });
}

export function sendOrderToKitchen(id: number) {
  return apiRequest<Order>(`${ORDERS_PATH}/${id}/send-to-kitchen`, {
    method: "POST",
  });
}

export function markOrderReady(id: number) {
  return apiRequest<Order>(`${ORDERS_PATH}/${id}/mark-ready`, {
    method: "POST",
  });
}

export function addOrderItem(orderId: number, input: AddOrderItemInput) {
  return apiRequest<Order>(`${ORDERS_PATH}/${orderId}/items`, {
    method: "POST",
    body: input,
  });
}

export function updateOrderItem(
  orderId: number,
  itemId: number,
  input: UpdateOrderItemInput,
) {
  return apiRequest<Order>(`${ORDERS_PATH}/${orderId}/items/${itemId}`, {
    method: "PATCH",
    body: input,
  });
}

export function removeOrderItem(orderId: number, itemId: number) {
  return apiRequest<Order>(`${ORDERS_PATH}/${orderId}/items/${itemId}`, {
    method: "DELETE",
  });
}
