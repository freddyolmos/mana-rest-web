import { apiRequest } from "@/lib/api-client";
import type { CreatePaymentInput, Ticket, TicketPayment } from "./types";

export function createTicketFromOrder(orderId: number) {
  return apiRequest<Ticket>(`/tickets/from-order/${orderId}`, {
    method: "POST",
  });
}

export function getTicketById(ticketId: number) {
  return apiRequest<Ticket>(`/tickets/${ticketId}`);
}

export function cancelTicket(ticketId: number) {
  return apiRequest<Ticket>(`/tickets/${ticketId}/cancel`, {
    method: "PATCH",
  });
}

export function closeTicket(ticketId: number) {
  return apiRequest<Ticket>(`/tickets/${ticketId}/close`, {
    method: "POST",
  });
}

export function createPayment(input: CreatePaymentInput) {
  return apiRequest<TicketPayment>(`/payments`, {
    method: "POST",
    body: input,
  });
}
