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

  price: number;
  compare_price: number | null;
  cost_price: number | null;

  weight: number | null;

  featured: boolean;
  published: boolean;

  seo_title: string | null;
  seo_description: string | null;

  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;

export type ProductUpdate = Partial<ProductInsert>;
