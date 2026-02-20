export type ProductModifierGroup = {
  productId: number;
  groupId: number;
  sortOrder: number;
  group?: {
    id: number;
    name: string;
    isActive?: boolean;
  } | null;
};

export type AttachProductModifierGroupInput = {
  groupId: number;
  sortOrder: number;
};
