import { createClient } from "@/lib/supabase/server";
// import type { Product } from "@/types/product";

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id,name),
      brand:brands(id,name)
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getProduct(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id,name),
      brand:brands(id,name)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function searchProducts(keyword: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id,name),
      brand:brands(id,name)
    `,
    )
    .ilike("name", `%${keyword}%`)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getProductsByCategory(categoryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id,name),
      brand:brands(id,name)
    `,
    )
    .eq("category_id", categoryId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getProductsByBrand(brandId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id,name),
      brand:brands(id,name)
    `,
    )
    .eq("brand_id", brandId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
