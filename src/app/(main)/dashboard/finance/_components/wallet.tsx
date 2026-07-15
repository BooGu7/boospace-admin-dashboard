"use client";

import { CreditCard, QrCode, Wallet as WalletIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Props {
  grossRevenue: number;
  settings: any;
}

export function Wallet({ grossRevenue, settings }: Props) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  // Lấy cấu hình danh sách ví và tỷ trọng chia (%) thực tế tải về từ Supabase
  const gateways = settings?.gateways || [];

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="font-bold text-base text-slate-800">Cổng nhận tiền (Gateways)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {gateways.map((card: any) => {
            // Tự động phân chia số dư theo tỷ lệ % cấu hình trên Supabase nhân với Doanh thu thật!
            const balanceVal = Math.round((grossRevenue * card.share_percent) / 100);
            const isPayOS = card.id === "gw-1";
            const isMoMo = card.id === "gw-2";
            const Icon = isPayOS ? QrCode : isMoMo ? WalletIcon : CreditCard;

            return (
              <div key={card.id} className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800 text-sm leading-none">{card.name}</span>
                  <span className="font-normal text-muted-foreground text-xs">
                    {isPayOS ? "Số TK: " : isMoMo ? "SĐT: " : "Email: "}
                    {card.account}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-extrabold text-sm text-slate-800 tabular-nums">{formatVND(balanceVal)}</span>
                  <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Trạng thái kết nối API:</span>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-bold text-[10px] text-green-500 uppercase tracking-widest">Hoạt động</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
