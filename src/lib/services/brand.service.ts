import { createClient } from "@/lib/supabase/server";

export async function getBrands() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("ecommerce_brands").select("*").order("sort_order");

  if (error) throw error;

  return data;
}
