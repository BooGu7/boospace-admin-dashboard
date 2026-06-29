"use client";

import {
  getCoreRowModel,
  type OnChangeFn, // Thêm type này
  type PaginationState,
  type RowSelectionState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { useOrders } from "@/hooks/use-orders";
import { useOrdersTableState } from "@/hooks/use-orders-table-state";

import { columns } from "./_components/columns";
import { OrdersTable } from "./_components/orders-table";
import { OrdersPagination } from "./_components/pagination";
import { OrdersToolbar } from "./_components/toolbar";

export function Orders() {
  const tableState = useOrdersTableState();

  // 1. Lấy dữ liệu từ Hook (kết nối trực tiếp với URL qua tableState)
  const {
    data = [],
    count = 0,
    loading,
    error,
  } = useOrders({
    page: tableState.page,
    pageSize: tableState.pageSize,
    search: tableState.search,
    status: tableState.status,
  });

  // 2. Local UI State
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // 3. Khóa đối tượng pagination để tránh re-render vô tận
  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: tableState.page - 1,
      pageSize: tableState.pageSize,
    }),
    [tableState.page, tableState.pageSize],
  );

  // 4. Hàm xử lý khi người dùng thao tác phân trang trên giao diện
  const handlePaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updater) => {
      const nextState = typeof updater === "function" ? updater(pagination) : updater;
      // Cập nhật lên URL thông qua hook tableState
      tableState.setParams({
        page: nextState.pageIndex + 1,
        pageSize: nextState.pageSize,
      });
    },
    [pagination, tableState],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      pagination,
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange, // QUAN TRỌNG: Thêm dòng này để nhận diện chuyển trang
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(count / tableState.pageSize),
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
      </div>
      {/* Truyền tableState vào để Toolbar có thể setParams (tìm kiếm/lọc) */}
      <OrdersToolbar table={table} state={tableState} />

      {/* Hiển thị bảng kèm trạng thái loading */}
      <OrdersTable table={table} loading={loading} error={error} />

      {/* Hiển thị phân trang */}
      <OrdersPagination table={table} />
    </div>
  );
}
