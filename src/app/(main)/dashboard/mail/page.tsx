import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Mail } from "./_components/data";
import { MailComponent } from "./_components/mail";
import { DEFAULT_MAIL_LAYOUT, MAIL_LAYOUT_COOKIE } from "./_components/mail-layout-config";

export const revalidate = 0; // Đảm bảo luôn lấy danh sách mới nhất khi F5

export default async function MailPage() {
  const cookieStore = await cookies();
  const layoutCookie = cookieStore.get(MAIL_LAYOUT_COOKIE);

  const supabase = await createClient();

  // 1. Tải thư liên hệ thực tế từ bảng contact_messages trên Supabase của bạn
  const { data: dbMessages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const dbMails: Mail[] = (dbMessages || []).map((msg) => ({
    id: msg.id,
    accountId: 1,
    from: {
      name: msg.name || "Khách vãng lai",
      email: msg.email || "Chưa cung cấp Email",
    },
    to: [{ name: "Trọng Tôn", email: "boospace7@gmail.com" }],
    subject: msg.subject || "Yêu cầu liên hệ Boo Space Store",
    body: msg.message || "",
    receivedAt: msg.created_at,
    folder: "inbox" as const,
    isRead: false,
    isPinned: false,
    isPriority: true,
    labels: ["Web Store"],
  }));

  // 2. Chỉ chuyển tiếp dữ liệu thật (Không sử dụng dữ liệu mẫu tĩnh)
  const finalMails = [...dbMails];

  return (
    <div className="h-[calc(100vh-140px)] min-h-0 overflow-hidden bg-background">
      <MailComponent
        mails={finalMails}
        defaultLayout={layoutCookie ? JSON.parse(layoutCookie.value) : [...DEFAULT_MAIL_LAYOUT]}
      />
    </div>
  );
}
