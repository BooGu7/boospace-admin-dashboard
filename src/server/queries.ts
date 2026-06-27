import { createClient } from "@/lib/supabase/server";
export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("categories").select("id,name").order("name");

  if (error) throw error;

  return data;
}

export async function getBrands() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("brands").select("id,name").order("name");

  if (error) throw error;

  return data;
}
