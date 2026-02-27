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
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useAttachTableToOrderMutation,
  useReleaseTableFromOrderMutation,
} from "@/features/orders/query";
import { useTablesQuery } from "@/features/tables/query";
import type { TableStatus } from "@/features/tables/types";

const TABLE_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "FREE", label: "Libres" },
  { value: "OCCUPIED", label: "Ocupadas" },
];

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function TablesPage() {
  const [statusFilter, setStatusFilter] = useState<TableStatus | null>(null);
  const [attachOrderId, setAttachOrderId] = useState<number | "">("");
  const [attachTableId, setAttachTableId] = useState<string | null>(null);
  const [releaseOrderId, setReleaseOrderId] = useState<number | "">("");

  const tablesQuery = useTablesQuery(statusFilter ? { status: statusFilter } : undefined);
  const freeTablesQuery = useTablesQuery({ status: "FREE" });
  const attachTableMutation = useAttachTableToOrderMutation();
  const releaseTableMutation = useReleaseTableFromOrderMutation();

  const tableRows = tablesQuery.data ?? [];
  const freeTableOptions = useMemo(
    () =>
      (freeTablesQuery.data ?? []).map((table) => ({
        value: String(table.id),
        label: `${table.name} (#${table.id})`,
      })),
    [freeTablesQuery.data],
  );

  const pageError = useMemo(() => {
    const errors = [
      tablesQuery.error,
      freeTablesQuery.error,
      attachTableMutation.error,
      releaseTableMutation.error,
    ].filter(Boolean);
    return errors.length ? getErrorMessage(errors[0]) : null;
  }, [
    tablesQuery.error,
    freeTablesQuery.error,
    attachTableMutation.error,
    releaseTableMutation.error,
  ]);

  const isBusy = attachTableMutation.isPending || releaseTableMutation.isPending;

  return (
    <Stack>
      <PageHeader
        title="Mesas"
        description="Listar, filtrar y gestionar asignación/liberación de mesas por orden."
        actions={
          <Button
            variant="light"
            onClick={() => {
              void tablesQuery.refetch();
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
        <LoadingOverlay visible={tablesQuery.isFetching || isBusy} />
        <Stack>
          <Group align="flex-end" justify="space-between">
            <Select
              label="Filtro por estado"
              data={TABLE_STATUS_OPTIONS}
              value={statusFilter ?? ""}
              onChange={(value) =>
                setStatusFilter(value ? (value as TableStatus) : null)
              }
              w={220}
            />
          </Group>

          {!tablesQuery.isLoading && tableRows.length === 0 ? (
            <EmptyState
              title="Sin mesas"
              description="No se encontraron mesas con ese filtro."
            />
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tableRows.map((table) => (
                  <Table.Tr key={table.id}>
                    <Table.Td>{table.id}</Table.Td>
                    <Table.Td>{table.name}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={table.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </SectionCard>

      <SectionCard pos="relative">
        <LoadingOverlay visible={isBusy || freeTablesQuery.isFetching} />
        <Stack>
          <Text fw={600}>Asignar mesa a orden</Text>
          <Group align="flex-end">
            <NumberInput
              label="Order ID"
              min={1}
              allowDecimal={false}
              clampBehavior="strict"
              value={attachOrderId}
              onChange={(value) =>
                setAttachOrderId(typeof value === "number" ? value : "")
              }
              w={180}
            />
            <Select
              label="Mesa libre"
              data={freeTableOptions}
              value={attachTableId}
              onChange={setAttachTableId}
              w={220}
            />
            <Button
              onClick={async () => {
                if (
                  typeof attachOrderId !== "number" ||
                  !attachTableId
                )
                  return;
                await attachTableMutation.mutateAsync({
                  orderId: attachOrderId,
                  tableId: Number(attachTableId),
                });
                setAttachTableId(null);
                void tablesQuery.refetch();
                void freeTablesQuery.refetch();
              }}
              disabled={typeof attachOrderId !== "number" || !attachTableId}
            >
              Asignar
            </Button>
          </Group>
        </Stack>
      </SectionCard>

      <SectionCard pos="relative">
        <LoadingOverlay visible={isBusy} />
        <Stack>
          <Text fw={600}>Liberar mesa desde orden</Text>
          <Group align="flex-end">
            <NumberInput
              label="Order ID"
              min={1}
              allowDecimal={false}
              clampBehavior="strict"
              value={releaseOrderId}
              onChange={(value) =>
                setReleaseOrderId(typeof value === "number" ? value : "")
              }
              w={180}
            />
            <Button
              variant="light"
              color="red"
              onClick={async () => {
                if (typeof releaseOrderId !== "number") return;
                await releaseTableMutation.mutateAsync(releaseOrderId);
                void tablesQuery.refetch();
                void freeTablesQuery.refetch();
              }}
              disabled={typeof releaseOrderId !== "number"}
            >
              Liberar mesa
            </Button>
          </Group>
        </Stack>
      </SectionCard>
    </Stack>
  );
}
