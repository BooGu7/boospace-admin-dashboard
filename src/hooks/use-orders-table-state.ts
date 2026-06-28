"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortOrder = "asc" | "desc";

const DEFAULTS = {
  page: 1,
  pageSize: 10,
  search: "",
  status: "",
  payment: "",
  shipping: "",
  sortBy: "createdAt",
  sortOrder: "desc" as SortOrder,
} as const;

/**
 * =========================
 * SAFE PARSERS
 * =========================
 */
function safeNumber(value: string | null, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function parseSortOrder(value: string | null): SortOrder {
  return value === "asc" || value === "desc" ? value : DEFAULTS.sortOrder;
}

/**
 * =========================
 * HOOK
 * =========================
 */
export function useOrdersTableState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /**
   * PARSED STATE
   */
  const state = useMemo(() => {
    return {
      page: safeNumber(searchParams.get("page"), DEFAULTS.page),
      pageSize: safeNumber(searchParams.get("pageSize"), DEFAULTS.pageSize),

      search: searchParams.get("search") ?? DEFAULTS.search,
      status: searchParams.get("status") ?? DEFAULTS.status,
      payment: searchParams.get("payment") ?? DEFAULTS.payment,
      shipping: searchParams.get("shipping") ?? DEFAULTS.shipping,

      sortBy: searchParams.get("sortBy") ?? DEFAULTS.sortBy,
      sortOrder: parseSortOrder(searchParams.get("sortOrder")),
    };
  }, [searchParams]);

  /**
   * UPDATE PARAMS (CORE API)
   */
  const setParams = useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      router.replace(`?${current.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  /**
   * RESET
   */
  const resetParams = useCallback(() => {
    router.replace("?", { scroll: false });
  }, [router]);

  /**
   * CONVENIENCE WRAPPERS (FIX ERROR setPage)
   */
  const setPage = useCallback((page: number) => setParams({ page }), [setParams]);

  const setPageSize = useCallback((pageSize: number) => setParams({ pageSize }), [setParams]);

  return {
    ...state,
    setParams,
    resetParams,

    // 👇 FIX CHO ERROR BẠN ĐANG GẶP
    setPage,
    setPageSize,
  };
}
