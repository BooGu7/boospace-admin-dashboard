import { FolderTree, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteCategoryAction } from "@/actions/category.actions";
import { CreateCategoryDialog } from "@/components/dashboard/categories/create-category-dialog";
import { EditCategoryDialog } from "@/components/dashboard/categories/edit-category-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Vô hiệu hóa cache để luôn hiển thị dữ liệu mới nhất khi làm mới trang

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Danh mục</h2>
          <p className="text-muted-foreground text-sm">Quản lý các loại sản phẩm trong kho hàng của bạn.</p>
        </div>
        {/* TRUYỀN DANH SÁCH DANH MỤC CHO DIALOG THÊM MỚI */}
        <CreateCategoryDialog categories={categories ?? []} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((cat) => {
          const parentCat = categories.find((c) => c.id === cat.parent_id);

          return (
            <Card key={cat.id} className="hover:border-primary/50 transition-colors overflow-hidden">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  {/* HIỂN THỊ ẢNH ĐẠI DIỆN NẾU CÓ, NGƯỢC LẠI SỬ DỤNG BIỂU TƯỢNG MẶC ĐỊNH */}
                  <div className="relative h-12 w-12 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {cat.image_url ? (
                      <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <FolderTree className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-lg leading-tight">{cat.name}</p>
                      {parentCat && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                          Con của: {parentCat.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Slug: {cat.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* COMPONENT NÚT CHỈNH SỬA DANH MỤC */}
                  <EditCategoryDialog category={cat} categories={categories ?? []} />

                  {/* FORM NÚT XÓA DANH MỤC */}
                  <form
                    action={async () => {
                      "use server";
                      await deleteCategoryAction(cat.id);
                    }}
                  >
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {categories?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
            Chưa có danh mục nào. Hãy bấm "Thêm danh mục" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
