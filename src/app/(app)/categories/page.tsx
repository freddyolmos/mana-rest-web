"use client";

import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useEffect, useMemo, useState } from "react";
import { IconEdit, IconPlus } from "@tabler/icons-react";

import type { Category } from "@/services/categories.service";
import {
  createCategory,
  listCategories,
  updateCategory,
} from "@/services/categories.service";

type Mode = "create" | "edit";

type FormValues = {
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type Me = {
  userId: number;
  email: string;
  role: "ADMIN" | "CASHIER" | "KITCHEN";
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrio un error";
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [opened, { open, close }] = useDisclosure(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<Category | null>(null);
  const [me, setMe] = useState<Me | null>(null);

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

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listCategories();
      setRows(data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
    setSaving(true);
    setError(null);

    try {
      if (mode === "create") {
        const created = await createCategory({
          name: values.name.trim(),
          sortOrder: values.sortOrder,
        });
        setRows((prev) => [created, ...prev]);
      } else {
        if (!selected) return;
        const updated = await updateCategory(selected.id, {
          name: values.name.trim(),
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        });
        setRows((prev) =>
          prev.map((x) => (x.id === selected.id ? updated : x)),
        );
      }

      close();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Categorias</Title>
        <Group>
          {isAdmin && (
            <Button leftSection={<IconPlus size={16} />} onClick={onOpenCreate}>
              Nueva
            </Button>
          )}
          <Button variant="light" onClick={load}>
            Recargar
          </Button>
        </Group>
      </Group>

      {error && (
        <Paper withBorder p="md">
          <Text c="red">{error}</Text>
        </Paper>
      )}

      <Paper withBorder p="md" pos="relative">
        <LoadingOverlay visible={loading || saving} />

        {rows.length === 0 && !loading ? (
          <Text c="dimmed">No hay categorias.</Text>
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
                  <Table.Td>{cat.isActive ? "Si" : "No"}</Table.Td>
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
      </Paper>

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
