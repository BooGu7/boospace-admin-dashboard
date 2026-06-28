"use server";

import { revalidatePath } from "next/cache";

import * as productRepo from "@/lib/repositories/product.repository";
import { createClient } from "@/lib/supabase/server";
import { type ProductFormValues, productSchema } from "@/schemas/product.schema";
import type { ProductInsert, ProductUpdate } from "@/types/product";

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

export async function uploadProductImage(formData: FormData) {
  try {
    const supabase = await createClient();
    const file = formData.get("file") as File;
    if (!file) throw new Error("File không tồn tại");

    const fileName = `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file);
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return publicUrl;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Lỗi upload");
  }
}
