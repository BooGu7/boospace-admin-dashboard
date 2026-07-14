import { FolderTree, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteCategoryAction } from "@/actions/category.actions";
import { CreateCategoryDialog } from "@/components/dashboard/categories/create-category-dialog";
import { EditCategoryDialog } from "@/components/dashboard/categories/edit-category-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Danh mục sản phẩm</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và phân loại các loại sản phẩm mô hình, phôi in trong kho.
          </p>
        </div>
        <CreateCategoryDialog categories={categories ?? []} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((cat) => {
          const parentCat = categories.find((c) => c.id === cat.parent_id);

          return (
            <Card
              key={cat.id}
              className="hover:border-primary transition-all border-border shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-5 flex items-center justify-between gap-4 h-full">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Khung ảnh danh mục chuẩn đối xứng */}
                  <div className="relative h-14 w-14 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {cat.image_url ? (
                      <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <FolderTree className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 grid gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-base text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>
                    {parentCat ? (
                      <Badge
                        variant="secondary"
                        className="w-fit text-[9px] py-0 px-1.5 font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/20"
                      >
                        Thuộc: {parentCat.name}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="w-fit text-[9px] py-0 px-1.5 font-medium text-slate-500 bg-slate-50"
                      >
                        Cấp gốc
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight mt-0.5 truncate">
                      Slug: {cat.slug}
                    </span>
                  </div>
                </div>

                {/* Các nút thao tác đối xứng bên phải */}
                <div className="flex items-center gap-1 shrink-0">
                  <EditCategoryDialog category={cat} categories={categories ?? []} />
                  <form
                    action={async () => {
                      "use server";
                      await deleteCategoryAction(cat.id);
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {categories?.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed rounded-xl text-muted-foreground bg-muted/10">
            Chưa có danh mục nào được khởi tạo.
          </div>
        )}
      </div>
    </div>
  );
}
