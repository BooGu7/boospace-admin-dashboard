"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface FinanceSettings {
  gateways: {
    id: string;
    name: string;
    account: string;
    share_percent: number;
    bank_code?: string; // Ví dụ: MB để gen mã VietQR
  }[];
  bills: {
    id: string;
    title: string;
    date: string;
    cost: number;
  }[];
  target_weekly_kpi: number;
}

/**
 * LẤY CẤU HÌNH TÀI CHÍNH TỪ SUPABASE SETTINGS
 */
export async function getFinanceSettingsAction(): Promise<FinanceSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("value").eq("key", "finance_settings").maybeSingle();

  const defaultSettings: FinanceSettings = {
    gateways: [
      {
        id: "gw-1",
        name: "Cổng thanh toán PayOS (VietQR)",
        account: "19039387504",
        share_percent: 60,
        bank_code: "MB",
      },
      {
        id: "gw-2",
        name: "Ví điện tử MoMo Business",
        account: "0987654321",
        share_percent: 25,
      },
      {
        id: "gw-3",
        name: "PayPal Merchant Gateway",
        account: "billing@boospace.tech",
        share_percent: 15,
      },
    ],
    bills: [
      {
        id: "bill-1",
        title: "Vercel Pro (Hosting Storefront)",
        date: "Ngày 05 hàng tháng",
        cost: 500000,
      },
      {
        id: "bill-2",
        title: "Supabase Pro (Database & Storage)",
        date: "Ngày 15 hàng tháng",
        cost: 625000,
      },
      {
        id: "bill-3",
        title: "Resend Email API Starter",
        date: "Ngày 20 hàng tháng",
        cost: 500000,
      },
    ],
    target_weekly_kpi: 10000000,
  };

  if (error || !data) {
    // Tự động nạp cấu hình khởi tạo nếu DB trống
    await supabase.from("settings").insert([{ key: "finance_settings", value: defaultSettings }]);
    return defaultSettings;
  }

  return data.value as FinanceSettings;
}

/**
 * LƯU CẤU HÌNH TÀI CHÍNH MỚI LÊN SUPABASE
 */
export async function saveFinanceSettingsAction(settings: FinanceSettings) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("settings").update({ value: settings }).eq("key", "finance_settings");

    if (error) throw error;
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
