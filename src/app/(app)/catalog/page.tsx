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
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconEdit, IconPlus, IconReload, IconToggleLeft } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/query";
import type { Category } from "@/features/categories/types";
import {
  useCreateModifierGroupMutation,
  useCreateModifierOptionMutation,
  useModifierGroupQuery,
  useModifierGroupsQuery,
  useToggleModifierGroupActiveMutation,
  useToggleModifierOptionActiveMutation,
  useUpdateModifierGroupMutation,
  useUpdateModifierOptionMutation,
} from "@/features/modifier-groups/query";
import type { ModifierGroup, ModifierOption } from "@/features/modifier-groups/types";

type CategoryFormValues = {
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type GroupFormValues = {
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  multi: boolean;
  isActive: boolean;
};

type OptionFormValues = {
  name: string;
  priceDelta: number;
  isActive: boolean;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Ocurrió un error";
}

export default function CatalogPage() {
  const categoriesQuery = useCategoriesQuery();
  const groupsQuery = useModifierGroupsQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const createGroupMutation = useCreateModifierGroupMutation();
  const updateGroupMutation = useUpdateModifierGroupMutation();
  const toggleGroupMutation = useToggleModifierGroupActiveMutation();
  const createOptionMutation = useCreateModifierOptionMutation();
  const updateOptionMutation = useUpdateModifierOptionMutation();
  const toggleOptionMutation = useToggleModifierOptionActiveMutation();

  const [categorySelected, setCategorySelected] = useState<Category | null>(null);
  const [groupSelected, setGroupSelected] = useState<ModifierGroup | null>(null);
  const [optionSelected, setOptionSelected] = useState<ModifierOption | null>(null);
  const [selectedGroupIdForOptions, setSelectedGroupIdForOptions] = useState<
    number | null
  >(null);

  const selectedGroupQuery = useModifierGroupQuery(selectedGroupIdForOptions);

  const [categoryOpened, categoryModal] = useDisclosure(false);
  const [groupOpened, groupModal] = useDisclosure(false);
  const [optionOpened, optionModal] = useDisclosure(false);

  const categoryForm = useForm<CategoryFormValues>({
    initialValues: { name: "", sortOrder: 0, isActive: true },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : "Mínimo 2 caracteres"),
      sortOrder: (v) => (v >= 0 ? null : "Debe ser >= 0"),
    },
  });

  const groupForm = useForm<GroupFormValues>({
    initialValues: {
      name: "",
      required: false,
      minSelect: 0,
      maxSelect: 1,
      multi: false,
      isActive: true,
    },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : "Mínimo 2 caracteres"),
      minSelect: (v) => (v >= 0 ? null : "Debe ser >= 0"),
      maxSelect: (v, values) =>
        v >= values.minSelect ? null : "Debe ser >= minSelect",
    },
  });

  const optionForm = useForm<OptionFormValues>({
    initialValues: {
      name: "",
      priceDelta: 0,
      isActive: true,
    },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : "Mínimo 2 caracteres"),
    },
  });

  const categorySaving =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const groupSaving =
    createGroupMutation.isPending ||
    updateGroupMutation.isPending ||
    toggleGroupMutation.isPending;
  const optionSaving =
    createOptionMutation.isPending ||
    updateOptionMutation.isPending ||
    toggleOptionMutation.isPending;

  const catalogError = useMemo(() => {
    const errors = [
      categoriesQuery.error,
      groupsQuery.error,
      selectedGroupQuery.error,
      createCategoryMutation.error,
      updateCategoryMutation.error,
      createGroupMutation.error,
      updateGroupMutation.error,
      createOptionMutation.error,
      updateOptionMutation.error,
    ].filter(Boolean);
    if (!errors.length) return null;
    return getErrorMessage(errors[0]);
  }, [
    categoriesQuery.error,
    groupsQuery.error,
    selectedGroupQuery.error,
    createCategoryMutation.error,
    updateCategoryMutation.error,
    createGroupMutation.error,
    updateGroupMutation.error,
    createOptionMutation.error,
    updateOptionMutation.error,
  ]);

  const categories = categoriesQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const options = selectedGroupQuery.data?.options ?? [];

  return (
    <Stack>
      <PageHeader
        title="Catálogo"
        description="Configuración de categorías, grupos de modificadores y opciones."
        actions={
          <Button
            leftSection={<IconReload size={16} />}
            variant="light"
            onClick={() => {
              void categoriesQuery.refetch();
              void groupsQuery.refetch();
              void selectedGroupQuery.refetch();
            }}
          >
            Recargar todo
          </Button>
        }
      />

      {catalogError && (
        <SectionCard>
          <Text c="red">{catalogError}</Text>
        </SectionCard>
      )}

      <Tabs defaultValue="categories">
        <Tabs.List>
          <Tabs.Tab value="categories">Categorías</Tabs.Tab>
          <Tabs.Tab value="groups">Grupos</Tabs.Tab>
          <Tabs.Tab value="options">Opciones</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="categories" pt="md">
          <SectionCard pos="relative">
            <LoadingOverlay visible={categoriesQuery.isFetching || categorySaving} />
            <Group justify="space-between">
              <Text fw={600}>Categorías</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setCategorySelected(null);
                  categoryForm.setValues({ name: "", sortOrder: 0, isActive: true });
                  categoryModal.open();
                }}
              >
                Nueva categoría
              </Button>
            </Group>

            {!categoriesQuery.isLoading && categories.length === 0 ? (
              <EmptyState
                title="Sin categorías"
                description="Agrega categorías para organizar tus productos."
              />
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Orden</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th ta="right">Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {categories.map((category) => (
                    <Table.Tr key={category.id}>
                      <Table.Td>{category.id}</Table.Td>
                      <Table.Td>{category.name}</Table.Td>
                      <Table.Td>{category.sortOrder}</Table.Td>
                      <Table.Td>
                        <StatusBadge
                          status={category.isActive ? "ACTIVE" : "INACTIVE"}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => {
                              setCategorySelected(category);
                              categoryForm.setValues({
                                name: category.name,
                                sortOrder: category.sortOrder,
                                isActive: category.isActive,
                              });
                              categoryModal.open();
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </SectionCard>
        </Tabs.Panel>

        <Tabs.Panel value="groups" pt="md">
          <SectionCard pos="relative">
            <LoadingOverlay visible={groupsQuery.isFetching || groupSaving} />
            <Group justify="space-between">
              <Text fw={600}>Grupos de modificadores</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setGroupSelected(null);
                  groupForm.setValues({
                    name: "",
                    required: false,
                    minSelect: 0,
                    maxSelect: 1,
                    multi: false,
                    isActive: true,
                  });
                  groupModal.open();
                }}
              >
                Nuevo grupo
              </Button>
            </Group>

            {!groupsQuery.isLoading && groups.length === 0 ? (
              <EmptyState
                title="Sin grupos"
                description="Crea grupos para personalizar productos."
              />
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Reglas</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th ta="right">Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {groups.map((group) => (
                    <Table.Tr key={group.id}>
                      <Table.Td>{group.id}</Table.Td>
                      <Table.Td>{group.name}</Table.Td>
                      <Table.Td>
                        min {group.minSelect} / max {group.maxSelect} /{" "}
                        {group.required ? "obligatorio" : "opcional"}
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={group.isActive ? "ACTIVE" : "INACTIVE"} />
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => {
                              setGroupSelected(group);
                              groupForm.setValues({
                                name: group.name,
                                required: group.required,
                                minSelect: group.minSelect,
                                maxSelect: group.maxSelect,
                                multi: group.multi,
                                isActive: group.isActive,
                              });
                              groupModal.open();
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color={group.isActive ? "gray" : "green"}
                            onClick={() => {
                              void toggleGroupMutation.mutateAsync(group.id);
                            }}
                          >
                            <IconToggleLeft size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </SectionCard>
        </Tabs.Panel>

        <Tabs.Panel value="options" pt="md">
          <SectionCard pos="relative">
            <LoadingOverlay visible={selectedGroupQuery.isFetching || optionSaving} />
            <Group justify="space-between" align="flex-end">
              <Select
                label="Grupo"
                placeholder="Selecciona grupo"
                data={groups.map((group) => ({
                  value: String(group.id),
                  label: group.name,
                }))}
                value={selectedGroupIdForOptions ? String(selectedGroupIdForOptions) : null}
                onChange={(value) =>
                  setSelectedGroupIdForOptions(value ? Number(value) : null)
                }
                w={320}
              />

              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setOptionSelected(null);
                  optionForm.setValues({ name: "", priceDelta: 0, isActive: true });
                  optionModal.open();
                }}
                disabled={!selectedGroupIdForOptions}
              >
                Nueva opción
              </Button>
            </Group>

            {!selectedGroupIdForOptions ? (
              <EmptyState
                title="Selecciona un grupo"
                description="Elige un grupo para gestionar sus opciones."
              />
            ) : !selectedGroupQuery.isLoading && options.length === 0 ? (
              <EmptyState
                title="Sin opciones"
                description="Este grupo aún no tiene opciones."
              />
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Precio extra</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th ta="right">Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {options.map((option) => (
                    <Table.Tr key={option.id}>
                      <Table.Td>{option.id}</Table.Td>
                      <Table.Td>{option.name}</Table.Td>
                      <Table.Td>${Number(option.priceDelta).toFixed(2)}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={option.isActive ? "ACTIVE" : "INACTIVE"} />
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => {
                              setOptionSelected(option);
                              optionForm.setValues({
                                name: option.name,
                                priceDelta: option.priceDelta,
                                isActive: option.isActive,
                              });
                              optionModal.open();
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color={option.isActive ? "gray" : "green"}
                            onClick={() => {
                              void toggleOptionMutation.mutateAsync(option.id);
                            }}
                          >
                            <IconToggleLeft size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </SectionCard>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={categoryOpened}
        onClose={categoryModal.close}
        title={categorySelected ? "Editar categoría" : "Nueva categoría"}
        centered
      >
        <form
          onSubmit={categoryForm.onSubmit(async (values) => {
            if (categorySelected) {
              await updateCategoryMutation.mutateAsync({
                id: categorySelected.id,
                payload: {
                  name: values.name.trim(),
                  sortOrder: values.sortOrder,
                  isActive: values.isActive,
                },
              });
            } else {
              await createCategoryMutation.mutateAsync({
                name: values.name.trim(),
                sortOrder: values.sortOrder,
              });
            }
            categoryModal.close();
          })}
        >
          <Stack>
            <TextInput label="Nombre" {...categoryForm.getInputProps("name")} />
            <NumberInput
              label="Orden"
              min={0}
              {...categoryForm.getInputProps("sortOrder")}
            />
            <Switch
              label="Activa"
              {...categoryForm.getInputProps("isActive", { type: "checkbox" })}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={categoryModal.close}>
                Cancelar
              </Button>
              <Button type="submit" loading={categorySaving}>
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={groupOpened}
        onClose={groupModal.close}
        title={groupSelected ? "Editar grupo" : "Nuevo grupo"}
        centered
      >
        <form
          onSubmit={groupForm.onSubmit(async (values) => {
            if (groupSelected) {
              await updateGroupMutation.mutateAsync({
                id: groupSelected.id,
                payload: {
                  name: values.name.trim(),
                  required: values.required,
                  minSelect: values.minSelect,
                  maxSelect: values.maxSelect,
                  multi: values.multi,
                  isActive: values.isActive,
                },
              });
            } else {
              await createGroupMutation.mutateAsync({
                name: values.name.trim(),
                required: values.required,
                minSelect: values.minSelect,
                maxSelect: values.maxSelect,
                multi: values.multi,
              });
            }
            groupModal.close();
          })}
        >
          <Stack>
            <TextInput label="Nombre" {...groupForm.getInputProps("name")} />
            <Switch
              label="Obligatorio"
              {...groupForm.getInputProps("required", { type: "checkbox" })}
            />
            <NumberInput
              label="Selección mínima"
              min={0}
              {...groupForm.getInputProps("minSelect")}
            />
            <NumberInput
              label="Selección máxima"
              min={0}
              {...groupForm.getInputProps("maxSelect")}
            />
            <Switch
              label="Multiselección"
              {...groupForm.getInputProps("multi", { type: "checkbox" })}
            />
            <Switch
              label="Activo"
              {...groupForm.getInputProps("isActive", { type: "checkbox" })}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={groupModal.close}>
                Cancelar
              </Button>
              <Button type="submit" loading={groupSaving}>
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={optionOpened}
        onClose={optionModal.close}
        title={optionSelected ? "Editar opción" : "Nueva opción"}
        centered
      >
        <form
          onSubmit={optionForm.onSubmit(async (values) => {
            if (!selectedGroupIdForOptions) return;
            if (optionSelected) {
              await updateOptionMutation.mutateAsync({
                id: optionSelected.id,
                payload: {
                  name: values.name.trim(),
                  priceDelta: values.priceDelta,
                  isActive: values.isActive,
                },
              });
            } else {
              await createOptionMutation.mutateAsync({
                groupId: selectedGroupIdForOptions,
                name: values.name.trim(),
                priceDelta: values.priceDelta,
              });
            }
            optionModal.close();
          })}
        >
          <Stack>
            <TextInput label="Nombre" {...optionForm.getInputProps("name")} />
            <NumberInput
              label="Precio extra"
              decimalScale={2}
              min={0}
              {...optionForm.getInputProps("priceDelta")}
            />
            <Switch
              label="Activa"
              {...optionForm.getInputProps("isActive", { type: "checkbox" })}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={optionModal.close}>
                Cancelar
              </Button>
              <Button type="submit" loading={optionSaving}>
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
