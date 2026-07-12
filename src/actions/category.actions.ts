"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * TẠO MỚI DANH MỤC
 */
export async function createCategoryAction(values: {
  name: string;
  parent_id?: string | null;
  description?: string | null;
  image_url?: string | null;
}) {
  try {
    const supabase = await createClient();
    const { name, parent_id, description, image_url } = values;

    // HÀM TẠO SLUG CHUẨN TIẾNG VIỆT KHÔNG DẤU
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

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, slug, parent_id, description, image_url }])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard/categories");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * CẬP NHẬT DANH MỤC THEO ID
 */
export async function updateCategoryAction(
  id: string,
  values: {
    name: string;
    parent_id?: string | null;
    description?: string | null;
    image_url?: string | null;
  },
) {
  try {
    const supabase = await createClient();
    const { name, parent_id, description, image_url } = values;

    // TẠO LẠI SLUG ĐỒNG BỘ THEO TÊN MỚI
    const slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("categories")
      .update({
        name,
        slug,
        parent_id,
        description,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard/categories");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * XÓA DANH MỤC THEO ID
 */
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

/**
 * TẢI ẢNH DANH MỤC LÊN BUCKET 'categories' (Dùng ArrayBuffer ổn định dòng truyền dữ liệu)
 */
export async function uploadCategoryImage(formData: FormData) {
  try {
    const supabase = await createClient();
    const file = formData.get("file") as File;
    if (!file) throw new Error("File không tồn tại");

    const fileName = `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const filePath = `categories/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage.from("categories").upload(filePath, buffer, {
      contentType: file.type,
    });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("categories").getPublicUrl(filePath);
    return publicUrl;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Lỗi upload");
  }
}
