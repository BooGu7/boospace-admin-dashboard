import { format } from "date-fns";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getEcommerceDashboardStats } from "@/lib/repositories/order.repository";

// Nhập khẩu các thành phần giao diện của bạn
import { CustomerReviews } from "./_components/customer-reviews";
import { Inventory } from "./_components/inventory";
import { KpiStrip } from "./_components/kpi-strip";
import { RecentOrders } from "./_components/recent-orders";
import { StoreTraffic } from "./_components/store-traffic";
import { TopProducts } from "./_components/top-products";
import { TrafficSources } from "./_components/traffic-sources";

export const revalidate = 0; // Luôn lấy dữ liệu mới nhất thời gian thực từ Supabase

export default async function Page() {
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  // Truy vấn dữ liệu thực tế kết hợp tự động giả định (Fallback Mock)
  const stats = await getEcommerceDashboardStats();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold leading-none tracking-tight">Tổng quan cửa hàng</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-34" id="ecommerce-period" size="sm">
              <SelectValue placeholder="Tháng này" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="this-month">Tháng này</SelectItem>
                <SelectItem value="last-month">Tháng trước</SelectItem>
                <SelectItem value="last-30-days">30 ngày qua</SelectItem>
                <SelectItem value="year-to-date">Từ đầu năm</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="all-channels">
            <SelectTrigger className="w-40" id="ecommerce-channel" size="sm">
              <SelectValue placeholder="Tất cả nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all-channels">Tất cả nguồn</SelectItem>
                <SelectItem value="online-store">Cửa hàng Web</SelectItem>
                <SelectItem value="marketplace">Sàn TMĐT</SelectItem>
                <SelectItem value="social">Mạng xã hội</SelectItem>
                <SelectItem value="retail">Bán trực tiếp</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" />

          <Button size="icon-sm" variant="outline">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Bản đồ KPI tài chính thực tế & Biểu đồ doanh số 7 ngày gần nhất */}
        <KpiStrip stats={stats} />

        <div className="xl:col-span-5">
          <StoreTraffic />
        </div>
        <div className="xl:col-span-7">
          <TrafficSources />
        </div>
        <div className="xl:col-span-4">
          {/* Tỷ lệ đóng góp doanh thu theo ngành hàng thực tế */}
          <TopProducts topProducts={stats.topProducts} categories={stats.categoriesBreakdown} />
        </div>
        <div className="xl:col-span-4">
          {/* Biểu đồ phân cấp tồn kho thực tế */}
          <Inventory data={stats.inventory} />
        </div>
        <div className="xl:col-span-4">
          <CustomerReviews />
        </div>
        <div className="xl:col-span-12">
          {/* Bảng giao dịch gần đây thực tế */}
          <RecentOrders data={stats.recentOrders} />
        </div>
      </div>
    </div>
  );
}
