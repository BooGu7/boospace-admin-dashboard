"use client";

import * as React from "react";
import { toast } from "sonner";
import { toggleCouponActiveAction } from "@/actions/coupon.actions";
import { Switch } from "@/components/ui/switch";

interface Props {
  id: string;
  initialValue: boolean;
}

export function CouponActiveToggle({ id, initialValue }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const [checked, setChecked] = React.useState(initialValue);

  const handleToggle = (val: boolean) => {
    setChecked(val);
    startTransition(async () => {
      const res = await toggleCouponActiveAction(id, val);
      if (res.success) {
        toast.success(val ? "Đã kích hoạt mã giảm giá!" : "Đã hủy kích hoạt mã giảm giá");
      } else {
        setChecked(!val); // Revert lại trạng thái cũ nếu có lỗi xảy ra
        toast.error(res.error || "Không thể đổi trạng thái");
      }
    });
  };

  return <Switch checked={checked} onCheckedChange={handleToggle} disabled={isPending} />;
}
