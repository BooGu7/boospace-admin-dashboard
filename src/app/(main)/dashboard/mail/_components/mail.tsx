"use client";

import * as React from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import { setClientCookie } from "@/lib/cookie.client";
import { createClient } from "@/lib/supabase/client";

import type { Mail } from "./data";
import { MailInbox } from "./mail-inbox";
import {
  DEFAULT_MAIL_LAYOUT,
  MAIL_DETAIL_PANEL_ID,
  MAIL_LAYOUT_COOKIE,
  MAIL_LIST_PANEL_ID,
} from "./mail-layout-config";
import { MailView } from "./mail-view";
import { useMail } from "./use-mail";

interface MailProps {
  mails: Mail[];
  defaultLayout: number[] | undefined;
}

export function MailComponent({ mails, defaultLayout = [...DEFAULT_MAIL_LAYOUT] }: MailProps) {
  const { isMobile } = useSidebar();
  const [isMounted, setIsMounted] = React.useState(false);
  const [, setMail] = useMail();

  // ĐỒNG BỘ PROPS SANG STATE KHÔNG DÙNG EFFECT [26]
  const [activeMails, setActiveMails] = React.useState<Mail[]>(mails);
  const [prevMails, setPrevMails] = React.useState<Mail[]>(mails);

  if (mails !== prevMails) {
    setPrevMails(mails);
    setActiveMails(mails);
  }

  // GỌI GMAIL API THỰC TẾ TRÊN TRÌNH DUYỆT (ĐỒNG BỘ MẢNG PHỤ THUỘC TĨNH [setMail])
  React.useEffect(() => {
    setIsMounted(true);

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let token = session?.provider_token;

      if (token) {
        localStorage.setItem("gmail_access_token", token);
      } else {
        token = localStorage.getItem("gmail_access_token");
      }

      if (!token) return;

      try {
        const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.warn("[GMAIL_CLIENT_WARN] Token hết hạn hoặc không đủ quyền đọc Gmail.");
          localStorage.removeItem("gmail_access_token");
          localStorage.removeItem("gmail_user_email");
          localStorage.removeItem("gmail_user_name");
          return;
        }

        const listData = await response.json();
        if (!listData.messages) return;

        toast.info("Đang nạp hộp thư Gmail thực tế từ Google API...");

        const detailPromises = listData.messages.map(async (msg: any) => {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const detail = await detailRes.json();

          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name === "Subject")?.value || "Không có chủ đề";
          const from = headers.find((h: any) => h.name === "From")?.value || "Ẩn danh";

          const fromName = from.split("<")[0].trim() || from;
          const fromEmail = from.match(/<([^>]+)>/)?.[1] || from;

          return {
            id: detail.id,
            accountId: 1,
            from: {
              name: fromName,
              email: fromEmail,
            },
            to: [{ name: "Trọng Tôn", email: "boospace7@gmail.com" }],
            subject: subject,
            body: detail.snippet || "Không có nội dung mô tả nhanh",
            receivedAt: new Date(Number(detail.internalDate)).toISOString(),
            folder: "inbox" as const,
            isRead: !detail.labelIds?.includes("UNREAD"),
            isPinned: detail.labelIds?.includes("STARRED"),
            isPriority: true,
            labels: detail.labelIds?.slice(0, 3) || ["Gmail"],
            isGmailApi: true,
          };
        });

        const realGmailMails = await Promise.all(detailPromises);

        // Hợp nhất dữ liệu thật nạp đè lên hòm thư mock tĩnh
        setActiveMails((prev) => {
          const dbMailsOnly = prev.filter((m) => !m.id.startsWith("gmail-"));
          return [...realGmailMails, ...dbMailsOnly];
        });

        if (realGmailMails.length > 0) {
          setMail({ selected: realGmailMails[0].id });
        }

        toast.success("Đã đồng bộ hòm thư Gmail của bạn thành công!");
      } catch (err) {
        console.error("[GMAIL_FETCH_CLIENT_ERROR] Lỗi gọi API Client-side:", err);
      }
    });
  }, [setMail]); // Đã dọn sạch cảnh báo linter

  if (!isMounted) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground text-sm">Loading mail...</div>
    );
  }

  return isMobile ? (
    <MailMobileLayout mails={activeMails} />
  ) : (
    <MailDesktopLayout mails={activeMails} defaultLayout={defaultLayout} />
  );
}

function MailMobileLayout({ mails }: { mails: Mail[] }) {
  const [mail] = useMail();
  const [isMailOpen, setIsMailOpen] = React.useState(false);
  const selectedMail = mails.find((item) => item.id === mail.selected) || null;

  return (
    <>
      <MailInbox mails={mails} onSelectMail={() => setIsMailOpen(true)} />

      <Drawer open={isMailOpen} onOpenChange={setIsMailOpen}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Mail message</DrawerTitle>
          <DrawerDescription className="sr-only">Read the selected email message</DrawerDescription>
          <MailView mail={selectedMail} onClose={() => setIsMailOpen(false)} />
        </DrawerContent>
      </Drawer>
    </>
  );
}

function MailDesktopLayout({ mails, defaultLayout = [...DEFAULT_MAIL_LAYOUT] }: MailProps) {
  const [mail] = useMail();

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      onLayoutChanged={(layout) => {
        const sizes = [layout[MAIL_LIST_PANEL_ID], layout[MAIL_DETAIL_PANEL_ID]];
        setClientCookie(MAIL_LAYOUT_COOKIE, JSON.stringify(sizes));
      }}
      className="h-full"
    >
      <ResizablePanel id={MAIL_LIST_PANEL_ID} defaultSize={`${defaultLayout[0]}%`} minSize="30%" className="min-h-0">
        <MailInbox mails={mails} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id={MAIL_DETAIL_PANEL_ID} defaultSize={`${defaultLayout[1]}%`} minSize="30%" className="min-h-0">
        <MailView mail={mails.find((item) => item.id === mail.selected) || null} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
