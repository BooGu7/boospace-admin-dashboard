"use server";

import { revalidatePath } from "next/cache";
import { getOrdersService } from "@/lib/services/order.service";
import { createClient } from "@/lib/supabase/server";
import type { GetOrdersParams } from "@/types/order";

// 1. Định nghĩa kiểu trả về đồng nhất để tránh lỗi Type ở Hook
export type GetOrdersResponse = {
  success: boolean;
  data: any[];
  meta: { page: number; pageSize: number; total: number };
  error?: string;
};

/**
 * ACTION LẤY DANH SÁCH ĐƠN HÀNG
 */
export async function getOrders(params: GetOrdersParams): Promise<GetOrdersResponse> {
  try {
    const result = await getOrdersService(params);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      error: undefined,
    };
  } catch (error) {
    console.error("[GET_ORDERS_ACTION_ERROR]", error);
    return {
      success: false,
      data: [],
      meta: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        total: 0,
      },
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}

/**
 * ACTION CẬP NHẬT TRẠNG THÁI (HÀM ĐANG BỊ BÁO THIẾU)
 */
export async function updateOrderStatusAction(id: string, status: string) {
  try {
    const supabase = await createClient();

    // Cập nhật vào cột order_status (snake_case trong DB)
    const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", id);

    if (error) throw error;

    // Làm mới dữ liệu tại trang chi tiết và trang danh sách
    revalidatePath(`/dashboard/orders/${id}`);
    revalidatePath("/dashboard/orders");

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    return {
      success: false,
      error: error.message || "Không thể cập nhật trạng thái",
    };
  }
}
