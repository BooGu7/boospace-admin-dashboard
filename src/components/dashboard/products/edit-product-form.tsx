"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "sonner";

import { updateProductAction } from "@/actions/product.actions";
import type { ProductFormValues } from "@/schemas/product.schema";
import type { Product } from "@/types/product";

import { ProductForm } from "./product-form";

interface Props {
  product: Product;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export function EditProductForm({ product, categories, brands }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const result = await updateProductAction(product.id, values);

      if (result.success) {
        toast.success("Đã cập nhật sản phẩm thành công");
        router.push("/dashboard/products");
        router.refresh();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <ProductForm
      defaultValues={product as any}
      categories={categories}
      brands={brands}
      loading={pending}
      submitText="Cập nhật sản phẩm"
      onSubmit={onSubmit}
    />
  );
}
