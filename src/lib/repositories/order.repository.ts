import { createClient } from "@/lib/supabase/server";
import type { GetOrdersParams } from "@/types/order";

/**
 * =========================
 * ALLOWED SORT FIELDS (SECURITY LAYER)
 * =========================
 */
const ALLOWED_SORT_FIELDS = ["createdAt", "total", "code"] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

/**
 * =========================
 * SAFE SORT VALIDATION
 * =========================
 */
function getSafeSortBy(sortBy?: string): SortField {
  if (ALLOWED_SORT_FIELDS.includes(sortBy as SortField)) {
    return sortBy as SortField;
  }
  return "createdAt";
}

/**
 * =========================
 * SEARCH BUILDER
 * =========================
 */
function applySearch(query: any, search?: string) {
  if (!search) return query;
  const keyword = `%${search}%`;
  return query.or(`code.ilike.${keyword},customerName.ilike.${keyword}`);
}

/**
 * =========================
 * REPOSITORY
 * =========================
 */
export const orderRepository = {
  async getOrders(params: GetOrdersParams) {
    // CHỖ QUAN TRỌNG NHẤT: Phải khởi tạo và await ngay trong hàm này
    const supabase = await createClient();

    const { search, status, payment, shipping, page = 1, pageSize = 10, sortBy, sortOrder = "desc" } = params;

    const safeSortBy = getSafeSortBy(sortBy);

    // Khởi tạo query từ instance đã được await
    let query = supabase.from("orders").select("*", { count: "exact" });

    /**
     * SEARCH
     */
    query = applySearch(query, search);

    /**
     * FILTERS
     */
    if (status) {
      query = query.eq("orderStatus", status);
    }

    if (payment) {
      query = query.eq("paymentStatus", payment);
    }

    if (shipping) {
      query = query.eq("shippingStatus", shipping);
    }

    /**
     * SORT (SAFE)
     */
    query = query.order(safeSortBy, {
      ascending: sortOrder === "asc",
    });

    /**
     * PAGINATION
     */
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[ORDER_REPOSITORY_ERROR]", error);
      throw new Error("Failed to fetch orders");
    }

    return {
      data: data ?? [],
      count: count ?? 0,
    };
  },
};
