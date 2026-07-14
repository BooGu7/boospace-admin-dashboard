"use client";

import { Loader2, RefreshCw, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteOrderAction, updateOrderStatusAction } from "@/actions/order.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { useOrdersTableState } from "@/hooks/use-orders-table-state";
import { formatCurrency } from "@/lib/utils";

export function Orders() {
  const state = useOrdersTableState();
  const { data, count, loading, refresh } = useOrders({
    page: state.page,
    pageSize: state.pageSize,
    search: state.search,
    status: state.status,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  });

  const [pending, startTransition] = useTransition();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        toast.success("Cập nhật trạng thái và gửi email thành công!");
        refresh();
      } else {
        toast.error(res.error || "Lỗi khi cập nhật");
      }
    });
  };

  const handleDelete = (orderId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa đơn hàng này vĩnh viễn?")) return;

    startTransition(async () => {
      const res = await deleteOrderAction(orderId);
      if (res.success) {
        toast.success("Đơn hàng đã được xóa bỏ.");
        refresh();
      } else {
        toast.error(res.error || "Lỗi khi xóa");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            Đang chờ
          </Badge>
        );
      case "Confirmed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Xác nhận</Badge>;
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Hoàn tất</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đơn hàng thương mại</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi, phê duyệt quy trình in 3D & tự động hóa gửi hóa đơn khách hàng qua Resend.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" /> Toàn bộ giao dịch ({count})
          </CardTitle>
          <CardDescription>
            Đồng bộ dữ liệu thời gian thực từ hoạt động mua sắm trên boospace-ecommerce.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-bold text-slate-900">
                      <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                        #{order.code}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell className="text-right font-extrabold text-blue-900">
                      {formatCurrency(order.total, {
                        locale: "vi-VN",
                        currency: "VND",
                        noDecimals: true,
                      })}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(order.orderStatus)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.orderStatus === "Pending" && (
                          <Button
                            size="xs"
                            onClick={() => handleStatusChange(order.id, "Confirmed")}
                            disabled={pending}
                          >
                            Xác nhận & Gửi Mail
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(order.id)}
                          disabled={pending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Chưa có đơn hàng nào được tạo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
