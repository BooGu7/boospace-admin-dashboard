"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { toggleFeaturedAction, togglePublishedAction } from "@/actions/product.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import type { ProductWithRelations } from "@/types/product";
import { DeleteProduct } from "./delete-product";

// Component bật/tắt nhanh trạng thái Công khai trên dòng bảng
function PublishedToggle({ id, initialValue }: { id: string; initialValue: boolean }) {
  const [isPending, startTransition] = React.useTransition();
  const [checked, setChecked] = React.useState(initialValue);

  const handleToggle = (val: boolean) => {
    setChecked(val);
    startTransition(async () => {
      const res = await togglePublishedAction(id, val);
      if (res.success) {
        toast.success(val ? "Đã công khai sản phẩm trên Web" : "Đã chuyển sản phẩm thành bản nháp");
      } else {
        setChecked(!val);
        toast.error(res.error || "Không thể cập nhật trạng thái");
      }
    });
  };

  return <Switch checked={checked} onCheckedChange={handleToggle} disabled={isPending} />;
}

// Component click nhanh trạng thái Nổi bật (Featured) hình Ngôi sao
function FeaturedToggle({ id, initialValue }: { id: string; initialValue: boolean }) {
  const [isPending, startTransition] = React.useTransition();
  const [checked, setChecked] = React.useState(initialValue);

  const handleToggle = (val: boolean) => {
    setChecked(val);
    startTransition(async () => {
      const res = await toggleFeaturedAction(id, val);
      if (res.success) {
        toast.success(val ? "Đã ghim làm sản phẩm nổi bật" : "Đã hủy ghim sản phẩm nổi bật");
      } else {
        setChecked(!val);
        toast.error(res.error || "Không thể cập nhật nổi bật");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={() => handleToggle(!checked)}
      disabled={isPending}
      className="focus:outline-none hover:scale-110 transition active:scale-95 flex items-center justify-center"
    >
      <Star className={`h-5 w-5 ${checked ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    </button>
  );
}

// Hiển thị trạng thái tích hợp chuẩn bán hàng Shopify
function StatusBadge({ published, stock }: { published: boolean; stock: number }) {
  if (!published) {
    return (
      <Badge variant="secondary" className="whitespace-nowrap px-2 py-0.5 text-[11px] font-bold">
        Bản nháp
      </Badge>
    );
  }
  if (stock === 0) {
    return (
      <Badge variant="destructive" className="whitespace-nowrap px-2 py-0.5 text-[11px] font-bold">
        Hết hàng
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-500/10 whitespace-nowrap px-2 py-0.5 text-[11px] font-bold">
      Đang bán
    </Badge>
  );
}

export const columns: ColumnDef<ProductWithRelations>[] = [
  {
    accessorKey: "images",
    header: () => <div className="text-center">Ảnh</div>,
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      const firstImage = images?.[0] || "https://placehold.co/400x400/png?text=No+Image";
      return (
        <div className="relative h-12 w-12 mx-auto overflow-hidden rounded-md border shrink-0 bg-muted">
          <Image src={firstImage} alt="Product" fill sizes="48px" className="object-cover" />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Tên sản phẩm / SKU",
    cell: ({ row }) => {
      const product = row.original as any;
      return (
        <div className="flex flex-col gap-0.5 max-w-[200px]">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{product.name}</span>
          <span className="text-xs text-muted-foreground font-mono">SKU: {product.sku || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "cost_price",
    header: () => <div className="text-right">Giá vốn</div>,
    cell: ({ row }) => {
      const cost = Number(row.getValue("cost_price") ?? 0);
      return (
        <div className="text-right text-slate-500 font-medium tabular-nums">
          {cost > 0
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(cost)
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Giá bán</div>,
    cell: ({ row }) => {
      const price = Number(row.getValue("price") ?? 0);
      return (
        <div className="text-right font-extrabold text-blue-900 dark:text-blue-200 tabular-nums">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </div>
      );
    },
  },
  {
    id: "discount",
    header: () => <div className="text-center">Giảm giá</div>,
    cell: ({ row }) => {
      const price = Number((row.original as any).price ?? 0);
      const compare = Number((row.original as any).compare_price ?? 0);
      if (compare > price) {
        const pct = Math.round(((compare - price) / compare) * 100);
        return (
          <div className="text-center">
            <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-bold">
              -{pct}%
            </Badge>
          </div>
        );
      }
      return <div className="text-center text-muted-foreground text-xs">-</div>;
    },
  },
  {
    id: "profit",
    header: () => <div className="text-right">Lợi nhuận</div>,
    cell: ({ row }) => {
      const price = Number((row.original as any).price ?? 0);
      const cost = Number((row.original as any).cost_price ?? 0);
      const profit = price - cost;
      return (
        <div className="text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {profit > 0
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(profit)
            : "-"}
        </div>
      );
    },
  },
  {
    id: "category",
    header: "Danh mục",
    accessorFn: (row) => row.categories?.name || "Chưa phân loại",
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-center">Tồn kho</div>,
    cell: ({ row }) => {
      const stock = Number((row.original as any).stock || 0);
      return (
        <div className="text-center font-bold tabular-nums text-slate-700">
          {stock > 0 ? `${stock} chiếc` : <span className="text-red-600">Hết hàng</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "published",
    header: () => <div className="text-center">Kích hoạt</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <PublishedToggle id={row.original.id} initialValue={!!(row.original as any).published} />
      </div>
    ),
  },
  {
    accessorKey: "featured",
    header: () => <div className="text-center">Nổi bật</div>,
    cell: ({ row }) => <FeaturedToggle id={row.original.id} initialValue={!!(row.original as any).featured} />,
  },
  {
    id: "status",
    header: () => <div className="text-center">Trạng thái</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusBadge published={!!(row.original as any).published} stock={Number((row.original as any).stock || 0)} />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 mx-auto flex">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/products/edit/${product.id}`} className="flex items-center cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteProduct
              id={product.id}
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Xóa sản phẩm</span>
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
