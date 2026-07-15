"use client";

import { ChevronRight, Cloud, Database, Mail, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";

export function UpcomingTransactions({ settings }: { settings: any }) {
  const bills = settings?.bills || [];

  // Tự động tính toán tổng số tiền duy trì theo đơn giá của từng hóa đơn bạn lưu trên Supabase!
  const totalCost = bills.reduce((sum: number, b: any) => sum + Number(b.cost || 0), 0);

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="font-bold text-base text-slate-800">Chi phí vận hành hàng tháng</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-baseline text-3xl leading-none tracking-tight">
              <span className="font-extrabold text-slate-800">{formatVND(totalCost)}</span>
            </h2>
            <p className="text-muted-foreground text-xs mt-1">
              Dự tính ngân sách duy trì hạ tầng Cloud xưởng hàng tháng.
            </p>
          </div>
          <div className="flex w-max items-center gap-2 rounded-md border border-border bg-muted/70 px-2 py-1.5 text-xs">
            <Zap className="size-4 fill-amber-500 text-yellow-600 animate-bounce" />
            <span className="text-muted-foreground font-semibold">
              Tự động trừ liên kết qua tài khoản Visa đăng ký.
            </span>
          </div>
        </div>

        <ItemGroup>
          {bills.map((bill: any, index: number) => {
            const Icon = index === 0 ? Cloud : index === 1 ? Database : Mail;
            const iconColor = index === 0 ? "text-blue-500" : index === 1 ? "text-emerald-500" : "text-indigo-500";

            return (
              <Item key={bill.id} variant="outline" size="xs">
                <ItemMedia>
                  <div className="grid size-9 place-items-center rounded-md border bg-background">
                    <Icon className={`size-4 ${iconColor}`} />
                  </div>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="font-bold text-slate-800">{bill.title}</ItemTitle>
                  <ItemDescription className="text-xs text-muted-foreground mt-0.5">
                    {bill.date} • <strong className="text-slate-700">{formatVND(bill.cost)}</strong>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
