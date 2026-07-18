import { getDashboardStats } from "@/lib/repositories/order.repository";
import { MetricCards } from "./_components/metric-cards";
import { PerformanceOverview } from "./_components/performance-overview";
import { SubscriberOverview } from "./_components/subscriber-overview";

export const revalidate = 0; // Luôn tải mới dữ liệu thực tế khi F5

interface PageProps {
  searchParams: Promise<{
    range?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function DashboardDefaultPage({ searchParams }: PageProps) {
  const { range = "7days", startDate, endDate } = await searchParams;
  const stats = await getDashboardStats(range, startDate, endDate);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-muted-foreground text-sm">Số liệu hoạt động kinh doanh thực tế từ cửa hàng của bạn.</p>
        </div>
      </div>

      <MetricCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <PerformanceOverview chartData={stats.chartData} />
        </div>

        <div className="col-span-3">
          <SubscriberOverview customers={stats.recentCustomers || []} />
        </div>
      </div>
    </div>
  );
}
