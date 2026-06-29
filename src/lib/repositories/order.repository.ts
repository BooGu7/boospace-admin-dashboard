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

  if (search) {
    const keyword = `%${search}%`;
    query = query.or(`code.ilike.${keyword},customer_name.ilike.${keyword}`);
  }

  if (status) query = query.eq("order_status", status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.order(dbSortColumn, { ascending: sortOrder === "asc" }).range(from, to);

  if (error) throw new Error(error.message);

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
        products (
          name,
          images
        )
      )
    `,
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error);
    return null;
  }
  return data;
}
