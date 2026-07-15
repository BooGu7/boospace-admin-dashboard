"use client";

import * as React from "react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/order.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [isPending, startTransition] = React.useTransition();
  const [value, setValue] = React.useState(currentStatus);

  // ĐỒNG BỘ: Luôn lắng nghe giá trị mới nhất từ Server gửi xuống
  React.useEffect(() => {
    setValue(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (newStatus: string) => {
    setValue(newStatus);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        toast.success(`Đã cập nhật trạng thái đơn hàng sang: ${newStatus}`);
      } else {
        setValue(currentStatus); // Khôi phục giá trị cũ nếu lỗi
        toast.error(res.error || "Không thể cập nhật trạng thái.");
      }
    });
  };

  return (
    <Select value={value} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-[160px] h-8 text-xs font-semibold">
        <SelectValue placeholder="Chọn trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Pending" className="text-xs font-semibold">
          Chờ xử lý (Pending)
        </SelectItem>
        <SelectItem value="Confirmed" className="text-xs font-semibold">
          Đã xác nhận (Confirmed)
        </SelectItem>
        <SelectItem value="Shipped" className="text-xs font-semibold">
          Đang giao (Shipped)
        </SelectItem>
        <SelectItem value="Delivered" className="text-xs font-semibold">
          Đã giao (Delivered)
        </SelectItem>
        <SelectItem value="Cancelled" className="text-xs font-semibold text-red-600">
          Đã hủy (Cancelled)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
