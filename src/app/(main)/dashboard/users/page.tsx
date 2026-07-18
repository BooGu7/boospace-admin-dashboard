import { redirect } from "next/navigation";
import { getCustomersAction } from "@/actions/user.actions";
import { createClient } from "@/lib/supabase/server";
import { Users } from "./_components/users";

export const revalidate = 0; // Đảm bảo luôn lấy danh sách mới nhất khi F5

export default async function UsersPage() {
  const supabase = await createClient();

  // Kiểm tra phiên đăng nhập bảo mật
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/v2/login");
  }

  // Tải danh sách khách hàng động đã tính toán chi tiêu từ Server Action
  const res = await getCustomersAction();
  const customerList = res.success ? res.data || [] : [];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-background">
      <Users users={customerList} />
    </div>
  );
}
