"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelTicket, closeTicket, createPayment, createTicketFromOrder, getTicketById } from "./api";
import type { CreatePaymentInput } from "./types";

export const ticketsQueryKeys = {
  all: ["tickets"] as const,
  detail: (id: number) => [...ticketsQueryKeys.all, "detail", id] as const,
};

export function useTicketQuery(id: number | null) {
  return useQuery({
    queryKey: id ? ticketsQueryKeys.detail(id) : [...ticketsQueryKeys.all, "detail", "idle"],
    queryFn: () => getTicketById(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateTicketFromOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => createTicketFromOrder(orderId),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKeys.all });
      void queryClient.setQueryData(ticketsQueryKeys.detail(ticket.id), ticket);
    },
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentInput) => createPayment(payload),
    onSuccess: (_payment, payload) => {
      void queryClient.invalidateQueries({
        queryKey: ticketsQueryKeys.detail(payload.ticketId),
      });
    },
  });
}

export function useCloseTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: number) => closeTicket(ticketId),
    onSuccess: (_ticket, ticketId) => {
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKeys.detail(ticketId) });
    },
  });
}

export function useCancelTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: number) => cancelTicket(ticketId),
    onSuccess: (_ticket, ticketId) => {
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKeys.detail(ticketId) });
    },
  });
}
