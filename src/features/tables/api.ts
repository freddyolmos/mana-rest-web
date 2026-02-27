import { apiRequest } from "@/lib/api-client";
import type { ListTablesFilters, TableEntity } from "./types";

const TABLES_PATH = "/tables";

export function listTables(filters?: ListTablesFilters) {
  return apiRequest<TableEntity[]>(TABLES_PATH, {
    query: {
      status: filters?.status,
    },
  });
}

export function getTableById(id: number) {
  return apiRequest<TableEntity>(`${TABLES_PATH}/${id}`);
}
