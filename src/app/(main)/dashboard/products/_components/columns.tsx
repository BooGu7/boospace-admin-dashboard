"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import type { ProductWithRelations } from "@/types/product";
import { DeleteProduct } from "./delete-product";

export const columns: ColumnDef<ProductWithRelations>[] = [
  // ... các cột khác (Ảnh, Tên, Giá, Danh mục) giữ nguyên ...
  {
    accessorKey: "images",
    header: "Ảnh",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      const firstImage = images?.[0] || "https://placehold.co/400x400/png?text=No+Image";
      return (
        <div className="relative h-12 w-12 overflow-hidden rounded-md border">
          <Image src={firstImage} alt="Product" fill sizes="48px" className="object-cover" />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Tên sản phẩm",
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "price",
    header: "Giá bán",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price") || "0");
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    },
  },
  {
    id: "category",
    header: "Danh mục",
    accessorFn: (row) => row.categories?.name || "Chưa phân loại",
  },
  {
    accessorKey: "published",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isPublished = row.getValue("published");
      return <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Đang bán" : "Bản nháp"}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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

            {/* TRUYỀN MENU ITEM VÀO LÀM TRIGGER CHO DIALOG */}
            <DeleteProduct
              id={product.id}
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()} // QUAN TRỌNG: Ngăn Menu đóng để Dialog hiện lên
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
