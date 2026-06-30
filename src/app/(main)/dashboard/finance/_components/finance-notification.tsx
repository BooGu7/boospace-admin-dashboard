"use client";

import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";

export function FinanceNotification() {
  return (
    <Item className="rounded-xl border-emerald-100 bg-emerald-50/20" variant="outline">
      <ItemMedia variant="icon" className="bg-emerald-100 text-emerald-700">
        <Award />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-emerald-900 font-bold">Mục tiêu tuần đạt 85%</ItemTitle>
        <ItemDescription className="text-emerald-700 text-xs">
          Bạn chỉ cần bán thêm 3 đơn hàng nữa để vượt chỉ tiêu doanh số tuần này!
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          Xem KPI
        </Button>
      </ItemActions>
    </Item>
  );
}
