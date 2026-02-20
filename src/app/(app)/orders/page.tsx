"use client";

import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import { IconArrowRight, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ordersQueryKeys,
  useMarkOrderReadyMutation,
  useOrderQuery,
  useSendOrderToKitchenMutation,
} from "@/features/orders/query";
import { getOrderById } from "@/features/orders/api";
import { useRecentOrderIds } from "@/features/orders/recent-orders";

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function OrdersPage() {
  const recentOrders = useRecentOrderIds();
  const [orderIdInput, setOrderIdInput] = useState<number | "">("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const orderQuery = useOrderQuery(selectedOrderId);
  const sendToKitchenMutation = useSendOrderToKitchenMutation();
  const markReadyMutation = useMarkOrderReadyMutation();

  const recentOrderQueries = useQueries({
    queries: recentOrders.ids.slice(0, 10).map((id) => ({
      queryKey: ordersQueryKeys.detail(id),
      queryFn: () => getOrderById(id),
      staleTime: 10_000,
    })),
  });

  const recentOrdersData = useMemo(
    () =>
      recentOrderQueries
        .map((query) => query.data)
        .filter((order): order is NonNullable<typeof order> => Boolean(order)),
    [recentOrderQueries],
  );

  const detailOrder = orderQuery.data;
  const isTransitioning =
    sendToKitchenMutation.isPending || markReadyMutation.isPending;

  const pageError = useMemo(() => {
    const detailError = orderQuery.error;
    const listError = recentOrderQueries.find((query) => query.error)?.error;
    const mutationError =
      sendToKitchenMutation.error ?? markReadyMutation.error ?? null;
    const source = detailError ?? listError ?? mutationError;
    return source ? getErrorMessage(source) : null;
  }, [
    orderQuery.error,
    recentOrderQueries,
    sendToKitchenMutation.error,
    markReadyMutation.error,
  ]);

  const transitionAllowed = {
    canSendToKitchen: detailOrder?.status === "OPEN",
    canMarkReady: detailOrder?.status === "SENT_TO_KITCHEN",
  };

  return (
    <Stack>
      <PageHeader
        title="Órdenes"
        description="Listado de órdenes recientes, detalle y transiciones de estado."
        actions={
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={() => {
              void orderQuery.refetch();
              recentOrderQueries.forEach((query) => {
                void query.refetch();
              });
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
        <LoadingOverlay visible={recentOrderQueries.some((query) => query.isFetching)} />
        <Stack>
          <Group justify="space-between">
            <Text fw={600}>Órdenes recientes</Text>
            <Button
              variant="subtle"
              color="red"
              onClick={() => recentOrders.clear()}
              leftSection={<IconTrash size={16} />}
            >
              Limpiar historial
            </Button>
          </Group>
          {recentOrdersData.length === 0 ? (
            <EmptyState
              title="Sin órdenes recientes"
              description="Crea órdenes en POS para verlas aquí."
            />
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Ítems</Table.Th>
                  <Table.Th ta="right">Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentOrdersData.map((order) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>#{order.id}</Table.Td>
                    <Table.Td>{order.type}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={order.status} />
                    </Table.Td>
                    <Table.Td>{order.items?.length ?? 0}</Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setOrderIdInput(order.id);
                          }}
                          aria-label="Ver detalle"
                        >
                          <IconArrowRight size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </SectionCard>

      <SectionCard>
        <Group align="flex-end">
          <NumberInput
            label="Buscar por ID"
            placeholder="Ej: 123"
            value={orderIdInput}
            onChange={(value) =>
              setOrderIdInput(typeof value === "number" ? value : "")
            }
            allowDecimal={false}
            min={1}
            clampBehavior="strict"
            w={220}
          />
          <Button
            onClick={() =>
              setSelectedOrderId(
                typeof orderIdInput === "number" ? orderIdInput : null,
              )
            }
            disabled={typeof orderIdInput !== "number"}
          >
            Cargar detalle
          </Button>
        </Group>
      </SectionCard>

      <SectionCard pos="relative">
        <LoadingOverlay visible={orderQuery.isFetching || isTransitioning} />
        {!selectedOrderId ? (
          <EmptyState
            title="Sin orden seleccionada"
            description="Selecciona una orden del listado o búscala por ID."
          />
        ) : !detailOrder ? (
          <EmptyState
            title="Sin resultados"
            description="No se encontró información para esa orden."
          />
        ) : (
          <Stack>
            <Group justify="space-between">
              <Group gap="xl">
                <Text>
                  <Text span fw={600}>
                    Orden:
                  </Text>{" "}
                  #{detailOrder.id}
                </Text>
                <Text>
                  <Text span fw={600}>
                    Tipo:
                  </Text>{" "}
                  {detailOrder.type}
                </Text>
                <StatusBadge status={detailOrder.status} />
              </Group>
              <Group>
                <Button
                  size="xs"
                  onClick={() => {
                    if (!selectedOrderId) return;
                    void sendToKitchenMutation.mutateAsync(selectedOrderId);
                  }}
                  disabled={!transitionAllowed.canSendToKitchen}
                >
                  Enviar a cocina
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => {
                    if (!selectedOrderId) return;
                    void markReadyMutation.mutateAsync(selectedOrderId);
                  }}
                  disabled={!transitionAllowed.canMarkReady}
                >
                  Marcar lista
                </Button>
              </Group>
            </Group>

            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item ID</Table.Th>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th>Cantidad</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {detailOrder.items?.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.id}</Table.Td>
                    <Table.Td>{item.product?.name ?? item.productId}</Table.Td>
                    <Table.Td>{item.qty}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={item.status ?? "PENDING"} />
                    </Table.Td>
                  </Table.Tr>
                )) ?? null}
              </Table.Tbody>
            </Table>
            {!detailOrder.items?.length ? (
              <Text c="dimmed" size="sm">
                La orden no contiene ítems.
              </Text>
            ) : null}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  );
}
