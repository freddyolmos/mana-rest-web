"use client";

import {
  Button,
  Card,
  Group,
  LoadingOverlay,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconReload } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useKitchenOrdersQuery, useUpdateKitchenItemMutation } from "@/features/kitchen/query";
import type { KitchenItem } from "@/features/kitchen/types";
import type { OrderItemStatus, OrderStatus } from "@/features/orders/types";

const KITCHEN_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "SENT_TO_KITCHEN (default backend)" },
  { value: "SENT_TO_KITCHEN", label: "Enviadas a cocina" },
  { value: "READY", label: "Listas" },
];

const ITEM_COLUMNS: { key: OrderItemStatus; title: string }[] = [
  { key: "PENDING", title: "Pendiente" },
  { key: "IN_PROGRESS", title: "En progreso" },
  { key: "READY", title: "Listo" },
];

type BoardItem = KitchenItem & {
  orderType: string;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function KitchenPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const kitchenQuery = useKitchenOrdersQuery(statusFilter ?? undefined);
  const updateItemMutation = useUpdateKitchenItemMutation();

  const boardItems = useMemo(() => {
    return (kitchenQuery.data ?? []).flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderType: order.type,
      })),
    );
  }, [kitchenQuery.data]);

  const itemsByStatus = useMemo(() => {
    return ITEM_COLUMNS.reduce<Record<OrderItemStatus, BoardItem[]>>(
      (acc, col) => {
        acc[col.key] = boardItems.filter((item) => item.status === col.key);
        return acc;
      },
      {
        PENDING: [],
        IN_PROGRESS: [],
        READY: [],
        CANCELED: [],
      },
    );
  }, [boardItems]);

  const pageError = kitchenQuery.error ?? updateItemMutation.error;

  return (
    <Stack>
      <PageHeader
        title="Cocina"
        description="Tablero de ítems por estado para el flujo KDS."
        actions={
          <Button
            variant="light"
            leftSection={<IconReload size={16} />}
            onClick={() => {
              void kitchenQuery.refetch();
            }}
          >
            Recargar
          </Button>
        }
      />

      {pageError && (
        <SectionCard>
          <Text c="red">{getErrorMessage(pageError)}</Text>
        </SectionCard>
      )}

      <SectionCard>
        <Group justify="space-between" align="flex-end">
          <Select
            label="Filtro de órdenes"
            data={KITCHEN_STATUS_OPTIONS}
            value={statusFilter ?? ""}
            onChange={(value) =>
              setStatusFilter(value ? (value as OrderStatus) : null)
            }
            w={320}
          />
          <Text c="dimmed" size="sm">
            {boardItems.length} ítems en tablero
          </Text>
        </Group>
      </SectionCard>

      <SectionCard pos="relative">
        <LoadingOverlay visible={kitchenQuery.isFetching || updateItemMutation.isPending} />
        {boardItems.length === 0 && !kitchenQuery.isLoading ? (
          <EmptyState
            title="Sin ítems en cocina"
            description="No hay ítems para preparar en este momento."
          />
        ) : (
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {ITEM_COLUMNS.map((column) => (
              <Card withBorder key={column.key} radius="md" p="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600}>{column.title}</Text>
                    <BadgeCount count={itemsByStatus[column.key].length} />
                  </Group>

                  {itemsByStatus[column.key].length === 0 ? (
                    <Text size="sm" c="dimmed">
                      Sin ítems
                    </Text>
                  ) : (
                    itemsByStatus[column.key].map((item) => (
                      <Card withBorder key={`${item.orderId}-${item.id}`} p="sm" radius="md">
                        <Stack gap={6}>
                          <Group justify="space-between">
                            <Text fw={600}>{item.product?.name ?? `Producto ${item.productId}`}</Text>
                            <StatusBadge status={item.status} />
                          </Group>
                          <Text size="sm" c="dimmed">
                            Orden #{item.orderId} • {item.orderType}
                          </Text>
                          <Text size="sm">Cantidad: {item.qty}</Text>
                          {item.notes ? (
                            <Text size="sm" c="dimmed">
                              Nota: {item.notes}
                            </Text>
                          ) : null}
                          <Group>
                            {item.status === "PENDING" ? (
                              <Button
                                size="xs"
                                onClick={() => {
                                  void updateItemMutation.mutateAsync({
                                    orderId: item.orderId,
                                    itemId: item.id,
                                    payload: { status: "IN_PROGRESS" },
                                  });
                                }}
                              >
                                Iniciar
                              </Button>
                            ) : null}
                            {item.status === "IN_PROGRESS" ? (
                              <Button
                                size="xs"
                                color="green"
                                onClick={() => {
                                  void updateItemMutation.mutateAsync({
                                    orderId: item.orderId,
                                    itemId: item.id,
                                    payload: { status: "READY" },
                                  });
                                }}
                              >
                                Marcar listo
                              </Button>
                            ) : null}
                            {item.status !== "CANCELED" && item.status !== "READY" ? (
                              <Button
                                size="xs"
                                variant="light"
                                color="red"
                                onClick={() => {
                                  void updateItemMutation.mutateAsync({
                                    orderId: item.orderId,
                                    itemId: item.id,
                                    payload: { status: "CANCELED" },
                                  });
                                }}
                              >
                                Cancelar
                              </Button>
                            ) : null}
                          </Group>
                        </Stack>
                      </Card>
                    ))
                  )}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </SectionCard>
    </Stack>
  );
}

function BadgeCount({ count }: { count: number }) {
  return (
    <Text
      size="xs"
      fw={700}
      c={count > 0 ? "blue" : "dimmed"}
      style={{ minWidth: 20, textAlign: "right" }}
    >
      {count}
    </Text>
  );
}
