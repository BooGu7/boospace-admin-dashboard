"use client";

import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductsTableProps {
  columns: any[];
  data: any[];
}

export function ProductsTable({ columns, data }: ProductsTableProps) {
  const [activeTab, setActiveTab] = React.useState("all");
  const [search, setSearch] = React.useState("");

  // BỘ LỌC IN-MEMORY CỰC KỲ AN TOÀN, TRÁNH LỖI HOÀN TOÀN
  const filteredData = React.useMemo(() => {
    return data.filter((item: any) => {
      // Lọc theo tìm kiếm tên
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      // Lọc theo tabs trạng thái
      if (activeTab === "published") {
        return item.published === true && Number(item.stock || 0) > 0;
      }
      if (activeTab === "draft") {
        return item.published === false;
      }
      if (activeTab === "out-of-stock") {
        return Number(item.stock || 0) === 0;
      }
      return true;
    });
  }, [data, activeTab, search]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-muted/70">
            <TabsTrigger value="all" className="text-xs">
              Tất cả sản phẩm
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs">
              Đang bán trên Web
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs">
              Bản nháp (Draft)
            </TabsTrigger>
            <TabsTrigger value="out-of-stock" className="text-xs">
              Đã hết hàng
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm tên sản phẩm..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table className="**:data-[slot='table-cell']:text-center">
          <TableHeader className="bg-muted/15">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11 font-semibold text-slate-700 text-center">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-muted-foreground">
          Hiển thị trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount() || 1}
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
