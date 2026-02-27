export type OrderType = "DINE_IN" | "TAKEOUT" | "DELIVERY";
export type OrderStatus =
  | "OPEN"
  | "SENT_TO_KITCHEN"
  | "READY"
  | "CLOSED"
  | "CANCELED";

export type OrderItemStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "READY"
  | "CANCELED";

export type OrderItem = {
  id: number;
  productId: number;
  qty: number;
  unitPrice?: number;
  subtotal?: number;
  notes?: string | null;
  status?: OrderItemStatus;
  product?: {
    id: number;
    name: string;
  } | null;
};

export type Order = {
  id: number;
  type: OrderType;
  status: OrderStatus;
  notes?: string | null;
  total?: number;
  subtotal?: number;
  tableId?: number | null;
  createdById?: number | null;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};

export type QueryOrdersInput = {
  status?: OrderStatus;
  type?: OrderType;
  tableId?: number;
  createdById?: number;
};

export type CreateOrderInput = {
  type: OrderType;
  notes?: string;
};

export type OrderItemModifierInput = {
  groupId: number;
  optionIds: number[];
};

export type AddOrderItemInput = {
  productId: number;
  qty: number;
  notes?: string;
  modifiers?: OrderItemModifierInput[];
};

export type UpdateOrderItemInput = {
  qty?: number;
  notes?: string;
  modifiers?: OrderItemModifierInput[];
};
