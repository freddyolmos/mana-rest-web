export type TicketStatus = "OPEN" | "PAID" | "CANCELED";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

export type TicketPayment = {
  id: number;
  ticketId: number;
  method: PaymentMethod;
  amount: number;
  change?: number;
  createdAt?: string;
};

export type Ticket = {
  id: number;
  orderId: number;
  status: TicketStatus;
  subtotal?: number;
  total?: number;
  paid?: number;
  due?: number;
  change?: number;
  createdAt?: string;
  updatedAt?: string;
  payments?: TicketPayment[];
};

export type CreatePaymentInput = {
  ticketId: number;
  method: PaymentMethod;
  amount: number;
};
