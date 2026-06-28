import { createClient } from "@/lib/supabase/server";
import type { ProductInsert, ProductUpdate, ProductWithRelations } from "@/types/product";

/**
 * LẤY DANH SÁCH TẤT CẢ SẢN PHẨM
 */
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

/**
 * LẤY CHI TIẾT 1 SẢN PHẨM THEO ID (Hàm đang bị thiếu)
 */
export async function getProductById(id: string): Promise<ProductWithRelations> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), brands(name)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    throw new Error("Không tìm thấy sản phẩm");
  }
  return data as ProductWithRelations;
}

/**
 * TẠO MỚI SẢN PHẨM
 */
export async function createProduct(values: ProductInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert(values).select().single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * CẬP NHẬT SẢN PHẨM
 */
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

/**
 * XÓA SẢN PHẨM
 */
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
