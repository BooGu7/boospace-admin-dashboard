"use client";

import { useEffect, useRef, useState } from "react";

import { getOrders } from "@/actions/order.actions";
import type { Order } from "@/types/order";

export type UseOrdersParams = {
  search?: string;
  status?: string;
  payment?: string;
  shipping?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export function useOrders(params: UseOrdersParams) {
  const [data, setData] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res = await getOrders(params);

        // ignore stale response
        if (requestId !== requestIdRef.current) return;

        if (!res.success) {
          throw new Error(res.error || "Fetch orders failed");
        }

        setData(res.data);
        setCount(res.meta?.total ?? 0);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setData([]);
        setCount(0);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [
    params.search,
    params.status,
    params.payment,
    params.shipping,
    params.page,
    params.pageSize,
    params.sortBy,
    params.sortOrder,
    params,
  ]);

  return {
    data,
    count,
    loading,
    error,
  };
}
