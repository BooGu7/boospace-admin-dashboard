"use client";

import { Loader2, Percent, Plus } from "lucide-react";
import { useState, useTransition } from "react";
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
import { Switch } from "@/components/ui/switch";

export function CreateCouponDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [active, setActive] = useState(true);
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error("Vui lòng điền mã code");
      return;
    }
    if (discountPercent <= 0 || discountPercent > 100) {
      toast.error("Phần trăm giảm giá phải từ 1% đến 100%");
      return;
    }

    startTransition(async () => {
      const res = await createCouponAction({
        code,
        discount_percent: discountPercent,
        active,
      });

      if (res.success) {
        toast.success(`Mã giảm giá ${code.toUpperCase()} đã được kích hoạt thành công!`);
        setOpen(false);
        setCode("");
        setDiscountPercent(10);
        setActive(true);
      } else {
        toast.error(res.error || "Không thể tạo mã giảm giá");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black">
          <Plus className="h-4 w-4" /> Tạo mã giảm giá
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Tạo mã giảm giá (Coupon)</DialogTitle>
          <DialogDescription>
            Mã này sẽ hiển thị và tự động áp dụng giảm trừ trực tiếp trên giỏ hàng Boo Space Storefront.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="coupon-code" className="font-semibold text-sm">
              Mã giảm giá (Code)
            </Label>
            <Input
              id="coupon-code"
              placeholder="Ví dụ: BOOSPACE3D, DIYSUMMER..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="uppercase font-bold font-mono"
              disabled={pending}
            />
          </div>

          {/* Discount Percent */}
          <div className="space-y-2">
            <Label htmlFor="discount" className="font-semibold text-sm">
              Phần trăm chiết khấu (%)
            </Label>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                min={1}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="font-bold font-mono pr-8"
                disabled={pending}
              />
              <Percent className="absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div className="space-y-0.5">
              <Label className="font-semibold text-sm">Trạng thái kích hoạt</Label>
              <p className="text-xs text-muted-foreground">Khách hàng có thể sử dụng ngay lập tức.</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} disabled={pending} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={pending}
            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black"
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu & Kích hoạt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
