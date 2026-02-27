"use client";

import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useAttachTableToOrderMutation,
  useMarkOrderReadyMutation,
  useOrderQuery,
  useOrdersQuery,
  useReleaseTableFromOrderMutation,
  useSendOrderToKitchenMutation,
} from "@/features/orders/query";
import { useTablesQuery } from "@/features/tables/query";
import type { Role } from "@/lib/rbac";
import type { OrderStatus, OrderType } from "@/features/orders/types";

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "OPEN", label: "Abierta" },
  { value: "SENT_TO_KITCHEN", label: "En cocina" },
  { value: "READY", label: "Lista" },
  { value: "CLOSED", label: "Cerrada" },
  { value: "CANCELED", label: "Cancelada" },
];

const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: "DINE_IN", label: "En mesa" },
  { value: "TAKEOUT", label: "Para llevar" },
  { value: "DELIVERY", label: "Delivery" },
];

type Me = {
  userId: number;
  email: string;
  role: Role;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<OrderType | null>(null);
  const [tableFilterId, setTableFilterId] = useState<number | "">("");
  const [createdByFilterId, setCreatedByFilterId] = useState<number | "">("");
  const [orderIdInput, setOrderIdInput] = useState<number | "">("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [tableToAttachId, setTableToAttachId] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);

  const ordersQuery = useOrdersQuery({
    status: statusFilter ?? undefined,
    type: typeFilter ?? undefined,
    tableId: typeof tableFilterId === "number" ? tableFilterId : undefined,
    createdById:
      typeof createdByFilterId === "number" ? createdByFilterId : undefined,
  });
  const orderQuery = useOrderQuery(selectedOrderId);
  const sendToKitchenMutation = useSendOrderToKitchenMutation();
  const markReadyMutation = useMarkOrderReadyMutation();
  const attachTableMutation = useAttachTableToOrderMutation();
  const releaseTableMutation = useReleaseTableFromOrderMutation();
  const freeTablesQuery = useTablesQuery({ status: "FREE" });
  const filteredOrders = ordersQuery.data ?? [];

  const detailOrder = orderQuery.data;
  const isTransitioning =
    sendToKitchenMutation.isPending ||
    markReadyMutation.isPending ||
    attachTableMutation.isPending ||
    releaseTableMutation.isPending;

  const pageError = useMemo(() => {
    const ordersListError = ordersQuery.error;
    const detailError = orderQuery.error;
    const mutationError =
      sendToKitchenMutation.error ?? markReadyMutation.error ?? null;
    const tableMutationError =
      attachTableMutation.error ?? releaseTableMutation.error ?? null;
    const source =
      ordersListError ?? detailError ?? mutationError ?? tableMutationError;
    return source ? getErrorMessage(source) : null;
  }, [
    ordersQuery.error,
    orderQuery.error,
    sendToKitchenMutation.error,
    markReadyMutation.error,
    attachTableMutation.error,
    releaseTableMutation.error,
  ]);

  const transitionAllowed = {
    canSendToKitchen: detailOrder?.status === "OPEN",
    canMarkReady: detailOrder?.status === "SENT_TO_KITCHEN",
  };

  const freeTableOptions = useMemo(
    () =>
      (freeTablesQuery.data ?? []).map((table) => ({
        value: String(table.id),
        label: `${table.name} (#${table.id})`,
      })),
    [freeTablesQuery.data],
  );
  const canManageTables = me?.role === "ADMIN" || me?.role === "CASHIER";

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        setMe((await res.json()) as Me);
      }
    })();
  }, []);

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
              void ordersQuery.refetch();
              void orderQuery.refetch();
              void freeTablesQuery.refetch();
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
        <LoadingOverlay visible={ordersQuery.isFetching} />
        <Stack>
          <Text fw={600}>Listado de órdenes</Text>
          <Group align="flex-end">
            <Select
              label="Estado"
              placeholder="Todos"
              data={ORDER_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(value ? (value as OrderStatus) : null)
              }
              clearable
              w={220}
            />
            <Select
              label="Tipo"
              placeholder="Todos"
              data={ORDER_TYPE_OPTIONS}
              value={typeFilter}
              onChange={(value) =>
                setTypeFilter(value ? (value as OrderType) : null)
              }
              clearable
              w={220}
            />
            <NumberInput
              label="Mesa ID"
              placeholder="Ej: 3"
              value={tableFilterId}
              onChange={(value) =>
                setTableFilterId(typeof value === "number" ? value : "")
              }
              allowDecimal={false}
              min={1}
              clampBehavior="strict"
              w={160}
            />
            <NumberInput
              label="Creada por ID"
              placeholder="Ej: 12"
              value={createdByFilterId}
              onChange={(value) =>
                setCreatedByFilterId(typeof value === "number" ? value : "")
              }
              allowDecimal={false}
              min={1}
              clampBehavior="strict"
              w={180}
            />
            <Button
              variant="subtle"
              onClick={() => {
                setStatusFilter(null);
                setTypeFilter(null);
                setTableFilterId("");
                setCreatedByFilterId("");
              }}
            >
              Limpiar filtros
            </Button>
          </Group>
          {filteredOrders.length === 0 && !ordersQuery.isLoading ? (
            <EmptyState
              title="Sin órdenes"
              description="No hay resultados para los filtros seleccionados."
            />
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Mesa</Table.Th>
                  <Table.Th>Creada por</Table.Th>
                  <Table.Th>Ítems</Table.Th>
                  <Table.Th ta="right">Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredOrders.map((order) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>#{order.id}</Table.Td>
                    <Table.Td>{order.type}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={order.status} />
                    </Table.Td>
                    <Table.Td>{order.tableId ? `#${order.tableId}` : "-"}</Table.Td>
                    <Table.Td>{order.createdById ?? "-"}</Table.Td>
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
                <Text>
                  <Text span fw={600}>
                    Mesa:
                  </Text>{" "}
                  {detailOrder.tableId ? `#${detailOrder.tableId}` : "Sin mesa"}
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

            {canManageTables ? (
              <Group align="flex-end">
                <Select
                  label="Asignar mesa"
                  placeholder="Mesa libre"
                  data={freeTableOptions}
                  value={tableToAttachId}
                  onChange={setTableToAttachId}
                  w={220}
                />
                <Button
                  size="xs"
                  onClick={() => {
                    if (!selectedOrderId || !tableToAttachId) return;
                    void attachTableMutation.mutateAsync({
                      orderId: selectedOrderId,
                      tableId: Number(tableToAttachId),
                    });
                    setTableToAttachId(null);
                    void freeTablesQuery.refetch();
                  }}
                  disabled={!selectedOrderId || !tableToAttachId}
                >
                  Adjuntar mesa
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => {
                    if (!selectedOrderId) return;
                    void releaseTableMutation.mutateAsync(selectedOrderId);
                    void freeTablesQuery.refetch();
                  }}
                  disabled={!selectedOrderId}
                >
                  Liberar mesa
                </Button>
              </Group>
            ) : null}

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
