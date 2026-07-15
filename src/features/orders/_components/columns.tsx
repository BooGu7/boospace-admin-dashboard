"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, CheckCircle, Eye, MapPin, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
// Đồng bộ hóa hành động duyệt nhanh ngay trên dòng bảng
import { updateOrderStatusAction } from "@/actions/order.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteOrder } from "./delete-order";

// Component con hỗ trợ Duyệt nhanh "Xác nhận & Gửi Mail" ngay tại bảng
function QuickApproveButton({
  orderId,
  orderCode,
  currentStatus,
}: {
  orderId: string;
  orderCode: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = React.useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, "Confirmed");
      if (res.success) {
        toast.success(`Đã phê duyệt đơn hàng #${orderCode} và tự động gửi hóa đơn Resend!`);
      } else {
        toast.error(res.error || "Không thể phê duyệt đơn.");
      }
    });
  };

  if (currentStatus === "Pending") {
    return (
      <Button
        size="xs"
        onClick={handleApprove}
        disabled={isPending}
        className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-extrabold text-[10px] h-7 px-2 rounded-md shrink-0 cursor-pointer shadow-2xs"
      >
        {isPending ? "Đang duyệt..." : "Xác nhận & Gửi Mail"}
      </Button>
    );
  }

  if (currentStatus === "Cancelled") {
    return (
      <Badge variant="outline" className="text-[10px] text-red-500 font-bold border-red-200 bg-red-50/20 shrink-0">
        Đã hủy đơn
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] justify-center bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md shrink-0">
      <CheckCircle className="h-3 w-3 shrink-0" /> Đã phê duyệt
    </div>
  );
}

export const columns: ColumnDef<any>[] = [
  // Cột 1: Mã đơn
  {
    accessorKey: "code",
    header: "Mã đơn",
    cell: ({ row }) => {
      const order = row.original;
      const displayCode = order.code ? order.code.replace("BOO-", "") : order.id.substring(0, 5);
      return <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs">#{displayCode}</span>;
    },
  },
  // Cột 2: Ngày tạo đơn (DỜI LÊN VỊ TRÍ THỨ 2)
  {
    accessorKey: "createdAt",
    header: () => (
      <div className="flex items-center gap-1.5 font-bold">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Ngày tạo
      </div>
    ),
    cell: ({ row }) => {
      const order = row.original;
      const rawDate = order.createdAt || order.created_at;
      return (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
          {rawDate ? new Date(rawDate).toLocaleDateString("vi-VN") : "-"}
        </span>
      );
    },
  },
  // Cột 3: Khách hàng
  {
    accessorKey: "customerName",
    header: "Khách hàng",
    cell: ({ row }) => {
      const order = row.original;
      const name = order.customerName || order.customer_name || "Khách hàng ẩn danh";
      const email = order.customerEmail || order.customer_email;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{name}</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[130px]" title={email}>
            {email}
          </span>
        </div>
      );
    },
  },
  // Cột 4: Số điện thoại (Ép buộc luôn hiển thị)
  {
    accessorKey: "customerPhone",
    enableHiding: false,
    header: () => (
      <div className="flex items-center gap-1.5 font-bold">
        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Số điện thoại
      </div>
    ),
    cell: ({ row }) => {
      const order = row.original;
      const phone = order.customerPhone || order.customer_phone;
      return (
        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          {phone || <span className="text-muted-foreground italic text-[10px]">Chưa cung cấp</span>}
        </span>
      );
    },
  },
  // Cột 5: Địa chỉ giao nhận (Ép buộc luôn hiển thị)
  {
    accessorKey: "customerAddress",
    enableHiding: false,
    header: () => (
      <div className="flex items-center gap-1.5 font-bold">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Địa chỉ
      </div>
    ),
    cell: ({ row }) => {
      const order = row.original;
      const address = order.customerAddress || order.customer_address;
      return (
        <div
          className="text-xs text-muted-foreground truncate max-w-[180px] font-medium"
          title={address || "Nhận tại xưởng Boospace"}
        >
          {address || <span className="italic text-[10px]">Nhận tại xưởng</span>}
        </div>
      );
    },
  },
  // Cột 6: Tổng số tiền thanh toán
  {
    accessorKey: "total",
    header: () => <div className="text-right font-bold">Tổng tiền</div>,
    cell: ({ row }) => {
      const order = row.original;
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(order.total || 0);
      return (
        <div className="text-right font-black text-blue-900 dark:text-blue-200 text-sm tabular-nums">{formatted}</div>
      );
    },
  },
  // Cột 7: Trạng thái đơn hàng
  {
    accessorKey: "orderStatus",
    header: () => <div className="text-center font-bold">Trạng thái</div>,
    cell: ({ row }) => {
      const order = row.original;
      const status = order.orderStatus || order.order_status;
      switch (status) {
        case "Pending":
          return (
            <div className="flex justify-center">
              <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
                Chờ duyệt
              </Badge>
            </div>
          );
        case "Confirmed":
          return (
            <div className="flex justify-center">
              <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
                Xác nhận
              </Badge>
            </div>
          );
        case "Shipped":
          return (
            <div className="flex justify-center">
              <Badge className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
                Shipping
              </Badge>
            </div>
          );
        case "Delivered":
          return (
            <div className="flex justify-center">
              <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
                Hoàn tất
              </Badge>
            </div>
          );
        case "Cancelled":
          return (
            <div className="flex justify-center">
              <Badge className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2 py-0.5 text-[11px] rounded-md shrink-0">
                Cancelled
              </Badge>
            </div>
          );
        default:
          return (
            <div className="flex justify-center">
              <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
                {status}
              </Badge>
            </div>
          );
      }
    },
  },
  // Cột 8: Xác nhận (CHỮA NÚT DUYỆT NHANH PHÊ DUYỆT ĐƠN)
  {
    id: "quick-approve",
    header: () => <div className="text-center font-bold">Xác nhận</div>,
    cell: ({ row }) => {
      const order = row.original;
      const status = order.orderStatus || order.order_status;
      const displayCode = order.code ? order.code.replace("BOO-", "") : order.id.substring(0, 5);
      return (
        <div className="flex justify-center">
          <QuickApproveButton orderId={order.id} orderCode={displayCode} currentStatus={status} />
        </div>
      );
    },
  },
  // Cột 9: Hành động (XÓA CHUẨN MODAL NHƯ SẢN PHẨM)
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const displayCode = order.code ? order.code.replace("BOO-", "") : order.id.substring(0, 5);
      return (
        <div className="flex justify-center">
          {/* Nút Xem Chi tiết nhanh dạng Icon */}
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="p-1.5 hover:bg-muted rounded-md transition text-slate-600 mr-1"
            title="Chi tiết đơn hàng"
          >
            <Eye className="h-4.5 w-4.5" />
          </Link>

          {/* Dialog xóa đơn hàng chuẩn mẫu DeleteProduct */}
          <DeleteOrder
            id={order.id}
            code={displayCode}
            trigger={
              <button
                type="button"
                className="p-1.5 text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                title="Xóa đơn hàng"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            }
          />
        </div>
      );
    },
  },
];
