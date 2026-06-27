"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/product/helpers";
import type { Product } from "@/types/product";

import { DeleteProduct } from "./delete-product";
import { FeaturedBadge } from "./featured-badge";
import { StatusBadge } from "./status-badge";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Tên",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "price",
    header: "Giá",
    cell: ({ row }) => formatPrice(row.original.price),
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => <FeaturedBadge featured={row.original.featured} />,
  },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }) => <StatusBadge published={row.original.published} />,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/dashboard/products/edit/${row.original.id}`}>
          <Button size="icon" variant="outline">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>

        <DeleteProduct id={row.original.id} />
      </div>
    ),
  },
];
