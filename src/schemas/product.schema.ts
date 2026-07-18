import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(255),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug không hợp lệ"),

  // Chuyển từ kiểm duyệt định dạng UUID nghiêm ngặt sang chuỗi chữ tự do để tương thích với mọi loại định danh hệ thống
  category_id: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  brand_id: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "Giá bán không được nhỏ hơn 0"),
  compare_price: z.coerce.number().nullable().optional(),
  cost_price: z.coerce.number().nullable().optional(),
  weight: z.coerce.number().nullable().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  stock: z.coerce.number().int().min(0).default(0),

  // 3D SPECIFICATION CHUẨN ĐỒNG BỘ WEB BÁN HÀNG BOOSPACE-ECOMMERCE
  attributes: z
    .object({
      material: z.string().default("PLA"), // Chất liệu chính
      resolution: z.string().default("0.15mm"), // Độ mịn lớp in
      infill: z.string().default("Gyroid Infill"), // Cấu trúc Infill
      waterproof: z.string().default("Kháng nước & bụi mịn"), // Kháng nước
      safety_factor: z.string().default("Không mùi sinh học"), // Hệ số an toàn
      assembly: z.string().default("Nguyên khối"), // Phương thức lắp
      packaging: z.string().default("Hộp giấy Kraft mộc"), // Hình thức đóng gói
      license: z.string().default("CC License"), // Bản quyền tác giả
      scale: z.string().default("100%"),
      print_time: z.string().default("0h"),
    })
    .default({
      material: "PLA",
      resolution: "0.15mm",
      infill: "Gyroid Infill",
      waterproof: "Kháng nước & bụi mịn",
      safety_factor: "Không mùi sinh học",
      assembly: "Nguyên khối",
      packaging: "Hộp giấy Kraft mộc",
      license: "CC License",
      scale: "100%",
      print_time: "0h",
    }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
