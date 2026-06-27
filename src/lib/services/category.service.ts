import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("ecommerce_categories").select("*").order("sort_order");

  if (error) throw error;

  return data;
}
