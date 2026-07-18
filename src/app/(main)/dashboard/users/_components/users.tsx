"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Search, Users as UsersIcon } from "lucide-react";
import * as React from "react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { filters } from "./data";
import { createColumns } from "./users-columns";
import { UsersTable } from "./users-table";

export function Users({ users }: { users: any[] }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "joinedDate", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Quản lý đóng mở hộp thoại chi tiết động
  const [openDetail, setOpenDetail] = React.useState(false);
  const [selectedEmail, setSelectedEmail] = React.useState("");
  const [selectedName, setSelectedName] = React.useState("");

  // ĐÃ SỬA: Wrap handleOpenDetail trong useCallback để tránh lỗi useExhaustiveDependencies
  const handleOpenDetail = React.useCallback((email: string, name: string) => {
    setSelectedEmail(email);
    setSelectedName(name);
    setOpenDetail(true);
  }, []);

  // columns nhận diện tham chiếu tĩnh an toàn
  const columns = React.useMemo(() => createColumns(handleOpenDetail), [handleOpenDetail]);

  const table = useReactTable({
    data: users,
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.email,
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = (table.getColumn("name")?.getFilterValue() as string) ?? "";
  const tierFilter = (table.getColumn("tier")?.getFilterValue() as string) ?? filters.tier[0];
  const statusFilter = (table.getColumn("status")?.getFilterValue() as string) ?? filters.status[0];

  function setColumnSelectFilter(columnId: string, value: string) {
    table.getColumn(columnId)?.setFilterValue(value === "Tất cả" ? undefined : value);
    table.setPageIndex(0);
  }

  return (
    <Card className="shadow-2xs border-border/70 overflow-hidden">
      <CardHeader className="border-b bg-muted/10">
        <div>
          <CardTitle className="text-xl font-extrabold flex items-center gap-1.5">
            <UsersIcon className="h-5 w-5 text-primary" /> Hồ sơ Khách hàng
          </CardTitle>
          <CardDescription className="max-w-sm text-[11px] mt-1">
            Quản lý cơ sở dữ liệu thành viên, hạch toán tổng chi tiêu và phân hạng khách hàng in 3D.
          </CardDescription>
        </div>
        <CardAction className="flex w-full flex-wrap justify-start gap-2 md:w-auto md:flex-nowrap md:justify-end">
          <InputGroup className="h-9 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-9 text-xs pl-8"
              placeholder="Tìm theo tên, email..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("name")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </InputGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0">
        {/* Bộ lọc lựa chọn */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Bộ lọc Phân hạng */}
            <Select value={tierFilter} onValueChange={(value) => setColumnSelectFilter("tier", value)}>
              <SelectTrigger size="sm" className="h-8 text-xs font-semibold cursor-pointer">
                <span className="text-muted-foreground">Phân hạng:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {filters.tier.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs font-semibold">
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Bộ lọc Trạng thái */}
            <Select value={statusFilter} onValueChange={(value) => setColumnSelectFilter("status", value)}>
              <SelectTrigger size="sm" className="h-8 text-xs font-semibold cursor-pointer">
                <span className="text-muted-foreground">Trạng thái:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {filters.status.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs font-semibold">
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <UsersTable
          table={table}
          openDetail={openDetail}
          setOpenDetail={setOpenDetail}
          selectedEmail={selectedEmail}
          selectedName={selectedName}
        />
      </CardContent>
    </Card>
  );
}
