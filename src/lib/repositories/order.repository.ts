// import { createClient } from "@/lib/supabase/server";
// import type { GetOrdersParams } from "@/types/order";

// const SORT_MAP: Record<string, string> = {
//   createdAt: "created_at",
//   total: "total",
//   code: "code",
//   customerName: "customer_name",
// };

// /**
//  * TRUY VẤN DANH SÁCH ĐƠN HÀNG (Kèm tìm kiếm và bộ lọc)
//  */
// export async function getOrders(params: GetOrdersParams) {
//   const supabase = await createClient();

//   const {
//     search,
//     status,
//     page = 1,
//     pageSize = 10,
//     sortBy = "createdAt",
//     sortOrder = "desc",
//   } = params;

//   // Cơ chế phòng thủ: Nhận diện cả 'status' hoặc 'orderStatus' truyền từ Client
//   const activeStatus = status || (params as any).orderStatus;

//   const dbSortColumn = SORT_MAP[sortBy] || "created_at";

//   let query = supabase.from("orders").select(
//     `
//       id,
//       code,
//       customerName:customer_name,
//       total,
//       orderStatus:order_status,
//       createdAt:created_at
//     `,
//     { count: "exact" },
//   );

//   // SỬA LỖI TÌM KIẾM: Sử dụng dấu * thay vì % cho .or() của Supabase/PostgREST
//   if (search && search.trim() !== "") {
//     const cleanSearch = search.trim();
//     query = query.or(
//       `code.ilike.*${cleanSearch}*,customer_name.ilike.*${cleanSearch}*`,
//     );
//   }

//   // Bộ lọc trạng thái
//   if (activeStatus && activeStatus !== "all") {
//     query = query.eq("order_status", activeStatus);
//   }

//   const from = (page - 1) * pageSize;
//   const to = from + pageSize - 1;

//   const { data, error, count } = await query
//     .order(dbSortColumn, { ascending: sortOrder === "asc" })
//     .range(from, to);

//   if (error) {
//     console.error("[ORDER_REPOSITORY_ERROR]", error);
//     throw new Error(error.message);
//   }

//   return {
//     data: data ?? [],
//     count: count ?? 0,
//   };
// }

// /**
//  * TRUY VẤN CHI TIẾT 1 ĐƠN HÀNG
//  */
// export async function getOrderWithDetails(orderId: string) {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("orders")
//     .select(
//       `
//       id,
//       code,
//       customerName:customer_name,
//       customerEmail:customer_email,
//       total,
//       orderStatus:order_status,
//       paymentStatus:payment_status,
//       createdAt:created_at,
//       order_items (
//         id,
//         quantity,
//         unitPrice:unit_price,
//         totalPrice:total_price,
//         products (
//           name,
//           images
//         )
//       )
//     `,
//     )
//     .eq("id", orderId)
//     .single();

//   if (error) {
//     console.error("Lỗi lấy chi tiết đơn hàng:", error);
//     return null;
//   }
//   return data;
// }

// /**
//  * THỐNG KÊ DOANH THU ĐỂ VẼ BIỂU ĐỒ OVERVIEW
//  */
// export async function getDashboardStats() {
//   const supabase = await createClient();

//   // 1. Tính tổng doanh thu (Chỉ tính các đơn không bị hủy)
//   const { data: orders } = await supabase
//     .from("orders")
//     .select("total, created_at")
//     .neq("order_status", "Cancelled");

//   const totalRevenue =
//     orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
//   const totalOrders = orders?.length || 0;

//   // 2. Chuẩn bị dữ liệu cho biểu đồ (Doanh thu theo ngày trong 7 ngày gần nhất)
//   const last7Days = Array.from({ length: 7 }, (_, i) => {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     return d.toISOString().split("T")[0];
//   }).reverse();

//   const chartData = last7Days.map((date) => {
//     const dailyTotal =
//       orders
//         ?.filter((o) => o.created_at.startsWith(date))
//         .reduce((sum, o) => sum + Number(o.total), 0) || 0;

//     return {
//       date: new Date(date).toLocaleDateString("vi-VN", {
//         day: "2-digit",
//         month: "2-digit",
//       }),
//       revenue: dailyTotal,
//     };
//   });

//   return {
//     totalRevenue,
//     totalOrders,
//     chartData,
//   };
// }

// /**
//  * XÓA ĐƠN HÀNG THEO ID
//  */
// export async function deleteOrder(id: string) {
//   const supabase = await createClient();
//   const { error } = await supabase.from("orders").delete().eq("id", id);

//   if (error) {
//     console.error("[DELETE_ORDER_ERROR]", error);
//     throw new Error(error.message);
//   }
//   return true;
// }

import { createClient } from "@/lib/supabase/server";
import type { GetOrdersParams } from "@/types/order";

const SORT_MAP: Record<string, string> = {
  createdAt: "created_at",
  total: "total",
  code: "code",
  customerName: "customer_name",
};

export async function getOrders(params: GetOrdersParams) {
  const supabase = await createClient();

  const { search, status, page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc" } = params;

  const activeStatus = status || (params as any).orderStatus;
  const dbSortColumn = SORT_MAP[sortBy] || "created_at";

  let query = supabase.from("orders").select(
    `
      id,
      code,
      customerName:customer_name,
      total,
      orderStatus:order_status,
      createdAt:created_at
    `,
    { count: "exact" },
  );

  // FIX LỖI TÌM KIẾM: Thay thế % bằng * để PostgREST hoạt động đúng [6]
  if (search && search.trim() !== "") {
    const cleanSearch = search.trim();
    query = query.or(`code.ilike.*${cleanSearch}*,customer_name.ilike.*${cleanSearch}*`);
  }

  if (activeStatus && activeStatus !== "all") {
    query = query.eq("order_status", activeStatus);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.order(dbSortColumn, { ascending: sortOrder === "asc" }).range(from, to);

  if (error) {
    console.error("[ORDER_REPOSITORY_ERROR]", error);
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    count: count ?? 0,
  };
}

export async function getOrderWithDetails(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      code,
      customerName:customer_name,
      customerEmail:customer_email,
      total,
      orderStatus:order_status,
      paymentStatus:payment_status,
      createdAt:created_at,
      order_items (
        id,
        quantity,
        unitPrice:unit_price,
        totalPrice:total_price,
        products (name, images)
      )
    `,
    )
    .eq("id", orderId)
    .single();

  if (error) return null;
  return data;
}

export async function deleteOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
  return true;
}
