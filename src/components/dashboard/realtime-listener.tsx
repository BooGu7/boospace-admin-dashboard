"use client";

import { useRealtimeOrders } from "@/hooks/use-realtime-orders"; // Điều chỉnh đường dẫn cho khớp vị trí tệp của bạn

export function RealtimeListener() {
  // Kích hoạt hook lắng nghe thời gian thực chạy ngầm
  useRealtimeOrders();

  // Component này chỉ chạy ngầm nên không hiển thị giao diện gì ra màn hình
  return null;
}
