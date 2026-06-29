import { Building2, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteBrandAction } from "@/actions/brand.actions";
import { CreateBrandDialog } from "@/components/dashboard/brands/create-brand-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

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
          <Card key={brand.id} className="overflow-hidden group hover:border-primary/50 transition-all">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="relative h-16 w-16 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
                  {brand.logo_url ? (
                    <Image src={brand.logo_url} alt={brand.name} fill className="object-contain p-2" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg leading-none">{brand.name}</p>
                  <p className="text-xs text-muted-foreground mt-2 uppercase tracking-tighter">Slug: {brand.slug}</p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteBrandAction(brand.id);
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Xóa
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
