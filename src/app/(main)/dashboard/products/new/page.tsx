import { createProductAction } from "@/actions/product.actions";
import { ProductForm } from "@/components/dashboard/products/product-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const supabase = await createClient();

  const [categoriesRes, brandsRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  const handleCreate = async (values: any) => {
    "use server";
    return await createProductAction(values);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProductForm categories={categoriesRes.data ?? []} brands={brandsRes.data ?? []} onSubmit={handleCreate} />
    </div>
  );
}
