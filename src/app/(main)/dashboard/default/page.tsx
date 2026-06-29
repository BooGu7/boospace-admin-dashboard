import { DollarSign, FolderTree, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Đảm bảo luôn lấy dữ liệu mới nhất khi F5

async function getDashboardStats() {
  const supabase = await createClient();

  // 1. Lấy dữ liệu tất cả đơn hàng (không lấy đơn đã hủy)
  const { data: orders } = await supabase
    .from("orders")
    .select("total, order_status, created_at")
    .neq("order_status", "Cancelled");

  // 2. Lấy số lượng Sản phẩm và Danh mục trong kho
  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.order_status === "Pending").length || 0;

  // 3. Chuẩn bị dữ liệu cho biểu đồ tăng trưởng 7 ngày gần nhất (tính ngược từ hôm nay)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  // Tính doanh thu theo từng ngày
  const chartData = last7Days.map((dateStr) => {
    const dailyTotal =
      orders?.filter((o) => o.created_at?.startsWith(dateStr)).reduce((sum, o) => sum + Number(o.total), 0) || 0;

    return {
      date: new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue: dailyTotal,
    };
  });

  // Tìm mức doanh thu ngày cao nhất để làm mốc tỷ lệ chiều cao cột biểu đồ
  const maxDailyRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    productCount: productsRes.count || 0,
    categoryCount: categoriesRes.count || 0,
    chartData,
    maxDailyRevenue,
  };
}

export default async function DashboardDefaultPage() {
  const stats = await getDashboardStats();

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-muted-foreground text-sm">Số liệu hoạt động kinh doanh thực tế từ cửa hàng của bạn.</p>
        </div>
      </div>

      {/* 4 THẺ THỐNG KÊ DOANH THU & HOẠT ĐỘNG */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng doanh thu</CardTitle>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatVND(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Doanh thu tích lũy từ các đơn hàng</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Đơn hàng mới</CardTitle>
            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-md">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">+{stats.totalOrders}</div>
            <p className="text-xs text-yellow-600 font-medium mt-1">Có {stats.pendingOrders} đơn chờ xử lý</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Sản phẩm hoạt động</CardTitle>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.productCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Sản phẩm có sẵn trong kho</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Danh mục sản phẩm</CardTitle>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
              <FolderTree className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.categoryCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Loại mặt hàng phân phối</p>
          </CardContent>
        </Card>
      </div>

      {/* BIỂU ĐỒ DOANH THU & GHI CHÚ */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border border-slate-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Doanh thu 7 ngày gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-end justify-between gap-3 pt-6 px-2">
              {stats.chartData.map((day, i) => {
                const percentage = (day.revenue / stats.maxDailyRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip khi hover xem giá tiền từng ngày */}
                    <div className="absolute bottom-[105%] bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-10">
                      {formatVND(day.revenue)}
                    </div>

                    {/* Cột biểu đồ */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-[200px] flex items-end overflow-hidden">
                      <div
                        className="w-full bg-blue-900 rounded-t-lg transition-all duration-500 group-hover:bg-blue-800"
                        style={{
                          height: `${day.revenue > 0 ? Math.max(percentage, 5) : 0}%`,
                        }}
                      />
                    </div>

                    <span className="text-[11px] font-medium text-slate-500">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ghi chú vận hành */}
        <Card className="col-span-3 shadow-sm border border-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Nhật ký vận hành nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-700">Đơn hàng ORD-1003</p>
              <p className="text-xs text-slate-500 mt-1">
                Đang ở trạng thái "Chờ xử lý" (Tổng: {formatVND(15000000)}).
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-700">Tối ưu hóa hình ảnh</p>
              <p className="text-xs text-slate-500 mt-1">Đã áp dụng các hình ảnh cao cấp từ Cozyleigh Studios.</p>
            </div>
            <p className="text-xs text-muted-foreground italic text-center pt-4">
              * Dữ liệu được đồng bộ trực tiếp từ Supabase Database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
