"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { deleteProductAction } from "@/actions/product.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductWithRelations } from "@/types/product";

export const columns: ColumnDef<ProductWithRelations>[] = [
  {
    accessorKey: "images",
    header: "Ảnh",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      const firstImage = images?.[0] || "/placeholder.png"; // Cần 1 ảnh placeholder trong public
      return (
        <div className="relative h-12 w-12 overflow-hidden rounded-md border">
          <Image src={firstImage} alt="Product" fill className="object-cover" />
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
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "categories.name",
    header: "Danh mục",
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

      const onDelete = async () => {
        const confirm = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
        if (confirm) {
          const res = await deleteProductAction(product.id);
          if (res.success) toast.success("Đã xóa sản phẩm");
          else toast.error(res.error);
        }
      };

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
              <Link href={`/dashboard/products/edit/${product.id}`}>
                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" /> Xóa sản phẩm
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
