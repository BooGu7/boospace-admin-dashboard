import { getOrders } from "@/lib/repositories/order.repository";
import type { GetOrdersParams } from "@/types/order";

export async function getOrdersService(params: GetOrdersParams) {
  const result = await getOrders(params);

  return {
    data: result.data,
    meta: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      total: result.count ?? 0,
    },
    success: true,
  };
}
