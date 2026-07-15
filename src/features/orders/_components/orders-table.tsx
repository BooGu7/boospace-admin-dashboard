"use client";

import {
  type ColumnFiltersState, // ĐỒNG BỘ: Đã bổ sung kiểu dữ liệu bộ lọc
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState, // ĐỒNG BỘ: Đã bổ sung kiểu dữ liệu sắp xếp
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toolbar } from "./toolbar";

interface OrdersTableProps {
  data: any[];
  columns: any[];
}

export function OrdersTable({ data, columns }: OrdersTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});

  // ĐÃ SỬA: Định nghĩa kiểu dữ liệu rõ ràng cho bộ lọc và sắp xếp để tránh lỗi tự suy luận kiểu never[]
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorted] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
    // ÉP BUỘC HIỂN THỊ: Khai báo tất cả các cột luôn ở trạng thái TRUE (Hiện diện 100%)
    initialState: {
      columnVisibility: {
        code: true,
        createdAt: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        total: true,
        orderStatus: true,
        "quick-approve": true,
        actions: true,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorted,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm & Nút làm mới */}
      <Toolbar table={table} />

      <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/15 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-extrabold text-slate-800 h-12">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/10 h-16 border-b border-border/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle py-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground">
                  Không tìm thấy bất kỳ giao dịch nào phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bộ phân trang cục bộ (Inline Pagination) cao cấp */}
      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground pt-2">
        <div className="flex-1 font-semibold">
          Đang hiển thị {table.getRowModel().rows.length} trên tổng số {table.getFilteredRowModel().rows.length} dòng
          đơn hàng.
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs font-bold px-3 cursor-pointer disabled:opacity-40"
          >
            Trước
          </Button>
          <span className="font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs font-bold px-3 cursor-pointer disabled:opacity-40"
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
