"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function OrdersToolbar({ table, state }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* SEARCH */}
      <Input
        placeholder="Search order code / customer..."
        value={state.search}
        onChange={(e) =>
          state.setParams({
            search: e.target.value,
            page: 1,
          })
        }
        className="max-w-sm"
      />

      <div className="flex items-center gap-2">
        {/* STATUS FILTER */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Status</Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
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
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* RESET */}
        <Button variant="ghost" onClick={state.resetParams}>
          Reset
        </Button>

        {/* COLUMN TOGGLE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            {table
              .getAllLeafColumns()
              .filter((col: any) => col.getCanHide())
              .map((col: any) => (
                <DropdownMenuItem key={col.id} onClick={() => col.toggleVisibility()}>
                  <input type="checkbox" checked={col.getIsVisible()} readOnly className="mr-2" />
                  {col.id}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
