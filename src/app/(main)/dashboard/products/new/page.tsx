import { CreateProductForm } from "@/components/dashboard/products/create-product-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const supabase = await createClient();

  // Lấy danh sách Categories và Brands để người dùng chọn trong Dropdown
  const [categoriesRes, brandsRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl tracking-tight">Thêm sản phẩm 3D mới</h2>
      </div>

      {/* Component Form của bạn sẽ nhận dữ liệu danh mục & thương hiệu ở đây */}
      <CreateProductForm categories={categoriesRes.data ?? []} brands={brandsRes.data ?? []} />
    </div>
  );
}
