"use server";

import { orderService } from "@/lib/services/order.service";
import type { GetOrdersParams } from "@/types/order"; // Import từ types

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export async function getOrders(params: GetOrdersParams) {
  try {
    const normalizedParams: GetOrdersParams = {
      search: params.search?.trim() ?? undefined,
      status: params.status ?? undefined,
      payment: params.payment ?? undefined,
      shipping: params.shipping ?? undefined,
      page: params.page && params.page > 0 ? params.page : DEFAULT_PAGE,
      pageSize: params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE,
      sortBy: params.sortBy ?? "createdAt",
      sortOrder: params.sortOrder ?? "desc",
    };

    const result = await orderService.getOrders(normalizedParams);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    console.error("[GET_ORDERS_ERROR]", error);
    return {
      success: false,
      data: [],
      meta: { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
