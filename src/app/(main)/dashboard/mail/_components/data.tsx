import { Archive, CircleHelp, File, Inbox, Keyboard, type LucideIcon, Send, Star, Trash2 } from "lucide-react";

export type Recipient = {
  name: string;
  email: string;
};

export type Attachment = {
  id: string;
  name: string;
  size: string;
  icon: any;
};

export type Mail = {
  id: string;
  accountId: number;
  from: Recipient;
  to: Recipient[];
  cc?: Recipient[];
  subject: string;
  body: string;
  receivedAt: string;
  folder: "inbox" | "drafts" | "sent" | "archive" | "trash";
  isRead: boolean;
  isPinned: boolean;
  isPriority: boolean;
  labels: string[];
  attachments?: Attachment[];
  messageCount?: number;
  isGmailApi?: boolean;
};

export type MailNavItem = {
  id: string;
  title: string;
  label?: string;
  icon: LucideIcon;
  isActive: boolean;
};

type MailNavigation = {
  navMain: MailNavItem[];
  folders: MailNavItem[];
  navFooter: MailNavItem[];
};

// ĐÃ XÓA SẠCH HOÀN TOÀN: Mảng rỗng cam kết không chứa bất kỳ dữ liệu mẫu giả định nào
export const mails: Mail[] = [];

export const mailNavigation: MailNavigation = {
  navMain: [
    {
      id: "inbox",
      title: "Hộp thư đến",
      label: "0",
      icon: Inbox,
      isActive: true,
    },
    {
      id: "priority",
      title: "Có gắn dấu sao",
      label: "0",
      icon: Star,
      isActive: false,
    },
  ],
  folders: [
    {
      id: "drafts",
      title: "Thư nháp",
      label: "0",
      icon: File,
      isActive: false,
    },
    {
      id: "sent",
      title: "Đã gửi",
      icon: Send,
      isActive: false,
    },
    {
      id: "archive",
      title: "Đã lưu trữ",
      icon: Archive,
      isActive: false,
    },
    {
      id: "trash",
      title: "Thùng rác",
      icon: Trash2,
      isActive: false,
    },
  ],
  navFooter: [
    {
      id: "help-feedback",
      title: "Trợ giúp & phản hồi",
      icon: CircleHelp,
      isActive: false,
    },
    {
      id: "keyboard-shortcuts",
      title: "Phím tắt bàn phím",
      icon: Keyboard,
      isActive: false,
    },
  ],
};

export const accounts = [
  {
    id: 1,
    label: "Admin BooSpace",
    email: "admin@boospace.tech",
  },
  {
    id: 2,
    label: "Web Store Front",
    email: "hello@boospace.tech",
  },
];
