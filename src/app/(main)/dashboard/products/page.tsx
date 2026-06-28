import { getProducts } from "@/lib/repositories/product.repository";

import { Products } from "./_components/products";

export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl tracking-tight">Sản phẩm</h2>
      </div>
      <Products data={products} />
    </div>
  );
}
