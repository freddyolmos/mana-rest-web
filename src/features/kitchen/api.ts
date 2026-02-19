import { apiRequest } from "@/lib/api-client";
import type { OrderStatus } from "@/features/orders/types";
import type { KitchenOrder, UpdateKitchenItemInput } from "./types";

const KITCHEN_PATH = "/kitchen/orders";

export function listKitchenOrders(status?: OrderStatus) {
  return apiRequest<KitchenOrder[]>(KITCHEN_PATH, {
    query: { status },
  });
}

export function getKitchenOrderById(id: number) {
  return apiRequest<KitchenOrder>(`${KITCHEN_PATH}/${id}`);
}

export function updateKitchenItem(
  orderId: number,
  itemId: number,
  input: UpdateKitchenItemInput,
) {
  return apiRequest<KitchenOrder>(`${KITCHEN_PATH}/${orderId}/items/${itemId}`, {
    method: "PATCH",
    body: input,
  });
}
