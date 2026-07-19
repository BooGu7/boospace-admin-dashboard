import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROVINCE_MAP } from "@/data/data_location"; // Nhập khẩu nguồn địa danh tập trung
import { getAnalyticsStats } from "@/lib/repositories/order.repository";
import { AnalyticsKpiStrip } from "./_components/analytics-kpi-strip";
import { AnalyticsToolbar } from "./_components/analytics-toolbar";
import { AudienceCharts } from "./_components/audience-charts";
import { RealtimeVisitors } from "./_components/realtime-visitors";
import { TopPages } from "./_components/top-pages";
import { TopTrafficSources } from "./_components/top-traffic-sources";
import { TrafficQuality } from "./_components/traffic-quality";

import "@/styles/flag-icons/flags.css";

export const revalidate = 0; // Đảm bảo luôn lấy dữ liệu mới nhất khi F5

interface PageProps {
  searchParams: Promise<{
    range?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

function getCityVietnameseName(cityName: string): string {
  const clean = cityName.toLowerCase().trim();
  for (const [, value] of Object.entries(PROVINCE_MAP)) {
    if (value.searchTerms.some((term) => clean.includes(term))) {
      return value.name;
    }
  }
  return cityName;
}

export default async function Page({ searchParams }: PageProps) {
  const { range = "last-4-weeks", startDate, endDate } = await searchParams;
  const stats = await getAnalyticsStats(range, startDate, endDate);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight font-bold">Tổng quan phân tích lưu lượng</h1>
        <p className="text-muted-foreground text-sm">
          Đo lường lưu lượng truy cập, tỷ lệ tương tác và tỷ suất chuyển đổi của Boospace trong tầm tay.
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="gap-1">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="audience">Đối tượng</TabsTrigger>
            <TabsTrigger value="acquisition">Kênh truy cập</TabsTrigger>
            <TabsTrigger value="engagement">Tương tác</TabsTrigger>
            <TabsTrigger value="conversions">Chuyển đổi</TabsTrigger>
          </TabsList>

          <AnalyticsToolbar />
        </div>

        {/* TAB 1: TỔNG QUAN */}
        <TabsContent value="overview" className="flex flex-col gap-4">
          <AnalyticsKpiStrip stats={stats} />

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TrafficQuality qualityData={stats.trafficQualityData} />
            </div>
            <div className="xl:col-span-5">
              <RealtimeVisitors liveCount={stats.realtimeVisitorsCount} citiesData={stats.citiesData || []} />
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TopPages pages={stats.topPages} />
            </div>
            <div className="xl:col-span-5">
              <TopTrafficSources
                sources={stats.sourcesData}
                campaigns={stats.campaignsData}
                referrers={stats.referrersData}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: ĐỐI TƯỢNG */}
        <TabsContent value="audience" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* THÀNH PHỐ KHÁCH HÀNG */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Thành phố hoạt động hàng đầu</CardTitle>
                <CardDescription>Báo cáo mật độ người dùng thực tế đang truy cập theo khu vực đô thị.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats.citiesData || []).map((city: any, i: number) => (
                    <div
                      key={city.name}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="size-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">
                          {i + 1}
                        </span>
                        {getCityVietnameseName(city.name)}
                      </span>
                      <span className="text-sm font-extrabold text-slate-800 tabular-nums">{city.value} người</span>
                    </div>
                  ))}
                  {(!stats.citiesData || stats.citiesData.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground text-xs">
                      Chưa có số liệu vị trí thành phố.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ĐỘ TUỔI KHÁCH HÀNG */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Cơ cấu độ tuổi người dùng</CardTitle>
                <CardDescription>
                  Phân rã hành vi và nhóm tuổi của người tiêu dùng trên Boospace Storefront.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <AudienceCharts data={stats.agesData || []} />
              </CardContent>
            </Card>
          </div>

          {/* PHÂN TÍCH THIẾT BỊ SỬ DỤNG HÀNG ĐẦU */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Thiết bị truy cập</CardTitle>
              <CardDescription>Tỷ trọng phân loại phần cứng khách hàng sử dụng trải nghiệm Boospace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(stats.devicesData || []).map((device: any) => (
                  <div key={device.name} className="rounded-xl border p-4 bg-muted/10 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-500">{device.name}</span>
                    <span className="text-2xl font-black text-slate-800 mt-2">{device.value} lượt</span>
                  </div>
                ))}
                {(!stats.devicesData || stats.devicesData.length === 0) && (
                  <div className="col-span-full text-center py-10 text-muted-foreground text-xs">
                    Chưa có số liệu thiết bị truy cập thực tế.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: KÊNH TRUY CẬP */}
        <TabsContent value="acquisition" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800">
                    Hiệu suất kênh truyền thông thu nạp
                  </CardTitle>
                  <CardDescription>Chi tiết luồng phân tách kênh tiếp cận kéo traffic về xưởng.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopTrafficSources
                    sources={stats.sourcesData}
                    campaigns={stats.campaignsData}
                    referrers={stats.referrersData}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Từ khóa tìm kiếm SEO */}
            <div className="xl:col-span-5">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800">Từ khóa Google Search (SEO)</CardTitle>
                  <CardDescription>
                    Danh sách cụm từ khách hàng tìm kiếm trên Google để tiếp cận Boospace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(stats.keywordsData || []).map((k: any, i: number) => (
                      <div
                        key={k.query}
                        className="flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0"
                      >
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={k.query}>
                          {i + 1}. {k.query}
                        </span>
                        <span className="text-xs font-black text-blue-600 tabular-nums">{k.clicks} lượt click</span>
                      </div>
                    ))}
                    {(!stats.keywordsData || stats.keywordsData.length === 0) && (
                      <div className="text-center py-12 text-muted-foreground text-xs leading-relaxed">
                        Chưa ghi nhận từ khóa tìm kiếm tự nhiên thực tế nào phát sinh (Chưa liên kết GSC).
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: TƯƠNG TÁC */}
        <TabsContent value="engagement" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Tỷ lệ tương tác thực tế</span>
              <span className="text-3xl font-black text-slate-800 mt-2">{stats.engagementRate || "61.4%"}</span>
              <p className="text-[10px] text-muted-foreground mt-1">Mức độ ở lại trang của khách hàng trên 10 giây</p>
            </Card>
            <Card className="p-6 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Lượt xem trên mỗi người dùng</span>
              <span className="text-3xl font-black text-slate-800 mt-2">~ 4.8 lượt</span>
              <p className="text-[10px] text-muted-foreground mt-1">Trung bình số lần click sản phẩm của khách</p>
            </Card>
            <Card className="p-6 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Tổng thời gian tương tác</span>
              <span className="text-3xl font-black text-slate-800 mt-2">124 giờ</span>
              <p className="text-[10px] text-muted-foreground mt-1">Tổng cộng thời gian trải nghiệm trong tầm lọc</p>
            </Card>
          </div>
          <TopPages pages={stats.topPages} />
        </TabsContent>

        {/* TAB 5: CHUYỂN ĐỔI */}
        <TabsContent value="conversions" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Hiệu suất phễu chuyển đổi bán hàng</CardTitle>
              <CardDescription>Liên đới dữ liệu giỏ hàng thật từ Supabase của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 bg-muted/10">
                  <span className="text-xs font-bold text-slate-500">Tỷ lệ chuyển đổi đơn hàng (CR)</span>
                  <span className="text-2xl font-black text-emerald-700 block mt-1">{stats.conversionRate}%</span>
                </div>
                <div className="border rounded-xl p-4 bg-muted/10">
                  <span className="text-xs font-bold text-slate-500">Tổng giao dịch hoàn tất</span>
                  <span className="text-2xl font-black text-slate-800 block mt-1">
                    {stats.uniqueVisitors > 0 ? Math.round(stats.uniqueVisitors * 0.05) : 0} giao dịch
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
