"use client";

import {
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useOrderQuery } from "@/features/orders/query";

export default function OrdersPage() {
  const [orderIdInput, setOrderIdInput] = useState<number | "">("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const orderQuery = useOrderQuery(selectedOrderId);
  const order = orderQuery.data;

  return (
    <Stack>
      <PageHeader
        title="Órdenes"
        description="Consulta rápida de órdenes por ID."
      />
      <SectionCard>
        <Group align="flex-end">
          <NumberInput
            label="ID de orden"
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
            Buscar
          </Button>
          <Button
            variant="light"
            onClick={() => {
              if (selectedOrderId) void orderQuery.refetch();
            }}
            disabled={!selectedOrderId}
          >
            Recargar
          </Button>
        </Group>
      </SectionCard>

      <SectionCard pos="relative">
        <LoadingOverlay visible={orderQuery.isFetching} />
        {!selectedOrderId ? (
          <EmptyState
            title="Sin consulta activa"
            description="Ingresa un ID para consultar una orden específica."
          />
        ) : orderQuery.error ? (
          <Text c="red">
            {orderQuery.error instanceof Error
              ? orderQuery.error.message
              : "No se pudo consultar la orden"}
          </Text>
        ) : order ? (
          <Stack gap="sm">
            <Group gap="xl">
              <Text>
                <Text span fw={600}>
                  Orden:
                </Text>{" "}
                #{order.id}
              </Text>
              <Text>
                <Text span fw={600}>
                  Tipo:
                </Text>{" "}
                {order.type}
              </Text>
              <StatusBadge status={order.status} />
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
                {order.items?.map((item) => (
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
            {!order.items?.length ? (
              <Text c="dimmed" size="sm">
                La orden no contiene items.
              </Text>
            ) : null}
          </Stack>
        ) : (
          <EmptyState
            title="Sin resultados"
            description="No se encontró una orden con ese ID."
          />
        )}
      </SectionCard>
    </Stack>
  );
}
