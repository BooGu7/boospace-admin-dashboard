"use client";

import { Ellipsis } from "lucide-react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  actualQuality: {
    color: "#3b82f6",
    label: "Số người dùng hoạt động",
  },
  baselineQuality: {
    color: "#10b981",
    label: "Số phiên kết nối (Sessions)",
  },
} satisfies ChartConfig;

export function TrafficQuality({ qualityData }: { qualityData: any[] }) {
  const dataLength = qualityData?.length || 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-slate-800">Xu hướng lượng khách truy cập</CardTitle>
        <CardDescription>
          Biểu đồ theo dõi tổng lượng người dùng đang hoạt động song hành cùng số phiên kết nối trong khoảng lọc.
        </CardDescription>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="h-68 w-full">
          <ComposedChart data={qualityData} margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
            <defs>
              <linearGradient id="fillActiveUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.4} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              className="text-xs text-slate-500 font-semibold"
              interval={dataLength > 90 ? Math.floor(dataLength / 8) : dataLength > 30 ? 10 : dataLength > 7 ? 4 : 0}
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} width={28} className="text-xs text-slate-400" />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-64 font-sans"
                  labelFormatter={(_value, items) => {
                    const matched = items?.[0]?.payload;
                    return matched ? `Mốc thời gian: ${matched.date}` : "Thống kê lưu lượng";
                  }}
                  formatter={(value, name) => {
                    const label = name === "actualQuality" ? "Số người dùng hoạt động" : "Số phiên kết nối";
                    const color = name === "actualQuality" ? "text-blue-600" : "text-emerald-600";
                    return (
                      <div className="flex justify-between w-full text-xs font-semibold gap-4">
                        <span>{label}:</span>
                        <span className={`${color} font-bold`}>{value} lượt</span>
                      </div>
                    );
                  }}
                />
              }
            />
            {/* Số người dùng hoạt động (Area màu xanh dương) */}
            <Area
              dataKey="actualQuality"
              type="monotone"
              fill="url(#fillActiveUsers)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            {/* Số phiên kết nối (Đường Line màu xanh lá) */}
            <Line dataKey="baselineQuality" type="monotone" dot={false} stroke="#10b981" strokeWidth={2} />
          </ComposedChart>
        </ChartContainer>

        {/* Khung giải thích định nghĩa toán học các mốc hiển thị */}
        <div className="rounded-lg bg-slate-50 p-4 border text-xs text-slate-600 dark:bg-slate-900/50 dark:border-slate-800 space-y-1.5 leading-relaxed">
          <p className="font-bold text-slate-700 dark:text-slate-200">🔍 Định nghĩa chỉ số đo lường:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong className="text-slate-800 dark:text-slate-100">Số người dùng hoạt động (Active Users)</strong>: Số
              lượng thiết bị độc nhất phát sinh tương tác thực tế với cửa hàng của bạn.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-100">Số phiên kết nối (Sessions)</strong>: Tổng số lần
              truy cập và duy trì phiên của nhóm người dùng trên hệ thống.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
