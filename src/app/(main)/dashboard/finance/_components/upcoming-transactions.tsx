"use client";

import { ChevronRight, Cloud, Database, Mail, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";

const bills = [
  {
    id: 1,
    title: "Vercel Pro (Hosting Storefront)",
    date: "Ngày 05 hàng tháng",
    cost: "20.00 USD",
    icon: Cloud,
    iconColor: "text-blue-500",
  },
  {
    id: 2,
    title: "Supabase Pro (Database & Storage)",
    date: "Ngày 15 hàng tháng",
    cost: "25.00 USD",
    icon: Database,
    iconColor: "text-emerald-500",
  },
  {
    id: 3,
    title: "Resend Email Starter [21]",
    date: "Ngày 20 hàng tháng",
    cost: "20.00 USD",
    icon: Mail,
    iconColor: "text-indigo-500",
  },
];

export function UpcomingTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Chi phí vận hành hàng tháng</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-baseline text-3xl leading-none tracking-tight">
              <span className="font-normal">65.00</span>
              <span className="text-muted-foreground text-xl"> USD</span>
            </h2>
            <p className="text-muted-foreground text-xs mt-1">Dự tính ngân sách duy trì hạ tầng Cloud hàng tháng.</p>
          </div>
          <div className="flex w-max items-center gap-2 rounded-md border border-border bg-muted/70 px-2 py-1.5 text-xs">
            <Zap className="size-4 fill-amber-500 text-yellow-600 animate-bounce" />
            <span className="text-muted-foreground">Hệ thống tự động trừ tiền qua thẻ Visa đăng ký.</span>
          </div>
        </div>

        <ItemGroup>
          {bills.map((bill) => {
            const Icon = bill.icon;
            return (
              <Item key={bill.id} variant="outline" size="xs">
                <ItemMedia>
                  <div className="grid size-9 place-items-center rounded-md border bg-background">
                    <Icon className={`size-4 ${bill.iconColor}`} />
                  </div>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{bill.title}</ItemTitle>
                  <ItemDescription>
                    {bill.date} • <strong className="text-slate-800">{bill.cost}</strong>
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
