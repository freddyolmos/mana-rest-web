"use client";

import {
  Button,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useKitchenOrdersQuery } from "@/features/kitchen/query";
import type { OrderStatus } from "@/features/orders/types";

const KITCHEN_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "SENT_TO_KITCHEN (default backend)" },
  { value: "SENT_TO_KITCHEN", label: "Enviadas a cocina" },
  { value: "READY", label: "Listas" },
  { value: "OPEN", label: "Abiertas" },
  { value: "CLOSED", label: "Cerradas" },
  { value: "CANCELED", label: "Canceladas" },
];

export default function KitchenPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const kitchenQuery = useKitchenOrdersQuery(statusFilter ?? undefined);
  const rows = kitchenQuery.data ?? [];

  return (
    <Stack>
      <PageHeader
        title="Cocina"
        description="Tablero KDS para avance de preparación."
        actions={
          <Button
            variant="light"
            onClick={() => {
              void kitchenQuery.refetch();
            }}
          >
            Recargar
          </Button>
        }
      />

      {kitchenQuery.error && (
        <SectionCard>
          <Text c="red">
            {kitchenQuery.error instanceof Error
              ? kitchenQuery.error.message
              : "No se pudo cargar cocina"}
          </Text>
        </SectionCard>
      )}

      <SectionCard pos="relative">
        <LoadingOverlay visible={kitchenQuery.isFetching} />
        <Group justify="space-between" align="flex-end">
          <Select
            label="Estado"
            data={KITCHEN_STATUS_OPTIONS}
            value={statusFilter ?? ""}
            onChange={(value) =>
              setStatusFilter(value ? (value as OrderStatus) : null)
            }
            w={320}
          />
        </Group>

        {!kitchenQuery.isLoading && rows.length === 0 ? (
          <EmptyState
            title="Sin órdenes en cocina"
            description="No hay órdenes en el estado seleccionado."
          />
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Orden</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Estado orden</Table.Th>
                <Table.Th>Items</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>#{order.id}</Table.Td>
                  <Table.Td>{order.type}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={order.status} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm">{order.items.length}</Text>
                      <Text size="sm" c="dimmed">
                        ({order.items.filter((item) => item.status === "READY").length} listos)
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </SectionCard>
    </Stack>
  );
}
