import {
  BadgePercent,
  ChevronLeft,
  Clock,
  CreditCard,
  FileText,
  Mail,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusSelect } from "@/features/orders/_components/order-status-select";
import { getOrderWithDetails } from "@/lib/repositories/order.repository";

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

  // Tính tổng tiền sản phẩm trước khi giảm giá
  const itemsSubtotal =
    order.order_items?.reduce((sum: number, item: any) => sum + Number(item.totalPrice || 0), 0) || 0;
  const discountAmount = order.discountPercent > 0 ? Math.round((itemsSubtotal * order.discountPercent) / 100) : 0;

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
            Đã thanh toán
          </Badge>
        );
      case "Refunded":
        return <Badge variant="destructive">Đã hoàn tiền</Badge>;
      default:
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100">
            Chờ thanh toán
          </Badge>
        );
    }
  };

  const getShippingStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-emerald-100 text-emerald-800">Đã giao hàng</Badge>;
      case "Shipping":
        return <Badge className="bg-blue-100 text-blue-800">Đang vận chuyển</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Chờ xử lý
          </Badge>
        );
    }
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
              <h2 className="text-3xl font-bold tracking-tight">Đơn hàng #{order.code}</h2>
              <Badge variant="outline" className="capitalize px-2 py-0.5 font-bold">
                {order.orderStatus === "Pending"
                  ? "Đang chờ duyệt"
                  : order.orderStatus === "Confirmed"
                    ? "Đã xác nhận"
                    : "Đã giao"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cột chính bên trái: Chi tiết mặt hàng & Hóa đơn */}
        <div className="md:col-span-2 space-y-6">
          {/* Danh sách sản phẩm */}
          <Card>
            <CardHeader className="pb-3 border-b">
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
                      {formatCurrency(item.totalPrice || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hóa đơn chi tiết */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
                <CreditCard className="h-5 w-5 text-primary" /> Biên lai chi tiết thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính sản phẩm:</span>
                <span className="font-semibold tabular-nums">{formatCurrency(itemsSubtotal)}</span>
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
                <span className="text-muted-foreground">Phí vận chuyển dự kiến:</span>
                <span className="font-semibold text-emerald-600">Miễn phí (Boospace Support)</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="font-extrabold text-lg text-slate-800">Tổng thanh toán:</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Đã bao gồm tất cả các thuế giá trị gia tăng.
                  </p>
                </div>
                <span className="text-2xl font-black text-blue-900 dark:text-blue-200 tabular-nums">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột thông tin phụ bên phải: Khách hàng & Vận chuyển */}
        <div className="space-y-6">
          {/* Thông tin Khách hàng */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
                <User className="h-5 w-5 text-primary" /> Khách hàng & Liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                  {order.customerName ? order.customerName.substring(0, 2).toUpperCase() : "US"}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-base">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">ID: Khách hàng vãng lai</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{order.customerEmail || "Không có Email"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{order.customerPhone || "Chưa cung cấp SĐT"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vận chuyển & Ghi chú */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
                <Truck className="h-5 w-5 text-primary" /> Vận chuyển & Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Thanh toán:</span>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Vận chuyển:</span>
                  {getShippingStatusBadge(order.shippingStatus)}
                </div>
              </div>

              <Separator />

              {/* Ghi chú đơn hàng từ khách hàng hoặc ghi chú kỹ thuật */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
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
