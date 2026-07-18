import { getProducts } from "@/lib/repositories/product.repository";
import { Products } from "./_components/products";

export const revalidate = 0; // Đảm bảo luôn tải mới dữ liệu thực tế khi F5

export default async function ProductsPage() {
  const allProducts = await getProducts();

  // ĐỒNG BỘ: Ẩn hoàn toàn 3 sản phẩm mẫu (template 1, 2, 3) khỏi bảng danh sách quản lý của admin
  const filteredProducts = (allProducts || []).filter(
    (product) =>
      product.sku !== "BOO-TEMPLATE-01" && product.sku !== "BOO-TEMPLATE-02" && product.sku !== "BOO-TEMPLATE-03",
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl tracking-tight">Sản phẩm</h2>
      </div>
      <Products data={filteredProducts} />
    </div>
  );
}
