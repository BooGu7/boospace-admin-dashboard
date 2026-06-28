export interface Product {
  id: string;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  compare_price: number | null;
  cost_price: number | null;
  weight: number | null;
  featured: boolean | null;
  published: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Kiểu dữ liệu mở rộng để hiển thị trên Table (kèm tên danh mục/thương hiệu)
export interface ProductWithRelations extends Product {
  categories: { name: string } | null;
  brands: { name: string } | null;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductUpdate = Partial<ProductInsert>;
