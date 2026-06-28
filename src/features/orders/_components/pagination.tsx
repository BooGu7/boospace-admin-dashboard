"use client";

import { Button } from "@/components/ui/button";

export function OrdersPagination({ table }: { table: any }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-gray-500">
        Page {pageIndex + 1} of {pageCount}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>

        <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
