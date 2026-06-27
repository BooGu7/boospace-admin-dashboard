import { CreateProductForm } from "@/components/dashboard/products/create-product-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("id,name").order("name"),

    supabase.from("brands").select("id,name").order("name"),
  ]);

  return <CreateProductForm categories={categories ?? []} brands={brands ?? []} />;
}
