"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProductsToolbar() {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold">Danh sách kho hàng</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý toàn bộ phôi in 3D và phụ kiện DIY.</p>
      </div>
      <Button asChild size="sm">
        <Link href="/dashboard/products/new">
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Link>
      </Button>
    </div>
  );
}
