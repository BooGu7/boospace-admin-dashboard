"use client";

import {
  getCoreRowModel,
  type OnChangeFn,
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

  const {
    data = [],
    count = 0,
    loading,
    error,
    refresh, // Nhận hàm làm mới từ hook
  } = useOrders({
    page: tableState.page,
    pageSize: tableState.pageSize,
    search: tableState.search,
    status: tableState.status,
  });

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: tableState.page - 1,
      pageSize: tableState.pageSize || 10,
    }),
    [tableState.page, tableState.pageSize],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updater) => {
      const nextState = typeof updater === "function" ? updater(pagination) : updater;
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

    // GẮN HÀM REFRESH VÀO META ĐỂ CỘT ACTION CÓ THỂ GỌI ĐƯỢC
    meta: {
      refreshOrders: refresh,
    },

    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableMultiRowSelection: true,

    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(Math.ceil(count / (tableState.pageSize || 10)), 1),
  });

  return (
    <div className="space-y-4 p-4 bg-card rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng số đơn hàng thực tế trên hệ thống: <strong className="text-primary">{count}</strong>
          </p>
        </div>
      </div>
      <OrdersToolbar table={table} state={tableState} />
      <OrdersTable table={table} loading={loading} error={error} />
      <OrdersPagination table={table} />
    </div>
  );
}
