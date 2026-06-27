"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ProductInsert, ProductUpdate } from "@/types/product";

export async function createProduct(values: ProductInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("products").insert(values).select().single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");

  return data;
}

export async function updateProduct(id: string, values: ProductUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("products").update(values).eq("id", id).select().single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");

  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}

export async function togglePublished(id: string, published: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      published,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}

export async function toggleFeatured(id: string, featured: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      featured,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}
