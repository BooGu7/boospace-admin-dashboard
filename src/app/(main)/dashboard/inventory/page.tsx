import { getElectricityRateAction, getMaterialsAction } from "@/actions/product.actions";
import { getCategories } from "@/lib/repositories/category.repository";
import { getProducts } from "@/lib/repositories/product.repository";
import { InventoryGrid } from "./_components/inventory-grid";

export const revalidate = 0; // Khử cache tĩnh Next.js theo đúng Quy tắc số 5

export default async function InventoryPage() {
  const [products, categories, dbMaterials, dbElectricityRate] = await Promise.all([
    getProducts(),
    getCategories(),
    getMaterialsAction(), // Tải cuộn nhựa lưu trên Supabase
    getElectricityRateAction(), // Tải định mức giá điện lưu trên Supabase
  ]);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Quản lý tồn kho</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kiểm soát nguồn cung phôi in thô, vật liệu nhựa PLA/Resin và phụ kiện DIY tại xưởng Boospace.
          </p>
        </div>
      </div>

      <InventoryGrid
        initialProducts={products}
        categories={categories}
        initialMaterials={dbMaterials}
        initialElectricityRate={dbElectricityRate}
      />
    </div>
  );
}
