"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconInfoCircle, IconReload, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useCategoriesQuery } from "@/features/categories/query";
import type { Category } from "@/features/categories/types";
import { useModifierGroupQuery, useModifierGroupsQuery } from "@/features/modifier-groups/query";
import {
  useAttachProductModifierGroupMutation,
  useDetachProductModifierGroupMutation,
  useProductModifierGroupsQuery,
} from "@/features/product-modifier-groups/query";
import {
  useProductQuery,
  useToggleProductActiveMutation,
  useUpdateProductMutation,
} from "@/features/products/query";

type ProductDetailsFormValues = {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryId: string | null;
  isActive: boolean;
};

type LinkFormValues = {
  groupId: string | null;
  sortOrder: number;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const [activeTab, setActiveTab] = useState<string | null>("general");
  const [selectedLinkedGroupId, setSelectedLinkedGroupId] = useState<number | null>(null);
  const [pendingUnlinkGroupId, setPendingUnlinkGroupId] = useState<number | null>(null);

  const productQuery = useProductQuery(Number.isFinite(productId) ? productId : null);
  const categoriesQuery = useCategoriesQuery();
  const modifierGroupsQuery = useModifierGroupsQuery();
  const linkedGroupsQuery = useProductModifierGroupsQuery(
    Number.isFinite(productId) ? productId : null,
  );
  const selectedGroupQuery = useModifierGroupQuery(selectedLinkedGroupId);

  const updateProductMutation = useUpdateProductMutation();
  const toggleProductMutation = useToggleProductActiveMutation();
  const attachGroupMutation = useAttachProductModifierGroupMutation();
  const detachGroupMutation = useDetachProductModifierGroupMutation();

  const form = useForm<ProductDetailsFormValues>({
    initialValues: {
      name: "",
      description: "",
      imageUrl: "",
      price: 0,
      categoryId: null,
      isActive: true,
    },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : "Mínimo 2 caracteres"),
      price: (v) => (v > 0 ? null : "Debe ser mayor a 0"),
      categoryId: (v) => (v ? null : "Selecciona una categoría"),
    },
  });

  const linkForm = useForm<LinkFormValues>({
    initialValues: {
      groupId: null,
      sortOrder: 0,
    },
    validate: {
      groupId: (v) => (v ? null : "Selecciona un grupo"),
      sortOrder: (v) => (v >= 0 ? null : "Debe ser >= 0"),
    },
  });

  const product = productQuery.data;
  const hydratedProductIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!product) {
      hydratedProductIdRef.current = null;
      return;
    }
    if (hydratedProductIdRef.current === product.id) return;

    form.setValues({
      name: product.name,
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
      price: Number(product.price),
      categoryId: product.categoryId ? String(product.categoryId) : null,
      isActive: product.isActive,
    });
    hydratedProductIdRef.current = product.id;
  }, [product, form]);

  const categoriesOptions = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((category: Category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categoriesQuery.data],
  );

  const linkedGroupOptions = useMemo(
    () =>
      (linkedGroupsQuery.data ?? []).map((item) => ({
        value: String(item.groupId),
        label: item.group?.name ?? `Grupo ${item.groupId}`,
      })),
    [linkedGroupsQuery.data],
  );

  const availableGroupsOptions = useMemo(() => {
    const assignedIds = new Set(
      (linkedGroupsQuery.data ?? []).map((item) => item.groupId),
    );
    return (modifierGroupsQuery.data ?? [])
      .filter((group) => !assignedIds.has(group.id))
      .map((group) => ({ value: String(group.id), label: group.name }));
  }, [linkedGroupsQuery.data, modifierGroupsQuery.data]);

  const linkedGroups = linkedGroupsQuery.data ?? [];

  const optionsInSelectedGroup = selectedGroupQuery.data?.options ?? [];

  const pageError = useMemo(() => {
    const errors = [
      productQuery.error,
      categoriesQuery.error,
      modifierGroupsQuery.error,
      linkedGroupsQuery.error,
      selectedGroupQuery.error,
      updateProductMutation.error,
      toggleProductMutation.error,
      attachGroupMutation.error,
      detachGroupMutation.error,
    ].filter(Boolean);
    return errors.length ? getErrorMessage(errors[0]) : null;
  }, [
    productQuery.error,
    categoriesQuery.error,
    modifierGroupsQuery.error,
    linkedGroupsQuery.error,
    selectedGroupQuery.error,
    updateProductMutation.error,
    toggleProductMutation.error,
    attachGroupMutation.error,
    detachGroupMutation.error,
  ]);

  const isSavingProduct =
    updateProductMutation.isPending || toggleProductMutation.isPending;
  const isSavingGroups =
    attachGroupMutation.isPending || detachGroupMutation.isPending;

  if (!Number.isFinite(productId)) {
    return (
      <Stack>
        <Alert color="red" title="ID inválido">
          El identificador del producto no es válido.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack>
      <Breadcrumbs>
        <Text component={Link} href="/products" c="dimmed" size="sm">
          Productos
        </Text>
        <Text size="sm" fw={600}>
          {product?.name ?? `Producto #${productId}`}
        </Text>
      </Breadcrumbs>

      <PageHeader
        title={product ? `Producto #${product.id}` : "Detalle de producto"}
        description="Edición del producto y configuración de modificadores."
        actions={
          <Group>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              component={Link}
              href="/products"
            >
              Volver
            </Button>
            <Button
              variant="light"
              leftSection={<IconReload size={16} />}
              onClick={() => {
                void productQuery.refetch();
                void linkedGroupsQuery.refetch();
                void selectedGroupQuery.refetch();
              }}
            >
              Recargar
            </Button>
          </Group>
        }
      />

      {pageError && (
        <SectionCard>
          <Text c="red">{pageError}</Text>
        </SectionCard>
      )}

      {!productQuery.isLoading && !product ? (
        <SectionCard>
          <EmptyState
            title="Producto no encontrado"
            description="Revisa el ID o vuelve al listado."
          />
        </SectionCard>
      ) : (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="modifiers">Modificadores</Tabs.Tab>
            <Tabs.Tab value="options">Opciones</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="md">
            <SectionCard pos="relative">
              <LoadingOverlay visible={productQuery.isFetching || isSavingProduct} />
              <form
                onSubmit={form.onSubmit(async (values) => {
                  await updateProductMutation.mutateAsync({
                    id: productId,
                    payload: {
                      name: values.name.trim(),
                      description: values.description.trim() || undefined,
                      imageUrl: values.imageUrl.trim() || undefined,
                      price: Number(values.price),
                      categoryId: Number(values.categoryId),
                      isActive: values.isActive,
                    },
                  });
                })}
              >
                <Stack>
                  <Group justify="space-between">
                    <Group>
                      <Text fw={600}>{product?.name ?? "Cargando..."}</Text>
                      {product ? (
                        <StatusBadge status={product.isActive ? "ACTIVE" : "INACTIVE"} />
                      ) : null}
                    </Group>
                    {product ? (
                      <Button
                        size="xs"
                        variant="light"
                        color={product.isActive ? "gray" : "green"}
                        onClick={async () => {
                          const updated = await toggleProductMutation.mutateAsync(
                            product.id,
                          );
                          form.setFieldValue("isActive", updated.isActive);
                        }}
                      >
                        {product.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    ) : null}
                  </Group>

                  {product ? (
                    <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                      Los cambios de este bloque actualizan solo los datos base del producto.
                    </Alert>
                  ) : null}

                  <TextInput label="Nombre" {...form.getInputProps("name")} />
                  <TextInput label="Descripción" {...form.getInputProps("description")} />
                  <TextInput label="Imagen URL" {...form.getInputProps("imageUrl")} />
                  <NumberInput
                    label="Precio"
                    decimalScale={2}
                    min={0}
                    {...form.getInputProps("price")}
                  />
                  <Select
                    label="Categoría"
                    data={categoriesOptions}
                    {...form.getInputProps("categoryId")}
                  />
                  <Switch
                    label="Activo"
                    {...form.getInputProps("isActive", { type: "checkbox" })}
                  />

                  <Group justify="flex-end">
                    <Button type="submit" loading={isSavingProduct}>
                      Guardar cambios
                    </Button>
                  </Group>
                </Stack>
              </form>
            </SectionCard>
          </Tabs.Panel>

          <Tabs.Panel value="modifiers" pt="md">
            <SectionCard pos="relative">
              <LoadingOverlay visible={linkedGroupsQuery.isFetching || isSavingGroups} />
              <Stack>
                <Text fw={600}>Grupos de modificadores vinculados</Text>
                <form
                  onSubmit={linkForm.onSubmit(async (values) => {
                    if (!values.groupId) return;
                    await attachGroupMutation.mutateAsync({
                      productId,
                      payload: {
                        groupId: Number(values.groupId),
                        sortOrder: values.sortOrder,
                      },
                    });
                    linkForm.setValues({ groupId: null, sortOrder: 0 });
                  })}
                >
                  <Group align="flex-end">
                    <Select
                      label="Grupo disponible"
                      data={availableGroupsOptions}
                      placeholder="Selecciona grupo"
                      w={280}
                      {...linkForm.getInputProps("groupId")}
                    />
                    <NumberInput
                      label="Orden"
                      min={0}
                      w={120}
                      {...linkForm.getInputProps("sortOrder")}
                    />
                    <Button type="submit">Vincular</Button>
                  </Group>
                </form>

                {!linkedGroupsQuery.isLoading && linkedGroups.length === 0 ? (
                  <EmptyState
                    title="Sin grupos vinculados"
                    description="Asigna grupos para habilitar modificadores en el POS."
                  />
                ) : (
                  <Table highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Grupo</Table.Th>
                        <Table.Th>Orden</Table.Th>
                        <Table.Th>Estado</Table.Th>
                        <Table.Th ta="right">Acciones</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {linkedGroups.map((item) => (
                        <Table.Tr key={`${item.productId}-${item.groupId}`}>
                          <Table.Td>{item.group?.name ?? `Grupo ${item.groupId}`}</Table.Td>
                          <Table.Td>{item.sortOrder}</Table.Td>
                          <Table.Td>
                            <Badge variant="light">Group ID: {item.groupId}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group justify="flex-end">
                              <Button
                                size="xs"
                                variant="subtle"
                                onClick={() => {
                                  setSelectedLinkedGroupId(item.groupId);
                                  setActiveTab("options");
                                }}
                              >
                                Ver opciones
                              </Button>
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => setPendingUnlinkGroupId(item.groupId)}
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
              </Stack>
            </SectionCard>
          </Tabs.Panel>

          <Tabs.Panel value="options" pt="md">
            <SectionCard pos="relative">
              <LoadingOverlay visible={selectedGroupQuery.isFetching} />
              <Stack>
                <Group justify="space-between" align="flex-end">
                  <Select
                    label="Grupo vinculado"
                    placeholder="Selecciona grupo"
                    data={linkedGroupOptions}
                    value={selectedLinkedGroupId ? String(selectedLinkedGroupId) : null}
                    onChange={(value) =>
                      setSelectedLinkedGroupId(value ? Number(value) : null)
                    }
                    w={280}
                  />
                </Group>

                {!selectedLinkedGroupId ? (
                  <EmptyState
                    title="Selecciona un grupo"
                    description="Elige un grupo vinculado para revisar sus opciones."
                  />
                ) : !selectedGroupQuery.isLoading && optionsInSelectedGroup.length === 0 ? (
                  <EmptyState
                    title="Sin opciones"
                    description="Este grupo no tiene opciones configuradas."
                  />
                ) : (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Nombre</Table.Th>
                        <Table.Th>Precio extra</Table.Th>
                        <Table.Th>Estado</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {optionsInSelectedGroup.map((option) => (
                        <Table.Tr key={option.id}>
                          <Table.Td>{option.id}</Table.Td>
                          <Table.Td>{option.name}</Table.Td>
                          <Table.Td>${Number(option.priceDelta).toFixed(2)}</Table.Td>
                          <Table.Td>
                            <StatusBadge status={option.isActive ? "ACTIVE" : "INACTIVE"} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            </SectionCard>
          </Tabs.Panel>
        </Tabs>
      )}

      <Modal
        opened={pendingUnlinkGroupId !== null}
        onClose={() => setPendingUnlinkGroupId(null)}
        title="Desvincular grupo"
        centered
      >
        <Stack>
          <Text size="sm">
            ¿Seguro que quieres desvincular este grupo del producto? Esta acción
            afectará las opciones disponibles en POS.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPendingUnlinkGroupId(null)}>
              Cancelar
            </Button>
            <Button
              color="red"
              loading={detachGroupMutation.isPending}
              onClick={async () => {
                if (pendingUnlinkGroupId === null) return;
                await detachGroupMutation.mutateAsync({
                  productId,
                  groupId: pendingUnlinkGroupId,
                });
                if (selectedLinkedGroupId === pendingUnlinkGroupId) {
                  setSelectedLinkedGroupId(null);
                }
                setPendingUnlinkGroupId(null);
              }}
            >
              Desvincular
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
