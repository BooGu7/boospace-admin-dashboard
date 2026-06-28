import { createClient } from "@/lib/supabase/server";

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
