"use client";

import Link from "next/link";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  search?: string;
}

export function ProductsToolbar({ search = "" }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-80">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input placeholder="Search product..." defaultValue={search} className="pl-10" />
      </div>

      <Button asChild>
        <Link href="/dashboard/products/new">
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Link>
      </Button>
    </div>
  );
}
