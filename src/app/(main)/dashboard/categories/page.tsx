import { FolderTree, Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/actions/category.actions";
import { CreateCategoryDialog } from "@/components/dashboard/categories/create-category-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

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
        <CreateCategoryDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((cat) => (
          <Card key={cat.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-lg">{cat.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Slug: {cat.slug}</p>
                </div>
              </div>
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
            </CardContent>
          </Card>
        ))}
        {categories?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
            Chưa có danh mục nào. Hãy bấm "Thêm danh mục" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
