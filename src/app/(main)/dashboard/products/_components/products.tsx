"use client";

import type { ProductWithRelations } from "@/types/product";

import { columns } from "./columns";
import { ProductsTable } from "./products-table";
import { ProductsToolbar } from "./products-toolbar";

interface Props {
  data: ProductWithRelations[];
}

export function Products({ data }: Props) {
  return (
    <div className="space-y-6">
      <ProductsToolbar />
      <ProductsTable columns={columns} data={data} />
    </div>
  );
}
