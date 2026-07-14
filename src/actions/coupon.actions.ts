"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCouponAction(values: { code: string; discount_percent: number; active: boolean }) {
  try {
    const supabase = await createClient();
    const { code, discount_percent, active } = values;

    const formattedCode = code.toUpperCase().trim();

    const { data, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: formattedCode,
          discount_percent: Number(discount_percent),
          active,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/coupons");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCouponActiveAction(id: string, active: boolean) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("coupons").update({ active }).eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCouponAction(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
