import { Building2, ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteBrandAction } from "@/actions/brand.actions";
import { CreateBrandDialog } from "@/components/dashboard/brands/create-brand-dialog";
import { EditBrandDialog } from "@/components/dashboard/brands/edit-brand-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Vô hiệu hóa cache hoàn toàn để đồng bộ nhanh nhất

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Thương hiệu</h2>
          <p className="text-muted-foreground text-sm">Quản lý các hãng cung cấp và đối tác.</p>
        </div>
        <CreateBrandDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {brands?.map((brand) => (
          <Card key={brand.id} className="overflow-hidden group hover:border-primary/50 transition-all relative">
            {/* Trạng thái hợp tác hiển thị góc phải trên */}
            <div className="absolute top-3 right-3 z-10">
              <Badge variant={brand.active !== false ? "default" : "secondary"} className="text-[10px] py-0 px-1.5">
                {brand.active !== false ? "Active" : "Inactive"}
              </Badge>
            </div>

            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center text-center space-y-4 pt-8">
                {/* Logo thương hiệu */}
                <div className="relative h-16 w-16 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
                  {brand.logo_url ? (
                    <Image src={brand.logo_url} alt={brand.name} fill className="object-contain p-2" sizes="64px" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* Chi tiết thông tin đối tác */}
                <div className="space-y-1 w-full">
                  <p className="font-bold text-lg leading-none truncate">{brand.name}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-tight">Slug: {brand.slug}</p>
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">Nội bộ</span>
                  )}
                </div>

                {/* Bảng thao tác hành động */}
                <div className="flex items-center gap-2 pt-2">
                  {/* NÚT CHỈNH SỬA THƯƠNG HIỆU */}
                  <EditBrandDialog brand={brand} />

                  {/* NÚT XÓA THƯƠNG HIỆU */}
                  <form
                    action={async () => {
                      "use server";
                      await deleteBrandAction(brand.id);
                    }}
                  >
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {brands?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
            Chưa có thương hiệu đối tác nào. Hãy bấm "Thêm thương hiệu" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
