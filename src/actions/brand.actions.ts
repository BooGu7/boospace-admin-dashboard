"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * TẠO MỚI THƯƠNG HIỆU (Lưu trữ ảnh tại bucket 'brands' công khai)
 */
export async function createBrandAction(values: {
  name: string;
  logo_url?: string | null;
  website?: string | null;
  active?: boolean;
}) {
  try {
    const supabase = await createClient();
    const { name, logo_url, website, active = true } = values;

    // HÀM TẠO SLUG TIẾNG VIỆT KHÔNG DẤU
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
      .insert([{ name, slug, logo_url, website, active }])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard/brands");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * CẬP NHẬT THƯƠNG HIỆU THEO ID
 */
export async function updateBrandAction(
  id: string,
  values: {
    name: string;
    logo_url?: string | null;
    website?: string | null;
    active?: boolean;
  },
) {
  try {
    const supabase = await createClient();
    const { name, logo_url, website, active = true } = values;

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
      .from("brands")
      .update({
        name,
        slug,
        logo_url,
        website,
        active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard/brands");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * XÓA THƯƠNG HIỆU
 */
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

/**
 * TẢI LOGO THƯƠNG HIỆU LÊN BUCKET CÔNG KHAI 'brands'
 */
export async function uploadBrandLogo(formData: FormData) {
  try {
    const supabase = await createClient();
    const file = formData.get("file") as File;
    if (!file) throw new Error("File không tồn tại");

    const fileName = `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const filePath = `${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sử dụng trực tiếp bucket 'brands' đã được cấu hình Public
    const { error: uploadError } = await supabase.storage.from("brands").upload(filePath, buffer, {
      contentType: file.type,
    });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("brands").getPublicUrl(filePath);
    return publicUrl;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Lỗi upload");
  }
}
