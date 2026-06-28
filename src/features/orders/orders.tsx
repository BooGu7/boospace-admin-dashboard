"use client";

import {
  getCoreRowModel,
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
      pageSize: tableState.pageSize,
    }),
    [tableState.page, tableState.pageSize],
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
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(count / tableState.pageSize),
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
      </div>
      <OrdersToolbar table={table} state={tableState} />
      <OrdersTable table={table} loading={loading} error={error} />
      <OrdersPagination table={table} />
    </div>
  );
}
