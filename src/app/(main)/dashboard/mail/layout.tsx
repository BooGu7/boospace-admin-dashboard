import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

// Chuyển các đường dẫn trỏ sang thư mục con cục bộ của dashboard/mail
import { MailSidebar } from "./_components/mail-sidebar";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="h-full flex flex-col min-h-0">
      <SidebarProvider className="h-full min-h-0">
        <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
          {/* Thanh phân loại Mail riêng biệt */}
          <MailSidebar />
          {/* Nội dung Mail hòm thư 3 cột */}
          <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  );
}
