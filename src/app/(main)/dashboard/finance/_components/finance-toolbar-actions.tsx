"use client";

import { Download, Landmark, Loader2, Save, Settings2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { type FinanceSettings, saveFinanceSettingsAction } from "@/actions/finance.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  stats: any;
  settings: FinanceSettings;
}

export function FinanceToolbarActions({ stats, settings }: Props) {
  const [openSettings, setOpenSettings] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Khởi tạo trạng thái form cấu hình lấy từ Supabase (mặc định ACB: 2077867)
  const [payosAcc, setPayosAcc] = React.useState(settings.gateways[0]?.account || "2077867");
  const [momoAcc, setMomoAcc] = React.useState(settings.gateways[1]?.account || "");
  const [paypalAcc, setPayPalAcc] = React.useState(settings.gateways[2]?.account || "");

  const [vercelCost, setVercelCost] = React.useState(settings.bills[0]?.cost || 500000);
  const [supabaseCost, setSupabaseCost] = React.useState(settings.bills[1]?.cost || 625000);
  const [resendCost, setResendCost] = React.useState(settings.bills[2]?.cost || 500000);

  const [weeklyKpi, setWeeklyKpi] = React.useState(settings.target_weekly_kpi || 10000000);

  // Xuất tệp tin dữ liệu tài chính JSON
  const handleExportData = () => {
    try {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(stats, null, 2))}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `boospace-financial-report-${new Date().toISOString().split("T")[0]}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Đã kết xuất và tải báo cáo dòng tiền JSON về máy thành công!");
    } catch {
      toast.error("Lỗi xuất tệp tin");
    }
  };

  const handleSaveSettings = () => {
    startTransition(async () => {
      const updated: FinanceSettings = {
        gateways: [
          { ...settings.gateways[0], account: payosAcc, bank_code: "ACB" },
          { ...settings.gateways[1], account: momoAcc },
          { ...settings.gateways[2], account: paypalAcc },
        ],
        bills: [
          { ...settings.bills[0], cost: Number(vercelCost) },
          { ...settings.bills[1], cost: Number(supabaseCost) },
          { ...settings.bills[2], cost: Number(resendCost) },
        ],
        target_weekly_kpi: Number(weeklyKpi),
      };

      const res = await saveFinanceSettingsAction(updated);
      if (res.success) {
        toast.success("Đã lưu cấu hình tài chính lên Supabase!");
        setOpenSettings(false);
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <div className="flex items-center gap-2 shrink-0 justify-end w-full sm:w-auto">
      {/* Nút Xuất JSON */}
      <Button size="sm" variant="outline" onClick={handleExportData} className="gap-2 h-8 text-xs">
        <Download className="h-4 w-4" /> Xuất dữ liệu
      </Button>

      {/* Dialog Cấu hình tài chính */}
      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2 h-8 text-xs">
            <Settings2 className="h-4 w-4" /> Cấu hình
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Landmark className="h-5 w-5 text-primary" /> Cấu hình nguồn tiền & Đơn giá vận hành
            </DialogTitle>
            <DialogDescription>
              Thay đổi số tài khoản các cổng nhận tiền và định giá chi phí duy trì máy chủ của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Cấu hình Ví */}
            <div className="space-y-2 border-b pb-3">
              <h4 className="font-bold text-slate-800 text-xs">1. Số tài khoản các cổng nhận tiền</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">STK VietQR ACB Bank (Tôn Thất Trọng)</Label>
                  <Input
                    className="h-8 text-xs font-mono font-bold"
                    value={payosAcc}
                    onChange={(e) => setPayosAcc(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">SĐT ví MoMo Business</Label>
                  <Input
                    className="h-8 text-xs font-mono font-bold"
                    value={momoAcc}
                    onChange={(e) => setMomoAcc(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Email nhận tiền PayPal</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={paypalAcc}
                    onChange={(e) => setPayPalAcc(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cấu hình Chi phí Cloud */}
            <div className="space-y-2 border-b pb-3">
              <h4 className="font-bold text-slate-800 text-xs">2. Chi phí duy trì Cloud hàng tháng (VNĐ)</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Vercel Pro</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={vercelCost}
                    onChange={(e) => setVercelCost(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Supabase Pro</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={supabaseCost}
                    onChange={(e) => setSupabaseCost(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Resend Email</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={resendCost}
                    onChange={(e) => setResendCost(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Cấu hình KPI tuần */}
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-800 text-xs">3. Mục tiêu doanh thu tuần (VNĐ)</Label>
              <Input
                type="number"
                className="h-8 text-xs font-mono font-bold text-blue-900"
                value={weeklyKpi}
                onChange={(e) => setWeeklyKpi(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSettings(false)} disabled={isPending}>
              Hủy
            </Button>
            <Button onClick={handleSaveSettings} disabled={isPending} className="bg-black text-white font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu lên Supabase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
