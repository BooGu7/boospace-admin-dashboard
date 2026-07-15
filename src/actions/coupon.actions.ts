"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCouponAction(values: {
  code: string;
  discount_percent: number;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  description: string; // ĐÃ SỬA: Nhận thêm trường ghi chú
}) {
  try {
    const supabase = await createClient();
    const { code, discount_percent, active, start_date, end_date, description } = values;

    const formattedCode = code.toUpperCase().trim();

    const { data, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: formattedCode,
          discount_percent: Number(discount_percent),
          active,
          start_date: start_date ? new Date(start_date).toISOString() : null,
          end_date: end_date ? new Date(end_date).toISOString() : null,
          description: description || null, // Lưu ghi chú vào database
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
