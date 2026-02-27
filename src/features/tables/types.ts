export type TableStatus = "FREE" | "OCCUPIED";

export type TableEntity = {
  id: number;
  name: string;
  status: TableStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ListTablesFilters = {
  status?: TableStatus;
};
