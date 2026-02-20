export type ModifierOption = {
  id: number;
  groupId: number;
  name: string;
  priceDelta: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ModifierGroup = {
  id: number;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  multi: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  options?: ModifierOption[];
};

export type CreateModifierGroupInput = {
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  multi: boolean;
};

export type UpdateModifierGroupInput = Partial<CreateModifierGroupInput> & {
  isActive?: boolean;
};

export type CreateModifierOptionInput = {
  groupId: number;
  name: string;
  priceDelta: number;
};

export type UpdateModifierOptionInput = Partial<{
  name: string;
  priceDelta: number;
  isActive: boolean;
}>;
