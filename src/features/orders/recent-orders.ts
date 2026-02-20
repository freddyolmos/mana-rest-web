"use client";

import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "mana_recent_order_ids";
const MAX_RECENT = 30;

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => Number(value))
      .filter((id) => Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
}

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  return parseIds(window.localStorage.getItem(STORAGE_KEY));
}

function writeIds(ids: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
}

export function useRecentOrderIds() {
  const [ids, setIds] = useState<number[]>(() => readIds());

  const save = useCallback((next: number[]) => {
    const deduped = Array.from(new Set(next)).filter((id) => id > 0);
    writeIds(deduped);
    setIds(deduped);
  }, []);

  const add = useCallback(
    (id: number) => {
      if (!Number.isInteger(id) || id <= 0) return;
      const current = readIds().filter((value) => value !== id);
      save([id, ...current]);
    },
    [save],
  );

  const remove = useCallback(
    (id: number) => {
      const current = readIds();
      save(current.filter((value) => value !== id));
    },
    [save],
  );

  const clear = useCallback(() => {
    save([]);
  }, [save]);

  return useMemo(
    () => ({
      ids,
      add,
      remove,
      clear,
    }),
    [ids, add, remove, clear],
  );
}
