"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { differenceInCalendarDays, endOfToday, parseISO } from "date-fns";
import {
  Award,
  CircleAlertIcon,
  CircleCheckIcon,
  Eye,
  LoaderIcon,
  Sparkles,
  User,
  UserCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { RecentCustomerRow } from "./schema";

function billingIcon(billing: string) {
  switch (billing) {
    case "Paid":
      return <CircleCheckIcon className="fill-green-500 stroke-primary-foreground dark:fill-green-600 size-3 mr-1" />;
    case "Pending":
      return <LoaderIcon className="size-3 mr-1 animate-spin" />;
    default:
      return <CircleAlertIcon className="text-amber-600 dark:text-amber-500 size-3 mr-1" />;
  }
}

// Hàm gán Icon phân hạng thành viên chuẩn sắc màu
function getTierBadge(tier: string) {
  switch (tier) {
    case "Platinum":
      return (
        <Badge className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-extrabold text-[9px] rounded-md gap-0.5">
          <Sparkles className="h-2.5 w-2.5" /> Kim cương
        </Badge>
      );
    case "Gold":
      return (
        <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 font-extrabold text-[9px] rounded-md gap-0.5">
          <Award className="h-2.5 w-2.5" /> Vàng
        </Badge>
      );
    case "Silver":
      return (
        <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-extrabold text-[9px] rounded-md gap-0.5">
          <UserCheck className="h-2.5 w-2.5" /> Bạc
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-[9px] rounded-md gap-0.5">
          <User className="h-2.5 w-2.5" /> Đồng
        </Badge>
      );
  }
}

export const recentCustomersColumns: ColumnDef<RecentCustomerRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Chọn ${row.original.name}`}
        />
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Khách hàng",
    cell: ({ row }) => {
      const p = row.original;
      const isGuest = p.status === "Khách vãng lai";

      return (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted shrink-0">
            <UserRound className="size-4 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="grid min-w-0 gap-0.5">
              <span className="truncate font-bold text-sm leading-none text-slate-800">
                {isGuest ? "Khách vãng lai" : p.name}
              </span>
              <span className="truncate text-muted-foreground text-[10px] leading-none mt-0.5 font-semibold">
                {isGuest && p.secondaryName ? `Đơn hàng: ${p.secondaryName}` : p.email}
              </span>
            </div>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    id: "search",
    accessorFn: (row) => `${row.id} ${row.name} ${row.email} ${row.secondaryName || ""}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const isRegistered = row.original.status === "Đã đăng ký";
      return (
        <Badge
          className={cn(
            "px-2 py-0.5 text-[9px] font-bold border rounded-md shrink-0",
            isRegistered
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-slate-50 border-slate-200 text-slate-600",
          )}
          variant="outline"
        >
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "billing",
    header: "Thanh toán",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const isPaid = row.original.billing === "Paid";
      return (
        <Badge
          variant="outline"
          className={cn(
            "px-1.5 text-[9px] font-extrabold border rounded-md shrink-0",
            isPaid
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-orange-50 text-orange-700 border-orange-200",
          )}
        >
          {billingIcon(row.original.billing)}
          {row.original.billing === "Paid" ? "Đã thanh toán" : "Chờ thanh toán"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Sản phẩm đã order",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-slate-700 max-w-[220px] truncate block" title={row.original.plan}>
        {row.original.plan}
      </span>
    ),
  },
  {
    accessorKey: "tier",
    header: "Phân hạng",
    cell: ({ row }) => {
      const p = row.original;
      if (p.status === "Khách vãng lai") return null;
      return getTierBadge(p.tier || "Bronze");
    },
  },
  {
    id: "joinedWindow",
    accessorFn: (row) => {
      const daysSinceJoined = differenceInCalendarDays(endOfToday(), parseISO(row.joined));
      if (daysSinceJoined <= 30) return ["30", "90"];
      if (daysSinceJoined <= 90) return ["90"];
      return [];
    },
    filterFn: "arrIncludes",
    enableHiding: true,
  },
  {
    accessorKey: "joined",
    header: "Thời gian order",
    cell: ({ row }) => {
      const date = new Date(row.original.joined);
      return (
        <div className="grid gap-0.5">
          <span className="text-xs font-bold text-slate-700">{date.toLocaleDateString("vi-VN")}</span>
          <span className="text-muted-foreground text-[10px] font-semibold">
            vào{" "}
            {date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  // ĐỒNG BỘ: Bổ sung thêm cột xem chi tiết chuyển hướng sang đơn hàng (React 19 & Next.js Link)
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => {
      const orderId = row.original.id;
      return (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 px-2 font-bold text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5"
        >
          <Link href={`/dashboard/orders/${orderId}`}>
            <Eye className="h-3.5 w-3.5" />
            Xem chi tiết
          </Link>
        </Button>
      );
    },
  },
];
