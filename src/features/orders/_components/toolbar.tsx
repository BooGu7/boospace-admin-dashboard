"use client";

import { EyeOff, Filter, RotateCcw } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function OrdersToolbar({ table, state }: any) {
  // 1. State phụ để nhập liệu không bị giật lag
  const [searchValue, setSearchValue] = React.useState(state.search || "");

  // 2. Debounce: Đợi 500ms sau khi người dùng dừng gõ mới cập nhật URL gửi lên server
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== (state.search || "")) {
        state.setParams({
          search: searchValue,
          page: 1,
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue, state]);

  // Đồng bộ lại ô nhập nếu URL bị reset ngoại vi
  React.useEffect(() => {
    setSearchValue(state.search || "");
  }, [state.search]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
      {/* Ô TÌM KIẾM MƯỢT MÀ */}
      <Input
        placeholder="Tìm mã đơn hàng hoặc tên khách..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="max-w-sm"
      />

      <div className="flex items-center gap-2 flex-wrap">
        {/* BỘ LỌC TRẠNG THÁI */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" />
              {state.status ? `Trạng thái: ${state.status}` : "Bộ lọc trạng thái"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["Pending", "Confirmed", "Shipping", "Delivered", "Cancelled"].map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() =>
                  state.setParams({
                    status: s,
                    page: 1,
                  })
                }
              >
                {s === "Pending"
                  ? "Chờ xử lý"
                  : s === "Confirmed"
                    ? "Đã xác nhận"
                    : s === "Shipping"
                      ? "Đang giao"
                      : s === "Delivered"
                        ? "Đã hoàn thành"
                        : "Đã hủy"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* NÚT ĐẶT LẠI */}
        <Button variant="ghost" size="sm" className="h-8 text-slate-500" onClick={state.resetParams}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>

        {/* NÚT ẨN/HIỆN CỘT */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <EyeOff className="mr-2 h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .filter((col: any) => col.getCanHide())
              .map((col: any) => (
                <DropdownMenuItem key={col.id} onClick={() => col.toggleVisibility()} className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    readOnly
                    className="mr-2 cursor-pointer h-3 w-3"
                  />
                  <span className="capitalize">{col.id}</span>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
