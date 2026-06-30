import { format } from "date-fns";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
// IMPORT HÀM TRUY VẤN TÀI CHÍNH BÁN LẺ
import { getEcommerceDashboardStats } from "@/lib/repositories/order.repository";
// IMPORT CÁC COMPONENT CON CỦA BẠN
import { CustomerReviews } from "./_components/customer-reviews";
import { Inventory } from "./_components/inventory";
import { KpiStrip } from "./_components/kpi-strip";
import { RecentOrders } from "./_components/recent-orders";
import { StoreTraffic } from "./_components/store-traffic";
import { TopProducts } from "./_components/top-products";
import { TrafficSources } from "./_components/traffic-sources";

export const revalidate = 0; // Luôn làm mới dữ liệu khi F5

export default async function Page() {
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  // Lấy dữ liệu thật từ Supabase
  const stats = await getEcommerceDashboardStats();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">Store Overview</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-34" id="ecommerce-period" size="sm">
              <SelectValue placeholder="This Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="year-to-date">Year to Date</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="all-channels">
            <SelectTrigger className="w-40" id="ecommerce-channel" size="sm">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all-channels">All Channels</SelectItem>
                <SelectItem value="online-store">Online Store</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
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
        {/* KPI Strip & Sales Chart */}
        <KpiStrip stats={stats} />

        <div className="xl:col-span-5">
          <StoreTraffic />
        </div>
        <div className="xl:col-span-7">
          <TrafficSources />
        </div>
        <div className="xl:col-span-4">
          <div className="xl:col-span-4">
            <TopProducts topProducts={stats.topProducts} categories={stats.categoriesBreakdown} />
          </div>
        </div>
        <div className="xl:col-span-4">
          {/* TRUYỀN DỮ LIỆU TỒN KHO THẬT VÀO BIỂU ĐỒ BÁN NGUYỆT */}
          <Inventory data={stats.inventory} />
        </div>
        <div className="xl:col-span-4">
          <CustomerReviews />
        </div>
        <div className="xl:col-span-12">
          {/* TRUYỀN DANH SÁCH 10 ĐƠN HÀNG GẦN ĐÂY THẬT VÀO BẢNG PHÂN TRANG */}
          <RecentOrders data={stats.recentOrders} />
        </div>
      </div>
    </div>
  );
}
