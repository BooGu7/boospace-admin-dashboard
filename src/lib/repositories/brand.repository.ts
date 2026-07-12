import { createClient } from "@/lib/supabase/server";

export interface BrandInput {
  name: string;
  slug: string | null;
  logo_url?: string | null;
  website?: string | null;
  active?: boolean;
}

export async function getBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("[GET_BRANDS_ERROR]", error);
    throw new Error(error.message);
  }
  return data;
}

export async function createBrand(values: BrandInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").insert([values]).select().single();

  if (error) {
    console.error("[CREATE_BRAND_ERROR]", error);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteBrand(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);

  if (error) {
    console.error("[DELETE_BRAND_ERROR]", error);
    throw new Error(error.message);
  }
  return true;
}
