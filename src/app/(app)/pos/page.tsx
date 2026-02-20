"use client";

import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { IconPlus, IconReload, IconSend, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getModifierGroupById } from "@/features/modifier-groups/api";
import { modifierGroupsQueryKeys } from "@/features/modifier-groups/query";
import { useProductsQuery } from "@/features/products/query";
import { useProductModifierGroupsQuery } from "@/features/product-modifier-groups/query";
import type { OrderType } from "@/features/orders/types";
import {
  useAddOrderItemMutation,
  useCreateOrderMutation,
  useOrderQuery,
  useRemoveOrderItemMutation,
  useSendOrderToKitchenMutation,
} from "@/features/orders/query";
import { useRecentOrderIds } from "@/features/orders/recent-orders";

const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: "DINE_IN", label: "Comer aquí" },
  { value: "TAKEOUT", label: "Para llevar" },
  { value: "DELIVERY", label: "Delivery" },
];

type CreateOrderValues = {
  type: OrderType;
  notes: string;
};

type AddItemValues = {
  productId: string | null;
  qty: number;
  notes: string;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function PosPage() {
  const recentOrders = useRecentOrderIds();
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [modifierSelections, setModifierSelections] = useState<
    Record<number, number[]>
  >({});
  const [modifierValidationError, setModifierValidationError] = useState<
    string | null
  >(null);

  const shouldLoadProducts = activeOrderId !== null;
  const productsQuery = useProductsQuery(
    { isActive: true },
    { enabled: shouldLoadProducts },
  );
  const orderQuery = useOrderQuery(activeOrderId);
  const createOrderMutation = useCreateOrderMutation();
  const addItemMutation = useAddOrderItemMutation();
  const removeItemMutation = useRemoveOrderItemMutation();
  const sendToKitchenMutation = useSendOrderToKitchenMutation();

  const orderForm = useForm<CreateOrderValues>({
    initialValues: {
      type: "TAKEOUT",
      notes: "",
    },
  });

  const itemForm = useForm<AddItemValues>({
    initialValues: {
      productId: null,
      qty: 1,
      notes: "",
    },
    validate: {
      productId: (v) => (v ? null : "Selecciona un producto"),
      qty: (v) => (v >= 1 ? null : "Debe ser mayor o igual a 1"),
    },
  });

  const selectedProductId = useMemo(() => {
    const value = itemForm.values.productId;
    if (!value) return null;
    const num = Number(value);
    return Number.isInteger(num) && num > 0 ? num : null;
  }, [itemForm.values.productId]);

  const productModifierGroupsQuery = useProductModifierGroupsQuery(selectedProductId);
  const modifierGroupsDetailsQueries = useQueries({
    queries: (productModifierGroupsQuery.data ?? []).map((link) => ({
      queryKey: modifierGroupsQueryKeys.detail(link.groupId),
      queryFn: () => getModifierGroupById(link.groupId),
      enabled: typeof selectedProductId === "number",
    })),
  });

  const productOptions = useMemo(
    () =>
      (productsQuery.data ?? []).map((product) => ({
        value: String(product.id),
        label: `${product.name} - $${Number(product.price).toFixed(2)}`,
      })),
    [productsQuery.data],
  );

  const activeOrder = orderQuery.data;

  const modifierGroupsForSelectedProduct = useMemo(() => {
    const links = productModifierGroupsQuery.data ?? [];
    if (!links.length) return [];
    const detailsById = new Map(
      modifierGroupsDetailsQueries
        .map((query) => query.data)
        .filter((group): group is NonNullable<typeof group> => Boolean(group))
        .map((group) => [group.id, group]),
    );
    return links
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((link) => ({
        link,
        group: detailsById.get(link.groupId),
      }))
      .filter((entry) => Boolean(entry.group))
      .map((entry) => ({
        ...entry.link,
        group: entry.group!,
      }));
  }, [productModifierGroupsQuery.data, modifierGroupsDetailsQueries]);

  const modifierOptionsLoading =
    productModifierGroupsQuery.isFetching ||
    modifierGroupsDetailsQueries.some((query) => query.isFetching);
  const modifierOptionsError =
    productModifierGroupsQuery.error ??
    modifierGroupsDetailsQueries.find((query) => query.error)?.error;

  const pageError = useMemo(() => {
    const errors = [
      productsQuery.error,
      modifierOptionsError,
      orderQuery.error,
      createOrderMutation.error,
      addItemMutation.error,
      removeItemMutation.error,
      sendToKitchenMutation.error,
    ].filter(Boolean);
    return errors.length ? getErrorMessage(errors[0]) : null;
  }, [
    productsQuery.error,
    modifierOptionsError,
    orderQuery.error,
    createOrderMutation.error,
    addItemMutation.error,
    removeItemMutation.error,
    sendToKitchenMutation.error,
  ]);

  const isBusy =
    createOrderMutation.isPending ||
    addItemMutation.isPending ||
    removeItemMutation.isPending ||
    sendToKitchenMutation.isPending;

  return (
    <Stack>
      <PageHeader
        title="POS"
        description="Crear orden, agregar ítems y enviar a cocina."
        actions={
          <Button
            variant="light"
            leftSection={<IconReload size={16} />}
            onClick={() => {
              if (shouldLoadProducts) void productsQuery.refetch();
              void orderQuery.refetch();
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
          <Text fw={600}>1) Crear orden</Text>
          <form
            onSubmit={orderForm.onSubmit(async (values) => {
              const created = await createOrderMutation.mutateAsync({
                type: values.type,
                notes: values.notes.trim() || undefined,
              });
              setActiveOrderId(created.id);
              recentOrders.add(created.id);
              itemForm.reset();
              setModifierSelections({});
              setModifierValidationError(null);
            })}
          >
            <Group align="flex-end">
              <Select
                label="Tipo"
                data={ORDER_TYPE_OPTIONS}
                w={220}
                {...orderForm.getInputProps("type")}
              />
              <Textarea
                label="Notas"
                placeholder="Ej: sin cebolla"
                w={320}
                autosize
                minRows={1}
                maxRows={2}
                {...orderForm.getInputProps("notes")}
              />
              <Button type="submit" leftSection={<IconPlus size={16} />}>
                Crear orden
              </Button>
            </Group>
          </form>
        </Stack>
      </SectionCard>

      <SectionCard pos="relative">
        <LoadingOverlay visible={orderQuery.isFetching || isBusy} />
        <Stack>
          <Group justify="space-between">
            <Text fw={600}>2) Orden activa</Text>
            <Group>
              <Select
                label="Cargar orden"
                placeholder="Recientes"
                data={recentOrders.ids.map((id) => ({
                  value: String(id),
                  label: `Orden #${id}`,
                }))}
                value={activeOrderId ? String(activeOrderId) : null}
                onChange={(value) => setActiveOrderId(value ? Number(value) : null)}
                w={220}
                clearable
              />
            </Group>
          </Group>

          {!activeOrderId ? (
            <EmptyState
              title="Sin orden activa"
              description="Crea o selecciona una orden para comenzar a agregar ítems."
            />
          ) : !activeOrder ? (
            <EmptyState
              title="Cargando orden"
              description="Espera mientras obtenemos el detalle de la orden."
            />
          ) : (
            <Stack>
              <Group gap="xl">
                <Text>
                  <Text span fw={600}>
                    Orden:
                  </Text>{" "}
                  #{activeOrder.id}
                </Text>
                <Text>
                  <Text span fw={600}>
                    Tipo:
                  </Text>{" "}
                  {activeOrder.type}
                </Text>
                <StatusBadge status={activeOrder.status} />
              </Group>

              <form
                onSubmit={itemForm.onSubmit(async (values) => {
                  if (!activeOrderId) return;
                  setModifierValidationError(null);
                  const missingRequiredGroups = modifierGroupsForSelectedProduct
                    .filter((entry) => {
                      const selected = modifierSelections[entry.group.id] ?? [];
                      const minRequired = Math.max(
                        entry.group.required ? 1 : 0,
                        entry.group.minSelect ?? 0,
                      );
                      return selected.length < minRequired;
                    })
                    .map((entry) => entry.group.name);

                  if (missingRequiredGroups.length > 0) {
                    setModifierValidationError(
                      `Faltan grupos requeridos: ${missingRequiredGroups.join(", ")}`,
                    );
                    return;
                  }

                  const modifiers = modifierGroupsForSelectedProduct
                    .map((entry) => {
                      const optionIds = modifierSelections[entry.group.id] ?? [];
                      return {
                        groupId: entry.group.id,
                        optionIds,
                      };
                    })
                    .filter((entry) => entry.optionIds.length > 0);

                  await addItemMutation.mutateAsync({
                    orderId: activeOrderId,
                    payload: {
                      productId: Number(values.productId),
                      qty: values.qty,
                      notes: values.notes.trim() || undefined,
                      modifiers,
                    },
                  });
                  itemForm.setFieldValue("productId", null);
                  itemForm.setFieldValue("qty", 1);
                  itemForm.setFieldValue("notes", "");
                  setModifierSelections({});
                  setModifierValidationError(null);
                })}
              >
                <Stack gap="sm">
                  <Group align="flex-end">
                  <Select
                    label="Producto"
                    placeholder="Selecciona producto"
                    data={productOptions}
                    searchable
                    w={360}
                    disabled={!shouldLoadProducts}
                    value={itemForm.values.productId}
                    onChange={(value) => {
                      itemForm.setFieldValue("productId", value);
                      setModifierSelections({});
                      setModifierValidationError(null);
                    }}
                    error={itemForm.errors.productId}
                  />
                  <NumberInput
                    label="Cantidad"
                    min={1}
                    w={120}
                    {...itemForm.getInputProps("qty")}
                  />
                  <TextInput
                    label="Notas"
                    placeholder="Opcional"
                    w={260}
                    {...itemForm.getInputProps("notes")}
                  />
                  <Button type="submit" leftSection={<IconPlus size={16} />}>
                    Agregar ítem
                  </Button>
                  </Group>

                  {modifierValidationError && (
                    <Text c="red" size="sm">
                      {modifierValidationError}
                    </Text>
                  )}

                  {selectedProductId && (
                    <SectionCard pos="relative">
                      <LoadingOverlay visible={modifierOptionsLoading} />
                      <Stack gap="sm">
                        <Text fw={600} size="sm">
                          Modificadores del producto
                        </Text>
                        {modifierOptionsError ? (
                          <Text c="red" size="sm">
                            {getErrorMessage(modifierOptionsError)}
                          </Text>
                        ) : modifierGroupsForSelectedProduct.length === 0 ? (
                          <Text c="dimmed" size="sm">
                            Este producto no tiene grupos de modificadores vinculados.
                          </Text>
                        ) : (
                          modifierGroupsForSelectedProduct.map((entry) => {
                            const options = (entry.group.options ?? [])
                              .filter((option) => option.isActive)
                              .map((option) => ({
                                value: String(option.id),
                                label: `${option.name}${option.priceDelta ? ` (+$${Number(option.priceDelta).toFixed(2)})` : ""}`,
                              }));
                            const selectedValues =
                              modifierSelections[entry.group.id] ?? [];
                            const hint = `min ${entry.group.minSelect} / max ${entry.group.maxSelect}`;

                            if (entry.group.multi || entry.group.maxSelect > 1) {
                              return (
                                <MultiSelect
                                  key={entry.group.id}
                                  label={`${entry.group.name}${entry.group.required ? " *" : ""}`}
                                  description={hint}
                                  data={options}
                                  searchable
                                  value={selectedValues.map(String)}
                                  maxValues={entry.group.maxSelect || undefined}
                                  onChange={(values) => {
                                    setModifierSelections((prev) => ({
                                      ...prev,
                                      [entry.group.id]: values.map(Number),
                                    }));
                                  }}
                                />
                              );
                            }

                            return (
                              <Select
                                key={entry.group.id}
                                label={`${entry.group.name}${entry.group.required ? " *" : ""}`}
                                description={hint}
                                data={options}
                                value={
                                  selectedValues.length > 0
                                    ? String(selectedValues[0])
                                    : null
                                }
                                onChange={(value) => {
                                  setModifierSelections((prev) => ({
                                    ...prev,
                                    [entry.group.id]: value ? [Number(value)] : [],
                                  }));
                                }}
                                clearable={!entry.group.required}
                              />
                            );
                          })
                        )}
                      </Stack>
                    </SectionCard>
                  )}
                </Stack>
              </form>

              {!activeOrder.items?.length ? (
                <EmptyState
                  title="Sin ítems"
                  description="Agrega al menos un producto a la orden."
                />
              ) : (
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item</Table.Th>
                      <Table.Th>Producto</Table.Th>
                      <Table.Th>Cantidad</Table.Th>
                      <Table.Th>Estado</Table.Th>
                      <Table.Th ta="right">Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {activeOrder.items.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>#{item.id}</Table.Td>
                        <Table.Td>{item.product?.name ?? item.productId}</Table.Td>
                        <Table.Td>{item.qty}</Table.Td>
                        <Table.Td>
                          <StatusBadge status={item.status ?? "PENDING"} />
                        </Table.Td>
                        <Table.Td>
                          <Group justify="flex-end">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                if (!activeOrderId) return;
                                void removeItemMutation.mutateAsync({
                                  orderId: activeOrderId,
                                  itemId: item.id,
                                });
                              }}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}

              <Group justify="flex-end">
                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={() => {
                    if (!activeOrderId) return;
                    void sendToKitchenMutation.mutateAsync(activeOrderId);
                  }}
                  disabled={activeOrder.status !== "OPEN" || !activeOrder.items?.length}
                >
                  Enviar a cocina
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      </SectionCard>
    </Stack>
  );
}
