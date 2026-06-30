"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function IncomeBreakdown({ data, totalRevenue }: { data: any[]; totalRevenue: number }) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Doanh thu theo danh mục</CardTitle>
        <CardDescription>Tỷ lệ đóng góp doanh số của từng loại mặt hàng.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const percentage = totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0;
          return (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="font-semibold text-slate-800">
                  {formatVND(item.value)} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Chưa có danh mục nào phát sinh doanh thu.</p>
        )}
      </CardContent>
    </Card>
  );
}
