import type { LucideIcon } from "lucide-react";
import { Award, Sparkles, User, UserCheck } from "lucide-react";

export type CustomerTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export const filters = {
  tier: ["Tất cả", "Bronze", "Silver", "Gold", "Platinum"],
  status: ["Tất cả", "Đã đăng ký", "Khách vãng lai"], // Đã sửa: Khớp đúng 100% bộ lọc trạng thái bưu tá của bạn
};

// Cấu hình hiển thị phân hạng thành viên theo chi tiêu thật
export const tierMeta: Record<CustomerTier, { label: string; badgeClass: string; icon: LucideIcon }> = {
  Platinum: {
    label: "Hạng Bạch Kim",
    badgeClass: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold",
    icon: Sparkles,
  },
  Gold: {
    label: "Hạng Vàng",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold",
    icon: Award,
  },
  Silver: {
    label: "Hạng Bạc",
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold",
    icon: UserCheck,
  },
  Bronze: {
    label: "Thành viên",
    badgeClass: "border-slate-300 bg-slate-100 text-slate-700 font-semibold",
    icon: User,
  },
};

// Trạng thái tài khoản bọc
export const statusMeta = {
  Registered: {
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",
    label: "Đã đăng ký",
  },
  Guest: {
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600 font-bold",
    label: "Khách vãng lai",
  },
};
