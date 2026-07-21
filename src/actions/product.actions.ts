"use server";

import { revalidatePath } from "next/cache";
import * as productRepo from "@/lib/repositories/product.repository";
import { createClient } from "@/lib/supabase/server";
import { type ProductFormValues, productSchema } from "@/schemas/product.schema";
import type { ProductInsert, ProductUpdate } from "@/types/product";

/**
 * TẠO MỚI SẢN PHẨM (Dạng Action đầy đủ)
 */
export async function createProductAction(values: ProductFormValues) {
  try {
    const validated = productSchema.parse(values);
    const data = await productRepo.createProduct(validated as unknown as ProductInsert);
    revalidatePath("/dashboard/products");
    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: msg };
  }
}

/**
 * TẠO MỚI SẢN PHẨM (Dạng chuyển tiếp bí danh)
 */
export async function createProduct(values: ProductFormValues) {
  return createProductAction(values);
}

/**
 * CẬP NHẬT SẢN PHẨM (Dạng Action đầy đủ)
 */
export async function updateProductAction(id: string, values: Partial<ProductFormValues>) {
  try {
    const data = await productRepo.updateProduct(id, values as unknown as ProductUpdate);
    revalidatePath("/dashboard/products");
    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Lỗi cập nhật";
    return { success: false, error: msg };
  }
}

/**
 * CẬP NHẬT SẢN PHẨM (Dạng chuyển tiếp bí danh)
 */
export async function updateProduct(id: string, values: Partial<ProductFormValues>) {
  return updateProductAction(id, values);
}

/**
 * XÓA SẢN PHẨM (Dạng Action đầy đủ)
 */
export async function deleteProductAction(id: string) {
  try {
    await productRepo.deleteProduct(id);
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Lỗi xóa";
    return { success: false, error: msg };
  }
}

/**
 * XÓA SẢN PHẨM (Dạng chuyển tiếp bí danh)
 */
export async function deleteProduct(id: string) {
  return deleteProductAction(id);
}

/**
 * THAY ĐỔI TRẠNG THÁI CÔNG KHAI (Dạng Action đầy đủ)
 */
export async function togglePublishedAction(id: string, published: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").update({ published }).eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * THAY ĐỔI TRẠNG THÁI CÔNG KHAI (Dạng chuyển tiếp bí danh)
 */
export async function togglePublished(id: string, published: boolean) {
  return togglePublishedAction(id, published);
}

/**
 * THAY ĐỔI TRẠNG THÁI NỔI BẬT (Dạng Action đầy đủ)
 */
export async function toggleFeaturedAction(id: string, featured: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").update({ featured }).eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * THAY ĐỔI TRẠNG THÁI NỔI BẬT (Dạng chuyển tiếp bí danh)
 */
export async function toggleFeatured(id: string, featured: boolean) {
  return toggleFeaturedAction(id, featured);
}

/**
 * TẢI ẢNH LÊN BUCKET 'product-images'
 */
export async function uploadProductImage(formData: FormData) {
  try {
    const supabase = await createClient();
    const file = formData.get("file") as File;
    if (!file) throw new Error("File không tồn tại");

    const fileName = `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const filePath = `products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, buffer, {
      contentType: file.type,
    });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return publicUrl;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Lỗi upload");
  }
}

/**
 * CẬP NHẬT NHANH SỐ LƯỢNG TỒN KHO (Dùng cho trang Inventory)
 */
export async function updateProductStockAction(id: string, stock: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .update({
        stock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * LẤY DANH SÁCH CUỘN NHỰA IN TỪ SUPABASE SETTINGS (Không mock data)
 */
export async function getMaterialsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("settings").select("value").eq("key", "materials").maybeSingle();

    if (error || !data) {
      return [];
    }

    return (data.value || []) as any[];
  } catch (error: any) {
    console.error("[GET_MATERIALS_ERROR]", error);
    return [];
  }
}

/**
 * LƯU DANH SÁCH CUỘN NHỰA IN VÀO SUPABASE SETTINGS
 */
export async function saveMaterialsAction(materials: any[]) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("settings").update({ value: materials }).eq("key", "materials");

    if (error) throw error;
    revalidatePath("/dashboard/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * LẤY ĐỊNH MỨC GIÁ ĐIỆN QUỐC GIA TỪ SUPABASE SETTINGS (Không dùng cứng trong code)
 */
export async function getElectricityRateAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("settings").select("value").eq("key", "electricity_rate").maybeSingle();

    if (error || !data) {
      return 3000; // Giá mặc định phòng vệ nếu trống DB
    }

    return Number(data.value);
  } catch (error: any) {
    console.error("[GET_ELECTRICITY_RATE_ERROR]", error);
    return 3000;
  }
}

/**
 * LƯU ĐỊNH MỨC GIÁ ĐIỆN QUỐC GIA VÀO SUPABASE SETTINGS
 */
export async function saveElectricityRateAction(rate: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "electricity_rate", value: rate }, { onConflict: "key" });

    if (error) throw error;
    revalidatePath("/dashboard/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
