"use client";

import {
  AlertTriangle,
  Boxes,
  Check,
  Coins,
  DollarSign,
  FolderTree,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCards({ stats }: { stats: any }) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  const renderStockBadge = (spoolCount: number) => {
    const count = Number(spoolCount || 0);

    if (count === 0) {
      return (
        <Badge className="bg-red-50 text-red-700 border border-red-100 font-extrabold text-[9px] rounded-md h-5 animate-pulse gap-0.5">
          <AlertTriangle className="h-2.5 w-2.5 shrink-0" /> Hết nhựa in
        </Badge>
      );
    }

    if (count <= 10) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-extrabold text-[9px] rounded-md h-5 animate-pulse gap-0.5">
          <AlertTriangle className="h-2.5 w-2.5 shrink-0" /> Cần nhập thêm sợi
        </Badge>
      );
    }

    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] rounded-md h-5 gap-0.5">
        <Check className="h-2.5 w-2.5 shrink-0" /> Tồn kho tốt
      </Badge>
    );
  };

  return (
    // Nâng cấp lưới thành xl:grid-cols-6 để phân bổ đều 6 thẻ KPI cực kỳ đẹp mắt
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* THẺ 1: TỔNG DOANH THU THỰC TẾ */}
      <Card className="shadow-2xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <DollarSign className="size-4" />
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-500 mt-2">Tổng doanh thu</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="font-extrabold text-xl tabular-nums leading-none tracking-tight text-slate-800">
              {formatVND(stats.totalRevenue)}
            </div>
            <Badge className="bg-red-50 text-red-600 border border-red-100 font-extrabold text-[9px] rounded-md h-5">
              <TrendingUp className="size-3 mr-0.5 shrink-0" /> Live
            </Badge>
          </div>
          <p className="text-muted-foreground text-[10px] font-semibold mt-1">Dòng tiền thu được từ hóa đơn thực tế</p>
        </CardContent>
      </Card>

      {/* ĐÃ THÊM: THẺ 2 - TỔNG LỢI NHUẬN THỰC TẾ (48% DOANH THU) */}
      <Card className="shadow-2xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border border-emerald-150 bg-emerald-50 text-emerald-600">
              <Coins className="size-4" />
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-500 mt-2">Tổng lợi nhuận</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="font-extrabold text-xl tabular-nums leading-none tracking-tight text-emerald-700">
              {formatVND(stats.totalProfit)}
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] rounded-md h-5">Biên 48%</Badge>
          </div>
          <p className="text-muted-foreground text-[10px] font-semibold mt-1">Lợi nhuận ròng sau khi trừ sợi nhựa</p>
        </CardContent>
      </Card>

      {/* THẺ 3: TỔNG ĐƠN HÀNG */}
      <Card className="shadow-2xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <ShoppingCart className="size-4" />
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-500 mt-2">Tổng đơn hàng</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="font-extrabold text-2xl tabular-nums leading-none tracking-tight text-slate-800">
              {stats.totalOrders} đơn
            </div>
            {stats.pendingOrders > 0 && (
              <Badge variant="secondary" className="text-[9px] font-bold h-5">
                Chờ duyệt: {stats.pendingOrders}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-[10px] font-semibold mt-1">
            Tổng số lượng đơn phát sinh trong bộ lọc
          </p>
        </CardContent>
      </Card>

      {/* THẺ 4: SẢN PHẨM HOẠT ĐỘNG */}
      <Card className="shadow-2xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Package className="size-4" />
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-500 mt-2">Sản phẩm hoạt động</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="font-extrabold text-2xl tabular-nums leading-none tracking-tight text-slate-800">
              {stats.productCount}
            </div>
          </div>
          <p className="text-muted-foreground text-[10px] font-semibold mt-1">Số lượng mô hình 3D mở bán khả dụng</p>
        </CardContent>
      </Card>

      {/* THẺ 5: DANH MỤC SẢN PHẨM */}
      <Card className="shadow-2xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <FolderTree className="size-4" />
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-500 mt-2">Danh mục sản phẩm</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="font-extrabold text-2xl tabular-nums leading-none tracking-tight text-slate-800">
              {stats.categoryCount}
            </div>
          </div>
          <p className="text-muted-foreground text-[10px] font-semibold mt-1">Phân loại mặt hàng xưởng in BooSpace</p>
        </CardContent>
      </Card>

      {/* THẺ 6: TỒN KHO XƯỞNG IN (Nền trắng đặc bg-card sắc nét, có trạng thái tự động hóa) */}
      <Card className="shadow-2xs border-red-200 bg-card dark:border-red-900/50">
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950">
              <Boxes className="size-4" />
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-500 mt-2">Tồn kho xưởng in</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="font-extrabold text-xl tabular-nums leading-none tracking-tight text-slate-800 dark:text-slate-100">
              {stats.spoolCount} cuộn nhựa
            </div>
            {renderStockBadge(stats.spoolCount)}
          </div>
          <p className="text-muted-foreground text-[10px] font-semibold mt-1">
            Sợi nhựa in 3D sấy khô sẵn sàng đưa vào khay
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
