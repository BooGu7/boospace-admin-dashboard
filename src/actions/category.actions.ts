"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createCategoryAction(name: string) {
  const supabase = await createClient();

  // Tạo slug tự động từ tên
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase.from("categories").insert([{ name, slug }]).select().single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/categories");
  return { success: true, data };
}

export async function deleteCategoryAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/categories");
  return { success: true };
}
