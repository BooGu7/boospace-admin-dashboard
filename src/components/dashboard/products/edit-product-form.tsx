"use client";

import { updateProductAction } from "@/actions/product.actions";
import type { ProductFormValues } from "@/schemas/product.schema";
import { ProductForm } from "./product-form";

interface Props {
  product: any;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export function EditProductForm({ product, categories, brands }: Props) {
  const handleUpdate = async (values: ProductFormValues) => {
    return await updateProductAction(product.id, values);
  };

  return <ProductForm initialData={product} categories={categories} brands={brands} onSubmit={handleUpdate} />;
}
