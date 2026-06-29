"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBrandAction(name: string, logoUrl?: string) {
  try {
    const supabase = await createClient();

    const slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("brands")
      .insert([{ name, slug, logo_url: logoUrl }])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard/brands");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/brands");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
