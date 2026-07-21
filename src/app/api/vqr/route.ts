import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Hàm kiểm tra nhanh trạng thái API qua trình duyệt (GET)
 */
export async function GET() {
  return NextResponse.json({
    status: "online",
    message: "VietQR Webhook API cho Boospace Admin đang hoạt động",
  });
}

/**
 * Trích xuất mã đơn hàng dạng ORD-XXXXX hoặc BOO-XXXXX từ nội dung chuyển khoản
 */
function extractOrderCode(memo: string): string | null {
  if (!memo) return null;
  const cleanMemo = memo.toUpperCase();
  const match = cleanMemo.match(/(ORD-[A-Z0-9]+|BOO-?\d+)/);
  return match ? match[0] : null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra xác thực gói tin bằng Basic Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: "Thiếu thông tin xác thực Basic Auth",
      });
    }

    const auth = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    const username = auth[0];
    const password = auth[1];

    const VIETQR_USERNAME = process.env.VIETQR_USERNAME || "vqr_usr_iR9tSbCphj";
    const VIETQR_PASSWORD = process.env.VIETQR_PASSWORD || "vqr_pwd_fN1FyYTRFahAQnup";

    if (username !== VIETQR_USERNAME || password !== VIETQR_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Thông tin tài khoản xác thực không hợp lệ",
      });
    }

    // 2. Phân giải gói dữ liệu giao dịch từ VietQR
    const body = await req.json();
    const rawMemo = body.content || body.description || body.addInfo || "";
    const amount = Number(body.amount || 0);
    const referenceNumber = body.referenceNumber || body.transaction_id || body.reference || `REF-${Date.now()}`;

    const orderCode = extractOrderCode(rawMemo);

    if (!orderCode) {
      return NextResponse.json({
        success: false,
        message: `Không tìm thấy mã đơn hàng Boospace trong nội dung chuyển khoản "${rawMemo}"`,
      });
    }

    const supabase = await createClient();

    // 3. Phân loại cấu trúc chuỗi tìm kiếm để truy vấn Supabase chính xác
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderCode);

    let order = null;
    let fetchError = null;

    if (isUuid) {
      const res = await supabase
        .from("orders")
        .select("id, total, payment_status")
        .or(`id.eq.${orderCode},code.eq.${orderCode}`)
        .maybeSingle();
      order = res.data;
      fetchError = res.error;
    } else {
      const res = await supabase.from("orders").select("id, total, payment_status").eq("code", orderCode).maybeSingle();
      order = res.data;
      fetchError = res.error;
    }

    if (fetchError) {
      console.error("[SUPABASE_FETCH_ORDER_ERROR]", fetchError);
    }

    if (!order) {
      return NextResponse.json({
        success: false,
        message: `Không tìm thấy đơn hàng mã "${orderCode}" trong cơ sở dữ liệu Supabase`,
      });
    }

    if (order.payment_status === "Paid") {
      return NextResponse.json({
        success: true,
        message: `Đơn hàng ${orderCode} đã được xác nhận thanh toán trước đó rồi`,
      });
    }

    if (amount < Number(order.total)) {
      return NextResponse.json({
        success: false,
        message: `Số tiền chuyển khoản (${amount}đ) nhỏ hơn tổng giá trị đơn hàng (${order.total}đ)`,
      });
    }

    // 4. Ghi nhận nhật ký biến động số dư vào bảng transactions
    const { error: insertTxError } = await supabase.from("transactions").insert({
      order_id: order.id,
      order_code: orderCode,
      gateway_code: "VIETQR_ACB",
      reference_number: referenceNumber,
      amount: amount,
      currency: "VND",
      status: "Paid",
      payment_method: "VietQR",
      memo: rawMemo,
      raw_payload: body,
      paid_at: new Date().toISOString(),
    });

    if (insertTxError) {
      // Phương án dự phòng: Cập nhật trực tiếp bảng orders
      await supabase
        .from("orders")
        .update({
          payment_status: "Paid",
          order_status: "Processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }

    return NextResponse.json({
      success: true,
      message: `Cập nhật giao dịch thành công cho đơn hàng ${orderCode}`,
      transaction_id: referenceNumber,
    });
  } catch (error: any) {
    console.error("[VIETQR_WEBHOOK_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
