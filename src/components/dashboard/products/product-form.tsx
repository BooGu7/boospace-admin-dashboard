"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type ProductFormValues, productSchema } from "@/schemas/product.schema";

interface Props {
  defaultValues?: Partial<ProductFormValues>;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  loading?: boolean;
  submitText?: string;
  onSubmit(values: ProductFormValues): Promise<void>;
}

export function ProductForm({ defaultValues, loading = false, submitText = "Lưu sản phẩm", onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Tên sản phẩm</FieldLabel>
          <Input {...register("name")} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>
        {/* ... Các field khác tương tự */}
        <Button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : submitText}
        </Button>
      </FieldGroup>
    </form>
  );
}
