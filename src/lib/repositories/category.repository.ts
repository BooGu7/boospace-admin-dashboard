import { createClient } from "@/lib/supabase/server";

export interface CategoryInput {
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  active?: boolean;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      parent:parent_id (
        id,
        name
      )
    `,
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET_CATEGORIES_ERROR]", error);
    throw new Error(error.message);
  }
  return data;
}

export async function createCategory(values: CategoryInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").insert([values]).select().single();

  if (error) {
    console.error("[CREATE_CATEGORY_ERROR]", error);
    throw new Error(error.message);
  }
  return data;
}

export async function updateCategory(id: string, values: Partial<CategoryInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[UPDATE_CATEGORY_ERROR]", error);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("[DELETE_CATEGORY_ERROR]", error);
    throw new Error(error.message);
  }
  return true;
}
