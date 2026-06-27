"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { updateProduct } from "@/lib/product/actions";
import type { ProductForm as ProductFormValues } from "@/schemas/product.schema";
import type { Product } from "@/types/product";

import { ProductForm } from "./product-form";

interface Props {
  product: Product;

  categories: {
    id: string;
    name: string;
  }[];

  brands: {
    id: string;
    name: string;
  }[];
}

export function EditProductForm({ product, categories, brands }: Props) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  async function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      try {
        await updateProduct(product.id, values);

        toast.success("Đã cập nhật sản phẩm");

        router.push("/dashboard/products");

        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <ProductForm
      defaultValues={product}
      categories={categories}
      brands={brands}
      loading={pending}
      submitText="Cập nhật sản phẩm"
      onSubmit={onSubmit}
    />
  );
}
