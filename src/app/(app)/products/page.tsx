"use client";

import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconReload,
  IconToggleLeft,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useCategoriesQuery } from "@/features/categories/query";
import type { Category } from "@/features/categories/types";
import { ApiError } from "@/lib/api-client";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useProductsQuery,
  useToggleProductActiveMutation,
  useUpdateProductMutation,
} from "@/features/products/query";
import type { Product } from "@/features/products/types";

type ProductFormValues = {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryId: string | null;
  isActive: boolean;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [categoryFilterId, setCategoryFilterId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const productsQuery = useProductsQuery({
    isActive: activeOnly ? true : undefined,
    categoryId: categoryFilterId ? Number(categoryFilterId) : undefined,
    q: debouncedSearch || undefined,
  });
  const categoriesQuery = useCategoriesQuery();
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const toggleProductMutation = useToggleProductActiveMutation();
  const deleteProductMutation = useDeleteProductMutation();

  const [productModalOpened, productModal] = useDisclosure(false);

  const productForm = useForm<ProductFormValues>({
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

  const products = productsQuery.data ?? [];

  const mappedCategoryData = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((category: Category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categoriesQuery.data],
  );

  const uiError = useMemo(() => {
    const errors = [
      productsQuery.error,
      categoriesQuery.error,
      createProductMutation.error,
      updateProductMutation.error,
      toggleProductMutation.error,
      deleteProductMutation.error,
    ].filter(Boolean);
    return errors.length > 0 ? getErrorMessage(errors[0]) : null;
  }, [
    productsQuery.error,
    categoriesQuery.error,
    createProductMutation.error,
    updateProductMutation.error,
    toggleProductMutation.error,
    deleteProductMutation.error,
  ]);

  const productSaving =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    toggleProductMutation.isPending ||
    deleteProductMutation.isPending;

  const onDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `¿Eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    try {
      await deleteProductMutation.mutateAsync(product.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        void productsQuery.refetch();
      }
    }
  };

  return (
    <Stack>
      <PageHeader
        title="Productos"
        description="Listado general. La configuración de modificadores se gestiona dentro del detalle."
        actions={
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setSelectedProduct(null);
                productForm.setValues({
                  name: "",
                  description: "",
                  imageUrl: "",
                  price: 0,
                  categoryId: null,
                  isActive: true,
                });
                productModal.open();
              }}
            >
              Nuevo producto
            </Button>
            <Button
              leftSection={<IconReload size={16} />}
              variant="light"
              onClick={() => {
                void productsQuery.refetch();
              }}
            >
              Recargar
            </Button>
          </Group>
        }
      />

      {uiError && (
        <SectionCard>
          <Text c="red">{uiError}</Text>
        </SectionCard>
      )}

      <SectionCard pos="relative">
        <LoadingOverlay visible={productsQuery.isFetching || productSaving} />
        <Group justify="space-between" align="flex-end">
          <Group align="flex-end">
            <TextInput
              label="Buscar"
              placeholder="Nombre de producto"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={320}
            />
            <Select
              label="Categoría"
              placeholder="Todas"
              data={mappedCategoryData}
              value={categoryFilterId}
              onChange={setCategoryFilterId}
              clearable
              w={240}
            />
          </Group>
          <Switch
            label="Solo activos"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.currentTarget.checked)}
          />
        </Group>

        {!productsQuery.isLoading && products.length === 0 ? (
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
                <Table.Th ta="right">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {products.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>{product.id}</Table.Td>
                  <Table.Td>{product.name}</Table.Td>
                  <Table.Td>{product.category?.name ?? "-"}</Table.Td>
                  <Table.Td>${Number(product.price).toFixed(2)}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={product.isActive ? "ACTIVE" : "INACTIVE"} />
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" gap="xs">
                      <ActionIcon
                        variant="subtle"
                        aria-label="Ver detalle"
                        component={Link}
                        href={`/products/${product.id}`}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        aria-label="Editar producto"
                        onClick={() => {
                          setSelectedProduct(product);
                          productForm.setValues({
                            name: product.name,
                            description: product.description ?? "",
                            imageUrl: product.imageUrl ?? "",
                            price: Number(product.price),
                            categoryId: product.categoryId
                              ? String(product.categoryId)
                              : null,
                            isActive: product.isActive,
                          });
                          productModal.open();
                        }}
                        disabled={productSaving}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color={product.isActive ? "gray" : "green"}
                        aria-label="Cambiar estado activo"
                        onClick={() => {
                          void toggleProductMutation.mutateAsync(product.id);
                        }}
                        disabled={productSaving}
                      >
                        <IconToggleLeft size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Eliminar producto"
                        onClick={() => {
                          void onDeleteProduct(product);
                        }}
                        disabled={productSaving}
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
      </SectionCard>

      <Modal
        opened={productModalOpened}
        onClose={productModal.close}
        title={selectedProduct ? "Editar producto" : "Nuevo producto"}
        centered
      >
        <form
          onSubmit={productForm.onSubmit(async (values) => {
            const payload = {
              name: values.name.trim(),
              description: values.description.trim() || undefined,
              imageUrl: values.imageUrl.trim() || undefined,
              price: Number(values.price),
              categoryId: Number(values.categoryId),
            };

            if (selectedProduct) {
              await updateProductMutation.mutateAsync({
                id: selectedProduct.id,
                payload: {
                  ...payload,
                  isActive: values.isActive,
                },
              });
            } else {
              await createProductMutation.mutateAsync(payload);
            }

            productModal.close();
          })}
        >
          <Stack>
            <TextInput label="Nombre" {...productForm.getInputProps("name")} />
            <TextInput
              label="Descripción"
              {...productForm.getInputProps("description")}
            />
            <TextInput label="Imagen URL" {...productForm.getInputProps("imageUrl")} />
            <NumberInput
              label="Precio"
              decimalScale={2}
              min={0}
              {...productForm.getInputProps("price")}
            />
            <Select
              label="Categoría"
              data={mappedCategoryData}
              {...productForm.getInputProps("categoryId")}
            />
            <Switch
              label="Activo"
              {...productForm.getInputProps("isActive", { type: "checkbox" })}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={productModal.close}>
                Cancelar
              </Button>
              <Button type="submit" loading={productSaving}>
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
