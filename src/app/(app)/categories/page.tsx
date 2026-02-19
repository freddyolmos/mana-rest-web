"use client";

import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useEffect, useMemo, useState } from "react";
import { IconEdit, IconPlus } from "@tabler/icons-react";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { Role } from "@/lib/rbac";
import type { Category } from "@/features/categories/types";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/query";

type Mode = "create" | "edit";

type FormValues = {
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type Me = {
  userId: number;
  email: string;
  role: Role;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrio un error";
}

export default function CategoriesPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<Category | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const categoriesQuery = useCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();

  const form = useForm<FormValues>({
    initialValues: { name: "", sortOrder: 1, isActive: true },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : "Minimo 2 caracteres"),
      sortOrder: (v) => (v >= 1 ? null : "Debe ser mayor o igual a 1"),
    },
  });

  const title = useMemo(
    () => (mode === "create" ? "Nueva categoria" : "Editar categoria"),
    [mode],
  );

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) setMe(await res.json());
    })();
  }, []);

  const isAdmin = me?.role === "ADMIN";
  const rows = categoriesQuery.data ?? [];
  const loading = categoriesQuery.isFetching || categoriesQuery.isLoading;
  const saving =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const queryError = categoriesQuery.error
    ? getErrorMessage(categoriesQuery.error)
    : null;
  const mutationError = createCategoryMutation.error
    ? getErrorMessage(createCategoryMutation.error)
    : updateCategoryMutation.error
      ? getErrorMessage(updateCategoryMutation.error)
      : null;
  const error = queryError ?? mutationError;

  const onOpenCreate = () => {
    setMode("create");
    setSelected(null);
    form.setValues({ name: "", sortOrder: 1, isActive: true });
    form.resetDirty();
    open();
  };

  const onOpenEdit = (cat: Category) => {
    setMode("edit");
    setSelected(cat);
    form.setValues({
      name: cat.name,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    form.resetDirty();
    open();
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (mode === "create") {
        await createCategoryMutation.mutateAsync({
          name: values.name.trim(),
          sortOrder: values.sortOrder,
        });
      } else {
        if (!selected) return;
        await updateCategoryMutation.mutateAsync({
          id: selected.id,
          payload: {
            name: values.name.trim(),
            sortOrder: values.sortOrder,
            isActive: values.isActive,
          },
        });
      }

      close();
    } catch {}
  });

  return (
    <Stack>
      <PageHeader
        title="Categorías"
        description="Gestiona la clasificación del catálogo."
        actions={
          <>
            {isAdmin && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onOpenCreate}
              >
                Nueva
              </Button>
            )}
            <Button
              variant="light"
              onClick={() => {
                void categoriesQuery.refetch();
              }}
            >
              Recargar
            </Button>
          </>
        }
      />

      {error && (
        <SectionCard>
          <Text c="red">{error}</Text>
        </SectionCard>
      )}

      <SectionCard pos="relative">
        <LoadingOverlay visible={loading || saving} />

        {rows.length === 0 && !loading ? (
          <EmptyState
            title="No hay categorías"
            description="Crea la primera categoría para comenzar el catálogo."
          />
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Orden de clasificación</Table.Th>
                <Table.Th>Activa</Table.Th>
                <Table.Th ta="right">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {rows.map((cat) => (
                <Table.Tr key={cat.id}>
                  <Table.Td>{cat.id}</Table.Td>
                  <Table.Td>{cat.name}</Table.Td>
                  <Table.Td>{cat.sortOrder}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={cat.isActive ? "ACTIVE" : "INACTIVE"} />
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" gap="xs">
                      {isAdmin && (
                        <ActionIcon
                          variant="subtle"
                          onClick={() => onOpenEdit(cat)}
                          aria-label="Editar"
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </SectionCard>

      <Modal opened={opened} onClose={close} title={title} centered>
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Nombre"
              placeholder="Ej: Bebidas"
              {...form.getInputProps("name")}
            />

            <NumberInput
              label="Orden"
              min={1}
              {...form.getInputProps("sortOrder")}
            />

            <Switch
              label="Activa"
              {...form.getInputProps("isActive", { type: "checkbox" })}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
