import type { OrderItemStatus, OrderStatus, OrderType } from "@/features/orders/types";

export type KitchenItem = {
  id: number;
  orderId: number;
  productId: number;
  qty: number;
  notes?: string | null;
  status: OrderItemStatus;
  product?: {
    id: number;
    name: string;
  } | null;
};

export type KitchenOrder = {
  id: number;
  type: OrderType;
  status: OrderStatus;
  notes?: string | null;
  createdAt?: string;
  items: KitchenItem[];
};

export type UpdateKitchenItemInput = {
  status: OrderItemStatus;
};
