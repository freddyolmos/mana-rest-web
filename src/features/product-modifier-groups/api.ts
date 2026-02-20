import { apiRequest } from "@/lib/api-client";
import type {
  AttachProductModifierGroupInput,
  ProductModifierGroup,
} from "./types";

export function listProductModifierGroups(productId: number) {
  return apiRequest<ProductModifierGroup[]>(
    `/products/${productId}/modifier-groups`,
  );
}

export function attachProductModifierGroup(
  productId: number,
  input: AttachProductModifierGroupInput,
) {
  return apiRequest<ProductModifierGroup>(`/products/${productId}/modifier-groups`, {
    method: "POST",
    body: input,
  });
}

export function detachProductModifierGroup(productId: number, groupId: number) {
  return apiRequest<{ ok: boolean }>(
    `/products/${productId}/modifier-groups/${groupId}`,
    {
      method: "DELETE",
    },
  );
}
