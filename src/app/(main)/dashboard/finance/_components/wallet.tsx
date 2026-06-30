"use client";

import { CreditCard, QrCode, Wallet as WalletIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const gatewayCards = [
  {
    id: 1,
    name: "PayOS Gateway (VietQR)",
    account: "Techcombank • 1903...",
    balance: "28.500.000 ₫",
    icon: QrCode,
  },
  {
    id: 2,
    name: "MoMo Business Wallet",
    account: "SĐT: 0938...",
    balance: "12.450.000 ₫",
    icon: WalletIcon,
  },
  {
    id: 3,
    name: "PayPal Business",
    account: "billing@boospace.tech",
    balance: "$1,450.00",
    icon: CreditCard,
  },
];

export function Wallet() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Cổng nhận tiền (Gateways)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {gatewayCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground text-sm leading-none">{card.name}</span>
                  <span className="font-normal text-muted-foreground text-xs">{card.account}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-sm">{card.balance}</span>
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
