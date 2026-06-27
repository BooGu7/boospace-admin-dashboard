"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { createProduct } from "@/lib/product/actions";
import type { ProductForm as ProductFormValues } from "@/schemas/product.schema";

import { ProductForm } from "./product-form";

interface Props {
  categories: {
    id: string;
    name: string;
  }[];

  brands: {
    id: string;
    name: string;
  }[];
}

export function CreateProductForm({ categories, brands }: Props) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  async function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      try {
        await createProduct(values);

        toast.success("Đã tạo sản phẩm");

        router.push("/dashboard/products");

        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <ProductForm
      categories={categories}
      brands={brands}
      onSubmit={onSubmit}
      submitText={pending ? "Đang lưu..." : "Tạo sản phẩm"}
    />
  );
}
