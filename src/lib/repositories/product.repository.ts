import { createClient } from "@/lib/supabase/server";
import type { ProductInsert, ProductUpdate, ProductWithRelations } from "@/types/product";

/**
 * HÀM TỰ KHỞI TẠO SẢN PHẨM MẪU LÊN SUPABASE NẾU TRỐNG (DATABASE SEEDING)
 * Bảo đảm các sản phẩm mẫu được lưu ở trạng thái Draft ẩn hoàn toàn khỏi trang cửa hàng.
 */
async function initializeProductsIfEmpty(supabase: any) {
  try {
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true });

    if (count === 0) {
      // 1. Tạo nhóm danh mục mẫu "Draft" (tắt Kích hoạt)
      const { data: cat } = await supabase.from("categories").select("id").eq("name", "Draft").limit(1).maybeSingle();

      let catId = cat?.id;

      if (!catId) {
        catId = "00000000-0000-0000-0000-000000000001";
        await supabase.from("categories").insert({
          id: catId,
          name: "Draft",
          slug: "draft",
          active: false, // tắt Kích hoạt
        });
      }

      // 2. Tạo thương hiệu mẫu
      const { data: brand } = await supabase.from("brands").select("id").limit(1).maybeSingle();
      let brandId = brand?.id;

      if (!brandId) {
        brandId = "00000000-0000-0000-0000-000000000002";
        await supabase.from("brands").insert({
          id: brandId,
          name: "Boo Space",
          slug: "boo-space",
          active: true,
        });
      }

      // 3. Tiến hành Insert 3 sản phẩm mẫu Việt hóa trực tiếp lên Supabase ở chế độ Draft ẩn
      const seedProducts = [
        {
          id: "00000000-0000-0000-0000-000000000011",
          name: "template 1",
          slug: "template-1",
          category_id: catId,
          brand_id: brandId,
          price: 0,
          compare_price: 0,
          cost_price: 0,
          sku: "BOO-TEMPLATE-01",
          published: false, // tắt Kích hoạt
          featured: false, // tắt nổi bật
          stock: 0, // tồn kho 1
          images: ["https://placehold.co/600x600/fcfaf2/1e1c1a?text=template+1"],
          attributes: {
            material: "PLA",
            resolution: "0.16mm",
            scale: "100%",
            print_time: "10h",
          },
        },
        {
          id: "00000000-0000-0000-0000-000000000012",
          name: "template 2",
          slug: "template-2",
          category_id: catId,
          brand_id: brandId,
          price: 0,
          compare_price: 0,
          cost_price: 0,
          sku: "BOO-TEMPLATE-02",
          published: false, // tắt Kích hoạt
          featured: false, // tắt nổi bật
          stock: 0, // tồn kho 1
          images: ["https://placehold.co/600x600/fcfaf2/1e1c1a?text=template+2"],
          attributes: {
            material: "PLA",
            resolution: "0.20mm",
            scale: "100%",
            print_time: "3h",
          },
        },
        {
          id: "00000000-0000-0000-0000-000000000013",
          name: "template 3",
          slug: "template-3",
          category_id: catId,
          brand_id: brandId,
          price: 0,
          compare_price: 0,
          cost_price: 0,
          sku: "BOO-TEMPLATE-03",
          published: false, // tắt Kích hoạt
          featured: false, // tắt nổi bật
          stock: 0, // tồn kho 1
          images: ["https://placehold.co/600x600/fcfaf2/1e1c1a?text=template+3"],
          attributes: {
            material: "PLA",
            resolution: "0.20mm",
            scale: "100%",
            print_time: "8h",
          },
        },
      ];

      await supabase.from("products").insert(seedProducts);
    }
  } catch (err: any) {
    console.warn("[DATABASE_AUTO_SEED_WARN] Lỗi khởi tạo sản phẩm mẫu lên Supabase:", err.message);
  }
}

/**
 * LẤY DANH SÁCH TẤT CẢ SẢN PHẨM THỰC TẾ
 */
export async function getProducts(): Promise<ProductWithRelations[]> {
  const supabase = await createClient();

  // Tự động nạp mẫu lên Supabase nếu trống trước khi truy vấn
  await initializeProductsIfEmpty(supabase);

  // Tải danh sách phẳng thực tế
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET_PRODUCTS_ERROR]", error.message);
    throw new Error(error.message);
  }

  // Tải danh mục và thương hiệu đồng bộ để map thủ công trên bộ nhớ
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

  // Khớp nối liên kết dữ liệu thực tế
  return (products || []).map((p) => ({
    ...p,
    categories: p.category_id ? categoriesMap[p.category_id] : null,
    brands: p.brand_id ? brandsMap[p.brand_id] : null,
  })) as unknown as ProductWithRelations[];
}

/**
 * LẤY CHI TIẾT SẢN PHẨM THEO ID
 */
export async function getProductById(id: string): Promise<ProductWithRelations> {
  const supabase = await createClient();
  const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error || !product) {
    throw new Error("Không tìm thấy chi tiết sản phẩm.");
  }

  return {
    ...product,
    categories: null,
    brands: null,
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
