import { notFound } from "next/navigation";
import { updateProductAction } from "@/actions/product.actions";
import { ProductForm } from "@/components/dashboard/products/product-form";
import { getProductById } from "@/lib/repositories/product.repository";
import { createClient } from "@/lib/supabase/server";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Phải await params trong Next.js 15
  const { id } = await params;

  const supabase = await createClient();

  // Gọi hàm chúng ta vừa export ở Bước 1
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [categoriesRes, brandsRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  const handleUpdate = async (values: any) => {
    "use server";
    return await updateProductAction(id, values);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProductForm
        initialData={product}
        categories={categoriesRes.data ?? []}
        brands={brandsRes.data ?? []}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
