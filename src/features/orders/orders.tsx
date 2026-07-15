"use client";

import { Calendar, CheckCircle, Eye, Loader2, MapPin, Phone, RefreshCw, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { deleteOrderAction, updateOrderStatusAction } from "@/actions/order.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { useOrdersTableState } from "@/hooks/use-orders-table-state";

/**
 * ==========================================================
 * COMPONENT CON: Hộp thoại xác nhận xóa đơn hàng theo đúng chuẩn DeleteProduct của bạn
 * ==========================================================
 */
interface DeleteOrderDialogProps {
  id: string;
  code: string;
  onSuccess: () => void;
}

function DeleteOrderDialog({ id, code, onSuccess }: DeleteOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrderAction(id);
      if (result.success) {
        toast.success(`Đơn hàng #${code} đã được xóa khỏi hệ thống`);
        setOpen(false); // TỰ ĐỘNG ĐÓNG HỘP THOẠI NGAY LẬP TỨC
        onSuccess();
      } else {
        toast.error(result.error || "Không thể xóa đơn hàng");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
          title="Xóa đơn hàng"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold">
            Xác nhận xóa đơn hàng?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed">
            Hành động này không thể hoàn tác. Đơn hàng <strong className="text-slate-900">#{code}</strong> và toàn bộ
            liên kết giao dịch liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống Supabase.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Ngăn hành vi mặc định tự đóng để chờ kết quả xóa từ máy chủ
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * ==========================================================
 * COMPONENT CHÍNH: QUẢN TRỊ ĐƠN HÀNG THƯƠNG MẠI (9 CỘT THEO SƠ ĐỒ)
 * ==========================================================
 */
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

  const [pending, startTransition] = React.useTransition();

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

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Tô màu sắc sinh động cho từng trạng thái Đơn hàng
  const getOrderStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case "Pending":
        return (
          <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0">
            Chờ duyệt
          </Badge>
        );
      case "Confirmed":
        return (
          <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0">
            Xác nhận
          </Badge>
        );
      case "Shipped":
        return (
          <Badge className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0">
            Shipping
          </Badge>
        );
      case "Delivered":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0">
            Hoàn tất
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
            {orderStatus}
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Đơn hàng thương mại</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi, phê duyệt quy trình in 3D & tự động hóa gửi hóa đơn khách hàng qua Resend.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="gap-2 font-bold h-9 px-4 shrink-0 shadow-2xs cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </Button>
      </div>

      <Card className="shadow-2xs overflow-hidden border-border/70">
        <CardHeader className="bg-muted/10 pb-4 border-b">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-800">
            <ShoppingCart className="h-5 w-5 text-primary" /> Toàn bộ giao dịch ({count})
          </CardTitle>
          <CardDescription className="text-[11px]">
            Đồng bộ dữ liệu thời gian thực từ hoạt động mua sắm trên boospace-ecommerce.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                {/* 1. Mã đơn */}
                <TableHead className="pl-6 font-bold w-[110px]">Mã đơn</TableHead>
                {/* 2. DỜI LÊN CỘT THỨ 2: Ngày tạo đơn */}
                <TableHead className="font-bold w-[120px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Ngày tạo
                  </span>
                </TableHead>
                {/* 3. Khách hàng */}
                <TableHead className="font-bold">Khách hàng</TableHead>
                {/* 4. Số điện thoại */}
                <TableHead className="font-bold">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Số điện thoại
                  </span>
                </TableHead>
                {/* 5. Địa chỉ */}
                <TableHead className="font-bold max-w-[200px]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Địa chỉ
                  </span>
                </TableHead>
                {/* 6. Tổng tiền */}
                <TableHead className="font-bold text-right w-[130px]">Tổng tiền</TableHead>
                {/* 7. Trạng thái */}
                <TableHead className="font-bold text-center w-[120px]">Trạng thái</TableHead>
                {/* 8. Xác nhận */}
                <TableHead className="font-bold text-center w-[160px]">Xác nhận</TableHead>
                {/* 9. Hành động */}
                <TableHead className="font-bold text-center pr-6 w-[120px]">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-2 block">Đang nạp đơn hàng thực tế...</span>
                  </TableCell>
                </TableRow>
              ) : (
                // ĐÃ SỬA: Ép kiểu "any" cho đối tượng order để tránh lỗi kiểm duyệt thuộc tính tĩnh
                data.map((order: any) => {
                  const displayCode = order.code ? order.code.replace("BOO-", "") : order.id.substring(0, 5);
                  const phone = order.customerPhone || order.customer_phone;
                  const address = order.customerAddress || order.customer_address;
                  const status = order.orderStatus || order.order_status;

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/10 h-16 border-b border-border/50">
                      {/* 1. Mã đơn */}
                      <TableCell className="pl-6 font-bold text-slate-800 font-mono text-xs align-middle">
                        <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                          #{displayCode}
                        </Link>
                      </TableCell>

                      {/* 2. Ngày tạo đơn */}
                      <TableCell className="font-medium text-xs text-slate-600 tabular-nums align-middle">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                      </TableCell>

                      {/* 3. Khách hàng */}
                      <TableCell className="font-bold text-slate-700 text-xs align-middle truncate max-w-[130px]">
                        {order.customerName || "Khách vãng lai"}
                      </TableCell>

                      {/* 4. Số điện thoại */}
                      <TableCell className="font-mono text-xs text-slate-600 align-middle">
                        {phone || <span className="text-muted-foreground italic text-[10px]">Chưa cung cấp</span>}
                      </TableCell>

                      {/* 5. Địa chỉ */}
                      <TableCell
                        className="text-xs text-muted-foreground align-middle truncate max-w-[200px]"
                        title={address}
                      >
                        {address || <span className="italic text-[10px]">Nhận tại xưởng</span>}
                      </TableCell>

                      {/* 6. Tổng tiền (Đồng bộ chuẩn tự phục hồi) */}
                      <TableCell className="text-right font-black text-blue-900 dark:text-blue-200 text-sm tabular-nums align-middle">
                        {formatVND(order.total)}
                      </TableCell>

                      {/* 7. Trạng thái */}
                      <TableCell className="text-center align-middle">{getOrderStatusBadge(status)}</TableCell>

                      {/* 8. Xác nhận Duyệt nhanh */}
                      <TableCell className="text-center align-middle">
                        {status === "Pending" ? (
                          <Button
                            size="xs"
                            onClick={() => handleStatusChange(order.id, "Confirmed")}
                            disabled={pending}
                            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-extrabold text-[10px] h-7 px-2.5 rounded-md shrink-0 cursor-pointer shadow-2xs"
                          >
                            Xác nhận & Gửi Mail
                          </Button>
                        ) : status === "Cancelled" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-red-500 font-bold border-red-200 bg-red-50/20 shrink-0"
                          >
                            Đã hủy đơn
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] justify-center bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md shrink-0 w-max mx-auto">
                            <CheckCircle className="h-3 w-3 shrink-0" /> Đã phê duyệt
                          </div>
                        )}
                      </TableCell>

                      {/* 9. Hành động (Xóa Dialog & Xem chi tiết) */}
                      <TableCell className="text-center align-middle pr-6">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="p-1.5 hover:bg-muted rounded-md transition text-slate-600"
                            title="Chi tiết đơn"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Link>

                          {/* Hộp thoại xóa đơn hàng chuẩn mẫu xác nhận */}
                          <DeleteOrderDialog id={order.id} code={displayCode} onSuccess={refresh} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16 text-muted-foreground text-xs">
                    Chưa có đơn hàng nào được khởi tạo.
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
