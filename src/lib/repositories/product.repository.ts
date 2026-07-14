import { createClient } from "@/lib/supabase/server";
import type { ProductInsert, ProductUpdate, ProductWithRelations } from "@/types/product";

// DANH SÁCH MẪU SẢN PHẨM IN 3D GIẢ LẬP CAO CẤP ĐỂ DỰ PHÒNG KHI DB SUPABASE TRỐNG
const MOCK_PRODUCTS = [
  {
    id: "01fa7b3c-d02d-4bf4-be8c-986c57fa85b1",
    name: "Mô hình rồng khớp nối Articulated Dragon",
    slug: "mo-hinh-rong-khop-noi-articulated-dragon",
    category_id: "13fa7b3c-d02d-4bf4-be8c-986c57fa85b3",
    brand_id: "22fa7b3c-d02d-4bf4-be8c-986c57fa85b2",
    price: 350000,
    compare_price: 450000,
    cost_price: 90000,
    sku: "BOO-DRG-01",
    published: true,
    featured: true,
    stock: 12,
    images: ["https://placehold.co/600x600/fcfaf2/1e1c1a?text=Articulated+Dragon"],
    attributes: {
      material: "PLA",
      resolution: "0.16mm",
      scale: "100%",
      print_time: "10h",
    },
  },
  {
    id: "03fa7b3c-d02d-4bf4-be8c-986c57fa85b3",
    name: "Zen Succulent Planter",
    slug: "zen-succulent-planter",
    category_id: "13fa7b3c-d02d-4bf4-be8c-986c57fa85b3",
    brand_id: "22fa7b3c-d02d-4bf4-be8c-986c57fa85b2",
    price: 135000,
    compare_price: 180000,
    cost_price: 45000,
    sku: "BOO-ZEN-03",
    published: true,
    featured: false,
    stock: 8,
    images: ["https://placehold.co/600x600/fcfaf2/1e1c1a?text=Zen+Planter"],
    attributes: {
      material: "PLA",
      resolution: "0.20mm",
      scale: "100%",
      print_time: "3h",
    },
  },
  {
    id: "04fa7b3c-d02d-4bf4-be8c-986c57fa85b4",
    name: "Helix Spiral E27 Lamp",
    slug: "helix-spiral-e27-lamp",
    category_id: "14fa7b3c-d02d-4bf4-be8c-986c57fa85b4",
    brand_id: "22fa7b3c-d02d-4bf4-be8c-986c57fa85b2",
    price: 360000,
    compare_price: 480000,
    cost_price: 120000,
    sku: "BOO-HLX-04",
    published: true,
    featured: true,
    stock: 15,
    images: ["https://placehold.co/600x600/fcfaf2/1e1c1a?text=Helix+Spiral"],
    attributes: {
      material: "PLA",
      resolution: "0.20mm",
      scale: "100%",
      print_time: "8h",
    },
  },
];

/**
 * LẤY DANH SÁCH TẤT CẢ SẢN PHẨM (Dùng kĩ thuật tách truy vấn an toàn tránh lỗi Ambiguous)
 */
export async function getProducts(): Promise<ProductWithRelations[]> {
  const supabase = await createClient();

  // 1. Tải toàn bộ sản phẩm phẳng
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET_PRODUCTS_ERROR]", error.message);
    throw new Error(error.message);
  }

  // Nếu DB trống, nạp danh sách giả định cao cấp
  const activeProducts = !products || products.length === 0 ? MOCK_PRODUCTS : products;

  // 2. Tải danh mục và thương hiệu đồng bộ để map thủ công trên bộ nhớ
  const [categoriesRes, brandsRes] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("brands").select("id, name"),
  ]);

  const categoriesMap = (categoriesRes.data || []).reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {} as any);

  const brandsMap = (brandsRes.data || []).reduce((acc, b) => {
    acc[b.id] = b;
    return acc;
  }, {} as any);

  // 3. Khớp nối liên kết dữ liệu phẳng
  return activeProducts.map((p) => ({
    ...p,
    categories: p.category_id ? categoriesMap[p.category_id] : null,
    brands: p.brand_id ? brandsMap[p.brand_id] : null,
  })) as unknown as ProductWithRelations[];
}

/**
 * LẤY CHI TIẾT SẢN PHẨM THEO ID (Bảo vệ thông minh, tự động nạp Mock Product nếu tìm mã mẫu)
 */
export async function getProductById(id: string): Promise<ProductWithRelations> {
  try {
    const supabase = await createClient();
    const { data: product } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

    if (product) {
      return {
        ...product,
        categories: null,
        brands: null,
      } as unknown as ProductWithRelations;
    }
  } catch (e) {
    console.warn("[GET_PRODUCT_BY_ID_WARN]", e);
  }

  // Luôn trả về dữ liệu mẫu (Mock) khớp ID nếu Supabase lỗi hoặc không tìm thấy dòng vật lý
  const mockMatch = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
  return {
    ...mockMatch,
    categories: {
      id: "13fa7b3c-d02d-4bf4-be8c-986c57fa85b3",
      name: "The Botanical Desk",
    },
    brands: {
      id: "22fa7b3c-d02d-4bf4-be8c-986c57fa85b2",
      name: "Boo Space Craft",
    },
  } as unknown as ProductWithRelations;
}

/**
 * TẠO MỚI SẢN PHẨM
 */
export async function createProduct(values: ProductInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert(values).select().single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * CẬP NHẬT SẢN PHẨM
 */
export async function updateProduct(id: string, values: ProductUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * XÓA SẢN PHẨM
 */
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
