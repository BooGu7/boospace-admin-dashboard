"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  amount: { label: "Doanh thu" },
  vietqr: { color: "var(--chart-3)", label: "VietQR (PayOS)" },
  momo: { color: "var(--chart-2)", label: "Ví MoMo" },
  cod: { color: "var(--chart-1)", label: "COD (Thu hộ)" },
} satisfies ChartConfig;

interface Props {
  stats: any;
  settings: any;
}

export function BalanceDistributionCard({ stats, settings }: Props) {
  const gateways = settings?.gateways || [];

  const paymentData = React.useMemo(() => {
    const total = stats.grossRevenue || 0;

    // Đọc động tỉ lệ % chia tiền từ Supabase để phân rã số tiền thực tế!
    const qrPercent = gateways[0]?.share_percent || 60;
    const momoPercent = gateways[1]?.share_percent || 25;
    const codPercent = 100 - qrPercent - momoPercent;

    const qrAmt = Math.round((total * qrPercent) / 100);
    const momoAmt = Math.round((total * momoPercent) / 100);
    const codAmt = total - qrAmt - momoAmt;

    return [
      {
        method: gateways[0]?.name || "VietQR (PayOS)",
        amount: qrAmt,
        key: "vietqr",
        percentage: qrPercent,
        fill: "color" in chartConfig.vietqr ? chartConfig.vietqr.color : undefined,
      },
      {
        method: gateways[1]?.name || "Ví MoMo",
        amount: momoAmt,
        key: "momo",
        percentage: momoPercent,
        fill: "color" in chartConfig.momo ? chartConfig.momo.color : undefined,
      },
      {
        method: gateways[2]?.name || "COD / PayPal",
        amount: codAmt,
        key: "cod",
        percentage: codPercent,
        fill: "color" in chartConfig.cod ? chartConfig.cod.color : undefined,
      },
    ];
  }, [stats.grossRevenue, gateways]);

  const totalRevenue = stats.grossRevenue || 0;

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="font-bold text-base text-slate-800">Phân bổ nguồn tiền thanh toán</CardTitle>
        <CardDescription>Tỉ lệ các phương thức thanh toán của đơn hàng thực tế.</CardDescription>
      </CardHeader>

      <CardContent className="grid items-center gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-44">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="w-52" nameKey="method" />}
            />
            <Pie
              cornerRadius={6}
              data={paymentData}
              dataKey="amount"
              innerRadius={50}
              nameKey="method"
              outerRadius={75}
              paddingAngle={2}
              strokeWidth={5}
              stroke="var(--card)"
            >
              <Label
                content={({ viewBox }) => {
                  if (!(viewBox && "cx" in viewBox && "cy" in viewBox)) return null;
                  return (
                    <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                      <tspan className="fill-muted-foreground text-[10px]" x={viewBox.cx} y={(viewBox.cy ?? 0) - 8}>
                        Quỹ gộp
                      </tspan>
                      <tspan className="fill-foreground font-bold text-sm" x={viewBox.cx} y={(viewBox.cy ?? 0) + 10}>
                        {formatVND(totalRevenue)}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex min-w-0 flex-col gap-2.5 pl-2">
          {paymentData.map((item) => (
            <div className="grid grid-cols-[1fr_auto] items-end gap-3" key={item.key}>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="h-2 w-1.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <p className="truncate text-muted-foreground text-[11px] font-semibold">{item.method}</p>
                </div>
                <p className="font-bold text-xs mt-0.5 text-slate-800">{formatVND(item.amount)}</p>
              </div>
              <div className="font-extrabold text-xs text-slate-500 tabular-nums">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
