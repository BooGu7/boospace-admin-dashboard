"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  orderCount: number;
  totalSpent: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  avatarUrl?: string;
  active: boolean;
  hasAccount: boolean;
  blocked: boolean;
}

/**
 * TRUY VẤN DANH SÁCH KHÁCH HÀNG (ÁP DỤNG ĐỐI CHIẾU CHUẨN EMAIL TRÁNH SAI LỆCH KHÓA NGOẠI)
 */
export async function getCustomersAction() {
  try {
    const supabase = await createClient();

    // 1. Tải danh sách đơn hàng thực tế không bị hủy
    const { data: dbOrders, error: ordersErr } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, customer_address, total, order_status, created_at")
      .neq("order_status", "Cancelled");

    if (ordersErr) throw ordersErr;
    const orders = dbOrders || [];

    // 2. Tải danh sách tài khoản thành viên thực tế từ bảng users
    const { data: dbUsers, error: usersErr } = await supabase
      .from("users")
      .select("id, email, data, created_at")
      .order("created_at", { ascending: false });

    if (usersErr) throw usersErr;
    const usersList = dbUsers || [];

    const customerMap = new Map<string, CustomerRow>();

    // Nạp toàn bộ tài khoản đăng ký từ bảng public.users
    for (const u of usersList) {
      if (!u.email) continue;
      const emailKey = u.email.trim().toLowerCase();

      // Giải mã đối tượng JSONB "data"
      const meta = u.data || {};
      const name = meta.name || meta.customer_name || meta.displayName || "Thành viên mới";
      const phone = meta.phone || meta.customer_phone || "Chưa cung cấp";

      // Địa chỉ lấy từ thông tin user nếu chưa có order
      const userAddress = meta.address || meta.customer_address || "Nhận trực tiếp tại xưởng Boospace";
      const avatarUrl = meta.avatar_url || meta.avatarUrl || null;
      const blocked = !!meta.blocked;

      customerMap.set(emailKey, {
        id: u.id,
        name: name,
        email: u.email,
        phone: phone,
        address: userAddress,
        joinedDate: u.created_at
          ? new Date(u.created_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "12/07/2026 13:06",
        orderCount: 0,
        totalSpent: 0,
        tier: "Bronze",
        avatarUrl,
        active: true,
        hasAccount: true, // Tài khoản đã đăng ký
        blocked,
      });
    }

    // Quét qua các hóa đơn thực tế để đối chiếu dồn đơn theo định danh Email độc bản
    for (const order of orders) {
      if (!order.customer_email) continue;
      const emailKey = order.customer_email.trim().toLowerCase();

      if (!customerMap.has(emailKey)) {
        // Nếu là khách mua hàng vãng lai chưa đăng ký tài khoản
        customerMap.set(emailKey, {
          id: order.id,
          name: order.customer_name || "Khách mua hàng",
          email: order.customer_email,
          phone: order.customer_phone || "Chưa cung cấp",
          address: order.customer_address || "Nhận trực tiếp tại xưởng Boospace",
          joinedDate: order.created_at
            ? new Date(order.created_at).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "12/07/2026 13:06",
          orderCount: 0,
          totalSpent: 0,
          tier: "Bronze",
          active: true,
          hasAccount: false, // Khách vãng lai
          blocked: false,
        });
      }

      // Cộng dồn doanh số mua hàng thực tế dựa trên email
      const customerData = customerMap.get(emailKey);
      if (customerData) {
        customerData.orderCount += 1;
        customerData.totalSpent += Number(order.total || 0);

        if (order.customer_address) {
          customerData.address = order.customer_address;
        }
        if (order.customer_phone && customerData.phone === "Chưa cung cấp") {
          customerData.phone = order.customer_phone;
        }
      }
    }

    // Tính toán phân hạng động dựa trên tổng chi tiêu thực tế (Khách vãng lai không hiển thị phân hạng)
    const finalCustomers = Array.from(customerMap.values()).map((c) => {
      let tier: CustomerRow["tier"] = "Bronze";
      if (c.totalSpent >= 1500000) tier = "Platinum";
      else if (c.totalSpent >= 1000000) tier = "Gold";
      else if (c.totalSpent >= 300000) tier = "Silver";

      return {
        ...c,
        tier,
      };
    });

    return { success: true, data: finalCustomers };
  } catch (err: any) {
    console.error("[GET_CUSTOMERS_ERROR]", err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * THAO TÁC KHÓA / MỞ KHÓA TÀI KHOẢN KHÁCH HÀNG ĐÃ ĐĂNG KÝ
 */
export async function toggleUserBlockAction(userId: string, currentBlocked: boolean) {
  try {
    const supabase = await createClient();

    const { data: user, error: fetchError } = await supabase.from("users").select("data").eq("id", userId).single();

    if (fetchError) throw fetchError;

    const meta = user?.data || {};
    const updatedMeta = {
      ...meta,
      blocked: !currentBlocked,
    };

    const { error } = await supabase
      .from("users")
      .update({ data: updatedMeta, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (err: any) {
    console.error("[TOGGLE_USER_BLOCK_ERROR]", err);
    return { success: false, error: err.message };
  }
}

/**
 * TRUY VẤN LỊCH SỬ NHẬT KÝ MUA HÀNG CHI TIẾT
 */
export async function getCustomerOrderHistoryAction(email: string) {
  try {
    const supabase = await createClient();

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, code, total, order_status, payment_status, created_at, payment_method, customer_address")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;
    if (!orders || orders.length === 0) return { success: true, data: [] };

    const orderIds = orders.map((o) => o.id);

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id, quantity, unit_price, total_price, product_id")
      .in("order_id", orderIds);

    if (itemsError) throw itemsError;

    const productIds = items?.map((i) => i.product_id).filter(Boolean) || [];

    let productsMap: Record<string, string> = {};
    if (productIds.length > 0) {
      const { data: products } = await supabase.from("products").select("id, name").in("id", productIds);

      if (products) {
        productsMap = products.reduce((acc, p) => {
          acc[p.id] = p.name;
          return acc;
        }, {} as any);
      }
    }

    const history = orders.map((order) => {
      const orderItems = (items || [])
        .filter((item) => item.order_id === order.id)
        .map((item) => ({
          productName: item.product_id ? productsMap[item.product_id] || "Sản phẩm in 3D" : "Sản phẩm đã gỡ bỏ",
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        }));

      return {
        id: order.id,
        code: order.code ? order.code.replace("BOO-", "") : order.id.substring(0, 5),
        total: Number(order.total),
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method || "COD",
        address: order.customer_address || "Nhận trực tiếp tại xưởng Boospace",
        date: new Date(order.created_at).toLocaleString("vi-VN"),
        items: orderItems,
      };
    });

    return { success: true, data: history };
  } catch (err: any) {
    console.error("[GET_CUSTOMER_HISTORY_ERROR]", err);
    return { success: false, error: err.message, data: [] };
  }
}
