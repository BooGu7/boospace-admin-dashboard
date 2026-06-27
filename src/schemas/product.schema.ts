import { z } from "zod";

export const productSchema = z.object({
  category_id: z.string().uuid().nullable(),

  brand_id: z.string().uuid().nullable(),

  name: z.string().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(255),

  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug không hợp lệ"),

  short_description: z.string().nullable(),

  description: z.string().nullable(),

  sku: z.string().nullable(),

  barcode: z.string().nullable(),

  price: z.number().min(0),

  compare_price: z.number().nullable(),

  cost_price: z.number().nullable(),

  weight: z.number().nullable(),

  featured: z.boolean(),

  published: z.boolean(),

  seo_title: z.string().nullable(),

  seo_description: z.string().nullable(),
});

export type ProductForm = z.infer<typeof productSchema>;
