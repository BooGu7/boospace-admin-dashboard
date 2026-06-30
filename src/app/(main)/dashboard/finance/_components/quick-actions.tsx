"use client";

import { History, MoreHorizontal, Percent, Plus, QrCode, SendHorizontal, Smartphone, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const shortcuts = [
  { id: 1, label: "Tạo Voucher", icon: Percent },
  { id: 2, label: "Tạo Đơn sỉ", icon: Plus },
  { id: 3, label: "Nhãn giao hàng", icon: Truck },
  { id: 4, label: "Lịch sử quỹ", icon: History },
  { id: 5, label: "Nạp thẻ", icon: Smartphone },
  { id: 6, label: "QR Nhận tiền", icon: QrCode },
  { id: 7, label: "Rút tiền mặt", icon: SendHorizontal },
  { id: 8, label: "Thêm nữa", icon: MoreHorizontal },
];

export function QuickActions() {
  const handleAction = (label: string) => {
    toast.info(`Tính năng "${label}" đang được kết nối với hệ thống.`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Thao tác nhanh vận hành</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <div key={shortcut.id} className="flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    className="size-11 rounded-full hover:bg-primary hover:text-white transition-all"
                    onClick={() => handleAction(shortcut.label)}
                  >
                    <Icon className="size-4" />
                  </Button>
                  <span className="text-center text-muted-foreground text-[11px] leading-tight">{shortcut.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
