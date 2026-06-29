import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Tự động chuyển hướng về trang default để lấy dữ liệu Supabase
  redirect("/dashboard/default");
}
