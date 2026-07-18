"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartConfig = {
  newCustomers: {
    label: "Doanh thu",
    color: "#3b82f6",
  },
  returningUsers: {
    label: "Lợi nhuận thực tế",
    color: "#10b981",
  },
  orderCount: {
    label: "Số lượng đơn hàng",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export function PerformanceOverview({ chartData }: { chartData: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get("range") || "7days";
  const [startVal, setStartVal] = useState(searchParams.get("startDate") || "");
  const [endVal, setEndVal] = useState(searchParams.get("endDate") || "");

  const updateUrl = (range: string, start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    if (range === "custom") {
      if (start) params.set("startDate", start);
      else params.delete("startDate");
      if (end) params.set("endDate", end);
      else params.delete("endDate");
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRangeChange = (value: string) => {
    if (value !== "custom") {
      setStartVal("");
      setEndVal("");
    }
    updateUrl(value, "", "");
  };

  const handleCustomDateApply = (start: string, end: string) => {
    updateUrl("custom", start, end);
  };

  return (
    <Card className="@container/card shadow-2xs">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="leading-none text-slate-800 font-bold">Hoạt động kinh doanh xưởng in</CardTitle>
          <CardDescription className="mt-1.5">
            <span>Xu hướng đối chiếu doanh thu, lợi nhuận và số lượng đơn hàng của xưởng</span>
          </CardDescription>
        </div>

        {/* Khu vực điều khiển mốc thời gian */}
        <div className="flex flex-wrap items-center gap-2">
          {currentRange === "custom" && (
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Đã loại bỏ thuộc tính size="sm" sai kiểu trên hai thẻ Input */}
              <Input
                type="date"
                className="h-8 text-xs w-32 px-2"
                value={startVal}
                onChange={(e) => {
                  setStartVal(e.target.value);
                  handleCustomDateApply(e.target.value, endVal);
                }}
              />
              <span className="text-xs font-semibold text-muted-foreground">đến</span>
              <Input
                type="date"
                className="h-8 text-xs w-32 px-2"
                value={endVal}
                onChange={(e) => {
                  setEndVal(e.target.value);
                  handleCustomDateApply(startVal, e.target.value);
                }}
              />
            </div>
          )}

          <div className="w-40 shrink-0">
            <Select value={currentRange} onValueChange={handleRangeChange}>
              <SelectTrigger size="sm" className="h-8">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="15days">15 ngày qua</SelectItem>
                <SelectItem value="30days">1 tháng qua</SelectItem>
                <SelectItem value="90days">3 tháng qua (5 ngày)</SelectItem>
                <SelectItem value="365days">1 năm qua (Tháng)</SelectItem>
                <SelectItem value="custom">Tự chọn mốc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <ComposedChart data={chartData} margin={{ top: 0 }}>
            <defs>
              <linearGradient id="fillNewCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-newCustomers)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-newCustomers)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillReturningUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-returningUsers)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-returningUsers)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.4} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="font-semibold text-slate-600"
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="w-52 font-semibold" indicator="line" />}
            />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-5 justify-end" />} />

            <Area
              dataKey="newCustomers"
              type="natural"
              fill="url(#fillNewCustomers)"
              stroke="var(--color-newCustomers)"
              strokeWidth={1.8}
              dot={false}
              fillOpacity={1}
            />
            <Area
              dataKey="returningUsers"
              type="natural"
              fill="url(#fillReturningUsers)"
              stroke="var(--color-returningUsers)"
              strokeWidth={1.8}
              dot={false}
              fillOpacity={1}
            />
            <Line
              dataKey="orderCount"
              type="monotone"
              stroke="var(--color-orderCount)"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: "#f59e0b", strokeWidth: 0 }}
              activeDot={{ r: 5.5 }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
