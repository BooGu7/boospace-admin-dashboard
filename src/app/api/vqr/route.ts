import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VIETQR_USERNAME = process.env.VIETQR_USERNAME || "boospace7";
const VIETQR_PASSWORD = process.env.VIETQR_PASSWORD;

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
    // 1. Xác thực bảo mật Basic Auth từ VietQR
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Yêu cầu thông tin xác thực" }, { status: 401 });
    }

    const auth = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    const username = auth[0];
    const password = auth[1];

    if (username !== VIETQR_USERNAME || (VIETQR_PASSWORD && password !== VIETQR_PASSWORD)) {
      return NextResponse.json({ success: false, message: "Thông tin bảo mật không hợp lệ" }, { status: 403 });
    }

    // 2. Phân giải gói dữ liệu giao dịch từ VietQR
    const body = await req.json();
    const rawMemo = body.content || body.description || body.addInfo || "";
    const amount = Number(body.amount || 0);
    const referenceNumber = body.referenceNumber || body.transaction_id || body.reference || `REF-${Date.now()}`;

    const orderCode = extractOrderCode(rawMemo);

    if (!orderCode) {
      return NextResponse.json({ success: false, message: "Không tìm thấy mã đơn hàng Boospace" }, { status: 400 });
    }

    const supabase = await createClient();

    // 3. Tìm kiếm đơn hàng trong cơ sở dữ liệu Supabase
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, total, payment_status")
      .or(`id.eq.${orderCode},code.eq.${orderCode}`)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json({ success: false, message: `Không tìm thấy đơn hàng ${orderCode}` }, { status: 404 });
    }

    if (order.payment_status === "Paid") {
      return NextResponse.json({
        success: true,
        message: "Đơn hàng đã được xác nhận trước đó",
      });
    }

    if (amount < Number(order.total)) {
      return NextResponse.json(
        {
          success: false,
          message: "Số tiền chuyển khoản nhỏ hơn tổng giá trị đơn hàng",
        },
        { status: 400 },
      );
    }

    // 4. Ghi nhận nhật ký biến động số dư vào bảng transactions
    // (Postgres Trigger trigger_auto_sync_order_payment sẽ tự động chạy để cập nhật orders.payment_status = 'Paid')
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
      // Nếu đã tạo giao dịch rồi thì cập nhật trạng thái đơn hàng trực tiếp làm phương án dự phòng
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
      reference_number: referenceNumber,
    });
  } catch (error: any) {
    console.error("[VIETQR_WEBHOOK_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
