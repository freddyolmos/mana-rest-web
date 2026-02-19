export type Category = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
  sortOrder: number;
};

export type UpdateCategoryInput = {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
};
