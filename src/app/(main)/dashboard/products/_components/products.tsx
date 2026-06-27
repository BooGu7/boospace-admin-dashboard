import type { Product } from "@/types/product";

import { ProductsTable } from "./products-table";
import { ProductsToolbar } from "./products-toolbar";

interface Props {
  data: Product[];
}

export function Products({ data }: Props) {
  return (
    <div className="space-y-6">
      <ProductsToolbar />

      <ProductsTable data={data} />
    </div>
  );
}
