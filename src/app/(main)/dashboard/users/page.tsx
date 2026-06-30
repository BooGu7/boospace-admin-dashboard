import { Calendar, Mail, Phone, Users as UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Đảm bảo luôn tải dữ liệu mới nhất

async function getCustomersWithStats() {
  const supabase = await createClient();

  // 1. Lấy tất cả hồ sơ người dùng trong bảng profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Lỗi lấy danh sách hồ sơ:", profilesError);
    return [];
  }

  // 2. Lấy tất cả đơn hàng để tính toán thống kê chi tiêu
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_email, total, order_status")
    .neq("order_status", "Cancelled");

  // 3. Tính toán số lượng đơn và tổng chi tiêu cho từng khách hàng
  return (profiles || []).map((profile) => {
    const customerOrders = orders?.filter((o) => o.customer_email === profile.email) || [];
    const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const orderCount = customerOrders.length;

    // ĐỊNH NGHĨA TYPE RÕ RÀNG để tránh lỗi tự động khóa kiểu dữ liệu của TypeScript
    let rank: { label: string; variant: "outline" | "default" | "secondary" } = {
      label: "Thành viên Mới",
      variant: "outline",
    };

    if (totalSpent >= 10000000) {
      rank = { label: "Khách VVIP", variant: "default" };
    } else if (totalSpent >= 3000000) {
      rank = { label: "Khách VIP", variant: "secondary" };
    } else if (orderCount > 0) {
      rank = { label: "Active Member", variant: "outline" };
    }

    return {
      ...profile,
      orderCount,
      totalSpent,
      rank,
    };
  });
}

export default async function UsersPage() {
  const customers = await getCustomersWithStats();

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hồ sơ khách hàng</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý khách hàng, theo dõi tần suất mua sắm và tổng giá trị vòng đời khách hàng (LTV).
          </p>
        </div>
      </div>

      {/* Danh sách người dùng */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" /> Khách hàng đã đăng ký ({customers.length})
          </CardTitle>
          <CardDescription>Đồng bộ thời gian thực với hệ thống tài khoản bán lẻ Boospace Storefront.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead className="text-center">Số đơn mua</TableHead>
                <TableHead className="text-right">Tổng chi tiêu (LTV)</TableHead>
                <TableHead className="text-center">Phân hạng</TableHead>
                <TableHead>Ngày tham gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((user) => (
                <TableRow key={user.id}>
                  {/* Tên & Avatar */}
                  <TableCell className="font-bold flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {user.name ? user.name.split(" ").pop()?.substring(0, 2).toUpperCase() : "US"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-slate-800">{user.name || "Chưa cập nhật tên"}</span>
                  </TableCell>

                  {/* Email & Phone */}
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" /> {user.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Số đơn mua */}
                  <TableCell className="text-center font-bold text-slate-700">{user.orderCount} đơn</TableCell>

                  {/* Tổng chi tiêu */}
                  <TableCell className="text-right font-extrabold text-blue-900">
                    {formatVND(user.totalSpent)}
                  </TableCell>

                  {/* Phân hạng khách hàng */}
                  <TableCell className="text-center">
                    <Badge variant={user.rank.variant} className="whitespace-nowrap px-2 py-0.5 text-[11px]">
                      {user.rank.label}
                    </Badge>
                  </TableCell>

                  {/* Ngày tham gia */}
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Chưa có khách hàng nào đăng ký tài khoản.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
