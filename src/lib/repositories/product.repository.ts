import { createClient } from "@/lib/supabase/server";
import type { ProductInsert, ProductUpdate, ProductWithRelations } from "@/types/product";

// Chuyển sang Export trực tiếp hàm để khớp với lệnh Import
export async function getProducts(): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
        *,
        categories(name),
        brands(name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as ProductWithRelations[];
}

export async function createProduct(values: ProductInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert(values).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: string, values: ProductUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
