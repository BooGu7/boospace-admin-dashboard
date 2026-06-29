import { ChevronLeft, CreditCard, Package, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    }).format(val);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Đơn hàng #{order.code}</h2>
              <Badge variant="secondary" className="capitalize">
                {order.orderStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border">
          <span className="text-sm font-medium ml-2">Đổi trạng thái:</span>
          <OrderStatusSelect orderId={order.id} currentStatus={order.orderStatus} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" /> Sản phẩm trong đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                      {/* LƯU Ý: item.products (số nhiều) vì Supabase trả về object theo tên bảng */}
                      <Image
                        src={item.products?.images?.[0] || "https://placehold.co/200x200?text=No+Image"}
                        alt="product"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{item.products?.name || "Sản phẩm không tồn tại"}</h4>
                      <p className="mt-1 font-medium text-blue-600">Số lượng: x{item.quantity}</p>
                    </div>
                    <div className="text-right text-lg font-bold">
                      {/* Dùng item.totalPrice (camelCase từ Alias ở Bước 2) */}
                      {formatCurrency(item.totalPrice || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" /> Khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-bold text-lg">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 dark:bg-slate-900 border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between font-bold text-xl border-t pt-3">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
