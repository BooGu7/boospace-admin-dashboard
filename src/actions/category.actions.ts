"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategoryAction(name: string) {
  try {
    const supabase = await createClient();

    // HÀM TẠO SLUG CHUẨN TIẾNG VIỆT
    const slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD") // Tách dấu ra khỏi chữ cái
      .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu vừa tách
      .replace(/[đĐ]/g, "d") // Sửa riêng chữ đ
      .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
      .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, "-") // Tránh nhiều dấu gạch ngang liền nhau
      .replace(/^-+|-+$/g, ""); // Xóa dấu gạch ở đầu/cuối

    const { data, error } = await supabase.from("categories").insert([{ name, slug }]).select().single();

    if (error) throw error;
    revalidatePath("/dashboard/categories");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ... các hàm xóa giữ nguyên
export async function deleteCategoryAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
