"use client";

import { Ellipsis } from "lucide-react";
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  actualQuality: {
    color: "#3b82f6",
    label: "Doanh số thực tế",
  },
  baselineQuality: {
    color: "#cbd5e1",
    label: "Hạn mức chỉ tiêu",
  },
} satisfies ChartConfig;

export function TrafficQuality({ qualityData }: { qualityData: any[] }) {
  const dataLength = qualityData?.length || 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-slate-800">Doanh số so với mục tiêu</CardTitle>
        <CardDescription>
          Đo lường mức độ chênh lệch (%) doanh thu ngày so với hạn mức vận hành tiêu chuẩn (8.000.000đ/ngày).
        </CardDescription>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="h-68 w-full">
          <ComposedChart data={qualityData} margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              className="text-xs text-slate-500 font-semibold"
              interval={dataLength > 90 ? Math.floor(dataLength / 8) : dataLength > 30 ? 10 : dataLength > 7 ? 4 : 0}
            />
            <YAxis
              axisLine={false}
              domain={[-100, 100]}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              tickMargin={10}
              width={38}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-56 font-sans"
                  labelFormatter={(_value, items) => {
                    const matched = items?.[0]?.payload;
                    return matched ? `Ngày: ${matched.date}` : "Thống kê";
                  }}
                  formatter={(value, name) => {
                    const label = name === "actualQuality" ? "Doanh số so với mục tiêu" : "Chỉ tiêu xưởng";
                    return (
                      <div className="flex justify-between w-full text-xs font-semibold gap-4">
                        <span>{label}:</span>
                        <span className={Number(value) >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                          {Number(value) > 0 ? `+${value}%` : `${value}%`}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Line
              dataKey="baselineQuality"
              dot={false}
              stroke="#cbd5e1"
              strokeOpacity={0.8}
              strokeDasharray="4 4"
              strokeWidth={1.75}
              type="linear"
            />
            <Line
              dataKey="actualQuality"
              dot={false}
              activeDot={{ r: 4 }}
              stroke="#3b82f6"
              strokeWidth={2.5}
              type="linear"
            />
          </ComposedChart>
        </ChartContainer>

        {/* Khung giải thích định nghĩa toán học các mốc hiển thị */}
        <div className="rounded-lg bg-slate-50 p-4 border text-xs text-slate-600 dark:bg-slate-900/50 dark:border-slate-800 space-y-1.5 leading-relaxed">
          <p className="font-bold text-slate-700 dark:text-slate-200">🔍 Hướng dẫn đọc chỉ số hiệu suất:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong className="text-slate-800 dark:text-slate-100">Hạn mức chỉ tiêu (0%)</strong>: Điểm mốc cố định
              ứng với doanh thu chuẩn <strong>8.000.000đ/ngày</strong>.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-100">Doanh số so với mục tiêu (lệch %)</strong>: Thể
              hiện biên độ tăng/giảm của doanh thu thực tế.
            </li>
            <li>
              Ví dụ mốc <span className="text-red-600 font-semibold">-87.4%</span> nghĩa là ngày hôm đó xưởng chỉ đạt
              doanh thu <strong>1.008.000đ</strong> (hụt 87.4% so với chỉ tiêu). Nếu đạt mốc{" "}
              <span className="text-green-600 font-semibold">+50%</span> xưởng đạt doanh thu{" "}
              <strong>12.000.000đ</strong>.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
