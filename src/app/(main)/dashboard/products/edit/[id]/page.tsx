import { notFound } from "next/navigation";

import { EditProductForm } from "@/components/dashboard/products/edit-product-form";
import { getProduct } from "@/lib/product/queries";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const supabase = await createClient();

  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("id,name").order("name"),

    supabase.from("brands").select("id,name").order("name"),
  ]);

  return <EditProductForm product={product} categories={categories ?? []} brands={brands ?? []} />;
}
