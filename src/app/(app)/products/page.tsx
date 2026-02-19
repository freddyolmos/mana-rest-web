"use client";

import {
  Button,
  Group,
  LoadingOverlay,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useProductsQuery } from "@/features/products/query";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const productsQuery = useProductsQuery({
    isActive: activeOnly ? true : undefined,
    q: debouncedSearch || undefined,
  });
  const rows = productsQuery.data ?? [];

  return (
    <Stack>
      <PageHeader
        title="Productos"
        description="Administración de productos del catálogo."
        actions={
          <Button
            variant="light"
            onClick={() => {
              void productsQuery.refetch();
            }}
          >
            Recargar
          </Button>
        }
      />

      {productsQuery.error && (
        <SectionCard>
          <Text c="red">
            {productsQuery.error instanceof Error
              ? productsQuery.error.message
              : "No se pudo cargar productos"}
          </Text>
        </SectionCard>
      )}

      <SectionCard pos="relative">
        <LoadingOverlay visible={productsQuery.isFetching} />
        <Group justify="space-between" align="flex-end">
          <TextInput
            label="Buscar"
            placeholder="Nombre de producto"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={320}
          />
          <Switch
            label="Solo activos"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.currentTarget.checked)}
          />
        </Group>

        {!productsQuery.isLoading && rows.length === 0 ? (
          <EmptyState
            title="No hay productos"
            description="No hay registros con los filtros actuales."
          />
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Categoría</Table.Th>
                <Table.Th>Precio</Table.Th>
                <Table.Th>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>{product.id}</Table.Td>
                  <Table.Td>{product.name}</Table.Td>
                  <Table.Td>{product.category?.name ?? "-"}</Table.Td>
                  <Table.Td>${Number(product.price).toFixed(2)}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={product.isActive ? "ACTIVE" : "INACTIVE"} />
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
