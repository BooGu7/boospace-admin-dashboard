import { Building2, ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteBrandAction } from "@/actions/brand.actions";
import { CreateBrandDialog } from "@/components/dashboard/brands/create-brand-dialog";
import { EditBrandDialog } from "@/components/dashboard/brands/edit-brand-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Thương hiệu đối tác</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý danh sách các nhà cung ứng sợi nhựa in và thiết bị DIY.
          </p>
        </div>
        <CreateBrandDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {brands?.map((brand) => (
          <Card
            key={brand.id}
            className="hover:border-primary transition-all border-border shadow-sm overflow-hidden flex flex-col justify-between relative pt-6"
          >
            {/* Badge hiển thị góc phải đối xứng */}
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant={brand.active !== false ? "default" : "secondary"}
                className="text-[9px] py-0 px-1.5 font-bold"
              >
                {brand.active !== false ? "Active" : "Inactive"}
              </Badge>
            </div>

            <CardContent className="p-0 h-full flex flex-col justify-between">
              <div className="p-5 flex flex-col items-center text-center space-y-4">
                {/* ĐÃ NÂNG KÍCH THƯỚC LOGO LÊN h-28 w-28 (ĐỐI XỨNG TUYỆT ĐỐI) */}
                <div className="relative h-28 w-28 rounded-2xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                  {brand.logo_url ? (
                    <Image src={brand.logo_url} alt={brand.name} fill className="object-contain p-3" sizes="112px" />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {/* Chi tiết thông tin đối tác */}
                <div className="space-y-1 w-full min-w-0">
                  <p className="font-extrabold text-lg text-slate-800 dark:text-slate-200 truncate">{brand.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">
                    Slug: {brand.slug}
                  </p>
                  <div className="pt-1.5">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        Ghé trang chủ <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">Đối tác nội bộ</span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Các nút bấm thao tác đối xứng bên dưới */}
                <div className="flex items-center gap-2 pt-1">
                  <EditBrandDialog brand={brand} />
                  <form
                    action={async () => {
                      "use server";
                      await deleteBrandAction(brand.id);
                    }}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {brands?.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed rounded-xl text-muted-foreground bg-muted/10">
            Chưa có thương hiệu đối tác nào.
          </div>
        )}
      </div>
    </div>
  );
}
