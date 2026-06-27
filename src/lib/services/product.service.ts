import { createClient } from "@/lib/supabase/server";

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("ecommerce_products").select("*").order("sort_order");

  if (error) throw error;

  return data;
}
