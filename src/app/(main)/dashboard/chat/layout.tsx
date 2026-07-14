import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

// Nhập khẩu thanh bên cục bộ
import { ChatSidebar } from "./_components/chat-sidebar";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="h-full flex flex-col min-h-0">
      <SidebarProvider className="h-full min-h-0">
        <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
          {/* Thanh phân loại Chat riêng biệt nằm song song */}
          <ChatSidebar />
          {/* Khung chat bong bóng chính diện */}
          <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  );
}
