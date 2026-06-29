"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order } from "@/types/order";
import { DeleteOrder } from "./delete-order";
import { SelectAllCheckbox } from "./select-all-checkbox";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const formatDate = (value: string) => new Date(value).toLocaleDateString("vi-VN");

const statusMap: Record<
  string,
  {
    label: string;
    variant: "outline" | "default" | "secondary" | "destructive";
  }
> = {
  Pending: { label: "Chờ xử lý", variant: "outline" },
  Confirmed: { label: "Đã xác nhận", variant: "secondary" },
  Shipping: { label: "Đang giao", variant: "default" },
  Delivered: { label: "Đã hoàn thành", variant: "default" },
  Cancelled: { label: "Đã hủy", variant: "destructive" },
};

export const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "Mã đơn hàng",
    cell: ({ row }) => (
      <Link href={`/dashboard/orders/${row.original.id}`} className="font-bold text-blue-600 hover:underline">
        #{row.original.code}
      </Link>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Khách hàng",
  },
  {
    accessorKey: "total",
    header: "Tổng tiền",
    cell: ({ row }) => formatCurrency(row.original.total),
  },
  {
    accessorKey: "orderStatus",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = statusMap[row.original.orderStatus] || {
        label: row.original.orderStatus,
        variant: "outline",
      };
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const order = row.original;

      // Lấy hàm làm mới từ cấu hình table meta
      const refresh = (table.options.meta as any)?.refreshOrders;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${order.id}`} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${order.id}`} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <DeleteOrder id={order.id} onSuccess={refresh} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
