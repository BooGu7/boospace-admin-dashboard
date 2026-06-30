"use client";

import { DollarSign, FolderTree, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// ĐÃ SỬA LỖI: Bổ sung CardDescription vào phần import dưới đây
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCards({ stats }: { stats: any }) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
      {/* CARD 1: DOANH THU THẬT */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <DollarSign className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Tổng doanh thu</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-2xl tabular-nums leading-none tracking-tight">
              {formatVND(stats.totalRevenue)}
            </div>
            <Badge>
              <TrendingUp className="size-3 mr-1" />
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">Tổng dòng tiền thu được từ đơn hàng</p>
        </CardContent>
      </Card>

      {/* CARD 2: ĐƠN HÀNG MỚI THẬT */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <ShoppingCart className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Đơn hàng mới</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">+{stats.totalOrders}</div>
            <Badge variant="secondary">Pending: {stats.pendingOrders}</Badge>
          </div>
          <p className="text-muted-foreground text-xs">Cần duyệt và in 3D vận chuyển ngay</p>
        </CardContent>
      </Card>

      {/* CARD 3: SẢN PHẨM HOẠT ĐỘNG */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Package className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Sản phẩm hoạt động</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stats.productCount}</div>
          </div>
          <p className="text-muted-foreground text-xs">Số lượng mô hình 3D có sẵn trong kho</p>
        </CardContent>
      </Card>

      {/* CARD 4: DANH MỤC SẢN PHẨM */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <FolderTree className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Danh mục sản phẩm</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stats.categoryCount}</div>
          </div>
          <p className="text-muted-foreground text-xs">Phân loại mặt hàng Boospace</p>
        </CardContent>
      </Card>
    </div>
  );
}
