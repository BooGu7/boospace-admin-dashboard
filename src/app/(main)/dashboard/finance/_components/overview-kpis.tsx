"use client";

import { ArrowDownRight, ArrowUpRight, DollarSign, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function OverviewKpis({ stats }: { stats: any }) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {/* Thẻ Doanh thu gộp */}
      <Card className="shadow-sm">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Doanh thu gộp</span>
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-black mt-2 text-slate-900">{formatVND(stats.grossRevenue)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Doanh số thu về thực tế từ đơn hàng.</p>
        </CardContent>
      </Card>

      {/* Thẻ Giá vốn */}
      <Card className="shadow-sm">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Giá vốn sản xuất</span>
              <span className="p-1 bg-red-50 text-red-600 rounded-md">
                <ArrowDownRight className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-black mt-2 text-slate-900">{formatVND(stats.totalCogs)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Chi phí phôi nhựa và nguyên liệu in.</p>
        </CardContent>
      </Card>

      {/* Thẻ Lợi nhuận ròng */}
      <Card className="shadow-sm">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Lợi nhuận ròng</span>
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                <DollarSign className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">{formatVND(stats.netProfit)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Tiền lãi thực tế thu về sau khi trừ vốn.</p>
        </CardContent>
      </Card>

      {/* Thẻ Tỷ suất */}
      <Card className="shadow-sm">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Tỷ suất lợi nhuận</span>
              <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
                <Percent className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-black mt-2 text-slate-900">{stats.profitMargin}%</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Biên lợi nhuận trung bình của shop.</p>
        </CardContent>
      </Card>
    </div>
  );
}
