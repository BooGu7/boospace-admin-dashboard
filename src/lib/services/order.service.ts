import { createClient } from "@/lib/supabase/server";

export async function getOrders() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("ecommerce_orders").select("*").order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}
