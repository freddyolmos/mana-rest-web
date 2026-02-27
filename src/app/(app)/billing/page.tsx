"use client";

import {
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCash, IconReceipt2, IconReload } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useTicketQuery, useCancelTicketMutation, useCloseTicketMutation, useCreatePaymentMutation, useCreateTicketFromOrderMutation } from "@/features/tickets/query";
import type { PaymentMethod } from "@/features/tickets/types";

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "CARD", label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
];

type CreateTicketValues = {
  orderId: number | "";
};

type CreatePaymentValues = {
  method: PaymentMethod;
  amount: number;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function BillingPage() {
  const [ticketIdInput, setTicketIdInput] = useState<number | "">("");
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  const ticketQuery = useTicketQuery(activeTicketId);
  const createTicketMutation = useCreateTicketFromOrderMutation();
  const createPaymentMutation = useCreatePaymentMutation();
  const closeTicketMutation = useCloseTicketMutation();
  const cancelTicketMutation = useCancelTicketMutation();

  const createTicketForm = useForm<CreateTicketValues>({
    initialValues: {
      orderId: "",
    },
    validate: {
      orderId: (value) =>
        typeof value === "number" && value > 0 ? null : "Order ID inválido",
    },
  });

  const paymentForm = useForm<CreatePaymentValues>({
    initialValues: {
      method: "CASH",
      amount: 0,
    },
    validate: {
      amount: (value) => (value > 0 ? null : "Monto debe ser mayor a 0"),
    },
  });

  const ticket = ticketQuery.data;
  const isBusy =
    createTicketMutation.isPending ||
    createPaymentMutation.isPending ||
    closeTicketMutation.isPending ||
    cancelTicketMutation.isPending;

  const pageError = useMemo(() => {
    const errors = [
      ticketQuery.error,
      createTicketMutation.error,
      createPaymentMutation.error,
      closeTicketMutation.error,
      cancelTicketMutation.error,
    ].filter(Boolean);
    return errors.length ? getErrorMessage(errors[0]) : null;
  }, [
    ticketQuery.error,
    createTicketMutation.error,
    createPaymentMutation.error,
    closeTicketMutation.error,
    cancelTicketMutation.error,
  ]);

  const due = ticket?.due ?? (ticket?.total ?? 0) - (ticket?.paid ?? 0);

  return (
    <Stack>
      <PageHeader
        title="Cobro y cierre"
        description="Crear ticket desde orden, registrar pagos y cerrar."
        actions={
          <Button
            variant="light"
            leftSection={<IconReload size={16} />}
            onClick={() => {
              void ticketQuery.refetch();
            }}
          >
            Recargar
          </Button>
        }
      />

      {pageError && (
        <SectionCard>
          <Text c="red">{pageError}</Text>
        </SectionCard>
      )}

      <SectionCard pos="relative">
        <LoadingOverlay visible={isBusy} />
        <Stack>
          <Text fw={600}>1) Crear ticket desde orden</Text>
          <form
            onSubmit={createTicketForm.onSubmit(async (values) => {
              const orderId = Number(values.orderId);
              const created = await createTicketMutation.mutateAsync(orderId);
              setActiveTicketId(created.id);
              setTicketIdInput(created.id);
            })}
          >
            <Group align="flex-end">
              <NumberInput
                label="Order ID"
                min={1}
                allowDecimal={false}
                clampBehavior="strict"
                w={200}
                {...createTicketForm.getInputProps("orderId")}
              />
              <Button type="submit" leftSection={<IconReceipt2 size={16} />}>
                Crear ticket
              </Button>
            </Group>
          </form>
        </Stack>
      </SectionCard>

      <SectionCard>
        <Group align="flex-end">
          <NumberInput
            label="Cargar ticket por ID"
            min={1}
            allowDecimal={false}
            clampBehavior="strict"
            value={ticketIdInput}
            onChange={(value) =>
              setTicketIdInput(typeof value === "number" ? value : "")
            }
            w={220}
          />
          <Button
            onClick={() =>
              setActiveTicketId(
                typeof ticketIdInput === "number" ? ticketIdInput : null,
              )
            }
            disabled={typeof ticketIdInput !== "number"}
          >
            Cargar ticket
          </Button>
        </Group>
      </SectionCard>

      <SectionCard pos="relative">
        <LoadingOverlay visible={ticketQuery.isFetching || isBusy} />
        {!activeTicketId ? (
          <EmptyState
            title="Sin ticket activo"
            description="Crea o carga un ticket para registrar pagos."
          />
        ) : !ticket ? (
          <EmptyState
            title="Sin información"
            description="No se encontró el ticket solicitado."
          />
        ) : (
          <Stack>
            <Group justify="space-between">
              <Group gap="xl">
                <Text>
                  <Text span fw={600}>
                    Ticket:
                  </Text>{" "}
                  #{ticket.id}
                </Text>
                <Text>
                  <Text span fw={600}>
                    Orden:
                  </Text>{" "}
                  #{ticket.orderId}
                </Text>
                <StatusBadge status={ticket.status} />
              </Group>
              <Group>
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  disabled={ticket.status !== "OPEN"}
                  onClick={() => {
                    if (!ticket) return;
                    void cancelTicketMutation.mutateAsync(ticket.id);
                  }}
                >
                  Cancelar ticket
                </Button>
                <Button
                  size="xs"
                  disabled={ticket.status !== "OPEN"}
                  onClick={() => {
                    if (!ticket) return;
                    void closeTicketMutation.mutateAsync(ticket.id);
                  }}
                >
                  Cerrar ticket
                </Button>
              </Group>
            </Group>

            <Group gap="xl">
              <Text>
                <Text span fw={600}>
                  Total:
                </Text>{" "}
                ${Number(ticket.total ?? 0).toFixed(2)}
              </Text>
              <Text>
                <Text span fw={600}>
                  Pagado:
                </Text>{" "}
                ${Number(ticket.paid ?? 0).toFixed(2)}
              </Text>
              <Text c={due > 0 ? "orange" : "green"}>
                <Text span fw={600} c="inherit">
                  Pendiente:
                </Text>{" "}
                ${Number(due).toFixed(2)}
              </Text>
            </Group>

            <form
              onSubmit={paymentForm.onSubmit(async (values) => {
                if (!ticket) return;
                await createPaymentMutation.mutateAsync({
                  ticketId: ticket.id,
                  method: values.method,
                  amount: values.amount,
                });
                paymentForm.setFieldValue("amount", 0);
              })}
            >
              <Group align="flex-end">
                <Select
                  label="Método"
                  data={PAYMENT_METHOD_OPTIONS}
                  w={180}
                  {...paymentForm.getInputProps("method")}
                />
                <NumberInput
                  label="Monto"
                  min={0}
                  decimalScale={2}
                  w={160}
                  {...paymentForm.getInputProps("amount")}
                />
                <Button
                  type="submit"
                  leftSection={<IconCash size={16} />}
                  disabled={ticket.status !== "OPEN"}
                >
                  Registrar pago
                </Button>
              </Group>
            </form>

            {!ticket.payments?.length ? (
              <Text c="dimmed" size="sm">
                Este ticket aún no tiene pagos registrados.
              </Text>
            ) : (
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Método</Table.Th>
                    <Table.Th>Monto</Table.Th>
                    <Table.Th>Cambio</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ticket.payments.map((payment) => (
                    <Table.Tr key={payment.id}>
                      <Table.Td>{payment.id}</Table.Td>
                      <Table.Td>{payment.method}</Table.Td>
                      <Table.Td>${Number(payment.amount).toFixed(2)}</Table.Td>
                      <Table.Td>${Number(payment.change ?? 0).toFixed(2)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  );
}
