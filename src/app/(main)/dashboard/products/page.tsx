import { getProducts } from "@/lib/product/queries";

import { Products } from "./_components/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return <Products data={products} />;
}
