"use client";

import type { Table } from "@tanstack/react-table";
import { RefreshCw, Search, X } from "lucide-react"; // ĐÃ SỬA: Sử dụng X thay cho Cross2Icon của Radix
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ToolbarProps<TData> {
  table: Table<TData>;
}

export function Toolbar<TData>({ table }: ToolbarProps<TData>) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const isFiltered = table.getState().columnFilters.length > 0;

  // LÀM MỚI DỮ LIỆU ĐƠN HÀNG THỰC TẾ
  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh(); // Gọi làm mới bộ nhớ cache Next.js Server
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ đơn hàng mới nhất từ Supabase!");
    }, 600);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm mã đơn, tên khách..."
            value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("customerName")?.setFilterValue(event.target.value)}
            className="h-8 pl-8 text-xs w-[250px] lg:w-[300px]"
          />
        </div>

        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3 text-xs">
            Reset
            {/* ĐÃ SỬA: Thay thế bằng Icon X từ lucide-react an toàn */}
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* NÚT LÀM MỚI HOẠT ĐỘNG THẬT */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 text-xs font-bold gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing && "animate-spin"}`} />
          Làm mới
        </Button>
      </div>
    </div>
  );
}
