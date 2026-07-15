"use client";

import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";

interface Props {
  stats: any;
  settings: any;
}

export function FinanceNotification({ stats, settings }: Props) {
  const target = settings?.target_weekly_kpi || 10000000;
  const currentRevenue = stats.grossRevenue || 0;
  const percentage = Math.min(Math.round((currentRevenue / target) * 100), 100);

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Item className="rounded-xl border-emerald-100 bg-emerald-50/20" variant="outline">
      <ItemMedia variant="icon" className="bg-emerald-100 text-emerald-700">
        <Award />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-emerald-900 font-bold">Mục tiêu tuần đạt {percentage}%</ItemTitle>
        <ItemDescription className="text-emerald-700 text-xs">
          Doanh thu hiện tại {formatVND(currentRevenue)} trên hạn mức mục tiêu {formatVND(target)}!
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
        >
          Xem chỉ tiêu KPI
        </Button>
      </ItemActions>
    </Item>
  );
}
