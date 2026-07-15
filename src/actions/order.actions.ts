"use server";

import { revalidatePath } from "next/cache";
import { getOrdersService } from "@/lib/services/order.service";
import { createClient } from "@/lib/supabase/server";
import type { GetOrdersParams } from "@/types/order";

export type GetOrdersResponse = {
  success: boolean;
  data: any[];
  meta: { page: number; pageSize: number; total: number };
  error?: string;
};

/**
 * TỰ ĐỘNG TẠO HOẶC LẤY ID PROFILE CHO KHÁCH HÀNG VÃNG LAI
 */
async function getOrCreateProfileForCustomer(email: string, name: string, phone?: string) {
  try {
    const supabase = await createClient();

    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();

    if (existingProfile) {
      return existingProfile.id;
    }

    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        {
          email: email,
          name: name || "Khách hàng vãng lai",
          phone: phone || "",
          total_spent: 0,
          role: "user",
          created_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (createError) throw createError;
    return newProfile?.id || null;
  } catch (err: any) {
    console.error("[AUTO_PROFILE_WARN] Không thể tự động tạo profile khách vãng lai:", err.message);
    return null;
  }
}

/**
 * ACTION LẤY DANH SÁCH ĐƠN HÀNG (Mặc định sắp xếp theo ngày mới nhất)
 */
export async function getOrders(params: GetOrdersParams): Promise<GetOrdersResponse> {
  try {
    const result = await getOrdersService({
      ...params,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    });

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
 * ACTION CẬP NHẬT TRẠNG THÁI & GỬI EMAIL HÓA ĐƠN AN TOÀN CHỐNG SẬP (ĐÃ SỬA: Xóa updated_at)
 */
export async function updateOrderStatusAction(id: string, status: string) {
  try {
    const supabase = await createClient();

    // ĐÃ SỬA: Loại bỏ hoàn toàn trường updated_at khỏi câu lệnh cập nhật
    const { error: updateError } = await supabase.from("orders").update({ order_status: status }).eq("id", id);

    if (updateError) throw updateError;

    if (status === "Confirmed") {
      const { getOrderWithDetails } = await import("@/lib/repositories/order.repository");
      const order = await getOrderWithDetails(id);

      if (order?.customerEmail) {
        await getOrCreateProfileForCustomer(order.customerEmail, order.customerName, order.customerPhone);

        try {
          await sendInvoiceEmail(order);
        } catch (emailError: any) {
          console.warn("[RESEND_EMAIL_BYPASS] Bỏ qua lỗi gửi Email do API Key chưa hợp lệ:", emailError.message);
        }
      }
    }

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

/**
 * ACTION XÁC NHẬN THANH TOÁN THỦ CÔNG (ĐÃ SỬA: Xóa updated_at)
 */
export async function confirmPaymentAction(orderId: string) {
  try {
    const supabase = await createClient();

    // ĐÃ SỬA: Loại bỏ hoàn toàn trường updated_at khỏi câu lệnh cập nhật
    const { error } = await supabase.from("orders").update({ payment_status: "Paid" }).eq("id", orderId);

    if (error) throw error;

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (err: any) {
    console.error("[CONFIRM_PAYMENT_ERROR]", err);
    return { success: false, error: err.message };
  }
}

/**
 * ACTION BẮT ĐẦU VẬN CHUYỂN (ĐÃ SỬA: Xóa updated_at)
 */
export async function shipOrderAction(orderId: string) {
  try {
    const supabase = await createClient();

    // ĐÃ SỬA: Loại bỏ hoàn toàn trường updated_at khỏi câu lệnh cập nhật
    const { error } = await supabase
      .from("orders")
      .update({
        shipping_status: "Shipping",
        order_status: "Shipped",
      })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (err: any) {
    console.error("[SHIP_ORDER_ERROR]", err);
    return { success: false, error: err.message };
  }
}

/**
 * ACTION HOÀN TẤT ĐƠN HÀNG (GIAO THÀNH CÔNG) (ĐÃ SỬA: Xóa updated_at)
 */
export async function deliverOrderAction(orderId: string) {
  try {
    const supabase = await createClient();

    // ĐÃ SỬA: Loại bỏ hoàn toàn trường updated_at khỏi câu lệnh cập nhật
    const { error } = await supabase
      .from("orders")
      .update({
        shipping_status: "Delivered",
        order_status: "Delivered",
        payment_status: "Paid",
      })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (err: any) {
    console.error("[DELIVER_ORDER_ERROR]", err);
    return { success: false, error: err.message };
  }
}

/**
 * ACTION XÓA ĐƠN HÀNG THỰC TẾ
 */
export async function deleteOrderAction(id: string) {
  try {
    const { deleteOrder } = await import("@/lib/repositories/order.repository");
    await deleteOrder(id);

    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_ORDER_ACTION_ERROR]", error);
    return { success: false, error: error.message || "Không thể xóa đơn hàng" };
  }
}

/**
 * HÀM PHỤ TRỢ GỬI EMAIL AN TOÀN CHỐNG CRASH
 */
async function sendInvoiceEmail(order: any) {
  const resendApiKey = process.env.RESEND_API_KEY || "re_3cz1Z9tS_FQtmoNAQAF7STG1XrCH3mwHA";

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const itemsHtml =
    order.order_items
      ?.map(
        (item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #4a5568;">
        ${item.products?.name || "Sản phẩm 3D / DIY Custom"}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #4a5568; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #2d3748; text-align: right; font-weight: bold;">
        ${formatVND(item.total_price || item.totalPrice)}
      </td>
    </tr>
  `,
      )
      .join("") || "";

  const emailHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f7fafc; padding-bottom: 20px;">
        <h1 style="color: #1a365d; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">BOOSPACE</h1>
        <p style="color: #718096; font-size: 14px; margin: 5px 0 0 0;">Cửa hàng sản phẩm in 3D & DIY Workspace cao cấp</p>
      </div>
      
      <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #2d3748; margin-top: 0;">Chào <strong>${order.customerName}</strong>,</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.6; margin: 0;">
          Cảm ơn bạn đã tin tưởng lựa chọn sản phẩm của Boospace! Đơn hàng của bạn đã được quản trị viên **xác nhận thành công** và đang được xếp vào hàng đợi in 3D/thiết kế.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 18px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #edf2f7;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #4a5568;"><strong>Mã đơn hàng:</strong> #${order.code}</p>
        <p style="margin: 0; font-size: 14px; color: #4a5568;"><strong>Thời gian xác nhận:</strong> ${new Date().toLocaleString("vi-VN")}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr style="background-color: #f7fafc;">
            <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #718096; border-bottom: 2px solid #edf2f7;">Sản phẩm</th>
            <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #718096; border-bottom: 2px solid #edf2f7;">SL</th>
            <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #718096; border-bottom: 2px solid #edf2f7;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 18px 12px 12px 12px; font-size: 16px; font-weight: bold; color: #2d3748; text-align: right;">Tổng thanh toán:</td>
            <td style="padding: 18px 12px 12px 12px; font-size: 20px; font-weight: bold; color: #2b6cb0; text-align: right;">
              ${formatVND(order.total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Boospace <onboarding@resend.dev>",
        to: order.customerEmail,
        subject: `[Boospace] Xác nhận đơn hàng #${order.code} thành công!`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.warn("[RESEND_EMAIL_API_ERROR] Resend API trả về lỗi:", errData);
    }
  } catch (e: any) {
    console.warn("[RESEND_FETCH_EXCEPTION] Không thể kết nối với Resend API:", e.message);
  }
}
