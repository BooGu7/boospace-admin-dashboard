import type { LucideIcon } from "lucide-react";
import { Clock3, Inbox, Mail, MessageCircle, Phone, Send, Star, User } from "lucide-react";

export type Conversation = {
  id: string | number;
  group: "Pinned" | "Today" | "Yesterday";
  name: string;
  subject: string;
  preview: string;
  time: string;
  isUnread: boolean;
  isOnline: boolean;
  unreadCount: number;
  contact: Contact;
  messages: Message[];
};

export type Message = {
  id: number;
  side: "in" | "out";
  text: string;
  time: string;
};

export type Contact = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  timezone: string;
  status: string;
  qualifiedAt: string;
  tags: string[];
};

export type NavItem = {
  id: string;
  title: string;
  label?: string;
  icon: LucideIcon;
  isActive: boolean;
};

// ĐỒNG BỘ: Xuất bản đầy đủ các hằng số điều hướng cho Sidebar Chat
export const navItems: NavItem[] = [
  { id: "inbox", title: "Inbox", label: "24", icon: Inbox, isActive: true },
  {
    id: "mentions",
    title: "Mentions",
    label: "3",
    icon: Mail,
    isActive: false,
  },
  { id: "snoozed", title: "Snoozed", icon: Clock3, isActive: false },
  { id: "sent", title: "Sent", icon: Send, isActive: false },
  {
    id: "all",
    title: "All conversations",
    icon: MessageCircle,
    isActive: false,
  },
  {
    id: "unassigned",
    title: "Unassigned",
    label: "7",
    icon: User,
    isActive: false,
  },
];

export const channelItems: NavItem[] = [
  { id: "email", title: "Email", label: "18", icon: Mail, isActive: false },
  {
    id: "chat",
    title: "Chat",
    label: "5",
    icon: MessageCircle,
    isActive: false,
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    label: "1",
    icon: Phone,
    isActive: false,
  },
  {
    id: "instagram",
    title: "Instagram",
    label: "0",
    icon: Phone,
    isActive: false,
  },
  {
    id: "facebook",
    title: "Facebook",
    label: "0",
    icon: Phone,
    isActive: false,
  },
  { id: "phone", title: "Phone", label: "0", icon: Phone, isActive: false },
];

export const viewItems: NavItem[] = [
  {
    id: "vip",
    title: "VIP Customers",
    label: "8",
    icon: Star,
    isActive: false,
  },
  {
    id: "orders",
    title: "Orders & Returns",
    label: "6",
    icon: Inbox,
    isActive: false,
  },
  {
    id: "feedback",
    title: "Product Feedback",
    label: "2",
    icon: MessageCircle,
    isActive: false,
  },
];

export const currentUser = {
  name: "Admin",
  email: "admin@boospace.tech",
};

export const conversations: Conversation[] = [];
