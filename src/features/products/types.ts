export type Product = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  isActive: boolean;
  categoryId?: number | null;
  category?: {
    id: number;
    name: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductFilters = {
  categoryId?: number;
  isActive?: boolean;
  q?: string;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  categoryId: number;
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  isActive?: boolean;
};
