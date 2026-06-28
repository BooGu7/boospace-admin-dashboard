import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(255),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug không hợp lệ"),
  category_id: z.string().uuid().nullable(),
  brand_id: z.string().uuid().nullable(),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  price: z.coerce.number().min(0),
  compare_price: z.coerce.number().nullable(),
  cost_price: z.coerce.number().nullable(),
  weight: z.coerce.number().nullable(),
  featured: z.boolean(),
  published: z.boolean(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  images: z.array(z.string()).default([]),
});

// Đây là cái tên chuẩn chúng ta sẽ dùng ở mọi nơi
export type ProductFormValues = z.infer<typeof productSchema>;
