import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// IMPORT HÀM TRUY VẤN
import { getAnalyticsStats } from "@/lib/repositories/order.repository";
import { AnalyticsKpiStrip } from "./_components/analytics-kpi-strip";
import { AnalyticsToolbar } from "./_components/analytics-toolbar";
import { RealtimeVisitors } from "./_components/realtime-visitors";
import { TopPages } from "./_components/top-pages";
import { TopTrafficSources } from "./_components/top-traffic-sources";
import { TrafficQuality } from "./_components/traffic-quality";

// Import this stylesheet in any page or component that renders country flag classes.
import "@/styles/flag-icons/flags.css";

export const revalidate = 0; // Đảm bảo luôn lấy dữ liệu mới nhất khi F5

export default async function Page() {
  // Lấy dữ liệu phân tích từ Supabase
  const stats = await getAnalyticsStats();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground text-sm">
          Đo lường lưu lượng truy cập, tỷ lệ tương tác và tỷ suất chuyển đổi của Boospace trong tầm tay.
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
          </TabsList>

          <AnalyticsToolbar />
        </div>
        <TabsContent value="overview" className="flex flex-col gap-4">
          <AnalyticsKpiStrip stats={stats} />

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              {/* TRUYỀN DATA HIỆU SUẤT MỤC TIÊU VÀO BIỂU ĐỒ ĐƯỜNG */}
              <TrafficQuality qualityData={stats.trafficQualityData} />
            </div>
            <div className="xl:col-span-5">
              <RealtimeVisitors activeCustomers={stats.activeCustomers} />
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TopPages pages={stats.topPages} />
            </div>
            <div className="xl:col-span-5 xl:col-start-8">
              {/* TRUYỀN NGUỒN TRAFFIC ĐỘNG VÀO ĐÂY */}
              <TopTrafficSources
                sources={stats.sourcesData}
                campaigns={stats.campaignsData}
                referrers={stats.referrersData}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="audience">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            Audience view coming soon.
          </div>
        </TabsContent>
        <TabsContent value="acquisition">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            Acquisition view coming soon.
          </div>
        </TabsContent>
        <TabsContent value="engagement">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            Engagement view coming soon.
          </div>
        </TabsContent>
        <TabsContent value="conversions">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            Conversions view coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
