"use client";

import { ArrowDownRight, ArrowUpRight, DollarSign, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function OverviewKpis({ stats }: { stats: any }) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Doanh thu gộp</span>
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">{formatVND(stats.grossRevenue)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Doanh số thu về từ đơn hàng</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Giá vốn sản xuất</span>
              <span className="p-1 bg-red-50 text-red-600 rounded-md">
                <ArrowDownRight className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">{formatVND(stats.totalCogs)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Chi phí phôi nhựa và nguyên liệu in</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Lợi nhuận ròng</span>
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                <DollarSign className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">{formatVND(stats.netProfit)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Tiền lãi thực tế thu về</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Tỷ suất lợi nhuận</span>
              <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
                <Percent className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.profitMargin}%</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Biên lợi nhuận trung bình của shop</p>
        </CardContent>
      </Card>
    </div>
  );
}
