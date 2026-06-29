"use client";

import { useEffect, useRef, useState } from "react";
import { type GetOrdersResponse, getOrders } from "@/actions/order.actions";
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

  // Bộ kích hoạt làm mới danh sách
  const [_refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger((prev) => prev + 1);

  const requestIdRef = useRef(0);

  const { search, status, payment, shipping, page, pageSize, sortBy, sortOrder } = params;

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res: GetOrdersResponse = await getOrders({
          search,
          status,
          payment,
          shipping,
          page,
          pageSize,
          sortBy,
          sortOrder,
        });

        if (requestId !== requestIdRef.current) return;

        if (!res.success) {
          throw new Error(res.error || "Fetch orders failed");
        }

        setData(res.data as Order[]);
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
  }, [search, status, payment, shipping, page, pageSize, sortBy, sortOrder]);

  return { data, count, loading, error, refresh };
}
