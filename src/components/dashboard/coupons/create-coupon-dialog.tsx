"use client";

import { Calendar, Loader2, Percent, Plus, ShieldCheck } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { createCouponAction } from "@/actions/coupon.actions";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export function CreateCouponDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPermanent, setIsPermanent] = React.useState(true);
  const [isPending, startTransition] = React.useTransition();

  // Khởi tạo các trường dữ liệu
  const [code, setCode] = React.useState("");
  const [discountPercent, setDiscountPercent] = React.useState(10);
  const [active, setActive] = React.useState(true);
  const [description, setDescription] = React.useState(""); // ĐÃ THÊM: Ghi chú sự kiện

  // Trạng thái ngày
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error("Vui lòng điền mã giảm giá.");
      return;
    }

    if (Number(discountPercent) <= 0 || Number(discountPercent) > 100) {
      toast.error("Tỷ lệ giảm giá phải từ 1 đến 100%.");
      return;
    }

    if (!isPermanent && (!startDate || !endDate)) {
      toast.error("Vui lòng điền đầy đủ ngày bắt đầu và kết thúc khi không chọn vĩnh viễn.");
      return;
    }

    startTransition(async () => {
      const res = await createCouponAction({
        code: code,
        discount_percent: Number(discountPercent),
        active: active,
        start_date: isPermanent ? null : startDate,
        end_date: isPermanent ? null : endDate,
        description: description, // Gửi ghi chú lên Supabase
      });

      if (res.success) {
        toast.success(`Tạo mã giảm giá ${code.toUpperCase()} thành công!`);
        setOpen(false);
        // Reset form
        setCode("");
        setDiscountPercent(10);
        setIsPermanent(true);
        setStartDate("");
        setEndDate("");
        setDescription("");
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi tạo mã.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-extrabold text-xs h-9 gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Tạo mã giảm giá
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] text-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 text-base font-extrabold text-slate-800">
            <Percent className="h-4.5 w-4.5 text-primary" /> Thiết lập mã giảm giá mới
          </DialogTitle>
          <DialogDescription className="text-[10px]">
            Nhập mã bưu cục chiết khấu cho khách hàng mua hàng tại Boospace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mã giảm giá */}
          <div className="space-y-1">
            <Label className="font-bold text-[11px] text-slate-700">Mã giảm giá (Code)</Label>
            <Input
              placeholder="VD: BOOSPACE20"
              className="font-mono h-9 text-xs font-bold"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* ĐÃ THÊM: Ô nhập Ghi chú sự kiện */}
          <div className="space-y-1">
            <Label className="font-bold text-[11px] text-slate-700">Ghi chú chương trình (Sự kiện)</Label>
            <Input
              placeholder="VD: Khuyến mãi hè 2026, Sinh nhật xưởng in..."
              className="h-9 text-xs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tỷ lệ % giảm giá */}
            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Tỷ lệ giảm giá (%)</Label>
              <Input
                type="number"
                className="h-9 text-xs font-mono font-bold"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                disabled={isPending}
              />
            </div>
            {/* Trạng thái kích hoạt */}
            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Trạng thái phát hành</Label>
              <div className="flex items-center h-9 border rounded-lg px-3 bg-muted/10 gap-2">
                <Switch checked={active} onCheckedChange={setActive} disabled={isPending} />
                <span className="font-bold text-[10px] text-slate-600">{active ? "Kích hoạt" : "Chờ kích"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cài đặt thời hạn */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border rounded-xl p-3 bg-slate-50/50">
              <div className="space-y-0.5">
                <p className="font-extrabold text-slate-800 text-[11px]">Áp dụng vĩnh viễn</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  Mã sẽ không bao giờ hết hạn trừ khi bạn chủ động hủy.
                </p>
              </div>
              <Switch checked={isPermanent} onCheckedChange={setIsPermanent} disabled={isPending} />
            </div>

            {/* Ô nhập ngày (Tự khóa khi chọn vĩnh viễn) */}
            {!isPermanent && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] text-slate-700 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Từ ngày
                  </Label>
                  <Input
                    type="date"
                    className="h-9 text-xs font-semibold"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] text-slate-700 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Đến ngày
                  </Label>
                  <Input
                    type="date"
                    className="h-9 text-xs font-semibold"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} className="bg-black text-white font-bold gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Lưu và phát hành
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
