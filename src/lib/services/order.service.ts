import { orderRepository } from "@/lib/repositories/order.repository";
import type { GetOrdersParams } from "@/types/order";

export const orderService = {
  async getOrders(params: GetOrdersParams) {
    const result = await orderRepository.getOrders(params);

    return {
      data: result.data,
      meta: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        total: result.count ?? 0, // Đã sửa từ result.meta thành result.count
      },
      success: true,
    };
  },
};
