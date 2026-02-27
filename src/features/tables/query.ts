"use client";

import { useQuery } from "@tanstack/react-query";
import { getTableById, listTables } from "./api";
import type { ListTablesFilters } from "./types";

export const tablesQueryKeys = {
  all: ["tables"] as const,
  list: (filters?: ListTablesFilters) => [...tablesQueryKeys.all, { filters }] as const,
  detail: (id: number) => [...tablesQueryKeys.all, "detail", id] as const,
};

export function useTablesQuery(filters?: ListTablesFilters) {
  return useQuery({
    queryKey: tablesQueryKeys.list(filters),
    queryFn: () => listTables(filters),
  });
}

export function useTableQuery(id: number | null) {
  return useQuery({
    queryKey: id ? tablesQueryKeys.detail(id) : [...tablesQueryKeys.all, "detail", "idle"],
    queryFn: () => getTableById(id as number),
    enabled: typeof id === "number",
  });
}
