"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * LẤY DANH SÁCH LỜI NHẮN THỰC TẾ TỪ BẢNG contact_messages
 */
export async function getContactMessagesAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (error: any) {
    console.error("[GET_CONTACT_MESSAGES_ERROR]", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * XÓA THƯ LIÊN HỆ
 */
export async function deleteContactMessageAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/mail");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * GỬI EMAIL PHẢN HỒI THỰC TẾ CHO KHÁCH HÀNG QUA RESEND
 */
export async function sendMailReplyAction(toEmail: string, subject: string, replyText: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY || "re_3cz1Z9tS_FQtmoNAQAF7STG1XrCH3mwHA";

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f7fafc; padding-bottom: 20px;">
          <h1 style="color: #1a365d; font-size: 26px; margin: 0; font-weight: 800;">BOOSPACE</h1>
          <p style="color: #718096; font-size: 14px; margin: 5px 0 0 0;">Bộ phận Chăm sóc khách hàng & Vận hành in 3D</p>
        </div>
        <p style="font-size: 16px; color: #2d3748;">Xin chào bạn,</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
          Chúng tôi đã nhận được câu hỏi của bạn trên hệ thống Boo Space. Dưới đây là phản hồi chính thức từ quản trị viên:
        </p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3182ce; font-style: italic; color: #2d3748;">
          "${replyText}"
        </div>
        <p style="font-size: 12px; color: #a0aec0; text-align: center; margin-top: 30px; border-top: 1px solid #edf2f7; padding-top: 20px;">
          Cảm ơn bạn đã đồng hành cùng Boo Space!
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Boospace Support <onboarding@resend.dev>",
        to: toEmail,
        subject: `[Re] Trả lời thư liên hệ: ${subject || "Hỗ trợ Boospace"}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gửi mail Resend thất bại");
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
