"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, ClipboardList, Lock, Mail, MapPin, Phone, Unlock } from "lucide-react";
import Image from "next/image"; // ĐỒNG BỘ: Sử dụng Next.js Image
import * as React from "react";
import { toast } from "sonner";
import { toggleUserBlockAction } from "@/actions/user.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { type CustomerTier, statusMeta, tierMeta } from "./data";

interface ActionCellProps {
  customer: any;
  onOpenDetail: (email: string, name: string) => void;
}

function ActionCell({ customer, onOpenDetail }: ActionCellProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleToggleBlock = () => {
    const actionLabel = customer.blocked ? "Mở khóa" : "Khóa";
    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} tài khoản ${customer.name}?`)) return;

    startTransition(async () => {
      const res = await toggleUserBlockAction(customer.id, customer.blocked);
      if (res.success) {
        toast.success(`Đã ${actionLabel} tài khoản thành công.`);
      } else {
        toast.error("Thao tác thất bại.");
      }
    });
  };

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        size="xs"
        onClick={() => onOpenDetail(customer.email, customer.name)}
        className="bg-black text-white hover:bg-black/90 font-bold text-[10px] h-7 px-2.5 rounded-md gap-1 cursor-pointer shrink-0"
      >
        <ClipboardList className="h-3.5 w-3.5" /> Nhật ký mua hàng
      </Button>

      {/* Chỉ hiển thị nút khóa cho tài khoản đã đăng ký */}
      {customer.hasAccount ? (
        <Button
          size="xs"
          variant="outline"
          onClick={handleToggleBlock}
          disabled={isPending}
          className={cn(
            "h-7 px-2 text-[10px] font-bold rounded-md gap-1 cursor-pointer shrink-0 border",
            customer.blocked
              ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              : "border-red-200 text-red-600 hover:bg-red-50",
          )}
        >
          {customer.blocked ? (
            <>
              <Unlock className="h-3 w-3" /> Mở khóa
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" /> Khóa tài khoản
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}

export function createColumns(onOpenDetail: (email: string, name: string) => void): ColumnDef<any>[] {
  return [
    {
      accessorKey: "name",
      header: "Khách hàng",
      cell: ({ row }) => {
        const p = row.original;
        const initials = getInitials(p.name);
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
              {p.avatarUrl ? (
                // ĐÃ SỬA: Sử dụng Next.js Image kèm unoptimized={true} để vượt qua kiểm duyệt domain mà không bị lỗi linter
                <Image src={p.avatarUrl} alt={p.name} fill unoptimized={true} className="object-cover" />
              ) : (
                <span className="font-bold text-xs text-blue-700">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-sm truncate">{p.name}</span>
                {p.blocked && (
                  <Badge className="bg-red-50 text-red-600 border border-red-100 p-0.5 rounded-md text-[9px] font-bold gap-0.5">
                    <Lock className="h-2.5 w-2.5" /> Đã khóa
                  </Badge>
                )}
              </div>
              <div className="truncate text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" /> {p.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: () => (
        <div className="flex items-center gap-1 font-bold">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Số ĐT
        </div>
      ),
      cell: ({ row }) => <span className="text-xs font-mono font-bold text-slate-700">{row.original.phone}</span>,
    },
    {
      accessorKey: "address",
      header: () => (
        <div className="flex items-center gap-1 font-bold">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Địa chỉ nhận hàng
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={row.original.address}>
          {row.original.address}
        </div>
      ),
    },
    {
      accessorKey: "orderCount",
      header: () => <div className="text-center font-bold">Số đơn mua</div>,
      cell: ({ row }) => (
        <div className="text-center font-extrabold text-xs text-slate-800">{row.original.orderCount} đơn</div>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: () => <div className="text-right font-bold">Tổng chi tiêu</div>,
      cell: ({ row }) => {
        const formatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(row.original.totalSpent);
        return <div className="text-right font-black text-xs text-blue-900">{formatted}</div>;
      },
    },
    {
      accessorKey: "tier",
      header: "Phân hạng",
      cell: ({ row }) => {
        const p = row.original;
        if (!p.hasAccount) return null;

        const tier = p.tier as CustomerTier;
        const meta = tierMeta[tier];
        const Icon = meta.icon;
        return (
          <Badge className={cn("gap-1 py-0.5 text-[9px] rounded-md shrink-0", meta.badgeClass)}>
            <Icon className="h-3 w-3 shrink-0" />
            {tier}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const p = row.original;
        const meta = p.hasAccount ? statusMeta.Registered : statusMeta.Guest;
        return (
          <Badge className={cn("gap-1.5 py-0.5 text-[9px] rounded-md border shrink-0", meta.badgeClass)}>
            {meta.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "joinedDate",
      header: () => (
        <div className="flex items-center gap-1 font-bold">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Ngày tham gia
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-[10px] font-semibold text-slate-600 font-mono">{row.original.joinedDate}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center font-bold">Hành động</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <ActionCell customer={row.original} onOpenDetail={onOpenDetail} />
        </div>
      ),
    },
  ];
}
