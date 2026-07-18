import {
  BadgePercent,
  Ban,
  CalendarCheck,
  Check,
  CheckCircle,
  ChevronLeft,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
// Nhập khẩu các hành động đổi trạng thái trực tiếp
import {
  confirmPaymentAction,
  deliverOrderAction,
  shipOrderAction,
  updateOrderStatusAction,
} from "@/actions/order.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusSelect } from "@/features/orders/_components/order-status-select";
import { getOrderWithDetails } from "@/lib/repositories/order.repository";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Đảm bảo luôn lấy dữ liệu mới nhất khi F5

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderWithDetails(id);

  if (!order) notFound();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  // 1. Tính toán giá trị hóa đơn thực tế minh bạch động 100%
  const itemsSubtotal =
    order.order_items?.reduce((sum: number, item: any) => sum + Number(item.totalPrice || item.total_price || 0), 0) ||
    0;
  const discountAmount = order.discountPercent > 0 ? Math.round((itemsSubtotal * order.discountPercent) / 100) : 0;
  const shippingFee = 35000; // Phí bưu tá giao hàng nhanh mặc định
  const finalCalculatedTotal = itemsSubtotal - discountAmount + shippingFee;

  // ==========================================================
  // HỆ THỐNG TỰ PHỤC HỒI DỮ LIỆU SAI LỆCH (DATABASE SELF-HEALING)
  // ==========================================================
  if (order.total !== finalCalculatedTotal && finalCalculatedTotal > 35000) {
    try {
      const supabase = await createClient();
      await supabase.from("orders").update({ total: finalCalculatedTotal }).eq("id", id);
      order.total = finalCalculatedTotal; // Cập nhật lại đối tượng cục bộ để hiển thị ngay
    } catch (err: any) {
      console.warn("[SELF_HEALING_WARN] Không thể tự phục hồi:", err.message);
    }
  }

  // Trạng thái đơn hàng thực tế
  const isCancelled = order.orderStatus === "Cancelled";
  const isDelivered = order.orderStatus === "Delivered";

  // 2. Định dạng màu sinh động cho Trạng thái đơn hàng
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
            Đang chờ duyệt
          </Badge>
        );
      case "Confirmed":
        return (
          <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
            Đã xác nhận
          </Badge>
        );
      case "Shipped":
        return (
          <Badge className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
            Đang giao hàng (Shipping)
          </Badge>
        );
      case "Delivered":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
            Giao thành công (Delivered)
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
            Đã hủy đơn
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="shrink-0">
            {status}
          </Badge>
        );
    }
  };

  // 3. Định dạng màu sinh động cho Trạng thái thanh toán
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 font-extrabold border border-emerald-200 shrink-0">
            Đã thanh toán
          </Badge>
        );
      case "Refunded":
        return (
          <Badge variant="destructive" className="shrink-0">
            Đã hoàn tiền
          </Badge>
        );
      default:
        return (
          <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 font-extrabold border border-orange-200 shrink-0">
            Chờ thanh toán
          </Badge>
        );
    }
  };

  // 4. Định dạng màu sinh động cho Trạng thái vận chuyển
  const getShippingStatusBadge = (status: string) => {
    const activeStatus =
      order.orderStatus === "Delivered" ? "Delivered" : order.orderStatus === "Shipped" ? "Shipping" : status;

    switch (activeStatus) {
      case "Delivered":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold shrink-0">
            Đã giao hàng
          </Badge>
        );
      case "Shipping":
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-bold shrink-0">Đang vận chuyển</Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground font-semibold shrink-0">
            Chờ xử lý (Chưa giao)
          </Badge>
        );
    }
  };

  // ĐỒNG BỘ ĐỘNG: Phân loại hình thức thanh toán từ trường dữ liệu của đơn hàng
  const isCOD = order.paymentMethod === "COD";
  const paymentMethodLabel = isCOD ? "Thanh toán tiền mặt khi nhận hàng (COD)" : "Chuyển khoản VietQR (payOS Gateway)";

  // ĐỒNG BỘ: Định nghĩa các hàm bao bọc Server Action có kiểu trả về rỗng (Promise<void>) tương thích 100% với form action
  const handleConfirmPayment = async () => {
    "use server";
    await confirmPaymentAction(order.id);
  };

  const handleShipOrder = async () => {
    "use server";
    await shipOrderAction(order.id);
  };

  const handleDeliverOrder = async () => {
    "use server";
    await deliverOrderAction(order.id);
  };

  const handleCancelOrder = async () => {
    "use server";
    await updateOrderStatusAction(order.id, "Cancelled");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Đơn hàng #{order.code ? order.code.replace("BOO-", "") : order.id.substring(0, 5)}
              </h2>
              {getOrderStatusBadge(order.orderStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-semibold">
              <Clock className="h-3.5 w-3.5" /> Thời gian khởi tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Thao tác đổi trạng thái nhanh */}
        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-xl border shrink-0">
          <span className="text-xs font-bold ml-2 text-slate-700">Duyệt & Đổi trạng thái:</span>
          <OrderStatusSelect orderId={order.id} currentStatus={order.orderStatus} />
        </div>
      </div>

      {/* BANNER CẢNH BÁO KHI ĐƠN HÀNG ĐÃ BỊ HỦY */}
      {isCancelled && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-bold">
          <Ban className="h-5 w-5 shrink-0" />
          <span>
            Đơn hàng này đã bị hủy bỏ! Tất cả các tính năng thay đổi trạng thái bưu tá và thanh toán đã được khóa chặt
            để bảo toàn dữ liệu lịch sử.
          </span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cột chính bên trái: Chi tiết mặt hàng & Hóa đơn */}
        <div className="md:col-span-2 space-y-6">
          {/* Danh sách sản phẩm */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
                <Package className="h-5 w-5 text-primary" /> Mặt hàng đặt mua ({order.order_items?.length || 0})
              </CardTitle>
              <CardDescription>Chi tiết phôi in 3D & phụ kiện gia công DIY cấu hình theo đơn.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 border-b pb-5 last:border-0 last:pb-0">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted shrink-0">
                      <Image
                        src={item.products?.images?.[0] || "https://placehold.co/200x200?text=No+Image"}
                        alt="product"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base text-slate-800 truncate">
                        {item.products?.name || "Sản phẩm đã gỡ bỏ"}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Đơn giá: <strong className="text-slate-700">{formatCurrency(item.unitPrice || 0)}</strong>
                        </span>
                        <span>
                          Số lượng: <strong className="text-blue-600 font-bold">x{item.quantity}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-slate-800 text-base tabular-nums self-center">
                      {formatCurrency(item.totalPrice || item.total_price || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hóa đơn chi tiết minh bạch động 100% */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
                <CreditCard className="h-5 w-5 text-primary" /> Biên lai chi tiết thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hình thức áp dụng:</span>
                <span className="font-extrabold text-blue-900 dark:text-blue-300">{paymentMethodLabel}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính sản phẩm:</span>
                <span className="font-semibold tabular-nums text-slate-800">{formatCurrency(itemsSubtotal)}</span>
              </div>

              {order.discountPercent > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span className="flex items-center gap-1.5">
                    <BadgePercent className="h-4 w-4" /> Mã giảm giá ({order.couponCode || "COUPON"} -{" "}
                    {order.discountPercent}%):
                  </span>
                  <span className="font-bold tabular-nums">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển Viettel Post:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(shippingFee)}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="font-extrabold text-lg text-slate-800">Tổng thanh toán thực tế:</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Đã bao gồm tất cả chiết khấu và phí bưu tá giao hàng.
                  </p>
                </div>
                <span className="text-2xl font-black text-blue-905 dark:text-blue-200 tabular-nums">
                  {formatCurrency(finalCalculatedTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ==========================================================
              NHẬT KÝ HÀNH TRÌNH ĐƠN HÀNG (TIMELINE LOGS) CỰC KỲ CHI TIẾT
              ========================================================== */}
          <Card className="shadow-2xs">
            <CardHeader className="border-b pb-4 bg-muted/10">
              <CardTitle className="text-sm font-extrabold flex items-center gap-1.5 text-slate-800">
                <FileText className="h-4.5 w-4.5 text-primary" /> Nhật ký hành trình đơn hàng
              </CardTitle>
              <CardDescription className="text-[11px]">
                Báo cáo chi tiết mốc thời gian và hành động xử lý đơn hàng.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 relative pl-4 ml-2 space-y-6">
              {/* Mốc 1: Khởi tạo */}
              <div className="grid grid-cols-[100px_1fr] gap-6 relative">
                <div className="text-right text-xs font-black text-slate-600 dark:text-slate-400 pt-1 font-mono">
                  <div>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("vi-VN") : "13:06:03"}</div>
                  <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "12/7/2026"}
                  </div>
                </div>
                <div className="relative pl-6 border-l-2 border-slate-100">
                  <span className="absolute -left-[14px] top-1 bg-blue-500 text-white rounded-full p-1.5 shadow-sm z-10">
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  <div className="space-y-1 bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-800">Khách hàng đặt đơn hàng thành công</span>
                      <Badge className="bg-blue-50 text-blue-700 text-[9px] font-bold">Khởi tạo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Đơn hàng được khởi tạo thành công với hình thức thanh toán{" "}
                      <strong className="text-slate-700">{paymentMethodLabel}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mốc 2: Phê duyệt */}
              {order.orderStatus !== "Pending" && (
                <div className="grid grid-cols-[100px_1fr] gap-6 relative">
                  <div className="text-right text-xs font-black text-slate-600 dark:text-slate-400 pt-1 font-mono">
                    <div>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("vi-VN") : "13:06:15"}</div>
                    <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "12/7/2026"}
                    </div>
                  </div>
                  <div className="relative pl-6 border-l-2 border-slate-100">
                    <span className="absolute -left-[14px] top-1 bg-emerald-500 text-white rounded-full p-1.5 shadow-sm z-10">
                      <CalendarCheck className="h-3.5 w-3.5" />
                    </span>
                    <div className="space-y-1 bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800">Duyệt in 3D & Chế tác</span>
                        <span className="text-[10px] text-emerald-600 font-black">Xác nhận</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hệ thống đã phê duyệt đơn hàng, xếp hàng đợi đưa vào máy in FDM/Resend bưu tá.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mốc 3: Thanh toán */}
              <div className="grid grid-cols-[100px_1fr] gap-6 relative">
                <div className="text-right text-xs font-black text-slate-600 dark:text-slate-400 pt-1 font-mono">
                  <div>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("vi-VN") : "13:07:20"}</div>
                  <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "12/7/2026"}
                  </div>
                </div>
                <div className="relative pl-6 border-l-2 border-slate-100">
                  <span
                    className={`absolute -left-[14px] top-1 ${order.paymentStatus === "Paid" ? "bg-emerald-500" : "bg-amber-500"} text-white rounded-full p-1.5 shadow-sm z-10`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                  </span>
                  <div className="space-y-1 bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-800">
                        {order.paymentStatus === "Paid" ? "Đã xác nhận thanh toán thành công" : "Đang chờ thanh toán"}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {paymentMethodLabel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.paymentStatus === "Paid"
                        ? `Xác nhận nhận đủ ${formatCurrency(finalCalculatedTotal)} qua hệ thống chuyển khoản.`
                        : isCOD
                          ? "Hình thức COD: Giao dịch sẽ được thợ in xác nhận sau khi bưu tá báo nhận tiền mặt thành công."
                          : "Hình thức Chuyển khoản: Hệ thống đang chờ đối tác thanh toán payOS / VietQR xác thực dòng tiền."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mốc 4: Đang vận chuyển */}
              {(order.orderStatus === "Shipped" ||
                order.orderStatus === "Delivered" ||
                order.shippingStatus === "Shipping" ||
                order.shippingStatus === "Delivered") && (
                <div className="grid grid-cols-[100px_1fr] gap-6 relative">
                  <div className="text-right text-xs font-black text-slate-600 dark:text-slate-400 pt-1 font-mono">
                    <div>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("vi-VN") : "14:15:30"}</div>
                    <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "12/7/2026"}
                    </div>
                  </div>
                  <div className="relative pl-6 border-l-2 border-slate-100">
                    <span className="absolute -left-[14px] top-1 bg-purple-500 text-white rounded-full p-1.5 shadow-sm z-10">
                      <Truck className="h-3.5 w-3.5" />
                    </span>
                    <div className="space-y-1 bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800">Đã bàn giao đơn vị vận chuyển</span>
                        <Badge className="bg-purple-50 text-purple-700 text-[9px] font-bold">
                          Giao hàng (Shipping)
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Đã đóng hộp bọc chống sốc cẩn thận và bàn giao đơn cho bưu tá vận chuyển bưu điện Viettel Post.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mốc 5: Hoàn tất */}
              {order.shippingStatus === "Delivered" && (
                <div className="grid grid-cols-[100px_1fr] gap-6 relative">
                  <div className="text-right text-xs font-black text-slate-600 dark:text-slate-400 pt-1 font-mono">
                    <div>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("vi-VN") : "16:22:45"}</div>
                    <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "12/7/2026"}
                    </div>
                  </div>
                  <div className="relative pl-6">
                    <span className="absolute -left-[14px] top-1 bg-emerald-600 text-white rounded-full p-1.5 shadow-sm z-10">
                      <CheckCircle className="h-3.5 w-3.5" />
                    </span>
                    <div className="space-y-1 bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-700 text-xs">Giao hàng hoàn tất</span>
                        <span className="text-[10px] text-emerald-600 font-black">Thành công</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Người mua đã nhận phôi in 3D hoàn thiện và ký biên bản giao hàng thành công tốt đẹp.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột thông tin phụ bên phải: Khách hàng & Vận chuyển */}
        <div className="space-y-6">
          {/* Bộ điều khiển Vòng đời Đơn hàng Trực tiếp (Next.js Server-side Forms) */}
          <Card className="shadow-sm border-border bg-slate-50/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-extrabold flex items-center gap-1.5 text-slate-800">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Phê duyệt & Đổi trạng thái
              </CardTitle>
              <CardDescription className="text-[10px]">Cổng thao tác vận hành nhanh vòng đời đơn hàng.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              {/* Nút 1: Xác nhận Thanh toán - KHÓA HOÀN TOÀN KHI ĐƠN BỊ HỦY */}
              {order.paymentStatus !== "Paid" ? (
                <form action={handleConfirmPayment}>
                  <Button
                    type="submit"
                    disabled={isCancelled}
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Coins className="h-4 w-4" /> Xác nhận đã nhận tiền (Paid)
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-3 font-bold">
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" /> Đã hoàn tất thanh toán
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px]">PAID</Badge>
                </div>
              )}

              {/* Nút 2: Xác nhận Vận chuyển - KHÓA HOÀN TOÀN KHI ĐƠN BỊ HỦY */}
              {order.orderStatus === "Confirmed" && order.shippingStatus !== "Shipping" && (
                <form action={handleShipOrder}>
                  <Button
                    type="submit"
                    disabled={isCancelled}
                    className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Truck className="h-4 w-4" /> Bàn giao bưu tá vận chuyển
                  </Button>
                </form>
              )}

              {/* Nút 3: Xác nhận Hoàn tất - KHÓA HOÀN TOÀN KHI ĐƠN BỊ HỦY */}
              {(order.orderStatus === "Shipped" ||
                order.orderStatus === "Confirmed" ||
                order.shippingStatus === "Shipping") &&
              order.shippingStatus !== "Delivered" ? (
                <form action={handleDeliverOrder}>
                  <Button
                    type="submit"
                    disabled={isCancelled || isDelivered}
                    className="w-full h-9 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-extrabold text-xs gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" /> Xác nhận đã giao thành công
                  </Button>
                </form>
              ) : null}

              {/* Nút 4: Hủy đơn hàng */}
              {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                <form action={handleCancelOrder}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <Ban className="h-4 w-4" /> Hủy bỏ đơn hàng
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Thông tin Khách hàng - Sử dụng ID Thật từ Supabase */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
                <User className="h-5 w-5 text-primary" /> Khách hàng & Liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                  {order.customerName ? order.customerName.substring(0, 2).toUpperCase() : "US"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-base truncate">{order.customerName}</p>
                  <p className="text-[10px] text-muted-foreground truncate" title={order.id}>
                    ID: {`Khách vãng lai (${order.id.substring(0, 8)})`}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate font-mono">{order.customerEmail || "Không có Email"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-mono font-bold">{order.customerPhone || "Chưa cung cấp SĐT"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vận chuyển & Ghi chú */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
                <Truck className="h-5 w-5 text-primary" /> Vận chuyển & Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">Thanh toán:</span>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">Vận chuyển:</span>
                  {getShippingStatusBadge(order.shippingStatus)}
                </div>
              </div>

              <Separator />

              {/* Ghi chú đơn hàng */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Ghi chú đơn hàng (Kỹ thuật/In):
                </div>
                <div className="rounded-lg bg-muted/60 border p-3 text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                  {order.notes || "Không có ghi chú gia công in 3D hay đóng gói đặc biệt cho đơn hàng này."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
