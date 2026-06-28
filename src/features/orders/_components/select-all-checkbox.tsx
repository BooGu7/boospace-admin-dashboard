"use client";

import type { Table } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import type { Order } from "@/types/order";

export function SelectAllCheckbox({ table }: { table: Table<Order> }) {
  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  );
}
