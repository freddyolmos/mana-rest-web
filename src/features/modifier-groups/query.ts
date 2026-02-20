"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createModifierGroup,
  createModifierOption,
  getModifierGroupById,
  listModifierGroups,
  toggleModifierGroupActive,
  toggleModifierOptionActive,
  updateModifierGroup,
  updateModifierOption,
} from "./api";
import type {
  CreateModifierGroupInput,
  CreateModifierOptionInput,
  UpdateModifierGroupInput,
  UpdateModifierOptionInput,
} from "./types";

export const modifierGroupsQueryKeys = {
  all: ["modifier-groups"] as const,
  list: () => [...modifierGroupsQueryKeys.all, "list"] as const,
  detail: (id: number) => [...modifierGroupsQueryKeys.all, "detail", id] as const,
};

export function useModifierGroupsQuery() {
  return useQuery({
    queryKey: modifierGroupsQueryKeys.list(),
    queryFn: listModifierGroups,
  });
}

export function useModifierGroupQuery(id: number | null) {
  return useQuery({
    queryKey: id
      ? modifierGroupsQueryKeys.detail(id)
      : [...modifierGroupsQueryKeys.all, "detail", "idle"],
    queryFn: () => getModifierGroupById(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateModifierGroupInput) => createModifierGroup(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: modifierGroupsQueryKeys.all });
    },
  });
}

export function useUpdateModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateModifierGroupInput }) =>
      updateModifierGroup(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: modifierGroupsQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: modifierGroupsQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useToggleModifierGroupActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleModifierGroupActive(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: modifierGroupsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: modifierGroupsQueryKeys.detail(id) });
    },
  });
}

export function useCreateModifierOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateModifierOptionInput) => createModifierOption(payload),
    onSuccess: (_data, payload) => {
      void queryClient.invalidateQueries({ queryKey: modifierGroupsQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: modifierGroupsQueryKeys.detail(payload.groupId),
      });
    },
  });
}

export function useUpdateModifierOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateModifierOptionInput }) =>
      updateModifierOption(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: modifierGroupsQueryKeys.all });
    },
  });
}

export function useToggleModifierOptionActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleModifierOptionActive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: modifierGroupsQueryKeys.all });
    },
  });
}
