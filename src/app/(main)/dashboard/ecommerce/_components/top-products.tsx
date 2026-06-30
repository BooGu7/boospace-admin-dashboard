"use client";

import { ArrowUpRight } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TopProductsProps {
  topProducts: any[];
  categories: any[];
}

export function TopProducts({ topProducts, categories }: TopProductsProps) {
  // Tính tổng phần trăm thực tế hiển thị trên mô tả
  const totalSalesShare = categories.reduce((sum, cat) => sum + cat.share, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Sản phẩm bán chạy nhất</CardTitle>
        <CardDescription className="text-foreground text-lg font-bold tabular-nums leading-none tracking-tight">
          Đóng góp {totalSalesShare}% doanh thu
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* THANH BIỂU ĐỒ NGANG PHÂN CHIA TỶ LỆ DANH MỤC */}
        <div className="flex flex-col gap-2">
          <div
            aria-label="Sales by category"
            className="flex h-2.5 gap-1 overflow-hidden bg-muted rounded-full"
            role="img"
          >
            {categories.map((category) => (
              <div
                aria-hidden="true"
                key={category.name}
                className="rounded-full transition-all"
                style={{
                  backgroundColor: category.color,
                  width: `${category.share}%`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {categories.map((category) => (
              <div className="flex items-center gap-1.5" key={category.name}>
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-muted-foreground text-xs font-medium">
                  {category.name} ({category.share}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* BẢNG XẾP HẠNG SẢN PHẨM BÁN CHẠY THẬT TỪ DATABASE */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
          <div className="text-muted-foreground text-xs uppercase tracking-wider">Sản phẩm</div>
          <div className="text-muted-foreground text-xs uppercase tracking-wider text-center">Tỷ lệ</div>
          <div className="text-muted-foreground text-xs uppercase tracking-wider text-right">Doanh số</div>

          {topProducts.map((product) => (
            <div className="contents text-sm" key={product.name}>
              <div className="min-w-0">
                <div className="truncate font-semibold text-slate-800">{product.name}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{product.category}</div>
              </div>
              <div className="self-center text-muted-foreground text-center font-mono tabular-nums">
                {product.share}
              </div>
              <div className="self-center font-bold text-slate-800 text-right tabular-nums">{product.sales}</div>
            </div>
          ))}
          {topProducts.length === 0 && (
            <div className="col-span-3 text-center py-4 text-xs text-muted-foreground">Chưa có dữ liệu bán hàng.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
