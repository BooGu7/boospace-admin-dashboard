"use client";

import { History, MoreHorizontal, Percent, Plus, QrCode, SendHorizontal, Smartphone, Truck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface Props {
  settings?: any;
}

export function QuickActions({ settings: _settings }: Props) {
  const router = useRouter();
  const [openQR, setOpenQR] = React.useState(false);

  // Khởi tạo trạng thái thông tin tài khoản ngân hàng
  const [accountInfo, setAccountInfo] = React.useState({
    bankCode: "ACB",
    accountNumber: "2077867",
    accountName: "TON THAT TRONG",
  });

  // Tải cấu hình tài khoản thực tế từ Supabase thông qua createClient()
  React.useEffect(() => {
    async function loadAccount() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("payment_gateways")
          .select("bank_code, account_number, account_name")
          .eq("code", "VIETQR_ACB")
          .maybeSingle();

        if (data) {
          setAccountInfo({
            bankCode: data.bank_code || "ACB",
            accountNumber: data.account_number || "2077867",
            accountName: data.account_name || "TON THAT TRONG",
          });
        }
      } catch (e) {
        console.error("Lỗi nạp cổng thanh toán:", e);
      }
    }

    loadAccount();
  }, []);

  const handleAction = (label: string) => {
    if (label === "Tạo Voucher") {
      router.push("/dashboard/coupons");
      toast.success("Đã mở trang cấu hình mã giảm giá (Coupons)");
    } else if (label === "Nhãn giao hàng") {
      router.push("/dashboard/logistics");
      toast.success("Đã mở trang hành trình vận chuyển");
    } else if (label === "QR Nhận tiền") {
      setOpenQR(true);
    } else {
      toast.info(`Tính năng "${label}" đang được kết nối hệ thống.`);
    }
  };

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

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-bold text-base text-slate-800">Thao tác nhanh vận hành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;
                return (
                  <div key={shortcut.id} className="flex flex-col items-center gap-2">
                    <Button
                      variant="outline"
                      className="size-11 rounded-full hover:bg-black hover:text-white transition-all dark:hover:bg-white dark:hover:text-black border-border shadow-2xs cursor-pointer"
                      onClick={() => handleAction(shortcut.label)}
                    >
                      <Icon className="size-4" />
                    </Button>
                    <span className="text-center text-muted-foreground text-[10px] font-semibold leading-tight">
                      {shortcut.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG HIỂN THỊ MÃ QR NHẬN TIỀN DỰA TRÊN DỮ LIỆU TẢI ĐỘNG TỪ SUPABASE */}
      <Dialog open={openQR} onOpenChange={setOpenQR}>
        <DialogContent className="sm:max-w-[360px] text-center">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-slate-800">Quét mã nhận tiền chuyển khoản</DialogTitle>
            <DialogDescription>Mã VietQR động kết nối tài khoản ngân hàng chính thức của Boospace.</DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center">
            <div className="relative h-64 w-64 border rounded-xl overflow-hidden shadow-sm bg-white p-2 flex items-center justify-center">
              <Image
                src={`https://img.vietqr.io/image/${accountInfo.bankCode}-${accountInfo.accountNumber}-compact.png?addInfo=BooSpace%20Store%20Chuy%E1%BB%83n%20kho%E1%BA%A3n&accountName=${encodeURIComponent(accountInfo.accountName)}`}
                alt="VietQR ACB Bank"
                fill
                sizes="256px"
                className="object-contain"
              />
            </div>
            <div className="mt-3 text-xs space-y-0.5">
              <p className="font-bold text-slate-800">Ngân hàng TMCP Á Châu (ACB)</p>
              <p className="font-semibold text-slate-700">Chủ TK: {accountInfo.accountName}</p>
              <p className="font-mono text-muted-foreground">Số TK: {accountInfo.accountNumber}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
