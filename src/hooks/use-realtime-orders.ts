"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeOrders() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Đăng ký lắng nghe sự kiện INSERT (thêm mới) trên bảng orders
    const channel = supabase
      .channel("realtime-orders-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new;

          // Hiển thị thông báo nổi trên màn hình Admin kèm âm thanh nhẹ
          toast.info(`Đơn hàng mới #${newOrder.code || "Uncoded"} vừa được đặt!`, {
            description: `Khách hàng: ${newOrder.customer_name || "Khách vãng lai"} - Tổng tiền: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(newOrder.total)}`,
            action: {
              label: "Xem chi tiết",
              onClick: () => router.push(`/dashboard/orders/${newOrder.id}`),
            },
            duration: 8000,
          });

          // Tải lại dữ liệu trang hiện tại để cập nhật bảng danh sách đơn hàng
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      // Hủy đăng ký khi rời trang
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);
}
