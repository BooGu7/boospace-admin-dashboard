"use client";

import { ArrowUpRight, DollarSign, PackageCheck, ReceiptText, RotateCcw, ShoppingBag, Users } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const revenueOverviewConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--foreground)",
  },
  profit: {
    label: "Lợi nhuận ròng",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

export function KpiStrip({ stats }: { stats: any }) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="h-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-12">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 xl:col-span-5 xl:border-r">
            {/* THẺ DOANH THU THẬT */}
            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Doanh thu bán hàng</CardTitle>
                <CardDescription className="text-xl font-bold text-foreground tabular-nums leading-none tracking-tight">
                  {formatVND(stats.totalRevenue)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <DollarSign className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">Live</span>
                  <span className="text-muted-foreground"> đồng bộ Supabase</span>
                </div>
              </CardContent>
            </Card>

            {/* THẺ TỔNG ĐƠN HÀNG THẬT */}
            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Tổng đơn hàng</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {stats.totalOrders}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <ShoppingBag className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">Hoạt động</span>
                </div>
              </CardContent>
            </Card>

            {/* THẺ KHÁCH HÀNG THẬT */}
            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Khách hàng đăng ký</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {stats.customerGrowth}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Users className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300"> profiles</span>
                </div>
              </CardContent>
            </Card>

            {/* THẺ ĐƠN HÀNG TRUNG BÌNH THẬT */}
            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Giá trị đơn trung bình (AOV)</CardTitle>
                <CardDescription className="text-xl font-bold text-foreground tabular-nums leading-none tracking-tight">
                  {formatVND(stats.averageOrder)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <ReceiptText className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">Sức mua trung bình</span>
                </div>
              </CardContent>
            </Card>

            {/* THẺ ĐƠN HỦY THẬT */}
            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r md:border-b-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Đơn hàng đã hủy</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight text-red-600">
                  {stats.cancelledOrders}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <RotateCcw className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">Đơn bị huỷ bỏ</span>
                </div>
              </CardContent>
            </Card>

            {/* THẺ CHÍNH XÁC KHO */}
            <Card className="h-full rounded-none border-0 ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Độ chính xác kho</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {stats.stockAccuracy}%
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <PackageCheck className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">An toàn</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BIỂU ĐỒ DOANH SỐ THẬT */}
          <Card className="h-full rounded-none border-0 ring-0 xl:col-span-7">
            <CardHeader>
              <CardTitle className="font-normal">Tổng quan bán hàng (7 ngày)</CardTitle>
              <CardAction>
                <ArrowUpRight className="size-4" />
              </CardAction>
            </CardHeader>

            <CardContent>
              <ChartContainer config={revenueOverviewConfig} className="h-74 w-full">
                <ComposedChart
                  accessibilityLayer
                  data={stats.chartData}
                  margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                >
                  <defs>
                    <filter id="sales-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feFlood floodColor="var(--color-revenue)" floodOpacity="0.35" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid yAxisId="profit" vertical={false} />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis yAxisId="revenue" hide />
                  <YAxis yAxisId="profit" hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-40"
                        formatter={(value, name, item) => (
                          <>
                            <div className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                            <div className="flex flex-1 items-center justify-between leading-none">
                              <span className="text-muted-foreground">{String(name ?? "")}</span>
                              <span className="font-medium font-mono text-foreground tabular-nums">
                                {formatVND(Number(value))}
                              </span>
                            </div>
                          </>
                        )}
                      />
                    }
                    cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
                  />
                  <Bar
                    yAxisId="profit"
                    barSize={4}
                    dataKey="profit"
                    fill="var(--color-profit)"
                    name="Profit"
                    opacity={0.18}
                    radius={[6, 6, 0, 0]}
                  />
                  <Area
                    yAxisId="revenue"
                    dataKey="revenue"
                    fill="none"
                    filter="url(#sales-line-glow)"
                    name="Revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={1.8}
                    type="linear"
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
