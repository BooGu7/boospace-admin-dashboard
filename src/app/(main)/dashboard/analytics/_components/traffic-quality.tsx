"use client";

import { Ellipsis } from "lucide-react";
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  actualQuality: {
    color: "var(--chart-3)",
    label: "Mức đạt được",
  },
  baselineQuality: {
    color: "var(--muted-foreground)",
    label: "Chỉ tiêu (Baseline)",
  },
} satisfies ChartConfig;

const weeklyTicks = [1, 3, 5, 7];

function formatWeek(value: number) {
  if (value === 1) return "24h trước";
  if (value === 4) return "Trung tuần";
  if (value === 7) return "Hôm nay";
  return "";
}

export function TrafficQuality({ qualityData }: { qualityData: any[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal">Doanh số so với mục tiêu (7 ngày)</CardTitle>
        <CardDescription>Chỉ số lệch % so với hạn mức mục tiêu (8.000.000đ/ngày) của xưởng Boospace.</CardDescription>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-68 w-full">
          <ComposedChart data={qualityData} margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dayIndex"
              axisLine={false}
              domain={[1, 7]}
              interval={0}
              tickFormatter={formatWeek}
              tickLine={false}
              tickMargin={14}
              ticks={weeklyTicks}
              type="number"
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
                  className="w-44"
                  labelFormatter={(_value, items) => {
                    const matched = items?.[0]?.payload;
                    return matched ? `Ngày: ${matched.date}` : "Thống kê tuần";
                  }}
                  formatter={(value, name) => (
                    <div className="flex justify-between w-full text-xs font-semibold">
                      <span>{String(name)}:</span>
                      <span className={Number(value) >= 0 ? "text-green-600" : "text-red-500"}>
                        {Number(value) > 0 ? `+${value}%` : `${value}%`}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              dataKey="baselineQuality"
              dot={false}
              stroke="var(--color-baselineQuality)"
              strokeOpacity={0.65}
              strokeDasharray="4 4"
              strokeWidth={1.75}
              type="linear"
            />
            <Line
              dataKey="actualQuality"
              dot={false}
              activeDot={{ r: 4 }}
              stroke="var(--color-actualQuality)"
              strokeWidth={2.5}
              type="linear"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
