import { apiRequest } from "@/lib/api-client";
import type { CreateOrderInput, Order } from "./types";

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
