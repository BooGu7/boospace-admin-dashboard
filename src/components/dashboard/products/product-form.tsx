"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/product/helpers";
import { type ProductForm as ProductFormValues, productSchema } from "@/schemas/product.schema";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Props {
  defaultValues?: Partial<ProductFormValues>;
  categories: Category[];
  brands: Brand[];
  loading?: boolean;
  submitText?: string;
  onSubmit(values: ProductFormValues): Promise<void>;
}

export function ProductForm({
  defaultValues,
  categories,
  brands,
  loading = false,
  submitText = "Lưu sản phẩm",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_id: null,
      brand_id: null,

      name: "",
      slug: "",

      short_description: "",
      description: "",

      sku: "",
      barcode: "",

      price: 0,

      compare_price: null,
      cost_price: null,
      weight: null,

      featured: false,
      published: true,

      seo_title: "",
      seo_description: "",

      ...defaultValues,
    },
  });

  const name = watch("name");

  useEffect(() => {
    if (!defaultValues?.slug && name) {
      setValue("slug", generateSlug(name));
    }
  }, [name, defaultValues?.slug, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Tên sản phẩm</FieldLabel>

          <Input placeholder="Macbook Pro M4" {...register("name")} />

          <FieldError>{errors.name?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Slug</FieldLabel>

          <Input placeholder="macbook-pro-m4" {...register("slug")} />

          <FieldError>{errors.slug?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Danh mục</FieldLabel>

          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v === "" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FieldError>{errors.category_id?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Thương hiệu</FieldLabel>

          <Controller
            control={control}
            name="brand_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v === "" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>

                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FieldError>{errors.brand_id?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>SKU</FieldLabel>

          <Input
            {...register("sku", {
              setValueAs: (value) => (value === "" ? null : value),
            })}
          />

          <FieldError>{errors.sku?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Barcode</FieldLabel>

          <Input
            {...register("barcode", {
              setValueAs: (value) => (value === "" ? null : value),
            })}
          />

          <FieldError>{errors.barcode?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Giá bán</FieldLabel>

          <Input
            type="number"
            {...register("price", {
              valueAsNumber: true,
            })}
          />

          <FieldError>{errors.price?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Giá gốc</FieldLabel>

          <Input
            type="number"
            {...register("compare_price", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />

          <FieldError>{errors.compare_price?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Giá vốn</FieldLabel>

          <Input
            type="number"
            {...register("cost_price", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />

          <FieldError>{errors.cost_price?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Khối lượng</FieldLabel>

          <Input
            type="number"
            {...register("weight", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />

          <FieldError>{errors.weight?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Mô tả ngắn</FieldLabel>

          <Textarea
            rows={3}
            {...register("short_description", {
              setValueAs: (value) => (value === "" ? null : value),
            })}
          />

          <FieldError>{errors.short_description?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Mô tả</FieldLabel>

          <Textarea
            rows={8}
            {...register("description", {
              setValueAs: (value) => (value === "" ? null : value),
            })}
          />

          <FieldError>{errors.description?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>SEO Title</FieldLabel>

          <Input
            {...register("seo_title", {
              setValueAs: (value) => (value === "" ? null : value),
            })}
          />

          <FieldError>{errors.seo_title?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>SEO Description</FieldLabel>

          <Textarea
            rows={3}
            {...register("seo_description", {
              setValueAs: (value) => (value === "" ? null : value),
            })}
          />

          <FieldError>{errors.seo_description?.message}</FieldError>
        </Field>

        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <Checkbox
                id="featured"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />

          <label htmlFor="featured" className="font-medium text-sm">
            Nổi bật
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="published"
            render={({ field }) => (
              <Checkbox
                id="published"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <label htmlFor="published" className="font-medium text-sm">
            Hiển thị
          </label>
        </div>

        <Button type="submit" disabled={loading} className="w-fit">
          {loading ? "Đang lưu..." : submitText}
        </Button>
      </FieldGroup>
    </form>
  );
}
