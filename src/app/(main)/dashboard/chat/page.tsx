import { createClient } from "@/lib/supabase/server";
import { Chat } from "./_components/chat";
import type { Conversation } from "./_components/data";

export const revalidate = 0; // Đảm bảo luôn tải dữ liệu thời gian thực

export default async function ChatPage() {
  const supabase = await createClient();

  // 1. Tải song song danh sách Profiles và lịch sử tin nhắn thực tế từ Supabase
  const [profilesRes, messagesRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: true }),
  ]);

  const profiles = profilesRes.data || [];
  const messages = messagesRes.data || [];

  // 2. Định nghĩa cấu trúc dữ liệu dự phòng (Fallback) nếu Supabase chưa có profiles
  let finalConversations: Conversation[] = [];

  if (profiles.length === 0) {
    // Dữ liệu dự phòng cao cấp mang tính chân thực về xưởng in Boo Space
    finalConversations = [
      {
        id: "mock-conv-1",
        group: "Pinned",
        name: "Nguyễn Văn Minh",
        subject: "Hỏi về tỷ lệ thu phóng phôi tượng Rồng 3D",
        preview: "Shop ơi mẫu rồng khớp nối PLA mình có thể yêu cầu scale lên 150% được không?",
        time: "Vừa xong",
        isUnread: true,
        isOnline: true,
        unreadCount: 1,
        contact: {
          name: "Nguyễn Văn Minh",
          role: "3D Slicer Lead",
          company: "Boo Space Member",
          email: "minh.nguyen@gmail.com",
          phone: "0987 654 321",
          website: "boospace.tech",
          location: "Hà Nội, Việt Nam",
          timezone: "ICT (UTC+7)",
          status: "VIP Client",
          qualifiedAt: "May 6, 2026",
          tags: ["FDM Printing", "Articulated", "High Value"],
        },
        messages: [
          {
            id: 1,
            side: "in",
            text: "Chào shop, mình muốn đặt in mẫu rồng khớp nối Articulated Dragon.",
            time: "10 min ago",
          },
          {
            id: 2,
            side: "out",
            text: "Dạ Boospace chào bạn ạ! Mẫu rồng bên mình in bằng sợi nhựa PLA thân thiện môi trường, bạn cần scale tỉ lệ bao nhiêu ạ?",
            time: "8 min ago",
          },
          {
            id: 3,
            side: "in",
            text: "Shop ơi mẫu rồng khớp nối PLA mình có thể yêu cầu scale lên 150% được không?",
            time: "2 min ago",
          },
        ],
      },
      {
        id: "mock-conv-2",
        group: "Pinned",
        name: "Lê Thị Hồng",
        subject: "Yêu cầu giao hỏa tốc chậu cây Zen Planter",
        preview: "Mình cần giao gấp trong chiều nay để làm quà sinh nhật.",
        time: "15m",
        isUnread: false,
        isOnline: false,
        unreadCount: 0,
        contact: {
          name: "Lê Thị Hồng",
          role: "Office Manager",
          company: "Acme Decor",
          email: "hong.le@yahoo.com",
          phone: "0912 345 678",
          website: "acmedecor.vn",
          location: "Hồ Chí Minh, Việt Nam",
          timezone: "ICT (UTC+7)",
          status: "Customer",
          qualifiedAt: "Apr 12, 2026",
          tags: ["Decor Desk", "Express"],
        },
        messages: [
          {
            id: 4,
            side: "in",
            text: "Sản phẩm chậu cây in 3D Zen Succulent Planter bên mình còn phôi thô màu trắng không shop?",
            time: "20 min ago",
          },
          {
            id: 5,
            side: "out",
            text: "Dạ bên mình đang sẵn phôi trắng mịn màng đã xử lý chà nhám sạch sẽ, giao hỏa tốc được ngay ạ.",
            time: "18 min ago",
          },
          {
            id: 6,
            side: "in",
            text: "Tuyệt vời, mình cần giao gấp trong chiều nay để làm quà sinh nhật.",
            time: "15 min ago",
          },
        ],
      },
    ];
  } else {
    // 3. Khớp nối dữ liệu thực tế từ Supabase Profiles & contact_messages sang Conversation Type
    finalConversations = profiles.map((p, index) => {
      const profileMessages = messages.filter((m) => m.email === p.email);
      const lastMsg = profileMessages[profileMessages.length - 1]?.message || "Yêu cầu tư vấn in 3D / DIY phôi";

      const formattedMessages = profileMessages.map((m, idx) => ({
        id: idx,
        side: m.user_id ? ("in" as const) : ("out" as const),
        text: m.message,
        time: new Date(m.created_at).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      return {
        id: p.id,
        group: index < 2 ? ("Pinned" as const) : ("Today" as const),
        name: p.name || "Khách hàng mới",
        subject: profileMessages[0]?.subject || "Tư vấn phôi in 3D / DIY Custom",
        preview: lastMsg,
        time: p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : "Gần đây",
        isUnread: profileMessages.length > 0,
        isOnline: index % 2 === 0,
        unreadCount: profileMessages.length,
        contact: {
          name: p.name || "Khách hàng mới",
          role: "Store Member",
          company: "Khách hàng mua lẻ",
          email: p.email || "Chưa cập nhật email",
          phone: p.phone || "Chưa cung cấp SĐT",
          website: "boospace.tech",
          location: "Việt Nam",
          timezone: "ICT (UTC+7)",
          status: "Customer",
          qualifiedAt: p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : "Gần đây",
          tags: ["Supabase User", "3D Maker"],
        },
        messages:
          formattedMessages.length > 0
            ? formattedMessages
            : [
                {
                  id: 1,
                  side: "in" as const,
                  text: "Chào shop, mình cần tư vấn về thời gian hoàn thiện phôi in 3D.",
                  time: "10:20 AM",
                },
              ],
      };
    });
  }

  return (
    <div className="h-[calc(100vh-var(--header-height))] min-h-0 flex-1 overflow-hidden">
      <Chat conversations={finalConversations} />
    </div>
  );
}
