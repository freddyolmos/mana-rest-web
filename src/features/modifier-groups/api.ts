import { apiRequest } from "@/lib/api-client";
import type {
  CreateModifierGroupInput,
  CreateModifierOptionInput,
  ModifierGroup,
  ModifierOption,
  UpdateModifierGroupInput,
  UpdateModifierOptionInput,
} from "./types";

const MODIFIER_GROUPS_PATH = "/modifier-groups";
const MODIFIER_OPTIONS_PATH = "/modifier-options";

export function listModifierGroups() {
  return apiRequest<ModifierGroup[]>(MODIFIER_GROUPS_PATH);
}

export function getModifierGroupById(id: number) {
  return apiRequest<ModifierGroup>(`${MODIFIER_GROUPS_PATH}/${id}`);
}

export function createModifierGroup(input: CreateModifierGroupInput) {
  return apiRequest<ModifierGroup>(MODIFIER_GROUPS_PATH, {
    method: "POST",
    body: input,
  });
}

export function updateModifierGroup(id: number, input: UpdateModifierGroupInput) {
  return apiRequest<ModifierGroup>(`${MODIFIER_GROUPS_PATH}/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function toggleModifierGroupActive(id: number) {
  return apiRequest<ModifierGroup>(`${MODIFIER_GROUPS_PATH}/${id}/toggle-active`, {
    method: "PATCH",
  });
}

export function deleteModifierGroup(id: number) {
  return apiRequest<void>(`${MODIFIER_GROUPS_PATH}/${id}`, {
    method: "DELETE",
  });
}

export function createModifierOption(input: CreateModifierOptionInput) {
  return apiRequest<ModifierOption>(MODIFIER_OPTIONS_PATH, {
    method: "POST",
    body: input,
  });
}

export function updateModifierOption(id: number, input: UpdateModifierOptionInput) {
  return apiRequest<ModifierOption>(`${MODIFIER_OPTIONS_PATH}/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function toggleModifierOptionActive(id: number) {
  return apiRequest<ModifierOption>(`${MODIFIER_OPTIONS_PATH}/${id}/toggle-active`, {
    method: "PATCH",
  });
}

export function deleteModifierOption(id: number) {
  return apiRequest<void>(`${MODIFIER_OPTIONS_PATH}/${id}`, {
    method: "DELETE",
  });
}
